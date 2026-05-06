'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { t, Lang } from '@/lib/translations'

const FLAG_EN = '🇬🇧'
const FLAG_FR = '🇫🇷'

const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#5DCAA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
    <circle cx="8" cy="8" r="2"/>
  </svg>
)

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [lang, setLang] = useState<Lang>('en')
  const [loading, setLoading] = useState(true)
  const [viewCount, setViewCount] = useState<number>(0)
  const [recentViews, setRecentViews] = useState<any[]>([])
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('gainline_lang') as Lang
    if (saved === 'en' || saved === 'fr') setLang(saved)
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUser(user)

    const { data: player } = await supabase
      .from('players')
      .select('id, first_name, avatar_url, bio')
      .eq('profile_id', user.id)
      .single()

    if (player) {
      const incomplete = !player.first_name || !player.avatar_url || !player.bio
      setShowOnboardingBanner(incomplete)

      const { count } = await supabase
        .from('cv_views').select('*', { count: 'exact', head: true }).eq('player_id', player.id)
      setViewCount(count || 0)

      const { data: views } = await supabase
        .from('cv_views').select('organisation_name, viewed_at')
        .eq('player_id', player.id).order('viewed_at', { ascending: false }).limit(10)
      setRecentViews(views || [])
    } else {
      setShowOnboardingBanner(true)
    }

    setLoading(false)
  }

  function toggleLang(l: Lang) {
    setLang(l)
    localStorage.setItem('gainline_lang', l)
  }

  function timeAgo(dateStr: string) {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const T = t[lang]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0C0F16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Arial', color: '#A8A398', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  const cards = [
    { title: T.dashboard_card_profile, desc: T.dashboard_card_profile_desc, color: '#1D9E75', href: '/dashboard/profile' },
    { title: T.dashboard_card_docs, desc: T.dashboard_card_docs_desc, color: '#0F6E56', href: '/dashboard/profile' },
    { title: T.dashboard_card_media, desc: T.dashboard_card_media_desc, color: '#1D9E75', href: '/dashboard/profile' },
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0C0F16; color: #F0EDE4; }
        .dash-nav { background: #111520; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .dash-logo { display: flex; align-items: center; gap: 10px; }
        .dash-logo-text { color: white; font-weight: 900; font-size: 20px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .dash-nav-right { display: flex; align-items: center; gap: 12px; }
        .dash-email { color: rgba(255,255,255,0.5); font-size: 13px; }
        .lang-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.08); padding: 3px; border-radius: 8px; }
        .lang-btn { background: transparent; border: none; cursor: pointer; font-size: 16px; width: 30px; height: 26px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .lang-btn-active { background: rgba(255,255,255,0.15); }
        .signout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); padding: 7px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: Arial, sans-serif; #161C2A-space: nowrap; }
        .dash-content { padding: 48px 28px; max-width: 900px; margin: 0 auto; }
        .dash-title { font-size: 28px; font-weight: 900; color: #F0EDE4; margin-bottom: 8px; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; }
        .dash-subtitle { color: #5F5E5A; margin-bottom: 36px; font-size: 15px; }
        .dash-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .dash-card { background: #161C2A; border-radius: 12px; padding: 28px; border: 0.5px solid #D3D1C7; text-decoration: none; display: block; transition: border-color 0.15s; }
        .dash-card:hover { border-color: #1D9E75; }
        .dash-card-icon { width: 40px; height: 40px; border-radius: 8px; background: #E1F5EE; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .dash-card-title { font-size: 15px; font-weight: 700; color: #F0EDE4; margin-bottom: 6px; font-family: 'Arial Black', Arial, sans-serif; }
        .dash-card-desc { font-size: 13px; color: #A8A398; line-height: 1.5; margin-bottom: 20px; }
        .dash-card-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 20px; color: white; font-size: 12px; font-weight: 700; font-family: Arial, sans-serif; }
        .ob-banner { background: #111520; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 14px; }
        .views-section { background: #111520; border-radius: 12px; padding: 28px; }
        .views-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .views-label { font-size: 10px; color: #5DCAA5; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 4px; }
        .views-title { font-size: 18px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; }
        .views-count-box { text-align: right; }
        .views-count { font-size: 36px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; line-height: 1; }
        .views-count-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .views-list { display: flex; flex-direction: column; gap: 8px; }
        .view-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: rgba(255,255,255,0.06); border-radius: 8px; border: 0.5px solid rgba(255,255,255,0.08); }
        .view-icon { width: 32px; height: 32px; border-radius: 6px; background: rgba(29,158,117,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .view-org { font-size: 13px; font-weight: 700; color: #F0EDE4; }
        .view-time { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .view-time-right { font-size: 11px; color: rgba(255,255,255,0.35); margin-left: auto; white-space: nowrap; }
        .views-empty { text-align: center; padding: 24px; color: rgba(255,255,255,0.35); font-size: 13px; }
        .views-tip { margin-top: 16px; padding-top: 16px; border-top: 0.5px solid rgba(255,255,255,0.08); font-size: 12px; color: rgba(255,255,255,0.3); line-height: 1.6; }
        @media (max-width: 768px) {
          .dash-nav { padding: 0 16px; height: 56px; }
          .dash-logo-text { font-size: 17px; }
          .dash-email { display: none; }
          .signout-btn { font-size: 12px; padding: 6px 12px; }
          .dash-content { padding: 32px 16px; }
          .dash-title { font-size: 22px; }
          .dash-subtitle { font-size: 14px; margin-bottom: 24px; }
          .dash-grid { grid-template-columns: 1fr; gap: 12px; }
          .dash-card { display: flex; align-items: flex-start; gap: 16px; padding: 20px; }
          .dash-card-icon { flex-shrink: 0; margin-bottom: 0; }
          .dash-card-title { font-size: 14px; margin-bottom: 4px; }
          .dash-card-desc { font-size: 12px; margin-bottom: 12px; }
          .views-section { padding: 20px; }
          .views-count { font-size: 28px; }
        }
      `}</style>

      <nav className="dash-nav">
        <div className="dash-logo">
          <svg width="32" height="30" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="dash-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-email">{user?.email}</span>
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('en')}>{FLAG_EN}</button>
            <button className={`lang-btn ${lang === 'fr' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('fr')}>{FLAG_FR}</button>
          </div>
          <form action="/auth/signout" method="post">
            <a href="/dashboard/settings" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', marginRight: '8px' }}>Settings</a>
            <button type="submit" className="signout-btn">{T.nav_sign_out}</button>
          </form>
        </div>
      </nav>

      <div className="dash-content">
        <h1 className="dash-title">{T.dashboard_welcome}</h1>
        <p className="dash-subtitle">{T.dashboard_logged_in} <strong>{user?.email}</strong></p>

        {showOnboardingBanner && (
          <div className="ob-banner">
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(29,158,117,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '2px' }}>Complete your profile to get noticed</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Takes 2 minutes — coaches are already browsing Gainline.</div>
            </div>
            <a href="/onboarding" style={{ height: '30px', padding: '0 14px', borderRadius: '20px', border: 'none', background: '#1D9E75', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial, sans-serif', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              Continue
            </a>
            <button onClick={() => setShowOnboardingBanner(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', padding: '0 4px', flexShrink: 0 }}>×</button>
          </div>
        )}

        <div className="dash-grid">
          {cards.map(card => (
            <a key={card.title} href={card.href} className="dash-card">
              <div className="dash-card-icon">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <line x1="3" y1="16" x2="6" y2="5" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" opacity="0.35"/>
                  <line x1="9" y1="16" x2="12" y2="2" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" opacity="0.68"/>
                  <line x1="15" y1="16" x2="18" y2="0" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="dash-card-title">{card.title}</div>
                <div className="dash-card-desc">{card.desc}</div>
                <span className="dash-card-btn" style={{ background: card.color }}>
                  {T.dashboard_open}
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="views-section">
          <div className="views-header">
            <div>
              <div className="views-label">PROFILE VISIBILITY</div>
              <div className="views-title">{lang === 'fr' ? 'Qui a vu votre CV' : 'Who viewed your CV'}</div>
            </div>
            <div className="views-count-box">
              <div className="views-count">{viewCount}</div>
              <div className="views-count-label">{lang === 'fr' ? 'vues totales' : 'total views'}</div>
            </div>
          </div>

          {recentViews.length > 0 ? (
            <div className="views-list">
              {recentViews.map((view, i) => (
                <div key={i} className="view-item">
                  <div className="view-icon"><EyeIcon /></div>
                  <div>
                    <div className="view-org">
                      {view.organisation_name || (lang === 'fr' ? 'Visiteur anonyme' : 'Anonymous viewer')}
                    </div>
                    <div className="view-time">
                      {lang === 'fr' ? 'A consulté votre CV' : 'Viewed your CV'}
                    </div>
                  </div>
                  <div className="view-time-right">{timeAgo(view.viewed_at)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="views-empty">
              {lang === 'fr'
                ? 'Personne n\'a encore consulté votre CV. Partagez votre lien pour gagner en visibilité !'
                : 'No one has viewed your CV yet. Share your link to get noticed!'
              }
            </div>
          )}

          <div className="views-tip">
            {lang === 'fr'
              ? 'Conseil : un profil complet avec photo et vidéos reçoit 3× plus de vues.'
              : 'Tip: a complete profile with a photo and video highlights gets 3× more views.'
            }
          </div>
        </div>
      </div>
    </>
  )
}