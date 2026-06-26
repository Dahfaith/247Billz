"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

import { getPublicPlatformSettings } from '@/app/actions/settings'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function initiateSubscriptionUpgrade(tier: 'starter' | 'pro' | 'business') {
  const supabase = await createClient()

  // 1. Fetch user and business
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("You must be logged in to upgrade")

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  if (!business) throw new Error("Business profile not found")

  if (business.subscription_tier === tier) {
    throw new Error(`You are already on the ${tier} plan.`);
  }

  const tierRanks = { free: 0, starter: 1, pro: 2, business: 3 };
  const currentRank = tierRanks[(business.subscription_tier as keyof typeof tierRanks) || 'free'];
  const targetRank = tierRanks[tier];

  // If downgrading, just update the database for free
  if (targetRank < currentRank) {
    const { error } = await supabase
      .from('businesses')
      .update({ subscription_tier: tier })
      .eq('id', business.id);
      
    if (error) throw new Error("Failed to downgrade plan");
    redirect('/dashboard/billing?success=true&downgraded=true');
  }

  // 2. Map tier to price
  const pricing = {
    starter: 2100,
    pro: 5100,
    business: 10000
  }

  const amount = pricing[tier]
  if (!amount) throw new Error("Invalid subscription tier selected")

  // 3. Generate a unique transaction reference
  const txRef = `SUB-${business.id.substring(0,8)}-${Date.now()}`

  // 4. Call Flutterwave Standard Checkout API
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectUrl = `${baseUrl}/api/flw-subscription-callback`
  const currency = business.currency || 'NGN'

  const payload = {
    tx_ref: txRef,
    amount: amount.toString(),
    currency: currency,
    redirect_url: redirectUrl,
    customer: {
      email: business.email || user.email,
      name: business.name,
      phonenumber: business.phone || "08000000000"
    },
    customizations: {
      title: `247Billz ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
      description: `Subscription upgrade for ${business.name}`,
    },
    meta: {
      business_id: business.id,
      upgrade_to_tier: tier,
      type: "subscription_upgrade"
    }
  }

  const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: settings } = await supabaseAdmin.from('platform_settings').select('flutterwave_secret_key').single()
  const flwSecretKey = settings?.flutterwave_secret_key || process.env.FLW_SECRET_KEY

  if (!flwSecretKey) {
    throw new Error("Payment gateway is not properly configured")
  }

  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${flwSecretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json()

  if (data.status !== "success" || !data.data?.link) {
    throw new Error("Failed to initialize payment gateway.")
  }

  // Redirect the client's browser to the Flutterwave secure checkout page
  redirect(data.data.link)
}
