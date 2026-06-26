"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function PaymentSuccessBanner({ isSuccess }: { isSuccess: boolean }) {
  const [visible, setVisible] = useState(isSuccess)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isSuccess) {
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false)
        // Clean up URL so refresh doesn't trigger it again
        router.replace(pathname, { scroll: false })
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isSuccess, router, pathname])

  if (!visible) return null

  return (
    <div className="w-full max-w-4xl mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <p className="font-medium">Payment Successful! Thank you for your payment.</p>
      </div>
      <button 
        onClick={() => {
          setVisible(false)
          router.replace(pathname, { scroll: false })
        }} 
        className="p-1 hover:bg-green-100 rounded-md transition-colors text-green-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
