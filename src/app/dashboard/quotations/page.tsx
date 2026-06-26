import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { SendEmailButton } from "@/components/send-email-button";

export default async function QuotationsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single();

  let quotations = [];
  
  if (business) {
    const { data } = await supabase
      .from('quotations')
      .select(`
        *,
        client:clients(name, email),
        items:quotation_items(quantity, price)
      `)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
      
    quotations = data || [];
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground mt-1">Send estimates to your clients for approval.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
          <Link href="/dashboard/quotations/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Quotation
          </Link>
        </Button>
      </div>

      {quotations.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Receipt className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No quotations yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            You haven't created any estimates. Generate a quotation to send pricing proposals to your clients.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/quotations/new">
              Create your first quotation
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Quote Number</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Issue Date</th>
                  <th className="px-6 py-4 font-medium">Valid Until</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quotations.map((quote: any) => {
                  const total = quote.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0) || 0;
                  
                  return (
                    <tr key={quote.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{quote.quotation_number}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{quote.client?.name}</div>
                        <div className="text-xs text-muted-foreground">{quote.client?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{quote.issue_date}</td>
                      <td className="px-6 py-4 text-slate-500">{quote.valid_until}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(total, quote.currency)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${quote.status === 'accepted' ? 'bg-green-100 text-green-800' : quote.status === 'declined' ? 'bg-red-100 text-red-800' : quote.status === 'converted' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                        <SendEmailButton targetId={quote.id} clientEmail={quote.client?.email} type="quotation" />
                        {quote.status === 'accepted' && (
                          <form action={async () => {
                            "use server";
                            const { convertQuotationToInvoiceAction } = await import("@/app/actions/quotations");
                            const { redirect } = await import("next/navigation");
                            try {
                              await convertQuotationToInvoiceAction(quote.id);
                            } catch (error: any) {
                              if (error.message?.includes("limit reached")) {
                                redirect("?upgrade=true");
                              }
                              throw error;
                            }
                            redirect("/dashboard/invoices");
                          }}>
                            <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-8">
                              Convert to Invoice
                            </Button>
                          </form>
                        )}
                        {(quote.status === 'draft' || quote.status === 'pending') && (
                          <Button asChild variant="ghost" size="sm" className="h-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Link href={`/dashboard/quotations/${quote.id}/edit`}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                        )}
                        <Button asChild variant="ghost" size="sm" className="h-8 text-primary hover:text-primary/90 hover:bg-primary/10">
                          <Link href={`/quotation/${quote.secure_token}`} target="_blank">
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile List View */}
          <div className="block sm:hidden divide-y divide-border">
            {quotations.map((quote: any) => {
               const total = quote.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0) || 0;
               return (
                  <div key={quote.id} className="p-4 space-y-3 hover:bg-muted/50 transition-colors">
                     <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">{quote.quotation_number}</div>
                          <div className="text-sm font-medium text-slate-700">{quote.client?.name}</div>
                        </div>
                        <div className="text-right">
                           <div className="font-bold text-slate-900">{formatCurrency(total, quote.currency)}</div>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${quote.status === 'accepted' ? 'bg-green-100 text-green-800' : quote.status === 'declined' ? 'bg-red-100 text-red-800' : quote.status === 'converted' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                             {quote.status}
                           </span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <div className="text-xs text-slate-500">Valid: {quote.valid_until}</div>
                        <div className="flex gap-2 items-center">
                          <SendEmailButton targetId={quote.id} clientEmail={quote.client?.email} type="quotation" />
                          {quote.status === 'accepted' && (
                            <form action={async () => {
                              "use server";
                              const { convertQuotationToInvoiceAction } = await import("@/app/actions/quotations");
                              const { redirect } = await import("next/navigation");
                              try {
                                await convertQuotationToInvoiceAction(quote.id);
                              } catch (error: any) {
                                if (error.message?.includes("limit reached")) {
                                  redirect("?upgrade=true");
                                }
                                throw error;
                              }
                              redirect("/dashboard/invoices");
                            }}>
                              <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-2 text-xs">
                                Convert
                              </Button>
                            </form>
                          )}
                          {(quote.status === 'draft' || quote.status === 'pending') && (
                            <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                               <Link href={`/dashboard/quotations/${quote.id}/edit`}>Edit</Link>
                            </Button>
                          )}
                          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary/90 hover:bg-primary/10">
                             <Link href={`/quotation/${quote.secure_token}`} target="_blank">View Quote</Link>
                          </Button>
                        </div>
                     </div>
                  </div>
               )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
