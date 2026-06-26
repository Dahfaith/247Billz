"use client"

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
    >
      Print or Save PDF
    </button>
  )
}
