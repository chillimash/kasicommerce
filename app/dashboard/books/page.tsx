import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

export const revalidate = 60 // cache the storefront for a minute

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  in_stock: boolean
  category: string | null
}

async function getStore(businessId: string) {
  const [{ data: business }, { data: products }] = await Promise.all([
    supabase
      .from('public_store_profiles')
      .select('id, business_name, business_type, phone')
      .eq('id', businessId)
      .single(),
    supabase
      .from('public_store_products')
      .select('id, name, description, price, image_url, in_stock, category')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false }),
  ])

  return { business, products: (products || []) as Product[] }
}

export default async function PublicStorePage({
  params,
}: {
  params: Promise<{ businessId: string }>
}) {
  const { businessId } = await params
  const { business, products } = await getStore(businessId)

  if (!business) notFound()

  const waNumber = (business.phone || '').replace(/[^0-9]/g, '')

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F2' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#1F5C6B,#156C7D)',
          color: '#fff',
          padding: '32px 20px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
          {business.business_name}
        </div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>{business.business_type}</div>
      </div>

      <div style={{ maxWidth: 640, margin: '-20px auto 0', padding: '0 16px 48px' }}>
        {products.length === 0 ? (
          <div
            style={{
              background: '#fff',
              border: '2px dashed #E2E8F0',
              borderRadius: 14,
              padding: '48px 24px',
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            <ShoppingBag size={28} color="#A0AEC0" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600, fontSize: 15, color: '#2D2926' }}>
              No products listed yet
            </div>
            <div style={{ fontSize: 13, color: '#718096', marginTop: 6 }}>
              Check back soon — {business.business_name} is still setting up their store.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 14,
              marginTop: 20,
            }}
          >
            {products.map((p) => {
              const message = encodeURIComponent(
                `Hi! I'd like to order: ${p.name} (R${Number(p.price).toFixed(2)})`
              )
              const orderLink = waNumber ? `https://wa.me/${waNumber}?text=${message}` : undefined

              return (
                <div
                  key={p.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    overflow: 'hidden',
                    opacity: p.in_stock ? 1 : 0.55,
                  }}
                >
                  <div
                    style={{
                      height: 140,
                      background: p.image_url ? `url(${p.image_url}) center/cover` : '#EDE9E4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {!p.image_url && <ShoppingBag size={28} color="#C9C2B8" />}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926', marginBottom: 4 }}>
                      {p.name}
                    </div>
                    {p.description && (
                      <div style={{ fontSize: 12, color: '#718096', marginBottom: 8 }}>
                        {p.description}
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 8,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#156C7D' }}>
                        R{Number(p.price).toFixed(2)}
                      </div>
                      {!p.in_stock ? (
                        <span style={{ fontSize: 11, color: '#C45C2E', fontWeight: 600 }}>
                          Out of stock
                        </span>
                      ) : orderLink ? (
                        <a
                          href={orderLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#C45C2E',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '8px 14px',
                            borderRadius: 8,
                            textDecoration: 'none',
                          }}
                        >
                          Order via WhatsApp
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: '#A0AEC0', marginTop: 32 }}>
          Powered by KasiCommerce
        </div>
      </div>
    </div>
  )
}
