export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function CVPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('share_token', token)
    .single()

  if (error || !player) notFound()

  const age = player.date_of_birth
    ? Math.floor(
        (new Date().getTime() - new Date(player.date_of_birth).getTime()) /
          31557600000
      )
    : null

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
            <div style={{ width: '80px', height: '80px', borderRadius: '14px', background: 'linear-gradient(135deg,#9437EA,#3CB5FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
              {player.first_name?.[0]}{player.last_name?.[0]}
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: '26px', fontWeight: '700', margin: '0 0 8px' }}>
                {player.first_name} {player.last_name}
              </h1>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                  🏉 {player.position_primary?.replace(/_/g, ' ')}
                </span>
                {player.nationality_primary && (
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    🌍 {player.nationality_primary}
                  </span>
                )}
                {player.school_attended && (
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    🎓 {player.school_attended}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            {[
              { n: age ? `${age}` : '—', l: 'Age' },
              { n: player.height_cm ? `${player.height_cm}cm` : '—', l: 'Height' },
              { n: player.weight_kg ? `${player.weight_kg}kg` : '—', l: 'Weight' },
              { n: player.position_secondary?.replace(/_/g, ' ') || '—', l: 'Alt Position' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '16px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>{s.n}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 20px' }}>

        {player.bio && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', border: '1px solid #E8E4F0', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9890b0', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>About</div>
            <p style={{ fontSize: '14px', color: '#5a5070', lineHeight: '1.7', margin: 0 }}>{player.bio}</p>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', border: '1px solid #E8E4F0', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9890b0', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '14px' }}>Player Details</div>
          {[
            { k: 'Primary Position', v: player.position_primary?.replace(/_/g, ' ') },
            { k: 'Secondary Position', v: player.position_secondary?.replace(/_/g, ' ') || '—' },
            { k: 'Nationality', v: player.nationality_primary || '—' },
            { k: 'School', v: player.school_attended || '—' },
            { k: 'Height', v: player.height_cm ? `${player.height_cm} cm` : '—' },
            { k: 'Weight', v: player.weight_kg ? `${player.weight_kg} kg` : '—' },
          ].map(row => (
            <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F5F5F7', fontSize: '13px' }}>
              <span style={{ color: '#9890b0' }}>{row.k}</span>
              <span style={{ fontWeight: '600', color: '#241637' }}>{row.v}</span>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', border: '1px solid #E8E4F0', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#9890b0', marginBottom: '14px' }}>
            Interested in this player? Send a private message — contact details are kept secure.
          </p>
          
            href={`mailto:?subject=ScrumPro - ${player.first_name} ${player.last_name}&body=I am interested in this player. Please get in touch.`}
            style={{ display: 'inline-block', background: '#9437EA', color: 'white', padding: '12px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}
          >
            ✉ Contact This Player
          </a>
        </div>
      </div>
    </div>
  )
}