# Dabba Ledger

Tiffin ordering system for Aunty's kitchen — see [`PRD.md`](./PRD.md) for the full product spec.

Built with Next.js (App Router) + Supabase, chosen so the whole thing runs on free tiers (see PRD § Technical Architecture). Auth is **email OTP** — a 6-digit code sent by email, no SMS cost.

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In your Supabase project → **Authentication → Sign In / Providers → Email**, make sure "Confirm email" / OTP is enabled (default).
3. In **Authentication → Email Templates → Confirm signup / Magic Link**, make sure the template includes `{{ .Token }}` — that's the 6-digit code this app asks students to type in. (Supabase's default template already includes it; if you customized the template, just make sure the token placeholder is still there.)
4. Copy your project's **URL** and **anon public key** from Project Settings → API.
5. Copy the env template and fill in those two values:
   ```bash
   cp .env.local.example .env.local
   ```
6. Install dependencies and run the dev server:
   ```bash
   npm install
   npm run dev
   ```
7. Open [http://localhost:3000](http://localhost:3000), click "Sign in with email", and verify the code arrives and unlocks `/order`.

### On the free tier

Supabase's own email sender is rate-limited (a handful of emails per hour) — fine for local testing, but before real students start signing up, plug in a free transactional email provider (e.g. Resend or Brevo, both offer free tiers well above what ~150 students need) under Project Settings → Auth → SMTP Settings.

## What's built so far

- Email OTP sign-in (`/login`) — two-step: enter email → enter 6-digit code
- Session-aware middleware that gates protected routes (`/order`, `/dashboard`) and bounces signed-out visitors to `/login`
- `/order` — placeholder page proving the auth gate works end-to-end; meal ordering UI goes here next

## Deploying

Vercel's free tier is the natural fit for the Next.js frontend (see PRD). Add the same two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project settings.
