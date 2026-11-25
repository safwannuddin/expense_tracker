# Pocket: AI-powered personal expense tracker

Track spending across your own accounts (manual balances, no bank linking), see
monthly totals, and plan savings for upcoming bills and goals. Installable on a
phone as a PWA.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind v4 + shadcn/ui (Base UI) ·
Clerk (auth) · Supabase Postgres with Row Level Security · Gemini free tier (AI) · Vercel.

## One-time setup

1. **Clerk** – create an application → copy the publishable and secret keys.
2. **Supabase** – create a project (region: London `eu-west-2`).
   - Authentication → Sign In / Providers → **Third-party auth → Add Clerk**, and
     in the Clerk dashboard enable the **Supabase integration** (it gives you the Clerk domain to paste).
   - SQL Editor → run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   - Project Settings → API → copy the URL and the **publishable** key.
3. **Gemini** – get a free key at https://aistudio.google.com/apikey.
4. `cp .env.example .env.local` and fill it in.
5. `npm run dev` → http://localhost:3000

## How data is protected

The browser never talks to Supabase with elevated keys. Server code forwards the
signed-in user's Clerk token; Supabase verifies it, and RLS policies only allow
rows where `user_id = auth.jwt()->>'sub'`. Money is stored as integer pence.
Account balances are computed by the `account_balances` view, so they can never drift.

## Roadmap

- [x] **Phase 0**: scaffold, Clerk auth, Supabase schema + RLS, Gemini helper, PWA manifest
- [ ] **Phase 1**: accounts (add/edit/archive, live balances), quick-add expense, transaction list, transfers
- [ ] **Phase 2**: monthly dashboard + charts, category budgets, goals & recurring bills, "safe to spend"
- [ ] **Phase 3**: AI quick-add ("20 bus monzo"), auto-categorise, monthly AI report
- [ ] **Phase 4**: offline support, dark mode, CSV import/export, multi-currency
- [ ] **Later**: invite friends, receipt photo scanning
