import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { resend, FROM } from '@/lib/resend'
import { referenceRequest } from '@/emails/reference-request'

export async function POST(req: Request) {
  try {
    const { player_id, referee_email, referee_name } = await req.json()

    if (!player_id || !referee_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get player details
    const { data: player, error: playerError } = await supabaseAdmin
      .from('players')
      .select('first_name, last_name, share_token')
      .eq('id', player_id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const playerName = `${player.first_name} ${player.last_name}`
    const submitUrl = `https://gainline.pro/cv/${player.share_token}`

    const result = await resend.emails.send({
      from: FROM,
      to: referee_email,
      subject: `${playerName} would like a reference from you`,
      html: referenceRequest({
        refereeName: referee_name || 'Coach',
        playerName,
        submitUrl,
      }),
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return NextResponse.json({ error: result.error.message || 'Email send failed' }, { status: 500 })
    }

    // Log the reference request
    await supabaseAdmin.from('reference_requests').insert({
      player_id,
      referee_email,
      referee_name: referee_name || null,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, id: result.data?.id })

  } catch (error: any) {
    console.error('notify-reference-request error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
