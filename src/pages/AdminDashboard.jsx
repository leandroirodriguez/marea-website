import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import mareaLogo from '../assets/marealogo.svg'

function StatCard({ icon, label, value, change, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', flex: '1 1 200px', minWidth: '180px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color || '#005258'}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: color || '#005258' }}>{icon}</span>
        </div>
      </div>
      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#1c1c19', marginBottom: '0.25rem' }}>{value}</p>
      <p style={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#888780', fontWeight: 500 }}>{label}</p>
      {change !== undefined && (
        <p style={{ fontSize: '0.72rem', color: change >= 0 ? '#2A8A93' : '#842b16', marginTop: '0.35rem', fontWeight: 600 }}>
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
    <svg width={w} height={h} style={{ display: 'block' }}>
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
    <div style={{ minHeight: '100vh', background: '#f5f2ed' }}>
      {/* Admin nav */}
      <nav style={{ background: '#1c1c19', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <img src={mareaLogo} alt="Marea" style={{ height: '1.2rem', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/admin/dashboard" style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>Dashboard</Link>
            <Link to="/admin/blog" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Blog CMS</Link>
            <Link to="/admin/articles" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Articles CMS</Link>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" target="_blank" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>View site</Link>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.75rem', fontWeight: 400, color: '#1c1c19' }}>Dashboard</h1>
          <p style={{ fontSize: '0.78rem', color: '#888780' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <p style={{ color: '#888780' }}>Loading dashboard...</p>
        ) : (
          <>
            {/* Primary stats */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <StatCard icon="group" label="Total Users" value={stats.totalUsers} color="#005258" />
              <StatCard icon="workspace_premium" label="Paid Members" value={stats.paidMembers} color="#842b16" />
              <StatCard icon="person" label="Free Users" value={stats.freeUsers} color="#715b33" />
              <StatCard icon="auto_stories" label="Article Reads" value={stats.articleReads} color="#2A8A93" />
            </div>

            {/* Secondary stats */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <StatCard icon="library_books" label="Articles" value={stats.totalArticles} color="#005258" />
              <StatCard icon="article" label="Blog Posts" value={stats.blogPosts} color="#715b33" />
              <StatCard icon="quiz" label="Assessments" value={stats.assessments} color="#842b16" />
              <StatCard icon="monitor_heart" label="Symptom Logs" value={stats.symptomLogs} color="#2A8A93" />
              <StatCard icon="biotech" label="Lab Results" value={stats.labResults} color="#005258" />
              <StatCard icon="forum" label="Community Posts" value={stats.communityPosts} color="#715b33" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Signup trend */}
              <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.1rem', fontWeight: 400, color: '#1c1c19', marginBottom: '1rem' }}>Signups (Last 7 Days)</h2>
                <MiniChart data={signupTrend} color="#005258" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, signupTrend.length).map((d, i) => (
                    <span key={i} style={{ fontSize: '0.65rem', color: '#aaa9a4' }}>{d}</span>
                  ))}
                </div>
              </div>

              {/* Top articles */}
              <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.1rem', fontWeight: 400, color: '#1c1c19', marginBottom: '1rem' }}>Top Articles</h2>
                {topArticles.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#888780' }}>No article reads yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {topArticles.map((a, i) => (
                      <div key={a.slug} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < topArticles.length - 1 ? '1px solid #f0ede9' : 'none' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c4c1bc', width: '20px' }}>{i + 1}</span>
                        <span style={{ fontSize: '0.82rem', color: '#1c1c19', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#005258', background: 'rgba(0,82,88,0.08)', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                          {a.count} reads
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Membership breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.1rem', fontWeight: 400, color: '#1c1c19', marginBottom: '1rem' }}>Membership Breakdown</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ flex: Math.max(stats.paidMembers, 1), height: '24px', borderRadius: '12px 0 0 12px', background: '#005258' }} />
                  <div style={{ flex: Math.max(stats.freeUsers, 1), height: '24px', borderRadius: '0 12px 12px 0', background: 'rgba(0,82,88,0.15)' }} />
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#005258' }} />
                    <span style={{ fontSize: '0.78rem', color: '#6f797a' }}>Paid ({stats.paidMembers})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(0,82,88,0.15)' }} />
                    <span style={{ fontSize: '0.78rem', color: '#6f797a' }}>Free ({stats.freeUsers})</span>
                  </div>
                </div>
                {stats.totalUsers > 0 && (
                  <p style={{ fontSize: '0.78rem', color: '#888780', marginTop: '0.75rem' }}>
                    Conversion rate: {((stats.paidMembers / stats.totalUsers) * 100).toFixed(1)}%
                  </p>
                )}
              </div>

              {/* Quick actions */}
              <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.1rem', fontWeight: 400, color: '#1c1c19', marginBottom: '1rem' }}>Quick Actions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link to="/admin/blog/new" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(0,82,88,0.04)', color: '#005258', fontSize: '0.85rem', fontWeight: 500 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit_note</span>
                    Write a new blog post
                  </Link>
                  <Link to="/admin/articles/new" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(0,82,88,0.04)', color: '#005258', fontSize: '0.85rem', fontWeight: 500 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>library_add</span>
                    Add a new article
                  </Link>
                  <Link to="/admin/blog" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(0,82,88,0.04)', color: '#005258', fontSize: '0.85rem', fontWeight: 500 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dashboard</span>
                    Manage blog posts
                  </Link>
                  <Link to="/admin/articles" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(0,82,88,0.04)', color: '#005258', fontSize: '0.85rem', fontWeight: 500 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>library_books</span>
                    Manage articles
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent users */}
            <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.2rem', fontWeight: 400, color: '#1c1c19', marginBottom: '1rem' }}>Recent Users</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e2dd' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>User</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tier</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Stage</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f0ede9' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div>
                            <p style={{ color: '#1c1c19', fontWeight: 500 }}>{u.name || 'Unnamed'}</p>
                            <p style={{ color: '#888780', fontSize: '0.78rem' }}>{u.email || '—'}</p>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                            background: u.subscription_tier === 'member' ? 'rgba(42,138,147,0.1)' : 'rgba(0,0,0,0.05)',
                            color: u.subscription_tier === 'member' ? '#2A8A93' : '#888780',
                          }}>
                            {u.subscription_tier === 'member' ? 'Member' : 'Free'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {u.assessment_stage ? (
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(0,82,88,0.08)', fontSize: '0.75rem', fontWeight: 600, color: '#005258' }}>
                              {u.assessment_stage}
                            </span>
                          ) : <span style={{ color: '#c4c1bc' }}>—</span>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#888780' }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
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
