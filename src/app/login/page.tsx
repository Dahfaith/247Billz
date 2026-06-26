import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { login } from "@/app/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
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

          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-6">Log in to your 247Billz account to continue.</p>

          {resolvedParams?.message && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-6 font-medium">
              {resolvedParams.message}
            </div>
          )}

          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@company.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline font-medium">Forgot password?</Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 h-11 text-base mt-2">
              Log in
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

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>

      {/* Right Pane - Feature Showcase */}
      <div className="flex-1 flex flex-col justify-between bg-secondary p-8 lg:p-12 text-white relative overflow-hidden min-h-[500px] lg:min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-[0.03] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-lg mt-auto mb-12">
          <h2 className="text-4xl font-bold mb-6">Built for serious businesses.</h2>
          <div className="space-y-4">
            {[
              "Create professional invoices in seconds.",
              "Track your outstanding payments easily.",
              "Offer seamless checkout experiences for clients."
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-lg text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 border-t border-white/10 pt-8 mt-12">
          <p className="text-slate-400 italic">
            "247Billz has completely transformed how quickly we get paid. The automated limits and professional receipts are a game changer."
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">G</div>
            <div>
              <p className="font-semibold text-sm">Gideon Oluwatobi</p>
              <p className="text-xs text-slate-400">CEO, 247Billz</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
