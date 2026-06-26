import InvoiceBuilder from "@/components/invoice-builder";
import { createClient } from "@/lib/supabase/server";
import { getPublicPlatformSettings } from "@/app/actions/settings";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user?.id)
    .limit(1)
    .single();

  const platformSettings = await getPublicPlatformSettings();

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-background px-4 sm:px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-muted-foreground text-sm mt-1">Fill in the details below to generate a new invoice.</p>
      </div>
      <div className="p-4 sm:p-8">
        <InvoiceBuilder business={business} platformSettings={platformSettings} />
      </div>
    </div>
  );
}
