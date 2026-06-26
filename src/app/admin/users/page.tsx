import { getAdminUsers, toggleUserBan } from '@/app/actions/admin'
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

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const { success, users } = await getAdminUsers()

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
          <Button variant="outline" className="gap-2 text-slate-700 dark:text-slate-300 border-[#E2E8F0] dark:border-slate-800">
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
              placeholder="Search users..."
              className="pl-9 bg-slate-50 dark:bg-[#020617] border-[#E2E8F0] dark:border-slate-800"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <div className="overflow-x-auto pb-4">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow className="border-[#E2E8F0] dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">User</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Role</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400">Joined</TableHead>
                  <TableHead className="font-medium text-slate-500 dark:text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {success && users?.map((user: any) => (
                  <TableRow key={user.id} className="border-[#E2E8F0] dark:border-slate-800">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                          {user.email ? user.email.substring(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {user.email || 'No email provided'}
                            {user.status === 'suspended' && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full uppercase">Banned</span>}
                          </div>
                          <div className="text-xs text-slate-500">{user.id}</div>
                        </div>
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
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-slate-800">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer">
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#E2E8F0] dark:bg-slate-800" />
                          <form action={async () => { "use server"; await toggleUserBan(user.id, user.status || 'active'); }}>
                            <button type="submit" className={`w-full flex items-center px-2 py-1.5 text-sm outline-none transition-colors rounded-sm ${user.status === 'suspended' ? 'text-green-600 hover:bg-slate-100 focus:bg-slate-100' : 'text-red-600 hover:bg-slate-100 focus:bg-slate-100'}`}>
                              {user.status === 'suspended' ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                              {user.status === 'suspended' ? 'Unban User' : 'Ban User'}
                            </button>
                          </form>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {(!users || users.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                      No users found.
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
