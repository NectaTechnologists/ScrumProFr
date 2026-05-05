import ReferenceButton from './ReferenceButton'

export const dynamic = 'force-dynamic'

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

async function getReferences(playerId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/references?player_id=eq.' + playerId + '&status=eq.approved&select=*'
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    cache: 'no-store'
  })
  return res.json()
}

async function logView(playerId: string) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    let organisation_name = null
    let coach_id = null

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organisation_name, role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'org_user') {
        organisation_name = profile.organisation_name
        coach_id = user.id
      }
    }

    await supabase.from('cv_views').insert({
      player_id: playerId,
      coach_id,
      organisation_name,
    })
  } catch {}
}