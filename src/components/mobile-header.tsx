"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft, LayoutDashboard, FileText, Receipt, Users, CreditCard, BarChart, Settings, Rocket, Bell, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { logout } from "@/app/actions/auth";
import { NotificationDropdown } from "./notification-dropdown";

export function MobileHeader({ 
  businessName = "My Business", 
  initial = "M", 
  usage = 0, 
  maxLimit = 20, 
  percent = 0,
  tier = "free"
}: { 
  businessName?: string;
  initial?: string;
  usage?: number;
  maxLimit?: number;
  percent?: number;
  tier?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden sticky top-0 z-50 flex h-14 items-center border-b border-border bg-card px-4 shadow-sm w-full">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 -ml-1">
            <PanelLeft className="w-5 h-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[18rem] bg-sidebar p-0 text-sidebar-foreground border-r border-sidebar-border flex flex-col gap-0">
          <SheetHeader className="p-4 border-b border-sidebar-border text-left">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">{initial}</div>
              <span className="text-xl font-bold tracking-tight text-sidebar-foreground truncate" title={businessName}>{businessName}</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-auto py-2">
            <div className="px-2 py-2">
              <div className="px-2 text-xs font-medium text-sidebar-foreground/70 mb-2">Menu</div>
              <nav className="flex flex-col gap-1">
                <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> <span>Dashboard</span>
                </Link>
                <Link href="/dashboard/invoices" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                  <FileText className="w-4 h-4" /> <span>Invoices</span>
                </Link>
                <Link href="/dashboard/quotations" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                  <FileText className="w-4 h-4" /> <span>Quotations</span>
                </Link>
                <Link href="/dashboard/receipts" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                  <Receipt className="w-4 h-4" /> <span>Receipts</span>
                </Link>
                <Link href="/dashboard/clients" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                  <Users className="w-4 h-4" /> <span>Clients</span>
                </Link>
                <Link href="/dashboard/payments" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                  <CreditCard className="w-4 h-4" /> <span>Payments</span>
                </Link>
                <Link href="/dashboard/reports" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                  <BarChart className="w-4 h-4" /> <span>Reports</span>
                </Link>

                <Link href="/dashboard/support" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                  <HelpCircle className="w-4 h-4" /> <span>Support Helpdesk</span>
                </Link>
              </nav>
            </div>
            
            <div className="px-2 py-2 mt-4">
              <div className="px-2 text-xs font-medium text-sidebar-foreground/70 mb-2">Settings</div>
              <nav className="flex flex-col gap-1">
                <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                  <Settings className="w-4 h-4" /> <span>Settings</span>
                </Link>
                <Link href="/dashboard/billing" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                  <CreditCard className="w-4 h-4" /> <span>Billing & Plans</span>
                </Link>
              </nav>
            </div>
          </div>
          
          <div className="p-4 border-t border-sidebar-border bg-sidebar mt-auto">
            <div className="bg-card border border-border rounded-lg p-3">
              {maxLimit === Infinity ? (
                <>
                  <p className="text-xs font-medium text-primary flex items-center justify-center gap-1 mb-1">
                    <Rocket className="w-3 h-3" /> {tier === 'pro' ? 'Pro' : 'Business'} Plan Active
                  </p>
                  <p className="text-xs text-center text-muted-foreground">Unlimited Documents</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Usage: {usage} / {maxLimit} Documents</p>
                  <Progress value={percent} className={`h-2 mb-3 ${percent && percent >= 100 ? 'bg-red-100' : 'bg-muted'}`} indicatorClassName={percent && percent >= 100 ? 'bg-red-500' : ''} />
                  <Link href="/dashboard/billing" onClick={() => setOpen(false)} className="w-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 py-1.5 rounded flex items-center justify-center gap-1 transition-colors">
                    <Rocket className="w-3 h-3" /> Upgrade Plan
                  </Link>
                </>
              )}
            </div>
            <form action={logout} className="mt-4">
              <button type="submit" className="w-full text-xs font-medium text-muted-foreground hover:text-foreground text-left py-2 px-3 rounded hover:bg-muted transition-colors">
                Log out
              </button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 items-center justify-between ml-3">
        <span className="font-bold text-lg text-primary tracking-tight">247Billz</span>
        <NotificationDropdown />
      </div>
    </div>
  );
}
