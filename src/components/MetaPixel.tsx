'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { getConsent, onConsentChanged } from '@/lib/consent'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export default function MetaPixel() {
  const pathname = usePathname()
  const [consented, setConsented] = useState(false)
  const skipFirstPathChange = useRef(true)

  useEffect(() => {
    const sync = () => setConsented(getConsent() === 'accepted')
    sync()
    return onConsentChanged(sync)
  }, [])

  // Fire PageView on client-side route changes (the initial load's PageView
  // is sent by the base snippet below). Most nav in this app is plain <a>
  // (full reload, re-triggers the base snippet) but several flows use
  // router.push, which this effect catches.
  useEffect(() => {
    if (skipFirstPathChange.current) {
      skipFirstPathChange.current = false
      return
    }
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView', {}, { eventID: crypto.randomUUID() })
    }
  }, [pathname])

  if (!PIXEL_ID || !consented) return null

  const initialEventId = crypto.randomUUID()

  return (
    <Script
      id="meta-pixel-base"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView', {}, { eventID: '${initialEventId}' });
        `,
      }}
    />
  )
}
