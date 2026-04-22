'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setMessage(error.message) } else { setMessage('Check your email to confirm your account!') }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setMessage(error.message) } else { router.push('/dashboard') }
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; }

        .login-wrap {
          min-height: 100vh;
          background: #0D1B2E;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }

        .login-logo-text {
          color: white;
          font-weight: 900;
          font-size: 26px;
          letter-spacing: -1px;
          font-family: 'Arial Black', Arial, sans-serif;
        }

        .login-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
        }

        .login-card h1 {
          font-size: 22px;
          font-weight: 900;
          color: #0D1B2E;
          margin-bottom: 6px;
          font-family: 'Arial Black', Arial, sans-serif;
          letter-spacing: -0.5px;
        }

        .login-card .subtitle {
          font-size: 13px;
          color: #888780;
          margin-bottom: 28px;
        }

        .field-label {
          display: block;
          font-size: 12px;
          color: #5F5E5A;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
        }

        .field-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #D3D1C7;
          font-size: 14px;
          font-family: Arial, sans-serif;
          outline: none;
          margin-bottom: 16px;
        }

        .field-input:focus {
          border-color: #1D9E75;
        }

        .submit-btn {
          width: 100%;
          background: #1D9E75;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px;
          font-size: 15px;
          font-weight: 900;
          font-family: 'Arial Black', Arial, sans-serif;
          cursor: pointer;
          letter-spacing: 0.02em;
          margin-top: 8px;
        }

        .submit-btn:disabled {
          background: #5DCAA5;
          cursor: not-allowed;
        }

        .message-box {
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .message-error {
          background: #FCEBEB;
          border: 1px solid #F09595;
          color: #A32D2D;
        }

        .message-success {
          background: #E1F5EE;
          border: 1px solid #5DCAA5;
          color: #0F6E56;
        }

        .toggle-btn {
          display: block;
          width: 100%;
          background: none;
          border: none;
          font-size: 13px;
          color: #1D9E75;
          cursor: pointer;
          font-family: Arial, sans-serif;
          margin-top: 20px;
          text-align: center;
        }

        .back-link {
          margin-top: 24px;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          display: block;
          text-align: center;
        }

        @media (max-width: 480px) {
          .login-wrap { padding: 32px 16px; }
          .login-card { padding: 28px 20px; border-radius: 12px; }
          .login-logo-text { font-size: 22px; }
          .login-card h1 { font-size: 20px; }
          .submit-btn { font-size: 14px; padding: 13px; }
        }
      `}</style>

      <div className="login-wrap">
        {/* Logo */}
        <div className="login-logo">
          <svg width="44" height="40" viewBox="0 0 44 40" style={{ display: 'block' }}>
            <line x1="4" y1="38" x2="13" y2="8" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.28"/>
            <line x1="18" y1="38" x2="27" y2="2" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.58"/>
            <line x1="32" y1="38" x2="41" y2="0" stroke="#1D9E75" strokeWidth="6" strokeLinecap="round"/>
          </svg>
          <span className="login-logo-text">
            GAIN<span style={{ color: '#1D9E75' }}>LINE</span>
          </span>
        </div>

        {/* Card */}
        <div className="login-card">
          <h1>{isSignUp ? 'Create your account' : 'Sign in to Gainline'}</h1>
          <p className="subtitle">
            {isSignUp ? 'Free for players — always.' : 'The pathway starts with being seen.'}
          </p>

          <form onSubmit={handleSubmit}>
            <label className="field-label">EMAIL</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="field-input"
            />

            <label className="field-label">PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="field-input"
            />

            {message && (
              <div className={`message-box ${message.includes('error') || message.includes('Invalid') ? 'message-error' : 'message-success'}`}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
            className="toggle-btn"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up free"}
          </button>
        </div>

        <a href="/" className="back-link">← Back to gainline.pro</a>
      </div>
    </>
  )
}
