'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function daysAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export default function VacanciesListPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [vacancies, setVacancies] = useState<any[]>([])
  const [appCounts, setAppCounts] = useState<Record<string, { total: number; new: number }>>({})

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('is_coach, role').eq('id', user.id).single()
    if (!prof?.is_coach && prof?.role !== 'org_user') { router.push('/dashboard'); return }

    const { data: coach } = await supabase.from('coaches').select('id').eq('user_id', user.id).single()
    if (!coach) { router.push('/dashboard'); return }

    const [{ data: vacs }, { data: apps }] = await Promise.all([
      supabase.from('vacancies').select('*').eq('coach_id', coach.id).eq('is_demo', false).order('created_at', { ascending: false }),
      supabase.from('vacancy_applications').select('vacancy_id, status').eq('coach_id', coach.id),
    ])

    setVacancies(vacs || [])

    // Group app counts by vacancy
    const counts: Record<string, { total: number; new: number }> = {}
    for (const app of apps || []) {
      if (!counts[app.vacancy_id]) counts[app.vacancy_id] = { total: 0, new: 0 }
      counts[app.vacancy_id].total++
      if (app.status === 'new') counts[app.vacancy_id].new++
    }
    setAppCounts(counts)
    setLoading(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('vacancies').update({ is_active: !current }).eq('id', id)
    setVacancies(prev => prev.map(v => v.id === id ? { ...v, is_active: !current } : v))
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'Arial', color: '#888780', fontSize: '14px' }}>Loading...</span>
    </div>
  )

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0C0F16; color: #F0EDE4; }
        .page { max-width: 800px; margin: 0 auto; padding: 32px 20px 60px; }
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .page-label { font-size: 10px; color: #2ec97e; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 4px; }
        .page-title { font-size: 22px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; }
        .post-btn { background: #D4A843; color: #0C0F16; font-size: 13px; font-weight: 700; padding: 9px 18px; border-radius: 8px; text-decoration: none; font-family: Arial, sans-serif; white-space: nowrap; flex-shrink: 0; }
        .vac-list { display: flex; flex-direction: column; gap: 10px; }
        .vac-card { background: #161C2A; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.07); padding: 18px 20px; }
        .vac-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        .vac-club { font-size: 16px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 2px; }
        .vac-meta { font-size: 12px; color: #888780; }
        .vac-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
        .vac-tag { font-size: 10px; font-weight: 700; background: rgba(29,158,117,0.12); color: #5DCAA5; border: 1px solid rgba(29,158,117,0.2); padding: 2px 7px; border-radius: 4px; }
        .vac-stats { display: flex; gap: 16px; margin-bottom: 14px; }
        .vac-stat { font-size: 12px; color: #888780; }
        .vac-stat strong { color: #F0EDE4; font-weight: 700; margin-right: 4px; }
        .vac-stat-new { color: #2ec97e; font-weight: 700; }
        .vac-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding-top: 12px; border-top: 0.5px solid rgba(255,255,255,0.06); }
        .status-badge { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 10px; cursor: pointer; user-select: none; }
        .status-live { background: rgba(29,158,117,0.15); color: #5DCAA5; border: 1px solid rgba(29,158,117,0.25); }
        .status-hidden { background: rgba(255,255,255,0.05); color: #888780; border: 1px solid rgba(255,255,255,0.1); }
        .action-btn { font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-family: Arial, sans-serif; text-decoration: none; border: none; white-space: nowrap; }
        .action-btn-apps { background: transparent; border: 1.5px solid rgba(29,158,117,0.3); color: #5DCAA5; }
        .action-btn-edit { background: transparent; border: 1.5px solid rgba(255,255,255,0.1); color: #A8A398; }
        .empty-state { text-align: center; padding: 60px 20px; background: #161C2A; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.07); }
        .empty-title { font-size: 16px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 8px; }
        .empty-sub { font-size: 13px; color: #888780; margin-bottom: 20px; }
        .empty-btn { display: inline-block; background: #D4A843; color: #0C0F16; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-family: Arial, sans-serif; }
        @media (min-width: 640px) {
          .page { padding: 40px 28px 80px; }
        }
      `}</style>

      <div className="page">
        <div className="page-header">
          <div>
            <p className="page-label">COACH PORTAL</p>
            <h1 className="page-title">My Vacancies</h1>
          </div>
          <a href="/dashboard/coach/vacancies/new" className="post-btn">+ Post vacancy</a>
        </div>

        {vacancies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">No vacancies yet</div>
            <p className="empty-sub">Post your first vacancy to start receiving player applications.</p>
            <a href="/dashboard/coach/vacancies/new" className="empty-btn">Post a vacancy →</a>
          </div>
        ) : (
          <div className="vac-list">
            {vacancies.map(v => {
              const counts = appCounts[v.id] || { total: 0, new: 0 }
              return (
                <div key={v.id} className="vac-card" style={{ opacity: v.is_active ? 1 : 0.55 }}>
                  <div className="vac-top">
                    <div>
                      <div className="vac-club">{v.club_name}</div>
                      <div className="vac-meta">{[v.level, v.country, v.season].filter(Boolean).join(' · ')}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span
                        className={`status-badge ${v.is_active ? 'status-live' : 'status-hidden'}`}
                        onClick={() => toggleActive(v.id, v.is_active)}
                        title="Click to toggle"
                      >
                        {v.is_active ? 'Live' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  {v.positions?.length > 0 && (
                    <div className="vac-tags">
                      {v.positions.map((p: string) => <span key={p} className="vac-tag">{p}</span>)}
                    </div>
                  )}

                  <div className="vac-stats">
                    <div className="vac-stat">
                      <strong>{counts.total}</strong>
                      {counts.new > 0 && <span className="vac-stat-new">({counts.new} new) </span>}
                      applications
                    </div>
                    <div className="vac-stat">Posted {daysAgo(v.created_at)}</div>
                  </div>

                  <div className="vac-actions">
                    <a href={`/dashboard/coach/vacancies/${v.id}`} className="action-btn action-btn-apps">
                      View applications {counts.new > 0 && `(${counts.new} new)`}
                    </a>
                    <a href={`/dashboard/coach/vacancies/new?edit=${v.id}`} className="action-btn action-btn-edit">Edit</a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
