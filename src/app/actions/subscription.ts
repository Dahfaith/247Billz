"use server"

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY!

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

  const payload = {
    tx_ref: txRef,
    amount: amount.toString(),
    currency: "NGN",
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

  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
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
