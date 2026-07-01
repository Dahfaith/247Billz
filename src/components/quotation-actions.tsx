"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { acceptQuotationAction, declineQuotationAction } from "@/app/actions/quotations"
import { Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function QuotationActions({ quotationToken, status }: { quotationToken: string, status: string }) {
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(status)
  const [actionComplete, setActionComplete] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  if (currentStatus !== 'draft' || actionComplete) return null;

  const handleStatusChange = async (newStatus: 'accepted' | 'declined', successMessage: string) => {
    try {
      if (newStatus === 'accepted') {
        await acceptQuotationAction(quotationToken)
      } else {
        await declineQuotationAction(quotationToken)
      }

      setCurrentStatus(newStatus)
      setMessage(successMessage)
      setActionComplete(true)
      toast.success(successMessage)

      if (typeof window !== 'undefined') {
        window.location.replace(window.location.href)
      }
    } catch (error: any) {
      toast.error(`Failed to ${newStatus === 'accepted' ? 'accept' : 'decline'} quotation`)
    }
  }

  return (
    <div className="space-y-4 mt-8 pt-8 border-t border-border">
      {message ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900">
          {message}
        </div>
      ) : null}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <Button 
          variant="outline" 
          size="lg"
          className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          disabled={isPending}
          onClick={() => {
            startTransition(() => handleStatusChange('declined', 'Quotation declined.'))
          }}
        >
          {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <X className="w-5 h-5 mr-2" />}
          Decline
        </Button>
        <Button 
          size="lg"
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          disabled={isPending}
          onClick={() => {
            startTransition(() => handleStatusChange('accepted', 'Quotation accepted! Thank you.'))
          }}
        >
          {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
          Accept Quotation
        </Button>
      </div>
    </div>
  )
}
