import { redirect } from 'next/navigation'
import { getAuthenticatedBusiness, getBusinessData, summariseTransactions } from '@/lib/get-business'
import { TopBar } from '@/components/TopBar'
import { BooksClient } from './BooksClient'

export default async function BooksPage() {
  const { user, business } = await getAuthenticatedBusiness()
  if (!user || !business) redirect('/login')

  const data    = await getBusinessData(business.id)
  const summary = summariseTransactions(data.transactions)

  return (
    <div>
      <TopBar title="KasiBooks" subtitle="Track every rand that comes in and goes out" />
      <BooksClient
        businessId={business.id}
        transactions={data.transactions}
        totalIncome={summary.totalIncome}
        totalExpenses={summary.totalExpenses}
        netProfit={summary.netProfit}
      />
    </div>
  )
}
