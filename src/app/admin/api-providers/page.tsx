import { getAdminSettings, updateAdminSettings } from '@/app/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { KeyRound, Shield, Save, CheckCircle2 } from 'lucide-react'
import { SubmitButton } from '@/components/submit-button'
import { PasswordField } from '@/components/password-field'

export const dynamic = 'force-dynamic'

export default async function AdminApiProvidersPage({ searchParams }: { searchParams?: { success?: string, error?: string } }) {
  const { success, settings } = await getAdminSettings()
  const data = settings || {}

  return (
    <div className="space-y-6 max-w-5xl">
      {(searchParams?.success || searchParams?.error) && (
        <div className={`rounded-2xl border p-4 text-sm ${searchParams?.success ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {searchParams?.success ? decodeURIComponent(searchParams.success) : decodeURIComponent(searchParams.error || 'Failed to save settings')}
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">API Providers</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage production API keys and external service integrations.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Payment Gateways */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b border-[#E2E8F0] dark:border-slate-800 pb-2">Payment Gateways</h2>
          <div className="grid gap-6 md:grid-cols-2">
            
            <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm relative overflow-hidden">
              <form action={updateAdminSettings}>
                <input type="hidden" name="form_type" value="api_providers" />
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Shield className="w-24 h-24" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#0ba4db]"></div>
                    Paystack Integration
                  </CardTitle>
                  <CardDescription>Primary processor for NGN and African currencies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <Label>Public Key</Label>
                    <Input name="paystack_public_key" type="text" defaultValue={data.paystack_public_key || ""} placeholder="pk_live_..." className="bg-slate-50 dark:bg-slate-900 font-mono text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      Secret Key
                      {data.paystack_secret_key ? (
                        <span className="text-[#10B981] text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Connected</span>
                      ) : (
                        <span className="text-[#F59E0B] text-xs flex items-center gap-1">Not Configured</span>
                      )}
                    </Label>
                    <PasswordField
                      name="paystack_secret_key"
                      defaultValue={data.paystack_secret_key || ""}
                      placeholder="sk_live_..."
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-[#E2E8F0] dark:border-slate-800">
                  <SubmitButton className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200" />
                </CardFooter>
              </form>
            </Card>

            <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm relative overflow-hidden">
              <form action={updateAdminSettings}>
                <input type="hidden" name="form_type" value="api_providers" />
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Shield className="w-24 h-24" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FB923C]"></div>
                    Flutterwave Integration
                  </CardTitle>
                  <CardDescription>Secondary processor for international reach.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <Label>Public Key</Label>
                    <Input name="flutterwave_public_key" type="text" defaultValue={data.flutterwave_public_key || ""} placeholder="FLWPUBK_..." className="bg-slate-50 dark:bg-slate-900 font-mono text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      Secret Key
                      {data.flutterwave_secret_key ? (
                        <span className="text-[#10B981] text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Connected</span>
                      ) : (
                        <span className="text-[#F59E0B] text-xs flex items-center gap-1">Not Configured</span>
                      )}
                    </Label>
                    <PasswordField
                      name="flutterwave_secret_key"
                      defaultValue={data.flutterwave_secret_key || ""}
                      placeholder="FLWSECK_..."
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-[#E2E8F0] dark:border-slate-800">
                  <Button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                    <Save className="w-4 h-4 mr-2" /> Save Configuration
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>

        {/* Email & Communication */}
        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-bold border-b border-[#E2E8F0] dark:border-slate-800 pb-2">Email & Communication</h2>
          <div className="grid gap-6 md:grid-cols-2">
            
            <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm relative overflow-hidden">
              <form action={updateAdminSettings}>
                <input type="hidden" name="form_type" value="api_providers" />
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <KeyRound className="w-24 h-24" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                    Resend (Transactional Emails)
                  </CardTitle>
                  <CardDescription>Powers all invoice emails, receipts, and alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      API Key
                      {data.resend_api_key ? (
                        <span className="text-[#10B981] text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Connected</span>
                      ) : (
                        <span className="text-[#F59E0B] text-xs flex items-center gap-1">Not Configured</span>
                      )}
                    </Label>
                    <PasswordField
                      name="resend_api_key"
                      defaultValue={data.resend_api_key || ""}
                      placeholder="re_..."
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-[#E2E8F0] dark:border-slate-800">
                  <Button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                    <Save className="w-4 h-4 mr-2" /> Save Configuration
                  </Button>
                </CardFooter>
              </form>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
