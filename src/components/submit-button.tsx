'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'

export function SubmitButton({ 
  className, 
  text = "Save Configuration",
  icon = <Save className="w-4 h-4 mr-2" />
}: { 
  className?: string, 
  text?: string,
  icon?: React.ReactNode
}) {
  const { pending } = useFormStatus()

  return (
    <Button 
      type="submit" 
      size="lg" 
      disabled={pending}
      className={className || "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
        </>
      ) : (
        <>
          {icon} {text}
        </>
      )}
    </Button>
  )
}
