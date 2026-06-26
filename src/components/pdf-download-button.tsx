"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { toast } from "sonner"

interface PdfDownloadButtonProps {
  targetId: string
  fileName: string
}

export default function PdfDownloadButton({ targetId, fileName }: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    const element = document.getElementById(targetId)
    if (!element) {
      toast.error("Document not found to convert")
      return
    }

    try {
      setIsGenerating(true)
      
      // Force a standard width (800px) so the layout doesn't get squeezed or look tiny on wide screens
      const originalWidth = element.style.width
      const originalMaxWidth = element.style.maxWidth
      
      element.style.width = '800px'
      element.style.maxWidth = '800px'

      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 800 // Trick html2canvas into thinking the window is 800px wide
      })

      // Restore styles immediately after capture
      element.style.width = originalWidth
      element.style.maxWidth = originalMaxWidth

      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${fileName}.pdf`)
      
      toast.success("PDF Downloaded successfully!")
    } catch (error) {
      console.error("PDF generation error:", error)
      toast.error("Failed to generate PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      onClick={handleDownload} 
      variant="outline" 
      disabled={isGenerating}
      className="gap-2"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Download PDF
    </Button>
  )
}
