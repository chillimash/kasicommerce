import { supabase } from '@/lib/supabase'

export type TransactionCompliance = {
  tax_category: 'turnover' | 'deductible_expense'
}

/**
 * Stores a transaction from any capture channel and returns the compliance
 * classification used by the WhatsApp confirmation message.
 */
export async function saveTransactionWithCompliance(
  businessId: string,
  type: 'income' | 'expense',
  amount: number,
  description: string,
  source: 'whatsapp' | 'dashboard' | 'import'
): Promise<{ compliance: TransactionCompliance }> {
  const tax_category = type === 'income' ? 'turnover' : 'deductible_expense'

  const { error } = await supabase.from('transactions').insert({
    business_id: businessId,
    type,
    amount,
    description,
    category: tax_category,
    source,
  })

  if (error) {
    throw new Error(`Could not save transaction: ${error.message}`)
  }

  return { compliance: { tax_category } }
}
