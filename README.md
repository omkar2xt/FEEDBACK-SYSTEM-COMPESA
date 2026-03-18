# Student Feedback System

Production-ready web application for collecting and managing student session feedback with a modern User Panel and Admin Panel.

## Features

- User Panel with cinematic multi-step feedback form (one question per screen)
- Smooth animations with Framer Motion + GSAP
- Progress indicator and validation with friendly error messages
- Success popup on submit:
  - `Thank you for taking the time to share your feedback 🙌`
- Admin login (static credentials)
  - Username: `admin`
  - Password: `admincse123`
- Admin Dashboard
  - Search + filter responses
  - Ratings bar chart and experience pie chart (Recharts)
  - Average rating, total responses, most selected topic
  - Auto-generated summary/conclusion
  - Download feedback as Excel (`.xlsx`)
- Supabase Postgres cloud storage for global cross-device data access
- Fully responsive dark-themed glassmorphism UI

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- Framer Motion + GSAP
- Recharts
- Supabase
- ExcelJS
- Three.js (ambient background)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment file:

```bash
cp .env.example .env
```

3. Fill Supabase variables in `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Optional:

```env
VITE_OPENAI_PROXY_ENDPOINT=/api/analyze
```

4. Start dev server:

```bash
npm run dev
```

## Supabase Notes

- Table used: `public.feedback`
- Write flow: `upsert` to `feedback` with conflict key `id`
- Admin fetch flow: `select * from feedback order by created_at desc`
- Optional realtime sync: Supabase Realtime on `public.feedback`

## Build

```bash
npm run build
```

## Deploy (Vercel / Netlify)

- Deploy frontend normally from this repo.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in hosting environment settings.
- Supabase serves as backend database (no custom server required).

## Project Structure

- `src/App.tsx` - app shell and panel switching
- `src/components/SessionFeedbackWizard.tsx` - user form flow
- `src/components/AdminLogin.tsx` - admin authentication UI
- `src/components/AdminDashboard.tsx` - admin analytics + table + export
- `src/services/supabase.ts` - Supabase client initialization
- `src/services/feedbackService.ts` - Supabase read/write service layer
