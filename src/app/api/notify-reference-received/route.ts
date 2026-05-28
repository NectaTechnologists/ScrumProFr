import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM } from '@/lib/resend'
import { referenceReceived } from '@/emails/reference-received'

export async function POST(req: Request) {
  try {
    const { reference_id } = await req.json()
    if (!reference_id) return NextResponse.json({ error: 'Missing reference_id' }, { status: 400 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch the reference with joined player info
    const { data: ref, error: refError } = await supabaseAdmin
      .from('references')
      .select('player_id, coach_name, organisation_name, content, players(first_name, last_name, profile_id)')
      .eq('id', reference_id)
      .single()

    if (refError || !ref) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 })
    }

    const player: any = ref.players
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(player.profile_id)
    if (userError || !user?.email) {
      return NextResponse.json({ error: 'Player email not found' }, { status: 404 })
    }

    const playerName = `${player.first_name} ${player.last_name}`

    const result = await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `${ref.coach_name} wrote you a reference`,
      html: referenceReceived({
        playerName,
        coachName: ref.coach_name,
        coachOrg: ref.organisation_name || null,
        referenceSnippet: ref.content,
      }),
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (error: any) {
    console.error('notify-reference-received error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
