import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HeadphonesIcon, MessageSquare, Clock, Search, ExternalLink, CheckCircle2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

import { getAdminTickets } from '@/app/actions/admin'

export const dynamic = 'force-dynamic'

export default async function AdminSupportPage() {
  const { success, tickets } = await getAdminTickets()
  const displayTickets = tickets || []
  
  const openTickets = displayTickets.filter((t: any) => t.status === 'open').length
  const inProgressTickets = displayTickets.filter((t: any) => t.status === 'in_progress').length
  const resolvedTickets = displayTickets.filter((t: any) => t.status === 'resolved').length

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Support Helpdesk</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Resolve issues, answer questions, and assist businesses on the platform.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Open Tickets</CardDescription>
            <CardTitle className="text-3xl font-bold text-red-500">{openTickets}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MessageSquare className="w-4 h-4" /> Requires Action
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-500">{inProgressTickets}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" /> Being handled
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-600">--</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <HeadphonesIcon className="w-4 h-4" /> Across all tickets
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-3xl font-bold text-green-500">{resolvedTickets}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CheckCircle2 className="w-4 h-4" /> Great job!
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
              placeholder="Search by ticket # or user..." 
              className="pl-8 bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-slate-800"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="border-[#E2E8F0] dark:border-slate-800 hover:bg-transparent">
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Ticket</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Subject</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Business/User</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-center">Priority</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-center">Status</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">No support tickets found.</TableCell>
              </TableRow>
            ) : displayTickets.map((ticket: any) => (
              <TableRow key={ticket.id} className="border-[#E2E8F0] dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableCell className="font-medium text-slate-500 dark:text-slate-400">
                  {ticket.ticket_number}
                </TableCell>
                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                  {ticket.subject}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {ticket.businesses?.name || 'Unknown'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline"
                    className={
                      ticket.priority === 'critical' ? 'border-red-500 text-red-500' :
                      ticket.priority === 'high' ? 'border-orange-500 text-orange-500' :
                      ticket.priority === 'medium' ? 'border-blue-500 text-blue-500' :
                      'border-slate-500 text-slate-500'
                    }>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'} 
                    className={
                      ticket.status === 'open' ? 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400' :
                      ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                    }>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-slate-500">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
