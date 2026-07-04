import { redirect } from 'next/navigation'
import { getAuthenticatedBusiness, getBusinessData, summariseTransactions } from '@/lib/get-business'
import { TopBar } from '@/components/TopBar'
import { ComplyClient } from './ComplyClient'

export default async function ComplyPage() {
  const { user, business } = await getAuthenticatedBusiness()
  if (!user || !business) redirect('/login')

  const data    = await getBusinessData(business.id)
  const summary = summariseTransactions(data.transactions)
  const taxReg  = data.taxReg

  const profile = {
    annualTurnover: taxReg?.annual_turnover_est ?? summary.annualRevenue,
    monthlyRevenue: summary.monthIncome,
    monthlyExpenses: summary.monthExpenses,
    hasVAT:          taxReg?.has_vat          ?? false,
    hasPAYE:         taxReg?.has_paye         ?? false,
    onTurnoverTax:   taxReg?.on_turnover_tax  ?? true,
    employeeCount:   taxReg?.employee_count   ?? 0,
    monthlyPayroll:  data.employees.reduce((s, e) => s + e.monthly_salary, 0),
  }

  return (
    <div>
      <TopBar title="KasiComply" subtitle="Stay ahead of SARS — your personalised compliance centre" />
      <ComplyClient profile={profile} businessId={business.id} complianceEvents={data.events} />
    </div>
  )
}