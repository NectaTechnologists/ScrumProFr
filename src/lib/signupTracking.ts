// Fired right after a player or coach account is genuinely created.
//
// The signup_attribution insert doubles as the one-time gate for the Meta
// Pixel CompleteRegistration event: the row's primary key is the user id, so
// a second attempt (refresh, resubmit, future email-confirmation flow) hits
// a unique-constraint error and simply skips firing again.

import type { SupabaseClient } from '@supabase/supabase-js'
import { getAttributionForSignup } from './attribution'
import { getConsent } from './consent'
import { isTestEmail } from './testAccounts'

type Role = 'player' | 'coach'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export async function recordSignupAndFirePixel(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  role: Role
) {
  try {
    const attribution = getAttributionForSignup()

    const { error } = await supabase.from('signup_attribution').insert({
      id: userId,
      utm_source: attribution?.utm_source ?? null,
      utm_medium: attribution?.utm_medium ?? null,
      utm_campaign: attribution?.utm_campaign ?? null,
      utm_content: attribution?.utm_content ?? null,
      utm_term: attribution?.utm_term ?? null,
      fbclid: attribution?.fbclid ?? null,
      referrer: attribution?.referrer ?? null,
      landing_path: attribution?.landing_path ?? null,
    })

    // Row created for the first time == this is the first (and only) time
    // we fire CompleteRegistration for this account.
    const firstTime = !error

    if (
      firstTime &&
      getConsent() === 'accepted' &&
      !isTestEmail(email) &&
      typeof window !== 'undefined' &&
      typeof window.fbq === 'function'
    ) {
      window.fbq(
        'track',
        'CompleteRegistration',
        { content_name: role },
        { eventID: crypto.randomUUID() }
      )
    }
  } catch (e) {
    // Never let attribution/pixel tracking block or slow down signup.
    console.warn('signup tracking failed', e)
  }
}
