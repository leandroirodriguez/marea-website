import { useAdminGuard } from '../hooks/useAdminGuard'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import mareaLogo from '../assets/marealogo.svg'

export default function AdminBlogEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    body_html: '',
    cover_url: '',
    published: false,
  })

  const adminVerified = useAdminGuard()

  useEffect(() => {
    if (id) {
      supabase.from('blog_posts').select('*').eq('id', id).single()
        .then(({ data }) => { if (data) setForm(data) })
    }
  }, [id, navigate])

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'title' && (isNew || form.slug === slugify(form.title))) {
      setForm(prev => ({ ...prev, slug: slugify(value) }))
    }
  }

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `blog/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('public-assets').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(path)
      setForm(prev => ({ ...prev, cover_url: publicUrl }))
    }
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      body_html: form.body_html,
      cover_url: form.cover_url,
      published: form.published,
      published_at: form.published ? (form.published_at || new Date().toISOString()) : null,
    }

    if (isNew) {
      await supabase.from('blog_posts').insert(payload)
    } else {
      await supabase.from('blog_posts').update(payload).eq('id', id)
    }
    setSaving(false)
    navigate('/admin/blog')
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <nav className="bg-on-background px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <img src={mareaLogo} alt="Marea" className="h-[1.2rem] brightness-0 invert opacity-80" />
          <div className="flex gap-6">
            <Link to="/admin/dashboard" className="text-[0.82rem] text-white/60">Dashboard</Link>
            <Link to="/admin/blog" className="text-[0.82rem] text-white font-semibold">Blog CMS</Link>
            <Link to="/admin/articles" className="text-[0.82rem] text-white/60">Articles CMS</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-headline text-2xl font-normal text-on-background">
            {isNew ? 'New Post' : 'Edit Post'}
          </h1>
          <Link to="/admin/blog" className="text-[0.85rem] text-primary font-medium">Back</Link>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col gap-5">
          <div>
            <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-1 block">Title</label>
            <input value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="Post title" className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white" />
          </div>

          <div>
            <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-1 block">Slug</label>
            <input value={form.slug} onChange={e => updateField('slug', e.target.value)} placeholder="post-url-slug" className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white" />
          </div>

          <div>
            <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-1 block">Excerpt</label>
            <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief summary for blog listing" rows={2} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white resize-y" />
          </div>

          <div>
            <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-1 block">Cover Image</label>
            {form.cover_url && <img src={form.cover_url} alt="" className="w-full max-h-[200px] object-cover rounded-xl mb-3" />}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-[0.85rem]" />
            {uploading && <p className="text-[0.8rem] text-outline mt-1">Uploading...</p>}
          </div>

          <div>
            <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-1 block">Body (HTML)</label>
            <textarea value={form.body_html} onChange={e => setForm({ ...form, body_html: e.target.value })} placeholder="<p>Write your post content in HTML...</p>" rows={16} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-[0.82rem] bg-white resize-y font-mono leading-relaxed" />
            <p className="text-[0.72rem] text-outline-variant mt-1">
              Use HTML tags: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;blockquote&gt;, &lt;img src="..."&gt;
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
            <label htmlFor="published" className="text-[0.85rem] text-on-surface-variant">Publish immediately</label>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.title}
            className={`bg-primary text-on-primary border-none py-3 rounded-full text-sm font-semibold cursor-pointer ${saving || !form.title ? 'opacity-50' : 'opacity-100'}`}
          >
            {saving ? 'Saving...' : isNew ? 'Create Post' : 'Update Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
