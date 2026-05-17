'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { t, Lang } from '@/lib/translations'

const HERO_COLLAPSED_KEY = 'gainline_coach_hero_collapsed'

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

const AGE_GROUPS = ['Under 18','18–21','22–25','26–30','30+']
const CATEGORIES = ['Contracted','Negotiating','Interested']

const CATEGORY_COLORS: Record<string, { bg: string, color: string, border: string }> = {
  'Contracted':  { bg: '#E1F5EE', color: '#0F6E56', border: 'rgba(29,158,117,0.3)' },
  'Negotiating': { bg: '#FFF3CD', color: '#856404', border: 'rgba(240,165,0,0.3)' },
  'Interested':  { bg: '#E8F0FE', color: '#1A56DB', border: 'rgba(74,127,212,0.3)' },
}

// Inline SVG icons — Tabler outline style
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c98a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
    <path d="M6 20v-1a6 6 0 0 1 12 0v1"/>
  </svg>
)

const IdIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="16" rx="3"/>
    <circle cx="9" cy="10" r="2"/>
    <line x1="15" y1="8" x2="17" y2="8"/>
    <line x1="15" y1="12" x2="17" y2="12"/>
    <line x1="7" y1="16" x2="17" y2="16"/>
  </svg>
)

const TrophyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
    <path d="M7 4h10v8a5 5 0 0 1 -10 0v-8"/>
    <path d="M5 9h-2a2 2 0 0 0 2 4"/>
    <path d="M19 9h2a2 2 0 0 1 -2 4"/>
  </svg>
)

const LockIconSm = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="5" y="11" width="14" height="10" rx="2"/>
    <path d="M12 3a4 4 0 0 1 4 4v4h-8v-4a4 4 0 0 1 4 -4z"/>
  </svg>
)

const BuildingIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="3" y1="21" x2="21" y2="21"/>
    <path d="M5 21v-14a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14"/>
    <line x1="9" y1="10" x2="9" y2="10.01"/>
    <line x1="15" y1="10" x2="15" y2="10.01"/>
    <line x1="9" y1="14" x2="9" y2="14.01"/>
    <line x1="15" y1="14" x2="15" y2="14.01"/>
  </svg>
)

const NotesIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2z"/>
    <line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
    <line x1="9" y1="16" x2="12" y2="16"/>
  </svg>
)

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#F0A500' : 'none'} stroke={filled ? '#F0A500' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
  </svg>
)

const NoteIcon = ({ filled }: { filled: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={filled ? '#4A7FD4' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="12" rx="2"/>
    <line x1="5" y1="5.5" x2="11" y2="5.5"/>
    <line x1="5" y1="8" x2="11" y2="8"/>
    <line x1="5" y1="10.5" x2="8" y2="10.5"/>
  </svg>
)

export default function CoachDashboard() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set())
  const [sharedWithMeIds, setSharedWithMeIds] = useState<Set<string>>(new Set())
  const [cvRequests, setCvRequests] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [openNoteId, setOpenNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [view, setView] = useState<'card' | 'list'>('list')
  const [tab, setTab] = useState<'all' | 'shortlist'>('all')
  const [lang, setLang] = useState<Lang>('en')
  const [search, setSearch] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [natSearch, setNatSearch] = useState('')
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({})
  const [coachProfile, setCoachProfile] = useState<any>(null)
  const [heroCollapsed, setHeroCollapsed] = useState(false)

  const [activeFilters, setActiveFilters] = useState<{
    positions: string[]
    nationalities: string[]
    ages: string[]
    categories: string[]
  }>({ positions: [], nationalities: [], ages: [], categories: [] })

  useEffect(() => {
    const saved = localStorage.getItem('gainline_lang') as Lang
    if (saved === 'en' || saved === 'fr') setLang(saved)
    const collapsed = localStorage.getItem(HERO_COLLAPSED_KEY)
    if (collapsed === '1') setHeroCollapsed(true)
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUser(user)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(profile)
    if (profile?.role === 'player') { router.push('/dashboard'); return }
    if (profile && !profile.approved && !profile.is_coach) { router.push('/dashboard'); return }
    // Fetch coach profile row
    const { data: coachRow } = await supabase.from('coaches').select('*').eq('profile_id', user.id).single()
    if (coachRow) setCoachProfile(coachRow)

    if (profile?.approved) {
      await fetchPlayers({ positions: [], nationalities: [], ages: [], categories: [] }, '')
      const [{ data: sl }, { data: views }, { data: nn }, { data: cvReqs }] = await Promise.all([
        supabase.from('shortlists').select('player_id, category').eq('coach_id', user.id),
        supabase.from('cv_views').select('player_id').eq('coach_id', user.id),
        supabase.from('coach_notes').select('player_id, note').eq('coach_id', user.id),
        supabase.from('cv_requests').select('player_id, status').eq('coach_id', user.id),
      ])
      if (sl) {
        setShortlistedIds(new Set(sl.map((s: any) => s.player_id)))
        const catMap: Record<string, string> = {}
        sl.forEach((s: any) => { if (s.category) catMap[s.player_id] = s.category })
        setCategories(catMap)
      }
      const viewedIds = (views || []).map((v: any) => v.player_id)
      const slIds = (sl || []).map((s: any) => s.player_id)
      const sharedReqIds = (cvReqs || []).filter((r: any) => r.status === 'shared').map((r: any) => r.player_id)
      setSharedWithMeIds(new Set([...viewedIds, ...slIds, ...sharedReqIds]))
      if (nn) {
        const map: Record<string, string> = {}
        nn.forEach((n: any) => { map[n.player_id] = n.note })
        setNotes(map)
      }
      if (cvReqs) {
        const reqMap: Record<string, string> = {}
        cvReqs.forEach((r: any) => { reqMap[r.player_id] = r.status })
        setCvRequests(reqMap)
      }
      const { data: allViews } = await supabase.from('cv_views').select('player_id')
      if (allViews) {
        const counts: Record<string, number> = {}
        allViews.forEach((v: any) => { counts[v.player_id] = (counts[v.player_id] || 0) + 1 })
        setViewCounts(counts)
      }
    }
    setLoading(false)
  }

  function toggleLang(l: Lang) { setLang(l); localStorage.setItem('gainline_lang', l) }

  function toggleHeroCollapsed() {
    const next = !heroCollapsed
    setHeroCollapsed(next)
    localStorage.setItem(HERO_COLLAPSED_KEY, next ? '1' : '0')
  }

  async function fetchPlayers(f: typeof activeFilters, nameSearch: string) {
    setSearching(true)
    let query = supabase.from('players').select('*').eq('profile_visibility', 'PUBLIC').limit(50).order('created_at', { ascending: false })
    if (nameSearch) query = query.or(`first_name.ilike.%${nameSearch}%,last_name.ilike.%${nameSearch}%`)
    if (f.positions.length === 1) query = query.or(`position_primary.eq.${f.positions[0]},position_secondary.eq.${f.positions[0]}`)
    else if (f.positions.length > 1) {
      const orClauses = f.positions.map(p => `position_primary.eq.${p},position_secondary.eq.${p}`).join(',')
      query = query.or(orClauses)
    }
    if (f.nationalities.length === 1) query = query.ilike('nationality_primary', `%${f.nationalities[0]}%`)
    if (f.ages.length > 0) {
      const now = new Date()
      const dobRanges = f.ages.map(age => {
        if (age === 'Under 18') return { min: new Date(now.getFullYear() - 18, now.getMonth(), now.getDate()).toISOString().split('T')[0], max: null }
        if (age === '18–21') return { min: new Date(now.getFullYear() - 22, now.getMonth(), now.getDate()).toISOString().split('T')[0], max: new Date(now.getFullYear() - 18, now.getMonth(), now.getDate()).toISOString().split('T')[0] }
        if (age === '22–25') return { min: new Date(now.getFullYear() - 26, now.getMonth(), now.getDate()).toISOString().split('T')[0], max: new Date(now.getFullYear() - 22, now.getMonth(), now.getDate()).toISOString().split('T')[0] }
        if (age === '26–30') return { min: new Date(now.getFullYear() - 31, now.getMonth(), now.getDate()).toISOString().split('T')[0], max: new Date(now.getFullYear() - 26, now.getMonth(), now.getDate()).toISOString().split('T')[0] }
        if (age === '30+') return { min: null, max: new Date(now.getFullYear() - 30, now.getMonth(), now.getDate()).toISOString().split('T')[0] }
        return null
      }).filter(Boolean)
      if (dobRanges.length === 1) {
        const r = dobRanges[0]!
        if (r.min) query = query.gte('date_of_birth', r.min)
        if (r.max) query = query.lte('date_of_birth', r.max)
      }
    }
    const { data } = await query
    setPlayers(data || [])
    setSearching(false)
  }

  function toggleFilter(group: keyof typeof activeFilters, value: string) {
    const current = activeFilters[group]
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    const newFilters = { ...activeFilters, [group]: next }
    setActiveFilters(newFilters)
    fetchPlayers(newFilters, search)
  }

  function removeFilter(group: keyof typeof activeFilters, value: string) {
    const next = activeFilters[group].filter(v => v !== value)
    const newFilters = { ...activeFilters, [group]: next }
    setActiveFilters(newFilters)
    fetchPlayers(newFilters, search)
  }

  function clearAllFilters() {
    const reset = { positions: [], nationalities: [], ages: [], categories: [] }
    setActiveFilters(reset)
    setSearch('')
    fetchPlayers(reset, '')
  }

  async function toggleShortlist(e: React.MouseEvent, playerId: string) {
    e.preventDefault(); e.stopPropagation()
    if (!user) return
    if (shortlistedIds.has(playerId)) {
      await supabase.from('shortlists').delete().eq('coach_id', user.id).eq('player_id', playerId)
      setShortlistedIds(prev => { const n = new Set(prev); n.delete(playerId); return n })
      setCategories(prev => { const n = { ...prev }; delete n[playerId]; return n })
    } else {
      await supabase.from('shortlists').insert({ coach_id: user.id, player_id: playerId })
      setShortlistedIds(prev => new Set(prev).add(playerId))
    }
  }

  async function requestCard(playerId: string) {
    if (!user || !profile) return
    setCvRequests(prev => ({ ...prev, [playerId]: 'pending' }))
    await supabase.from('cv_requests').insert({
      coach_id: user.id,
      player_id: playerId,
      coach_name: profile?.full_name || user?.email || null,
      coach_org: profile?.organisation_name || null,
    })
    // Fire notification — non-blocking, errors don't affect UX
    fetch('/api/notify-cv-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_id: playerId,
        coach_name: profile?.full_name || profile?.organisation_name || user?.email || 'A coach',
        coach_org: profile?.organisation_name || null,
      }),
    }).catch(() => {/* silent — notification is best-effort */})
  }

  async function updateCategory(playerId: string, category: string) {
    if (!user) return
    const value = category || null
    await supabase.from('shortlists').update({ category: value }).eq('coach_id', user.id).eq('player_id', playerId)
    setCategories(prev => { const n = { ...prev }; if (value) n[playerId] = value; else delete n[playerId]; return n })
  }

  function openNote(e: React.MouseEvent, playerId: string) {
    e.preventDefault(); e.stopPropagation()
    setOpenNoteId(playerId); setNoteText(notes[playerId] || '')
  }

  async function saveNote(playerId: string) {
    if (!user) return
    setSavingNote(true)
    await supabase.from('coach_notes').upsert({ coach_id: user.id, player_id: playerId, note: noteText, updated_at: new Date().toISOString() }, { onConflict: 'coach_id,player_id' })
    setNotes(prev => ({ ...prev, [playerId]: noteText }))
    setSavingNote(false); setOpenNoteId(null)
  }

  const pos = (s: string) => s?.replace(/_/g, ' ') || '–'
  const getAge = (dob: string) => dob ? Math.floor((new Date().getTime() - new Date(dob).getTime()) / 31557600000) : null
  const getInitials = (p: any) => [p.first_name?.[0], p.last_name?.[0]].filter(Boolean).join('')
  const T = t[lang]

  const totalActiveFilters = activeFilters.positions.length + activeFilters.nationalities.length + activeFilters.ages.length + activeFilters.categories.length + (search ? 1 : 0)

  let displayedPlayers = players
  if (tab === 'shortlist') displayedPlayers = players.filter(p => shortlistedIds.has(p.id))
  if (activeFilters.categories.length > 0) displayedPlayers = displayedPlayers.filter(p => activeFilters.categories.includes(categories[p.id]))
  if (activeFilters.nationalities.length > 1) displayedPlayers = displayedPlayers.filter(p => activeFilters.nationalities.some(n => p.nationality_primary?.toLowerCase().includes(n.toLowerCase())))

  const filteredNats = NATIONALITIES.filter(n => n.toLowerCase().includes(natSearch.toLowerCase()))

  if (loading) return <div style={{ minHeight: '100vh', background: '#0C0F16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: 'Arial', color: '#A8A398', fontSize: '14px' }}>Loading...</div></div>

  if (profile && !profile.approved) return (
    <>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'DM Sans', Arial, sans-serif; background: #0C0F16; color: #F0EDE4; }`}</style>
      <nav style={{ background: '#0D1B2E', padding: '0 16px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <svg width="28" height="26" viewBox="0 0 32 30"><line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/><line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/><line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/></svg>
        <form action="/auth/signout" method="post"><button type="submit" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>Sign out</button></form>
      </nav>
      <div style={{ maxWidth: '560px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#0D1B2E', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '12px' }}>{T.coach_pending_title}</h1>
        <p style={{ fontSize: '15px', color: '#5F5E5A', lineHeight: '1.7', marginBottom: '8px' }}>{T.coach_pending_sub}</p>
        <p style={{ fontSize: '15px', color: '#5F5E5A', lineHeight: '1.7' }}>{T.coach_pending_email}</p>
      </div>
    </>
  )

  const FilterContent = () => (
    <>
      <div className="filter-section">
        <div className="filter-section-title">{lang === 'fr' ? 'Statut' : 'Status'}</div>
        {CATEGORIES.map(cat => {
          const cs = CATEGORY_COLORS[cat]
          return (
            <label key={cat} className="filter-option">
              <input type="checkbox" checked={activeFilters.categories.includes(cat)} onChange={() => toggleFilter('categories', cat)} />
              <span className="filter-option-label">
                <span style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}`, fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '20px' }}>{cat}</span>
              </span>
            </label>
          )
        })}
      </div>
      <div className="filter-section">
        <div className="filter-section-title">{lang === 'fr' ? 'Tranche d\'âge' : 'Age group'}</div>
        {AGE_GROUPS.map(age => (
          <label key={age} className="filter-option">
            <input type="checkbox" checked={activeFilters.ages.includes(age)} onChange={() => toggleFilter('ages', age)} />
            <span className="filter-option-label">{age}</span>
          </label>
        ))}
      </div>
      <div className="filter-section">
        <div className="filter-section-title">{lang === 'fr' ? 'Nationalité' : 'Nationality'}</div>
        <input className="nat-search" type="text" placeholder={lang === 'fr' ? 'Rechercher...' : 'Search...'} value={natSearch} onChange={e => setNatSearch(e.target.value)} />
        {filteredNats.map(nat => (
          <label key={nat} className="filter-option">
            <input type="checkbox" checked={activeFilters.nationalities.includes(nat)} onChange={() => toggleFilter('nationalities', nat)} />
            <span className="filter-option-label">{nat}</span>
          </label>
        ))}
      </div>
      <div className="filter-section">
        <div className="filter-section-title">{lang === 'fr' ? 'Poste' : 'Position'}</div>
        {POSITIONS.map(p => (
          <label key={p} className="filter-option">
            <input type="checkbox" checked={activeFilters.positions.includes(p)} onChange={() => toggleFilter('positions', p)} />
            <span className="filter-option-label" style={{ fontSize: '12px' }}>{pos(p)}</span>
          </label>
        ))}
      </div>
    </>
  )

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', Arial, sans-serif; background: #0C0F16; color: #F0EDE4; }
        .nav { background: #0D1B2E; padding: 0 16px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .nav-logo-text { display: none; }
        .nav-email { display: none; }
        .nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .signout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-family: Arial, sans-serif; white-space: nowrap; }
        .lang-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.08); padding: 3px; border-radius: 8px; flex-shrink: 0; }
        .lang-btn { background: transparent; border: none; cursor: pointer; font-size: 15px; width: 28px; height: 24px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .lang-btn-active { background: rgba(255,255,255,0.15); }
        .page-header { max-width: 1400px; margin: 0 auto; padding: 24px 16px 0; }
        .page-label { font-size: 10px; color: #1D9E75; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 6px; }
        .page-title { font-size: 22px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 2px; }
        .page-sub { font-size: 12px; color: #888780; margin-bottom: 16px; }
        .tabs { display: flex; gap: 2px; background: #111520; padding: 3px; border-radius: 10px; border: 0.5px solid #D3D1C7; margin-bottom: 0; width: fit-content; }
        .tab { padding: 7px 14px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; font-family: Arial, sans-serif; background: transparent; color: #888780; }
        .tab-active { background: #D4A843; color: #0C0F16; }
        .tab-count { display: inline-block; background: #1D9E75; color: white; border-radius: 10px; font-size: 10px; padding: 1px 6px; margin-left: 5px; }
        .main-layout { max-width: 1400px; margin: 0 auto; padding: 16px; display: flex; gap: 16px; align-items: flex-start; }
        .filter-panel { width: 180px; flex-shrink: 0; background: #161C2A; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.07); overflow: hidden; display: none; }
        .filter-panel-header { padding: 12px 16px; border-bottom: 0.5px solid rgba(255,255,255,0.07); display: flex; justify-content: space-between; align-items: center; }
        .filter-panel-title { font-size: 13px; font-weight: 700; color: #F0EDE4; }
        .filter-clear-all { font-size: 12px; color: #1D9E75; cursor: pointer; background: none; border: none; font-family: Arial, sans-serif; }
        .filter-section { padding: 12px 16px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .filter-section:last-child { border-bottom: none; }
        .filter-section-title { font-size: 10px; font-weight: 700; color: #888780; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
        .filter-option { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; cursor: pointer; }
        .filter-option:last-child { margin-bottom: 0; }
        .filter-option input[type="checkbox"] { accent-color: #1D9E75; width: 14px; height: 14px; flex-shrink: 0; cursor: pointer; }
        .filter-option-label { font-size: 13px; color: #A8A398; flex: 1; cursor: pointer; }
        .nat-search { width: 100%; padding: 6px 10px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px; outline: none; font-family: Arial, sans-serif; margin-bottom: 8px; color: #F0EDE4; background: #1C2338; }
        .nat-search:focus { border-color: #1D9E75; }
        .results-area { flex: 1; min-width: 0; }
        .results-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
        .search-input { flex: 1; min-width: 0; padding: 8px 14px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 13px; color: #F0EDE4; background: #161C2A; outline: none; font-family: Arial, sans-serif; }
        .search-input:focus { border-color: #1D9E75; }
        .search-input::placeholder { color: #B4B2A9; }
        .view-toggle { display: flex; gap: 2px; background: #111520; padding: 3px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; }
        .toggle-btn { padding: 5px 10px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; font-family: Arial, sans-serif; background: transparent; color: #888780; }
        .toggle-active { background: #D4A843; color: #0C0F16; }
        .mobile-filter-btn { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border: 1.5px solid rgba(255,255,255,0.15); border-radius: 8px; background: rgba(255,255,255,0.08); font-size: 12px; font-weight: 700; color: #F0EDE4; cursor: pointer; font-family: Arial, sans-serif; flex-shrink: 0; }
        .mobile-filter-badge { background: #1D9E75; color: white; border-radius: 10px; font-size: 10px; padding: 1px 5px; }
        .active-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .active-tag { display: flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #E1F5EE; color: #0F6E56; border: 1px solid rgba(29,158,117,0.2); }
        .active-tag-x { cursor: pointer; opacity: 0.6; font-size: 13px; line-height: 1; }
        .results-count { font-size: 12px; color: #888780; margin-bottom: 10px; }
        .pill-btn { height: 28px; padding: 0 10px; border-radius: 20px; border: 1.5px solid rgba(255,255,255,0.1); background: #161C2A; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #5F5E5A; font-family: Arial, sans-serif; white-space: nowrap; transition: all 0.1s; }
        .pill-btn:hover { border-color: #888780; }
        .pill-btn-save-active { border-color: #F0A500; background: #FFF8E7; color: #856404; }
        .pill-btn-note-active { border-color: #4A7FD4; background: #EEF4FF; color: #185FA5; }
        .player-list { display: flex; flex-direction: column; gap: 8px; }
        .player-row { background: #161C2A; border-radius: 10px; padding: 12px 14px; border: 0.5px solid rgba(255,255,255,0.07); }
        .player-row-main { display: flex; align-items: flex-start; gap: 10px; flex-wrap: wrap; }
        .row-avatar { width: 36px; height: 36px; border-radius: 8px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .row-avatar span { color: white; font-size: 13px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .row-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .row-info { flex: 1; min-width: 120px; }
        .row-name { font-size: 13px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .row-sub { font-size: 11px; color: #888780; margin-top: 3px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .row-position { display: inline-block; font-size: 10px; background: #E1F5EE; color: #0F6E56; padding: 2px 6px; border-radius: 4px; font-weight: 700; letter-spacing: 0.06em; }
        .row-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; width: 100%; padding-top: 8px; }
        .row-cv-btn { background: #0D1B2E; color: white; font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; white-space: nowrap; }
        .row-extras { padding-top: 8px; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; flex-direction: column; gap: 6px; }
        .row-category { display: flex; align-items: center; gap: 8px; }
        .row-category-label { font-size: 11px; color: #888780; white-space: nowrap; }
        .row-category-select { flex: 1; padding: 4px 8px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px; font-family: Arial, sans-serif; outline: none; cursor: pointer; color: #F0EDE4; background: #1C2338; }
        .category-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; border: 1px solid; }
        .row-note-panel { display: flex; gap: 8px; align-items: flex-start; }
        .row-note-textarea { flex: 1; padding: 7px 10px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px; font-family: Arial, sans-serif; resize: none; height: 56px; outline: none; color: #F0EDE4; background: #1C2338; }
        .row-note-textarea:focus { border-color: #1D9E75; }
        .row-note-save { padding: 7px 12px; background: #1D9E75; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; white-space: nowrap; align-self: flex-end; }
        .row-note-preview { font-size: 11px; color: #A8A398; font-style: italic; background: #1C2338; padding: 5px 8px; border-radius: 6px; }
        .row-cv-btn-request { background: transparent; color: #D4A843; border: 1.5px solid rgba(212,168,67,0.35); cursor: pointer; font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 6px; font-family: 'Arial Black', Arial, sans-serif; white-space: nowrap; }
        .row-cv-btn-requested { background: rgba(29,158,117,0.08); color: #5DCAA5; border: 1.5px solid rgba(29,158,117,0.2); cursor: default; font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 6px; font-family: 'Arial Black', Arial, sans-serif; white-space: nowrap; }
        .empty-state { text-align: center; padding: 40px 20px; background: #161C2A; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.07); }
        .empty-state h3 { font-size: 15px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 6px; }
        .empty-state p { font-size: 13px; color: #888780; }
        .mobile-filter-overlay { position: fixed; inset: 0; z-index: 100; display: flex; flex-direction: column; background: #111520; overflow-y: auto; }
        .mobile-filter-overlay-header { padding: 16px; border-bottom: 0.5px solid rgba(255,255,255,0.07); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #111520; z-index: 1; }
        .mobile-filter-overlay-title { font-size: 16px; font-weight: 700; color: #F0EDE4; }
        .mobile-filter-close { background: none; border: none; font-size: 24px; color: #888780; cursor: pointer; line-height: 1; padding: 0 4px; }
        .mobile-filter-footer { padding: 16px; border-top: 0.5px solid rgba(255,255,255,0.07); display: flex; gap: 8px; position: sticky; bottom: 0; background: #111520; }
        .mobile-filter-apply { flex: 1; padding: 12px; background: #1D9E75; color: white; border: none; border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; }
        .mobile-filter-clear { padding: 12px 16px; background: rgba(255,255,255,0.08); color: #F0EDE4; border: 1.5px solid rgba(255,255,255,0.15); border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; }
        .upgrade-banner { background: #0D1B2E; border-radius: 12px; padding: 18px; margin-top: 16px; }
        .upgrade-text h3 { font-size: 14px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 4px; }
        .upgrade-text p { font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 10px; }
        .upgrade-btn { display: block; background: #1D9E75; color: white; font-size: 12px; font-weight: 700; padding: 9px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; text-align: center; }

        /* New card design */
        .player-grid { display: grid; grid-template-columns: 1fr; gap: 14px; align-items: stretch; }
        .pc-card { background: #131720; border: 0.5px solid #1e2330; border-radius: 12px; display: flex; flex-direction: column; position: relative; overflow: hidden; }
        .pc-card-top { padding: 16px; border-bottom: 0.5px solid #1e2330; position: relative; }
        .pc-saved-badge { position: absolute; top: 12px; right: 12px; display: flex; align-items: center; gap: 4px; background: #22c98a18; color: #22c98a; font-size: 10px; font-weight: 600; text-transform: uppercase; border-radius: 20px; padding: 3px 9px; }
        .pc-avatar { width: 56px; height: 56px; border-radius: 12px; background: #1e2330; border: 0.5px solid #2a2d35; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; margin-bottom: 10px; }
        .pc-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pc-name { font-size: 15px; font-weight: 600; color: white; margin-bottom: 7px; }
        .pc-badges { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-bottom: 7px; }
        .pc-badge { font-size: 10px; font-weight: 600; text-transform: uppercase; border-radius: 20px; padding: 3px 9px; }
        .pc-badge-pos { background: #22c98a22; color: #22c98a; border: 0.5px solid #22c98a40; }
        .pc-badge-alt { background: #1e2330; color: #888; }
        .pc-badge-available { background: #22c98a; color: #000; }
        .pc-badge-eos { background: #f59e0b22; color: #f59e0b; border: 0.5px solid #f59e0b40; }
        .pc-badge-unavailable { background: #1e2330; color: #6b7280; }
        .pc-meta { font-size: 12px; color: #6b7280; }
        .pc-stats-bar { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 0.5px solid #1e2330; }
        .pc-stat { padding: 10px 12px; text-align: center; }
        .pc-stat + .pc-stat { border-left: 0.5px solid #1e2330; }
        .pc-stat-val { font-size: 14px; font-weight: 600; color: white; }
        .pc-stat-val-muted { font-size: 14px; font-weight: 600; color: #3a3f4a; }
        .pc-stat-lbl { font-size: 10px; text-transform: uppercase; color: #6b7280; margin-top: 2px; }
        .pc-details { padding: 10px 16px; border-bottom: 0.5px solid #1e2330; display: flex; flex-direction: column; gap: 6px; }
        .pc-detail-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
        .pc-detail-amber { color: #f59e0b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pc-views { padding: 8px 16px; border-bottom: 0.5px solid #1e2330; display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280; }
        .pc-views-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c98a; flex-shrink: 0; }
        .pc-footer { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
        .pc-cta { display: block; width: 100%; padding: 9px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; text-align: center; text-decoration: none; cursor: pointer; border: none; font-family: inherit; }
        .pc-cta-green { background: #22c98a; color: #000; }
        .pc-cta-muted { background: #1e2330; color: #6b7280; }
        .pc-cta-outline { background: transparent; border: 0.5px solid rgba(34,201,138,0.4); color: #22c98a; }
        .pc-cta-sent { background: #1e2330; color: #6b7280; cursor: default; }
        .pc-footer-actions { display: flex; gap: 6px; }
        .pc-action-btn { flex: 1; padding: 7px 10px; border: 0.5px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #6b7280; border-radius: 8px; font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; }
        .pc-action-btn-active-note { border-color: rgba(74,127,212,0.4); background: rgba(74,127,212,0.08); color: #4A7FD4; }
        .pc-action-btn-active-save { border-color: rgba(240,165,0,0.4); background: rgba(240,165,0,0.08); color: #F0A500; }
        .pc-note-panel { background: #0c0f16; border: 0.5px solid #1e2330; border-radius: 8px; padding: 10px; }
        .pc-note-textarea { width: 100%; background: transparent; border: none; outline: none; color: #F0EDE4; font-size: 12px; font-family: inherit; resize: none; height: 60px; }
        .pc-note-save { width: 100%; padding: 7px; background: #22c98a; color: #000; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 6px; }

        @media (min-width: 600px) { .player-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 769px) {
          .nav { padding: 0 28px; height: 64px; }
          .nav-logo-text { display: inline; color: white; font-weight: 900; font-size: 20px; letter-spacing: -1px; font-family: 'Arial Black', Arial, sans-serif; }
          .nav-email { display: inline; color: rgba(255,255,255,0.5); font-size: 13px; }
          .signout-btn { padding: 7px 16px; font-size: 13px; }
          .lang-btn { font-size: 16px; width: 30px; height: 26px; }
          .page-header { padding: 32px 28px 0; }
          .page-title { font-size: 26px; }
          .main-layout { padding: 16px 28px 40px; }
          .filter-panel { display: block; }
          .mobile-filter-btn { display: none; }
          .mobile-filter-overlay { display: none !important; }
          .player-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .row-actions { width: auto; padding-top: 0; flex-wrap: nowrap; }
          .player-row-main { flex-wrap: nowrap; align-items: center; }
          .upgrade-banner { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 24px; }
          .upgrade-text p { margin-bottom: 0; }
          .upgrade-btn { display: inline-block; width: auto; }
        }
      `}</style>

      {/* MOBILE FILTER OVERLAY */}
      {showMobileFilters && (
        <div className="mobile-filter-overlay">
          <div className="mobile-filter-overlay-header">
            <span className="mobile-filter-overlay-title">{lang === 'fr' ? 'Filtres' : 'Filters'}</span>
            <button className="mobile-filter-close" onClick={() => setShowMobileFilters(false)}>×</button>
          </div>
          <div style={{ flex: 1 }}>
            <FilterContent />
          </div>
          <div className="mobile-filter-footer">
            {totalActiveFilters > 0 && (
              <button className="mobile-filter-clear" onClick={() => { clearAllFilters(); setShowMobileFilters(false) }}>
                {lang === 'fr' ? 'Tout effacer' : 'Clear all'}
              </button>
            )}
            <button className="mobile-filter-apply" onClick={() => setShowMobileFilters(false)}>
              {lang === 'fr' ? `Voir les joueurs` : `Show players`}{totalActiveFilters > 0 ? ` (${totalActiveFilters})` : ''}
            </button>
          </div>
        </div>
      )}

      <nav className="nav">
        <div className="nav-logo">
          <svg width="28" height="26" viewBox="0 0 32 30" style={{ display: 'block' }}>
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
          <a href="/dashboard/coach-profile" style={{ color: '#D4A843', fontSize: '13px', fontWeight: '700', textDecoration: 'none', whiteSpace: 'nowrap' }}>My Coach Card</a>
          <a href="/dashboard/vacancies" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Post Vacancy</a>
          <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Dashboard</a>
          <form action="/auth/signout" method="post">
            <a href="/dashboard/settings" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', marginRight: '8px' }}>Settings</a>
            <button type="submit" className="signout-btn">{T.nav_sign_out}</button>
          </form>
        </div>
      </nav>

      {/* ── COACH HERO STRIP ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 16px 0' }}>
        {heroCollapsed ? (
          /* Collapsed state */
          <div
            onClick={toggleHeroCollapsed}
            style={{
              background: 'rgba(212,168,67,0.05)',
              border: '1px solid rgba(212,168,67,0.1)',
              borderRadius: '10px',
              padding: '10px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Avatar 32×32 */}
              <div style={{ width: 32, height: 32, borderRadius: '7px', background: '#1C2338', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {coachProfile?.headshot_url ? (
                  <img src={coachProfile.headshot_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '12px', color: '#D4A843', fontWeight: 900 }}>
                    {(coachProfile?.full_name || profile?.full_name || '?')[0]}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '13px', color: '#D4A843', fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>
                {coachProfile?.full_name || profile?.full_name || 'Coach'}
              </span>
              <span style={{ fontSize: '11px', color: '#5A564F', fontFamily: 'Arial, sans-serif' }}>Coach dashboard</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#5A564F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4,6 8,10 12,6"/>
            </svg>
          </div>
        ) : (
          /* Expanded state */
          <div style={{
            background: '#161C2A',
            border: '1px solid rgba(212,168,67,0.15)',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            {/* Avatar 48×48 */}
            <div style={{ width: 48, height: 48, borderRadius: '10px', background: '#1C2338', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {coachProfile?.headshot_url ? (
                <img src={coachProfile.headshot_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '18px', color: '#D4A843', fontWeight: 900 }}>
                  {(coachProfile?.full_name || profile?.full_name || '?')[0]}
                </span>
              )}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '16px', fontWeight: 900, color: '#F0EDE4', marginBottom: '2px' }}>
                {coachProfile?.full_name || profile?.full_name || 'Coach'}
              </div>
              {coachProfile?.role_title && (
                <div style={{ fontSize: '11px', color: '#D4A843', fontFamily: 'Arial, sans-serif' }}>{coachProfile.role_title}</div>
              )}
              {coachProfile?.organisation && (
                <div style={{ fontSize: '11px', color: '#A8A398', fontFamily: 'Arial, sans-serif' }}>{coachProfile.organisation}</div>
              )}
            </div>
            {/* Stat pills */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#5A564F', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px', fontFamily: 'Arial, sans-serif' }}>
                {shortlistedIds.size} shortlisted
              </span>
              <span style={{ fontSize: '11px', color: '#5A564F', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px', fontFamily: 'Arial, sans-serif' }}>
                {Object.keys(notes).length} notes
              </span>
            </div>
            {/* Buttons */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
              <a href="/dashboard/coach-profile" style={{ color: '#D4A843', border: '1px solid rgba(212,168,67,0.3)', background: 'transparent', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontFamily: 'Arial, sans-serif', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Edit Coach Card
              </a>
              {coachProfile?.share_token && (
                <a href={`/coach/${coachProfile.share_token}`} target="_blank" style={{ background: '#D4A843', color: '#0C0F16', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontFamily: 'Arial, sans-serif', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 700 }}>
                  Share Coach Card
                </a>
              )}
            </div>
            {/* Collapse button */}
            <button onClick={toggleHeroCollapsed} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#5A564F', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4,10 8,6 12,10"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="page-header">
        <p className="page-label">{T.coach_label}</p>
        <h1 className="page-title">{T.coach_title}</h1>
        <p className="page-sub">
          {profile?.organisation_name && `${profile.organisation_name} · `}
          {profile?.role_title && `${profile.role_title} · `}
          {T.coach_free_tier}
        </p>
        <div className="tabs">
          <button className={`tab ${tab === 'all' ? 'tab-active' : ''}`} onClick={() => setTab('all')}>
            {lang === 'fr' ? 'Tous les joueurs' : 'All players'}
          </button>
          <button className={`tab ${tab === 'shortlist' ? 'tab-active' : ''}`} onClick={() => setTab('shortlist')}>
            {lang === 'fr' ? 'Ma sélection' : 'My shortlist'}
            {shortlistedIds.size > 0 && <span className="tab-count">{shortlistedIds.size}</span>}
          </button>
        </div>
      </div>

      <div className="main-layout">
        <div className="filter-panel">
          <div className="filter-panel-header">
            <span className="filter-panel-title">{lang === 'fr' ? 'Filtres' : 'Filters'}</span>
            {totalActiveFilters > 0 && <button className="filter-clear-all" onClick={clearAllFilters}>{lang === 'fr' ? 'Tout effacer' : 'Clear all'}</button>}
          </div>
          <FilterContent />
        </div>

        <div className="results-area">
          <div className="results-toolbar">
            <input className="search-input" type="text" placeholder={lang === 'fr' ? 'Rechercher par nom...' : 'Search by name...'} value={search} onChange={e => { setSearch(e.target.value); fetchPlayers(activeFilters, e.target.value) }} />
            <button className="mobile-filter-btn" onClick={() => setShowMobileFilters(true)}>
              {lang === 'fr' ? 'Filtres' : 'Filters'}
              {totalActiveFilters > 0 && <span className="mobile-filter-badge">{totalActiveFilters}</span>}
            </button>
            <div className="view-toggle">
              <button className={`toggle-btn ${view === 'list' ? 'toggle-active' : ''}`} onClick={() => setView('list')}>{T.coach_list}</button>
              <button className={`toggle-btn ${view === 'card' ? 'toggle-active' : ''}`} onClick={() => setView('card')}>{T.coach_cards}</button>
            </div>
          </div>

          {totalActiveFilters > 0 && (
            <div className="active-tags">
              {activeFilters.categories.map(c => <span key={c} className="active-tag" style={{ background: CATEGORY_COLORS[c].bg, color: CATEGORY_COLORS[c].color }}>{c} <span className="active-tag-x" onClick={() => removeFilter('categories', c)}>×</span></span>)}
              {activeFilters.ages.map(a => <span key={a} className="active-tag">{a} <span className="active-tag-x" onClick={() => removeFilter('ages', a)}>×</span></span>)}
              {activeFilters.nationalities.map(n => <span key={n} className="active-tag">{n} <span className="active-tag-x" onClick={() => removeFilter('nationalities', n)}>×</span></span>)}
              {activeFilters.positions.map(p => <span key={p} className="active-tag">{pos(p)} <span className="active-tag-x" onClick={() => removeFilter('positions', p)}>×</span></span>)}
              {search && <span className="active-tag">"{search}" <span className="active-tag-x" onClick={() => { setSearch(''); fetchPlayers(activeFilters, '') }}>×</span></span>}
            </div>
          )}

          <p className="results-count">
            {searching ? (lang === 'fr' ? 'Recherche...' : 'Searching...') :
              `${T.coach_showing} ${displayedPlayers.length} ${displayedPlayers.length !== 1 ? T.coach_players : T.coach_player}${totalActiveFilters > 0 ? ` ${T.coach_filtered}` : ''}`
            }
          </p>

          {/* LIST VIEW — unchanged */}
          {view === 'list' && (
            displayedPlayers.length > 0 ? (
              <div className="player-list">
                {displayedPlayers.map(player => {
                  const age = getAge(player.date_of_birth)
                  const isShortlisted = shortlistedIds.has(player.id)
                  const hasNote = !!notes[player.id]
                  const isNoteOpen = openNoteId === player.id
                  const category = categories[player.id]
                  const catStyle = category ? CATEGORY_COLORS[category] : null
                  return (
                    <div key={player.id} className="player-row">
                      <div className="player-row-main">
                        <div className="row-avatar">
                          {player.avatar_url ? <img src={player.avatar_url} alt={player.first_name} /> : <span>{getInitials(player)}</span>}
                        </div>
                        <div className="row-info">
                          <div className="row-name">{player.first_name} {player.last_name}</div>
                          <div className="row-sub">
                            <span className="row-position">{pos(player.position_primary)}</span>
                            {player.nationality_primary && <span>{player.nationality_primary}</span>}
                            {age && <span>· {age} yrs</span>}
                            {player.passport_countries && player.passport_countries.split(',').map((c: string) => c.trim()).filter(Boolean).some((c: string) => c !== player.nationality_primary) && (
                              <span>· {player.passport_countries.split(',').map((c: string) => c.trim()).filter((c: string) => c !== player.nationality_primary).join(', ')} passport{player.passport_countries.split(',').length > 2 ? 's' : ''}</span>
                            )}
                            {catStyle && <span className="category-badge" style={{ background: catStyle.bg, color: catStyle.color, borderColor: catStyle.border }}>{category}</span>}
                          </div>
                        </div>
                        <div className="row-actions">
                          {sharedWithMeIds.has(player.id) ? (
                            <a href={`/cv/${player.share_token}`} className="row-cv-btn" target="_blank" rel="noopener noreferrer">View full card</a>
                          ) : cvRequests[player.id] === 'pending' ? (
                            <button className="row-cv-btn-requested" disabled>Request sent ✓</button>
                          ) : (
                            <button className="row-cv-btn-request" onClick={() => requestCard(player.id)}>Request Card</button>
                          )}
                          <button className={`pill-btn ${hasNote || isNoteOpen ? 'pill-btn-note-active' : ''}`} onClick={e => { e.stopPropagation(); isNoteOpen ? setOpenNoteId(null) : openNote(e, player.id) }}>
                            <NoteIcon filled={hasNote || isNoteOpen} />
                            {isNoteOpen ? (lang === 'fr' ? 'Modifier' : 'Edit note') : hasNote ? (lang === 'fr' ? 'Modifier' : 'Edit note') : (lang === 'fr' ? 'Ajouter' : 'Add note')}
                          </button>
                          <button className={`pill-btn ${isShortlisted ? 'pill-btn-save-active' : ''}`} onClick={e => toggleShortlist(e, player.id)}>
                            <StarIcon filled={isShortlisted} />
                            {isShortlisted ? (lang === 'fr' ? 'Sauvegardé' : 'Saved') : (lang === 'fr' ? 'Sauvegarder' : 'Save')}
                          </button>
                        </div>
                      </div>
                      {(isShortlisted || isNoteOpen || hasNote) && (
                        <div className="row-extras">
                          {isShortlisted && (
                            <div className="row-category">
                              <span className="row-category-label">{lang === 'fr' ? 'Statut:' : 'Status:'}</span>
                              <select className="row-category-select" value={category || ''} onChange={e => updateCategory(player.id, e.target.value)}>
                                <option value="">{lang === 'fr' ? '— Choisir —' : '— Set status —'}</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          )}
                          {isNoteOpen && (
                            <div className="row-note-panel">
                              <textarea className="row-note-textarea" placeholder={lang === 'fr' ? 'Note privée...' : 'Private note...'} value={noteText} onChange={e => setNoteText(e.target.value)} autoFocus />
                              <button className="row-note-save" disabled={savingNote} onClick={() => saveNote(player.id)}>{savingNote ? '...' : (lang === 'fr' ? 'Sauver' : 'Save')}</button>
                            </div>
                          )}
                          {hasNote && !isNoteOpen && <div className="row-note-preview">{notes[player.id]}</div>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <h3>{tab === 'shortlist' ? (lang === 'fr' ? 'Aucune sélection' : 'No shortlist yet') : (lang === 'fr' ? 'Aucun joueur trouvé' : 'No players found')}</h3>
                <p>{tab === 'shortlist' ? (lang === 'fr' ? 'Cliquez sur Save pour ajouter des joueurs.' : 'Click Save on any player to add them.') : (lang === 'fr' ? 'Ajustez vos filtres.' : 'Try adjusting your filters.')}</p>
              </div>
            )
          )}

          {/* CARD VIEW — new design */}
          {view === 'card' && (
            displayedPlayers.length > 0 ? (
              <div className="player-grid">
                {displayedPlayers.map(player => {
                  const age = getAge(player.date_of_birth)
                  const isShortlisted = shortlistedIds.has(player.id)
                  const isShared = sharedWithMeIds.has(player.id)
                  const hasNote = !!notes[player.id]
                  const isNoteOpen = openNoteId === player.id
                  const isPending = cvRequests[player.id] === 'pending'
                  const isUnavailable = player.availability === 'unavailable'

                  // Build passport display text
                  const passportText = player.passport_countries
                    ? player.passport_countries
                    : player.nationality_primary
                      ? `${player.nationality_primary} passport`
                      : null

                  // Build meta string
                  const metaParts = [
                    player.nationality_primary,
                    age ? `${age} yrs` : null,
                    player.school_attended || null,
                  ].filter(Boolean)

                  // Zone 2: stat value or muted dash
                  const statVal = (v: any) => v ? v : null

                  // Row 2 contextual
                  let row2: React.ReactNode = null
                  if (notes[player.id]) {
                    row2 = (
                      <div className="pc-detail-row pc-detail-amber">
                        <NotesIcon />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notes[player.id]}</span>
                      </div>
                    )
                  } else if (!isShared) {
                    row2 = (
                      <div className="pc-detail-row">
                        <LockIconSm />
                        <span>Full card locked — request access</span>
                      </div>
                    )
                  } else if (isUnavailable) {
                    row2 = (
                      <div className="pc-detail-row">
                        <BuildingIcon />
                        <span>Contracted · Available next season</span>
                      </div>
                    )
                  } else if (player.clubs_history) {
                    const firstLine = typeof player.clubs_history === 'string'
                      ? player.clubs_history.split('\n')[0]
                      : Array.isArray(player.clubs_history)
                        ? player.clubs_history[0]
                        : null
                    if (firstLine) {
                      row2 = (
                        <div className="pc-detail-row">
                          <TrophyIcon />
                          <span>{firstLine}</span>
                        </div>
                      )
                    }
                  }

                  // CTA button
                  let ctaNode: React.ReactNode
                  if (isShared) {
                    ctaNode = (
                      <a
                        href={`/cv/${player.share_token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`pc-cta ${isUnavailable ? 'pc-cta-muted' : 'pc-cta-green'}`}
                      >
                        View full card
                      </a>
                    )
                  } else if (isPending) {
                    ctaNode = <button className="pc-cta pc-cta-sent" disabled>Request sent ✓</button>
                  } else {
                    ctaNode = (
                      <button className="pc-cta pc-cta-outline" onClick={() => requestCard(player.id)}>
                        Request card access
                      </button>
                    )
                  }

                  return (
                    <div key={player.id} className="pc-card">
                      {/* Zone 1 — Card top */}
                      <div className="pc-card-top">
                        {isShortlisted && (
                          <div className="pc-saved-badge">
                            <StarIcon filled={true} />
                            Saved
                          </div>
                        )}
                        <div className="pc-avatar">
                          {player.avatar_url
                            ? <img src={player.avatar_url} alt={player.first_name} />
                            : <UserIcon />
                          }
                        </div>
                        <div className="pc-name">{player.first_name} {player.last_name}</div>
                        <div className="pc-badges">
                          {player.position_primary && (
                            <span className="pc-badge pc-badge-pos">{pos(player.position_primary)}</span>
                          )}
                          {player.position_secondary && (
                            <span className="pc-badge pc-badge-alt">{pos(player.position_secondary)}</span>
                          )}
                          {isUnavailable ? (
                            player.availability === 'end_of_season'
                              ? <span className="pc-badge pc-badge-eos">End of season</span>
                              : <span className="pc-badge pc-badge-unavailable">Not available</span>
                          ) : (
                            <span className="pc-badge pc-badge-available">Available</span>
                          )}
                        </div>
                        {metaParts.length > 0 && (
                          <div className="pc-meta">{metaParts.join(' · ')}</div>
                        )}
                      </div>

                      {/* Zone 2 — Stats bar */}
                      <div className="pc-stats-bar">
                        <div className="pc-stat">
                          {statVal(player.height_cm)
                            ? <div className="pc-stat-val">{player.height_cm}</div>
                            : <div className="pc-stat-val-muted">—</div>
                          }
                          <div className="pc-stat-lbl">Height (cm)</div>
                        </div>
                        <div className="pc-stat">
                          {statVal(player.weight_kg)
                            ? <div className="pc-stat-val">{player.weight_kg}</div>
                            : <div className="pc-stat-val-muted">—</div>
                          }
                          <div className="pc-stat-lbl">Weight (kg)</div>
                        </div>
                        <div className="pc-stat">
                          {statVal(player.international_caps)
                            ? <div className="pc-stat-val">{player.international_caps}</div>
                            : <div className="pc-stat-val-muted">—</div>
                          }
                          <div className="pc-stat-lbl">Caps</div>
                        </div>
                      </div>

                      {/* Zone 3 — Detail rows */}
                      {(passportText || row2) && (
                        <div className="pc-details">
                          {passportText && (
                            <div className="pc-detail-row">
                              <IdIcon />
                              <span>{passportText}</span>
                            </div>
                          )}
                          {row2}
                        </div>
                      )}

                      {/* Zone 4 — View count */}
                      <div className="pc-views">
                        <div className="pc-views-dot" />
                        {viewCounts[player.id] || 0} profile views
                      </div>

                      {/* Zone 5 — Footer */}
                      <div className="pc-footer">
                        {isNoteOpen && (
                          <div className="pc-note-panel">
                            <textarea
                              className="pc-note-textarea"
                              placeholder={lang === 'fr' ? 'Note privée...' : 'Private note...'}
                              value={noteText}
                              onChange={e => setNoteText(e.target.value)}
                              autoFocus
                            />
                            <button
                              className="pc-note-save"
                              disabled={savingNote}
                              onClick={() => saveNote(player.id)}
                            >
                              {savingNote ? '...' : (lang === 'fr' ? 'Sauver' : 'Save note')}
                            </button>
                          </div>
                        )}
                        {ctaNode}
                        <div className="pc-footer-actions">
                          <button
                            className={`pc-action-btn ${isNoteOpen || hasNote ? 'pc-action-btn-active-note' : ''}`}
                            onClick={e => isNoteOpen ? setOpenNoteId(null) : openNote(e, player.id)}
                          >
                            <NoteIcon filled={isNoteOpen || hasNote} />
                            {isNoteOpen ? (lang === 'fr' ? 'Fermer' : 'Close note') : hasNote ? (lang === 'fr' ? 'Modifier' : 'Edit note') : (lang === 'fr' ? 'Ajouter note' : 'Add note')}
                          </button>
                          <button
                            className={`pc-action-btn ${isShortlisted ? 'pc-action-btn-active-save' : ''}`}
                            onClick={e => toggleShortlist(e, player.id)}
                          >
                            <StarIcon filled={isShortlisted} />
                            {isShortlisted ? (lang === 'fr' ? 'Sauvegardé' : 'Saved') : (lang === 'fr' ? 'Sauvegarder' : 'Save')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <h3>{tab === 'shortlist' ? (lang === 'fr' ? 'Aucune sélection' : 'No shortlist yet') : (lang === 'fr' ? 'Aucun joueur trouvé' : 'No players found')}</h3>
                <p>{tab === 'shortlist' ? (lang === 'fr' ? 'Cliquez sur Save pour ajouter des joueurs.' : 'Click Save on any player to add them.') : (lang === 'fr' ? 'Ajustez vos filtres.' : 'Try adjusting your filters.')}</p>
              </div>
            )
          )}

          {tab === 'all' && players.length > 0 && (
            <div className="upgrade-banner">
              <div className="upgrade-text">
                <h3>{T.coach_upgrade_title}</h3>
                <p>{T.coach_upgrade_sub}</p>
              </div>
              <a href="mailto:bruce@necta.co.za?subject=Gainline Full Access Request" className="upgrade-btn">{T.coach_upgrade_btn}</a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
