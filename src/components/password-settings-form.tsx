"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Loader2 } from "lucide-react"
import { updateUserPassword } from "@/app/actions/auth"
import { toast } from "sonner"

export default function PasswordSettingsForm() {
  const [loading, setLoading] = useState(false)

  async function handlePasswordUpdate(formData: FormData) {
    setLoading(true)
    const res = await updateUserPassword(formData)
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Password updated successfully!")
      // Clear the form
      const form = document.getElementById('password-form') as HTMLFormElement
      if (form) form.reset()
    }
  }

  return (
    <Card className="bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <CardTitle>Security</CardTitle>
        </div>
        <CardDescription>Update your password to keep your account secure.</CardDescription>
      </CardHeader>
      <form id="password-form" action={handlePasswordUpdate}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} placeholder="Min 6 characters" className="max-w-md" />
          </div>
          <input type="hidden" name="redirectUrl" value="" />
        </CardContent>
        <CardFooter className="border-t border-[#E2E8F0] dark:border-slate-800 pt-6">
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Update Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
