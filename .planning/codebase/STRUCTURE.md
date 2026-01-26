# Codebase Structure

**Analysis Date:** 2026-01-26

## Directory Layout

```
prediction-early-access/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/                # Server-side API endpoints
│   │   │   ├── auth/           # Authentication flows
│   │   │   ├── referral/       # Referral link processing
│   │   │   ├── spin/           # Daily spin action
│   │   │   ├── leaderboard/    # Leaderboard queries
│   │   │   ├── wallet/         # TON wallet verification
│   │   │   ├── syndicate/      # Referral management
│   │   │   ├── verify-channel/ # Telegram channel check
│   │   │   ├── chat/           # AI analyst stub
│   │   │   ├── news/           # News feed stub
│   │   │   ├── cron/           # Scheduled jobs (Vercel)
│   │   │   └── debug/          # Development testing endpoints
│   │   ├── [feature]/page.tsx  # Feature pages (chat, leaderboard, settings, etc.)
│   │   ├── page.tsx            # Root dashboard page
│   │   ├── layout.tsx          # Root layout with context providers
│   │   └── globals.css         # Global Tailwind styles
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Atomic UI components
│   │   ├── AuthWrapper.tsx     # User sync & referral handler
│   │   ├── TonProvider.tsx     # TON wallet provider
│   │   ├── BottomNav.tsx       # Fixed navigation tabs
│   │   ├── DailyLoginCard.tsx  # Daily reward UI
│   │   ├── ProgressionCard.tsx # Task progression tracker
│   │   └── WelcomeScreen.tsx   # Onboarding modal
│   ├── context/                # Context providers for global state
│   │   └── InfoContext.tsx     # Info modal state
│   ├── hooks/                  # Custom React hooks
│   │   ├── useTelegram.tsx     # Telegram WebApp SDK access
│   │   ├── useDailyLogin.tsx   # Daily login state & logic
│   │   └── useProgression.ts   # Task completion tracking
│   └── lib/                    # Utility functions & service layers
│       ├── supabaseClient.ts   # Client Supabase (RLS enforced)
│       ├── supabaseAdmin.ts    # Admin Supabase (RLS bypassed)
│       ├── pointsEngine.ts     # Centralized points awarding
│       ├── megaphone.ts        # Notification batch processor
│       ├── nudges.ts           # Random notification templates
│       └── telegramBot.ts      # Telegram Bot API client
├── public/                     # Static assets
├── node_modules/               # Dependencies
├── package.json                # Project metadata & scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
├── next.config.js              # Next.js configuration
├── vercel.json                 # Vercel deployment & cron config
└── .env.local                  # Environment variables (local dev)
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js 16 App Router - contains all pages and API routes
- Contains: Page components (`.tsx`), API route handlers (`.ts`), layout configuration
- Key files: `page.tsx` (root), `layout.tsx` (root wrapper)

**`src/app/api/`:**
- Purpose: Server-side API endpoints (Next.js route handlers)
- Contains: POST/GET handlers for business logic, external integrations, cron jobs
- Key files: `/auth/welcome`, `/spin`, `/referral`, `/leaderboard`, `/cron/nudge`

**`src/components/`:**
- Purpose: Reusable React components
- Contains: Page components, layout components, UI primitives, feature-specific cards
- Key files: `AuthWrapper.tsx` (critical for user sync), `BottomNav.tsx` (persistent nav)

**`src/context/`:**
- Purpose: React Context providers for global state
- Contains: Context creation, Provider wrappers, custom hooks for context consumption
- Key files: `InfoContext.tsx` (modal state)

**`src/hooks/`:**
- Purpose: Custom React hooks for data fetching and state management
- Contains: Data fetching logic, polling intervals, event listeners
- Key files: `useTelegram.tsx` (auth), `useProgression.ts` (task tracking)

**`src/lib/`:**
- Purpose: Utility functions, service layers, and business logic
- Contains: Database clients, point awarding engine, notification system, external APIs
- Key files: `supabaseClient.ts`, `supabaseAdmin.ts`, `pointsEngine.ts`

**`public/`:**
- Purpose: Static assets served directly by Next.js
- Contains: Images, manifests, favicon, etc.
- Key files: `tonconnect-manifest.json` (TON wallet configuration)

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Root dashboard - main hub for user
- `src/app/layout.tsx`: Root layout - loads all context providers
- `package.json`: Scripts: `dev`, `build`, `start`

**Configuration:**
- `tsconfig.json`: TypeScript config; path alias `@/*` -> `src/*`
- `tailwind.config.js`: Tailwind CSS customization (dark theme, spacing)
- `next.config.js`: Next.js build configuration
- `vercel.json`: Cron job scheduling for `/api/cron/nudge`

**Core Logic:**
- `src/lib/pointsEngine.ts`: Centralized point awarding via Postgres RPC
- `src/lib/megaphone.ts`: Batch notification processing
- `src/lib/telegramBot.ts`: Telegram Bot message sending

**API Endpoints:**
- `src/app/api/auth/welcome/route.ts`: Welcome bonus on first sign-up
- `src/app/api/spin/route.ts`: Daily spin with weighted prizes
- `src/app/api/referral/route.ts`: Referral activation
- `src/app/api/leaderboard/route.ts`: Leaderboard query with period filtering

**UI State Management:**
- `src/context/InfoContext.tsx`: Modal visibility and content
- `src/hooks/useTelegram.tsx`: Telegram user & WebApp SDK

**Feature Pages:**
- `src/app/*/page.tsx`: Feature pages (chat, leaderboard, settings, spin, wallet, syndicate, news)

**Testing & Debug:**
- `src/app/debug/*/page.tsx`: Debug pages for testing engines
- `src/app/api/debug/*/route.ts`: Debug API endpoints

## Naming Conventions

**Files:**
- Pages: `page.tsx` (required for App Router)
- API routes: `route.ts` (required for App Router)
- Components: PascalCase (e.g., `DailyLoginCard.tsx`)
- Utilities/Hooks: camelCase (e.g., `supabaseClient.ts`, `useProgression.ts`)
- Context: PascalCase with "Context" suffix (e.g., `InfoContext.tsx`)

**Directories:**
- Feature pages: kebab-case matching route (e.g., `/spin` -> `spin/`)
- Grouped directories: lowercase (e.g., `api/`, `components/`, `hooks/`)
- API route groups: feature-based (e.g., `api/auth/`, `api/wallet/`)

**Variables & Functions:**
- Components: PascalCase (e.g., `AuthWrapper`, `DailyLoginCard`)
- Hooks: camelCase with `use` prefix (e.g., `useTelegram`, `useProgression`)
- Constants: UPPER_SNAKE_CASE (e.g., `PRIZES` in spin route)
- Functions: camelCase (e.g., `awardPoints`, `processMegaphoneBatch`)

## Where to Add New Code

**New Feature Page:**
1. Create directory: `src/app/[feature-name]/`
2. Add page: `src/app/[feature-name]/page.tsx` (wrap in `'use client'` if interactive)
3. Add to navigation: Update `src/components/BottomNav.tsx` tabs array
4. Create API route if needed: `src/app/api/[feature-name]/route.ts`

**New API Endpoint:**
1. Create directory: `src/app/api/[resource]/` (or `src/app/api/[category]/[resource]/`)
2. Add handler: `src/app/api/[resource]/route.ts`
3. Use `supabaseAdmin` for database access
4. Call engines for complex logic (points, notifications, etc.)
5. Return `NextResponse.json()` with status code

**New Component:**
1. Create file: `src/components/[ComponentName].tsx`
2. If atomic UI primitive, place in `src/components/ui/`
3. Use `'use client'` directive if using hooks
4. Export as default or named export (match file name)

**New Custom Hook:**
1. Create file: `src/hooks/use[HookName].ts` (or `.tsx` if returns JSX)
2. Use `'use client'` directive
3. Export as named export
4. Document return type and dependencies

**New Business Logic Engine:**
1. Create file: `src/lib/[engineName].ts`
2. Export main function (e.g., `export async function process[Engine]()`)
3. Use `supabaseAdmin` and external SDK imports
4. Return structured result object
5. Call from API routes, not directly from components

**New Database Query:**
1. Use `supabase` (client) in components/hooks for read-only (RLS enforced)
2. Use `supabaseAdmin` in API routes for writes (RLS bypassed)
3. Wrap in try-catch at caller level
4. Check for `.single()` vs `.limit(n)` based on expected results

## Special Directories

**`src/app/api/cron/`:**
- Purpose: Scheduled background jobs triggered by Vercel cron
- Configuration: `vercel.json` defines schedule (e.g., "0 */2 * * *" for every 2 hours)
- Generated: No (manually configured)
- Committed: Yes

**`src/app/api/debug/`:**
- Purpose: Development-only endpoints for manual testing of engines
- Used for: Testing point awards, megaphone notifications, etc.
- Accessible: Direct HTTP requests (no authentication check - dev only)
- Note: Should be disabled or protected in production

**`.env.local`:**
- Purpose: Local environment variables (development)
- Contains: `NEXT_PUBLIC_*` for client-side, `SUPABASE_*` for server-side
- Generated: No (manually created per developer)
- Committed: No (in .gitignore)

**`.next/`:**
- Purpose: Build artifacts and Next.js cache
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install` / `npm ci`)
- Committed: No (in .gitignore)

## Dependency on External Packages

**Critical Production Dependencies:**
- `next@16.1.4`: Framework
- `react@19.2.3`, `react-dom@19.2.3`: UI library
- `@supabase/supabase-js@^2.91.0`: Database client
- `@tonconnect/ui-react@^2.3.1`: TON wallet connection
- `@twa-dev/sdk@^8.0.2`: Telegram WebApp SDK
- `tailwindcss@^4`: CSS framework

**Development Dependencies:**
- `typescript@^5`: Type checking
- `eslint@^9`: Linting
- `@tailwindcss/postcss@^4`: Tailwind utilities

## How to Navigate This Codebase

**To find user authentication logic:**
- Start: `src/hooks/useTelegram.tsx` (SDK initialization)
- Then: `src/components/AuthWrapper.tsx` (user sync)
- Also: `src/app/api/auth/welcome/route.ts` (welcome bonus)

**To understand points system:**
- Start: `src/lib/pointsEngine.ts` (centralized award function)
- Then: Any API route that calls `awardPoints()`
- Inspect: Database RPC function `award_points_v2` (in migrations)

**To find notification system:**
- Start: `src/lib/megaphone.ts` (batch processor)
- Then: `src/app/api/cron/nudge/route.ts` (cron trigger)
- See: `src/lib/telegramBot.ts` (message sending)

**To understand data fetching patterns:**
- Client: `src/hooks/useProgression.ts` (polling with visibility detection)
- Server: `src/app/api/leaderboard/route.ts` (query multiple tables)

**To add a new feature requiring points:**
1. Create API route in `src/app/api/[feature]/route.ts`
2. Add idempotency check
3. Call `awardPoints(userId, amount, '[feature_reason]')`
4. Update UI to trigger endpoint via `fetch()`

---

*Structure analysis: 2026-01-26*
