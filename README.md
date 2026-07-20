# donely-frontend

Web frontend of the **DoneLy AI** suite (Polish local-services marketplace) — Vite + React 18 +
TypeScript + React Router, styled with **Tailwind CSS v4**, data via **TanStack Query** over a
**typed OpenAPI client**.

Three surfaces in one app:

- **`/`** — customer app (mobile-first, centered ≤430 px shell on phones; a dedicated ≥1024 px
  desktop layout). Passwordless OTP auth (e-mail → 8-digit code), home with AI search + featured
  carousel + category chips + provider list with list/map toggle (**real Leaflet + OSM map** with
  price pins, geolocation, distance sort), AI results, provider profile, 3-step booking wizard
  (instant + quote), success, bookings with reviews, favorites, profile with functional settings
  (location, saved addresses, payment methods, e-mail notifications, language). Orange/dark theme.
- **`/pro`** — **Pro (wykonawca) area** for provider users: Pulpit (KPI dashboard + today's plan),
  Zlecenia (requests: accept / decline / quote / complete), Kalendarz (block / release slots),
  Wypłaty (billing + payouts), Profil. Reached via the post-login **Standard / Pro choice** (any
  user can become Pro by accepting the pro terms — `POST /me/become-pro`).
- **`/admin`** — desktop CRM (guarded on `isAdmin`, log in with `admin@donely.app`): Pulpit,
  Użytkownicy, Wykonawcy (verification queue), Rezerwacje, Kalendarze, Kategorie, Rozliczenia.

All data comes from the real API (`donely-backend`, port 3001). **Types are generated** from the
backend's OpenAPI spec into `src/api/schema.d.ts` (`npm run gen:api`); `src/api/client.ts` is a
typed `openapi-fetch` client (JWT in `localStorage`, 401 → logout) and `src/api/hooks/*` are the
React Query hooks every screen consumes.

## Requirements

- Node 20+
- `donely-backend` running on `http://localhost:3001` (see its README, or run the whole stack with
  `./scripts/dev.sh` from the repo root)

## Setup & run

```bash
npm install
cp .env.example .env   # optional — defaults to the local dev proxy (/api → :3001)
npm run gen:api        # generate src/api/schema.d.ts from ../donely-backend/openapi.json
npm run dev            # http://localhost:5173  (dev proxy /api → :3001)
```

Login is passwordless: enter a seeded e-mail, request a code — in dev the UI shows the `devCode`.
Seeded accounts: `julia.nowak@gmail.com` (customer), `marek.k@wp.pl` (Pro/wykonawca),
`admin@donely.app` (admin → `/admin`). Any customer can become Pro from the login choice or Profile.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173 with `/api` proxy |
| `npm run gen:api` | generate `src/api/schema.d.ts` from `../donely-backend/openapi.json` |
| `npm run gen:api:live` | same, from a running backend at `:3001/api/docs-json` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | typecheck + production build to `dist/` |
| `npm run lint` | ESLint (enforces no-inline-styles + import boundaries) |
| `npm run preview` | serve the production build |

## Structure

```
src/
  api/
    schema.d.ts     GENERATED types from the backend OpenAPI spec (do not edit)
    client.ts       typed openapi-fetch client + auth/401/error middleware + `unwrap`
    keys.ts         React Query key factory
    hooks/          feature hooks (useProviders, useBookings, useAdmin, provider.*, …)
    models.ts       handy type aliases over schema.d.ts
    queryClient.ts  QueryClient config
  state/            AuthContext (me + OTP + isPro + mode), ToastContext, SiteThemeContext
  brand.ts / theme.ts   white-label brand + accent palettes (env-driven)
  components/ui/    UI kit (Button/Card/Chip/… primitives) + cva variants
  lib/              format, a11y (clickable), geocode, useLocate, useIsDesktop
  mobile/           customer surface (screens/ split into feature subfolders) + BottomNav
    pro/            Pro (wykonawca) area — ProApp, ProNav, screens/
  desktop/          ≥1024 px components
  admin/            CRM (AdminApp shell, AdminLogin, sections/)
  landing/          marketing site (sections/, auth/, subpage/, chrome/)
  i18n/             pl.json (default) + en.json
  styles/global.css design tokens (CSS variables) + Tailwind @import/@theme mapping
```

Tailwind's theme is mapped onto the existing CSS-variable tokens via `@theme inline`
(`bg-accent` → `var(--accent)`, etc.), so the runtime `applyTheme()` theming, light/forced-dark
(`data-app-dark`), and white-label all keep working. Fonts (Bricolage Grotesque + Figtree) load via
Google Fonts in `index.html`. UI copy is Polish, toggleable to English.

## Deploy to Vercel

Static SPA — no server. Deploy `donely-backend` first and have its URL ready.

1. `vercel` → import this folder (`donely-frontend`) as the project root.
2. Set **`VITE_API_URL`** to the backend URL **including** `/api`, e.g.
   `https://donely-backend.vercel.app/api`.
3. Commit a fresh `src/api/schema.d.ts` (or run `npm run gen:api` in the build) so the build has
   types. Vercel runs `npm run build` (outputs `dist/`); `vercel.json` rewrites all paths to
   `index.html` so client-side routing survives refresh.
4. Add this frontend's domain to the backend's `ALLOWED_ORIGINS` and redeploy the backend.

Without `VITE_API_URL`, the build calls `/api` on its own origin — only correct if something proxies
`/api` to the backend on the same domain. For the standard two-project setup, always set it.
