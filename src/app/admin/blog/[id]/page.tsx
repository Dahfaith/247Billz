'use client';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getBlogPostById, createBlogPost, updateBlogPost } from "@/app/actions/admin"
import { toast } from "sonner"
import React from 'react';

// Using basic unwrap of params since we're using use client.
export default function AdminBlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unwrap params using React.use
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) {
      getBlogPostById(id).then(res => {
        if (res.success && res.post) {
          setPost(res.post);
          setCoverPreview(res.post.cover_image_url);
        } else {
          toast.error("Failed to load post");
          router.push('/admin/blog');
        }
        setLoading(false);
      });
    }
  }, [id, isNew, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setCoverPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    // Overwrite the cover_image_url input with our base64 preview (or keep existing string URL if not changed)
    if (coverPreview) {
      formData.set('cover_image_url', coverPreview);
    }
    
    let res;
    if (isNew) {
      res = await createBlogPost(formData);
    } else {
      res = await updateBlogPost(id, formData);
    }

    if (res.success) {
      toast.success("Post saved successfully!");
      router.push('/admin/blog');
    } else {
      toast.error("Error saving post: " + res.error);
      setSaving(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
            {isNew ? 'Draft New Article' : 'Edit Article'}
          </h1>
          <p className="text-[#64748B] dark:text-slate-400">
            Create high-quality, rich SEO content for your blog.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A]/80 border border-[#E2E8F0] dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0F172A] dark:text-slate-300">Article Title</label>
                <Input 
                  name="title" 
                  defaultValue={post?.title} 
                  required 
                  placeholder="e.g. 5 Ways to Automate Your Business"
                  className="bg-[#F8FAFC] dark:bg-[#1E293B] text-lg font-medium py-6"
                />
              </div>
              
              {/* Slug and Author */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0F172A] dark:text-slate-300">URL Slug</label>
                  <Input 
                    name="slug" 
                    defaultValue={post?.slug} 
                    required 
                    placeholder="e.g. 5-ways-to-automate"
                    className="bg-[#F8FAFC] dark:bg-[#1E293B] font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0F172A] dark:text-slate-300">Author Name</label>
                  <Input 
                    name="author_name" 
                    defaultValue={post?.author_name || '247Billz Team'} 
                    required 
                    className="bg-[#F8FAFC] dark:bg-[#1E293B]"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0F172A] dark:text-slate-300">Short Excerpt (For SEO & Previews)</label>
                <Textarea 
                  name="excerpt" 
                  defaultValue={post?.excerpt} 
                  required
                  maxLength={160}
                  className="bg-[#F8FAFC] dark:bg-[#1E293B] resize-none h-20"
                  placeholder="A short, catchy summary for the blog index and SEO meta description..."
                />
              </div>

              {/* Main Content (Rich Content Placeholder) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0F172A] dark:text-slate-300">Article Body (HTML Supported)</label>
                <Textarea 
                  name="content" 
                  defaultValue={post?.content} 
                  required
                  className="min-h-[500px] bg-[#F8FAFC] dark:bg-[#1E293B] font-mono text-sm"
                  placeholder="<h1>Your article heading</h1><p>Start writing rich content here...</p>"
                />
                <p className="text-xs text-slate-500">Supports standard HTML tags (`&lt;h1&gt;`, `&lt;p&gt;`, `&lt;strong&gt;`, `&lt;ul&gt;`, etc) for rich formatting.</p>
              </div>

            </div>

            {/* Sidebar Settings */}
            <div className="space-y-8">
              
              {/* Status */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-border space-y-3">
                <label className="text-sm font-semibold text-[#0F172A] dark:text-slate-300">Publishing Status</label>
                <select 
                  name="status" 
                  defaultValue={post?.status || 'draft'}
                  className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-[#1E293B] px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="draft">Draft (Hidden)</option>
                  <option value="published">Published (Live)</option>
                </select>
                <Button type="submit" disabled={saving} className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white">
                  {saving ? 'Saving...' : (
                    <><Save className="w-4 h-4 mr-2" /> Save Article</>
                  )}
                </Button>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#0F172A] dark:text-slate-300">Cover Image</label>
                <div className="w-full aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden relative group cursor-pointer hover:bg-slate-100 transition-colors">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 p-4 text-center">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload Image</span>
                      <span className="text-xs mt-1">Recommended: 1200x630px</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleImageChange}
                  />
                </div>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
