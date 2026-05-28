/**
 * Supabase Edge Function: referee-reminder
 *
 * Schedule: Daily cron — runs every day at 09:00 UTC
 * Finds reference requests older than 7 days with status = 'pending'.
 * Checks email_logs to avoid sending a second reminder.
 * Sends reference-reminder email to the referee.
 * Logs each send to email_logs.
 *
 * Deploy: supabase functions deploy referee-reminder
 * Cron:   supabase functions schedule referee-reminder --cron "0 9 * * *"
 * Secrets: supabase secrets set RESEND_API_KEY=<key>
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM = 'Gainline <hello@gainline.pro>'

function referenceReminderHtml(opts: {
  refereeName: string
  playerName: string
  submitUrl: string
  daysSinceRequest: number
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0C0F16;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px 48px;">
  <div style="margin-bottom:32px;">
    <span style="font-family:'Arial Black',Arial,sans-serif;font-size:20px;font-weight:900;color:white;">GAIN<span style="color:#3DBE72;">LINE</span></span>
  </div>
  <div style="background:#161C2A;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;margin-bottom:24px;">
    <div style="background:linear-gradient(160deg,#0D1B2E,#0F2E1E);padding:24px;border-bottom:1px solid rgba(255,255,255,0.07);">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#3DBE72;">Friendly Reminder</p>
      <h1 style="margin:0;font-size:22px;font-weight:900;color:white;">${opts.playerName} is still waiting on your reference</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">Hi ${opts.refereeName},</p>
      <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">Just a quick nudge — <strong style="color:white;">${opts.playerName}</strong> requested a reference from you ${opts.daysSinceRequest} days ago and it hasn't been submitted yet.</p>
      <div style="background:#1C2338;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px;margin-bottom:20px;">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5A564F;">Player</p>
        <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:white;">${opts.playerName}</p>
      </div>
      <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">It only takes two minutes. No login required.</p>
      <a href="${opts.submitUrl}" style="display:inline-block;background:#3DBE72;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;">Write reference now →</a>
      <p style="margin:16px 0 0;font-size:12px;color:rgba(255,255,255,0.3);line-height:1.6;">This is the only reminder you'll receive. If you don't wish to write a reference, simply ignore this email.</p>
    </div>
  </div>
  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);text-align:center;">
    <a href="https://gainline.pro" style="color:rgba(61,190,114,0.5);text-decoration:none;">gainline.pro</a>
  </p>
</div></body></html>`
}

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

    // Find pending reference requests older than 7 days
    // reference_requests table: id, player_id, referee_email, referee_name, share_token, created_at, status
    const { data: pendingRefs, error } = await supabase
      .from('reference_requests')
      .select('id, player_id, referee_email, referee_name, created_at, players(first_name, last_name, share_token)')
      .eq('status', 'pending')
      .lt('created_at', sevenDaysAgo)

    if (error) {
      console.error('Query error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    if (!pendingRefs?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: 'No pending reminders needed' }), { status: 200 })
    }

    // Check which ones have already had a reminder sent
    const { data: alreadySent } = await supabase
      .from('email_logs')
      .select('meta')
      .eq('email_type', 'reference_reminder')
      .eq('status', 'sent')

    const alreadySentRefIds = new Set(
      (alreadySent || []).map((l: any) => l.meta?.reference_request_id).filter(Boolean)
    )

    let sent = 0
    let skipped = 0
    let failed = 0

    for (const ref of pendingRefs) {
      if (alreadySentRefIds.has(ref.id)) { skipped++; continue }

      const player: any = ref.players
      if (!player) continue

      const playerName = `${player.first_name} ${player.last_name}`
      const submitUrl = `https://gainline.pro/cv/${player.share_token}`
      const daysSince = Math.floor((Date.now() - new Date(ref.created_at).getTime()) / 86400000)

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: FROM,
            to: ref.referee_email,
            subject: `Reminder: ${playerName} is waiting on your reference`,
            html: referenceReminderHtml({
              refereeName: ref.referee_name || 'there',
              playerName,
              submitUrl,
              daysSinceRequest: daysSince,
            }),
          }),
        })

        const status = res.ok ? 'sent' : 'failed'
        if (res.ok) sent++; else failed++

        await supabase.from('email_logs').insert({
          player_id: ref.player_id,
          email_type: 'reference_reminder',
          status,
          meta: { reference_request_id: ref.id },
        })
      } catch (err) {
        console.error(`Failed for ref request ${ref.id}:`, err)
        failed++
      }
    }

    return new Response(JSON.stringify({ sent, skipped, failed }), { status: 200 })
  } catch (err: any) {
    console.error('referee-reminder error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
