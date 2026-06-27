"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!business) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error fetching notifications:", error)
    return []
  }

  return data
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)

  if (error) {
    console.error("Error marking notification read:", error)
    return false
  }

  revalidatePath('/dashboard')
  return true
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!business) return false

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('business_id', business.id)

  if (error) {
    console.error("Error marking all notifications read:", error)
    return false
  }

  revalidatePath('/dashboard')
  return true
}
