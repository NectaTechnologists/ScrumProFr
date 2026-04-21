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
    fontWeight: '600', color: '#0D1B2E', marginBottom: '6px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F1EFE8', fontFamily: 'system-ui' }}>
      <div style={{ background: '#0D1B2E', padding: '0 28px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
  <svg width="32" height="30" viewBox="0 0 32 30" style={{ display:'block' }}>
    <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
    <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
    <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
  </svg>
  <span style={{ color:'white', fontWeight:'700', fontSize:'18px' }}>
    GAIN<span style={{ color:'#1D9E75' }}>LINE</span>
  </span>
</div>
        <button onClick={() => router.push('/dashboard')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px' }}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0D1B2E', marginBottom: '6px' }}>
          My Rugby Profile
        </h1>
        <p style={{ color: '#888780', marginBottom: '28px', fontSize: '14px' }}>
          Fill in your details to build your shareable Rugby CV
        </p>

        {shareUrl && (
          <div style={{ background: 'rgba(60,181,254,0.08)', border: '1px solid rgba(60,181,254,0.3)', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1D9E75', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your shareable CV link</div>
              <div style={{ fontSize: '13px', color: '#0D1B2E', fontFamily: 'monospace' }}>{shareUrl}</div>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link copied!') }}
              style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
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
            style={{ width: '100%', padding: '12px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
