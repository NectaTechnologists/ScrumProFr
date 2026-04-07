'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const positions = [
  'LOOSEHEAD_PROP','HOOKER','TIGHTHEAD_PROP',
  'LEFT_LOCK','RIGHT_LOCK',
  'BLINDSIDE_FLANKER','OPENSIDE_FLANKER','NUMBER_8',
  'SCRUMHALF','FLYHALF',
  'LEFT_WING','INSIDE_CENTRE','OUTSIDE_CENTRE','RIGHT_WING','FULLBACK'
]

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    nationality_primary: '',
    position_primary: 'HOOKER',
    position_secondary: '',
    height_cm: '',
    weight_kg: '',
    school_attended: '',
    bio: '',
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: player } = await supabase
        .from('players')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (player) {
        setForm({
          first_name: player.first_name || '',
          last_name: player.last_name || '',
          date_of_birth: player.date_of_birth || '',
          nationality_primary: player.nationality_primary || '',
          position_primary: player.position_primary || 'HOOKER',
          position_secondary: player.position_secondary || '',
          height_cm: player.height_cm || '',
          weight_kg: player.weight_kg || '',
          school_attended: player.school_attended || '',
          bio: player.bio || '',
        })
        setShareUrl(`${window.location.origin}/cv/${player.share_token}`)
      }
    }
    loadProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    const playerData = {
      profile_id: user.id,
      first_name: form.first_name,
      last_name: form.last_name,
      date_of_birth: form.date_of_birth,
      nationality_primary: form.nationality_primary,
      position_primary: form.position_primary,
      position_secondary: form.position_secondary || null,
      height_cm: form.height_cm ? parseInt(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      school_attended: form.school_attended,
      bio: form.bio,
      profile_visibility: 'PUBLIC',
    }

    let result
    if (existing) {
      result = await supabase
        .from('players')
        .update(playerData)
        .eq('profile_id', user.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('players')
        .insert(playerData)
        .select()
        .single()
    }

    if (result.data) {
      setShareUrl(`${window.location.origin}/cv/${result.data.share_token}`)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setLoading(false)
  }

  const input = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #E8E4F0', borderRadius: '8px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'system-ui'
  }

  const label = {
    display: 'block', fontSize: '13px',
    fontWeight: '600', color: '#241637', marginBottom: '6px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7', fontFamily: 'system-ui' }}>
      <div style={{ background: '#241637', padding: '0 28px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>
          Scrum<span style={{ color: '#3CB5FE' }}>Pro</span>
        </span>
        <button onClick={() => router.push('/dashboard')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px' }}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#241637', marginBottom: '6px' }}>
          My Rugby Profile
        </h1>
        <p style={{ color: '#9890b0', marginBottom: '28px', fontSize: '14px' }}>
          Fill in your details to build your shareable Rugby CV
        </p>

        {shareUrl && (
          <div style={{ background: 'rgba(60,181,254,0.08)', border: '1px solid rgba(60,181,254,0.3)', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#3CB5FE', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your shareable CV link</div>
              <div style={{ fontSize: '13px', color: '#241637', fontFamily: 'monospace' }}>{shareUrl}</div>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link copied!') }}
              style={{ background: '#3CB5FE', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              Copy Link
            </button>
          </div>
        )}

        <form onSubmit={handleSave} style={{ background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #E8E4F0' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={label}>First Name</label>
              <input style={input} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required placeholder="Abonga" />
            </div>
            <div>
              <label style={label}>Last Name</label>
              <input style={input} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required placeholder="Nkwelo" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={label}>Date of Birth</label>
              <input style={input} type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} required />
            </div>
            <div>
              <label style={label}>Nationality</label>
              <input style={input} value={form.nationality_primary} onChange={e => setForm({ ...form, nationality_primary: e.target.value })} placeholder="South African" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={label}>Primary Position</label>
              <select style={input} value={form.position_primary} onChange={e => setForm({ ...form, position_primary: e.target.value })}>
                {positions.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Secondary Position</label>
              <select style={input} value={form.position_secondary} onChange={e => setForm({ ...form, position_secondary: e.target.value })}>
                <option value="">None</option>
                {positions.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={label}>Height (cm)</label>
              <input style={input} type="number" value={form.height_cm} onChange={e => setForm({ ...form, height_cm: e.target.value })} placeholder="187" />
            </div>
            <div>
              <label style={label}>Weight (kg)</label>
              <input style={input} type="number" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} placeholder="110" />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={label}>School Attended</label>
            <input style={input} value={form.school_attended} onChange={e => setForm({ ...form, school_attended: e.target.value })} placeholder="St Andrews College" />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={label}>Bio / Personal Summary</label>
            <textarea
              style={{ ...input, height: '100px', resize: 'none' }}
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Experienced front-row forward with strong set-piece fundamentals..."
            />
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#9437EA', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}