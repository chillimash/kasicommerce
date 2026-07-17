export type ContributionCycle = 'weekly' | 'fortnightly' | 'monthly'

export const STOKVEL_MESSAGES = {
  STOKVEL_MENU: `🤝 *KasiStokvel*\n\n1️⃣ Create a stokvel\n2️⃣ My stokvels\n3️⃣ Record a contribution\n4️⃣ View pot summary\n\nType *MENU* to go back.`,
  CREATE_Q1: `What is your stokvel's name?`,
  CREATE_Q2: `What type of stokvel is it?\n\n1️⃣ Savings\n2️⃣ Burial\n3️⃣ Investment\n4️⃣ Grocery\n5️⃣ Business`,
  CREATE_Q3: `How much does each member contribute?\n\nExample: 500`,
  CREATE_Q4: `How often are contributions made?\n\n1️⃣ Weekly\n2️⃣ Every two weeks\n3️⃣ Monthly`,
  CREATE_DONE: `✅ *{name}* has been created!\n\nYour join code is: *{code}*\n\nShare this code with members.`,
  CONTRIBUTE_SELECT: `Which stokvel is this for?\n\n{list}`,
  CONTRIBUTE_WHO: `Who is making the contribution?\n\n{members}`,
  CONTRIBUTE_AMOUNT: `Enter the amount, or reply *YES* to use R{default_amount}.`,
  CONTRIBUTE_DONE: `✅ Contribution of R{amount} recorded for *{member}*.\n\nPot total: R{pot_total}\nPaid this cycle: {paid}/{total}`,
  POT_SUMMARY: `🤝 *{name} Pot Summary*\n\nPot: R{pot}\nMembers: {members}\nNext payout: {next_payout}\nRecipient: {next_member}\n\nPaid: {paid}\nOutstanding: {outstanding}\nDefaulted: {defaulted}`,
} as const

export function generateStokvelCode(name: string): string {
  const prefix = name.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4) || 'KASI'
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `${prefix}-${suffix}`
}

export function getCurrentPeriodLabel(cycle: ContributionCycle | string, date = new Date()): string {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  if (cycle === 'weekly') {
    const day = start.getDay() || 7
    start.setDate(start.getDate() - day + 1)
    return `week-${start.toISOString().slice(0, 10)}`
  }

  if (cycle === 'fortnightly') {
    const fortnight = Math.floor((start.getDate() - 1) / 14) + 1
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-fortnight-${fortnight}`
  }

  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`
}

export function getNextPayoutDate(cycle: ContributionCycle, from = new Date()): Date {
  const next = new Date(from)
  if (cycle === 'weekly') next.setDate(next.getDate() + 7)
  else if (cycle === 'fortnightly') next.setDate(next.getDate() + 14)
  else next.setMonth(next.getMonth() + 1)
  return next
}
