import { getAdminDashboardStats } from '@/app/actions/admin'
import { AdminDashboardClient } from './admin-dashboard-client'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const { success, stats, recentRegistrations, recentTransactions, chartData } = await getAdminDashboardStats()

  if (!success) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-slate-500">Failed to load platform statistics.</p>
      </div>
    )
  }

  return (
    <AdminDashboardClient 
      stats={stats} 
      recentRegistrations={recentRegistrations || []} 
      recentTransactions={recentTransactions || []} 
      chartData={chartData || []}
    />
  )
}
