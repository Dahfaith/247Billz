"use client";

import { useState } from "react";
import { initiatePayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";

export function CheckoutButton({ 
  token, 
  total, 
  currency 
}: { 
  token: string; 
  total: number; 
  currency: string; 
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await initiatePayment(token);
      
      if (res?.error) {
        router.push(`/invoice/${token}?error=${encodeURIComponent(res.error)}`);
        setLoading(false);
      } else if (res?.redirectUrl) {
        // Safe external redirect
        window.location.href = res.redirectUrl;
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePay} 
      disabled={loading}
      className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? "Processing..." : `Pay ${formatCurrency(total, currency)} Now`}
    </button>
  );
}
