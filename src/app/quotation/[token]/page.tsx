import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { QuotationActions } from "@/components/quotation-actions"
import PdfDownloadButton from "@/components/pdf-download-button"
import ShareButton from "@/components/share-button"
import { AutoCloseBanner } from "@/components/auto-close-banner"
import { formatCurrency } from "@/lib/currency"

export default async function PublicQuotationPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Find the quotation using short_token first, fallback to secure_token
  let { data: quote } = await supabase
    .from('quotations')
    .select(`
      *,
      business:businesses(*),
      client:clients(*),
      items:quotation_items(*)
    `)
    .eq('short_token', resolvedParams.token)
    .maybeSingle()

  if (!quote) {
    const res = await supabase
      .from('quotations')
      .select(`
        *,
        business:businesses(*),
        client:clients(*),
        items:quotation_items(*)
      `)
      .eq('secure_token', resolvedParams.token)
      .single()
    quote = res.data
  }

  if (!quote) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id && quote.business?.owner_id ? user.id === quote.business.owner_id : false

  const subtotal = quote.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0) || 0;
  const tax = subtotal * (quote.tax_rate / 100);
  const total = subtotal + tax;

  const isProOrBusiness = quote.business?.subscription_tier === 'pro' || quote.business?.subscription_tier === 'business';
  const showLogo = isProOrBusiness && quote.business?.logo_url;

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-8 flex flex-col items-center">
      
      {/* Banner depending on status */}
      {quote.status === 'accepted' && (
        <AutoCloseBanner message="This quotation has been officially accepted." type="success" />
      )}
      {quote.status === 'declined' && (
        <AutoCloseBanner message="This quotation was declined." type="error" />
      )}
      {quote.status === 'converted' && (
        <AutoCloseBanner message="This quotation was converted into an invoice." type="info" />
      )}

      <div className="w-full max-w-4xl flex justify-end mb-4 print:hidden">
        <div className="flex gap-2">
          <PdfDownloadButton targetId="quotation-document" fileName={`Quotation_${quote.quotation_number}`} />
          <ShareButton url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/quotation/${quote.secure_token}`} />
        </div>
      </div>

      <div id="quotation-document" className="w-full max-w-4xl bg-card border border-border shadow-xl rounded-2xl overflow-hidden print:shadow-none print:border-none">
        
        {/* Header Section */}
        <div className="p-8 sm:p-12 border-b border-border bg-slate-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
            <div>
              {showLogo ? (
                <img src={quote.business.logo_url} alt={quote.business?.name || "Business"} className="h-16 mb-4 object-contain" />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl mb-4">
                  {(quote.business?.name || "B").substring(0, 2).toUpperCase()}
                </div>
              )}
              <h1 className="text-2xl font-bold text-slate-900">{quote.business?.name || "Business Name"}</h1>
              {quote.business?.email && <p className="text-slate-500">{quote.business.email}</p>}
              {quote.business?.phone && <p className="text-slate-500">{quote.business.phone}</p>}
            </div>

            <div className="sm:text-right">
              <h2 className="text-4xl font-black text-slate-200 tracking-tight mb-2 uppercase">ESTIMATE</h2>
              <p className="text-lg font-bold text-slate-900">#{quote.quotation_number}</p>
              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:flex sm:flex-col sm:gap-1">
                <div className="flex justify-between sm:justify-end gap-4">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-medium text-slate-900">{quote.issue_date}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-4">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="font-medium text-slate-900">{quote.valid_until}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Content Section */}
        <div className="p-8 sm:p-12 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Prepared For</h3>
            <div className="font-bold text-lg text-slate-900">{quote.client?.name || "Client"}</div>
            {quote.client?.company && <div className="text-slate-700">{quote.client.company}</div>}
            {quote.client?.email && <div className="text-slate-500">{quote.client.email}</div>}
            {quote.client?.phone && <div className="text-slate-500">{quote.client.phone}</div>}
            {quote.client?.address && <div className="text-slate-500">{quote.client.address}</div>}
          </div>

          <div className="flex-1 mt-8">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 font-semibold text-slate-900">Description</th>
                    <th className="py-3 font-semibold text-slate-900 text-center px-4">Qty</th>
                    <th className="py-3 font-semibold text-slate-900 text-right px-4">Price</th>
                    <th className="py-3 font-semibold text-slate-900 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quote.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-4 text-slate-800 max-w-[300px] break-words">{item.description}</td>
                      <td className="py-4 text-slate-800 text-center px-4">{item.quantity}</td>
                      <td className="py-4 text-slate-800 text-right px-4">{formatCurrency(parseFloat(item.price), quote.currency)}</td>
                      <td className="py-4 font-medium text-slate-900 text-right">{formatCurrency(item.quantity * item.price, quote.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="block sm:hidden space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 pb-2">Items</h4>
              {quote.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div className="pr-4">
                    <p className="font-semibold text-slate-900 text-sm">{item.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.quantity} x {formatCurrency(parseFloat(item.price), quote.currency)}</p>
                  </div>
                  <div className="text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                    {formatCurrency(item.quantity * item.price, quote.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pt-4">
            <div className="flex-1">
              {quote.notes && (
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
                  <p className="text-slate-600 whitespace-pre-wrap text-sm">{quote.notes}</p>
                </div>
              )}
            </div>
            
            <div className="w-full sm:w-72 space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, quote.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Tax ({quote.tax_rate}%)</span>
                <span>{formatCurrency(tax, quote.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-3 border-t border-slate-200">
                <span className="text-slate-900">Total</span>
                <span className="text-primary">{formatCurrency(total, quote.currency)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Actions (Only visible if draft) */}
          <div className="print:hidden">
            <QuotationActions quotationToken={resolvedParams.token} status={quote.status} isOwner={isOwner} />
          </div>

        </div>
      </div>
      
      <div className="mt-8 text-center print:hidden">
        <p className="text-sm text-slate-400">Powered by <span className="font-bold text-slate-600">247Billz</span></p>
      </div>
    </div>
  )
}
