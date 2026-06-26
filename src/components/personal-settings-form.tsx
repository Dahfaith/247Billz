"use client"
import { useTransition } from "react"
import { updatePersonalProfile } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { User, Loader2 } from "lucide-react"

export default function PersonalSettingsForm({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const res = await updatePersonalProfile(formData)
        if (res?.success) {
          toast.success("Personal profile updated successfully.")
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to update personal profile")
      }
    })
  }

  const fullName = user?.user_metadata?.full_name || ""

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Personal Account</h2>
            <p className="text-sm text-muted-foreground">Manage your personal details and login email.</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
              <Input 
                id="full_name" 
                name="full_name" 
                defaultValue={fullName} 
                placeholder="John Doe" 
                required 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your personal name. This must match the name on your bank account for verification.
              </p>
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Login Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                defaultValue={user?.email || ""} 
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your login email cannot be changed from this dashboard.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Personal Details"}
          </Button>
        </form>
      </div>
    </div>
  )
}
