-- Schema applied to the hackathon-gym-pain Supabase project.
-- Column names are camelCase so rows map 1:1 to src/types.ts with no mapping layer.
create table users (
  id text primary key,
  name text not null,
  role text not null check (role in ('coach', 'student')),
  "coachId" text references users(id),
  dni text unique,
  "daysPerWeek" int check ("daysPerWeek" between 1 and 7)
);

create table templates (
  id text primary key,
  "coachId" text not null references users(id),
  name text not null,
  exercises jsonb not null default '[]'
);

-- Routines rotate in order (position 1..N), N = the student's daysPerWeek.
-- templateId has no FK: it only records which template a routine came from.
create table routines (
  id text primary key,
  "coachId" text not null references users(id),
  "studentId" text not null references users(id) on delete cascade,
  position int not null,
  name text not null,
  "templateId" text,
  exercises jsonb not null default '[]',
  -- Exercises for the next time only, set by the coach; cleared when that session starts.
  override jsonb
);

-- One time the student trained a routine. routineId has no FK and position/routineName
-- are copied, so history survives the coach editing or deleting the routine.
create table sessions (
  id text primary key,
  "studentId" text not null references users(id) on delete cascade,
  "routineId" text not null,
  position int not null,
  "routineName" text not null,
  -- What was planned that day (the routine or its override).
  exercises jsonb not null default '[]',
  "startedAt" timestamptz not null default now(),
  "finishedAt" timestamptz
);

create table logs (
  "sessionId" text not null references sessions(id) on delete cascade,
  "exerciseId" text not null,
  "exerciseName" text not null,
  status text not null check (status in ('done', 'skipped')),
  sets int not null,
  reps int not null,
  weight numeric not null,
  -- Every set as done: [{ "reps": 8, "weight": 60 }, ...]. sets/reps/weight keep the count and the last set.
  "setDetails" jsonb,
  "updatedAt" timestamptz not null default now(),
  primary key ("sessionId", "exerciseId")
);

-- Demo only: no per-user auth yet (DNI login), so the publishable key can read and write everything.
alter table users enable row level security;
alter table templates enable row level security;
alter table routines enable row level security;
alter table sessions enable row level security;
alter table logs enable row level security;
create policy demo_all on users for all to anon using (true) with check (true);
create policy demo_all on templates for all to anon using (true) with check (true);
create policy demo_all on routines for all to anon using (true) with check (true);
create policy demo_all on sessions for all to anon using (true) with check (true);
create policy demo_all on logs for all to anon using (true) with check (true);

alter publication supabase_realtime add table users, templates, routines, sessions, logs;
