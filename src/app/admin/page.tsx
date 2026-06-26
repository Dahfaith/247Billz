import { getAdminDashboardStats } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, CreditCard, Activity, ArrowUpRight, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const { success, stats, recentRegistrations, recentTransactions } = await getAdminDashboardStats()

  if (!success) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-slate-500">Failed to load platform statistics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Platform Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Welcome back. Here is what is happening across 247Billz today.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Volume (30d)</CardTitle>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#10B981]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(stats?.monthlyRevenue || 0, 'NGN')}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#10B981]" />
              <span className="text-[#10B981] font-medium">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Businesses</CardTitle>
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#F97316]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalBusinesses}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Total tenants registered
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Paid Subscriptions</CardTitle>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.activeSubscriptions}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active recurring plans
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Failed Transactions</CardTitle>
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-[#EF4444]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.failedTransactionsCount}
            </div>
            <p className="text-xs text-[#EF4444] mt-1 flex items-center gap-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Registrations */}
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRegistrations?.map((business: any) => (
                <div key={business.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-semibold text-slate-600 dark:text-slate-300">
                      {business.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{business.name}</p>
                      <p className="text-xs text-slate-500">{business.email || 'No email'}</p>
                    </div>
                  </div>
                  <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 capitalize">
                    {business.subscription_tier}
                  </div>
                </div>
              ))}
              {(!recentRegistrations || recentRegistrations.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">No recent signups</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Platform Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions?.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatCurrency(tx.amount, 'NGN')}
                    </p>
                    <p className="text-xs text-slate-500">
                      Invoice #{tx.invoices?.invoice_number || 'Unknown'} via {tx.payment_method || 'Link'}
                    </p>
                  </div>
                  <div className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize
                    ${tx.status === 'successful' || tx.status === 'paid' ? 'bg-green-100 text-[#10B981]' : 
                      tx.status === 'failed' ? 'bg-red-100 text-[#EF4444]' : 
                      'bg-orange-100 text-[#F59E0B]'}`}>
                    {tx.status}
                  </div>
                </div>
              ))}
              {(!recentTransactions || recentTransactions.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
