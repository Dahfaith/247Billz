'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Building2, Users, CreditCard, Activity, ArrowUpRight, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

export function AdminDashboardClient({ 
  stats, 
  recentRegistrations, 
  recentTransactions,
  chartData
}: {
  stats: any,
  recentRegistrations: any[],
  recentTransactions: any[],
  chartData: any[]
}) {
  const [chartRange, setChartRange] = useState<'3m' | '6m' | '12m'>('6m')

  // Calculate displayed chart data based on selected range
  const displayChartData = chartData?.slice(
    chartRange === '3m' ? 9 : chartRange === '6m' ? 6 : 0
  ) || [];
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  }

  return (
    <div className="space-y-10 relative">
      {/* Dynamic Background Orb */}
      <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#F97316]/10 dark:bg-[#F97316]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '4s' }} />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Platform Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Welcome back. Here is what is happening across 247Billz today.
        </p>
      </motion.div>

      {/* Top Metrics Cards */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="group min-w-0">
          <Card className="bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-md border-white/40 dark:border-slate-800/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Volume (30d)</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 transform group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {formatCurrency(stats?.monthlyRevenue || 0, 'NGN')}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.5% vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="group min-w-0">
          <Card className="bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-md border-white/40 dark:border-slate-800/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Businesses</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {stats?.totalBusinesses}
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total tenants registered
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="group min-w-0">
          <Card className="bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-md border-white/40 dark:border-slate-800/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subscriptions</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {stats?.activeSubscriptions}
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Active recurring plans
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="group min-w-0">
          <Card className="bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-md border-white/40 dark:border-slate-800/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Failed Txns</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 transform group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {stats?.failedTransactionsCount}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100/80 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold">
                <span>Requires attention</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Revenue Chart Section */}
      <motion.div variants={itemVariants} className="min-w-0">
        <Card className="bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-md border-white/40 dark:border-slate-800/60 shadow-lg rounded-2xl overflow-hidden relative">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800/60 bg-white/30 dark:bg-[#0F172A]/30">
            <div>
              <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Platform Revenue</CardTitle>
              <CardDescription className="text-sm font-medium mt-1">Total processing volume across all businesses.</CardDescription>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg mt-4 sm:mt-0">
              <button 
                onClick={() => setChartRange('3m')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartRange === '3m' ? 'bg-white dark:bg-slate-700 text-[#F97316] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                3 Months
              </button>
              <button 
                onClick={() => setChartRange('6m')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartRange === '6m' ? 'bg-white dark:bg-slate-700 text-[#F97316] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                6 Months
              </button>
              <button 
                onClick={() => setChartRange('12m')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartRange === '12m' ? 'bg-white dark:bg-slate-700 text-[#F97316] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                12 Months
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-2 pr-6 pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94A3B8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                    padding={{ left: 15, right: 15 }}
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    width={50}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `₦${(value / 1000).toFixed(0)}k`;
                      return `₦${value}`;
                    }} 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.2)', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(8px)'
                    }}
                    itemStyle={{ color: '#F97316', fontWeight: 700 }}
                    formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Total Revenue']}
                    labelStyle={{ color: '#64748B', marginBottom: '4px', fontWeight: 600 }}
                    cursor={{ stroke: '#F97316', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.5 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#F97316" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    activeDot={{ r: 6, fill: "#F97316", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tables Section */}
      <motion.div 
        className="grid gap-8 lg:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Recent Registrations */}
        <motion.div variants={itemVariants} className="min-w-0">
          <Card className="bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-md border-white/40 dark:border-slate-800/60 shadow-lg rounded-2xl overflow-hidden h-full flex flex-col">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 bg-white/30 dark:bg-[#0F172A]/30">
              <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Recent Signups</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentRegistrations?.map((business: any) => (
                  <div key={business.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 shadow-sm shadow-indigo-100 dark:shadow-none">
                        {business.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">{business.name}</p>
                        <p className="text-sm text-slate-500">{business.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-sm border border-slate-200/50 dark:border-slate-700 uppercase tracking-wider">
                      {business.subscription_tier}
                    </div>
                  </div>
                ))}
                {(!recentRegistrations || recentRegistrations.length === 0) && (
                  <div className="p-8 text-center text-slate-500">No recent signups</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="min-w-0">
          <Card className="bg-white/70 dark:bg-[#0F172A]/60 backdrop-blur-md border-white/40 dark:border-slate-800/60 shadow-lg rounded-2xl overflow-hidden h-full flex flex-col">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 bg-white/30 dark:bg-[#0F172A]/30">
              <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Platform Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentTransactions?.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm
                        ${tx.status === 'successful' || tx.status === 'paid' ? 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-400 shadow-emerald-100 dark:shadow-none' : 
                          tx.status === 'failed' ? 'bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/50 dark:to-red-900/50 text-rose-700 dark:text-rose-400 shadow-rose-100 dark:shadow-none' : 
                          'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 text-amber-700 dark:text-amber-400 shadow-amber-100 dark:shadow-none'}
                      `}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          {formatCurrency(tx.amount, 'NGN')}
                        </p>
                        <p className="text-sm text-slate-500 font-medium">
                          Inv #{tx.invoices?.invoice_number || 'N/A'} • {tx.payment_method || 'Link'}
                        </p>
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border uppercase tracking-wider
                      ${tx.status === 'successful' || tx.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/20 dark:border-emerald-800/50' : 
                        tx.status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-900/20 dark:border-rose-800/50' : 
                        'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-900/20 dark:border-amber-800/50'}
                    `}>
                      {tx.status}
                    </div>
                  </div>
                ))}
                {(!recentTransactions || recentTransactions.length === 0) && (
                  <div className="p-8 text-center text-slate-500">No recent payments</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
