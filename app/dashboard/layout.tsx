import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { getAuthenticatedBusiness, trialDaysRemaining } from '@/lib/get-business'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, business } = await getAuthenticatedBusiness()

  if (!user) redirect('/login')

  const trialDays = trialDaysRemaining(business?.trial_ends_at || null)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFB' }}>
      <Sidebar businessName={business?.business_name} trialDays={trialDays} tier={business?.tier} />
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  )
}
