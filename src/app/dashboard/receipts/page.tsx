import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Receipt, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ReceiptsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();

  let receipts = [];
  
  if (business) {
    const { data } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(name, email),
        items:invoice_items(quantity, price)
      `)
      .eq('business_id', business.id)
      .eq('status', 'paid')
      .order('created_at', { ascending: false });
      
    receipts = data || [];
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
          <p className="text-muted-foreground mt-1">View and share payment receipts for your paid invoices.</p>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No receipts yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Receipts are automatically generated here whenever a client successfully pays an invoice via Flutterwave.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Receipt Ref</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Date Paid</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {receipts.map((receipt: any) => {
                  const total = receipt.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0) || 0;
                  
                  return (
                    <tr key={receipt.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">RCPT-{receipt.invoice_number.replace('INV-', '')}</div>
                        <div className="text-xs text-muted-foreground">From: {receipt.invoice_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{receipt.client?.name}</div>
                        <div className="text-xs text-muted-foreground">{receipt.client?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(receipt.created_at).toISOString().split('T')[0]}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">₦{total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/90 hover:bg-primary/10">
                          <Link href={`/receipt/${receipt.secure_token}`} target="_blank">
                            View Receipt
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
            {receipts.map((receipt: any) => {
               const total = receipt.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0) || 0;
               return (
                  <div key={receipt.id} className="p-4 space-y-3 hover:bg-muted/50 transition-colors">
                     <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900">RCPT-{receipt.invoice_number.replace('INV-', '')}</div>
                          <div className="text-sm font-medium text-slate-700">{receipt.client?.name}</div>
                        </div>
                        <div className="text-right">
                           <div className="font-bold text-slate-900">₦{total.toLocaleString()}</div>
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 bg-green-100 text-green-800">
                             PAID
                           </span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <div className="text-xs text-slate-500">Date: {new Date(receipt.created_at).toISOString().split('T')[0]}</div>
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary/90 hover:bg-primary/10">
                           <Link href={`/receipt/${receipt.secure_token}`} target="_blank">View Receipt</Link>
                        </Button>
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
