"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface AutoCloseBannerProps {
  message: string
  type?: "success" | "error" | "info"
  duration?: number
}

export function AutoCloseBanner({ message, type = "success", duration = 5000 }: AutoCloseBannerProps) {
  const [visible, setVisible] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Auto-hide after duration
    const timer = setTimeout(() => {
      setVisible(false)
      // Clean up URL so refresh doesn't trigger it again (if based on query params)
      router.replace(pathname, { scroll: false })
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, router, pathname])

  if (!visible) return null

  const bgColors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-purple-50 border-purple-200 text-purple-800",
  }

  return (
    <div className={`w-full max-w-4xl mb-6 border rounded-xl p-4 flex items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 ${bgColors[type]}`}>
      <div className="flex items-center gap-3">
        <p className="font-medium text-center flex-1">{message}</p>
      </div>
      <button 
        onClick={() => {
          setVisible(false)
          router.replace(pathname, { scroll: false })
        }} 
        className="p-1 hover:bg-black/5 rounded-md transition-colors opacity-70 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
