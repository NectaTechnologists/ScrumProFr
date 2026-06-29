// One-off script — sends the 24-month trial offer email to eligible coaches.
//
// Usage:
//   npx tsx scripts/send-coach-trial-offer.ts --dry-run     (prints recipients only)
//   npx tsx scripts/send-coach-trial-offer.ts --send         (actually sends)
//
// Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY

import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { coachTrialOfferEmail } from '../src/emails/coachTrialOffer'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: (() => {}) as any } }
)

const resend = new Resend(process.env.RESEND_API_KEY!)

const SITE_URL = 'https://gainline.pro'
const isDryRun = !process.argv.includes('--send')

async function main() {
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, organisation_name')
    .eq('role', 'org_user')
    .eq('approved', true)
    .is('trial_status', null)

  if (error) {
    console.error('Failed to fetch coaches:', error)
    process.exit(1)
  }

  if (!profiles || profiles.length === 0) {
    console.log('No eligible coaches found.')
    return
  }

  const results: { id: string; name: string; email: string | null; org: string | null }[] = []

  for (const profile of profiles) {
    const { data: userData, error: userErr } =
      await supabaseAdmin.auth.admin.getUserById(profile.id)

    if (userErr || !userData?.user?.email) {
      console.warn(`Skipping ${profile.full_name} — no email found.`)
      continue
    }

    results.push({
      id: profile.id,
      name: profile.full_name || 'Coach',
      email: userData.user.email,
      org: profile.organisation_name,
    })
  }

  console.log(`\nFound ${results.length} eligible coach(es):\n`)
  results.forEach((r) => {
    console.log(`  - ${r.name} <${r.email}> ${r.org ? `[${r.org}]` : ''}`)
  })

  if (isDryRun) {
    console.log('\nDry run only — no emails sent. Re-run with --send to actually send.\n')
    return
  }

  console.log('\nSending...\n')

  for (const r of results) {
    if (!r.email) continue

    const firstName = r.name.split(' ')[0]
    const ctaUrl = `${SITE_URL}/trial?ref=${r.id}`

    const html = coachTrialOfferEmail({
      firstName,
      organisationName: r.org,
      ctaUrl,
    })

    try {
      await resend.emails.send({
        from: 'Bruce at Gainline <hello@gainline.pro>',
        to: r.email,
        subject: `${firstName}, an idea — 24 months free on Gainline`,
        html,
      })

      await supabaseAdmin
        .from('profiles')
        .update({ trial_status: 'invited' })
        .eq('id', r.id)

      console.log(`  ✓ Sent to ${r.email}`)
    } catch (err) {
      console.error(`  ✗ Failed for ${r.email}:`, err)
    }

    await new Promise((res) => setTimeout(res, 300))
  }

  console.log('\nDone.\n')
}

main()
