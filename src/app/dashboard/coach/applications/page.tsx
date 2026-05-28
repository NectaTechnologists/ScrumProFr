'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function pos(s: string) { return s?.replace(/_/g, ' ') || '–' }

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  new:          { label: 'New',         color: '#1D9E75', bg: 'rgba(29,158,117,0.12)' },
  reviewing:    { label: 'Reviewing',   color: '#D4A843', bg: 'rgba(212,168,67,0.12)' },
  shortlisted:  { label: 'Shortlisted', color: '#4A7FD4', bg: 'rgba(74,127,212,0.12)' },
  not_suitable: { label: 'Not suitable',color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
}

export default function CoachApplicationsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [vacanciesWithApps, setVacanciesWithApps] = useState<any[]>([])

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('is_coach, role').eq('id', user.id).single()
    if (!prof?.is_coach && prof?.role !== 'org_user') { router.push('/dashboard'); return }

    const { data: coach } = await supabase.from('coaches').select('id').eq('user_id', user.id).single()
    if (!coach) { router.push('/dashboard'); return }

    // Load all vacancies with their applications and player data
    const { data: apps } = await supabase
      .from('vacancy_applications')
      .select(`
        id, status, applied_at, vacancy_id,
        players(first_name, last_name, position_primary, avatar_url, share_token),
        vacancies(id, club_name, positions)
      `)
      .eq('coach_id', coach.id)
      .order('applied_at', { ascending: false })

    // Group by vacancy
    const byVacancy: Record<string, { vacancy: any; apps: any[] }> = {}
    for (const app of apps || []) {
      const vId = app.vacancy_id
      if (!byVacancy[vId]) byVacancy[vId] = { vacancy: app.vacancies, apps: [] }
      byVacancy[vId].apps.push(app)
    }

    setVacanciesWithApps(Object.values(byVacancy))
    setLoading(false)
  }

  const totalNew = vacanciesWithApps.reduce((n, v) => n + v.apps.filter((a: any) => a.status === 'new').length, 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0C0F16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#A8A398', fontSize: '14px', fontFamily: 'Arial' }}>Loading...</div>
    </div>
  )

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', Arial, sans-serif; background: #0C0F16; color: #F0EDE4; }
        .nav { background: #0D1B2E; padding: 0 16px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-link { color: rgba(255,255,255,0.5); font-size: 13px; text-decoration: none; white-space: nowrap; }
        .signout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; }
        .content { max-width: 960px; margin: 0 auto; padding: 28px 16px 80px; }
        .page-label { font-size: 10px; color: #1D9E75; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 6px; }
        .page-title { font-size: 22px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 20px; }
        .vac-group { margin-bottom: 20px; }
        .vac-group-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .vac-group-title { font-size: 14px; font-weight: 700; color: #F0EDE4; }
        .vac-group-meta { font-size: 12px; color: #888780; }
        .vac-group-link { font-size: 12px; color: #1D9E75; text-decoration: none; }
        .app-row { background: #161C2A; border-radius: 10px; padding: 12px 14px; border: 0.5px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
        .app-avatar { width: 32px; height: 32px; border-radius: 7px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .app-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .app-avatar span { color: white; font-size: 11px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .app-info { flex: 1; min-width: 100px; }
        .app-name { font-size: 13px; font-weight: 700; color: #F0EDE4; }
        .app-pos { font-size: 11px; color: #888780; margin-top: 2px; }
        .status-pill { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
        .app-date { font-size: 11px; color: #5A564F; white-space: nowrap; }
        .view-btn { background: #0D1B2E; color: white; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; white-space: nowrap; }
        .empty { text-align: center; padding: 48px 20px; background: #161C2A; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.07); }
        @media (min-width: 769px) { .nav { padding: 0 28px; height: 64px; } .content { padding: 32px 28px 60px; } }
      `}</style>


      <div className="content">
        <p className="page-label">COACH PORTAL</p>
        <h1 className="page-title">
          Applications
          {totalNew > 0 && (
            <span style={{ marginLeft: '10px', fontSize: '14px', background: '#1D9E75', color: 'white', padding: '3px 10px', borderRadius: '20px', fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>
              {totalNew} new
            </span>
          )}
        </h1>

        {vacanciesWithApps.length === 0 ? (
          <div className="empty">
            <p style={{ fontSize: '15px', fontWeight: 900, color: '#F0EDE4', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '6px' }}>No applications yet</p>
            <p style={{ fontSize: '13px', color: '#888780' }}>Players will appear here when they submit their Player Card for one of your vacancies.</p>
          </div>
        ) : (
          vacanciesWithApps.map(({ vacancy, apps }) => {
            const newCount = apps.filter((a: any) => a.status === 'new').length
            return (
              <div key={vacancy.id} className="vac-group">
                <div className="vac-group-header">
                  <div>
                    <span className="vac-group-title">{vacancy.club_name}</span>
                    {vacancy.positions?.length > 0 && (
                      <span className="vac-group-meta"> · {vacancy.positions[0]}</span>
                    )}
                    {newCount > 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '10px', background: 'rgba(29,158,117,0.15)', color: '#1D9E75', padding: '2px 7px', borderRadius: '10px', fontWeight: 700 }}>
                        {newCount} new
                      </span>
                    )}
                  </div>
                  <a href={`/dashboard/coach/vacancies/${vacancy.id}`} className="vac-group-link">
                    View all →
                  </a>
                </div>
                {apps.slice(0, 5).map((app: any) => {
                  const p = app.players
                  const initials = [p?.first_name?.[0], p?.last_name?.[0]].filter(Boolean).join('')
                  const st = STATUS_LABELS[app.status] || STATUS_LABELS.new
                  return (
                    <div key={app.id} className="app-row">
                      <div className="app-avatar">
                        {p?.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{initials}</span>}
                      </div>
                      <div className="app-info">
                        <div className="app-name">{p?.first_name} {p?.last_name}</div>
                        {p?.position_primary && <div className="app-pos">{pos(p.position_primary)}</div>}
                      </div>
                      <span className="status-pill" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      <span className="app-date">{timeAgo(app.applied_at)}</span>
                      {p?.share_token && (
                        <a href={`/cv/${p.share_token}`} target="_blank" className="view-btn">View card →</a>
                      )}
                    </div>
                  )
                })}
                {apps.length > 5 && (
                  <a href={`/dashboard/coach/vacancies/${vacancy.id}`} style={{ display: 'block', textAlign: 'center', padding: '10px', fontSize: '12px', color: '#1D9E75', textDecoration: 'none' }}>
                    +{apps.length - 5} more — view all
                  </a>
                )}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
