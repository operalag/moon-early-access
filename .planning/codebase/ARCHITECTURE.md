# Architecture

**Analysis Date:** 2026-01-26

## Pattern Overview

**Overall:** Modular Next.js 16 application with client-server separation, API-driven data flow, and context-based state management for Telegram-native prediction market platform.

**Key Characteristics:**
- Client-side React components with server-side API route handlers
- Context providers for global state (Telegram, TON, UI state)
- Service-layer separation: client libraries (`supabaseClient`) vs. admin libraries (`supabaseAdmin`)
- Cron-based engine systems for points, messaging, and notifications (Megaphone)
- Feature flags via debug pages; early-access TelegramBot integration

## Layers

**Presentation Layer (Client):**
- Purpose: User-facing components and pages
- Location: `src/app/*/page.tsx`, `src/components/`
- Contains: Page components, UI components, feature-specific modals/cards
- Depends on: Context providers, custom hooks, Supabase client
- Used by: Browser/Telegram WebApp client

**State Management Layer (Context + Hooks):**
- Purpose: Manage authentication, global UI state, user progression
- Location: `src/context/`, `src/hooks/`
- Contains: TelegramProvider, InfoProvider (modal state), custom hooks for data fetching
- Depends on: Supabase client, API routes
- Used by: Presentation layer components

**API Layer (Server):**
- Purpose: Server-side business logic, database operations, external integrations
- Location: `src/app/api/*/route.ts`
- Contains: Route handlers for auth, points, leaderboard, spin, referral, syndicate operations
- Depends on: Supabase admin client, business logic engines
- Used by: Client fetch requests, cron jobs

**Business Logic (Engines):**
- Purpose: Core business operations with side effects
- Location: `src/lib/pointsEngine.ts`, `src/lib/megaphone.ts`, `src/lib/telegramBot.ts`
- Contains: Points awarding (via Postgres RPC), notification batching, Telegram messaging
- Depends on: Supabase admin client, environment configuration
- Used by: API routes, cron handlers

**Data Access Layer:**
- Purpose: Database interaction and client initialization
- Location: `src/lib/supabaseClient.ts`, `src/lib/supabaseAdmin.ts`
- Contains: Supabase client creation with appropriate authentication
- Depends on: Environment variables for URLs and keys
- Used by: All layers that need database access

**External Integrations Layer:**
- Purpose: Third-party service communication
- Location: `src/lib/telegramBot.ts`, `src/components/TonProvider.tsx`
- Contains: Telegram Bot API, TON wallet connection (TonConnect)
- Depends on: SDKs (@tonconnect/ui-react, @twa-dev/sdk)
- Used by: Authentication flow, wallet verification

## Data Flow

**User Authentication & Onboarding:**

1. Page loads with `TelegramProvider` from `src/hooks/useTelegram.tsx`
2. Extracts user from Telegram WebApp SDK (mock user in dev)
3. `AuthWrapper` (`src/components/AuthWrapper.tsx`) syncs user to database:
   - Creates new profile if missing, triggers `/api/auth/welcome` for welcome bonus
   - Handles referral link detection from `start_param` with polling fallback
   - Calls `/api/referral` to process referral relationship
4. Dashboard shows stats fetched from `profiles`, `daily_logins`, `referrals` tables

**Points Awarding Flow:**

1. User triggers action (welcome bonus, daily spin, referral, daily login)
2. API route (`/api/spin`, `/api/referral`, `/api/auth/welcome`) receives request
3. Calls `awardPoints()` from `src/lib/pointsEngine.ts`
4. Points engine calls Postgres RPC function `award_points_v2` via `supabaseAdmin`
5. RPC updates:
   - `profiles.total_points` (atomically)
   - `transactions` table (audit log)
   - `leaderboard_buckets` (daily/weekly aggregates)
6. Client refetches stats (via polling or manual refresh)

**Leaderboard Query Flow:**

1. `/api/leaderboard?period=daily|weekly|all_time` receives GET request
2. Queries appropriate table:
   - `all_time`: Reads from `profiles` (legacy total)
   - `daily`/`weekly`: Reads from `leaderboard_buckets` grouped by `period_key`
3. Filters to latest period key and returns ranked users

**Megaphone Notification Engine:**

1. Cron job calls `/api/cron/nudge` (via Vercel `vercel.json`)
2. Calls `processMegaphoneBatch()` from `src/lib/megaphone.ts`
3. Identifies stale users (inactive >24h, push enabled, not notified in 48h)
4. For each user:
   - Gets random nudge from `src/lib/nudges.ts`
   - Sends via Telegram Bot (`sendTelegramMessage()` from `src/lib/telegramBot.ts`)
   - Updates `last_notified_at` on success
   - Auto-disables push if user blocked bot

**State Management:**

**TelegramProvider:**
- Holds: `user` (Telegram user object), `webApp` (Telegram API)
- Updated on: Component mount (one-time initialization)
- Consumed by: AuthWrapper, dashboard, all feature pages

**InfoProvider:**
- Holds: `isOpen` (modal visibility), `data` (title/content for info drawer)
- Updated on: User clicks info trigger (InfoTrigger component)
- Consumed by: All components with `useInfo()` hook

**Custom Hooks State:**
- `useProgression()`: Fetches wallet, referral, channel, streak status (polls every 5s)
- `useDailyLogin()`: Tracks claimed status and streak count

## Key Abstractions

**Centralized Points Engine (`src/lib/pointsEngine.ts`):**
- Purpose: Ensures all point awards are atomic and tracked
- Examples: `awardPoints(userId, amount, reason, metadata)`
- Pattern: Server-side only, calls Postgres RPC function for atomicity

**Supabase Admin vs. Client Separation:**
- Purpose: RLS enforcement on client, bypassed on server for batch operations
- Client: `src/lib/supabaseClient.ts` (read-only public queries)
- Admin: `src/lib/supabaseAdmin.ts` (full write access for engines)
- Impact: Security layer; prevents client-side point manipulation

**Context Providers as Middleware:**
- Purpose: Inject third-party SDKs and UI state globally
- Examples: TonProvider wraps TonConnectUIProvider, TelegramProvider wraps WebApp SDK
- Pattern: Lazy initialization on client-side to avoid SSR issues

**API Routes as Business Logic Endpoints:**
- Purpose: Centralize server operations and enforce idempotency
- Examples: `/api/referral`, `/api/spin`, `/api/auth/welcome` check for duplicates
- Pattern: Fetch from client, validate, call engines, return status

**Engine Modules for Complex Operations:**
- Purpose: Encapsulate batch and recurring operations
- Examples: `megaphone.ts` for notification batching, `nudges.ts` for message generation
- Pattern: Orchestrate multiple Supabase queries + external integrations

## Entry Points

**Web App Entry (`src/app/page.tsx`):**
- Location: `/` (root)
- Triggers: Initial page load; wrapped in `AuthWrapper` -> `Dashboard`
- Responsibilities:
  - Render welcome screen (session-based, one-time)
  - Fetch and display user stats (points, rank, wallet, referrals, streak)
  - Show progression card and daily login card
  - Link to feature pages (syndicate, spin, wallet, leaderboard)

**Root Layout (`src/app/layout.tsx`):**
- Location: Wraps all pages
- Triggers: Page initialization
- Responsibilities:
  - Initialize three context providers: `TonProvider`, `TelegramProvider`, `InfoProvider`
  - Load Telegram WebApp SDK script
  - Render bottom navigation bar
  - Set global styling (dark theme, fonts)

**API Entry Points (Cron & Feature Routes):**
- `/api/auth/welcome` (POST): Triggers welcome bonus on new user
- `/api/referral` (POST): Process referral link activation
- `/api/spin` (POST): Daily spin action with weighted prize
- `/api/leaderboard` (GET): Return leaderboard by period
- `/api/cron/nudge` (POST): Batch notification processing (called by Vercel cron)
- `/api/verify-channel` (POST): Check channel subscription
- `/api/wallet/verify` (POST): Verify TON wallet connection
- `/api/syndicate` (GET): Get referral count for a user
- Debug routes: `/api/debug/*` for manual testing

**Client Pages:**
- `/` - Dashboard (main hub)
- `/chat` - AI Analyst (stub)
- `/news` - News feed (stub)
- `/settings` - Settings & notification preferences
- `/leaderboard` - Ranked users by period
- `/spin` - Daily spin interface
- `/wallet` - TON wallet verification
- `/syndicate` - Referral link generation
- Debug pages: `/debug/*` for testing engines

## Error Handling

**Strategy:** Try-catch at API route level, client-side error display via toast/modal

**Patterns:**

**Server-Side (API Routes):**
```typescript
// src/app/api/spin/route.ts
try {
  // Business logic
  const prize = getWeightedPrize();
  await awardPoints(userId, prize.value, 'daily_spin');
  return NextResponse.json({ success: true, prize });
} catch (error: any) {
  console.error('Spin API Error:', error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

**Idempotency Checks:**
```typescript
// Check if user already claimed action (e.g., welcome bonus, referral)
const { data: existing } = await supabaseAdmin
  .from('referrals')
  .select('id')
  .eq('referee_id', refereeId)
  .single();

if (existing) {
  return NextResponse.json({ message: 'Already referred' }, { status: 200 });
}
```

**Client-Side (Hooks):**
```typescript
// src/hooks/useDailyLogin.tsx
try {
  const { error } = await supabase.from('daily_logins').insert({...});
  if (!error) { setHasClaimedToday(true); }
} catch (err) {
  console.error(err);
  setLoading(false);
}
```

## Cross-Cutting Concerns

**Logging:**
- Console-based; errors logged to stdout via `console.error()`
- Tracked by Vercel deployment logs
- No external logging service integrated

**Validation:**
- Client-side: TypeScript type checking
- Server-side: Manual validation (userId check, Idempotency checks)
- Zod not in use; consider for future schema validation

**Authentication:**
- Telegram WebApp user extraction from `initDataUnsafe`
- Fallback mock user for browser development
- TON wallet via TonConnect (separate from Telegram auth)
- No JWT or session tokens; relies on Supabase RLS

**Time Zones:**
- Mumbai timezone used for daily spin reset (`Asia/Kolkata`)
- Daily login tracked by date string (`YYYY-MM-DD`)
- Leaderboard keys use date/week keys for bucketing

**Idempotency:**
- Session storage for one-time actions: `moon_has_started`, `referral_processed`
- Database checks: `referrals` table enforces referee uniqueness
- Transactions table tracks reason to prevent duplicate welcome bonus

---

*Architecture analysis: 2026-01-26*
