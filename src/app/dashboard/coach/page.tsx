'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const POSITIONS = [
  'LOOSEHEAD_PROP','HOOKER','TIGHTHEAD_PROP','LEFT_LOCK','RIGHT_LOCK',
  'BLINDSIDE_FLANKER','OPENSIDE_FLANKER','NUMBER_8','SCRUMHALF','FLYHALF',
  'LEFT_WING','INSIDE_CENTRE','OUTSIDE_CENTRE','RIGHT_WING','FULLBACK'
]

const NATIONALITIES = [
  'South African','English','Welsh','Irish','Scottish','French',
  'Australian','New Zealander','Argentinian','Zimbabwean','Namibian',
  'Georgian','Italian','Japanese','Fijian','Samoan','Tongan'
]

export default function CoachDashboard() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'card' | 'list'>('card')

  const [filters, setFilters] = useState({
    position: '',
    nationality: '',
    age: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)

      if (profile?.role === 'player') { router.push('/dashboard'); return }

      if (profile?.approved) {
        const { data: players } = await supabase
          .from('players')
          .select('*')
          .eq('profile_visibility', 'PUBLIC')
          .limit(10)
          .order('created_at', { ascending: false })

        setPlayers(players || [])
        setFiltered(players || [])
      }

      setLoading(false)
    }
    load()
  }, [])

  // Apply filters whenever they change
  useEffect(() => {
    let result = [...players]

    if (filters.position) {
      result = result.filter(p => p.position_primary === filters.position || p.position_secondary === filters.position)
    }

    if (filters.nationality) {
      result = result.filter(p => p.nationality_primary?.toLowerCase().includes(filters.nationality.toLowerCase()))
    }

    if (filters.age) {
      result = result.filter(p => {
        if (!p.date_of_birth) return false
        const age = Math.floor((new Date().getTime() - new Date(p.date_of_birth).getTime()) / 31557600000)
        if (filters.age === 'Under 18') return age < 18
        if (filters.age === '18–21') return age >= 18 && age <= 21
        if (filters.age === '22–25') return age >= 22 && age <= 25
        if (filters.age === '26–30') return age >= 26 && age <= 30
        if (filters.age === '30+') return age > 30
        return true
      })
    }

    setFiltered(result)
  }, [filters, players])

  const pos = (s: string) => s?.replace(/_/g, ' ') || '–'
  const getAge = (dob: string) => dob ? Math.floor((new Date().getTime() - new Date(dob).getTime()) / 31557600000) : null
  const getInitials = (p: any) => [p.first_name?.[0], p.last_name?.[0]].filter(Boolean).join('')

  const clearFilters = () => setFilters({ position: '', nationality: '', age: '' })
  const hasFilters = filters.position || filters.nationality || filters.age

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F1EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Arial', color: '#888780', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  // Pending approval screen
  if (profile && !profile.approved) {
    return (
      <>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Arial, sans-serif; background: #F1EFE8; }`}</style>
        <nav style={{ background: '#0D1B2E', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="32" height="30" viewBox="0 0 32 30" style={{ display: 'block' }}>
              <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
              <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
              <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
            </svg>
            <span style={{ color: 'white', fontWeight: '900', fontSize: '20px', letterSpacing: '-1px', fontFamily: 'Arial Black, Arial, sans-serif' }}>GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)', padding: '7px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>Sign out</button>
          </form>
        </nav>
        <div style={{ maxWidth: '560px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="#1D9E75" strokeWidth="2.5"/>
              <line x1="16" y1="10" x2="16" y2="17" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="21" r="1.5" fill="#1D9E75"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#0D1B2E', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '12px' }}>Account pending approval</h1>
          <p style={{ fontSize: '15px', color: '#5F5E5A', lineHeight: '1.7', marginBottom: '8px' }}>Your application is being reviewed. We manually verify all coach and recruiter accounts to maintain the quality of the Gainline network.</p>
          <p style={{ fontSize: '15px', color: '#5F5E5A', lineHeight: '1.7', marginBottom: '24px' }}>You&apos;ll receive an email at <strong>{user?.email}</strong> once approved — usually within 24 hours.</p>
          <p style={{ fontSize: '13px', color: '#888780' }}>Questions? <a href="mailto:bruce@necta.co.za" style={{ color: '#1D9E75' }}>Contact us</a></p>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F1EFE8; }
        .nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; }
        .nav-logo-text { color: white; font-weight: 900; font-size: 20px; letter-spacing: -1px; font-family: 'Arial Black', Arial, sans-serif; }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .nav-email { color: rgba(255,255,255,0.5); font-size: 13px; }
        .signout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); padding: 7px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: Arial, sans-serif; }

        .content { max-width: 1000px; margin: 0 auto; padding: 40px 28px; }
        .page-label { font-size: 10px; color: #1D9E75; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 8px; }
        .page-title { font-size: 28px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 6px; }
        .page-sub { font-size: 14px; color: #5F5E5A; margin-bottom: 28px; }

        .toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .filter-select { padding: 9px 14px; border: 1.5px solid #D3D1C7; border-radius: 8px; font-size: 13px; color: #0D1B2E; background: white; outline: none; font-family: Arial, sans-serif; cursor: pointer; }
        .filter-select:focus { border-color: #1D9E75; }
        .clear-btn { padding: 9px 14px; border: 1.5px solid #D3D1C7; border-radius: 8px; font-size: 13px; color: #888780; background: white; cursor: pointer; font-family: Arial, sans-serif; }
        .clear-btn:hover { border-color: #1D9E75; color: #1D9E75; }

        .view-toggle { display: flex; gap: 2px; background: white; padding: 3px; border-radius: 8px; border: 1px solid #D3D1C7; margin-left: auto; }
        .toggle-btn { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; font-family: Arial, sans-serif; background: transparent; color: #888780; }
        .toggle-active { background: #0D1B2E; color: white; }

        .results-count { font-size: 13px; color: #888780; margin-bottom: 16px; }

        /* CARD VIEW */
        .player-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .player-card { background: white; border-radius: 12px; padding: 20px; border: 0.5px solid #D3D1C7; display: block; text-decoration: none; transition: border-color 0.15s; }
        .player-card:hover { border-color: #1D9E75; }
        .player-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .player-avatar { width: 44px; height: 44px; border-radius: 10px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .player-avatar span { color: white; font-size: 16px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .player-name { font-size: 15px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 3px; }
        .player-meta { font-size: 12px; color: #888780; }
        .position-badge { display: inline-block; background: #E1F5EE; color: #0F6E56; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.06em; margin-bottom: 12px; }
        .player-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #F1EFE8; border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
        .stat-cell { background: white; padding: 10px 8px; text-align: center; }
        .stat-val { font-size: 14px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; }
        .stat-lbl { font-size: 9px; color: #888780; letter-spacing: 0.08em; margin-top: 2px; }
        .cv-btn { width: 100%; padding: 8px; background: #0D1B2E; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; font-family: 'Arial Black', Arial, sans-serif; cursor: pointer; text-align: center; text-decoration: none; display: block; }

        /* LIST VIEW */
        .player-list { display: flex; flex-direction: column; gap: 8px; }
        .player-row { background: white; border-radius: 10px; padding: 16px 20px; border: 0.5px solid #D3D1C7; display: flex; align-items: center; gap: 16px; text-decoration: none; transition: border-color 0.15s; }
        .player-row:hover { border-color: #1D9E75; }
        .row-avatar { width: 38px; height: 38px; border-radius: 8px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .row-avatar span { color: white; font-size: 14px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .row-name { font-size: 14px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; min-width: 160px; }
        .row-position { font-size: 11px; background: #E1F5EE; color: #0F6E56; padding: 3px 8px; border-radius: 4px; font-weight: 700; letter-spacing: 0.06em; white-space: nowrap; }
        .row-stats { display: flex; gap: 20px; margin-left: auto; }
        .row-stat { text-align: center; }
        .row-stat-val { font-size: 13px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; }
        .row-stat-lbl { font-size: 9px; color: #888780; letter-spacing: 0.08em; }
        .row-nationality { font-size: 12px; color: #888780; white-space: nowrap; }
        .row-cv-btn { background: #0D1B2E; color: white; font-size: 11px; font-weight: 700; padding: 7px 14px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; white-space: nowrap; flex-shrink: 0; }

        .upgrade-banner { background: #0D1B2E; border-radius: 12px; padding: 24px 28px; margin-top: 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .upgrade-text h3 { font-size: 16px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 4px; }
        .upgrade-text p { font-size: 13px; color: rgba(255,255,255,0.55); }
        .upgrade-btn { background: #1D9E75; color: white; font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; white-space: nowrap; }

        .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 0.5px solid #D3D1C7; }
        .empty-state h3 { font-size: 18px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 8px; }
        .empty-state p { font-size: 14px; color: #888780; }

        @media (max-width: 768px) {
          .nav { padding: 0 16px; height: 56px; }
          .nav-email { display: none; }
          .nav-logo-text { font-size: 17px; }
          .content { padding: 24px 16px; }
          .page-title { font-size: 22px; }
          .player-grid { grid-template-columns: 1fr; }
          .toolbar { gap: 8px; }
          .filter-select { font-size: 12px; padding: 8px 10px; }
          .view-toggle { margin-left: 0; }
          .row-stats { display: none; }
          .upgrade-banner { flex-direction: column; align-items: flex-start; }
          .upgrade-btn { width: 100%; text-align: center; }
          .player-row { flex-wrap: wrap; gap: 10px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <svg width="32" height="30" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="nav-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </div>
        <div className="nav-right">
          <span className="nav-email">{user?.email}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="signout-btn">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="content">
        <p className="page-label">COACH & RECRUITER PORTAL</p>
        <h1 className="page-title">Player Browser</h1>
        <p className="page-sub">
          {profile?.organisation_name && `${profile.organisation_name} · `}
          {profile?.role_title && `${profile.role_title} · `}
          Free tier — showing up to 10 players
        </p>

        {/* Toolbar */}
        <div className="toolbar">
          <select
            className="filter-select"
            value={filters.position}
            onChange={e => setFilters({ ...filters, position: e.target.value })}
          >
            <option value="">All positions</option>
            {POSITIONS.map(p => <option key={p} value={p}>{pos(p)}</option>)}
          </select>

          <select
            className="filter-select"
            value={filters.nationality}
            onChange={e => setFilters({ ...filters, nationality: e.target.value })}
          >
            <option value="">All nationalities</option>
            {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <select
            className="filter-select"
            value={filters.age}
            onChange={e => setFilters({ ...filters, age: e.target.value })}
          >
            <option value="">Any age</option>
            <option>Under 18</option>
            <option>18–21</option>
            <option>22–25</option>
            <option>26–30</option>
            <option>30+</option>
          </select>

          {hasFilters && (
            <button className="clear-btn" onClick={clearFilters}>Clear filters</button>
          )}

          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === 'card' ? 'toggle-active' : ''}`}
              onClick={() => setView('card')}
            >
              ⊞ Cards
            </button>
            <button
              className={`toggle-btn ${view === 'list' ? 'toggle-active' : ''}`}
              onClick={() => setView('list')}
            >
              ☰ List
            </button>
          </div>
        </div>

        <p className="results-count">
          {filtered.length === 0
            ? 'No players match your filters'
            : `Showing ${filtered.length} player${filtered.length !== 1 ? 's' : ''}${hasFilters ? ' — filtered' : ''}`
          }
        </p>

        {/* CARD VIEW */}
        {view === 'card' && (
          filtered.length > 0 ? (
            <div className="player-grid">
              {filtered.map(player => {
                const age = getAge(player.date_of_birth)
                return (
                  <div key={player.id} className="player-card">
                    <div className="player-header">
                      <div className="player-avatar"><span>{getInitials(player)}</span></div>
                      <div>
                        <div className="player-name">{player.first_name} {player.last_name}</div>
                        <div className="player-meta">{player.nationality_primary || '–'}</div>
                      </div>
                    </div>
                    {player.position_primary && <div className="position-badge">{pos(player.position_primary)}</div>}
                    <div className="player-stats">
                      <div className="stat-cell"><div className="stat-val">{age ?? '–'}</div><div className="stat-lbl">AGE</div></div>
                      <div className="stat-cell"><div className="stat-val">{player.height_cm || '–'}</div><div className="stat-lbl">CM</div></div>
                      <div className="stat-cell"><div className="stat-val">{player.weight_kg || '–'}</div><div className="stat-lbl">KG</div></div>
                    </div>
                    <a href={`/cv/${player.share_token}`} className="cv-btn" target="_blank" rel="noopener noreferrer">View full CV →</a>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No players match your filters</h3>
              <p>Try adjusting or clearing your filters to see more players.</p>
            </div>
          )
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          filtered.length > 0 ? (
            <div className="player-list">
              {filtered.map(player => {
                const age = getAge(player.date_of_birth)
                return (
                  <a key={player.id} href={`/cv/${player.share_token}`} className="player-row" target="_blank" rel="noopener noreferrer">
                    <div className="row-avatar"><span>{getInitials(player)}</span></div>
                    <div className="row-name">{player.first_name} {player.last_name}</div>
                    {player.position_primary && <div className="row-position">{pos(player.position_primary)}</div>}
                    <div className="row-nationality">{player.nationality_primary || '–'}</div>
                    <div className="row-stats">
                      <div className="row-stat"><div className="row-stat-val">{age ?? '–'}</div><div className="row-stat-lbl">AGE</div></div>
                      <div className="row-stat"><div className="row-stat-val">{player.height_cm || '–'}</div><div className="row-stat-lbl">CM</div></div>
                      <div className="row-stat"><div className="row-stat-val">{player.weight_kg || '–'}</div><div className="row-stat-lbl">KG</div></div>
                    </div>
                    <span className="row-cv-btn">View CV →</span>
                  </a>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No players match your filters</h3>
              <p>Try adjusting or clearing your filters to see more players.</p>
            </div>
          )
        )}

        {/* Upgrade banner */}
        {filtered.length > 0 && (
          <div className="upgrade-banner">
            <div className="upgrade-text">
              <h3>Want access to the full player pool?</h3>
              <p>Upgrade to unlock unlimited players, advanced filters, shortlisting and more.</p>
            </div>
            <a href="mailto:bruce@necta.co.za?subject=Gainline Full Access Request" className="upgrade-btn">
              Request full access →
            </a>
          </div>
        )}
      </div>
    </>
  )
}
