"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY!

export async function initiatePayment(invoiceToken: string) {
  const supabase = await createClient()

  // 1. Fetch Invoice Details
  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      business:businesses(*),
      client:clients(*)
    `)
    .eq('secure_token', invoiceToken)
    .single()

  if (!invoice) throw new Error("Invoice not found")
  if (invoice.status === 'paid') throw new Error("This invoice has already been paid")

  // Ensure Business has a payout account configured
  const subaccountId = invoice.business?.flutterwave_subaccount_id
  if (!subaccountId) {
    throw new Error("This business has not configured their payout bank account yet. Payment cannot be processed.")
  }

  // 2. Fetch Items to calculate exact total
  const { data: items } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoice.id)
  const subtotal = items?.reduce((acc, item) => acc + (item.quantity * item.price), 0) || 0
  const tax = subtotal * (invoice.tax_rate / 100)
  const total = subtotal + tax

  // 3. Generate a unique transaction reference
  const txRef = `TXN-${invoice.invoice_number}-${Date.now()}`

  // 4. Call Flutterwave Standard Checkout API
  // Using the absolute URL of our app for the redirect
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectUrl = `${baseUrl}/api/flw-callback`

  const payload = {
    tx_ref: txRef,
    amount: total.toString(),
    currency: invoice.currency || "NGN",
    redirect_url: redirectUrl,
    customer: {
      email: invoice.client.email || invoice.business.email,
      name: invoice.client.name,
      phonenumber: invoice.client.phone || "08000000000"
    },
    customizations: {
      title: `${invoice.business.name} - Invoice #${invoice.invoice_number}`,
      description: `Payment for Invoice ${invoice.invoice_number}`,
    },
    meta: {
      invoice_id: invoice.id,
      secure_token: invoice.secure_token
    },
    subaccounts: [
      {
        id: subaccountId
        // Since we defined the split logic when creating the subaccount, 
        // Flutterwave automatically handles the 98% split!
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
    throw new Error("Failed to initialize payment gateway.")
  }

  // Redirect the client's browser to the Flutterwave secure checkout page!
  redirect(data.data.link)
}
