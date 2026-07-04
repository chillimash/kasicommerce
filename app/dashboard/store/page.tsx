'use client'
import { TopBar } from '@/components/TopBar'
import { Plus, Share2, Eye, Package, ShoppingBag } from 'lucide-react'
export default function StorePage() {
  return (
    <div>
      <TopBar title="KasiStore" subtitle="Your mobile storefront — share your link on WhatsApp" />
      <div style={{ padding:'24px 28px', maxWidth:1000 }}>
        <div style={{ background:'linear-gradient(135deg,#1F5C6B,#156C7D)', borderRadius:14, padding:'28px', marginBottom:24, color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:13, opacity:0.8, marginBottom:6 }}>Your Store Link</div>
            <div style={{ fontFamily:'monospace', fontSize:14, background:'rgba(255,255,255,0.15)', padding:'8px 14px', borderRadius:7, marginBottom:14 }}>kasicommerce.co.za/store/abc123</div>
            <div style={{ fontSize:12, opacity:0.7 }}>Share this with customers — they can browse and order via WhatsApp</div>
          </div>
          <button style={{ display:'flex', alignItems:'center', gap:8, background:'#C45C2E', border:'none', color:'#fff', padding:'12px 20px', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer' }}>
            <Share2 size={14} /> Share Link
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'Products Listed', value:'0', icon:Package,     color:'#156C7D', bg:'#E8F4F7' },
            { label:'Store Views',     value:'0', icon:Eye,         color:'#7C3AED', bg:'#EDE9FE' },
            { label:'Orders Received', value:'0', icon:ShoppingBag, color:'#C45C2E', bg:'#FDF0EA' },
          ].map(s=>(
            <div key={s.label} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'18px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:12, color:'#718096', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:26, fontWeight:700, color:'#2D2926' }}>{s.value}</div>
              </div>
              <div style={{ width:42, height:42, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:'#fff', border:'2px dashed #E2E8F0', borderRadius:12, padding:'48px', textAlign:'center' }}>
          <div style={{ fontWeight:600, fontSize:15, color:'#2D2926', marginBottom:6 }}>No products yet</div>
          <div style={{ fontSize:13, color:'#718096', marginBottom:20 }}>Add your first product and start selling via WhatsApp</div>
          <button style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#156C7D', color:'#fff', border:'none', padding:'10px 20px', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer' }}>
            <Plus size={14} /> Add Your First Product
          </button>
        </div>
      </div>
    </div>
  )
}
