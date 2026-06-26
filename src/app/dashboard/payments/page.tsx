import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function PaymentsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single();

  let payments = [];
  
  if (business) {
    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(
          invoice_number,
          secure_token,
          client:clients(name, email)
        )
      `)
      .order('created_at', { ascending: false });
      
    // Filter out payments where invoice's business_id doesn't match?
    // Wait, the RLS policy for payments restricts it to the owner's businesses automatically.
    // So `data` will only contain the user's payments.
    payments = data || [];
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">Track and manage all your received payments.</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No payments yet</h3>
          <p className="text-muted-foreground max-w-sm">
            You haven't received any payments. Once a client pays an invoice, the payment details will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Payment ID</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Invoice Ref</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment: any) => {
                  return (
                    <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-slate-500">{payment.id.split('-')[0].toUpperCase()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{payment.invoice?.client?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{payment.invoice?.client?.email || ""}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{payment.invoice?.invoice_number}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(payment.created_at).toISOString().split('T')[0]}</td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-slate-700">{payment.payment_method?.replace('_', ' ') || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">₦{Number(payment.amount).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${payment.status === 'successful' || payment.status === 'completed' || payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {payment.invoice?.secure_token && (
                          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/90 hover:bg-primary/10">
                            <Link href={`/invoice/${payment.invoice.secure_token}`} target="_blank">
                              View Invoice
                            </Link>
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile List View */}
          <div className="block sm:hidden divide-y divide-border">
            {payments.map((payment: any) => {
               return (
                  <div key={payment.id} className="p-4 space-y-3 hover:bg-muted/50 transition-colors">
                     <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">{payment.invoice?.invoice_number}</div>
                          <div className="text-sm font-medium text-slate-700">{payment.invoice?.client?.name || "Unknown"}</div>
                        </div>
                        <div className="text-right">
                           <div className="font-bold text-slate-900">₦{Number(payment.amount).toLocaleString()}</div>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${payment.status === 'successful' || payment.status === 'completed' || payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                             {payment.status}
                           </span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <div className="text-xs text-slate-500">
                          {new Date(payment.created_at).toISOString().split('T')[0]} • <span className="capitalize">{payment.payment_method?.replace('_', ' ') || "N/A"}</span>
                        </div>
                        {payment.invoice?.secure_token && (
                          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary/90 hover:bg-primary/10">
                             <Link href={`/invoice/${payment.invoice.secure_token}`} target="_blank">View</Link>
                          </Button>
                        )}
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
