"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Smartphone } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith('/dashboard') || 
                     pathname?.startsWith('/admin') ||
                     pathname?.startsWith('/invoice') ||
                     pathname?.startsWith('/quotation') ||
                     pathname?.startsWith('/receipt');

  if (hideFooter) return null;

  return (
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
              <li><Link href="/#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
              <li><Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about-us" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} 247Billz. All rights reserved.
          </p>
          <div className="text-sm text-muted-foreground">
            Designed & Developed by <a href="https://www.visioreach.co" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Visioreach Concepts</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
