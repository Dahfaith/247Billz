import { getAdminTransactions } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminPaymentsPage() {
  const { success, transactions } = await getAdminTransactions()

  // Calculate Gateway Statistics
  const gateways = {
    paystack: { successful: 0, failed: 0, pending: 0, revenue: 0 },
    flutterwave: { successful: 0, failed: 0, pending: 0, revenue: 0 },
    stripe: { successful: 0, failed: 0, pending: 0, revenue: 0 },
  }

  let totalSuccessful = 0
  let totalFailed = 0
  let totalPending = 0
  let totalRevenue = 0

  if (success && transactions) {
    transactions.forEach((tx: any) => {
      const method = (tx.payment_method || 'paystack').toLowerCase()
      const gateway = gateways[method as keyof typeof gateways] || gateways.paystack
      
      const amount = Number(tx.amount || 0)
      
      if (tx.status === 'successful' || tx.status === 'paid') {
        gateway.successful++
        gateway.revenue += amount
        totalSuccessful++
        totalRevenue += amount
      } else if (tx.status === 'failed') {
        gateway.failed++
        totalFailed++
      } else if (tx.status === 'pending') {
        gateway.pending++
        totalPending++
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Payments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor API Gateway performance across Paystack, Flutterwave, and Stripe.
        </p>
      </div>

      {/* Global Payment Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Processed</CardTitle>
            <Wallet className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, 'NGN')}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Successful</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#10B981]">{totalSuccessful}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Failed</CardTitle>
            <XCircle className="w-4 h-4 text-[#EF4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EF4444]">{totalFailed}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending</CardTitle>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F59E0B]">{totalPending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gateways Breakdown */}
      <h2 className="text-xl font-bold mt-8 mb-4">API Gateways Breakdown</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Paystack */}
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0ba4db]"></div>
              Paystack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(gateways.paystack.revenue, 'NGN')}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <div>
                <p className="text-xs text-slate-500">Success</p>
                <p className="font-semibold text-[#10B981]">{gateways.paystack.successful}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Failed</p>
                <p className="font-semibold text-[#EF4444]">{gateways.paystack.failed}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pending</p>
                <p className="font-semibold text-[#F59E0B]">{gateways.paystack.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flutterwave */}
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FB923C]"></div>
              Flutterwave
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(gateways.flutterwave.revenue, 'NGN')}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <div>
                <p className="text-xs text-slate-500">Success</p>
                <p className="font-semibold text-[#10B981]">{gateways.flutterwave.successful}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Failed</p>
                <p className="font-semibold text-[#EF4444]">{gateways.flutterwave.failed}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pending</p>
                <p className="font-semibold text-[#F59E0B]">{gateways.flutterwave.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stripe */}
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
              Stripe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(gateways.stripe.revenue, 'NGN')}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <div>
                <p className="text-xs text-slate-500">Success</p>
                <p className="font-semibold text-[#10B981]">{gateways.stripe.successful}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Failed</p>
                <p className="font-semibold text-[#EF4444]">{gateways.stripe.failed}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pending</p>
                <p className="font-semibold text-[#F59E0B]">{gateways.stripe.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
