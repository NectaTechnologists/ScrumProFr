// First-party cookie consent for marketing/ad scripts (Meta Pixel) and
// cross-session ad attribution. Plain cookies are used (not just
// localStorage) so the choice could, if needed, be read on the server later.

export type ConsentValue = 'accepted' | 'rejected'

const CONSENT_COOKIE = 'gainline_consent'
const CONSENT_CHANGED_EVENT = 'gainline:consent-changed'
const OPEN_SETTINGS_EVENT = 'gainline:open-cookie-settings'

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')
  const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return
  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; max-age=0`
}

export function getConsent(): ConsentValue | null {
  const v = getCookie(CONSENT_COOKIE)
  return v === 'accepted' || v === 'rejected' ? v : null
}

export function setConsent(value: ConsentValue) {
  setCookie(CONSENT_COOKIE, value, 365)
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT))
}

export function onConsentChanged(handler: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, handler)
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handler)
}

// Called by the "Cookie settings" footer link to reopen the banner.
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))
}

export function onOpenCookieSettings(handler: () => void) {
  window.addEventListener(OPEN_SETTINGS_EVENT, handler)
  return () => window.removeEventListener(OPEN_SETTINGS_EVENT, handler)
}
