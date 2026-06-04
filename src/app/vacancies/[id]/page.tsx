'use client'
import Image from 'next/image'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

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
  coach_id: string   // coaches.id
}

export default function VacancyDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const id = params?.id as string

  const [vacancy, setVacancy] = useState<Vacancy | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [playerToken, setPlayerToken] = useState<string | null>(null)
  const [playerPosition, setPlayerPosition] = useState<string | null>(null)
  const [playerNationality, setPlayerNationality] = useState<string | null>(null)

  // Application state
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    const [{ data: vac }, { data: { user } }] = await Promise.all([
      supabase.from('vacancies').select('*').eq('id', id).eq('is_active', true).single(),
      supabase.auth.getUser(),
    ])

    if (!vac) { setNotFound(true); setLoading(false); return }
    setVacancy(vac)

    if (user) {
      setIsLoggedIn(true)
      const { data: player } = await supabase
        .from('players')
        .select('id, share_token, position_primary, nationality_primary')
        .eq('profile_id', user.id)
        .single()

      if (player?.share_token) {
        setHasProfile(true)
        setPlayerId(player.id)
        setPlayerToken(player.share_token)
        setPlayerPosition(player.position_primary || null)
        setPlayerNationality(player.nationality_primary || null)

        // Check existing application
        const { data: existing } = await supabase
          .from('vacancy_applications')
          .select('id')
          .eq('player_id', player.id)
          .eq('vacancy_id', id)
          .single()

        if (existing) setAlreadyApplied(true)
      }
    }
    setLoading(false)
  }

  async function confirmApply() {
    if (!playerId || !vacancy) return
    setApplying(true)

    const { data: newApp, error } = await supabase
      .from('vacancy_applications')
      .insert({
        player_id: playerId,
        vacancy_id: vacancy.id,
        coach_id: vacancy.coach_id,
        status: 'new',
      })
      .select('id')
      .single()

    if (error) {
      // unique constraint — already applied
      if (error.code === '23505') { setAlreadyApplied(true); setShowModal(false); setApplying(false); return }
      console.error('Apply error:', error)
      setApplying(false)
      return
    }

    setApplied(true)
    setShowModal(false)
    setApplying(false)

    // Fire-and-forget coach notification
    if (newApp?.id) {
      fetch('/api/notify-vacancy-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: newApp.id }),
      }).catch(() => {/* silent */})
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0C0F16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'Arial', color: '#5DCAA5', fontSize: '14px' }}>Loading...</span>
    </div>
  )

  if (notFound) return (
    <>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Arial, sans-serif; background: #0C0F16; }`}</style>
      <nav style={{ background: '#111520', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image src="/gainline-logo-final.png" alt="Gainline" width={160} height={48} priority />
        </a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'rgba(255,255,255,0.7)', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '10px' }}>Vacancy not found</h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginBottom: '24px' }}>This vacancy may have been filled or removed.</p>
        <a href="/vacancies" style={{ display: 'inline-block', background: '#2ec97e', color: 'white', padding: '10px 24px', borderRadius: '20px', textDecoration: 'none', fontSize: '13px', fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>Browse all vacancies</a>
      </div>
    </>
  )

  const v = vacancy!
  const primaryPos = v.positions?.[0] || 'Player'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0C0F16; }
        .vd-nav { background: #111520; border-bottom: 0.5px solid rgba(255,255,255,0.06); padding: 0 16px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .vd-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .vd-logo-text { color: white; font-weight: 900; font-size: 17px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .vd-nav-right { display: flex; align-items: center; gap: 8px; }
        .vd-nav-btn { background: #2ec97e; color: white; border: none; border-radius: 20px; padding: 7px 16px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; text-decoration: none; display: inline-block; }
        .vd-nav-ghost { background: transparent; color: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 6px 14px; font-size: 13px; text-decoration: none; display: inline-block; }
        .vd-back { display: inline-flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.4); font-size: 13px; text-decoration: none; font-family: Arial, sans-serif; padding: 24px 0 20px; }
        .vd-back:hover { color: rgba(255,255,255,0.7); }
        .vd-hero { background: #0D1B2E; border-radius: 12px; padding: 28px; margin-bottom: 16px; border: 0.5px solid rgba(255,255,255,0.06); }
        .vd-club { font-size: 26px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 6px; }
        .vd-meta { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 16px; }
        .vd-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .vd-tag { font-size: 11px; font-weight: 700; background: rgba(29,158,117,0.15); color: #5DCAA5; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.04em; }
        .vd-season-tag { background: rgba(212,168,67,0.12); color: #D4A843; }
        .vd-section { background: #161C2A; border-radius: 12px; padding: 22px; margin-bottom: 12px; border: 0.5px solid rgba(255,255,255,0.06); }
        .vd-section-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); letter-spacing: 0.14em; margin-bottom: 10px; }
        .vd-section-text { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.65; }
        .vd-eligibility { background: rgba(212,168,67,0.08); border: 1px solid rgba(212,168,67,0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; }
        .vd-eligibility-label { font-size: 10px; font-weight: 700; color: #D4A843; letter-spacing: 0.14em; margin-bottom: 6px; }
        .vd-eligibility-text { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.5; }
        .vd-cta-block { background: #161C2A; border-radius: 12px; padding: 22px; border: 0.5px solid rgba(255,255,255,0.06); margin-bottom: 12px; }
        .vd-cta-title { font-size: 15px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 6px; }
        .vd-cta-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 16px; line-height: 1.5; }
        .vd-btn { display: block; width: 100%; padding: 13px; border-radius: 10px; border: none; font-size: 14px; font-weight: 700; font-family: 'Arial Black', Arial, sans-serif; text-align: center; cursor: pointer; text-decoration: none; transition: background 0.15s; }
        .vd-btn-green { background: #2ec97e; color: white; }
        .vd-btn-green:hover { background: #18875F; }
        .vd-btn-dark { background: #1C2338; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.1); }
        .vd-btn-dark:hover { background: #232D47; }
        .vd-btn-success { background: rgba(29,158,117,0.12); color: #5DCAA5; border: 1px solid rgba(29,158,117,0.25); cursor: default; }
        .vd-btn-disabled { background: #1C2338; color: rgba(255,255,255,0.3); cursor: default; }
        .vd-content { max-width: 720px; margin: 0 auto; padding: 0 16px 80px; }
        /* Modal */
        .vd-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .vd-modal { background: #161C2A; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 28px; max-width: 400px; width: 100%; }
        .vd-modal-title { font-size: 17px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 10px; }
        .vd-modal-body { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.6; margin-bottom: 20px; }
        .vd-modal-highlight { color: white; font-weight: 700; }
        .vd-modal-actions { display: flex; gap: 10px; }
        .vd-modal-confirm { flex: 1; padding: 12px; background: #2ec97e; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; }
        .vd-modal-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
        .vd-modal-cancel { padding: 12px 20px; background: transparent; color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px; cursor: pointer; font-family: Arial, sans-serif; }
        @media (min-width: 640px) {
          .vd-nav { padding: 0 28px; height: 64px; }
          .vd-logo-text { font-size: 20px; }
          .vd-content { padding: 0 28px 80px; }
          .vd-club { font-size: 32px; }
        }
      `}</style>

      {/* Confirmation modal */}
      {showModal && (
        <div className="vd-modal-overlay" onClick={() => !applying && setShowModal(false)}>
          <div className="vd-modal" onClick={e => e.stopPropagation()}>
            <div className="vd-modal-title">Confirm application</div>
            <div className="vd-modal-body">
              You're applying for <span className="vd-modal-highlight">{primaryPos}</span> at{' '}
              <span className="vd-modal-highlight">{v.club_name}</span>.
              <br /><br />
              Your Gainline Player Card will be shared with the coach immediately.
            </div>
            <div className="vd-modal-actions">
              <button className="vd-modal-cancel" onClick={() => setShowModal(false)} disabled={applying}>
                Cancel
              </button>
              <button className="vd-modal-confirm" onClick={confirmApply} disabled={applying}>
                {applying ? 'Submitting…' : 'Submit Player Card'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="vd-nav">
        <a href="/" className="vd-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/gainline-logo-final.png" alt="Gainline" width={160} height={48} priority />
        </a>
        <div className="vd-nav-right">
          {isLoggedIn ? (
            <a href="/dashboard" className="vd-nav-btn">Dashboard</a>
          ) : (
            <>
              <a href="/login" className="vd-nav-ghost">Sign in</a>
              <a href="/register" className="vd-nav-btn">Join free</a>
            </>
          )}
        </div>
      </nav>

      <div className="vd-content">
        <a href="/vacancies" className="vd-back">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 8H3M7 4l-4 4 4 4"/>
          </svg>
          Back to Vacancies
        </a>

        <div className="vd-hero">
          <div className="vd-club">{v.club_name}</div>
          <div className="vd-meta">
            {[v.country, v.level, v.season].filter(Boolean).join(' · ')}
          </div>
          <div className="vd-tags">
            {v.season && <span className="vd-tag vd-season-tag">{v.season}</span>}
            {v.positions?.map(p => <span key={p} className="vd-tag">{p}</span>)}
          </div>
        </div>

        {v.eligibility_notes && (
          <div className="vd-eligibility">
            <div className="vd-eligibility-label">⚠ ELIGIBILITY REQUIREMENTS</div>
            <div className="vd-eligibility-text">{v.eligibility_notes}</div>
          </div>
        )}

        {v.offer_details && (
          <div className="vd-section">
            <div className="vd-section-label">WHAT'S ON OFFER</div>
            <div className="vd-section-text">{v.offer_details}</div>
          </div>
        )}

        {v.contact_info && (
          <div className="vd-section">
            <div className="vd-section-label">CONTACT</div>
            <div className="vd-section-text">{v.contact_info}</div>
          </div>
        )}

        {v.closing_date && (
          <div className="vd-section">
            <div className="vd-section-label">CLOSING DATE</div>
            <div className="vd-section-text">{new Date(v.closing_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        )}

        {/* ── CTA block ── */}
        <div className="vd-cta-block">
          {!isLoggedIn && (
            <>
              <div className="vd-cta-title">Interested in this vacancy?</div>
              <div className="vd-cta-sub">Create a free Gainline Player Card and apply in one tap.</div>
              <a href="/register" className="vd-btn vd-btn-green">Create your free profile</a>
            </>
          )}

          {isLoggedIn && !hasProfile && (
            <>
              <div className="vd-cta-title">Complete your profile first</div>
              <div className="vd-cta-sub">Build your Gainline Player Card to apply for this vacancy.</div>
              <a href="/onboarding" className="vd-btn vd-btn-green">Create your Player Card</a>
            </>
          )}

          {isLoggedIn && hasProfile && applied && (
            <>
              <div className="vd-cta-title">Application submitted ✓</div>
              <div className="vd-cta-sub">{v.club_name} will be in touch if you're a match.</div>
              <div className="vd-btn vd-btn-success">Your Player Card has been shared</div>
            </>
          )}

          {isLoggedIn && hasProfile && alreadyApplied && !applied && (
            <>
              <div className="vd-cta-title">Already applied</div>
              <div className="vd-cta-sub">You've submitted your Player Card for this vacancy.</div>
              <div className="vd-btn vd-btn-disabled">Application submitted</div>
            </>
          )}

          {isLoggedIn && hasProfile && !applied && !alreadyApplied && (
            <>
              <div className="vd-cta-title">Apply with your Player Card</div>
              <div className="vd-cta-sub">Your Gainline Player Card will be shared directly with the coach — no cover letter needed.</div>
              <button className="vd-btn vd-btn-green" onClick={() => setShowModal(true)}>
                Submit my Player Card
              </button>
              {playerToken && (
                <a href={`/cv/${playerToken}`} target="_blank" rel="noopener noreferrer" className="vd-btn vd-btn-dark" style={{ display: 'block', marginTop: '8px' }}>
                  Preview my card first
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
