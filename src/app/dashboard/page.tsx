import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, FileText, Receipt, Users, Clock } from "lucide-react";
import { DashboardRevenueChart } from "@/components/dashboard-charts";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

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
      id, invoice_number, status, created_at,
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

  // Calculate Revenue from 'paid' invoices
  let totalRevenue = 0;
  const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || [];
  
  paidInvoices.forEach(inv => {
    const invTotal = inv.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
    totalRevenue += invTotal;
  });

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
        const invTotal = inv.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
        monthTotal += invTotal;
      }
    });

    chartData.push({ name: monthName, total: monthTotal });
  }

  // Build Recent Activity Feed
  const recentActivity: any[] = [];
  
  // Add recent invoices
  invoices?.slice(0, 5).forEach(inv => {
    const invTotal = inv.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
    const clientName = (inv.client as any)?.name || 'Client';
    
    recentActivity.push({
      id: inv.id,
      type: inv.status === 'paid' ? 'Invoice Paid' : 'Invoice Created',
      description: inv.status === 'paid' ? `${clientName} paid ${formatCurrency(invTotal, business.currency)}` : `${inv.invoice_number} sent to ${clientName}`,
      date: new Date(inv.created_at),
      initials: clientName.substring(0, 2).toUpperCase(),
      color: inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
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
      color: 'bg-blue-100 text-blue-700'
    });
  });

  // Sort activity by date descending and take top 4
  recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());
  const topActivity = recentActivity.slice(0, 4);

  // Time formatter
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">Welcome back. Here's an overview of your business.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-muted-foreground font-bold mr-1">
              {formatCurrency(totalRevenue, business.currency).replace(/[0-9.,]/g, '')}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, business.currency)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-green-500">
              <ArrowUpRight className="w-3 h-3 mr-1" /> Live from paid invoices
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Invoices Sent</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoicesSentCount}</div>
            <p className="text-xs text-muted-foreground mt-1 text-slate-500">
              Total lifetime invoices
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quotations Accepted</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotationsAcceptedCount}</div>
            <p className="text-xs text-muted-foreground mt-1 text-slate-500">
              Approved estimates
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClientsCount}</div>
            <p className="text-xs text-muted-foreground mt-1 text-slate-500">
              Saved in CRM
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 shadow-sm border-border overflow-hidden">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Your paid invoices over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardRevenueChart data={chartData} currencySymbol={getCurrencySymbol(business.currency)} />
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-sm border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {topActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No recent activity found.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {topActivity.map((activity, i) => (
                  <div key={`${activity.id}-${i}`} className="flex items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${activity.color}`}>
                      {activity.initials}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo(activity.date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
