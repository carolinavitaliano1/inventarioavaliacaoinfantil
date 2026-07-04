-- ============================================================
-- Correções de segurança
-- ============================================================

-- ── 1. Revogar get_all_users_for_admin de authenticated ─────
-- Apenas o email da admin pode executar essa função.
-- Recriamos com checagem interna de email.
revoke execute on function public.get_all_users_for_admin() from authenticated;

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
  -- Verifica se o chamador é o admin
  if (select email from auth.users where id = auth.uid()) != 'carolinavitaliano1@gmail.com' then
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
    left join public.user_profiles p on p.user_id = u.id
    order by u.created_at desc;
end;
$$;

-- Concede novamente, mas agora com a checagem de email dentro da função
grant execute on function public.get_all_users_for_admin() to authenticated;


-- ── 2. RLS para tabela patients ──────────────────────────────
alter table if exists public.patients enable row level security;

drop policy if exists "Paciente select" on public.patients;
drop policy if exists "Paciente insert" on public.patients;
drop policy if exists "Paciente update" on public.patients;
drop policy if exists "Paciente delete" on public.patients;

create policy "Paciente select"
  on public.patients for select
  using (auth.uid() = user_id);

create policy "Paciente insert"
  on public.patients for insert
  with check (auth.uid() = user_id);

create policy "Paciente update"
  on public.patients for update
  using (auth.uid() = user_id);

create policy "Paciente delete"
  on public.patients for delete
  using (auth.uid() = user_id);


-- ── 3. RLS para community_posts ──────────────────────────────
alter table if exists public.community_posts enable row level security;

drop policy if exists "Post select" on public.community_posts;
drop policy if exists "Post insert" on public.community_posts;
drop policy if exists "Post delete" on public.community_posts;

create policy "Post select"
  on public.community_posts for select
  to authenticated
  using (true);

create policy "Post insert"
  on public.community_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Autor exclui o próprio post OU admin exclui qualquer post
create policy "Post delete"
  on public.community_posts for delete
  to authenticated
  using (
    auth.uid() = user_id
    or (select email from auth.users where id = auth.uid()) = 'carolinavitaliano1@gmail.com'
  );


-- ── 4. RLS para community_replies ───────────────────────────
alter table if exists public.community_replies enable row level security;

drop policy if exists "Reply select" on public.community_replies;
drop policy if exists "Reply insert" on public.community_replies;
drop policy if exists "Reply delete" on public.community_replies;

create policy "Reply select"
  on public.community_replies for select
  to authenticated
  using (true);

create policy "Reply insert"
  on public.community_replies for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Reply delete"
  on public.community_replies for delete
  to authenticated
  using (
    auth.uid() = user_id
    or (select email from auth.users where id = auth.uid()) = 'carolinavitaliano1@gmail.com'
  );


-- ── 5. Corrigir policy de announcements (só admin insere) ───
drop policy if exists "Admin insere avisos" on public.announcements;
drop policy if exists "Admin exclui avisos" on public.announcements;

create policy "Admin insere avisos"
  on public.announcements for insert
  to authenticated
  with check (
    (select email from auth.users where id = auth.uid()) = 'carolinavitaliano1@gmail.com'
  );

create policy "Admin exclui avisos"
  on public.announcements for delete
  to authenticated
  using (
    (select email from auth.users where id = auth.uid()) = 'carolinavitaliano1@gmail.com'
  );
