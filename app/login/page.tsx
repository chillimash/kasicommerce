'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { Zap, Phone, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'

type Step = 'phone' | 'otp' | 'setup'
type OtpChannel = 'whatsapp' | 'sms'

type InputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}

function Input({ label, value, onChange, placeholder, type = 'text' }: InputProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2D2926', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 9,
          border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none',
          boxSizing: 'border-box' as const, transition: 'border-color 0.15s',
          fontFamily: 'inherit',
        }}
        onFocus={e => e.target.style.borderColor = '#156C7D'}
        onBlur={e => e.target.style.borderColor = '#E2E8F0'}
      />
    </div>
  )
}

export default function LoginPage() {
  const [step, setStep]       = useState<Step>('phone')
  const [phone, setPhone]     = useState('')
  const [otp, setOtp]         = useState('')
  const [name, setName]       = useState('')
  const [bizName, setBizName] = useState('')
  const [otpChannel, setOtpChannel] = useState<OtpChannel>('whatsapp')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Format phone to E.164 for SA numbers
  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('0') && digits.length === 10) return `+27${digits.slice(1)}`
    if (digits.startsWith('27')) return `+${digits}`
    if (digits.startsWith('+27')) return raw
    return `+27${digits}`
  }

  async function sendOTP() {
    setError('')
    setLoading(true)
    const formatted = formatPhone(phone)
    const { error: whatsappError } = await supabase.auth.signInWithOtp({
      phone: formatted,
      options: { channel: 'whatsapp' } // OTP via WhatsApp
    })

    if (!whatsappError) {
      setOtpChannel('whatsapp')
      setLoading(false)
      setStep('otp')
      return
    }

    // WhatsApp delivery is available only when the Supabase phone provider has
    // a WhatsApp sender configured. Fall back to the provider's SMS channel so
    // users can still access their account while that configuration is fixed.
    const canFallbackToSms = /unsupported phone provider|whatsapp/i.test(whatsappError.message)
    if (canFallbackToSms) {
      const { error: smsError } = await supabase.auth.signInWithOtp({ phone: formatted })
      setLoading(false)
      if (smsError) { setError(smsError.message); return }
      setOtpChannel('sms')
      setStep('otp')
      return
    }

    setLoading(false)
    setError(whatsappError.message)
  }

  async function verifyOTP() {
    setError('')
    setLoading(true)
    const formatted = formatPhone(phone)
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted, token: otp, type: 'sms'
    })
    if (error) { setError(error.message); setLoading(false); return }

    // Check if business already exists (WhatsApp-created)
    const cleanPhone = formatted
    const { data: business } = await supabase
      .from('businesses').select('id').eq('phone', cleanPhone).single()

    if (business) {
      // Existing business — go straight to dashboard
      router.push('/dashboard')
    } else {
      // New user — collect basic info to create business record
      setStep('setup')
    }
    setLoading(false)
  }

  async function createBusiness() {
    setError('')
    setLoading(true)
    const formatted = formatPhone(phone)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Session expired. Please try again.'); setLoading(false); return }

    const { error } = await supabase.from('businesses').insert({
      owner_name:    name,
      business_name: bizName,
      phone:         formatted,
      language:      'en',
      business_type: 'Other',
      tier:          'free',
      status:        'trial',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #1F5C6B 0%, #156C7D 60%, #0F4A58 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: '#C45C2E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Zap size={26} color="#fff" />
          </div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 24 }}>KasiCommerce</div>
          <div style={{ color: '#8FBFC9', fontSize: 13, marginTop: 4 }}>Your Business Operating System</div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

          {step === 'phone' && (
            <>
              <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#2D2926' }}>Sign in</h2>
              <p style={{ margin: '0 0 24px', fontSize: 13, color: '#718096', lineHeight: 1.5 }}>
                Use the same WhatsApp number you registered with. We'll send you a verification code.
              </p>
              <Input
                label="WhatsApp Number"
                value={phone}
                onChange={setPhone}
                placeholder="e.g. 0821234567"
                type="tel"
              />
              {error && <div style={{ color: '#DC2626', fontSize: 12, marginBottom: 14 }}>{error}</div>}
              <button
                onClick={sendOTP}
                disabled={loading || phone.length < 9}
                style={{
                  width: '100%', padding: '12px', borderRadius: 9,
                  background: loading || phone.length < 9 ? '#CBD5E0' : '#156C7D',
                  border: 'none', color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: loading || phone.length < 9 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Phone size={16} />}
                {loading ? 'Sending...' : 'Send WhatsApp Code'}
              </button>
              <div style={{ marginTop: 20, padding: '12px 14px', background: '#F0FDF4', borderRadius: 8, display: 'flex', gap: 8 }}>
                <ShieldCheck size={14} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 11, color: '#065F46' }}>
                  If you already use KasiCommerce via WhatsApp, log in with the same number to access your existing data.
                </div>
              </div>
            </>
          )}

          {step === 'otp' && (
            <>
              <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#2D2926' }}>Enter your code</h2>
              <p style={{ margin: '0 0 24px', fontSize: 13, color: '#718096' }}>
                We sent a 6-digit code to <strong>{phone}</strong> via {otpChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}.
              </p>
              <Input
                label="6-Digit Code"
                value={otp}
                onChange={setOtp}
                placeholder="e.g. 123456"
                type="number"
              />
              {error && <div style={{ color: '#DC2626', fontSize: 12, marginBottom: 14 }}>{error}</div>}
              <button
                onClick={verifyOTP}
                disabled={loading || otp.length < 6}
                style={{
                  width: '100%', padding: '12px', borderRadius: 9,
                  background: loading || otp.length < 6 ? '#CBD5E0' : '#156C7D',
                  border: 'none', color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: loading || otp.length < 6 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? <Loader2 size={16} /> : <ArrowRight size={16} />}
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <button
                onClick={() => setStep('phone')}
                style={{ width: '100%', marginTop: 10, padding: '10px', background: 'none', border: 'none', color: '#718096', fontSize: 13, cursor: 'pointer' }}
              >
                ← Back
              </button>
            </>
          )}

          {step === 'setup' && (
            <>
              <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#2D2926' }}>Set up your account</h2>
              <p style={{ margin: '0 0 24px', fontSize: 13, color: '#718096' }}>
                You're new here! Tell us about your business to get started.
              </p>
              <Input label="Your Name"      value={name}    onChange={setName}    placeholder="e.g. Nomsa Dlamini" />
              <Input label="Business Name"  value={bizName} onChange={setBizName} placeholder="e.g. Nomsa's Spaza" />
              {error && <div style={{ color: '#DC2626', fontSize: 12, marginBottom: 14 }}>{error}</div>}
              <button
                onClick={createBusiness}
                disabled={loading || !name || !bizName}
                style={{
                  width: '100%', padding: '12px', borderRadius: 9,
                  background: loading || !name || !bizName ? '#CBD5E0' : '#C45C2E',
                  border: 'none', color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: loading || !name || !bizName ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? <Loader2 size={16} /> : <ArrowRight size={16} />}
                {loading ? 'Creating...' : 'Create My Account'}
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: '#8FBFC9', fontSize: 12 }}>
          Protected by Supabase Auth · POPIA Compliant
        </div>
      </div>
    </div>
  )
}
