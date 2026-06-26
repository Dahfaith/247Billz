"use server"

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { formatCurrency } from '@/lib/currency'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendInvoiceEmail(invoiceId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      business:businesses(id, name, owner_id),
      client:clients(name, email),
      items:invoice_items(quantity, price)
    `)
    .eq('id', invoiceId)
    .single()

  if (!invoice) throw new Error("Invoice not found")
  
  if (invoice.business.owner_id !== user.id) {
    throw new Error("Unauthorized")
  }

  if (!invoice.client?.email) {
    throw new Error("This client does not have an email address on file.")
  }

  const clientEmail = invoice.client.email
  const businessName = invoice.business.name || "A business"
  const invoiceTotal = invoice.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const invoiceUrl = `${baseUrl}/invoice/${invoice.secure_token}`

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0f172a; font-size: 24px; margin: 0;">New Invoice from ${businessName}</h1>
      </div>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center;">
        <p style="color: #475569; font-size: 16px; margin-top: 0;">
          Hi ${invoice.client.name},
        </p>
        <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">
          ${businessName} has sent you a new invoice (<strong>${invoice.invoice_number}</strong>) for <strong>${formatCurrency(invoiceTotal, invoice.currency)}</strong>.
        </p>
        
        <a href="${invoiceUrl}" style="display: inline-block; background-color: #f97316; color: white; font-weight: bold; font-size: 16px; text-decoration: none; padding: 14px 28px; border-radius: 8px;">
          View &amp; Pay Invoice
        </a>
        
        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
          Clicking the button will open a secure page where you can review the details and complete your payment.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          Powered securely by <strong>247Billz</strong>
        </p>
      </div>
    </div>
  `

  if (!resend) {
    await new Promise(r => setTimeout(r, 1500))
    return { success: true, mocked: true }
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const { data, error } = await resend.emails.send({
      from: `${businessName} via 247Billz <${fromEmail}>`, 
      to: [clientEmail],
      subject: `Invoice ${invoice.invoice_number} from ${businessName}`,
      html: htmlContent,
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, mocked: false, id: data?.id }
  } catch (error: any) {
    throw new Error(error.message || "Failed to send email")
  }
}
