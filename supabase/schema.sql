-- ============================================================
-- Annapurna View Lodge — Hotel Management Schema
-- Run this once in Supabase SQL editor (Project > SQL Editor > New query)
-- ============================================================

-- ---------- ROOMS ----------
create table if not exists rooms (
  id int primary key,                 -- room number, e.g. 1..14
  bathroom_type text not null check (bathroom_type in ('attached','non_attached')),
  base_rate numeric not null default 0,        -- NPR per night, up to standard_occupancy people
  standard_occupancy int not null default 1,   -- people included in base_rate
  extra_person_rate numeric not null default 0,-- NPR per extra person per night
  is_active boolean not null default true,     -- soft-disable a room (maintenance etc.)
  notes text
);

-- ---------- STAYS (one row per check-in -> check-out cycle) ----------
create table if not exists stays (
  id uuid primary key default gen_random_uuid(),
  room_id int not null references rooms(id),
  patient_name text,
  address text,
  contact_number text,
  check_in_at timestamptz not null default now(),
  check_out_at timestamptz,
  status text not null default 'occupied' check (status in ('occupied','checked_out')),
  expected_return_date date,  -- owner's note: "expected to come back around..."
  created_at timestamptz not null default now()
);

create index if not exists idx_stays_room on stays(room_id);
create index if not exists idx_stays_status on stays(status);

-- ---------- ROOM TRANSFER HISTORY (guest shifted from one room to another) ----------
create table if not exists room_transfers (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references stays(id) on delete cascade,
  from_room_id int references rooms(id),
  to_room_id int not null references rooms(id),
  transferred_at timestamptz not null default now(),
  note text
);

-- ---------- OCCUPANCY PERIODS ----------
-- Number of people in the room can change mid-stay; each period has its own
-- headcount so that extra-person charges only apply to the days they applied.
create table if not exists occupancy_periods (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references stays(id) on delete cascade,
  start_date date not null,     -- inclusive, hotel-day (see billing.js for the 3AM cutoff rule)
  end_date date,                -- inclusive, null = ongoing (still checked in)
  occupant_count int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_occupancy_stay on occupancy_periods(stay_id);

-- ---------- ADD-ON CATALOG (owner-editable list of extra services) ----------
create table if not exists addon_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- e.g. Gas cylinder, Gas refill, Utensils, Electrical appliance, Custom
  default_price numeric not null default 0,
  unit_type text not null default 'one_time' check (unit_type in ('one_time','per_day')),
  is_active boolean not null default true
);

insert into addon_catalog (name, default_price, unit_type)
select * from (values
  ('Gas cylinder', 0, 'per_day'),
  ('Gas refill', 0, 'one_time'),
  ('Utensils set', 0, 'per_day'),
  ('Electrical appliance use', 0, 'per_day'),
  ('Other', 0, 'per_day')
) as seed(name, default_price, unit_type)
where not exists (select 1 from addon_catalog);

-- ---------- ADD-ON ENTRIES (billable to a stay, can be backdated/edited) ----------
create table if not exists addon_entries (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references stays(id) on delete cascade,
  addon_catalog_id uuid not null references addon_catalog(id),
  label text,                          -- optional free-text override of catalog name
  start_date date not null,            -- for per_time services this is the date charged
  end_date date,                       -- for per_day services spanning an interval; null = single day / one_time
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  total numeric generated always as (quantity * unit_price) stored,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_addon_stay on addon_entries(stay_id);

-- ---------- PAYMENTS ----------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  stay_id uuid not null references stays(id) on delete cascade,
  amount numeric not null,
  method text not null check (method in ('cash','qr')),
  paid_at timestamptz not null default now(),
  note text
);

-- ---------- SETTINGS (single row, key/value for flexibility) ----------
create table if not exists settings (
  key text primary key,
  value jsonb not null
);

insert into settings (key, value) values
  ('hotel_profile', '{"name":"Bisek Atithi Griha","address":"Bharatpur, Bagmati Province, Nepal","phone":"","near":"B.P. Koirala Memorial Cancer Hospital"}'),
  ('checkin_hour', '3'),
  ('qr_image_url', 'null')
on conflict (key) do nothing;

-- ============================================================
-- Row Level Security — this is PRIVATE business data.
-- Only authenticated users (the owner / staff you create logins for
-- in Supabase Authentication) can read or write. The public marketing
-- site does NOT need any of these tables.
-- ============================================================
alter table rooms enable row level security;
alter table stays enable row level security;
alter table room_transfers enable row level security;
alter table occupancy_periods enable row level security;
alter table addon_catalog enable row level security;
alter table addon_entries enable row level security;
alter table payments enable row level security;
alter table settings enable row level security;

create policy "authenticated full access" on rooms for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on stays for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on room_transfers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on occupancy_periods for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on addon_catalog for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on addon_entries for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on payments for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- Seed the 14 rooms (edit rates after import!) ----------
insert into rooms (id, bathroom_type, base_rate, standard_occupancy, extra_person_rate)
select * from (values
  (1,'attached',1200,2,300), (2,'attached',1200,2,300), (3,'attached',1200,2,300),
  (4,'attached',1200,2,300), (5,'non_attached',900,2,250), (6,'non_attached',900,2,250),
  (7,'non_attached',900,2,250), (8,'non_attached',900,2,250), (9,'attached',1200,2,300),
  (10,'attached',1200,2,300), (11,'non_attached',900,2,250), (12,'non_attached',900,2,250),
  (13,'attached',1200,2,300), (14,'non_attached',900,2,250)
) as seed(id, bathroom_type, base_rate, standard_occupancy, extra_person_rate)
where not exists (select 1 from rooms);
