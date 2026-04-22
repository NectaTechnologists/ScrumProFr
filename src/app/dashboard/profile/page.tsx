'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const positions = [
  'LOOSEHEAD_PROP','HOOKER','TIGHTHEAD_PROP',
  'LEFT_LOCK','RIGHT_LOCK',
  'BLINDSIDE_FLANKER','OPENSIDE_FLANKER','NUMBER_8',
  'SCRUMHALF','FLYHALF',
  'LEFT_WING','INSIDE_CENTRE','OUTSIDE_CENTRE','RIGHT_WING','FULLBACK'
]

const COMPLETION_FIELDS = [
  { key: 'first_name', label: 'First name', weight: 10 },
  { key: 'last_name', label: 'Last name', weight: 10 },
  { key: 'date_of_birth', label: 'Date of birth', weight: 10 },
  { key: 'nationality_primary', label: 'Nationality', weight: 10 },
  { key: 'position_primary', label: 'Primary position', weight: 10 },
  { key: 'height_cm', label: 'Height', weight: 10 },
  { key: 'weight_kg', label: 'Weight', weight: 10 },
  { key: 'school_attended', label: 'School attended', weight: 10 },
  { key: 'bio', label: 'Bio / summary', weight: 15 },
  { key: 'video_url', label: 'Highlight video link', weight: 15 },
]

function calcCompletion(form: any) {
  const total = COMPLETION_FIELDS.reduce((sum, f) => sum + f.weight, 0)
  const earned = COMPLETION_FIELDS.reduce((sum, f) => {
    const val = form[f.key]
    return sum + (val && val !== '' ? f.weight : 0)
  }, 0)
  return Math.round((earned / total) * 100)
}

function getMissing(form: any) {
  return COMPLETION_FIELDS
    .filter(f => !form[f.key] || form[f.key] === '')
    .map(f => f.label)
}

function CompletionRing({ pct }: { pct: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct < 40 ? '#F0A500' : pct < 70 ? '#1D9E75' : '#0F6E56'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white', borderRadius: '12px', padding: '20px 24px', border: '0.5px solid #D3D1C7', marginBottom: '20px' }}>
      <div style={{ position: 'relative', width: '88px', height: '88px', flexShrink: 0 }}>
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#F1EFE8" strokeWidth="8"/>
          <circle
            cx="44" cy="44" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 44 44)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: '18px', fontWeight: '900', color: '#0D1B2E', fontFamily: 'Arial Black, Arial, sans-serif', lineHeight: 1 }}>{pct}%</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '15px', fontWeight: '900', color: '#0D1B2E', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '4px' }}>
          {pct === 100 ? 'Profile complete!' : pct >= 70 ? 'Looking strong' : pct >= 40 ? 'Getting there' : 'Just getting started'}
        </div>
        <div style={{ fontSize: '13px', color: '#5F5E5A', lineHeight: '1.5' }}>
          {pct === 100
            ? 'Your profile is fully complete — coaches and agents can see everything they need.'
            : `Complete your profile to increase visibility. coaches want to see: ${getMissing({ ...arguments[0] }).slice(0, 3).join(', ')}${getMissing({ ...arguments[0] }).length > 3 ? '...' : ''}`
          }
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [completion, setCompletion] = useState(0)
  const [missing, setMissing] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'media' | 'documents'>('profile')

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    nationality_primary: '',
    position_primary: 'HOOKER',
    position_secondary: '',
    height_cm: '',
    weight_kg: '',
    school_attended: '',
    bio: '',
    video_url: '',
    video_url_2: '',
    video_url_3: '',
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: player } = await supabase
        .from('players')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (player) {
        const loaded = {
          first_name: player.first_name || '',
          last_name: player.last_name || '',
          date_of_birth: player.date_of_birth || '',
          nationality_primary: player.nationality_primary || '',
          position_primary: player.position_primary || 'HOOKER',
          position_secondary: player.position_secondary || '',
          height_cm: player.height_cm || '',
          weight_kg: player.weight_kg || '',
          school_attended: player.school_attended || '',
          bio: player.bio || '',
          video_url: player.video_url || '',
          video_url_2: player.video_url_2 || '',
          video_url_3: player.video_url_3 || '',
        }
        setForm(loaded)
        setCompletion(calcCompletion(loaded))
        setMissing(getMissing(loaded))
        setShareUrl(`${window.location.origin}/cv/${player.share_token}`)
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    setCompletion(calcCompletion(form))
    setMissing(getMissing(form))
  }, [form])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    const playerData = {
      profile_id: user.id,
      first_name: form.first_name,
      last_name: form.last_name,
      date_of_birth: form.date_of_birth,
      nationality_primary: form.nationality_primary,
      position_primary: form.position_primary,
      position_secondary: form.position_secondary || null,
      height_cm: form.height_cm ? parseInt(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      school_attended: form.school_attended,
      bio: form.bio,
      video_url: form.video_url || null,
      video_url_2: form.video_url_2 || null,
      video_url_3: form.video_url_3 || null,
      profile_visibility: 'PUBLIC',
    }

    let result
    if (existing) {
      result = await supabase
        .from('players')
        .update(playerData)
        .eq('profile_id', user.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('players')
        .insert(playerData)
        .select()
        .single()
    }

    if (result.data) {
      setShareUrl(`${window.location.origin}/cv/${result.data.share_token}`)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setLoading(false)
  }

  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (completion / 100) * circ
  const ringColor = completion < 40 ? '#F0A500' : completion < 70 ? '#1D9E75' : '#0F6E56'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, Arial, sans-serif; background: #F1EFE8; }

        .prof-nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .prof-logo { display: flex; align-items: center; gap: 10px; }
        .prof-logo-text { color: white; font-weight: 900; font-size: 18px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .prof-back { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 14px; font-family: system-ui; white-space: nowrap; }

        .prof-content { max-width: 700px; margin: 0 auto; padding: 32px 20px; }
        .prof-title { font-size: 24px; font-weight: 700; color: #0D1B2E; margin-bottom: 6px; font-family: 'Arial Black', Arial, sans-serif; }
        .prof-subtitle { color: #888780; margin-bottom: 20px; font-size: 14px; }

        .share-box { background: rgba(29,158,117,0.08); border: 1px solid rgba(29,158,117,0.3); border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .share-box-inner { flex: 1; min-width: 0; }
        .share-label { font-size: 12px; font-weight: 700; color: #1D9E75; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .share-url { font-size: 13px; color: #0D1B2E; font-family: monospace; word-break: break-all; }
        .copy-btn { background: #1D9E75; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; }

        .tabs { display: flex; gap: 2px; background: white; padding: 3px; border-radius: 10px; border: 0.5px solid #D3D1C7; margin-bottom: 20px; }
        .tab { flex: 1; padding: 10px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; font-family: Arial, sans-serif; background: transparent; color: #888780; text-align: center; }
        .tab-active { background: #0D1B2E; color: white; }

        .prof-form { background: white; border-radius: 12px; padding: 28px; border: 1px solid #E8E4F0; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 600; color: #0D1B2E; }
        .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid #E8E4F0; border-radius: 8px; font-size: 14px; outline: none; font-family: system-ui; background: white; color: #0D1B2E; -webkit-text-fill-color: #0D1B2E; }
        .form-input:focus { border-color: #1D9E75; }
        .form-input::placeholder { color: #B4B2A9; -webkit-text-fill-color: #B4B2A9; }
        .form-full { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
        .form-textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #E8E4F0; border-radius: 8px; font-size: 14px; outline: none; font-family: system-ui; height: 100px; resize: none; color: #0D1B2E; }
        .form-textarea:focus { border-color: #1D9E75; }
        .form-textarea::placeholder { color: #B4B2A9; }
        .save-btn { width: 100%; padding: 13px; background: #1D9E75; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Arial Black', Arial, sans-serif; margin-top: 8px; }
        .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .section-title { font-size: 11px; color: #1D9E75; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 16px; }
        .video-hint { font-size: 12px; color: #888780; margin-top: 6px; }

        .doc-placeholder { text-align: center; padding: 48px 20px; }
        .doc-placeholder h3 { font-size: 16px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 8px; }
        .doc-placeholder p { font-size: 13px; color: #888780; line-height: 1.65; }
        .coming-soon { display: inline-block; background: #E1F5EE; color: #0F6E56; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.08em; margin-bottom: 16px; }

        @media (max-width: 768px) {
          .prof-nav { padding: 0 16px; height: 56px; }
          .prof-logo-text { font-size: 16px; }
          .prof-back { font-size: 13px; }
          .prof-content { padding: 24px 16px; }
          .prof-title { font-size: 20px; }
          .form-row { grid-template-columns: 1fr; gap: 12px; }
          .prof-form { padding: 20px 16px; }
          .share-box { flex-direction: column; align-items: flex-start; }
          .copy-btn { width: 100%; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="prof-nav">
        <div className="prof-logo">
          <svg width="32" height="30" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="prof-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </div>
        <button onClick={() => router.push('/dashboard')} className="prof-back">← Back to Dashboard</button>
      </nav>

      <div className="prof-content">
        <h1 className="prof-title">My Rugby Profile</h1>
        <p className="prof-subtitle">Build your digital CV — the more you add, the more visible you become.</p>

        {/* Completion ring */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', border: '0.5px solid #D3D1C7', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', width: '88px', height: '88px', flexShrink: 0 }}>
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r={r} fill="none" stroke="#F1EFE8" strokeWidth="8"/>
              <circle cx="44" cy="44" r={r} fill="none" stroke={ringColor} strokeWidth="8"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 44 44)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#0D1B2E', fontFamily: 'Arial Black, Arial, sans-serif' }}>{completion}%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#0D1B2E', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '4px' }}>
              {completion === 100 ? 'Profile complete!' : completion >= 70 ? 'Looking strong' : completion >= 40 ? 'Getting there' : 'Just getting started'}
            </div>
            <div style={{ fontSize: '13px', color: '#5F5E5A', lineHeight: '1.5' }}>
              {completion === 100
                ? 'Your profile is fully complete — coaches can see everything they need.'
                : missing.length > 0
                  ? `Still to add: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ` +${missing.length - 3} more` : ''}`
                  : 'Keep filling in your details to boost visibility.'
              }
            </div>
          </div>
        </div>

        {/* Share link */}
        {shareUrl && (
          <div className="share-box">
            <div className="share-box-inner">
              <div className="share-label">Your shareable CV link</div>
              <div className="share-url">{shareUrl}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link copied!') }} className="copy-btn">
              Copy Link
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
          <button className={`tab ${activeTab === 'media' ? 'tab-active' : ''}`} onClick={() => setActiveTab('media')}>Video links</button>
          <button className={`tab ${activeTab === 'documents' ? 'tab-active' : ''}`} onClick={() => setActiveTab('documents')}>Documents</button>
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="prof-form">
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">First Name</label>
                <input className="form-input" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required placeholder="Abonga" />
              </div>
              <div className="form-field">
                <label className="form-label">Last Name</label>
                <input className="form-input" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required placeholder="Nkwelo" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} required />
              </div>
              <div className="form-field">
                <label className="form-label">Nationality</label>
                <input className="form-input" value={form.nationality_primary} onChange={e => setForm({ ...form, nationality_primary: e.target.value })} placeholder="South African" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Primary Position</label>
                <select className="form-input" value={form.position_primary} onChange={e => setForm({ ...form, position_primary: e.target.value })}>
                  {positions.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Secondary Position</label>
                <select className="form-input" value={form.position_secondary} onChange={e => setForm({ ...form, position_secondary: e.target.value })}>
                  <option value="">None</option>
                  {positions.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Height (cm)</label>
                <input className="form-input" type="number" value={form.height_cm} onChange={e => setForm({ ...form, height_cm: e.target.value })} placeholder="187" />
              </div>
              <div className="form-field">
                <label className="form-label">Weight (kg)</label>
                <input className="form-input" type="number" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} placeholder="110" />
              </div>
            </div>
            <div className="form-full">
              <label className="form-label">School Attended</label>
              <input className="form-input" value={form.school_attended} onChange={e => setForm({ ...form, school_attended: e.target.value })} placeholder="St Andrews College" />
            </div>
            <div className="form-full">
              <label className="form-label">Bio / Personal Summary</label>
              <textarea className="form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Experienced front-row forward with strong set-piece fundamentals..." />
            </div>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
            </button>
          </form>
        )}

        {/* MEDIA TAB */}
        {activeTab === 'media' && (
          <form onSubmit={handleSave} className="prof-form">
            <p className="section-title">VIDEO HIGHLIGHTS</p>
            <p style={{ fontSize: '13px', color: '#5F5E5A', marginBottom: '20px', lineHeight: '1.65' }}>
              Add links to your highlight reels or match footage on YouTube or Vimeo. These will appear on your public CV for coaches to watch.
            </p>
            <div className="form-full">
              <label className="form-label">Highlight reel — primary</label>
              <input className="form-input" type="url" value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
              <p className="video-hint">Your best footage — coaches see this first</p>
            </div>
            <div className="form-full">
              <label className="form-label">Match footage or second highlight</label>
              <input className="form-input" type="url" value={form.video_url_2} onChange={e => setForm({ ...form, video_url_2: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div className="form-full">
              <label className="form-label">Additional footage</label>
              <input className="form-input" type="url" value={form.video_url_3} onChange={e => setForm({ ...form, video_url_3: e.target.value })} placeholder="https://vimeo.com/..." />
            </div>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save video links'}
            </button>
          </form>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="prof-form">
            <div className="doc-placeholder">
              <div className="coming-soon">COMING SOON</div>
              <h3>Document uploads</h3>
              <p>Soon you&apos;ll be able to securely upload your passport, medical certificates and contracts directly to your profile — visible only to agents and coaches you approve.</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
