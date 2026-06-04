'use client'
import Image from 'next/image'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const POSITIONS = [
  'LOOSEHEAD_PROP','HOOKER','TIGHTHEAD_PROP','LEFT_LOCK','RIGHT_LOCK',
  'BLINDSIDE_FLANKER','OPENSIDE_FLANKER','NUMBER_8','SCRUMHALF','FLYHALF',
  'LEFT_WING','INSIDE_CENTRE','OUTSIDE_CENTRE','RIGHT_WING','FULLBACK'
]

const NATIONALITIES = [
  'Afghan','Albanian','Algerian','American','Argentinian','Australian','Austrian',
  'Belgian','Bolivian','Brazilian','British','Bulgarian','Cameroonian','Canadian',
  'Chilean','Chinese','Colombian','Congolese','Croatian','Czech','Danish','Dutch',
  'Egyptian','English','Estonian','Fijian','Finnish','French','Georgian','German',
  'Ghanaian','Greek','Hungarian','Indian','Irish','Italian','Ivorian','Japanese',
  'Kenyan','Korean','Latvian','Lithuanian','Malagasy','Malaysian','Namibian',
  'New Zealander','Nigerian','Norwegian','Pakistani','Paraguayan','Polish',
  'Portuguese','Romanian','Russian','Rwandan','Samoan','Scottish','Senegalese',
  'Serbian','Slovak','South African','Spanish','Swedish','Swiss','Tongan',
  'Ugandan','Ukrainian','Uruguayan','Welsh','Zimbabwean'
]

function getAge(dob: string): number | null {
  if (!dob) return null
  return Math.floor((new Date().getTime() - new Date(dob).getTime()) / 31557600000)
}

export default function OnboardingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [welcomeEmailSent, setWelcomeEmailSent] = useState(false)

  const [form, setForm] = useState({
    first_name: '', last_name: '', position_primary: 'HOOKER',
    nationality_primary: '', date_of_birth: '', bio: '', avatar_url: '',
    height_cm: '', weight_kg: '',
  })

  // Track which fields have been interacted with (for inline error display)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data: player } = await supabase.from('players').select('share_token').eq('profile_id', user.id).single()
      if (player?.share_token) setShareUrl(`${window.location.origin}/cv/${player.share_token}`)
    }
    init()
  }, [])

  // ── Field-level validators ────────────────────────────────────────────────

  function getFieldError(field: string): string | null {
    if (!touched[field]) return null
    switch (field) {
      case 'first_name':
        return !form.first_name.trim() ? 'Required to continue' : null
      case 'last_name':
        return !form.last_name.trim() ? 'Required to continue' : null
      case 'nationality_primary':
        return !form.nationality_primary ? 'Required to continue' : null
      case 'date_of_birth': {
        if (!form.date_of_birth) return 'Required to continue'
        const age = getAge(form.date_of_birth)
        if (age === null || age < 14) return 'Player must be at least 14 years old'
        return null
      }
      case 'height_cm': {
        if (!form.height_cm) return 'Required to continue'
        const h = Number(form.height_cm)
        if (isNaN(h) || h < 140 || h > 220) return 'Please enter a valid value (140–220 cm)'
        return null
      }
      case 'weight_kg': {
        if (!form.weight_kg) return 'Required to continue'
        const w = Number(form.weight_kg)
        if (isNaN(w) || w < 50 || w > 180) return 'Please enter a valid value (50–180 kg)'
        return null
      }
      default:
        return null
    }
  }

  function touch(field: string) {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  function touchAll() {
    setTouched({
      first_name: true, last_name: true, nationality_primary: true,
      date_of_birth: true, height_cm: true, weight_kg: true,
    })
  }

  // ── Can-continue check ────────────────────────────────────────────────────

  const step2Valid = (() => {
    if (!form.first_name.trim() || !form.last_name.trim()) return false
    if (!form.nationality_primary) return false
    if (!form.date_of_birth) return false
    const age = getAge(form.date_of_birth)
    if (age === null || age < 14) return false
    if (!form.height_cm) return false
    const h = Number(form.height_cm)
    if (isNaN(h) || h < 140 || h > 220) return false
    if (!form.weight_kg) return false
    const w = Number(form.weight_kg)
    if (isNaN(w) || w < 50 || w > 180) return false
    return true
  })()

  // ── Save functions ────────────────────────────────────────────────────────

  async function saveBasics() {
    touchAll()
    if (!step2Valid) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: existing } = await supabase.from('players').select('id').eq('profile_id', user.id).single()
    const payload = {
      profile_id: user.id,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      position_primary: form.position_primary,
      nationality_primary: form.nationality_primary,
      date_of_birth: form.date_of_birth || null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      profile_visibility: 'PUBLIC',
    }
    let result
    if (existing) {
      result = await supabase.from('players').update(payload).eq('profile_id', user.id).select().single()
    } else {
      result = await supabase.from('players').insert(payload).select().single()
    }
    if (result?.data?.share_token) setShareUrl(`${window.location.origin}/cv/${result.data.share_token}`)
    setSaving(false)
    setStep(3)
  }

  async function saveProfile() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('players').update({
      bio: form.bio || null,
      avatar_url: form.avatar_url || null,
    }).eq('profile_id', user.id)
    const { data: player } = await supabase.from('players').select('id, share_token').eq('profile_id', user.id).single()
    if (player?.share_token) setShareUrl(`${window.location.origin}/cv/${player.share_token}`)
    setSaving(false)
    setStep(4)
    // Fire-and-forget welcome email (once only)
    if (player?.id && !welcomeEmailSent) {
      setWelcomeEmailSent(true)
      fetch('/api/send-welcome-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: player.id }),
      }).catch(() => {/* silent */})
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return }
    setAvatarUploading(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar.${fileExt}`
    const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
    if (error) { alert('Upload failed'); setAvatarUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
    setForm(prev => ({ ...prev, avatar_url: publicUrl }))
    setAvatarUploading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pos = (s: string) => s.replace(/_/g, ' ')

  // ── Icons ─────────────────────────────────────────────────────────────────

  const LockIcon = () => (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
      <rect x="3" y="7" width="10" height="8" rx="1.5"/>
      <path d="M5 7V5a3 3 0 0 1 6 0v2"/>
    </svg>
  )

  const CheckIcon = () => (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#2ec97e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
      <path d="M3 8l3.5 3.5L13 4"/>
    </svg>
  )

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F1EFE8; min-height: 100vh; }
        .ob-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
        .ob-card { width: 100%; max-width: 460px; }
        .ob-hero { background: #0D1B2E; border-radius: 16px; padding: 36px 32px; color: white; }
        .ob-form { background: white; border-radius: 16px; border: 0.5px solid #D3D1C7; padding: 28px; }
        .ob-label { font-size: 10px; color: #5DCAA5; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 8px; }
        .ob-title { font-size: 22px; font-weight: 900; margin-bottom: 8px; font-family: 'Arial Black', Arial, sans-serif; }
        .ob-sub { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.6; margin-bottom: 24px; }
        .ob-sub-dark { font-size: 13px; color: #888780; line-height: 1.6; margin-bottom: 20px; }
        .ob-step-label { font-size: 10px; color: #2ec97e; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
        .ob-form-title { font-size: 18px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 4px; }
        .field-label { font-size: 12px; font-weight: 600; color: #0D1B2E; display: block; margin-bottom: 5px; }
        .field-input { width: 100%; padding: 10px 14px; border: 1.5px solid #E8E4F0; border-radius: 8px; font-size: 14px; outline: none; font-family: Arial, sans-serif; color: #0D1B2E; background: white; }
        .field-input:focus { border-color: #2ec97e; }
        .field-input::placeholder { color: #B4B2A9; }
        .field-input-error { border-color: #e05252 !important; }
        .field-error { font-size: 11px; color: #e05252; margin-top: 4px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .form-field { display: flex; flex-direction: column; gap: 0; }
        .form-full { margin-bottom: 12px; display: flex; flex-direction: column; gap: 0; }
        .ob-btn { width: 100%; padding: 12px; background: #2ec97e; color: white; border: none; border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 8px; transition: opacity 0.15s; }
        .ob-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .ob-btn-outline { width: 100%; padding: 11px; background: white; color: #0D1B2E; border: 1.5px solid #D3D1C7; border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; margin-top: 8px; }
        .ob-skip { display: block; text-align: center; margin-top: 14px; font-size: 12px; color: #888780; cursor: pointer; background: none; border: none; font-family: Arial, sans-serif; text-decoration: underline; }
        .dots { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 16px; }
        .dot { height: 4px; border-radius: 2px; background: #D3D1C7; }
        .dot-active { background: #2ec97e; width: 24px; }
        .dot-done { background: #2ec97e; width: 8px; opacity: 0.5; }
        .dot-inactive { width: 8px; }
        .ob-stats { display: flex; justify-content: center; gap: 24px; margin-bottom: 24px; }
        .ob-stat-val { font-size: 20px; font-weight: 900; color: #2ec97e; font-family: 'Arial Black', Arial, sans-serif; }
        .ob-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .ob-divider { width: 1px; background: rgba(255,255,255,0.1); }
        .ob-photo-box { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: #F8F7F4; border-radius: 10px; border: 0.5px solid #D3D1C7; margin-bottom: 14px; }
        .ob-photo-icon { width: 48px; height: 48px; border-radius: 10px; background: #2ec97e; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .ob-photo-icon img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
        .ob-upload-btn { margin-left: auto; height: 30px; padding: 0 14px; border-radius: 20px; border: 1.5px solid #D3D1C7; background: white; font-size: 12px; font-weight: 600; color: #0D1B2E; cursor: pointer; font-family: Arial, sans-serif; flex-shrink: 0; }
        .ob-share-box { background: rgba(255,255,255,0.06); border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .ob-share-url { flex: 1; font-size: 12px; color: rgba(255,255,255,0.5); font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ob-copy-btn { background: #2ec97e; color: white; border: none; border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
        .ob-copy-btn-done { background: #0F6E56; }
        .ob-success-icon { width: 52px; height: 52px; border-radius: 50%; background: rgba(29,158,117,0.15); border: 2px solid #2ec97e; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .ob-go-btn { width: 100%; padding: 12px; background: white; color: #0D1B2E; border: none; border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; margin-bottom: 10px; }
        .ob-hint { font-size: 11px; color: rgba(255,255,255,0.3); text-align: center; margin-top: 6px; }
        .ob-required-note { font-size: 11px; color: #888780; margin-bottom: 16px; }
        @media (max-width: 480px) {
          .ob-wrap { padding: 24px 16px; }
          .ob-hero { padding: 28px 20px; }
          .ob-form { padding: 22px 18px; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ob-wrap">
        <div className="ob-card">

          {/* ── Step 1: Welcome ─────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="ob-hero">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                  <Image src="/gainline-logo-final.svg" alt="Gainline" width={160} height={48} priority />
                </div>
                <p className="ob-label">WELCOME</p>
                <h1 className="ob-title" style={{ color: 'white' }}>Your profile is your passport to the game.</h1>
                <p className="ob-sub">It only takes 2 minutes. Coaches are already browsing Gainline — let's make sure they can find you.</p>
                <div className="ob-stats">
                  <div style={{ textAlign: 'center' }}>
                    <div className="ob-stat-val">2 min</div>
                    <div className="ob-stat-lbl">to complete</div>
                  </div>
                  <div className="ob-divider"></div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="ob-stat-val">3</div>
                    <div className="ob-stat-lbl">quick steps</div>
                  </div>
                  <div className="ob-divider"></div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="ob-stat-val">Free</div>
                    <div className="ob-stat-lbl">always</div>
                  </div>
                </div>
                <button className="ob-btn" onClick={() => setStep(2)}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                  Let's build your profile
                </button>
                <button className="ob-skip" onClick={() => router.push('/dashboard')}>Skip for now</button>
              </div>
              <div className="dots">
                <div className="dot dot-active"></div>
                <div className="dot dot-inactive"></div>
                <div className="dot dot-inactive"></div>
                <div className="dot dot-inactive"></div>
              </div>
            </>
          )}

          {/* ── Step 2: Your basics (mandatory) ─────────────────────────── */}
          {step === 2 && (
            <>
              <div className="ob-form">
                <div className="ob-step-label">
                  <LockIcon />
                  STEP 1 OF 3 · REQUIRED
                </div>
                <h2 className="ob-form-title">Your basics</h2>
                <p className="ob-sub-dark" style={{ marginBottom: '4px' }}>This is what coaches see first.</p>
                <p className="ob-required-note">All fields on this step are required.</p>

                {/* Name row */}
                <div className="form-row">
                  <div className="form-field">
                    <label className="field-label">First name</label>
                    <input
                      className={`field-input${getFieldError('first_name') ? ' field-input-error' : ''}`}
                      value={form.first_name}
                      onChange={e => setForm({...form, first_name: e.target.value})}
                      onBlur={() => touch('first_name')}
                      placeholder="Abonga"
                    />
                    {getFieldError('first_name') && <span className="field-error">{getFieldError('first_name')}</span>}
                  </div>
                  <div className="form-field">
                    <label className="field-label">Last name</label>
                    <input
                      className={`field-input${getFieldError('last_name') ? ' field-input-error' : ''}`}
                      value={form.last_name}
                      onChange={e => setForm({...form, last_name: e.target.value})}
                      onBlur={() => touch('last_name')}
                      placeholder="Nkwelo"
                    />
                    {getFieldError('last_name') && <span className="field-error">{getFieldError('last_name')}</span>}
                  </div>
                </div>

                {/* Position + Nationality row */}
                <div className="form-row">
                  <div className="form-field">
                    <label className="field-label">Primary position</label>
                    <select
                      className="field-input"
                      value={form.position_primary}
                      onChange={e => setForm({...form, position_primary: e.target.value})}
                    >
                      {POSITIONS.map(p => <option key={p} value={p}>{pos(p)}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="field-label">Nationality</label>
                    <select
                      className={`field-input${getFieldError('nationality_primary') ? ' field-input-error' : ''}`}
                      value={form.nationality_primary}
                      onChange={e => setForm({...form, nationality_primary: e.target.value})}
                      onBlur={() => touch('nationality_primary')}
                    >
                      <option value="">— Select —</option>
                      {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    {getFieldError('nationality_primary') && <span className="field-error">{getFieldError('nationality_primary')}</span>}
                  </div>
                </div>

                {/* Date of birth */}
                <div className="form-full" style={{ marginBottom: '12px' }}>
                  <label className="field-label">Date of birth</label>
                  <input
                    className={`field-input${getFieldError('date_of_birth') ? ' field-input-error' : ''}`}
                    type="date"
                    value={form.date_of_birth}
                    onChange={e => setForm({...form, date_of_birth: e.target.value})}
                    onBlur={() => touch('date_of_birth')}
                  />
                  {getFieldError('date_of_birth') && <span className="field-error">{getFieldError('date_of_birth')}</span>}
                </div>

                {/* Height + Weight row */}
                <div className="form-row">
                  <div className="form-field">
                    <label className="field-label">Height (cm)</label>
                    <input
                      className={`field-input${getFieldError('height_cm') ? ' field-input-error' : ''}`}
                      type="number"
                      value={form.height_cm}
                      onChange={e => setForm({...form, height_cm: e.target.value})}
                      onBlur={() => touch('height_cm')}
                      placeholder="e.g. 183"
                      min={140} max={220}
                    />
                    {getFieldError('height_cm') && <span className="field-error">{getFieldError('height_cm')}</span>}
                  </div>
                  <div className="form-field">
                    <label className="field-label">Weight (kg)</label>
                    <input
                      className={`field-input${getFieldError('weight_kg') ? ' field-input-error' : ''}`}
                      type="number"
                      value={form.weight_kg}
                      onChange={e => setForm({...form, weight_kg: e.target.value})}
                      onBlur={() => touch('weight_kg')}
                      placeholder="e.g. 92"
                      min={50} max={180}
                    />
                    {getFieldError('weight_kg') && <span className="field-error">{getFieldError('weight_kg')}</span>}
                  </div>
                </div>

                <button
                  className="ob-btn"
                  disabled={saving}
                  onClick={saveBasics}
                  style={{ opacity: step2Valid ? 1 : 0.45 }}
                >
                  {saving ? 'Saving...' : 'Continue'}
                  {!saving && <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>}
                </button>
                <button className="ob-btn-outline" onClick={() => setStep(1)}>Back</button>
              </div>
              <div className="dots">
                <div className="dot dot-done"></div>
                <div className="dot dot-active"></div>
                <div className="dot dot-inactive"></div>
                <div className="dot dot-inactive"></div>
              </div>
            </>
          )}

          {/* ── Step 3: Profile photo + bio (optional) ───────────────────── */}
          {step === 3 && (
            <>
              <div className="ob-form">
                <div className="ob-step-label">STEP 2 OF 3</div>
                <h2 className="ob-form-title">Your profile</h2>
                <p className="ob-sub-dark">Profiles with a photo get 3× more views from coaches.</p>
                <div className="ob-photo-box">
                  <div className="ob-photo-icon">
                    {form.avatar_url
                      ? <img src={form.avatar_url} alt="Profile" />
                      : <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="14" height="10" rx="2"/><circle cx="8" cy="8" r="2.5"/><circle cx="12" cy="5" r="0.5" fill="white"/></svg>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0D1B2E', marginBottom: '2px' }}>
                      {form.avatar_url ? 'Photo added!' : 'Add a profile photo'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888780' }}>JPG or PNG, max 5MB</div>
                  </div>
                  <label className="ob-upload-btn" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    {avatarUploading ? 'Uploading...' : form.avatar_url ? 'Change' : 'Upload'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div className="form-full">
                  <label className="field-label">
                    Bio <span style={{ fontWeight: '400', color: '#888780' }}>— optional but recommended</span>
                  </label>
                  <textarea
                    className="field-input"
                    style={{ height: '90px', resize: 'none' }}
                    placeholder="Strong running centre with a great read for the game..."
                    value={form.bio}
                    onChange={e => setForm({...form, bio: e.target.value})}
                  />
                </div>
                <button className="ob-btn" disabled={saving} onClick={saveProfile}>
                  {saving ? 'Saving...' : 'Continue'}
                  {!saving && <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>}
                </button>
                <button className="ob-btn-outline" onClick={() => setStep(2)}>Back</button>
              </div>
              <div className="dots">
                <div className="dot dot-done"></div>
                <div className="dot dot-done"></div>
                <div className="dot dot-active"></div>
                <div className="dot dot-inactive"></div>
              </div>
            </>
          )}

          {/* ── Step 4: Success ──────────────────────────────────────────── */}
          {step === 4 && (
            <>
              <div className="ob-hero">
                <div className="ob-success-icon">
                  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="#2ec97e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8l3 3 7-7"/>
                  </svg>
                </div>
                <p className="ob-label" style={{ textAlign: 'center' }}>STEP 3 OF 3</p>
                <h2 className="ob-title" style={{ color: 'white', textAlign: 'center', marginBottom: '8px' }}>Your profile is live!</h2>
                <p className="ob-sub" style={{ textAlign: 'center' }}>Share your link with clubs, coaches and agents. The more people who see it, the better your chances.</p>
                {shareUrl && (
                  <div className="ob-share-box">
                    <div className="ob-share-url">{shareUrl}</div>
                    <button className={`ob-copy-btn ${copied ? 'ob-copy-btn-done' : ''}`} onClick={copyLink}>
                      {copied ? 'Copied!' : 'Copy link'}
                    </button>
                  </div>
                )}
                <button className="ob-go-btn" onClick={() => router.push('/dashboard')}>
                  Go to my dashboard
                </button>
                <p className="ob-hint">You can always add more to your profile later.</p>
              </div>
              <div className="dots">
                <div className="dot dot-done"></div>
                <div className="dot dot-done"></div>
                <div className="dot dot-done"></div>
                <div className="dot dot-active"></div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}
