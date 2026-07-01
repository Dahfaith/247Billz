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
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw authError

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      
    if (profileError) throw profileError

    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('owner_id, city, country')

    if (businessError) throw businessError

    // Merge auth data (email) into profiles
    const users = authData.users.map(authUser => {
      const profile = profiles.find(p => p.id === authUser.id) || {}
      const business = businesses.find(b => b.owner_id === authUser.id)
      return {
        ...profile,
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at, // use auth creation date as fallback
        city: business?.city || 'Unknown',
        country: business?.country || 'Unknown',
        ...authUser.user_metadata // include metadata like full_name
      }
    })

    // Sort by created_at descending
    users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return { success: true, users }
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

export async function adminUpgradeBusinessPlan(businessId: string, newTier: 'starter' | 'pro' | 'business') {
  const supabase = getAdminClient()
  try {
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('subscription_tier')
      .eq('id', businessId)
      .single()

    if (businessError) throw businessError

    const tierRanks = { free: 0, starter: 1, pro: 2, business: 3 }
    const currentRank = tierRanks[(business?.subscription_tier as keyof typeof tierRanks) || 'free']
    const targetRank = tierRanks[newTier]

    if (targetRank < currentRank) {
      throw new Error('Cannot downgrade a paid plan via this action.')
    }

    const { error } = await supabase
      .from('businesses')
      .update({ subscription_tier: newTier })
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
    const { data, error } = await supabase.from('platform_settings').select('*').limit(1).maybeSingle()
    if (error) throw error
    return { success: true, settings: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateAdminSettings(formData: FormData) {
  const supabase = getAdminClient()
  try {
    const rawData = Object.fromEntries(formData.entries())
    const updateData: any = {}

    if (rawData.form_type === 'services') {
      const booleanKeys = [
        'enable_invoicing', 'enable_estimates', 'enable_receipts', 
        'enable_subscriptions', 'enable_tax_computation', 'enable_multi_currency', 
        'enable_multi_language', 'require_2fa', 'strict_kyc_mode'
      ];
      booleanKeys.forEach(key => {
        updateData[key] = rawData[key] === 'on' || rawData[key] === 'true';
      });
    } else if (rawData.form_type === 'api_providers') {
      const textKeys = ['paystack_public_key', 'paystack_secret_key', 'flutterwave_public_key', 'flutterwave_secret_key', 'resend_api_key'];
      textKeys.forEach(key => {
        if (rawData[key] !== undefined) updateData[key] = rawData[key];
      });
    }
    
    // Explicitly handle fields that might be empty/null to update them
    const { data: existing, error: existError } = await supabase.from('platform_settings').select('id').limit(1).maybeSingle()
    
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
    const { data: updatedTicket, error } = await supabase
      .from('support_tickets')
      .update({
        admin_reply: reply,
        status: 'in_progress'
      })
      .eq('id', ticketId)
      .select('business_id')
      .single()

    if (error) throw error

    if (updatedTicket?.business_id) {
      await supabase.from('notifications').insert({
        business_id: updatedTicket.business_id,
        title: 'Support ticket updated',
        message: 'Your support ticket has a new reply from our team. Check your dashboard to view it.',
        type: 'success',
        read: false
      })
    }

    revalidatePath('/admin/support')
    revalidatePath('/dashboard/support')
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

// ==========================================
// BLOG MANAGEMENT
// ==========================================

export async function getAdminBlogPosts() {
  const supabase = getAdminClient()
  try {
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, posts: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getBlogPostById(id: string) {
  const supabase = getAdminClient()
  try {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single()
    if (error) throw error
    return { success: true, post: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getPublicBlogPosts() {
  const supabase = getAdminClient()
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image_url, author_name, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    if (error) throw error
    return { success: true, posts: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getPublicBlogPostBySlug(slug: string) {
  const supabase = getAdminClient()
  try {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('status', 'published').single()
    if (error) throw error
    return { success: true, post: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createBlogPost(formData: FormData) {
  const supabase = getAdminClient()
  try {
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const status = formData.get('status') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const cover_image_url = formData.get('cover_image_url') as string
    const author_name = formData.get('author_name') as string

    const { error } = await supabase.from('blog_posts').insert([{ 
      title, slug, status, excerpt, content, cover_image_url, author_name,
      published_at: status === 'published' ? new Date().toISOString() : null
    }])
    if (error) throw error
    revalidatePath('/admin/blog')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateBlogPost(id: string, formData: FormData) {
  const supabase = getAdminClient()
  try {
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const status = formData.get('status') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const cover_image_url = formData.get('cover_image_url') as string
    const author_name = formData.get('author_name') as string

    const updateData: any = { title, slug, status, excerpt, content, cover_image_url, author_name }
    if (status === 'published') {
      updateData.published_at = new Date().toISOString()
    }

    const { error } = await supabase.from('blog_posts').update(updateData).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/blog')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
