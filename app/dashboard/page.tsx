'use client'
import { TopBar } from '@/components/TopBar'
import { useAuth } from '@/components/AuthProvider'
import {
  TrendingUp, TrendingDown, Users, ShoppingBag,
  AlertTriangle, BookOpen, ShieldCheck, CreditCard,
  ArrowUpRight, CheckCircle
} from 'lucide-react'

const stats = [
  { label: 'Total Income',   value: 'R 12,450', sub: '+R2,100 this week',   icon: TrendingUp,   color: '#156C7D', bg: '#E8F4F7' },
  { label: 'Total Expenses', value: 'R 4,820',  sub: '+R340 this week',     icon: TrendingDown, color: '#C45C2E', bg: '#FDF0EA' },
  { label: 'Net Profit',     value: 'R 7,630',  sub: 'This month',          icon: TrendingUp,   color: '#059669', bg: '#D1FAE5' },
  { label: 'Active Clients', value: '0',         sub: 'Via KasiStore',       icon: Users,        color: '#7C3AED', bg: '#EDE9FE' },
]

const pillars = [
  {
    name: 'KasiBooks',
    desc: 'Record income and expenses via WhatsApp or dashboard',
    icon: BookOpen, color: '#156C7D', bg: '#E8F4F7', status: 'LIVE',
    action: 'Log Transaction', href: '/dashboard/books',
    stats: [{ l: 'This month', v: '14 entries' }, { l: 'Net balance', v: 'R 7,630' }]
  },
  {
    name: 'KasiComply',
    desc: 'PAYE, UIF, SDL and VAT filing — stay SARS-compliant automatically',
    icon: ShieldCheck, color: '#C45C2E', bg: '#FDF0EA', status: 'BETA',
    action: 'View Filings', href: '/dashboard/comply',
    stats: [{ l: 'Next deadline', v: 'PAYE — 7 Jul' }, { l: 'Status', v: 'Up to date' }]
  },
  {
    name: 'KasiStore',
    desc: 'Your mobile storefront — shareable via WhatsApp link',
    icon: ShoppingBag, color: '#7C3AED', bg: '#EDE9FE', status: 'BETA',
    action: 'Manage Store', href: '/dashboard/store',
    stats: [{ l: 'Products', v: '0 listed' }, { l: 'Orders today', v: '0' }]
  },
  {
    name: 'KasiCredit',
    desc: 'Business loans from R1,000 to R50,000 via partner lenders',
    icon: CreditCard, color: '#059669', bg: '#D1FAE5', status: 'SOON',
    action: 'Check Eligibility', href: '/dashboard/credit',
    stats: [{ l: 'Pre-qualify in', v: '30 days' }, { l: 'Max loan', v: 'Up to R50,000' }]
  },
]

const recentTx = [
  { desc: 'Sold 3 chickens', type: 'income',  amount: 150,  time: '2h ago' },
  { desc: 'Cooking oil x2',  type: 'expense', amount: 84,   time: '5h ago' },
  { desc: 'Bread & rolls',   type: 'income',  amount: 320,  time: 'Yesterday' },
  { desc: 'Airtime stock',   type: 'expense', amount: 500,  time: 'Yesterday' },
]

const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', ...style }}>
    {children}
  </div>
)

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.email?.split('@')[0]?.replace(/[._-]/g, ' ') ?? 'there'

  return (
    <div>
      <TopBar title="Dashboard" subtitle={`Welcome back, ${firstName} — here is your business overview`} />
      <div style={{ padding: '24px 28px', maxWidth: 1200 }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map(s => (
            <Card key={s.label} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2D2926' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>{s.sub}</div>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={18} color={s.color} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pillars */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#2D2926', marginBottom: 14 }}>Your Services</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {pillars.map(p => (
              <Card key={p.name} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p.icon size={20} color={p.color} />
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                    padding: '3px 7px', borderRadius: 4,
                    background: p.status === 'LIVE' ? '#D1FAE5' : p.status === 'BETA' ? '#FEF3C7' : '#F3F4F6',
                    color: p.status === 'LIVE' ? '#059669' : p.status === 'BETA' ? '#92400E' : '#6B7280',
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
                  fontSize: 12, fontWeight: 600, cursor: p.status === 'SOON' ? 'not-allowed' : 'pointer',
                  textDecoration: 'none', marginTop: 'auto'
                }}>
                  {p.action} {p.status !== 'SOON' && <ArrowUpRight size={12} />}
                </a>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          {/* Recent transactions */}
          <Card style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926' }}>Recent Transactions</div>
              <a href="/dashboard/books" style={{ fontSize: 12, color: '#156C7D', textDecoration: 'none', fontWeight: 500 }}>View all →</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentTx.map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: i < recentTx.length - 1 ? '1px solid #F3F4F6' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: t.type === 'income' ? '#D1FAE5' : '#FEE2E2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <TrendingUp size={14} color={t.type === 'income' ? '#059669' : '#DC2626'} style={{ transform: t.type === 'expense' ? 'rotate(180deg)' : 'none' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#2D2926' }}>{t.desc}</div>
                      <div style={{ fontSize: 11, color: '#718096' }}>{t.time} via WhatsApp</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.type === 'income' ? '#059669' : '#DC2626' }}>
                    {t.type === 'income' ? '+' : '-'}R{t.amount}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* WhatsApp quick actions */}
          <Card style={{ padding: '20px' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926', marginBottom: 4 }}>WhatsApp Bot</div>
            <div style={{ fontSize: 12, color: '#718096', marginBottom: 16 }}>Log transactions directly from WhatsApp</div>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <CheckCircle size={13} color="#059669" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>Bot is active</span>
              </div>
              <div style={{ fontSize: 11, color: '#4A5568' }}>WhatsApp your KasiCommerce number to log transactions from anywhere.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Log income', 'Type "1" then enter amount'],
                ['Log expense', 'Type "2" then enter amount'],
                ['View summary', 'Type "5" anytime'],
                ['Main menu', 'Type "MENU" anytime'],
              ].map(([cmd, hint]) => (
                <div key={cmd} style={{
                  background: '#F8FAFB', borderRadius: 8, padding: '10px 12px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#2D2926' }}>{cmd}</div>
                  <div style={{ fontSize: 11, color: '#718096', marginTop: 1 }}>{hint}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
