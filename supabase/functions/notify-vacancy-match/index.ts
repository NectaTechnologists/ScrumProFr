/**
 * Supabase Edge Function: notify-vacancy-match
 *
 * Trigger: Database webhook on INSERT to public.vacancies
 * Queries players whose position matches the vacancy and availability = 'available'.
 * Sends a vacancy-alert email to each matched player via Resend.
 * Logs results to public.email_logs.
 *
 * Deploy: supabase functions deploy notify-vacancy-match
 * Set secret: supabase secrets set RESEND_API_KEY=<your_key>
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM = 'Gainline <hello@gainline.pro>'

function vacancyAlertHtml(opts: {
  playerName: string
  position: string
  clubName: string
  location?: string | null
  level?: string | null
  vacancyUrl: string
}): string {
  const pos = opts.position.replace(/_/g, ' ')
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0C0F16;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px 48px;">
  <div style="margin-bottom:32px;">
    <span style="font-family:'Arial Black',Arial,sans-serif;font-size:20px;font-weight:900;color:white;">GAIN<span style="color:#3DBE72;">LINE</span></span>
  </div>
  <div style="background:#161C2A;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;margin-bottom:24px;">
    <div style="background:linear-gradient(160deg,#0D1B2E,#0F2E1E);padding:24px;border-bottom:1px solid rgba(255,255,255,0.07);">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#3DBE72;">New Vacancy Match</p>
      <h1 style="margin:0;font-size:22px;font-weight:900;color:white;">A ${pos} opportunity just posted</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">Hi ${opts.playerName},</p>
      <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">A new vacancy matching your position (<strong style="color:white;">${pos}</strong>) has been posted on Gainline.</p>
      <div style="background:#1C2338;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px;margin-bottom:20px;">
        <div style="margin-bottom:8px;"><p style="margin:0;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5A564F;">Club / Organisation</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:white;">${opts.clubName}</p></div>
        <div style="margin-bottom:8px;"><p style="margin:0;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5A564F;">Position</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:white;">${pos}</p></div>
        ${opts.level ? `<div style="margin-bottom:8px;"><p style="margin:0;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5A564F;">Level</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:white;">${opts.level}</p></div>` : ''}
        ${opts.location ? `<div><p style="margin:0;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5A564F;">Location</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:white;">${opts.location}</p></div>` : ''}
      </div>
      <a href="${opts.vacancyUrl}" style="display:inline-block;background:#3DBE72;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;">View vacancy →</a>
    </div>
  </div>
  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);text-align:center;">
    You received this because your availability is set to Available.<br>
    <a href="https://gainline.pro/dashboard" style="color:rgba(61,190,114,0.5);text-decoration:none;">Update availability →</a>
  </p>
</div></body></html>`
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const vacancy = payload.record  // the newly inserted vacancy row

    if (!vacancy?.id) {
      return new Response(JSON.stringify({ error: 'No vacancy record in payload' }), { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find matching available players
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, first_name, last_name, position_primary, profile_id')
      .eq('position_primary', vacancy.position)
      .eq('availability', 'available')
      .eq('profile_visibility', 'PUBLIC')
      .eq('is_test', false)

    if (playersError || !players?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: 'No matching players' }), { status: 200 })
    }

    const vacancyUrl = `https://gainline.pro/vacancies/${vacancy.id}`
    let sent = 0
    let failed = 0

    for (const player of players) {
      try {
        // Get player email
        const { data: { user } } = await supabase.auth.admin.getUserById(player.profile_id)
        if (!user?.email) continue

        const html = vacancyAlertHtml({
          playerName: `${player.first_name} ${player.last_name}`,
          position: player.position_primary,
          clubName: vacancy.club_name || vacancy.organisation_name || 'A club on Gainline',
          location: vacancy.location || null,
          level: vacancy.level || null,
          vacancyUrl,
        })

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: FROM,
            to: user.email,
            subject: `New ${player.position_primary.replace(/_/g, ' ')} vacancy — ${vacancy.club_name || 'Gainline'}`,
            html,
          }),
        })

        const status = res.ok ? 'sent' : 'failed'
        if (res.ok) sent++; else failed++

        // Log to email_logs
        await supabase.from('email_logs').insert({
          player_id: player.id,
          email_type: 'vacancy_alert',
          status,
          meta: { vacancy_id: vacancy.id },
        })
      } catch (err) {
        console.error(`Failed for player ${player.id}:`, err)
        failed++
      }
    }

    return new Response(JSON.stringify({ sent, failed }), { status: 200 })
  } catch (err: any) {
    console.error('notify-vacancy-match error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
