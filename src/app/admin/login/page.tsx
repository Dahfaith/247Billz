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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-orange-500/30">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] opacity-[0.2] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Shield className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400 text-sm">Secure passwordless authentication.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Master Admin Email</label>
                <Input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@company.com" 
                  className="bg-slate-950 border-slate-800 text-white h-12"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium text-base">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Send Security Code <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <p className="text-slate-300 text-sm">
                  We sent a 6-digit code to <span className="text-white font-semibold">{email}</span>.
                </p>
              </div>
              
              <div className="space-y-2">
                <Input 
                  type="text" 
                  required 
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="000000" 
                  className="bg-slate-950 border-slate-800 text-white h-14 text-center text-2xl tracking-[0.5em] font-mono"
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
        
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-slate-500 hover:text-white transition-colors">
            ← Back to main website
          </Link>
        </div>
      </div>
    </div>
  )
}
