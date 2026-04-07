<div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
  {[
    { title:'My Rugby CV', desc:'Build and share your player profile', icon:'👤', color:'#9437EA', href:'/dashboard/profile' },
    { title:'Documents', desc:'Upload and manage your certificates', icon:'📎', color:'#3CB5FE', href:'/dashboard/profile' },
    { title:'Media Gallery', desc:'Add match photos and highlight videos', icon:'🎬', color:'#241637', href:'/dashboard/profile' },
  ].map(card => (
    <a key={card.title} href={card.href} style={{ textDecoration:'none' }}>
      <div style={{ background:'white', borderRadius:'12px', padding:'24px', border:'1px solid #E8E4F0', boxShadow:'0 2px 6px rgba(36,22,55,0.08)', cursor:'pointer' }}>
        <div style={{ fontSize:'28px', marginBottom:'12px' }}>{card.icon}</div>
        <div style={{ fontSize:'15px', fontWeight:'700', color:'#241637', marginBottom:'6px' }}>{card.title}</div>
        <div style={{ fontSize:'12px', color:'#9890b0' }}>{card.desc}</div>
        <div style={{ marginTop:'16px', display:'inline-block', padding:'6px 14px', borderRadius:'6px', background:card.color, color:'white', fontSize:'12px', fontWeight:'600' }}>
          Open →
        </div>
      </div>
    </a>
  ))}
</div>