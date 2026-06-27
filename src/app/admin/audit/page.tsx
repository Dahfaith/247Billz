import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default function AdminAuditPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Technical and compliance audit logs for platform events.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Audit Logs</CardTitle>
          <CardDescription>Export or review system events for compliance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">No audit table is configured yet. Use the export tools on the Reports page to retrieve audit data, or configure a central `audit_logs` table to enable viewing here.</div>
        </CardContent>
      </Card>
    </div>
  )
}
