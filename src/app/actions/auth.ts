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
