'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalCoaches: 0,
    approvedCoaches: 0,
    totalDocs: 0,
    signupsThisMonth: 0,
  })
  const [positionData, setPositionData] = useState<{ position: string, count: number }[]>([])
  const [ageData, setAgeData] = useState<{ group: string, count: number }[]>([])
  const [recentSignups, setRecentSignups] = useState<any[]>([])
  const [nationalityData, setNationalityData] = useState<{ nationality: string, count: number }[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Total players
      const { count: playerCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })

      // Coaches
      const { count: coachCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'org_user')

      const { count: approvedCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'org_user')
        .eq('approved', true)

      // Documents
      const { count: docCount } = await supabase
        .from('player_documents')
        .select('*', { count: 'exact', head: true })

      // Signups this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const { count: monthCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

      setStats({
        totalPlayers: playerCount || 0,
        totalCoaches: coachCount || 0,
        approvedCoaches: approvedCount || 0,
        totalDocs: docCount || 0,
        signupsThisMonth: monthCount || 0,
      })

      // Players by position
      const { data: players } = await supabase
        .from('players')
        .select('position_primary, date_of_birth, nationality_primary')

      if (players) {
        // Position breakdown
        const posCounts: Record<string, number> = {}
        players.forEach(p => {
          const pos = p.position_primary || 'Unknown'
          posCounts[pos] = (posCounts[pos] || 0) + 1
        })
        const posArray = Object.entries(posCounts)
          .map(([position, count]) => ({ position: position.replace(/_/g, ' '), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
        setPositionData(posArray)

        // Age breakdown
        const ageCounts: Record<string, number> = {
          'Under 18': 0, '18–21': 0, '22–25': 0, '26–30': 0, '30+': 0
        }
        players.forEach(p => {
          if (!p.date_of_birth) return
          const age = Math.floor((new Date().getTime() - new Date(p.date_of_birth).getTime()) / 31557600000)
          if (age < 18) ageCounts['Under 18']++
          else if (age <= 21) ageCounts['18–21']++
          else if (age <= 25) ageCounts['22–25']++
          else if (age <= 30) ageCounts['26–30']++
          else ageCounts['30+']++
        })
        setAgeData(Object.entries(ageCounts).map(([group, count]) => ({ group, count })))

        // Nationality breakdown
        const natCounts: Record<string, number> = {}
        players.forEach(p => {
          const nat = p.nationality_primary || 'Unknown'
          natCounts[nat] = (natCounts[nat] || 0) + 1
        })
        const natArray = Object.entries(natCounts)
          .map(([nationality, count]) => ({ nationality, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        setNationalityData(natArray)
      }

      // Recent signups
      const { data: recentPlayers } = await supabase
        .from('players')
        .select('first_name, last_name, position_primary, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentCoaches } = await supabase
        .from('profiles')
        .select('full_name, organisation_name, created_at, approved')
        .eq('role', 'org_user')
        .order('created_at', { ascending: false })
        .limit(5)

      const combined = [
        ...(recentPlayers || []).map(p => ({
          name: `${p.first_name} ${p.last_name}`,
          type: 'Player',
          detail: p.position_primary?.replace(/_/g, ' ') || '–',
          date: p.created_at,
          status: 'Active',
        })),
        ...(recentCoaches || []).map(c => ({
          name: c.full_name || c.organisation_name || '–',
          type: 'Coach',
          detail: c.organisation_name || '–',
          date: c.created_at,
          status: c.approved ? 'Approved' : 'Pending',
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)

      setRecentSignups(combined)
      setLoading(false)
    }
    load()
  }, [])

  const maxPos = Math.max(...positionData.map(p => p.count), 1)
  const maxAge = Math.max(...ageData.map(a => a.count), 1)
  const maxNat = Math.max(...nationalityData.map(n => n.count), 1)

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F1EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Arial', color: '#888780', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F1EFE8; }
        .nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo-text { color: white; font-weight: 900; font-size: 20px; letter-spacing: -1px; font-family: 'Arial Black', Arial, sans-serif; }
        .content { max-width: 1000px; margin: 0 auto; padding: 40px 28px; }
        .page-label { font-size: 10px; color: #1D9E75; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 8px; }
        .page-title { font-size: 28px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 28px; }
        .stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
        .stat-card { background: #E8E6DF; border-radius: 8px; padding: 1rem; }
        .stat-label { font-size: 12px; color: #5F5E5A; margin-bottom: 6px; }
        .stat-value { font-size: 24px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; }
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .card { background: white; border-radius: 12px; padding: 1.25rem; border: 0.5px solid #D3D1C7; }
        .card-title { font-size: 13px; font-weight: 700; color: #0D1B2E; margin-bottom: 1rem; }
        .bar-row { margin-bottom: 10px; }
        .bar-label-row { display: flex; justify-content: space-between; font-size: 11px; color: #5F5E5A; margin-bottom: 3px; }
        .bar-track { height: 6px; background: #F1EFE8; border-radius: 4px; }
        .bar-fill-green { height: 6px; background: #1D9E75; border-radius: 4px; }
        .bar-fill-dark { height: 6px; background: #0D1B2E; border-radius: 4px; }
        .bar-fill-gray { height: 6px; background: #888780; border-radius: 4px; }
        .table-card { background: white; border-radius: 12px; padding: 1.25rem; border: 0.5px solid #D3D1C7; }
        .table-title { font-size: 13px; font-weight: 700; color: #0D1B2E; margin-bottom: 1rem; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; font-weight: 700; color: #888780; padding: 0 0 10px; font-size: 11px; letter-spacing: 0.06em; }
        td { padding: 10px 0; color: #0D1B2E; border-top: 0.5px solid #F1EFE8; }
        .badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 700; }
        .badge-active { background: #E1F5EE; color: #0F6E56; }
        .badge-pending { background: #FAEEDA; color: #854F0B; }
        .badge-approved { background: #E1F5EE; color: #0F6E56; }
        .badge-player { background: #E8E6DF; color: #5F5E5A; }
        .badge-coach { background: #0D1B2E; color: white; }
        @media (max-width: 768px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .charts-grid { grid-template-columns: 1fr; }
          .content { padding: 24px 16px; }
        }
      `}</style>

      <nav className="nav">
        <span className="nav-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div className="content">
        <p className="page-label">SUPER ADMIN</p>
        <h1 className="page-title">Platform overview</h1>

        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-label">Total players</p>
            <p className="stat-value">{stats.totalPlayers}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total coaches</p>
            <p className="stat-value">{stats.totalCoaches}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Approved coaches</p>
            <p className="stat-value">{stats.approvedCoaches}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Docs uploaded</p>
            <p className="stat-value">{stats.totalDocs}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Signups this month</p>
            <p className="stat-value">{stats.signupsThisMonth}</p>
          </div>
        </div>

        <div className="charts-grid">
          <div className="card">
            <p className="card-title">Players by position</p>
            {positionData.map(p => (
              <div key={p.position} className="bar-row">
                <div className="bar-label-row"><span>{p.position}</span><span>{p.count}</span></div>
                <div className="bar-track"><div className="bar-fill-green" style={{ width: `${Math.round((p.count / maxPos) * 100)}%` }}></div></div>
              </div>
            ))}
          </div>

          <div className="card">
            <p className="card-title">Players by age</p>
            {ageData.map(a => (
              <div key={a.group} className="bar-row">
                <div className="bar-label-row"><span>{a.group}</span><span>{a.count}</span></div>
                <div className="bar-track"><div className="bar-fill-dark" style={{ width: `${Math.round((a.count / maxAge) * 100)}%` }}></div></div>
              </div>
            ))}
          </div>

          <div className="card">
            <p className="card-title">Players by nationality</p>
            {nationalityData.map(n => (
              <div key={n.nationality} className="bar-row">
                <div className="bar-label-row"><span>{n.nationality}</span><span>{n.count}</span></div>
                <div className="bar-track"><div className="bar-fill-gray" style={{ width: `${Math.round((n.count / maxNat) * 100)}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="table-card">
          <p className="table-title">Recent signups</p>
          <table>
            <thead>
              <tr>
                <th>NAME</th>
                <th>TYPE</th>
                <th>DETAIL</th>
                <th>DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentSignups.map((s, i) => (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td><span className={`badge ${s.type === 'Player' ? 'badge-player' : 'badge-coach'}`}>{s.type}</span></td>
                  <td style={{ color: '#888780' }}>{s.detail}</td>
                  <td style={{ color: '#888780' }}>{formatDate(s.date)}</td>
                  <td><span className={`badge badge-${s.status.toLowerCase()}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}