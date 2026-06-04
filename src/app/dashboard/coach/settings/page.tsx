'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CoachSettingsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [email, setEmail] = useState('')
  const [notifyApplications, setNotifyApplications] = useState(true)
  const [notifyMatches, setNotifyMatches] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: prof } = await supabase.from('profiles').select('is_coach, role').eq('id', user.id).single()
    if (!prof?.is_coach && prof?.role !== 'org_user') { router.push('/dashboard'); return }

    setEmail(user.email || '')

    // Load notification prefs separately — columns may not exist yet, default to true
    const { data: prefs } = await supabase.from('profiles').select('notify_applications, notify_vacancy_matches').eq('id', user.id).single()
    setNotifyApplications(prefs?.notify_applications ?? true)
    setNotifyMatches(prefs?.notify_vacancy_matches ?? true)
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      notify_applications: notifyApplications,
      notify_vacancy_matches: notifyMatches,
    }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
        .page { max-width: 600px; margin: 0 auto; padding: 32px 20px 60px; }
        .page-label { font-size: 10px; color: #2ec97e; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 4px; }
        .page-title { font-size: 22px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 24px; }
        .section { background: #161C2A; border-radius: 12px; border: 0.5px solid rgba(255,255,255,0.07); padding: 24px; margin-bottom: 12px; }
        .section-label { font-size: 11px; color: #2ec97e; letter-spacing: 0.12em; font-weight: 700; margin-bottom: 16px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 11px; font-weight: 700; color: #888780; letter-spacing: 0.08em; text-transform: uppercase; }
        .field-value { padding: 9px 12px; border: 1.5px solid rgba(255,255,255,0.07); border-radius: 8px; font-size: 13px; color: #5F5E5A; background: #12161F; font-family: Arial, sans-serif; }
        .field-hint { font-size: 11px; color: #5A564F; margin-top: 4px; }
        .field-hint a { color: #5DCAA5; text-decoration: none; }
        .field-hint a:hover { text-decoration: underline; }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 0.5px solid rgba(255,255,255,0.06); }
        .toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
        .toggle-row:first-child { padding-top: 0; }
        .toggle-info { flex: 1; }
        .toggle-title { font-size: 13px; color: #F0EDE4; font-weight: 700; margin-bottom: 2px; }
        .toggle-sub { font-size: 11px; color: #888780; }
        .toggle-switch { position: relative; width: 40px; height: 22px; flex-shrink: 0; margin-left: 16px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; inset: 0; background: #2A3347; border-radius: 22px; cursor: pointer; transition: background 0.2s; }
        .toggle-slider:before { content: ''; position: absolute; width: 16px; height: 16px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: transform 0.2s; }
        .toggle-switch input:checked + .toggle-slider { background: #2ec97e; }
        .toggle-switch input:checked + .toggle-slider:before { transform: translateX(18px); }
        .save-btn { padding: 11px 28px; background: #D4A843; color: #0C0F16; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; font-family: Arial, sans-serif; cursor: pointer; }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .success-msg { background: rgba(29,158,117,0.12); border: 1px solid rgba(29,158,117,0.3); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #5DCAA5; margin-bottom: 16px; }
        @media (min-width: 640px) {
          .page { padding: 40px 28px 80px; }
        }
      `}</style>

      <div className="page">
        <p className="page-label">COACH PORTAL</p>
        <h1 className="page-title">Settings</h1>

        {saved && <div className="success-msg">Settings saved.</div>}

        {/* Account */}
        <div className="section">
          <p className="section-label">ACCOUNT</p>
          <div className="field">
            <label className="field-label">Email address</label>
            <div className="field-value">{email}</div>
            <p className="field-hint">
              To change your email or password, visit{' '}
              <a href="/dashboard/settings">account settings →</a>
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="section">
          <p className="section-label">NOTIFICATIONS</p>
          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-title">New applications</div>
              <div className="toggle-sub">Email me when a player applies to one of my vacancies</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={notifyApplications} onChange={e => setNotifyApplications(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-title">Player matches</div>
              <div className="toggle-sub">Email me when a player matches one of my open vacancies</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={notifyMatches} onChange={e => setNotifyMatches(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </>
  )
}
