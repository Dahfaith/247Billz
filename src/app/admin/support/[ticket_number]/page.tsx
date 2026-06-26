import { getAdminTicketByNumber, replyToTicket } from "@/app/actions/admin"
import { notFound, redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

export default async function AdminTicketReplyPage({ params }: { params: Promise<{ ticket_number: string }> }) {
  const resolvedParams = await params;
  const { ticket, success } = await getAdminTicketByNumber(resolvedParams.ticket_number)

  if (!success || !ticket) {
    notFound()
  }

  async function handleReply(formData: FormData) {
    'use server'
    const reply = formData.get('reply') as string
    if (!reply) return
    
    await replyToTicket(ticket.id, reply)
    redirect('/admin/support')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/support">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Ticket {ticket.ticket_number}</h1>
          <p className="text-[#64748B] dark:text-slate-400">From: {ticket.businesses?.name || 'Unknown Business'}</p>
        </div>
      </div>

      <Card className="p-6 bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[#64748B] dark:text-slate-400">Subject</h3>
            <p className="text-[#0F172A] dark:text-white font-medium">{ticket.subject}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#64748B] dark:text-slate-400">Description</h3>
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-slate-300 whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>
        </div>
      </Card>

      {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
        <Card className="p-6 bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800">
          <form action={handleReply} className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white">Write a Reply</h3>
            <Textarea 
              name="reply" 
              placeholder="Type your response here... This will mark the ticket as resolved."
              className="min-h-[150px] bg-[#F8FAFC] dark:bg-[#1E293B]"
              required
            />
            <div className="flex justify-end">
              <Button type="submit" className="bg-[#F97316] hover:bg-[#EA580C] text-white">
                <Send className="w-4 h-4 mr-2" />
                Send Reply & Resolve
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6 bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-slate-800 opacity-70">
          <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white mb-2">Ticket Resolved</h3>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mb-4">You have already replied to this ticket.</p>
          {ticket.admin_reply && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800">
              <p className="font-medium text-[#0F172A] dark:text-white mb-1">Your Reply:</p>
              <p className="text-[#64748B] dark:text-slate-300 whitespace-pre-wrap">{ticket.admin_reply}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
