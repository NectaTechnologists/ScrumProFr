/**
 * Supabase Edge Function: onboarding-sequence
 *
 * Runs daily at 08:00 UTC via pg_cron.
 * Processes player and coach onboarding email sequences.
 * Checks email_logs to prevent duplicate sends.
 * Logs each successful send to email_logs.
 *
 * Deploy: supabase functions deploy onboarding-sequence
 * Secret: supabase secrets set RESEND_API_KEY=<your_key>
 *
 * Schedule (run in Supabase SQL editor):
 *   select cron.schedule(
 *     'onboarding-sequence-daily',
 *     '0 8 * * *',
 *     $$
 *       select net.http_post(
 *         url := 'https://<project-ref>.functions.supabase.co/onboarding-sequence',
 *         headers := '{"Content-Type":"application/json","Authorization":"Bearer <anon-key>"}'::jsonb,
 *         body := '{}'::jsonb
 *       )
 *     $$
 *   );
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM = 'Gainline <hello@gainline.pro>'

// ── Brand tokens ─────────────────────────────────────────────────────────────
const BG = '#0C0F16'
const CARD_BG = '#161C2A'
const GREEN = '#2ec97e'
const GOLD = '#D4A843'
const TEXT = '#F0EDE4'
const MUTED = '#9EA8B8'

// ── Base layout ───────────────────────────────────────────────────────────────
function base(content: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px 48px;">
    <div style="margin-bottom:32px;">
      <span style="font-family:'Arial Black',Arial,sans-serif;font-size:20px;font-weight:900;color:white;letter-spacing:-0.5px;">GAIN<span style="color:${GREEN};">LINE</span></span>
    </div>
    <div style="background:${CARD_BG};border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;margin-bottom:24px;">
      ${content}
    </div>
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);text-align:center;line-height:1.8;">
      You received this from Gainline because you have an account.<br>
      <a href="https://gainline.pro" style="color:rgba(61,190,114,0.6);text-decoration:none;">gainline.pro</a>
    </p>
  </div>
</body></html>`
}

function header(label: string, title: string): string {
  return `<div style="background:linear-gradient(160deg,#0D1B2E,#0F2E1E);padding:24px;border-bottom:1px solid rgba(255,255,255,0.07);">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${GREEN};">${label}</p>
    <h1 style="margin:0;font-size:22px;font-weight:900;color:white;line-height:1.2;">${title}</h1>
  </div>`
}

function btn(label: string, href: string, outlined = false): string {
  if (outlined) {
    return `<a href="${href}" style="display:inline-block;background:transparent;color:${TEXT};text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.3px;border:1.5px solid rgba(255,255,255,0.25);">${label} →</a>`
  }
  return `<a href="${href}" style="display:inline-block;background:${GREEN};color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.3px;">${label} →</a>`
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">${text}</p>`
}

// ── Resend helper ─────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  return res.ok
}

// ── email_logs check ──────────────────────────────────────────────────────────
async function alreadySent(supabase: any, playerId: string, emailType: string): Promise<boolean> {
  const { data } = await supabase
    .from('email_logs')
    .select('id')
    .eq('player_id', playerId)
    .eq('email_type', emailType)
    .limit(1)
  return (data?.length ?? 0) > 0
}

async function logEmail(supabase: any, playerId: string, emailType: string, status: 'sent' | 'failed'): Promise<void> {
  await supabase.from('email_logs').insert({ player_id: playerId, email_type: emailType, status })
}

// ── Profile completion (mirrors profile/page.tsx COMPLETION_FIELDS) ───────────
const COMPLETION_FIELDS = [
  { key: 'first_name', weight: 10 },
  { key: 'last_name', weight: 10 },
  { key: 'date_of_birth', weight: 10 },
  { key: 'nationality_primary', weight: 10 },
  { key: 'position_primary', weight: 10 },
  { key: 'height_cm', weight: 10 },
  { key: 'weight_kg', weight: 10 },
  { key: 'school_attended', weight: 5 },
  { key: 'bio', weight: 10 },
  { key: 'video_url', weight: 10 },
  { key: 'avatar_url', weight: 5 },
]

function calcCompletion(player: Record<string, any>): number {
  const total = COMPLETION_FIELDS.reduce((sum, f) => sum + f.weight, 0)
  const earned = COMPLETION_FIELDS.reduce((sum, f) => sum + (player[f.key] && player[f.key] !== '' ? f.weight : 0), 0)
  return Math.round((earned / total) * 100)
}

function getMissingLabels(player: Record<string, any>): string[] {
  const labelMap: Record<string, string> = {
    first_name: 'First name', last_name: 'Last name', date_of_birth: 'Date of birth',
    nationality_primary: 'Nationality', position_primary: 'Primary position',
    height_cm: 'Height', weight_kg: 'Weight', school_attended: 'School',
    bio: 'Bio', video_url: 'Highlight video', avatar_url: 'Profile photo',
  }
  return COMPLETION_FIELDS
    .filter(f => !player[f.key] || player[f.key] === '')
    .map(f => labelMap[f.key] || f.key)
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER SEQUENCES
// ─────────────────────────────────────────────────────────────────────────────

// ── Day 2: How coaches search ─────────────────────────────────────────────────
async function runPlayerDay2(supabase: any): Promise<{ sent: number; failed: number }> {
  const now = new Date()
  const from = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const to = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()

  const { data: players } = await supabase
    .from('players')
    .select('id, first_name, profile_id, position_primary')
    .gte('created_at', from)
    .lt('created_at', to)
    .not('position_primary', 'is', null)

  if (!players?.length) return { sent: 0, failed: 0 }

  let sent = 0, failed = 0
  const emailType = 'player_sequence_day2'

  for (const player of players) {
    try {
      if (await alreadySent(supabase, player.id, emailType)) continue

      const { data: { user } } = await supabase.auth.admin.getUserById(player.profile_id)
      if (!user?.email) continue

      const firstName = player.first_name || 'there'
      const html = base(`
        ${header('Player Tips', 'How coaches search for players on Gainline')}
        <div style="padding:24px;">
          ${p(`Hi ${firstName},`)}
          ${p('Your card is live — but here\'s what most players don\'t realise.')}
          ${p('Coaches don\'t browse randomly. They search by position, nationality, age, and availability. If those fields aren\'t filled in, you won\'t show up when it matters.')}
          ${p('Take 2 minutes to check these on your profile:')}
          <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.8;"><strong style="color:white;">Position</strong> — make sure your primary position is correct. Add a secondary if you play multiple.<br><br><strong style="color:white;">Nationality</strong> — this matters more than you think. Clubs recruiting across borders filter by passport eligibility first.<br><br><strong style="color:white;">Availability</strong> — if it\'s not set to Available, coaches assume you\'re contracted. Make sure it reflects where you actually are.<br><br><strong style="color:white;">Height and weight</strong> — front rows especially. Coaches filter by physical profile before they look at anything else.</p>
          ${p('Your card is already out there. Make sure it\'s working for you.')}
          ${btn('Update my profile', 'https://gainline.pro/dashboard')}
        </div>
      `)

      const ok = await sendEmail(user.email, 'How coaches search for players on Gainline', html)
      await logEmail(supabase, player.id, emailType, ok ? 'sent' : 'failed')
      if (ok) sent++; else failed++
    } catch (err) {
      console.error(`player_sequence_day2 failed for player ${player.id}:`, err)
      failed++
    }
  }

  return { sent, failed }
}

// ── Day 5: Player card link ───────────────────────────────────────────────────
async function runPlayerDay5(supabase: any): Promise<{ sent: number; failed: number }> {
  const now = new Date()
  const from = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()
  const to = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: players } = await supabase
    .from('players')
    .select('id, first_name, profile_id, share_token')
    .gte('created_at', from)
    .lt('created_at', to)

  if (!players?.length) return { sent: 0, failed: 0 }

  let sent = 0, failed = 0
  const emailType = 'player_sequence_day5'

  for (const player of players) {
    try {
      if (await alreadySent(supabase, player.id, emailType)) continue

      const { data: { user } } = await supabase.auth.admin.getUserById(player.profile_id)
      if (!user?.email) continue

      const firstName = player.first_name || 'there'
      const shareUrl = `https://gainline.pro/cv/${player.share_token}`

      const html = base(`
        ${header('Your Player Card', 'This is how coaches actually see your card')}
        <div style="padding:24px;">
          ${p(`Hi ${firstName},`)}
          ${p('Here\'s something most players on Gainline don\'t know: coaches can see your basic info in the directory, but your full card — references, CV, stats, contact — is only visible when you share your link directly.')}
          ${p('That\'s by design. It puts you in control of who sees everything.')}
          <div style="background:#1C2338;border:1px solid rgba(61,190,114,0.2);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5A564F;">Your Gainline link</p>
            <p style="margin:0;font-size:13px;color:${GREEN};font-family:monospace;word-break:break-all;">${shareUrl}</p>
          </div>
          ${p('Send it to:')}
          <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.8;">
            <li>Coaches you\'re already in contact with</li>
            <li>Clubs you\'re interested in</li>
            <li>Your agent if you have one</li>
            <li>Anyone asking about your availability</li>
          </ul>
          ${p('The more you share it, the more it works. Players who share their link get 3x more coach views than those who don\'t.')}
          ${btn('Copy my link', 'https://gainline.pro/dashboard')}
        </div>
      `)

      const ok = await sendEmail(user.email, 'This is how coaches actually see your card', html)
      await logEmail(supabase, player.id, emailType, ok ? 'sent' : 'failed')
      if (ok) sent++; else failed++
    } catch (err) {
      console.error(`player_sequence_day5 failed for player ${player.id}:`, err)
      failed++
    }
  }

  return { sent, failed }
}

// ── Day 7-8: Profile nudge ────────────────────────────────────────────────────
async function runProfileNudge(supabase: any): Promise<{ sent: number; failed: number }> {
  const now = new Date()
  const from = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString()
  const to = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: players } = await supabase
    .from('players')
    .select('id, first_name, profile_id, first_name, last_name, date_of_birth, nationality_primary, position_primary, height_cm, weight_kg, school_attended, bio, video_url, avatar_url')
    .gte('created_at', from)
    .lt('created_at', to)

  if (!players?.length) return { sent: 0, failed: 0 }

  let sent = 0, failed = 0
  const emailType = 'profile_nudge'

  for (const player of players) {
    try {
      const completionPct = calcCompletion(player)
      if (completionPct >= 70) continue

      if (await alreadySent(supabase, player.id, emailType)) continue

      const { data: { user } } = await supabase.auth.admin.getUserById(player.profile_id)
      if (!user?.email) continue

      const firstName = player.first_name || 'there'
      const missingItems = getMissingLabels(player)

      const html = base(`
        ${header('Profile Tip', 'Coaches are looking — your profile isn\'t ready yet')}
        <div style="padding:24px;">
          ${p(`Hi ${firstName},`)}
          ${p(`Your Gainline Player Card is <strong style="color:${GOLD};">${completionPct}% complete</strong>. Coaches filter by profile quality, so incomplete cards get far fewer views.`)}
          ${missingItems.length > 0 ? `
            <div style="margin-bottom:20px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5A564F;">What's missing</p>
              ${missingItems.map(item => `
                <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#1C2338;border-radius:8px;border:1px solid rgba(255,255,255,0.06);margin-bottom:6px;">
                  <div style="width:6px;height:6px;border-radius:50%;background:${GOLD};flex-shrink:0;"></div>
                  <span style="font-size:13px;color:rgba(255,255,255,0.7);">${item}</span>
                </div>`).join('')}
            </div>` : ''}
          ${p('Complete profiles get 3× more coach views. It takes less than 5 minutes.')}
          ${btn('Complete my profile', 'https://gainline.pro/dashboard/profile')}
        </div>
      `)

      const ok = await sendEmail(user.email, 'Complete your Gainline profile', html)
      await logEmail(supabase, player.id, emailType, ok ? 'sent' : 'failed')
      if (ok) sent++; else failed++
    } catch (err) {
      console.error(`profile_nudge failed for player ${player.id}:`, err)
      failed++
    }
  }

  return { sent, failed }
}

// ── Day 10: Vacancy matches ───────────────────────────────────────────────────
async function runPlayerDay10(supabase: any): Promise<{ sent: number; failed: number }> {
  const now = new Date()
  const from = new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString()
  const to = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()

  const { data: players } = await supabase
    .from('players')
    .select('id, first_name, profile_id, position_primary')
    .gte('created_at', from)
    .lt('created_at', to)
    .not('position_primary', 'is', null)

  if (!players?.length) return { sent: 0, failed: 0 }

  let sent = 0, failed = 0
  const emailType = 'player_sequence_day10'

  for (const player of players) {
    try {
      if (await alreadySent(supabase, player.id, emailType)) continue

      const { data: { user } } = await supabase.auth.admin.getUserById(player.profile_id)
      if (!user?.email) continue

      const firstName = player.first_name || 'there'
      const position = player.position_primary

      // Find matching vacancies
      let { data: vacancies } = await supabase
        .from('vacancies')
        .select('id, club_name, level, country, positions')
        .eq('is_active', true)
        .contains('positions', [position])
        .order('created_at', { ascending: false })
        .limit(3)

      // Fallback: 3 most recent active vacancies if no position match
      if (!vacancies?.length) {
        const { data: fallback } = await supabase
          .from('vacancies')
          .select('id, club_name, level, country, positions')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3)
        vacancies = fallback || []
      }

      const matchCount = vacancies?.length ?? 0
      const positionLabel = position.replace(/_/g, ' ')

      const vacancyCards = (vacancies ?? []).map((v: any) => `
        <div style="background:#1C2338;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px;margin-bottom:12px;">
          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:white;">${v.club_name}</p>
          ${v.level ? `<p style="margin:0 0 2px;font-size:13px;color:${MUTED};">${v.level}</p>` : ''}
          ${v.country ? `<p style="margin:0 0 10px;font-size:13px;color:${MUTED};">${v.country}</p>` : ''}
          <a href="https://gainline.pro/vacancies/${v.id}" style="display:inline-block;background:${GREEN};color:white;text-decoration:none;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:700;">Apply →</a>
        </div>`).join('')

      const html = base(`
        ${header('Vacancies', `Clubs on Gainline are looking for ${positionLabel} players`)}
        <div style="padding:24px;">
          ${p(`Hi ${firstName},`)}
          ${p(`A quick one — there are currently ${matchCount} ${matchCount === 1 ? 'vacancy' : 'vacancies'} on Gainline for ${positionLabel}s.`)}
          ${vacancyCards}
          ${p('If any of these look interesting, you can apply instantly with your Player Card — no CV to send, no email to draft. One click and your card goes straight to the coach.')}
          ${p('If you\'re not available right now, make sure your profile reflects that so coaches know when to come back.')}
          ${btn('Browse all vacancies', 'https://gainline.pro/vacancies')}
        </div>
      `)

      const subject = `Clubs on Gainline are looking for ${positionLabel} players`
      const ok = await sendEmail(user.email, subject, html)
      await logEmail(supabase, player.id, emailType, ok ? 'sent' : 'failed')
      if (ok) sent++; else failed++
    } catch (err) {
      console.error(`player_sequence_day10 failed for player ${player.id}:`, err)
      failed++
    }
  }

  return { sent, failed }
}

// ─────────────────────────────────────────────────────────────────────────────
// COACH SEQUENCES
// ─────────────────────────────────────────────────────────────────────────────

// ── Day 3: No vacancy posted ──────────────────────────────────────────────────
async function runCoachDay3(supabase: any): Promise<{ sent: number; failed: number }> {
  const now = new Date()
  const from = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
  const to = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()

  // Get coaches created in the window, identified by is_coach flag on profiles
  const { data: coaches } = await supabase
    .from('coaches')
    .select('id, user_id, full_name')
    .gte('created_at', from)
    .lt('created_at', to)

  if (!coaches?.length) return { sent: 0, failed: 0 }

  let sent = 0, failed = 0
  const emailType = 'coach_sequence_day3'

  for (const coach of coaches) {
    try {
      // Use coach.id as player_id in email_logs (coaches table id)
      if (await alreadySent(supabase, coach.id, emailType)) continue

      // Check if they've posted a vacancy
      const { data: vacancyCheck } = await supabase
        .from('vacancies')
        .select('id')
        .eq('coach_id', coach.id)
        .limit(1)

      if (vacancyCheck?.length) continue  // already posted — skip

      const { data: { user } } = await supabase.auth.admin.getUserById(coach.user_id)
      if (!user?.email) continue

      const firstName = coach.full_name?.split(' ')[0] || 'Coach'

      const html = base(`
        ${header('Coach Tips', 'You haven\'t posted a vacancy yet')}
        <div style="padding:24px;">
          ${p(`Hi ${firstName},`)}
          ${p('Your coach portal is set up — but you haven\'t posted a vacancy yet.')}
          ${p('Posting a vacancy on Gainline does two things. It puts your opening in front of players actively looking for clubs, and it lets players apply directly with their Player Card so you\'re not chasing CVs over WhatsApp.')}
          ${p('It takes about 2 minutes.')}
          <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.8;"><strong style="color:white;">What you\'ll need:</strong><br>• Club name and level<br>• Position(s) you\'re looking for<br>• What\'s on offer (contract, expenses, accommodation)<br>• Any eligibility requirements</p>
          ${p('That\'s it. Your vacancy goes live immediately and players can start applying the same day.')}
          ${btn('Post a vacancy', 'https://gainline.pro/dashboard/coach/vacancies/new')}
        </div>
      `)

      const ok = await sendEmail(user.email, 'You haven\'t posted a vacancy yet', html)
      await logEmail(supabase, coach.id, emailType, ok ? 'sent' : 'failed')
      if (ok) sent++; else failed++
    } catch (err) {
      console.error(`coach_sequence_day3 failed for coach ${coach.id}:`, err)
      failed++
    }
  }

  return { sent, failed }
}

// ── Day 7: Available players ──────────────────────────────────────────────────
async function runCoachDay7(supabase: any): Promise<{ sent: number; failed: number }> {
  const now = new Date()
  const from = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString()
  const to = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: coaches } = await supabase
    .from('coaches')
    .select('id, user_id, full_name')
    .gte('created_at', from)
    .lt('created_at', to)

  if (!coaches?.length) return { sent: 0, failed: 0 }

  // Count available players once
  const { count: availableCount } = await supabase
    .from('players')
    .select('id', { count: 'exact', head: true })
    .eq('availability', 'available')

  const playerCount = availableCount ?? 0

  let sent = 0, failed = 0
  const emailType = 'coach_sequence_day7'

  for (const coach of coaches) {
    try {
      if (await alreadySent(supabase, coach.id, emailType)) continue

      const { data: { user } } = await supabase.auth.admin.getUserById(coach.user_id)
      if (!user?.email) continue

      const firstName = coach.full_name?.split(' ')[0] || 'Coach'

      const html = base(`
        ${header('Player Pool', `${playerCount} players in your positions are on Gainline right now`)}
        <div style="padding:24px;">
          ${p(`Hi ${firstName},`)}
          ${p(`There are currently <strong style="color:white;">${playerCount} players</strong> listed as Available on Gainline who play the positions you recruit for.`)}
          ${p('They\'ve built out their profiles, added references, and are actively looking for clubs. Some of them have been viewed by other coaches already.')}
          ${p('The player browser lets you filter by position, nationality, age, and availability — and save anyone interesting to your shortlist.')}
          ${p('If you haven\'t posted a vacancy yet, now\'s a good time. Players on Gainline can apply instantly with their Player Card — no back and forth, no chasing.')}
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            ${btn('Browse players', 'https://gainline.pro/dashboard/coach')}
            ${btn('Post a vacancy', 'https://gainline.pro/dashboard/coach/vacancies/new', true)}
          </div>
        </div>
      `)

      const subject = `${playerCount} players in your positions are on Gainline right now`
      const ok = await sendEmail(user.email, subject, html)
      await logEmail(supabase, coach.id, emailType, ok ? 'sent' : 'failed')
      if (ok) sent++; else failed++
    } catch (err) {
      console.error(`coach_sequence_day7 failed for coach ${coach.id}:`, err)
      failed++
    }
  }

  return { sent, failed }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const results: Record<string, { sent: number; failed: number }> = {}

    // Player sequences
    results.player_day2 = await runPlayerDay2(supabase)
    results.player_day5 = await runPlayerDay5(supabase)
    results.profile_nudge = await runProfileNudge(supabase)
    results.player_day10 = await runPlayerDay10(supabase)

    // Coach sequences
    results.coach_day3 = await runCoachDay3(supabase)
    results.coach_day7 = await runCoachDay7(supabase)

    const totalSent = Object.values(results).reduce((sum, r) => sum + r.sent, 0)
    const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0)

    console.log('onboarding-sequence complete:', JSON.stringify({ totalSent, totalFailed, results }))

    return new Response(JSON.stringify({ success: true, totalSent, totalFailed, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('onboarding-sequence error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
