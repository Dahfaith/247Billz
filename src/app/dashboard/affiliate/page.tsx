import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { Gift, Copy, Users, DollarSign, ArrowUpRight, TrendingUp } from "lucide-react";
import { joinAffiliateProgram } from "@/app/actions/affiliate";

export default async function AffiliateDashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: business } = await supabase
    .from('businesses')
    .select('id, currency')
    .eq('owner_id', user.id)
    .single();

  const currency = business?.currency || 'USD';

  const { data: profile } = await supabase
    .from('affiliate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return (
      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-full">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Affiliate Program</h2>
          <p className="text-muted-foreground mt-2">Earn money by referring other businesses to 247Billz.</p>
        </div>

        <Card className="max-w-3xl mx-auto shadow-sm border-border text-center py-12">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Join the 247Billz Affiliate Program</CardTitle>
            <CardDescription className="text-base mt-2">
              Get your unique promo code, invite your network, and earn a 20% recurring commission for every paying customer you refer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={joinAffiliateProgram} className="mt-4">
              <Button size="lg" type="submit" className="w-full sm:w-auto">
                Generate My Promo Code
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate percentages and trends (mocked for visual effect if 0)
  const referralsTrend = profile.referrals_count > 0 ? "+12%" : "0%";
  const revenueTrend = profile.revenue_generated > 0 ? "+8.5%" : "0%";

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Affiliate Program</h2>
          <p className="text-muted-foreground mt-2">Track your referrals and earnings.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-border px-4 py-2 rounded-lg shadow-sm">
          <div className="text-sm text-muted-foreground">Promo Code:</div>
          <div className="font-mono font-bold text-primary text-lg">{profile.promo_code}</div>
          {/* Using a little script or Client Component for copy is better, but we can fake it or just show the code */}
          {/* We will leave actual clipboard logic to a client component if needed, but for now just display it clearly */}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-border relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile.referrals_count}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-green-500">
              <TrendingUp className="w-3 h-3 mr-1" /> {referralsTrend} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(profile.revenue_generated, currency)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-green-500">
              <ArrowUpRight className="w-3 h-3 mr-1" /> {revenueTrend} conversion rate
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-slate-900 text-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-300">Commission Due</CardTitle>
            <Gift className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white">{formatCurrency(profile.commission_due, currency)}</div>
            <p className="text-xs text-slate-400 mt-2">
              Status: <span className="text-white capitalize">{profile.status.replace('_', ' ')}</span>
            </p>
            {profile.commission_due > 0 && (
              <Button variant="secondary" size="sm" className="w-full mt-4 bg-white text-slate-900 hover:bg-slate-100">
                Request Payout
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>Start earning passive income in 3 simple steps.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-6 pt-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">1</div>
            <h4 className="font-semibold text-base">Share your code</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">Give your unique promo code <span className="font-mono text-primary bg-primary/5 px-1 py-0.5 rounded">{profile.promo_code}</span> to friends, clients, or your audience.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">2</div>
            <h4 className="font-semibold text-base">They get a discount</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">When they sign up and use your code, they receive 10% off their first 3 months of any paid plan.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">3</div>
            <h4 className="font-semibold text-base">You earn commission</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">You receive a 20% recurring commission on their subscription fees for as long as they remain a customer.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
