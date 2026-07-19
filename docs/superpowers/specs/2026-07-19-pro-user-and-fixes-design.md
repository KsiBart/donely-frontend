# Pro-user system + basic-feature fixes — design

**Date:** 2026-07-19. Scope: `donely-backend` + `donely-frontend`. Runs after Phase 4. Nothing pushed.

Goal: make basic features actually work end-to-end (endpoint↔DB↔UI), and add a working **Pro** mode.

## Locked decisions
- **Pro scope:** build a **core web pro area** — Dashboard + Requests (accept / decline / quote / mark-done) + Payouts/earnings summary. Consumes existing backend `provider-area` endpoints. Calendar/full billing later.
- **isPro model:** add `isPro` + `proTermsAcceptedAt` to `User`. Accepting pro terms → `isPro=true` **and create a ProviderProfile if the user has none** (so a new pro can receive bookings + appear on the map). Existing providers seeded `isPro=true` + terms accepted. `/me` returns `isPro` + `proTermsAcceptedAt`.
- Every fixed feature must hit a real endpoint/DB — no dead UI.

---

## A. Pro-user system

### Backend
- **Schema (`User`):** add `isPro Boolean @default(false)`, `proTermsAcceptedAt DateTime?`. Committed Prisma migration.
- **`MeEntity` / `/me`:** return `isPro`, `proTermsAcceptedAt`. Re-emit openapi.json.
- **`POST /me/become-pro`** (JWT): if `proTermsAcceptedAt` null → set now; set `isPro=true`; if no `providerProfile` → create a minimal one (default = first active category, `businessType=PRIVATE`, `status=PENDING`, sensible default `workHours`). Return updated `Me`. Idempotent.
- **Seed:** all 5 verified providers (marek.k, aneta, tomasz, ola, kuba) → `isPro=true` + `proTermsAcceptedAt` set. Their ProviderProfiles stay VERIFIED.

### Frontend
- **Login choice:** replace the post-verify "Zalogowano! → Przejdź do aplikacji" success screen with a choice: **"Wejdź jako klient"** / **"Wejdź jako Pro"**.
  - Standard → customer app (current behavior).
  - Pro + `isPro` true → pro area.
  - Pro + not pro → **pro terms** screen → accept → `POST /me/become-pro` → pro area.
- **Pro area** (new, gated on `isPro`; a toggle/back to customer):
  - **Dashboard:** earnings/payout summary + counts (`GET /provider/dashboard`).
  - **Requests:** incoming bookings; accept / decline / quote(amount) / mark-done (`GET /provider/requests` + `POST /provider/requests/:id/{accept,decline,quote,complete}`).
  - **Payouts:** list (`GET /provider/payouts`).
  - Add RQ hooks: `useProviderDashboard/useProviderRequests/useProviderPayouts` + the mutations (typed from schema).
- i18n: new keys in pl.json + en.json.

## B. Fixes (each wired to endpoint/DB)

1. **Dead settings rows** (`Profile.tsx` — only language works):
   - **Moja lokalizacja** → open location picker (reuse `useLocate` → `PATCH /me` lat/lng/label).
   - **Zapisane adresy** → list + add/remove saved addresses (manage via `PATCH /me` `savedAddresses`, which already exists on `User`/`Me`).
   - **Metody płatności** → show/select methods from `GET /config` `paymentMethods`; persist choice (add `User.preferredPaymentMethod` or accept read-only if out of scope — decide in build, default read-only list if persistence adds risk).
   - **Powiadomienia e-mail** → toggle; add `User.emailNotifications Boolean @default(true)` + return in `/me` + `PATCH /me`.
2. **Booking "Wybrana godzina jest poza godzinami pracy wykonawcy"**: root-cause the slot-vs-workHours mismatch. A slot offered by `GET /providers/:id/slots` must pass booking validation. Fix seed `workHours` (and/or slot generation) so an offered slot books successfully. Add/confirm an e2e that books an offered slot.
3. **Map shows no providers**: `MapView` — verify markers render; **fit bounds** to include user + returned providers (so a far user like Węgrzce still sees them), or center on providers when user is distant. Confirm `/providers` returns them regardless of distance.
4. **Billing blank customer name** (`Billing.tsx:153` uses `p.customer?.name`): backend billing/payout row returns flat fields; fix entity → flat + component reads flat (same fix pattern as AdminBookingRow). Re-emit + re-gen.

## Verification
- Backend: build + e2e (extend: become-pro, book-offered-slot) stay green; migration applies.
- Frontend: tsc + build + lint green; regen types.
- Browser smoke: login→pro choice→become pro (terms)→pro dashboard/requests/payouts; marek.k login→pro works; settings rows each do something; book an offered slot succeeds; map shows providers; admin Billing name populated. Screenshots.

## Build order
1. **Backend** (schema+migration, /me, become-pro, seed pro+workHours, billing entity, re-emit) → verify e2e.
2. **Frontend** (regen types, login choice+terms, pro area+hooks, settings wiring, map fit-bounds, Billing read) → verify + smoke.

## Open detail (decide in build)
- become-pro ProviderProfile creation needs a `categoryId` (required FK) — use first active category as placeholder; pro dashboard shows a "complete your profile" hint when `status=PENDING`.
- Payment-method persistence: add `preferredPaymentMethod` only if low-risk; else render the config list read-only for now (note it).
