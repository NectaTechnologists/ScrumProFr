export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'

async function getPlayer(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/players?share_token=eq.' + token + '&select=*'
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    cache: 'no-store'
  })
  const data = await res.json()
  return data?.[0] || null
}

export default async function CVPage(props: any) {
  const params = await props.params
  const token = params.token
  const player = await getPlayer(token)
  if (!player) return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>Player not found</h1>
    </div>
  )

  const age = player.date_of_birth
    ? Math.floor((new Date().getTime() - new Date(player.date_of_birth).getTime()) / 31557600000)
    : null

  const pos = (s: string) => s?.replace(/_/g, ' ') || '–'
  const initials = [player.first_name?.[0], player.last_name?.[0]].filter(Boolean).join('')

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F1EFE8; }

        .cv-nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .cv-logo { display: flex; align-items: center; gap: 10px; }
        .cv-logo-text { color: white; font-weight: 900; font-size: 18px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .cv-nav-label { color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 0.1em; }

        .cv-hero { background: #0D1B2E; padding: 40px 28px 48px; }
        .cv-hero-inner { max-width: 760px; margin: 0 auto; }
        .cv-profile { display: flex; align-items: center; gap: 24px; margin-bottom: 28px; }
        .cv-avatar { width: 80px; height: 80px; border-radius: 16px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cv-avatar span { color: white; font-size: 28px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .cv-name { color: white; font-size: 32px; font-weight: 900; margin-bottom: 10px; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -1px; }
        .cv-meta { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .cv-position-badge { background: #1D9E75; color: white; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.08em; }
        .cv-meta-item { color: rgba(255,255,255,0.55); font-size: 13px; }

        .cv-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
        .cv-stat { background: #0F2438; padding: 20px 16px; text-align: center; }
        .cv-stat-value { color: white; font-size: 22px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .cv-stat-label { color: rgba(255,255,255,0.4); font-size: 10px; letter-spacing: 0.12em; margin-top: 4px; }

        .cv-content { max-width: 760px; margin: 0 auto; padding: 32px 28px; }
        .cv-card { background: white; border-radius: 12px; padding: 28px; border: 0.5px solid #D3D1C7; margin-bottom: 16px; }
        .cv-card-label { font-size: 10px; color: #1D9E75; letter-spacing: 0.14em; margin-bottom: 12px; font-weight: 700; }
        .cv-bio { font-size: 15px; color: #0D1B2E; line-height: 1.7; }
        .cv-detail-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 0.5px solid #F1EFE8; margin-bottom: 14px; }
        .cv-detail-row:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
        .cv-detail-label { font-size: 13px; color: #888780; }
        .cv-detail-value { font-size: 14px; font-weight: 700; color: #0D1B2E; }

        .cv-footer-card { background: #0D1B2E; border-radius: 12px; padding: 28px; text-align: center; }
        .cv-footer-label { font-size: 10px; color: #5DCAA5; letter-spacing: 0.14em; margin-bottom: 8px; }
        .cv-footer-brand { font-size: 18px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 8px; }
        .cv-footer-tag { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 16px; }
        .cv-footer-cta { background: #1D9E75; color: white; font-size: 12px; font-weight: 700; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; display: inline-block; }

        @media (max-width: 768px) {
          .cv-nav { padding: 0 16px; height: 56px; }
          .cv-logo-text { font-size: 16px; }
          .cv-nav-label { font-size: 10px; }

          .cv-hero { padding: 28px 16px 36px; }
          .cv-profile { gap: 16px; }
          .cv-avatar { width: 60px; height: 60px; border-radius: 12px; }
          .cv-avatar span { font-size: 22px; }
          .cv-name { font-size: 24px; }
          .cv-meta-item { font-size: 12px; }

          .cv-stats { grid-template-columns: repeat(2, 1fr); }
          .cv-stat { padding: 16px 12px; }
          .cv-stat-value { font-size: 18px; }

          .cv-content { padding: 20px 16px; }
          .cv-card { padding: 20px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="cv-nav">
        <div className="cv-logo">
          <svg width="32" height="30" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="cv-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </div>
        <span className="cv-nav-label">PLAYER CV</span>
      </nav>

      {/* HERO */}
      <div className="cv-hero">
        <div className="cv-hero-inner">
          <div className="cv-profile">
            <div className="cv-avatar">
              <span>{initials}</span>
            </div>
            <div>
              <h1 className="cv-name">{player.first_name} {player.last_name}</h1>
              <div className="cv-meta">
                {player.position_primary && <span className="cv-position-badge">{pos(player.position_primary)}</span>}
                {player.nationality_primary && <span className="cv-meta-item">{player.nationality_primary}</span>}
                {player.school_attended && <span className="cv-meta-item">{player.school_attended}</span>}
              </div>
            </div>
          </div>

          <div className="cv-stats">
            {[
              { value: age ?? '–', label: 'AGE' },
              { value: player.height_cm ? `${player.height_cm}cm` : '–', label: 'HEIGHT' },
              { value: player.weight_kg ? `${player.weight_kg}kg` : '–', label: 'WEIGHT' },
              { value: player.position_secondary ? pos(player.position_secondary) : '–', label: 'ALT POS' },
            ].map(stat => (
              <div key={stat.label} className="cv-stat">
                <div className="cv-stat-value">{stat.value}</div>
                <div className="cv-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="cv-content">
        {player.bio && (
          <div className="cv-card">
            <p className="cv-card-label">ABOUT</p>
            <p className="cv-bio">{player.bio}</p>
          </div>
        )}

        <div className="cv-card">
          <p className="cv-card-label">PLAYER DETAILS</p>
          {[
            { label: 'Primary Position', value: pos(player.position_primary) },
            { label: 'Secondary Position', value: player.position_secondary ? pos(player.position_secondary) : '–' },
            { label: 'Nationality', value: player.nationality_primary || '–' },
            { label: 'School', value: player.school_attended || '–' },
            { label: 'Height', value: player.height_cm ? `${player.height_cm} cm` : '–' },
            { label: 'Weight', value: player.weight_kg ? `${player.weight_kg} kg` : '–' },
            { label: 'Age', value: age ? `${age} years` : '–' },
          ].map(row => (
            <div key={row.label} className="cv-detail-row">
              <span className="cv-detail-label">{row.label}</span>
              <span className="cv-detail-value">{row.value}</span>
            </div>
          ))}
        </div>
        {(player.video_url || player.video_url_2 || player.video_url_3) && (
          <div className="cv-card" style={{ marginBottom: '16px' }}>
            <p className="cv-card-label">VIDEO HIGHLIGHTS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { url: player.video_url, label: 'Highlight reel' },
                { url: player.video_url_2, label: 'Match footage' },
                { url: player.video_url_3, label: 'Additional footage' },
              ].filter(v => v.url).map((v, i) => (
                
                  key={i}
                  href={v.url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#F1EFE8',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    border: '0.5px solid #D3D1C7',
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
                      <path d="M0 0L12 7L0 14V0Z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B2E' }}>{v.label}</div>
                    <div style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>
                      {v.url.includes('youtube') ? 'YouTube' : v.url.includes('vimeo') ? 'Vimeo' : 'Watch video'}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#1D9E75', fontWeight: '700' }}>Watch →</div>
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="cv-footer-card">
          <p className="cv-footer-label">POWERED BY</p>
          <p className="cv-footer-brand">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></p>
          <p className="cv-footer-tag">No talent goes unseen</p>
          <a href="/" className="cv-footer-cta">Build your free profile →</a>
        </div>
      </div>
    </>
  )
}
