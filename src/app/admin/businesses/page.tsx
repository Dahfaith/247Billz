import { getAdminBusinesses, toggleBusinessSuspension, adminUpgradeBusinessPlan } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Search, Download, Building2, UserCog, Ban, ArrowUpCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

export const dynamic = 'force-dynamic'

export default async function AdminBusinessesPage() {
  const { success, businesses } = await getAdminBusinesses()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Businesses</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage all tenant companies on the platform.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 text-slate-700 dark:text-slate-300 border-[#E2E8F0] dark:border-slate-800">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#F97316]" />
            Tenant Directory
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search businesses..."
              className="pl-9 bg-slate-50 dark:bg-[#020617] border-[#E2E8F0] dark:border-slate-800"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto pb-4">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow className="border-[#E2E8F0] dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Company</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Contact</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Plan</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Joined</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {success && businesses?.map((business: any) => (
                  <TableRow key={business.id} className="border-[#E2E8F0] dark:border-slate-800">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-slate-800 dark:to-slate-900 border border-orange-200 dark:border-slate-700 flex items-center justify-center font-bold text-[#F97316]">
                          {business.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">{business.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${business.status === 'suspended' ? 'bg-red-500' : 'bg-[#10B981]'}`}></span>
                            <span className="capitalize">{business.status || 'Active'}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-700 dark:text-slate-300">{business.email || '—'}</div>
                      <div className="text-xs text-slate-500">{business.phone || '—'}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${business.subscription_tier === 'free' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 
                          business.subscription_tier === 'pro' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
                          'bg-orange-100 text-[#F97316] dark:bg-orange-900/20'}`}
                      >
                        {business.subscription_tier}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(business.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-slate-800">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer">
                            <UserCog className="mr-2 h-4 w-4" />
                            Impersonate Login
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#E2E8F0] dark:bg-slate-800" />
                          <form action={async () => { "use server"; await adminUpgradeBusinessPlan(business.id, 'pro'); }}>
                            <button type="submit" className="w-full flex items-center px-2 py-1.5 text-sm outline-none transition-colors rounded-sm text-purple-600 hover:bg-slate-100 focus:bg-slate-100">
                              <ArrowUpCircle className="mr-2 h-4 w-4" />
                              Upgrade to Pro
                            </button>
                          </form>
                          <form action={async () => { "use server"; await adminUpgradeBusinessPlan(business.id, 'business'); }}>
                            <button type="submit" className="w-full flex items-center px-2 py-1.5 text-sm outline-none transition-colors rounded-sm text-blue-600 hover:bg-slate-100 focus:bg-slate-100">
                              <ArrowUpCircle className="mr-2 h-4 w-4" />
                              Upgrade to Business
                            </button>
                          </form>
                          <form action={async () => { "use server"; await adminUpgradeBusinessPlan(business.id, 'free'); }}>
                            <button type="submit" className="w-full flex items-center px-2 py-1.5 text-sm outline-none transition-colors rounded-sm text-slate-600 hover:bg-slate-100 focus:bg-slate-100">
                              <ArrowUpCircle className="mr-2 h-4 w-4" />
                              Downgrade to Free
                            </button>
                          </form>
                          <form action={async () => { "use server"; await toggleBusinessSuspension(business.id, business.status || 'active'); }}>
                            <button type="submit" className={`w-full flex items-center px-2 py-1.5 text-sm outline-none transition-colors rounded-sm ${business.status === 'suspended' ? 'text-green-600 focus:bg-slate-100 hover:bg-slate-100' : 'text-red-600 focus:bg-slate-100 hover:bg-slate-100'}`}>
                              {business.status === 'suspended' ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                              {business.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                            </button>
                          </form>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {(!businesses || businesses.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No businesses found.
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
