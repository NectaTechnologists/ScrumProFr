{showOnboardingBanner && (
  <div style={{ background: '#0D1B2E', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(29,158,117,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '2px' }}>Complete your profile to get noticed</div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Takes 2 minutes — coaches are already browsing Gainline.</div>
    </div>
    <a href="/onboarding" style={{ height: '30px', padding: '0 14px', borderRadius: '20px', border: 'none', background: '#1D9E75', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial, sans-serif', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
      Continue
    </a>
    <button onClick={() => setShowOnboardingBanner(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', padding: '0 4px', flexShrink: 0 }}>×</button>
  </div>
)}