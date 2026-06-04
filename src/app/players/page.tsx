export const dynamic = 'force-dynamic'

async function getPlayers() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/players?select=first_name,last_name,position_primary,position_secondary,nationality_primary,date_of_birth,height_cm,weight_kg,avatar_url,share_token,id,availability,matches_played,tries_scored&profile_visibility=eq.PUBLIC&is_test=eq.false&first_name=not.is.null&last_name=not.is.null&nationality_primary=not.is.null&position_primary=not.is.null&order=created_at.desc'
    const res = await fetch(url, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      cache: 'no-store'
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function getViewCounts() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/cv_views?select=player_id'
    const res = await fetch(url, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      cache: 'no-store'
    })
    if (!res.ok) return {}
    const views = await res.json()
    const counts: Record<string, number> = {}
    if (Array.isArray(views)) {
      views.forEach((v: any) => { counts[v.player_id] = (counts[v.player_id] || 0) + 1 })
    }
    return counts
  } catch {
    return {}
  }
}

export default async function PlayersPage() {
  const [players, viewCounts] = await Promise.all([getPlayers(), getViewCounts()])
  const sorted = [...(players || [])].sort((a: any, b: any) => (viewCounts[b.id] || 0) - (viewCounts[a.id] || 0))

  const pos = (s: string) => s?.replace(/_/g, ' ') || '–'
  const getAge = (dob: string) => dob ? Math.floor((new Date().getTime() - new Date(dob).getTime()) / 31557600000) : null
  const fmt = (v: number | null | undefined, unit = '') => (v != null && v > 0) ? `${v}${unit}` : '—'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #0C0F16; }

        /* NAV */
        .dir-nav { background: #111520; border-bottom: 0.5px solid rgba(255,255,255,0.06); padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .dir-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; min-width: 0; flex-shrink: 0; }
        .dir-logo-text { color: white; font-weight: 900; font-size: 20px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; white-space: nowrap; }
        .dir-nav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .dir-nav-btn { background: #2ec97e; color: white; border: none; border-radius: 20px; padding: 8px 18px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; text-decoration: none; display: inline-block; white-space: nowrap; }
        .dir-nav-login { background: transparent; color: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 7px 16px; font-size: 13px; cursor: pointer; font-family: Arial, sans-serif; text-decoration: none; display: inline-block; white-space: nowrap; }

        /* HERO */
        .dir-hero { background: #0D1B2E; padding: 48px 28px; text-align: center; }
        .dir-hero-label { font-size: 10px; color: #5DCAA5; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 10px; }
        .dir-hero-title { font-size: 36px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -1px; margin-bottom: 10px; line-height: 1.1; }
        .dir-hero-sub { font-size: 15px; color: rgba(255,255,255,0.5); max-width: 500px; margin: 0 auto 24px; line-height: 1.6; }
        .dir-hero-stats { display: flex; justify-content: center; gap: 32px; margin-bottom: 28px; }
        .dir-stat-val { font-size: 28px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; line-height: 1; }
        .dir-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 3px; }
        .dir-cta { display: inline-flex; align-items: center; gap: 7px; background: #2ec97e; color: white; border: none; border-radius: 20px; padding: 12px 28px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; text-decoration: none; }

        /* GRID */
        .dir-content { max-width: 1300px; margin: 0 auto; padding: 32px 28px 60px; }
        .dir-section-title { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.14em; font-weight: 700; margin-bottom: 16px; }
        .dir-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; align-items: stretch; }

        /* CARD */
        .dir-card { background: #131720; border-radius: 12px; border: 0.5px solid #1e2330; overflow: hidden; display: flex; flex-direction: column; }

        /* Zone 1 — Header */
        .dir-card-header { padding: 16px 16px 12px; }
        .dir-avatar { width: 48px; height: 48px; border-radius: 10px; background: #1e2330; border: 0.5px solid #2a2d35; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 10px; flex-shrink: 0; }
        .dir-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .dir-card-name { font-size: 15px; font-weight: 700; color: #F0EDE4; margin-bottom: 6px; line-height: 1.2; }
        .dir-badges { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-bottom: 6px; }
        .dir-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; border-radius: 20px; padding: 3px 8px; letter-spacing: 0.03em; }
        .dir-badge-pos { background: rgba(34,201,138,0.12); color: #22c98a; border: 0.5px solid rgba(34,201,138,0.3); }
        .dir-badge-available { background: #22c98a; color: #000; }
        .dir-badge-eos { background: rgba(245,158,11,0.15); color: #f59e0b; border: 0.5px solid rgba(245,158,11,0.3); }
        .dir-badge-unavailable { background: #1e2330; color: #6b7280; border: 0.5px solid rgba(255,255,255,0.06); }
        .dir-card-meta { font-size: 12px; color: #6b7280; }

        /* Zone 2 — Stats bar */
        .dir-stats-bar { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 0.5px solid #1e2330; border-bottom: 0.5px solid #1e2330; }
        .dir-stat-cell { padding: 10px 0; text-align: center; position: relative; }
        .dir-stat-cell + .dir-stat-cell::before { content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 0.5px; background: #1e2330; }
        .dir-stat-num { font-size: 15px; font-weight: 900; color: #F0EDE4; font-family: 'Arial Black', Arial, sans-serif; line-height: 1; }
        .dir-stat-num-dash { font-size: 15px; font-weight: 900; color: #2a2d35; font-family: 'Arial Black', Arial, sans-serif; line-height: 1; }
        .dir-stat-key { font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; margin-top: 3px; }

        /* Zone 3 — Detail rows */
        .dir-details { padding: 10px 16px; display: flex; flex-direction: column; gap: 0; flex: 1; }
        .dir-detail-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 0.5px solid rgba(255,255,255,0.04); }
        .dir-detail-row:last-child { border-bottom: none; }
        .dir-detail-icon { width: 16px; height: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; opacity: 0.4; }
        .dir-detail-label { font-size: 11px; color: rgba(255,255,255,0.3); flex: 1; }
        .dir-detail-value { font-size: 11px; color: rgba(255,255,255,0.65); font-weight: 600; text-align: right; }
        .dir-detail-dash { font-size: 11px; color: #2a2d35; text-align: right; }

        /* Zone 4 — Footer CTA */
        .dir-card-footer { padding: 12px 16px; border-top: 0.5px solid #1e2330; margin-top: auto; }
        .dir-cta-btn { display: block; width: 100%; padding: 9px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; text-align: center; text-decoration: none; cursor: pointer; border: none; font-family: Arial, sans-serif; }
        .dir-cta-outline { background: transparent; border: 0.5px solid rgba(34,201,138,0.35); color: #22c98a; }

        /* Empty / footer */
        .dir-empty { text-align: center; padding: 60px 20px; }
        .dir-empty h3 { font-size: 18px; font-weight: 900; color: rgba(255,255,255,0.75); font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 8px; }
        .dir-empty p { font-size: 14px; color: rgba(255,255,255,0.35); }
        .dir-footer { background: #111520; border-top: 0.5px solid rgba(255,255,255,0.06); padding: 32px 28px; text-align: center; }
        .dir-footer-brand { font-size: 18px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 6px; }
        .dir-footer-tag { font-size: 12px; color: rgba(255,255,255,0.25); margin-bottom: 16px; }
        .dir-footer-cta { display: inline-block; background: #2ec97e; color: white; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-family: Arial, sans-serif; }

        /* Responsive */
        @media (max-width: 900px) {
          .dir-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
        @media (max-width: 768px) {
          .dir-nav { padding: 0 16px; height: 56px; }
          .dir-logo-text { font-size: 17px; }
          .dir-nav-login { display: none; }
          .dir-hero { padding: 36px 16px; }
          .dir-hero-title { font-size: 26px; }
          .dir-content { padding: 24px 16px 40px; }
          .dir-grid { grid-template-columns: 1fr; gap: 10px; }
        }
      `}</style>

      <nav className="dir-nav">
        <a href="/" className="dir-logo">
          <svg width="28" height="26" viewBox="0 0 32 30" style={{ display: 'block', flexShrink: 0 }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#2ec97e" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="dir-logo-text">GAIN<span style={{ color: '#2ec97e' }}>LINE</span></span>
        </a>
        <div className="dir-nav-right">
          <a href="/vacancies" className="dir-nav-login">Vacancies</a>
          <a href="/login" className="dir-nav-login">Sign in</a>
          <a href="/login" className="dir-nav-btn">Join free</a>
        </div>
      </nav>

      <div className="dir-hero">
        <p className="dir-hero-label">PLAYER DIRECTORY</p>
        <h1 className="dir-hero-title">Discover rugby talent<br/>from around the world</h1>
        <p className="dir-hero-sub">Browse verified rugby players actively seeking opportunities. Filter by position, nationality and age.</p>
        <div className="dir-hero-stats">
          <div>
            <div className="dir-stat-val">{sorted.length}</div>
            <div className="dir-stat-lbl">players listed</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div>
            <div className="dir-stat-val">{new Set(sorted.map((p: any) => p.nationality_primary)).size}</div>
            <div className="dir-stat-lbl">nationalities</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div>
            <div className="dir-stat-val">{new Set(sorted.map((p: any) => p.position_primary)).size}</div>
            <div className="dir-stat-lbl">positions</div>
          </div>
        </div>
        <a href="/login" className="dir-cta">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          List your profile free
        </a>
      </div>

      <div className="dir-content">
        <p className="dir-section-title">
          {sorted.length > 0 ? `${sorted.length} PLAYERS — SORTED BY MOST VIEWED` : 'NO PLAYERS YET'}
        </p>

        {sorted.length > 0 ? (
          <div className="dir-grid">
            {sorted.map((player: any) => {
              const age = getAge(player.date_of_birth)
              const avail = player.availability ?? null
              const isAvailable = avail === 'available'
              const isEos = avail === 'end_of_season'
              const isUnavailable = !isAvailable && !isEos
              const metaParts = [
                player.nationality_primary?.trim(),
                age ? `${age} yrs` : null,
              ].filter(Boolean)

              return (
                <div key={player.id} className="dir-card">

                  {/* Zone 1 — Header */}
                  <div className="dir-card-header">
                    <div className="dir-avatar">
                      {player.avatar_url
                        ? <img src={player.avatar_url} alt={player.first_name} />
                        : (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c98a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M6 20v-1a6 6 0 0 1 12 0v1"/>
                          </svg>
                        )
                      }
                    </div>
                    <div className="dir-card-name">{player.first_name} {player.last_name}</div>
                    <div className="dir-badges">
                      {player.position_primary && (
                        <span className="dir-badge dir-badge-pos">{pos(player.position_primary)}</span>
                      )}
                      {player.position_secondary && (
                        <span className="dir-badge dir-badge-pos" style={{ opacity: 0.6 }}>{pos(player.position_secondary)}</span>
                      )}
                      {isEos ? (
                        <span className="dir-badge dir-badge-eos">End of season</span>
                      ) : isUnavailable ? (
                        <span className="dir-badge dir-badge-unavailable">Not available</span>
                      ) : (
                        <span className="dir-badge dir-badge-available">Available</span>
                      )}
                    </div>
                    {metaParts.length > 0 && (
                      <div className="dir-card-meta">{metaParts.join(' · ')}</div>
                    )}
                  </div>

                  {/* Zone 2 — Stats bar */}
                  <div className="dir-stats-bar">
                    <div className="dir-stat-cell">
                      {player.height_cm
                        ? <div className="dir-stat-num">{player.height_cm}<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>cm</span></div>
                        : <div className="dir-stat-num-dash">—</div>
                      }
                      <div className="dir-stat-key">HEIGHT</div>
                    </div>
                    <div className="dir-stat-cell">
                      {player.weight_kg
                        ? <div className="dir-stat-num">{Math.round(player.weight_kg)}<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>kg</span></div>
                        : <div className="dir-stat-num-dash">—</div>
                      }
                      <div className="dir-stat-key">WEIGHT</div>
                    </div>
                    <div className="dir-stat-cell">
                      {player.matches_played
                        ? <div className="dir-stat-num">{player.matches_played}</div>
                        : <div className="dir-stat-num-dash">—</div>
                      }
                      <div className="dir-stat-key">MATCHES</div>
                    </div>
                  </div>

                  {/* Zone 3 — Detail rows */}
                  <div className="dir-details">
                    <div className="dir-detail-row">
                      <div className="dir-detail-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                        </svg>
                      </div>
                      <span className="dir-detail-label">Tries scored</span>
                      {player.tries_scored != null
                        ? <span className="dir-detail-value">{player.tries_scored}</span>
                        : <span className="dir-detail-dash">—</span>
                      }
                    </div>
                    <div className="dir-detail-row">
                      <div className="dir-detail-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/>
                        </svg>
                      </div>
                      <span className="dir-detail-label">Season</span>
                      {player.season
                        ? <span className="dir-detail-value">{player.season}</span>
                        : <span className="dir-detail-dash">—</span>
                      }
                    </div>
                  </div>

                  {/* Zone 4 — CTA (public page always gates to register) */}
                  <div className="dir-card-footer">
                    <a href="/register" className="dir-cta-btn dir-cta-outline">
                      Join to connect
                    </a>
                  </div>

                </div>
              )
            })}
          </div>
        ) : (
          <div className="dir-empty">
            <h3>No players listed yet</h3>
            <p>Be the first to create your profile.</p>
          </div>
        )}
      </div>

      <div className="dir-footer">
        <div className="dir-footer-brand">GAIN<span style={{ color: '#2ec97e' }}>LINE</span></div>
        <div className="dir-footer-tag">No talent goes unseen</div>
        <a href="/login" className="dir-footer-cta">Create your free profile</a>
      </div>
    </>
  )
}
