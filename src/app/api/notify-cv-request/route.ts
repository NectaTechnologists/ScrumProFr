import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const emailHtml = (playerName: string, coachName: string, coachOrg: string | null, dashboardUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0C0F16;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="margin-bottom:32px;">
      <span style="font-family:'Arial Black',Arial,sans-serif;font-size:20px;font-weight:900;color:white;letter-spacing:-0.5px;">
        GAIN<span style="color:#1D9E75;">LINE</span>
      </span>
    </div>

    <div style="background:#161C2A;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;margin-bottom:20px;">
      <div style="background:linear-gradient(160deg,#0D1B2E,#0F2E1E);padding:24px;border-bottom:1px solid rgba(255,255,255,0.07);">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1D9E75;">Player Card Request</p>
        <h1 style="margin:0;font-size:22px;font-weight:900;color:white;line-height:1.2;">
          A coach wants to see your full Player Card
        </h1>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
          Hi ${playerName},
        </p>
        <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
          <strong style="color:white;">${coachName}</strong>${coachOrg ? ` from <strong style="color:white;">${coachOrg}</strong>` : ''} has requested access to your full Gainline Player Card.
        </p>

        <div style="background:#1C2338;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px;margin-bottom:20px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5A564F;">Requested by</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:white;">${coachName}</p>
          ${coachOrg ? `<p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.4);">${coachOrg}</p>` : ''}
        </div>

        <p style="margin:0 0 20px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;">
          Log in to your dashboard to review the request and share your Player Card with one tap.
        </p>

        <a href="${dashboardUrl}" style="display:inline-block;background:#1D9E75;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
          Review request →
        </a>
      </div>
    </div>

    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);text-align:center;line-height:1.6;">
      You received this because you have a Gainline Player Card.<br>
      <a href="https://gainline.pro" style="color:rgba(29,158,117,0.6);text-decoration:none;">gainline.pro</a>
    </p>

  </div>
</body>
</html>
`

export async function POST(req: Request) {
  try {
    const { player_id, coach_name, coach_org } = await req.json()

    if (!player_id || !coach_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get player name and profile_id
    const { data: player, error: playerError } = await supabaseAdmin
      .from('players')
      .select('first_name, last_name, profile_id')
      .eq('id', player_id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get player email via admin API
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(player.profile_id)

    if (userError || !user?.email) {
      return NextResponse.json({ error: 'Player email not found' }, { status: 404 })
    }

    const playerName = `${player.first_name} ${player.last_name}`

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Gainline <notifications@gainline.pro>',
        to: user.email,
        subject: `${coach_name} wants to see your Player Card`,
        html: emailHtml(playerName, coach_name, coach_org || null, 'https://gainline.pro/dashboard'),
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      console.error('Resend error:', resData)
      return NextResponse.json({ error: resData.message || 'Email send failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: resData.id })

  } catch (error: any) {
    console.error('notify-cv-request error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
