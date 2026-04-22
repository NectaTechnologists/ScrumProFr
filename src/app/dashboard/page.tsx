import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const cards = [
    { titleKey: 'dashboard_card_profile', descKey: 'dashboard_card_profile_desc', color: '#1D9E75', href: '/dashboard/profile' },
    { titleKey: 'dashboard_card_docs', descKey: 'dashboard_card_docs_desc', color: '#0F6E56', href: '/dashboard/profile' },
    { titleKey: 'dashboard_card_media', descKey: 'dashboard_card_media_desc', color: '#0D1B2E', href: '/dashboard/profile' },
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F1EFE8; }
        .dash-nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .dash-logo { display: flex; align-items: center; gap: 10px; }
        .dash-logo-text { color: white; font-weight: 900; font-size: 20px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .dash-nav-right { display: flex; align-items: center; gap: 16px; }
        .dash-email { color: rgba(255,255,255,0.5); font-size: 13px; }
        .signout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); padding: 7px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: Arial, sans-serif; white-space: nowrap; }
        .lang-toggle { display: flex; gap: 2px; background: rgba(255,255,255,0.08); padding: 3px; border-radius: 8px; }
        .lang-btn { background: transparent; border: none; cursor: pointer; font-size: 16px; width: 30px; height: 26px; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .lang-btn-active { background: rgba(255,255,255,0.15); }
        .dash-content { padding: 48px 28px; max-width: 900px; margin: 0 auto; }
        .dash-title { font-size: 28px; font-weight: 900; color: #0D1B2E; margin-bottom: 8px; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; }
        .dash-subtitle { color: #5F5E5A; margin-bottom: 36px; font-size: 15px; }
        .dash-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .dash-card { background: white; border-radius: 12px; padding: 28px; border: 0.5px solid #D3D1C7; text-decoration: none; display: block; }
        .dash-card:hover { border-color: #1D9E75; }
        .dash-card-icon { width: 40px; height: 40px; border-radius: 8px; background: #E1F5EE; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .dash-card-title { font-size: 15px; font-weight: 700; color: #0D1B2E; margin-bottom: 6px; font-family: 'Arial Black', Arial, sans-serif; }
        .dash-card-desc { font-size: 13px; color: #888780; line-height: 1.5; margin-bottom: 20px; }
        .dash-card-btn { display: inline-block; padding: 7px 16px; border-radius: 6px; color: white; font-size: 12px; font-weight: 700; font-family: 'Arial Black', Arial, sans-serif; }
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
          <span className="dash-email">{user.email}</span>
          {/* Lang toggle handled client-side via DashboardClient */}
          <form action="/auth/signout" method="post">
            <button type="submit" className="signout-btn" id="signout-btn">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="dash-content">
        <h1 className="dash-title" id="dash-title">Welcome to Gainline</h1>
        <p className="dash-subtitle" id="dash-subtitle">Logged in as <strong>{user.email}</strong></p>

        <div className="dash-grid">
          {cards.map((card, i) => (
            <a key={i} href={card.href} className="dash-card">
              <div className="dash-card-icon">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <line x1="3" y1="16" x2="6" y2="5" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" opacity="0.35"/>
                  <line x1="9" y1="16" x2="12" y2="2" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" opacity="0.68"/>
                  <line x1="15" y1="16" x2="18" y2="0" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="dash-card-title" id={`card-title-${i}`}>
                  {i === 0 ? 'My Rugby Profile' : i === 1 ? 'Documents' : 'Media Gallery'}
                </div>
                <div className="dash-card-desc" id={`card-desc-${i}`}>
                  {i === 0 ? 'Build and share your digital player CV' : i === 1 ? 'Upload and manage your certificates and passport' : 'Add match photos and highlight videos'}
                </div>
                <span className="dash-card-btn" style={{ background: card.color }} id={`card-btn-${i}`}>Open →</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Client-side language script */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var lang = localStorage.getItem('gainline_lang') || 'en';
          var T = {
            en: {
              welcome: 'Welcome to Gainline',
              logged_in: 'Logged in as',
              signout: 'Sign out',
              card0_title: 'My Rugby Profile',
              card0_desc: 'Build and share your digital player CV',
              card1_title: 'Documents',
              card1_desc: 'Upload and manage your certificates and passport',
              card2_title: 'Media Gallery',
              card2_desc: 'Add match photos and highlight videos',
              open: 'Open →'
            },
            fr: {
              welcome: 'Bienvenue sur Gainline',
              logged_in: 'Connecté en tant que',
              signout: 'Se déconnecter',
              card0_title: 'Mon profil rugby',
              card0_desc: 'Créez et partagez votre CV joueur numérique',
              card1_title: 'Documents',
              card1_desc: 'Téléversez et gérez vos certificats et passeport',
              card2_title: 'Galerie médias',
              card2_desc: 'Ajoutez des photos de matchs et vidéos de highlights',
              open: 'Ouvrir →'
            }
          };
          var translations = T[lang] || T.en;
          document.addEventListener('DOMContentLoaded', function() {
            var title = document.getElementById('dash-title');
            if (title) title.innerHTML = translations.welcome;
            var signout = document.getElementById('signout-btn');
            if (signout) signout.textContent = translations.signout;
            for (var i = 0; i < 3; i++) {
              var ct = document.getElementById('card-title-' + i);
              var cd = document.getElementById('card-desc-' + i);
              var cb = document.getElementById('card-btn-' + i);
              if (ct) ct.textContent = translations['card' + i + '_title'];
              if (cd) cd.textContent = translations['card' + i + '_desc'];
              if (cb) cb.textContent = translations.open;
            }
          });
        })();
      `}} />
    </>
  )
}
