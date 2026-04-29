export const dynamic = 'force-dynamic'

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
    <div style={{ minHeight: '100vh', background: '#0D1B2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'white', fontSize: '22px', fontWeight: '900', fontFamily: 'Arial Black, Arial, sans-serif', marginBottom: '8px' }}>Player not found</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '24px' }}>This CV link may have expired or been removed.</div>
        <a href="/" style={{ background: '#1D9E75', color: 'white', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '700', fontFamily: 'Arial Black, Arial, sans-serif' }}>Go to Gainline</a>
      </div>
    </div>
  )

  const age = player.date_of_birth
    ? Math.floor((new Date().getTime() - new Date(player.date_of_birth).getTime()) / 31557600000)
    : null

  const pos = (s: string) => s?.replace(/_/g, ' ') || '–'
  const initials = [player.first_name?.[0], player.last_name?.[0]].filter(Boolean).join('')

  // Profile completion score
  const fields = ['first_name','last_name','date_of_birth','nationality_primary','position_primary','height_cm','weight_kg','school_attended','bio','video_url','avatar_url']
  const filled = fields.filter(f => player[f] && player[f] !== '').length
  const completion = Math.round((filled / fields.length) * 100)
  const ringColor = completion < 40 ? '#F0A500' : completion < 70 ? '#1D9E75' : '#1D9E75'
  const r = 20
  const circ = 2 * Math.PI * r
  const offset = circ - (completion / 100) * circ

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F1EFE8; }

        .cv-nav { background: #0D1B2E; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .cv-logo { display: flex; align-items: center; gap: 8px; }
        .cv-logo-text { color: white; font-weight: 900; font-size: 17px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .cv-nav-right { display: flex; align-items: center; gap: 10px; }
        .cv-nav-label { color: rgba(255,255,255,0.35); font-size: 11px; letter-spacing: 0.1em; }
        .lang-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.08); padding: 3px; border-radius: 8px; }
        .lang-btn { background: transparent; border: none; cursor: pointer; font-size: 15px; width: 28px; height: 24px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }

        .cv-hero { background: linear-gradient(160deg, #0D1B2E 0%, #0F2E1E 100%); padding: 36px 20px 0; }
        .cv-hero-inner { max-width: 680px; margin: 0 auto; }

        .cv-profile-row { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 28px; }
        .cv-avatar { width: 88px; height: 88px; border-radius: 16px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; border: 3px solid rgba(255,255,255,0.1); }
        .cv-avatar span { color: white; font-size: 30px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .cv-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .cv-profile-info { flex: 1; padding-top: 4px; }
        .cv-name { color: white; font-size: 28px; font-weight: 900; margin-bottom: 8px; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; line-height: 1.1; }
        .cv-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
        .cv-position-badge { background: #1D9E75; color: white; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 4px; letter-spacing: 0.08em; }
        .cv-position-badge-alt { background: rgba(29,158,117,0.2); color: #5DCAA5; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 4px; letter-spacing: 0.08em; border: 1px solid rgba(29,158,117,0.3); }
        .cv-meta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .cv-meta-item { color: rgba(255,255,255,0.45); font-size: 12px; display: flex; align-items: center; gap: 4px; }
        .cv-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.2); }

        .cv-completion { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px 14px; margin-bottom: 28px; }
        .cv-completion-text { font-size: 12px; color: rgba(255,255,255,0.5); }
        .cv-completion-pct { font-size: 12px; color: #5DCAA5; font-weight: 700; }

        .cv-stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); background: rgba(0,0,0,0.25); border-radius: 12px 12px 0 0; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); border-bottom: none; }
        .cv-stat { padding: 18px 12px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06); }
        .cv-stat:last-child { border-right: none; }
        .cv-stat-value { color: white; font-size: 20px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; line-height: 1; }
        .cv-stat-label { color: rgba(255,255,255,0.35); font-size: 9px; letter-spacing: 0.14em; margin-top: 5px; }

        .cv-content { max-width: 680px; margin: 0 auto; padding: 20px 20px 40px; }
        .cv-card { background: white; border-radius: 12px; padding: 24px; border: 0.5px solid #D3D1C7; margin-bottom: 12px; }
        .cv-card-label { font-size: 10px; color: #1D9E75; letter-spacing: 0.14em; margin-bottom: 14px; font-weight: 700; }

        .cv-bio { font-size: 14px; color: #0D1B2E; line-height: 1.75; }

        .cv-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        .cv-detail-item { padding: 12px 0; border-bottom: 0.5px solid #F1EFE8; }
        .cv-detail-item:nth-last-child(-n+2) { border-bottom: none; }
        .cv-detail-label { font-size: 11px; color: #888780; margin-bottom: 3px; }
        .cv-detail-value { font-size: 14px; font-weight: 700; color: #0D1B2E; }

        .cv-video-list { display: flex; flex-direction: column; gap: 8px; }
        .cv-video-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #F8F7F4; border-radius: 8px; text-decoration: none; border: 0.5px solid #D3D1C7; transition: border-color 0.15s; }
        .cv-video-item:hover { border-color: #1D9E75; }
        .cv-video-icon { width: 32px; height: 32px; border-radius: 6px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cv-video-title { font-size: 13px; font-weight: 700; color: #0D1B2E; margin-bottom: 2px; }
        .cv-video-source { font-size: 11px; color: #888780; }
        .cv-video-watch { font-size: 12px; color: #1D9E75; font-weight: 700; margin-left: auto; white-space: nowrap; }

        .cv-footer-card { background: #0D1B2E; border-radius: 12px; padding: 28px; text-align: center; margin-top: 12px; }
        .cv-footer-label { font-size: 10px; color: #5DCAA5; letter-spacing: 0.14em; margin-bottom: 8px; }
        .cv-footer-brand { font-size: 20px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 6px; }
        .cv-footer-tag { font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 16px; }
        .cv-footer-cta { background: #1D9E75; color: white; font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; display: inline-block; }

        @media (min-width: 600px) {
          .cv-nav { padding: 0 28px; height: 64px; }
          .cv-logo-text { font-size: 18px; }
          .cv-hero { padding: 44px 28px 0; }
          .cv-name { font-size: 34px; }
          .cv-avatar { width: 100px; height: 100px; }
          .cv-avatar span { font-size: 34px; }
          .cv-stat-value { font-size: 22px; }
          .cv-card { padding: 28px; }
          .cv-content { padding: 24px 28px 48px; }
        }
      `}</style>

      <nav className="cv-nav">
        <div className="cv-logo">
          <svg width="28" height="26" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="cv-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </div>
        <div className="cv-nav-right">
          <span className="cv-nav-label" id="cv-nav-label">PLAYER CV</span>
          <div className="lang-toggle">
            <button className="lang-btn" id="btn-en" title="English">🇬🇧</button>
            <button className="lang-btn" id="btn-fr" title="Français">🇫🇷</button>
          </div>
        </div>
      </nav>

      <div className="cv-hero">
        <div className="cv-hero-inner">

          <div className="cv-profile-row">
            <div className="cv-avatar">
              {player.avatar_url
                ? <img src={player.avatar_url} alt={player.first_name} />
                : <span>{initials}</span>
              }
            </div>
            <div className="cv-profile-info">
              <h1 className="cv-name">{player.first_name} {player.last_name}</h1>
              <div className="cv-badges">
                {player.position_primary && <span className="cv-position-badge">{pos(player.position_primary)}</span>}
                {player.position_secondary && <span className="cv-position-badge-alt">{pos(player.position_secondary)}</span>}
              </div>
              <div className="cv-meta-row">
                {player.nationality_primary && <span className="cv-meta-item">{player.nationality_primary}</span>}
                {player.nationality_primary && player.school_attended && <span className="cv-meta-dot"></span>}
                {player.school_attended && <span className="cv-meta-item">{player.school_attended}</span>}
              </div>
            </div>
          </div>

          <div className="cv-completion">
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
              <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5"/>
              <circle cx="24" cy="24" r={r} fill="none" stroke={ringColor} strokeWidth="5"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 24 24)"
              />
              <text x="24" y="28" textAnchor="middle" fill="white" fontSize="10" fontWeight="900" fontFamily="Arial Black, Arial, sans-serif">{completion}%</text>
            </svg>
            <div>
              <div className="cv-completion-pct" id="comp-label">{completion === 100 ? 'Profile complete' : `${completion}% complete`}</div>
              <div className="cv-completion-text" id="comp-sub">{completion === 100 ? 'Coaches can see everything they need' : 'Player is still building their profile'}</div>
            </div>
          </div>

          <div className="cv-stats-bar">
            <div className="cv-stat">
              <div className="cv-stat-value">{age ?? '–'}</div>
              <div className="cv-stat-label" id="stat-age">AGE</div>
            </div>
            <div className="cv-stat">
              <div className="cv-stat-value">{player.height_cm ? `${player.height_cm}` : '–'}</div>
              <div className="cv-stat-label" id="stat-height">HEIGHT (CM)</div>
            </div>
            <div className="cv-stat">
              <div className="cv-stat-value">{player.weight_kg ? `${player.weight_kg}` : '–'}</div>
              <div className="cv-stat-label" id="stat-weight">WEIGHT (KG)</div>
            </div>
            <div className="cv-stat">
              <div className="cv-stat-value" style={{ fontSize: player.position_secondary ? '13px' : '20px' }}>{player.position_secondary ? pos(player.position_secondary) : '–'}</div>
              <div className="cv-stat-label" id="stat-altpos">ALT POS</div>
            </div>
          </div>
        </div>
      </div>

      <div className="cv-content">

        {player.bio && (
          <div className="cv-card">
            <p className="cv-card-label" id="label-about">ABOUT</p>
            <p className="cv-bio">{player.bio}</p>
          </div>
        )}

        <div className="cv-card">
          <p className="cv-card-label" id="label-details">PLAYER DETAILS</p>
          <div className="cv-detail-grid">
            <div className="cv-detail-item">
              <div className="cv-detail-label" id="lbl-pos-p">Primary Position</div>
              <div className="cv-detail-value">{pos(player.position_primary)}</div>
            </div>
            <div className="cv-detail-item">
              <div className="cv-detail-label" id="lbl-pos-s">Secondary Position</div>
              <div className="cv-detail-value">{player.position_secondary ? pos(player.position_secondary) : '–'}</div>
            </div>
            <div className="cv-detail-item">
              <div className="cv-detail-label" id="lbl-nat">Nationality</div>
              <div className="cv-detail-value">{player.nationality_primary || '–'}</div>
            </div>
            <div className="cv-detail-item">
              <div className="cv-detail-label" id="lbl-sch">School</div>
              <div className="cv-detail-value">{player.school_attended || '–'}</div>
            </div>
            <div className="cv-detail-item">
              <div className="cv-detail-label" id="lbl-hgt">Height</div>
              <div className="cv-detail-value">{player.height_cm ? `${player.height_cm} cm` : '–'}</div>
            </div>
            <div className="cv-detail-item">
              <div className="cv-detail-label" id="lbl-wgt">Weight</div>
              <div className="cv-detail-value">{player.weight_kg ? `${player.weight_kg} kg` : '–'}</div>
            </div>
          </div>
        </div>

        {(player.video_url || player.video_url_2 || player.video_url_3) && (
          <div className="cv-card">
            <p className="cv-card-label" id="label-video">VIDEO HIGHLIGHTS</p>
            <div className="cv-video-list">
              {player.video_url && (
                <a href={player.video_url} target="_blank" rel="noopener noreferrer" className="cv-video-item">
                  <div className="cv-video-icon">
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="white"><path d="M0 0L12 7L0 14V0Z"/></svg>
                  </div>
                  <div>
                    <div className="cv-video-title" id="vid-1-label">Highlight reel</div>
                    <div className="cv-video-source">{player.video_url.includes('youtube') ? 'YouTube' : 'Vimeo'}</div>
                  </div>
                  <div className="cv-video-watch" id="vid-watch-1">Watch →</div>
                </a>
              )}
              {player.video_url_2 && (
                <a href={player.video_url_2} target="_blank" rel="noopener noreferrer" className="cv-video-item">
                  <div className="cv-video-icon">
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="white"><path d="M0 0L12 7L0 14V0Z"/></svg>
                  </div>
                  <div>
                    <div className="cv-video-title" id="vid-2-label">Match footage</div>
                    <div className="cv-video-source">{player.video_url_2.includes('youtube') ? 'YouTube' : 'Vimeo'}</div>
                  </div>
                  <div className="cv-video-watch" id="vid-watch-2">Watch →</div>
                </a>
              )}
              {player.video_url_3 && (
                <a href={player.video_url_3} target="_blank" rel="noopener noreferrer" className="cv-video-item">
                  <div className="cv-video-icon">
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="white"><path d="M0 0L12 7L0 14V0Z"/></svg>
                  </div>
                  <div>
                    <div className="cv-video-title" id="vid-3-label">Additional footage</div>
                    <div className="cv-video-source">{player.video_url_3.includes('youtube') ? 'YouTube' : 'Vimeo'}</div>
                  </div>
                  <div className="cv-video-watch" id="vid-watch-3">Watch →</div>
                </a>
              )}
            </div>
          </div>
        )}

        <div className="cv-footer-card">
          <p className="cv-footer-label" id="footer-powered">POWERED BY</p>
          <p className="cv-footer-brand">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></p>
          <p className="cv-footer-tag" id="footer-tagline">No talent goes unseen</p>
          <a href="/" className="cv-footer-cta" id="footer-cta">Build your free profile →</a>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var lang = localStorage.getItem('gainline_lang') || 'en';
          var T = {
            en: {
              nav_label: 'PLAYER CV', about: 'ABOUT', details: 'PLAYER DETAILS', video: 'VIDEO HIGHLIGHTS',
              age: 'AGE', height: 'HEIGHT (CM)', weight: 'WEIGHT (KG)', altpos: 'ALT POS',
              pos_p: 'Primary Position', pos_s: 'Secondary Position', nat: 'Nationality',
              sch: 'School', hgt: 'Height', wgt: 'Weight',
              vid1: 'Highlight reel', vid2: 'Match footage', vid3: 'Additional footage',
              watch: 'Watch →', powered: 'POWERED BY', tagline: 'No talent goes unseen',
              cta: 'Build your free profile →',
              comp_done: 'Profile complete', comp_sub_done: 'Coaches can see everything they need',
              comp_prog: '% complete', comp_sub_prog: 'Player is still building their profile'
            },
            fr: {
              nav_label: 'CV JOUEUR', about: 'À PROPOS', details: 'DÉTAILS DU JOUEUR', video: 'VIDÉOS DE HIGHLIGHTS',
              age: 'ÂGE', height: 'TAILLE (CM)', weight: 'POIDS (KG)', altpos: 'POSTE ALT',
              pos_p: 'Poste principal', pos_s: 'Poste secondaire', nat: 'Nationalité',
              sch: 'École', hgt: 'Taille', wgt: 'Poids',
              vid1: 'Highlight principal', vid2: 'Footage de match', vid3: 'Footage supplémentaire',
              watch: 'Regarder →', powered: 'PROPULSÉ PAR', tagline: 'Aucun talent ne passe inaperçu',
              cta: 'Créer mon profil gratuit →',
              comp_done: 'Profil complet', comp_sub_done: 'Les entraîneurs peuvent tout voir',
              comp_prog: '% complet', comp_sub_prog: 'Le joueur complète encore son profil'
            }
          };
          var pct = ${completion};

          function applyLang(l) {
            var t = T[l] || T.en;
            lang = l;
            localStorage.setItem('gainline_lang', l);
            var btnEn = document.getElementById('btn-en');
            var btnFr = document.getElementById('btn-fr');
            if (btnEn) btnEn.style.background = l === 'en' ? 'rgba(255,255,255,0.15)' : 'transparent';
            if (btnFr) btnFr.style.background = l === 'fr' ? 'rgba(255,255,255,0.15)' : 'transparent';
            var navLabel = document.getElementById('cv-nav-label'); if (navLabel) navLabel.textContent = t.nav_label;
            ['age','height','weight','altpos'].forEach(function(k) { var el = document.getElementById('stat-' + k); if (el) el.textContent = t[k]; });
            var al = document.getElementById('label-about'); if (al) al.textContent = t.about;
            var dl = document.getElementById('label-details'); if (dl) dl.textContent = t.details;
            var vl = document.getElementById('label-video'); if (vl) vl.textContent = t.video;
            var lbls = {'lbl-pos-p':t.pos_p,'lbl-pos-s':t.pos_s,'lbl-nat':t.nat,'lbl-sch':t.sch,'lbl-hgt':t.hgt,'lbl-wgt':t.wgt};
            Object.keys(lbls).forEach(function(id) { var el = document.getElementById(id); if (el) el.textContent = lbls[id]; });
            var v1 = document.getElementById('vid-1-label'); if (v1) v1.textContent = t.vid1;
            var v2 = document.getElementById('vid-2-label'); if (v2) v2.textContent = t.vid2;
            var v3 = document.getElementById('vid-3-label'); if (v3) v3.textContent = t.vid3;
            ['vid-watch-1','vid-watch-2','vid-watch-3'].forEach(function(id) { var el = document.getElementById(id); if (el) el.textContent = t.watch; });
            var pw = document.getElementById('footer-powered'); if (pw) pw.textContent = t.powered;
            var tg = document.getElementById('footer-tagline'); if (tg) tg.textContent = t.tagline;
            var ct = document.getElementById('footer-cta'); if (ct) ct.textContent = t.cta;
            var cl = document.getElementById('comp-label'); if (cl) cl.textContent = pct === 100 ? t.comp_done : pct + t.comp_prog;
            var cs = document.getElementById('comp-sub'); if (cs) cs.textContent = pct === 100 ? t.comp_sub_done : t.comp_sub_prog;
          }

          document.addEventListener('DOMContentLoaded', function() {
            applyLang(lang);
            var btnEn = document.getElementById('btn-en');
            var btnFr = document.getElementById('btn-fr');
            if (btnEn) btnEn.addEventListener('click', function() { applyLang('en'); });
            if (btnFr) btnFr.addEventListener('click', function() { applyLang('fr'); });
          });
        })();
      `}} />
    </>
  )
}