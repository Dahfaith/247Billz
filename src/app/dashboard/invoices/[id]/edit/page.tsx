import InvoiceBuilder from "@/components/invoice-builder";
import { createClient } from "@/lib/supabase/server";
import { getPublicPlatformSettings } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user?.id)
    .limit(1)
    .maybeSingle();

  const platformSettings = await getPublicPlatformSettings();

  let clients: any[] = [];
  if (business) {
    const { data } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('business_id', business.id)
      .order('name');
    
    clients = data || [];
  }

  // Fetch the existing invoice
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, items:invoice_items(*)')
    .eq('id', id)
    .eq('business_id', business?.id)
    .single();

  if (!invoice) {
    redirect('/dashboard/invoices');
  }

  if (invoice.status === 'paid') {
    // Cannot edit a paid invoice, redirect back
    redirect('/dashboard/invoices');
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-background px-4 sm:px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Invoice #{invoice.invoice_number}</h1>
        <p className="text-muted-foreground text-sm mt-1">Update the details below to edit this invoice.</p>
      </div>
      <div className="p-4 sm:p-8">
        <InvoiceBuilder business={business} platformSettings={platformSettings} clients={clients} invoice={invoice} />
      </div>
    </div>
  );
}
