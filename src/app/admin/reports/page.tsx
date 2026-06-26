import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, FileIcon, BarChart3, TrendingUp, Users } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export const dynamic = 'force-dynamic'

export default function AdminReportsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Reports</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Generate, schedule, and export comprehensive platform analytics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm flex flex-col">
          <form action="/api/admin/export" method="GET" className="flex flex-col h-full">
            <input type="hidden" name="type" value="revenue" />
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Export platform-wide processing volume and fees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select name="range" defaultValue="this_month">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="year_to_date">Year to Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select name="format" defaultValue="csv">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    <SelectItem value="pdf" disabled>PDF Document</SelectItem>
                    <SelectItem value="json" disabled>JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Button type="submit" className="w-full gap-2">
                <Download className="w-4 h-4" /> Generate Report
              </Button>
            </div>
          </form>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm flex flex-col">
          <form action="/api/admin/export" method="GET" className="flex flex-col h-full">
            <input type="hidden" name="type" value="growth" />
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Platform Growth</CardTitle>
              <CardDescription>Export user signups, churn, and active tenants.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select name="range" defaultValue="year_to_date">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="year_to_date">Year to Date</SelectItem>
                    <SelectItem value="all_time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select name="format" defaultValue="csv">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    <SelectItem value="pdf" disabled>PDF Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Button type="submit" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4" /> Generate Report
              </Button>
            </div>
          </form>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm flex flex-col md:col-span-2 lg:col-span-1">
          <form action="/api/admin/export" method="GET" className="flex flex-col h-full">
            <input type="hidden" name="type" value="audit" />
            <input type="hidden" name="format" value="csv" />
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 text-[#F97316]" />
              </div>
              <CardTitle>System Audit Logs</CardTitle>
              <CardDescription>Export technical logs for compliance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select name="event" defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="auth">Authentication (Logins)</SelectItem>
                    <SelectItem value="billing">Billing Errors</SelectItem>
                    <SelectItem value="admin">Super Admin Actions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select name="range" defaultValue="last_7_days">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Button type="submit" className="w-full gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white">
                <Download className="w-4 h-4" /> Generate Report
              </Button>
            </div>
          </form>
        </Card>
      </div>
      
      {/* Recent Exports */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Recent Exports</h2>
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
              <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-medium">Revenue_Q1_2026.csv</p>
                    <p className="text-xs text-slate-500">Generated 2 hours ago by You</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Download</Button>
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileIcon className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="font-medium">Platform_Growth_YTD.pdf</p>
                    <p className="text-xs text-slate-500">Generated yesterday by System</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Download</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
