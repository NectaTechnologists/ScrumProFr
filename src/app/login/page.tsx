'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { t, Lang } from '@/lib/translations'

const FLAG_EN = '🇬🇧'
const FLAG_FR = '🇫🇷'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const router = useRouter()
  const supabase = createClient()

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
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setMessage(error.message) } else { router.push('/onboarding') }
      } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user?.id || '')
          .single()
        const { data: profileExtra } = await supabase
          .from('profiles')
          .select('is_coach, is_player')
          .eq('id', user?.id || '')
          .single()
        const isCoach = profile?.role === 'org_user' || profileExtra?.is_coach
        const isPlayer = profileExtra?.is_player
        if (isCoach && !isPlayer) {
          router.push('/dashboard/coach')
        } else {
          router.push('/dashboard')
        }
      }
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0D1B2E; }
        .login-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
        .login-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; }
        .login-logo-text { color: white; font-weight: 900; font-size: 26px; letter-spacing: -1px; font-family: 'Arial Black', Arial, sans-serif; }
        .lang-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.08); padding: 3px; border-radius: 8px; margin-left: 12px; }
        .lang-btn { background: transparent; border: none; cursor: pointer; font-size: 18px; width: 32px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .lang-btn-active { background: rgba(255,255,255,0.15); }
        .login-card { background: white; border-radius: 16px; padding: 40px; width: 100%; max-width: 420px; }
        .login-card h1 { font-size: 22px; font-weight: 900; color: #0D1B2E; margin-bottom: 6px; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; }
        .subtitle { font-size: 13px; color: #888780; margin-bottom: 28px; }
        .field-label { display: block; font-size: 12px; color: #5F5E5A; margin-bottom: 6px; letter-spacing: 0.04em; }
        .field-input { width: 100%; padding: 12px 14px; border-radius: 8px; border: 1px solid #D3D1C7; font-size: 14px; font-family: Arial, sans-serif; outline: none; margin-bottom: 16px; color: #0D1B2E; }
        .field-input:focus { border-color: #1D9E75; }
        .submit-btn { width: 100%; background: #1D9E75; color: white; border: none; border-radius: 8px; padding: 14px; font-size: 15px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; cursor: pointer; margin-top: 8px; }
        .submit-btn:disabled { background: #5DCAA5; cursor: not-allowed; }
        .message-box { border-radius: 8px; padding: 12px 14px; font-size: 13px; margin-bottom: 16px; }
        .message-error { background: #FCEBEB; border: 1px solid #F09595; color: #A32D2D; }
        .message-success { background: #E1F5EE; border: 1px solid #5DCAA5; color: #0F6E56; }
        .toggle-btn { display: block; width: 100%; background: none; border: none; font-size: 13px; color: #1D9E75; cursor: pointer; font-family: Arial, sans-serif; margin-top: 20px; text-align: center; }
        .back-link { margin-top: 24px; font-size: 12px; color: rgba(255,255,255,0.35); text-decoration: none; display: block; text-align: center; }
        .terms-check { display: flex; align-items: flex-start; gap: 10px; margin: 16px 0 4px; }
        .terms-check input { margin-top: 2px; accent-color: #1D9E75; width: 16px; height: 16px; flex-shrink: 0; cursor: pointer; }
        .terms-check label { font-size: 13px; color: #5F5E5A; line-height: 1.5; cursor: pointer; }
        .terms-check a { color: #1D9E75; text-decoration: underline; }
        @media (max-width: 480px) {
          .login-wrap { padding: 32px 16px; }
          .login-card { padding: 28px 20px; border-radius: 12px; }
          .login-logo-text { font-size: 22px; }
          .login-card h1 { font-size: 20px; }
        }
      `}</style>

      <div className="login-wrap">
        <div className="login-logo">
          <svg width="44" height="40" viewBox="0 0 44 40" style={{ display: 'block' }}>
            <line x1="4" y1="38" x2="13" y2="8" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.28"/>
            <line x1="18" y1="38" x2="27" y2="2" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.58"/>
            <line x1="32" y1="38" x2="41" y2="0" stroke="#1D9E75" strokeWidth="6" strokeLinecap="round"/>
          </svg>
          <span className="login-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('en')}>{FLAG_EN}</button>
            <button className={`lang-btn ${lang === 'fr' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('fr')}>{FLAG_FR}</button>
          </div>
        </div>

        <div className="login-card">
          <h1>{isSignUp ? T.signup_title : T.login_title}</h1>
          <p className="subtitle">{isSignUp ? T.signup_sub : T.login_sub}</p>

          <form onSubmit={handleSubmit}>
            <label className="field-label">{T.email_label}</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="field-input"/>
            <label className="field-label">{T.password_label}</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="field-input"/>
            {isSignUp && (
              <div className="terms-check">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                />
                <label htmlFor="terms">
                  {lang === 'fr'
                    ? <>J&apos;accepte les <a href="/terms" target="_blank">Conditions Générales d&apos;Utilisation</a> de Gainline</>
                    : <>I agree to the Gainline <a href="/terms" target="_blank">Terms & Conditions</a></>
                  }
                </label>
              </div>
            )}
            {message && (
              <div className={`message-box ${message.includes('error') || message.includes('Invalid') ? 'message-error' : 'message-success'}`}>
                {message}
              </div>
            )}
            <button type="submit" disabled={loading || (isSignUp && !agreedToTerms)} className="submit-btn">
              {loading ? T.loading_btn : isSignUp ? T.signup_btn : T.login_btn}
            </button>
          </form>

          <button onClick={() => { setIsSignUp(!isSignUp); setMessage('') }} className="toggle-btn">
            {isSignUp ? T.toggle_to_login : T.toggle_to_signup}
          </button>
        </div>
        <a href="/forgot-password" style={{ display: 'block', textAlign: 'center', marginTop: '12px', fontSize: '13px', color: '#888780', textDecoration: 'none' }}>{lang === 'fr' ? 'Mot de passe oublié ?' : 'Forgot your password?'}</a>
        
        <a href="/" className="back-link">{T.back_home}</a>
      </div>
    </>
  )
}
