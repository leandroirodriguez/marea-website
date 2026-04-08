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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return navigate('/admin')
    })
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

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1.5px solid #d4d1cc',
    fontFamily: 'inherit', fontSize: '0.9rem', background: '#fff', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ed' }}>
      <nav style={{ background: '#1c1c19', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <img src={mareaLogo} alt="Marea" style={{ height: '1.2rem', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/admin/dashboard" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Dashboard</Link>
            <Link to="/admin/blog" style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>Blog</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: '#1c1c19' }}>
            {isNew ? 'New Post' : 'Edit Post'}
          </h1>
          <Link to="/admin/blog" style={{ fontSize: '0.85rem', color: '#005258', fontWeight: 500 }}>← Back</Link>
        </div>

        <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '0.35rem', display: 'block' }}>Title</label>
            <input value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="Post title" style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '0.35rem', display: 'block' }}>Slug</label>
            <input value={form.slug} onChange={e => updateField('slug', e.target.value)} placeholder="post-url-slug" style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '0.35rem', display: 'block' }}>Excerpt</label>
            <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief summary for blog listing" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '0.35rem', display: 'block' }}>Cover Image</label>
            {form.cover_url && <img src={form.cover_url} alt="" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '0.75rem' }} />}
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '0.85rem' }} />
            {uploading && <p style={{ fontSize: '0.8rem', color: '#888780', marginTop: '0.35rem' }}>Uploading...</p>}
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '0.35rem', display: 'block' }}>Body (HTML)</label>
            <textarea value={form.body_html} onChange={e => setForm({ ...form, body_html: e.target.value })} placeholder="<p>Write your post content in HTML...</p>" rows={16} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6 }} />
            <p style={{ fontSize: '0.72rem', color: '#aaa9a4', marginTop: '0.35rem' }}>
              Use HTML tags: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;blockquote&gt;, &lt;img src="..."&gt;
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="published" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
            <label htmlFor="published" style={{ fontSize: '0.85rem', color: '#3f484a' }}>Publish immediately</label>
          </div>

          <button onClick={handleSave} disabled={saving || !form.title} style={{ background: '#005258', color: '#fff', border: 'none', padding: '0.85rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', opacity: saving || !form.title ? 0.5 : 1 }}>
            {saving ? 'Saving...' : isNew ? 'Create Post' : 'Update Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
