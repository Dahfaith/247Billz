"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { customAlphabet } from 'nanoid'

export async function createInvoice(formData: FormData) {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // 2. Fetch business ID
  const { data: business } = await supabase
    .from('businesses')
    .select('id, phone, address')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  const { getPublicPlatformSettings } = await import('@/app/actions/settings')
  const platformSettings = await getPublicPlatformSettings()

  if (platformSettings?.strict_kyc_mode && business && (!business.phone || !business.address)) {
    return { error: 'Please complete your Business Profile (Phone & Address) in Settings before creating invoices (Strict KYC Mode active).' }
  }

  let businessId = business?.id

  if (!businessId) {
    // Ensure profile exists first
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    if (!profile) {
      await supabase.from('profiles').insert({ id: user.id, role: 'business_owner' })
    }

    // Create the business
    const { data: newBusiness, error: createError } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        name: user.user_metadata?.business_name || 'My Business',
        email: user.email
      })
      .select('id')
      .single()
      
    if (createError) {
      throw new Error(`Failed to auto-create business: ${createError.message}`)
    }
    businessId = newBusiness.id
  }

  // 3. Extract form data
  const clientName = formData.get('clientName') as string
  const clientEmail = formData.get('clientEmail') as string
  const issueDate = formData.get('issueDate') as string
  const dueDate = formData.get('dueDate') as string
  const currency = (formData.get('currency') as string) || 'NGN'
  
  const taxRate = parseFloat(formData.get('tax_rate') as string) || 0;
  const discountRate = parseFloat(formData.get('discount_rate') as string) || 0;
  
  // Parse the items array (we'll send it as a JSON string from the client)
  const itemsJson = formData.get('items') as string
  const items = JSON.parse(itemsJson)

  const submittedClientId = formData.get('client_id') as string
  const invoiceId = formData.get('id') as string | null

  // 4. Handle Client CRM
  let clientId: string

  if (submittedClientId) {
    clientId = submittedClientId;
  } else if (clientEmail) {
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('business_id', businessId)
      .eq('email', clientEmail)
      .maybeSingle()

    if (existingClient) {
      clientId = existingClient.id
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          business_id: businessId,
          name: clientName,
          email: clientEmail,
        })
        .select()
        .single()
      
      if (clientError) throw new Error(`Failed to create client: ${clientError.message}`)
      clientId = newClient.id
    }
  } else {
    // If no email provided, just create a new client by name
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        business_id: businessId,
        name: clientName,
      })
      .select()
      .single()
    
    if (clientError) throw new Error(`Failed to create client: ${clientError.message}`)
    clientId = newClient.id
  }

  let currentInvoice: any = null;

  if (invoiceId) {
    // Check if invoice belongs to business and is not paid
    const { data: existing } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('business_id', businessId)
      .single()
    
    if (!existing) throw new Error("Invoice not found or unauthorized")
    if (existing.status === 'paid') throw new Error("Cannot edit a paid invoice")
    
    // Update invoice
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        client_id: clientId,
        issue_date: issueDate,
        due_date: dueDate,
        currency: currency
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (updateError) throw new Error(`Failed to update invoice: ${updateError.message}`)
    currentInvoice = updatedInvoice

    // Delete old items so we can insert new ones
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)
  } else {
    // Generate Invoice Number (Simple format: INV-YYYYMMDD-XXXX)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000)
    const invoiceNumber = `INV-${randomSuffix}`

    // Generate short token for public sharing
    const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)
    const short_token = nano()

    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        business_id: businessId,
        client_id: clientId,
        invoice_number: invoiceNumber,
        issue_date: issueDate,
        due_date: dueDate,
        currency: currency,
        status: 'pending', // Default status
        short_token
      })
      .select()
      .single()

    if (invoiceError) throw new Error(`Failed to create invoice: ${invoiceError.message}`)
    currentInvoice = newInvoice
  }

  // 7. Insert Line Items
  const invoiceItemsToInsert = items.map((item: any) => ({
    invoice_id: currentInvoice.id,
    description: item.description,
    quantity: item.quantity,
    price: item.price
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItemsToInsert)

  if (itemsError) throw new Error(`Failed to save invoice items: ${itemsError.message}`)

  // 8. Redirect to the public invoice view using the short token if available (fallback to secure_token)
  redirect(`/invoice/${currentInvoice.short_token || currentInvoice.secure_token}`)
}
