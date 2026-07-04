'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { TopBar } from '@/components/TopBar'
import { CheckCircle } from 'lucide-react'
export default function CreditPage() {
  const { user } = useAuth()
  const [income, setIncome] = useState(0)

  useEffect(() => {
    if (!user?.email) return

    const loadData = async () => {
      const response = await fetch(`/api/me?email=${encodeURIComponent(user.email!)}&section=credit`)
      const json = await response.json()
      setIncome(Number(json?.annualIncome || 0))
    }

    void loadData()
  }, [user?.email])
  return (
    <div>
      <TopBar title="KasiCredit" subtitle="Business loans from R1,000 to R50,000 via partner lenders" />
      <div style={{ padding:'24px 28px', maxWidth:800 }}>
        <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:14, padding:'32px', marginBottom:20, textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <CheckCircle size={28} color="#059669" />
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:'#2D2926', marginBottom:8 }}>You may qualify for a loan!</div>
          <div style={{ fontSize:14, color:'#718096', maxWidth:420, margin:'0 auto 24px' }}>
            Based on R{income.toLocaleString()} in recorded income, you may qualify for up to R{Math.min(income*3,50000).toLocaleString()}.
          </div>
          <button style={{ background:'#059669', color:'#fff', border:'none', padding:'12px 28px', borderRadius:9, fontWeight:700, fontSize:14, cursor:'pointer' }}>
            Apply Now — Free and No Obligation
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {[
            { label:'No collateral needed', desc:'Your transaction history is your credit score' },
            { label:'Fast decisions',        desc:'Lending partner responds within 24 hours' },
            { label:'Flexible repayment',   desc:'Repay over 3 to 12 months' },
          ].map(f => (
            <div key={f.label} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'18px' }}>
              <CheckCircle size={16} color="#059669" style={{ marginBottom:8 }} />
              <div style={{ fontWeight:600, fontSize:13, color:'#2D2926', marginBottom:4 }}>{f.label}</div>
              <div style={{ fontSize:12, color:'#718096' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
