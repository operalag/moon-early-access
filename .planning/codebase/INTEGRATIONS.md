# External Integrations

**Analysis Date:** 2026-01-26

## APIs & External Services

**Telegram Bot API:**
- Service: Telegram Bot API
  - What it's used for: Sending push notifications/nudges to users, verifying channel membership
  - SDK/Client: Native fetch calls to `https://api.telegram.org/bot{TOKEN}`
  - Auth: `TELEGRAM_BOT_TOKEN` environment variable
  - Key endpoints:
    - `/bot{TOKEN}/sendMessage` - Send messages via megaphone nudge system (in `src/lib/megaphone.ts`)
    - `/bot{TOKEN}/getChatMember` - Verify user channel membership (in `src/app/api/verify-channel/route.ts`)
  - Channel tracked: `@cricketandcrypto`

**Telegram Web App:**
- Service: Telegram Web App SDK
  - What it's used for: Mini app integration, user context, authentication
  - SDK/Client: `@twa-dev/sdk` 8.0.2
  - Implementation: `src/hooks/useTelegram.tsx` - Dynamic import on client-side only
  - Script source: `https://telegram.org/js/telegram-web-app.js`
  - Used for: Getting Telegram user ID, app initialization

**Chatbase API:**
- Service: Chatbase (AI Chat API)
  - What it's used for: Chat interface for users, conversational AI responses
  - SDK/Client: Native fetch calls to `https://www.chatbase.co/api/v1/chat`
  - Auth: Bearer token in Authorization header
  - Endpoint: POST `/api/v1/chat`
  - Parameters: messages array, chatbotId, conversationId, stream, temperature
  - Implementation: `src/app/api/chat/route.ts`
  - Note: API key and chatbot ID are hardcoded in route (security concern)

**Telegram Channel Scraping:**
- Service: Telegram public channel scraping
  - What it's used for: Fetching latest news/messages from channel
  - Method: HTML scraping from `https://t.me/s/{channelUsername}`
  - Channel source: `cricketandcrypto`
  - Implementation: `src/app/api/news/route.ts`
  - Note: Simple regex-based HTML parsing, not official API

**TON Blockchain:**
- Service: TON blockchain wallet integration
  - What it's used for: Wallet connection, user identity on blockchain
  - SDK/Client: `@tonconnect/ui-react` 2.3.1
  - Implementation: `src/components/TonProvider.tsx`
  - Manifest: `https://prediction-early-access.vercel.app/tonconnect-manifest.json`
  - Usage: Wallet verification in `src/app/wallet/page.tsx`

## Data Storage

**Databases:**
- PostgreSQL via Supabase
  - Connection: Environment variables
    - `NEXT_PUBLIC_SUPABASE_URL` (public, for client)
    - `SUPABASE_SERVICE_ROLE_KEY` (secret, for server)
  - Client libraries: `@supabase/supabase-js` 2.91.0
  - Dual client setup:
    - `src/lib/supabaseClient.ts` - Anon key for client-side queries
    - `src/lib/supabaseAdmin.ts` - Service role key for admin/server operations
  - Schema/Tables:
    - `profiles` - User profiles with fields: telegram_id, first_name, has_joined_channel, is_push_enabled, last_active_at, last_notified_at
    - `points_history` - Points transactions with reason tracking
    - `referrals` - User referral tracking (via `referrals_migration.sql`)
    - `leaderboard_snapshot` - Periodic leaderboard snapshots (via `scoreboard_v4_migration.sql`)
  - Custom Functions (RPC):
    - `award_points_v2()` - Centralized points engine at `src/lib/pointsEngine.ts`
  - Migrations:
    - `megaphone_v5_migration.sql` - Push notification/nudge tracking schema
    - `scoreboard_v4_migration.sql` - Leaderboard functionality
    - `referrals_migration.sql` - Referral system

**File Storage:**
- Local filesystem only (no cloud storage detected)

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Custom Telegram-based authentication
  - Implementation: `src/components/AuthWrapper.tsx`
  - Method: Telegram user_id as unique identifier
  - Endpoints:
    - POST `/api/auth/welcome` - Initialize user profile on first login (awards welcome bonus)
    - POST `/api/verify-channel` - Verify channel membership and award points
  - User data stored in Supabase `profiles` table
  - Welcome bonus: 500 points awarded on first login
  - Point reasons: 'welcome_bonus', 'referral', 'daily_spin', 'daily_login', 'wallet_connect', 'channel_join', 'prediction_win', 'admin_adjustment'

**Wallet Authentication:**
- TON blockchain wallet via `@tonconnect/ui-react`
  - Endpoint: `src/app/api/wallet/verify/route.ts`
  - Purpose: Verify wallet connection status

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Console logging throughout codebase (console.error, console.warn, console.log)
- No centralized logging service detected
- Logged errors:
  - Supabase/database errors
  - Telegram API errors
  - Chatbase API errors
  - Missing environment variables (warnings)

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from deployment URLs and vercel.json)

**CI Pipeline:**
- Not detected (no GitHub Actions workflows found)

**Cron Jobs:**
- Configured via `vercel.json`:
  - Endpoint: `/api/cron/nudge?secret=moon_debug_123`
  - Schedule: Hourly (0 * * * *)
  - Implementation: `src/app/api/cron/nudge/route.ts`
  - Purpose: Automated nudge engine (megaphone) to send notifications to inactive users

## Environment Configuration

**Required env vars:**

**Client-side (public):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project endpoint
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key for client queries

**Server-side (secret):**
- `SUPABASE_SERVICE_ROLE_KEY` - Admin/service role key for server operations
- `TELEGRAM_BOT_TOKEN` - Bot token for Telegram messaging
- `CRON_SECRET` - Secret for verifying cron job requests (currently hardcoded as `moon_debug_123`)

**Optional:**
- `CHATBASE_API_KEY` - For Chatbase integration (currently hardcoded in route)
- `CHATBASE_CHATBOT_ID` - Chatbot ID (currently hardcoded in route)

**Secrets location:**
- Development: `.env.local` (committed - security risk for private keys)
- Production: Vercel environment variables (configured in Vercel dashboard)

## Webhooks & Callbacks

**Incoming:**
- POST `/api/chat` - Chat message endpoint for Chatbase integration
- POST `/api/verify-channel` - Channel membership verification
- POST `/api/auth/welcome` - User welcome/registration
- POST `/api/wallet/verify` - Wallet verification
- POST `/api/referral` - Referral tracking
- POST `/api/syndicate` - Syndicate/pool data
- POST `/api/spin` - Daily spin rewards
- GET `/api/news` - News fetching from Telegram
- GET `/api/leaderboard` - Leaderboard data
- GET `/api/cron/nudge` - Hourly nudge engine (cron triggered)
- Debug endpoints:
  - GET `/api/debug` - User debug info
  - GET `/api/debug/megaphone` - Megaphone engine testing
  - GET `/api/debug/points` - Points engine testing

**Outgoing:**
- Telegram Bot API (`https://api.telegram.org/bot{TOKEN}/sendMessage`) - Nudge notifications
- Telegram Bot API (`https://api.telegram.org/bot{TOKEN}/getChatMember`) - Membership verification
- Chatbase API (`https://www.chatbase.co/api/v1/chat`) - Chat responses
- Telegram channel scraping (`https://t.me/s/{channel}`) - News fetching

## Data Flow Summary

**User Onboarding:**
1. User opens Telegram Mini App
2. AuthWrapper captures Telegram user_id via `@twa-dev/sdk`
3. POST `/api/auth/welcome` creates profile in Supabase
4. Welcome bonus (500 points) awarded via `awardPoints()` engine
5. User data stored in `profiles` table

**Points System:**
1. User performs action (spin, login, channel join, etc.)
2. Server-side route calls `awardPoints()` from `src/lib/pointsEngine.ts`
3. Function invokes Supabase RPC `award_points_v2()`
4. Points recorded in `points_history` table with reason
5. User total updated in `profiles` table

**Notification System (Megaphone):**
1. Vercel cron triggers `/api/cron/nudge` hourly
2. `processMegaphoneBatch()` from `src/lib/megaphone.ts` executed
3. Queries stale users (inactive >24h, not notified in 48h) with push enabled
4. Sends random nudge via `sendTelegramMessage()` to Telegram Bot API
5. Updates `last_notified_at` timestamp
6. Auto-disables push if user blocked bot (403 error)

---

*Integration audit: 2026-01-26*
