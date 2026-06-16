# HealthOS

Biological age reversal app — track your BioAge, upload lab reports, follow a personalised anti-inflammatory diet plan, and share your transformation.

**Live demo:** https://healthos-app-two.vercel.app

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite + React (JavaScript) |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| AI (OCR) | Claude claude-sonnet-4-6 via Anthropic API |
| Database | Supabase (Postgres) |
| Deploy | Vercel (frontend) |

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/healthos-app.git
cd healthos-app
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env` with your keys:

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `SUPABASE_URL` | supabase.com → Project Settings → API |
| `SUPABASE_SERVICE_KEY` | Same page — use the service_role key |

### 3. Set up Supabase database

Run `supabase-schema.sql` in your Supabase project SQL Editor.

### 4. Run locally

```bash
npm run dev
```

Starts both:
- **UI** at http://localhost:5173
- **API** at http://localhost:3001

Vite proxies `/api/*` to Express automatically.

---

## How the upload pipeline works

```
User uploads PDF / photo
        ↓
POST /api/upload  (Express + Multer — in-memory, no disk writes)
        ↓
Claude claude-sonnet-4-6  (reads file, returns structured biomarker JSON)
        ↓
Supabase Postgres  (saves to reports table)
        ↓
Frontend  (shows expandable biomarker table per upload)
```

No API key? Falls back to demo mode automatically.

---

## Screens

| Route | Screen |
|-------|--------|
| `/` | Home — BioAge hero, family tracker |
| `/trends` | BioAge trends — ring chart, AI coach |
| `/upload` | Lab Reports — real AI extraction |
| `/devices` | Devices — smartwatch / ring / phone |
| `/protocol` | Protocol — exercise + sleep habits |
| `/diet` | Diet Plan — 4 types + allergy gate |
| `/progress` | Progress — BioAge chart |
| `/share` | Share — Instagram Story + WhatsApp |
| `/subscribe` | Subscribe — Plus plan |

---

## Deploy frontend

```bash
npm run build
vercel --prod
```
