import { getUserTicketByNumber } from "@/app/actions/support"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, Clock, CheckCircle2, User, Shield } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function UserTicketDetailPage({ params }: { params: Promise<{ ticket_number: string }> }) {
  const resolvedParams = await params;
  const { ticket, success } = await getUserTicketByNumber(resolvedParams.ticket_number)

  if (!success || !ticket) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 max-w-full">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/support">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-3">
            Ticket {ticket.ticket_number}
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
          </h1>
          <p className="text-[#64748B] dark:text-slate-400 mt-1">Created on {new Date(ticket.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <Card className="p-6 bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-2">Subject</h3>
            <p className="text-[#0F172A] dark:text-white font-medium text-lg">{ticket.subject}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-3">Your Message</h3>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div className="p-4 rounded-xl rounded-tl-none bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-slate-300 whitespace-pre-wrap w-full border border-slate-100 dark:border-slate-800">
                {ticket.description}
              </div>
            </div>
          </div>

          {ticket.admin_reply && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Admin Response
              </h3>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="p-4 rounded-xl rounded-tl-none bg-primary/5 text-[#0F172A] dark:text-slate-300 whitespace-pre-wrap w-full border border-primary/10">
                  {ticket.admin_reply}
                </div>
              </div>
            </div>
          )}

          {!ticket.admin_reply && ticket.status !== 'resolved' && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-slate-500 text-sm italic">Our team is reviewing your ticket and will respond shortly.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
