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

const AGE_GROUPS = ['Under 18','18–21','22–25','26–30','30+']
const CATEGORIES = ['Contracted','Negotiating','Interested']

const CATEGORY_COLORS: Record<string, { bg: string, color: string, border: string }> = {
  'Contracted':  { bg: '#E1F5EE', color: '#0F6E56', border: 'rgba(29,158,117,0.3)' },
  'Negotiating': { bg: '#FFF3CD', color: '#856404', border: 'rgba(240,165,0,0.3)' },
  'Interested':  { bg: '#E8F0FE', color: '#1A56DB', border: 'rgba(74,127,212,0.3)' },
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill={filled ? '#F0A500' : 'none'} stroke={filled ? '#F0A500' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2L9.8 6.2L14 6.6L11 9.4L11.8 13.6L8 11.4L4.2 13.6L5 9.4L2 6.6L6.2 6.2Z"/>
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

  const [activeFilters, setActiveFilters] = useState<{
    positions: string[]
    nationalities: string[]
    ages: string[]
    categories: string[]
  }>({ positions: [], nationalities: [], ages: [], categories: [] })

  useEffect(() => {
    const saved = localStorage.getItem('gainline_lang') as Lang
    if (saved === 'en' || saved === 'fr') setLang(saved)
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUser(user)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(profile)
    if (profile?.role === 'player') { router.push('/dashboard'); return }
    if (profile?.approved) {
      await fetchPlayers({ positions: [], nationalities: [], ages: [], categories: [] }, '')
      const { data: sl } = await supabase.from('shortlists').select('player_id, category').eq('coach_id', user.id)
      if (sl) {
        setShortlistedIds(new Set(sl.map((s: any) => s.player_id)))
        const catMap: Record<string, string> = {}
        sl.forEach((s: any) => { if (s.category) catMap[s.player_id] = s.category })
        setCategories(catMap)
      }
      const { data: nn } = await supabase.from('coach_notes').select('player_id, note').eq('coach_id', user.id)
      if (nn) {
        const map: Record<string, string> = {}
        nn.forEach((n: any) => { map[n.player_id] = n.note })
        setNotes(map)
      }
    }
    setLoading(false)
  }

  function toggleLang(l: Lang) { setLang(l); localStorage.setItem('gainline_lang', l) }

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

  if (loading) return <div style={{ minHeight: '100vh', background: '#0C0F16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: 'Arial', color: '#888780', fontSize: '14px' }}>Loading...</div></div>

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
        ..nat-search { width: 100%; padding: 6px 10px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px; outline: none; font-family: Arial, sans-serif; margin-bottom: 8px; color: #F0EDE4; background: #1C2338; }
        .nat-search:focus { border-color: #1D9E75; }
        .results-area { flex: 1; min-width: 0; }
        .results-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
        .search-input { flex: 1; min-width: 0; padding: 8px 14px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 13px; color: #F0EDE4; background: #161C2A; outline: none; font-family: Arial, sans-serif; }
        .search-input:focus { border-color: #1D9E75; }
        .search-input::placeholder { color: #B4B2A9; }
        .view-toggle { display: flex; gap: 2px; background: #111520; padding: 3px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; }
        .toggle-btn { padding: 5px 10px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; font-family: Arial, sans-serif; background: transparent; color: #888780; }
        .toggle-active { background: #D4A843; color: #0C0F16; }
        .mobile-filter-btn { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border: 1.5px solid #D3D1C7; border-radius: 8px; background: white; font-size: 12px; font-weight: 700; color: #0D1B2E; cursor: pointer; font-family: Arial, sans-serif; flex-shrink: 0; }
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
        .player-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .player-card { background: #161C2A; border-radius: 12px; padding: 14px; border: 0.5px solid rgba(255,255,255,0.07); }
        .player-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .player-avatar { width: 38px; height: 38px; border-radius: 8px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .player-avatar span { color: white; font-size: 14px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .player-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .player-name { font-size: 13px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 2px; }
        .player-meta { font-size: 11px; color: #888780; }
        .position-badge { display: inline-block; background: #E1F5EE; color: #0F6E56; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.06em; margin-bottom: 8px; }
        .player-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; margin-bottom: 10px; }
        .stat-cell { background: #1C2338; padding: 6px; text-align: center; }
        .stat-val { font-size: 13px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; }
        .stat-lbl { font-size: 9px; color: #888780; letter-spacing: 0.08em; margin-top: 1px; }
        .card-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
        .cv-btn { flex: 1; padding: 7px; background: #0D1B2E; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: 'Arial Black', Arial, sans-serif; cursor: pointer; text-align: center; text-decoration: none; display: block; }
        .note-preview { font-size: 11px; color: #5F5E5A; margin-top: 6px; padding: 5px 7px; background: #F8F7F4; border-radius: 5px; font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .note-panel { margin-top: 8px; padding-top: 8px; border-top: 1px solid #F1EFE8; }
        .note-textarea { width: 100%; padding: 7px 9px; border: 1.5px solid #D3D1C7; border-radius: 6px; font-size: 12px; font-family: Arial, sans-serif; resize: none; height: 64px; outline: none; color: #0D1B2E; }
        .note-textarea:focus { border-color: #1D9E75; }
        .note-save-btn { margin-top: 5px; width: 100%; padding: 6px; background: #1D9E75; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; }
        .upgrade-banner { background: #0D1B2E; border-radius: 12px; padding: 18px; margin-top: 16px; }
        .upgrade-text h3 { font-size: 14px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 4px; }
        .upgrade-text p { font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 10px; }
        .upgrade-btn { display: block; background: #1D9E75; color: white; font-size: 12px; font-weight: 700; padding: 9px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; text-align: center; }
        .empty-state { text-align: center; padding: 40px 20px; background: #161C2A; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.07); }
        .empty-state h3 { font-size: 15px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 6px; }
        .empty-state p { font-size: 13px; color: #888780; }
        .mobile-filter-overlay { position: fixed; inset: 0; z-index: 100; display: flex; flex-direction: column; background: #111520; overflow-y: auto; }
        .mobile-filter-overlay-header { padding: 16px; border-bottom: 0.5px solid rgba(255,255,255,0.07); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #111520; z-index: 1; }
        .mobile-filter-overlay-title { font-size: 16px; font-weight: 700; color: #0D1B2E; }
        .mobile-filter-close { background: none; border: none; font-size: 24px; color: #888780; cursor: pointer; line-height: 1; padding: 0 4px; }
        .mobile-filter-footer { padding: 16px; border-top: 0.5px solid rgba(255,255,255,0.07); display: flex; gap: 8px; position: sticky; bottom: 0; background: #111520; }
        .mobile-filter-apply { flex: 1; padding: 12px; background: #1D9E75; color: white; border: none; border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; }
        .mobile-filter-clear { padding: 12px 16px; background: white; color: #0D1B2E; border: 1.5px solid #D3D1C7; border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; }
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
          .player-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
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
          <form action="/auth/signout" method="post">
            <a href="/dashboard/settings" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', marginRight: '8px' }}>Settings</a>
            <button type="submit" className="signout-btn">{T.nav_sign_out}</button>
          </form>
        </div>
      </nav>

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
                            {catStyle && <span className="category-badge" style={{ background: catStyle.bg, color: catStyle.color, borderColor: catStyle.border }}>{category}</span>}
                          </div>
                        </div>
                        <div className="row-actions">
                          <a href={`/cv/${player.share_token}`} className="row-cv-btn" target="_blank" rel="noopener noreferrer">{T.coach_view_cv_short}</a>
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

          {view === 'card' && (
            displayedPlayers.length > 0 ? (
              <div className="player-grid">
                {displayedPlayers.map(player => {
                  const age = getAge(player.date_of_birth)
                  const isShortlisted = shortlistedIds.has(player.id)
                  const hasNote = !!notes[player.id]
                  const isNoteOpen = openNoteId === player.id
                  const category = categories[player.id]
                  const catStyle = category ? CATEGORY_COLORS[category] : null
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
                      {isShortlisted && (
                        <div style={{ marginBottom: '8px' }}>
                          {catStyle && <span className="category-badge" style={{ background: catStyle.bg, color: catStyle.color, borderColor: catStyle.border, marginBottom: '6px', display: 'inline-block' }}>{category}</span>}
                          <select style={{ width: '100%', padding: '5px 8px', border: '1.5px solid #D3D1C7', borderRadius: '6px', fontSize: '12px', fontFamily: 'Arial, sans-serif', outline: 'none', cursor: 'pointer', color: '#0D1B2E', background: 'white' }} value={category || ''} onChange={e => updateCategory(player.id, e.target.value)}>
                            <option value="">{lang === 'fr' ? '— Choisir —' : '— Set status —'}</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      )}
                      {hasNote && !isNoteOpen && <div className="note-preview">{notes[player.id]}</div>}
                      {isNoteOpen && (
                        <div className="note-panel">
                          <textarea className="note-textarea" placeholder={lang === 'fr' ? 'Note privée...' : 'Private note...'} value={noteText} onChange={e => setNoteText(e.target.value)} autoFocus />
                          <button className="note-save-btn" disabled={savingNote} onClick={() => saveNote(player.id)}>{savingNote ? '...' : (lang === 'fr' ? 'Sauver' : 'Save note')}</button>
                        </div>
                      )}
                      <div className="card-actions">
                        <a href={`/cv/${player.share_token}`} className="cv-btn" target="_blank" rel="noopener noreferrer">{T.coach_view_cv}</a>
                        <button className={`pill-btn ${hasNote || isNoteOpen ? 'pill-btn-note-active' : ''}`} onClick={e => isNoteOpen ? setOpenNoteId(null) : openNote(e, player.id)}>
                          <NoteIcon filled={hasNote || isNoteOpen} />
                          {isNoteOpen ? (lang === 'fr' ? 'Modifier' : 'Edit note') : hasNote ? (lang === 'fr' ? 'Modifier' : 'Edit note') : (lang === 'fr' ? 'Ajouter' : 'Add note')}
                        </button>
                        <button className={`pill-btn ${isShortlisted ? 'pill-btn-save-active' : ''}`} onClick={e => toggleShortlist(e, player.id)}>
                          <StarIcon filled={isShortlisted} />
                          {isShortlisted ? (lang === 'fr' ? 'Sauvegardé' : 'Saved') : (lang === 'fr' ? 'Sauvegarder' : 'Save')}
                        </button>
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