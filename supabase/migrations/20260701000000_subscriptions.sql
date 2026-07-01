-- Tabela de assinaturas vinculadas ao usuário Supabase Auth
create table if not exists public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id    text,
  stripe_subscription_id text,
  stripe_price_id       text,
  plan                  text check (plan in ('trimestral', 'anual')),
  status                text not null default 'inactive',
  -- active | inactive | past_due | canceled | trialing
  current_period_end    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Usuário só vê sua própria assinatura
create policy "users_own_subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Apenas service_role pode inserir/atualizar (webhook)
create policy "service_role_write"
  on public.subscriptions for all
  using (auth.role() = 'service_role');

-- Índice para busca rápida por stripe_subscription_id (usado no webhook)
create index if not exists idx_sub_stripe_id on public.subscriptions(stripe_subscription_id);
create index if not exists idx_sub_user_id on public.subscriptions(user_id);
