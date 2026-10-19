// Thin wrapper around the existing `localStorage.gainline_lang` convention
// (each page re-implements its own lang state — see translations.ts) that
// also broadcasts the change, so components that persist across
// client-side navigation (like the cookie consent banner, mounted once in
// the root layout) can follow the toggle live instead of only on reload.

import type { Lang } from './translations'

const LANG_KEY = 'gainline_lang'
const LANG_CHANGED_EVENT = 'gainline:lang-changed'

export function getStoredLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const saved = localStorage.getItem(LANG_KEY)
  return saved === 'fr' ? 'fr' : 'en'
}

export function setStoredLang(lang: Lang) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LANG_KEY, lang)
  window.dispatchEvent(new CustomEvent<Lang>(LANG_CHANGED_EVENT, { detail: lang }))
}

export function onLangChanged(handler: (lang: Lang) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<Lang>).detail)
  window.addEventListener(LANG_CHANGED_EVENT, listener)
  return () => window.removeEventListener(LANG_CHANGED_EVENT, listener)
}
