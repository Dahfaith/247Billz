"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, ChevronLeft, ChevronRight, Smartphone, Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";

const features = [
  { title: "Invoice in Seconds", desc: "Create and send professional invoices faster than ever." },
  { title: "Client Portals", desc: "Clients can view and pay without creating an account." },
  { title: "Multi-Currency", desc: "Support for global businesses with accurate conversions." },
  { title: "Automated Limits", desc: "Focus on your business, we track your monthly usage." },
];

const testimonials = [
  {
    quote: "247Billz made client invoicing painless. Quotes are approved instantly and payment is easy for our customers.",
    name: "Aisha Bello",
    role: "Founder, Crafthive",
  },
  {
    quote: "The dashboard gives us the confidence to scale. Payment statuses update automatically and our team stays aligned.",
    name: "Emeka Nwosu",
    role: "Agency Owner",
  },
  {
    quote: "Our business moved faster once we could send secure links without requiring client logins. It’s a game changer.",
    name: "Nkechi Okafor",
    role: "Operations Lead",
  },
];
function TestimonialSlider() {
  const [active, setActive] = useState(0);
  const current = testimonials[active];

  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">Testimonial</p>
          <p className="text-sm text-muted-foreground">Swipe or tap to browse client stories.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActive((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-primary/10 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActive((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-primary/10 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">“{current.quote}”</p>
      <div className="mt-6">
        <p className="font-semibold">{current.name}</p>
        <p className="text-sm text-muted-foreground">{current.role}</p>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            className={`h-2.5 w-2.5 rounded-full transition ${index === active ? 'bg-primary' : 'bg-border'}`}
          />
        ))}
      </div>
    </div>
  );
}
type PricingPlanName = "Free" | "Starter" | "Pro" | "Business";

type PricingComparisonRow = {
  label: string;
} & Record<PricingPlanName, string | boolean>;

const pricing = [
  { name: "Free", price: "₦0", details: "Perfect for new businesses starting with basic invoicing.", features: ["3 invoices per month", "Basic reporting", "247Billz watermark"], cta: "Start free" },
  { name: "Starter", price: "₦2,100", details: "For growing teams that need more volume and client management.", features: ["20 invoices per month", "Custom branding", "Email invoices"], cta: "Upgrade" },
  { name: "Pro", price: "₦5,100", details: "Best for businesses that want unlimited documents and advanced control.", features: ["Unlimited invoices", "Multi-currency support", "Quote conversion"], highlight: true, cta: "Go Pro" },
  { name: "Business", price: "₦10,000", details: "For enterprises needing priority support and premium capabilities.", features: ["Priority support", "Advanced permissions", "API access"], cta: "Contact sales" },
] as const;

const pricingComparison: PricingComparisonRow[] = [
  { label: "Invoices per month", Free: "3", Starter: "20", Pro: "Unlimited", Business: "Unlimited" },
  { label: "Custom branding", Free: false, Starter: true, Pro: true, Business: true },
  { label: "Multi-currency support", Free: false, Starter: false, Pro: true, Business: true },
  { label: "Quote acceptance", Free: true, Starter: true, Pro: true, Business: true },
  { label: "Storefront QR Codes", Free: false, Starter: true, Pro: true, Business: true },
  { label: "Priority support", Free: false, Starter: false, Pro: false, Business: true },
  { label: "API access", Free: false, Starter: false, Pro: false, Business: true },
  { label: "Watermark removal", Free: false, Starter: true, Pro: true, Business: true },
];

const faqs = [
  { q: "What is 247Billz?", a: "247Billz is a premium invoicing and receipt generation platform designed for modern businesses." },
  { q: "Do my clients need an account to pay?", a: "No! Clients receive a secure, unique link to view and pay their invoice instantly." },
  { q: "What payment gateways are supported?", a: "We currently support Flutterwave, with Paystack and Stripe coming soon." },
  { q: "Can I remove the 247Billz watermark?", a: "Yes, our Pro and Business plans include custom branding." },
  { q: "How are the monthly limits calculated?", a: "Limits are based on a rolling 30-day billing cycle." },
  { q: "Is there a mobile app?", a: "Our iOS and Android apps are currently in development and coming very soon." },
  { q: "Can I switch plans anytime?", a: "Absolutely. You can upgrade or downgrade your plan directly from your dashboard." },
  { q: "What happens if I exceed my limit?", a: "You'll be prompted to upgrade to the next tier to continue creating documents." },
  { q: "Can I create quotations?", a: "Yes! And you can convert them into invoices with a single click." },
  { q: "Is my data secure?", a: "We use enterprise-grade encryption and strict access policies (RLS) to ensure your data is safe." },
  { q: "Do you support multiple currencies?", a: "Yes, Pro and Business plans support deep multi-currency metrics." },
  { q: "Can I manage multiple businesses?", a: "The Business plan includes multi-profile mapping for agency owners." },
  { q: "How do I contact support?", a: "You can reach us 24/7 via the help widget in your dashboard." },
  { q: "Are there any hidden fees?", a: "No. You only pay your subscription fee plus standard payment gateway transaction fees." },
  { q: "Can I export my data?", a: "Yes, you can export your invoices and reports as PDF or CSV." },
];

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cmsPages, setCmsPages] = useState<any[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('cms_pages').select('title, slug').eq('status', 'published');
      if (data) setCmsPages(data);
    };
    fetchPages();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">2</div>
            <span className="text-xl font-bold tracking-tight">247Billz</span>
          </div>
          <div className="hidden md:flex gap-4">
            <Button variant="ghost" asChild><Link href="/login">Log in</Link></Button>
            <Button className="bg-primary text-white hover:bg-primary/90" asChild><Link href="/signup">Get Started</Link></Button>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border p-4 shadow-xl flex flex-col gap-4"
            >
              <Button variant="outline" className="w-full h-12" asChild onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="w-full h-12 bg-primary text-white hover:bg-primary/90" asChild onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/signup">Get Started</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 container mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge variant="outline" className="mb-4 md:mb-6 px-4 py-1 text-xs md:text-sm border-primary/20 text-primary bg-primary/5">
            247Billz 2.0 is now live
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-secondary max-w-4xl mx-auto leading-tight">
            Get paid faster with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">beautiful invoices</span>
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The premium platform for creating invoices, quotations, and receipts in seconds. Give your clients a seamless payment experience.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 h-14 px-8 text-lg" asChild>
              <Link href="/signup">Start for free <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>

          <div className="mt-16 pt-10 border-t border-border/40 w-full overflow-hidden">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mb-6">Powering 10,000+ businesses across Africa</p>
            <div className="marquee-container">
              <div className="marquee-content animate-marquee gap-8 sm:gap-16 opacity-50 grayscale items-center px-4">
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-foreground" /><span className="font-bold text-lg tracking-tight">Acme Corp</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-foreground" /><span className="font-bold text-lg tracking-tight">Command+</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rotate-45 bg-foreground" /><span className="font-bold text-lg tracking-tight">TechFlow</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full border-[3px] border-foreground" /><span className="font-bold text-lg tracking-tight">Globex</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-foreground skew-x-12" /><span className="font-bold text-lg tracking-tight">Finova</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-sm border-2 border-dashed border-foreground" /><span className="font-bold text-lg tracking-tight">Zenith</span></div>
                
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-foreground" /><span className="font-bold text-lg tracking-tight">Acme Corp</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-foreground" /><span className="font-bold text-lg tracking-tight">Command+</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rotate-45 bg-foreground" /><span className="font-bold text-lg tracking-tight">TechFlow</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full border-[3px] border-foreground" /><span className="font-bold text-lg tracking-tight">Globex</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-foreground skew-x-12" /><span className="font-bold text-lg tracking-tight">Finova</span></div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-sm border-2 border-dashed border-foreground" /><span className="font-bold text-lg tracking-tight">Zenith</span></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 md:mt-24 max-w-5xl mx-auto relative px-4 sm:px-6"
        >
          {/* Floating Stat 1 - Desktop Only */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="hidden lg:flex absolute -left-12 top-32 z-20 bg-card/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-border shadow-2xl flex-col items-center">
             <span className="text-3xl font-black text-primary">₦300M+</span>
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Processed Securely</span>
          </motion.div>

          {/* Floating Stat 2 - Desktop Only */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="hidden lg:flex absolute -right-8 top-1/4 z-20 bg-card/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-border shadow-2xl flex-col items-center">
             <span className="text-3xl font-black text-primary">10,000+</span>
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Invoices Generated</span>
          </motion.div>

          {/* Floating Stat 3 - Desktop Only */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }} className="hidden lg:flex absolute -right-16 bottom-32 z-20 bg-card/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-border shadow-2xl flex-col items-center">
             <span className="text-3xl font-black text-primary">99.9%</span>
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Uptime Guarantee</span>
          </motion.div>

          {/* Technical Dot Pattern Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-50 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10" />
          
          <div className="relative z-10 rounded-2xl border border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 p-2 sm:p-4">
            <div className="rounded-xl overflow-hidden border border-border bg-background">
              <div className="h-8 border-b border-border bg-muted/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            {/* Pure Tailwind UI Dashboard Mockup */}
            <div className="flex h-[500px] w-full bg-muted/20 text-left pointer-events-none select-none">
              {/* Sidebar Mock */}
              <div className="w-48 lg:w-56 border-r border-border bg-background hidden md:flex flex-col p-4">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-6 h-6 rounded bg-primary text-white text-xs flex items-center justify-center font-bold">2</div>
                  <span className="font-bold text-sm">247Billz</span>
                </div>
                <div className="space-y-2">
                  <div className="h-8 rounded-md bg-primary/10 text-primary flex items-center px-3 text-xs font-medium">Dashboard</div>
                  <div className="h-8 rounded-md text-muted-foreground flex items-center px-3 text-xs font-medium">Invoices</div>
                  <div className="h-8 rounded-md text-muted-foreground flex items-center px-3 text-xs font-medium">Quotations</div>
                  <div className="h-8 rounded-md text-muted-foreground flex items-center px-3 text-xs font-medium">Clients</div>
                  <div className="h-8 rounded-md text-muted-foreground flex items-center px-3 text-xs font-medium">Payments</div>
                </div>
              </div>
              {/* Main Content Mock */}
              <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
                <div className="flex justify-between items-start sm:items-center mb-6 gap-2">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg leading-none mb-1">Overview</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-none">Your business metrics for the last 30 days.</p>
                  </div>
                  <div className="h-7 sm:h-8 px-3 sm:px-4 bg-primary text-white rounded-md text-[10px] sm:text-xs flex items-center justify-center font-medium shadow-sm whitespace-nowrap shrink-0">
                    New Invoice
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Total Revenue", val: "₦1,245,000", trend: "+12%" },
                    { label: "Paid Invoices", val: "48", trend: "+4%" },
                    { label: "Outstanding", val: "₦320,000", trend: "-2%" },
                    { label: "Active Clients", val: "124", trend: "+8%" }
                  ].map((s, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-background shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                      <div className="flex items-end justify-between">
                        <p className="font-bold text-base lg:text-lg">{s.val}</p>
                        <span className={`text-[10px] ${s.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{s.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart Mock */}
                <div className="p-5 rounded-xl border border-border bg-background shadow-sm flex-1 flex flex-col">
                  <h4 className="text-sm font-semibold mb-4">Revenue Trend</h4>
                  <div className="flex-1 flex items-end gap-2 lg:gap-4 mt-auto">
                    {[40, 70, 45, 90, 65, 85, 120, 95, 110, 80, 105, 130].map((h, i) => (
                      <div key={i} className="w-full bg-primary/10 rounded-t-sm relative group h-full flex items-end">
                        <div className="w-full bg-primary rounded-t-sm transition-all duration-500" style={{ height: `${(h/130)*100}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Stats (hidden on desktop where floating badges are used) */}
        <div className="lg:hidden mt-12 grid grid-cols-2 gap-4 px-4 sm:px-6 max-w-2xl mx-auto">
           <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center text-center">
             <span className="text-2xl sm:text-3xl font-black text-primary">₦300M+</span>
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Processed Securely</span>
           </div>
           <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center text-center">
             <span className="text-2xl sm:text-3xl font-black text-primary">10,000+</span>
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Invoices Generated</span>
           </div>
           <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center text-center col-span-2">
             <span className="text-2xl sm:text-3xl font-black text-primary">99.9%</span>
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Uptime Guarantee</span>
           </div>
        </div>
      </section>

      {/* Trust & Workflow */}
      <section className="py-24 container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Trusted by growing businesses</p>
          <h2 className="mt-4 text-4xl font-bold">Built for teams that need accuracy, speed, and security</h2>
          <p className="mt-4 text-muted-foreground text-lg">From invoices to client payments, 247Billz keeps your billing workflow consistent and reliable.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-card border border-border p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Secure payments</h3>
            <p className="mt-3 text-sm text-muted-foreground">Fast checkout links, encrypted data, and provable RLS protection for every transaction.</p>
          </div>
          <div className="rounded-3xl bg-card border border-border p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">No login client access</h3>
            <p className="mt-3 text-sm text-muted-foreground">Clients can approve quotations, view invoices, and pay instantly without creating an account.</p>
          </div>
          <div className="rounded-3xl bg-card border border-border p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Mobile-ready billing</h3>
            <p className="mt-3 text-sm text-muted-foreground">Everything is optimized for phones and tablets, so your clients can pay on the go.</p>
          </div>
        </div>

        <div className="mt-20 grid gap-6 lg:grid-cols-4">
          {[
            { step: '1', title: 'Create invoice', desc: 'Draft professional invoices and quotations in seconds.' },
            { step: '2', title: 'Share link', desc: 'Send a secure payment link directly to your client.' },
            { step: '3', title: 'Receive payment', desc: 'Clients pay instantly with Flutterwave or future gateways.' },
            { step: '4', title: 'Reconcile faster', desc: 'Track paid, overdue and pending statuses from one dashboard.' },
          ].map((item) => (
            <div key={item.step} className="rounded-3xl border border-border bg-background p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">{item.step}</div>
              <h4 className="mt-4 text-lg font-semibold">{item.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Built for speed and elegance</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <Card key={i} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Loved by businesses</p>
          <h2 className="mt-4 text-4xl font-bold">Hear why teams choose 247Billz</h2>
          <p className="mt-4 text-muted-foreground text-lg">Trusted by teams who need fast invoicing, client payment links, and reliable reporting.</p>
        </div>

        <div className="hidden lg:grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-3xl border border-border bg-background p-6 shadow-sm">
              <p className="text-muted-foreground text-sm leading-relaxed">“{item.quote}”</p>
              <div className="mt-6">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:hidden">
          <TestimonialSlider />
        </div>

        <div className="mt-16 border-t border-border pt-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center text-sm text-muted-foreground">
            <div className="rounded-3xl bg-card px-4 py-6">Acme Corp</div>
            <div className="rounded-3xl bg-card px-4 py-6">Command+</div>
            <div className="rounded-3xl bg-card px-4 py-6">TechFlow</div>
            <div className="rounded-3xl bg-card px-4 py-6">Globex</div>
            <div className="rounded-3xl bg-card px-4 py-6">Finova</div>
            <div className="rounded-3xl bg-card px-4 py-6">Zenith</div>
          </div>
        </div>
      </section>

      {/* Pricing comparison */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Simple, transparent pricing</h2>
          <p className="mt-4 text-muted-foreground">Choose the plan that fits your business growth.</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm max-w-7xl mx-auto">
          <div className="bg-muted/80 px-8 py-6">
            <h3 className="text-2xl font-semibold">Compare features</h3>
            <p className="mt-2 text-sm text-muted-foreground">Everything your business needs at a glance.</p>
          </div>

          <div className="px-4 pb-6 space-y-4">
            {pricing.map((plan) => (
              <Card key={plan.name} className="border border-border bg-background">
                <CardHeader className="pb-0">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        {plan.name === 'Pro' ? (
                          <span className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm shadow-emerald-500/20">
                            Most popular
                          </span>
                        ) : null}
                      </div>
                      <CardDescription className="text-sm text-muted-foreground">{plan.details}</CardDescription>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary inline-flex items-center justify-center">{plan.price}</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-3">
                    {pricingComparison.map((row) => (
                      <div key={row.label} className="grid grid-cols-[1fr_auto] gap-4 rounded-3xl border border-border/80 bg-muted/50 px-4 py-3">
                        <span className="text-sm leading-tight text-muted-foreground">{row.label}</span>
                        <span className="flex items-center justify-end text-sm font-medium text-foreground">
                          {typeof row[plan.name] === 'boolean' ? (
                            row[plan.name] ? <CheckCircle2 className="inline-block w-4 h-4 text-emerald-500" /> : <X className="inline-block w-4 h-4 text-red-500" />
                          ) : (
                            row[plan.name]
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card px-4 rounded-lg border border-border">
                <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

    </div>
  );
}
