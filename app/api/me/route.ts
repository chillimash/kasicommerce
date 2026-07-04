import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

function toDisplayName(email: string) {
  return email.split('@')[0].replace(/[^a-zA-Z0-9]+/g, ' ').trim() || 'Business Owner'
}

function makePhone(email: string) {
  let hash = 0
  for (let index = 0; index < email.length; index += 1) {
    hash = (hash << 5) - hash + email.charCodeAt(index)
    hash |= 0
  }
  const digits = Math.abs(hash).toString().slice(0, 9).padStart(9, '0')
  return `+27${digits}`
}

async function getOrCreateBusiness(email: string) {
  const ownerName = toDisplayName(email)
  const businessName = `${ownerName}'s Business`
  const phone = makePhone(email)

  const { data: existingBusiness } = await adminClient
    .from('businesses')
    .select('*')
    .ilike('owner_name', `%${ownerName}%`)
    .limit(1)
    .maybeSingle()

  if (existingBusiness) {
    return existingBusiness
  }

  const { data: createdBusiness, error } = await adminClient
    .from('businesses')
    .insert({
      owner_name: ownerName,
      business_name: businessName,
      phone,
      language: 'en',
      business_type: 'Retail',
      tier: 'free',
      status: 'trial',
    })
    .select('*')
    .single()

  if (error || !createdBusiness) {
    throw new Error(error?.message || 'Unable to create business profile')
  }

  return createdBusiness
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase()
    const section = request.nextUrl.searchParams.get('section') || 'dashboard'

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const business = await getOrCreateBusiness(email)

    if (section === 'dashboard') {
      const { data: transactions } = await adminClient
        .from('transactions')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(6)

      const { data: filings } = await adminClient
        .from('compliance_filings')
        .select('*')
        .eq('business_id', business.id)
        .order('due_date', { ascending: true })
        .limit(6)

      const { data: products } = await adminClient
        .from('store_products')
        .select('*')
        .eq('business_id', business.id)

      const { data: applications } = await adminClient
        .from('credit_applications')
        .select('*')
        .eq('business_id', business.id)

      const income = transactions?.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0) || 0
      const expenses = transactions?.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0) || 0
      const net = income - expenses

      return NextResponse.json({
        business,
        stats: {
          income,
          expenses,
          net,
          activeClients: products?.length ? products.length : 0,
          productCount: products?.length || 0,
          filingCount: filings?.length || 0,
          creditCount: applications?.length || 0,
        },
        recentTransactions: transactions || [],
        filings: filings || [],
        products: products || [],
        applications: applications || [],
      })
    }

    if (section === 'books') {
      const { data: transactions } = await adminClient
        .from('transactions')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      const income = transactions?.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0) || 0
      const expenses = transactions?.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0) || 0

      return NextResponse.json({ business, transactions: transactions || [], income, expenses, net: income - expenses })
    }

    if (section === 'comply') {
      const { data: taxRegistrations } = await adminClient
        .from('tax_registrations')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const { data: complianceEvents } = await adminClient
        .from('compliance_events')
        .select('*')
        .eq('business_id', business.id)
        .order('due_date', { ascending: true })
        .limit(8)

      const { data: assessments } = await adminClient
        .from('tax_assessments')
        .select('*')
        .eq('business_id', business.id)
        .order('period_end', { ascending: false })
        .limit(3)

      return NextResponse.json({ business, taxRegistrations: taxRegistrations || [], complianceEvents: complianceEvents || [], assessments: assessments || [] })
    }

    if (section === 'store') {
      const { data: products } = await adminClient
        .from('store_products')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      return NextResponse.json({ business, products: products || [] })
    }

    if (section === 'credit') {
      const { data: applications } = await adminClient
        .from('credit_applications')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      const { data: transactions } = await adminClient
        .from('transactions')
        .select('*')
        .eq('business_id', business.id)
        .eq('type', 'income')

      const annualIncome = (transactions || []).reduce((sum, tx) => sum + Number(tx.amount), 0)

      return NextResponse.json({ business, applications: applications || [], annualIncome })
    }

    return NextResponse.json({ business })
  } catch (error) {
    console.error('me route failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
