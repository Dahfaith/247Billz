"use client"

import { useState, useTransition } from "react"
import { createClientAction, updateClientAction } from "@/app/actions/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Loader2, Edit2 } from "lucide-react"

export function ClientFormModal({ client }: { client?: any }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (client) {
          await updateClientAction(client.id, formData)
          toast.success("Client updated successfully!")
        } else {
          await createClientAction(formData)
          toast.success("Client added successfully!")
        }
        setOpen(false)
      } catch (error: any) {
        toast.error(error.message || "Failed to save client")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {client ? (
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100" title="Edit Client">
            <Edit2 className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {client ? "Update your client's contact details." : "Save your client details to use them quickly on future invoices."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Contact Name *</Label>
            <Input id="name" name="name" required placeholder="John Doe" defaultValue={client?.name || ""} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input id="company" name="company" placeholder="Acme Corp (Optional)" defaultValue={client?.company || ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@acme.com" defaultValue={client?.email || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+234..." defaultValue={client?.phone || ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="123 Business St." defaultValue={client?.address || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Private notes about this client..." className="resize-none" defaultValue={client?.notes || ""} />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              client ? "Save Changes" : "Save Client"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
