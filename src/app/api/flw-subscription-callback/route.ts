import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY!

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const transactionId = searchParams.get('transaction_id')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (!transactionId) {
    return NextResponse.redirect(`${baseUrl}/dashboard/billing?error=Payment+Cancelled`)
  }

  try {
    const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })
    
    const verifyData = await verifyRes.json()

    if (verifyData.status !== "success" || verifyData.data.status !== "successful") {
      return NextResponse.redirect(`${baseUrl}/dashboard/billing?error=Payment+Verification+Failed`)
    }

    const businessId = verifyData.data.meta?.business_id
    const upgradeToTier = verifyData.data.meta?.upgrade_to_tier

    if (!businessId || !upgradeToTier) {
      return NextResponse.redirect(`${baseUrl}/dashboard/billing?error=Invalid+Subscription+Data`)
    }

    const supabase = await createClient()

    const { data: businessToUpdate, error: fetchError } = await supabase
      .from('businesses')
      .select('referred_by')
      .eq('id', businessId)
      .single()

    const { error: updateError } = await supabase
      .from('businesses')
      .update({ subscription_tier: upgradeToTier })
      .eq('id', businessId)

    if (updateError) {
      return NextResponse.redirect(`${baseUrl}/dashboard/billing?error=Database+Update+Failed`)
    }

    // Process Affiliate Commission if they were referred and tier is Pro or Business
    if (businessToUpdate?.referred_by && (upgradeToTier === 'pro' || upgradeToTier === 'business')) {
      const amount = verifyData.data.amount
      const commission = amount * 0.20 // 20% commission

      const { data: affiliate } = await supabase
        .from('affiliate_profiles')
        .select('id, revenue_generated, commission_due')
        .eq('promo_code', businessToUpdate.referred_by)
        .single()

      if (affiliate) {
        await supabase
          .from('affiliate_profiles')
          .update({
            revenue_generated: (parseFloat(affiliate.revenue_generated) || 0) + amount,
            commission_due: (parseFloat(affiliate.commission_due) || 0) + commission
          })
          .eq('id', affiliate.id)
      }
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/billing?success=true&tier=${upgradeToTier}`)

  } catch (error) {
    return NextResponse.redirect(`${baseUrl}/dashboard/billing?error=Internal+Server+Error`)
  }
}
