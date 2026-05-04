'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const orgTypes = [
  'Professional Club',
  'Semi-Professional Club',
  'Amateur Club',
  'National Union',
  'Provincial Union',
  'Academy',
  'School',
  'University',
  'Independent Scout',
  'Agent',
  'Other',
]

export default function CoachRegisterPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    organisation: '',
    org_type: '',
    role_title: '',
    country: '',
  })
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Sign up with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: 'org_user',
          organisation: form.organisation,
          org_type: form.org_type,
          role_title: form.role_title,
          country: form.country,
          approved: true,
        }
      }
    })

  if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', data.user.id)
    }

    // Send notification email
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.full_name,
        email: form.email,
        organisation: form.organisation,
        role: form.role_title,
        country: form.country,
      }),
    })

    setSubmitted(true)
    setLoading(false)

  if (submitted) {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; background: #0D1B2E; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        `}</style>
        <div style={{ background: 'white', borderRadius: '16px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <line x1="2" y1="22" x2="7" y2="8" stroke="#1D9E75" strokeWidth="3.5" strokeLinecap="round" opacity="0.35"/>
              <line x1="11" y1="22" x2="16" y2="2" stroke="#1D9E75" strokeWidth="3.5" strokeLinecap="round" opacity="0.68"/>
              <line x1="20" y1="22" x2="25" y2="0" stroke="#1D9E75" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0D1B2E', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '12px' }}>You're in!</h1>
          <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.7', marginBottom: '28px' }}>Your Gainline coach account is ready. Sign in now to start browsing players.</p>
          <a href="/login" style={{ background: '#1D9E75', color: 'white', fontSize: '13px', fontWeight: '700', padding: '11px 24px', borderRadius: '20px', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}>Sign in now →</a>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0D1B2E; }

        .reg-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .reg-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
          text-decoration: none;
        }

        .reg-logo-text {
          color: white;
          font-weight: 900;
          font-size: 24px;
          letter-spacing: -1px;
          font-family: 'Arial Black', Arial, sans-serif;
        }

        .reg-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 520px;
        }

        .reg-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #E1F5EE;
          border-radius: 20px;
          padding: 4px 12px;
          margin-bottom: 16px;
        }

        .reg-badge span {
          font-size: 11px;
          color: #0F6E56;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .reg-card h1 {
          font-size: 24px;
          font-weight: 900;
          color: #0D1B2E;
          font-family: 'Arial Black', Arial, sans-serif;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .reg-card .subtitle {
          font-size: 13px;
          color: #888780;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }

        .form-field { display: flex; flex-direction: column; gap: 6px; }

        .form-label {
          font-size: 12px;
          font-weight: 700;
          color: #0D1B2E;
          letter-spacing: 0.04em;
        }

        .form-input {
          padding: 10px 14px;
          border: 1.5px solid #E8E4F0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          font-family: Arial, sans-serif;
          color: #0D1B2E;
          background: white;
          width: 100%;
        }

        .form-input:focus { border-color: #1D9E75; }

        .form-full { margin-bottom: 14px; }

        .divider {
          border: none;
          border-top: 1px solid #F1EFE8;
          margin: 20px 0;
        }

        .submit-btn {
          width: 100%;
          padding: 13px;
          background: #1D9E75;
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          font-family: Arial, sans-serif;
          cursor: pointer;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .error-box {
          background: #FCEBEB;
          border: 1px solid #F09595;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 13px;
          color: #A32D2D;
          margin-bottom: 16px;
        }

        .reg-note {
          font-size: 12px;
          color: #B4B2A9;
          text-align: center;
          margin-top: 16px;
          line-height: 1.6;
        }

        @media (max-width: 560px) {
          .reg-card { padding: 28px 20px; border-radius: 12px; }
          .form-row { grid-template-columns: 1fr; }
          .reg-card h1 { font-size: 20px; }
        }
      `}</style>

      <div className="reg-wrap">
        <a href="/" className="reg-logo">
          <svg width="36" height="32" viewBox="0 0 36 32" style={{ display: 'block' }}>
            <line x1="3" y1="30" x2="10" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="15" y1="30" x2="22" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="27" y1="30" x2="34" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="reg-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </a>

        <div className="reg-card">
          <div className="reg-badge">
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1D9E75' }}></div>
            <span>COACHES & RECRUITERS</span>
          </div>
          <h1>Join Gainline</h1>
          <p className="subtitle">Register your details below. All accounts are manually reviewed — you&apos;ll hear from us within 24 hours of submitting.</p>

          <form onSubmit={handleSubmit}>

            {/* Account */}
            <p style={{ fontSize: '11px', color: '#1D9E75', letterSpacing: '0.12em', fontWeight: '700', marginBottom: '12px' }}>YOUR ACCOUNT</p>

            <div className="form-full form-field">
              <label className="form-label">FULL NAME</label>
              <input className="form-input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required placeholder="Jane Smith" />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">EMAIL</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="jane@club.com" />
              </div>
              <div className="form-field">
                <label className="form-label">PASSWORD</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Min 8 characters" minLength={8} />
              </div>
            </div>

            <hr className="divider" />

            {/* Organisation */}
            <p style={{ fontSize: '11px', color: '#1D9E75', letterSpacing: '0.12em', fontWeight: '700', marginBottom: '12px' }}>YOUR ORGANISATION</p>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">ORGANISATION NAME</label>
                <input className="form-input" value={form.organisation} onChange={e => setForm({ ...form, organisation: e.target.value })} required placeholder="e.g. Bristol Bears" />
              </div>
              <div className="form-field">
                <label className="form-label">ORGANISATION TYPE</label>
                <select className="form-input" value={form.org_type} onChange={e => setForm({ ...form, org_type: e.target.value })} required>
                  <option value="">Select type</option>
                  {orgTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">YOUR ROLE / TITLE</label>
                <input className="form-input" value={form.role_title} onChange={e => setForm({ ...form, role_title: e.target.value })} required placeholder="e.g. Head of Recruitment" />
              </div>
              <div className="form-field">
                <label className="form-label">COUNTRY</label>
                <input className="form-input" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required placeholder="e.g. United Kingdom" />
              </div>
            </div>

            {message && <div className="error-box">{message}</div>}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Registering...' : (
                <>
                  Register
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                </>
              )}
            </button>

          </form>

          <p className="reg-note">
            This registration is by invitation only. If you received this link in error, please disregard it.<br/>
            Already approved? <a href="/login" style={{ color: '#1D9E75' }}>Sign in here</a>
          </p>
        </div>
      </div>
    </>
  )
}

