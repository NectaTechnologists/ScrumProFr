'use client'
import Image from 'next/image'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ORG_TYPES = [
  'Professional Club', 'Semi-Professional Club', 'Amateur Club',
  'National Union', 'Provincial Union', 'Academy',
  'School', 'University', 'Independent', 'Other',
]

const LEVELS = [
  'International', 'Professional', 'Semi-Professional',
  'Amateur', 'Academy', 'University', 'School',
]

const POSITIONS = [
  'Loosehead Prop', 'Hooker', 'Tighthead Prop',
  'Lock', 'Flanker', 'Number 8',
  'Scrum-half', 'Fly-half', 'Inside Centre', 'Outside Centre',
  'Wing', 'Fullback',
]

type Credential = {
  id?: string
  credential_type: string
  issuer: string
  year: string
  notes: string
}

type HistoryEntry = {
  id?: string
  club: string
  role: string
  start_year: string
  end_year: string
  level: string
  key_achievements: string
}

export default function CoachProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [tab, setTab] = useState<'profile' | 'credentials' | 'history' | 'playing'>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [coachId, setCoachId] = useState<string | null>(null)
  const [shareToken, setShareToken] = useState<string>('')
  const [copiedCoachLink, setCopiedCoachLink] = useState(false)
  const [welcomeEmailSent, setWelcomeEmailSent] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    role_title: '',
    organisation: '',
    org_type: '',
    country: '',
    bio: '',
    headshot_url: '',
    coaching_style: '',
    philosophy: '',
    specialties: '',
    linkedin_url: '',
    video_url: '',
    // playing background
    played_position: '',
    played_club: '',
    played_era: '',
    played_level: '',
    played_nationality: '',
  })

  const [credentials, setCredentials] = useState<Credential[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUser(user)

    // Check is_coach
    const { data: prof } = await supabase.from('profiles').select('is_coach, role').eq('id', user.id).single()
    if (!prof?.is_coach && prof?.role !== 'org_user') {
      router.push('/dashboard')
      return
    }

    // Fetch or create coaches row
    let { data: coach } = await supabase.from('coaches').select('*').eq('user_id', user.id).single()
    if (!coach) {
      const { data: newCoach } = await supabase.from('coaches').insert({ user_id: user.id }).select().single()
      coach = newCoach
    }

    if (coach) {
      setCoachId(coach.id)
      setShareToken(coach.share_token || '')
      setForm({
        full_name: coach.full_name || '',
        role_title: coach.role_title || '',
        organisation: coach.organisation || '',
        org_type: coach.org_type || '',
        country: coach.country || '',
        bio: coach.bio || '',
        headshot_url: coach.headshot_url || '',
        coaching_style: coach.coaching_style || '',
        philosophy: coach.philosophy || '',
        specialties: coach.specialties || '',
        linkedin_url: coach.linkedin_url || '',
        video_url: coach.video_url || '',
        played_position: coach.played_position || '',
        played_club: coach.played_club || '',
        played_era: coach.played_era || '',
        played_level: coach.played_level || '',
        played_nationality: coach.played_nationality || '',
      })

      const [{ data: creds }, { data: hist }] = await Promise.all([
        supabase.from('coaching_credentials').select('*').eq('coach_id', coach.id).order('order_index'),
        supabase.from('coaching_history').select('*').eq('coach_id', coach.id).order('order_index'),
      ])
      setCredentials((creds || []).map((c: any) => ({ ...c, year: c.year?.toString() || '' })))
      setHistory((hist || []).map((h: any) => ({
        ...h,
        start_year: h.start_year?.toString() || '',
        end_year: h.end_year?.toString() || '',
      })))
    }

    setLoading(false)
  }

  function flash() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  async function saveProfile() {
    if (!coachId) return
    setSaving(true)
    await supabase.from('coaches').update({
      ...form,
      updated_at: new Date().toISOString(),
    }).eq('id', coachId)
    setSaving(false)
    flash()
    // Fire-and-forget welcome email on first save only
    if (!welcomeEmailSent) {
      setWelcomeEmailSent(true)
      fetch('/api/send-welcome-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coach_id: coachId }),
      }).catch(() => {/* silent */})
    }
  }

  async function saveCredentials() {
    if (!coachId) return
    setSaving(true)
    await supabase.from('coaching_credentials').delete().eq('coach_id', coachId)
    const rows = credentials
      .filter(c => c.credential_type.trim())
      .map((c, i) => ({
        coach_id: coachId,
        credential_type: c.credential_type,
        issuer: c.issuer,
        year: c.year ? parseInt(c.year) : null,
        notes: c.notes,
        order_index: i,
      }))
    if (rows.length) await supabase.from('coaching_credentials').insert(rows)
    setSaving(false)
    flash()
  }

  async function saveHistory() {
    if (!coachId) return
    setSaving(true)
    await supabase.from('coaching_history').delete().eq('coach_id', coachId)
    const rows = history
      .filter(h => h.club.trim())
      .map((h, i) => ({
        coach_id: coachId,
        club: h.club,
        role: h.role,
        start_year: h.start_year ? parseInt(h.start_year) : null,
        end_year: h.end_year ? parseInt(h.end_year) : null,
        level: h.level,
        key_achievements: h.key_achievements,
        order_index: i,
      }))
    if (rows.length) await supabase.from('coaching_history').insert(rows)
    setSaving(false)
    flash()
  }

  function addCredential() {
    setCredentials(prev => [...prev, { credential_type: '', issuer: '', year: '', notes: '' }])
  }
  function removeCredential(i: number) {
    setCredentials(prev => prev.filter((_, idx) => idx !== i))
  }
  function updateCredential(i: number, field: keyof Credential, val: string) {
    setCredentials(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c))
  }

  function addHistory() {
    setHistory(prev => [...prev, { club: '', role: '', start_year: '', end_year: '', level: '', key_achievements: '' }])
  }
  function removeHistory(i: number) {
    setHistory(prev => prev.filter((_, idx) => idx !== i))
  }
  function updateHistory(i: number, field: keyof HistoryEntry, val: string) {
    setHistory(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h))
  }

  const cardUrl = shareToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/coach/${shareToken}` : ''

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0C0F16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Arial', color: '#A8A398', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0C0F16; color: #F0EDE4; }
        .cp-nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .cp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .cp-logo-text { color: white; font-weight: 900; font-size: 18px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .cp-nav-right { display: flex; align-items: center; gap: 12px; }
        .cp-nav-link { color: rgba(255,255,255,0.6); font-size: 14px; font-family: system-ui; background: none; border: none; cursor: pointer; }
        .cp-nav-link:hover { color: white; }
        .cp-content { padding: 32px 20px; max-width: 700px; margin: 0 auto; }
        .cp-header { margin-bottom: 20px; }
        .cp-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(212,168,67,0.15); border: 1px solid rgba(212,168,67,0.3); border-radius: 20px; padding: 4px 12px; margin-bottom: 10px; }
        .cp-badge span { font-size: 11px; color: #D4A843; font-weight: 700; letter-spacing: 0.1em; }
        .cp-title { font-size: 24px; font-weight: 700; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 4px; }
        .cp-sub { color: #888780; margin-bottom: 16px; font-size: 14px; }
        .cp-share-row { background: rgba(212,168,67,0.08); border: 1px solid rgba(212,168,67,0.3); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .cp-share-url { flex: 1; font-size: 12px; color: #D4A843; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
        .cp-share-btn { background: #D4A843; color: #0C0F16; border: none; border-radius: 6px; padding: 7px 14px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; flex-shrink: 0; font-family: Arial, sans-serif; }
        /* tabs — match player profile exactly */
        .cp-tab-nav { display: flex; gap: 2px; background: #111520; padding: 3px; border-radius: 10px; border: 0.5px solid #D3D1C7; margin-bottom: 20px; overflow-x: auto; }
        .cp-tab-btn { flex: 1; padding: 10px 8px; border-radius: 8px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; font-family: Arial, sans-serif; background: transparent; color: #888780; text-align: center; white-space: nowrap; }
        .cp-tab-active { background: #D4A843; color: #0C0F16; }
        /* form card */
        .cp-section { background: #161C2A; border-radius: 12px; padding: 28px; border: 1px solid rgba(255,255,255,0.07); margin-bottom: 16px; }
        .cp-section-title { font-size: 11px; color: #2ec97e; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 16px; margin-top: 8px; }
        .cp-row { display: grid; gap: 16px; margin-bottom: 16px; }
        .cp-row-2 { grid-template-columns: 1fr 1fr; }
        .cp-row-3 { grid-template-columns: 1fr 1fr 1fr; }
        .cp-field { display: flex; flex-direction: column; gap: 6px; }
        .cp-label { font-size: 13px; font-weight: 600; color: #F0EDE4; }
        .cp-input { width: 100%; padding: 10px 14px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; outline: none; font-family: system-ui; background: #1C2338; color: #F0EDE4; }
        .cp-input:focus { border-color: #2ec97e; }
        .cp-input::placeholder { color: #B4B2A9; }
        .cp-textarea { resize: vertical; min-height: 90px; }
        /* save */
        .cp-save-wrap { margin-top: 8px; }
        .cp-save-btn { width: 100%; padding: 11px; background: #D4A843; color: #0C0F16; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; gap: 7px; }
        .cp-save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .cp-saved { font-size: 13px; color: #5DCAA5; margin-top: 8px; display: block; text-align: center; }
        /* entry cards */
        .entry-card { background: #1C2338; border-radius: 8px; padding: 16px; margin-bottom: 12px; border: 0.5px solid rgba(255,255,255,0.07); position: relative; }
        .entry-remove { position: absolute; top: 10px; right: 12px; background: none; border: none; color: rgba(255,255,255,0.25); cursor: pointer; font-size: 18px; line-height: 1; }
        .entry-remove:hover { color: #E05252; }
        .add-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 20px; border: 1.5px dashed rgba(255,255,255,0.15); background: transparent; color: rgba(255,255,255,0.4); font-size: 13px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; margin-top: 4px; }
        .add-btn:hover { border-color: #D4A843; color: #D4A843; }
        @media (max-width: 680px) {
          .cp-nav { padding: 0 16px; }
          .cp-content { padding: 24px 16px; }
          .cp-row-2, .cp-row-3 { grid-template-columns: 1fr; }
          .cp-section { padding: 20px 16px; }
        }
      `}</style>

      <nav className="cp-nav">
        <div className="cp-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/gainline-logo-final.svg" alt="Gainline" width={160} height={48} priority />
        </div>
        <div className="cp-nav-right">
          {shareToken && (
            <a href={cardUrl} target="_blank" style={{ color: '#D4A843', fontSize: '13px', textDecoration: 'none' }}>
              View Card ↗
            </a>
          )}
          <a href="/dashboard/coach" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>Player Browser</a>
          <button onClick={() => router.push('/dashboard')} className="cp-nav-link">← Dashboard</button>
        </div>
      </nav>

      <div className="cp-content">

        {/* ── PREVIEW HERO ──────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(160deg, #0D1B2E 0%, #1a2a1a 100%)',
          border: '1px solid rgba(212,168,67,0.15)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
          position: 'relative',
        }}>
          {/* LIVE PREVIEW label */}
          <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '10px', color: '#D4A843', letterSpacing: '1.5px', fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>LIVE PREVIEW</div>

          {/* Hero content */}
          <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            {/* Avatar 64×64 */}
            <div style={{ width: 64, height: 64, borderRadius: '12px', background: '#1C2338', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {form.headshot_url ? (
                <img src={form.headshot_url} alt={form.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '22px', color: '#D4A843', fontWeight: 900 }}>
                  {form.full_name ? form.full_name[0] : '?'}
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: '4px', paddingRight: '80px' }}>
              <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '20px', color: '#F0EDE4', fontWeight: 900, marginBottom: '8px' }}>
                {form.full_name || 'Your Name'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                {form.role_title && (
                  <span style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843', border: '0.5px solid rgba(212,168,67,0.3)', fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', fontFamily: 'Arial, sans-serif' }}>
                    {form.role_title}
                  </span>
                )}
                {form.country && (
                  <span style={{ background: 'rgba(168,163,152,0.1)', color: '#A8A398', fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px', fontFamily: 'Arial, sans-serif' }}>
                    {form.country}
                  </span>
                )}
              </div>
              {form.organisation && (
                <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Arial, sans-serif' }}>{form.organisation}</div>
              )}
            </div>
          </div>

          {/* Stat strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { value: history.length > 0 ? `${history.length}+` : '—', label: 'CLUBS COACHED' },
              { value: credentials.length > 0 ? `WR ${credentials[0]?.credential_type?.match(/\d+/)?.[0] || ''}`.trim() || credentials[0]?.credential_type || '—' : '—', label: 'WR BADGE' },
              { value: form.org_type || '—', label: 'ORG TYPE' },
              { value: form.specialties ? form.specialties.split(',')[0].trim() : '—', label: 'SPECIALTY' },
            ].map((stat, i) => (
              <div key={i} style={{ padding: '12px 0', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
                <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '14px', fontWeight: 900, color: '#F0EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>{stat.value}</div>
                <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#5A564F', letterSpacing: '1px', marginTop: '2px', fontFamily: 'Arial, sans-serif' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Share row */}
          {shareToken && (
            <div style={{ padding: '12px 20px', background: 'rgba(212,168,67,0.06)', borderTop: '1px solid rgba(212,168,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                gainline.pro/coach/{shareToken}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => { navigator.clipboard.writeText(cardUrl); setCopiedCoachLink(true); setTimeout(() => setCopiedCoachLink(false), 1800) }}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#A8A398', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}
                >
                  {copiedCoachLink ? 'Copied!' : 'Copy link'}
                </button>
                <a
                  href={cardUrl}
                  target="_blank"
                  style={{ background: '#D4A843', color: '#0C0F16', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', textDecoration: 'none', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap', fontWeight: 700 }}
                >
                  Share
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="cp-header">
          <div className="cp-badge"><div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#D4A843' }}></div><span>COACH CARD</span></div>
          <h1 className="cp-title">My Coach Profile</h1>
          <p className="cp-sub">Build your public coaching card — share it with clubs and unions.</p>
          {shareToken && (
            <div className="cp-share-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#D4A843', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Coach Card URL</div>
                <div className="cp-share-url">{cardUrl}</div>
              </div>
              <button className="cp-share-btn" onClick={() => { navigator.clipboard.writeText(cardUrl) }}>Copy link</button>
            </div>
          )}
        </div>

        <div className="cp-tab-nav">
          {([['profile','Profile'],['credentials','Credentials'],['history','History'],['playing','Playing BG']] as const).map(([key, label]) => (
            <button key={key} className={`cp-tab-btn ${tab === key ? 'cp-tab-active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: PROFILE ── */}
        {tab === 'profile' && (
          <>
            <div className="cp-section">
              <div className="cp-section-title">COACHING IDENTITY</div>
              <div className="cp-row cp-row-2">
                <div className="cp-field">
                  <label className="cp-label">FULL NAME</label>
                  <input className="cp-input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="e.g. Mike Henderson" />
                </div>
                <div className="cp-field">
                  <label className="cp-label">ROLE / TITLE</label>
                  <input className="cp-input" value={form.role_title} onChange={e => setForm(f => ({ ...f, role_title: e.target.value }))} placeholder="e.g. Head Coach" />
                </div>
              </div>
              <div className="cp-row cp-row-2">
                <div className="cp-field">
                  <label className="cp-label">CURRENT ORGANISATION</label>
                  <input className="cp-input" value={form.organisation} onChange={e => setForm(f => ({ ...f, organisation: e.target.value }))} placeholder="e.g. Bristol Bears" />
                </div>
                <div className="cp-field">
                  <label className="cp-label">ORG TYPE</label>
                  <select className="cp-input" value={form.org_type} onChange={e => setForm(f => ({ ...f, org_type: e.target.value }))}>
                    <option value="">Select type</option>
                    {ORG_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="cp-row cp-row-2">
                <div className="cp-field">
                  <label className="cp-label">COUNTRY</label>
                  <input className="cp-input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g. United Kingdom" />
                </div>
                <div className="cp-field">
                  <label className="cp-label">HEADSHOT URL</label>
                  <input className="cp-input" value={form.headshot_url} onChange={e => setForm(f => ({ ...f, headshot_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="cp-section">
              <div className="cp-section-title">BIO & PHILOSOPHY</div>
              <div className="cp-row" style={{ marginBottom: '16px' }}>
                <div className="cp-field">
                  <label className="cp-label">BIO</label>
                  <textarea className="cp-input cp-textarea" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="A short professional bio..." style={{ minHeight: '100px' }} />
                </div>
              </div>
              <div className="cp-row cp-row-2">
                <div className="cp-field">
                  <label className="cp-label">COACHING STYLE</label>
                  <input className="cp-input" value={form.coaching_style} onChange={e => setForm(f => ({ ...f, coaching_style: e.target.value }))} placeholder="e.g. High-intensity, possession-based" />
                </div>
                <div className="cp-field">
                  <label className="cp-label">SPECIALTIES</label>
                  <input className="cp-input" value={form.specialties} onChange={e => setForm(f => ({ ...f, specialties: e.target.value }))} placeholder="e.g. Set-piece, Defence, Forwards" />
                </div>
              </div>
              <div className="cp-row" style={{ marginBottom: '0' }}>
                <div className="cp-field">
                  <label className="cp-label">COACHING PHILOSOPHY</label>
                  <textarea className="cp-input cp-textarea" value={form.philosophy} onChange={e => setForm(f => ({ ...f, philosophy: e.target.value }))} placeholder="Describe your core coaching beliefs..." />
                </div>
              </div>
            </div>

            <div className="cp-section">
              <div className="cp-section-title">LINKS</div>
              <div className="cp-row cp-row-2">
                <div className="cp-field">
                  <label className="cp-label">LINKEDIN URL</label>
                  <input className="cp-input" value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="cp-field">
                  <label className="cp-label">HIGHLIGHT VIDEO URL</label>
                  <input className="cp-input" value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://youtube.com/..." />
                </div>
              </div>
            </div>

            <div className="cp-save-wrap">
              <button className="cp-save-btn" disabled={saving} onClick={saveProfile}>{saving ? 'Saving…' : 'Save profile'}</button>
              {saved && <span className="cp-saved">✓ Saved</span>}
            </div>
          </>
        )}

        {/* ── TAB: CREDENTIALS ── */}
        {tab === 'credentials' && (
          <>
            <div className="cp-section">
              <div className="cp-section-title">COACHING LICENCES & QUALIFICATIONS</div>
              {credentials.length === 0 && (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>No credentials added yet.</p>
              )}
              {credentials.map((c, i) => (
                <div key={i} className="entry-card">
                  <button className="entry-remove" onClick={() => removeCredential(i)}>×</button>
                  <div className="cp-row cp-row-2" style={{ marginBottom: '12px' }}>
                    <div className="cp-field">
                      <label className="cp-label">CREDENTIAL / LICENCE</label>
                      <input className="cp-input" value={c.credential_type} onChange={e => updateCredential(i, 'credential_type', e.target.value)} placeholder="e.g. World Rugby Level 2" />
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">ISSUING BODY</label>
                      <input className="cp-input" value={c.issuer} onChange={e => updateCredential(i, 'issuer', e.target.value)} placeholder="e.g. World Rugby" />
                    </div>
                  </div>
                  <div className="cp-row cp-row-2" style={{ marginBottom: '0' }}>
                    <div className="cp-field">
                      <label className="cp-label">YEAR AWARDED</label>
                      <input className="cp-input" type="number" value={c.year} onChange={e => updateCredential(i, 'year', e.target.value)} placeholder="e.g. 2018" min="1980" max="2030" />
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">NOTES (optional)</label>
                      <input className="cp-input" value={c.notes} onChange={e => updateCredential(i, 'notes', e.target.value)} placeholder="e.g. Merit distinction" />
                    </div>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={addCredential}>+ Add credential</button>
            </div>

            <div className="cp-save-wrap">
              <button className="cp-save-btn" disabled={saving} onClick={saveCredentials}>{saving ? 'Saving…' : 'Save credentials'}</button>
              {saved && <span className="cp-saved">✓ Saved</span>}
            </div>
          </>
        )}

        {/* ── TAB: HISTORY ── */}
        {tab === 'history' && (
          <>
            <div className="cp-section">
              <div className="cp-section-title">COACHING CAREER HISTORY</div>
              {history.length === 0 && (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>No history added yet.</p>
              )}
              {history.map((h, i) => (
                <div key={i} className="entry-card">
                  <button className="entry-remove" onClick={() => removeHistory(i)}>×</button>
                  <div className="cp-row cp-row-2" style={{ marginBottom: '12px' }}>
                    <div className="cp-field">
                      <label className="cp-label">CLUB / TEAM</label>
                      <input className="cp-input" value={h.club} onChange={e => updateHistory(i, 'club', e.target.value)} placeholder="e.g. Leinster Rugby" />
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">ROLE / TITLE</label>
                      <input className="cp-input" value={h.role} onChange={e => updateHistory(i, 'role', e.target.value)} placeholder="e.g. Defence Coach" />
                    </div>
                  </div>
                  <div className="cp-row cp-row-3" style={{ marginBottom: '12px' }}>
                    <div className="cp-field">
                      <label className="cp-label">FROM</label>
                      <input className="cp-input" type="number" value={h.start_year} onChange={e => updateHistory(i, 'start_year', e.target.value)} placeholder="2018" min="1970" max="2030" />
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">TO (blank if current)</label>
                      <input className="cp-input" type="number" value={h.end_year} onChange={e => updateHistory(i, 'end_year', e.target.value)} placeholder="2023" min="1970" max="2030" />
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">LEVEL</label>
                      <select className="cp-input" value={h.level} onChange={e => updateHistory(i, 'level', e.target.value)}>
                        <option value="">Select</option>
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="cp-field" style={{ marginBottom: '0' }}>
                    <label className="cp-label">KEY ACHIEVEMENTS</label>
                    <textarea className="cp-input cp-textarea" value={h.key_achievements} onChange={e => updateHistory(i, 'key_achievements', e.target.value)} placeholder="e.g. Led team to European cup final, improved defensive efficiency by 18%..." style={{ minHeight: '68px' }} />
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={addHistory}>+ Add role</button>
            </div>

            <div className="cp-save-wrap">
              <button className="cp-save-btn" disabled={saving} onClick={saveHistory}>{saving ? 'Saving…' : 'Save history'}</button>
              {saved && <span className="cp-saved">✓ Saved</span>}
            </div>
          </>
        )}

        {/* ── TAB: PLAYING BACKGROUND ── */}
        {tab === 'playing' && (
          <>
            <div className="cp-section">
              <div className="cp-section-title">PLAYING BACKGROUND</div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px', lineHeight: '1.6' }}>Share your experience as a player — this adds context to your coaching profile.</p>
              <div className="cp-row cp-row-2">
                <div className="cp-field">
                  <label className="cp-label">POSITION PLAYED</label>
                  <select className="cp-input" value={form.played_position} onChange={e => setForm(f => ({ ...f, played_position: e.target.value }))}>
                    <option value="">Select position</option>
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="cp-field">
                  <label className="cp-label">HIGHEST LEVEL</label>
                  <select className="cp-input" value={form.played_level} onChange={e => setForm(f => ({ ...f, played_level: e.target.value }))}>
                    <option value="">Select level</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="cp-row cp-row-2">
                <div className="cp-field">
                  <label className="cp-label">MAIN CLUB(S)</label>
                  <input className="cp-input" value={form.played_club} onChange={e => setForm(f => ({ ...f, played_club: e.target.value }))} placeholder="e.g. Bath RFC, London Wasps" />
                </div>
                <div className="cp-field">
                  <label className="cp-label">PLAYING ERA</label>
                  <input className="cp-input" value={form.played_era} onChange={e => setForm(f => ({ ...f, played_era: e.target.value }))} placeholder="e.g. 1998–2011" />
                </div>
              </div>
              <div className="cp-row cp-row-2">
                <div className="cp-field">
                  <label className="cp-label">NATIONALITY (AS PLAYER)</label>
                  <input className="cp-input" value={form.played_nationality} onChange={e => setForm(f => ({ ...f, played_nationality: e.target.value }))} placeholder="e.g. Irish" />
                </div>
              </div>
            </div>

            <div className="cp-save-wrap">
              <button className="cp-save-btn" disabled={saving} onClick={saveProfile}>{saving ? 'Saving…' : 'Save'}</button>
              {saved && <span className="cp-saved">✓ Saved</span>}
            </div>
          </>
        )}
      </div>
    </>
  )
}
