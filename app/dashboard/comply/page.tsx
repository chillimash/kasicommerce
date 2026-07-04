'use client'
import { TopBar } from '@/components/TopBar'
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const filings = [
  { type:'PAYE', period:'Jun 2026', due:'7 Jul 2026',  status:'pending', amount:'R 840' },
  { type:'UIF',  period:'Jun 2026', due:'7 Jul 2026',  status:'pending', amount:'R 120' },
  { type:'PAYE', period:'May 2026', due:'7 Jun 2026',  status:'paid',    amount:'R 780' },
  { type:'VAT',  period:'Q2 2026',  due:'25 Jul 2026', status:'upcoming',amount:'Calculating...' },
]

export default function ComplyPage() {
  return (
    <div>
      <TopBar title="KasiComply" subtitle="Stay ahead of SARS — never miss a filing deadline" />
      <div style={{ padding:'24px 28px', maxWidth:1000 }}>
        <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:10, padding:'14px 18px', marginBottom:24, display:'flex', alignItems:'center', gap:10 }}>
          <AlertTriangle size={16} color="#92400E" />
          <span style={{ fontSize:13, color:'#92400E', fontWeight:500 }}>PAYE and UIF for June 2026 are due on 7 July. Set up auto-submit to avoid penalties.</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'Filings This Year', value:'3',      icon:FileText,    color:'#156C7D', bg:'#E8F4F7' },
            { label:'Total Paid',        value:'R 1,560',icon:CheckCircle, color:'#059669', bg:'#D1FAE5' },
            { label:'Upcoming',          value:'3',      icon:Clock,       color:'#C45C2E', bg:'#FDF0EA' },
          ].map(s => (
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
        <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #E2E8F0', fontWeight:600, fontSize:14, color:'#2D2926' }}>Filing Schedule</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#F8FAFB' }}>
                {['Type','Period','Due Date','Amount','Status','Action'].map(h=>(
                  <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:11, fontWeight:600, color:'#718096', letterSpacing:'0.05em', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filings.map((f,i) => {
                const stMap: Record<string,{bg:string;color:string;label:string}> = {
                  pending:  {bg:'#FEF3C7',color:'#92400E',label:'Due Soon'},
                  paid:     {bg:'#D1FAE5',color:'#059669',label:'Paid'},
                  upcoming: {bg:'#E8F4F7',color:'#156C7D',label:'Upcoming'},
                }
                const st = stMap[f.status] || {bg:'#F3F4F6',color:'#6B7280',label:f.status}
                return (
                  <tr key={i} style={{ borderTop:'1px solid #F3F4F6' }}>
                    <td style={{ padding:'13px 20px', fontWeight:600, fontSize:13, color:'#2D2926' }}>{f.type}</td>
                    <td style={{ padding:'13px 20px', fontSize:13, color:'#4A5568' }}>{f.period}</td>
                    <td style={{ padding:'13px 20px', fontSize:13, color:'#4A5568' }}>{f.due}</td>
                    <td style={{ padding:'13px 20px', fontSize:13, fontWeight:600, color:'#2D2926' }}>{f.amount}</td>
                    <td style={{ padding:'13px 20px' }}>
                      <span style={{ background:st.bg, color:st.color, fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:4 }}>{st.label}</span>
                    </td>
                    <td style={{ padding:'13px 20px' }}>
                      {f.status==='pending' && <button style={{ background:'#156C7D', color:'#fff', border:'none', borderRadius:6, padding:'6px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>Submit</button>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
