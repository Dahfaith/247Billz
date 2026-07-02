"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { MobileHeader } from "@/components/mobile-header";

export function Header() {
  const pathname = usePathname();
  const hideHeader = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  if (hideHeader) return null;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <MobileHeader />

          <div className="hidden md:flex md:items-center md:justify-between w-full">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-lg text-primary tracking-tight">
                247Billz
              </Link>
              <nav className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="/how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
                <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
              </nav>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium px-3 py-1 rounded hover:bg-muted transition-colors">Sign in</Link>
              <Link href="/signup" className="text-sm font-semibold bg-primary text-white px-3 py-1 rounded hover:opacity-95 transition-opacity">Get started</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
