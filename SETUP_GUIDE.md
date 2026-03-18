# First Year Programming Session Feedback - Setup Guide

## Quick Setup (5 minutes)

Your feedback form is ready to collect responses! Just need to configure Firebase for response storage.

### Step 1: Create Firebase Project (1 minute)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Name it (e.g., "Programming Session Feedback")
4. Click "Create Project"

### Step 2: Add Web App to Firebase (2 minutes)

1. Click the Web icon ( </> ) to add a web app
2. Give it a name (e.g., "Feedback Form")
3. Copy the Firebase config (you'll see the credentials)
4. Click "Continue to console"

### Step 3: Set Up Firebase Database (1 minute)

1. In Firebase Console, go to **Firestore Database**
2. Click "Create Database"
3. Select **"Start in test mode"** (for development)
4. Choose a region closest to you
5. Click "Create"

### Step 4: Configure Your App (1 minute)

1. In your project folder, create a `.env` file:

```bash
# Copy the credentials from Firebase Console (Web app config)

VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Where to find these values:**
- Go to Firebase Console → Project Settings (gear icon)
- Under "Your apps" → Web app config
- Copy each value into your `.env` file

### Step 5: Start the App

```bash
npm run dev
```

Visit **http://localhost:5173/** and start collecting feedback!

## How Responses Are Stored

✅ **Automatic Firestore Storage**
- Each response is automatically saved to your Firebase database
- Responses appear in real-time on the analytics dashboard
- Data is stored in a "feedback" collection in Firestore

✅ **What Gets Stored**
- Name & email
- Rating (1-5 stars)
- Best tip resonated with
- Implementation plan for next 30 days
- Focus area selection
- Recommendation flag
- AI sentiment analysis
- Timestamp

✅ **View Responses in Firebase**
1. Go to Firebase Console → Firestore Database
2. Click the "feedback" collection
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
- ✅ Check `.env` has correct Firebase credentials
- ✅ Verify Firestore Database is created in Firebase Console
- ✅ Check browser console (F12 → Console) for errors

**Getting "permission-denied" error?**
- ✅ Go to Firebase → Firestore Database → Rules
- ✅ Make sure it says "Start in test mode" or has public read/write
- ✅ Rules expire after 30 days; update them before production

**Form won't load?**
- ✅ Wait for `npm run dev` to show "ready in Xms"
- ✅ Hard refresh browser (Ctrl+Shift+R)
- ✅ Check terminal for errors

## Support

- **Firebase Docs**: https://firebase.google.com/docs/firestore
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev

Enjoy collecting feedback! 🎉
