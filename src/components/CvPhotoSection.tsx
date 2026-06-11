'use client'

import { useState } from 'react'
import ImageLightbox, { LightboxImage } from './ImageLightbox'

interface PlayerImage {
  public_url: string
  caption?: string | null
}

interface Props {
  profilePhoto?: string | null
  playerName?: string
  initials: string
  additionalImages: PlayerImage[]
}

// Exported separately so the server component can render the avatar area
// and wire up the click via a data attribute + this component's handler.
// We use a simple approach: this component renders BOTH the clickable
// avatar wrapper AND the gallery section.

export function CvAvatarButton({
  src,
  initials,
  onClick,
}: {
  src?: string | null
  initials: string
  onClick: () => void
}) {
  if (!src) {
    return (
      <div className="cv-avatar">
        <span>{initials}</span>
      </div>
    )
  }
  return (
    <button
      onClick={onClick}
      className="cv-avatar"
      style={{
        padding: 0, margin: 0, border: 'none', cursor: 'pointer',
        background: 'transparent', display: 'block',
      }}
      title="Click to expand"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </button>
  )
}

export default function CvPhotoSection({ profilePhoto, initials, additionalImages }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxStart, setLightboxStart] = useState(0)

  const allImages: LightboxImage[] = [
    ...(profilePhoto ? [{ url: profilePhoto, caption: 'Profile photo' }] : []),
    ...additionalImages.map(img => ({
      url: img.public_url,
      caption: img.caption || undefined,
    })),
  ]

  function openAt(index: number) {
    setLightboxStart(index)
    setLightboxOpen(true)
  }

  // Avatar offset: profile photo is index 0 in allImages
  const avatarIndex = 0
  // Additional photos start after profile photo
  const additionalOffset = profilePhoto ? 1 : 0

  if (additionalImages.length === 0 && !profilePhoto) return null

  return (
    <>
      {/* Clickable avatar for hero section — rendered via a portal-less approach:
          we render this in the gallery section only. The server component renders
          the avatar separately and the CvAvatarClient component below handles click. */}

      {additionalImages.length > 0 && (
        <div className="cv-card" style={{ marginBottom: 12 }}>
          <p className="cv-card-label">PHOTOS</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}>
            {additionalImages.map((img, i) => (
              <button
                key={i}
                onClick={() => openAt(additionalOffset + i)}
                style={{
                  padding: 0, margin: 0, border: 'none', cursor: 'pointer',
                  background: 'transparent', borderRadius: 8, overflow: 'hidden',
                  display: 'block',
                }}
              >
                <div style={{ position: 'relative', paddingBottom: '100%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.public_url}
                    alt={img.caption || ''}
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '0.5px solid rgba(255,255,255,0.08)',
                    }}
                  />
                </div>
                {img.caption && (
                  <p style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'Arial, sans-serif',
                    marginTop: 4, textAlign: 'center',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    padding: '0 2px',
                  }}>
                    {img.caption}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {lightboxOpen && allImages.length > 0 && (
        <ImageLightbox
          images={allImages}
          startIndex={lightboxStart}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

// Separate component for the clickable avatar in the hero section
export function CvAvatarClient({
  src,
  initials,
  allImages,
}: {
  src?: string | null
  initials: string
  allImages: LightboxImage[]
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!src) {
    return (
      <div className="cv-avatar">
        <span>{initials}</span>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setLightboxOpen(true)}
        className="cv-avatar"
        style={{
          padding: 0, margin: 0, border: 'none', cursor: 'pointer',
          background: 'transparent',
        }}
        title="View photo"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </button>
      {lightboxOpen && (
        <ImageLightbox
          images={allImages}
          startIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
