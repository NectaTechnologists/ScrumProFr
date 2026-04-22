import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const cards = [
    { title: 'My Rugby Profile', desc: 'Build and share your digital player CV', color: '#1D9E75', href: '/dashboard/profile' },
    { title: 'Documents', desc: 'Upload and manage your certificates and passport', color: '#0F6E56', href: '/dashboard/profile' },
    { title: 'Media Gallery', desc: 'Add match photos and highlight videos', color: '#0D1B2E', href: '/dashboard/profile' },
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F1EFE8; }

        .dash-nav {
          background: #0D1B2E;
          padding: 0 28px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dash-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dash-logo-text {
          color: white;
          font-weight: 900;
          font-size: 20px;
          letter-spacing: -0.5px;
          font-family: 'Arial Black', Arial, sans-serif;
        }

        .dash-nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .dash-email {
          color: rgba(255,255,255,0.5);
          font-size: 13px;
        }

        .signout-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.7);
          padding: 7px 16px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          font-family: Arial, sans-serif;
          white-space: nowrap;
        }

        .dash-content {
          padding: 48px 28px;
          max-width: 900px;
          margin: 0 auto;
        }

        .dash-title {
          font-size: 28px;
          font-weight: 900;
          color: #0D1B2E;
          margin-bottom: 8px;
          font-family: 'Arial Black', Arial, sans-serif;
          letter-spacing: -0.5px;
        }

        .dash-subtitle {
          color: #5F5E5A;
          margin-bottom: 36px;
          font-size: 15px;
        }

        .dash-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .dash-card {
          background: white;
          border-radius: 12px;
          padding: 28px;
          border: 0.5px solid #D3D1C7;
          text-decoration: none;
          display: block;
          transition: border-color 0.2s;
        }

        .dash-card:hover {
          border-color: #1D9E75;
        }

        .dash-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #E1F5EE;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .dash-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #0D1B2E;
          margin-bottom: 6px;
          font-family: 'Arial Black', Arial, sans-serif;
        }

        .dash-card-desc {
          font-size: 13px;
          color: #888780;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .dash-card-btn {
          display: inline-block;
          padding: 7px 16px;
          border-radius: 6px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Arial Black', Arial, sans-serif;
        }

        @media (max-width: 768px) {
          .dash-nav { padding: 0 16px; height: 56px; }
          .dash-logo-text { font-size: 17px; }
          .dash-email { display: none; }
          .signout-btn { font-size: 12px; padding: 6px 12px; }

          .dash-content { padding: 32px 16px; }
          .dash-title { font-size: 22px; }
          .dash-subtitle { font-size: 14px; margin-bottom: 24px; }

          .dash-grid { grid-template-columns: 1fr; gap: 12px; }
          .dash-card { padding: 20px; display: flex; align-items: flex-start; gap: 16px; }
          .dash-card-icon { flex-shrink: 0; margin-bottom: 0; }
          .dash-card-body { flex: 1; }
          .dash-card-title { font-size: 14px; margin-bottom: 4px; }
          .dash-card-desc { font-size: 12px; margin-bottom: 12px; }
        }
      `}</style>

      {/* NAV */}
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
          <form action="/auth/signout" method="post">
            <button type="submit" className="signout-btn">Sign out</button>
          </form>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="dash-content">
        <h1 className="dash-title">Welcome to Gainline</h1>
        <p className="dash-subtitle">Logged in as <strong>{user.email}</strong></p>

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
              <div className="dash-card-body">
                <div className="dash-card-title">{card.title}</div>
                <div className="dash-card-desc">{card.desc}</div>
                <span className="dash-card-btn" style={{ background: card.color }}>Open →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
