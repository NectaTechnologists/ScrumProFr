export default function Home() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>

      {/* NAV */}
      <div style={{ background: '#0D1B2E', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="44" height="40" viewBox="0 0 44 40" style={{ display: 'block' }}>
            <line x1="4" y1="38" x2="13" y2="8" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.28"/>
            <line x1="18" y1="38" x2="27" y2="2" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.58"/>
            <line x1="32" y1="38" x2="41" y2="0" stroke="#1D9E75" strokeWidth="6" strokeLinecap="round"/>
          </svg>
          <span style={{ color: 'white', fontWeight: '900', fontSize: '22px', letterSpacing: '-1px', fontFamily: 'Arial Black, Arial, sans-serif' }}>
            GAIN<span style={{ color: '#1D9E75' }}>LINE</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="/login" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', textDecoration: 'none' }}>For players</a>
          <a href="/login" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', textDecoration: 'none' }}>For agents</a>
          <a href="/login" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', textDecoration: 'none' }}>Pricing</a>
          <a href="/login" style={{ background: '#1D9E75', color: 'white', fontSize: '13px', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontFamily: 'Arial Black, Arial, sans-serif' }}>Get started</a>
        </div>
      </div>

      {/* HERO */}
      <div style={{ background: '#0D1B2E', padding: '90px 40px 70px', textAlign: 'center' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(29,158,117,0.14)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: '20px', padding: '5px 14px', marginBottom: '26px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1D9E75' }}></div>
            <span style={{ fontSize: '11px', color: '#5DCAA5', letterSpacing: '0.12em' }}>NO TALENT GOES UNSEEN</span>
          </div>
          <h1 style={{ fontSize: '52px', fontWeight: '900', color: 'white', letterSpacing: '-2px', lineHeight: '1.06', marginBottom: '18px', fontFamily: 'Arial Black, Arial, sans-serif' }}>
            The pathway starts<br/>with being <span style={{ color: '#1D9E75' }}>seen.</span>
          </h1>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.56)', lineHeight: '1.75', maxWidth: '520px', margin: '0 auto 32px' }}>
            Gainline gives every rugby player a professional digital profile — and gives agents the tools to manage, present and place their players. Wherever the game takes you.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/login" style={{ background: '#1D9E75', color: 'white', fontSize: '15px', fontWeight: '700', padding: '14px 28px', borderRadius: '6px', textDecoration: 'none', fontFamily: 'Arial Black, Arial, sans-serif' }}>Build your free profile</a>
            <a href="/login" style={{ background: 'transparent', color: 'white', fontSize: '14px', padding: '13px 22px', borderRadius: '6px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.25)' }}>I&apos;m an agent</a>
          </div>
          <p style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.26)', letterSpacing: '0.06em' }}>PLAYER PROFILES ALWAYS FREE &nbsp;·&nbsp; AGENT TOOLS FROM €99/MONTH</p>
        </div>
      </div>

      {/* PULL QUOTE */}
      <div style={{ background: '#1D9E75', padding: '32px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: '19px', color: 'white', maxWidth: '680px', margin: '0 auto', lineHeight: '1.45', fontWeight: '900', fontFamily: 'Arial Black, Arial, sans-serif', letterSpacing: '-0.2px' }}>
          &ldquo;In rugby, the pathway is everything. Gainline exists to make sure <span style={{ color: '#0D1B2E' }}>talent meets opportunity</span> — no matter where in the world that talent is.&rdquo;
        </p>
      </div>

      {/* DUAL AUDIENCE SPLIT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        {/* Players */}
        <div style={{ background: '#0F2438', padding: '52px 44px' }}>
          <p style={{ fontSize: '10px', color: '#5DCAA5', letterSpacing: '0.14em', marginBottom: '24px' }}>FOR PLAYERS</p>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px', lineHeight: '1.2', marginBottom: '14px', fontFamily: 'Arial Black, Arial, sans-serif' }}>Your profile is your<br/>passport to the game.</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.48)', lineHeight: '1.72', marginBottom: '26px' }}>Every pathway — academy selection, professional contract, overseas opportunity — begins with someone seeing what you can do. Gainline makes sure you&apos;re always visible, always professional, always ready.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '30px' }}>
            {['Stats, video, history and accolades in one place', 'One shareable link — clubs, coaches, agents', 'See who has viewed and saved your profile', 'Free — always. No subscription, no expiry'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }}></div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.62)' }}>{item}</span>
              </div>
            ))}
          </div>
          <a href="/login" style={{ background: '#1D9E75', color: 'white', fontSize: '12px', padding: '11px 22px', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontFamily: 'Arial Black, Arial, sans-serif' }}>Build my free profile</a>
        </div>

        {/* Agents */}
        <div style={{ background: '#1D9E75', padding: '52px 44px' }}>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.14em', marginBottom: '24px' }}>FOR AGENTS</p>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px', lineHeight: '1.2', marginBottom: '14px', fontFamily: 'Arial Black, Arial, sans-serif' }}>Your players deserve<br/>better than a PDF.</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.78)', lineHeight: '1.72', marginBottom: '26px' }}>Gainline gives you a professional platform to manage your entire book — and present your players to any club, in any league, anywhere in the world. The way the modern game demands.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '30px' }}>
            {['Full book management — filter by position, age, location', 'Separate prospects from contracted players', 'Share profiles and track interest in real time', 'Passport, contract and medical document storage'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', flexShrink: 0 }}></div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{item}</span>
              </div>
            ))}
          </div>
          <a href="/login" style={{ background: '#0D1B2E', color: 'white', fontSize: '12px', padding: '11px 22px', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontFamily: 'Arial Black, Arial, sans-serif' }}>Start 30-day free trial</a>
        </div>
      </div>

      {/* PATHWAY SECTION */}
      <div style={{ background: '#F1EFE8', padding: '72px 40px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.16em', color: '#0F6E56', marginBottom: '10px' }}>WHY VISIBILITY MATTERS</p>
            <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0D1B2E', letterSpacing: '-1px', lineHeight: '1.15', fontFamily: 'Arial Black, Arial, sans-serif' }}>The pathway is real.<br/>But only if they can find you.</h2>
            <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.75', maxWidth: '560px', margin: '20px auto 0' }}>In rugby, pathways exist at every level — from grassroots to international. Academy systems, provincial structures, overseas contracts, national selection. Every one of those pathways begins the same way: someone has to see you. Gainline makes sure that&apos;s always possible.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {[
              { title: 'Academy pathways', desc: 'Age-grade and academy selectors are looking constantly. A complete profile gives you a presence that a highlight reel alone never will.' },
              { title: 'Professional contracts', desc: 'Clubs need to assess quickly. Gainline puts everything they need in one place — physical data, history, video — ready when they are.' },
              { title: 'Overseas opportunities', desc: 'The global game opens doors — but only to players who are findable. A Gainline profile travels with you, across leagues, borders and time zones.' },
            ].map(card => (
              <div key={card.title} style={{ background: 'white', borderRadius: '12px', padding: '26px', border: '0.5px solid #D3D1C7' }}>
                <div style={{ borderTop: '3px solid #1D9E75', marginBottom: '16px' }}></div>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0D1B2E', marginBottom: '8px', fontFamily: 'Arial Black, Arial, sans-serif' }}>{card.title}</h3>
                <p style={{ fontSize: '13px', color: '#5F5E5A', lineHeight: '1.65' }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DUAL CTA */}
      <div style={{ background: '#F1EFE8', padding: '0 40px 72px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0D1B2E', letterSpacing: '-1px', fontFamily: 'Arial Black, Arial, sans-serif' }}>Cross the gainline.</h2>
            <p style={{ fontSize: '14px', color: '#5F5E5A', marginTop: '10px', lineHeight: '1.7' }}>Whether you&apos;re a player chasing your next opportunity, or an agent building the game&apos;s next generation — this is where the pathway starts.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#0D1B2E', borderRadius: '12px', padding: '36px' }}>
              <p style={{ fontSize: '10px', color: '#5DCAA5', letterSpacing: '0.14em', marginBottom: '10px' }}>FOR PLAYERS</p>
              <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px', marginBottom: '10px', fontFamily: 'Arial Black, Arial, sans-serif' }}>No talent goes unseen.</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.48)', lineHeight: '1.65', marginBottom: '24px' }}>Your Gainline profile is free, forever. Build it today and let it open doors you don&apos;t even know exist yet.</p>
              <a href="/login" style={{ background: '#1D9E75', color: 'white', fontSize: '12px', padding: '11px 22px', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontFamily: 'Arial Black, Arial, sans-serif' }}>Build my free profile</a>
            </div>
            <div style={{ background: '#1D9E75', borderRadius: '12px', padding: '36px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.14em', marginBottom: '10px' }}>FOR AGENTS</p>
              <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px', marginBottom: '10px', fontFamily: 'Arial Black, Arial, sans-serif' }}>Talent meets opportunity.</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.78)', lineHeight: '1.65', marginBottom: '24px' }}>Give your players the professional presence they deserve. 30 days free, no commitment.</p>
              <a href="/login" style={{ background: '#0D1B2E', color: 'white', fontSize: '12px', padding: '11px 22px', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontFamily: 'Arial Black, Arial, sans-serif' }}>Start free trial</a>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: '#0D1B2E', padding: '22px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="28" height="26" viewBox="0 0 28 26" style={{ display: 'block' }}>
            <line x1="2" y1="25" x2="8" y2="5" stroke="white" strokeWidth="4.5" strokeLinecap="round" opacity="0.28"/>
            <line x1="12" y1="25" x2="18" y2="1" stroke="white" strokeWidth="4.5" strokeLinecap="round" opacity="0.58"/>
            <line x1="22" y1="25" x2="28" y2="0" stroke="#1D9E75" strokeWidth="4.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: '13px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px', fontFamily: 'Arial Black, Arial, sans-serif' }}>GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </div>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)' }}>gainline.pro &nbsp;·&nbsp; 2026</span>
        <div style={{ display: 'flex', gap: '18px' }}>
          <a href="#" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', textDecoration: 'none' }}>Terms</a>
          <a href="#" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', textDecoration: 'none' }}>Contact</a>
        </div>
      </div>

    </div>
  )
}
