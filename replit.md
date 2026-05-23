# BoardPassPH

AI-powered Philippine psychology board exam review platform for PRC Psychometrician and Clinical board candidates.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxy at `/api`)
- `pnpm --filter @workspace/boardpassph run dev` — run the frontend (port 22151, proxy at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server run build` — rebuild api-server bundle
- Required env: `GEMINI_API_KEY` — Google Generative AI key for question/mnemonic generation
- Password recovery: `MY_EMAIL` + `MY_PASSWORD` (Gmail App Password) on the API server
- Push notifications (optional): `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` on the API server

## PWA install & notifications

1. **Installable PWA**: `public/manifest.webmanifest` + `index.html` manifest link. Serve over HTTPS. Users install via browser “Add to Home Screen”.
2. **Service worker**: `public/sw.js` — shell cache + push handler. Registered from Profile → “Allow push notifications”.
3. **Push setup**: Run API server with stable VAPID keys. User enables notifications in Profile; app calls `/api/push/subscribe`.
4. **Allowed hosts (dev)**: Vite `server.allowedHosts: true` accepts tunnel/custom domains. For production, set your domain in hosting (Replit, Vercel, etc.).
5. **API proxy (local dev)**: Vite proxies `/api` → `http://127.0.0.1:8080`. Start both `api-server` and `boardpassph` dev servers.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v4 (5 custom themes)
- API: Express 5 + `@google/genai` SDK
- DB: Firebase Firestore (user profiles) + localStorage fallback
- Build: esbuild (CJS bundle for api-server)

## Where things live

- `artifacts/boardpassph/src/App.tsx` — root app: auth flow, tab routing, Firestore sync
- `artifacts/boardpassph/src/components/` — 16 panel components (PracticePanel, MockExamPanel, LibraryPanel, etc.)
- `artifacts/boardpassph/src/data/tests.ts` — ~2641-line psychological tests database
- `artifacts/boardpassph/src/data/seedQuestions.ts` — fallback question bank
- `artifacts/boardpassph/src/index.css` — Tailwind v4 `@theme` block + 5 `[data-theme]` palettes
- `artifacts/boardpassph/firebase-applet-config.json` — Firebase public config (Firestore)
- `artifacts/api-server/src/routes/boardpassph.ts` — `/generate-question`, `/generate-mnemonic`, `/submit-feedback`

## Architecture decisions

- **Dual storage**: Firestore is primary; localStorage is transparent fallback for offline/auth failures
- **Anonymous auth disabled**: Firebase anonymous sign-in is not enabled in this project — auth warnings are expected; localStorage handles all local state
- **AI with local fallback**: If `GEMINI_API_KEY` is missing or rate-limited, the API routes automatically fall back to the local seed question bank
- **esbuild bundling**: `@google/genai` is bundled (not external) — removed `@google/*` from external list in `build.mjs`
- **Theme system**: 5 CSS `[data-theme]` palettes (strawberry-matcha, lilac-dream, winter, pastel-pink-coquette, red-blush) set via `document.documentElement.setAttribute('data-theme', ...)`

## Product

- **AI Practice** — generate custom MCQs via Gemini (DSM-5, pharma, assessment, I/O, dev), fallback to local seed bank
- **Mock Exam** — 100-item timed board exam simulation with review
- **Test Library** — searchable database of Philippine psychological tests with one-click practice
- **Spaced Repetition** — 3D flip flashcard deck from missed questions
- **Analytics** — heatmap, category breakdown, accuracy tracking
- **Study Planner** — calendar with events, moods, daily habits, streak management
- **RPG System** — XP, levels, combo multiplier, streak shields, achievement badges
- **Focus Arena** — distraction-free timed study sprints
- **GWA Calculator** — weighted grade average calculator for Philippine system
- **Billing Panel** — subscription tiers (Clinical Trial, Pro, Clinical)
- **Leaderboard** — cloud-synced ranking panel
- **Admin Panel** — visible to admin@boardpassph.com and test@test.com

## User preferences

- Billing model: Pay-As-You-Go coin credits (not subscription tiers)
- Coin packages: Sulit ₱50=50k, Pro ₱149=160k, Clinical ₱299=350k
- Model coin costs: Llama budget=5, Claude standard=100, Gemini premium=200 coins/Q
- New users get 1,000 starter coins on sign-up
- Profile ID card: editable username, school, photo (base64), password
- Correct answer shuffle: server-side after Gemini response + fallback seeds
- Billing: plans activate locally (no payment gateway in this build)

## Gotchas

- `@google/genai` must NOT be in the `external` list in `artifacts/api-server/build.mjs` — the `@google/*` glob was removed; only `@google-cloud/*` is externalized
- Firebase anonymous auth is disabled (`auth/admin-restricted-operation`) — expected, safe to ignore
- Tailwind v4 uses `@import "tailwindcss"` not `@tailwind base/components/utilities`
- `pnpm approve-builds` may be needed if firebase or @google/genai postinstall fails — currently bypassed safely

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
