# First Year Programming Session Feedback - Setup Guide

## Quick Setup (5 minutes)

Your feedback form is ready to collect responses. Configure Supabase for response storage.

### Step 1: Create Supabase Project (1 minute)

1. Go to [Supabase](https://supabase.com)
2. Click "New project"
3. Name it (e.g., "Programming Session Feedback")
4. Wait for the project to finish provisioning

### Step 2: Get API Credentials (1 minute)

1. Open your Supabase project dashboard
2. Go to **Project Settings -> API**
3. Copy **Project URL** and **anon public key**

### Step 3: Create Database Schema (2 minutes)

1. In Supabase, go to **SQL Editor**
2. Paste the SQL schema for table `public.feedback`
3. Run it to create table, indexes, and RLS policies

### Step 4: Configure Your App (1 minute)

1. In your project folder, create a `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Where to find these values:**
- Supabase Dashboard -> Project Settings -> API
- Copy Project URL and anon public key

### Step 5: Start the App

```bash
npm run dev
```

Visit **http://localhost:5173/** and start collecting feedback!

## How Responses Are Stored

✅ **Automatic Supabase Storage**
- Each response is automatically saved to your Supabase Postgres database
- Responses appear in real-time on the analytics dashboard
- Data is stored in the `public.feedback` table in Supabase

✅ **What Gets Stored**
- Name & email
- Rating (1-5 stars)
- Best tip resonated with
- Implementation plan for next 30 days
- Focus area selection
- Recommendation flag
- AI sentiment analysis
- Timestamp

✅ **View Responses in Supabase**
1. Go to Supabase Dashboard -> Table Editor
2. Open the `feedback` table
3. See all submitted responses in real-time

## Optional: Enable AI Sentiment Analysis

To get automatic sentiment analysis of responses:

1. Signup at [OpenAI](https://platform.openai.com)
2. Get your API key
3. In your `.env`, add:

```bash
OPENAI_API_KEY=your_openai_key
```

(The form works fine without this - AI analysis is optional)

## Deployment to Production

**Vercel (Recommended):**
```bash
npm run build  # Verify it builds
```

1. Push to GitHub
2. Connect to Vercel
3. Add all environment variables in Vercel settings
4. Deploy!

**Netlify:**
```bash
npm run build
npm run preview  # Test the build
```

1. Drag the `dist/` folder to Netlify
2. Add environment variables in Site settings
3. Done!

## Troubleshooting

**Responses not saving?**
- ✅ Check `.env` has correct Supabase credentials
- ✅ Verify `feedback` table exists in Supabase
- ✅ Check browser console (F12 → Console) for errors

**Getting permission errors?**
- ✅ Check Supabase RLS policies on `public.feedback`
- ✅ Ensure insert/select policies allow your app role (anon/authenticated)

**Form won't load?**
- ✅ Wait for `npm run dev` to show "ready in Xms"
- ✅ Hard refresh browser (Ctrl+Shift+R)
- ✅ Check terminal for errors

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev

Enjoy collecting feedback! 🎉
