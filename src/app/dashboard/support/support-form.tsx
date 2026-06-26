'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, CheckCircle2 } from 'lucide-react'
import { createSupportTicket } from '@/app/actions/support'

export function SupportForm() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        await createSupportTicket(formData)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 5000)
      } catch (err) {
        alert("Failed to submit ticket")
      }
    })
  }

  return (
    <Card className="bg-white border-[#E2E8F0] shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-xl text-[#0F172A]">Open a Ticket</CardTitle>
          <CardDescription>Need help? Send us a message and we'll get back to you ASAP.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" required placeholder="e.g. Trouble sending invoice" className="bg-white border-[#E2E8F0]" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority" defaultValue="medium">
              <SelectTrigger className="bg-white border-[#E2E8F0]">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor question</SelectItem>
                <SelectItem value="medium">Medium - Needs attention</SelectItem>
                <SelectItem value="high">High - Blocking my work</SelectItem>
                <SelectItem value="critical">Critical - System down</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" required placeholder="Please describe your issue in detail..." className="bg-white border-[#E2E8F0] min-h-[120px]" />
          </div>
        </CardContent>
        <CardFooter className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
          {success ? (
            <div className="w-full text-center text-[#10B981] font-medium flex items-center justify-center gap-2 py-2">
              <CheckCircle2 className="w-5 h-5" /> Ticket Submitted Successfully!
            </div>
          ) : (
            <Button type="submit" disabled={isPending} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium shadow-sm transition-all">
              {isPending ? "Submitting..." : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Submit Ticket
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
