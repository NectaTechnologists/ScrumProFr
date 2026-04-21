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
    <div style={{ minHeight: '100vh', background: '#0D1B2E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
        <svg width="44" height="40" viewBox="0 0 44 40" style={{ display: 'block' }}>
          <line x1="4" y1="38" x2="13" y2="8" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.28"/>
          <line x1="18" y1="38" x2="27" y2="2" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.58"/>
          <line x1="32" y1="38" x2="41" y2="0" stroke="#1D9E75" strokeWidth="6" strokeLinecap="round"/>
        </svg>
        <span style={{ color: 'white', fontWeight: '900', fontSize: '26px', letterSpacing: '-1px', fontFamily: 'Arial Black, Arial, sans-serif' }}>
          GAIN<span style={{ color: '#1D9E75' }}>LINE</span>
        </span>
      </div>

      {/* Card */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px' }}>

        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0D1B2E', marginBottom: '6px', fontFamily: 'Arial Black, Arial, sans-serif', letterSpacing: '-0.5px' }}>
          {isSignUp ? 'Create your account' : 'Sign in to Gainline'}
        </h1>
        <p style={{ fontSize: '13px', color: '#888780', marginBottom: '28px' }}>
          {isSignUp ? 'Free for players — always.' : 'The pathway starts with being seen.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#5F5E5A', marginBottom: '6px', letterSpacing: '0.04em' }}>EMAIL</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #D3D1C7', fontSize: '14px', fontFamily: 'Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#5F5E5A', marginBottom: '6px', letterSpacing: '0.04em' }}>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #D3D1C7', fontSize: '14px', fontFamily: 'Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {message && (
            <div style={{ background: message.includes('error') || message.includes('Invalid') ? '#FCEBEB' : '#E1F5EE', border: `1px solid ${message.includes('error') || message.includes('Invalid') ? '#F09595' : '#5DCAA5'}`, borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: message.includes('error') || message.includes('Invalid') ? '#A32D2D' : '#0F6E56', marginBottom: '20px' }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: loading ? '#5DCAA5' : '#1D9E75', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: '900', fontFamily: 'Arial Black, Arial, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.02em' }}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
            style={{ background: 'none', border: 'none', fontSize: '13px', color: '#1D9E75', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up free"}
          </button>
        </div>
      </div>

      {/* Back to home */}
      <a href="/" style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
        ← Back to gainline.pro
      </a>

    </div>
  )
}
