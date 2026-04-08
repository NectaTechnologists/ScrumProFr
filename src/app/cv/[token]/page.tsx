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
  const token = props.params.token
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

  const pos = (s: string) => s?.replace(/_/g, ' ') || '—'

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7', fontFamily: 'system-ui' }}>

      <div style={{ background: '#241637', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>
          Scrum<span style={{ color: '#3CB5FE' }}>Pro</span>
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Player CV</span>
      </div>

      <div style={{ background: '#241637', padding: '32px 24px 28px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '14px', background: 'linear-gradient(135deg,#9437EA,#3CB5FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: 'white' }}>
              {player.first_name?.[0]}{player.last_name?.[0]}
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: '26px', fontWeight: '700', margin: '0 0 8px' }}>
                {player.first_name} {player.last_name}
              </h1>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                  {pos(player.position_primary)}
                </span>
                {player.nationality_primary && (
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    {player.nationality_primary}
                  </span>
                )}
                {player.school_attended && (
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    {player.school_attended}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>{age || '—'}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>AGE</div>
            </div>
            <div style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>{player.height_cm ? player.height_cm + 'cm' : '—'}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>HEIGHT</div>
            </div>
            <div style={{ padding: '16px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>{player.weight_kg ? player.weight_kg + 'kg' : '—'}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>WEIGHT</div>
            </div>
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{pos(player.position_secondary)}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>ALT POS</div>
            </div>
          </div>

        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 20px' }}>

        {player.bio && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', border: '1px solid #E8E4F0', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9890b0', marginBottom: '10px' }}>ABOUT</div>
            <p style={{ fontSize: '14px', color: '#5a5070', lineHeight: '1.7', margin: 0 }}>{player.bio}</p>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', border: '1px solid #E8E4F0', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9890b0', marginBottom: '14px' }}>PLAYER DETAILS</div>
          {[
            ['Primary Position', pos(player.position_primary)],
            ['Secondary Position', pos(player.position_secondary)],
            ['Nationality', player.nationality_primary || '—'],
            ['School', player.school_attended || '—'],
            ['Height', player.height_cm ? player.height_cm + ' cm' : '—'],
            ['Weight', player.weight_kg ? player.weight_kg + ' kg' : '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F5F5F7', fontSize: '13px' }}>
              <span style={{ color: '#9890b0' }}>{k}</span>
              <span style={{ fontWeight: '600', color: '#241637' }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', border: '1px solid #E8E4F0', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#9890b0', marginBottom: '14px' }}>
            Interested in this player? Contact details are kept secure.
          </p>
          
            <a href="mailto:?subject=ScrumPro&body=I am interested." style={{ display: 'inline-block', background: '#9437EA', color: 'white', padding: '12px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>Contact This Player</a>
        </div>

      </div>
    </div>
  )
}