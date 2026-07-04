'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const { signIn, signUp, error } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 28, boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1F5C6B' }}>KasiCommerce</div>
          <div style={{ marginTop: 6, color: '#718096', fontSize: 14 }}>Sign in to personalise your business dashboard.</div>
        </div>

        <div style={{ display: 'flex', background: '#F8FAFB', borderRadius: 10, padding: 4, marginBottom: 20 }}>
          <button type="button" onClick={() => setMode('login')} style={{ flex: 1, border: 'none', borderRadius: 8, padding: '10px 12px', fontWeight: 700, cursor: 'pointer', background: mode === 'login' ? '#1F5C6B' : 'transparent', color: mode === 'login' ? '#fff' : '#4A5568' }}>
            Login
          </button>
          <button type="button" onClick={() => setMode('signup')} style={{ flex: 1, border: 'none', borderRadius: 8, padding: '10px 12px', fontWeight: 700, cursor: 'pointer', background: mode === 'signup' ? '#1F5C6B' : 'transparent', color: mode === 'signup' ? '#fff' : '#4A5568' }}>
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#2D2926' }}>
            Email
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} style={{ border: '1px solid #CBD5E0', borderRadius: 8, padding: '10px 12px', fontSize: 14 }} placeholder="you@example.com" />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#2D2926' }}>
            Password
            <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} style={{ border: '1px solid #CBD5E0', borderRadius: 8, padding: '10px 12px', fontSize: 14 }} placeholder="At least 6 characters" />
          </label>

          {error && <div style={{ color: '#C53030', background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>{error}</div>}

          <button type="submit" disabled={busy} style={{ border: 'none', borderRadius: 8, padding: '12px 14px', fontWeight: 700, cursor: busy ? 'wait' : 'pointer', background: '#C45C2E', color: '#fff' }}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: 16, fontSize: 13, color: '#718096' }}>
          Need a quick preview? <Link href="/dashboard" style={{ color: '#156C7D', fontWeight: 600 }}>Open the dashboard</Link>
        </div>
      </div>
    </main>
  )
}
