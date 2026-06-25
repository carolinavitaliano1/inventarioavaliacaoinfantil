-- Run this SQL in your Supabase project: SQL Editor → New query → paste & run

-- 1. Tabela de avaliações
create table if not exists assessments (
  id          text primary key,
  child_id    text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  student_info jsonb not null default '{}',
  responses   jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índice para buscar avaliações do usuário
create index if not exists assessments_user_id_idx on assessments(user_id);

-- RLS: cada usuário só vê/edita suas próprias avaliações
alter table assessments enable row level security;

create policy "Usuário lê suas avaliações"
  on assessments for select
  using (auth.uid() = user_id);

create policy "Usuário insere suas avaliações"
  on assessments for insert
  with check (auth.uid() = user_id);

create policy "Usuário atualiza suas avaliações"
  on assessments for update
  using (auth.uid() = user_id);

create policy "Usuário exclui suas avaliações"
  on assessments for delete
  using (auth.uid() = user_id);

-- 2. Tabela de avisos (announcements)
create table if not exists announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade
);

-- RLS: qualquer usuário autenticado lê; só admin insere/exclui
alter table announcements enable row level security;

create policy "Usuários autenticados lêem avisos"
  on announcements for select
  to authenticated
  using (true);

create policy "Admin insere avisos"
  on announcements for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Admin exclui avisos"
  on announcements for delete
  to authenticated
  using (auth.uid() = created_by);
