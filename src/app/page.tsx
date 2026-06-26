"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Smartphone, Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";

const features = [
  { title: "Invoice in Seconds", desc: "Create and send professional invoices faster than ever." },
  { title: "Client Portals", desc: "Clients can view and pay without creating an account." },
  { title: "Multi-Currency", desc: "Support for global businesses with accurate conversions." },
  { title: "Automated Limits", desc: "Focus on your business, we track your monthly usage." },
];

const pricing = [
  { name: "Free", price: "₦0", limit: "Max 3 Invoices/mo", features: ["Basic Analytics", "247Billz Watermark"], cta: "Get Started" },
  { name: "Starter", price: "₦2,100", limit: "Max 20 Invoices/mo", features: ["Full Analytics", "247Billz Watermark"], cta: "Start Trial" },
  { name: "Pro", price: "₦5,100", limit: "Unlimited Documents", features: ["Custom Branding", "Multi-Currency Metrics"], cta: "Go Pro", highlight: true },
  { name: "Business", price: "₦10,000", limit: "Unlimited Everything", features: ["Priority Support", "Multi-Profile Mapping", "API Access"], cta: "Contact Sales" },
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

      {/* Pricing */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Simple, transparent pricing</h2>
          <p className="mt-4 text-muted-foreground">Start for free, upgrade when you need more power.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {pricing.map((p, i) => (
            <Card key={i} className={`relative flex flex-col ${p.highlight ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'}`}>
              {p.highlight && <div className="absolute top-0 inset-x-0 h-1 bg-primary rounded-t-xl" />}
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                  {p.price}<span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                </div>
                <CardDescription className="mt-2 font-medium text-foreground">{p.limit}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {p.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> {feat}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className={`w-full ${p.highlight ? 'bg-primary text-white hover:bg-primary/90' : 'variant-outline'}`}>
                  <Link href="/signup">{p.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
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

      {/* Footer */}
      <footer className="border-t border-border bg-background pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">2</div>
                <span className="text-xl font-bold tracking-tight text-secondary dark:text-white">247Billz</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs mb-6">
                The premium platform for creating invoices, quotations, and receipts in seconds.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-xs font-medium w-fit">
                <Smartphone className="w-4 h-4 text-primary" />
                Mobile App Coming Soon
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} 247Billz. All rights reserved.
            </p>
            <div className="text-sm text-muted-foreground">
              Designed & Developed by <a href="https://www.visioreach.co" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">VisioReach</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
