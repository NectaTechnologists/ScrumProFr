'use client'

import { useState } from 'react'

interface ShareModalProps {
  shareUrl: string
  isOpen: boolean
  onClose: () => void
}

export default function ShareModal({ shareUrl, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [igCopied, setIgCopied] = useState(false)

  if (!isOpen) return null

  const message = `Check out my rugby CV on Gainline — ${shareUrl}`

  const channels = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      sub: 'Send directly',
      href: `https://wa.me/?text=${encodeURIComponent(message)}`,
      borderColor: 'rgba(37,211,102,0.25)',
      hoverColor: 'rgba(37,211,102,0.45)',
      iconBg: 'rgba(37,211,102,0.12)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.1 1.524 5.823L.057 23.62a.75.75 0 00.922.922l5.834-1.479A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.895 0-3.66-.523-5.17-1.43l-.36-.216-3.738.948.964-3.653-.235-.376A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      sub: 'Open mail app',
      href: `mailto:?subject=${encodeURIComponent('My Gainline Rugby CV')}&body=${encodeURIComponent(message)}`,
      borderColor: 'rgba(212,168,67,0.25)',
      hoverColor: 'rgba(212,168,67,0.45)',
      iconBg: 'rgba(212,168,67,0.12)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="3" stroke="#D4A843" strokeWidth="1.5"/>
          <path d="M2 7L12 13L22 7" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      sub: 'Share to feed',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      borderColor: 'rgba(66,103,178,0.3)',
      hoverColor: 'rgba(66,103,178,0.55)',
      iconBg: 'rgba(66,103,178,0.15)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#4267B2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      id: 'instagram',
      label: 'Instagram',
      sub: 'Copy for story/bio',
      href: null, // Instagram has no web share API — we copy to clipboard instead
      borderColor: 'rgba(225,48,108,0.25)',
      hoverColor: 'rgba(225,48,108,0.45)',
      iconBg: 'rgba(225,48,108,0.12)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433"/>
              <stop offset="25%" stopColor="#e6683c"/>
              <stop offset="50%" stopColor="#dc2743"/>
              <stop offset="75%" stopColor="#cc2366"/>
              <stop offset="100%" stopColor="#bc1888"/>
            </linearGradient>
          </defs>
          <path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
    },
  ]

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleInstagram() {
    await navigator.clipboard.writeText(shareUrl)
    setIgCopied(true)
    setTimeout(() => setIgCopied(false), 2500)
  }

  return (
    <>
      <style>{`
        .share-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.75);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .share-modal {
          background: #161C2A;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px;
          width: 100%; max-width: 400px;
          position: relative;
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .share-close {
          position: absolute; top: 16px; right: 16px;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.07); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #5A564F; font-size: 18px; line-height: 1;
          transition: background 0.15s;
        }
        .share-close:hover { background: rgba(255,255,255,0.12); color: #F0EDE4; }
        .share-eyebrow { font-size: 10px; color: #5A564F; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; }
        .share-title { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .share-sub { font-size: 12px; color: #5A564F; margin-bottom: 22px; line-height: 1.5; }
        .share-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .share-channel {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 12px;
          border: 1px solid; background: #1C2338;
          cursor: pointer; text-decoration: none;
          transition: transform 0.15s, border-color 0.2s;
        }
        .share-channel:hover { transform: translateY(-1px); }
        .share-channel-icon {
          width: 36px; height: 36px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .share-channel-label { font-size: 13px; font-weight: 500; color: #F0EDE4; font-family: 'DM Sans', sans-serif; }
        .share-channel-sub { font-size: 10px; color: #5A564F; margin-top: 1px; }
        .share-copy-row {
          display: flex; align-items: center; gap: 8px;
          background: #1C2338; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 10px 12px;
        }
        .share-copy-url {
          flex: 1; font-size: 11px; color: #5A564F;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          font-family: monospace;
        }
        .share-copy-btn {
          padding: 6px 14px; border-radius: 7px; border: none;
          background: #D4A843; color: #0C0F16;
          font-size: 11px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; flex-shrink: 0;
          transition: opacity 0.15s, background 0.2s;
        }
        .share-copy-btn:hover { opacity: 0.88; }
        .share-copy-btn.copied { background: #3DBE72; color: #fff; }
        .ig-toast {
          margin-top: 10px; text-align: center;
          font-size: 11px; color: #3DBE72;
          animation: fadeIn 0.2s ease;
        }
      `}</style>

      <div className="share-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <div className="share-modal">
          <button className="share-close" onClick={onClose}>×</button>
          <div className="share-eyebrow">Share your CV</div>
          <div className="share-title">Get seen by coaches</div>
          <div className="share-sub">Send your Gainline CV directly to coaches, agents and clubs.</div>

          <div className="share-grid">
            {channels.map(ch => (
              ch.href ? (
                <a
                  key={ch.id}
                  className="share-channel"
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ borderColor: ch.borderColor }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = ch.hoverColor)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = ch.borderColor)}
                >
                  <div className="share-channel-icon" style={{ background: ch.iconBg }}>
                    {ch.icon}
                  </div>
                  <div>
                    <div className="share-channel-label">{ch.label}</div>
                    <div className="share-channel-sub">{ch.sub}</div>
                  </div>
                </a>
              ) : (
                <button
                  key={ch.id}
                  className="share-channel"
                  onClick={handleInstagram}
                  style={{ borderColor: igCopied ? 'rgba(61,190,114,0.5)' : ch.borderColor }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = ch.hoverColor)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = igCopied ? 'rgba(61,190,114,0.5)' : ch.borderColor)}
                >
                  <div className="share-channel-icon" style={{ background: ch.iconBg }}>
                    {ch.icon}
                  </div>
                  <div>
                    <div className="share-channel-label">{ch.label}</div>
                    <div className="share-channel-sub">{igCopied ? 'Link copied!' : ch.sub}</div>
                  </div>
                </button>
              )
            ))}
          </div>

          <div className="share-copy-row">
            <span className="share-copy-url">{shareUrl}</span>
            <button
              className={`share-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>

          {igCopied && (
            <div className="ig-toast">
              ✓ Link copied — paste it into your Instagram story or bio
            </div>
          )}
        </div>
      </div>
    </>
  )
}
