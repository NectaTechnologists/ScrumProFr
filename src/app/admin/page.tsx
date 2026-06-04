'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts'

// Test accounts to exclude from all stats
const TEST_EMAILS = [
  'brucekay@outlook.com',
  'bruce@necta.co.za',
  'bruce+1@necta.co.za',
  'brucekay+1@outlook.com',
  'brucekay+3@outlook.com',
]

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
  const [signupChartData, setSignupChartData] = useState<{ label: string, total: number }[]>([])
  const [signupDailyData, setSignupDailyData] = useState<{ label: string, total: number }[]>([])
  const [chartView, setChartView] = useState<'weekly' | 'daily'>('weekly')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // ── Try to resolve test-account profile IDs via profiles.email ──
      // Graceful fallback: if email column doesn't exist, no exclusion (empty set)
      let testProfileIds = new Set<string>()
      try {
        const { data: testProfiles, error } = await supabase
          .from('profiles')
          .select('id')
          .in('email', TEST_EMAILS)
        if (!error && testProfiles?.length) {
          testProfileIds = new Set(testProfiles.map((p: any) => p.id))
        }
      } catch (_) { /* profiles.email not present — proceed without exclusion */ }

      // ── Fetch all players (with names for recent-signups table) ──
      const { data: allPlayers } = await supabase
        .from('players')
        .select('first_name, last_name, position_primary, date_of_birth, nationality_primary, created_at, profile_id')

      const players = (allPlayers || []).filter(p =>
        !testProfileIds.has(p.profile_id)
      )

      // ── Fetch all coaches ──
      // Try with email first for filtering; fall back to without
      let coachProfiles: any[] = []
      const coachSelect = 'id, approved, created_at, full_name, organisation_name, email'
      const { data: coachWithEmail, error: coachErr } = await supabase
        .from('profiles')
        .select(coachSelect)
        .eq('role', 'org_user')

      if (!coachErr && coachWithEmail) {
        coachProfiles = coachWithEmail.filter(
          c => !TEST_EMAILS.includes(c.email || '')
        )
      } else {
        // Fallback: no email column — get coaches without filtering
        const { data: coachNoEmail } = await supabase
          .from('profiles')
          .select('id, approved, created_at, full_name, organisation_name')
          .eq('role', 'org_user')
        coachProfiles = coachNoEmail || []
      }

      // ── Stat tiles ──
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const signupsThisMonth = players.filter(
        p => new Date(p.created_at) >= startOfMonth
      ).length

      // Docs count (no test-account join needed here)
      const { count: docCount } = await supabase
        .from('player_documents')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalPlayers: players.length,
        totalCoaches: coachProfiles.length,
        approvedCoaches: coachProfiles.filter(c => c.approved).length,
        totalDocs: docCount || 0,
        signupsThisMonth,
      })

      // ── Position breakdown ──
      const posCounts: Record<string, number> = {}
      players.forEach(p => {
        const pos = p.position_primary || 'Unknown'
        posCounts[pos] = (posCounts[pos] || 0) + 1
      })
      setPositionData(
        Object.entries(posCounts)
          .map(([position, count]) => ({ position: position.replace(/_/g, ' '), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
      )

      // ── Age breakdown ──
      const ageCounts: Record<string, number> = {
        'Under 18': 0, '18–21': 0, '22–25': 0, '26–30': 0, '30+': 0
      }
      players.forEach(p => {
        if (!p.date_of_birth) return
        const age = Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / 31557600000)
        if (age < 18) ageCounts['Under 18']++
        else if (age <= 21) ageCounts['18–21']++
        else if (age <= 25) ageCounts['22–25']++
        else if (age <= 30) ageCounts['26–30']++
        else ageCounts['30+']++
      })
      setAgeData(Object.entries(ageCounts).map(([group, count]) => ({ group, count })))

      // ── Nationality breakdown ──
      const natCounts: Record<string, number> = {}
      players.forEach(p => {
        const nat = p.nationality_primary || 'Unknown'
        natCounts[nat] = (natCounts[nat] || 0) + 1
      })
      setNationalityData(
        Object.entries(natCounts)
          .map(([nationality, count]) => ({ nationality, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      )

      // ── Signups over time — cumulative, grouped by month ──
      const allSignupDates: Date[] = [
        ...players.map(p => new Date(p.created_at)),
        ...coachProfiles.map(c => new Date(c.created_at)),
      ].sort((a, b) => a.getTime() - b.getTime())

      if (allSignupDates.length > 0) {
        const earliest = allSignupDates[0]
        const now = new Date()

        // Build one bucket per calendar month from earliest → now
        const buckets: { year: number, month: number, label: string, new: number }[] = []
        const cur = new Date(earliest.getFullYear(), earliest.getMonth(), 1)
        while (cur <= now) {
          buckets.push({
            year: cur.getFullYear(),
            month: cur.getMonth(),
            label: cur.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
            new: 0,
          })
          cur.setMonth(cur.getMonth() + 1)
        }

        allSignupDates.forEach(d => {
          const b = buckets.find(b => b.year === d.getFullYear() && b.month === d.getMonth())
          if (b) b.new++
        })

        // Convert to running cumulative total (monthly)
        let running = 0
        setSignupChartData(buckets.map(b => {
          running += b.new
          return { label: b.label, total: running }
        }))

        // ── Daily view — last 30 days, cumulative from day 0 ──
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(now.getDate() - 29)
        thirtyDaysAgo.setHours(0, 0, 0, 0)

        // Total signups before the 30-day window (baseline for cumulative)
        const baseline = allSignupDates.filter(d => d < thirtyDaysAgo).length

        // Build one bucket per day for the last 30 days
        const dayBuckets: { dateKey: string, label: string, new: number }[] = []
        for (let i = 0; i < 30; i++) {
          const d = new Date(thirtyDaysAgo)
          d.setDate(thirtyDaysAgo.getDate() + i)
          dayBuckets.push({
            dateKey: d.toISOString().slice(0, 10),
            label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            new: 0,
          })
        }

        allSignupDates.forEach(d => {
          const key = d.toISOString().slice(0, 10)
          const b = dayBuckets.find(b => b.dateKey === key)
          if (b) b.new++
        })

        let dailyRunning = baseline
        setSignupDailyData(dayBuckets.map(b => {
          dailyRunning += b.new
          return { label: b.label, total: dailyRunning }
        }))
      }

      // ── Recent signups table (test-excluded) ──
      const recentPlayers = [...players]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(p => ({
          name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || '–',
          type: 'Player',
          detail: p.position_primary?.replace(/_/g, ' ') || '–',
          date: p.created_at,
          status: 'Active',
        }))

      const recentCoaches = [...coachProfiles]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(c => ({
          name: c.full_name || c.organisation_name || '–',
          type: 'Coach',
          detail: c.organisation_name || '–',
          date: c.created_at,
          status: c.approved ? 'Approved' : 'Pending',
        }))

      setRecentSignups(
        [...recentPlayers, ...recentCoaches]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8)
      )

      setLoading(false)
    }
    load()
  }, [])

  const maxPos = Math.max(...positionData.map(p => p.count), 1)
  const maxAge = Math.max(...ageData.map(a => a.count), 1)
  const maxNat = Math.max(...nationalityData.map(n => n.count), 1)

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

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
        .page-label { font-size: 10px; color: #2ec97e; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 8px; }
        .page-title { font-size: 28px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 28px; }
        .stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
        .stat-card { background: #E8E6DF; border-radius: 8px; padding: 1rem; }
        .stat-label { font-size: 12px; color: #5F5E5A; margin-bottom: 6px; }
        .stat-value { font-size: 24px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; }
        .chart-card { background: white; border-radius: 12px; padding: 1.25rem; border: 0.5px solid #D3D1C7; margin-bottom: 16px; }
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .card { background: white; border-radius: 12px; padding: 1.25rem; border: 0.5px solid #D3D1C7; }
        .card-title { font-size: 13px; font-weight: 700; color: #0D1B2E; margin-bottom: 1rem; }
        .bar-row { margin-bottom: 10px; }
        .bar-label-row { display: flex; justify-content: space-between; font-size: 11px; color: #5F5E5A; margin-bottom: 3px; }
        .bar-track { height: 6px; background: #F1EFE8; border-radius: 4px; }
        .bar-fill-green { height: 6px; background: #2ec97e; border-radius: 4px; }
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
        <span className="nav-logo-text">GAIN<span style={{ color: '#2ec97e' }}>LINE</span></span>
        <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div className="content">
        <p className="page-label">SUPER ADMIN</p>
        <h1 className="page-title">Platform overview</h1>

        {/* ── Stat tiles ── */}
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

        {/* ── Signups over time — full-width line chart ── */}
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0D1B2E' }}>Signups over time</p>
            <div style={{ display: 'flex', background: '#F1EFE8', borderRadius: 6, padding: 3, gap: 2 }}>
              {(['weekly', 'daily'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Arial, sans-serif',
                    background: chartView === v ? '#3DBE72' : 'transparent',
                    color: chartView === v ? 'white' : '#888780',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {(chartView === 'weekly' ? signupChartData : signupDailyData).length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartView === 'weekly' ? signupChartData : signupDailyData} margin={{ top: 4, right: 16, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#888780' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#888780' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0D1B2E',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F1EFE8',
                  }}
                  labelStyle={{ color: '#3DBE72', fontWeight: 700, marginBottom: 4 }}
                  formatter={(value: number) => [value, 'Total signups']}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3DBE72"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3DBE72', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888780', fontSize: '13px' }}>
              Not enough data yet
            </div>
          )}
        </div>

        {/* ── Three breakdown cards ── */}
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

        {/* ── Recent signups table ── */}
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
