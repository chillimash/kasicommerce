import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight:'100vh', background:'#1F5C6B', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ textAlign:'center', maxWidth:540 }}>
        <div style={{ width:56, height:56, borderRadius:14, background:'#C45C2E', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:24 }}>⚡</div>
        <h1 style={{ color:'#fff', fontSize:38, fontWeight:800, margin:'0 0 10px', lineHeight:1.1 }}>KasiCommerce</h1>
        <p style={{ color:'#8FBFC9', fontSize:16, margin:'0 0 32px', lineHeight:1.6 }}>
          The all-in-one business operating system for South African township and micro-entrepreneurs.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/dashboard" style={{ background:'#C45C2E', color:'#fff', padding:'13px 28px', borderRadius:9, fontWeight:700, fontSize:14, textDecoration:'none' }}>
            Open Dashboard
          </Link>
          <a href="https://wa.me/27000000000" style={{ background:'rgba(255,255,255,0.1)', color:'#fff', padding:'13px 28px', borderRadius:9, fontWeight:600, fontSize:14, textDecoration:'none', border:'1px solid rgba(255,255,255,0.2)' }}>
            WhatsApp Bot
          </a>
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:24, marginTop:40 }}>
          {['KasiBooks','KasiComply','KasiStore','KasiCredit'].map(p => (
            <div key={p} style={{ color:'#8FBFC9', fontSize:12, fontWeight:500 }}>✓ {p}</div>
          ))}
        </div>
      </div>
    </main>
  )
}
