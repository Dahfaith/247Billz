import { createClient } from "@/lib/supabase/server";
import { DashboardRevenueChart } from "@/components/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, FileText } from "lucide-react";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single();

  let totalRevenue = 0;
  let paidRevenue = 0;
  let outstandingRevenue = 0;
  let totalInvoices = 0;
  let chartData: { name: string, total: number }[] = [];

  if (business) {
    // Fetch all invoices with items
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, created_at, status, items:invoice_items(quantity, price)')
      .eq('business_id', business.id);

    // Fetch all payments
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, created_at, invoice:invoices!inner(business_id)')
      .eq('invoice.business_id', business.id);

    const safeInvoices = invoices || [];

    totalInvoices = safeInvoices.length;

    totalRevenue = safeInvoices.reduce((acc, inv) => {
      const invTotal = inv.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
      return acc + invTotal;
    }, 0);

    const paidInvoices = safeInvoices.filter((inv) => inv.status === 'paid');
    
    paidRevenue = paidInvoices.reduce((acc, inv) => {
      const invTotal = inv.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
      return acc + invTotal;
    }, 0);
    
    outstandingRevenue = totalRevenue - paidRevenue;

    // Group paid revenue by month for the chart
    const monthlyData: Record<string, number> = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      monthlyData[monthName] = 0;
    }

    paidInvoices.forEach(inv => {
      const invTotal = inv.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
      const d = new Date(inv.created_at);
      const monthName = d.toLocaleString('default', { month: 'short' });
      if (monthlyData[monthName] !== undefined) {
        monthlyData[monthName] += invTotal;
      }
    });

    chartData = Object.entries(monthlyData).map(([name, total]) => ({ name, total }));
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Professional insights into your business performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total value of all invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₦{paidRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total payments received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">₦{outstandingRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Unpaid invoice amounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices Issued</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue Overview (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          {totalInvoices > 0 ? (
            <DashboardRevenueChart data={chartData} />
          ) : (
            <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground text-sm">
              No revenue data to display. Start getting paid!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
