import { createClient } from './supabase-server'

export type BusinessProfile = {
  id: string
  owner_name: string
  business_name: string
  phone: string
  language: string
  business_type: string
  tier: string
  status: string
  trial_ends_at: string | null
}

export type Transaction = {
  id: string
  created_at: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  source: string
}

export type TaxRegistration = {
  id: string
  has_paye: boolean
  has_vat: boolean
  on_turnover_tax: boolean
  annual_turnover_est: number | null
  employee_count: number
}

export type ComplianceEvent = {
  id: string
  event_type: string
  period_label: string
  due_date: string
  amount_due: number | null
  status: string
}

export type Employee = {
  id: string
  full_name: string
  monthly_salary: number
  start_date: string
  status: string
}

export type StoreProduct = {
  id: string
  name: string
  description: string | null
  price: number
  in_stock: boolean
  category: string | null
  image_url: string | null
}

// ─── Core function: get the authenticated user's business ───────────────────
export async function getAuthenticatedBusiness(): Promise<{
  user: { id: string; email?: string; phone?: string } | null
  business: BusinessProfile | null
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return { user: null, business: null }

  // Match on phone — this is the link between WhatsApp and web
  const phone = user.phone || user.user_metadata?.phone || ''
  const email = user.email || ''

  let query = supabase.from('businesses').select('*')

  if (phone) {
    // Normalise: strip whatsapp: prefix, keep digits and +
    const cleanPhone = phone.replace('whatsapp:', '').replace(/\s/g, '')
    query = query.eq('phone', cleanPhone)
  } else if (email) {
    // Fallback: match on email in metadata if phone not set
    query = query.eq('phone', user.user_metadata?.phone || '')
  }

  const { data: business } = await query.single()

  // If no business found, it means they signed up via web but haven't done WhatsApp onboarding
  return { user, business: business || null }
}

// ─── All data for a business ─────────────────────────────────────────────────
export async function getBusinessData(businessId: string) {
  const supabase = await createClient()

  const [transactions, taxReg, events, employees, products, creditApps] = await Promise.all([
    supabase.from('transactions').select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('tax_registrations').select('*')
      .eq('business_id', businessId).single(),
    supabase.from('compliance_events').select('*')
      .eq('business_id', businessId)
      .order('due_date', { ascending: true }),
    supabase.from('employees').select('*')
      .eq('business_id', businessId)
      .eq('status', 'active'),
    supabase.from('store_products').select('*')
      .eq('business_id', businessId),
    supabase.from('credit_applications').select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false }),
  ])

  return {
    transactions:  (transactions.data  || []) as Transaction[],
    taxReg:        taxReg.data          as TaxRegistration | null,
    events:        (events.data         || []) as ComplianceEvent[],
    employees:     (employees.data      || []) as Employee[],
    products:      (products.data       || []) as StoreProduct[],
    creditApps:    creditApps.data      || [],
  }
}

// ─── Derived summaries ────────────────────────────────────────────────────────
export function summariseTransactions(transactions: Transaction[]) {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1) // 1st of this month

  const thisMonth = transactions.filter(t => new Date(t.created_at) >= start)

  const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const monthIncome   = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthExpenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return {
    totalIncome,
    totalExpenses,
    netProfit:     totalIncome - totalExpenses,
    monthIncome,
    monthExpenses,
    monthProfit:   monthIncome - monthExpenses,
    annualRevenue: monthIncome * 12, // projected from this month
    recentTx:      transactions.slice(0, 10),
  }
}

export function trialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
