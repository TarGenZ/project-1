-- ============================================================
-- ArpanMentors — Full Schema v2
-- Run this in Supabase SQL Editor (safe to re-run)
-- ============================================================

-- Drop old purchases table and recreate with full schema
drop table if exists public.purchases cascade;
drop table if exists public.bookings cascade;
drop table if exists public.group_sessions cascade;
drop table if exists public.topper_applications cascade;
drop table if exists public.blocked_slots cascade;

-- ── 1. Purchases ────────────────────────────────────────────
create table public.purchases (
  id                   uuid default gen_random_uuid() primary key,
  user_id              uuid references auth.users(id) on delete cascade not null,

  -- plan identity
  plan_key             text not null,
  -- one of:
  --   personal_session      ₹499   single session, student picks date+slot
  --   group_session         ₹199   single session, admin schedules
  --   personal_monthly      ₹999   monthly, student picks weekly day+slot
  --   personal_yearly       ₹9999  yearly, student picks weekly day+slot
  --   group_monthly         ₹399   monthly, admin schedules weekly
  --   ghost_deal            variable Dec-May personal deal
  --   topper_yearly         variable 80% off yearly (post admin approval)

  plan_name            text not null,
  amount               integer not null,           -- in rupees
  billing_period       text not null default 'one_time',
  -- 'one_time' | 'monthly' | 'yearly'

  -- scheduling (for personal plans)
  scheduled_date       date,                        -- for personal_session
  scheduled_slot       text,                        -- e.g. "18:00"
  weekly_day           integer,                     -- 0=Sun..6=Sat for monthly/yearly
  weekly_slot          text,                        -- e.g. "19:00"

  -- payment
  razorpay_order_id    text,
  razorpay_payment_id  text,
  status               text default 'pending' check (status in ('pending','paid','failed')),

  -- meta
  is_topper_offer      boolean default false,
  is_ghost_deal        boolean default false,
  created_at           timestamptz default now()
);

alter table public.purchases enable row level security;

create policy "Users view own purchases"
  on public.purchases for select using (auth.uid() = user_id);

create policy "Users insert own purchases"
  on public.purchases for insert with check (auth.uid() = user_id);

-- ── 2. Group Sessions (admin sets these) ───────────────────
create table public.group_sessions (
  id           uuid default gen_random_uuid() primary key,
  plan_key     text not null,          -- 'group_session' | 'group_monthly'
  session_date date not null,
  session_slot text not null,          -- "18:00"
  zoom_link    text,
  notes        text,
  created_at   timestamptz default now()
);

alter table public.group_sessions enable row level security;

-- Everyone (paid users) can read group sessions
create policy "Public read group sessions"
  on public.group_sessions for select using (true);

-- Only service role / admin can insert (done via Supabase dashboard or admin panel)
-- We'll use a special admin flag on profiles for frontend admin writes

-- ── 3. Blocked Slots (admin marks unavailable dates/slots) ─
create table public.blocked_slots (
  id           uuid default gen_random_uuid() primary key,
  blocked_date date not null,
  slot         text,           -- null means whole day blocked
  reason       text,
  created_at   timestamptz default now()
);

alter table public.blocked_slots enable row level security;
create policy "Public read blocked slots"
  on public.blocked_slots for select using (true);

-- ── 4. Topper Applications ──────────────────────────────────
create table public.topper_applications (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  user_email     text not null,
  user_name      text,
  whatsapp       text not null,
  screenshot_url text,
  message        text,
  status         text default 'pending' check (status in ('pending','approved','rejected')),
  admin_note     text,
  created_at     timestamptz default now()
);

alter table public.topper_applications enable row level security;

create policy "Users view own applications"
  on public.topper_applications for select using (auth.uid() = user_id);

create policy "Users insert own applications"
  on public.topper_applications for insert with check (auth.uid() = user_id);

-- ── 5. Profiles (for admin role) ───────────────────────────
create table if not exists public.profiles (
  id        uuid references auth.users(id) on delete cascade primary key,
  is_admin  boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Make yourself admin (run after first login):
-- update public.profiles set is_admin = true where id = '<your-user-id>';

-- ── 6. Realtime ─────────────────────────────────────────────
alter publication supabase_realtime add table purchases;
alter publication supabase_realtime add table group_sessions;
alter publication supabase_realtime add table blocked_slots;

-- ── 7. Promo Codes ──────────────────────────────────────────
drop table if exists public.promo_codes cascade;
drop table if exists public.promo_uses cascade;

create table public.promo_codes (
  id                uuid default gen_random_uuid() primary key,
  code              text not null unique,             -- e.g. "NEET50"
  discount_pct      integer not null check (discount_pct between 1 and 100),
  max_uses_total    integer not null default 100,     -- total across all users
  max_uses_per_user integer not null default 1,       -- per single user
  uses_so_far       integer not null default 0,
  active            boolean default true,
  expires_at        timestamptz,                      -- null = never expires
  created_at        timestamptz default now()
);

alter table public.promo_codes enable row level security;

-- Anyone logged in can read active codes (to validate)
create policy "Logged in users can read active codes"
  on public.promo_codes for select
  using (auth.role() = 'authenticated' and active = true);

-- Only service role inserts (admin panel uses service role via API)
-- We'll add an admin API route for this

-- Promo uses — tracks who used what
create table public.promo_uses (
  id          uuid default gen_random_uuid() primary key,
  code_id     uuid references public.promo_codes(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  purchase_id uuid,   -- filled after purchase completes
  created_at  timestamptz default now(),
  unique(code_id, user_id, purchase_id)
);

alter table public.promo_uses enable row level security;

create policy "Users view own promo uses"
  on public.promo_uses for select using (auth.uid() = user_id);

create policy "Users insert own promo uses"
  on public.promo_uses for insert with check (auth.uid() = user_id);

-- ── 8. Add Zoom fields to purchases ────────────────────────
-- Run this if you already applied the earlier schema:
alter table public.purchases
  add column if not exists zoom_meeting_id  text,
  add column if not exists zoom_join_url    text,
  add column if not exists zoom_password    text,
  add column if not exists zoom_start_time  timestamptz;
