'use client'
import Image from 'next/image'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()

  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState('')
  const [emailError, setEmailError] = useState('')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    setEmailLoading(true)
    setEmailError('')
    setEmailSuccess('')

    const { error } = await supabase.auth.updateUser({ email: newEmail })

    if (error) {
      setEmailError(error.message)
    } else {
      setEmailSuccess('Confirmation email sent to ' + newEmail + '. Check your inbox to confirm the change.')
      setNewEmail('')
    }
    setEmailLoading(false)
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      setPasswordLoading(false)
      return
    }

    // Re-authenticate with current password first
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setPasswordError('Could not verify your account. Please sign out and back in.')
      setPasswordLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      setPasswordError('Current password is incorrect.')
      setPasswordLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordLoading(false)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', Arial, sans-serif; background: #0C0F16; color: #F0EDE4; }
        .settings-nav { background: #111520; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .settings-logo { display: flex; align-items: center; gap: 8px; }
        .settings-logo-text { color: white; font-weight: 900; font-size: 18px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .settings-back { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 6px; transition: color 0.15s; }
        .settings-back:hover { color: #F0EDE4; }
        .settings-content { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
        .settings-eyebrow { font-size: 10px; color: #5A564F; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
        .settings-title { font-family: 'Bebas Neue', 'Arial Black', Arial, sans-serif; font-size: 32px; color: #fff; letter-spacing: 0.5px; margin-bottom: 4px; }
        .settings-sub { font-size: 13px; color: #5A564F; margin-bottom: 32px; }
        .settings-card { background: #161C2A; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 24px; margin-bottom: 16px; }
        .settings-card-title { font-size: 13px; font-weight: 500; color: #F0EDE4; margin-bottom: 4px; }
        .settings-card-sub { font-size: 12px; color: #5A564F; margin-bottom: 20px; line-height: 1.5; }
        .form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .form-field:last-of-type { margin-bottom: 0; }
        .form-label { font-size: 12px; font-weight: 500; color: #A8A398; }
        .form-input { width: 100%; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; background: #1C2338; color: #F0EDE4; outline: none; transition: border-color 0.15s; }
        .form-input:focus { border-color: rgba(212,168,67,0.4); }
        .form-input::placeholder { color: #3A362F; }
        .save-btn { width: 100%; padding: 11px; background: #D4A843; color: #0C0F16; border: none; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 18px; transition: opacity 0.15s; }
        .save-btn:hover { opacity: 0.88; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .alert { padding: 10px 14px; border-radius: 8px; font-size: 12px; margin-top: 14px; line-height: 1.5; }
        .alert-success { background: rgba(61,190,114,0.1); border: 1px solid rgba(61,190,114,0.2); color: #3DBE72; }
        .alert-error { background: rgba(224,82,82,0.1); border: 1px solid rgba(224,82,82,0.2); color: #E05252; }
        .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 6px 0 20px; }
        .section-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(212,168,67,0.1); border: 1px solid rgba(212,168,67,0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
      `}</style>

      <nav className="settings-nav">
        <div className="settings-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/gainline-logo-final.png" alt="Gainline" width={160} height={48} priority />
        </div>
        <button className="settings-back" onClick={() => router.back()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2.5L4.5 7L9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </nav>

      <div className="settings-content">
        <div className="settings-eyebrow">Account</div>
        <div className="settings-title">Settings</div>
        <div className="settings-sub">Manage your email address and password.</div>

        {/* Email change */}
        <div className="settings-card">
          <div className="section-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="8" rx="2" stroke="#D4A843" strokeWidth="1.2"/>
              <path d="M1 5L7 8.5L13 5" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="settings-card-title">Email address</div>
          <div className="settings-card-sub">We'll send a confirmation to your new address before updating.</div>
          <div className="divider"/>
          <form onSubmit={handleEmailChange}>
            <div className="form-field">
              <label className="form-label">New email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="your@newemail.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
              />
            </div>
            {emailSuccess && <div className="alert alert-success">{emailSuccess}</div>}
            {emailError && <div className="alert alert-error">{emailError}</div>}
            <button className="save-btn" type="submit" disabled={emailLoading}>
              {emailLoading ? 'Sending confirmation...' : 'Update email'}
            </button>
          </form>
        </div>

        {/* Password change */}
        <div className="settings-card">
          <div className="section-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="6" width="10" height="7" rx="2" stroke="#D4A843" strokeWidth="1.2"/>
              <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="7" cy="9.5" r="1" fill="#D4A843"/>
            </svg>
          </div>
          <div className="settings-card-title">Password</div>
          <div className="settings-card-sub">Use at least 8 characters. We verify your current password before making any change.</div>
          <div className="divider"/>
          <form onSubmit={handlePasswordChange}>
            <div className="form-field">
              <label className="form-label">Current password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">New password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">Confirm new password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
            {passwordError && <div className="alert alert-error">{passwordError}</div>}
            <button className="save-btn" type="submit" disabled={passwordLoading}>
              {passwordLoading ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        </div>

      </div>
    </>
  )
}
