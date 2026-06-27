import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

type Props = { searchParams?: { event?: string; range?: string; page?: string } }

export default async function AdminAuditPage({ searchParams }: Props) {
  const supabase = await createClient()

  const event = searchParams?.event || 'all'
  const range = searchParams?.range || 'last_7_days'
  const page = parseInt(searchParams?.page || '1', 10)
  const limit = 25
  const offset = (Math.max(page, 1) - 1) * limit

  // Build date filter
  let fromDate = new Date()
  if (range === 'today') fromDate = new Date(new Date().setHours(0,0,0,0))
  else if (range === 'last_7_days') fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  else if (range === 'last_30_days') fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  else fromDate = new Date(0)

  let query = supabase.from('audit_logs').select('id, event_type, message, meta, user_id, business_id, created_at').gte('created_at', fromDate.toISOString())
  if (event && event !== 'all') query = query.eq('event_type', event)

  const { data: rows, error } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)
  const { count } = await supabase.from('audit_logs').select('id', { count: 'exact' }).gte('created_at', fromDate.toISOString())

  if (error) {
    return (
      <div className="space-y-6 max-w-5xl">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <div className="text-red-600">Failed to load audit logs: {error.message}</div>
      </div>
    )
  }

  const total = count || 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Technical and compliance audit logs for platform events.</p>
      </div>

      <form className="flex gap-3 items-end mb-4">
        <div>
          <label className="text-sm text-slate-600 block mb-1">Event Type</label>
          <select name="event" defaultValue={event} className="border px-3 py-2 rounded">
            <option value="all">All Events</option>
            <option value="auth">Authentication</option>
            <option value="billing">Billing</option>
            <option value="admin">Admin Actions</option>
            <option value="payments">Payments</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-600 block mb-1">Date Range</label>
          <select name="range" defaultValue={range} className="border px-3 py-2 rounded">
            <option value="today">Today</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="all_time">All Time</option>
          </select>
        </div>

        <div>
          <button type="submit" className="bg-[#F97316] text-white px-4 py-2 rounded">Filter</button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>System Audit Logs</CardTitle>
          <CardDescription>Showing {rows?.length ?? 0} of {total} events. Page {page} of {totalPages}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-600 text-left">
                <tr>
                  <th className="p-2">Time</th>
                  <th className="p-2">Event</th>
                  <th className="p-2">Message</th>
                  <th className="p-2">User</th>
                  <th className="p-2">Business</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((r: any) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2 text-xs text-slate-500">{format(new Date(r.created_at), 'yyyy-MM-dd HH:mm')}</td>
                    <td className="p-2 font-medium">{r.event_type}</td>
                    <td className="p-2 truncate max-w-xl">{r.message}</td>
                    <td className="p-2 text-xs">{r.user_id || '-'}</td>
                    <td className="p-2 text-xs">{r.business_id || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-slate-600">Total events: {total}</div>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`?event=${event}&range=${range}&page=${page - 1}`} className="px-3 py-1 border rounded">Previous</a>
              )}
              {page < totalPages && (
                <a href={`?event=${event}&range=${range}&page=${page + 1}`} className="px-3 py-1 border rounded">Next</a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
