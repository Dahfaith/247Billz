"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "@/app/actions/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowRight, Eye } from "lucide-react";
import { AdvancedQRCode } from "@/components/advanced-qr-code";
import { toast } from "sonner";
import { CURRENCIES, getCurrencySymbol, formatCurrency } from "@/lib/currency";

export default function InvoiceBuilder({ business, platformSettings, clients = [], invoice }: { business: any, platformSettings?: any, clients?: any[], invoice?: any }) {
  const router = useRouter();
  const [currency, setCurrency] = useState(invoice?.currency || business?.currency || "NGN");
  const [selectedClientId, setSelectedClientId] = useState(invoice?.client_id || "");
  
  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientName = selectedClient?.name || "";
  const clientEmail = selectedClient?.email || "";

  const [issueDate, setIssueDate] = useState(invoice?.issue_date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(invoice?.due_date || "");
  const [items, setItems] = useState(
    invoice?.items?.length > 0 
      ? invoice.items.map((i: any, index: number) => ({ id: i.id || index, description: i.description, quantity: i.quantity, price: i.price }))
      : [{ id: 1, description: "", quantity: 1, price: 0 }]
  );
  
  const addItem = () => setItems([...items, { id: Date.now(), description: "", quantity: 1, price: 0 }]);
  const removeItem = (id: number) => setItems(items.filter(i => i.id !== id));
  
  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(items.map((i: any) => i.id === id ? { ...i, [field]: value } : i));
  };

  const subtotal = items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
  const tax = subtotal * 0; // Fixed at 0 for now
  const total = subtotal + tax;

  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!clientName || !issueDate || !dueDate || items.length === 0) {
      toast.error("Please fill in all required fields (Client Name, Dates, and at least one item).");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("client_id", selectedClientId);
        formData.append("clientName", clientName);
        formData.append("clientEmail", clientEmail);
        formData.append("issueDate", issueDate);
        formData.append("dueDate", dueDate);
        formData.append("currency", currency);
        formData.append("items", JSON.stringify(items));
        if (invoice?.id) {
          formData.append("id", invoice.id);
        }
        
        const result = await createInvoice(formData);
        if (result?.error) {
          if (result.error.includes("limit reached")) {
            router.push("?upgrade=true");
          } else {
            toast.error(result.error);
          }
        }
      } catch (error: any) {
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Left Pane - Form */}
      <div className="space-y-8 bg-card border border-border p-6 rounded-xl shadow-sm">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Client Details</h2>
          <div className="grid sm:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Select Client</Label>
              <select 
                id="client_id" 
                name="client_id"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
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
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Invoice Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input id="issueDate" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            {platformSettings?.enable_multi_currency !== false && (
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Line Items</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>
          
          <div className="space-y-6 max-w-[80vw] overflow-x-auto">
            {items.map((item: any, index: number) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="flex-1 w-full space-y-2">
                  <Label className={index === 0 ? "text-xs sm:block hidden" : "sm:hidden text-xs"}>Description</Label>
                  <Input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Item description" />
                </div>
                <div className="w-full sm:w-24 space-y-2">
                  <Label className={index === 0 ? "text-xs sm:block hidden" : "sm:hidden text-xs"}>Qty</Label>
                  <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} />
                </div>
                <div className="w-full sm:w-32 space-y-2">
                  <Label className={index === 0 ? "text-xs sm:block hidden" : "sm:hidden text-xs truncate"}>Price ({getCurrencySymbol(currency)})</Label>
                  <Input type="number" min="0" value={item.price} onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))} />
                </div>
                <div className="hidden sm:block w-24 font-medium text-right mt-6">
                  {formatCurrency(item.quantity * item.price, currency)}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10 mt-2 sm:mt-6 w-full sm:w-10" 
                  onClick={() => removeItem(item.id)} 
                  disabled={items.length === 1}
                >
                  <Trash2 className="w-4 h-4 mr-2 sm:mr-0" />
                  <span className="sm:hidden">Remove</span>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Make sure all details are correct.
          </div>
          <Button 
            className="bg-primary text-white hover:bg-primary/90"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? "Saving..." : invoice ? "Update Invoice" : "Save & Generate Link"} 
            {!isPending && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>

      {/* Right Pane - Preview */}
      <div className="sticky top-8 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2 px-2">
          <Eye className="w-4 h-4 text-primary" /> Live Preview
        </div>
        
        {/* The Invoice Paper */}
        <div className="bg-white text-slate-900 rounded-xl shadow-xl overflow-hidden min-h-[600px] flex flex-col relative print:shadow-none print:w-full print:h-auto">
          {/* Header Banner - Using Brand Color */}
          <div className="h-4 bg-primary w-full absolute top-0 left-0" />
          
          <div className="p-4 sm:p-10 flex-1 flex flex-col mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 sm:mb-12 gap-6">
              <div>
                {business?.logo_url ? (
                  <div className="h-12 mb-4 flex items-end">
                    <img src={business.logo_url} alt="Logo" className="h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl mb-4 shadow-sm">
                    {(business?.name || "B").charAt(0).toUpperCase()}
                  </div>
                )}
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">INVOICE</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">#INV-0001</p>
              </div>
              <div className="text-left sm:text-right flex items-start gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div>
                  <h3 className="font-semibold text-slate-900">{business?.name || "Your Business Name"}</h3>
                  {business?.email && <p className="text-sm text-slate-500 mt-1">{business.email}</p>}
                  {business?.phone && <p className="text-sm text-slate-500">{business.phone}</p>}
                  {business?.address && <p className="text-sm text-slate-500">{business.address}</p>}
                </div>
                <AdvancedQRCode 
                  url="https://247billz.com/invoice/INV-0001" 
                  businessName={business?.name} 
                  logoUrl={business?.logo_url} 
                  size={64} 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between mb-8 sm:mb-12 gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Bill To</h4>
                <p className="font-semibold text-slate-900">{clientName || "Client Name"}</p>
                <p className="text-sm text-slate-500">{clientEmail || "client@email.com"}</p>
              </div>
              <div className="text-left sm:text-right flex gap-4 sm:gap-8">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Issue Date</h4>
                  <p className="font-medium text-sm text-slate-900">{issueDate || "-"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Due Date</h4>
                  <p className="font-medium text-sm text-slate-900">{dueDate || "-"}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-y border-slate-200">
                    <th className="py-3 font-semibold text-slate-900">Description</th>
                    <th className="py-3 font-semibold text-slate-900 text-center">Qty</th>
                    <th className="py-3 font-semibold text-slate-900 text-right">Price</th>
                    <th className="py-3 font-semibold text-slate-900 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-4 text-slate-700">{item.description || "Item description"}</td>
                      <td className="py-4 text-slate-700 text-center">{item.quantity}</td>
                      <td className="py-4 text-slate-700 text-right">{formatCurrency(item.price, currency)}</td>
                      <td className="py-4 text-slate-900 font-medium text-right">{formatCurrency(item.quantity * item.price, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <div className="w-full sm:w-1/2 space-y-3">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tax (0%)</span>
                  <span>{formatCurrency(0, currency)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="text-primary">{formatCurrency(total, currency)}</span>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm font-medium text-slate-900 mb-1">Thank you for your business!</p>
              <p className="text-xs text-slate-500">
                Payment is due by {dueDate || "the due date"} 
                {issueDate && dueDate && (
                  <span className="font-medium text-slate-600 ml-1">
                    ({Math.ceil((new Date(dueDate).getTime() - new Date(issueDate).getTime()) / (1000 * 60 * 60 * 24)) === 0 
                      ? "today" 
                      : Math.ceil((new Date(dueDate).getTime() - new Date(issueDate).getTime()) / (1000 * 60 * 60 * 24)) > 0
                        ? `in ${Math.ceil((new Date(dueDate).getTime() - new Date(issueDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                        : `${Math.abs(Math.ceil((new Date(dueDate).getTime() - new Date(issueDate).getTime()) / (1000 * 60 * 60 * 24)))} days ago`})
                  </span>
                )}
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
