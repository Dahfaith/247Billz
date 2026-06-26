import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileEdit, Plus, Search, CheckCircle2, XCircle, LayoutTemplate, Globe } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

import { getAdminCMSPages } from '@/app/actions/admin'

export const dynamic = 'force-dynamic'

export default async function AdminCMSPage() {
  const { success, pages } = await getAdminCMSPages()
  const displayPages = pages || []
  
  const total = displayPages.length
  const published = displayPages.filter((p: any) => p.status === 'published').length
  const drafts = displayPages.filter((p: any) => p.status === 'draft').length

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Content Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage public pages, blog posts, and legal documents.
          </p>
        </div>
        <Button className="gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white">
          <Plus className="w-4 h-4" /> New Page
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Pages</CardDescription>
            <CardTitle className="text-3xl font-bold">{total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Globe className="w-4 h-4" /> All Indexed
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl font-bold">{published}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <CheckCircle2 className="w-4 h-4" /> Live on site
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl font-bold">{drafts}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <FileEdit className="w-4 h-4" /> Pending Review
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              type="search" 
              placeholder="Search pages..." 
              className="pl-8 bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-slate-800"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <LayoutTemplate className="w-4 h-4" /> Edit Layouts
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="border-[#E2E8F0] dark:border-slate-800 hover:bg-transparent">
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Page Title</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300">URL Path</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-center">Status</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">Last Edited</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayPages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">No pages found.</TableCell>
              </TableRow>
            ) : displayPages.map((page: any) => (
              <TableRow key={page.id} className="border-[#E2E8F0] dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                  <div className="flex items-center gap-2">
                    <FileEdit className="w-4 h-4 text-slate-400" />
                    {page.title}
                  </div>
                </TableCell>
                <TableCell className="text-slate-500 font-mono text-xs">{page.slug}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={page.status === 'published' ? 'default' : 'secondary'} 
                    className={
                      page.status === 'published' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
                    }>
                    {page.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-slate-500">{new Date(page.updated_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
