'use client'

import { useEffect, useState } from 'react'
import { t, Lang } from '@/lib/translations'
import { getConsent, setConsent, onOpenCookieSettings } from '@/lib/consent'
import { syncAttributionConsent } from '@/lib/attribution'
import { getStoredLang, onLangChanged } from '@/lib/lang'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    setLang(getStoredLang())
    const unsubscribeLang = onLangChanged(setLang)

    if (getConsent() === null) setVisible(true)
    const unsubscribeSettings = onOpenCookieSettings(() => setVisible(true))

    return () => {
      unsubscribeLang()
      unsubscribeSettings()
    }
  }, [])

  function choose(value: 'accepted' | 'rejected') {
    setConsent(value)
    syncAttributionConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  const T = t[lang]

  return (
    <>
      <style>{`
        .consent-banner {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          z-index: 9999;
          background: #0D1B2E;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 20px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.25);
        }
        .consent-banner-text {
          flex: 1 1 360px;
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255,255,255,0.75);
          font-family: Arial, sans-serif;
        }
        .consent-banner-text a {
          color: #2ec97e;
          text-decoration: underline;
        }
        .consent-banner-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }
        .consent-btn {
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          border: none;
        }
        .consent-btn-accept {
          background: #2ec97e;
          color: white;
        }
        .consent-btn-reject {
          background: transparent;
          color: white;
          border: 1.5px solid rgba(255,255,255,0.3);
        }
        @media (max-width: 640px) {
          .consent-banner { padding: 16px; flex-direction: column; align-items: stretch; }
          .consent-banner-actions { justify-content: stretch; }
          .consent-btn { flex: 1; text-align: center; }
        }
      `}</style>

      <div className="consent-banner" role="dialog" aria-live="polite">
        <p className="consent-banner-text">
          {T.consent_message}{' '}
          <a href="/privacy">{T.consent_privacy_link}</a>
        </p>
        <div className="consent-banner-actions">
          <button className="consent-btn consent-btn-reject" onClick={() => choose('rejected')}>
            {T.consent_reject}
          </button>
          <button className="consent-btn consent-btn-accept" onClick={() => choose('accepted')}>
            {T.consent_accept}
          </button>
        </div>
      </div>
    </>
  )
}
