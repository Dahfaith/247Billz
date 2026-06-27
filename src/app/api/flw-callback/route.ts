import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY!

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const transactionId = searchParams.get('transaction_id')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (!transactionId) {
    return NextResponse.redirect(`${baseUrl}/dashboard?message=Payment+Cancelled`)
  }

  try {
    const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })
    
    const verifyData = await verifyRes.json()

    if (verifyData.status !== "success" || verifyData.data.status !== "successful") {
      return NextResponse.redirect(`${baseUrl}/dashboard?message=Payment+Verification+Failed`)
    }

    const invoiceId = verifyData.data.meta?.invoice_id
    const secureToken = verifyData.data.meta?.secure_token
    const amountPaid = verifyData.data.amount

    if (!invoiceId) {
      return NextResponse.redirect(`${baseUrl}/dashboard?message=Invalid+Transaction+Data`)
    }

    const supabase = await createClient()

    // Mark invoice paid
    await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', invoiceId)

    // Insert payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        amount: amountPaid,
        payment_method: 'flutterwave', 
        status: 'successful'
      })

    // Create a notification for the business
    const { data: invoice } = await supabase.from('invoices').select('invoice_number, business_id').eq('id', invoiceId).single()
    if (invoice?.business_id) {
      await supabase.from('notifications').insert({
        business_id: invoice.business_id,
        title: 'Invoice Paid',
        message: `Invoice ${invoice.invoice_number} was paid (Flutterwave). Amount: ${amountPaid}`,
        type: 'success'
      })
    }

    return NextResponse.redirect(`${baseUrl}/invoice/${secureToken}?payment=success`)

  } catch (error) {
    return NextResponse.redirect(`${baseUrl}/dashboard?message=Internal+Server+Error`)
  }
}
