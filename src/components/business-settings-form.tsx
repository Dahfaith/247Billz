"use client"
import { useState, useTransition } from "react"
import { updateBusinessProfile } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Store, Loader2, Upload, Lock } from "lucide-react"
import Link from "next/link"
import { CURRENCIES } from "@/lib/currency"

export default function BusinessSettingsForm({ business }: { business: any }) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const res = await updateBusinessProfile(formData)
        if (res?.success) {
          toast.success("Business profile updated successfully.")
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to update business profile")
      }
    })
  }

  const [logoPreview, setLogoPreview] = useState<string | null>(business?.logo_url || null)
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be smaller than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const currentTier = business?.subscription_tier || 'free'
  const canUploadLogo = currentTier === 'pro' || currentTier === 'business'

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Business Profile</h2>
            <p className="text-sm text-muted-foreground">Manage your business details shown on invoices.</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          
          {/* Custom Logo Section */}
          <div className="space-y-3 pb-6 border-b border-border">
            <Label>Custom Logo</Label>
            
            {canUploadLogo ? (
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden relative group shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Store className="w-8 h-8 text-muted-foreground opacity-50" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                     <Upload className="w-6 h-6 text-white" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleLogoChange}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Upload your brand logo</p>
                  <p>PNG, JPG up to 2MB. This will replace the 247Billz watermark on your invoices.</p>
                </div>
                {/* Hidden input to pass base64 to server action */}
                <input type="hidden" name="logo_url" value={logoPreview || ""} />
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Pro Feature</h4>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">Upgrade to the Pro or Business plan to upload a custom logo and remove the 247Billz watermark from your invoices.</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/billing">Upgrade Plan</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Business Name <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={business?.name || ""} 
                placeholder="Acme Corp" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                defaultValue={business?.email || ""} 
                placeholder="contact@acme.com" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel"
                defaultValue={business?.phone || ""} 
                placeholder="+234..." 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <select
                id="currency"
                name="currency"
                defaultValue={business?.currency || "NGN"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea 
                id="address" 
                name="address" 
                defaultValue={business?.address || ""} 
                placeholder="123 Main St..." 
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white" disabled={isPending}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  )
}
