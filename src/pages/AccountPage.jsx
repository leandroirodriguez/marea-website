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
    <div className="min-h-screen bg-surface">
      <nav className="fixed top-0 w-full z-50 bg-surface/92 backdrop-blur-xl border-b border-outline-variant/10 px-6 md:px-8 py-4">
        <div className="max-w-[1100px] mx-auto flex justify-between items-center">
          <Link to="/"><img src={mareaLogo} alt="Marea Health" className="h-[1.4rem]" /></Link>
          <div className="flex items-center gap-6">
            <Link to="/blog" className="font-label text-[0.85rem] font-medium text-on-surface-variant hover:text-primary transition-colors">Blog</Link>
            <Link to="/articles" className="font-label text-[0.85rem] font-medium text-primary hover:text-primary-container transition-colors">Articles</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[600px] mx-auto px-6 md:px-8 pt-24 pb-12">
        <h1 className="font-headline text-[2rem] font-normal text-on-background mb-8" style={{ letterSpacing: '-0.02em' }}>My Account</h1>

        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/[0.08] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-primary">person</span>
            </div>
            <div>
              <p className="font-semibold text-on-background">{profile?.name || 'User'}</p>
              <p className="font-label text-[0.82rem] text-outline">{user.email}</p>
            </div>
          </div>

          <div className="border-t border-surface-container pt-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[0.85rem] text-outline">Membership</span>
              <span className={`px-3 py-1 rounded-full font-label text-xs font-semibold ${
                isPaid
                  ? 'bg-primary/10 text-primary'
                  : 'bg-on-background/5 text-outline'
              }`}>
                {isPaid ? 'Active Member' : 'Free'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[0.85rem] text-outline">Articles read</span>
              <span className="text-[0.85rem] font-semibold text-on-background">
                {readCount}{!isPaid ? ' / 5' : ''}
              </span>
            </div>
          </div>
        </div>

        {!isPaid && (
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-8 text-on-primary mb-6">
            <h2 className="font-headline text-[1.25rem] font-normal mb-3">
              Unlock unlimited articles
            </h2>
            <p className="text-[0.88rem] font-light text-on-primary/75 leading-relaxed mb-5">
              Get full access to our entire education library with a Marea membership. Starting at $8/month.
            </p>
            <a href="#" className="bg-white text-primary rounded-full px-6 py-3 font-label text-[0.85rem] font-semibold inline-block hover:bg-primary-fixed transition-colors">
              View plans
            </a>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-transparent border-[1.5px] border-outline-variant text-outline rounded-full py-3 px-8 font-label text-[0.85rem] font-medium cursor-pointer w-full hover:border-outline hover:text-on-surface-variant transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
