import { useAdminGuard } from '../hooks/useAdminGuard'
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fixStorageUrl } from '../lib/images'
import mareaLogo from '../assets/marealogo.svg'

export default function AdminBlogEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    body_html: '',
    cover_url: '',
    published: false,
  })

  const bodyRef = useRef(null)
  const adminVerified = useAdminGuard()

  const inlineImageRef = useRef(null)

  function insertHtml(before, after = '') {
    const el = bodyRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = form.body_html.substring(start, end)
    const replacement = before + (selected || 'text') + after
    const newBody = form.body_html.substring(0, start) + replacement + form.body_html.substring(end)
    setForm(prev => ({ ...prev, body_html: newBody }))
    setTimeout(() => {
      el.focus()
      el.selectionStart = start + before.length
      el.selectionEnd = start + before.length + (selected || 'text').length
    }, 0)
  }

  async function handleInlineImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('public-assets').upload(path, file, { upsert: true })
    if (error) {
      console.error('Inline image upload failed:', error)
      alert(`Image upload failed: ${error.message}`)
    } else {
      const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(path)
      const el = bodyRef.current
      const pos = el ? el.selectionStart : form.body_html.length
      const imgTag = `\n<img src="${publicUrl}" alt="" style="width:100%;border-radius:12px;margin:1rem 0" />\n`
      const newBody = form.body_html.substring(0, pos) + imgTag + form.body_html.substring(pos)
      setForm(prev => ({ ...prev, body_html: newBody }))
    }
    setUploading(false)
    if (inlineImageRef.current) inlineImageRef.current.value = ''
  }

  useEffect(() => {
    if (!adminVerified) return
    if (id) {
      supabase.from('blog_posts').select('*').eq('id', id).single()
        .then(({ data }) => { if (data) setForm({ ...data, cover_url: fixStorageUrl(data.cover_url) || '' }) })
    }
  }, [id, adminVerified])

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
    setUploadStatus('Uploading image...')
    const ext = file.name.split('.').pop()
    const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('public-assets').upload(path, file, { upsert: true })
    if (error) {
      console.error('Cover image upload failed:', error)
      setUploadStatus(`Upload failed: ${error.message}`)
      setTimeout(() => setUploadStatus(''), 4000)
    } else {
      const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(path)
      setForm(prev => ({ ...prev, cover_url: publicUrl }))
      setUploadStatus('Image uploaded — remember to save!')
      setTimeout(() => setUploadStatus(''), 4000)
    }
    setUploading(false)
  }

  function handleCoverDrop(e) {
    e.preventDefault()
    e.currentTarget.classList.remove('ring-2', 'ring-primary')
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload({ target: { files: [file] } })
    }
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

    let result
    if (isNew) {
      result = await supabase.from('blog_posts').insert(payload)
    } else {
      result = await supabase.from('blog_posts').update(payload).eq('id', id)
    }
    if (result.error) {
      console.error('Save failed:', result.error)
      alert(`Save failed: ${result.error.message}`)
      setSaving(false)
      return
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
            <label
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-primary') }}
              onDragLeave={e => e.currentTarget.classList.remove('ring-2', 'ring-primary')}
              onDrop={handleCoverDrop}
              className={`flex flex-col items-center justify-center gap-1.5 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                uploading ? 'border-primary/50 bg-primary/[0.03]' : 'border-outline-variant/40 hover:border-primary/50 hover:bg-primary/[0.02]'
              }`}
            >
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {uploading ? (
                <span className="material-symbols-outlined text-primary text-[20px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-outline text-[20px]">cloud_upload</span>
              )}
              <span className="text-[0.75rem] text-outline-variant">
                {uploading ? 'Uploading...' : 'Click or drag image here'}
              </span>
            </label>
            {uploadStatus && (
              <p className={`text-[0.75rem] mt-2 font-medium ${
                uploadStatus.includes('failed') ? 'text-tertiary' : 'text-primary'
              }`}>
                {uploadStatus}
              </p>
            )}
            {form.cover_url && (
              <button onClick={() => { setForm(prev => ({ ...prev, cover_url: '' })); setUploadStatus('') }} className="bg-transparent border-none text-[0.75rem] text-tertiary cursor-pointer mt-2 hover:underline">
                Remove cover image
              </button>
            )}
          </div>

          <div>
            <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-1 block">Body (HTML)</label>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 mb-2 p-2 bg-surface-container-low rounded-xl border border-outline-variant/50">
              <button type="button" onClick={() => insertHtml('<h2>', '</h2>')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-[0.75rem] font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Heading">H2</button>
              <button type="button" onClick={() => insertHtml('<h3>', '</h3>')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-[0.75rem] font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Subheading">H3</button>
              <div className="w-px bg-outline-variant/30 mx-1" />
              <button type="button" onClick={() => insertHtml('<strong>', '</strong>')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-[0.75rem] font-bold text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Bold">B</button>
              <button type="button" onClick={() => insertHtml('<em>', '</em>')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-[0.75rem] italic text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Italic">I</button>
              <div className="w-px bg-outline-variant/30 mx-1" />
              <button type="button" onClick={() => insertHtml('<p>', '</p>')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Paragraph">
                <span className="material-symbols-outlined text-[16px]">notes</span>
              </button>
              <button type="button" onClick={() => insertHtml('<ul>\n  <li>', '</li>\n</ul>')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer" title="List">
                <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
              </button>
              <button type="button" onClick={() => insertHtml('<blockquote>', '</blockquote>')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Blockquote">
                <span className="material-symbols-outlined text-[16px]">format_quote</span>
              </button>
              <button type="button" onClick={() => insertHtml('<a href="url">', '</a>')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Link">
                <span className="material-symbols-outlined text-[16px]">link</span>
              </button>
              <button type="button" onClick={() => inlineImageRef.current?.click()} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Upload image into post">
                <span className="material-symbols-outlined text-[16px]">image</span>
              </button>
              <input ref={inlineImageRef} type="file" accept="image/*" onChange={handleInlineImageUpload} className="hidden" />
              {uploading && <span className="text-[0.72rem] text-outline ml-2">Uploading...</span>}
            </div>
            <textarea ref={bodyRef} value={form.body_html} onChange={e => setForm({ ...form, body_html: e.target.value })} placeholder="<p>Write your post content in HTML...</p>" rows={16} className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-[0.82rem] bg-white resize-y font-mono leading-relaxed" />
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
