"use server"

import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site-url'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { getFlutterwaveSecretKey } from './settings'
export async function initiatePayment(invoiceToken: string) {
  const FLW_SECRET_KEY = await getFlutterwaveSecretKey()

  if (!FLW_SECRET_KEY) {
    return { error: 'Payment gateway is not configured. Please set FLW_SECRET_KEY in Admin dashboard.' }
  }

  const supabase = await createClient()

  // 1. Fetch Invoice Details
  let { data: invoice } = await supabase
    .from('invoices')
    .select(`*, business:businesses(*), client:clients(*)`)
    .eq('short_token', invoiceToken)
    .maybeSingle()

  if (!invoice) {
    const res = await supabase.from('invoices').select(`*, business:businesses(*), client:clients(*)`).eq('secure_token', invoiceToken).single()
    invoice = res.data
  }

  if (!invoice) return { error: "Invoice not found" }
  if (invoice.status === 'paid') return { error: "This invoice has already been paid" }

  // Ensure Business has a payout account configured
  const subaccountId = invoice.business?.flutterwave_subaccount_id
  if (!subaccountId) {
    return { error: "This business has not configured their payout bank account yet. Payment cannot be processed." }
  }

  // 2. Fetch Items to calculate exact total
  const { data: items } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoice.id)
  const subtotal = items?.reduce((acc: any, item: any) => acc + (item.quantity * item.price), 0) || 0
  
  const discountRate = Number(invoice.discount_rate) || 0
  const discountAmount = subtotal * (discountRate / 100)
  const subtotalAfterDiscount = subtotal - discountAmount
  
  const taxRate = Number(invoice.tax_rate) || 0
  const tax = subtotalAfterDiscount * (taxRate / 100)
  const total = subtotalAfterDiscount + tax

  // 3. Generate a unique transaction reference
  const txRef = `TXN-${invoice.invoice_number}-${Date.now()}`

  // 4. Call Flutterwave Standard Checkout API
  const baseUrl = getSiteUrl()
  const redirectUrl = `${baseUrl}/api/flw-callback`

  const payload = {
    tx_ref: txRef,
    amount: (Math.round(total * 100) / 100).toString(),
    currency: invoice.currency || "NGN",
    redirect_url: redirectUrl,
    customer: {
      email: invoice.client?.email || invoice.business?.email || "customer@example.com",
      name: invoice.client?.name || "Customer",
      phonenumber: invoice.client?.phone || "08000000000"
    },
    customizations: {
      title: `${invoice.business?.name || 'Business'} - Invoice #${invoice.invoice_number}`,
      description: `Payment for Invoice ${invoice.invoice_number}`,
    },
    meta: {
      invoice_id: invoice.id,
      secure_token: invoice.secure_token
    },
    subaccounts: [
      { 
        id: subaccountId,
        transaction_split_ratio: "1"
      }
    ]
  }

  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json()

  if (data.status !== "success" || !data.data?.link) {
    console.error("Flutterwave API Error:", data);
    return { error: data.message || "Failed to initialize payment gateway." }
  }

  // Return the link instead of doing redirect() so the client can navigate to the external URL safely
  return { redirectUrl: data.data.link }
}

export async function confirmCashPayment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const invoiceId = formData.get('invoice_id') as string
  const note = (formData.get('note') as string || '').trim()

  if (!invoiceId) {
    throw new Error('Invoice ID is required')
  }

  const { data: invoice, error: invoiceFetchError } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, business_id, currency, secure_token, short_token, tax_rate, discount_rate')
    .eq('id', invoiceId)
    .single()

  if (invoiceFetchError || !invoice) {
    throw new Error(invoiceFetchError?.message || 'Invoice not found')
  }

  if (invoice.status === 'paid') {
    throw new Error('This invoice is already marked paid')
  }

  const { data: items, error: itemsError } = await supabase
    .from('invoice_items')
    .select('quantity, price')
    .eq('invoice_id', invoiceId)

  if (itemsError) {
    throw new Error(itemsError.message)
  }

  const subtotal = items?.reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.price)), 0) || 0
  const discountRate = Number(invoice.discount_rate) || 0
  const discountAmount = subtotal * (discountRate / 100)
  const subtotalAfterDiscount = subtotal - discountAmount
  
  const taxRate = Number(invoice.tax_rate) || 0
  const tax = subtotalAfterDiscount * (taxRate / 100)
  const total = subtotalAfterDiscount + tax

  const { error: invoiceUpdateError } = await supabase
    .from('invoices')
    .update({ status: 'paid' })
    .eq('id', invoiceId)

  if (invoiceUpdateError) {
    throw new Error(invoiceUpdateError.message)
  }

  const { error: paymentInsertError } = await supabase
    .from('payments')
    .insert({
      invoice_id: invoiceId,
      amount: total,
      payment_method: 'cash',
      status: 'successful',
      paid_at: new Date().toISOString(),
      notes: note || null,
      recorded_by: user.id,
    })

  if (paymentInsertError) {
    throw new Error(paymentInsertError.message)
  }

  const auditMeta = {
    invoice_id: invoice.id,
    amount: total,
    payment_method: 'cash',
    note,
  }

  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert({
      business_id: invoice.business_id,
      user_id: user.id,
      event_type: 'payments',
      message: `Cash payment recorded for invoice ${invoice.invoice_number}`,
      meta: auditMeta,
    })

  if (auditError) {
    console.error('Failed to write audit log:', auditError.message)
  }

  if (invoice.business_id) {
    await supabase.from('notifications').insert({
      business_id: invoice.business_id,
      title: 'Invoice Paid (Cash)',
      message: `Invoice ${invoice.invoice_number} was marked paid in cash.`,
      type: 'success',
    })
  }

  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard/payments')
  if (invoice.short_token) {
    revalidatePath(`/invoice/${invoice.short_token}`, 'page')
  } else if (invoice.secure_token) {
    revalidatePath(`/invoice/${invoice.secure_token}`, 'page')
  }
}
