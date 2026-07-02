'use client'

import { useState } from 'react'
import { toggleUserBan } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Search, Download, Users, Ban, Mail, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function AdminUsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  const filteredUsers = (initialUsers || []).filter((u: any) => {
    const query = searchQuery.toLowerCase()
    return (
      u.email?.toLowerCase().includes(query) ||
      u.id?.toLowerCase().includes(query) ||
      u.city?.toLowerCase().includes(query) ||
      u.country?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    )
  })

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      toast.error("No users to export")
      return
    }
    const headers = ["ID", "Email", "City", "Country", "Role", "Status", "Joined"]
    const csvRows = [headers.join(",")]
    
    filteredUsers.forEach((u: any) => {
      const row = [
        u.id,
        u.email || '',
        u.city || 'Unknown',
        u.country || 'Unknown',
        u.role || 'user',
        u.status || 'active',
        new Date(u.created_at).toISOString()
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `users_export_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Users exported successfully")
  }

  const handleToggleBan = async (id: string, status: string) => {
    setIsLoading(id)
    try {
      await toggleUserBan(id, status || 'active')
      const newStatus = status === 'suspended' ? 'unbanned' : 'banned'
      toast.success(`User has been ${newStatus}.`)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || "Failed to toggle user ban")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Users</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage all registered users across the platform.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button onClick={handleExportCSV} variant="outline" className="gap-2 text-slate-700 dark:text-slate-300 border-[#E2E8F0] dark:border-slate-800">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            User Directory
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search by email, location, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-[#020617] border-[#E2E8F0] dark:border-slate-800"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto pb-4">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow className="border-[#E2E8F0] dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">User</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Location</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Role</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Joined</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="border-[#E2E8F0] dark:border-slate-800">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.status === 'suspended' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                          {user.email ? user.email.substring(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div>
                          <div className={`font-medium ${user.status === 'suspended' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                            {user.email || 'No email provided'}
                            {user.status === 'suspended' && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full uppercase no-underline inline-block">Banned</span>}
                          </div>
                          <div className="text-xs text-slate-500">{user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                        {user.city === 'Unknown' && user.country === 'Unknown' ? 'Location Unknown' : `${user.city || ''}, ${user.country || ''}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}
                      >
                        {user.role || 'user'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading === user.id}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-slate-800">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => toast("Emailing users coming soon!", { icon: '✉️' })}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#E2E8F0] dark:bg-slate-800" />
                          <DropdownMenuItem 
                            className={`cursor-pointer ${user.status === 'suspended' ? 'text-green-600 focus:text-green-600' : 'text-red-600 focus:text-red-600'}`}
                            onClick={() => handleToggleBan(user.id, user.status || 'active')}
                          >
                            {user.status === 'suspended' ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                            {user.status === 'suspended' ? 'Unban User' : 'Ban User'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No users found matching "{searchQuery}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
