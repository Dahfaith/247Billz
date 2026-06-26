"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { acceptQuotationAction, declineQuotationAction, convertQuotationToInvoiceAction } from "@/app/actions/quotations"
import { Check, X, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function QuotationActions({ quotationId, status, isOwner }: { quotationId: string, status: string, isOwner?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()



  if (status !== 'draft') return null;

  return (
    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-8 border-t border-border">
      <Button 
        variant="outline" 
        size="lg"
        className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              await declineQuotationAction(quotationId)
              toast.success("Quotation declined.")
            } catch (error: any) {
              toast.error("Failed to decline quotation")
            }
          })
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
          startTransition(async () => {
            try {
              await acceptQuotationAction(quotationId)
              toast.success("Quotation accepted! Thank you.")
            } catch (error: any) {
              toast.error("Failed to accept quotation")
            }
          })
        }}
      >
        {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
        Accept Quotation
      </Button>
    </div>
  )
}
