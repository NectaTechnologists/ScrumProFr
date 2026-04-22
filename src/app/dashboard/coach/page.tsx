import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CoachDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get profile and check role + approval
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If not an org_user, redirect to player dashboard
  if (!profile || profile.role === 'player') {
    redirect('/dashboard')
  }

  // If not yet approved, show pending screen
  if (!profile.approved) {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; background: #F1EFE8; }
          .nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
          .logo { display: flex; align-items: center; gap: 10px; }
          .logo-text { color: white; font-weight: 900; font-size: 20px; letter-spacing: -1px; font-family: 'Arial Black', Arial, sans-serif; }
          .pending { max-width: 560px; margin: 80px auto; padding: 0 20px; text-align: center; }
          .pending-icon { width: 72px; height: 72px; border-radius: 50%; background: #E1F5EE; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
          .pending h1 { font-size: 26px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 12px; }
          .pending p { font-size: 15px; color: #5F5E5A; line-height: 1.7; margin-bottom: 8px; }
          .email { font-size: 13px; color: #888780; margin-top: 24px; }
        `}</style>
        <nav className="nav">
          <div className="logo">
            <svg width="32" height="30" viewBox="0 0 32 30" style={{ display: 'block' }}>
              <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
              <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
              <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
            </svg>
            <span className="logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)', padding: '7px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>Sign out</button>
          </form>
        </nav>
        <div className="pending">
          <div className="pending-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="#1D9E75" strokeWidth="2.5"/>
              <line x1="16" y1="10" x2="16" y2="17" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="21" r="1.5" fill="#1D9E75"/>
            </svg>
          </div>
          <h1>Account pending approval</h1>
          <p>Your application is being reviewed. We manually verify all coach and recruiter accounts to maintain the quality of the Gainline network.</p>
          <p>You&apos;ll receive an email at <strong>{user.email}</strong> once your account has been approved — usually within 24 hours.</p>
          <p className="email">Questions? Contact us at <a href="mailto:hello@gainline.pro" style={{ color: '#1D9E75' }}>hello@gainline.pro</a></p>
        </div>
      </>
    )
  }

  // Fetch public players for browsing (limit 10 for free tier)
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('profile_visibility', 'PUBLIC')
    .limit(10)
    .order('created_at', { ascending: false })

  const pos = (s: string) => s?.replace(/_/g, ' ') || '–'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F1EFE8; }

        .nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; }
        .nav-logo-text { color: white; font-weight: 900; font-size: 20px; letter-spacing: -1px; font-family: 'Arial Black', Arial, sans-serif; }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .nav-email { color: rgba(255,255,255,0.5); font-size: 13px; }
        .signout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); padding: 7px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: Arial, sans-serif; }

        .content { max-width: 1000px; margin: 0 auto; padding: 40px 28px; }

        .page-header { margin-bottom: 32px; }
        .page-label { font-size: 10px; color: #1D9E75; letter-spacing: 0.14em; font-weight: 700; margin-bottom: 8px; }
        .page-title { font-size: 28px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.5px; margin-bottom: 6px; }
        .page-sub { font-size: 14px; color: #5F5E5A; }

        .tabs { display: flex; gap: 4px; margin-bottom: 28px; background: white; padding: 4px; border-radius: 10px; border: 0.5px solid #D3D1C7; width: fit-content; }
        .tab { padding: 8px 18px; border-radius: 7px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; background: transparent; color: #888780; font-family: Arial, sans-serif; }
        .tab-active { background: #0D1B2E; color: white; }

        .filter-bar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .filter-select { padding: 9px 14px; border: 1.5px solid #D3D1C7; border-radius: 8px; font-size: 13px; color: #0D1B2E; background: white; outline: none; font-family: Arial, sans-serif; cursor: pointer; }
        .filter-select:focus { border-color: #1D9E75; }

        .player-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .player-card { background: white; border-radius: 12px; padding: 20px; border: 0.5px solid #D3D1C7; text-decoration: none; display: block; transition: border-color 0.15s; }
        .player-card:hover { border-color: #1D9E75; }

        .player-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .player-avatar { width: 44px; height: 44px; border-radius: 10px; background: #1D9E75; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .player-avatar span { color: white; font-size: 16px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; }
        .player-name { font-size: 15px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 3px; }
        .player-org { font-size: 12px; color: #888780; }

        .player-position { display: inline-block; background: #E1F5EE; color: #0F6E56; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.06em; margin-bottom: 12px; }

        .player-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #F1EFE8; border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
        .player-stat { background: white; padding: 10px 8px; text-align: center; }
        .player-stat-val { font-size: 14px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; }
        .player-stat-lbl { font-size: 9px; color: #888780; letter-spacing: 0.08em; margin-top: 2px; }

        .view-cv-btn { width: 100%; padding: 8px; background: #0D1B2E; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; font-family: 'Arial Black', Arial, sans-serif; cursor: pointer; text-align: center; text-decoration: none; display: block; }

        .upgrade-banner { background: #0D1B2E; border-radius: 12px; padding: 24px 28px; margin-top: 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .upgrade-text h3 { font-size: 16px; font-weight: 900; color: white; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 4px; }
        .upgrade-text p { font-size: 13px; color: rgba(255,255,255,0.55); }
        .upgrade-btn { background: #1D9E75; color: white; font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; white-space: nowrap; }

        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-state h3 { font-size: 18px; font-weight: 900; color: #0D1B2E; font-family: 'Arial Black', Arial, sans-serif; margin-bottom: 8px; }
        .empty-state p { font-size: 14px; color: #888780; }

        @media (max-width: 768px) {
          .nav { padding: 0 16px; height: 56px; }
          .nav-email { display: none; }
          .nav-logo-text { font-size: 17px; }
          .content { padding: 28px 16px; }
          .page-title { font-size: 22px; }
          .player-grid { grid-template-columns: 1fr; }
          .filter-bar { gap: 8px; }
          .filter-select { font-size: 12px; padding: 8px 10px; }
          .upgrade-banner { flex-direction: column; align-items: flex-start; }
          .upgrade-btn { width: 100%; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <svg width="32" height="30" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="nav-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </div>
        <div className="nav-right">
          <span className="nav-email">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="signout-btn">Sign out</button>
          </form>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="content">
        <div className="page-header">
          <p className="page-label">COACH & RECRUITER PORTAL</p>
          <h1 className="page-title">Player Browser</h1>
          <p className="page-sub">
            {profile.organisation_name && `${profile.organisation_name} · `}
            {profile.role_title && `${profile.role_title} · `}
            Showing 10 players on free tier
          </p>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <select className="filter-select">
            <option value="">All positions</option>
            {['LOOSEHEAD_PROP','HOOKER','TIGHTHEAD_PROP','LEFT_LOCK','RIGHT_LOCK',
              'BLINDSIDE_FLANKER','OPENSIDE_FLANKER','NUMBER_8','SCRUMHALF','FLYHALF',
              'LEFT_WING','INSIDE_CENTRE','OUTSIDE_CENTRE','RIGHT_WING','FULLBACK'
            ].map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="filter-select">
            <option value="">All nationalities</option>
            <option>South African</option>
            <option>English</option>
            <option>Welsh</option>
            <option>Irish</option>
            <option>Scottish</option>
            <option>French</option>
            <option>Australian</option>
            <option>New Zealand</option>
            <option>Argentinian</option>
            <option>Zimbabwean</option>
          </select>
          <select className="filter-select">
            <option value="">Any age</option>
            <option>Under 18</option>
            <option>18–21</option>
            <option>22–25</option>
            <option>26–30</option>
            <option>30+</option>
          </select>
        </div>

        {/* Player Grid */}
        {players && players.length > 0 ? (
          <>
            <div className="player-grid">
              {players.map(player => {
                const initials = [player.first_name?.[0], player.last_name?.[0]].filter(Boolean).join('')
                const age = player.date_of_birth
                  ? Math.floor((new Date().getTime() - new Date(player.date_of_birth).getTime()) / 31557600000)
                  : null

                return (
                  <div key={player.id} className="player-card">
                    <div className="player-header">
                      <div className="player-avatar">
                        <span>{initials}</span>
                      </div>
                      <div>
                        <div className="player-name">{player.first_name} {player.last_name}</div>
                        <div className="player-org">{player.nationality_primary || '–'} · {player.school_attended || '–'}</div>
                      </div>
                    </div>

                    {player.position_primary && (
                      <div className="player-position">{pos(player.position_primary)}</div>
                    )}

                    <div className="player-stats">
                      <div className="player-stat">
                        <div className="player-stat-val">{age ?? '–'}</div>
                        <div className="player-stat-lbl">AGE</div>
                      </div>
                      <div className="player-stat">
                        <div className="player-stat-val">{player.height_cm ? `${player.height_cm}` : '–'}</div>
                        <div className="player-stat-lbl">CM</div>
                      </div>
                      <div className="player-stat">
                        <div className="player-stat-val">{player.weight_kg ? `${player.weight_kg}` : '–'}</div>
                        <div className="player-stat-lbl">KG</div>
                      </div>
                    </div>

                    <a href={`/cv/${player.share_token}`} className="view-cv-btn" target="_blank" rel="noopener noreferrer">
                      View full CV →
                    </a>
                  </div>
                )
              })}
            </div>

            {/* Upgrade banner */}
            <div className="upgrade-banner">
              <div className="upgrade-text">
                <h3>You&apos;re seeing 10 of {players.length}+ players on Gainline</h3>
                <p>Upgrade to access the full player pool, advanced filters, and shortlisting tools.</p>
              </div>
              <a href="mailto:hello@gainline.pro?subject=Gainline Full Access" className="upgrade-btn">
                Get full access →
              </a>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>No players yet</h3>
            <p>Players will appear here as they join Gainline and set their profile to public.</p>
          </div>
        )}
      </div>
    </>
  )
}
