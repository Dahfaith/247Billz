'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

// Helper to get the Admin Supabase Client (bypasses RLS)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase Admin credentials in environment variables.')
  }

  return createClient(url, key)
}

export async function getAdminDashboardStats() {
  const supabase = getAdminClient()

  try {
    // 1. Total Businesses
    const { count: totalBusinesses } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })

    // 2. Total Users (Profiles)
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // 3. Subscriptions (Paid Tiers)
    const { count: activeSubscriptions } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .in('subscription_tier', ['starter', 'pro', 'business'])

    // 4. Payments Data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: allPayments } = await supabase
      .from('payments')
      .select('*')

    let monthlyRevenue = 0
    let pendingPaymentsCount = 0
    let failedTransactionsCount = 0
    let todayTransactionsCount = 0

    allPayments?.forEach((payment) => {
      const paymentDate = new Date(payment.created_at)
      
      if (payment.status === 'successful' || payment.status === 'paid') {
        if (paymentDate >= thirtyDaysAgo) {
          monthlyRevenue += Number(payment.amount || 0)
        }
      } else if (payment.status === 'pending') {
        pendingPaymentsCount++
      } else if (payment.status === 'failed') {
        failedTransactionsCount++
      }

      if (paymentDate >= today) {
        todayTransactionsCount++
      }
    })

    // 5. Recent Businesses (Signups)
    const { data: recentRegistrations } = await supabase
      .from('businesses')
      .select('id, name, email, subscription_tier, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    // 6. Recent Transactions
    const { data: recentTransactions } = await supabase
      .from('payments')
      .select('id, amount, status, payment_method, created_at, invoices(invoice_number, business_id)')
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      success: true,
      stats: {
        totalBusinesses: totalBusinesses || 0,
        totalUsers: totalUsers || 0,
        monthlyRevenue,
        activeSubscriptions: activeSubscriptions || 0,
        pendingPaymentsCount,
        failedTransactionsCount,
        todayTransactionsCount,
      },
      recentRegistrations: recentRegistrations || [],
      recentTransactions: recentTransactions || []
    }
  } catch (error: any) {
    console.error("Failed to fetch admin stats:", error)
    return { success: false, error: error.message }
  }
}

export async function getAdminBusinesses() {
  const supabase = getAdminClient()

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        email,
        phone,
        subscription_tier,
        created_at,
        logo_url,
        owner:profiles(id, role)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, businesses: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAdminUsers() {
  const supabase = getAdminClient()

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, users: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ----------------------------------------------------
// PHASE 3: TRANSACTIONS & SUBSCRIPTIONS
// ----------------------------------------------------

export async function getAdminTransactions() {
  const supabase = getAdminClient()

  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        payment_method,
        created_at,
        invoices ( invoice_number, business_id, businesses ( name ) )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, transactions: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAdminSubscriptions() {
  const supabase = getAdminClient()

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, subscription_tier, email, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Group them for stats
    const stats = {
      free: 0,
      starter: 0,
      pro: 0,
      business: 0
    }

    data.forEach((b) => {
      if (stats[b.subscription_tier as keyof typeof stats] !== undefined) {
        stats[b.subscription_tier as keyof typeof stats]++
      } else {
        stats.free++
      }
    })

    return { success: true, subscriptions: data, stats }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ----------------------------------------------------
// PHASE 4 & 5: SETTINGS, CMS, AFFILIATES, SUPPORT
// ----------------------------------------------------

export async function getAdminSettings() {
  const supabase = getAdminClient()
  try {
    const { data, error } = await supabase.from('platform_settings').select('*').single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, settings: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateAdminSettings(formData: FormData) {
  const supabase = getAdminClient()
  try {
    const rawData = Object.fromEntries(formData.entries())
    
    // Convert boolean toggles properly if they exist in form (Switch components don't pass standard booleans easily without hidden inputs, so we check presence or string value)
    const updateData: any = { ...rawData }
    
    // Explicitly handle fields that might be empty/null to update them
    const { data: existing } = await supabase.from('platform_settings').select('id').single()
    
    let error;
    if (existing) {
      const res = await supabase.from('platform_settings').update(updateData).eq('id', existing.id)
      error = res.error
    } else {
      const res = await supabase.from('platform_settings').insert([updateData])
      error = res.error
    }
    
    if (error) throw error
    
    revalidatePath('/admin', 'layout')
  } catch (error: any) {
    console.error("Failed to update settings:", error.message)
    throw new Error(error.message)
  }
}

export async function getAdminCMSPages() {
  const supabase = getAdminClient()
  try {
    const { data, error } = await supabase.from('cms_pages').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, pages: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAdminAffiliates() {
  const supabase = getAdminClient()
  try {
    const { data, error } = await supabase.from('affiliate_profiles').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, affiliates: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAdminTickets() {
  const supabase = getAdminClient()
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, businesses(name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, tickets: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
