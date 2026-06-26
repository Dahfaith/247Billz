import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, Receipt, Users, CreditCard, BarChart, Settings, Rocket, Gift } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { MobileHeader } from "@/components/mobile-header";
import { UpgradeModal } from "@/components/upgrade-modal";
import { Suspense } from "react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .single();

  if (!business) {
    // Fallback: Ensure profile exists
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).limit(1).single();
    if (!profile) {
      await supabase.from('profiles').insert({ id: user.id, role: 'business_owner' });
    }

    // Auto-create business
    const { data: newBusiness } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        name: user.user_metadata?.business_name || 'My Business',
        email: user.email
      })
      .select('*')
      .single();
      
    business = newBusiness;
  }

  const businessName = business?.name || "My Business";
  const initial = businessName.charAt(0).toUpperCase();

  // Calculate actual usage for the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const { count: invoiceCount } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .gte('created_at', thirtyDaysAgo);

  const { count: quoteCount } = await supabase
    .from('quotations')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .gte('created_at', thirtyDaysAgo);

  const usage = (invoiceCount || 0) + (quoteCount || 0);
  const tier = business.subscription_tier || 'free';
  
  let maxLimit = 3;
  if (tier === 'starter') maxLimit = 20;
  if (tier === 'pro' || tier === 'business') maxLimit = Infinity;
  
  const percent = maxLimit === Infinity ? 100 : Math.min((usage / maxLimit) * 100, 100);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <Sidebar className="border-r border-border bg-sidebar">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">{initial}</div>
              <span className="text-xl font-bold tracking-tight text-sidebar-foreground truncate" title={businessName}>{businessName}</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem><SidebarMenuButton asChild><Link href="/dashboard"><LayoutDashboard /> <span>Dashboard</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton asChild><Link href="/dashboard/invoices"><FileText /> <span>Invoices</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton asChild><Link href="/dashboard/quotations"><FileText /> <span>Quotations</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton asChild><Link href="/dashboard/receipts"><Receipt /> <span>Receipts</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton asChild><Link href="/dashboard/clients"><Users /> <span>Clients</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton asChild><Link href="/dashboard/payments"><CreditCard /> <span>Payments</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton asChild><Link href="/dashboard/reports"><BarChart /> <span>Reports</span></Link></SidebarMenuButton></SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-auto">
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem><SidebarMenuButton asChild><Link href="/dashboard/settings"><Settings /> <span>Settings</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton asChild><Link href="/dashboard/billing"><CreditCard /> <span>Billing & Plans</span></Link></SidebarMenuButton></SidebarMenuItem>
                  <SidebarMenuItem><SidebarMenuButton asChild><Link href="/dashboard/affiliate"><Gift /> <span>Affiliate Program</span></Link></SidebarMenuButton></SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <div className="bg-card border border-border rounded-lg p-3">
              {maxLimit === Infinity ? (
                <>
                  <p className="text-xs font-medium text-primary flex items-center justify-center gap-1 mb-1">
                    <Rocket className="w-3 h-3" /> {tier === 'pro' ? 'Pro' : 'Business'} Plan Active
                  </p>
                  <p className="text-xs text-center text-muted-foreground">Unlimited Documents</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Usage: {usage} / {maxLimit} Documents</p>
                  <Progress value={percent} className={`h-2 mb-3 ${percent >= 100 ? 'bg-red-100' : 'bg-muted'}`} indicatorClassName={percent >= 100 ? 'bg-red-500' : ''} />
                  <Link href="/dashboard/billing" className="w-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 py-1.5 rounded flex items-center justify-center gap-1 transition-colors">
                    <Rocket className="w-3 h-3" /> Upgrade Plan
                  </Link>
                </>
              )}
            </div>
            <form action={logout} className="mt-4">
              <button type="submit" className="w-full text-xs font-medium text-muted-foreground hover:text-foreground text-left py-2 px-3 rounded hover:bg-muted transition-colors">
                Log out
              </button>
            </form>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative w-full min-w-0">
          <MobileHeader 
            businessName={businessName} 
            initial={initial} 
            usage={usage} 
            maxLimit={maxLimit} 
            percent={percent} 
            tier={tier}
          />
          {children}
          <Suspense fallback={null}>
            <UpgradeModal />
          </Suspense>
        </main>
      </div>
    </SidebarProvider>
  )
}
