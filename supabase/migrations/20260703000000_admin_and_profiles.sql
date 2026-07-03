-- Tabela de perfis públicos (dados extras como WhatsApp)
create table if not exists public.user_profiles (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  whatsapp  text,
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

-- Usuário pode ler e editar seu próprio perfil
create policy "users_own_profile_select"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "users_own_profile_insert"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "users_own_profile_update"
  on public.user_profiles for update
  using (auth.uid() = user_id);

-- View de admin: junta auth.users + subscriptions + user_profiles
-- Acessível apenas por service_role (chamado via Edge Function ou RPC com SECURITY DEFINER)
create or replace view public.admin_users_view as
  select
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    s.plan,
    s.status as subscription_status,
    s.current_period_end,
    p.whatsapp
  from auth.users u
  left join public.subscriptions s on s.user_id = u.id
  left join public.user_profiles p on p.user_id = u.id
  order by u.created_at desc;

-- RPC segura para o admin buscar todos os usuários
create or replace function public.get_all_users_for_admin()
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  plan text,
  subscription_status text,
  current_period_end timestamptz,
  whatsapp text
)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    u.email::text,
    u.created_at,
    u.last_sign_in_at,
    s.plan,
    s.status,
    s.current_period_end,
    p.whatsapp
  from auth.users u
  left join public.subscriptions s on s.user_id = u.id
  left join public.user_profiles p on p.user_id = u.id
  order by u.created_at desc;
$$;

-- Garante que apenas usuários autenticados chamem (a checagem de admin é no app)
grant execute on function public.get_all_users_for_admin() to authenticated;
