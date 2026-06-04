'use client'
import Image from 'next/image'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const POSITIONS = [
  'Loosehead Prop', 'Hooker', 'Tighthead Prop', 'Left Lock', 'Right Lock',
  'Blindside Flanker', 'Openside Flanker', 'Number 8',
  'Scrum-half', 'Fly-half',
  'Left Wing', 'Inside Centre', 'Outside Centre', 'Right Wing', 'Fullback',
]

const COUNTRIES = [
  'Argentina', 'Australia', 'Canada', 'England', 'Fiji', 'France',
  'Georgia', 'Ireland', 'Italy', 'Japan', 'Kenya', 'Namibia', 'New Zealand',
  'Portugal', 'Romania', 'Samoa', 'Scotland', 'South Africa', 'Spain',
  'Tonga', 'United States', 'Uruguay', 'Wales', 'Zimbabwe',
]

type Vacancy = {
  id: string
  club_name: string
  positions: string[]
  season: string
  level: string
  country: string
  eligibility_notes: string
  offer_details: string
  contact_info: string
  closing_date: string
  is_active: boolean
}

export default function VacanciesPage() {
  const supabase = createClient()

  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [playerToken, setPlayerToken] = useState<string | null>(null)
  const [voteCount, setVoteCount] = useState(0)
  const [voted, setVoted] = useState(false)
  const [voting, setVoting] = useState(false)
  const [filters, setFilters] = useState({ position: '', country: '', season: '' })

  useEffect(() => {
    setVoted(localStorage.getItem('gl_vacancy_vote') === '1')
    load()
  }, [])

  async function load() {
    const [{ data: vacs }, { data: { user } }] = await Promise.all([
      supabase.from('vacancies').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.auth.getUser(),
    ])
    setVacancies(vacs || [])

    if (user) {
      setIsLoggedIn(true)
      const { data: player } = await supabase.from('players').select('share_token').eq('profile_id', user.id).single()
      if (player?.share_token) {
        setHasProfile(true)
        setPlayerToken(player.share_token)
      }
    }

    const { data: voteData } = await supabase.from('feature_votes').select('vote_count').eq('feature', 'vacancies').single()
    setVoteCount(voteData?.vote_count || 0)

    setLoading(false)
  }

  async function handleVote() {
    if (voted || voting) return
    setVoting(true)
    setVoted(true)
    setVoteCount(c => c + 1)
    localStorage.setItem('gl_vacancy_vote', '1')
    await supabase.rpc('increment_feature_vote', { feature_name: 'vacancies' })
    setVoting(false)
  }

  const seasons = [...new Set(vacancies.map(v => v.season).filter(Boolean))].sort()

  const filtered = vacancies.filter(v => {
    if (filters.position && !v.positions?.includes(filters.position)) return false
    if (filters.country && v.country !== filters.country) return false
    if (filters.season && v.season !== filters.season) return false
    return true
  })

  const hasFilters = !!(filters.position || filters.country || filters.season)

  function CardCTA({ v }: { v: Vacancy }) {
    if (!isLoggedIn) {
      return <a href="/register" className="vac-cta">Sign up to apply</a>
    }
    if (hasProfile && playerToken) {
      return (
        <a href={`/cv/${playerToken}`} className="vac-cta vac-cta-green" target="_blank" rel="noopener noreferrer">
          Submit my Player Card
        </a>
      )
    }
    return <a href="/onboarding" className="vac-cta">Create your CV</a>
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0C0F16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'Arial', color: '#5DCAA5', fontSize: '14px' }}>Loading...</span>
    </div>
  )

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0C0F16; }
        .dir-nav { background: #111520; border-bottom: 0.5px solid rgba(255,255,255,0.06); padding: 0 16px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .dir-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .dir-logo-text { color: white; font-weight: 900; font-size: 17px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .dir-nav-right { display: flex; align-items: center; gap: 8px; }
        .dir-nav-btn { background: #2ec97e; color: white; border: none; border-radius: 20px; padding: 7px 16px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; text-decoration: none; display: inline-block; white-space: nowrap; }
        .dir-nav-login { background: transparent; color: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 6px 14px; font-size: 13px; cursor: pointer; font-family: Arial, sans-serif; text-decoration: none; display: inline-block; white-space: nowrap; }
        .dir-nav-login:hover { color: rgba(255,255,255,0.85); border-color: rgba(255,255,255,0.3); }
        .dir-hero { background: #0D1B2E; padding: 40px 16px; text-align: center; border-bottom: 0.5px solid rgba(255,255,255,0.06); }
        .dir-hero-label { font-size: 10px; color: #5DCAA5; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 10px; }
        .dir-hero-title { font-size: 28px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -1px; margin-bottom: 10px; line-height: 1.1; }
        .dir-hero-sub { font-size: 14px; color: rgba(255,255,255,0.45); max-width: 480px; margin: 0 auto; line-height: 1.6; }
        .filter-bar { background: #111520; border-bottom: 0.5px solid rgba(255,255,255,0.06); padding: 12px 16px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .filter-select { padding: 7px 10px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 13px; color: #F0EDE4; background: #1C2338; outline: none; font-family: Arial, sans-serif; cursor: pointer; flex: 1; min-width: 0; }
        .filter-select:focus { border-color: #2ec97e; }
        .filter-select option { background: #1C2338; color: #F0EDE4; }
        .filter-clear { background: none; border: none; font-size: 12px; color: rgba(255,255,255,0.4); cursor: pointer; font-family: Arial, sans-serif; padding: 0 4px; white-space: nowrap; }
        .filter-clear:hover { color: rgba(255,255,255,0.7); }
        .content { max-width: 1300px; margin: 0 auto; padding: 28px 16px 80px; }
        .content-label { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.14em; font-weight: 700; margin-bottom: 16px; }
        .vac-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .vac-card { background: #161C2A; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.08); overflow: hidden; text-decoration: none; display: block; transition: border-color 0.15s; }
        .vac-card:hover { border-color: rgba(29,158,117,0.4); }
        .vac-card-hero { background: #0D1B2E; padding: 18px 20px; }
        .vac-club { font-size: 16px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 4px; }
        .vac-meta { font-size: 12px; color: rgba(255,255,255,0.45); }
        .vac-card-body { padding: 14px; }
        .vac-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
        .vac-tag { font-size: 10px; font-weight: 700; background: rgba(29,158,117,0.15); color: #5DCAA5; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.04em; }
        .vac-season-tag { background: rgba(212,168,67,0.12); color: #D4A843; }
        .vac-offer { font-size: 12px; color: rgba(255,255,255,0.55); line-height: 1.5; margin-bottom: 8px; }
        .vac-eligibility { font-size: 11px; color: rgba(255,255,255,0.3); margin-bottom: 12px; }
        .vac-cta { display: block; width: 100%; padding: 9px; background: #1C2338; color: rgba(255,255,255,0.65); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 12px; font-weight: 700; font-family: 'Arial Black', Arial, sans-serif; text-decoration: none; text-align: center; cursor: pointer; transition: background 0.15s; }
        .vac-cta:hover { background: #232D47; color: rgba(255,255,255,0.85); }
        .vac-cta-green { background: #2ec97e; color: white; border-color: transparent; }
        .vac-cta-green:hover { background: #18875F; }
        .vote-section { border-top: 0.5px solid rgba(255,255,255,0.06); margin-top: 56px; padding-top: 32px; text-align: center; }
        .vote-label { font-size: 10px; color: rgba(255,255,255,0.25); letter-spacing: 0.14em; font-weight: 700; margin-bottom: 10px; }
        .vote-text { font-size: 14px; color: rgba(255,255,255,0.45); margin-bottom: 18px; line-height: 1.6; max-width: 360px; margin-left: auto; margin-right: auto; }
        .vote-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 9px 20px; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6); cursor: pointer; font-family: Arial, sans-serif; transition: border-color 0.15s, color 0.15s; }
        .vote-btn:hover:not(:disabled) { border-color: #2ec97e; color: #5DCAA5; }
        .vote-btn-voted { background: rgba(29,158,117,0.1); border-color: rgba(29,158,117,0.3); color: #5DCAA5; cursor: default; }
        .vote-count { background: #2ec97e; color: white; border-radius: 20px; font-size: 11px; font-weight: 700; padding: 2px 8px; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state h3 { font-size: 18px; font-weight: 900; color: rgba(255,255,255,0.75); font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 8px; }
        .empty-state p { font-size: 14px; color: rgba(255,255,255,0.35); }
        .dir-footer { background: #111520; border-top: 0.5px solid rgba(255,255,255,0.06); padding: 32px 16px; text-align: center; }
        .dir-footer-brand { font-size: 18px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 6px; }
        .dir-footer-tag { font-size: 12px; color: rgba(255,255,255,0.25); margin-bottom: 16px; }
        .dir-footer-cta { display: inline-block; background: #2ec97e; color: white; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-family: Arial, sans-serif; }
        @media (max-width: 639px) {
          .dir-nav-login { display: none; }
          .filter-bar { flex-direction: column; gap: 8px; }
          .filter-select { width: 100%; flex: none; }
          .filter-clear { align-self: flex-start; }
        }
        @media (min-width: 640px) {
          .dir-nav { padding: 0 28px; height: 64px; }
          .dir-logo-text { font-size: 20px; }
          .dir-nav-right { gap: 12px; }
          .dir-hero { padding: 56px 28px; }
          .dir-hero-title { font-size: 40px; }
          .filter-bar { padding: 14px 28px; gap: 10px; }
          .content { padding: 32px 28px 80px; }
          .vac-grid { grid-template-columns: repeat(2, 1fr); }
          .dir-footer { padding: 32px 28px; }
        }
        @media (min-width: 1024px) {
          .vac-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <nav className="dir-nav">
        <a href="/" className="dir-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/gainline-logo-final.svg" alt="Gainline" width={160} height={48} priority />
        </a>
        <div className="dir-nav-right">
          <a href="/players" className="dir-nav-login">Players</a>
          {isLoggedIn ? (
            <a href="/dashboard" className="dir-nav-btn">Dashboard</a>
          ) : (
            <>
              <a href="/login" className="dir-nav-login">Sign in</a>
              <a href="/register" className="dir-nav-btn">Join free</a>
            </>
          )}
        </div>
      </nav>

      <div className="dir-hero">
        <p className="dir-hero-label">VACANCIES</p>
        <h1 className="dir-hero-title">Clubs looking for players</h1>
        <p className="dir-hero-sub">Positions available at clubs around the world. Apply instantly with your Gainline Player CV.</p>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filters.position} onChange={e => setFilters(f => ({ ...f, position: e.target.value }))}>
          <option value="">All positions</option>
          {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="filter-select" value={filters.country} onChange={e => setFilters(f => ({ ...f, country: e.target.value }))}>
          <option value="">All countries</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={filters.season} onChange={e => setFilters(f => ({ ...f, season: e.target.value }))}>
          <option value="">All seasons</option>
          {seasons.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasFilters && (
          <button className="filter-clear" onClick={() => setFilters({ position: '', country: '', season: '' })}>Clear filters</button>
        )}
      </div>

      <div className="content">
        <p className="content-label">
          {filtered.length} {filtered.length === 1 ? 'VACANCY' : 'VACANCIES'} AVAILABLE
          {hasFilters ? ' — FILTERED' : ''}
        </p>

        {filtered.length > 0 ? (
          <div className="vac-grid">
            {filtered.map(v => (
              <a key={v.id} href={`/vacancies/${v.id}`} className="vac-card">
                <div className="vac-card-hero">
                  <div className="vac-club">{v.club_name}</div>
                  <div className="vac-meta">{[v.country, v.level].filter(Boolean).join(' · ')}</div>
                </div>
                <div className="vac-card-body">
                  <div className="vac-tags">
                    {v.season && <span className="vac-tag vac-season-tag">{v.season}</span>}
                    {v.positions?.map(p => <span key={p} className="vac-tag">{p}</span>)}
                  </div>
                  {v.offer_details && <p className="vac-offer">{v.offer_details}</p>}
                  {v.eligibility_notes && <p className="vac-eligibility">⚠ {v.eligibility_notes}</p>}
                  <CardCTA v={v} />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No vacancies found</h3>
            <p>{hasFilters ? 'Try adjusting your filters.' : 'Check back soon — clubs are joining weekly.'}</p>
          </div>
        )}

        <div className="vote-section">
          <p className="vote-label">COMING SOON</p>
          <p className="vote-text">Clubs posting directly here — vote to prioritise this feature</p>
          <button
            className={`vote-btn${voted ? ' vote-btn-voted' : ''}`}
            onClick={handleVote}
            disabled={voted}
          >
            👍 {voted ? 'Voted!' : 'Vote for this'}
            <span className="vote-count">{voteCount}</span>
          </button>
        </div>
      </div>

      <div className="dir-footer">
        <div className="dir-footer-brand" style={{ display: 'flex', alignItems: 'center' }}><Image src="/gainline-logo-final.svg" alt="Gainline" width={120} height={36} /></div>
        <div className="dir-footer-tag">No talent goes unseen</div>
        <a href="/register" className="dir-footer-cta">Create your free profile</a>
      </div>
    </>
  )
}
