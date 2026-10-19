'use client'

import { useEffect } from 'react'
import { captureFirstTouch } from '@/lib/attribution'

// Mounted once in the root layout. Records UTM/fbclid first-touch data for
// the visit regardless of cookie consent (consent only gates whether it's
// later promoted to a persistent cookie — see src/lib/attribution.ts).
export default function AttributionCapture() {
  useEffect(() => {
    captureFirstTouch()
  }, [])

  return null
}
