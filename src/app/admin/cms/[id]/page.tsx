import { getCMSPageById, createCMSPage, updateCMSPage } from "@/app/actions/admin"
import { notFound, redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default async function AdminCMSEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const isNew = id === 'new';
  
  let page: any = null
  if (!isNew) {
    const res = await getCMSPageById(id)
    if (!res.success || !res.page) notFound()
    page = res.page
  }

  async function handleSave(formData: FormData) {
    'use server'
    if (isNew) {
      await createCMSPage(formData)
    } else {
      await updateCMSPage(id, formData)
    }
    redirect('/admin/cms')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/cms">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
            {isNew ? 'Create New Page' : 'Edit Page'}
          </h1>
          <p className="text-[#64748B] dark:text-slate-400">
            {isNew ? 'Draft a new page for your website.' : 'Make changes to your existing content.'}
          </p>
        </div>
      </div>

      <Card className="p-6 bg-white dark:bg-[#0F172A]/80 border-[#E2E8F0] dark:border-slate-800">
        <form action={handleSave} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0F172A] dark:text-slate-300">Page Title</label>
              <Input 
                name="title" 
                defaultValue={page?.title} 
                required 
                placeholder="e.g. Privacy Policy"
                className="bg-[#F8FAFC] dark:bg-[#1E293B]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0F172A] dark:text-slate-300">URL Slug</label>
              <Input 
                name="slug" 
                defaultValue={page?.slug} 
                required 
                placeholder="e.g. privacy-policy"
                className="bg-[#F8FAFC] dark:bg-[#1E293B] font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0F172A] dark:text-slate-300">Status</label>
            <select 
              name="status" 
              defaultValue={page?.status || 'draft'}
              className="flex h-10 w-full rounded-md border border-input bg-[#F8FAFC] dark:bg-[#1E293B] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="draft">Draft (Hidden)</option>
              <option value="published">Published (Live)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0F172A] dark:text-slate-300">Content (HTML Supported)</label>
            <Textarea 
              name="content" 
              defaultValue={page?.content} 
              required
              className="min-h-[400px] bg-[#F8FAFC] dark:bg-[#1E293B] font-mono text-sm"
              placeholder="<h1>Your page content...</h1>"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-[#E2E8F0] dark:border-slate-800">
            <Link href="/admin/cms">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-[#F97316] hover:bg-[#EA580C] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Page
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
