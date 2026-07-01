import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, CheckCircle2, FileEdit, FileText } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

import { getAdminBlogPosts } from '@/app/actions/admin'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const { success, posts } = await getAdminBlogPosts()
  const displayPosts = posts || []
  
  const total = displayPosts.length
  const published = displayPosts.filter((p: any) => p.status === 'published').length
  const drafts = displayPosts.filter((p: any) => p.status === 'draft').length

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Blog Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Write, edit, and publish SEO-optimized articles.
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white">
            <Plus className="w-4 h-4" /> New Article
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Articles</CardDescription>
            <CardTitle className="text-3xl font-bold">{total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileText className="w-4 h-4" /> Indexed in database
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl font-bold">{published}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" /> Live on blog
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
              <FileEdit className="w-4 h-4" /> Pending review
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-[#E2E8F0] dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              type="search" 
              placeholder="Search articles..." 
              className="pl-8 bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-slate-800"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="border-[#E2E8F0] dark:border-slate-800 hover:bg-transparent">
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Article Title</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Author</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-center">Status</TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">Published</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">No articles found.</TableCell>
              </TableRow>
            ) : displayPosts.map((post: any) => (
              <TableRow key={post.id} className="border-[#E2E8F0] dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                  <Link href={`/admin/blog/${post.id}`} className="flex items-center gap-2 hover:text-[#F97316]">
                    <FileEdit className="w-4 h-4 text-slate-400" />
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">{post.author_name}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'} 
                    className={
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
                    }>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-slate-500 text-sm">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
