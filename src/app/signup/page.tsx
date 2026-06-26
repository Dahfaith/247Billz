import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { signup } from "@/app/actions/auth";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const resolvedParams = await searchParams;

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
      {/* Left Pane - Form */}
      <div className="flex-1 flex flex-col px-8 sm:px-16 lg:px-24 py-8 relative bg-background overflow-y-auto">
        <div className="mb-auto pb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto py-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">2</div>
            <span className="text-xl font-bold tracking-tight">247Billz</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create an account</h1>
          <p className="text-muted-foreground mb-6">Start managing your business finances today.</p>

          {resolvedParams?.message && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-6 font-medium">
              {resolvedParams.message}
            </div>
          )}

          <form action={signup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" name="businessName" placeholder="Acme Corp" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@company.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 h-11 text-base mt-2">
              Get Started for Free
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
            </div>

            <Button type="button" variant="outline" className="w-full h-11 text-base">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path fill="none" d="M1 1h22v22H1z" /></svg>
              Google (Coming Soon)
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            By creating an account, you agree to our <Link href="#" className="underline hover:text-primary">Terms of Service</Link> and <Link href="#" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>

          <div className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Pane - Feature Showcase */}
      <div className="flex-1 flex flex-col justify-between bg-secondary p-8 lg:p-12 text-white relative overflow-hidden min-h-[500px] lg:min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-[0.03] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-lg mt-auto mb-12">
          <h2 className="text-4xl font-bold mb-6">Join 10,000+ businesses growing with 247Billz.</h2>
          <div className="space-y-4">
            {[
              "Generate unauthenticated payment links.",
              "Beautiful, watermark-free invoices (Pro).",
              "Automated limit enforcement built-in."
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-lg text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
