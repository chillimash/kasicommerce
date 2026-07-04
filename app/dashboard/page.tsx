import { redirect } from 'next/navigation'
import { TopBar } from '@/components/TopBar'
import { getAuthenticatedBusiness, getBusinessData, summariseTransactions, trialDaysRemaining } from '@/lib/get-business'
import { TrendingUp, TrendingDown, Users, ShoppingBag, ArrowUpRight, CheckCircle, BookOpen, ShieldCheck, CreditCard } from 'lucide-react'

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', ...style }}>{children}</div>
}

function fmt(n: number) { return `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

export default async function DashboardPage() {
  const { user, business } = await getAuthenticatedBusiness()
  if (!user || !business) redirect('/login')

  const data    = await getBusinessData(business.id)
  const summary = summariseTransactions(data.transactions)
  const days    = trialDaysRemaining(business.trial_ends_at)

  const pillars = [
    {
      name: 'KasiBooks',  desc: 'Record income and expenses via WhatsApp or dashboard',
      icon: BookOpen,     color: '#156C7D', bg: '#E8F4F7', status: 'LIVE',
      action: 'Log Transaction', href: '/dashboard/books',
      stats: [
        { l: 'This month', v: fmt(summary.monthIncome) },
        { l: 'Net balance', v: fmt(summary.netProfit) },
      ]
    },
    {
      name: 'KasiComply', desc: 'PAYE, UIF, SDL and VAT filing — stay SARS-compliant',
      icon: ShieldCheck,  color: '#C45C2E', bg: '#FDF0EA', status: 'LIVE',
      action: 'View Filings', href: '/dashboard/comply',
      stats: [
        { l: 'Upcoming filings', v: `${data.events.filter(e => e.status === 'upcoming' || e.status === 'due_soon').length}` },
        { l: 'Overdue',          v: `${data.events.filter(e => e.status === 'overdue').length}` },
      ]
    },
    {
      name: 'KasiStore',  desc: 'Your mobile storefront — shareable via WhatsApp link',
      icon: ShoppingBag,  color: '#7C3AED', bg: '#EDE9FE', status: 'BETA',
      action: 'Manage Store', href: '/dashboard/store',
      stats: [
        { l: 'Products',    v: `${data.products.length} listed` },
        { l: 'Orders today', v: '0' },
      ]
    },
    {
      name: 'KasiCredit', desc: 'Business loans R1,000 – R50,000 via partner lenders',
      icon: CreditCard,   color: '#059669', bg: '#D1FAE5', status: 'SOON',
      action: 'Check Eligibility', href: '/dashboard/credit',
      stats: [
        { l: 'Applications', v: `${data.creditApps.length}` },
        { l: 'Max loan',     v: fmt(Math.min(summary.totalIncome * 3, 50000)) },
      ]
    },
  ]

  return (
    <div>
      <TopBar title={`Welcome back, ${business.owner_name.split(' ')[0]}`} subtitle={business.business_name} />
      <div style={{ padding: '24px 28px', maxWidth: 1200 }}>

        {/* Trial warning */}
        {business.status === 'trial' && days <= 7 && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 18px', marginBottom: 20, fontSize: 13, color: '#92400E', fontWeight: 500 }}>
            ⚠️ Your free trial ends in {days} day{days !== 1 ? 's' : ''}. Upgrade to keep your data and features.
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Income',    value: fmt(summary.totalIncome),   sub: `+${fmt(summary.monthIncome)} this month`, icon: TrendingUp,   color: '#156C7D', bg: '#E8F4F7' },
            { label: 'Total Expenses',  value: fmt(summary.totalExpenses), sub: `${fmt(summary.monthExpenses)} this month`,  icon: TrendingDown, color: '#C45C2E', bg: '#FDF0EA' },
            { label: 'Net Profit',      value: fmt(summary.netProfit),     sub: 'All time',                                  icon: TrendingUp,   color: '#059669', bg: '#D1FAE5' },
            { label: 'Transactions',    value: `${data.transactions.length}`, sub: 'Total recorded',                        icon: BookOpen,     color: '#7C3AED', bg: '#EDE9FE' },
          ].map(s => (
            <Card key={s.label} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#2D2926' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>{s.sub}</div>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={18} color={s.color} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pillar cards */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#2D2926', marginBottom: 14 }}>Your Services</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {pillars.map(p => (
              <Card key={p.name} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p.icon size={20} color={p.color} />
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', padding: '3px 7px', borderRadius: 4,
                    background: p.status === 'LIVE' ? '#D1FAE5' : p.status === 'BETA' ? '#FEF3C7' : '#F3F4F6',
                    color:      p.status === 'LIVE' ? '#059669' : p.status === 'BETA' ? '#92400E' : '#6B7280',
                  }}>{p.status}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#718096', lineHeight: 1.5 }}>{p.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {p.stats.map(s => (
                    <div key={s.l}>
                      <div style={{ fontSize: 10, color: '#718096' }}>{s.l}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#2D2926', marginTop: 1 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <a href={p.href} style={{
                  display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center',
                  background: p.status === 'SOON' ? '#F3F4F6' : p.color,
                  color: p.status === 'SOON' ? '#9CA3AF' : '#fff',
                  border: 'none', borderRadius: 7, padding: '8px 12px',
                  fontSize: 12, fontWeight: 600,
                  cursor: p.status === 'SOON' ? 'not-allowed' : 'pointer',
                  textDecoration: 'none', marginTop: 'auto',
                  pointerEvents: p.status === 'SOON' ? 'none' : 'auto',
                }}>
                  {p.action} {p.status !== 'SOON' && <ArrowUpRight size={12} />}
                </a>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926' }}>Recent Transactions</div>
              <a href="/dashboard/books" style={{ fontSize: 12, color: '#156C7D', textDecoration: 'none', fontWeight: 500 }}>View all →</a>
            </div>
            {summary.recentTx.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#718096', fontSize: 13 }}>
                No transactions yet. Send a WhatsApp message to log your first one.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {summary.recentTx.slice(0, 6).map((t, i) => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: i < 5 ? '1px solid #F3F4F6' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: t.type === 'income' ? '#D1FAE5' : '#FEE2E2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <TrendingUp size={14} color={t.type === 'income' ? '#059669' : '#DC2626'}
                          style={{ transform: t.type === 'expense' ? 'rotate(180deg)' : 'none' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#2D2926' }}>{t.description}</div>
                        <div style={{ fontSize: 11, color: '#718096' }}>
                          {new Date(t.created_at).toLocaleDateString('en-ZA')} · {t.source}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.type === 'income' ? '#059669' : '#DC2626' }}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* WhatsApp status */}
          <Card style={{ padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926', marginBottom: 4 }}>WhatsApp Bot</div>
            <div style={{ fontSize: 12, color: '#718096', marginBottom: 16 }}>Log transactions from anywhere</div>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <CheckCircle size={13} color="#059669" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>Bot is active</span>
              </div>
              <div style={{ fontSize: 11, color: '#4A5568' }}>
                Linked to <strong>{business.phone}</strong>
              </div>
            </div>
            {[
              ['Log income',   'Type "1" then amount'],
              ['Log expense',  'Type "2" then amount'],
              ['Tax check',    'Type "2" from main menu'],
              ['Summary',      'Type "5" anytime'],
              ['Main menu',    'Type "MENU" anytime'],
            ].map(([cmd, hint]) => (
              <div key={cmd} style={{ background: '#F8FAFB', borderRadius: 8, padding: '8px 12px', marginBottom: 6, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2D2926' }}>{cmd}</div>
                <div style={{ fontSize: 11, color: '#718096', marginTop: 1 }}>{hint}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
