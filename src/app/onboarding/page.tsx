'use client'

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

export default function OnboardingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [form, setForm] = useState({
    first_name: '', last_name: '', position_primary: 'HOOKER',
    nationality_primary: '', date_of_birth: '', bio: '', avatar_url: '',
  })

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

  async function saveBasics() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: existing } = await supabase.from('players').select('id').eq('profile_id', user.id).single()
    const payload = {
      profile_id: user.id,
      first_name: form.first_name,
      last_name: form.last_name,
      position_primary: form.position_primary,
      nationality_primary: form.nationality_primary,
      date_of_birth: form.date_of_birth || null,
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
    const { data: player } = await supabase.from('players').select('share_token').eq('profile_id', user.id).single()
    if (player?.share_token) setShareUrl(`${window.location.origin}/cv/${player.share_token}`)
    setSaving(false)
    setStep(4)
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
  const canContinueStep2 = form.first_name && form.last_name && form.nationality_primary && form.date_of_birth

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
        .ob-step-label { font-size: 10px; color: #1D9E75; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 6px; }
        .ob-form-title { font-size: 18px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 4px; }
        .field-label { font-size: 12px; font-weight: 600; color: #0D1B2E; display: block; margin-bottom: 5px; }
        .field-input { width: 100%; padding: 10px 14px; border: 1.5px solid #E8E4F0; border-radius: 8px; font-size: 14px; outline: none; font-family: Arial, sans-serif; color: #0D1B2E; background: white; }
        .field-input:focus { border-color: #1D9E75; }
        .field-input::placeholder { color: #B4B2A9; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .form-field { display: flex; flex-direction: column; gap: 5px; }
        .form-full { margin-bottom: 12px; display: flex; flex-direction: column; gap: 5px; }
        .ob-btn { width: 100%; padding: 12px; background: #1D9E75; color: white; border: none; border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 8px; }
        .ob-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ob-btn-outline { width: 100%; padding: 11px; background: white; color: #0D1B2E; border: 1.5px solid #D3D1C7; border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; margin-top: 8px; }
        .ob-skip { display: block; text-align: center; margin-top: 14px; font-size: 12px; color: #888780; cursor: pointer; background: none; border: none; font-family: Arial, sans-serif; text-decoration: underline; }
        .dots { display: flex; justify-content: center; gap: 6px; margin-top: 16px; }
        .dot { height: 4px; border-radius: 2px; background: #D3D1C7; }
        .dot-active { background: #1D9E75; width: 24px; }
        .dot-inactive { width: 8px; }
        .ob-stats { display: flex; justify-content: center; gap: 24px; margin-bottom: 24px; }
        .ob-stat-val { font-size: 20px; font-weight: 900; color: #1D9E75; font-family: 'Arial Black', Arial, sans-serif; }
        .ob-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .ob-divider { width: 1px; background: rgba(255,255,255,0.1); }
        .ob-photo-box { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: #F8F7F4; border-radius: 10px; border: 0.5px solid #D3D1C7; margin-bottom: 14px; }
        .ob-photo-icon { width: 48px; height: 48px; border-radius: 10px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .ob-photo-icon img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
        .ob-upload-btn { margin-left: auto; height: 30px; padding: 0 14px; border-radius: 20px; border: 1.5px solid #D3D1C7; background: white; font-size: 12px; font-weight: 600; color: #0D1B2E; cursor: pointer; font-family: Arial, sans-serif; flex-shrink: 0; }
        .ob-share-box { background: rgba(255,255,255,0.06); border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .ob-share-url { flex: 1; font-size: 12px; color: rgba(255,255,255,0.5); font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ob-copy-btn { background: #1D9E75; color: white; border: none; border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
        .ob-copy-btn-done { background: #0F6E56; }
        .ob-success-icon { width: 52px; height: 52px; border-radius: 50%; background: rgba(29,158,117,0.15); border: 2px solid #1D9E75; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .ob-go-btn { width: 100%; padding: 12px; background: white; color: #0D1B2E; border: none; border-radius: 20px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; margin-bottom: 10px; }
        .ob-hint { font-size: 11px; color: rgba(255,255,255,0.3); text-align: center; margin-top: 6px; }
        @media (max-width: 480px) {
          .ob-wrap { padding: 24px 16px; }
          .ob-hero { padding: 28px 20px; }
          .ob-form { padding: 22px 18px; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ob-wrap">
        <div className="ob-card">

          {step === 1 && (
            <>
              <div className="ob-hero">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                  <svg width="24" height="22" viewBox="0 0 32 30">
                    <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
                    <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
                    <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
                  </svg>
                  <span style={{ color: 'white', fontWeight: '900', fontSize: '18px', letterSpacing: '-0.5px', fontFamily: 'Arial Black, Arial, sans-serif' }}>GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
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

          {step === 2 && (
            <>
              <div className="ob-form">
                <p className="ob-step-label">STEP 1 OF 3</p>
                <h2 className="ob-form-title">Your basics</h2>
                <p className="ob-sub-dark">This is what coaches see first.</p>
                <div className="form-row">
                  <div className="form-field">
                    <label className="field-label">First name</label>
                    <input className="field-input" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} placeholder="Abonga"/>
                  </div>
                  <div className="form-field">
                    <label className="field-label">Last name</label>
                    <input className="field-input" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} placeholder="Nkwelo"/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label className="field-label">Primary position</label>
                    <select className="field-input" value={form.position_primary} onChange={e => setForm({...form, position_primary: e.target.value})}>
                      {POSITIONS.map(p => <option key={p} value={p}>{pos(p)}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="field-label">Nationality</label>
                    <select className="field-input" value={form.nationality_primary} onChange={e => setForm({...form, nationality_primary: e.target.value})}>
                      <option value="">— Select —</option>
                      {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-full">
                  <label className="field-label">Date of birth</label>
                  <input className="field-input" type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})}/>
                </div>
                <button className="ob-btn" disabled={!canContinueStep2 || saving} onClick={saveBasics}>
                  {saving ? 'Saving...' : 'Continue'}
                  {!saving && <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>}
                </button>
                <button className="ob-btn-outline" onClick={() => setStep(1)}>Back</button>
              </div>
              <div className="dots">
                <div className="dot dot-inactive"></div>
                <div className="dot dot-active"></div>
                <div className="dot dot-inactive"></div>
                <div className="dot dot-inactive"></div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="ob-form">
                <p className="ob-step-label">STEP 2 OF 3</p>
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
                <div className="dot dot-inactive"></div>
                <div className="dot dot-inactive"></div>
                <div className="dot dot-active"></div>
                <div className="dot dot-inactive"></div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="ob-hero">
                <div className="ob-success-icon">
                  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <div className="dot dot-inactive"></div>
                <div className="dot dot-inactive"></div>
                <div className="dot dot-inactive"></div>
                <div className="dot dot-active"></div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}