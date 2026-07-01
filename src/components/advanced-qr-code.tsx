"use client";

import { useRef, useState } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdvancedQRCodeProps {
  url: string;
  businessName?: string;
  logoUrl?: string;
  color?: string;
  size?: number;
  className?: string;
}

export function AdvancedQRCode({
  url,
  businessName = "Business",
  logoUrl,
  color = "#000000",
  size = 120,
  className = "",
}: AdvancedQRCodeProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const downloadQRCode = () => {
    // To download the QR code as a high-quality PNG, we need to grab the canvas element
    const canvas = document.getElementById(`qr-canvas-${url}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${businessName.replace(/\s+/g, "_")}_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // The actual QR code settings
  const qrSettings = {
    value: url,
    size: size,
    level: "H", // High error correction to allow for logos
    fgColor: color,
    ...(logoUrl
      ? {
          imageSettings: {
            src: logoUrl,
            height: size * 0.25,
            width: size * 0.25,
            excavate: true,
          },
        }
      : {}),
  };

  return (
    <div className={className}>
      {/* Desktop/Tablet View (Visible on sm and up) */}
      <div className="hidden sm:flex flex-col items-center p-2 bg-white rounded-lg border border-slate-200 shadow-sm relative group">
        <QRCodeSVG {...qrSettings as any} />
        <p className="text-[10px] text-center text-slate-500 mt-2 uppercase font-bold tracking-widest">
          Scan to Pay
        </p>
        
        {/* Hover Overlay for Download */}
        <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 rounded-full text-xs"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(true);
            }}
          >
            <Download className="w-3 h-3 mr-1" /> Save
          </Button>
        </div>
      </div>

      {/* Mobile View (Button triggering a Modal) */}
      <div className="sm:hidden block">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full bg-white flex items-center gap-2 border-slate-200 shadow-sm"
          onClick={() => setIsOpen(true)}
        >
          <QrCode className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold">Storefront QR</span>
        </Button>
      </div>

      {/* Download / Display Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Storefront QR Code</DialogTitle>
            <DialogDescription className="text-center">
              Print this QR code or show it to your clients. When scanned, it instantly opens the payment portal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100 my-4">
            {/* We render a hidden canvas specifically for downloading a high-res version */}
            <div className="hidden">
              <QRCodeCanvas id={`qr-canvas-${url}`} {...qrSettings as any} size={500} />
            </div>
            
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
              <QRCodeSVG {...qrSettings as any} size={200} />
            </div>
            <p className="font-semibold mt-4 text-slate-800">{businessName}</p>
            <p className="text-sm text-slate-500">Scan with any smartphone camera</p>
          </div>
          
          <div className="flex justify-center w-full">
            <Button 
              className="w-full sm:w-auto px-8" 
              size="lg" 
              onClick={downloadQRCode}
            >
              <Download className="w-4 h-4 mr-2" />
              Download High-Res PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
