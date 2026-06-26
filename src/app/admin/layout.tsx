'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { 
  LayoutDashboard, Building2, Users, FileText, CreditCard, 
  Wallet, Settings, Box, Database, BarChart3, UsersRound, 
  Bell, HeadphonesIcon, FileEdit, ShieldAlert, User, LogOut,
  Menu, X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Businesses', href: '/admin/businesses', icon: Building2 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Transactions', href: '/admin/transactions', icon: FileText },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Payments', href: '/admin/payments', icon: Wallet },
  { name: 'Services', href: '/admin/services', icon: Box },
  { name: 'API Providers', href: '/admin/api-providers', icon: Database },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Affiliates', href: '/admin/affiliates', icon: UsersRound },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Support Tickets', href: '/admin/support', icon: HeadphonesIcon },
  { name: 'CMS', href: '/admin/cms', icon: FileEdit },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Audit Logs', href: '/admin/audit', icon: ShieldAlert },
  { name: 'Settings', href: '/admin/api-providers', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-slate-200 font-sans flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0F172A] border-r border-[#E2E8F0] dark:border-slate-800 transform lg:translate-x-0 lg:static lg:block flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#E2E8F0] dark:border-slate-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#F97316] to-orange-400">
              Admin
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-orange-50 text-[#F97316] dark:bg-orange-900/20 dark:text-orange-400' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#F97316]' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-[#E2E8F0] dark:border-slate-800 space-y-1">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50">
            <User className="w-5 h-5 text-slate-400" />
            Profile
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
            <LogOut className="w-5 h-5 text-red-500" />
            Logout
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-slate-800 sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#F97316] font-bold border border-orange-200">
              S
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-7xl"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0F172A]">
          Designed & Developed by <a href="https://www.visioreach.co" target="_blank" className="text-[#F97316] hover:underline">VisioReach</a>
        </footer>
      </div>
    </div>
  )
}
