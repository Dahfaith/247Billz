'use client'

import { useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Search, Download, FileText, ArrowLeftRight, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

export function TransactionsClient({ initialTransactions }: { initialTransactions: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTx, setSelectedTx] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter transactions based on search query
  const filteredTransactions = (initialTransactions || []).filter((tx: any) => {
    const query = searchQuery.toLowerCase()
    const idMatch = tx.id?.toLowerCase().includes(query)
    const businessMatch = tx.invoices?.businesses?.name?.toLowerCase().includes(query)
    const invoiceMatch = tx.invoices?.invoice_number?.toLowerCase().includes(query)
    const amountMatch = tx.amount?.toString().includes(query)
    const statusMatch = tx.status?.toLowerCase().includes(query)
    
    return idMatch || businessMatch || invoiceMatch || amountMatch || statusMatch
  })

  // Generate and download CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export")
      return
    }

    const headers = ["Transaction ID", "Business Name", "Invoice Number", "Amount (NGN)", "Status", "Payment Method", "Date"]
    const csvRows = [headers.join(",")]

    filteredTransactions.forEach((tx: any) => {
      const row = [
        tx.id,
        `"${tx.invoices?.businesses?.name || 'Unknown'}"`,
        tx.invoices?.invoice_number || 'N/A',
        tx.amount || 0,
        tx.status,
        tx.payment_method || 'Unknown',
        new Date(tx.created_at).toISOString()
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `transactions_export_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Transactions exported successfully")
  }

  const handleViewDetails = (tx: any) => {
    setSelectedTx(tx)
    setIsModalOpen(true)
  }

  const handleRefundOrRetry = (action: string) => {
    toast("This feature will be integrated with the payment gateway soon.", {
      icon: '🚧'
    })
  }

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
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="gap-2 text-slate-700 dark:text-slate-300 border-[#E2E8F0] dark:border-slate-800"
          >
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
              placeholder="Search ID, invoice, or business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-[#020617] border-[#E2E8F0] dark:border-slate-800"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto pb-4">
            <Table className="min-w-[900px]">
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
                {filteredTransactions.map((tx: any) => (
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
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewDetails(tx)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#E2E8F0] dark:bg-slate-800" />
                          {(tx.status === 'successful' || tx.status === 'paid') && (
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => handleRefundOrRetry('refund')}>
                              <ArrowLeftRight className="mr-2 h-4 w-4" />
                              Issue Refund
                            </DropdownMenuItem>
                          )}
                          {tx.status === 'failed' && (
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleRefundOrRetry('retry')}>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Retry Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      No transactions found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete record for transaction {selectedTx?.id?.split('-')[0]}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTx && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1
                    ${selectedTx.status === 'successful' || selectedTx.status === 'paid' ? 'bg-green-100 text-[#10B981]' : 
                      selectedTx.status === 'failed' ? 'bg-red-100 text-[#EF4444]' : 
                      'bg-orange-100 text-[#F59E0B]'}`}
                  >
                    {selectedTx.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Amount</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedTx.amount || 0, 'NGN')}
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-4 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-slate-500">Business</div>
                  <div className="col-span-2 text-sm font-medium text-right text-slate-900 dark:text-white">
                    {selectedTx.invoices?.businesses?.name || 'Unknown'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-slate-500">Invoice Ref</div>
                  <div className="col-span-2 text-sm font-medium text-right text-slate-900 dark:text-white">
                    {selectedTx.invoices?.invoice_number || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-slate-500">Date</div>
                  <div className="col-span-2 text-sm font-medium text-right text-slate-900 dark:text-white">
                    {new Date(selectedTx.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-slate-500">Method</div>
                  <div className="col-span-2 text-sm font-medium text-right text-slate-900 dark:text-white capitalize">
                    {selectedTx.payment_method || 'Unknown'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm text-slate-500">Reference</div>
                  <div className="col-span-2 text-sm font-mono text-right text-slate-900 dark:text-white break-all">
                    {selectedTx.reference || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
