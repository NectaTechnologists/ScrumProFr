import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { player_id } = await req.json()
    if (!player_id) return NextResponse.json({ ok: false })

    const supabase = await createClient()

    // Get the logged-in coach's profile if any
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
      player_id,
      coach_id,
      organisation_name,
      viewed_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}