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

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
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
        setForm({
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
        })
        setShareUrl(`${window.location.origin}/cv/${player.share_token}`)
      }
    }
    loadProfile()
  }, [])

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

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, Arial, sans-serif; background: #F1EFE8; }

        .prof-nav {
          background: #0D1B2E;
          padding: 0 28px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .prof-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .prof-logo-text {
          color: white;
          font-weight: 900;
          font-size: 18px;
          letter-spacing: -0.5px;
          font-family: 'Arial Black', Arial, sans-serif;
        }

        .prof-back {
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 14px;
          font-family: system-ui;
          white-space: nowrap;
        }

        .prof-content {
          max-width: 700px;
          margin: 0 auto;
          padding: 32px 20px;
        }

        .prof-title {
          font-size: 24px;
          font-weight: 700;
          color: #0D1B2E;
          margin-bottom: 6px;
          font-family: 'Arial Black', Arial, sans-serif;
        }

        .prof-subtitle {
          color: #888780;
          margin-bottom: 28px;
          font-size: 14px;
        }

        .share-box {
          background: rgba(29,158,117,0.08);
          border: 1px solid rgba(29,158,117,0.3);
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .share-box-inner { flex: 1; min-width: 0; }

        .share-label {
          font-size: 12px;
          font-weight: 700;
          color: #1D9E75;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .share-url {
          font-size: 13px;
          color: #0D1B2E;
          font-family: monospace;
          word-break: break-all;
        }

        .copy-btn {
          background: #1D9E75;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .prof-form {
          background: white;
          border-radius: 12px;
          padding: 28px;
          border: 1px solid #E8E4F0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-field { margin-bottom: 0; }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #0D1B2E;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #E8E4F0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          font-family: system-ui;
          background: white;
        }

        .form-input:focus { border-color: #1D9E75; }

        .form-full { margin-bottom: 16px; }

        .form-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #E8E4F0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          font-family: system-ui;
          height: 100px;
          resize: none;
        }

        .form-textarea:focus { border-color: #1D9E75; }

        .save-btn {
          width: 100%;
          padding: 13px;
          background: #1D9E75;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Arial Black', Arial, sans-serif;
          margin-top: 8px;
        }

        .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

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
          <span className="prof-logo-text">
            GAIN<span style={{ color: '#1D9E75' }}>LINE</span>
          </span>
        </div>
        <button onClick={() => router.push('/dashboard')} className="prof-back">
          ← Back to Dashboard
        </button>
      </nav>

      {/* CONTENT */}
      <div className="prof-content">
        <h1 className="prof-title">My Rugby Profile</h1>
        <p className="prof-subtitle">Fill in your details to build your shareable Rugby CV</p>

        {shareUrl && (
          <div className="share-box">
            <div className="share-box-inner">
              <div className="share-label">Your shareable CV link</div>
              <div className="share-url">{shareUrl}</div>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link copied!') }}
              className="copy-btn">
              Copy Link
            </button>
          </div>
        )}

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
            <textarea
              className="form-textarea"
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Experienced front-row forward with strong set-piece fundamentals..."
            />
          </div>

          <button type="submit" disabled={loading} className="save-btn">
            {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
          </button>

        </form>
      </div>
    </>
  )
}
