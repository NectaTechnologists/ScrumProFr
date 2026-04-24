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
        .cv-nav-right { display: flex; align-items: center; gap: 12px; }
        .cv-nav-label { color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 0.1em; }
        .lang-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.08); padding: 3px; border-radius: 8px; }
        .lang-btn { background: transparent; border: none; cursor: pointer; font-size: 16px; width: 30px; height: 26px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .lang-btn-active { background: rgba(255,255,255,0.15); }
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
          .cv-nav-label { display: none; }
          .cv-hero { padding: 28px 16px 36px; }
          .cv-profile { gap: 16px; }
          .cv-avatar { width: 60px; height: 60px; border-radius: 12px; }
          .cv-avatar span { font-size: 22px; }
          .cv-name { font-size: 24px; }
          .cv-stats { grid-template-columns: repeat(2, 1fr); }
          .cv-stat { padding: 16px 12px; }
          .cv-stat-value { font-size: 18px; }
          .cv-content { padding: 20px 16px; }
          .cv-card { padding: 20px; }
        }
      `}</style>

      {/* NAV with client-side lang toggle */}
      <nav className="cv-nav">
        <div className="cv-logo">
          <svg width="32" height="30" viewBox="0 0 32 30" style={{ display: 'block' }}>
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

      {/* HERO */}
      <div className="cv-hero">
        <div className="cv-hero-inner">
          <div className="cv-profile">
            <div className="cv-avatar">
              {player.avatar_url
                ? <img src={player.avatar_url} alt={player.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}/>
                : <span>{initials}</span>
              }
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
            <div className="cv-stat">
              <div className="cv-stat-value">{age ?? '–'}</div>
              <div className="cv-stat-label" id="stat-age">AGE</div>
            </div>
            <div className="cv-stat">
              <div className="cv-stat-value">{player.height_cm ? `${player.height_cm}cm` : '–'}</div>
              <div className="cv-stat-label" id="stat-height">HEIGHT</div>
            </div>
            <div className="cv-stat">
              <div className="cv-stat-value">{player.weight_kg ? `${player.weight_kg}kg` : '–'}</div>
              <div className="cv-stat-label" id="stat-weight">WEIGHT</div>
            </div>
            <div className="cv-stat">
              <div className="cv-stat-value">{player.position_secondary ? pos(player.position_secondary) : '–'}</div>
              <div className="cv-stat-label" id="stat-altpos">ALT POS</div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="cv-content">
        {player.bio && (
          <div className="cv-card">
            <p className="cv-card-label" id="label-about">ABOUT</p>
            <p className="cv-bio">{player.bio}</p>
          </div>
        )}

        <div className="cv-card">
          <p className="cv-card-label" id="label-details">PLAYER DETAILS</p>
          {[
            { id: 'det-pos-p', labelId: 'lbl-pos-p', label: 'Primary Position', value: pos(player.position_primary) },
            { id: 'det-pos-s', labelId: 'lbl-pos-s', label: 'Secondary Position', value: player.position_secondary ? pos(player.position_secondary) : '–' },
            { id: 'det-nat', labelId: 'lbl-nat', label: 'Nationality', value: player.nationality_primary || '–' },
            { id: 'det-sch', labelId: 'lbl-sch', label: 'School', value: player.school_attended || '–' },
            { id: 'det-hgt', labelId: 'lbl-hgt', label: 'Height', value: player.height_cm ? `${player.height_cm} cm` : '–' },
            { id: 'det-wgt', labelId: 'lbl-wgt', label: 'Weight', value: player.weight_kg ? `${player.weight_kg} kg` : '–' },
            { id: 'det-age', labelId: 'lbl-age', label: 'Age', value: age ? `${age} years` : '–' },
          ].map(row => (
            <div key={row.id} className="cv-detail-row">
              <span className="cv-detail-label" id={row.labelId}>{row.label}</span>
              <span className="cv-detail-value" id={row.id}>{row.value}</span>
            </div>
          ))}
        </div>

        {(player.video_url || player.video_url_2 || player.video_url_3) && (
          <div className="cv-card">
            <p className="cv-card-label" id="label-video">VIDEO HIGHLIGHTS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {player.video_url && (
                <a href={player.video_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#F1EFE8', borderRadius: '8px', textDecoration: 'none', border: '0.5px solid #D3D1C7' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="white"><path d="M0 0L12 7L0 14V0Z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B2E' }} id="vid-1-label">Highlight reel</div><div style={{ fontSize: '11px', color: '#888780' }}>{player.video_url.includes('youtube') ? 'YouTube' : 'Vimeo'}</div></div>
                  <div style={{ fontSize: '12px', color: '#1D9E75', fontWeight: '700' }} id="vid-watch-1">Watch →</div>
                </a>
              )}
              {player.video_url_2 && (
                <a href={player.video_url_2} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#F1EFE8', borderRadius: '8px', textDecoration: 'none', border: '0.5px solid #D3D1C7' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="white"><path d="M0 0L12 7L0 14V0Z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B2E' }} id="vid-2-label">Match footage</div><div style={{ fontSize: '11px', color: '#888780' }}>{player.video_url_2.includes('youtube') ? 'YouTube' : 'Vimeo'}</div></div>
                  <div style={{ fontSize: '12px', color: '#1D9E75', fontWeight: '700' }} id="vid-watch-2">Watch →</div>
                </a>
              )}
              {player.video_url_3 && (
                <a href={player.video_url_3} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#F1EFE8', borderRadius: '8px', textDecoration: 'none', border: '0.5px solid #D3D1C7' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="white"><path d="M0 0L12 7L0 14V0Z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B2E' }} id="vid-3-label">Additional footage</div><div style={{ fontSize: '11px', color: '#888780' }}>{player.video_url_3.includes('youtube') ? 'YouTube' : 'Vimeo'}</div></div>
                  <div style={{ fontSize: '12px', color: '#1D9E75', fontWeight: '700' }} id="vid-watch-3">Watch →</div>
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

      {/* Client-side language script */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var lang = localStorage.getItem('gainline_lang') || 'en';
          var T = {
            en: {
              nav_label: 'PLAYER CV',
              about: 'ABOUT', details: 'PLAYER DETAILS', video: 'VIDEO HIGHLIGHTS',
              age: 'AGE', height: 'HEIGHT', weight: 'WEIGHT', altpos: 'ALT POS',
              pos_p: 'Primary Position', pos_s: 'Secondary Position',
              nat: 'Nationality', sch: 'School', hgt: 'Height', wgt: 'Weight', age_lbl: 'Age',
              years: 'years', vid1: 'Highlight reel', vid2: 'Match footage', vid3: 'Additional footage',
              watch: 'Watch →', powered: 'POWERED BY', tagline: 'No talent goes unseen',
              cta: 'Build your free profile →'
            },
            fr: {
              nav_label: 'CV JOUEUR',
              about: 'À PROPOS', details: 'DÉTAILS DU JOUEUR', video: 'VIDÉOS DE HIGHLIGHTS',
              age: 'ÂGE', height: 'TAILLE', weight: 'POIDS', altpos: 'POSTE ALT',
              pos_p: 'Poste principal', pos_s: 'Poste secondaire',
              nat: 'Nationalité', sch: 'École', hgt: 'Taille', wgt: 'Poids', age_lbl: 'Âge',
              years: 'ans', vid1: 'Highlight principal', vid2: 'Footage de match', vid3: 'Footage supplémentaire',
              watch: 'Regarder →', powered: 'PROPULSÉ PAR', tagline: 'Aucun talent ne passe inaperçu',
              cta: 'Créer mon profil gratuit →'
            }
          };

          function applyLang(l) {
            var t = T[l] || T.en;
            lang = l;
            localStorage.setItem('gainline_lang', l);

            // Update buttons
            var btnEn = document.getElementById('btn-en');
            var btnFr = document.getElementById('btn-fr');
            if (btnEn) btnEn.style.background = l === 'en' ? 'rgba(255,255,255,0.15)' : 'transparent';
            if (btnFr) btnFr.style.background = l === 'fr' ? 'rgba(255,255,255,0.15)' : 'transparent';

            // Nav label
            var navLabel = document.getElementById('cv-nav-label');
            if (navLabel) navLabel.textContent = t.nav_label;

            // Stat labels
            ['age','height','weight','altpos'].forEach(function(k) {
              var el = document.getElementById('stat-' + k);
              if (el) el.textContent = t[k];
            });

            // Section labels
            var aboutEl = document.getElementById('label-about');
            if (aboutEl) aboutEl.textContent = t.about;
            var detailsEl = document.getElementById('label-details');
            if (detailsEl) detailsEl.textContent = t.details;
            var videoEl = document.getElementById('label-video');
            if (videoEl) videoEl.textContent = t.video;

            // Detail row labels
            var lblMap = {
              'lbl-pos-p': t.pos_p, 'lbl-pos-s': t.pos_s,
              'lbl-nat': t.nat, 'lbl-sch': t.sch,
              'lbl-hgt': t.hgt, 'lbl-wgt': t.wgt, 'lbl-age': t.age_lbl
            };
            Object.keys(lblMap).forEach(function(id) {
              var el = document.getElementById(id);
              if (el) el.textContent = lblMap[id];
            });

            // Age value — update "years" text
            var ageVal = document.getElementById('det-age');
            if (ageVal && ageVal.textContent && ageVal.textContent !== '–') {
              ageVal.textContent = ageVal.textContent.replace(/years|ans/, t.years);
            }

            // Video labels
            var v1 = document.getElementById('vid-1-label'); if (v1) v1.textContent = t.vid1;
            var v2 = document.getElementById('vid-2-label'); if (v2) v2.textContent = t.vid2;
            var v3 = document.getElementById('vid-3-label'); if (v3) v3.textContent = t.vid3;
            ['vid-watch-1','vid-watch-2','vid-watch-3'].forEach(function(id) {
              var el = document.getElementById(id); if (el) el.textContent = t.watch;
            });

            // Footer
            var powered = document.getElementById('footer-powered'); if (powered) powered.textContent = t.powered;
            var tagline = document.getElementById('footer-tagline'); if (tagline) tagline.textContent = t.tagline;
            var cta = document.getElementById('footer-cta'); if (cta) cta.textContent = t.cta;
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
