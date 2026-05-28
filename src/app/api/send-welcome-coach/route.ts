import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM } from '@/lib/resend'
import { welcomeCoach } from '@/emails/welcome-coach'

export async function POST(req: Request) {
  try {
    const { coach_id } = await req.json()
    if (!coach_id) return NextResponse.json({ error: 'Missing coach_id' }, { status: 400 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: coach, error: coachError } = await supabaseAdmin
      .from('coaches')
      .select('full_name, organisation, user_id')
      .eq('id', coach_id)
      .single()

    if (coachError || !coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 })
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(coach.user_id)
    if (userError || !user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 404 })
    }

    const firstName = (coach.full_name || '').split(' ')[0] || 'there'

    const result = await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: 'Your Gainline coach portal is ready',
      html: welcomeCoach({ firstName, organisation: coach.organisation }),
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (error: any) {
    console.error('send-welcome-coach error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
