'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

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

const EMPTY_FORM = {
  club_name: '',
  positions: [] as string[],
  season: '',
  level: '',
  country: '',
  eligibility_notes: '',
  offer_details: '',
  contact_info: '',
  closing_date: '',
  is_active: true,
}

function PostVacancyForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [coachId, setCoachId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('is_coach, role').eq('id', user.id).single()
    if (!prof?.is_coach && prof?.role !== 'org_user') { router.push('/dashboard'); return }

    const { data: coach } = await supabase.from('coaches').select('id, organisation').eq('user_id', user.id).single()
    if (!coach) { router.push('/dashboard'); return }

    setCoachId(coach.id)
    const org = coach.organisation || ''
    setOrgName(org)

    if (editId) {
      const { data: v } = await supabase.from('vacancies').select('*').eq('id', editId).eq('coach_id', coach.id).single()
      if (v) {
        setForm({
          club_name: v.club_name || '',
          positions: v.positions || [],
          season: v.season || '',
          level: v.level || '',
          country: v.country || '',
          eligibility_notes: v.eligibility_notes || '',
          offer_details: v.offer_details || '',
          contact_info: v.contact_info || '',
          closing_date: v.closing_date || '',
          is_active: v.is_active,
        })
      }
    } else {
      setForm(f => ({ ...f, club_name: org }))
    }

    setLoading(false)
  }

  function togglePosition(p: string) {
    setForm(f => ({
      ...f,
      positions: f.positions.includes(p) ? f.positions.filter(x => x !== p) : [...f.positions, p],
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!coachId) return
    setSaving(true)
    setSaveError('')

    const payload = {
      coach_id: coachId,
      club_name: form.club_name,
      positions: form.positions,
      season: form.season || null,
      level: form.level || null,
      country: form.country || null,
      eligibility_notes: form.eligibility_notes || null,
      offer_details: form.offer_details || null,
      contact_info: form.contact_info || null,
      closing_date: form.closing_date || null,
      is_active: form.is_active,
    }

    let dbError = null
    if (editId) {
      const { error } = await supabase.from('vacancies').update(payload).eq('id', editId)
      dbError = error
    } else {
      const { error } = await supabase.from('vacancies').insert(payload)
      dbError = error
    }

    if (dbError) {
      setSaveError('Something went wrong saving your vacancy. Please try again.')
      setSaving(false)
      return
    }

    router.push('/dashboard/coach/vacancies')
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'Arial', color: '#888780', fontSize: '14px' }}>Loading...</span>
    </div>
  )

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0C0F16; color: #F0EDE4; }
        .page { max-width: 720px; margin: 0 auto; padding: 32px 20px 60px; }
        .page-label { font-size: 10px; color: #2ec97e; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 6px; }
        .page-title { font-size: 22px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 24px; }
        .form-card { background: #161C2A; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.07); padding: 24px; margin-bottom: 12px; }
        .form-section-label { font-size: 11px; color: #2ec97e; letter-spacing: 0.12em; font-weight: 700; margin-bottom: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 11px; font-weight: 700; color: #888780; letter-spacing: 0.08em; text-transform: uppercase; }
        .form-input { padding: 9px 12px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 13px; color: #F0EDE4; background: #1C2338; outline: none; font-family: Arial, sans-serif; width: 100%; }
        .form-input:focus { border-color: #2ec97e; }
        .form-input::placeholder { color: #5F5E5A; }
        .form-select { padding: 9px 12px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 13px; color: #F0EDE4; background: #1C2338; outline: none; font-family: Arial, sans-serif; width: 100%; cursor: pointer; }
        .form-select:focus { border-color: #2ec97e; }
        .form-textarea { padding: 9px 12px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 13px; color: #F0EDE4; background: #1C2338; outline: none; font-family: Arial, sans-serif; width: 100%; resize: vertical; min-height: 80px; }
        .form-textarea:focus { border-color: #2ec97e; }
        .pos-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
        .pos-option { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 7px 10px; border-radius: 6px; border: 1.5px solid rgba(255,255,255,0.07); background: #1C2338; transition: border-color 0.1s; }
        .pos-option-active { border-color: #2ec97e; background: rgba(29,158,117,0.1); }
        .pos-option span { font-size: 12px; color: #A8A398; pointer-events: none; }
        .pos-option-active span { color: #F0EDE4; }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; }
        .toggle-label { font-size: 13px; color: #F0EDE4; font-weight: 700; }
        .toggle-sub { font-size: 11px; color: #888780; margin-top: 2px; }
        .toggle-switch { position: relative; width: 40px; height: 22px; flex-shrink: 0; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; inset: 0; background: #2A3347; border-radius: 22px; cursor: pointer; transition: background 0.2s; }
        .toggle-slider:before { content: ''; position: absolute; width: 16px; height: 16px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: transform 0.2s; }
        .toggle-switch input:checked + .toggle-slider { background: #2ec97e; }
        .toggle-switch input:checked + .toggle-slider:before { transform: translateX(18px); }
        .save-btn { width: 100%; padding: 12px; background: #D4A843; color: #0C0F16; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; font-family: Arial, sans-serif; cursor: pointer; margin-top: 4px; }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cancel-btn { display: block; width: 100%; padding: 11px; background: transparent; color: #888780; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 10px; font-size: 13px; font-weight: 700; font-family: Arial, sans-serif; cursor: pointer; margin-top: 8px; text-align: center; text-decoration: none; }
        @media (min-width: 640px) {
          .page { padding: 40px 28px 80px; }
          .pos-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <div className="page">
        <p className="page-label">COACH PORTAL</p>
        <h1 className="page-title">{editId ? 'Edit vacancy' : 'Post a vacancy'}</h1>

        <form onSubmit={handleSave}>
          <div className="form-card">
            <p className="form-section-label">THE ROLE</p>
            <div className="form-row" style={{ marginBottom: '14px' }}>
              <div className="form-field">
                <label className="form-label">Club name</label>
                <input className="form-input" value={form.club_name} onChange={e => setForm(f => ({ ...f, club_name: e.target.value }))} required placeholder="e.g. Harpenden RFC" />
              </div>
              <div className="form-field">
                <label className="form-label">Season</label>
                <input className="form-input" value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))} placeholder="e.g. 2026/27" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Level</label>
                <input className="form-input" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} placeholder="e.g. National 2" />
              </div>
              <div className="form-field">
                <label className="form-label">Country</label>
                <select className="form-select" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="form-card">
            <p className="form-section-label">POSITIONS WANTED</p>
            <div className="pos-grid">
              {POSITIONS.map(p => (
                <label key={p} className={`pos-option ${form.positions.includes(p) ? 'pos-option-active' : ''}`}>
                  <input type="checkbox" checked={form.positions.includes(p)} onChange={() => togglePosition(p)} style={{ display: 'none' }} />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-card">
            <p className="form-section-label">DETAILS</p>
            <div className="form-field" style={{ marginBottom: '14px' }}>
              <label className="form-label">What&apos;s on offer</label>
              <textarea className="form-textarea" value={form.offer_details} onChange={e => setForm(f => ({ ...f, offer_details: e.target.value }))} placeholder="e.g. Paid contract, accommodation provided, return flights..." />
            </div>
            <div className="form-field" style={{ marginBottom: '14px' }}>
              <label className="form-label">
                Eligibility / passport requirements{' '}
                <span style={{ color: '#5F5E5A', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea className="form-textarea" value={form.eligibility_notes} onChange={e => setForm(f => ({ ...f, eligibility_notes: e.target.value }))} placeholder="e.g. Must hold EU or UK passport" style={{ minHeight: '60px' }} />
            </div>
            <div className="form-field" style={{ marginBottom: '14px' }}>
              <label className="form-label">Contact info</label>
              <input className="form-input" value={form.contact_info} onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))} placeholder="e.g. recruitment@club.com or WhatsApp number" />
            </div>
            <div className="form-field">
              <label className="form-label">
                Closing date{' '}
                <span style={{ color: '#5F5E5A', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input type="date" className="form-input" value={form.closing_date} onChange={e => setForm(f => ({ ...f, closing_date: e.target.value }))} style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div className="form-card" style={{ marginBottom: '16px' }}>
            <div className="toggle-row">
              <div>
                <div className="toggle-label">Published</div>
                <div className="toggle-sub">Visible on the public vacancies page</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {saveError && (
            <div style={{ background: 'rgba(220,53,53,0.12)', border: '1px solid rgba(220,53,53,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#F08080', marginBottom: '12px' }}>
              {saveError}
            </div>
          )}

          <button type="submit" disabled={saving} className="save-btn">
            {saving ? 'Saving...' : (editId ? 'Update vacancy' : 'Post vacancy')}
          </button>
          <a href="/dashboard/coach/vacancies" className="cancel-btn">Cancel</a>
        </form>
      </div>
    </>
  )
}

export default function PostVacancyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Arial', color: '#888780', fontSize: '14px' }}>Loading...</span>
      </div>
    }>
      <PostVacancyForm />
    </Suspense>
  )
}
