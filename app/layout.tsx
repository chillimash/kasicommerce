import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KasiCommerce — Business OS for Township Entrepreneurs',
  description: 'KasiBooks, KasiComply, KasiStore and KasiCredit — all in one platform.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
