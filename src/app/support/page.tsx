import Link from "next/link";
import React from "react";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10 flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">
          Back to home
        </Link>
        <span>/</span>
        <span>Support</span>
      </div>

      <div className="rounded-3xl border border-border bg-background p-8 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight">Support</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Need help with 247Billz? You can reach out to our support team or log in to access the in-dashboard support helpdesk.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Public support</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              For general questions, onboarding, or troubleshooting, email us at{' '}
              <a href="mailto:247billzsupport@gmail.com" className="text-primary hover:underline">
                247billzsupport@gmail.com
              </a>
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Dashboard helpdesk</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              If you already have an account, the best place to open a ticket is inside your dashboard.
            </p>
            <Link href="/login" className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
              Sign in to support
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-muted/70 p-6">
          <h2 className="text-lg font-semibold">Common support topics</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>• Getting started with invoices and quotations</li>
            <li>• Payment setup and bank account verification</li>
            <li>• Account access, login, and billing questions</li>
            <li>• Reported transaction or receipt issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
