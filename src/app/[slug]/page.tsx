import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Use anon client for public read access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const revalidate = 60 // Cache the page for 60 seconds

export default async function PublicCMSPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { data: page, error } = await supabase
    .from('cms_pages')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('status', 'published')
    .single()

  if (error || !page) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] selection:bg-[#F97316]/30">
      {/* Page Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <article className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-4xl prose-h1:text-[#0F172A] dark:prose-h1:text-white prose-a:text-[#F97316] hover:prose-a:text-[#EA580C] max-w-none bg-white dark:bg-[#1E293B] p-8 md:p-12 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </article>
      </main>

    </div>
  )
}
