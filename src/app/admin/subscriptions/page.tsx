import { getAdminSubscriptions } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Rocket, Briefcase, CheckCircle2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export default async function AdminSubscriptionsPage() {
  const { success, subscriptions, stats } = await getAdminSubscriptions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Subscriptions</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage business billing plans and MRR (Monthly Recurring Revenue).
        </p>
      </div>

      {/* Plan Breakdown */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
              Free Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
              {stats?.free || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Active Businesses</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-[#F97316]" />
              Starter Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F97316]">
              {stats?.starter || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Active Businesses</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-500" />
              Pro Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {stats?.pro || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Active Businesses</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              Business Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {stats?.business || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Active Businesses</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Subscriber Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow className="border-[#E2E8F0] dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="font-medium text-slate-500">Business</TableHead>
                  <TableHead className="font-medium text-slate-500">Current Plan</TableHead>
                  <TableHead className="font-medium text-slate-500">Billing Email</TableHead>
                  <TableHead className="font-medium text-slate-500">Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {success && subscriptions?.map((sub: any) => (
                  <TableRow key={sub.id} className="border-[#E2E8F0] dark:border-slate-800">
                    <TableCell>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{sub.name}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${sub.subscription_tier === 'free' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 
                          sub.subscription_tier === 'starter' ? 'bg-orange-100 text-[#F97316] dark:bg-orange-900/20' :
                          sub.subscription_tier === 'pro' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30'}`}
                      >
                        {sub.subscription_tier || 'free'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {sub.email || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                
                {(!subscriptions || subscriptions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
