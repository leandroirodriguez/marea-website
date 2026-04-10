import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import mareaLogo from '../assets/marealogo.svg'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data } = await supabase.from('users').select('is_admin').eq('id', session.user.id).single()
        if (data?.is_admin) navigate('/admin/dashboard')
      }
    })
  }, [navigate])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: authData, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }

    const { data: profile } = await supabase.from('users').select('is_admin').eq('id', authData.user.id).single()
    if (!profile?.is_admin) {
      setError('You do not have admin access. Contact an administrator.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-8">
      <div className="max-w-[380px] w-full">
        <div className="text-center mb-8">
          <img src={mareaLogo} alt="Marea" className="h-[1.4rem] mb-6 inline-block" />
          <h1 className="font-headline text-2xl font-normal text-on-background">Admin Access</h1>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white"
          />
          {error && <p className="text-tertiary text-[0.82rem]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`bg-primary text-on-primary border-none py-3 rounded-full text-sm font-semibold cursor-pointer ${loading ? 'opacity-60' : 'opacity-100'}`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
