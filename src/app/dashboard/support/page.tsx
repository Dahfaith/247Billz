import { getUserTickets } from '@/app/actions/support'
import { SupportForm } from './support-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MessageSquare, Clock, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SupportPage() {
  const { tickets } = await getUserTickets()

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Support & Helpdesk</h1>
        <p className="text-[#64748B] mt-1">
          Get help from our team and track your previous requests.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <SupportForm />
        </div>

        <div className="md:col-span-2">
          <Card className="bg-white border-[#E2E8F0] shadow-sm h-full">
            <CardHeader className="border-b border-[#E2E8F0]">
              <CardTitle className="text-xl text-[#0F172A]">Your Ticket History</CardTitle>
              <CardDescription>Track the status of your recent requests.</CardDescription>
            </CardHeader>
            <div className="p-0">
              <Table>
                <TableHeader className="bg-[#F8FAFC]">
                  <TableRow className="border-[#E2E8F0] hover:bg-transparent">
                    <TableHead className="font-semibold text-[#64748B]">Ticket ID</TableHead>
                    <TableHead className="font-semibold text-[#64748B]">Subject</TableHead>
                    <TableHead className="font-semibold text-[#64748B]">Status</TableHead>
                    <TableHead className="font-semibold text-[#64748B] text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-[#94A3B8]">
                        You haven't opened any support tickets yet.
                      </TableCell>
                    </TableRow>
                  ) : tickets.map((ticket: any) => (
                    <TableRow key={ticket.id} className="border-[#E2E8F0] hover:bg-[#F8FAFC]">
                      <TableCell className="font-medium text-[#64748B]">
                        {ticket.ticket_number}
                      </TableCell>
                      <TableCell className="font-medium text-[#0F172A]">
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'} 
                          className={
                            ticket.status === 'open' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                            ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                            'bg-green-100 text-green-700 hover:bg-green-100'
                          }>
                          {ticket.status === 'open' && <MessageSquare className="w-3 h-3 mr-1" />}
                          {ticket.status === 'in_progress' && <Clock className="w-3 h-3 mr-1" />}
                          {ticket.status === 'resolved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-[#64748B]">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
