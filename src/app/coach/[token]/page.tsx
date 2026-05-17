export const dynamic = 'force-dynamic'

async function getCoach(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/coaches?share_token=eq.' + token + '&select=*'
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    cache: 'no-store',
  })
  const data = await res.json()
  return data?.[0] || null
}

async function getCredentials(coachId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/coaching_credentials?coach_id=eq.' + coachId + '&order=order_index.asc&select=*'
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    cache: 'no-store',
  })
  return res.json()
}

async function getHistory(coachId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/coaching_history?coach_id=eq.' + coachId + '&order=order_index.asc&select=*'
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    cache: 'no-store',
  })
  return res.json()
}

export default async function CoachCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const coach = await getCoach(token)

  if (!coach) {
    return (
      <>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Arial, sans-serif; background: #F5F2EB; }`}</style>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <p style={{ fontSize: '16px', color: '#5F5E5A' }}>Coach card not found.</p>
          <a href="/" style={{ fontSize: '13px', color: '#1D9E75' }}>Back to Gainline</a>
        </div>
      </>
    )
  }

  const [credentials, history] = await Promise.all([
    getCredentials(coach.id),
    getHistory(coach.id),
  ])

  // Stat strip values
  const yearsExp = history && history.length > 0
    ? (2026 - Math.min(...history.map((h: any) => h.start_year || 2026))) + ' yrs'
    : null
  const credCount = credentials && credentials.length > 0 ? credentials.length : null
  const topCredential = credentials?.[0]?.credential_type || null
  const historyCount = history && history.length > 0 ? history.length : null

  const hasVideo = !!coach.video_url
  const hasPlaying = coach.played_position || coach.played_club || coach.played_era || coach.played_level
  const hasCredentials = credentials && credentials.length > 0
  const hasHistory = history && history.length > 0

  // Embed video helper (same as CV page)
  function getVideoEmbed(url: string) {
    if (!url) return null
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`
    const vm = url.match(/vimeo\.com\/(\d+)/)
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`
    return null
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F5F2EB; color: #0D1B2E; }
        .cc-wrap { max-width: 780px; margin: 0 auto; padding: 40px 20px 80px; }
        /* hero */
        .cc-hero { background: #0D1B2E; border-radius: 16px; padding: 40px; margin-bottom: 20px; display: flex; gap: 32px; align-items: flex-start; }
        .cc-avatar { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 3px solid rgba(212,168,67,0.3); }
        .cc-avatar-placeholder { width: 96px; height: 96px; border-radius: 50%; background: rgba(212,168,67,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cc-hero-body { flex: 1; }
        .cc-hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(212,168,67,0.15); border: 1px solid rgba(212,168,67,0.25); border-radius: 20px; padding: 3px 10px; margin-bottom: 10px; }
        .cc-hero-badge span { font-size: 10px; color: #D4A843; font-weight: 700; letter-spacing: 0.1em; }
        .cc-name { font-size: 28px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 4px; }
        .cc-role { font-size: 15px; color: rgba(255,255,255,0.6); margin-bottom: 12px; }
        .cc-meta-row { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 14px; }
        .cc-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255,255,255,0.5); }
        .cc-meta-item svg { opacity: 0.5; flex-shrink: 0; }
        .cc-links { display: flex; gap: 10px; flex-wrap: wrap; }
        .cc-link-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; border-radius: 20px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 700; text-decoration: none; border: 1px solid rgba(255,255,255,0.1); }
        .cc-link-btn:hover { background: rgba(255,255,255,0.13); }
        /* section cards */
        .cc-card { background: white; border-radius: 12px; padding: 28px; margin-bottom: 16px; }
        .cc-section-label { font-size: 10px; color: #D4A843; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 14px; }
        .cc-bio { font-size: 14px; color: #3A3834; line-height: 1.75; }
        .cc-philosophy { font-size: 14px; color: #5F5E5A; line-height: 1.75; font-style: italic; border-left: 3px solid #D4A843; padding-left: 16px; margin-top: 12px; }
        .cc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .cc-tag { display: inline-block; background: #F0EDE4; border-radius: 20px; padding: 4px 12px; font-size: 12px; color: #5F5E5A; font-weight: 600; }
        .cc-tag-gold { background: rgba(212,168,67,0.1); color: #A07A18; }
        /* video */
        .cc-video-wrap { border-radius: 10px; overflow: hidden; background: #0D1B2E; aspect-ratio: 16/9; }
        .cc-video-wrap iframe { width: 100%; height: 100%; border: none; display: block; }
        /* credential list */
        .cred-list { display: flex; flex-direction: column; gap: 10px; }
        .cred-item { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; background: #F8F7F4; border-radius: 8px; }
        .cred-icon { width: 32px; height: 32px; border-radius: 6px; background: rgba(212,168,67,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cred-type { font-size: 13px; font-weight: 700; color: #0D1B2E; }
        .cred-issuer { font-size: 12px; color: #888780; margin-top: 2px; }
        .cred-year { font-size: 11px; color: #D4A843; font-weight: 700; margin-left: auto; padding-top: 2px; white-space: nowrap; }
        /* history timeline */
        .hist-list { display: flex; flex-direction: column; gap: 14px; }
        .hist-item { display: flex; gap: 16px; }
        .hist-line-col { display: flex; flex-direction: column; align-items: center; padding-top: 4px; }
        .hist-dot { width: 10px; height: 10px; border-radius: 50%; background: #D4A843; flex-shrink: 0; }
        .hist-line { flex: 1; width: 1.5px; background: rgba(212,168,67,0.2); margin-top: 4px; }
        .hist-body { flex: 1; padding-bottom: 8px; }
        .hist-period { font-size: 11px; color: #D4A843; font-weight: 700; margin-bottom: 2px; }
        .hist-club { font-size: 14px; font-weight: 700; color: #0D1B2E; }
        .hist-role { font-size: 13px; color: #888780; margin-bottom: 4px; }
        .hist-level-badge { display: inline-block; background: #F0EDE4; border-radius: 20px; padding: 2px 10px; font-size: 11px; color: #888780; margin-bottom: 8px; }
        .hist-achievements { font-size: 13px; color: #5F5E5A; line-height: 1.6; }
        /* playing bg */
        .play-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .play-stat { background: #F8F7F4; border-radius: 8px; padding: 14px 16px; }
        .play-stat-label { font-size: 10px; color: #888780; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 4px; }
        .play-stat-val { font-size: 16px; font-weight: 700; color: #0D1B2E; }
        /* stat strip */
        .cc-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; margin-top: 20px; }
        .cc-stat { background: rgba(255,255,255,0.04); padding: 12px 14px; text-align: center; }
        .cc-stat-val { font-size: 16px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; }
        .cc-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; margin-top: 2px; }
        /* footer */
        .cc-footer { text-align: center; margin-top: 40px; }
        .cc-footer-logo { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
        .cc-footer-text { font-size: 13px; font-weight: 900; color: #888780; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.3px; }
        @media (max-width: 600px) {
          .cc-hero { flex-direction: column; gap: 20px; padding: 28px 20px; }
          .cc-name { font-size: 22px; }
          .cc-card { padding: 20px; }
          .play-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Nav strip */}
      <div style={{ background: '#0D1B2E', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="28" height="26" viewBox="0 0 28 26">
            <line x1="2" y1="24" x2="8" y2="5" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.28"/>
            <line x1="11" y1="24" x2="17" y2="2" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.58"/>
            <line x1="20" y1="24" x2="26" y2="0" stroke="#1D9E75" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <span style={{ color: 'white', fontWeight: 900, fontSize: '17px', fontFamily: 'Arial Black, Arial, sans-serif', letterSpacing: '-0.3px' }}>
            GAIN<span style={{ color: '#1D9E75' }}>LINE</span>
          </span>
        </a>
        <a href="/register/coach" style={{ padding: '6px 16px', borderRadius: '20px', background: '#1D9E75', color: 'white', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}>
          Join Gainline →
        </a>
      </div>

      <div className="cc-wrap">

        {/* ── HERO ── */}
        <div className="cc-hero">
          {coach.headshot_url ? (
            <img src={coach.headshot_url} alt={coach.full_name || 'Coach'} className="cc-avatar" />
          ) : (
            <div className="cc-avatar-placeholder">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="20" cy="14" r="8"/>
                <path d="M4 38c0-8.8 7.2-16 16-16s16 7.2 16 16"/>
              </svg>
            </div>
          )}
          <div className="cc-hero-body">
            <div className="cc-hero-badge">
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#D4A843' }}></div>
              <span>COACH CARD</span>
            </div>
            <h1 className="cc-name">{coach.full_name || 'Coach'}</h1>
            {coach.role_title && <p className="cc-role">{coach.role_title}{coach.organisation ? ` · ${coach.organisation}` : ''}</p>}
            <div className="cc-meta-row">
              {coach.country && (
                <span className="cc-meta-item">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 2a9.5 9.5 0 010 12M2 8h12"/></svg>
                  {coach.country}
                </span>
              )}
              {coach.org_type && (
                <span className="cc-meta-item">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="5" width="12" height="9" rx="1.5"/><path d="M5 5V3.5a3 3 0 016 0V5"/></svg>
                  {coach.org_type}
                </span>
              )}
            </div>
            {(yearsExp || credCount || historyCount || coach.org_type) && (
              <div className="cc-stats">
                {yearsExp && <div className="cc-stat"><div className="cc-stat-val">{yearsExp}</div><div className="cc-stat-lbl">EXPERIENCE</div></div>}
                {credCount && <div className="cc-stat"><div className="cc-stat-val">{credCount}</div><div className="cc-stat-lbl">LICENCES</div></div>}
                {historyCount && <div className="cc-stat"><div className="cc-stat-val">{historyCount}</div><div className="cc-stat-lbl">CLUBS COACHED</div></div>}
                {coach.org_type && <div className="cc-stat"><div className="cc-stat-val" style={{ fontSize: '11px', paddingTop: '2px' }}>{coach.org_type}</div><div className="cc-stat-lbl">ORG TYPE</div></div>}
              </div>
            )}
            {(coach.linkedin_url || coach.video_url) && (
              <div className="cc-links">
                {coach.linkedin_url && (
                  <a href={coach.linkedin_url} target="_blank" rel="noopener noreferrer" className="cc-link-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                    LinkedIn
                  </a>
                )}
                {coach.video_url && (
                  <a href={coach.video_url} target="_blank" rel="noopener noreferrer" className="cc-link-btn">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5,3 13,8 5,13"/></svg>
                    Video highlights
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── VIDEO EMBED ── */}
        {hasVideo && (() => {
          const embedUrl = getVideoEmbed(coach.video_url)
          return embedUrl ? (
            <div className="cc-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="cc-video-wrap">
                <iframe src={embedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            </div>
          ) : null
        })()}

        {/* ── BIO & PHILOSOPHY ── */}
        {(coach.bio || coach.philosophy || coach.coaching_style || coach.specialties) && (
          <div className="cc-card">
            <div className="cc-section-label">ABOUT</div>
            {coach.bio && <p className="cc-bio">{coach.bio}</p>}
            {coach.philosophy && <p className="cc-philosophy">{coach.philosophy}</p>}
            {(coach.coaching_style || coach.specialties) && (
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {coach.coaching_style && (
                  <div>
                    <div style={{ fontSize: '10px', color: '#888780', letterSpacing: '0.1em', fontWeight: '700', marginBottom: '6px' }}>COACHING STYLE</div>
                    <div className="cc-tags"><span className="cc-tag cc-tag-gold">{coach.coaching_style}</span></div>
                  </div>
                )}
                {coach.specialties && (
                  <div>
                    <div style={{ fontSize: '10px', color: '#888780', letterSpacing: '0.1em', fontWeight: '700', marginBottom: '6px' }}>SPECIALTIES</div>
                    <div className="cc-tags">
                      {coach.specialties.split(',').map((s: string) => (
                        <span key={s} className="cc-tag">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CREDENTIALS ── */}
        {hasCredentials && (
          <div className="cc-card">
            <div className="cc-section-label">LICENCES & QUALIFICATIONS</div>
            <div className="cred-list">
              {credentials.map((c: any, i: number) => (
                <div key={i} className="cred-item">
                  <div className="cred-icon">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4L8 11l-3.6 2 .7-4L2.2 6.2l4-.6z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="cred-type">{c.credential_type}</div>
                    {c.issuer && <div className="cred-issuer">{c.issuer}</div>}
                    {c.notes && <div style={{ fontSize: '12px', color: '#A8A398', marginTop: '2px' }}>{c.notes}</div>}
                  </div>
                  {c.year && <div className="cred-year">{c.year}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COACHING HISTORY ── */}
        {hasHistory && (
          <div className="cc-card">
            <div className="cc-section-label">COACHING HISTORY</div>
            <div className="hist-list">
              {history.map((h: any, i: number) => (
                <div key={i} className="hist-item">
                  <div className="hist-line-col">
                    <div className="hist-dot"></div>
                    {i < history.length - 1 && <div className="hist-line"></div>}
                  </div>
                  <div className="hist-body">
                    <div className="hist-period">
                      {h.start_year}{h.end_year ? `–${h.end_year}` : '–present'}
                    </div>
                    <div className="hist-club">{h.club}</div>
                    {h.role && <div className="hist-role">{h.role}</div>}
                    {h.level && <span className="hist-level-badge">{h.level}</span>}
                    {h.key_achievements && <p className="hist-achievements">{h.key_achievements}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PLAYING BACKGROUND ── */}
        {hasPlaying && (
          <div className="cc-card">
            <div className="cc-section-label">PLAYING BACKGROUND</div>
            <div className="play-grid">
              {coach.played_position && (
                <div className="play-stat">
                  <div className="play-stat-label">POSITION</div>
                  <div className="play-stat-val">{coach.played_position}</div>
                </div>
              )}
              {coach.played_level && (
                <div className="play-stat">
                  <div className="play-stat-label">HIGHEST LEVEL</div>
                  <div className="play-stat-val">{coach.played_level}</div>
                </div>
              )}
              {coach.played_club && (
                <div className="play-stat">
                  <div className="play-stat-label">CLUB(S)</div>
                  <div className="play-stat-val">{coach.played_club}</div>
                </div>
              )}
              {coach.played_era && (
                <div className="play-stat">
                  <div className="play-stat-label">ERA</div>
                  <div className="play-stat-val">{coach.played_era}</div>
                </div>
              )}
              {coach.played_nationality && (
                <div className="play-stat">
                  <div className="play-stat-label">NATIONALITY</div>
                  <div className="play-stat-val">{coach.played_nationality}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="cc-footer">
          <a href="/" className="cc-footer-logo">
            <svg width="22" height="20" viewBox="0 0 22 20">
              <line x1="1" y1="18" x2="6" y2="4" stroke="#888780" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
              <line x1="9" y1="18" x2="14" y2="2" stroke="#888780" strokeWidth="3" strokeLinecap="round" opacity="0.65"/>
              <line x1="17" y1="18" x2="22" y2="0" stroke="#1D9E75" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span className="cc-footer-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
          </a>
          <p style={{ fontSize: '12px', color: '#B4B2A9', marginTop: '8px' }}>Rugby coach profiles & player management</p>
        </div>

      </div>
    </>
  )
}
