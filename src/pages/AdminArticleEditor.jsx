import { useAdminGuard } from '../hooks/useAdminGuard'
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { marked } from 'marked'
import { supabase } from '../lib/supabase'
import { articleImage, fixStorageUrl } from '../lib/images'
import { compressImage } from '../lib/compressImage'

marked.setOptions({ breaks: true, gfm: true })
import mareaLogo from '../assets/marealogo.svg'

const CATEGORIES = ['Sleep', 'Mood', 'Brain fog', 'Hot flashes', 'HRT', 'Lifestyle', 'Intimacy']

export default function AdminArticleEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [preview, setPreview] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'Sleep',
    tags: '',
    read_time: 5,
    is_premium: false,
    author: 'Dr. Rodriguez, MD, FACOG',
    body: '',
    cover_url: '',
    published: false,
  })

  const bodyRef = useRef(null)
  const inlineImageRef = useRef(null)
  const adminVerified = useAdminGuard()

  // AI revision panel
  const [revisionInstruction, setRevisionInstruction] = useState('')
  const [revising, setRevising] = useState(false)
  const [revisionError, setRevisionError] = useState(null)
  const [previousBody, setPreviousBody] = useState(null)

  async function handleRevise() {
    const instruction = revisionInstruction.trim()
    if (!instruction || !form.body) return
    setRevising(true)
    setRevisionError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Session expired — please sign in again.')

      const resp = await fetch('/api/revise-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          body: form.body,
          instruction,
          title: form.title,
          category: form.category,
        }),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`)

      setPreviousBody(form.body)
      setForm(prev => ({ ...prev, body: data.body }))
      setRevisionInstruction('')
    } catch (err) {
      setRevisionError(err.message)
    } finally {
      setRevising(false)
    }
  }

  function undoRevision() {
    if (previousBody == null) return
    setForm(prev => ({ ...prev, body: previousBody }))
    setPreviousBody(null)
  }

  async function handleInlineImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const compressed = await compressImage(file)
    const path = `articles/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
    const { error } = await supabase.storage.from('public-assets').upload(path, compressed, { upsert: true })
    if (error) {
      console.error('Inline image upload failed:', error)
      alert(`Image upload failed: ${error.message}`)
    } else {
      const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(path)
      const el = bodyRef.current
      const pos = el ? el.selectionStart : form.body.length
      const imgMarkdown = `\n![](${publicUrl})\n`
      const newBody = form.body.substring(0, pos) + imgMarkdown + form.body.substring(pos)
      setForm(prev => ({ ...prev, body: newBody }))
    }
    setUploading(false)
    if (inlineImageRef.current) inlineImageRef.current.value = ''
  }

  function insertMarkdown(before, after = '') {
    const el = bodyRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = form.body.substring(start, end)
    const replacement = before + (selected || 'text') + after
    const newBody = form.body.substring(0, start) + replacement + form.body.substring(end)
    setForm(prev => ({ ...prev, body: newBody }))
    setTimeout(() => {
      el.focus()
      el.selectionStart = start + before.length
      el.selectionEnd = start + before.length + (selected || 'text').length
    }, 0)
  }

  useEffect(() => {
    if (!adminVerified) return
    if (id) {
      supabase.from('content').select('*').eq('id', id).single()
        .then(({ data }) => {
          if (data) setForm({
            ...data,
            tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
            cover_url: fixStorageUrl(data.cover_url) || '',
          })
        })
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
    setUploadStatus('Compressing image...')
    const compressed = await compressImage(file)
    setUploadStatus(`Uploading (${(compressed.size / 1024).toFixed(0)} KB)...`)
    const path = `articles/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
    const { error } = await supabase.storage.from('public-assets').upload(path, compressed, { upsert: true })
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

  function removeCoverImage() {
    setForm(prev => ({ ...prev, cover_url: '' }))
    setUploadStatus('')
  }

  async function handleSave() {
    setSaving(true)
    const tagsArray = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const payload = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      tags: tagsArray,
      read_time: parseInt(form.read_time) || 5,
      is_premium: form.is_premium,
      author: form.author,
      body: form.body,
      cover_url: form.cover_url,
      published: form.published,
      published_at: form.published ? (form.published_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    }

    let result
    if (isNew) {
      result = await supabase.from('content').insert(payload)
    } else {
      result = await supabase.from('content').update(payload).eq('id', id)
    }
    if (result.error) {
      console.error('Save failed:', result.error)
      alert(`Save failed: ${result.error.message}`)
      setSaving(false)
      return
    }
    setSaving(false)
    navigate('/admin/articles')
  }

  function markdownToHtml(text) {
    if (!text) return ''
    return marked.parse(text)
  }

  const coverPreview = form.cover_url || articleImage(form.slug || 'preview', form.category)

  return (
    <div className="min-h-screen bg-surface-container-low">
      <nav className="bg-on-background px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <img src={mareaLogo} alt="Marea" className="h-[1.2rem] brightness-0 invert opacity-80" />
          <div className="flex gap-6">
            <Link to="/admin/dashboard" className="text-[0.82rem] text-white/60">Dashboard</Link>
            <Link to="/admin/blog" className="text-[0.82rem] text-white/60">Blog CMS</Link>
            <Link to="/admin/articles" className="text-[0.82rem] text-white font-semibold">Articles CMS</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-headline text-2xl font-normal text-on-background">
            {isNew ? 'New Article' : 'Edit Article'}
          </h1>
          <div className="flex gap-3 items-center">
            <button onClick={() => setPreview(!preview)} className="bg-transparent border border-outline-variant text-on-surface-variant px-4 py-2 rounded-full text-[0.82rem] font-medium cursor-pointer">
              {preview ? 'Edit' : 'Preview'}
            </button>
            <Link to="/admin/articles" className="text-[0.85rem] text-primary font-medium">Back</Link>
          </div>
        </div>

        {preview ? (
          /* Preview mode */
          <div className="bg-surface rounded-2xl p-8 shadow-sm">
            <div className="max-w-[720px] mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[0.72rem] font-semibold text-primary bg-primary/[0.08] px-2.5 py-0.5 rounded-full">{form.category}</span>
                <span className="text-[0.75rem] text-outline">{form.read_time} min read</span>
                {form.is_premium && <span className="text-[0.65rem] font-bold text-tertiary bg-tertiary/[0.08] px-2.5 py-0.5 rounded-full uppercase">Member</span>}
              </div>
              <h1 className="font-headline text-[2rem] font-normal text-on-background leading-tight mb-3">{form.title || 'Untitled'}</h1>
              <p className="text-[0.88rem] text-outline mb-6">By {form.author}</p>
              <img src={coverPreview} alt="" className="w-full rounded-2xl mb-8 max-h-[400px] object-cover" />
              <div
                className="prose font-body text-base font-light text-on-surface-variant"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(form.body) }}
              />
            </div>
          </div>
        ) : (
          /* Edit mode */
          <div className="grid grid-cols-[1fr_300px] gap-6 items-start">
            {/* Main editor */}
            <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col gap-5">
              <div>
                <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-1 block">Title</label>
                <input value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="Article title" className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white" />
              </div>

              <div>
                <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-1 block">Slug</label>
                <input value={form.slug} onChange={e => updateField('slug', e.target.value)} placeholder="article-url-slug" className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white" />
              </div>

              <div>
                <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-1 block">
                  Body (Markdown)
                </label>
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 mb-2 p-2 bg-surface-container-low rounded-xl border border-outline-variant/50">
                  <button type="button" onClick={() => insertMarkdown('## ', '\n')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-[0.75rem] font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Heading">
                    H2
                  </button>
                  <button type="button" onClick={() => insertMarkdown('### ', '\n')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-[0.75rem] font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Subheading">
                    H3
                  </button>
                  <div className="w-px bg-outline-variant/30 mx-1" />
                  <button type="button" onClick={() => insertMarkdown('**', '**')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-[0.75rem] font-bold text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Bold">
                    B
                  </button>
                  <button type="button" onClick={() => insertMarkdown('*', '*')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-[0.75rem] italic text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Italic">
                    I
                  </button>
                  <div className="w-px bg-outline-variant/30 mx-1" />
                  <button type="button" onClick={() => insertMarkdown('\n- ', '\n')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Bullet list">
                    <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                  </button>
                  <button type="button" onClick={() => insertMarkdown('\n1. ', '\n')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Numbered list">
                    <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
                  </button>
                  <button type="button" onClick={() => insertMarkdown('\n> ', '\n')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Blockquote">
                    <span className="material-symbols-outlined text-[16px]">format_quote</span>
                  </button>
                  <div className="w-px bg-outline-variant/30 mx-1" />
                  <button type="button" onClick={() => insertMarkdown('\n---\n', '')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Horizontal rule">
                    <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
                  </button>
                  <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Link">
                    <span className="material-symbols-outlined text-[16px]">link</span>
                  </button>
                  <button type="button" onClick={() => inlineImageRef.current?.click()} className="px-2.5 py-1.5 rounded-lg bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container cursor-pointer" title="Upload image into article">
                    <span className="material-symbols-outlined text-[16px]">image</span>
                  </button>
                  <input ref={inlineImageRef} type="file" accept="image/*" onChange={handleInlineImageUpload} className="hidden" />
                  {uploading && <span className="text-[0.72rem] text-outline ml-2">Uploading...</span>}
                </div>
                <textarea
                  ref={bodyRef}
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  placeholder="Write your article content using markdown..."
                  rows={24}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-[0.82rem] bg-white resize-y font-mono leading-relaxed"
                />
              </div>

              {/* AI revision panel */}
              <div className="border border-primary/20 bg-primary/[0.03] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                  <span className="text-[0.72rem] font-semibold tracking-widest uppercase text-primary">Suggest changes — AI edit</span>
                </div>
                <p className="text-[0.78rem] text-on-surface-variant leading-relaxed mb-3">
                  Describe what you'd like changed in plain language. Marea's AI will rewrite the body while preserving images and heading structure. You can undo if the result isn't right.
                </p>
                <textarea
                  value={revisionInstruction}
                  onChange={e => setRevisionInstruction(e.target.value)}
                  placeholder="e.g. Make the opening more approachable. Add a short section on magnesium glycinate for sleep. Tighten the HRT paragraph."
                  rows={3}
                  disabled={revising || !form.body}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant focus:border-primary outline-none text-[0.82rem] bg-white resize-y leading-relaxed disabled:opacity-60"
                />
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleRevise}
                    disabled={revising || !revisionInstruction.trim() || !form.body}
                    className={`bg-primary text-on-primary border-none px-4 py-2 rounded-full text-[0.82rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 ${revising || !revisionInstruction.trim() || !form.body ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {revising && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                    {revising ? 'Revising…' : 'Revise with AI'}
                  </button>
                  {previousBody != null && !revising && (
                    <button
                      type="button"
                      onClick={undoRevision}
                      className="bg-transparent border border-outline-variant/60 text-on-surface-variant px-4 py-2 rounded-full text-[0.82rem] font-medium cursor-pointer inline-flex items-center gap-1.5 hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined text-[16px]">undo</span>
                      Undo last revision
                    </button>
                  )}
                  {!form.body && (
                    <span className="text-[0.72rem] text-outline">Write some body content first.</span>
                  )}
                </div>
                {revisionError && (
                  <p className="text-[0.75rem] text-tertiary mt-2">{revisionError}</p>
                )}
                {previousBody != null && !revising && !revisionError && (
                  <p className="text-[0.72rem] text-primary mt-2">Revision applied. Preview to review; save to commit.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-5">
              {/* Publish settings */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-4">Publish</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 text-[0.85rem] text-on-surface-variant cursor-pointer">
                    <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
                    Published
                  </label>
                  <label className="flex items-center gap-2 text-[0.85rem] text-on-surface-variant cursor-pointer">
                    <input type="checkbox" checked={form.is_premium} onChange={e => setForm({ ...form, is_premium: e.target.checked })} />
                    Members only
                  </label>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title}
                  className={`bg-primary text-on-primary border-none py-3 rounded-full text-[0.85rem] font-semibold cursor-pointer w-full mt-4 ${saving || !form.title ? 'opacity-50' : 'opacity-100'}`}
                >
                  {saving ? 'Saving...' : isNew ? 'Create Article' : 'Update Article'}
                </button>
              </div>

              {/* Category & meta */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-4">Details</h3>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[0.72rem] text-outline block mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[0.72rem] text-outline block mb-1">Author</label>
                    <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white" />
                  </div>
                  <div>
                    <label className="text-[0.72rem] text-outline block mb-1">Read time (min)</label>
                    <input type="number" value={form.read_time} onChange={e => setForm({ ...form, read_time: e.target.value })} min="1" className="w-full px-3 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white" />
                  </div>
                  <div>
                    <label className="text-[0.72rem] text-outline block mb-1">Tags (comma separated)</label>
                    <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="sleep, hormones" className="w-full px-3 py-2.5 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white" />
                  </div>
                </div>
              </div>

              {/* Cover image */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-4">Cover Image</h3>
                <img src={coverPreview} alt="" className="w-full h-[120px] object-cover rounded-lg mb-3" />
                <label
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-primary') }}
                  onDragLeave={e => e.currentTarget.classList.remove('ring-2', 'ring-primary')}
                  onDrop={handleCoverDrop}
                  className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
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
                  <button onClick={removeCoverImage} className="bg-transparent border-none text-[0.75rem] text-tertiary cursor-pointer mt-2 hover:underline">
                    Remove custom image
                  </button>
                )}
                <p className="text-[0.68rem] text-outline-variant mt-2">
                  {form.cover_url ? 'Using custom image' : 'Using auto-generated image based on category'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
