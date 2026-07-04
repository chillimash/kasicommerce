'use client'
import { useState, useMemo } from 'react'
import { TopBar } from '@/components/TopBar'
import {
  ShieldCheck, AlertTriangle, CheckCircle, Clock,
  FileText, ChevronDown, ChevronUp, Users,
  TrendingUp, Calculator, Calendar, Info
} from 'lucide-react'
import {
  calculateTurnoverTax, qualifiesForTurnoverTax,
  calculateEmployeeCost, calculateVAT,
  generateComplianceCalendar, vatRegistrationStatus,
  type ComplianceEvent
} from '@/lib/tax-engine'

// ─── Mock business profile (replace with Supabase data in production) ─────────
const MOCK_PROFILE = {
  annualTurnover: 540_000,
  monthlyRevenue: 45_000,
  monthlyExpenses: 18_000,
  hasVAT: false,
  hasPAYE: true,
  onTurnoverTax: true,
  employeeCount: 2,
  monthlyPayroll: 8_500,
}

const TEAL   = '#156C7D'
const COPPER = '#C45C2E'
const CARD   = { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12 }

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

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 14, marginTop: 28 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#2D2926' }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.04em' }}>
      {label}
    </span>
  )
}

// ─── Turnover Tax Panel ───────────────────────────────────────────────────────
function TurnoverTaxPanel({ profile }: { profile: typeof MOCK_PROFILE }) {
  const [open, setOpen] = useState(true)
  const result   = useMemo(() => qualifiesForTurnoverTax(profile.annualTurnover, 1, false, 0), [profile])
  const ttCalc   = useMemo(() => calculateTurnoverTax(profile.annualTurnover), [profile])
  const monthlyTT = ttCalc.taxDue / 12

  return (
    <div style={CARD}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color="#059669" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926' }}>Turnover Tax Assessment</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>
              {result.qualifies ? '✅ You qualify — simplified annual tax' : '❌ Does not qualify'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {result.qualifies
            ? <Pill label="QUALIFIES" color="#059669" bg="#D1FAE5" />
            : <Pill label="STANDARD TAX" color="#92400E" bg="#FEF3C7" />}
          {open ? <ChevronUp size={16} color="#718096" /> : <ChevronDown size={16} color="#718096" />}
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F3F4F6' }}>
          {result.qualifies ? (
            <div style={{ paddingTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
                {[
                  { label: 'Annual Turnover',   value: `R ${profile.annualTurnover.toLocaleString()}` },
                  { label: 'Tax Bracket',        value: ttCalc.bracket },
                  { label: 'Annual Tax Due',     value: `R ${ttCalc.taxDue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` },
                  { label: 'Monthly Provision',  value: `R ${monthlyTT.toFixed(2)}` },
                  { label: 'Effective Rate',     value: `${(ttCalc.effectiveRate * 100).toFixed(2)}%` },
                  { label: 'Filing Due',         value: '28 February annually' },
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
                  Turnover Tax replaces Income Tax, Provisional Tax, and Capital Gains Tax.
                  You pay one simple annual rate on your total revenue — no complex deductions required.
                  Set aside <strong>R{monthlyTT.toFixed(0)}/month</strong> to be ready.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ paddingTop: 16, background: '#FEF3C7', borderRadius: 8, padding: '14px 16px', marginTop: 8 }}>
              <div style={{ fontSize: 13, color: '#92400E' }}>
                <strong>Reason:</strong> {result.reason}<br />
                You are on the standard tax system. See your compliance calendar below.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tax Liability Calculator ─────────────────────────────────────────────────
function TaxCalculator({ profile }: { profile: typeof MOCK_PROFILE }) {
  const [open, setOpen]     = useState(false)
  const [income, setIncome]   = useState(profile.monthlyRevenue.toString())
  const [expenses, setExpenses] = useState(profile.monthlyExpenses.toString())

  const inc  = parseFloat(income)   || 0
  const exp  = parseFloat(expenses) || 0
  const profit = Math.max(0, inc - exp)
  const annualIncome = inc * 12
  const tt = calculateTurnoverTax(annualIncome)
  const monthlyTax = tt.taxDue / 12
  const vat = calculateVAT(inc, exp * 0.7) // ~70% of expenses are VAT-claimable
  const vatStatus = vatRegistrationStatus(annualIncome)

  return (
    <div style={CARD}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: '#E8F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calculator size={18} color={TEAL} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926' }}>Tax Liability Calculator</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>Real-time estimate from your KasiBooks data</div>
          </div>
        </div>
        {open ? <ChevronUp size={16} color="#718096" /> : <ChevronDown size={16} color="#718096" />}
      </button>

      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
          {/* Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Monthly Income (R)', value: income, set: setIncome },
              { label: 'Monthly Expenses (R)', value: expenses, set: setExpenses },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2D2926', marginBottom: 5 }}>{f.label}</label>
                <input
                  type="number"
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>
            ))}
          </div>

          {/* Results */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Monthly Income',   value: `R ${inc.toLocaleString()}`,    color: '#059669', bg: '#D1FAE5' },
              { label: 'Monthly Expenses', value: `R ${exp.toLocaleString()}`,    color: '#DC2626', bg: '#FEE2E2' },
              { label: 'Net Profit',       value: `R ${profit.toLocaleString()}`, color: TEAL,      bg: '#E8F4F7' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: '12px' }}>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tax breakdown */}
          <div style={{ background: '#F8FAFB', borderRadius: 10, padding: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#2D2926', marginBottom: 12 }}>Tax Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#2D2926', fontWeight: 500 }}>Turnover Tax (monthly provision)</div>
                  <div style={{ fontSize: 11, color: '#718096' }}>Based on R{annualIncome.toLocaleString()} annual income</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: COPPER }}>R {monthlyTax.toFixed(2)}</div>
              </div>
              <div style={{ height: 1, background: '#E2E8F0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#2D2926', fontWeight: 500 }}>VAT status</div>
                  <div style={{ fontSize: 11, color: '#718096' }}>{vatStatus.message}</div>
                </div>
                <Pill
                  label={profile.hasVAT ? 'REGISTERED' : 'NOT REQUIRED'}
                  color={profile.hasVAT ? '#059669' : '#6B7280'}
                  bg={profile.hasVAT ? '#D1FAE5' : '#F3F4F6'}
                />
              </div>
              <div style={{ height: 1, background: '#E2E8F0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2D2926' }}>Total Monthly Tax Obligation</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: COPPER }}>
                  R {(monthlyTax + (profile.hasVAT ? vat.vatPayable : 0)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PAYE Calculator ──────────────────────────────────────────────────────────
function PAYECalculator({ profile }: { profile: typeof MOCK_PROFILE }) {
  const [open, setOpen]       = useState(false)
  const [salary, setSalary]   = useState(profile.monthlyPayroll.toString())
  const [count, setCount]     = useState(profile.employeeCount.toString())

  const monthlyPayroll = parseFloat(salary) || 0
  const empCount       = parseInt(count)    || 1
  const perEmployee    = monthlyPayroll / empCount
  const costs          = calculateEmployeeCost(perEmployee, 30, monthlyPayroll)
  const totalCosts     = {
    paye:        costs.paye        * empCount,
    employeeUIF: costs.employeeUIF * empCount,
    employerUIF: costs.employerUIF * empCount,
    sdl:         costs.sdl,
    netSalary:   costs.netSalary   * empCount,
    totalCost:   costs.totalCost   * empCount,
  }
  const sdlExempt = monthlyPayroll * 12 < 500_000

  return (
    <div style={CARD}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} color="#7C3AED" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926' }}>PAYE & Employee Costs</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>
              {empCount} employee{empCount > 1 ? 's' : ''} — EMP201 due 7th of each month
            </div>
          </div>
        </div>
        {open ? <ChevronUp size={16} color="#718096" /> : <ChevronDown size={16} color="#718096" />}
      </button>

      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Number of Employees', value: count, set: setCount, type: 'number' },
              { label: 'Total Monthly Payroll (R)', value: salary, set: setSalary, type: 'number' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2D2926', marginBottom: 5 }}>{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Employee side */}
            <div style={{ background: '#F8FAFB', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', letterSpacing: '0.05em', marginBottom: 12, textTransform: 'uppercase' as const }}>Employee Deductions</div>
              {[
                { label: 'Gross Salary',    value: monthlyPayroll,          highlight: false },
                { label: 'Less: PAYE',      value: -totalCosts.paye,        highlight: false, color: '#DC2626' },
                { label: 'Less: UIF (1%)',  value: -totalCosts.employeeUIF, highlight: false, color: '#DC2626' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: 12, color: '#4A5568' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.color || '#2D2926' }}>
                    R {Math.abs(r.value).toFixed(2)}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2926' }}>Net Take-Home</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>R {totalCosts.netSalary.toFixed(2)}</span>
              </div>
            </div>

            {/* Employer side */}
            <div style={{ background: '#F8FAFB', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', letterSpacing: '0.05em', marginBottom: 12, textTransform: 'uppercase' as const }}>Your EMP201 Liability</div>
              {[
                { label: 'PAYE (employee)',     value: totalCosts.paye },
                { label: 'UIF — employee (1%)', value: totalCosts.employeeUIF },
                { label: 'UIF — employer (1%)', value: totalCosts.employerUIF },
                { label: `SDL (1%)${sdlExempt ? ' — EXEMPT' : ''}`, value: totalCosts.sdl },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: 12, color: r.label.includes('EXEMPT') ? '#9CA3AF' : '#4A5568' }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.label.includes('EXEMPT') ? '#9CA3AF' : '#2D2926' }}>
                    R {r.value.toFixed(2)}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2D2926' }}>Total Pay to SARS</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: COPPER }}>
                  R {(totalCosts.paye + totalCosts.employeeUIF + totalCosts.employerUIF + totalCosts.sdl).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, background: '#EFF6FF', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#1D4ED8' }}>
            ⚠️ Submit EMP201 and pay by the <strong>7th of each month</strong>. Late payment penalty: 10% of amount + interest.
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Compliance Calendar ──────────────────────────────────────────────────────
function ComplianceCalendar({ profile }: { profile: typeof MOCK_PROFILE }) {
  const events = useMemo(() => generateComplianceCalendar(
    profile.hasPAYE,
    profile.hasVAT,
    profile.onTurnoverTax,
    profile.monthlyPayroll / Math.max(1, profile.employeeCount),
    profile.monthlyRevenue
  ), [profile])

  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    overdue:  { bg: '#FEE2E2', color: '#DC2626', label: 'OVERDUE' },
    urgent:   { bg: '#FEF3C7', color: '#92400E', label: 'DUE SOON' },
    upcoming: { bg: '#E8F4F7', color: TEAL,      label: 'UPCOMING' },
    paid:     { bg: '#D1FAE5', color: '#059669', label: 'PAID' },
  }

  return (
    <div style={{ ...CARD, overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: '#FDF0EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={18} color={COPPER} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2926' }}>Compliance Calendar</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>Personalised to your tax registrations</div>
          </div>
        </div>
        <Pill
          label={`${events.filter(e => e.overdue || e.urgent).length} ACTION REQUIRED`}
          color="#92400E"
          bg="#FEF3C7"
        />
      </div>

      <div>
        {events.map((event, i) => {
          const statusKey = event.overdue ? 'overdue' : event.urgent ? 'urgent' : 'upcoming'
          const st = statusMap[statusKey]
          const typeIcons: Record<string, string> = {
            paye: '💼', vat201: '🧾', turnover_tax: '📋',
            provisional_tax: '📋', income_tax: '📄', emp501: '📊'
          }

          return (
            <div key={i} style={{
              padding: '14px 20px',
              borderBottom: i < events.length - 1 ? '1px solid #F8FAFB' : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: event.overdue ? '#FFF5F5' : event.urgent ? '#FFFBEB' : '#fff'
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1 }}>
                <div style={{ fontSize: 20, width: 32, textAlign: 'center' as const }}>
                  {typeIcons[event.type] || '📌'}
                </div>
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
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2D2926' }}>
                      R {event.estimatedAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
                <Pill label={st.label} color={st.color} bg={st.bg} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ComplyPage() {
  const profile = MOCK_PROFILE
  const tt      = calculateTurnoverTax(profile.annualTurnover)
  const costs   = calculateEmployeeCost(
    profile.monthlyPayroll / Math.max(1, profile.employeeCount),
    30,
    profile.monthlyPayroll
  )
  const monthlyEMP201 = (costs.paye + costs.employeeUIF + costs.employerUIF + costs.sdl) * profile.employeeCount

  return (
    <div>
      <TopBar title="KasiComply" subtitle="Stay ahead of SARS — your personalised compliance centre" />
      <div style={{ padding: '24px 28px', maxWidth: 1050 }}>

        {/* Alert banner */}
        <div style={{
          background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10,
          padding: '13px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <AlertTriangle size={16} color="#92400E" />
          <span style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>
            EMP201 (PAYE/UIF/SDL) for this month is due on the 7th. Estimated: R{monthlyEMP201.toFixed(2)}.
          </span>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
          <StatCard label="Annual Turnover Est." value={`R ${profile.annualTurnover.toLocaleString()}`}   sub="KasiBooks data"            icon={TrendingUp}  color={TEAL}      bg="#E8F4F7" />
          <StatCard label="Turnover Tax Due"      value={`R ${tt.taxDue.toFixed(2)}`}                     sub="Annual — due 28 Feb"       icon={FileText}    color={COPPER}    bg="#FDF0EA" />
          <StatCard label="Monthly EMP201"        value={`R ${monthlyEMP201.toFixed(2)}`}                 sub="PAYE + UIF + SDL"          icon={Users}       color="#7C3AED"   bg="#EDE9FE" />
          <StatCard label="Filings Up to Date"    value="3 / 3"                                           sub="No overdue submissions"    icon={CheckCircle} color="#059669"   bg="#D1FAE5" />
        </div>

        {/* Panels */}
        <SectionHeader title="Turnover Tax" sub="SARS simplified tax for businesses under R2.3 million turnover" />
        <TurnoverTaxPanel profile={profile} />

        <SectionHeader title="Tax Liability Calculator" sub="Adjust your monthly figures to see your real-time tax position" />
        <TaxCalculator profile={profile} />

        <SectionHeader title="PAYE & Employee Costs" sub="EMP201 submission breakdown — due 7th of every month" />
        <PAYECalculator profile={profile} />

        <SectionHeader title="Compliance Calendar" sub="Your personalised deadline schedule for the next 3 months" />
        <ComplianceCalendar profile={profile} />

        {/* ISV Banner */}
        <div style={{
          marginTop: 24, background: 'linear-gradient(135deg,#1F5C6B,#156C7D)',
          borderRadius: 12, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              🔜 Direct SARS eFiling Integration Coming Soon
            </div>
            <div style={{ color: '#8FBFC9', fontSize: 12 }}>
              KasiCommerce is applying to become a SARS ISV. Once approved, you will submit EMP201 and VAT201 returns directly from this dashboard.
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' as const, marginLeft: 20 }}>
            Notify Me
          </div>
        </div>

      </div>
    </div>
  )
}
