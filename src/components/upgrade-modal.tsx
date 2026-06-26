"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Zap } from "lucide-react";

export function UpgradeModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgrade") === "true") {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchParams]);

  const closeModal = () => {
    setIsOpen(false);
    // Remove the ?upgrade=true from the URL without triggering a full reload
    const params = new URLSearchParams(searchParams.toString());
    params.delete("upgrade");
    const newUrl = pathname + (params.toString() ? `?${params.toString()}` : "");
    router.replace(newUrl, { scroll: false });
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl bg-white">
        
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 h-32 w-full flex items-center justify-center relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30 relative z-10 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="p-6 pt-8 text-center space-y-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center tracking-tight text-slate-900">
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 font-medium">
              You've reached your free plan limit. Unlock unlimited potential for your business today.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-3 mt-4">
             <div className="flex items-center gap-3">
               <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
               <span className="text-sm font-medium text-slate-700">Unlimited Invoices & Quotations</span>
             </div>
             <div className="flex items-center gap-3">
               <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
               <span className="text-sm font-medium text-slate-700">Custom Branding & Colors</span>
             </div>
             <div className="flex items-center gap-3">
               <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
               <span className="text-sm font-medium text-slate-700">Advanced Analytics & Reports</span>
             </div>
             <div className="flex items-center gap-3">
               <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
               <span className="text-sm font-medium text-slate-700">Priority Support</span>
             </div>
          </div>

          <div className="pt-4 pb-2">
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg py-6 text-base group"
              onClick={() => {
                closeModal();
                router.push("/dashboard/billing");
              }}
            >
              <Zap className="w-5 h-5 mr-2 text-yellow-400 group-hover:scale-110 transition-transform" />
              View Upgrade Options
            </Button>
            <button 
              onClick={closeModal}
              className="mt-4 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Maybe later, I'll stay on the free plan
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
