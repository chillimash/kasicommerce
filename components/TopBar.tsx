'use client'
import { Bell, Search, User } from 'lucide-react'

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header style={{
      height: 64, background: '#fff',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex', alignItems: 'center',
      padding: '0 28px', gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#2D2926' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>{subtitle}</div>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#F8FAFB', border: '1px solid #E2E8F0',
        borderRadius: 8, padding: '6px 12px', width: 220
      }}>
        <Search size={14} color="#718096" />
        <input
          placeholder="Search transactions..."
          style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#2D2926', width: '100%' }}
        />
      </div>
      <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
        <Bell size={18} color="#4A5568" />
        <span style={{
          position: 'absolute', top: 6, right: 6,
          width: 8, height: 8, borderRadius: '50%', background: '#C45C2E'
        }} />
      </button>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: '#156C7D', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer'
      }}>
        <User size={16} color="#fff" />
      </div>
    </header>
  )
}
