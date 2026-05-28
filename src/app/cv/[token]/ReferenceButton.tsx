'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReferenceButton({ playerId }: { playerId: string }) {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingRef, setExistingRef] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organisation_name, full_name')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'org_user') return
      setProfile(profile)

      // Check if already submitted a reference
      const { data: existing } = await supabase
        .from('references')
        .select('id')
        .eq('player_id', playerId)
        .eq('coach_id', user.id)
        .single()

      if (existing) setExistingRef(true)
    }
    init()
  }, [])

  async function handleSubmit() {
    if (!content.trim() || !user || !profile) return
    setSubmitting(true)

    const { data: newRef } = await supabase.from('references').insert({
      player_id: playerId,
      coach_id: user.id,
      coach_name: profile.full_name || user.email,
      organisation_name: profile.organisation_name,
      content: content.trim(),
      status: 'pending',
    }).select('id').single()

    // Fire-and-forget — notify the player
    if (newRef?.id) {
      fetch('/api/notify-reference-received', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference_id: newRef.id }),
      }).catch(() => {/* silent */})
    }

    setSubmitted(true)
    setSubmitting(false)
    setShowForm(false)
  }

  // Only show to approved coaches
  if (!profile) return null

  if (existingRef) return (
    <div style={{ marginTop: '12px', padding: '10px 16px', background: '#E1F5EE', borderRadius: '20px', fontSize: '12px', color: '#0F6E56', fontWeight: '600', display: 'inline-block' }}>
      ✓ Reference submitted
    </div>
  )

  if (submitted) return (
    <div style={{ marginTop: '12px', padding: '10px 16px', background: '#E1F5EE', borderRadius: '20px', fontSize: '12px', color: '#0F6E56', fontWeight: '600', display: 'inline-block' }}>
      ✓ Reference sent — the player will be notified
    </div>
  )

  return (
    <div style={{ marginTop: '16px' }}>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 14px', borderRadius: '20px', border: '1.5px solid rgba(255,255,255,0.25)', background: 'transparent', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 012 2v6a2 2 0 01-2 2H6l-4 3V4a2 2 0 012-2h8z"/>
          </svg>
          Write a reference
        </button>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.15)' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
            Writing as <strong style={{ color: 'white' }}>{profile.full_name}</strong> · {profile.organisation_name}
          </p>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value.slice(0, 200))}
            placeholder="Share your experience with this player — their strengths, attitude, and what level you'd recommend them for..."
            style={{ width: '100%', height: '80px', padding: '10px 12px', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '13px', fontFamily: 'Arial, sans-serif', resize: 'none', outline: 'none' }}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{content.length}/200</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowForm(false); setContent('') }} style={{ height: '28px', padding: '0 12px', borderRadius: '20px', border: '1.5px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={!content.trim() || submitting} style={{ height: '28px', padding: '0 14px', borderRadius: '20px', border: 'none', background: '#1D9E75', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Arial, sans-serif', opacity: !content.trim() ? 0.5 : 1 }}>
                {submitting ? 'Sending...' : 'Submit reference'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}