import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AdvancedQRCode } from "@/components/advanced-qr-code";
import { initiatePayment } from "@/app/actions/payment";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { PaymentSuccessBanner } from "@/components/payment-success-banner";
import PdfDownloadButton from "@/components/pdf-download-button";
import ShareButton from "@/components/share-button";
import WhatsAppButton from "@/components/whatsapp-button";
import { formatCurrency } from "@/lib/currency";

export default async function PublicInvoicePage({ 
  params,
  searchParams
}: { 
  params: Promise<{ token: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  const resolvedSearch = await searchParams;
  const isSuccess = resolvedSearch.payment === 'success';
  const supabase = await createClient();

  // 1. Fetch Invoice by short_token first, fallback to secure_token
  let { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      business:businesses(*),
      client:clients(*)
    `)
    .eq('short_token', token)
    .maybeSingle();

  if (!invoice) {
    const res = await supabase
      .from('invoices')
      .select(`
        *,
        business:businesses(*),
        client:clients(*)
      `)
      .eq('secure_token', token)
      .single();
    invoice = res.data
  }

  if (!invoice) {
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
  const tax = subtotal * (invoice.tax_rate / 100);
  const total = subtotal + tax;

  const isProOrBusiness = invoice.business?.subscription_tier === 'pro' || invoice.business?.subscription_tier === 'business';
  const showLogo = isProOrBusiness && invoice.business?.logo_url;

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-8 flex flex-col items-center">
      <PaymentSuccessBanner isSuccess={isSuccess} />
      
      <div className="w-full max-w-4xl flex justify-end mb-4 print:hidden">
        <div className="flex gap-2">
          <PdfDownloadButton targetId="invoice-document" fileName={`Invoice_${invoice.invoice_number}`} />
          <WhatsAppButton 
            url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invoice/${token}`} 
            type="invoice" 
            amount={formatCurrency(total, invoice.currency)}
            clientName={invoice.client?.name}
          />
          <ShareButton url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invoice/${token}`} />
        </div>
      </div>

      {/* The Invoice Paper */}
      <div id="invoice-document" className="bg-white text-slate-900 rounded-xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col relative print:shadow-none print:w-full print:h-auto">
        {/* Header Banner */}
        <div className="h-4 bg-primary w-full absolute top-0 left-0" />
        
        <div className="p-8 sm:p-12 md:p-16 flex-1 flex flex-col mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-12 gap-8">
            <div>
              {showLogo ? (
                <div className="h-16 mb-4 flex items-end">
                  <img src={invoice.business.logo_url} alt="Business Logo" className="h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-sm">
                  {(invoice.business?.name || "B").charAt(0).toUpperCase()}
                </div>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">INVOICE</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">#{invoice.invoice_number}</p>
            </div>
            <div className="sm:text-right flex flex-col sm:items-end gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{invoice.business?.name || "Business Name"}</h3>
                <p className="text-sm text-slate-500 mt-1">{invoice.business?.email}</p>
                {invoice.business?.phone && <p className="text-sm text-slate-500">{invoice.business.phone}</p>}
                {invoice.business?.address && <p className="text-sm text-slate-500">{invoice.business.address}</p>}
              </div>
              <AdvancedQRCode 
                url={`https://247billz.com/invoice/${token}`} 
                businessName={invoice.business?.name} 
                logoUrl={invoice.business?.logo_url} 
                size={80} 
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between mb-12 gap-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Bill To</h4>
              <p className="font-semibold text-slate-900 text-lg">{invoice.client?.name || "Client"}</p>
              {invoice.client?.email && <p className="text-sm text-slate-500">{invoice.client.email}</p>}
              {invoice.client?.company && <p className="text-sm text-slate-500">{invoice.client.company}</p>}
              {invoice.client?.phone && <p className="text-sm text-slate-500">{invoice.client.phone}</p>}
            </div>
            <div className="sm:text-right flex gap-12">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Issue Date</h4>
                <p className="font-medium text-slate-900">{invoice.issue_date}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Due Date</h4>
                <p className="font-medium text-slate-900">{invoice.due_date}</p>
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
                      <td className="py-5 text-slate-700 text-right px-4">{formatCurrency(item.price, invoice.currency)}</td>
                      <td className="py-5 text-slate-900 font-medium text-right">{formatCurrency(item.quantity * item.price, invoice.currency)}</td>
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
                    <p className="text-xs text-slate-500 mt-1">{item.quantity} x {formatCurrency(item.price, invoice.currency)}</p>
                  </div>
                  <div className="text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                    {formatCurrency(item.quantity * item.price, invoice.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row justify-between items-end gap-8">
            <div className="w-full sm:w-1/2 print:hidden">
              {invoice.status === 'paid' ? (
                <div className="w-full sm:w-auto px-8 py-4 bg-green-500 text-white rounded-xl font-bold shadow-lg flex justify-center items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  PAID IN FULL
                </div>
              ) : (
                <form action={async () => {
                  "use server";
                  await initiatePayment(token);
                }}>
                  <button type="submit" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                    Pay {formatCurrency(total, invoice.currency)} Now
                  </button>
                </form>
              )}
            </div>
            <div className="w-full sm:w-1/2 space-y-3">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, invoice.currency)}</span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Tax ({invoice.tax_rate}%)</span>
                  <span>{formatCurrency(tax, invoice.currency)}</span>
                </div>
              )}
              {invoice.discount_rate > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Discount</span>
                  <span>- {formatCurrency(subtotal * (invoice.discount_rate/100), invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold text-slate-900 pt-4 border-t border-slate-200">
                <span>Total Due</span>
                <span className="text-primary">{formatCurrency(total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-900 mb-1">Thank you for your business!</p>
            {invoice.status === 'paid' ? (
              <p className="text-xs text-slate-500 font-medium text-green-600">This invoice has been paid in full.</p>
            ) : (
              <p className="text-xs text-slate-500">
                Payment is due by {invoice.due_date} 
                {invoice.issue_date && invoice.due_date && (
                  <span className="font-medium text-slate-600 ml-1">
                    ({Math.ceil((new Date(invoice.due_date).getTime() - new Date(invoice.issue_date).getTime()) / (1000 * 60 * 60 * 24)) === 0 
                      ? "today" 
                      : Math.ceil((new Date(invoice.due_date).getTime() - new Date(invoice.issue_date).getTime()) / (1000 * 60 * 60 * 24)) > 0
                        ? `in ${Math.ceil((new Date(invoice.due_date).getTime() - new Date(invoice.issue_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                        : `${Math.abs(Math.ceil((new Date(invoice.due_date).getTime() - new Date(invoice.issue_date).getTime()) / (1000 * 60 * 60 * 24)))} days ago`})
                  </span>
                )}
                . Please make checks payable to {invoice.business?.name || "the business owner"}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
