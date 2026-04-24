'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { t, Lang } from '@/lib/translations'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [lang, setLang] = useState<Lang>('en')

 useEffect(() => {
  const saved = localStorage.getItem('gainline_lang') as Lang
  if (saved === 'en' || saved === 'fr') setLang(saved)

  // Handle PKCE flow — code in query string
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  if (code) {
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (!error) setReady(true)
    })
    return
  }

  // Handle legacy flow — access_token in hash
  const hash = window.location.hash
  if (hash && hash.includes('access_token')) {
    setReady(true)
    return
  }

  // Listen for auth events
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
      setReady(true)
    }
  })

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) setReady(true)
  })

  return () => subscription.unsubscribe()
}, [])

  // Check existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) setReady(true)
  })

  return () => subscription.unsubscribe()
}, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError(lang === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError(lang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setMessage(lang === 'fr' ? 'Mot de passe mis à jour ! Redirection...' : 'Password updated! Redirecting...')
      setTimeout(() => router.push('/dashboard'), 2000)
    }

    setLoading(false)
  }

  const T = t[lang]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0D1B2E; }
        .wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
        .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; }
        .logo-text { color: white; font-weight: 900; font-size: 26px; letter-spacing: -1px; font-family: 'Arial Black', Arial, sans-serif; }
        .card { background: white; border-radius: 16px; padding: 40px; width: 100%; max-width: 420px; }
        .card h1 { font-size: 22px; font-weight: 900; color: #0D1B2E; margin-bottom: 6px; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; }
        .card .sub { font-size: 13px; color: #888780; margin-bottom: 28px; }
        .label { display: block; font-size: 12px; color: #5F5E5A; margin-bottom: 6px; letter-spacing: 0.04em; }
        .input { width: 100%; padding: 12px 14px; border-radius: 8px; border: 1px solid #D3D1C7; font-size: 14px; font-family: Arial, sans-serif; outline: none; margin-bottom: 16px; color: #0D1B2E; }
        .input:focus { border-color: #1D9E75; }
        .btn { width: 100%; background: #1D9E75; color: white; border: none; border-radius: 8px; padding: 14px; font-size: 15px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; cursor: pointer; margin-top: 8px; }
        .btn:disabled { background: #5DCAA5; cursor: not-allowed; }
        .error-box { background: #FCEBEB; border: 1px solid #F09595; color: #A32D2D; border-radius: 8px; padding: 12px 14px; font-size: 13px; margin-bottom: 16px; }
        .success-box { background: #E1F5EE; border: 1px solid #5DCAA5; color: #0F6E56; border-radius: 8px; padding: 12px 14px; font-size: 13px; margin-bottom: 16px; }
        .loading-state { text-align: center; padding: 40px 20px; }
        .loading-state p { font-size: 14px; color: #888780; }
        .back-home { margin-top: 24px; font-size: 12px; color: rgba(255,255,255,0.35); text-decoration: none; display: block; text-align: center; }
        @media (max-width: 480px) {
          .wrap { padding: 32px 16px; }
          .card { padding: 28px 20px; }
        }
      `}</style>

      <div className="wrap">
        <div className="logo">
          <svg width="44" height="40" viewBox="0 0 44 40" style={{ display: 'block' }}>
            <line x1="4" y1="38" x2="13" y2="8" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.28"/>
            <line x1="18" y1="38" x2="27" y2="2" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.58"/>
            <line x1="32" y1="38" x2="41" y2="0" stroke="#1D9E75" strokeWidth="6" strokeLinecap="round"/>
          </svg>
          <span className="logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </div>

        <div className="card">
          {!ready ? (
            <div className="loading-state">
              <p>{lang === 'fr' ? 'Vérification du lien...' : 'Verifying your reset link...'}</p>
            </div>
          ) : (
            <>
              <h1>{lang === 'fr' ? 'Nouveau mot de passe' : 'Set new password'}</h1>
              <p className="sub">{lang === 'fr' ? 'Choisissez un nouveau mot de passe sécurisé.' : 'Choose a new secure password for your account.'}</p>

              <form onSubmit={handleSubmit}>
                <label className="label">{lang === 'fr' ? 'NOUVEAU MOT DE PASSE' : 'NEW PASSWORD'}</label>
                <input type="password" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} required className="input" minLength={8}/>

                <label className="label">{lang === 'fr' ? 'CONFIRMER LE MOT DE PASSE' : 'CONFIRM PASSWORD'}</label>
                <input type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="input"/>

                {error && <div className="error-box">{error}</div>}
                {message && <div className="success-box">{message}</div>}

                <button type="submit" disabled={loading} className="btn">
                  {loading ? T.loading_btn : lang === 'fr' ? 'Mettre à jour le mot de passe' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>

        <a href="/" className="back-home">{T.back_home}</a>
      </div>
    </>
  )
}
