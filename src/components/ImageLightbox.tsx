'use client'

import { useEffect, useState } from 'react'

export interface LightboxImage {
  url: string
  caption?: string
}

interface Props {
  images: LightboxImage[]
  startIndex?: number
  onClose: () => void
}

export default function ImageLightbox({ images, startIndex = 0, onClose }: Props) {
  const [current, setCurrent] = useState(startIndex)

  useEffect(() => {
    setCurrent(startIndex)
  }, [startIndex])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setCurrent(i => (i - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') setCurrent(i => (i + 1) % images.length)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [images.length, onClose])

  if (!images.length) return null
  const img = images[current]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'lb-fade 0.18s ease',
      }}
    >
      <style>{`
        @keyframes lb-fade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: 16, right: 20,
          background: 'rgba(255,255,255,0.12)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          borderRadius: '50%', width: 40, height: 40,
          cursor: 'pointer', color: 'white', fontSize: 20, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000,
        }}
      >
        ✕
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div style={{
          position: 'fixed', top: 22, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Arial, sans-serif',
          letterSpacing: '0.05em',
        }}>
          {current + 1} / {images.length}
        </div>
      )}

      {/* Prev arrow */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); setCurrent(i => (i - 1 + images.length) % images.length) }}
          style={{
            position: 'fixed', left: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)',
            borderRadius: '50%', width: 44, height: 44, cursor: 'pointer',
            color: 'white', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          ‹
        </button>
      )}

      {/* Next arrow */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); setCurrent(i => (i + 1) % images.length) }}
          style={{
            position: 'fixed', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)',
            borderRadius: '50%', width: 44, height: 44, cursor: 'pointer',
            color: 'white', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          ›
        </button>
      )}

      {/* Image */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '90vw' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.url}
          alt={img.caption || ''}
          style={{
            maxWidth: '90vw', maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: 8,
            display: 'block',
          }}
        />
        {img.caption && (
          <p style={{
            marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.55)',
            fontFamily: 'Arial, sans-serif', textAlign: 'center', maxWidth: 480,
          }}>
            {img.caption}
          </p>
        )}
      </div>
    </div>
  )
}
