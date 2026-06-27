"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { confirmCashPayment } from "@/app/actions/payment"
import { formatCurrency } from "@/lib/currency"

interface CashPaymentModalProps {
  invoiceId: string
  invoiceNumber: string
  total: number
  currency: string
}

export function CashPaymentModal({ invoiceId, invoiceNumber, total, currency }: CashPaymentModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" size="sm" className="h-8">
          Mark Paid
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Confirm Cash Payment</DialogTitle>
          <DialogDescription>
            Record a cash payment for invoice {invoiceNumber}. This will create a payment record, update the invoice status, and save an audit event.
          </DialogDescription>
        </DialogHeader>

        <form action={confirmCashPayment} className="space-y-4 pt-4">
          <input type="hidden" name="invoice_id" value={invoiceId} />

          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-sm text-slate-500">Total amount to record</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(total, currency)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Payment note</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="E.g. Received cash at the storefront, teller #123"
              className="resize-none"
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
              Confirm Cash Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
