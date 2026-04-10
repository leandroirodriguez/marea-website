import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { articleImage } from '../lib/images'
import mareaLogo from '../assets/marealogo.svg'

const CATEGORIES = ['Sleep', 'Mood', 'Brain fog', 'Hot flashes', 'HRT', 'Lifestyle', 'Intimacy']

export default function AdminArticleEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return navigate('/admin')
    })
    if (id) {
      supabase.from('content').select('*').eq('id', id).single()
        .then(({ data }) => {
          if (data) setForm({
            ...data,
            tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
          })
        })
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
    const path = `articles/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('public-assets').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(path)
      setForm(prev => ({ ...prev, cover_url: publicUrl }))
    }
    setUploading(false)
  }

  function removeCoverImage() {
    setForm(prev => ({ ...prev, cover_url: '' }))
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

    if (isNew) {
      await supabase.from('content').insert(payload)
    } else {
      await supabase.from('content').update(payload).eq('id', id)
    }
    setSaving(false)
    navigate('/admin/articles')
  }

  function markdownToHtml(text) {
    if (!text) return ''
    return text
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1.5px solid #d4d1cc',
    fontFamily: 'inherit', fontSize: '0.9rem', background: '#fff', outline: 'none',
  }

  const coverPreview = form.cover_url || articleImage(form.slug || 'preview', form.category)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ed' }}>
      <nav style={{ background: '#1c1c19', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <img src={mareaLogo} alt="Marea" style={{ height: '1.2rem', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/admin/dashboard" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Dashboard</Link>
            <Link to="/admin/blog" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Blog CMS</Link>
            <Link to="/admin/articles" style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>Articles CMS</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: '#1c1c19' }}>
            {isNew ? 'New Article' : 'Edit Article'}
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={() => setPreview(!preview)} style={{ background: 'none', border: '1.5px solid #d4d1cc', color: '#3f484a', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>
              {preview ? 'Edit' : 'Preview'}
            </button>
            <Link to="/admin/articles" style={{ fontSize: '0.85rem', color: '#005258', fontWeight: 500 }}>Back</Link>
          </div>
        </div>

        {preview ? (
          /* Preview mode */
          <div style={{ background: '#fcf9f4', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#005258', background: 'rgba(0,82,88,0.08)', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>{form.category}</span>
                <span style={{ fontSize: '0.75rem', color: '#888780' }}>{form.read_time} min read</span>
                {form.is_premium && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#842b16', background: 'rgba(132,43,22,0.08)', padding: '0.2rem 0.6rem', borderRadius: '9999px', textTransform: 'uppercase' }}>Member</span>}
              </div>
              <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#1c1c19', lineHeight: 1.2, marginBottom: '0.75rem' }}>{form.title || 'Untitled'}</h1>
              <p style={{ fontSize: '0.88rem', color: '#888780', marginBottom: '1.5rem' }}>By {form.author}</p>
              <img src={coverPreview} alt="" style={{ width: '100%', borderRadius: '1rem', marginBottom: '2rem', maxHeight: '400px', objectFit: 'cover' }} />
              <div
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 300, color: '#3f484a', lineHeight: 1.85 }}
                dangerouslySetInnerHTML={{ __html: markdownToHtml(form.body) }}
              />
            </div>
          </div>
        ) : (
          /* Edit mode */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
            {/* Main editor */}
            <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '0.35rem', display: 'block' }}>Title</label>
                <input value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="Article title" style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '0.35rem', display: 'block' }}>Slug</label>
                <input value={form.slug} onChange={e => updateField('slug', e.target.value)} placeholder="article-url-slug" style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '0.35rem', display: 'block' }}>
                  Body (Markdown)
                </label>
                <textarea
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  placeholder="Write your article content using markdown..."
                  rows={24}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6 }}
                />
                <p style={{ fontSize: '0.72rem', color: '#aaa9a4', marginTop: '0.35rem' }}>
                  Use ## for headings, **bold**, *italic*, - for lists
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Publish settings */}
              <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '1rem' }}>Publish</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#3f484a', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
                    Published
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#3f484a', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_premium} onChange={e => setForm({ ...form, is_premium: e.target.checked })} />
                    Members only
                  </label>
                </div>
                <button onClick={handleSave} disabled={saving || !form.title} style={{ background: '#005258', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: '1rem', opacity: saving || !form.title ? 0.5 : 1 }}>
                  {saving ? 'Saving...' : isNew ? 'Create Article' : 'Update Article'}
                </button>
              </div>

              {/* Category & meta */}
              <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '1rem' }}>Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#888780', display: 'block', marginBottom: '0.25rem' }}>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, padding: '0.6rem 0.75rem' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#888780', display: 'block', marginBottom: '0.25rem' }}>Author</label>
                    <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} style={{ ...inputStyle, padding: '0.6rem 0.75rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#888780', display: 'block', marginBottom: '0.25rem' }}>Read time (min)</label>
                    <input type="number" value={form.read_time} onChange={e => setForm({ ...form, read_time: e.target.value })} min="1" style={{ ...inputStyle, padding: '0.6rem 0.75rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#888780', display: 'block', marginBottom: '0.25rem' }}>Tags (comma separated)</label>
                    <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="sleep, hormones" style={{ ...inputStyle, padding: '0.6rem 0.75rem' }} />
                  </div>
                </div>
              </div>

              {/* Cover image */}
              <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780', marginBottom: '1rem' }}>Cover Image</h3>
                <img src={coverPreview} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '0.75rem' }} />
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '0.78rem', marginBottom: '0.5rem' }} />
                {uploading && <p style={{ fontSize: '0.78rem', color: '#888780' }}>Uploading...</p>}
                {form.cover_url && (
                  <button onClick={removeCoverImage} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#842b16', cursor: 'pointer', marginTop: '0.25rem' }}>
                    Remove custom image
                  </button>
                )}
                <p style={{ fontSize: '0.68rem', color: '#aaa9a4', marginTop: '0.5rem' }}>
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
