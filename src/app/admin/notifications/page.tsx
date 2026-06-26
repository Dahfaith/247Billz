import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Notifications</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          View important alerts and platform events.
        </p>
      </div>

      <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">You're all caught up!</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            There are no new system notifications at this time. Important administrative alerts will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
