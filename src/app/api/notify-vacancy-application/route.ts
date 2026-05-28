import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM } from '@/lib/resend'
import { vacancyApplication } from '@/emails/vacancy-application'

export async function POST(req: Request) {
  try {
    const { application_id } = await req.json()
    if (!application_id) return NextResponse.json({ error: 'Missing application_id' }, { status: 400 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch application + joined player + vacancy + coach
    const { data: app, error: appError } = await supabaseAdmin
      .from('vacancy_applications')
      .select(`
        id, vacancy_id, coach_id,
        players(first_name, last_name, position_primary, nationality_primary),
        vacancies(club_name, positions, coach_id, coaches(user_id, full_name))
      `)
      .eq('id', application_id)
      .single()

    if (appError || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const player: any = app.players
    const vacancy: any = app.vacancies
    const coach: any = vacancy?.coaches

    if (!coach?.user_id) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 })
    }

    // Get coach email via admin auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(coach.user_id)
    if (userError || !user?.email) {
      return NextResponse.json({ error: 'Coach email not found' }, { status: 404 })
    }

    const coachFirstName = (coach.full_name || '').split(' ')[0] || 'there'
    const playerName = `${player.first_name} ${player.last_name}`
    const vacancyPosition = vacancy.positions?.[0] || 'Player'
    const applicationsUrl = `https://gainline.pro/dashboard/coach/vacancies/${app.vacancy_id}`

    const result = await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `${playerName} applied for your ${vacancyPosition.replace(/_/g, ' ')} vacancy`,
      html: vacancyApplication({
        coachFirstName,
        playerName,
        playerPosition: player.position_primary,
        playerNationality: player.nationality_primary || null,
        vacancyPosition,
        clubName: vacancy.club_name,
        applicationsUrl,
      }),
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (error: any) {
    console.error('notify-vacancy-application error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
