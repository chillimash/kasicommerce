'use client'
import { useState, useMemo } from 'react'
import {
  ShieldCheck, AlertTriangle, CheckCircle,
  FileText, ChevronDown, ChevronUp, Users,
  TrendingUp, Calculator, Calendar, Info
} from 'lucide-react'
import {
  calculateTurnoverTax, qualifiesForTurnoverTax,
  calculateEmployeeCost, calculateVAT,
  generateComplianceCalendar, vatRegistrationStatus,
} from '@/lib/tax-engine'
import type { ComplianceEvent as DBEvent } from '@/lib/get-business'

const TEAL   = '#156C7D'
const COPPER = '#C45C2E'
const CARD   = { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12 }

type Profile = {
  annualTurnover: number
  monthlyRevenue: number
  monthlyExpenses: number
  hasVAT: boolean
  hasPAYE: boolean
  onTurnoverTax: boolean
  employeeCount: number
  monthlyPayroll: number
}

function fmt(n: number) { return n.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) }
function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.04em' }}>{label}</span>
}
function StatCard({ label, value, sub, icon: Icon, color, bg }: any) {
  return (
    <div style={{ ...CARD, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#2D2926' }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#718096', marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
    </div>
  )
}

function TurnoverTaxPanel({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(true)
  const result  = useMemo(() => qualifiesForTurnoverTax(profile.annualTurnover, 1, false, 0), [profile.annualTurnover])
  const ttCalc  = useMemo(() => calculateTurnoverTax(profile.annualTurnover), [profile.annualTurnover])
  const monthly = ttCalc.taxDue / 12

  return (
    <div style={CARD}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color="#059669" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926' }}>Turnover Tax Assessment</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>{result.qualifies ? '✅ You qualify — simplified annual tax' : '❌ Does not qualify'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pill label={result.qualifies ? 'QUALIFIES' : 'STANDARD TAX'} color={result.qualifies ? '#059669' : '#92400E'} bg={result.qualifies ? '#D1FAE5' : '#FEF3C7'} />
          {open ? <ChevronUp size={16} color="#718096" /> : <ChevronDown size={16} color="#718096" />}
        </div>
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F3F4F6' }}>
          {result.qualifies ? (
            <div style={{ paddingTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Annual Turnover',  value: `R ${fmt(profile.annualTurnover)}` },
                  { label: 'Tax Bracket',       value: ttCalc.bracket },
                  { label: 'Annual Tax Due',    value: `R ${fmt(ttCalc.taxDue)}` },
                  { label: 'Monthly Provision', value: `R ${monthly.toFixed(2)}` },
                  { label: 'Effective Rate',    value: `${(ttCalc.effectiveRate * 100).toFixed(2)}%` },
                  { label: 'Filing Due',        value: '28 February annually' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#F8FAFB', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#718096', marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2D2926' }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 10 }}>
                <Info size={14} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: '#065F46', lineHeight: 1.6 }}>
                  Turnover Tax replaces Income Tax, Provisional Tax, and Capital Gains Tax. Set aside <strong>R{monthly.toFixed(0)}/month</strong> to be ready.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 12, background: '#FEF3C7', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, color: '#92400E' }}><strong>Reason:</strong> {result.reason}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TaxCalculator({ profile }: { profile: Profile }) {
  const [open, setOpen]       = useState(false)
  const [income, setIncome]   = useState(profile.monthlyRevenue.toString())
  const [expenses, setExpenses] = useState(profile.monthlyExpenses.toString())
  const inc = parseFloat(income) || 0
  const exp = parseFloat(expenses) || 0
  const profit = Math.max(0, inc - exp)
  const tt = calculateTurnoverTax(inc * 12)
  const monthlyTax = tt.taxDue / 12
  const vat = calculateVAT(inc, exp * 0.7)
  const vatStatus = vatRegistrationStatus(inc * 12)

  return (
    <div style={CARD}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: '#E8F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calculator size={18} color={TEAL} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926' }}>Tax Liability Calculator</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>Pre-filled from your KasiBooks data</div>
          </div>
        </div>
        {open ? <ChevronUp size={16} color="#718096" /> : <ChevronDown size={16} color="#718096" />}
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Monthly Income (R)',   value: income,   set: setIncome },
              { label: 'Monthly Expenses (R)', value: expenses, set: setExpenses },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2D2926', marginBottom: 5 }}>{f.label}</label>
                <input type="number" value={f.value} onChange={e => f.set(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Monthly Income',   value: `R ${fmt(inc)}`,    color: '#059669', bg: '#D1FAE5' },
              { label: 'Monthly Expenses', value: `R ${fmt(exp)}`,    color: '#DC2626', bg: '#FEE2E2' },
              { label: 'Net Profit',       value: `R ${fmt(profit)}`, color: TEAL,      bg: '#E8F4F7' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#F8FAFB', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#2D2926', marginBottom: 12 }}>Tax Breakdown</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: '#2D2926', fontWeight: 500 }}>Turnover Tax (monthly provision)</div>
                <div style={{ fontSize: 11, color: '#718096' }}>Based on R{fmt(inc * 12)} annual income</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COPPER }}>R {monthlyTax.toFixed(2)}</div>
            </div>
            <div style={{ height: 1, background: '#E2E8F0', marginBottom: 10 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: '#2D2926', fontWeight: 500 }}>VAT status</div>
                <div style={{ fontSize: 11, color: '#718096' }}>{vatStatus.message}</div>
              </div>
              <Pill label={profile.hasVAT ? 'REGISTERED' : 'NOT REQUIRED'} color={profile.hasVAT ? '#059669' : '#6B7280'} bg={profile.hasVAT ? '#D1FAE5' : '#F3F4F6'} />
            </div>
            <div style={{ height: 1, background: '#E2E8F0', marginBottom: 10 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2D2926' }}>Total Monthly Tax Obligation</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: COPPER }}>
                R {(monthlyTax + (profile.hasVAT ? vat.vatPayable : 0)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PAYECalculator({ profile }: { profile: Profile }) {
  const [open, setOpen]     = useState(false)
  const [salary, setSalary] = useState(profile.monthlyPayroll.toString())
  const [count, setCount]   = useState(profile.employeeCount.toString())
  const monthlyPayroll = parseFloat(salary) || 0
  const empCount       = parseInt(count) || 1
  const perEmployee    = monthlyPayroll / empCount
  const costs          = calculateEmployeeCost(perEmployee, 30, monthlyPayroll)
  const totals         = {
    paye: costs.paye * empCount, employeeUIF: costs.employeeUIF * empCount,
    employerUIF: costs.employerUIF * empCount, sdl: costs.sdl,
    netSalary: costs.netSalary * empCount, totalCost: costs.totalCost * empCount,
  }
  const sdlExempt = monthlyPayroll * 12 < 500_000

  return (
    <div style={CARD}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} color="#7C3AED" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926' }}>PAYE and Employee Costs</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>
              {profile.employeeCount > 0 ? `${profile.employeeCount} employee${profile.employeeCount > 1 ? 's' : ''} — EMP201 due 7th of each month` : 'Add employees to calculate PAYE'}
            </div>
          </div>
        </div>
        {open ? <ChevronUp size={16} color="#718096" /> : <ChevronDown size={16} color="#718096" />}
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Number of Employees',      value: count,  set: setCount },
              { label: 'Total Monthly Payroll (R)', value: salary, set: setSalary },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2D2926', marginBottom: 5 }}>{f.label}</label>
                <input type="number" value={f.value} onChange={e => f.set(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: '#F8FAFB', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', letterSpacing: '0.05em', marginBottom: 12, textTransform: 'uppercase' as const }}>Employee Deductions</div>
              {[
                { label: 'Gross Salary',   value: monthlyPayroll, color: '#2D2926' },
                { label: 'Less: PAYE',     value: -totals.paye,         color: '#DC2626' },
                { label: 'Less: UIF (1%)', value: -totals.employeeUIF,  color: '#DC2626' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: 12, color: '#4A5568' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.color }}>R {fmt(Math.abs(r.value))}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2926' }}>Net Take-Home</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>R {fmt(totals.netSalary)}</span>
              </div>
            </div>
            <div style={{ background: '#F8FAFB', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', letterSpacing: '0.05em', marginBottom: 12, textTransform: 'uppercase' as const }}>Your EMP201 Liability</div>
              {[
                { label: 'PAYE (employee)',     value: totals.paye },
                { label: 'UIF employee (1%)',   value: totals.employeeUIF },
                { label: 'UIF employer (1%)',   value: totals.employerUIF },
                { label: `SDL${sdlExempt ? ' — EXEMPT' : ' (1%)'}`, value: totals.sdl },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: 12, color: sdlExempt && r.label.includes('SDL') ? '#9CA3AF' : '#4A5568' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: sdlExempt && r.label.includes('SDL') ? '#9CA3AF' : '#2D2926' }}>R {fmt(r.value)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2926' }}>Total Pay to SARS</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: COPPER }}>
                  R {fmt(totals.paye + totals.employeeUIF + totals.employerUIF + totals.sdl)}
                </span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, background: '#EFF6FF', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#1D4ED8' }}>
            Submit EMP201 and pay by the <strong>7th of each month</strong>. Late penalty: 10% + interest.
          </div>
        </div>
      )}
    </div>
  )
}

function ComplianceCalendar({ profile, dbEvents }: { profile: Profile; dbEvents: DBEvent[] }) {
  const [open, setOpen] = useState(true)

  // Merge DB events + generated events, prefer DB events where they exist
  const generated = useMemo(() => generateComplianceCalendar(
    profile.hasPAYE, profile.hasVAT, profile.onTurnoverTax,
    profile.monthlyPayroll / Math.max(1, profile.employeeCount),
    profile.monthlyRevenue
  ), [profile])

  const events = dbEvents.length > 0
    ? dbEvents.map(e => ({
        type: e.event_type, label: e.event_type.toUpperCase().replace('_', ' '),
        dueDate: new Date(e.due_date), periodLabel: e.period_label,
        estimatedAmount: e.amount_due ?? undefined,
        urgent: e.status === 'due_soon',
        overdue: e.status === 'overdue',
      }))
    : generated

  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    overdue:  { bg: '#FEE2E2', color: '#DC2626', label: 'OVERDUE' },
    urgent:   { bg: '#FEF3C7', color: '#92400E', label: 'DUE SOON' },
    upcoming: { bg: '#E8F4F7', color: TEAL,      label: 'UPCOMING' },
    paid:     { bg: '#D1FAE5', color: '#059669', label: 'PAID' },
  }
  const typeEmoji: Record<string, string> = {
    paye: '💼', vat201: '🧾', turnover_tax: '📋', provisional_tax: '📋', income_tax: '📄', emp501: '📊'
  }

  return (
    <div style={{ ...CARD, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: '#FDF0EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={18} color={COPPER} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926' }}>Compliance Calendar</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>Personalised to your tax registrations</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pill label={`${events.filter(e => e.overdue || e.urgent).length} ACTION NEEDED`} color="#92400E" bg="#FEF3C7" />
          {open ? <ChevronUp size={16} color="#718096" /> : <ChevronDown size={16} color="#718096" />}
        </div>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid #F3F4F6' }}>
          {events.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#718096', fontSize: 13 }}>
              No compliance events yet. Complete your Turnover Tax Qualifier above to generate your calendar.
            </div>
          ) : events.map((event, i) => {
            const statusKey = event.overdue ? 'overdue' : event.urgent ? 'urgent' : 'upcoming'
            const st = statusMap[statusKey]
            return (
              <div key={i} style={{
                padding: '14px 20px', borderBottom: i < events.length - 1 ? '1px solid #F8FAFB' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: event.overdue ? '#FFF5F5' : event.urgent ? '#FFFBEB' : '#fff',
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1 }}>
                  <div style={{ fontSize: 20, width: 32, textAlign: 'center' as const }}>{typeEmoji[event.type] || '📌'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2D2926' }}>{event.label}</div>
                    <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                      {event.periodLabel} · Due {event.dueDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {event.estimatedAmount !== undefined && (
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ fontSize: 11, color: '#718096' }}>Est. amount</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#2D2926' }}>R {fmt(event.estimatedAmount)}</div>
                    </div>
                  )}
                  <Pill label={st.label} color={st.color} bg={st.bg} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

type Props = {
  profile: Profile
  businessId: string
  complianceEvents: DBEvent[]
}

export function ComplyClient({ profile, businessId, complianceEvents }: Props) {
  const tt          = calculateTurnoverTax(profile.annualTurnover)
  const costs       = calculateEmployeeCost(
    profile.monthlyPayroll / Math.max(1, profile.employeeCount), 30, profile.monthlyPayroll
  )
  const monthlyEMP201 = profile.hasPAYE
    ? (costs.paye + costs.employeeUIF + costs.employerUIF + costs.sdl) * profile.employeeCount
    : 0

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1050 }}>
      {profile.hasPAYE && monthlyEMP201 > 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '13px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} color="#92400E" />
          <span style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>
            EMP201 (PAYE/UIF/SDL) is due by the 7th of each month. Estimated: R{monthlyEMP201.toFixed(2)}.
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Est. Annual Turnover" value={`R ${(profile.annualTurnover/1000).toFixed(0)}k`}  sub="From KasiBooks"     icon={TrendingUp}  color={TEAL}    bg="#E8F4F7" />
        <StatCard label="Turnover Tax Due"     value={`R ${fmt(tt.taxDue)}`}                             sub="Annual — 28 Feb"   icon={FileText}    color={COPPER}  bg="#FDF0EA" />
        <StatCard label="Monthly EMP201"       value={monthlyEMP201 > 0 ? `R ${fmt(monthlyEMP201)}` : 'N/A'} sub="PAYE + UIF + SDL" icon={Users}   color="#7C3AED" bg="#EDE9FE" />
        <StatCard label="Tax Registrations"    value={profile.onTurnoverTax ? 'Turnover Tax' : 'Standard'} sub="Your tax type"  icon={CheckCircle} color="#059669" bg="#D1FAE5" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#2D2926', marginBottom: 14 }}>Turnover Tax</div>
        <TurnoverTaxPanel profile={profile} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#2D2926', marginBottom: 14, marginTop: 20 }}>Tax Liability Calculator</div>
        <TaxCalculator profile={profile} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#2D2926', marginBottom: 14, marginTop: 20 }}>PAYE and Employee Costs</div>
        <PAYECalculator profile={profile} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#2D2926', marginBottom: 14, marginTop: 20 }}>Compliance Calendar</div>
        <ComplianceCalendar profile={profile} dbEvents={complianceEvents} />
      </div>

      <div style={{ marginTop: 24, background: 'linear-gradient(135deg,#1F5C6B,#156C7D)', borderRadius: 12, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>SARS eFiling Integration Coming Soon</div>
          <div style={{ color: '#8FBFC9', fontSize: 12 }}>KasiCommerce is applying to become a SARS ISV. Direct EMP201 and VAT201 submissions from this dashboard.</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' as const, marginLeft: 20, cursor: 'pointer' }}>
          Notify Me
        </div>
      </div>
    </div>
  )
}
