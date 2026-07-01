"use client"
import { useState, useTransition } from "react"
import { saveBankDetails } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Building2, CheckCircle2 } from "lucide-react"

export default function BankSettingsForm({ banks, business }: { banks: any[], business: any }) {
  const [isPending, startTransition] = useTransition()
  const hasBankSetup = !!business?.flutterwave_subaccount_id

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const res = await saveBankDetails(formData)
        if (res?.success) {
          toast.success(`Bank verified as: ${res.accountName}`)
          toast.success("Subaccount successfully created! Ready to receive payments.")
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to setup bank account")
      }
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Bank Details</h2>
            <p className="text-sm text-muted-foreground">Where should we send your money when an invoice is paid?</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {hasBankSetup ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-green-50/50 rounded-xl border border-green-100">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Payout Account Configured</h3>
            <p className="text-slate-600 max-w-sm mb-4">
              Your payments are automatically routed to your <strong>{business.bank_name}</strong> account ending in <strong>{business.account_number.slice(-4)}</strong>.
            </p>
            <p className="text-xs text-slate-400">
              To change your payout account, please <a href="mailto:247billzsupport@gmail.com" className="text-primary hover:underline font-medium">contact support</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="bankCode">Select Bank</Label>
              <select 
                id="bankCode" 
                name="bankCode" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a Nigerian Bank...</option>
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>{bank.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input 
                id="accountNumber" 
                name="accountNumber" 
                type="text" 
                maxLength={10} 
                pattern="\d{10}"
                placeholder="0123456789" 
                required 
              />
              <p className="text-xs text-muted-foreground mt-1">Must be 10 digits. The name on the account must closely match your Name or Business Name.</p>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isPending}>
              {isPending ? "Verifying Account & Setting Up..." : "Verify & Save Bank Details"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
