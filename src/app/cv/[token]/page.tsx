export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'

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
      <p>Token: {token}</p>
      <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
    </div>
  )

  const age = player.date_of_birth
    ? Math.floor((new Date().getTime() - new Date(player.date_of_birth).getTime()) / 31557600000)
    : null

  const pos = (s: string) => s?.replace(/_/g, ' ') || '–'

  const initials = [player.first_name?.[0], player.last_name?.[0]].filter(Boolean).join('')

  return (
    <div style={{ minHeight: '100vh', background: '#F1EFE8', fontFamily: 'system-ui' }}>

      {/* NAV */}
      <div style={{ background: '#0D1B2E', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="32" height="30" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span style={{ color: 'white', fontWeight: '900', fontSize: '18px', letterSpacing: '-0.5px', fontFamily: 'Arial Black, Arial, sans-serif' }}>
            GAIN<span style={{ color: '#1D9E75' }}>LINE</span>
          </span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '0.1em' }}>PLAYER CV</span>
      </div>

      {/* HERO */}
      <div style={{ background: '#0D1B2E', padding: '40px 28px 48px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '28px' }}>
          {/* Avatar */}
          <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: '28px', fontWeight: '900', fontFamily: 'Arial Black, Arial, sans-serif' }}>{initials}</span>
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', margin: '0 0 8px', fontFamily: 'Arial Black, Arial, sans-serif', letterSpacing: '-1px' }}>
              {player.first_name} {player.last_name}
            </h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {player.position_primary && (
                <span style={{ background: '#1D9E75', color: 'white', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.08em' }}>
                  {pos(player.position_primary)}
                </span>
              )}
              {player.nationality_primary && (
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>{player.nationality_primary}</span>
              )}
              {player.school_attended && (
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>{player.school_attended}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ maxWidth: '760px', margin: '28px auto 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
          {[
            { value: age ?? '–', label: 'AGE' },
            { value: player.height_cm ? `${player.height_cm}cm` : '–', label: 'HEIGHT' },
            { value: player.weight_kg ? `${player.weight_kg}kg` : '–', label: 'WEIGHT' },
            { value: player.position_secondary ? pos(player.position_secondary) : '–', label: 'ALT POS' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#0F2438', padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '22px', fontWeight: '900', fontFamily: 'Arial Black, Arial, sans-serif' }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '0.12em', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 28px' }}>

        {/* Bio */}
        {player.bio && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '0.5px solid #D3D1C7', marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', color: '#1D9E75', letterSpacing: '0.14em', marginBottom: '12px', fontWeight: '700' }}>ABOUT</p>
            <p style={{ fontSize: '15px', color: '#0D1B2E', lineHeight: '1.7', margin: 0 }}>{player.bio}</p>
          </div>
        )}

        {/* Player Details */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '0.5px solid #D3D1C7', marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', color: '#1D9E75', letterSpacing: '0.14em', marginBottom: '20px', fontWeight: '700' }}>PLAYER DETAILS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Primary Position', value: pos(player.position_primary) },
              { label: 'Secondary Position', value: player.position_secondary ? pos(player.position_secondary) : '–' },
              { label: 'Nationality', value: player.nationality_primary || '–' },
              { label: 'School', value: player.school_attended || '–' },
              { label: 'Height', value: player.height_cm ? `${player.height_cm} cm` : '–' },
              { label: 'Weight', value: player.weight_kg ? `${player.weight_kg} kg` : '–' },
              { label: 'Age', value: age ? `${age} years` : '–' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '0.5px solid #F1EFE8' }}>
                <span style={{ fontSize: '13px', color: '#888780' }}>{row.label}</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0D1B2E' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ background: '#0D1B2E', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', color: '#5DCAA5', letterSpacing: '0.14em', marginBottom: '8px' }}>POWERED BY</p>
          <p style={{ fontSize: '18px', fontWeight: '900', color: 'white', fontFamily: 'Arial Black, Arial, sans-serif', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            GAIN<span style={{ color: '#1D9E75' }}>LINE</span>
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>No talent goes unseen</p>
          <a href="/" style={{ background: '#1D9E75', color: 'white', fontSize: '12px', fontWeight: '700', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontFamily: 'Arial Black, Arial, sans-serif' }}>
            Build your free profile →
          </a>
        </div>

      </div>
    </div>
  )
}
