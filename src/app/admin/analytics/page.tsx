import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/currency'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Gather basic platform metrics
  const [{ count: usersCount }, { count: businessesCount }, { count: invoicesCount }, { data: payments }] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('businesses').select('id', { count: 'exact' }),
    supabase.from('invoices').select('id', { count: 'exact' }),
    supabase.from('payments').select('amount').order('created_at', { ascending: false }).limit(10)
  ])

  const recentPaymentsTotal = (payments || []).reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0)

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Platform-wide metrics and recent activity overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Total registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Businesses</CardTitle>
            <CardDescription>Active tenant accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessesCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Total invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoicesCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Recent Payments</h2>
        <Card>
          <CardContent>
            <div className="mb-4">Last 10 payments total: <strong>{formatCurrency(recentPaymentsTotal, 'NGN')}</strong></div>
            <div className="text-sm text-slate-600">Showing most recent 10 payments for quick insight.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
