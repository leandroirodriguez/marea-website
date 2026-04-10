import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import mareaLogo from '../assets/marealogo.svg'

export default function AccountPage() {
  const { user, profile, isPaid } = useAuth()
  const navigate = useNavigate()
  const [readCount, setReadCount] = useState(0)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    supabase
      .from('article_reads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setReadCount(count || 0))
  }, [user, navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#fcf9f4' }}>
      <nav style={{ background: 'rgba(252,249,244,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.04)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/"><img src={mareaLogo} alt="Marea Health" style={{ height: '1.4rem' }} /></Link>
          <Link to="/articles" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#005258' }}>Articles</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#1c1c19', marginBottom: '2rem' }}>My Account</h1>

        <div style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,82,88,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#005258' }}>person</span>
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#1c1c19' }}>{profile?.name || 'User'}</p>
              <p style={{ fontSize: '0.82rem', color: '#888780' }}>{user.email}</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f0ede9', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#6f797a' }}>Membership</span>
              <span style={{ padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: isPaid ? 'rgba(42,138,147,0.1)' : 'rgba(0,0,0,0.05)', color: isPaid ? '#2A8A93' : '#888780' }}>
                {isPaid ? 'Active Member' : 'Free'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#6f797a' }}>Articles read</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1c1c19' }}>
                {readCount}{!isPaid ? ' / 5' : ''}
              </span>
            </div>
          </div>
        </div>

        {!isPaid && (
          <div style={{ background: 'linear-gradient(135deg, #005258, #0D3F44)', borderRadius: '1rem', padding: '2rem', color: '#fff', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.25rem', fontWeight: 400, marginBottom: '0.75rem' }}>
              Unlock unlimited articles
            </h2>
            <p style={{ fontSize: '0.88rem', fontWeight: 300, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Get full access to our entire education library with a Marea membership. Starting at $8/month.
            </p>
            <a href="#" style={{ background: '#fff', color: '#005258', padding: '0.7rem 1.5rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-block' }}>
              View plans
            </a>
          </div>
        )}

        <button onClick={handleLogout} style={{ background: 'none', border: '1.5px solid #d4d1cc', color: '#6f797a', padding: '0.75rem 2rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', width: '100%' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
