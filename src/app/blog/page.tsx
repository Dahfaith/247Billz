import { getPublicBlogPosts } from "@/app/actions/admin"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog | 247Billz",
  description: "Read the latest tips, guides, and tutorials on invoicing, business management, and getting paid faster with 247Billz.",
}

export const dynamic = 'force-dynamic'

export default async function BlogIndexPage() {
  const { success, posts } = await getPublicBlogPosts()
  const displayPosts = posts || []

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] selection:bg-[#F97316]/30 font-sans">
      
      {/* Header */}
      <header className="border-b border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#1E293B]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl text-[#0F172A] dark:text-white flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              24
            </div>
            247Billz <span className="font-light text-slate-400">| Blog</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Website
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-slate-800 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            The <span className="text-[#F97316]">247Billz</span> Blog
          </h1>
          <p className="text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto">
            Actionable advice, guides, and stories to help you manage your business finances and get paid faster.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        
        {displayPosts.length === 0 ? (
          <div className="text-center py-20 text-[#64748B]">
            <p className="text-xl">No articles published yet.</p>
            <p className="mt-2">Check back later for awesome content!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-[#CBD5E1] dark:hover:border-slate-700 transition-all duration-300 transform hover:-translate-y-1">
                
                {/* Cover Image */}
                <div className="w-full aspect-[16/9] bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  {post.cover_image_url ? (
                    <img 
                      src={post.cover_image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900" />
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-slate-400 mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    <span className="mx-1">•</span>
                    {post.author_name}
                  </div>
                  
                  <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3 line-clamp-2 group-hover:text-[#F97316] transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-[#64748B] dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center text-sm font-semibold text-[#F97316] mt-auto">
                    Read Article 
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] dark:border-slate-800 py-12 bg-white dark:bg-[#1E293B] text-center text-sm text-[#64748B] dark:text-slate-400">
        &copy; {new Date().getFullYear()} 247Billz. All rights reserved.
      </footer>
    </div>
  )
}
