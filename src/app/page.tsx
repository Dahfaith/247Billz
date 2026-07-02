"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, ChevronLeft, ChevronRight, Smartphone, Menu, Sparkles, X, Zap, Shield, Globe, CreditCard } from "lucide-react";
import Link from "next/link";

const features = [
  { title: "Invoice in Seconds", icon: Zap, desc: "Create and send professional invoices faster than ever." },
  { title: "Client Portals", icon: Globe, desc: "Clients can view and pay without creating an account." },
  { title: "Multi-Currency", icon: CreditCard, desc: "Support for global businesses with accurate conversions." },
  { title: "Automated Limits", icon: Shield, desc: "Focus on your business, we track your monthly usage." },
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
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-bold">Client Stories</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActive((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white hover:bg-primary/20 transition-all backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActive((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white hover:bg-primary/20 transition-all backdrop-blur-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <motion.p 
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white/90 text-lg sm:text-xl font-medium leading-relaxed"
      >
        “{current.quote}”
      </motion.p>
      <div className="mt-8">
        <p className="font-bold text-white">{current.name}</p>
        <p className="text-sm text-white/60">{current.role}</p>
      </div>
    </div>
  );
}

type PricingPlanName = "Free" | "Starter" | "Pro" | "Business";
type PricingComparisonRow = { label: string; } & Record<PricingPlanName, string | boolean>;

type PricingPlan = {
  name: PricingPlanName;
  price: string;
  details: string;
  features: string[];
  highlight?: boolean;
  cta: string;
};

const pricing: PricingPlan[] = [
  { name: "Free", price: "₦0", details: "Perfect for new businesses starting with basic invoicing.", features: ["3 invoices per month", "Basic reporting", "247Billz watermark"], cta: "Start free" },
  { name: "Starter", price: "₦2,100", details: "For growing teams that need more volume and client management.", features: ["20 invoices per month", "Custom branding", "Email invoices"], cta: "Upgrade" },
  { name: "Pro", price: "₦5,100", details: "Best for businesses that want unlimited documents and advanced control.", features: ["Unlimited invoices", "Multi-currency support", "Quote conversion"], highlight: true, cta: "Go Pro" },
  { name: "Business", price: "₦10,000", details: "For enterprises needing priority support and premium capabilities.", features: ["Priority support", "Advanced permissions", "API access"], cta: "Contact sales" },
];

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
    <div className="min-h-screen bg-[#020817] text-slate-100 selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden">
      
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#020817]/70 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/20">2</div>
            <span className="text-2xl font-bold tracking-tight text-white">247Billz</span>
          </div>
          <div className="hidden md:flex gap-6 items-center">
            <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="#faq" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">FAQ</Link>
            <div className="w-px h-6 bg-white/10" />
            <Button variant="ghost" className="text-slate-200 hover:text-white hover:bg-white/5" asChild><Link href="/login">Log in</Link></Button>
            <Button className="bg-white text-black hover:bg-slate-200 shadow-xl shadow-white/10" asChild><Link href="/signup">Get Started</Link></Button>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:bg-white/10">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-20 left-0 w-full bg-[#020817]/95 backdrop-blur-3xl border-b border-white/10 overflow-hidden"
            >
              <div className="p-6 flex flex-col gap-4">
                <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-300">Features</Link>
                <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-300">Pricing</Link>
                <div className="w-full h-px bg-white/10 my-2" />
                <Button variant="outline" className="w-full h-14 border-white/20 text-white bg-transparent hover:bg-white/5" asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 border-0" asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="pt-32 md:pt-48 pb-20 md:pb-32 px-4 container mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center mb-8"
          >
            <Badge variant="outline" className="px-4 py-1.5 text-xs md:text-sm border-orange-500/30 text-orange-400 bg-orange-500/10 backdrop-blur-md shadow-2xl rounded-full">
              <Sparkles className="w-3 h-3 mr-2 inline-block" /> 247Billz 2.0 is now live
            </Badge>
          </motion.div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Get paid faster with <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-300 via-orange-500 to-red-600 drop-shadow-sm">beautiful invoices.</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            The premium platform for creating invoices, quotations, and receipts in seconds. Give your clients a frictionless payment experience.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-slate-200 h-16 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-white/10 transition-all hover:scale-105" asChild>
              <Link href="/signup">Start for free <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/5 border-white/10 text-white hover:bg-white/10 h-16 px-10 text-lg font-bold rounded-2xl backdrop-blur-md transition-all" asChild>
              <Link href="#features">See how it works</Link>
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Preview / Floating UI */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 max-w-6xl mx-auto relative px-4 sm:px-6"
        >
          {/* Floating Stats - Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.8 }} 
            className="hidden lg:flex absolute -left-16 top-32 z-20 bg-white/10 backdrop-blur-xl px-8 py-6 rounded-3xl border border-white/20 shadow-2xl flex-col items-center"
          >
             <span className="text-4xl font-black text-white">₦300M+</span>
             <span className="text-xs text-orange-400 font-bold uppercase tracking-[0.2em] mt-2">Processed Securely</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4, duration: 0.8 }} 
            className="hidden lg:flex absolute -right-12 bottom-32 z-20 bg-white/10 backdrop-blur-xl px-8 py-6 rounded-3xl border border-white/20 shadow-2xl flex-col items-center"
          >
             <span className="text-4xl font-black text-white">10,000+</span>
             <span className="text-xs text-orange-400 font-bold uppercase tracking-[0.2em] mt-2">Invoices Generated</span>
          </motion.div>

          <div className="relative z-10 rounded-[2rem] border border-white/10 shadow-2xl bg-black/40 backdrop-blur-2xl p-3 sm:p-4 ring-1 ring-white/5">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0A0F1C] relative">
              <div className="h-10 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2 backdrop-blur-md">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="ml-4 flex-1 h-5 bg-black/30 rounded-md border border-white/5" />
              </div>
              
              {/* Pure Tailwind UI Dashboard Mockup */}
              <div className="flex h-[400px] sm:h-[600px] w-full bg-gradient-to-br from-[#0A0F1C] to-[#020510] text-left pointer-events-none select-none relative overflow-hidden">
                {/* Glowing orb inside dashboard */}
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] -z-0" />
                
                {/* Sidebar Mock */}
                <div className="w-48 lg:w-64 border-r border-white/5 bg-white/5 hidden md:flex flex-col p-6 backdrop-blur-xl relative z-10">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm flex items-center justify-center font-bold">2</div>
                    <span className="font-bold text-base text-white">247Billz</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center px-4 text-sm font-semibold border border-orange-500/20">Dashboard</div>
                    <div className="h-10 rounded-xl text-slate-400 flex items-center px-4 text-sm font-medium">Invoices</div>
                    <div className="h-10 rounded-xl text-slate-400 flex items-center px-4 text-sm font-medium">Quotations</div>
                    <div className="h-10 rounded-xl text-slate-400 flex items-center px-4 text-sm font-medium">Clients</div>
                  </div>
                </div>
                
                {/* Main Content Mock */}
                <div className="flex-1 p-6 sm:p-10 overflow-hidden flex flex-col relative z-10">
                  <div className="flex justify-between items-start sm:items-center mb-10 gap-2">
                    <div>
                      <h3 className="font-bold text-xl sm:text-2xl text-white mb-2">Overview</h3>
                      <p className="text-xs sm:text-sm text-slate-400">Your business metrics for the last 30 days.</p>
                    </div>
                    <div className="h-10 sm:h-12 px-6 bg-white text-black rounded-xl text-xs sm:text-sm flex items-center justify-center font-bold shadow-lg shadow-white/5 whitespace-nowrap">
                      New Invoice
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                      { label: "Total Revenue", val: "₦1,245,000", trend: "+12%" },
                      { label: "Paid Invoices", val: "48", trend: "+4%" },
                      { label: "Outstanding", val: "₦320,000", trend: "-2%" },
                      { label: "Active Clients", val: "124", trend: "+8%" }
                    ].map((s, i) => (
                      <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-md">
                        <p className="text-sm text-slate-400 mb-3">{s.label}</p>
                        <div className="flex items-end justify-between">
                          <p className="font-black text-xl lg:text-3xl text-white">{s.val}</p>
                          <span className={`text-xs font-bold ${s.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{s.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Mock */}
                  <div className="p-6 rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-md flex-1 flex flex-col">
                    <h4 className="text-sm font-semibold mb-6 text-slate-300">Revenue Trend</h4>
                    <div className="flex-1 flex items-end gap-3 lg:gap-6 mt-auto">
                      {[40, 70, 45, 90, 65, 85, 120, 95, 110, 80, 105, 130].map((h, i) => (
                        <div key={i} className="w-full bg-white/5 rounded-t-md relative group h-full flex items-end overflow-hidden">
                          <div className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-md opacity-80" style={{ height: `${(h/130)*100}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Modern Bento Features */}
      <section id="features" className="py-32 relative z-10 border-t border-white/5 bg-[#020510]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white">Built for speed and elegance</h2>
            <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">Everything you need to manage your business billing, without the enterprise complexity.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  key={i} 
                  className={`p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm ${i === 0 ? 'md:col-span-2' : ''} ${i === 3 ? 'md:col-span-2' : ''}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Hear why teams choose 247Billz</h2>
          <p className="text-xl text-slate-400">Trusted by modern agencies, freelancers, and growing startups.</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <TestimonialSlider />
        </div>
      </section>

      {/* Pricing comparison */}
      <section id="pricing" className="py-32 relative z-10 border-t border-white/5 bg-[#020510]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Simple, transparent pricing</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Choose the plan that fits your business growth.</p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl max-w-7xl mx-auto backdrop-blur-sm">
            <div className="bg-black/40 px-8 sm:px-12 py-8 border-b border-white/10">
              <h3 className="text-2xl font-bold text-white">Compare features</h3>
              <p className="mt-2 text-slate-400">Everything your business needs at a glance.</p>
            </div>

            <div className="p-8 sm:p-12 space-y-6">
              {pricing.map((plan) => (
                <div key={plan.name} className={`rounded-3xl border transition-all ${plan.highlight ? 'border-orange-500/50 bg-orange-500/5 shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)]' : 'border-white/10 bg-black/20'} p-6 sm:p-8 flex flex-col lg:flex-row gap-8`}>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <h4 className="text-2xl font-bold text-white">{plan.name}</h4>
                      {plan.highlight && (
                        <span className="rounded-full bg-orange-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-orange-500/20">
                          Most popular
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 mb-6">{plan.details}</p>
                    <div className="text-3xl font-black text-white">{plan.price} <span className="text-sm font-medium text-slate-500 tracking-normal">/month</span></div>
                  </div>

                  <div className="flex-[2] grid sm:grid-cols-2 gap-4 lg:border-l lg:border-white/10 lg:pl-8">
                    {pricingComparison.map((row) => (
                      <div key={row.label} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-sm text-slate-300">{row.label}</span>
                        <span className="text-sm font-bold text-white">
                          {typeof row[plan.name] === 'boolean' ? (
                            row[plan.name] ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-slate-600" />
                          ) : (
                            row[plan.name]
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center lg:border-l lg:border-white/10 lg:pl-8 min-w-[200px]">
                    <Button className={`w-full h-14 text-base font-bold rounded-xl ${plan.highlight ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20' : 'bg-white text-black hover:bg-slate-200'}`} asChild>
                      <Link href="/signup">{plan.cta}</Link>
                    </Button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 relative z-10">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl font-black text-center text-white mb-16">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white/5 px-6 rounded-2xl border border-white/10 backdrop-blur-sm data-[state=open]:bg-white/10 transition-colors">
                <AccordionTrigger className="text-left font-bold text-lg text-white py-6 hover:no-underline hover:text-orange-400 transition-colors">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-slate-400 text-base leading-relaxed pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black pt-20 pb-10 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black font-black">2</div>
                <span className="text-2xl font-bold tracking-tight text-white">247Billz</span>
              </div>
              <p className="text-slate-400 max-w-sm">Premium invoicing and receipt generation platform. Get paid faster and manage your business from anywhere.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Product</h4>
              <ul className="space-y-4 text-slate-400">
                <li><Link href="#features" className="hover:text-orange-400 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-orange-400 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-slate-400">
                {cmsPages.map((page) => (
                  <li key={page.slug}>
                    <Link href={`/${page.slug}`} className="hover:text-orange-400 transition-colors">{page.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} 247Billz. All rights reserved.</p>
            <div className="mt-4 md:mt-0 space-x-6">
              <span>hello@247billz.com</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
