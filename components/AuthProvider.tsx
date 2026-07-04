'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const initialiseSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      if (!isMounted) return
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setLoading(false)
    }

    initialiseSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      throw signInError
    }
    router.push('/dashboard')
  }

  const signUp = async (email: string, password: string) => {
    setError(null)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      throw signUpError
    }

    router.push('/dashboard')
  }

  const signOut = async () => {
    setError(null)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  }), [error, loading, session, signIn, signOut, signUp, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
