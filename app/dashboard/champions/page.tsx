'use client'
import { TopBar } from '@/components/TopBar'
import { Users, Plus, Award, TrendingUp } from 'lucide-react'
export default function ChampionsPage() {
  return (
    <div>
      <TopBar title="Kasi Champions" subtitle="Community ambassadors who onboard township businesses" />
      <div style={{ padding:'24px 28px', maxWidth:1000 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'Active Champions',      value:'0',  icon:Users,     color:'#156C7D', bg:'#E8F4F7' },
            { label:'Businesses Onboarded',  value:'0',  icon:TrendingUp,color:'#059669', bg:'#D1FAE5' },
            { label:'Commission Paid',        value:'R0', icon:Award,     color:'#C45C2E', bg:'#FDF0EA' },
          ].map(s=>(
            <div key={s.label} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'18px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:12, color:'#718096', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color:'#2D2926' }}>{s.value}</div>
              </div>
              <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:'#fff', border:'2px dashed #E2E8F0', borderRadius:12, padding:'48px', textAlign:'center' }}>
          <div style={{ fontWeight:600, fontSize:15, color:'#2D2926', marginBottom:6 }}>No champions yet</div>
          <div style={{ fontSize:13, color:'#718096', marginBottom:20 }}>Recruit community members to onboard township businesses. They earn R50 per paying referral.</div>
          <button style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#156C7D', color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer' }}>
            <Plus size={14} /> Add Champion
          </button>
        </div>
      </div>
    </div>
  )
}
