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
        status,
        owner:profiles(id, role, status)
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

export async function toggleBusinessSuspension(businessId: string, currentStatus: string) {
  const supabase = getAdminClient()
  try {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
    const { error } = await supabase
      .from('businesses')
      .update({ status: newStatus })
      .eq('id', businessId)

    if (error) throw error
    revalidatePath('/admin/businesses')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleUserBan(userId: string, currentStatus: string) {
  const supabase = getAdminClient()
  try {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
    
    // Update our profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId)

    if (error) throw error

    // Also update the auth.users table using Supabase Admin Auth API
    if (newStatus === 'suspended') {
      await supabase.auth.admin.updateUserById(userId, { ban_duration: '876000h' }) // Ban for 100 years
    } else {
      await supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' }) // Unban
    }

    revalidatePath('/admin/users')
    return { success: true }
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
    
    const updateData: any = { ...rawData }
    delete updateData.form_type;

    if (rawData.form_type === 'services') {
      const booleanKeys = [
        'enable_invoicing', 'enable_estimates', 'enable_receipts', 
        'enable_subscriptions', 'enable_tax_computation', 'enable_multi_currency', 
        'enable_multi_language', 'require_2fa', 'strict_kyc_mode'
      ];
      booleanKeys.forEach(key => {
        updateData[key] = rawData[key] === 'on' || rawData[key] === 'true';
      });
    }
    
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

export async function getAdminTicketByNumber(ticketNumber: string) {
  const supabase = getAdminClient()
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, businesses(name, email)')
      .eq('ticket_number', ticketNumber)
      .single()
    if (error) throw error
    return { success: true, ticket: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function replyToTicket(ticketId: string, reply: string) {
  const supabase = getAdminClient()
  try {
    const { error } = await supabase
      .from('support_tickets')
      .update({
        admin_reply: reply,
        status: 'resolved'
      })
      .eq('id', ticketId)
    if (error) throw error
    revalidatePath('/admin/support')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCMSPageById(id: string) {
  const supabase = getAdminClient()
  try {
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return { success: true, page: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createCMSPage(formData: FormData) {
  const supabase = getAdminClient()
  try {
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const status = formData.get('status') as string
    const content = formData.get('content') as string

    const { error } = await supabase.from('cms_pages').insert([{ title, slug, status, content }])
    if (error) throw error
    revalidatePath('/admin/cms')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateCMSPage(id: string, formData: FormData) {
  const supabase = getAdminClient()
  try {
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const status = formData.get('status') as string
    const content = formData.get('content') as string

    const { error } = await supabase.from('cms_pages').update({ title, slug, status, content }).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/cms')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
