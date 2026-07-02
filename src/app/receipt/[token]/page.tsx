import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AdvancedQRCode } from "@/components/advanced-qr-code";
import { CheckCircle2 } from "lucide-react";
import { PrintButton } from "@/components/print-button";

export default async function PublicReceiptPage({ 
  params,
}: { 
  params: Promise<{ token: string }>,
}) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  const supabase = await createClient();

  // 1. Fetch Invoice
  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      business:businesses(*),
      client:clients(*)
    `)
    .eq('secure_token', token)
    .single();

  if (!invoice || invoice.status !== 'paid') {
    notFound();
  }

  // 2. Fetch Invoice Items
  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoice.id);

  if (!items) {
    notFound();
  }

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const discountRate = Number(invoice.discount_rate) || 0;
  const discountAmount = subtotal * (discountRate / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  const taxRate = Number(invoice.tax_rate) || 0;
  const tax = subtotalAfterDiscount * (taxRate / 100);
  const total = subtotalAfterDiscount + tax;

  const receiptNumber = `RCPT-${invoice.invoice_number.replace('INV-', '')}`;

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-8 flex flex-col items-center">
      
      {/* The Receipt Paper */}
      <div className="bg-white text-slate-900 rounded-xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col relative print:shadow-none print:w-full print:h-auto border border-slate-200">
        
        {/* Paid Watermark (CSS only) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 text-[150px] font-black text-green-500 opacity-5 pointer-events-none select-none z-0">
          PAID
        </div>

        {/* Header Banner */}
        <div className="h-4 bg-green-500 w-full absolute top-0 left-0" />
        
        <div className="p-8 sm:p-12 md:p-16 flex-1 flex flex-col mt-4 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-12 gap-8">
            <div>
              <div className="w-16 h-16 rounded-xl bg-green-500 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-sm">
                {invoice.business.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">OFFICIAL RECEIPT</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">#{receiptNumber}</p>
            </div>
            <div className="sm:text-right flex flex-col sm:items-end gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{invoice.business.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{invoice.business.email}</p>
                {invoice.business.phone && <p className="text-sm text-slate-500">{invoice.business.phone}</p>}
                {invoice.business.address && <p className="text-sm text-slate-500">{invoice.business.address}</p>}
              </div>
              <AdvancedQRCode 
                url={`https://247billz.com/receipt/${token}`} 
                businessName={invoice.business?.name} 
                logoUrl={invoice.business?.logo_url} 
                color="#0f172a"
                size={80} 
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between mb-12 gap-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Received From</h4>
              <p className="font-semibold text-slate-900 text-lg">{invoice.client.name}</p>
              {invoice.client.email && <p className="text-sm text-slate-500">{invoice.client.email}</p>}
              {invoice.client.company && <p className="text-sm text-slate-500">{invoice.client.company}</p>}
              {invoice.client.phone && <p className="text-sm text-slate-500">{invoice.client.phone}</p>}
            </div>
            <div className="sm:text-right flex gap-12">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Payment Date</h4>
                {/* We use invoice issue date as fallback, but ideally we'd show the 'paid_at' date. */}
                <p className="font-medium text-slate-900">{invoice.issue_date}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Original Inv.</h4>
                <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 mt-8">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-slate-200">
                    <th className="py-4 font-semibold text-slate-900">Description</th>
                    <th className="py-4 font-semibold text-slate-900 text-center px-4">Qty</th>
                    <th className="py-4 font-semibold text-slate-900 text-right px-4">Price</th>
                    <th className="py-4 font-semibold text-slate-900 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-5 text-slate-700 max-w-[300px] break-words">{item.description}</td>
                      <td className="py-5 text-slate-700 text-center px-4">{item.quantity}</td>
                      <td className="py-5 text-slate-700 text-right px-4">₦{item.price.toLocaleString()}</td>
                      <td className="py-5 text-slate-900 font-medium text-right">₦{(item.quantity * item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="block sm:hidden space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 pb-2">Items</h4>
              {items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div className="pr-4">
                    <p className="font-semibold text-slate-900 text-sm">{item.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.quantity} x ₦{item.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                    ₦{(item.quantity * item.price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row justify-between items-end gap-8">
            <div className="w-full sm:w-1/2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-700 text-lg">PAID IN FULL</h3>
                <p className="text-sm text-green-600/80">Thank you for your payment</p>
              </div>
            </div>
            <div className="w-full sm:w-1/2 space-y-3">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              {discountRate > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Discount ({discountRate}%)</span>
                  <span>- ₦{discountAmount.toLocaleString()}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Tax ({taxRate}%)</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold text-slate-900 pt-4 border-t border-slate-200">
                <span>Amount Paid</span>
                <span className="text-green-600">₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-900 mb-1">Keep this receipt for your records.</p>
            <p className="text-xs text-slate-500">Generated by {invoice.business.name} using 247Billz.</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
