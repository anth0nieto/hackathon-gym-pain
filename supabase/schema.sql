-- Schema applied to the hackathon-gym-pain Supabase project.
-- Column names are camelCase so rows map 1:1 to src/types.ts with no mapping layer.
create table users (
  id text primary key,
  name text not null,
  role text not null check (role in ('coach', 'student')),
  "coachId" text references users(id),
  dni text unique
);

create table templates (
  id text primary key,
  "coachId" text not null references users(id),
  name text not null,
  exercises jsonb not null default '[]'
);

-- templateId has no FK: it only records which template a routine came from.
create table routines (
  id text primary key,
  "coachId" text not null references users(id),
  "studentId" text not null references users(id) on delete cascade,
  date date not null,
  name text not null,
  "templateId" text,
  exercises jsonb not null default '[]'
);

create table logs (
  "routineId" text not null references routines(id) on delete cascade,
  "exerciseId" text not null,
  status text not null check (status in ('done', 'skipped')),
  sets int not null,
  reps int not null,
  weight numeric not null,
  "updatedAt" timestamptz not null default now(),
  primary key ("routineId", "exerciseId")
);

-- Demo only: no per-user auth yet (DNI login), so the publishable key can read and write everything.
alter table users enable row level security;
alter table templates enable row level security;
alter table routines enable row level security;
alter table logs enable row level security;
create policy demo_all on users for all to anon using (true) with check (true);
create policy demo_all on templates for all to anon using (true) with check (true);
create policy demo_all on routines for all to anon using (true) with check (true);
create policy demo_all on logs for all to anon using (true) with check (true);

alter publication supabase_realtime add table users, templates, routines, logs;
