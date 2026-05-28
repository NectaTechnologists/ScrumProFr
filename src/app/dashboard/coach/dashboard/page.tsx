'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days === 0 && hours === 0) return `${mins}m ago`
  if (days === 0) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function pos(s: string) { return s?.replace(/_/g, ' ') || '—' }

export default function CoachDashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [coachName, setCoachName] = useState('')
  const [stats, setStats] = useState({ openVacancies: 0, newApps: 0, shortlisted: 0, cardViews: 0 })
  const [recentApps, setRecentApps] = useState<any[]>([])
  const [hasVacancies, setHasVacancies] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('is_coach, role').eq('id', user.id).single()
    if (!prof?.is_coach && prof?.role !== 'org_user') { router.push('/dashboard'); return }

    const { data: coach } = await supabase.from('coaches').select('id, full_name, organisation').eq('user_id', user.id).single()
    if (!coach) { router.push('/dashboard'); return }

    setCoachName(coach.full_name || coach.organisation || 'Coach')

    // Run stat queries in parallel
    const [
      { count: openVacancies },
      { count: newApps },
      { count: shortlisted },
      { count: cardViews },
      { data: recent },
    ] = await Promise.all([
      supabase.from('vacancies').select('id', { count: 'exact', head: true }).eq('coach_id', coach.id).eq('is_active', true),
      supabase.from('vacancy_applications').select('id', { count: 'exact', head: true }).eq('coach_id', coach.id).eq('status', 'new'),
      supabase.from('shortlists').select('id', { count: 'exact', head: true }).eq('coach_id', user.id),
      supabase.from('cv_views').select('id', { count: 'exact', head: true }).eq('coach_id', user.id),
      supabase.from('vacancy_applications')
        .select(`id, applied_at, status, players(first_name, last_name, position_primary), vacancies(club_name, positions)`)
        .eq('coach_id', coach.id)
        .order('applied_at', { ascending: false })
        .limit(5),
    ])

    setStats({
      openVacancies: openVacancies || 0,
      newApps: newApps || 0,
      shortlisted: shortlisted || 0,
      cardViews: cardViews || 0,
    })
    setRecentApps(recent || [])
    setHasVacancies((openVacancies || 0) > 0)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'Arial', color: '#888780', fontSize: '14px' }}>Loading...</span>
    </div>
  )

  const STAT_CARDS = [
    { label: 'Open Vacancies',      value: stats.openVacancies, href: '/dashboard/coach/vacancies',    color: '#1D9E75' },
    { label: 'New Applications',    value: stats.newApps,       href: '/dashboard/coach/applications', color: '#D4A843' },
    { label: 'Players Shortlisted', value: stats.shortlisted,   href: '/dashboard/coach',              color: '#4A7FD4' },
    { label: 'Card Views',          value: stats.cardViews,     href: null,                            color: '#A8A398' },
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0C0F16; color: #F0EDE4; }
        .dash { max-width: 900px; margin: 0 auto; padding: 32px 20px 60px; }
        .welcome { font-size: 22px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 4px; }
        .welcome-sub { font-size: 13px; color: #888780; margin-bottom: 28px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 28px; }
        .stat-card { background: #161C2A; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.07); padding: 20px; text-decoration: none; display: block; transition: border-color 0.15s; }
        .stat-card:hover { border-color: rgba(255,255,255,0.15); }
        .stat-value { font-size: 32px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; line-height: 1; margin-bottom: 6px; }
        .stat-label { font-size: 11px; color: #888780; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
        .section-title { font-size: 10px; color: #888780; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 12px; }
        .activity-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 28px; }
        .activity-row { background: #161C2A; border-radius: 10px; padding: 12px 16px; border: 0.5px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 12px; }
        .activity-avatar { width: 32px; height: 32px; border-radius: 7px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .activity-avatar span { color: white; font-size: 11px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .activity-info { flex: 1; min-width: 0; }
        .activity-name { font-size: 13px; font-weight: 700; color: #F0EDE4; }
        .activity-meta { font-size: 11px; color: #888780; margin-top: 2px; }
        .activity-time { font-size: 11px; color: #5A564F; white-space: nowrap; flex-shrink: 0; }
        .status-pill { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; flex-shrink: 0; }
        .cta-box { background: #0D1B2E; border-radius: 12px; padding: 24px; border: 1px solid rgba(29,158,117,0.15); text-align: center; }
        .cta-box h3 { font-size: 15px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 6px; }
        .cta-box p { font-size: 13px; color: #888780; margin-bottom: 16px; }
        .cta-btn { display: inline-block; background: #1D9E75; color: white; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-family: Arial, sans-serif; }
        .empty-activity { background: #161C2A; border-radius: 10px; padding: 24px; border: 0.5px solid rgba(255,255,255,0.07); text-align: center; font-size: 13px; color: #888780; }
        @media (min-width: 640px) {
          .dash { padding: 40px 28px 80px; }
          .stats-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <div className="dash">
        <h1 className="welcome">Welcome back, {coachName.split(' ')[0]}</h1>
        <p className="welcome-sub">Here's what's happening across your portal</p>

        {/* Stat cards */}
        <div className="stats-grid">
          {STAT_CARDS.map(s => {
            const inner = (
              <>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </>
            )
            return s.href ? (
              <a key={s.label} href={s.href} className="stat-card">{inner}</a>
            ) : (
              <div key={s.label} className="stat-card">{inner}</div>
            )
          })}
        </div>

        {/* Recent applications */}
        <p className="section-title">Recent Applications</p>
        {recentApps.length > 0 ? (
          <div className="activity-list">
            {recentApps.map((app: any) => {
              const p = app.players
              const v = app.vacancies
              const initials = [p?.first_name?.[0], p?.last_name?.[0]].filter(Boolean).join('')
              const statusColors: Record<string, { color: string; bg: string }> = {
                new:          { color: '#1D9E75', bg: 'rgba(29,158,117,0.12)' },
                reviewing:    { color: '#D4A843', bg: 'rgba(212,168,67,0.12)' },
                shortlisted:  { color: '#4A7FD4', bg: 'rgba(74,127,212,0.12)' },
                not_suitable: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
              }
              const sc = statusColors[app.status] || statusColors.new
              return (
                <div key={app.id} className="activity-row">
                  <div className="activity-avatar"><span>{initials}</span></div>
                  <div className="activity-info">
                    <div className="activity-name">{p?.first_name} {p?.last_name}</div>
                    <div className="activity-meta">
                      {p?.position_primary && <span>{pos(p.position_primary)}</span>}
                      {v?.club_name && <span> · {v.club_name}</span>}
                    </div>
                  </div>
                  <span className="status-pill" style={{ background: sc.bg, color: sc.color }}>
                    {app.status === 'not_suitable' ? 'Not suitable' : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                  <span className="activity-time">{timeAgo(app.applied_at)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-activity" style={{ marginBottom: '28px' }}>No applications yet — share your vacancies to attract players.</div>
        )}

        {/* Post Vacancy CTA if no open vacancies */}
        {!hasVacancies && (
          <div className="cta-box">
            <h3>Post your first vacancy</h3>
            <p>Let players know you're looking — it only takes 2 minutes.</p>
            <a href="/dashboard/coach/vacancies/new" className="cta-btn">Post a vacancy →</a>
          </div>
        )}
      </div>
    </>
  )
}
