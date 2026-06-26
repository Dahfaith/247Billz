import { createClient } from "@/lib/supabase/server";
import { Users, MoreVertical, Trash, Mail, Phone, Building } from "lucide-react";
import { ClientFormModal } from "@/components/client-form";
import { deleteClientAction } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";

export default async function ClientsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single();

  let clients = [];
  
  if (business) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
      
    clients = data || [];
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your customer database and contacts.</p>
        </div>
        <ClientFormModal />
      </div>

      {clients.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No clients yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            You haven't added any clients to your database. Add your first client to speed up invoice creation.
          </p>
          {/* Note: the ClientFormModal is a trigger, so we'd normally just want them to click the main button. 
              We'll leave this empty for now and let them click the top button. */}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client: any) => (
                  <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{client.name}</div>
                      {client.notes && <div className="text-xs text-slate-500 max-w-[200px] truncate">{client.notes}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {client.company ? (
                        <div className="flex items-center text-slate-700">
                          <Building className="w-3 h-3 mr-1.5 text-slate-400" />
                          {client.company}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center text-slate-600 text-xs">
                            <Mail className="w-3 h-3 mr-1.5" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center text-slate-600 text-xs">
                            <Phone className="w-3 h-3 mr-1.5" />
                            {client.phone}
                          </div>
                        )}
                        {!client.email && !client.phone && <span className="text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ClientFormModal client={client} />
                        <form action={async () => {
                          "use server";
                          await deleteClientAction(client.id);
                        }}>
                          <Button type="submit" variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete Client">
                            <Trash className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List View */}
          <div className="block md:hidden divide-y divide-border">
            {clients.map((client: any) => (
               <div key={client.id} className="p-4 space-y-3 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                     <div>
                       <div className="font-bold text-slate-900 text-lg">{client.name}</div>
                       {client.company && (
                         <div className="text-sm font-medium text-slate-700 flex items-center mt-0.5">
                           <Building className="w-3 h-3 mr-1.5 text-slate-400" />
                           {client.company}
                         </div>
                       )}
                     </div>
                     <div className="flex items-center gap-1">
                       <ClientFormModal client={client} />
                       <form action={async () => {
                          "use server";
                          await deleteClientAction(client.id);
                        }}>
                          <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash className="w-4 h-4" />
                          </Button>
                        </form>
                     </div>
                  </div>
                  
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    {client.email && (
                      <div className="flex items-center text-slate-600 text-sm">
                        <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center text-slate-600 text-sm">
                        <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        {client.phone}
                      </div>
                    )}
                    {client.notes && (
                       <p className="text-xs text-slate-500 italic mt-2">"{client.notes}"</p>
                    )}
                  </div>
               </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
