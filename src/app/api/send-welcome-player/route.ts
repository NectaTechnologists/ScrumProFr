import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM } from '@/lib/resend'
import { welcomePlayer } from '@/emails/welcome-player'

export async function POST(req: Request) {
  try {
    const { player_id } = await req.json()
    if (!player_id) return NextResponse.json({ error: 'Missing player_id' }, { status: 400 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: player, error: playerError } = await supabaseAdmin
      .from('players')
      .select('first_name, share_token, profile_id')
      .eq('id', player_id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(player.profile_id)
    if (userError || !user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 404 })
    }

    const result = await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: 'Your Gainline Player Card is live 🟢',
      html: welcomePlayer({
        firstName: player.first_name || 'there',
        shareToken: player.share_token,
      }),
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (error: any) {
    console.error('send-welcome-player error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
