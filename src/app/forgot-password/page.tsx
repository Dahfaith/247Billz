"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { sendPasswordResetEmail } from "@/app/actions/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      
      const res = await sendPasswordResetEmail(formData);
      
      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success) {
        toast.success("If that email is registered, a reset link has been sent.");
        setEmail(""); // clear input
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

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

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Reset Password</h1>
          <p className="text-muted-foreground mb-6">Enter your email address and we will send you a link to reset your password.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="name@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90 h-11 text-base mt-2 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Send Reset Link
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
