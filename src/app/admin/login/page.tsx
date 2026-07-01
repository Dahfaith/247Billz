'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, ArrowRight, Loader2, KeyRound } from 'lucide-react'
import { sendAdminOtp, verifyAdminOtp } from '@/app/actions/auth'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await sendAdminOtp(email)
      if (res.success) {
        toast.success("Security code sent to your email!")
        setStep('code')
      } else {
        toast.error(res.error || "Failed to send code.")
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await verifyAdminOtp(email, code)
      if (res && res.success === false) {
        toast.error(res.error || "Invalid code.")
        setLoading(false)
      }
      // If success, it redirects automatically via the server action
    } catch (err: any) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 bg-slate-950">
      
      {/* Left Pane - Form */}
      <div className="flex-1 flex flex-col px-8 sm:px-16 lg:px-24 py-8 relative z-10 overflow-y-auto">
        
        <div className="mb-auto pb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
            ← Back to main website
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto py-8">
          
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-lg">
               <Shield className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Admin Portal</span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {step === 'email' ? 'Welcome back' : 'Check your email'}
          </h1>
          <p className="text-slate-400 mb-8">
            {step === 'email' 
              ? 'Secure passwordless authentication for system administrators.' 
              : `We sent a 6-digit security code to ${email}.`}
          </p>

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Master Admin Email</label>
                <Input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@company.com" 
                  className="bg-slate-900 border-slate-800 text-white h-12 focus-visible:ring-orange-500"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium text-base mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Send Security Code <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Security Code</label>
                <Input 
                  type="text" 
                  required 
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="000000" 
                  className="bg-slate-900 border-slate-800 text-white h-14 text-center text-2xl tracking-[0.5em] font-mono focus-visible:ring-orange-500"
                />
              </div>
              
              <Button type="submit" disabled={loading || code.length !== 6} className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium text-base">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
              </Button>
              
              <div className="text-center mt-6">
                <button 
                  type="button" 
                  onClick={() => setStep('email')} 
                  className="text-sm text-slate-500 hover:text-white transition-colors"
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Pane - Feature Showcase */}
      <div className="flex-1 flex flex-col justify-between bg-slate-900 border-l border-slate-800 p-8 lg:p-12 text-white relative overflow-hidden min-h-[500px] lg:min-h-0 hidden lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] opacity-[0.2] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-lg mt-auto mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 mb-6 border border-orange-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-4xl font-bold mb-6 text-white leading-tight">Command Center.</h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Access real-time analytics, manage user subscriptions, and oversee global platform operations securely.
          </p>
        </div>
      </div>

    </div>
  )
}
