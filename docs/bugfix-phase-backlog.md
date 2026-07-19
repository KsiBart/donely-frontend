# Bug-fix / feature phase — backlog (runs AFTER Phase 4 approval)

Captured 2026-07-19 from user testing. Rule: every basic feature must be wired to a real endpoint/DB and fully functional — no dead UI.

## 1. Profile settings are dead (only language works)
Screen rows: **Moja lokalizacja**, **Zapisane adresy** (shows 0), **Metody płatności** (BLIK, PayPal), **Powiadomienia e-mail** (Włączone), **Język** (Polski). Only *Język* works.
- Wire each row to a real action + endpoint:
  - Moja lokalizacja → edit location (reuse `useLocate`/`PATCH /me` lat/lng/label).
  - Zapisane adresy → CRUD saved addresses (`User.savedAddresses`; needs endpoint if missing).
  - Metody płatności → view/select payment methods (from `GET /config` paymentMethods; persist user preference).
  - Powiadomienia e-mail → toggle persisted on user (needs `emailNotifications` field + PATCH).
- Investigate whether rows are stubs (no onClick) or hit missing endpoints.

## 2. Pro-user system (NEEDS DESIGN — brainstorm first)
- Schema: add to `User` a `isPro` (boolean) and accepted-terms marker (e.g. `proTermsAcceptedAt` datetime, or `isPro` + `acceptedProTerms`). One field like `isPro` per user request, plus terms acceptance.
- Any user can **become pro** but must **accept pro terms** first.
- Login flow change: after OTP verify, the current "Zalogowano! → Przejdź do aplikacji" success screen must instead offer a **choice: log in as PRO or as STANDARD user**. Choosing pro (if terms not yet accepted) shows terms → accept → `isPro=true`.
- Pro users see the **pro screens** (provider dashboard/requests/calendar/billing/payouts surfaces — currently provider-area exists on backend; web pro UI may be partial).
- Endpoints: `POST /me/become-pro` (accept terms → set isPro) or similar; `GET /me` returns isPro + acceptedProTerms.

## 3. Seed: `marek.k@wp.pl` should be a working PRO user
- Was pro before; now logging in shows no pro screens. Fix seed so this user has `isPro=true` + terms accepted + a provider profile, and the web shows pro screens for him.

## 4. Booking fails: "Wybrana godzina jest poza godzinami pracy wykonawcy"
- Selecting a slot the UI offers still rejects as outside provider working hours. Likely seed working-hours vs offered-slots mismatch (possibly worsened by reseed). Fix so a slot shown as available books successfully. Check `/providers/:id/slots` vs `workHours` vs booking validation.

## 5. Map shows no providers
- User (new account, location "Węgrzce" near Kraków, ~250km from Warsaw-seeded providers) sees empty map; previously saw providers/pro users.
- HYPOTHESIS to verify first: map centers on user location; all seeded providers are around Warsaw → off-screen for a Kraków-area user (distance sort still returns them, but map viewport excludes them). If so: fit-bounds to include providers, or seed providers near common test locations, or handle far-user case.
- Also verify markers render at all (possible Phase 3/4 regression) — before assuming it's just distance.

## 6. General audit
- Sweep each customer + pro + admin feature; for any that's a dead stub, connect it to an endpoint/DB and make it functional. Report what was dead vs wired.

## Notes
- Pro-user system (#2) is a real feature → run brainstorming + a short spec before implementing.
- Others (#1,3,4,5) are fixes → can go straight to a fix workflow after quick root-cause per item.
