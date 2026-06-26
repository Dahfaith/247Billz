"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { sendInvoiceEmail, sendQuotationEmail } from "@/app/actions/email";

export function SendEmailButton({ targetId, clientEmail, type = 'invoice' }: { targetId: string, clientEmail?: string, type?: 'invoice' | 'quotation' }) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!clientEmail) {
      toast.error("This client does not have an email address.");
      return;
    }
    
    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    try {
      const result = type === 'invoice' 
        ? await sendInvoiceEmail(targetId)
        : await sendQuotationEmail(targetId);
      if (result.success) {
        setIsSuccess(true);
        if (result.mocked) {
          toast.info("Invoice Sent (Mock Mode)", { 
            description: "No API key provided. Check server console for content." 
          });
        } else {
          toast.success("Invoice Sent Successfully!");
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to send email");
      toast.error(e.message || "Failed to send email");
    } finally {
      setIsPending(false);
      
      // Reset success state after 3 seconds
      if (!error) {
        setTimeout(() => setIsSuccess(false), 3000);
      }
    }
  };

  if (isSuccess) {
    return (
      <Button variant="outline" size="sm" className="text-green-600 border-green-200 bg-green-50" disabled>
        <Check className="w-4 h-4 mr-2" />
        Sent
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSend} 
      disabled={isPending || !clientEmail}
      title={clientEmail ? `Send to ${clientEmail}` : "Client has no email"}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Mail className="w-4 h-4 mr-2" />
          Send
        </>
      )}
    </Button>
  );
}
