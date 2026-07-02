"use server"

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function getFlutterwaveSecretKey() {
  const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await supabaseAdmin.from('platform_settings').select('flutterwave_secret_key').limit(1).maybeSingle()

  if (data?.flutterwave_secret_key) {
    return data.flutterwave_secret_key
  }

  if (error) {
    console.error(`Unable to load payment gateway settings: ${error.message}`)
  }

  return process.env.FLW_SECRET_KEY || null
}

export async function fetchBanks() {
  try {
    const FLW_SECRET_KEY = await getFlutterwaveSecretKey()
    if (!FLW_SECRET_KEY) return []

    const response = await fetch('https://api.flutterwave.com/v3/banks/NG', {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
      },
      next: { revalidate: 86400 } // Cache for 24h
    })
    const result = await response.json()
    return result.data || []
  } catch (error) {
    return []
  }
}

export async function saveBankDetails(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const bankCodeRaw = String(formData.get('bankCode') || "")
    const accountNumberRaw = String(formData.get('accountNumber') || "")
    const bankCode = bankCodeRaw.trim()
    const accountNumber = accountNumberRaw.replace(/\D/g, "").trim()

    if (!bankCode || !accountNumber) {
      return { success: false, error: "Bank and Account Number are required." }
    }

    if (!/^[0-9]{3}$/.test(bankCode)) {
      return { success: false, error: "Please select a bank from the dropdown. The bank code must be a 3-digit number." }
    }

    if (!/^[0-9]{10}$/.test(accountNumber)) {
      return { success: false, error: "Please enter a valid 10-digit account number." }
    }

    // 1. Fetch Profile and Business
    let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).limit(1).single()
    let { data: business } = await supabase.from('businesses').select('*').eq('owner_id', user.id).limit(1).single()

    if (!business) {
      if (!profile) {
        const { error: pErr } = await supabase.from('profiles').insert({ id: user.id, role: 'business_owner' })
        if (pErr) return { success: false, error: `Profile DB Error: ${pErr.message}` }
        profile = { id: user.id, role: 'business_owner', created_at: new Date().toISOString() }
      }

      const { data: newBusiness, error: bErr } = await supabase
        .from('businesses')
        .insert({
          owner_id: user.id,
          name: user.user_metadata?.business_name || user.user_metadata?.full_name || 'My Business',
          email: user.email
        })
        .select('*')
        .single()
      
      if (bErr) return { success: false, error: `Business DB Error: ${bErr.message}` }
      business = newBusiness
    }

    const fullName = user.user_metadata?.full_name || profile?.full_name || ""
    const businessName = business.name || ""

    const FLW_SECRET_KEY = await getFlutterwaveSecretKey()
    if (!FLW_SECRET_KEY) {
      return { success: false, error: "Payment gateway is not configured. Please set your Flutterwave secret key in Admin settings." }
    }

    const verifyRes = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        account_number: accountNumber,
        account_bank: bankCode
      })
    })
    const verifyData = await verifyRes.json()

    const collectStrings = (value: any, result: string[] = []) => {
      if (!value) return result
      if (typeof value === 'string') {
        result.push(value)
      } else if (Array.isArray(value)) {
        value.forEach((item) => collectStrings(item, result))
      } else if (typeof value === 'object') {
        Object.values(value).forEach((item) => collectStrings(item, result))
      }
      return result
    }

    const providerMessage = collectStrings(verifyData).join(' ').trim() || "Invalid account number or bank"

    if (verifyData.status !== "success") {
      if (/destbankcode\/account_bank must be numeric/i.test(providerMessage)) {
        return {
          success: false,
          error: "The selected bank code is invalid. Please choose a bank from the dropdown and ensure it is numeric.",
        }
      }
      if (/only 044 is allowed/i.test(providerMessage)) {
        return {
          success: false,
          error: "The payment gateway environment only allows GTBank (code 044) for this verification. Please select GTBank or use a different gateway key.",
        }
      }
      return { success: false, error: providerMessage }
    }

    const accountName = verifyData.data.account_name.toLowerCase()

    // Extract all words longer than 2 characters from fullName and businessName
    const getTokens = (name: string) => name.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const nameTokens = [...getTokens(fullName), ...getTokens(businessName)]
    
    // Check if at least one significant word from their profile or business name is in the bank account name
    const isMatch = nameTokens.some(token => accountName.includes(token))
    const isTestAccount = process.env.NODE_ENV !== 'production' && accountName.includes("forrest green")

    if (!isMatch && !isTestAccount) {
      return { success: false, error: "Verification failed. The bank account name does not match your Profile Name or Business Name." }
    }

    let subaccountId: string | null = null;
    const listRes = await fetch(`https://api.flutterwave.com/v3/subaccounts`, {
      headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` }
    });
    const listData = await listRes.json();
    
    if (listData.status === "success" && listData.data?.length > 0) {
      const existing = listData.data.find((sub: any) => sub.account_bank === bankCode && sub.account_number === accountNumber);
      if (existing) {
        subaccountId = existing.subaccount_id;
      }
    }

    if (!subaccountId) {
      const subaccountRes = await fetch('https://api.flutterwave.com/v3/subaccounts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_bank: bankCode,
          account_number: accountNumber,
          business_name: businessName,
          business_email: business.email || user.email,
          business_contact: fullName || "Business Owner",
          business_contact_mobile: business.phone || "08000000000",
          business_mobile: business.phone || "08000000000",
          country: "NG",
          split_type: "percentage",
          split_value: 0.98
        })
      })
      
      const subaccountData = await subaccountRes.json()
      
      if (subaccountData.status !== "success") {
        if (subaccountData.message?.includes("already exists")) {
          return { success: false, error: `This bank account is already registered to another test business. Please use a slightly different account number (e.g., change the last digit).` }
        }
        return { success: false, error: `Failed to create subaccount: ${subaccountData.message}` }
      }
      
      subaccountId = subaccountData.data.subaccount_id;
    }
    
    const banks = await fetchBanks()
    const bankObj = banks.find((b: any) => b.code === bankCode)
    const bankName = bankObj ? bankObj.name : "Unknown Bank"

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        flutterwave_subaccount_id: subaccountId,
        bank_name: bankName,
        account_number: accountNumber
      })
      .eq('id', business.id)

    if (updateError) {
      return { success: false, error: `Database error: ${updateError.message}` }
    }

    revalidatePath('/dashboard/settings')
    return {
      success: true,
      accountName: verifyData.data.account_name,
      bankName,
      accountNumber,
      subaccountId,
    }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to verify bank details' }
  }
}

export async function updateBusinessProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const logo_url = formData.get('logo_url') as string
  const currency = formData.get('currency') as string

  if (!name) {
    throw new Error("Business Name is required")
  }

  const { error: updateError } = await supabase
    .from('businesses')
    .update({
      name,
      email,
      phone,
      address,
      logo_url,
      currency
    })
    .eq('owner_id', user.id)

  if (updateError) throw new Error(`Failed to update business profile: ${updateError.message}`)

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function updatePersonalProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const full_name = formData.get('full_name') as string

  if (!full_name) {
    throw new Error("Full Name is required")
  }

  // Update auth.users metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name }
  })

  if (authError) throw new Error(`Failed to update personal profile: ${authError.message}`)

  // Also try to update profiles table if it has a full_name column, but it's okay if it fails
  // Since we rely on auth metadata mostly.
  try {
    await supabase.from('profiles').update({ full_name }).eq('id', user.id)
  } catch (e) {
    // ignore
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function getPublicPlatformSettings() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return null
  }

  const supabaseAdmin = createSupabaseClient(url, key)
  const { data } = await supabaseAdmin
    .from('platform_settings')
    .select('enable_invoicing, enable_estimates, enable_receipts, enable_subscriptions, enable_tax_computation, enable_multi_currency, enable_multi_language, require_2fa, strict_kyc_mode')
    .limit(1)
    .maybeSingle()

  return data
}
