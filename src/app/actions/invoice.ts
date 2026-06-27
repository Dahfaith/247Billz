"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
  
  // Parse the items array (we'll send it as a JSON string from the client)
  const itemsJson = formData.get('items') as string
  const items = JSON.parse(itemsJson)

  const submittedClientId = formData.get('client_id') as string

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

  // 5. Generate Invoice Number (Simple format: INV-YYYYMMDD-XXXX)
  const randomSuffix = Math.floor(100000 + Math.random() * 900000)
  const invoiceNumber = `INV-${randomSuffix}`

  // 6. Insert Invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      business_id: businessId,
      client_id: clientId,
      invoice_number: invoiceNumber,
      issue_date: issueDate,
      due_date: dueDate,
      currency: currency,
      status: 'pending' // Default status
    })
    .select()
    .single()

  if (invoiceError) throw new Error(`Failed to create invoice: ${invoiceError.message}`)

  // 7. Insert Line Items
  const invoiceItemsToInsert = items.map((item: any) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    price: item.price
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItemsToInsert)

  if (itemsError) throw new Error(`Failed to create invoice items: ${itemsError.message}`)

  // 8. Redirect to the public invoice view using the secure token
  redirect(`/invoice/${invoice.secure_token}`)
}
