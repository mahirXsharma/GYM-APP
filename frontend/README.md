# Gym Slot Booking — Frontend

This is the client-side single-page application (SPA) for the Gym Slot Booking system, built with React, TypeScript, Vite, Tailwind CSS v4, and Shadcn UI.

---

## Zero-Config Architecture (No `.env` Needed!)

The frontend eliminates the need for any local or deployment environment variables (`.env`) by using **URL rewrites and proxies**:

1. **Local Development (Vite Proxy)**:
   In `vite.config.ts`, Vite automatically proxies all outgoing `/api` requests to `http://localhost:3000`:
   ```ts
   server: {
     port: 5173,
     proxy: {
       '/api': {
         target: 'http://localhost:3000',
         changeOrigin: true,
       },
     },
   }
   ```

2. **Production Deployment (Vercel Rewrites)**:
   In `vercel.json`, Vercel automatically forwards all `/api/*` traffic directly to the live Render backend:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://gym-app-f0ek.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

3. **API Client**:
   All API requests in `src/lib/api.ts` use the relative path `/api/v1` by default, making the frontend completely plug-and-play across environments without hardcoding hostnames.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

- `npm run dev`: Starts the local development server with Hot Module Replacement (HMR).
- `npm run build`: Type-checks with `tsc` and compiles the production bundle with Vite.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint to check code quality.

---

## Pages & Routing

- `/`: Landing page with navigation links to Login / Register.
- `/login`: Member and Admin authentication page.
- `/register`: New member account registration.
- `/sessions`: Public workout session catalogue with real-time seat availability, live polling, and instant booking/waitlisting.
- `/my-bookings`: Member dashboard displaying confirmed bookings, 8-character check-in passcodes, and cancellation with auto-promotion.
- `/admin`: Administrative portal to schedule sessions, inspect attendee rosters by session, and verify member attendance via passcodes.
