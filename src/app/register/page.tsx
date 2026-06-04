'use client'
import Image from 'next/image'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'player' | 'coach' | null

export default function RegisterPage() {
  const [selected, setSelected] = useState<Role>(null)
  const router = useRouter()

  function handleContinue() {
    if (selected === 'coach') {
      router.push('/register/coach')
    } else if (selected === 'player') {
      router.push('/login')
    }
  }

  const ctaLabel =
    selected === 'player' ? 'Register as a Player →' :
    selected === 'coach'  ? 'Register as a Coach →' :
    'Select a role to continue'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0D1B2E; }
        .rg-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; }
        .rg-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; text-decoration: none; }
        .rg-logo-text { color: white; font-weight: 900; font-size: 24px; letter-spacing: -1px; font-family: 'Arial Black', Arial, sans-serif; }
        .rg-card { width: 100%; max-width: 540px; }
        .rg-heading { font-size: 28px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; text-align: center; margin-bottom: 8px; }
        .rg-sub { font-size: 14px; color: rgba(255,255,255,0.4); text-align: center; margin-bottom: 36px; line-height: 1.6; }
        .rg-roles { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; }
        .rg-role-btn { background: #111520; border: 2px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 28px 20px; cursor: pointer; text-align: left; transition: border-color 0.15s, background 0.15s; display: block; width: 100%; }
        .rg-role-btn:hover { border-color: rgba(255,255,255,0.25); }
        .rg-role-player-active { border-color: #2ec97e !important; background: rgba(29,158,117,0.07); }
        .rg-role-coach-active { border-color: #D4A843 !important; background: rgba(212,168,67,0.07); }
        .rg-role-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .rg-role-icon-player { background: rgba(29,158,117,0.15); }
        .rg-role-icon-coach { background: rgba(212,168,67,0.12); }
        .rg-role-title { font-size: 16px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 6px; }
        .rg-role-desc { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.6; }
        .rg-check { display: flex; align-items: center; justify-content: flex-end; margin-top: 14px; }
        .rg-check-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; }
        .rg-check-dot-player { border-color: #2ec97e; background: #2ec97e; }
        .rg-check-dot-coach { border-color: #D4A843; background: #D4A843; }
        .rg-cta { width: 100%; padding: 15px; border-radius: 10px; border: none; font-size: 15px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; cursor: pointer; transition: opacity 0.15s; background: #2ec97e; color: white; }
        .rg-cta-coach { background: #D4A843; color: #0D1B2E; }
        .rg-cta:disabled { opacity: 0.35; cursor: not-allowed; }
        .rg-footer { text-align: center; margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.35); }
        .rg-footer a { color: #2ec97e; text-decoration: none; }
        @media (max-width: 480px) {
          .rg-roles { grid-template-columns: 1fr; }
          .rg-heading { font-size: 22px; }
        }
      `}</style>

      <div className="rg-wrap">
        <a href="/" className="rg-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/gainline-logo-final.png" alt="Gainline" width={160} height={48} priority />
        </a>

        <div className="rg-card">
          <h1 className="rg-heading">Join Gainline</h1>
          <p className="rg-sub">Are you joining as a player looking for opportunities, or as a coach / recruiter browsing talent?</p>

          <div className="rg-roles">

            {/* Player card */}
            <button
              className={`rg-role-btn ${selected === 'player' ? 'rg-role-player-active' : ''}`}
              onClick={() => setSelected(selected === 'player' ? null : 'player')}
            >
              <div className="rg-role-icon rg-role-icon-player">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#2ec97e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="7" r="4"/>
                  <path d="M2 20c0-5 4-9 9-9s9 4 9 9"/>
                </svg>
              </div>
              <div className="rg-role-title">I'm a Player</div>
              <div className="rg-role-desc">Build your player card, share your CV with coaches and track who's viewed your profile.</div>
              <div className="rg-check">
                <div className={`rg-check-dot ${selected === 'player' ? 'rg-check-dot-player' : ''}`}>
                  {selected === 'player' && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,6 5,9 10,3"/>
                    </svg>
                  )}
                </div>
              </div>
            </button>

            {/* Coach card */}
            <button
              className={`rg-role-btn ${selected === 'coach' ? 'rg-role-coach-active' : ''}`}
              onClick={() => setSelected(selected === 'coach' ? null : 'coach')}
            >
              <div className="rg-role-icon rg-role-icon-coach">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="7" r="4"/>
                  <path d="M2 20c0-5 4-9 9-9s9 4 9 9"/>
                  <path d="M7 13l-2 2.5 1 3 5-2 5 2 1-3-2-2.5"/>
                </svg>
              </div>
              <div className="rg-role-title">I'm a Coach</div>
              <div className="rg-role-desc">Browse players, request CV access, build your coach card and manage your recruitment pipeline.</div>
              <div className="rg-check">
                <div className={`rg-check-dot ${selected === 'coach' ? 'rg-check-dot-coach' : ''}`}>
                  {selected === 'coach' && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,6 5,9 10,3"/>
                    </svg>
                  )}
                </div>
              </div>
            </button>

          </div>

          <button
            className={`rg-cta ${selected === 'coach' ? 'rg-cta-coach' : ''}`}
            disabled={!selected}
            onClick={handleContinue}
          >
            {ctaLabel}
          </button>

          <p className="rg-footer">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </>
  )
}
