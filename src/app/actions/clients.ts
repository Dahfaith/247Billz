"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  if (!business) throw new Error("Business not found")

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const company = formData.get('company') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string

  if (!name) {
    throw new Error("Client name is required")
  }

  const { error } = await supabase
    .from('clients')
    .insert({
      business_id: business.id,
      name,
      email,
      phone,
      company,
      address,
      notes,
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/clients')
}

export async function deleteClientAction(clientId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/clients')
}

export async function updateClientAction(clientId: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const company = formData.get('company') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string

  if (!name) {
    throw new Error("Client name is required")
  }

  const { error } = await supabase
    .from('clients')
    .update({
      name,
      email,
      phone,
      company,
      address,
      notes,
    })
    .eq('id', clientId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/clients')
}
