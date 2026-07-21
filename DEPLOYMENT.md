# KasiCommerce — Deployment Guide

## Stack
- **Framework:** Next.js 16 (App Router, TypeScript)
- **Database:** Supabase (PostgreSQL + RLS + Auth)
- **WhatsApp API:** Twilio (BSP for Meta WhatsApp Business Platform)
- **Hosting:** Vercel
- **Brand:** Vhuthu Finance teal `#156C7D` / `#1F5C6B` + copper `#C45C2E` / `#E78F5C`

---

## Step 1: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste and run `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from Settings → API

---

## Step 2: Twilio WhatsApp Setup

1. Sign up at [twilio.com](https://twilio.com)
2. Navigate to Messaging → Try it out → Send a WhatsApp message
3. Note your Account SID, Auth Token, and sandbox number
4. For production: apply for a WhatsApp Business Profile via Twilio Console
5. Set webhook URL to: `https://your-domain.vercel.app/api/webhook/whatsapp`
6. Set HTTP method to: **POST**

---

## Step 3: Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+27673559833
NEXT_PUBLIC_APP_URL=https://kasicommerce.co.za
```

---

## Step 4: Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add all env vars in Vercel project settings (Settings → Environment Variables).

---

## Step 5: Test the WhatsApp Bot

In Twilio sandbox, WhatsApp `join <your-sandbox-word>` to opt in, then send any message to start onboarding.

**Test flow:**
1. Send `Hi` → Welcome message + language choice
2. Reply `1` (English)
3. Enter your name
4. Enter business name
5. Select business type
6. You are now in the main menu — reply `1` to log a transaction

---

## Pillar Roadmap

| Pillar | Status | Notes |
|---|---|---|
| KasiBooks (WhatsApp bot) | ✅ Live | Full state machine implemented |
| KasiBooks (Dashboard) | ✅ Live | Transaction table + log form |
| KasiComply | 🔶 Beta | Filing schedule UI live; SARS integration Phase 2 |
| KasiStore | 🔶 Beta | Store link generation live; product CRUD Phase 2 |
| KasiCredit | 🔜 Soon | Eligibility check live; lender API Phase 3 |
| Kasi Champions | 🔜 Soon | Dashboard scaffolded; activation Phase 2 |

---

## Domain
Register `kasicommerce.co.za` via Afrihost or 1-grid (~R150/year).
Point DNS to Vercel.

---

## Support
Built on Next.js 16 + Supabase + Twilio. Same stack as Vhuthu Finance and Built On Purpose.
