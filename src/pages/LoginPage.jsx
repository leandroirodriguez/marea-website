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

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6 py-8">
      <div className="max-w-[400px] w-full">
        <div className="text-center mb-8">
          <Link to="/"><img src={mareaLogo} alt="Marea" className="h-[1.4rem] mb-6 inline-block" /></Link>
          <h1 className="font-headline text-[1.75rem] font-normal text-on-background mb-2" style={{ letterSpacing: '-0.02em' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-[0.88rem] text-outline">
            {isSignUp ? 'Sign up to access 5 free articles.' : 'Sign in to continue reading.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest font-body text-[0.9rem] outline-none focus:border-primary transition-colors"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest font-body text-[0.9rem] outline-none focus:border-primary transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest font-body text-[0.9rem] outline-none focus:border-primary transition-colors"
          />

          {error && <p className="text-tertiary text-[0.82rem] text-center">{error}</p>}
          {success && <p className="text-primary text-[0.82rem] text-center">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-on-primary border-none rounded-full py-3.5 font-label text-[0.9rem] font-semibold cursor-pointer hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="text-center mt-6 text-[0.85rem] text-outline">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
            className="bg-transparent border-none text-primary font-semibold cursor-pointer text-[0.85rem] hover:text-primary-container transition-colors"
          >
            {isSignUp ? 'Sign in' : 'Sign up free'}
          </button>
        </p>

        <div className="text-center mt-8">
          <Link to="/" className="font-label text-[0.82rem] text-outline hover:text-on-surface-variant transition-colors">Back to home</Link>
        </div>
      </div>
    </div>
  )
}
