import { getPublicBlogPostBySlug } from "@/app/actions/admin"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { Metadata, ResolvingMetadata } from "next"

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params
  const { post } = await getPublicBlogPostBySlug(resolvedParams.slug)
 
  if (!post) {
    return { title: 'Not Found' }
  }
 
  return {
    title: `${post.title} | 247Billz Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image_url ? [post.cover_image_url] : [],
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author_name]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.cover_image_url ? [post.cover_image_url] : [],
    }
  }
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params
  const { success, post } = await getPublicBlogPostBySlug(resolvedParams.slug)

  if (!success || !post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] selection:bg-[#F97316]/30 font-sans">
      
      {/* Header */}
      <header className="border-b border-[#E2E8F0] dark:border-slate-800 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/blog" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <Link href="/" className="font-bold text-lg text-[#0F172A] dark:text-white flex items-center gap-2">
            247Billz
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <article>
          
          {/* Article Header */}
          <header className="text-center mb-12 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.1]">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-[#64748B] dark:text-slate-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author_name}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="w-full aspect-[21/9] md:aspect-[2.35/1] rounded-3xl overflow-hidden mb-16 shadow-lg border border-[#E2E8F0] dark:border-slate-800">
              <img 
                src={post.cover_image_url} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Body */}
          <div className="prose prose-lg prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-[#0F172A] dark:prose-h1:text-white prose-a:text-[#F97316] hover:prose-a:text-[#EA580C] max-w-[700px] mx-auto prose-img:rounded-xl">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

        </article>

        {/* CTA Section */}
        <div className="mt-24 p-10 bg-gradient-to-br from-[#0F172A] to-slate-900 rounded-3xl text-center shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to automate your billing?</h3>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">Join thousands of businesses getting paid faster with 247Billz.</p>
          <Link href="/signup">
            <button className="bg-[#F97316] hover:bg-[#EA580C] text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-orange-500/20">
              Get Started for Free
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] dark:border-slate-800 py-12 text-center text-sm text-[#64748B] dark:text-slate-400 mt-20">
        &copy; {new Date().getFullYear()} 247Billz. All rights reserved.
      </footer>
    </div>
  )
}
