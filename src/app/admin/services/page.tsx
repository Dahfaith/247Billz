import { getAdminSettings, updateAdminSettings } from '@/app/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Server, Settings2, ShieldCheck, Languages, Receipt, Calculator, Save } from 'lucide-react'
import { SubmitButton } from '@/components/submit-button'

export const dynamic = 'force-dynamic'

export default async function AdminServicesPage() {
  const { success, settings } = await getAdminSettings()
  
  // Default fallback if table is empty
  const data = settings || {
    enable_invoicing: true,
    enable_estimates: true,
    enable_receipts: true,
    enable_subscriptions: false,
    enable_tax_computation: true,
    enable_multi_currency: true,
    enable_multi_language: false,
    require_2fa: false,
    strict_kyc_mode: true
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Services & Features</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Globally manage which features are available to businesses on the platform.
        </p>
      </div>

      <form action={updateAdminSettings}>
        <input type="hidden" name="form_type" value="services" />
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Core Billing Engine */}
          <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <Server className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-lg">Core Billing Engine</CardTitle>
              </div>
              <CardDescription>Fundamental invoicing and payment features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Invoicing Module</Label>
                  <p className="text-sm text-slate-500">Allow users to generate and send invoices.</p>
                </div>
                <Switch name="enable_invoicing" value="on" defaultChecked={data.enable_invoicing} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Estimates & Quotations</Label>
                  <p className="text-sm text-slate-500">Allow users to create project estimates.</p>
                </div>
                <Switch name="enable_estimates" value="on" defaultChecked={data.enable_estimates} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Receipt Generation</Label>
                  <p className="text-sm text-slate-500">Automatically generate PDF receipts after payment.</p>
                </div>
                <Switch name="enable_receipts" value="on" defaultChecked={data.enable_receipts} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Recurring Billing (Subscriptions)</Label>
                  <p className="text-sm text-slate-500">Let businesses charge their clients on a schedule.</p>
                </div>
                <Switch name="enable_subscriptions" value="on" defaultChecked={data.enable_subscriptions} />
              </div>
            </CardContent>
          </Card>

          {/* Localization & Taxes */}
          <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <Languages className="w-5 h-5 text-purple-500" />
                <CardTitle className="text-lg">Localization & Taxes</CardTitle>
              </div>
              <CardDescription>Regional features and tax compliance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-slate-400" />
                    Tax Computation Engine
                  </Label>
                  <p className="text-sm text-slate-500">Enable automatic VAT/GST calculations.</p>
                </div>
                <Switch name="enable_tax_computation" value="on" defaultChecked={data.enable_tax_computation} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Multi-Currency Support</Label>
                  <p className="text-sm text-slate-500">Allow invoicing in USD, GBP, EUR, NGN.</p>
                </div>
                <Switch name="enable_multi_currency" value="on" defaultChecked={data.enable_multi_currency} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Multi-Language Invoices</Label>
                  <p className="text-sm text-slate-500">Translate invoices to client's local language.</p>
                </div>
                <Switch name="enable_multi_language" value="on" defaultChecked={data.enable_multi_language} />
              </div>
            </CardContent>
          </Card>

          {/* Security & Compliance */}
          <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                <CardTitle className="text-lg">Security & Compliance Limits</CardTitle>
              </div>
              <CardDescription>Global rate limits and security flags.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between border border-[#E2E8F0] dark:border-slate-800 p-4 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Require 2FA</Label>
                  <p className="text-sm text-slate-500">Force Two-Factor Auth for all Businesses.</p>
                </div>
                <Switch name="require_2fa" value="on" defaultChecked={data.require_2fa} />
              </div>
              <div className="flex items-center justify-between border border-[#E2E8F0] dark:border-slate-800 p-4 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Strict KYC Mode</Label>
                  <p className="text-sm text-slate-500">Block invoice sending until business is verified.</p>
                </div>
                <Switch name="strict_kyc_mode" value="on" defaultChecked={data.strict_kyc_mode} />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-[#E2E8F0] dark:border-slate-800 flex justify-end">
              <SubmitButton />
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
