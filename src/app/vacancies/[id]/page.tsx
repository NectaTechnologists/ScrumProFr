'use client'

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
  const [playerToken, setPlayerToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    const [{ data: vac }, { data: { user } }] = await Promise.all([
      supabase.from('vacancies').select('*').eq('id', id).eq('is_active', true).single(),
      supabase.auth.getUser(),
    ])

    if (!vac) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setVacancy(vac)

    if (user) {
      setIsLoggedIn(true)
      const { data: player } = await supabase.from('players').select('share_token').eq('profile_id', user.id).single()
      if (player?.share_token) {
        setHasProfile(true)
        setPlayerToken(player.share_token)
      }
    }

    setLoading(false)
  }

  async function handleApply() {
    if (!hasProfile || !playerToken) return
    const cvUrl = `${window.location.origin}/cv/${playerToken}`
    try {
      await navigator.clipboard.writeText(cvUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = cvUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
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
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="28" height="26" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span style={{ color: 'white', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.5px', fontFamily: 'Arial Black, Arial, sans-serif' }}>GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </a>
      </nav>
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'rgba(255,255,255,0.7)', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '10px' }}>Vacancy not found</h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginBottom: '24px' }}>This vacancy may have been filled or removed.</p>
        <a href="/vacancies" style={{ display: 'inline-block', background: '#1D9E75', color: 'white', padding: '10px 24px', borderRadius: '20px', textDecoration: 'none', fontSize: '13px', fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>Browse all vacancies</a>
      </div>
    </>
  )

  const v = vacancy!

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0C0F16; }
        .vd-nav { background: #111520; border-bottom: 0.5px solid rgba(255,255,255,0.06); padding: 0 16px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .vd-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .vd-logo-text { color: white; font-weight: 900; font-size: 17px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .vd-nav-right { display: flex; align-items: center; gap: 8px; }
        .vd-nav-btn { background: #1D9E75; color: white; border: none; border-radius: 20px; padding: 7px 16px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; text-decoration: none; display: inline-block; }
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
        .vd-btn-green { background: #1D9E75; color: white; }
        .vd-btn-green:hover { background: #18875F; }
        .vd-btn-dark { background: #1C2338; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.1); }
        .vd-btn-dark:hover { background: #232D47; }
        .vd-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #1D9E75; color: white; padding: 10px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; font-family: Arial, sans-serif; white-space: nowrap; z-index: 999; box-shadow: 0 4px 20px rgba(0,0,0,0.4); animation: slideUp 0.2s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .vd-content { max-width: 720px; margin: 0 auto; padding: 0 16px 80px; }
        @media (min-width: 640px) {
          .vd-nav { padding: 0 28px; height: 64px; }
          .vd-logo-text { font-size: 20px; }
          .vd-content { padding: 0 28px 80px; }
          .vd-club { font-size: 32px; }
        }
      `}</style>

      <nav className="vd-nav">
        <a href="/" className="vd-logo">
          <svg width="28" height="26" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="vd-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
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

        <div className="vd-cta-block">
          {!isLoggedIn && (
            <>
              <div className="vd-cta-title">Interested in this vacancy?</div>
              <div className="vd-cta-sub">Create a free Gainline profile and share your CV link with the club.</div>
              <a href="/register" className="vd-btn vd-btn-green">Create your free profile</a>
            </>
          )}
          {isLoggedIn && !hasProfile && (
            <>
              <div className="vd-cta-title">Complete your profile first</div>
              <div className="vd-cta-sub">Build your Gainline Player CV to apply for this vacancy.</div>
              <a href="/onboarding" className="vd-btn vd-btn-green">Create your CV</a>
            </>
          )}
          {isLoggedIn && hasProfile && (
            <>
              <div className="vd-cta-title">Apply with your Gainline CV</div>
              <div className="vd-cta-sub">Click below to copy your CV link — then send it directly to the club via the contact details above.</div>
              <button className="vd-btn vd-btn-green" onClick={handleApply}>
                {copied ? '✓ CV link copied!' : 'Copy my CV link'}
              </button>
              <div style={{ marginTop: '8px' }}>
                <a href={`/cv/${playerToken}`} target="_blank" rel="noopener noreferrer" className="vd-btn vd-btn-dark" style={{ display: 'block', marginTop: '8px' }}>
                  Preview my CV
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {copied && (
        <div className="vd-toast">
          Your CV link has been copied — share it with the club
        </div>
      )}
    </>
  )
}
