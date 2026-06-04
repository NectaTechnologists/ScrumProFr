'use client'
import Image from 'next/image'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { t, Lang } from '@/lib/translations'

const FLAG_EN = '🇬🇧'
const FLAG_FR = '🇫🇷'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState('')
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('gainline_lang') as Lang
    if (saved === 'en' || saved === 'fr') setLang(saved)
  }, [])

  function toggleLang(l: Lang) {
    setLang(l)
    localStorage.setItem('gainline_lang', l)
  }

  const T = t[lang]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.gainline.pro/auth/reset-password',
    })

    if (error) {
      setMessage(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0D1B2E; }
        .wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
        .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; }
        .logo-text { color: white; font-weight: 900; font-size: 26px; letter-spacing: -1px; font-family: 'Arial Black', Arial, sans-serif; }
        .lang-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.08); padding: 3px; border-radius: 8px; margin-left: 12px; }
        .lang-btn { background: transparent; border: none; cursor: pointer; font-size: 18px; width: 32px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .lang-btn-active { background: rgba(255,255,255,0.15); }
        .card { background: white; border-radius: 16px; padding: 40px; width: 100%; max-width: 420px; }
        .card h1 { font-size: 22px; font-weight: 900; color: #0D1B2E; margin-bottom: 6px; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; }
        .card .sub { font-size: 13px; color: #888780; margin-bottom: 28px; line-height: 1.6; }
        .label { display: block; font-size: 12px; color: #5F5E5A; margin-bottom: 6px; letter-spacing: 0.04em; }
        .input { width: 100%; padding: 12px 14px; border-radius: 8px; border: 1px solid #D3D1C7; font-size: 14px; font-family: Arial, sans-serif; outline: none; margin-bottom: 20px; color: #0D1B2E; }
        .input:focus { border-color: #2ec97e; }
        .btn { width: 100%; background: #2ec97e; color: white; border: none; border-radius: 8px; padding: 14px; font-size: 15px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; cursor: pointer; }
        .btn:disabled { background: #5DCAA5; cursor: not-allowed; }
        .error { background: #FCEBEB; border: 1px solid #F09595; color: #A32D2D; border-radius: 8px; padding: 12px 14px; font-size: 13px; margin-bottom: 16px; }
        .success { text-align: center; padding: 8px 0; }
        .success-icon { width: 56px; height: 56px; border-radius: 50%; background: #E1F5EE; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .success h2 { font-size: 18px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 8px; }
        .success p { font-size: 13px; color: #5F5E5A; line-height: 1.65; }
        .back { margin-top: 20px; text-align: center; }
        .back a { font-size: 13px; color: #2ec97e; text-decoration: none; }
        .back-home { margin-top: 24px; font-size: 12px; color: rgba(255,255,255,0.35); text-decoration: none; display: block; text-align: center; }
        @media (max-width: 480px) {
          .wrap { padding: 32px 16px; }
          .card { padding: 28px 20px; }
        }
      `}</style>

      <div className="wrap">
        <div className="logo">
          <Image src="/gainline-logo-final.svg" alt="Gainline" width={160} height={48} priority />
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('en')}>{FLAG_EN}</button>
            <button className={`lang-btn ${lang === 'fr' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('fr')}>{FLAG_FR}</button>
          </div>
        </div>

        <div className="card">
          {!sent ? (
            <>
              <h1>{lang === 'fr' ? 'Mot de passe oublié ?' : 'Forgot your password?'}</h1>
              <p className="sub">{lang === 'fr' ? 'Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.' : 'Enter your email and we\'ll send you a reset link.'}</p>

              <form onSubmit={handleSubmit}>
                <label className="label">{T.email_label}</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="input"/>
                {message && <div className="error">{message}</div>}
                <button type="submit" disabled={loading} className="btn">
                  {loading ? T.loading_btn : lang === 'fr' ? 'Envoyer le lien' : 'Send reset link'}
                </button>
              </form>

              <div className="back">
                <a href="/login">{T.toggle_to_login}</a>
              </div>
            </>
          ) : (
            <div className="success">
              <div className="success-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14L11 19L22 8" stroke="#2ec97e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>{lang === 'fr' ? 'E-mail envoyé !' : 'Email sent!'}</h2>
              <p>{lang === 'fr' ? `Un lien de réinitialisation a été envoyé à ${email}. Vérifiez votre boîte de réception.` : `We've sent a reset link to ${email}. Check your inbox.`}</p>
              <div className="back" style={{ marginTop: '24px' }}>
                <a href="/login">{T.toggle_to_login}</a>
              </div>
            </div>
          )}
        </div>

        <a href="/" className="back-home">{T.back_home}</a>
      </div>
    </>
  )
}
