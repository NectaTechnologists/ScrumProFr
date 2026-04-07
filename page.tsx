'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setMessage(error.message) } else { setMessage('Check your email!') }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setMessage(error.message) } else { router.push('/dashboard') }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#241637', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui' }}>
      <div style={{ background:'white', borderRadius:'16px', padding:'40px', width:'100%', maxWidth:'400px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'56px', height:'56px', background:'#241637', borderRadius:'12px', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
            <span style={{ color:'#3CB5FE', fontSize:'24px', fontWeight:'bold' }}>S</span>
          </div>
          <h1 style={{ fontSize:'22px', fontWeight:'700', color:'#241637', margin:'0 0 4px' }}>ScrumPro</h1>
          <p style={{ color:'#9890b0', fontSize:'14px', margin:0 }}>{isSignUp ? 'Create your account' : 'Sign in to your account'}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', fontSize:'13px', fontWeight:'600', color:'#241637', marginBottom:'6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
              style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #E8E4F0', borderRadius:'8px', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:'24px' }}>
            <label style={{ display:'block', fontSize:'13px', fontWeight:'600', color:'#241637', marginBottom:'6px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #E8E4F0', borderRadius:'8px', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
          </div>
          {message && (
            <div style={{ padding:'10px 14px', borderRadius:'8px', marginBottom:'16px', background: message.includes('Check') ? '#f0fdf4' : '#fdf2f2', color: message.includes('Check') ? '#166534' : '#991b1b', fontSize:'13px' }}>
              {message}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'12px', background:'#9437EA', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'#9890b0' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
            style={{ background:'none', border:'none', color:'#9437EA', fontWeight:'600', cursor:'pointer', fontSize:'13px' }}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}