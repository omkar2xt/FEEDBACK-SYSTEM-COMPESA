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
- Firebase Firestore cloud storage for global cross-device data access
- Fully responsive dark-themed glassmorphism UI

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- Framer Motion + GSAP
- Recharts
- Firebase Firestore
- XLSX
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

3. Fill Firebase variables in `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Optional:

```env
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_OPENAI_PROXY_ENDPOINT=/api/analyze
```

4. Start dev server:

```bash
npm run dev
```

## Firebase Notes

- Collection used: `feedback`
- Write flow: `addDoc(collection(db, "feedback"), {..., createdAt: serverTimestamp() })`
- Admin fetch flow: `getDocs(collection(db, "feedback"))`
- Optional realtime sync: `onSnapshot(...)`

### Demo Firestore Rules

Use permissive rules only for demo/testing:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /feedback/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Build

```bash
npm run build
```

## Deploy (Vercel / Netlify)

- Deploy frontend normally from this repo.
- Add same `VITE_FIREBASE_*` variables in hosting environment settings.
- Firebase serves as backend database (no custom server required).

## Project Structure

- `src/App.tsx` - app shell and panel switching
- `src/components/SessionFeedbackWizard.tsx` - user form flow
- `src/components/AdminLogin.tsx` - admin authentication UI
- `src/components/AdminDashboard.tsx` - admin analytics + table + export
- `src/services/firebase.ts` - Firebase initialization
- `src/services/feedbackService.ts` - Firestore read/write service layer
