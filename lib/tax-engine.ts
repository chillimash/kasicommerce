/**
 * KasiComply Tax Engine
 * SARS 2026/2027 tax year rates and calculations
 * Sources: SARS Budget 2026, National Minimum Wage 2026
 */

// ─── Turnover Tax (Micro Business) ───────────────────────────────────────────
// Applies to businesses with annual turnover ≤ R2,300,000
// Replaces: Income Tax, Provisional Tax, Capital Gains Tax
// Updated VAT threshold 2026: R2,300,000 (was R1,000,000)

export const TURNOVER_TAX_BRACKETS = [
  { min: 0,         max: 335_000,    base: 0,      rate: 0.000 },
  { min: 335_001,   max: 500_000,    base: 0,      rate: 0.010 }, // 1% above R335k
  { min: 500_001,   max: 750_000,    base: 1_650,  rate: 0.020 }, // 2%
  { min: 750_001,   max: 1_000_000,  base: 6_650,  rate: 0.030 }, // 3%
  { min: 1_000_001, max: 1_500_000,  base: 14_150, rate: 0.040 }, // 4%
  { min: 1_500_001, max: 2_300_000,  base: 34_150, rate: 0.050 }, // 5%
]

export function calculateTurnoverTax(annualTurnover: number): {
  taxDue: number
  effectiveRate: number
  bracket: string
  qualifies: boolean
} {
  if (annualTurnover > 2_300_000) {
    return { taxDue: 0, effectiveRate: 0, bracket: 'Does not qualify', qualifies: false }
  }
  const bracket = TURNOVER_TAX_BRACKETS.find(
    b => annualTurnover >= b.min && annualTurnover <= b.max
  ) || TURNOVER_TAX_BRACKETS[0]

  const taxDue = bracket.base + Math.max(0, annualTurnover - bracket.min) * bracket.rate
  const effectiveRate = annualTurnover > 0 ? taxDue / annualTurnover : 0

  return {
    taxDue: Math.round(taxDue * 100) / 100,
    effectiveRate,
    bracket: `R${bracket.min.toLocaleString()} – R${bracket.max.toLocaleString()}`,
    qualifies: true,
  }
}

// ─── VAT ─────────────────────────────────────────────────────────────────────
// Standard rate: 15%
// Compulsory registration threshold: R2,300,000 (updated April 2026)
// Voluntary registration threshold: R120,000 (updated April 2026)
// VAT201 returns filed bi-monthly (or monthly if turnover > R30m)

export const VAT_RATE = 0.15
export const VAT_COMPULSORY_THRESHOLD = 2_300_000
export const VAT_VOLUNTARY_THRESHOLD  = 120_000

export function calculateVAT(grossIncome: number, vatExpenses: number) {
  const outputVAT  = grossIncome * VAT_RATE
  const inputVAT   = vatExpenses * VAT_RATE
  const vatPayable = Math.max(0, outputVAT - inputVAT)
  return {
    outputVAT:  Math.round(outputVAT  * 100) / 100,
    inputVAT:   Math.round(inputVAT   * 100) / 100,
    vatPayable: Math.round(vatPayable * 100) / 100,
  }
}

export function vatRegistrationStatus(annualTurnover: number): {
  mustRegister: boolean
  canRegister: boolean
  message: string
} {
  if (annualTurnover >= VAT_COMPULSORY_THRESHOLD) {
    return { mustRegister: true, canRegister: true, message: 'You must register for VAT' }
  }
  if (annualTurnover >= VAT_VOLUNTARY_THRESHOLD) {
    return { mustRegister: false, canRegister: true, message: 'You can voluntarily register for VAT' }
  }
  return { mustRegister: false, canRegister: false, message: 'You do not need to register for VAT' }
}

// ─── PAYE (Pay As You Earn) ───────────────────────────────────────────────────
// 2026/2027 Individual tax brackets
// PAYE due: 7th of each month (EMP201)
// Annual reconciliation: EMP501 due 31 May

export const PAYE_BRACKETS_2026 = [
  { min: 0,         max: 237_100,   base: 0,        rate: 0.18 },
  { min: 237_101,   max: 370_500,   base: 42_678,   rate: 0.26 },
  { min: 370_501,   max: 512_800,   base: 77_362,   rate: 0.31 },
  { min: 512_801,   max: 673_000,   base: 121_475,  rate: 0.36 },
  { min: 673_001,   max: 857_900,   base: 179_147,  rate: 0.39 },
  { min: 857_901,   max: 1_817_000, base: 251_258,  rate: 0.41 },
  { min: 1_817_001, max: Infinity,  base: 644_489,  rate: 0.45 },
]

export const PRIMARY_REBATE   = 17_235  // 2026/2027
export const SECONDARY_REBATE = 9_444   // Age 65+
export const TERTIARY_REBATE  = 3_145   // Age 75+
export const TAX_THRESHOLD    = 95_750  // Below this: no tax

export function calculateAnnualPAYE(annualSalary: number, age = 30): number {
  if (annualSalary <= TAX_THRESHOLD) return 0

  const bracket = PAYE_BRACKETS_2026.find(
    b => annualSalary >= b.min && annualSalary <= b.max
  ) || PAYE_BRACKETS_2026[PAYE_BRACKETS_2026.length - 1]

  let tax = bracket.base + (annualSalary - bracket.min) * bracket.rate
  tax -= PRIMARY_REBATE
  if (age >= 65) tax -= SECONDARY_REBATE
  if (age >= 75) tax -= TERTIARY_REBATE

  return Math.max(0, Math.round(tax * 100) / 100)
}

export function calculateMonthlyPAYE(monthlySalary: number, age = 30): number {
  return Math.round((calculateAnnualPAYE(monthlySalary * 12, age) / 12) * 100) / 100
}

// ─── UIF (Unemployment Insurance Fund) ───────────────────────────────────────
// Rate: 1% employee + 1% employer = 2% total
// Capped at monthly remuneration of R17,872 (2026)
// Due: 7th of each month with PAYE on EMP201

export const UIF_RATE         = 0.01   // per party
export const UIF_MONTHLY_CAP  = 17_872

export function calculateUIF(monthlySalary: number): {
  employeeUIF: number
  employerUIF: number
  totalUIF: number
} {
  const cappedSalary = Math.min(monthlySalary, UIF_MONTHLY_CAP)
  const employeeUIF  = Math.round(cappedSalary * UIF_RATE * 100) / 100
  const employerUIF  = employeeUIF
  return { employeeUIF, employerUIF, totalUIF: employeeUIF + employerUIF }
}

// ─── SDL (Skills Development Levy) ───────────────────────────────────────────
// Rate: 1% of leviable amount (total payroll)
// Exempt if annual payroll < R500,000
// Due: 7th of each month with PAYE on EMP201

export const SDL_RATE             = 0.01
export const SDL_EXEMPT_THRESHOLD = 500_000 // annual payroll

export function calculateSDL(monthlyPayroll: number): number {
  const annualPayroll = monthlyPayroll * 12
  if (annualPayroll < SDL_EXEMPT_THRESHOLD) return 0
  return Math.round(monthlyPayroll * SDL_RATE * 100) / 100
}

// ─── Full Employee Cost Calculator ───────────────────────────────────────────
export function calculateEmployeeCost(monthlySalary: number, age = 30, monthlyPayroll?: number) {
  const paye        = calculateMonthlyPAYE(monthlySalary, age)
  const uif         = calculateUIF(monthlySalary)
  const sdl         = calculateSDL(monthlyPayroll ?? monthlySalary)
  const netSalary   = monthlySalary - paye - uif.employeeUIF
  const totalCost   = monthlySalary + uif.employerUIF + sdl

  return {
    grossSalary:  monthlySalary,
    paye,
    employeeUIF:  uif.employeeUIF,
    employerUIF:  uif.employerUIF,
    sdl,
    netSalary:    Math.round(netSalary * 100) / 100,
    totalCost:    Math.round(totalCost * 100) / 100,
  }
}

// ─── Compliance Calendar Generator ───────────────────────────────────────────
export type ComplianceEvent = {
  type: string
  label: string
  dueDate: Date
  periodLabel: string
  estimatedAmount?: number
  urgent: boolean      // due within 7 days
  overdue: boolean
}

export function generateComplianceCalendar(
  hasPAYE: boolean,
  hasVAT: boolean,
  onTurnoverTax: boolean,
  monthlyPayroll = 0,
  monthlyRevenue = 0,
  referenceDate = new Date()
): ComplianceEvent[] {
  const events: ComplianceEvent[] = []
  const now = referenceDate

  function addDays(d: Date, n: number) {
    const r = new Date(d); r.setDate(r.getDate() + n); return r
  }
  function isUrgent(d: Date)  { return d >= now && d <= addDays(now, 7) }
  function isOverdue(d: Date) { return d < now }

  // Generate 3 months of PAYE/UIF/SDL deadlines
  if (hasPAYE) {
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 7)
      const period = d.toLocaleString('en-ZA', { month: 'long', year: 'numeric' })
      const payroll = calculateEmployeeCost(monthlyPayroll)
      const amount  = payroll.paye + payroll.employerUIF + payroll.employeeUIF + payroll.sdl

      events.push({
        type: 'paye', label: 'EMP201 — PAYE / UIF / SDL',
        dueDate: d, periodLabel: period,
        estimatedAmount: amount,
        urgent: isUrgent(d), overdue: isOverdue(d),
      })
    }
  }

  // VAT201 — bi-monthly
  if (hasVAT) {
    for (let i = 0; i < 2; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + (i * 2), 25)
      const period = `${d.toLocaleString('en-ZA', { month: 'long' })}/${
        new Date(d.getFullYear(), d.getMonth() + 1, 25).toLocaleString('en-ZA', { month: 'long' })
      } ${d.getFullYear()}`
      const vat = calculateVAT(monthlyRevenue * 2, monthlyRevenue * 0.4)

      events.push({
        type: 'vat201', label: 'VAT201 Return',
        dueDate: d, periodLabel: period,
        estimatedAmount: vat.vatPayable,
        urgent: isUrgent(d), overdue: isOverdue(d),
      })
    }
  }

  // Turnover Tax — annual (due 28 February)
  if (onTurnoverTax) {
    const taxYear = now.getMonth() < 2 ? now.getFullYear() : now.getFullYear() + 1
    const d = new Date(taxYear, 1, 28)
    const annualRevenue = monthlyRevenue * 12
    const tt = calculateTurnoverTax(annualRevenue)

    events.push({
      type: 'turnover_tax', label: 'Turnover Tax Return',
      dueDate: d, periodLabel: `Tax Year ${taxYear - 1}/${taxYear}`,
      estimatedAmount: tt.taxDue,
      urgent: isUrgent(d), overdue: isOverdue(d),
    })

    // Provisional payments (Aug + Feb)
    const aug = new Date(taxYear - 1, 7, 31)
    if (aug >= now) {
      events.push({
        type: 'provisional_tax', label: 'Provisional Tax — 1st Payment',
        dueDate: aug, periodLabel: `Tax Year ${taxYear - 1}/${taxYear}`,
        estimatedAmount: Math.round(tt.taxDue / 2 * 100) / 100,
        urgent: isUrgent(aug), overdue: isOverdue(aug),
      })
    }
  }

  return events.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}

// ─── Turnover Tax Qualifier ───────────────────────────────────────────────────
export function qualifiesForTurnoverTax(
  annualTurnover: number,
  businessCount: number,
  isPublicCompany: boolean,
  investmentIncome: number
): { qualifies: boolean; reason?: string } {
  if (annualTurnover > 2_300_000)
    return { qualifies: false, reason: `Annual turnover exceeds R2.3 million` }
  if (businessCount > 1)
    return { qualifies: false, reason: `You have more than one business` }
  if (isPublicCompany)
    return { qualifies: false, reason: `Public companies do not qualify` }
  if (investmentIncome > annualTurnover * 0.2)
    return { qualifies: false, reason: `More than 20% of income is from investments` }
  return { qualifies: true }
}
