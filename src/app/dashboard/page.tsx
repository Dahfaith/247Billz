import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, FileText, Receipt, Users, Clock, Plus, Zap, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { DashboardRevenueChart, DashboardStatusChart } from "@/components/dashboard-charts";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: business } = await supabase
    .from('businesses')
    .select('id, currency')
    .eq('owner_id', user.id)
    .limit(1)
    .single();

  if (!business) return null;

  // 1. Fetch Invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, status, created_at, tax_rate, discount_rate,
      client:clients(name),
      items:invoice_items(quantity, price)
    `)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  // 2. Fetch Clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, created_at')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  // 3. Fetch Quotations
  const { data: quotations } = await supabase
    .from('quotations')
    .select('id, status, created_at')
    .eq('business_id', business.id);

  // Calculate Metrics
  const activeClientsCount = clients?.length || 0;
  const invoicesSentCount = invoices?.length || 0;
  
  const quotationsAcceptedCount = quotations?.filter(q => q.status === 'accepted' || q.status === 'converted').length || 0;
  const quotationsPendingCount = quotations?.filter(q => q.status === 'draft' || q.status === 'sent').length || 0;
  const quotationsRejectedCount = quotations?.filter(q => q.status === 'rejected').length || 0;

  // Calculate Revenue from 'paid' invoices
  let totalRevenue = 0;
  let totalOutstanding = 0;
  
  invoices?.forEach(inv => {
    const subtotal = inv.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
    const discountRate = Number(inv.discount_rate) || 0;
    const subtotalAfterDiscount = subtotal - (subtotal * (discountRate / 100));
    const taxRate = Number(inv.tax_rate) || 0;
    const invTotal = subtotalAfterDiscount + (subtotalAfterDiscount * (taxRate / 100));
    if (inv.status === 'paid') {
      totalRevenue += invTotal;
    } else {
      totalOutstanding += invTotal;
    }
  });

  const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || [];
  
  // Calculate Chart Data (Last 6 Months of Revenue)
  const chartData = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = monthNames[d.getMonth()];
    
    // Sum revenue for this month
    let monthTotal = 0;
    paidInvoices.forEach(inv => {
      const invDate = new Date(inv.created_at);
      if (invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear()) {
        const subtotal = inv.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
        const discountRate = Number(inv.discount_rate) || 0;
        const subtotalAfterDiscount = subtotal - (subtotal * (discountRate / 100));
        const taxRate = Number(inv.tax_rate) || 0;
        const invTotal = subtotalAfterDiscount + (subtotalAfterDiscount * (taxRate / 100));
        monthTotal += invTotal;
      }
    });

    chartData.push({ name: monthName, total: monthTotal });
  }

  // Build Recent Activity Feed
  const recentActivity: any[] = [];
  
  // Add recent invoices
  invoices?.slice(0, 5).forEach(inv => {
    const subtotal = inv.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
    const discountRate = Number(inv.discount_rate) || 0;
    const subtotalAfterDiscount = subtotal - (subtotal * (discountRate / 100));
    const taxRate = Number(inv.tax_rate) || 0;
    const invTotal = subtotalAfterDiscount + (subtotalAfterDiscount * (taxRate / 100));
    const clientName = (inv.client as any)?.name || 'Client';
    
    recentActivity.push({
      id: inv.id,
      type: inv.status === 'paid' ? 'Invoice Paid' : 'Invoice Created',
      description: inv.status === 'paid' ? `${clientName} paid ${formatCurrency(invTotal, business.currency)}` : `${inv.invoice_number} sent to ${clientName}`,
      date: new Date(inv.created_at),
      initials: clientName.substring(0, 2).toUpperCase(),
      color: inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
    });
  });

  // Add recent clients
  clients?.slice(0, 3).forEach(client => {
    recentActivity.push({
      id: client.id,
      type: 'New Client Added',
      description: `${client.name} joined`,
      date: new Date(client.created_at),
      initials: client.name.substring(0, 2).toUpperCase(),
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
    });
  });

  // Sort activity by date descending and take top 5
  recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());
  const topActivity = recentActivity.slice(0, 5);

  // Time formatter
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-full bg-[#F8FAFC] dark:bg-[#020617] min-h-[calc(100vh-4rem)]">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Business Overview</h2>
          <p className="text-slate-500 mt-2">Monitor your revenue, invoices, and business growth.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg shadow-sm border-0">
            <Link href="/dashboard/invoices/new">
              <Plus className="w-4 h-4 mr-2" /> Invoice
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800 rounded-lg shadow-sm">
            <Link href="/dashboard/quotations/new">
              <Plus className="w-4 h-4 mr-2" /> Quotation
            </Link>
          </Button>
          <Button asChild variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800 rounded-lg shadow-sm">
            <Link href="/dashboard/receipts">
              <Receipt className="w-4 h-4 mr-2" /> Receipts
            </Link>
          </Button>
        </div>
      </div>

      {/* Upsell/Status Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10 border border-orange-200 dark:border-orange-900/50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#F97316]" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base">Did you know?</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Customizing your invoice branding in Settings gives your business a highly professional appearance.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="shrink-0 rounded-lg shadow-sm bg-white hover:bg-orange-50 text-[#F97316] border-orange-200 dark:bg-transparent dark:border-orange-900 dark:hover:bg-orange-950">
          <Link href="/dashboard/settings">
            Customize Now
          </Link>
        </Button>
      </div>

      {/* Hero Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Revenue Hero Card */}
        <Card className="col-span-1 border-0 shadow-lg bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-100 uppercase tracking-wider">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight mb-2">
              {formatCurrency(totalRevenue, business.currency)}
            </div>
            <p className="text-sm text-orange-200 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" /> Lifetime revenue from paid invoices
            </p>
          </CardContent>
        </Card>

        {/* Outstanding Balances */}
        <Card className="col-span-1 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-[#0F172A]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              {formatCurrency(totalOutstanding, business.currency)}
            </div>
            <p className="text-sm text-slate-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" /> Expected from unpaid invoices
            </p>
          </CardContent>
        </Card>

        {/* Quotations Overview */}
        <Card className="col-span-1 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-[#0F172A] flex flex-col justify-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Quotations Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Accepted</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{quotationsAcceptedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pending</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{quotationsPendingCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rejected</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{quotationsRejectedCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Your paid invoices over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardRevenueChart data={chartData} currencySymbol={getCurrencySymbol(business.currency)} />
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] rounded-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="mt-1">Latest actions on your account.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-[#F97316] hover:text-[#EA580C] hover:bg-orange-50 dark:hover:bg-orange-950/50">
              <Link href="/dashboard/invoices">View All</Link>
            </Button>
          </div>
          <CardContent className="flex-1 mt-4">
            {topActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <Clock className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-4" />
                <p className="text-sm text-slate-500">No recent activity to show.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {topActivity.map((activity, i) => (
                  <div key={`${activity.id}-${i}`} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-white/50 dark:border-slate-800 ${activity.color}`}>
                      {activity.initials}
                    </div>
                    <div className="ml-4 space-y-0.5 flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate text-slate-900 dark:text-slate-100">{activity.type}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {activity.description}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-slate-400 whitespace-nowrap pl-4">
                      {timeAgo(activity.date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <CardDescription>Breakdown of all your generated invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardStatusChart data={[
              { name: 'Paid', value: invoices?.filter(i => i.status === 'paid').length || 0, color: '#10B981' },
              { name: 'Pending', value: invoices?.filter(i => i.status === 'pending' || i.status === 'draft').length || 0, color: '#F59E0B' },
              { name: 'Overdue', value: invoices?.filter(i => i.status === 'overdue').length || 0, color: '#EF4444' }
            ]} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
