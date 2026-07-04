'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, ShieldCheck, ShoppingBag,
  CreditCard, Users, Settings, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'

const nav = [
  { label: 'Dashboard',  href: '/dashboard',           icon: LayoutDashboard },
  { label: 'KasiBooks',  href: '/dashboard/books',     icon: BookOpen,    badge: 'LIVE' },
  { label: 'KasiComply', href: '/dashboard/comply',    icon: ShieldCheck, badge: 'LIVE' },
  { label: 'KasiStore',  href: '/dashboard/store',     icon: ShoppingBag, badge: 'BETA' },
  { label: 'KasiCredit', href: '/dashboard/credit',    icon: CreditCard,  badge: 'SOON' },
  { label: 'Champions',  href: '/dashboard/champions', icon: Users },
  { label: 'Settings',   href: '/dashboard/settings',  icon: Settings },
]

type Props = {
  businessName?: string | null
  trialDays?: number
  tier?: string | null
}

export function Sidebar({ businessName, trialDays = 0, tier = 'free' }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside style={{
      width: collapsed ? 68 : 240,
      transition: 'width 0.2s ease',
      background: '#1F5C6B',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '24px 16px' : '24px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: '#C45C2E',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Zap size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1 }}>KasiCommerce</div>
            <div style={{ color: '#8FBFC9', fontSize: 10, marginTop: 2, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {businessName || 'Business OS'}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {nav.map(({ label, href, icon: Icon, badge }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '12px 16px' : '11px 20px',
                margin: '2px 8px', borderRadius: 8,
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderLeft: active ? '3px solid #C45C2E' : '3px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <Icon size={18} color={active ? '#fff' : '#8FBFC9'} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ color: active ? '#fff' : '#8FBFC9', fontSize: 13.5, fontWeight: active ? 600 : 400, flex: 1 }}>
                    {label}
                  </span>
                )}
                {!collapsed && badge && (
                  <span style={{
                    background: badge === 'LIVE' ? '#156C7D' : badge === 'SOON' ? '#374151' : '#92400E',
                    color: '#fff', fontSize: 9, fontWeight: 700,
                    padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em'
                  }}>{badge}</span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute', top: 28, right: -12,
          width: 24, height: 24, borderRadius: '50%',
          background: '#C45C2E', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}
      >
        {collapsed ? <ChevronRight size={12} color="#fff" /> : <ChevronLeft size={12} color="#fff" />}
      </button>

      {/* Trial / tier badge */}
      {!collapsed && (
        <div style={{ padding: '12px 16px 20px' }}>
          {tier === 'free' ? (
            <div style={{ background: 'rgba(196,92,46,0.2)', border: '1px solid rgba(196,92,46,0.4)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ color: '#E78F5C', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>FREE TRIAL</div>
              <div style={{ color: '#8FBFC9', fontSize: 11 }}>{trialDays} days remaining</div>
            </div>
          ) : (
            <div style={{ background: 'rgba(21,108,125,0.3)', border: '1px solid rgba(21,108,125,0.5)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>ACTIVE</div>
              <div style={{ color: '#8FBFC9', fontSize: 11, textTransform: 'capitalize' }}>{tier} plan</div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
