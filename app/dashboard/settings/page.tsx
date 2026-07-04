'use client'
import { TopBar } from '@/components/TopBar'
export default function SettingsPage() {
  return (
    <div>
      <TopBar title="Settings" subtitle="Manage your account, subscription, and integrations" />
      <div style={{ padding:'24px 28px', maxWidth:700 }}>
        {[
          { section:'Business Profile', fields:['Business Name','Owner Name','Phone Number','Business Type','Language'] },
          { section:'Subscription', fields:['Current Plan: Free Trial (28 days remaining)','Upgrade to KasiBooks — R149/month','Upgrade to Full Suite — R499/month'] },
          { section:'WhatsApp Bot', fields:['WhatsApp Number: +27 XX XXX XXXX','Bot Status: Active','Language: English'] },
        ].map(s=>(
          <div key={s.section} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'20px', marginBottom:16 }}>
            <div style={{ fontWeight:600, fontSize:14, color:'#2D2926', marginBottom:14, paddingBottom:10, borderBottom:'1px solid #F3F4F6' }}>{s.section}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {s.fields.map(f=>(
                <div key={f} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, color:'#4A5568' }}>{f}</span>
                  <button style={{ fontSize:12, color:'#156C7D', fontWeight:500, background:'none', border:'none', cursor:'pointer' }}>Edit</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
