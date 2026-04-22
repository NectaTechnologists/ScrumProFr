export default function Home() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; }

        .nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-links { display: flex; gap: 20px; align-items: center; }
        .nav-link { color: rgba(255,255,255,0.65); font-size: 13px; text-decoration: none; }
        .nav-cta { background: #1D9E75; color: white; font-size: 13px; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 700; white-space: nowrap; }

        .hero { background: #0D1B2E; padding: 80px 40px 60px; text-align: center; }
        .hero-inner { max-width: 820px; margin: 0 auto; }
        .hero h1 { font-size: 52px; font-weight: 900; color: white; letter-spacing: -2px; line-height: 1.06; margin-bottom: 18px; font-family: 'Arial Black', Arial, sans-serif; }
        .hero p { font-size: 17px; color: rgba(255,255,255,0.56); line-height: 1.75; max-width: 520px; margin: 0 auto 32px; }
        .hero-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .btn-primary { background: #1D9E75; color: white; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; }
        .btn-ghost { background: transparent; color: white; font-size: 14px; padding: 13px 22px; border-radius: 6px; text-decoration: none; border: 1.5px solid rgba(255,255,255,0.25); }
        .btn-dark { background: #0D1B2E; color: white; font-size: 13px; font-weight: 700; padding: 12px 22px; border-radius: 6px; text-decoration: none; font-family: 'Arial Black', Arial, sans-serif; display: inline-block; }
        .hero-note { margin-top: 16px; font-size: 11px; color: rgba(255,255,255,0.26); letter-spacing: 0.06em; }

        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(29,158,117,0.14); border: 1px solid rgba(29,158,117,0.3); border-radius: 20px; padding: 5px 14px; margin-bottom: 26px; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #1D9E75; flex-shrink: 0; }
        .badge-text { font-size: 11px; color: #5DCAA5; letter-spacing: 0.12em; }

        .pull-quote { background: #1D9E75; padding: 32px 40px; text-align: center; }
        .pull-quote p { font-size: 19px; color: white; max-width: 680px; margin: 0 auto; line-height: 1.45; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; letter-spacing: -0.2px; }

        .split { display: grid; grid-template-columns: 1fr 1fr; }
        .split-player { background: #0F2438; padding: 52px 44px; }
        .split-agent { background: #1D9E75; padding: 52px 44px; }
        .split-label { font-size: 10px; letter-spacing: 0.14em; margin-bottom: 24px; }
        .split-player .split-label { color: #5DCAA5; }
        .split-agent .split-label { color: rgba(255,255,255,0.65); }
        .split h2 { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 14px; font-family: 'Arial Black', Arial, sans-serif; color: white; }
        .split p { font-size: 13px; line-height: 1.72; margin-bottom: 26px; }
        .split-player p { color: rgba(255,255,255,0.48); }
        .split-agent p { color: rgba(255,255,255,0.78); }
        .bullet-list { display: flex; flex-direction: column; gap: 11px; margin-bottom: 30px; }
        .bullet-item { display: flex; align-items: flex-start; gap: 9px; }
        .bullet-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
        .split-player .bullet-dot { background: #1D9E75; }
        .split-agent .bullet-dot { background: rgba(255,255,255,0.9); }
        .bullet-item span { font-size: 13px; }
        .split-player .bullet-item span { color: rgba(255,255,255,0.62); }
        .split-agent .bullet-item span { color: rgba(255,255,255,0.85); }
        .btn-teal { background: #1D9E75; color: white; font-size: 12px; padding: 11px 22px; border-radius: 6px; text-decoration: none; font-weight: 700; font-family: 'Arial Black', Arial, sans-serif; display: inline-block; }

        .pathway { background: #F1EFE8; padding: 72px 40px; }
        .pathway-inner { max-width: 860px; margin: 0 auto; }
        .section-label { font-size: 10px; letter-spacing: 0.16em; color: #0F6E56; margin-bottom: 10px; }
        .section-title { font-size: 32px; font-weight: 900; color: #0D1B2E; letter-spacing: -1px; line-height: 1.15; font-family: 'Arial Black', Arial, sans-serif; }
        .section-body { font-size: 14px; color: #5F5E5A; line-height: 1.75; max-width: 560px; margin: 20px auto 0; text-align: center; }
        .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 44px; }
        .card { background: white; border-radius: 12px; padding: 26px; border: 0.5px solid #D3D1C7; }
        .card-bar { border-top: 3px solid #1D9E75; margin-bottom: 16px; }
        .card h3 { font-size: 14px; font-weight: 900; color: #0D1B2E; margin-bottom: 8px; font-family: 'Arial Black', Arial, sans-serif; }
        .card p { font-size: 13px; color: #5F5E5A; line-height: 1.65; }

        .cta-section { background: #F1EFE8; padding: 0 40px 72px; }
        .cta-inner { max-width: 860px; margin: 0 auto; }
        .cta-title { font-size: 32px; font-weight: 900; color: #0D1B2E; letter-spacing: -1px; font-family: 'Arial Black', Arial, sans-serif; text-align: center; }
        .cta-sub { font-size: 14px; color: #5F5E5A; margin-top: 10px; line-height: 1.7; text-align: center; margin-bottom: 32px; }
        .cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .cta-card-dark { background: #0D1B2E; border-radius: 12px; padding: 36px; }
        .cta-card-teal { background: #1D9E75; border-radius: 12px; padding: 36px; }
        .cta-label { font-size: 10px; letter-spacing: 0.14em; margin-bottom: 10px; }
        .cta-card-dark .cta-label { color: #5DCAA5; }
        .cta-card-teal .cta-label { color: rgba(255,255,255,0.65); }
        .cta-card-dark h3 { font-size: 22px; font-weight: 900; color: white; letter-spacing: -0.5px; margin-bottom: 10px; font-family: 'Arial Black', Arial, sans-serif; }
        .cta-card-teal h3 { font-size: 22px; font-weight: 900; color: white; letter-spacing: -0.5px; margin-bottom: 10px; font-family: 'Arial Black', Arial, sans-serif; }
        .cta-card-dark p { font-size: 13px; color: rgba(255,255,255,0.48); line-height: 1.65; margin-bottom: 24px; }
        .cta-card-teal p { font-size: 13px; color: rgba(255,255,255,0.78); line-height: 1.65; margin-bottom: 24px; }

        .footer { background: #0D1B2E; padding: 22px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .footer-logo { display: flex; align-items: center; gap: 8px; }
        .footer-copy { font-size: 11px; color: rgba(255,255,255,0.28); }
        .footer-links { display: flex; gap: 18px; }
        .footer-link { font-size: 11px; color: rgba(255,255,255,0.32); text-decoration: none; }

        @media (max-width: 768px) {
          .nav { padding: 0 20px; height: 56px; }
          .nav-links .nav-link { display: none; }
          .nav-cta { font-size: 12px; padding: 8px 14px; }

          .hero { padding: 60px 20px 48px; }
          .hero h1 { font-size: 36px; letter-spacing: -1px; }
          .hero p { font-size: 15px; }
          .hero-btns { flex-direction: column; align-items: center; }
          .btn-primary { width: 100%; max-width: 320px; text-align: center; font-size: 15px; padding: 15px 28px; }
          .btn-ghost { width: 100%; max-width: 320px; text-align: center; }
          .hero-note { font-size: 10px; }

          .pull-quote { padding: 28px 20px; }
          .pull-quote p { font-size: 15px; }

          .split { grid-template-columns: 1fr; }
          .split-player { padding: 40px 24px; }
          .split-agent { padding: 40px 24px; }
          .split h2 { font-size: 24px; }
          .btn-teal { width: 100%; text-align: center; }
          .btn-dark { width: 100%; text-align: center; }

          .pathway { padding: 52px 20px; }
          .section-title { font-size: 26px; }
          .cards { grid-template-columns: 1fr; gap: 12px; }

          .cta-section { padding: 0 20px 52px; }
          .cta-title { font-size: 26px; }
          .cta-grid { grid-template-columns: 1fr; }
          .cta-card-dark { padding: 28px; }
          .cta-card-teal { padding: 28px; }
          .cta-card-dark h3 { font-size: 20px; }
          .cta-card-teal h3 { font-size: 20px; }

          .footer { flex-direction: column; align-items: flex-start; padding: 24px 20px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo">
          <svg width="36" height="32" viewBox="0 0 36 32" style={{ display: 'block' }}>
            <line x1="3" y1="30" x2="10" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="15" y1="30" x2="22" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="27" y1="30" x2="34" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span style={{ color: 'white', fontWeight: '900', fontSize: '20px', letterSpacing: '-1px', fontFamily: 'Arial Black, Arial, sans-serif' }}>
            GAIN<span style={{ color: '#1D9E75' }}>LINE</span>
          </span>
        </a>
        <div className="nav-links">
          <a href="/login" className="nav-link">For players</a>
          <a href="/login" className="nav-link">For agents</a>
          <a href="/login" className="nav-link">Pricing</a>
          <a href="/login" className="nav-cta">Get started</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="badge">
            <div className="badge-dot"></div>
            <span className="badge-text">NO TALENT GOES UNSEEN</span>
          </div>
          <h1>The pathway starts<br/>with being <span style={{ color: '#1D9E75' }}>seen.</span></h1>
          <p>Gainline gives every rugby player a professional digital profile — and gives agents the tools to manage, present and place their players. Wherever the game takes you.</p>
          <div className="hero-btns">
            <a href="/login" className="btn-primary">Build your free profile</a>
            <a href="/login" className="btn-ghost">I&apos;m an agent</a>
          </div>
          <p className="hero-note">PLAYER PROFILES ALWAYS FREE &nbsp;·&nbsp; AGENT TOOLS FROM €99/MONTH</p>
        </div>
      </section>

      {/* PULL QUOTE */}
      <div className="pull-quote">
        <p>&ldquo;In rugby, the pathway is everything. Gainline exists to make sure <span style={{ color: '#0D1B2E' }}>talent meets opportunity</span> — no matter where in the world that talent is.&rdquo;</p>
      </div>

      {/* SPLIT */}
      <div className="split">
        <div className="split-player">
          <p className="split-label">FOR PLAYERS</p>
          <h2>Your profile is your passport to the game.</h2>
          <p>Every pathway — academy selection, professional contract, overseas opportunity — begins with someone seeing what you can do. Gainline makes sure you&apos;re always visible, always professional, always ready.</p>
          <div className="bullet-list">
            {['Stats, video, history and accolades in one place', 'One shareable link — clubs, coaches, agents', 'See who has viewed and saved your profile', 'Free — always. No subscription, no expiry'].map(item => (
              <div key={item} className="bullet-item">
                <div className="bullet-dot"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <a href="/login" className="btn-teal">Build my free profile</a>
        </div>
        <div className="split-agent">
          <p className="split-label">FOR AGENTS</p>
          <h2>Your players deserve better than a PDF.</h2>
          <p>Gainline gives you a professional platform to manage your entire book — and present your players to any club, in any league, anywhere in the world. The way the modern game demands.</p>
          <div className="bullet-list">
            {['Full book management — filter by position, age, location', 'Separate prospects from contracted players', 'Share profiles and track interest in real time', 'Passport, contract and medical document storage'].map(item => (
              <div key={item} className="bullet-item">
                <div className="bullet-dot"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <a href="/login" className="btn-dark">Start 30-day free trial</a>
        </div>
      </div>

      {/* PATHWAY */}
      <section className="pathway">
        <div className="pathway-inner">
          <div style={{ textAlign: 'center' }}>
            <p className="section-label">WHY VISIBILITY MATTERS</p>
            <h2 className="section-title">The pathway is real.<br/>But only if they can find you.</h2>
            <p className="section-body">In rugby, pathways exist at every level — from grassroots to international. Academy systems, provincial structures, overseas contracts, national selection. Every one of those pathways begins the same way: someone has to see you. Gainline makes sure that&apos;s always possible.</p>
          </div>
          <div className="cards">
            {[
              { title: 'Academy pathways', desc: 'Age-grade and academy selectors are looking constantly. A complete profile gives you a presence that a highlight reel alone never will.' },
              { title: 'Professional contracts', desc: 'Clubs need to assess quickly. Gainline puts everything they need in one place — physical data, history, video — ready when they are.' },
              { title: 'Overseas opportunities', desc: 'The global game opens doors — but only to players who are findable. A Gainline profile travels with you, across leagues, borders and time zones.' },
            ].map(card => (
              <div key={card.title} className="card">
                <div className="card-bar"></div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Cross the gainline.</h2>
          <p className="cta-sub">Whether you&apos;re a player chasing your next opportunity, or an agent building the game&apos;s next generation — this is where the pathway starts.</p>
          <div className="cta-grid">
            <div className="cta-card-dark">
              <p className="cta-label">FOR PLAYERS</p>
              <h3>No talent goes unseen.</h3>
              <p>Your Gainline profile is free, forever. Build it today and let it open doors you don&apos;t even know exist yet.</p>
              <a href="/login" className="btn-teal">Build my free profile</a>
            </div>
            <div className="cta-card-teal">
              <p className="cta-label">FOR AGENTS</p>
              <h3>Talent meets opportunity.</h3>
              <p>Give your players the professional presence they deserve. 30 days free, no commitment.</p>
              <a href="/login" className="btn-dark">Start free trial</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">
          <svg width="26" height="24" viewBox="0 0 26 24" style={{ display: 'block' }}>
            <line x1="2" y1="22" x2="7" y2="4" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.28"/>
            <line x1="11" y1="22" x2="16" y2="1" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.58"/>
            <line x1="20" y1="22" x2="25" y2="0" stroke="#1D9E75" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: '13px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px', fontFamily: 'Arial Black, Arial, sans-serif' }}>GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </div>
        <span className="footer-copy">gainline.pro &nbsp;·&nbsp; 2026</span>
        <div className="footer-links">
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Terms</a>
          <a href="#" className="footer-link">Contact</a>
        </div>
      </footer>
    </>
  )
}
