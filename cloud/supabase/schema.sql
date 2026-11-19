-- NEXA STOCK CONTROL — schema cloud per un account personale
-- Eseguire nel SQL Editor del progetto Supabase DOPO aver creato il progetto.
create table if not exists public.stock_state (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{"products":[],"moves":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.stock_state enable row level security;

drop policy if exists "owner can read own stock" on public.stock_state;
create policy "owner can read own stock"
  on public.stock_state for select
  to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "owner can insert own stock" on public.stock_state;
create policy "owner can insert own stock"
  on public.stock_state for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "owner can update own stock" on public.stock_state;
create policy "owner can update own stock"
  on public.stock_state for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

grant select, insert, update on public.stock_state to authenticated;
revoke all on public.stock_state from anon;

-- Abilita Realtime per la sincronizzazione multi-dispositivo.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'stock_state'
  ) then
    alter publication supabase_realtime add table public.stock_state;
  end if;
end $$;
