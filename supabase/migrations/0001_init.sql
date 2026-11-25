-- Expense tracker schema. Money is stored in integer minor units (pence).
-- Auth: Clerk third-party auth. user_id = Clerk user id from the JWT "sub" claim.

create or replace function public.requesting_user_id() returns text
language sql stable as $$ select auth.jwt() ->> 'sub' $$;

-- ---------- accounts ----------
create table public.accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null default public.requesting_user_id(),
  name             text not null,
  type             text not null default 'current'
                     check (type in ('current', 'savings', 'credit', 'cash', 'other')),
  currency         char(3) not null default 'GBP',
  opening_balance  bigint not null default 0,
  colour           text,
  archived         boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ---------- categories ----------
create table public.categories (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null default public.requesting_user_id(),
  name            text not null,
  icon            text,
  kind            text not null default 'expense' check (kind in ('expense', 'income')),
  monthly_budget  bigint,
  created_at      timestamptz not null default now(),
  unique (user_id, name, kind)
);

-- ---------- transactions ----------
create table public.transactions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              text not null default public.requesting_user_id(),
  account_id           uuid not null references public.accounts(id) on delete cascade,
  category_id          uuid references public.categories(id) on delete set null,
  type                 text not null check (type in ('expense', 'income', 'transfer')),
  amount               bigint not null check (amount > 0),
  transfer_account_id  uuid references public.accounts(id) on delete cascade,
  note                 text,
  occurred_at          date not null default current_date,
  created_via          text not null default 'manual' check (created_via in ('manual', 'ai', 'import')),
  created_at           timestamptz not null default now(),
  check ((type = 'transfer') = (transfer_account_id is not null))
);
create index on public.transactions (user_id, occurred_at desc);
create index on public.transactions (account_id);

-- ---------- savings goals ----------
create table public.goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null default public.requesting_user_id(),
  name           text not null,
  target_amount  bigint not null check (target_amount > 0),
  saved_amount   bigint not null default 0,
  due_date       date,
  created_at     timestamptz not null default now()
);

-- ---------- recurring bills / upcoming payments ----------
create table public.recurring (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null default public.requesting_user_id(),
  name         text not null,
  amount       bigint not null check (amount > 0),
  category_id  uuid references public.categories(id) on delete set null,
  account_id   uuid references public.accounts(id) on delete set null,
  frequency    text not null default 'monthly' check (frequency in ('weekly', 'monthly', 'yearly', 'once')),
  next_due     date not null,
  created_at   timestamptz not null default now()
);

-- ---------- cached AI monthly insights ----------
create table public.ai_insights (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null default public.requesting_user_id(),
  month       date not null,  -- first day of month
  summary     jsonb not null,
  created_at  timestamptz not null default now(),
  unique (user_id, month)
);

-- ---------- Row Level Security: each user sees only their own rows ----------
do $$
declare t text;
begin
  foreach t in array array['accounts','categories','transactions','goals','recurring','ai_insights'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using (user_id = public.requesting_user_id())
         with check (user_id = public.requesting_user_id())', t);
  end loop;
end $$;

-- ---------- live balances (derived, never stored) ----------
create view public.account_balances with (security_invoker = true) as
select
  a.id,
  a.user_id,
  a.name,
  a.type,
  a.currency,
  a.archived,
  a.opening_balance
    + coalesce(sum(case
        when t.type = 'income'   and t.account_id = a.id          then  t.amount
        when t.type = 'expense'  and t.account_id = a.id          then -t.amount
        when t.type = 'transfer' and t.account_id = a.id          then -t.amount
        when t.type = 'transfer' and t.transfer_account_id = a.id then  t.amount
      end), 0) as balance
from public.accounts a
left join public.transactions t
  on t.account_id = a.id or t.transfer_account_id = a.id
group by a.id;
