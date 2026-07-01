'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message || 'Could not authenticate user')}`)
  }

  revalidatePath('/', 'layout')
  
  if (email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    redirect('/admin')
  } else {
    redirect('/dashboard')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string // Full Name
  const businessName = formData.get('businessName') as string // Business Name

  const cookieStore = await cookies()
  const referredBy = cookieStore.get('247billz_ref')?.value

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        business_name: businessName || name, // Fallback to full name if missing
        referred_by: referredBy || null
      }
    }
  })

  if (error) {
    return redirect(`/signup?message=${encodeURIComponent(error.message || 'Could not create user')}`)
  }

  if (!data.session) {
    return redirect(`/login?message=${encodeURIComponent('Account created! Please check your email to confirm your account before logging in.')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function sendAdminOtp(email: string) {
  if (email.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return { success: false, error: 'Unauthorized email address.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function verifyAdminOtp(email: string, token: string) {
  if (email.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return { success: false, error: 'Unauthorized email address.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function sendPasswordResetEmail(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { success: false, error: 'Email is required.' }

  const supabase = await createClient()
  
  // Use a hardcoded absolute URL just to be absolutely certain it routes correctly
  // If NEXT_PUBLIC_SITE_URL is not configured on Vercel, it will fall back to https://247billz.com
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.247billz.com'
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    let errorMessage = error.message || (typeof error === 'string' ? error : 'Failed to send reset link.')
    
    // Supabase sometimes returns an empty object string "{}" on rate limits or SMTP errors
    if (errorMessage === '{}' || errorMessage === '[object Object]') {
      errorMessage = "Failed to send reset link. If you have requested multiple emails, please wait a few minutes and try again."
    }

    return { success: false, error: errorMessage }
  }

  return { success: true }
}

export async function updateUserPassword(formData: FormData) {
  const password = formData.get('password') as string
  const redirectUrl = formData.get('redirectUrl') as string

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' }
  }

  const supabase = await createClient()
  
  // This securely updates the password for the currently logged in session (established via callback)
  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (redirectUrl) {
    redirect(redirectUrl)
  }

  return { success: true }
}
