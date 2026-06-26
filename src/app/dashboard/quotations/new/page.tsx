import { createClient } from "@/lib/supabase/server";
import { QuotationForm } from "@/components/quotation-form";
import { redirect } from "next/navigation";

export default async function NewQuotationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();

  let clients = [];
  if (business) {
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .eq('business_id', business.id)
      .order('name');
    
    clients = data || [];
  }

  return <QuotationForm clients={clients} />;
}
