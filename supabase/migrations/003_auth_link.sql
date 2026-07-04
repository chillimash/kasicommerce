-- Allow Supabase Auth phone OTP to link to existing business records
-- Run this in Supabase SQL Editor

-- Add unique constraint on phone if not exists
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'businesses_phone_key'
  ) then
    alter table businesses add constraint businesses_phone_key unique (phone);
  end if;
end $$;

-- Enable phone auth in Supabase Dashboard:
-- Authentication → Providers → Phone → Enable
-- Set OTP channel to "WhatsApp" (uses Twilio Verify)

-- RLS policy: users can only see their own business (matched by phone)
drop policy if exists "Allow all on businesses" on businesses;

create policy "Users can read own business"
on businesses for select
using (
  auth.jwt() ->> 'phone' = phone
  or (auth.jwt() -> 'user_metadata' ->> 'phone') = phone
);

create policy "Users can update own business"
on businesses for update
using (
  auth.jwt() ->> 'phone' = phone
  or (auth.jwt() -> 'user_metadata' ->> 'phone') = phone
);

create policy "Allow insert for authenticated"
on businesses for insert
with check (auth.uid() is not null);

-- RLS for transactions — users see only their business transactions
drop policy if exists "Allow all on transactions" on transactions;

create policy "Users see own transactions"
on transactions for all
using (
  business_id in (
    select id from businesses
    where phone = auth.jwt() ->> 'phone'
    or phone = (auth.jwt() -> 'user_metadata' ->> 'phone')
  )
)
with check (
  business_id in (
    select id from businesses
    where phone = auth.jwt() ->> 'phone'
    or phone = (auth.jwt() -> 'user_metadata' ->> 'phone')
  )
);

-- Same pattern for other tables
drop policy if exists "Allow all on tax_registrations" on tax_registrations;
create policy "Users see own tax registrations"
on tax_registrations for all
using (business_id in (select id from businesses where phone = auth.jwt() ->> 'phone' or phone = (auth.jwt()->'user_metadata'->>'phone')))
with check (business_id in (select id from businesses where phone = auth.jwt() ->> 'phone' or phone = (auth.jwt()->'user_metadata'->>'phone')));

drop policy if exists "Allow all on compliance_events" on compliance_events;
create policy "Users see own compliance events"
on compliance_events for all
using (business_id in (select id from businesses where phone = auth.jwt() ->> 'phone' or phone = (auth.jwt()->'user_metadata'->>'phone')))
with check (business_id in (select id from businesses where phone = auth.jwt() ->> 'phone' or phone = (auth.jwt()->'user_metadata'->>'phone')));

drop policy if exists "Allow all on store_products" on store_products;
create policy "Users see own products"
on store_products for all
using (business_id in (select id from businesses where phone = auth.jwt() ->> 'phone' or phone = (auth.jwt()->'user_metadata'->>'phone')))
with check (business_id in (select id from businesses where phone = auth.jwt() ->> 'phone' or phone = (auth.jwt()->'user_metadata'->>'phone')));

drop policy if exists "Allow all on credit_applications" on credit_applications;
create policy "Users see own credit applications"
on credit_applications for all
using (business_id in (select id from businesses where phone = auth.jwt() ->> 'phone' or phone = (auth.jwt()->'user_metadata'->>'phone')))
with check (business_id in (select id from businesses where phone = auth.jwt() ->> 'phone' or phone = (auth.jwt()->'user_metadata'->>'phone')));

-- WhatsApp bot uses service role key — bypass RLS
-- No policy needed for whatsapp_sessions (service role bypasses RLS)
