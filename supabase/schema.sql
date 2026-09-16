-- Bank Ideas platform schema.
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 500),
  category text not null check (
    category in (
      'Customer Experience',
      'Operations',
      'Digital Banking',
      'AI & Automation',
      'Employee Experience'
    )
  ),
  submitted_by text not null default 'Anonymous',
  votes integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ideas_category_idx on public.ideas (category);
create index if not exists ideas_created_at_idx on public.ideas (created_at desc);

-- Row Level Security: this is an internal tool with no auth, so everyone
-- with the anon key can read and submit ideas. Votes are NOT updatable
-- directly -- they can only change through the increment_idea_vote()
-- function below, which prevents anyone from setting votes to an
-- arbitrary value via a direct table update.
alter table public.ideas enable row level security;

drop policy if exists "Anyone can view ideas" on public.ideas;
create policy "Anyone can view ideas"
  on public.ideas for select
  using (true);

drop policy if exists "Anyone can submit ideas" on public.ideas;
create policy "Anyone can submit ideas"
  on public.ideas for insert
  with check (true);

-- Atomic, safe vote increment exposed as an RPC. security definer lets it
-- bypass the lack of an UPDATE policy while still only ever doing "+1".
create or replace function public.increment_idea_vote(idea_id uuid)
returns public.ideas
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.ideas;
begin
  update public.ideas
  set votes = votes + 1
  where id = idea_id
  returning * into updated_row;

  return updated_row;
end;
$$;

grant execute on function public.increment_idea_vote(uuid) to anon, authenticated;

-- Enable realtime so new/updated ideas broadcast to every open browser tab.
alter publication supabase_realtime add table public.ideas;
