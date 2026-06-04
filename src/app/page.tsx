'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { t, Lang } from '@/lib/translations'

const FLAG_EN = '🇬🇧'
const FLAG_FR = '🇫🇷'

const CAROUSEL_PLAYERS = [
  { name: 'James Okafor',   initials: 'JO', color: '#2ec97e', position: 'PROP',      flag: 'ng',     nat: 'Nigerian',      age: 24, height: 188, weight: 118, views: 47 },
  { name: 'Callum Fraser',  initials: 'CF', color: '#4A7FD4', position: 'FLANKER',   flag: 'gb-sct', nat: 'Scottish',      age: 22, height: 192, weight: 105, views: 31 },
  { name: 'Sipho Dlamini',  initials: 'SD', color: '#E05252', position: 'SCRUMHALF', flag: 'za',     nat: 'South African', age: 26, height: 174, weight: 82,  views: 58 },
  { name: 'Ciarán Murphy',  initials: 'CM', color: '#8B5CF6', position: 'FULLBACK',  flag: 'ie',     nat: 'Irish',         age: 21, height: 183, weight: 90,  views: 22 },
  { name: 'Baptiste Girard',initials: 'BG', color: '#D4A843', position: 'NUMBER 8',  flag: 'fr',     nat: 'French',        age: 28, height: 196, weight: 112, views: 64 },
  { name: 'Tapiwa Mutasa',  initials: 'TM', color: '#2ec97e', position: 'LOCK',      flag: 'zw',     nat: 'Zimbabwean',    age: 25, height: 201, weight: 120, views: 19 },
  { name: 'Owen Davies',    initials: 'OD', color: '#E05252', position: 'FLYHALF',   flag: 'gb-wls', nat: 'Welsh',         age: 23, height: 179, weight: 88,  views: 36 },
  { name: 'Marcus Webb',    initials: 'MW', color: '#4A7FD4', position: 'HOOKER',    flag: 'gb-eng', nat: 'English',       age: 27, height: 181, weight: 102, views: 42 },
]

export default function Home() {
  const [lang, setLang] = useState<Lang>('en')
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('gainline_lang') as Lang
    if (saved === 'en' || saved === 'fr') setLang(saved)
  }, [])

  function toggleLang(l: Lang) {
    setLang(l)
    localStorage.setItem('gainline_lang', l)
  }

  const T = t[lang]

  const howItWorksSteps = [
    {
      label: 'CREATE',
      title: 'Sign up in seconds',
      desc: 'Create your free account and claim your Gainline Player Card. Your digital identity on the pitch.',
    },
    {
      label: 'BUILD',
      title: 'Build your Player CV',
      desc: 'Add your stats, career history, video highlights and documents. The more you add, the more coaches see.',
    },
    {
      label: 'SHARE',
      title: 'Share your card',
      desc: 'Send your unique Player Card link via WhatsApp, email or social. One tap and coaches have everything they need.',
    },
    {
      label: 'GET DISCOVERED',
      title: 'Get in front of clubs',
      desc: "Coaches search Gainline daily. You'll see who's viewed your card and which clubs are paying attention.",
    },
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: Arial, sans-serif; }

        .nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-links { display: flex; gap: 20px; align-items: center; }
        .nav-link { color: rgba(255,255,255,0.65); font-size: 13px; text-decoration: none; }
        .nav-cta { background: #2ec97e; color: white; font-size: 13px; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 700; white-space: nowrap; font-family: 'Arial Black', Arial, sans-serif; }

        .lang-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.08); padding: 3px; border-radius: 8px; margin-left: 8px; }
        .lang-btn { background: transparent; border: none; cursor: pointer; font-size: 18px; width: 32px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; line-height: 1; }
        .lang-btn-active { background: rgba(255,255,255,0.15); }

        .hero { background: #0D1B2E; padding: 80px 40px 60px; text-align: center; }
        .hero-inner { max-width: 820px; margin: 0 auto; }
        .hero h1 { font-size: 52px; font-weight: 900; color: white; letter-spacing: -2px; line-height: 1.06; margin-bottom: 18px; font-family: 'Arial Black', Arial, sans-serif; }
        .hero p { font-size: 17px; color: rgba(255,255,255,0.56); line-height: 1.75; max-width: 520px; margin: 0 auto 32px; }
        .hero p.hero-note { margin-top: 40px; }        .hero-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .btn-primary { background: #2ec97e; color: white; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; }
        .btn-ghost { background: transparent; color: white; font-size: 14px; padding: 13px 22px; border-radius: 6px; text-decoration: none; border: 1.5px solid rgba(255,255,255,0.25); }
        .hero-note { margin-top: 40px; font-size: 11px; color: rgba(255,255,255,0.26); letter-spacing: 0.06em; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(29,158,117,0.14); border: 1px solid rgba(29,158,117,0.3); border-radius: 20px; padding: 5px 14px; margin-bottom: 26px; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #2ec97e; flex-shrink: 0; }
        .badge-text { font-size: 11px; color: #5DCAA5; letter-spacing: 0.12em; }

        .pull-quote { background: #2ec97e; padding: 32px 40px; text-align: center; }
        .pull-quote p { font-size: 19px; color: white; max-width: 680px; margin: 0 auto; line-height: 1.45; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.2px; }

        .split { display: grid; grid-template-columns: 1fr 1fr; }
        .split-player { background: #0F2438; padding: 52px 44px; }
        .split-agent { background: #2ec97e; padding: 52px 44px; }
        .split-label { font-size: 10px; letter-spacing: 0.14em; margin-bottom: 24px; }
        .split-player .split-label { color: #5DCAA5; }
        .split-agent .split-label { color: rgba(255,255,255,0.65); }
        .split h2 { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 14px; font-family: 'Arial Black', Arial, sans-serif; color: white; }
        .split p { font-size: 13px; line-height: 1.72; margin-bottom: 26px; }
        .split-player p { color: rgba(255,255,255,0.48); }
        .split-agent p { color: rgba(255,255,255,0.78); }
        .bullet-list { display: flex; flex-direction: column; gap: 11px; margin-bottom: 30px; }
        .bullet-item { display: flex; align-items: flex-start; gap: 9px; }
        .bullet-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
        .split-player .bullet-dot { background: #2ec97e; }
        .split-agent .bullet-dot { background: rgba(255,255,255,0.9); }
        .bullet-item span { font-size: 13px; }
        .split-player .bullet-item span { color: rgba(255,255,255,0.62); }
        .split-agent .bullet-item span { color: rgba(255,255,255,0.85); }
        .btn-teal { background: #2ec97e; color: white; font-size: 12px; padding: 11px 22px; border-radius: 6px; text-decoration: none; font-weight: 700; font-family: 'Arial Black', Arial, sans-serif; display: inline-block; }
        .btn-dark { background: #0D1B2E; color: white; font-size: 12px; padding: 11px 22px; border-radius: 6px; text-decoration: none; font-weight: 700; font-family: 'Arial Black', Arial, sans-serif; display: inline-block; }

        .pathway { background: #F1EFE8; padding: 72px 40px; }
        .pathway-inner { max-width: 860px; margin: 0 auto; }
        .section-label { font-size: 10px; letter-spacing: 0.16em; color: #0F6E56; margin-bottom: 10px; }
        .section-title { font-size: 32px; font-weight: 900; color: #0D1B2E; letter-spacing: -1px; line-height: 1.15; font-family: 'Arial Black', Arial, sans-serif; }
        .section-body { font-size: 14px; color: #5F5E5A; line-height: 1.75; max-width: 560px; margin: 20px auto 0; text-align: center; }
        .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 44px; }
        .card { background: white; border-radius: 12px; padding: 26px; border: 0.5px solid #D3D1C7; }
        .card-bar { border-top: 3px solid #2ec97e; margin-bottom: 16px; }
        .card h3 { font-size: 14px; font-weight: 900; color: #0D1B2E; margin-bottom: 8px; font-family: 'Arial Black', Arial, sans-serif; }
        .card p { font-size: 13px; color: #5F5E5A; line-height: 1.65; }

        .cta-section { background: #F1EFE8; padding: 0 40px 72px; }
        .cta-inner { max-width: 860px; margin: 0 auto; }
        .cta-title { font-size: 32px; font-weight: 900; color: #0D1B2E; letter-spacing: -1px; font-family: 'Arial Black', Arial, sans-serif; text-align: center; }
        .cta-sub { font-size: 14px; color: #5F5E5A; margin-top: 10px; line-height: 1.7; text-align: center; margin-bottom: 32px; }
        .cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .cta-card-dark { background: #0D1B2E; border-radius: 12px; padding: 36px; }
        .cta-card-teal { background: #2ec97e; border-radius: 12px; padding: 36px; }
        .cta-label { font-size: 10px; letter-spacing: 0.14em; margin-bottom: 10px; }
        .cta-card-dark .cta-label { color: #5DCAA5; }
        .cta-card-teal .cta-label { color: rgba(255,255,255,0.65); }
        .cta-card-dark h3 { font-size: 22px; font-weight: 900; color: white; letter-spacing: -0.5px; margin-bottom: 10px; font-family: 'Arial Black', Arial, sans-serif; }
        .cta-card-teal h3 { font-size: 22px; font-weight: 900; color: white; letter-spacing: -0.5px; margin-bottom: 10px; font-family: 'Arial Black', Arial, sans-serif; }
        .cta-card-dark p { font-size: 13px; color: rgba(255,255,255,0.48); line-height: 1.65; margin-bottom: 24px; }
        .cta-card-teal p { font-size: 13px; color: rgba(255,255,255,0.78); line-height: 1.65; margin-bottom: 24px; }

        .footer { background: #0D1B2E; padding: 22px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .footer-logo { display: flex; align-items: center; gap: 8px; }
        .footer-copy { font-size: 11px; color: rgba(255,255,255,0.28); }
        .footer-links { display: flex; gap: 18px; }
        .footer-link { font-size: 11px; color: rgba(255,255,255,0.32); text-decoration: none; }

        /* CAROUSEL */
        @keyframes carousel-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .carousel-wrapper { position: relative; overflow: hidden; padding: 6px 0; }
        .carousel-track { display: flex; gap: 14px; padding: 0 20px; width: max-content; animation: carousel-scroll 50s linear infinite; }
        .carousel-wrapper:hover .carousel-track { animation-play-state: paused; }
        .carousel-card { background: #161C2A; border-radius: 12px; padding: 14px; border: 0.5px solid rgba(255,255,255,0.07); width: 216px; flex-shrink: 0; }
        .carousel-fade-left { position: absolute; left: 0; top: 0; bottom: 0; width: 100px; background: linear-gradient(to right, #0D1B2E, transparent); z-index: 2; pointer-events: none; }
        .carousel-fade-right { position: absolute; right: 0; top: 0; bottom: 0; width: 100px; background: linear-gradient(to left, #0D1B2E, transparent); z-index: 2; pointer-events: none; }
        .carousel-stat { background: #1C2338; padding: 6px; text-align: center; }

        /* HOW IT WORKS */
        .hiw { background: #0D1B2E; padding: 80px 40px; }
        .hiw-inner { max-width: 1060px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
        .hiw-eyebrow { font-size: 10px; letter-spacing: 0.16em; color: #5DCAA5; margin-bottom: 14px; font-weight: 700; }
        .hiw-headline { font-size: 38px; color: white; line-height: 1.1; margin-bottom: 14px; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -1px; }
        .hiw-sub { font-size: 14px; color: rgba(255,255,255,0.56); line-height: 1.75; margin-bottom: 36px; }
        .hiw-steps { display: flex; flex-direction: column; gap: 4px; }
        .hiw-step { display: flex; gap: 16px; padding: 14px 16px; border-radius: 10px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
        .hiw-step:hover { background: rgba(255,255,255,0.04); }
        .hiw-step-active { background: rgba(29,158,117,0.1) !important; border-color: rgba(29,158,117,0.25) !important; }
        .hiw-num { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 2px; border: 1.5px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.4); transition: all 0.2s; font-family: 'Arial Black', Arial, sans-serif; }
        .hiw-step-active .hiw-num { border-color: #2ec97e; color: #2ec97e; background: rgba(29,158,117,0.12); }
        .hiw-step-content { flex: 1; }
        .hiw-step-label { font-size: 9px; letter-spacing: 0.16em; color: rgba(255,255,255,0.3); margin-bottom: 3px; font-weight: 700; transition: color 0.2s; }
        .hiw-step-active .hiw-step-label { color: #5DCAA5; }
        .hiw-step-title { font-size: 15px; font-weight: 900; color: rgba(255,255,255,0.7); margin-bottom: 0; transition: color 0.2s; font-family: 'Arial Black', Arial, sans-serif; }
        .hiw-step-active .hiw-step-title { color: white; }
        .hiw-step-desc { font-size: 13px; color: rgba(255,255,255,0.48); line-height: 1.65; margin-top: 6px; }
        .hiw-right { position: sticky; top: 40px; }
        .hiw-card { background: #161C2A; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); }
        .hiw-card-top { background: #1C2338; padding: 20px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .hiw-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #2A3448, #1C2338); border: 2px solid rgba(212,168,67,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 22px; }
        .hiw-card-name { font-size: 17px; font-weight: 700; color: #F0EDE4; }
        .hiw-card-pos { display: inline-block; background: rgba(212,168,67,0.15); border: 1px solid rgba(212,168,67,0.3); border-radius: 4px; font-size: 10px; color: #D4A843; padding: 2px 8px; margin-top: 3px; letter-spacing: 0.08em; font-weight: 700; }
        .hiw-card-body { padding: 20px; min-height: 180px; }
        .hiw-card-stats { background: #111520; padding: 14px 20px; display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid rgba(255,255,255,0.05); }
        .hiw-stat { text-align: center; }
        .hiw-stat-val { font-size: 18px; font-weight: 700; color: #F0EDE4; }
        .hiw-stat-lbl { font-size: 9px; color: rgba(255,255,255,0.35); letter-spacing: 0.1em; margin-top: 2px; }
        .hiw-progress-row { margin-bottom: 12px; }
        .hiw-progress-label { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 5px; }
        .hiw-progress-track { height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
        .hiw-progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #2ec97e, #5DCAA5); }
        .hiw-share-btn { display: flex; align-items: center; gap: 9px; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; font-size: 12px; font-weight: 600; cursor: default; }
        .hiw-view-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .hiw-view-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .hiw-view-info { flex: 1; }
        .hiw-view-name { font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 600; }
        .hiw-view-org { font-size: 10px; color: rgba(255,255,255,0.35); }
        .hiw-view-time { font-size: 10px; color: rgba(255,255,255,0.3); }

        @media (max-width: 768px) {
          .nav { padding: 0 20px; height: 56px; }
          .nav-links .nav-link { display: none; }
          .nav-cta { font-size: 12px; padding: 8px 14px; }
          .hero { padding: 60px 20px 48px; }
          .hero h1 { font-size: 36px; letter-spacing: -1px; }
          .hero p { font-size: 15px; }
          .hero-btns { flex-direction: column; align-items: center; }
          .btn-primary { width: 100%; max-width: 320px; text-align: center; }
          .btn-ghost { width: 100%; max-width: 320px; text-align: center; }
          .pull-quote { padding: 28px 20px; }
          .pull-quote p { font-size: 15px; }
          .split { grid-template-columns: 1fr; }
          .split-player { padding: 40px 24px; }
          .split-agent { padding: 40px 24px; }
          .split h2 { font-size: 24px; }
          .btn-teal { width: 100%; text-align: center; }
          .btn-dark { width: 100%; text-align: center; }
          .pathway { padding: 52px 20px; }
          .section-title { font-size: 26px; }
          .cards { grid-template-columns: 1fr; gap: 12px; }
          .cta-section { padding: 0 20px 52px; }
          .cta-title { font-size: 26px; }
          .cta-grid { grid-template-columns: 1fr; }
          .cta-card-dark { padding: 28px; }
          .cta-card-teal { padding: 28px; }
          .footer { flex-direction: column; align-items: flex-start; padding: 24px 20px; }
          .hiw { padding: 52px 20px; }
          .hiw-inner { grid-template-columns: 1fr; gap: 40px; }
          .hiw-headline { font-size: 26px; }
          .hiw-right { position: static; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo">
          <Image src="/gainline-logo-final.svg" alt="Gainline" width={160} height={48} priority />
        </a>
        <div className="nav-links">
          <a href="/players" className="nav-link">Browse players</a>
          <a href="/register/coach" className="nav-link">{T.nav_agents}</a>
          <a href="/#how-it-works" className="nav-link">{T.nav_pricing}</a>
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('en')} title="English">{FLAG_EN}</button>
            <button className={`lang-btn ${lang === 'fr' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('fr')} title="Français">{FLAG_FR}</button>
          </div>
          <a href="/login" className="nav-cta">{T.nav_get_started}</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="badge">
            <div className="badge-dot"></div>
            <span className="badge-text">{T.hero_badge}</span>
          </div>
          <h1>{T.hero_title_1}<br/>{T.hero_title_2} <span style={{ color: '#2ec97e' }}>{T.hero_title_highlight}</span></h1>
          <p>{T.hero_sub}</p>
          <div className="hero-btns">
            <a href="/login" className="btn-primary">{T.hero_btn_player}</a>
            <a href="/register/coach" className="btn-ghost">{T.hero_btn_agent}</a>
          </div>
          <p className="hero-note">{T.hero_note}</p>
        </div>
      </section>

      {/* PLAYER CAROUSEL */}
      <section style={{ background: '#0D1B2E', padding: '72px 0 64px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ textAlign: 'center', padding: '0 40px', marginBottom: '40px' }}>
          <p style={{ fontSize: '10px', color: '#5DCAA5', letterSpacing: '0.16em', marginBottom: '10px', fontWeight: '700' }}>REAL PLAYERS. REAL PROFILES.</p>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'white', letterSpacing: '-1px', fontFamily: "'Arial Black', Arial, sans-serif", lineHeight: '1.1' }}>
            Player Cards live on Gainline
          </h2>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel-fade-left" />
          <div className="carousel-fade-right" />
          <div className="carousel-track">
            {[...CAROUSEL_PLAYERS, ...CAROUSEL_PLAYERS].map((p, i) => (
              <div key={i} className="carousel-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'white', fontSize: '13px', fontWeight: '900', fontFamily: "'Arial Black', Arial, sans-serif" }}>{p.initials}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '900', color: '#F0EDE4', fontFamily: "'Arial Black', Arial, sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                      <img src={`https://flagcdn.com/w20/${p.flag}.png`} alt={p.nat} style={{ width: '14px', height: '10px', borderRadius: '1px', objectFit: 'cover' }} />
                      <span style={{ fontSize: '10px', color: '#888780' }}>{p.nat} · {p.age} yrs</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'inline-block', background: '#E1F5EE', color: '#0F6E56', fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.06em', marginBottom: '10px' }}>{p.position}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                  {[{ v: p.height, l: 'CM' }, { v: p.weight, l: 'KG' }, { v: p.views, l: 'VIEWS' }].map(s => (
                    <div key={s.l} className="carousel-stat">
                      <div style={{ fontSize: '13px', fontWeight: '900', color: '#F0EDE4', fontFamily: "'Arial Black', Arial, sans-serif" }}>{s.v}</div>
                      <div style={{ fontSize: '9px', color: '#888780', letterSpacing: '0.08em', marginTop: '1px' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '44px' }}>
          <a href="/login" className="btn-primary">Build your free Player Card</a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="hiw" id="how-it-works">
        <div className="hiw-inner">
          {/* Left: text + steps */}
          <div>
            <p className="hiw-eyebrow">HOW IT WORKS</p>
            <h2 className="hiw-headline">Your Player Card.<br/>Your pathway to the game.</h2>
            <p className="hiw-sub">No talent goes unseen. Build your digital Player Card in minutes and put yourself in front of coaches and clubs worldwide.</p>
            <div className="hiw-steps">
              {howItWorksSteps.map((step, i) => (
                <div
                  key={i}
                  className={`hiw-step${activeStep === i ? ' hiw-step-active' : ''}`}
                  onClick={() => setActiveStep(i)}
                >
                  <div className="hiw-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="hiw-step-content">
                    <p className="hiw-step-label">{step.label}</p>
                    <p className="hiw-step-title">{step.title}</p>
                    {activeStep === i && <p className="hiw-step-desc">{step.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: player card preview */}
          <div className="hiw-right">
            <div className="hiw-card">
              {/* Card header */}
              <div className="hiw-card-top">
                <div className="hiw-avatar">🏉</div>
                <div>
                  <div className="hiw-card-name">James Okafor</div>
                  <div className="hiw-card-pos">PROP · #1</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>🇳🇬 Nigeria</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>24 yrs · 188cm</div>
                </div>
              </div>

              {/* Card body — updates per step */}
              <div className="hiw-card-body">
                {activeStep === 0 && (
                  <div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '12px' }}>ABOUT</p>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7' }}>Front-row specialist with 6 seasons of club rugby across West Africa and Europe. Strong in the scrum, mobile in open play.</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                      {['Scrum', 'Line-out', 'Ball carrier'].map(tag => (
                        <span key={tag} style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '14px' }}>PROFILE COMPLETION</p>
                    {[
                      { label: 'Career history', pct: 85 },
                      { label: 'Video highlights', pct: 60 },
                      { label: 'Documents', pct: 40 },
                      { label: 'References', pct: 25 },
                    ].map(item => (
                      <div key={item.label} className="hiw-progress-row">
                        <div className="hiw-progress-label">
                          <span>{item.label}</span>
                          <span style={{ color: '#2ec97e' }}>{item.pct}%</span>
                        </div>
                        <div className="hiw-progress-track">
                          <div className="hiw-progress-fill" style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeStep === 2 && (
                  <div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '12px' }}>SHARE YOUR CARD</p>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '9px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>gainline.pro/cv/j-okafor-xk4</span>
                      <span style={{ fontSize: '10px', color: '#2ec97e', fontWeight: '700', cursor: 'default', fontFamily: "'Arial Black', Arial, sans-serif" }}>COPY</span>
                    </div>
                    {[
                      { icon: '💬', label: 'Share via WhatsApp', bg: 'rgba(37,211,102,0.12)', color: '#25D366' },
                      { icon: '✉️', label: 'Send by Email', bg: 'rgba(74,144,217,0.12)', color: '#4A90D9' },
                      { icon: '📘', label: 'Post to Facebook', bg: 'rgba(24,119,242,0.12)', color: '#1877F2' },
                    ].map(btn => (
                      <div key={btn.label} className="hiw-share-btn" style={{ background: btn.bg }}>
                        <span>{btn.icon}</span>
                        <span style={{ color: btn.color }}>{btn.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeStep === 3 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>RECENT VIEWS</p>
                      <span style={{ fontSize: '11px', color: '#5DCAA5', fontWeight: '700' }}>3 this week</span>
                    </div>
                    {[
                      { initials: 'MR', name: 'Marc Roussel', org: 'Clermont Auvergne', time: '2h ago', bg: '#2ec97e' },
                      { initials: 'TK', name: 'Tom Keane', org: 'Leicester Tigers', time: 'Yesterday', bg: '#4A90D9' },
                      { initials: 'JL', name: 'Jean Lebrun', org: 'Stade Français', time: '3 days ago', bg: '#8B5CF6' },
                    ].map(view => (
                      <div key={view.name} className="hiw-view-row">
                        <div className="hiw-view-avatar" style={{ background: view.bg }}>
                          <span style={{ color: 'white', fontSize: '10px', fontWeight: '700' }}>{view.initials}</span>
                        </div>
                        <div className="hiw-view-info">
                          <div className="hiw-view-name">{view.name}</div>
                          <div className="hiw-view-org">{view.org}</div>
                        </div>
                        <div className="hiw-view-time">{view.time}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats strip */}
              <div className="hiw-card-stats">
                {[
                  { val: '6', lbl: 'SEASONS' },
                  { val: '94', lbl: 'CAPS' },
                  { val: '118kg', lbl: 'WEIGHT' },
                ].map(s => (
                  <div key={s.lbl} className="hiw-stat">
                    <div className="hiw-stat-val">{s.val}</div>
                    <div className="hiw-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gainline badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
              <svg width="14" height="12" viewBox="0 0 26 24">
                <line x1="2" y1="22" x2="7" y2="4" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.28"/>
                <line x1="11" y1="22" x2="16" y2="1" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.58"/>
                <line x1="20" y1="22" x2="25" y2="0" stroke="#2ec97e" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Gainline Player Card</span>
            </div>
          </div>
        </div>
      </section>

      {/* PULL QUOTE */}
      <div className="pull-quote">
        <p>&ldquo;{T.quote.replace(/^["«»]|["«»]$/g, '').trim().replace(T.quote_highlight, `\u200B${T.quote_highlight}\u200B`)}&rdquo;</p>
      </div>

      <section style={{ background: '#F1EFE8', padding: '64px 40px', textAlign: 'center' }}>
  <div style={{ maxWidth: '860px', margin: '0 auto' }}>
    <p style={{ fontSize: '10px', color: '#0F6E56', letterSpacing: '0.16em', marginBottom: '10px', fontWeight: '700' }}>PLAYER DIRECTORY</p>
    <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0D1B2E', letterSpacing: '-1px', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '12px' }}>Browse rugby talent from around the world</h2>
    <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.75', maxWidth: '520px', margin: '0 auto 32px' }}>Coaches and recruiters can browse verified player profiles sorted by views — no account needed.</p>
    <a href="/players" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#0D1B2E', color: 'white', fontSize: '14px', fontWeight: '700', padding: '13px 28px', borderRadius: '20px', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}>
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
      View all players
    </a>
  </div>
</section>
      {/* SPLIT */}
      <div className="split">
        <div className="split-player">
          <p className="split-label">{T.for_players}</p>
          <h2>{T.player_headline}</h2>
          <p>{T.player_sub}</p>
          <div className="bullet-list">
            {T.player_bullets.map((b: string) => (
              <div key={b} className="bullet-item">
                <div className="bullet-dot"></div>
                <span>{b}</span>
              </div>
            ))}
          </div>
          <a href="/login" className="btn-teal">{T.player_cta}</a>
        </div>
        <div className="split-agent">
          <p className="split-label">{T.for_agents}</p>
          <h2>{T.agent_headline}</h2>
          <p>{T.agent_sub}</p>
          <div className="bullet-list">
            {T.agent_bullets.map((b: string) => (
              <div key={b} className="bullet-item">
                <div className="bullet-dot"></div>
                <span>{b}</span>
              </div>
            ))}
          </div>
          <a href="/register/coach" className="btn-dark">{T.agent_cta}</a>
        </div>
      </div>

      {/* PATHWAY */}
      <section className="pathway">
        <div className="pathway-inner">
          <div style={{ textAlign: 'center' }}>
            <p className="section-label">{T.pathway_label}</p>
            <h2 className="section-title">{T.pathway_title}</h2>
            <p className="section-body">{T.pathway_sub}</p>
          </div>
          <div className="cards">
            {T.pathway_cards.map((card: { title: string; desc: string }) => (
              <div key={card.title} className="card">
                <div className="card-bar"></div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">{T.cta_title}</h2>
          <p className="cta-sub">{T.cta_sub}</p>
          <div className="cta-grid">
            <div className="cta-card-dark">
              <p className="cta-label">{T.for_players}</p>
              <h3>{T.cta_player_title}</h3>
              <p>{T.cta_player_sub}</p>
              <a href="/login" className="btn-teal">{T.player_cta}</a>
            </div>
            <div className="cta-card-teal">
              <p className="cta-label">{T.for_agents}</p>
              <h3>{T.cta_agent_title}</h3>
              <p>{T.cta_agent_sub}</p>
              <a href="/register/coach" className="btn-dark">{T.cta_agent_btn}</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/gainline-logo-final.svg" alt="Gainline" width={120} height={36} />
        </div>
        <span className="footer-copy">gainline.pro &nbsp;·&nbsp; 2026</span>
        <div className="footer-links">
          <a href="/privacy" className="footer-link">{T.footer_privacy}</a>
          <a href="/terms" className="footer-link">{T.footer_terms}</a>
          <a href="mailto:hello@gainline.pro" className="footer-link">{T.footer_contact}</a>
        </div>
      </footer>
    </>
  )
}
