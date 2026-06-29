'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function TrialForm() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref') ?? ''

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    organisationName: '',
    phone: '',
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/trial-optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sourceRef: ref }),
      })

      if (!res.ok) throw new Error('Something went wrong — please try again.')

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={headingStyle}>You're in 🎉</h1>
          <p style={textStyle}>
            Thanks — Bruce will be in touch shortly to set up a quick call and get you live on the trial.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>24 months free on Gainline</h1>
        <p style={textStyle}>
          Post your player needs on social media, point enquiries to Gainline, and get full
          platform access — free — for 24 months. No exclusivity, no change to how you already
          recruit.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <Field
            label="Full name"
            value={form.fullName}
            onChange={(v) => setForm({ ...form, fullName: v })}
            required
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            required
          />
          <Field
            label="Club / organisation"
            value={form.organisationName}
            onChange={(v) => setForm({ ...form, organisationName: v })}
          />
          <Field
            label="Phone (optional, for the call)"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Field
            label="Anything else? (optional)"
            value={form.notes}
            onChange={(v) => setForm({ ...form, notes: v })}
            textarea
          />

          {error && <p style={{ color: '#ff6b6b', fontSize: 14 }}>{error}</p>}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Sending...' : "I'm in — let's talk"}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  textarea = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  textarea?: boolean
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, minHeight: 80 }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          style={inputStyle}
        />
      )}
    </div>
  )
}

export default function TrialPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1e2e' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', color: '#888780', fontSize: 14 }}>Loading...</span>
      </div>
    }>
      <TrialForm />
    </Suspense>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0f1e2e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  fontFamily: 'Inter, sans-serif',
}

const cardStyle: React.CSSProperties = {
  background: '#16263a',
  borderRadius: 12,
  padding: 32,
  maxWidth: 480,
  width: '100%',
}

const headingStyle: React.CSSProperties = {
  color: '#f5f5f3',
  fontSize: 26,
  fontWeight: 600,
  marginBottom: 12,
}

const textStyle: React.CSSProperties = {
  color: '#c5cdd6',
  fontSize: 15,
  lineHeight: 1.6,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#c5cdd6',
  fontSize: 13,
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #2a3d52',
  background: '#0f1e2e',
  color: '#f5f5f3',
  fontSize: 14,
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 0',
  borderRadius: 8,
  border: 'none',
  background: '#2ec97e',
  color: '#0f1e2e',
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  marginTop: 8,
}
