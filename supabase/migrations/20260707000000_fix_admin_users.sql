-- ============================================================
-- Garante que o admin consiga listar todos os usuários
-- Cole este SQL no SQL Editor do Supabase e execute.
-- ============================================================

-- 1. Garante a tabela de perfis (WhatsApp etc.)
create table if not exists public.user_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  whatsapp   text,
  updated_at timestamptz not null default now()
);
alter table public.user_profiles enable row level security;

-- 2. Recria a função de listagem para o admin (SECURITY DEFINER)
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
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Só a admin pode executar
  if (select u.email from auth.users u where u.id = auth.uid()) <> 'carolinavitaliano1@gmail.com' then
    raise exception 'Acesso negado';
  end if;

  return query
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
    left join public.user_profiles  p on p.user_id = u.id
    order by u.created_at desc;
end;
$$;

-- 3. Permite que usuários autenticados chamem (a checagem de admin é interna)
revoke all on function public.get_all_users_for_admin() from public;
grant execute on function public.get_all_users_for_admin() to authenticated;
