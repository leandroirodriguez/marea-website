import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import mareaLogo from '../assets/marealogo.svg'

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', flex: '1 1 200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: color || '#005258' }}>{icon}</span>
        <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888780' }}>{label}</span>
      </div>
      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#1c1c19' }}>{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ users: 0, posts: 0, communityPosts: 0, labResults: 0, symptomLogs: 0, assessments: 0 })
  const [loading, setLoading] = useState(true)
  const [recentUsers, setRecentUsers] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return navigate('/admin')
    })
    loadStats()
  }, [navigate])

  async function loadStats() {
    const [users, posts, community, labs, logs, profiles] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabase.from('community_posts').select('id', { count: 'exact', head: true }),
      supabase.from('lab_results').select('id', { count: 'exact', head: true }),
      supabase.from('symptom_logs').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).not('assessment_stage', 'is', null),
    ])

    setStats({
      users: users.count || 0,
      posts: posts.count || 0,
      communityPosts: community.count || 0,
      labResults: labs.count || 0,
      symptomLogs: logs.count || 0,
      assessments: profiles.count || 0,
    })

    const { data: recent } = await supabase
      .from('profiles')
      .select('id, email, assessment_stage, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    setRecentUsers(recent || [])
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
            <Link to="/admin/blog" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Blog</Link>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.75rem', fontWeight: 400, color: '#1c1c19', marginBottom: '2rem' }}>Dashboard</h1>

        {loading ? (
          <p style={{ color: '#888780' }}>Loading stats...</p>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <StatCard icon="group" label="Total Users" value={stats.users} />
              <StatCard icon="quiz" label="Assessments" value={stats.assessments} color="#842b16" />
              <StatCard icon="monitor_heart" label="Symptom Logs" value={stats.symptomLogs} color="#715b33" />
              <StatCard icon="biotech" label="Lab Results" value={stats.labResults} color="#2A8A93" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <StatCard icon="forum" label="Community Posts" value={stats.communityPosts} />
              <StatCard icon="article" label="Blog Posts" value={stats.posts} />
            </div>

            {/* Recent users */}
            <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.2rem', fontWeight: 400, color: '#1c1c19', marginBottom: '1rem' }}>Recent Users</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e2dd' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Stage</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f0ede9' }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#1c1c19' }}>{u.email || '—'}</td>
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
