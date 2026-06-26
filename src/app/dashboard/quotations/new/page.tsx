"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createQuotationAction } from "@/app/actions/quotations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewQuotationPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState<any[]>([]);
  const supabase = createClient();

  const [items, setItems] = useState([
    { id: 1, description: "", quantity: 1, price: 0 }
  ]);

  useEffect(() => {
    async function loadClients() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).limit(1).single();
      if (business) {
        const { data } = await supabase.from('clients').select('id, name').eq('business_id', business.id).order('name');
        if (data) setClients(data);
      }
    }
    loadClients();
  }, []);

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  async function handleSubmit(formData: FormData) {
    if (items.some(i => !i.description)) {
      toast.error("Please provide descriptions for all items.");
      return;
    }

    startTransition(async () => {
      try {
        await createQuotationAction(formData, items);
        toast.success("Quotation created successfully!");
        router.push("/dashboard/quotations");
      } catch (error: any) {
        toast.error(error.message || "Failed to create quotation");
      }
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/quotations">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotations
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Quotation</h1>
        <p className="text-muted-foreground mt-1">Draft a new estimate for your client.</p>
      </div>

      <form action={handleSubmit} className="space-y-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="client_id">Select Client</Label>
              <select 
                id="client_id" 
                name="client_id" 
                required 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- Choose a client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">You need to add a client in the CRM first!</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input id="issue_date" name="issue_date" type="date" required defaultValue={today} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input id="valid_until" name="valid_until" type="date" required defaultValue={nextMonth} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Line Items</h3>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="flex-1 w-full space-y-2">
                  <Label className="sm:hidden">Description</Label>
                  <Input 
                    placeholder="Item description" 
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="w-full sm:w-24 space-y-2">
                  <Label className="sm:hidden">Qty</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="Qty" 
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div className="w-full sm:w-32 space-y-2">
                  <Label className="sm:hidden">Price (₦)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Price" 
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="hidden sm:block w-24 font-medium text-right mt-2">
                  ₦{(item.quantity * item.price).toLocaleString()}
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="text-red-500 hover:text-red-600 mt-2 sm:mt-0 w-full sm:w-10"
                >
                  <Trash2 className="w-4 h-4 mr-2 sm:mr-0" />
                  <span className="sm:hidden">Remove</span>
                </Button>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addItem} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>

          <div className="border-t border-border pt-4 mt-6 flex justify-end">
            <div className="w-full sm:w-1/3 space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₦{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <Label htmlFor="notes">Notes to Client (Optional)</Label>
          <Textarea 
            id="notes" 
            name="notes" 
            placeholder="Looking forward to doing business with you..." 
            className="min-h-[100px]"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="w-full sm:w-auto text-lg px-8" disabled={isPending || clients.length === 0}>
            {isPending ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
            ) : (
              "Save Quotation"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
