import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { updateUserPassword } from "@/app/actions/auth";

import { redirect } from "next/navigation";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const resolvedParams = await searchParams;

  async function handleReset(formData: FormData) {
    "use server"
    const res = await updateUserPassword(formData)
    if (res?.error) {
      redirect(`/reset-password?message=${res.error}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
      {/* Left Pane - Form */}
      <div className="flex-1 flex flex-col px-8 sm:px-16 lg:px-24 py-8 relative bg-background overflow-y-auto">
        <div className="mb-auto pb-8">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto py-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">2</div>
            <span className="text-xl font-bold tracking-tight">247Billz</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Set New Password</h1>
          <p className="text-muted-foreground mb-6">Please enter your new password below.</p>

          {resolvedParams?.message && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-6 font-medium">
              {resolvedParams.message}
            </div>
          )}

          <form action={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            
            <input type="hidden" name="redirectUrl" value="/login?message=Password updated successfully. Please log in." />

            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 h-11 text-base mt-2">
              Update Password
            </Button>
          </form>
        </div>
      </div>

      {/* Right Pane - Feature Showcase */}
      <div className="flex-1 flex flex-col justify-between bg-secondary p-8 lg:p-12 text-white relative overflow-hidden min-h-[500px] lg:min-h-0 hidden lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-[0.03] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-lg mt-auto mb-12">
          <h2 className="text-4xl font-bold mb-6">Secure your business.</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="text-lg text-slate-300">Bank-grade security protocols.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
