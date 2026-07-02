"use client"
import { useState, useTransition } from "react"
import { saveBankDetails } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { Building2, CheckCircle2 } from "lucide-react"

type Feedback = {
  message: string
  variant: "default" | "destructive" | "success"
} | null

export default function BankSettingsForm({ banks, business }: { banks: any[], business: any }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [localBusiness, setLocalBusiness] = useState<any>(business)
  const [isEditing, setIsEditing] = useState(false)
  const hasBankSetup = !!localBusiness?.flutterwave_subaccount_id && !isEditing

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setFeedback(null)

    startTransition(async () => {
      try {
        const res = await saveBankDetails(formData)
        if (res?.success) {
          const message = `Bank verified as: ${res.accountName}. Subaccount successfully created!`
          setLocalBusiness((prev: any) => ({
            ...(prev || {}),
            flutterwave_subaccount_id: res.subaccountId,
            bank_name: res.bankName,
            account_number: res.accountNumber,
          }))
          setIsEditing(false)
          setFeedback({ message, variant: "success" })
          toast.success(message)
          return
        }

        const errorMessage = res?.error || "Failed to setup bank account"
        setFeedback({ message: errorMessage, variant: "destructive" })
        toast.error(errorMessage)
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to setup bank account"
        setFeedback({ message: errorMessage, variant: "destructive" })
        toast.error(errorMessage)
      }
    })
  }

  const validBanks = banks.filter((bank) => /^[0-9]+$/.test(String(bank.code)))

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
            <p className="text-slate-600 max-w-sm mb-6">
              Your payments are automatically routed to your <strong>{localBusiness.bank_name}</strong> account ending in <strong>{localBusiness.account_number?.slice(-4)}</strong>.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
            >
              Change Bank Details
            </Button>
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
                {validBanks.map((bank) => (
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

            <div className="flex gap-3">
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? "Verifying..." : "Verify & Save Bank Details"}
              </Button>
              {!!localBusiness?.flutterwave_subaccount_id && (
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>

            {feedback ? (
              <Alert variant={feedback.variant} className="mt-4">
                {feedback.message}
              </Alert>
            ) : null}
          </form>
        )}
      </div>
    </div>
  )
}
