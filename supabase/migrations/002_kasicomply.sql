-- Tax registrations per business
create table tax_registrations (
  id                    uuid primary key default uuid_generate_v4(),
  created_at            timestamptz default now(),
  business_id           uuid not null references businesses(id) on delete cascade,
  has_income_tax        boolean not null default false,
  income_tax_ref        text,
  has_vat               boolean not null default false,
  vat_ref               text,
  has_paye              boolean not null default false,
  paye_ref              text,
  on_turnover_tax       boolean not null default false,
  turnover_tax_ref      text,
  annual_turnover_est   numeric(14,2),
  employee_count        integer not null default 0,
  tax_year_end          text not null default 'February',
  registered_at         timestamptz
);

-- Compliance events (deadlines + history)
create table compliance_events (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now(),
  business_id     uuid not null references businesses(id) on delete cascade,
  event_type      text not null check (event_type in (
                    'paye','uif','sdl','vat201','turnover_tax',
                    'provisional_tax','income_tax','emp501'
                  )),
  period_label    text not null,
  due_date        date not null,
  amount_due      numeric(12,2),
  status          text not null default 'upcoming'
                    check (status in ('upcoming','due_soon','overdue','submitted','paid')),
  submitted_at    timestamptz,
  reference_no    text,
  notes           text
);

-- Tax assessments (calculated snapshots)
create table tax_assessments (
  id                    uuid primary key default uuid_generate_v4(),
  created_at            timestamptz default now(),
  business_id           uuid not null references businesses(id) on delete cascade,
  period_start          date not null,
  period_end            date not null,
  gross_income          numeric(14,2) not null default 0,
  total_expenses        numeric(14,2) not null default 0,
  net_profit            numeric(14,2) not null default 0,
  -- Turnover Tax
  turnover_tax_rate     numeric(5,4),
  turnover_tax_due      numeric(12,2),
  -- VAT (if registered)
  vat_output            numeric(12,2),
  vat_input             numeric(12,2),
  vat_payable           numeric(12,2),
  -- PAYE (if has employees)
  total_paye_due        numeric(12,2),
  total_uif_due         numeric(12,2),
  total_sdl_due         numeric(12,2),
  assessment_type       text not null default 'auto'
                          check (assessment_type in ('auto','manual','reviewed'))
);

-- Employees (for PAYE)
create table employees (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now(),
  business_id     uuid not null references businesses(id) on delete cascade,
  full_name       text not null,
  id_number       text,
  monthly_salary  numeric(10,2) not null,
  start_date      date not null,
  status          text not null default 'active' check (status in ('active','terminated'))
);

-- Indexes
create index idx_tax_reg_business     on tax_registrations(business_id);
create index idx_comply_events_biz    on compliance_events(business_id);
create index idx_comply_events_due    on compliance_events(due_date);
create index idx_assessments_biz      on tax_assessments(business_id);
create index idx_employees_biz        on employees(business_id);

-- RLS
alter table tax_registrations  enable row level security;
alter table compliance_events  enable row level security;
alter table tax_assessments    enable row level security;
alter table employees          enable row level security;

create policy "Allow all on tax_registrations"  on tax_registrations  for all using (true) with check (true);
create policy "Allow all on compliance_events"  on compliance_events  for all using (true) with check (true);
create policy "Allow all on tax_assessments"    on tax_assessments    for all using (true) with check (true);
create policy "Allow all on employees"          on employees          for all using (true) with check (true);
