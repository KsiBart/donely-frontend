# donely-frontend

Web frontend of the **Donely** suite (Polish local-services marketplace) — Vite + React 18 + TypeScript + React Router.

Two surfaces in one app:

- **`/`** — mobile web (customer), rendered inside a centered max-width 430 px shell on desktop. Full-featured: passwordless OTP auth (e-mail → 8-digit code), home with AI search + featured carousel + category chips + provider list with list/map toggle (stylized map with price pins), AI results, provider profile, 3-step booking wizard (instant + quote variants), success screen, bookings with reviews, favorites, profile. Includes the app-install banner and the "Wolisz aplikację?" store card. Light theme only.
- **`/admin`** — desktop CRM. Same OTP login (use `admin@donely.app`); routes are guarded on `isAdmin`. Sections: Pulpit, Użytkownicy, Wykonawcy (verification queue + sidebar badge), Rezerwacje, Kalendarze (week grid, click to block/release slots), Kategorie, Rozliczenia. Toasts bottom-center.

All data comes from the real API (`donely-backend`, port 3001) via the contract in `src/api/types.ts`; `src/api/client.ts` is a fetch wrapper with the JWT kept in `localStorage`.

## Requirements

- Node 20+
- `donely-backend` running on `http://localhost:3001` (see its README: `npm ci && npx prisma generate && npx prisma db push && npm run seed && npm run start:dev`)

## Setup & run

```bash
npm install
cp .env.example .env   # optional — defaults to http://localhost:3001
npm run dev            # http://localhost:5173  (dev proxy /api → :3001)
```

Login flow is passwordless: enter any e-mail, request a code — in dev the backend returns `devCode`, which the UI shows next to "Wyślij ponownie". Seeded accounts: `julia.nowak@gmail.com` (customer), `admin@donely.app` (admin, for `/admin`).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173 with `/api` proxy |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | typecheck + production build to `dist/` |
| `npm run preview` | serve the production build |

## Structure

```
src/
  api/            client.ts (fetch + JWT), types.ts (API contract)
  state/          AuthContext (me + OTP), ToastContext
  components/     ui.tsx — logo, sparkle, avatar placeholders
  lib/format.ts   Polish labels, dates, pluralization, money
  mobile/         customer surface (screens/, AuthFlow, BottomNav, AppPromo)
  admin/          CRM surface (AdminApp shell, AdminLogin, sections/)
  styles/         global.css — design tokens as CSS variables
```

Design tokens (colors, radii, shadows) are CSS variables in `src/styles/global.css`; fonts (Bricolage Grotesque + Figtree) load via Google Fonts in `index.html`. All UI copy is Polish, taken verbatim from the design files in `../design/`.

## Deploy to Vercel

Static SPA — no server, no code changes needed. Deploy `donely-backend` first (see its README) and have its URL ready.

1. `vercel` → import this folder (`donely-frontend`) as the project root.
2. Set the env var **`VITE_API_URL`** to the deployed backend's URL including the `/api` path, e.g. `https://donely-backend.vercel.app/api`.
3. Deploy. Vercel runs `npm run build` (outputs `dist/`); `vercel.json` rewrites all paths to `index.html` so client-side routing (`/`, `/admin`, deep links) works on refresh.
4. If the backend's `ALLOWED_ORIGINS` doesn't yet include this frontend's Vercel domain, add it there and redeploy the backend.

Without `VITE_API_URL` set, the build falls back to calling `/api` on its own origin — only correct if something on the same domain proxies `/api` to the backend. For the standard two-project Vercel setup, always set `VITE_API_URL`.
