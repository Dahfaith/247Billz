import { fetchBanks } from "@/app/actions/settings"
import { createClient } from "@/lib/supabase/server"
import BankSettingsForm from "@/components/bank-settings-form"
import BusinessSettingsForm from "@/components/business-settings-form"
import PersonalSettingsForm from "@/components/personal-settings-form"
import PasswordSettingsForm from "@/components/password-settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch Business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  // Fetch last bank update from audit logs
  const { data: lastBankLog } = await supabase
    .from('audit_logs')
    .select('created_at')
    .eq('business_id', business?.id)
    .eq('event_type', 'BANK_DETAILS_UPDATED')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastBankUpdate = lastBankLog?.created_at || null
  const banks = await fetchBanks()
  
  // Deduplicate banks by code (Flutterwave sometimes returns duplicates)
  const uniqueBanks = Array.from(new Map(banks.map((b: any) => [b.code, b])).values())
  
  // Sort banks alphabetically
  const sortedBanks = (uniqueBanks as any[]).sort((a: any, b: any) => a.name.localeCompare(b.name))

  return (
    <div className="min-h-screen bg-muted/20 p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your business profile and payout settings.</p>
      </div>

      <div className="max-w-4xl space-y-8">
        <PersonalSettingsForm user={user} />
        <BusinessSettingsForm business={business} />
        <BankSettingsForm banks={sortedBanks} business={business} lastBankUpdate={lastBankUpdate} />
        <PasswordSettingsForm />
      </div>
    </div>
  )
}
