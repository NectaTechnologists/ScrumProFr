import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div style={{ minHeight:'100vh', background:'#F5F5F7', fontFamily:'system-ui' }}>
      <div style={{ background:'#241637', padding:'0 28px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color:'white', fontWeight:'700', fontSize:'18px' }}>
          Scrum<span style={{ color:'#3CB5FE' }}>Pro</span>
        </span>
        <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>{user.email}</span>
      </div>

      <div style={{ padding:'40px 28px', maxWidth:'800px', margin:'0 auto' }}>
        <h1 style={{ fontSize:'26px', fontWeight:'700', color:'#241637', marginBottom:'8px' }}>
          Welcome to ScrumPro 👋
        </h1>
        <p style={{ color:'#5a5070', marginBottom:'32px' }}>
          You are logged in as <strong>{user.email}</strong>
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
          {[
            { title:'My Rugby CV', desc:'Build and share your player profile', icon:'👤', color:'#9437EA' },
            { title:'Documents', desc:'Upload and manage your certificates', icon:'📎', color:'#3CB5FE' },
            { title:'Media Gallery', desc:'Add match photos and highlight videos', icon:'🎬', color:'#241637' },
          ].map(card => (
            <div key={card.title} style={{ background:'white', borderRadius:'12px', padding:'24px', border:'1px solid #E8E4F0', boxShadow:'0 2px 6px rgba(36,22,55,0.08)', cursor:'pointer' }}>
              <div style={{ fontSize:'28px', marginBottom:'12px' }}>{card.icon}</div>
              <div style={{ fontSize:'15px', fontWeight:'700', color:'#241637', marginBottom:'6px' }}>{card.title}</div>
              <div style={{ fontSize:'12px', color:'#9890b0' }}>{card.desc}</div>
              <div style={{ marginTop:'16px', display:'inline-block', padding:'6px 14px', borderRadius:'6px', background:card.color, color:'white', fontSize:'12px', fontWeight:'600' }}>
                Open →
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:'24px', padding:'20px', background:'white', borderRadius:'12px', border:'1px solid #E8E4F0' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'#9890b0', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>
            Your Account
          </div>
          <div style={{ fontSize:'13px', color:'#5a5070' }}>
            User ID: <code style={{ background:'#F5F5F7', padding:'2px 6px', borderRadius:'4px', fontSize:'12px' }}>{user.id}</code>
          </div>
        </div>
      </div>
    </div>
  )
}