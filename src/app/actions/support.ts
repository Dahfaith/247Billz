'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSupportTicket(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const subject = formData.get('subject') as string
  const priority = formData.get('priority') as string || 'medium'
  const message = formData.get('message') as string

  if (!subject || !message) {
    throw new Error("Subject and message are required")
  }

  // Get business ID for the user
  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single()

  const ticketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`

  const { error } = await supabase.from('support_tickets').insert([
    {
      ticket_number: ticketNumber,
      subject,
      message,
      priority,
      status: 'open',
      business_id: business ? business.id : null
    }
  ])

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/support')
  return { success: true, ticketNumber }
}

export async function getUserTickets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { tickets: [] }

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single()
  if (!business) return { tickets: [] }

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  if (error) return { tickets: [] }
  return { tickets: data }
}
