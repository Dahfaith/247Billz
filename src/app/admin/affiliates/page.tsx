import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link2, UsersRound, DollarSign, Search, ExternalLink, Activity } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

import { getAdminAffiliates } from '@/app/actions/admin'

export const dynamic = 'force-dynamic'

export default async function AdminAffiliatesPage() {
  const { success, affiliates } = await getAdminAffiliates()
  const displayAffiliates = affiliates || []
  
  const totalAffiliates = displayAffiliates.length
  const totalReferrals = displayAffiliates.reduce((acc: number, curr: any) => acc + (curr.referrals_count || 0), 0)
  const totalRevenue = displayAffiliates.reduce((acc: number, curr: any) => acc + Number(curr.revenue_generated || 0), 0)
  const pendingCommissions = displayAffiliates.reduce((acc: number, curr: any) => acc + Number(curr.commission_due || 0), 0)

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Affiliate Program</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track referral partners, conversions, and commission payouts.
          </p>
        </div>
        <Button className="gap-2 bg-[#10B981] hover:bg-[#059669] text-white">
          <DollarSign className="w-4 h-4" /> Process Payouts
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Affiliates</CardDescription>
            <CardTitle className="text-3xl font-bold">{totalAffiliates}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <UsersRound className="w-4 h-4" /> Active Partners
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Referrals</CardDescription>
            <CardTitle className="text-3xl font-bold">{totalReferrals}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Activity className="w-4 h-4" /> Across all time
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Generated Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold">${totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <DollarSign className="w-4 h-4" /> From Affiliates
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Pending Commissions</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-500">${pendingCommissions.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <DollarSign className="w-4 h-4" /> Unpaid Earnings
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              type="search" 
              placeholder="Search affiliates..." 
              className="pl-8 bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-slate-800"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Link2 className="w-4 h-4" /> Export Links
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="border-[#E2E8F0] dark:border-slate-800 hover:bg-transparent">
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Affiliate Name</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Promo Code</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">Referrals</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">Revenue Generated</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">Commission Due</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-center">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayAffiliates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">No affiliates found.</TableCell>
              </TableRow>
            ) : displayAffiliates.map((aff: any) => (
              <TableRow key={aff.id} className="border-[#E2E8F0] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableCell className="font-medium text-slate-900 dark:text-slate-100">{aff.name}</TableCell>
                <TableCell>
                  <code className="text-xs font-bold text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30 px-2 py-1 rounded">
                    {aff.promo_code}
                  </code>
                </TableCell>
                <TableCell className="text-right font-medium">{aff.referrals_count}</TableCell>
                <TableCell className="text-right text-slate-600 dark:text-slate-400">${Number(aff.revenue_generated).toLocaleString()}</TableCell>
                <TableCell className="text-right font-bold text-[#10B981]">${Number(aff.commission_due).toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={aff.status === 'active' ? 'default' : 'secondary'} 
                    className={
                      aff.status === 'active' 
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
                    }>
                    {aff.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
