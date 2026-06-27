"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createQuotationAction(formData: FormData, items: any[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: business } = await supabase
    .from('businesses')
    .select('id, phone, address')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  if (!business) throw new Error("Business not found")

  const { getPublicPlatformSettings } = await import('@/app/actions/settings')
  const platformSettings = await getPublicPlatformSettings()

  if (platformSettings?.strict_kyc_mode && (!business.phone || !business.address)) {
    return { error: 'Please complete your Business Profile (Phone & Address) in Settings before creating estimates (Strict KYC Mode active).' }
  }

  const client_id = formData.get('client_id') as string
  const issue_date = formData.get('issue_date') as string
  const valid_until = formData.get('valid_until') as string
  const notes = formData.get('notes') as string

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const quotation_number = `EST-${randomSuffix}`;

  const { data: quotation, error } = await supabase
    .from('quotations')
    .insert({
      business_id: business.id,
      client_id,
      quotation_number,
      issue_date,
      valid_until,
      notes,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Insert items
  const itemsToInsert = items.map(item => ({
    quotation_id: quotation.id,
    description: item.description,
    quantity: parseInt(item.quantity, 10),
    price: parseFloat(item.price)
  }))

  const { error: itemsError } = await supabase
    .from('quotation_items')
    .insert(itemsToInsert)

  if (itemsError) {
    throw new Error(itemsError.message)
  }

  revalidatePath('/dashboard/quotations')
  return quotation.id
}

export async function acceptQuotationAction(quotationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('quotations')
    .update({ status: 'accepted' })
    .eq('id', quotationId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/quotations')
  revalidatePath(`/quotation/[token]`, 'page')
}

export async function declineQuotationAction(quotationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('quotations')
    .update({ status: 'declined' })
    .eq('id', quotationId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/quotations')
  revalidatePath(`/quotation/[token]`, 'page')
}

export async function convertQuotationToInvoiceAction(quotationId: string) {
  const supabase = await createClient()

  // 1. Fetch quotation and items
  const { data: quotation } = await supabase
    .from('quotations')
    .select('*, items:quotation_items(*)')
    .eq('id', quotationId)
    .single()

  if (!quotation) throw new Error("Quotation not found")

  // 2. Generate Invoice Number
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const invoice_number = `INV-${randomSuffix}`;

  // 3. Create Invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      business_id: quotation.business_id,
      client_id: quotation.client_id,
      invoice_number,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Net 14 by default
      notes: quotation.notes,
    })
    .select()
    .single()

  if (invoiceError) throw new Error(invoiceError.message)

  // 4. Create Invoice Items
  const itemsToInsert = quotation.items.map((item: any) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    price: item.price
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsToInsert)

  if (itemsError) throw new Error(itemsError.message)

  // 5. Mark quotation as converted
  await supabase
    .from('quotations')
    .update({ status: 'converted' })
    .eq('id', quotationId)

  revalidatePath('/dashboard/quotations')
  revalidatePath('/dashboard/invoices')
  return invoice.id
}

export async function updateQuotationAction(quotationId: string, formData: FormData, items: any[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Verify ownership
  const { data: quotation } = await supabase
    .from('quotations')
    .select('*, business:businesses(owner_id)')
    .eq('id', quotationId)
    .single()

  if (!quotation || quotation.business?.owner_id !== user.id) {
    throw new Error("Quotation not found or unauthorized")
  }

  // Prevent editing if it's already locked
  if (['accepted', 'declined', 'converted'].includes(quotation.status)) {
    throw new Error(`Cannot edit a quotation that is already ${quotation.status}`)
  }

  const client_id = formData.get('client_id') as string
  const issue_date = formData.get('issue_date') as string
  const valid_until = formData.get('valid_until') as string
  const notes = formData.get('notes') as string

  // Update Quotation
  const { error: updateError } = await supabase
    .from('quotations')
    .update({
      client_id,
      issue_date,
      valid_until,
      notes,
    })
    .eq('id', quotationId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  // Handle Items: Safest approach is to delete all existing items and re-insert the new ones
  const { error: deleteError } = await supabase
    .from('quotation_items')
    .delete()
    .eq('quotation_id', quotationId)
    
  if (deleteError) {
    throw new Error(deleteError.message)
  }

  const itemsToInsert = items.map(item => ({
    quotation_id: quotationId,
    description: item.description,
    quantity: parseInt(item.quantity, 10),
    price: parseFloat(item.price)
  }))

  const { error: insertError } = await supabase
    .from('quotation_items')
    .insert(itemsToInsert)

  if (insertError) {
    throw new Error(insertError.message)
  }

  revalidatePath('/dashboard/quotations')
  revalidatePath(`/quotation/${quotation.secure_token}`, 'page')
  return true
}

