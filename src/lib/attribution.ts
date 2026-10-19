// UTM / fbclid first-touch capture for ad attribution.
//
// The first-touch values for a visit are kept in sessionStorage regardless
// of cookie consent (this is just remembering the current visit, not
// tracking across sessions). They're promoted into a persistent first-party
// cookie only once the user accepts cookies, so campaign attribution still
// survives a return visit without a UTM-tagged link.

import { getConsent, getCookie, setCookie, deleteCookie } from './consent'

export interface AttributionData {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  fbclid: string | null
  referrer: string | null
  landing_path: string | null
}

const SESSION_KEY = 'gainline_first_touch'
const ATTRIBUTION_COOKIE = 'gainline_attr'

// Call on every page load. Only records the FIRST visit of the session —
// later page views without UTM params never overwrite it.
export function captureFirstTouch() {
  if (typeof window === 'undefined') return
  if (sessionStorage.getItem(SESSION_KEY)) return

  const params = new URLSearchParams(window.location.search)
  const data: AttributionData = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
    fbclid: params.get('fbclid'),
    referrer: document.referrer || null,
    landing_path: window.location.pathname,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))

  if (getConsent() === 'accepted') {
    setCookie(ATTRIBUTION_COOKIE, JSON.stringify(data), 365)
  }
}

export function getFirstTouch(): AttributionData | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// Called whenever the consent choice changes, to keep the persistent
// attribution cookie in sync with it.
export function syncAttributionConsent(consent: 'accepted' | 'rejected') {
  if (consent === 'accepted') {
    const ft = getFirstTouch()
    if (ft) setCookie(ATTRIBUTION_COOKIE, JSON.stringify(ft), 365)
  } else {
    deleteCookie(ATTRIBUTION_COOKIE)
  }
}

// Best attribution data available at signup time: the persisted cookie
// (covers a return visit after accepting cookies) falling back to this
// visit's first-touch values.
export function getAttributionForSignup(): AttributionData | null {
  if (typeof window === 'undefined') return null
  const cookieRaw = getCookie(ATTRIBUTION_COOKIE)
  if (cookieRaw) {
    try {
      return JSON.parse(cookieRaw)
    } catch {
      /* fall through to session value */
    }
  }
  return getFirstTouch()
}
