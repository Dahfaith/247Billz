'use server'

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

