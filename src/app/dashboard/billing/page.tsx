import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CheckCircle2, Zap, CreditCard, Clock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { initiateSubscriptionUpgrade } from "@/app/actions/subscription"

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch Business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  if (!business) redirect('/dashboard')

  // Calculate usage for the progress bar
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: invoicesCount } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .gte('created_at', thirtyDaysAgo.toISOString())

  const { count: quotesCount } = await supabase
    .from('quotations')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .gte('created_at', thirtyDaysAgo.toISOString())

  const totalUsed = (invoicesCount || 0) + (quotesCount || 0)
  
  const planLimits = {
    free: 3,
    starter: 20,
    pro: Infinity,
    business: Infinity
  }

  const currentTier = business.subscription_tier || 'free'
  const limit = planLimits[currentTier as keyof typeof planLimits]
  const percentage = limit === Infinity ? 0 : Math.min(100, Math.round((totalUsed / limit) * 100))

  const tierRanks = { free: 0, starter: 1, pro: 2, business: 3 }
  const currentRank = tierRanks[currentTier as keyof typeof tierRanks]

  // Fetch Subscription Transactions from Flutterwave
  let flwTransactions: any[] = []
  try {
    if (process.env.FLW_SECRET_KEY) {
      const res = await fetch(`https://api.flutterwave.com/v3/transactions`, {
        headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
        next: { revalidate: 0 } // Always fetch fresh
      })
      const flwData = await res.json()
      if (flwData.status === 'success' && Array.isArray(flwData.data)) {
        // Filter to only successful transactions that match this business's ID
        flwTransactions = flwData.data.filter((t: any) => 
          t.status === 'successful' && 
          t.meta?.type === 'subscription_upgrade' &&
          t.meta?.business_id === business.id
        )
      }
    }
  } catch (e) {
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing & Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Manage your plan, payment methods, and billing history.</p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Current Plan Overview */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-8 justify-between relative z-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-4">
                Current Plan
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 capitalize mb-2">
                {currentTier} Plan
              </h2>
              <p className="text-slate-500 text-sm max-w-sm">
                {currentTier === 'free' 
                  ? "You are currently on the free starter plan. Upgrade to unlock unlimited usage and custom branding." 
                  : "You are enjoying unlimited access and premium features on the Pro plan."}
              </p>
              
              {currentTier !== 'pro' && (
                <div className="mt-8">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-700">Monthly Usage</span>
                    <span className="text-slate-900">{totalUsed} / {limit} Documents</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-orange-500' : 'bg-primary'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Includes invoices and quotations created in the last 30 days.
                  </p>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 w-full md:w-72 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
              {currentTier === 'free' ? (
                <>
                  <p className="text-sm text-slate-500 mb-6">Upgrade to unlock more features.</p>
                  <form action={async () => { "use server"; await initiateSubscriptionUpgrade('pro'); }} className="w-full">
                    <Button 
                      type="submit"
                      size="lg" 
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 w-full h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      <Zap className="w-4 h-4 mr-2 text-yellow-400 group-hover:scale-110 transition-transform" />
                      View Upgrade Options
                    </Button>
                  </form>
                </>
              ) : (
                <>
                   <div className="flex items-center gap-2 text-green-600 font-bold mb-4">
                     <ShieldCheck className="w-6 h-6" />
                     Active Subscription
                   </div>
                   <Button variant="outline" className="w-full" asChild>
                     <a href="mailto:247billzsupport@gmail.com?subject=Manage%20Subscription">
                       Manage Subscription
                     </a>
                   </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Free Tier */}
          <div className={`bg-white border ${currentTier === 'free' ? 'border-primary shadow-md' : 'border-slate-200 opacity-75'} rounded-2xl p-6 relative`}>
            {currentTier === 'free' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">Current Plan</div>}
            <h3 className="text-xl font-bold text-slate-900">Free</h3>
            <div className="mt-2 mb-6"><span className="text-3xl font-black text-slate-900">₦0</span><span className="text-slate-500 font-medium">/mo</span></div>
            <p className="text-sm font-semibold text-slate-700 mb-6 pb-6 border-b border-slate-100">Max 3 Invoices/mo</p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /><span className="text-sm text-slate-600">Basic Analytics</span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /><span className="text-sm text-slate-600">247Billz Watermark</span></div>
            </div>
          </div>

          {/* Starter Tier */}
          <div className={`bg-white border ${currentTier === 'starter' ? 'border-primary shadow-md' : 'border-slate-200'} rounded-2xl p-6 relative flex flex-col`}>
            {currentTier === 'starter' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">Current Plan</div>}
            <h3 className="text-xl font-bold text-slate-900">Starter</h3>
            <div className="mt-2 mb-6"><span className="text-3xl font-black text-slate-900">₦2,100</span><span className="text-slate-500 font-medium">/mo</span></div>
            <p className="text-sm font-semibold text-slate-700 mb-6 pb-6 border-b border-slate-100">Max 20 Invoices/mo</p>
            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /><span className="text-sm text-slate-600">Full Analytics</span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /><span className="text-sm text-slate-600">247Billz Watermark</span></div>
            </div>
            {currentTier !== 'starter' && (
              <form action={async () => { "use server"; await initiateSubscriptionUpgrade('starter'); }} className="w-full">
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  {currentRank > 1 ? 'Downgrade to Starter' : 'Select Starter'}
                </Button>
              </form>
            )}
          </div>

          {/* Pro Tier */}
          <div className={`bg-white border-2 border-orange-500 shadow-xl rounded-2xl p-6 relative flex flex-col scale-105 z-10`}>
            {currentTier === 'pro' ? (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">Current Plan</div>
            ) : (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">Recommended</div>
            )}
            <h3 className="text-xl font-bold text-slate-900">Pro</h3>
            <div className="mt-2 mb-6"><span className="text-3xl font-black text-slate-900">₦5,100</span><span className="text-slate-500 font-medium">/mo</span></div>
            <p className="text-sm font-semibold text-slate-700 mb-6 pb-6 border-b border-slate-100">Unlimited Documents</p>
            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /><span className="text-sm text-slate-600">Custom Branding</span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /><span className="text-sm text-slate-600">Multi-Currency Metrics</span></div>
            </div>
            {currentTier !== 'pro' && (
              <form action={async () => { "use server"; await initiateSubscriptionUpgrade('pro'); }} className="w-full">
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                  {currentRank > 2 ? 'Downgrade to Pro' : 'Select Pro'}
                </Button>
              </form>
            )}
          </div>

          {/* Business Tier */}
          <div className={`bg-white border ${currentTier === 'business' ? 'border-primary shadow-md' : 'border-slate-200'} rounded-2xl p-6 relative flex flex-col`}>
            {currentTier === 'business' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">Current Plan</div>}
            <h3 className="text-xl font-bold text-slate-900">Business</h3>
            <div className="mt-2 mb-6"><span className="text-3xl font-black text-slate-900">₦10,000</span><span className="text-slate-500 font-medium">/mo</span></div>
            <p className="text-sm font-semibold text-slate-700 mb-6 pb-6 border-b border-slate-100">Unlimited Everything</p>
            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /><span className="text-sm text-slate-600">Priority Support</span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /><span className="text-sm text-slate-600">Multi-Profile Mapping</span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" /><span className="text-sm text-slate-600">API Access</span></div>
            </div>
            {currentTier !== 'business' && (
              <form action={async () => { "use server"; await initiateSubscriptionUpgrade('business'); }} className="w-full">
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">Select Business</Button>
              </form>
            )}
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Billing History</h3>
              <p className="text-sm text-slate-500 mt-1">View past subscription payments processed securely via Flutterwave.</p>
            </div>
          </div>
          
          {flwTransactions.length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Plan</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {flwTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-900 font-medium">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                          {tx.tx_ref}
                        </td>
                        <td className="px-6 py-4 text-slate-900 capitalize">
                          {tx.meta?.upgrade_to_tier || 'Subscription'}
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-medium">
                          ₦{tx.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile List View */}
              <div className="block sm:hidden divide-y divide-slate-200">
                {flwTransactions.map((tx: any) => (
                  <div key={tx.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900 capitalize">
                          {tx.meta?.upgrade_to_tier || 'Subscription'} Plan
                        </div>
                        <div className="text-sm font-medium text-slate-500 mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-base">
                          ₦{tx.amount.toLocaleString()}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-xs text-slate-500 font-mono">
                        Ref: {tx.tx_ref}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-900">No billing history</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                You haven't made any payments yet. Future subscription receipts will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
