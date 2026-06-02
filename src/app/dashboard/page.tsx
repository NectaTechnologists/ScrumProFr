'use client'

import { useState, useEffect } from 'react'
import ShareModal from '@/components/ShareModal'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { t, Lang } from '@/lib/translations'

const FLAG_EN = '🇬🇧'
const FLAG_FR = '🇫🇷'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [player, setPlayer] = useState<any>(null)
  const [lang, setLang] = useState<Lang>('en')
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [playerShareToken, setPlayerShareToken] = useState<string | null>(null)
  const [requests, setRequests] = useState<any[]>([])

  // New analytics state
  const [approvedRefsCount, setApprovedRefsCount] = useState(0)
  const [weeklyViews, setWeeklyViews] = useState(0)
  const [lastWeekViews, setLastWeekViews] = useState(0)
  const [totalViews, setTotalViews] = useState(0)
  const [myVacancyCount, setMyVacancyCount] = useState(0)
  const [totalPlayerCount, setTotalPlayerCount] = useState(0)
  const [coachData, setCoachData] = useState<any>(null)
  const [coachShareToken, setCoachShareToken] = useState<string | null>(null)

  // Copy link feedback
  const [copiedLink, setCopiedLink] = useState(false)
  const [recentViewsList, setRecentViewsList] = useState<any[]>([])
  const [viewsExpanded, setViewsExpanded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('gainline_lang') as Lang
    if (saved === 'en' || saved === 'fr') setLang(saved)
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUser(user)

    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const { data: profExtra } = await supabase.from('profiles').select('is_coach, is_player').eq('id', user.id).single()
    const mergedProf = { ...prof, ...profExtra }
    setProfile(mergedProf)

    const looksLikeCoach = mergedProf?.role === 'org_user' || mergedProf?.is_coach
    const looksLikePlayer = mergedProf?.is_player

    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (looksLikeCoach && !playerData && !looksLikePlayer) {
      router.push('/dashboard/coach')
      return
    }

    if (playerData) {
      setPlayer(playerData)
      setPlayerId(playerData.id)
      setPlayerShareToken(playerData.share_token)
      setShareUrl(`${window.location.origin}/cv/${playerData.share_token}`)

      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString()

      const [
        { count: totalViewCount },
        { data: weekViews },
        { data: prevWeekViews },
        { count: refsCount },
        { data: reqs },
        { data: recentViews },
      ] = await Promise.all([
        supabase.from('cv_views').select('id', { count: 'exact', head: true }).eq('player_id', playerData.id),
        supabase.from('cv_views').select('id').eq('player_id', playerData.id).gte('viewed_at', sevenDaysAgo),
        supabase.from('cv_views').select('id').eq('player_id', playerData.id).gte('viewed_at', fourteenDaysAgo).lt('viewed_at', sevenDaysAgo),
        supabase.from('references').select('id', { count: 'exact', head: true }).eq('player_id', playerData.id).eq('status', 'approved'),
        supabase.from('cv_requests').select('*').eq('player_id', playerData.id).order('created_at', { ascending: false }),
        supabase.from('cv_views').select('organisation_name, coach_id, viewed_at').eq('player_id', playerData.id).order('viewed_at', { ascending: false }).limit(8),
      ])

      setTotalViews(totalViewCount || 0)
      setWeeklyViews((weekViews || []).length)
      setLastWeekViews((prevWeekViews || []).length)
      setApprovedRefsCount(refsCount || 0)
      setRequests(reqs || [])
      setRecentViewsList(recentViews || [])
    }

    if (looksLikeCoach) {
      const { data: coach } = await supabase.from('coaches').select('*').eq('profile_id', user.id).single()
      if (coach) {
        setCoachData(coach)
        setCoachShareToken(coach.share_token)
        const { count: vacCount } = await supabase.from('vacancies').select('id', { count: 'exact', head: true }).eq('coach_id', coach.id).eq('is_active', true)
        setMyVacancyCount(vacCount || 0)
      }
    }

    const { count: playerCount } = await supabase.from('players').select('id', { count: 'exact', head: true }).eq('profile_visibility', 'PUBLIC').eq('is_test', false)
    setTotalPlayerCount(playerCount || 0)

    setLoading(false)
  }

  function toggleLang(l: Lang) {
    setLang(l)
    localStorage.setItem('gainline_lang', l)
  }

  async function shareCard(requestId: string, coachId: string, coachOrg: string | null) {
    if (!playerId) return
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'shared' } : r))
    await Promise.all([
      supabase.from('cv_requests').update({ status: 'shared', updated_at: new Date().toISOString() }).eq('id', requestId),
      supabase.from('cv_views').insert({ player_id: playerId, coach_id: coachId, organisation_name: coachOrg || null, viewed_at: new Date().toISOString() }),
    ])
  }

  async function declineRequest(requestId: string) {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'declined' } : r))
    await supabase.from('cv_requests').update({ status: 'declined', updated_at: new Date().toISOString() }).eq('id', requestId)
  }

  const T = t[lang]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0C0F16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Arial', color: '#A8A398', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  const isCoach = profile?.role === 'org_user' || !!profile?.is_coach
  const isPlayer = !!playerId || !!profile?.is_player

  // ── Profile completion ────────────────────────────────────────────────────
  const videoCount = [player?.video_url, player?.video_url_2, player?.video_url_3].filter(Boolean).length
  const completionItems = [
    { key: 'video', done: videoCount > 0, title: 'Add highlight video', sub: 'Agents watch video before anything else', impact: '3× more views', impactColor: '#D4A843', href: '/dashboard/profile?tab=video' },
    { key: 'stats', done: player?.matches_played != null, title: 'Add playing stats', sub: 'Tackles, tries, matches — agents filter by these', impact: 'Agents filter by this', impactColor: '#22c98a', href: '/dashboard/profile?tab=career' },
    { key: 'passport', done: !!(player?.passport_countries?.length), title: 'Add passport/s', sub: 'Clubs check eligibility before contacting', impact: 'Eligibility check', impactColor: '#22c98a', href: '/dashboard/profile?tab=profile' },
    { key: 'photo', done: !!(player?.avatar_url), title: 'Add profile photo', sub: 'First thing coaches see', impact: 'High impact', impactColor: '#D4A843', href: '/dashboard/profile?tab=profile' },
    { key: 'career', done: !!(player?.clubs_history?.length), title: 'Add career history', sub: 'Show your club progression', impact: 'Coach context', impactColor: '#22c98a', href: '/dashboard/profile?tab=career' },
    { key: 'ref', done: approvedRefsCount > 0, title: 'Get a reference', sub: 'Verified endorsement from a coach', impact: 'Builds trust', impactColor: '#22c98a', href: '/dashboard/profile?tab=references' },
  ]
  const incomplete = completionItems.filter(i => !i.done)
  const complete = completionItems.filter(i => i.done)
  const profileCompletion = Math.round((complete.length / completionItems.length) * 100)

  // Avatar / initials
  const firstName = player?.first_name || ''
  const lastName = player?.last_name || ''
  const initials = (firstName[0] || '') + (lastName[0] || '')
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : (firstName || 'Your Name')

  // Availability badge
  function availBadge() {
    const avail = player?.availability
    if (!avail || avail === 'available') return { label: 'Available', bg: '#22c98a', color: '#000', border: 'none' }
    if (avail === 'end_of_season') return { label: 'End of season', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '0.5px solid rgba(245,158,11,0.3)' }
    return { label: 'Not available', bg: '#1e2330', color: '#6b7280', border: 'none' }
  }
  const avail = availBadge()

  // Trend
  const trendDiff = weeklyViews - lastWeekViews
  const trendLabel = trendDiff > 0 ? `+${trendDiff} vs last week` : trendDiff < 0 ? `${trendDiff} vs last week` : 'Same as last week'
  const trendColor = trendDiff > 0 ? '#22c98a' : trendDiff < 0 ? '#ef4444' : '#5A564F'
  const trendBg = trendDiff > 0 ? 'rgba(34,201,138,0.12)' : trendDiff < 0 ? 'rgba(239,68,68,0.12)' : 'rgba(90,86,79,0.12)'

  // Stats strip: profile %
  const profilePct = profileCompletion

  // Time ago helper
  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 2) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days === 1) return 'yesterday'
    return `${days}d ago`
  }

  // SVG icons for completion items
  function CompletionIcon({ itemKey }: { itemKey: string }) {
    if (itemKey === 'video') return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none"/>
      </svg>
    )
    if (itemKey === 'stats') return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )
    if (itemKey === 'passport') return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><line x1="15" y1="8" x2="17" y2="8"/><line x1="15" y1="12" x2="17" y2="12"/>
      </svg>
    )
    if (itemKey === 'photo') return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
      </svg>
    )
    if (itemKey === 'career') return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="21" x2="21" y2="21"/><path d="M5 21v-14a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14"/>
      </svg>
    )
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
      </svg>
    )
  }

  // SVG ring circumference for 22px radius
  const circumference = 2 * Math.PI * 22 // ≈ 138.23

  const shareDisplayUrl = playerShareToken ? `gainline.pro/cv/${playerShareToken}` : 'gainline.pro/cv/...'
  const fullShareUrl = playerShareToken ? `${typeof window !== 'undefined' ? window.location.origin : 'https://gainline.pro'}/cv/${playerShareToken}` : ''

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0C0F16; color: #F0EDE4; }
        .dash-nav { background: #111520; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .dash-logo { display: flex; align-items: center; gap: 10px; }
        .dash-logo-text { color: white; font-weight: 900; font-size: 20px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .dash-nav-right { display: flex; align-items: center; gap: 12px; }
        .signout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); padding: 7px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: Arial, sans-serif; white-space: nowrap; }
        .lang-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.08); padding: 3px; border-radius: 8px; }
        .lang-btn { background: transparent; border: none; cursor: pointer; font-size: 16px; width: 30px; height: 26px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .lang-btn-active { background: rgba(255,255,255,0.15); }
        .mob-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; height: 60px; background: #111520; border-top: 0.5px solid rgba(255,255,255,0.08); z-index: 200; padding-bottom: env(safe-area-inset-bottom); }
        .mob-nav-inner { display: flex; align-items: stretch; height: 100%; }
        .mob-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 700; font-family: Arial, sans-serif; letter-spacing: 0.04em; transition: color 0.15s; }
        .mob-nav-item:hover, .mob-nav-item-active { color: #1D9E75; }
        .mob-nav-item svg { display: block; }
        @media (max-width: 768px) {
          .dash-nav { padding: 0 16px; height: 56px; }
          .dash-logo-text { font-size: 17px; }
          .signout-btn { font-size: 12px; padding: 6px 12px; }
          .dash-nav-hide-sm { display: none; }
          .mob-nav { display: block; }
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
          <a href="/vacancies" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' }} className="dash-nav-hide-sm">Vacancies</a>
          {isCoach && <a href="/dashboard/vacancies" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' }} className="dash-nav-hide-sm">Post Vacancy</a>}
          <div className="lang-toggle">
            <button className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('en')}>{FLAG_EN}</button>
            <button className={`lang-btn ${lang === 'fr' ? 'lang-btn-active' : ''}`} onClick={() => toggleLang('fr')}>{FLAG_FR}</button>
          </div>
          <form action="/auth/signout" method="post" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a href="/dashboard/settings" title="Settings" style={{ color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="2.5"/>
                <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/>
              </svg>
            </a>
            <button type="submit" className="signout-btn">{T.nav_sign_out}</button>
          </form>
        </div>
      </nav>

      <div style={{ minHeight: '100vh', background: '#0C0F16' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 80px' }}>

          {/* ── SECTION A — Profile hero card ──────────────────────────────── */}
          {isPlayer && (
            <div style={{ background: '#161C2A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>

              {/* A1 — Identity row */}
              <div style={{ background: 'linear-gradient(160deg, #0D1B2E 0%, #0F2E1E 100%)', padding: '20px', position: 'relative' }}>
                <a href="/dashboard/profile" style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#F0EDE4', fontSize: '11px', padding: '5px 12px', borderRadius: '6px', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}>
                  Edit profile
                </a>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  {/* Avatar */}
                  <div style={{ width: 72, height: 72, borderRadius: '14px', overflow: 'hidden', flexShrink: 0, background: '#1C2338', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {player?.avatar_url ? (
                      <img src={player.avatar_url} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '26px', color: '#22c98a', fontWeight: 900 }}>{initials || '?'}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingTop: '4px' }}>
                    <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '22px', color: '#F0EDE4', fontWeight: 900, marginBottom: '8px', paddingRight: '90px' }}>{displayName}</div>
                    {/* Badge row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {player?.position_primary && (
                        <span style={{ background: 'rgba(34,201,138,0.15)', color: '#22c98a', border: '0.5px solid rgba(34,201,138,0.3)', fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', fontFamily: 'Arial, sans-serif' }}>
                          {player.position_primary.replace(/_/g, ' ')}
                        </span>
                      )}
                      {player?.nationality_primary && (
                        <span style={{ background: 'rgba(168,163,152,0.1)', color: '#A8A398', fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px', fontFamily: 'Arial, sans-serif' }}>
                          {player.nationality_primary}
                        </span>
                      )}
                      <span style={{ background: avail.bg, color: avail.color, border: avail.border, fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', fontFamily: 'Arial, sans-serif' }}>
                        {avail.label}
                      </span>
                    </div>
                    {/* Club · height · weight */}
                    <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Arial, sans-serif' }}>
                      {[
                        player?.current_club,
                        player?.height_cm ? `${player.height_cm} cm` : null,
                        player?.weight_kg ? `${player.weight_kg} kg` : null,
                      ].filter(Boolean).join(' · ') || 'Complete your profile to add details'}
                    </div>
                  </div>
                </div>
              </div>

              {/* A2 — Stat strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { value: `${profilePct}%`, label: 'PROFILE', color: '#D4A843' },
                  { value: String(totalViews), label: 'CARD VIEWS', color: '#F0EDE4' },
                  { value: String(videoCount), label: 'VIDEOS', color: '#F0EDE4' },
                  { value: String(approvedRefsCount), label: 'REFERENCES', color: '#22c98a' },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '12px 0', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
                    <div style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '20px', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#5A564F', letterSpacing: '1px', marginTop: '2px', fontFamily: 'Arial, sans-serif' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* A3 — Views bar + recent viewers */}
              <div style={{ padding: '12px 20px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Count row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '28px', fontWeight: 900, color: 'white' }}>{weeklyViews}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#A8A398', fontFamily: 'Arial, sans-serif' }}>coaches viewed your card this week</div>
                    <div style={{ fontSize: '10px', color: '#5A564F', fontFamily: 'Arial, sans-serif', marginTop: '2px' }}>{totalViews} total views</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: trendBg, color: trendColor, fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
                    {trendLabel}
                  </span>
                </div>
                {/* Toggle + collapsible viewer list */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', paddingBottom: '4px' }}>
                  {recentViewsList.length > 0 ? (
                    <>
                      <button
                        onClick={() => setViewsExpanded(v => !v)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#1D9E75', fontFamily: 'Arial, sans-serif', padding: '0 0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {viewsExpanded ? 'Hide views ↑' : `Show recent views ↓`}
                      </button>
                      {viewsExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '8px' }}>
                          {recentViewsList.map((view, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1C2338', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="8" r="4"/><path d="M6 20v-1a6 6 0 0 1 12 0v1"/>
                                </svg>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '12px', color: '#F0EDE4', fontWeight: 600, fontFamily: 'Arial, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {view.organisation_name || 'Anonymous viewer'}
                                </div>
                              </div>
                              <div style={{ fontSize: '10px', color: '#5A564F', fontFamily: 'Arial, sans-serif', flexShrink: 0 }}>
                                {timeAgo(view.viewed_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#5A564F', fontFamily: 'Arial, sans-serif', paddingBottom: '8px' }}>
                      No views yet — share your card to get noticed
                    </div>
                  )}
                </div>
              </div>

              {/* A4 — Share row */}
              <div style={{ padding: '12px 20px', background: 'rgba(29,158,117,0.06)', borderTop: '1px solid rgba(29,158,117,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
                  {shareDisplayUrl}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => { navigator.clipboard.writeText(fullShareUrl); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 1800) }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#A8A398', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}
                  >
                    {copiedLink ? 'Copied!' : 'Copy link'}
                  </button>
                  <button
                    onClick={() => setShowShare(true)}
                    style={{ background: '#1D9E75', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION: Requests ────────────────────────────────────────── */}
          {isPlayer && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#5A564F', letterSpacing: '2px', fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>REQUESTS</span>
                {requests.filter(r => r.status === 'pending').length > 0 && (
                  <span style={{ background: '#22c98a', color: '#000', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px', fontFamily: 'Arial, sans-serif' }}>
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </div>
              <div style={{ background: '#161C2A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                {requests.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#5A564F', fontFamily: 'Arial, sans-serif' }}>No requests yet — coaches will appear here when they request your Player Card</div>
                  </div>
                ) : (
                  requests.map((req, i) => {
                    const isPending = req.status === 'pending'
                    const isShared = req.status === 'shared'
                    return (
                      <div key={req.id} style={{ padding: '14px 16px', borderBottom: i < requests.length - 1 ? '1px solid rgba(255,255,255,0.06)' : undefined, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Avatar icon */}
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1C2338', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        {/* Coach info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', color: '#F0EDE4', fontWeight: 600, fontFamily: 'Arial, sans-serif' }}>{req.coach_name || 'A coach'}</div>
                          {req.coach_org && (
                            <div style={{ fontSize: '11px', color: '#A8A398', fontFamily: 'Arial, sans-serif', marginTop: '1px' }}>{req.coach_org}</div>
                          )}
                          <div style={{ fontSize: '10px', color: '#5A564F', fontFamily: 'Arial, sans-serif', marginTop: '2px' }}>{timeAgo(req.created_at)}</div>
                        </div>
                        {/* Actions / status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {isPending ? (
                            <>
                              <button
                                onClick={() => declineRequest(req.id)}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#6b7280', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => shareCard(req.id, req.coach_id, req.coach_org)}
                                style={{ background: '#1D9E75', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
                              >
                                Share card
                              </button>
                            </>
                          ) : (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '20px',
                              fontFamily: 'Arial, sans-serif',
                              ...(isShared
                                ? { background: 'rgba(34,201,138,0.12)', color: '#22c98a' }
                                : { background: 'rgba(107,114,128,0.12)', color: '#6b7280' }
                              ),
                            }}>
                              {isShared ? 'Shared' : 'Declined'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* ── SECTION B — Complete your profile ─────────────────────────── */}
          {isPlayer && (
            <div style={{ marginBottom: '20px' }}>
              {/* Section header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#5A564F', letterSpacing: '2px', fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>COMPLETE YOUR PROFILE</span>
                {playerShareToken && (
                  <a href={`/cv/${playerShareToken}`} target="_blank" style={{ color: '#1D9E75', fontSize: '12px', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}>View public card →</a>
                )}
              </div>

              {/* Completion card */}
              <div style={{ background: '#161C2A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  {/* SVG ring */}
                  <svg width="52" height="52" viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
                    <circle cx="26" cy="26" r="22" fill="none" stroke="#1C2338" strokeWidth="5"/>
                    <circle
                      cx="26" cy="26" r="22"
                      fill="none"
                      stroke="#D4A843"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${(profileCompletion / 100) * circumference} ${circumference}`}
                      style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
                    />
                    <text x="26" y="31" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="13" fontWeight="900" fill="#D4A843">{profileCompletion}%</text>
                  </svg>
                  <div>
                    <div style={{ fontSize: '13px', color: '#F0EDE4', fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>
                      {incomplete.length > 0 ? `${incomplete.length} things will make a big difference` : 'Profile complete!'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#5A564F', fontFamily: 'Arial, sans-serif', marginTop: '2px' }}>Complete profiles get 3× more coach views</div>
                  </div>
                </div>

                {/* Incomplete items */}
                {incomplete.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {incomplete.map(item => (
                      <a key={item.key} href={item.href} style={{
                        background: '#1C2338',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        position: 'relative',
                        overflow: 'hidden',
                        textDecoration: 'none',
                      }}>
                        {/* Left accent bar */}
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: item.impactColor }} />
                        {/* Icon */}
                        <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: item.impactColor }}>
                          <CompletionIcon itemKey={item.key} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', color: '#F0EDE4', fontWeight: 600, fontFamily: 'Arial, sans-serif' }}>{item.title}</div>
                          <div style={{ fontSize: '10px', color: '#5A564F', fontFamily: 'Arial, sans-serif', marginTop: '1px' }}>{item.sub}</div>
                        </div>
                        {/* Impact pill */}
                        <span style={{
                          fontSize: '9px',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: `${item.impactColor}1f`,
                          color: item.impactColor,
                          border: `0.5px solid ${item.impactColor}4d`,
                          fontWeight: 700,
                          fontFamily: 'Arial, sans-serif',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}>{item.impact}</span>
                        {/* Chevron */}
                        <span style={{ color: '#5A564F', fontSize: '14px', flexShrink: 0 }}>›</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Completed items */}
                {complete.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '10px', paddingTop: '10px' }}>
                    {complete.slice(0, 3).map(item => (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5, marginBottom: '5px' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#22c98a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1.5,4 3,5.5 6.5,2" stroke="black" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <span style={{ fontSize: '11px', color: '#A8A398', fontFamily: 'Arial, sans-serif' }}>{item.title}</span>
                      </div>
                    ))}
                    {complete.length > 3 && (
                      <div style={{ fontSize: '10px', color: '#5A564F', fontFamily: 'Arial, sans-serif', marginTop: '4px' }}>and {complete.length - 3} more complete</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SECTION C — As a Coach ────────────────────────────────────── */}
          {isCoach && (
            <div style={{ marginBottom: '20px' }}>
              {/* Section header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#5A564F', letterSpacing: '2px', fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>AS A COACH</span>
                {coachShareToken && (
                  <a href={`/coach/${coachShareToken}`} style={{ color: '#1D9E75', fontSize: '12px', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}>Share Coach Card →</a>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                {/* Card 1 — My Coach Card */}
                <a href="/dashboard/coach-profile" style={{ background: '#161C2A', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '12px', padding: '14px 12px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(212,168,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="16,11 18,13 22,9"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '13px', color: '#F0EDE4', fontWeight: 700, fontFamily: 'Arial, sans-serif', marginBottom: '4px' }}>My Coach Card</div>
                  <div style={{ fontSize: '11px', color: '#5A564F', fontFamily: 'Arial, sans-serif' }}>Edit credentials and history</div>
                </a>

                {/* Card 2 — Browse players */}
                <a href="/dashboard/coach" style={{ background: '#161C2A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 12px', textDecoration: 'none', display: 'block', position: 'relative' }}>
                  {totalPlayerCount > 0 && (
                    <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', background: 'rgba(34,201,138,0.15)', color: '#22c98a', fontFamily: 'Arial, sans-serif' }}>
                      {totalPlayerCount} players
                    </span>
                  )}
                  <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(34,201,138,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c98a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="7" cy="8" r="3"/><path d="M1 18c0-2.8 2.2-5 5-5h3"/><circle cx="17" cy="8" r="3"/><path d="M23 18c0-2.8-2.2-5-5-5h-3"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '13px', color: '#F0EDE4', fontWeight: 700, fontFamily: 'Arial, sans-serif', marginBottom: '4px' }}>Browse players</div>
                  <div style={{ fontSize: '11px', color: '#5A564F', fontFamily: 'Arial, sans-serif' }}>Search and shortlist talent</div>
                </a>

                {/* Card 3 — Post a vacancy */}
                <a href="/dashboard/vacancies" style={{ background: '#161C2A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 12px', textDecoration: 'none', display: 'block', position: 'relative' }}>
                  {myVacancyCount > 0 && (
                    <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', background: 'rgba(212,168,67,0.15)', color: '#D4A843', fontFamily: 'Arial, sans-serif' }}>
                      {myVacancyCount} live
                    </span>
                  )}
                  <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(107,114,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '13px', color: '#F0EDE4', fontWeight: 700, fontFamily: 'Arial, sans-serif', marginBottom: '4px' }}>Post a vacancy</div>
                  <div style={{ fontSize: '11px', color: '#5A564F', fontFamily: 'Arial, sans-serif' }}>List open positions</div>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>

      <ShareModal shareUrl={shareUrl} isOpen={showShare} onClose={() => setShowShare(false)} />

      {/* Mobile bottom navigation */}
      <div className="mob-nav">
        <div className="mob-nav-inner">
          <a href="/dashboard" className="mob-nav-item mob-nav-item-active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
              <path d="M7 18V11h6v7"/>
            </svg>
            Home
          </a>
          <a href="/vacancies" className="mob-nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="16" height="13" rx="2"/>
              <path d="M6 5V4a2 2 0 012-2h4a2 2 0 012 2v1"/>
              <line x1="7" y1="11" x2="13" y2="11"/>
              <line x1="7" y1="14" x2="11" y2="14"/>
            </svg>
            Vacancies
          </a>
          {isCoach && (
            <a href="/dashboard/coach" className="mob-nav-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7" cy="6" r="3"/>
                <path d="M1 18c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                <circle cx="15" cy="7" r="2.5"/>
                <path d="M13 18c0-2.2 0.9-4.2 2.3-5.5"/>
              </svg>
              Players
            </a>
          )}
          <a href={playerShareToken ? `/cv/${playerShareToken}` : '/onboarding'} className="mob-nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="6" r="3.5"/>
              <path d="M3 18c0-3.3 3.1-6 7-6s7 2.7 7 6"/>
            </svg>
            Profile
          </a>
        </div>
      </div>
    </>
  )
}
