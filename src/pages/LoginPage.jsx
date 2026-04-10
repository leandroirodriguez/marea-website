import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import mareaLogo from '../assets/marealogo.svg'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) navigate('/articles')
  }, [user, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (isSignUp) {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (err) { setError(err.message); setLoading(false) }
      else { setSuccess('Check your email to confirm your account.'); setLoading(false) }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); setLoading(false) }
      else navigate('/articles')
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1.5px solid #d4d1cc',
    fontFamily: 'inherit', fontSize: '0.9rem', background: '#fff', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fcf9f4', padding: '2rem' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/"><img src={mareaLogo} alt="Marea" style={{ height: '1.4rem', marginBottom: '1.5rem' }} /></Link>
          <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.75rem', fontWeight: 400, color: '#1c1c19', marginBottom: '0.5rem' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#6f797a' }}>
            {isSignUp ? 'Sign up to access 5 free articles.' : 'Sign in to continue reading.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isSignUp && (
            <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          )}
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={inputStyle} />

          {error && <p style={{ color: '#842b16', fontSize: '0.82rem', textAlign: 'center' }}>{error}</p>}
          {success && <p style={{ color: '#005258', fontSize: '0.82rem', textAlign: 'center' }}>{success}</p>}

          <button type="submit" disabled={loading} style={{ background: '#005258', color: '#fff', border: 'none', padding: '0.85rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#6f797a' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: '#005258', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            {isSignUp ? 'Sign in' : 'Sign up free'}
          </button>
        </p>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/" style={{ fontSize: '0.82rem', color: '#888780' }}>Back to home</Link>
        </div>
      </div>
    </div>
  )
}
