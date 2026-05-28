'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

const STATUS_OPTIONS = [
  { value: 'new',          label: 'New',          color: '#1D9E75', bg: 'rgba(29,158,117,0.12)' },
  { value: 'reviewing',    label: 'Reviewing',     color: '#D4A843', bg: 'rgba(212,168,67,0.12)' },
  { value: 'shortlisted',  label: 'Shortlisted',   color: '#4A7FD4', bg: 'rgba(74,127,212,0.12)' },
  { value: 'not_suitable', label: 'Not suitable',  color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
]

function statusStyle(s: string) {
  return STATUS_OPTIONS.find(o => o.value === s) || STATUS_OPTIONS[0]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function getAge(dob: string) {
  if (!dob) return null
  return Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000)
}

function pos(s: string) { return s?.replace(/_/g, ' ') || '–' }

export default function VacancyApplicationsPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const vacancyId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'applications' | 'details'>('applications')
  const [vacancy, setVacancy] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [coachId, setCoachId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => { load() }, [vacancyId])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('is_coach, role, approved').eq('id', user.id).single()
    if (!prof?.is_coach && prof?.role !== 'org_user') { router.push('/dashboard'); return }

    const { data: coach } = await supabase.from('coaches').select('id').eq('user_id', user.id).single()
    if (!coach) { router.push('/dashboard'); return }
    setCoachId(coach.id)

    // Load vacancy — must belong to this coach
    const { data: vac } = await supabase
      .from('vacancies')
      .select('*')
      .eq('id', vacancyId)
      .eq('coach_id', coach.id)
      .single()

    if (!vac) { router.push('/dashboard/vacancies'); return }
    setVacancy(vac)

    // Load applications with player data
    const { data: apps } = await supabase
      .from('vacancy_applications')
      .select(`
        id, status, applied_at,
        players(id, first_name, last_name, position_primary, position_secondary,
                nationality_primary, date_of_birth, weight_kg, availability,
                avatar_url, share_token)
      `)
      .eq('vacancy_id', vacancyId)
      .order('applied_at', { ascending: false })

    setApplications(apps || [])
    setLoading(false)
  }

  async function updateStatus(appId: string, newStatus: string) {
    setUpdatingId(appId)
    await supabase.from('vacancy_applications').update({ status: newStatus }).eq('id', appId)
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
    setUpdatingId(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0C0F16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#A8A398', fontSize: '14px', fontFamily: 'Arial' }}>Loading...</div>
    </div>
  )

  const newCount = applications.filter(a => a.status === 'new').length

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', Arial, sans-serif; background: #0C0F16; color: #F0EDE4; }
        .nav { background: #0D1B2E; padding: 0 16px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 8px; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-link { color: rgba(255,255,255,0.5); font-size: 13px; text-decoration: none; white-space: nowrap; }
        .nav-link:hover { color: rgba(255,255,255,0.8); }
        .signout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-family: Arial, sans-serif; }
        .content { max-width: 960px; margin: 0 auto; padding: 24px 16px 80px; }
        .back-link { display: inline-flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.4); font-size: 13px; text-decoration: none; margin-bottom: 20px; }
        .back-link:hover { color: rgba(255,255,255,0.7); }
        .vacancy-header { background: #161C2A; border: 0.5px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
        .vacancy-club { font-size: 20px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 4px; }
        .vacancy-meta { font-size: 12px; color: #888780; margin-bottom: 12px; }
        .vacancy-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .v-tag { font-size: 10px; font-weight: 700; background: rgba(29,158,117,0.15); color: #5DCAA5; padding: 3px 9px; border-radius: 5px; letter-spacing: 0.04em; }
        .tabs { display: flex; gap: 2px; background: #111520; padding: 3px; border-radius: 10px; border: 0.5px solid rgba(255,255,255,0.07); margin-bottom: 16px; width: fit-content; }
        .tab { padding: 7px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; font-family: Arial, sans-serif; background: transparent; color: #888780; display: flex; align-items: center; gap: 6px; }
        .tab-active { background: #D4A843; color: #0C0F16; }
        .tab-badge { background: #1D9E75; color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }
        /* Application rows */
        .app-list { display: flex; flex-direction: column; gap: 8px; }
        .app-row { background: #161C2A; border-radius: 10px; padding: 12px 14px; border: 0.5px solid rgba(255,255,255,0.07); }
        .app-row-main { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .app-avatar { width: 36px; height: 36px; border-radius: 8px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .app-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .app-avatar span { color: white; font-size: 13px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .app-info { flex: 1; min-width: 120px; }
        .app-name { font-size: 13px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; }
        .app-sub { font-size: 11px; color: #888780; margin-top: 3px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .app-pos { display: inline-block; font-size: 10px; background: #E1F5EE; color: #0F6E56; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
        .avail-available { display: inline-block; font-size: 10px; background: #22c98a; color: #000; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
        .avail-eos { display: inline-block; font-size: 10px; background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
        .avail-no { display: inline-block; font-size: 10px; background: #1e2330; color: #6b7280; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
        .app-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }
        .app-date { font-size: 11px; color: #5A564F; }
        .status-select { padding: 5px 8px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px; font-family: Arial, sans-serif; outline: none; cursor: pointer; color: #F0EDE4; background: #1C2338; }
        .app-view-btn { background: #0D1B2E; color: white; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; white-space: nowrap; margin-left: auto; }
        .empty-state { text-align: center; padding: 48px 20px; background: #161C2A; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.07); }
        .empty-title { font-size: 15px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 6px; }
        .empty-sub { font-size: 13px; color: #888780; }
        /* Vacancy detail tab */
        .detail-section { background: #161C2A; border-radius: 12px; padding: 20px; margin-bottom: 12px; border: 0.5px solid rgba(255,255,255,0.06); }
        .detail-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 0.14em; margin-bottom: 8px; }
        .detail-text { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.65; }
        .detail-eligibility { background: rgba(212,168,67,0.08); border: 1px solid rgba(212,168,67,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; }
        .detail-eligibility .detail-label { color: #D4A843; }
        @media (min-width: 769px) {
          .nav { padding: 0 28px; height: 64px; }
          .content { padding: 32px 28px 60px; }
          .app-row-main { flex-wrap: nowrap; }
          .app-actions { margin-top: 0; padding-top: 0; border-top: none; flex-wrap: nowrap; }
        }
      `}</style>


      <div className="content">
        <a href="/dashboard/vacancies" className="back-link">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 8H3M7 4l-4 4 4 4"/>
          </svg>
          Back to vacancies
        </a>

        {/* Vacancy header */}
        <div className="vacancy-header">
          <div className="vacancy-club">{vacancy.club_name}</div>
          <div className="vacancy-meta">{[vacancy.country, vacancy.level, vacancy.season].filter(Boolean).join(' · ')}</div>
          <div className="vacancy-tags">
            {vacancy.positions?.map((p: string) => <span key={p} className="v-tag">{p}</span>)}
          </div>
        </div>

        {/* Tab row */}
        <div className="tabs">
          <button className={`tab ${tab === 'applications' ? 'tab-active' : ''}`} onClick={() => setTab('applications')}>
            Applications
            {newCount > 0 && tab !== 'applications' && <span className="tab-badge">{newCount}</span>}
            {tab === 'applications' && applications.length > 0 && (
              <span style={{ fontSize: '11px', opacity: 0.7 }}>({applications.length})</span>
            )}
          </button>
          <button className={`tab ${tab === 'details' ? 'tab-active' : ''}`} onClick={() => setTab('details')}>
            Vacancy details
          </button>
        </div>

        {/* ── Applications tab ── */}
        {tab === 'applications' && (
          <div className="app-list">
            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-title">No applications yet</div>
                <div className="empty-sub">Players will appear here when they submit their Player Card for this vacancy.</div>
              </div>
            ) : (
              applications.map(app => {
                const p = app.players
                const initials = [p?.first_name?.[0], p?.last_name?.[0]].filter(Boolean).join('')
                const age = p?.date_of_birth ? getAge(p.date_of_birth) : null
                const avail = p?.availability
                const st = statusStyle(app.status)

                return (
                  <div key={app.id} className="app-row">
                    <div className="app-row-main">
                      {/* Avatar */}
                      <div className="app-avatar">
                        {p?.avatar_url ? (
                          <img src={p.avatar_url} alt={p.first_name} />
                        ) : (
                          <span>{initials || '?'}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="app-info">
                        <div className="app-name">{p?.first_name} {p?.last_name}</div>
                        <div className="app-sub">
                          {p?.position_primary && <span className="app-pos">{pos(p.position_primary)}</span>}
                          {p?.nationality_primary && <span>{p.nationality_primary}</span>}
                          {age && <span>{age} yrs</span>}
                          {p?.weight_kg && <span>{p.weight_kg}kg</span>}
                          {avail === 'available' && <span className="avail-available">Available</span>}
                          {avail === 'end_of_season' && <span className="avail-eos">End of season</span>}
                          {avail && avail !== 'available' && avail !== 'end_of_season' && <span className="avail-no">Not available</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="app-actions">
                        <span className="app-date">{timeAgo(app.applied_at)}</span>
                        <select
                          className="status-select"
                          value={app.status}
                          disabled={updatingId === app.id}
                          onChange={e => updateStatus(app.id, e.target.value)}
                          style={{ borderColor: st.color, color: st.color, background: st.bg }}
                        >
                          {STATUS_OPTIONS.map(o => (
                            <option key={o.value} value={o.value} style={{ background: '#1C2338', color: '#F0EDE4' }}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {p?.share_token ? (
                          <a href={`/cv/${p.share_token}`} target="_blank" rel="noopener noreferrer" className="app-view-btn">
                            View card →
                          </a>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#5A564F', marginLeft: 'auto' }}>Card not shared</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── Vacancy details tab ── */}
        {tab === 'details' && (
          <div>
            {vacancy.eligibility_notes && (
              <div className="detail-eligibility">
                <div className="detail-label">⚠ ELIGIBILITY REQUIREMENTS</div>
                <div className="detail-text">{vacancy.eligibility_notes}</div>
              </div>
            )}
            {vacancy.offer_details && (
              <div className="detail-section">
                <div className="detail-label">WHAT'S ON OFFER</div>
                <div className="detail-text">{vacancy.offer_details}</div>
              </div>
            )}
            {vacancy.contact_info && (
              <div className="detail-section">
                <div className="detail-label">CONTACT</div>
                <div className="detail-text">{vacancy.contact_info}</div>
              </div>
            )}
            {vacancy.closing_date && (
              <div className="detail-section">
                <div className="detail-label">CLOSING DATE</div>
                <div className="detail-text">{new Date(vacancy.closing_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            )}
            {vacancy.description && (
              <div className="detail-section">
                <div className="detail-label">DESCRIPTION</div>
                <div className="detail-text">{vacancy.description}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
