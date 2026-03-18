# Student Feedback System

Production-ready Student Feedback System with two complete panels:

- User Panel: modern multi-step student feedback form
- Admin Panel: secure login, analytics, table view, search/filter, and Excel download

## Highlights

- Modern dark UI with gradients + glassmorphism
- Smooth animated transitions (Framer Motion + GSAP)
- 10-step one-question-per-screen feedback flow
- Progress indicator + validation + confetti on submit
- Final popup message after submit:
  - `Thank you for taking the time to share your feedback 🙌`
- Admin authentication
  - Username: `admin`
  - Password: `admincse123`
- Admin analytics with Recharts
  - Ratings distribution (bar chart)
  - Experience level split (pie chart)
  - Average rating, total responses, most selected topic
- Search + filter in admin table
- Admin-only Excel export (`.xlsx`)
- Real-time updates via local data store events
- Fully responsive design

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- GSAP
- Recharts
- XLSX
- Three.js (ambient visual background)

## Run Locally

```bash
npm install
npm run dev
```

App URL: `http://localhost:5173`

## Build

```bash
npm run build
```

## User and Admin Flow

1. Open app and stay in `User Panel` to submit feedback.
2. After submit, confirmation popup appears.
3. Switch to `Admin Panel`.
4. Login with:
   - Username: `admin`
   - Password: `admincse123`
5. View analytics, filter/search records, and download `.xlsx`.

## Cloud Database (Firebase Firestore)

This app now uses Firebase Firestore as the central cloud database.

- Collection name: `feedback`
- Student submissions are written with `addDoc(..., { createdAt: serverTimestamp() })`
- Admin panel fetches full data with `getDocs(collection(db, "feedback"))`
- Realtime updates are enabled via `onSnapshot` (optional enhancement)

### Environment Variables

Set these in `.env` (local) and in Vercel project settings (production):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Firestore Rules (Demo)

For a live demo, use permissive rules first, then lock down for production:

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

## Project Structure

- `src/components/SessionFeedbackWizard.tsx`: User multi-step form
- `src/components/AdminLogin.tsx`: Admin login
- `src/components/AdminDashboard.tsx`: Admin table, analytics, export
- `src/services/feedbackService.ts`: Data persistence + subscriptions
- `src/App.tsx`: panel routing, theme switch, popup handling

## Deploy

This Vite app is deploy-ready for Netlify/Vercel.

1. Run `npm run build`
2. Deploy the generated `dist/` output
