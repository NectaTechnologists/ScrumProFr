'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { t, Lang } from '@/lib/translations'

const FLAG_EN = '🇬🇧'
const FLAG_FR = '🇫🇷'

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
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [view, setView] = useState<'card' | 'list'>('card')
  const [tab, setTab] = useState<'all' | 'shortlist'>('all')
  const [lang, setLang] = useState<Lang>('en')
  const [search, setSearch] = useState('')

  const [filters, setFilters] = useState({
    position: '',
    nationality: '',
    age: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem('gainline_lang') as Lang
    if (saved === 'en' || saved === 'fr') setLang(saved)

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
        await fetchPlayers({ position: '', nationality: '', age: '' })
        const { data: sl } = await supabase
          .from('shortlists')
          .select('player_id')
          .eq('coach_id', user.id)
        if (sl) setShortlistedIds(new Set(sl.map((s: any) => s.player_id)))
      }

      setLoading(false)
    }
    load()
  }, [])

  function toggleLang(l: Lang) {
    setLang(l)
    localStorage.setItem('gainline_lang', l)
  }

  async function fetchPlayers(f: { position: string, nationality: string, age: string }) {
    setSearching(true)

    let query = supabase
      .from('players')
      .select('*')
      .eq('profile_visibility', 'PUBLIC')
      .limit(10)
      .order('created_at', { ascending: false })

    if (f.position) {
      query = query.or(`position_primary.eq.${f.position},position_secondary.eq.${f.position}`)
    }
    if (f.nationality) {
      query = query.ilike('nationality_primary', `%${f.nationality}%`)
    }
    if (f.age) {
      const now = new Date()
      if (f.age === 'Under 18') {
        const minDob = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate()).toISOString().split('T')[0]
        query = query.gte('date_of_birth', minDob)
      } else if (f.age === '18–21') {
        const maxDob = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate()).toISOString().split('T')[0]
        const minDob = new Date(now.getFullYear() - 22, now.getMonth(), now.getDate()).toISOString().split('T')[0]
        query = query.lte('date_of_birth', maxDob).gte('date_of_birth', minDob)
      } else if (f.age === '22–25') {
        const maxDob = new Date(now.getFullYear() - 22, now.getMonth(), now.getDate()).toISOString().split('T')[0]
        const minDob = new Date(now.getFullYear() - 26, now.getMonth(), now.getDate()).toISOString().split('T')[0]
        query = query.lte('date_of_birth', maxDob).gte('date_of_birth', minDob)
      } else if (f.age === '26–30') {
        const maxDob = new Date(now.getFullYear() - 26, now.getMonth(), now.getDate()).toISOString().split('T')[0]
        const minDob = new Date(now.getFullYear() - 31, now.getMonth(), now.getDate()).toISOString().split('T')[0]
        query = query.lte('date_of_birth', maxDob).gte('date_of_birth', minDob)
      } else if (f.age === '30+') {
        const maxDob = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate()).toISOString().split('T')[0]
        query = query.lte('date_of_birth', maxDob)
      }
    }

    const { data } = await query
    setPlayers(data || [])
    setSearching(false)
  }

  async function toggleShortlist(e: React.MouseEvent, playerId: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return

    if (shortlistedIds.has(playerId)) {
      await supabase.from('shortlists').delete().eq('coach_id', user.id).eq('player_id', playerId)
      setShortlistedIds(prev => { const n = new Set(prev); n.delete(playerId); return n })
    } else {
      await supabase.from('shortlists').insert({ coach_id: user.id, player_id: playerId })
      setShortlistedIds(prev => new Set(prev).add(playerId))
    }
  }

  async function handleFilterChange(key: string, value: string) {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    await fetchPlayers(newFilters)
  }

  async function clearFilters() {
    const reset = { position: '', nationality: '', age: '' }
    setFilters(reset)
    setSearch('')
    await fetchPlayers(reset)
  }

  const pos = (s: string) => s?.replace(/_/g, ' ') || '–'
  const getAge = (dob: string) => dob ? Math.floor((new Date().getTime() - new Date(dob).getTime()) / 31557600000) : null
  const getInitials = (p: any) => [p.first_name?.[0], p.last_name?.[0]].filter(Boolean).join('')
  const hasFilters = filters.position || filters.nationality || filters.age || search
  const T = t[lang]

  const displayedPlayers = players
    .filter(p => tab === 'shortlist' ? shortlistedIds.has(p.id) : true)
    .filter(p => {
      if (!search) return true
      const full = `${p.first_name} ${p.last_name}`.toLowerCase()
      return full.includes(search.toLowerCase())
    })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F1EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Arial', color: '#888780', fontSize: '14px' }}>Loading...</div>
    </div>
  )

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
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#0D1B2E', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '12px' }}>{T.coach_pending_title}</h1>
          <p style={{ fontSize: '15px', color: '#5F5E5A', lineHeight: '1.7', marginBottom: '8px' }}>{T.coach_pending_sub}</p>
          <p style={{ fontSize: '15px', color: '#5F5E5A', lineHeight: '1.7' }}>{T.coach_pending_email}</p>
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
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-email { color: rgba(255,255,255,0.5); font-size: 13px; }
        .signout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); padding: 7px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: Arial, sans-serif; }
        .lang-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.08); padding: 3px; border-radius: 8px; }
        .lang-btn { background: transparent; border: none; cursor: pointer; font-size: 16px; width: 30px; height: 26px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .lang-btn-active { background: rgba(255,255,255,0.15); }
        .content { max-width: 1000px; margin: 0 auto; padding: 40px 28px; }
        .page-label { font-size: 10px; color: #1D9E75; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 8px; }
        .page-title { font-size: 28px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 6px; }
        .page-sub { font-size: 14px; color: #5F5E5A; margin-bottom: 28px; }
        .tabs { display: flex; gap: 2px; background: white; padding: 3px; border-radius: 10px; border: 0.5px solid #D3D1C7; margin-bottom: 20px; width: fit-content; }
        .tab { padding: 8px 20px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; font-family: Arial, sans-serif; background: transparent; color: #888780; }
        .tab-active { background: #0D1B2E; color: white; }
        .tab-count { display: inline-block; background: #1D9E75; color: white; border-radius: 10px; font-size: 10px; padding: 1px 6px; margin-left: 6px; }
        .toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .search-input { padding: 9px 14px; border: 1.5px solid #D3D1C7; border-radius: 8px; font-size: 13px; color: #0D1B2E; background: white; outline: none; font-family: Arial, sans-serif; min-width: 180px; }
        .search-input:focus { border-color: #1D9E75; }
        .search-input::placeholder { color: #B4B2A9; }
        .filter-select { padding: 9px 14px; border: 1.5px solid #D3D1C7; border-radius: 8px; font-size: 13px; color: #0D1B2E; background: white; outline: none; font-family: Arial, sans-serif; cursor: pointer; }
        .filter-select:focus { border-color: #1D9E75; }
        .clear-btn { padding: 9px 14px; border: 1.5px solid #D3D1C7; border-radius: 8px; font-size: 13px; color: #888780; background: white; cursor: pointer; font-family: Arial, sans-serif; }
        .clear-btn:hover { border-color: #1D9E75; color: #1D9E75; }
        .view-toggle { display: flex; gap: 2px; background: white; padding: 3px; border-radius: 8px; border: 1px solid #D3D1C7; margin-left: auto; }
        .toggle-btn { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; font-family: Arial, sans-serif; background: transparent; color: #888780; }
        .toggle-active { background: #0D1B2E; color: white; }
        .results-count { font-size: 13px; color: #888780; margin-bottom: 16px; }
        .player-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .player-card { background: white; border-radius: 12px; padding: 20px; border: 0.5px solid #D3D1C7; display: block; text-decoration: none; transition: border-color 0.15s; position: relative; }
        .player-card:hover { border-color: #1D9E75; }
        .player-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .player-avatar { width: 44px; height: 44px; border-radius: 10px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .player-avatar span { color: white; font-size: 16px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .player-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .player-name { font-size: 15px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 3px; }
        .player-meta { font-size: 12px; color: #888780; }
        .position-badge { display: inline-block; background: #E1F5EE; color: #0F6E56; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.06em; margin-bottom: 12px; }
        .player-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #F1EFE8; border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
        .stat-cell { background: white; padding: 10px 8px; text-align: center; }
        .stat-val { font-size: 14px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; }
        .stat-lbl { font-size: 9px; color: #888780; letter-spacing: 0.08em; margin-top: 2px; }
        .card-actions { display: flex; gap: 8px; }
        .cv-btn { flex: 1; padding: 8px; background: #0D1B2E; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; font-family: 'Arial Black', Arial, sans-serif; cursor: pointer; text-align: center; text-decoration: none; display: block; }
        .shortlist-btn { width: 36px; height: 34px; border-radius: 6px; border: 1.5px solid #D3D1C7; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; transition: all 0.15s; }
        .shortlist-btn:hover { border-color: #1D9E75; }
        .shortlist-btn-active { background: #FFF8E7; border-color: #F0A500; }
        .player-list { display: flex; flex-direction: column; gap: 8px; }
        .player-row { background: white; border-radius: 10px; padding: 16px 20px; border: 0.5px solid #D3D1C7; display: flex; align-items: center; gap: 16px; text-decoration: none; transition: border-color 0.15s; }
        .player-row:hover { border-color: #1D9E75; }
        .row-avatar { width: 38px; height: 38px; border-radius: 8px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .row-avatar span { color: white; font-size: 14px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .row-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .row-name { font-size: 14px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; min-width: 160px; }
        .row-position { font-size: 11px; background: #E1F5EE; color: #0F6E56; padding: 3px 8px; border-radius: 4px; font-weight: 700; letter-spacing: 0.06em; white-space: nowrap; }
        .row-stats { display: flex; gap: 20px; margin-left: auto; }
        .row-stat { text-align: center; }
        .row-stat-val { font-size: 13px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; }
        .row-stat-lbl { font-size: 9px; color: #888780; letter-spacing: 0.08em; }
        .row-nationality { font-size: 12px; color: #888780; white-space: nowrap; }
        .row-cv-btn { background: #0D1B2E; color: white; font-size: 11px; font-weight: 700; padding: 7px 14px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; white-space: nowrap; flex-shrink: 0; }
        .row-shortlist-btn { width: 32px; height: 32px; border-radius: 6px; border: 1.5px solid #D3D1C7; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .row-shortlist-btn-active { background: #FFF8E7; border-color: #F0A500; }
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
          .search-input { width: 100%; }
          .filter-select { font-size: 12px; padding: 8px 10px; }
          .view-toggle { margin-left: 0; }
          .row-stats { display: none; }
          .upgrade-banner { flex-direction: column; align-items: flex-start; }
          .upgrade-btn { width: 100%; text-align: center; }
        }
      `}</style>

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
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('en')}>{FLAG_EN}</button>
            <button className={`lang-btn ${lang === 'fr' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('fr')}>{FLAG_FR}</button>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="signout-btn">{T.nav_sign_out}</button>
          </form>
        </div>
      </nav>

      <div className="content">
        <p className="page-label">{T.coach_label}</p>
        <h1 className="page-title">{T.coach_title}</h1>
        <p className="page-sub">
          {profile?.organisation_name && `${profile.organisation_name} · `}
          {profile?.role_title && `${profile.role_title} · `}
          {T.coach_free_tier}
        </p>

        <div className="tabs">
          <button className={`tab ${tab === 'all' ? 'tab-active' : ''}`} onClick={() => setTab('all')}>
            {lang === 'fr' ? 'Tous les joueurs' : 'All Players'}
          </button>
          <button className={`tab ${tab === 'shortlist' ? 'tab-active' : ''}`} onClick={() => setTab('shortlist')}>
            {lang === 'fr' ? 'Ma sélection' : 'My Shortlist'}
            {shortlistedIds.size > 0 && <span className="tab-count">{shortlistedIds.size}</span>}
          </button>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder={lang === 'fr' ? 'Rechercher par nom...' : 'Search by name...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="filter-select" value={filters.position} onChange={e => handleFilterChange('position', e.target.value)}>
            <option value="">{T.coach_all_positions}</option>
            {POSITIONS.map(p => <option key={p} value={p}>{pos(p)}</option>)}
          </select>
          <select className="filter-select" value={filters.nationality} onChange={e => handleFilterChange('nationality', e.target.value)}>
            <option value="">{T.coach_all_nationalities}</option>
            {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select className="filter-select" value={filters.age} onChange={e => handleFilterChange('age', e.target.value)}>
            <option value="">{T.coach_any_age}</option>
            <option>Under 18</option>
            <option>18–21</option>
            <option>22–25</option>
            <option>26–30</option>
            <option>30+</option>
          </select>
          {hasFilters && <button className="clear-btn" onClick={clearFilters}>{T.coach_clear}</button>}
          <div className="view-toggle">
            <button className={`toggle-btn ${view === 'card' ? 'toggle-active' : ''}`} onClick={() => setView('card')}>{T.coach_cards}</button>
            <button className={`toggle-btn ${view === 'list' ? 'toggle-active' : ''}`} onClick={() => setView('list')}>{T.coach_list}</button>
          </div>
        </div>

        <p className="results-count">
          {searching ? (lang === 'fr' ? 'Recherche...' : 'Searching...') :
            displayedPlayers.length === 0
              ? (tab === 'shortlist' ? (lang === 'fr' ? 'Aucun joueur dans votre sélection.' : 'No players in your shortlist yet.') : T.coach_no_match)
              : `${T.coach_showing} ${displayedPlayers.length} ${displayedPlayers.length !== 1 ? T.coach_players : T.coach_player}${hasFilters ? ` ${T.coach_filtered}` : ''}`
          }
        </p>

        {view === 'card' && (
          displayedPlayers.length > 0 ? (
            <div className="player-grid">
              {displayedPlayers.map(player => {
                const age = getAge(player.date_of_birth)
                const isShortlisted = shortlistedIds.has(player.id)
                return (
                  <div key={player.id} className="player-card">
                    <div className="player-header">
                      <div className="player-avatar">
                        {player.avatar_url ? <img src={player.avatar_url} alt={player.first_name} /> : <span>{getInitials(player)}</span>}
                      </div>
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
                    <div className="card-actions">
                      <a href={`/cv/${player.share_token}`} className="cv-btn" target="_blank" rel="noopener noreferrer">{T.coach_view_cv}</a>
                      <button
                        className={`shortlist-btn ${isShortlisted ? 'shortlist-btn-active' : ''}`}
                        onClick={e => toggleShortlist(e, player.id)}
                        title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                      >
                        {isShortlisted ? '⭐' : '☆'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h3>{tab === 'shortlist' ? (lang === 'fr' ? 'Aucune sélection' : 'No shortlist yet') : T.coach_no_match}</h3>
              <p>{tab === 'shortlist' ? (lang === 'fr' ? 'Cliquez sur ☆ pour ajouter des joueurs.' : 'Click ☆ on any player to add them.') : (lang === 'fr' ? 'Essayez de modifier vos filtres.' : 'Try adjusting your filters.')}</p>
            </div>
          )
        )}

        {view === 'list' && (
          displayedPlayers.length > 0 ? (
            <div className="player-list">
              {displayedPlayers.map(player => {
                const age = getAge(player.date_of_birth)
                const isShortlisted = shortlistedIds.has(player.id)
                return (
                  <div key={player.id} className="player-row">
                    <div className="row-avatar">
                      {player.avatar_url ? <img src={player.avatar_url} alt={player.first_name} /> : <span>{getInitials(player)}</span>}
                    </div>
                    <div className="row-name">{player.first_name} {player.last_name}</div>
                    {player.position_primary && <div className="row-position">{pos(player.position_primary)}</div>}
                    <div className="row-nationality">{player.nationality_primary || '–'}</div>
                    <div className="row-stats">
                      <div className="row-stat"><div className="row-stat-val">{age ?? '–'}</div><div className="row-stat-lbl">AGE</div></div>
                      <div className="row-stat"><div className="row-stat-val">{player.height_cm || '–'}</div><div className="row-stat-lbl">CM</div></div>
                      <div className="row-stat"><div className="row-stat-val">{player.weight_kg || '–'}</div><div className="row-stat-lbl">KG</div></div>
                    </div>
                    <a href={`/cv/${player.share_token}`} className="row-cv-btn" target="_blank" rel="noopener noreferrer">{T.coach_view_cv_short}</a>
                    <button
                      className={`row-shortlist-btn ${isShortlisted ? 'row-shortlist-btn-active' : ''}`}
                      onClick={e => toggleShortlist(e, player.id)}
                      title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                    >
                      {isShortlisted ? '⭐' : '☆'}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h3>{tab === 'shortlist' ? (lang === 'fr' ? 'Aucune sélection' : 'No shortlist yet') : T.coach_no_match}</h3>
              <p>{tab === 'shortlist' ? (lang === 'fr' ? 'Cliquez sur ☆ pour ajouter des joueurs.' : 'Click ☆ on any player to add them.') : (lang === 'fr' ? 'Essayez de modifier vos filtres.' : 'Try adjusting your filters.')}</p>
            </div>
          )
        )}

        {tab === 'all' && players.length > 0 && (
          <div className="upgrade-banner">
            <div className="upgrade-text">
              <h3>{T.coach_upgrade_title}</h3>
              <p>{T.coach_upgrade_sub}</p>
            </div>
            <a href="mailto:bruce@necta.co.za?subject=Gainline Full Access Request" className="upgrade-btn">
              {T.coach_upgrade_btn}
            </a>
          </div>
        )}
      </div>
    </>
  )
}