import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import mareaLogo from '../assets/marealogo.svg'

function StatCard({ icon, label, value, change, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm flex-1 min-w-[180px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: `${color || '#005258'}14` }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color: color || '#005258' }}>{icon}</span>
        </div>
      </div>
      <p className="font-headline text-[2rem] font-normal text-on-background mb-1">{value}</p>
      <p className="text-[0.72rem] tracking-wider uppercase text-outline font-medium">{label}</p>
      {change !== undefined && (
        <p className={`text-[0.72rem] mt-1 font-semibold ${change >= 0 ? 'text-primary-container' : 'text-tertiary'}`}>
          {change >= 0 ? '+' : ''}{change}% this week
        </p>
      )}
    </div>
  )
}

function MiniChart({ data, color }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data, 1)
  const w = 200
  const h = 50
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg width={w} height={h} className="block">
      <polyline points={points} fill="none" stroke={color || '#005258'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0, activeUsers: 0, paidMembers: 0, freeUsers: 0,
    totalArticles: 0, blogPosts: 0, articleReads: 0,
    communityPosts: 0, symptomLogs: 0, labResults: 0, assessments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentUsers, setRecentUsers] = useState([])
  const [topArticles, setTopArticles] = useState([])
  const [signupTrend, setSignupTrend] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return navigate('/admin')
    })
    loadDashboard()
  }, [navigate])

  async function loadDashboard() {
    const [users, paid, articles, posts, reads, community, logs, labs, assessed] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('subscription_tier', 'member').eq('subscription_status', 'active'),
      supabase.from('content').select('id', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabase.from('article_reads').select('id', { count: 'exact', head: true }),
      supabase.from('community_posts').select('id', { count: 'exact', head: true }),
      supabase.from('symptom_logs').select('id', { count: 'exact', head: true }),
      supabase.from('lab_results').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).not('assessment_stage', 'is', null),
    ])

    const totalUsers = users.count || 0
    const paidMembers = paid.count || 0

    setStats({
      totalUsers,
      activeUsers: totalUsers, // Could be refined with last_sign_in
      paidMembers,
      freeUsers: totalUsers - paidMembers,
      totalArticles: articles.count || 0,
      blogPosts: posts.count || 0,
      articleReads: reads.count || 0,
      communityPosts: community.count || 0,
      symptomLogs: logs.count || 0,
      labResults: labs.count || 0,
      assessments: assessed.count || 0,
    })

    // Recent users
    const { data: recent } = await supabase
      .from('users')
      .select('id, email, name, subscription_tier, subscription_status, assessment_stage, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    setRecentUsers(recent || [])

    // Top articles by reads
    const { data: topReads } = await supabase
      .from('article_reads')
      .select('article_slug')
      .order('read_at', { ascending: false })
      .limit(500)

    if (topReads) {
      const counts = {}
      topReads.forEach(r => { counts[r.article_slug] = (counts[r.article_slug] || 0) + 1 })
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
      setTopArticles(sorted.map(([slug, count]) => ({ slug, count })))
    }

    // Signup trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const { data: recentSignups } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: true })

    if (recentSignups) {
      const daily = Array(7).fill(0)
      recentSignups.forEach(s => {
        const dayIndex = Math.floor((new Date(s.created_at) - new Date(sevenDaysAgo)) / 86400000)
        if (dayIndex >= 0 && dayIndex < 7) daily[dayIndex]++
      })
      setSignupTrend(daily)
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Admin nav */}
      <nav className="bg-on-background px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <img src={mareaLogo} alt="Marea" className="h-[1.2rem] brightness-0 invert opacity-80" />
          <div className="flex gap-6">
            <Link to="/admin/dashboard" className="text-[0.82rem] text-white font-semibold">Dashboard</Link>
            <Link to="/admin/blog" className="text-[0.82rem] text-white/60">Blog CMS</Link>
            <Link to="/admin/articles" className="text-[0.82rem] text-white/60">Articles CMS</Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" target="_blank" className="text-[0.78rem] text-white/40">View site</Link>
          <button onClick={handleLogout} className="bg-transparent border-none text-white/50 text-[0.8rem] cursor-pointer">Sign out</button>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-headline text-[1.75rem] font-normal text-on-background">Dashboard</h1>
          <p className="text-[0.78rem] text-outline">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <p className="text-outline">Loading dashboard...</p>
        ) : (
          <>
            {/* Primary stats */}
            <div className="flex gap-4 flex-wrap mb-6">
              <StatCard icon="group" label="Total Users" value={stats.totalUsers} color="#005258" />
              <StatCard icon="workspace_premium" label="Paid Members" value={stats.paidMembers} color="#842b16" />
              <StatCard icon="person" label="Free Users" value={stats.freeUsers} color="#715b33" />
              <StatCard icon="auto_stories" label="Article Reads" value={stats.articleReads} color="#2A8A93" />
            </div>

            {/* Secondary stats */}
            <div className="flex gap-4 flex-wrap mb-8">
              <StatCard icon="library_books" label="Articles" value={stats.totalArticles} color="#005258" />
              <StatCard icon="article" label="Blog Posts" value={stats.blogPosts} color="#715b33" />
              <StatCard icon="quiz" label="Assessments" value={stats.assessments} color="#842b16" />
              <StatCard icon="monitor_heart" label="Symptom Logs" value={stats.symptomLogs} color="#2A8A93" />
              <StatCard icon="biotech" label="Lab Results" value={stats.labResults} color="#005258" />
              <StatCard icon="forum" label="Community Posts" value={stats.communityPosts} color="#715b33" />
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6 mb-8">
              {/* Signup trend */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-headline text-[1.1rem] font-normal text-on-background mb-4">Signups (Last 7 Days)</h2>
                <MiniChart data={signupTrend} color="#005258" />
                <div className="flex justify-between mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, signupTrend.length).map((d, i) => (
                    <span key={i} className="text-[0.65rem] text-outline-variant">{d}</span>
                  ))}
                </div>
              </div>

              {/* Top articles */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-headline text-[1.1rem] font-normal text-on-background mb-4">Top Articles</h2>
                {topArticles.length === 0 ? (
                  <p className="text-[0.85rem] text-outline">No article reads yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {topArticles.map((a, i) => (
                      <div key={a.slug} className={`flex items-center gap-3 py-2 ${i < topArticles.length - 1 ? 'border-b border-surface-container' : ''}`}>
                        <span className="text-[0.75rem] font-bold text-outline-variant w-5">{i + 1}</span>
                        <span className="text-[0.82rem] text-on-background flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                          {a.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-[0.75rem] font-semibold text-primary bg-primary/[0.08] px-2 py-0.5 rounded-full">
                          {a.count} reads
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Membership breakdown */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-headline text-[1.1rem] font-normal text-on-background mb-4">Membership Breakdown</h2>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 rounded-l-xl bg-primary" style={{ flex: Math.max(stats.paidMembers, 1) }} />
                  <div className="h-6 rounded-r-xl bg-primary/15" style={{ flex: Math.max(stats.freeUsers, 1) }} />
                </div>
                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-[0.78rem] text-outline">Paid ({stats.paidMembers})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/15" />
                    <span className="text-[0.78rem] text-outline">Free ({stats.freeUsers})</span>
                  </div>
                </div>
                {stats.totalUsers > 0 && (
                  <p className="text-[0.78rem] text-outline mt-3">
                    Conversion rate: {((stats.paidMembers / stats.totalUsers) * 100).toFixed(1)}%
                  </p>
                )}
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-headline text-[1.1rem] font-normal text-on-background mb-4">Quick Actions</h2>
                <div className="flex flex-col gap-3">
                  <Link to="/admin/blog/new" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/[0.04] text-primary text-[0.85rem] font-medium">
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                    Write a new blog post
                  </Link>
                  <Link to="/admin/articles/new" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/[0.04] text-primary text-[0.85rem] font-medium">
                    <span className="material-symbols-outlined text-[20px]">library_add</span>
                    Add a new article
                  </Link>
                  <Link to="/admin/blog" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/[0.04] text-primary text-[0.85rem] font-medium">
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    Manage blog posts
                  </Link>
                  <Link to="/admin/articles" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/[0.04] text-primary text-[0.85rem] font-medium">
                    <span className="material-symbols-outlined text-[20px]">library_books</span>
                    Manage articles
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent users */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-headline text-[1.2rem] font-normal text-on-background mb-4">Recent Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[0.85rem]">
                  <thead>
                    <tr className="border-b border-surface-variant">
                      <th className="text-left px-4 py-3 text-outline font-medium text-[0.72rem] tracking-widest uppercase">User</th>
                      <th className="text-left px-4 py-3 text-outline font-medium text-[0.72rem] tracking-widest uppercase">Tier</th>
                      <th className="text-left px-4 py-3 text-outline font-medium text-[0.72rem] tracking-widest uppercase">Stage</th>
                      <th className="text-left px-4 py-3 text-outline font-medium text-[0.72rem] tracking-widest uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(u => (
                      <tr key={u.id} className="border-b border-surface-container">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-on-background font-medium">{u.name || 'Unnamed'}</p>
                            <p className="text-outline text-[0.78rem]">{u.email || '\u2014'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[0.72rem] font-semibold ${
                            u.subscription_tier === 'member'
                              ? 'bg-primary/10 text-primary-container'
                              : 'bg-on-background/5 text-outline'
                          }`}>
                            {u.subscription_tier === 'member' ? 'Member' : 'Free'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.assessment_stage ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/[0.08] text-[0.75rem] font-semibold text-primary">
                              {u.assessment_stage}
                            </span>
                          ) : <span className="text-outline-variant">&mdash;</span>}
                        </td>
                        <td className="px-4 py-3 text-outline">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '\u2014'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
