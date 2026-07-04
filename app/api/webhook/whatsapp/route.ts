import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsApp, getMessage, BotState } from '@/lib/whatsapp'
import twilio from 'twilio'

async function getOrCreateSession(phone: string) {
  const { data } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('phone', phone)
    .single()
  if (data) return data
  const { data: newSession } = await supabase
    .from('whatsapp_sessions')
    .insert({ phone, state: 'WELCOME', context: {}, last_message_at: new Date().toISOString() })
    .select()
    .single()
  return newSession
}

// async function updateSession(phone: string, state: BotState, context: Record<string, unknown>) {
//   await supabase.from('whatsapp_sessions')
//     .upsert({ phone, state, context, last_message_at: new Date().toISOString() })
// }
async function updateSession(phone: string, state: BotState, context: Record<string, unknown>) {
  await supabase.from('whatsapp_sessions')
    .update({ state, context, last_message_at: new Date().toISOString() })
    .eq('phone', phone)
}

async function processMessage(phone: string, body: string): Promise<string> {
  const session = await getOrCreateSession(phone)
  const state   = (session?.state || 'WELCOME') as BotState
  const ctx     = (session?.context || {}) as Record<string, unknown>
  const lang    = (ctx.lang as string) || 'en'
  const input   = body.trim()
  const upper   = input.toUpperCase()

  if (upper === 'MENU' || upper === '0') {
    await updateSession(phone, 'MAIN_MENU', ctx)
    return getMessage('MAIN_MENU', lang)
  }

  switch (state) {
    case 'WELCOME':
    case 'AWAIT_LANGUAGE': {
      const langMap: Record<string, string> = { '1': 'en', '2': 'zu', '3': 'xh', '4': 'st', '5': 'af' }
      const chosen = langMap[input] || 'en'
      await updateSession(phone, 'AWAIT_NAME', { ...ctx, lang: chosen })
      return getMessage('AWAIT_NAME', chosen)
    }
    case 'AWAIT_NAME': {
      await updateSession(phone, 'AWAIT_BUSINESS_NAME', { ...ctx, owner_name: input })
      return getMessage('AWAIT_BIZ_NAME', lang)
    }
    case 'AWAIT_BUSINESS_NAME': {
      await updateSession(phone, 'AWAIT_BUSINESS_TYPE', { ...ctx, business_name: input })
      return getMessage('AWAIT_BIZ_TYPE', lang)
    }
    case 'AWAIT_BUSINESS_TYPE': {
      const typeMap: Record<string, string> = {
        '1': 'Spaza / General dealer','2': 'Hair & Beauty','3': 'Food & Catering',
        '4': 'Clothing & Textiles','5': 'Services','6': 'Other'
      }
      const bizType = typeMap[input] || 'Other'
      await supabase.from('businesses').insert({
        owner_name: ctx.owner_name as string,
        business_name: ctx.business_name as string,
        phone, language: lang as 'en'|'zu'|'xh'|'st'|'af',
        business_type: bizType, tier: 'free', status: 'trial',
        trial_ends_at: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      })
      const { data: biz } = await supabase.from('businesses').select('id').eq('phone', phone).single()
      await updateSession(phone, 'MAIN_MENU', { ...ctx, business_type: bizType, business_id: biz?.id })
      return `Welcome to KasiCommerce, ${ctx.owner_name}! Your 30-day free trial has started.\n\n` + getMessage('MAIN_MENU', lang)
    }
    case 'MAIN_MENU': {
      if (input === '1') { await updateSession(phone, 'BOOKS_LOG_TYPE', ctx); return getMessage('LOG_TYPE', lang) }
      if (input === '2') { await updateSession(phone, 'COMPLY_MENU', ctx);    return getMessage('COMPLY_MENU', lang) }
      if (input === '3') { await updateSession(phone, 'STORE_MENU', ctx);     return getMessage('STORE_MENU', lang) }
      if (input === '4') { await updateSession(phone, 'CREDIT_MENU', ctx);    return getMessage('CREDIT_MENU', lang) }
      if (input === '5') {
        const { data: txns } = await supabase.from('transactions').select('type, amount').eq('business_id', ctx.business_id as string)
        const income  = txns?.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)||0
        const expense = txns?.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)||0
        return `📈 *Your Summary*\n\n💚 Income: R${income.toFixed(2)}\n🔴 Expenses: R${expense.toFixed(2)}\n\n💰 *Net: R${(income-expense).toFixed(2)}*\n\nType *MENU* for options.`
      }
      return getMessage('UNKNOWN', lang)
    }
    case 'BOOKS_LOG_TYPE': {
      const t = {'1':'income','2':'expense'}[input]
      if (!t) return getMessage('UNKNOWN', lang)
      await updateSession(phone, 'BOOKS_LOG_AMOUNT', { ...ctx, tx_type: t })
      return getMessage('LOG_AMOUNT', lang)
    }
    case 'BOOKS_LOG_AMOUNT': {
      const amount = parseFloat(input.replace(/[^0-9.]/g,''))
      if (isNaN(amount)||amount<=0) return 'Please enter a valid amount (e.g. 150)'
      await updateSession(phone, 'BOOKS_LOG_DESC', { ...ctx, tx_amount: amount })
      return getMessage('LOG_DESC', lang)
    }
    case 'BOOKS_LOG_DESC': {
      const amount = ctx.tx_amount as number
      const txType = ctx.tx_type as string
      const txLabel = txType === 'income' ? 'Income' : 'Expense'
      const confirm = `Got it!\n\n${txLabel}: R${amount}\nFor: ${input}\n\nReply YES to save or NO to cancel.`
      await updateSession(phone, 'BOOKS_CONFIRM', { ...ctx, tx_desc: input })
      return confirm
    }
    case 'BOOKS_CONFIRM': {
      if (upper==='YES'||input==='1') {
        await supabase.from('transactions').insert({
          business_id: ctx.business_id as string,
          type: ctx.tx_type as 'income'|'expense',
          amount: ctx.tx_amount as number,
          description: ctx.tx_desc as string,
          category: 'uncategorised', source: 'whatsapp',
        })
        await updateSession(phone,'MAIN_MENU',{...ctx,tx_type:undefined,tx_amount:undefined,tx_desc:undefined})
        return getMessage('LOG_SAVED',lang)
      }
      await updateSession(phone,'MAIN_MENU',ctx)
      return getMessage('LOG_CANCEL',lang)
    }
    case 'COMPLY_MENU': {
      if (input==='4') return `📅 *Upcoming Deadlines*\n\n• PAYE: 7th of every month\n• VAT: 25th of end of period\n• UIF: 7th of every month\n\nType *MENU* to go back.`
      return `This feature is coming soon.\n\nType *MENU* to go back.`
    }
    case 'STORE_MENU': {
      if (input==='3') {
        const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store/${ctx.business_id}`
        return `Your store link:\n\n${storeUrl}\n\nShare this with your customers!\n\nType *MENU* to go back.`
      }
      return `KasiStore features coming soon!\n\nType *MENU* to go back.`
    }
    case 'CREDIT_MENU': {
      if (input==='1') {
        const { data: txns } = await supabase.from('transactions').select('amount,type').eq('business_id', ctx.business_id as string)
        const income = txns?.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)||0
        if (income<1000) return `Keep recording your income for at least 30 days and we will check your eligibility.\n\nType *MENU* to go back.`
        const maxLoan = Math.min(income*3,50000)
        return `Good news! Based on your records, you may qualify for up to *R${maxLoan.toFixed(0)}*.\n\nReply *2* to start your application.`
      }
      return `Our lending partners will contact you within 24 hours.\n\nType *MENU* to go back.`
    }
    default:
      await updateSession(phone,'MAIN_MENU',ctx)
      return getMessage('MAIN_MENU',lang)
  }
}

export async function POST(req: NextRequest) {
  const body    = await req.text()
  const params  = new URLSearchParams(body)
  const from    = params.get('From')?.replace('whatsapp:','') || ''
  const message = params.get('Body') || ''
  if (!from||!message) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  try {
    const reply = await processMessage(from, message)
    await sendWhatsApp(from, reply)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'KasiCommerce WhatsApp webhook active' })
}
