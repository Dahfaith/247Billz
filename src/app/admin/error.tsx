'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin Error Boundary caught:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Something went wrong!
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        {error.message || "An unexpected error occurred while processing your request. Please try again or contact support if the issue persists."}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => reset()} 
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try again
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/admin'}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  )
}
