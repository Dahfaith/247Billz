"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Share2 } from "lucide-react"
import { toast } from "sonner"

interface ShareButtonProps {
  url: string
}

export default function ShareButton({ url }: ShareButtonProps) {
  const [isWorking, setIsWorking] = useState(false)

  const handleShare = async () => {
    setIsWorking(true)
    try {
      if (navigator.share) {
        await navigator.share({ url })
        toast.success("Shared successfully")
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard")
      } else {
        // Fallback: select a hidden input
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.value = url
        input.select()
        document.execCommand('copy')
        input.remove()
        toast.success("Link copied to clipboard")
      }
    } catch (err) {
      console.error('Share error', err)
      toast.error('Failed to share link')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <Button onClick={handleShare} variant="outline" className="gap-2">
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  )
}
