import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getMessage, BotState } from '@/lib/whatsapp'
import { saveTransactionWithCompliance } from '@/lib/compliance-engine'
import { STOKVEL_MESSAGES, generateStokvelCode, getCurrentPeriodLabel, getNextPayoutDate } from '@/lib/stokvel-engine'
import {
  calculateTurnoverTax, qualifiesForTurnoverTax,
  calculateEmployeeCost, calculateVAT,
  generateComplianceCalendar
} from '@/lib/tax-engine'
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

  if (upper === 'MENU') {
    await updateSession(phone, 'MAIN_MENU', ctx)
    return getMessage('MAIN_MENU', lang)
  }

  if (state === 'MAIN_MENU' && input === '0') {
    await updateSession(phone, 'SWITCH_LANGUAGE', ctx)
    return getMessage('WELCOME', lang)
  }

  switch (state) {
    case 'WELCOME':
    case 'AWAIT_LANGUAGE': {
      const langMap: Record<string, string> = {
        '1': 'en', '2': 'zu', '3': 'xh', '4': 'st', '5': 'af', '6': 've'
      }
      const chosen = langMap[input] || 'en'
      await updateSession(phone, 'AWAIT_NAME', { ...ctx, lang: chosen })
      return getMessage('AWAIT_NAME', chosen)
    }
    case 'SWITCH_LANGUAGE': {
      const langMap: Record<string, string> = {
        '1': 'en', '2': 'zu', '3': 'xh', '4': 'st', '5': 'af', '6': 've'
      }
      const chosen = langMap[input]

      if (!chosen) return getMessage('WELCOME', lang)

      await updateSession(phone, 'MAIN_MENU', { ...ctx, lang: chosen })
      return getMessage('MAIN_MENU', chosen)
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
      if (input === '6') { await updateSession(phone, 'STOKVEL_MENU', ctx);   return STOKVEL_MESSAGES.STOKVEL_MENU }
      if (input === '5') {
        let businessId = ctx.business_id as string

        // Auto-heal missing business_id
        if (!businessId) {
          const { data: biz } = await supabase
            .from('businesses').select('id').eq('phone', phone).single()
          businessId = biz?.id
          if (businessId) {
            await updateSession(phone, 'MAIN_MENU', { ...ctx, business_id: businessId })
          }
        }

        if (!businessId) {
          return `No business found for this number.\n\nType *MENU* to go back.`
        }

        const { data: txns, error } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('business_id', businessId)

        if (error) {
          return `Could not load your summary. Please try again.\n\nType *MENU* to go back.`
        }

        if (!txns || txns.length === 0) {
          return `📈 *Your Summary*\n\nNo transactions recorded yet.\n\nReply *1* to log your first entry.\n\nType *MENU* to go back.`
        }

        const income  = txns
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0)

        const expense = txns
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0)

        const net = income - expense

        return `📈 *Your Summary*\n\n💚 Total Income:   R${income.toFixed(2)}\n🔴 Total Expenses: R${expense.toFixed(2)}\n\n💰 *Net Profit: R${net.toFixed(2)}*\n\n📊 ${txns.length} transaction${txns.length !== 1 ? 's' : ''} recorded.\n\nType *MENU* to go back.`
      }
    }
    case 'BOOKS_LOG_TYPE': {
      if (input === '3') {
        await updateSession(phone, 'MAIN_MENU', ctx)
        return getMessage('MAIN_MENU', lang)
      }
      const t = { '1': 'income', '2': 'expense' }[input]
      if (!t) return getMessage('UNKNOWN', lang)
      await updateSession(phone, 'BOOKS_LOG_AMOUNT', { ...ctx, tx_type: t })
      return getMessage('LOG_AMOUNT', lang)
    }
    case 'BOOKS_LOG_AMOUNT': {
      const amount = parseFloat(input.replace(/[^0-9.]/g,''))
      if (isNaN(amount)||amount<=0) return getMessage('BOOKS_INVALID_AMOUNT', lang)
      await updateSession(phone, 'BOOKS_LOG_DESC', { ...ctx, tx_amount: amount })
      return getMessage('LOG_DESC', lang)
    }
    case 'BOOKS_LOG_DESC': {
      const amount = ctx.tx_amount as number
      const txType = ctx.tx_type as string
      const txLabel = getMessage(txType === 'income' ? 'BOOKS_TYPE_INCOME' : 'BOOKS_TYPE_EXPENSE', lang)
      const confirmTemplate = getMessage('BOOKS_CONFIRM_PROMPT', lang)
      const confirm = confirmTemplate
        .replace('{type}', txLabel)
        .replace('{amount}', amount.toFixed(2))
        .replace('{desc}', input)

      await updateSession(phone, 'BOOKS_CONFIRM', { ...ctx, tx_desc: input })
      return confirm
    }
    case 'BOOKS_CONFIRM': {
      if (upper === 'YES' || input === '1') {
        let businessId = ctx.business_id as string
        if (!businessId) {
          const { data: biz } = await supabase
            .from('businesses').select('id').eq('phone', phone).single()
          businessId = biz?.id
        }

        if (!businessId) {
          await updateSession(phone, 'MAIN_MENU', ctx)
          return getMessage('BOOKS_SAVE_FAILED', lang)
        }

        const { compliance } = await saveTransactionWithCompliance(
          businessId,
          ctx.tx_type as 'income' | 'expense',
          ctx.tx_amount as number,
          ctx.tx_desc as string,
          'whatsapp'
        )

        const typeKey = ctx.tx_type === 'income' ? 'BOOKS_TYPE_INCOME' : 'BOOKS_TYPE_EXPENSE'
        const typeLabel = getMessage(typeKey, lang)
        const amount    = (ctx.tx_amount as number).toFixed(2)
        const savedTemplate = getMessage('BOOKS_SAVE_SUCCESS', lang)
        const savedMessage = savedTemplate
          .replace('{type}', typeLabel)
          .replace('{amount}', amount)

        await updateSession(phone, 'BOOKS_LOG_TYPE', {
          ...ctx,
          business_id: businessId,
          tx_type:     undefined,
          tx_amount:   undefined,
          tx_desc:     undefined,
        })

        return `${savedMessage}\n📋 Category: ${compliance.tax_category}`
      }

      // NO or anything else — cancel and show quick options
      await updateSession(phone, 'BOOKS_LOG_TYPE', ctx)
      return getMessage('BOOKS_SAVE_CANCELLED', lang)
    }
    case 'COMPLY_MENU': {
      if (input==='1') { await updateSession(phone,'TT_Q1',ctx); return getMessage('TT_Q1',lang) }
      if (input==='2') { await updateSession(phone,'CALC_Q1',ctx); return getMessage('CALC_Q1',lang) }
      if (input==='3') {
        // Generate compliance calendar from business tax registration
        const { data: taxReg } = await supabase
          .from('tax_registrations').select('*')
          .eq('business_id', ctx.business_id as string).single()
        const { data: txns } = await supabase
          .from('transactions').select('type,amount')
          .eq('business_id', ctx.business_id as string)
        const monthlyIncome = txns?.filter((t:any)=>t.type==='income')
          .reduce((s:number,t:any)=>s+t.amount,0)||0
        const events = generateComplianceCalendar(
          taxReg?.has_paye || false,
          taxReg?.has_vat || false,
          taxReg?.on_turnover_tax || true,
          taxReg?.employee_count ? monthlyIncome/taxReg.employee_count : 0,
          monthlyIncome / Math.max(1, new Date().getMonth())
        )
        const urgent = events.filter(e=>e.urgent||e.overdue).slice(0,3)
        const upcoming = events.filter(e=>!e.urgent&&!e.overdue).slice(0,3)
        let cal = `📅 *Your Compliance Calendar*\n\n`
        if (urgent.length) {
          cal += `🔴 *Urgent / Overdue:*\n`
          urgent.forEach(e=>{
            cal += `• ${e.label}\n  Due: ${e.dueDate.toLocaleDateString('en-ZA')}\n`
            if (e.estimatedAmount) cal += `  Est: R${e.estimatedAmount.toFixed(2)}\n`
          })
          cal += `\n`
        }
        if (upcoming.length) {
          cal += `🟡 *Upcoming:*\n`
          upcoming.forEach(e=>{
            cal += `• ${e.label}\n  Due: ${e.dueDate.toLocaleDateString('en-ZA')}\n`
          })
        }
        cal += `\nType *MENU* to go back.`
        await updateSession(phone,'COMPLY_MENU',ctx)
        return cal
      }
      if (input==='4') { await updateSession(phone,'PAYE_Q1',ctx); return getMessage('PAYE_Q1',lang) }
      if (input==='5') {
        return `📅 *Key Deadlines*\n\n• EMP201 (PAYE/UIF/SDL): 7th of each month\n• VAT201: 25th of every 2nd month\n• Turnover Tax: 28 February annually\n• Provisional Tax 1st: 31 August\n• Provisional Tax 2nd: 28 February\n• EMP501 Reconciliation: 31 May\n\nType *MENU* to go back.`
      }      
      if (input === '6') { await updateSession(phone, 'STOKVEL_MENU', ctx); return STOKVEL_MESSAGES.STOKVEL_MENU }
      return getMessage('COMPLY_MENU',lang)
    }

    // ─── Turnover Tax Qualifier ─────────────────────────────────────
    case 'TT_Q1': {
      const turnover = parseFloat(input.replace(/[^0-9.]/g,''))
      if (isNaN(turnover)||turnover<=0) return `Please enter a valid amount (e.g. 450000 for R450,000)`
      await updateSession(phone,'TT_Q2',{...ctx, tt_turnover: turnover})
      return getMessage('TT_Q2',lang)
    }
    case 'TT_Q2': {
      const multipleBusinesses = input==='2'
      await updateSession(phone,'TT_Q3',{...ctx, tt_multiple_biz: multipleBusinesses})
      return getMessage('TT_Q3',lang)
    }
    case 'TT_Q3': {
      const isPublic = input==='2'
      const turnover = ctx.tt_turnover as number
      const multipleBiz = ctx.tt_multiple_biz as boolean
      const result = qualifiesForTurnoverTax(turnover, multipleBiz?2:1, isPublic, 0)
      // await updateSession(phone,'COMPLY_MENU',{...ctx})
       await updateSession(phone, 'TT_RESULT', { ...ctx })
      if (result.qualifies) {
        const tt = calculateTurnoverTax(turnover)
        const msg = getMessage('TT_QUALIFIES',lang)
          .replace('{amount}', `R${tt.taxDue.toLocaleString('en-ZA',{minimumFractionDigits:2})} per year`)
        // Save to tax_registrations if not exists
        const { data: existing } = await supabase.from('tax_registrations')
          .select('id').eq('business_id', ctx.business_id as string).single()
        if (!existing) {
          await supabase.from('tax_registrations').insert({
            business_id: ctx.business_id as string,
            on_turnover_tax: true,
            annual_turnover_est: turnover,
          })
        }      
        return msg
      } else {
        return getMessage('TT_NOT_QUALIFY',lang).replace('{reason}', result.reason||'Unknown')
      }
    }
    case 'TT_RESULT': {
      if (input === '1') {
        await updateSession(phone, 'COMPLY_MENU', { ...ctx })
        return getMessage('TT_HOW_REGISTER', lang)
      }
      if (input === '2') {
        await updateSession(phone, 'CALC_Q1', { ...ctx })
        return getMessage('CALC_Q1', lang)
      }
      await updateSession(phone, 'MAIN_MENU', { ...ctx })
      return getMessage('MAIN_MENU', lang)
  }
    // ─── Tax Liability Calculator ──────────────────────────────────
    case 'CALC_Q1': {
      const income = parseFloat(input.replace(/[^0-9.]/g,''))
      if (isNaN(income)||income<0) return `Please enter a valid amount (e.g. 12500)`
      await updateSession(phone,'CALC_Q2',{...ctx, calc_income: income})
      return getMessage('CALC_Q2',lang)
    }
    case 'CALC_Q2': {
      const expenses = parseFloat(input.replace(/[^0-9.]/g,''))||0
      const income   = ctx.calc_income as number
      const profit   = Math.max(0, income - expenses)
      const annualProfit   = profit * 12
      const annualIncome   = income * 12
      // Determine tax type
      const { data: taxReg } = await supabase.from('tax_registrations')
        .select('*').eq('business_id', ctx.business_id as string).single()
      let taxDetail = ''
      if (!taxReg || taxReg.on_turnover_tax) {
        const tt = calculateTurnoverTax(annualIncome)
        const monthly = tt.taxDue / 12
        taxDetail = `📋 Turnover Tax (annual): R${tt.taxDue.toFixed(2)}\n    Monthly estimate: R${monthly.toFixed(2)}`
      } else if (taxReg.has_vat) {
        const vat = calculateVAT(income, expenses)
        taxDetail = `📋 VAT payable this period: R${vat.vatPayable.toFixed(2)}`
      } else {
        taxDetail = `📋 Based on your profile, check with KasiComply calendar`
      }
      await updateSession(phone,'COMPLY_MENU',ctx)
      return getMessage('CALC_RESULT',lang)
        .replace('{income}',   income.toFixed(2))
        .replace('{expenses}', expenses.toFixed(2))
        .replace('{profit}',   profit.toFixed(2))
        .replace('{tax_detail}', taxDetail)
    }

    // ─── PAYE Calculator ───────────────────────────────────────────
    case 'PAYE_Q1': {
      const count = parseInt(input)
      if (isNaN(count)||count<1) return `Please enter a valid number (e.g. 2)`
      await updateSession(phone,'PAYE_Q2',{...ctx, paye_count: count})
      return getMessage('PAYE_Q2',lang)
    }
    case 'PAYE_Q2': {
      const salary = parseFloat(input.replace(/[^0-9.]/g,''))
      if (isNaN(salary)||salary<=0) return `Please enter a valid salary amount`
      const count   = ctx.paye_count as number
      const payroll = salary
      const costs   = calculateEmployeeCost(salary/count, 30, payroll)
      await updateSession(phone,'COMPLY_MENU',ctx)
      return getMessage('PAYE_RESULT',lang)
        .replace('{gross}',   payroll.toFixed(2))
        .replace('{paye}',    costs.paye.toFixed(2))
        .replace('{uif_ee}',  costs.employeeUIF.toFixed(2))
        .replace('{net}',     costs.netSalary.toFixed(2))
        .replace('{uif_er}',  costs.employerUIF.toFixed(2))
        .replace('{sdl}',     costs.sdl.toFixed(2))
        .replace('{total}',   costs.totalCost.toFixed(2))
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
    case 'STOKVEL_MENU': {
      if (input === '1') {
        await updateSession(phone, 'STOKVEL_CREATE_Q1', ctx)
        return STOKVEL_MESSAGES.CREATE_Q1
      }
      if (input === '2') {
        // List user's stokvels
        const { data: stokvels } = await supabase
          .from('stokvels')
          .select('id, name, total_pot, total_members, status')
          .eq('admin_business_id', ctx.business_id as string)
        if (!stokvels || stokvels.length === 0) {
          return `You have no stokvels yet.\n\nReply *1* to create your first stokvel.\n\nType *MENU* to go back.`
        }
        const list = stokvels.map((s, i) => `${i + 1}️⃣ ${s.name} — R${s.total_pot} pot — ${s.total_members} members`).join('\n')
        await updateSession(phone, 'MAIN_MENU', ctx)
        return `🤝 *Your Stokvels*\n\n${list}\n\nType *MENU* to go back.`
      }
      if (input === '3') {
        await updateSession(phone, 'STOKVEL_CONTRIBUTE_SELECT', ctx)
        const { data: stokvels } = await supabase
          .from('stokvels').select('id, name, contribution_amount')
          .eq('admin_business_id', ctx.business_id as string)
        if (!stokvels?.length) return `No stokvels found. Create one first.\n\nType *MENU* to go back.`
        const list = stokvels.map((s, i) => `${i + 1}️⃣ ${s.name}`).join('\n')
        await updateSession(phone, 'STOKVEL_CONTRIBUTE_SELECT', { ...ctx, stokvel_list: stokvels })
        return STOKVEL_MESSAGES.CONTRIBUTE_SELECT.replace('{list}', list)
      }
      if (input === '4') {
        const { data: stokvels } = await supabase
          .from('stokvels').select('*, stokvel_members(*), stokvel_transactions(*)')
          .eq('admin_business_id', ctx.business_id as string)
        if (!stokvels?.length) return `No stokvels yet.\n\nType *MENU* to go back.`
        const s = stokvels[0]
        const period = getCurrentPeriodLabel(s.contribution_cycle)
        const paid = s.stokvel_transactions?.filter((t: any) => t.period_label === period && t.transaction_type === 'contribution').length || 0
        const outstanding = (s.total_members || 0) - paid
        return STOKVEL_MESSAGES.POT_SUMMARY
          .replace('{name}', s.name)
          .replace('{pot}', (s.total_pot || 0).toFixed(2))
          .replace('{members}', String(s.total_members || 0))
          .replace('{next_payout}', s.next_payout_date || 'TBD')
          .replace('{next_member}', 'Next in rotation')
          .replace('{paid}', String(paid))
          .replace('{outstanding}', String(outstanding))
          .replace('{defaulted}', '0')
      }
      return STOKVEL_MESSAGES.STOKVEL_MENU
    }

    case 'STOKVEL_CREATE_Q1': {
      await updateSession(phone, 'STOKVEL_CREATE_Q2', { ...ctx, stokvel_name: input })
      return STOKVEL_MESSAGES.CREATE_Q2
    }

    case 'STOKVEL_CREATE_Q2': {
      const typeMap: Record<string, string> = {
        '1':'savings','2':'burial','3':'investment','4':'grocery','5':'business'
      }
      const stokvelType = typeMap[input] || 'savings'
      await updateSession(phone, 'STOKVEL_CREATE_Q3', { ...ctx, stokvel_type: stokvelType })
      return STOKVEL_MESSAGES.CREATE_Q3
    }

    case 'STOKVEL_CREATE_Q3': {
      const amount = parseFloat(input.replace(/[^0-9.]/g, ''))
      if (isNaN(amount) || amount <= 0) return `Please enter a valid amount (e.g. 500)`
      await updateSession(phone, 'STOKVEL_CREATE_Q4', { ...ctx, stokvel_amount: amount })
      return STOKVEL_MESSAGES.CREATE_Q4
    }

    case 'STOKVEL_CREATE_Q4': {
      const cycleMap: Record<string, string> = { '1':'weekly','2':'fortnightly','3':'monthly' }
      const cycle = cycleMap[input] || 'monthly'
      const name  = ctx.stokvel_name as string
      const code  = generateStokvelCode(name)
      const nextPayout = getNextPayoutDate(cycle as 'weekly'|'fortnightly'|'monthly')

      const { data: stokvel } = await supabase.from('stokvels').insert({
        name,
        admin_business_id:   ctx.business_id as string,
        stokvel_type:        ctx.stokvel_type as string,
        contribution_amount: ctx.stokvel_amount as number,
        contribution_cycle:  cycle,
        total_members:       0,
        total_pot:           0,
        status:              'active',
        next_payout_date:    nextPayout.toISOString().split('T')[0],
      }).select().single()

      await updateSession(phone, 'STOKVEL_MENU', {
        ...ctx,
        stokvel_name: undefined,
        stokvel_type: undefined,
        stokvel_amount: undefined,
      })

      return STOKVEL_MESSAGES.CREATE_DONE
        .replace('{name}', name)
        .replace('{code}', code)
    }

    case 'STOKVEL_CONTRIBUTE_SELECT': {
      const stokvelList = ctx.stokvel_list as any[]
      const idx = parseInt(input) - 1
      const selected = stokvelList?.[idx]
      if (!selected) return `Invalid selection. Please try again.\n\nType *MENU* to go back.`

      const { data: members } = await supabase
        .from('stokvel_members').select('id, member_name, payout_position, total_contributed')
        .eq('stokvel_id', selected.id).eq('status', 'active')

      const memberList = members?.map((m, i) => `${i + 1}️⃣ ${m.member_name}`).join('\n') || 'No members yet'
      await updateSession(phone, 'STOKVEL_CONTRIBUTE_WHO', {
        ...ctx,
        contribute_stokvel_id:     selected.id,
        contribute_stokvel_name:   selected.name,
        contribute_default_amount: selected.contribution_amount,
        contribute_members:        members,
      })
      return STOKVEL_MESSAGES.CONTRIBUTE_WHO
        .replace('{members}', memberList)
    }

    case 'STOKVEL_CONTRIBUTE_WHO': {
      const members    = ctx.contribute_members as any[]
      const idx        = parseInt(input) - 1
      const member     = members?.[idx]
      if (!member) return `Member not found. Please try again.\n\nType *MENU* to go back.`

      await updateSession(phone, 'STOKVEL_CONTRIBUTE_AMOUNT', {
        ...ctx,
        contribute_member_id:   member.id,
        contribute_member_name: member.member_name,
      })
      return STOKVEL_MESSAGES.CONTRIBUTE_AMOUNT
        .replace('{default_amount}', String(ctx.contribute_default_amount))
    }

    case 'STOKVEL_CONTRIBUTE_AMOUNT': {
      const raw    = input.toUpperCase()
      const amount = raw === 'YES' || raw === ''
        ? ctx.contribute_default_amount as number
        : parseFloat(input.replace(/[^0-9.]/g, ''))

      if (isNaN(amount) || amount <= 0) return `Please enter a valid amount.`

      const stokvelId = ctx.contribute_stokvel_id as string
      const memberId  = ctx.contribute_member_id  as string
      const period    = getCurrentPeriodLabel('monthly')

      // Record contribution
      await supabase.from('stokvel_transactions').insert({
        stokvel_id:       stokvelId,
        member_id:        memberId,
        transaction_type: 'contribution',
        amount,
        period_label:     period,
        payment_method:   'cash',
        recorded_by:      ctx.business_id as string,
      })

      // Update member total
      await supabase.from('stokvel_members')
        .update({ total_contributed: supabase.rpc('increment', { x: amount }) })
        .eq('id', memberId)

      // Update stokvel pot
      const { data: stokvel } = await supabase
        .from('stokvels').select('total_pot, total_members').eq('id', stokvelId).single()
      const newPot = (parseFloat(String(stokvel?.total_pot || 0)) + amount)
      await supabase.from('stokvels').update({ total_pot: newPot }).eq('id', stokvelId)

      // Count paid this cycle
      const { count } = await supabase.from('stokvel_transactions')
        .select('id', { count: 'exact' })
        .eq('stokvel_id', stokvelId)
        .eq('period_label', period)
        .eq('transaction_type', 'contribution')

      await updateSession(phone, 'STOKVEL_MENU', {
        ...ctx,
        contribute_stokvel_id: undefined,
        contribute_member_id:  undefined,
        contribute_members:    undefined,
      })

      return STOKVEL_MESSAGES.CONTRIBUTE_DONE
        .replace('{amount}',    amount.toFixed(2))
        .replace('{member}',    ctx.contribute_member_name as string)
        .replace('{pot_total}', newPot.toFixed(2))
        .replace('{paid}',      String(count || 1))
        .replace('{total}',     String(stokvel?.total_members || 0))
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
    const response = new twilio.twiml.MessagingResponse()
    response.message(reply)

    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'KasiCommerce WhatsApp webhook active' })
}
