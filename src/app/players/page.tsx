export const dynamic = 'force-dynamic'

async function getPlayers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/players?select=first_name,last_name,position_primary,position_secondary,nationality_primary,date_of_birth,height_cm,weight_kg,avatar_url,share_token,id&profile_visibility=eq.PUBLIC&is_test=eq.false&first_name=not.is.null&last_name=not.is.null&nationality_primary=not.is.null&position_primary=not.is.null&order=created_at.desc'
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    cache: 'no-store'
  })
  return res.json()
}

async function getViewCounts() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/cv_views?select=player_id'
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    cache: 'no-store'
  })
  const views = await res.json()
  const counts: Record<string, number> = {}
  views.forEach((v: any) => { counts[v.player_id] = (counts[v.player_id] || 0) + 1 })
  return counts
}

export default async function PlayersPage() {
  const [players, viewCounts] = await Promise.all([getPlayers(), getViewCounts()])
  const sorted = [...(players || [])].sort((a: any, b: any) => (viewCounts[b.id] || 0) - (viewCounts[a.id] || 0))

  const pos = (s: string) => s?.replace(/_/g, ' ') || '–'
  const getAge = (dob: string) => dob ? Math.floor((new Date().getTime() - new Date(dob).getTime()) / 31557600000) : null
  const getInitials = (p: any) => [p.first_name?.[0], p.last_name?.[0]].filter(Boolean).join('')

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F1EFE8; }
        .dir-nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .dir-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .dir-logo-text { color: white; font-weight: 900; font-size: 20px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .dir-nav-right { display: flex; align-items: center; gap: 12px; }
        .dir-nav-btn { background: #1D9E75; color: white; border: none; border-radius: 20px; padding: 8px 18px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; text-decoration: none; display: inline-block; }
        .dir-nav-login { background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 7px 16px; font-size: 13px; cursor: pointer; font-family: Arial, sans-serif; text-decoration: none; display: inline-block; }
        .dir-hero { background: #0D1B2E; padding: 48px 28px; text-align: center; }
        .dir-hero-label { font-size: 10px; color: #5DCAA5; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 10px; }
        .dir-hero-title { font-size: 36px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -1px; margin-bottom: 10px; line-height: 1.1; }
        .dir-hero-sub { font-size: 15px; color: rgba(255,255,255,0.5); max-width: 500px; margin: 0 auto 24px; line-height: 1.6; }
        .dir-hero-stats { display: flex; justify-content: center; gap: 32px; margin-bottom: 28px; }
        .dir-stat-val { font-size: 28px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; line-height: 1; }
        .dir-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 3px; }
        .dir-cta { display: inline-flex; align-items: center; gap: 7px; background: #1D9E75; color: white; border: none; border-radius: 20px; padding: 12px 28px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: Arial, sans-serif; text-decoration: none; }
        .dir-content { max-width: 1300px; margin: 0 auto; padding: 32px 28px 60px; }
        .dir-section-title { font-size: 10px; color: #888780; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 16px; }
        .dir-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .dir-card { background: white; border-radius: 12px; border: 0.5px solid #D3D1C7; overflow: hidden; text-decoration: none; display: block; transition: border-color 0.15s; }
        .dir-card:hover { border-color: #1D9E75; }
        .dir-card-hero { background: #0D1B2E; padding: 20px; display: flex; flex-direction: column; align-items: center; }
        .dir-avatar { width: 64px; height: 64px; border-radius: 12px; background: #1D9E75; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 10px; border: 2px solid rgba(255,255,255,0.1); }
        .dir-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .dir-avatar span { color: white; font-size: 22px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .dir-card-name { font-size: 14px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; text-align: center; margin-bottom: 5px; }
        .dir-card-pos { font-size: 9px; font-weight: 700; background: #1D9E75; color: white; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.08em; }
        .dir-card-body { padding: 12px 14px; }
        .dir-card-meta { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .dir-card-meta-item { text-align: center; }
        .dir-card-meta-val { font-size: 14px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; }
        .dir-card-meta-lbl { font-size: 9px; color: #888780; letter-spacing: 0.08em; margin-top: 1px; }
        .dir-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 0.5px solid #F1EFE8; }
        .dir-card-nat { font-size: 11px; color: #888780; }
        .dir-card-views { font-size: 10px; color: #B4B2A9; display: flex; align-items: center; gap: 3px; }
        .dir-empty { text-align: center; padding: 60px 20px; }
        .dir-empty h3 { font-size: 18px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 8px; }
        .dir-empty p { font-size: 14px; color: #888780; }
        .dir-footer { background: #0D1B2E; padding: 32px 28px; text-align: center; }
        .dir-footer-brand { font-size: 18px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 6px; }
        .dir-footer-tag { font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 16px; }
        .dir-footer-cta { display: inline-block; background: #1D9E75; color: white; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-family: Arial, sans-serif; }
        @media (max-width: 768px) {
          .dir-nav { padding: 0 16px; height: 56px; }
          .dir-logo-text { font-size: 17px; }
          .dir-hero { padding: 36px 16px; }
          .dir-hero-title { font-size: 26px; }
          .dir-content { padding: 24px 16px 40px; }
          .dir-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
      `}</style>

      <nav className="dir-nav">
        <a href="/" className="dir-logo">
          <svg width="28" height="26" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="dir-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </a>
        <div className="dir-nav-right">
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
              const views = viewCounts[player.id] || 0
              return (
                <a key={player.id} href={`/cv/${player.share_token}`} target="_blank" rel="noopener noreferrer" className="dir-card">
                  <div className="dir-card-hero">
                    <div className="dir-avatar">
                      {player.avatar_url
                        ? <img src={player.avatar_url} alt={player.first_name} />
                        : <span>{getInitials(player)}</span>
                      }
                    </div>
                    <div className="dir-card-name">{player.first_name} {player.last_name}</div>
                    {player.position_primary && <span className="dir-card-pos">{pos(player.position_primary)}</span>}
                  </div>
                  <div className="dir-card-body">
                    <div className="dir-card-meta">
                      <div className="dir-card-meta-item">
                        <div className="dir-card-meta-val">{age ?? '–'}</div>
                        <div className="dir-card-meta-lbl">AGE</div>
                      </div>
                      <div className="dir-card-meta-item">
                        <div className="dir-card-meta-val">{player.height_cm || '–'}</div>
                        <div className="dir-card-meta-lbl">CM</div>
                      </div>
                      <div className="dir-card-meta-item">
                        <div className="dir-card-meta-val">{player.weight_kg || '–'}</div>
                        <div className="dir-card-meta-lbl">KG</div>
                      </div>
                    </div>
                    <div className="dir-card-footer">
                      <span className="dir-card-nat">{player.nationality_primary}</span>
                      <span className="dir-card-views">
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#B4B2A9" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
                          <circle cx="8" cy="8" r="2"/>
                        </svg>
                        {views}
                      </span>
                    </div>
                  </div>
                </a>
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
        <div className="dir-footer-brand">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></div>
        <div className="dir-footer-tag">No talent goes unseen</div>
        <a href="/login" className="dir-footer-cta">Create your free profile</a>
      </div>
    </>
  )
}