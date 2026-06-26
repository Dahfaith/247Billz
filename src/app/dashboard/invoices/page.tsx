import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { SendEmailButton } from "@/components/send-email-button";

export default async function InvoicesPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();

  let invoices = [];
  
  if (business) {
    // Fetch invoices with client info
    const { data } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(name, email),
        items:invoice_items(quantity, price)
      `)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
      
    invoices = data || [];
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage and track your sent invoices.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
          <Link href="/dashboard/invoices/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Link>
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            You haven't created any invoices. Click the button below to generate your first professional invoice.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/invoices/new">
              Create your first invoice
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
                  <th className="px-6 py-4 font-medium">Invoice Number</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Issue Date</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((invoice: any) => {
                  const total = invoice.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0) || 0;
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{invoice.invoice_number}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{invoice.client?.name}</div>
                        <div className="text-xs text-muted-foreground">{invoice.client?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{invoice.issue_date}</td>
                      <td className="px-6 py-4 text-slate-500">{invoice.due_date || '-'}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(total, invoice.currency)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : invoice.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                        <SendEmailButton targetId={invoice.id} clientEmail={invoice.client?.email} type="invoice" />
                        
                        {invoice.status !== 'paid' && (
                          <form action={async () => {
                            "use server";
                            const { createClient } = await import("@/lib/supabase/server");
                            const { revalidatePath } = await import("next/cache");
                            const supabase = await createClient();
                            await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoice.id);
                            revalidatePath('/dashboard/invoices');
                          }}>
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8">
                              Mark Paid
                            </Button>
                          </form>
                        )}
                        
                        <Button asChild variant="ghost" size="sm" className="h-8 text-primary hover:text-primary/90 hover:bg-primary/10">
                          <Link href={`/invoice/${invoice.secure_token}`} target="_blank">
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
            {invoices.map((invoice: any) => {
               const total = invoice.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0) || 0;
               return (
                  <div key={invoice.id} className="p-4 space-y-3 hover:bg-muted/50 transition-colors">
                     <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">{invoice.invoice_number}</div>
                          <div className="text-sm font-medium text-slate-700">{invoice.client?.name}</div>
                        </div>
                        <div className="text-right">
                           <div className="font-bold text-slate-900">{formatCurrency(total, invoice.currency)}</div>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : invoice.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                             {invoice.status}
                           </span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500">Issued: {invoice.issue_date}</span>
                          <span className="text-xs text-slate-500">Due: {invoice.due_date || '-'}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <SendEmailButton targetId={invoice.id} clientEmail={invoice.client?.email} type="invoice" />
                          
                          {invoice.status !== 'paid' && (
                            <form action={async () => {
                              "use server";
                              const { createClient } = await import("@/lib/supabase/server");
                              const { revalidatePath } = await import("next/cache");
                              const supabase = await createClient();
                              await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoice.id);
                              revalidatePath('/dashboard/invoices');
                            }}>
                              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-2 text-xs">
                                Paid
                              </Button>
                            </form>
                          )}
                          
                          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary/90 hover:bg-primary/10">
                             <Link href={`/invoice/${invoice.secure_token}`} target="_blank">View</Link>
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
