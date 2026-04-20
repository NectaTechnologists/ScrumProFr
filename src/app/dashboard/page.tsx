import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div style={{ minHeight:'100vh', background:'#F1EFE8', fontFamily:'system-ui' }}>

      {/* NAV */}
      <div style={{ background:'#0D1B2E', padding:'0 28px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <svg width="32" height="30" viewBox="0 0 32 30" style={{ display:'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span style={{ color:'white', fontWeight:'900', fontSize:'18px', letterSpacing:'-0.5px', fontFamily:'Arial Black, Arial, sans-serif' }}>
            GAIN<span style={{ color:'#1D9E75' }}>LINE</span>
          </span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>{user.email}</span>

          {/* SIGN OUT FORM */}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              style={{
                background:'transparent',
                border:'1px solid rgba(255,255,255,0.25)',
                color:'rgba(255,255,255,0.7)',
                padding:'7px 16px',
                borderRadius:'6px',
                fontSize:'13px',
                cursor:'pointer',
                fontFamily:'system-ui'
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding:'48px 28px', maxWidth:'860px', margin:'0 auto' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'900', color:'#0D1B2E', marginBottom:'8px', fontFamily:'Arial Black, Arial, sans-serif', letterSpacing:'-0.5px' }}>
          Welcome to Gainline
        </h1>
        <p style={{ color:'#5F5E5A', marginBottom:'36px', fontSize:'15px' }}>
          Logged in as <strong>{user.email}</strong>
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
          {[
            {
              title: 'My Rugby Profile',
              desc: 'Build and share your digital player CV',
              icon: '▲',
              color: '#1D9E75',
              href: '/dashboard/profile'
            },
            {
              title: 'Documents',
              desc: 'Upload and manage your certificates and passport',
              icon: '▲',
              color: '#0F6E56',
              href: '/dashboard/profile'
            },
            {
              title: 'Media Gallery',
              desc: 'Add match photos and highlight videos',
              icon: '▲',
              color: '#0D1B2E',
              href: '/dashboard/profile'
            },
          ].map(card => (
            <a key={card.title} href={card.href} style={{ textDecoration:'none' }}>
              <div style={{
                background:'white',
                borderRadius:'12px',
                padding:'28px',
                border:'0.5px solid #D3D1C7',
                cursor:'pointer',
                transition:'border-color 0.2s'
              }}>
                <div style={{
                  width:'40px',
                  height:'40px',
                  borderRadius:'8px',
                  background:'#E1F5EE',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  marginBottom:'16px'
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <line x1="3" y1="16" x2="6" y2="5" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" opacity="0.35"/>
                    <line x1="9" y1="16" x2="12" y2="2" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" opacity="0.68"/>
                    <line x1="15" y1="16" x2="18" y2="0" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ fontSize:'15px', fontWeight:'700', color:'#0D1B2E', marginBottom:'6px', fontFamily:'Arial Black, Arial, sans-serif' }}>
                  {card.title}
                </div>
                <div style={{ fontSize:'13px', color:'#888780', lineHeight:'1.5', marginBottom:'20px' }}>
                  {card.desc}
                </div>
                <div style={{
                  display:'inline-block',
                  padding:'7px 16px',
                  borderRadius:'6px',
                  background: card.color,
                  color:'white',
                  fontSize:'12px',
                  fontWeight:'700',
                  fontFamily:'Arial Black, Arial, sans-serif',
                  letterSpacing:'0.02em'
                }}>
                  Open →
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
