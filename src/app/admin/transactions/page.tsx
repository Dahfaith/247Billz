import { getAdminTransactions } from '@/app/actions/admin'
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
import { MoreHorizontal, Search, Download, FileText, ArrowLeftRight, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminTransactionsPage() {
  const { success, transactions } = await getAdminTransactions()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Global ledger of all payments across all businesses.
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
            <FileText className="w-5 h-5 text-purple-500" />
            Platform Ledger
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search transaction ID or invoice..."
              className="pl-9 bg-slate-50 dark:bg-[#020617] border-[#E2E8F0] dark:border-slate-800"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow className="border-[#E2E8F0] dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Transaction ID</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Business & Invoice</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Amount</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Status & Method</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Date</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {success && transactions?.map((tx: any) => (
                  <TableRow key={tx.id} className="border-[#E2E8F0] dark:border-slate-800">
                    <TableCell>
                      <div className="font-mono text-xs text-slate-500">{tx.id.split('-')[0]}...</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {tx.invoices?.businesses?.name || 'Unknown Business'}
                      </div>
                      <div className="text-xs text-slate-500">
                        Invoice #{tx.invoices?.invoice_number || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(tx.amount || 0, 'NGN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mb-1
                        ${tx.status === 'successful' || tx.status === 'paid' ? 'bg-green-100 text-[#10B981]' : 
                          tx.status === 'failed' ? 'bg-red-100 text-[#EF4444]' : 
                          'bg-orange-100 text-[#F59E0B]'}`}
                      >
                        {tx.status}
                      </span>
                      <div className="text-xs text-slate-500 capitalize">{tx.payment_method || 'Unknown'}</div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                      <div className="text-xs">{new Date(tx.created_at).toLocaleTimeString()}</div>
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
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#E2E8F0] dark:bg-slate-800" />
                          {tx.status === 'successful' && (
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                              <ArrowLeftRight className="mr-2 h-4 w-4" />
                              Issue Refund
                            </DropdownMenuItem>
                          )}
                          {tx.status === 'failed' && (
                            <DropdownMenuItem className="cursor-pointer">
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Retry Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {(!transactions || transactions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      No transactions found.
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
