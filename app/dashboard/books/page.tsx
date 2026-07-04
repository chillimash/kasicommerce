'use client'
import { useState } from 'react'
import { TopBar } from '@/components/TopBar'
import { Plus, TrendingUp, TrendingDown, Search, Filter, Download } from 'lucide-react'

const mockTx = [
  { id:1, date:'2026-06-30', desc:'Sold chickens',  type:'income',  amount:450,   cat:'Sales',    src:'WhatsApp' },
  { id:2, date:'2026-06-30', desc:'Cooking oil',    type:'expense', amount:84,    cat:'Stock',    src:'Dashboard' },
  { id:3, date:'2026-06-29', desc:'Bread sales',    type:'income',  amount:320,   cat:'Sales',    src:'WhatsApp' },
  { id:4, date:'2026-06-29', desc:'Airtime stock',  type:'expense', amount:500,   cat:'Stock',    src:'WhatsApp' },
  { id:5, date:'2026-06-28', desc:'Catering order', type:'income',  amount:1200,  cat:'Catering', src:'Dashboard' },
  { id:6, date:'2026-06-28', desc:'Gas cylinder',   type:'expense', amount:280,   cat:'Utilities',src:'Dashboard' },
]

export default function BooksPage() {
  const [showForm, setShowForm] = useState(false)
  const [txType, setTxType] = useState<'income'|'expense'>('income')
  const [filter, setFilter] = useState<'all'|'income'|'expense'>('all')

  const filtered = mockTx.filter(t => filter === 'all' || t.type === filter)
  const income  = mockTx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const expense = mockTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)

  return (
    <div>
      <TopBar title="KasiBooks" subtitle="Track every rand that comes in and goes out" />
      <div style={{ padding: '24px 28px', maxWidth: 1100 }}>

        {/* Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'Total Income',   value:`R ${income.toLocaleString()}`,   color:'#059669', bg:'#D1FAE5', icon: TrendingUp },
            { label:'Total Expenses', value:`R ${expense.toLocaleString()}`,  color:'#DC2626', bg:'#FEE2E2', icon: TrendingDown },
            { label:'Net Balance',    value:`R ${(income-expense).toLocaleString()}`, color:'#156C7D', bg:'#E8F4F7', icon: TrendingUp },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'18px 20px',
              display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:12, color:'#718096', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color:'#2D2926' }}>{s.value}</div>
                <div style={{ fontSize:11, color:'#718096', marginTop:3 }}>June 2026</div>
              </div>
              <div style={{ width:42, height:42, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #E2E8F0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', gap:6 }}>
              {(['all','income','expense'] as const).map(f => (
                <button key={f} onClick={()=>setFilter(f)} style={{
                  padding:'6px 14px', borderRadius:7, border:'1px solid',
                  borderColor: filter===f ? '#156C7D' : '#E2E8F0',
                  background: filter===f ? '#E8F4F7' : '#fff',
                  color: filter===f ? '#156C7D' : '#718096',
                  fontSize:12, fontWeight:filter===f?600:400, cursor:'pointer',
                  textTransform:'capitalize'
                }}>{f}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:7,
                border:'1px solid #E2E8F0', background:'#fff', fontSize:12, color:'#4A5568', cursor:'pointer' }}>
                <Download size={13} /> Export
              </button>
              <button onClick={()=>setShowForm(true)} style={{
                display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:7,
                background:'#156C7D', border:'none', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer'
              }}>
                <Plus size={13} /> Log Transaction
              </button>
            </div>
          </div>

          {/* Table */}
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#F8FAFB' }}>
                {['Date','Description','Category','Source','Amount'].map(h => (
                  <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:11, fontWeight:600, color:'#718096', letterSpacing:'0.05em', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t,i) => (
                <tr key={t.id} style={{ borderTop:'1px solid #F3F4F6' }}>
                  <td style={{ padding:'13px 20px', fontSize:12, color:'#718096' }}>{t.date}</td>
                  <td style={{ padding:'13px 20px', fontSize:13, fontWeight:500, color:'#2D2926' }}>{t.desc}</td>
                  <td style={{ padding:'13px 20px' }}>
                    <span style={{ background:'#F3F4F6', color:'#4A5568', fontSize:11, fontWeight:500, padding:'3px 8px', borderRadius:4 }}>{t.cat}</span>
                  </td>
                  <td style={{ padding:'13px 20px', fontSize:12, color:'#718096' }}>{t.src}</td>
                  <td style={{ padding:'13px 20px', fontSize:14, fontWeight:600, color: t.type==='income'?'#059669':'#DC2626' }}>
                    {t.type==='income'?'+':'-'}R{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Log form modal */}
        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
            <div style={{ background:'#fff', borderRadius:16, padding:28, width:420, boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
              <h3 style={{ margin:'0 0 20px', fontSize:16, fontWeight:700, color:'#2D2926' }}>Log Transaction</h3>
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                {(['income','expense'] as const).map(t => (
                  <button key={t} onClick={()=>setTxType(t)} style={{
                    flex:1, padding:'10px', borderRadius:8, border:'2px solid',
                    borderColor: txType===t ? (t==='income'?'#059669':'#DC2626') : '#E2E8F0',
                    background: txType===t ? (t==='income'?'#D1FAE5':'#FEE2E2') : '#fff',
                    color: txType===t ? (t==='income'?'#059669':'#DC2626') : '#718096',
                    fontSize:13, fontWeight:600, cursor:'pointer', textTransform:'capitalize'
                  }}>{t==='income'?'💚':'🔴'} {t}</button>
                ))}
              </div>
              {[{label:'Amount (R)',ph:'e.g. 150'},{label:'Description',ph:'What was it for?'},{label:'Category',ph:'Sales, Stock, etc'}].map(f => (
                <div key={f.label} style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#2D2926', marginBottom:5 }}>{f.label}</label>
                  <input placeholder={f.ph} style={{
                    width:'100%', padding:'9px 12px', borderRadius:7,
                    border:'1px solid #E2E8F0', fontSize:13, outline:'none', boxSizing:'border-box'
                  }} />
                </div>
              ))}
              <div style={{ display:'flex', gap:10, marginTop:20 }}>
                <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:'10px', borderRadius:7, border:'1px solid #E2E8F0', background:'#fff', fontSize:13, cursor:'pointer' }}>Cancel</button>
                <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:'10px', borderRadius:7, border:'none', background:'#156C7D', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
