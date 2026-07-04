'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { useAuth } from '@/components/AuthProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, router, user])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFB', color: '#4A5568' }}>
        Loading your workspace...
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFB' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  )
}
