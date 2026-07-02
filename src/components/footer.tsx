import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          <div className="flex-1">
            <Link href="/" className="font-bold text-lg text-primary tracking-tight">247Billz</Link>
            <p className="mt-2 text-sm text-muted-foreground">Create and send invoices. Get paid faster.</p>
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium">Product</h4>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                <li><Link href="/how-it-works" className="hover:text-foreground">How it works</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Company</h4>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/support" className="hover:text-foreground">Support</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Legal</h4>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} 247Billz. All rights reserved.</div>
      </div>
    </footer>
  );
}
