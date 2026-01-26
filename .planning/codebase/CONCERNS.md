# Codebase Concerns

**Analysis Date:** 2026-01-26

## Security Concerns

**Hardcoded Secrets in Production Deployment:**
- Issue: Cron job secret hardcoded in `vercel.json` as fallback value
- Files: `vercel.json` (line 4), `src/app/api/cron/nudge/route.ts` (line 12)
- Current: `"path": "/api/cron/nudge?secret=moon_debug_123"` in vercel.json, and fallback `const EXPECTED_SECRET = process.env.CRON_SECRET || 'moon_debug_123';`
- Impact: Production cron jobs are using debug secret. Any actor with knowledge of the URL can trigger nudge batches
- Fix approach: Remove hardcoded fallback entirely, require CRON_SECRET in environment. Use Vercel's environment variables exclusively

**Exposed Credentials in Repository:**
- Issue: `.env.local` file committed to git with sensitive tokens
- Files: `.env.local`
- Content: Contains GITHUB_PAT, SUPABASE_ANON_KEY, SUPABASE_URL (all exposed)
- Impact: GitHub PAT enables account access; Supabase key enables database access
- Fix approach: Rotate credentials immediately. Delete `.env.local` from git history using `git filter-branch` or `git filter-repo`. Add `.env.local` verification to pre-commit hooks
- Current mitigation: `.gitignore` correctly lists `.env*` but file was already committed

**Unauthenticated Cron Endpoint:**
- Issue: Secret validation is string comparison with no rate limiting
- Files: `src/app/api/cron/nudge/route.ts` (lines 8-16)
- Problem: Simple string equality check; no IP validation, no request signing, no rate limiting. Endpoint is public and discoverable
- Impact: Brute force vulnerable (low entropy secret), query string exposure in logs
- Fix approach: Use Vercel's built-in CRON authentication header, or implement HMAC-SHA256 signing with rotated keys. Add rate limiting per IP

**Type Safety Issues (Type Coercion Risks):**
- Issue: Widespread use of `any` type masks real errors
- Files:
  - `src/hooks/useTelegram.tsx` (lines 6-7, 16-17): `user: any`, `webApp: any`
  - `src/app/api/leaderboard/route.ts` (lines 10, 66, 68): `let data: any[]`, `(b: any)`
  - All catch blocks (22 occurrences) use `catch (error: any)`
- Impact: Invalid data can pass through silently; runtime errors not caught at compile time
- Fix approach: Create proper types for Telegram user, WebApp, API responses. Use union types instead of `any` in catch blocks

## Tech Debt

**Polling-Based Synchronization:**
- Issue: Multiple independent polling intervals causing excessive database queries
- Files:
  - `src/hooks/useProgression.ts` (line 101): `setInterval(fetchProgression, 5000)`
  - `src/app/page.tsx` (lines 96-97): Event listeners with `fetchData()` re-fetch
  - `src/components/AuthWrapper.tsx` (lines 57-82): 500ms polling for referral params
- Impact: ~12 queries/minute per user * N users = unnecessary database load. Battery drain on mobile. Race conditions between updates
- Fix approach: Implement WebSocket subscriptions via Supabase realtime or polling debouncing with exponential backoff

**Referral Parameter Detection Complexity:**
- Issue: Complex multi-source parameter detection with polling and late hydration handling
- Files: `src/components/AuthWrapper.tsx` (lines 54-82)
- Problem:
  - Polls every 500ms for up to 5 seconds (attempt count `> 10`)
  - Checks 4 different parameter sources (initDataUnsafe, URL query, URL hash, both with different param names)
  - sessionStorage used for deduplication
  - Interval cleanup depends on finding param or timeout
- Impact: Fragile to timing issues; could miss referral in slow networks; cleanup bugs if multiple sources fire
- Fix approach: Consolidate to single detection on mount + Telegram.WebApp ready() event; use AbortController for cleanup

**Mock User in Production Code:**
- Issue: Dev mode mock user enabled in production
- Files: `src/hooks/useTelegram.tsx` (lines 29-37)
- Code: Defaults to `id: 777000` (test ID) if not in Telegram environment
- Impact: Any non-Telegram user (browser, testing) gets test account; can access production features; leaderboard polluted
- Fix approach: Add feature flag for dev mode; gate mocking to non-production environments only

**Metrics Calculation With Missing Data:**
- Issue: Leaderboard buckets logic has unresolved queries
- Files: `src/app/api/leaderboard/route.ts` (lines 25-36)
- Problem: Weekly bucket date handling is incomplete (`// TODO: use latestKey dynamically`). Comments admit the query strategy may be wrong
- Impact: Weekly leaderboards may show stale data or mixed periods
- Fix approach: Implement Postgres function to calculate period keys consistently; return explicitly filtered by date range

**Error Handling Gaps:**
- Issue: Database errors continue execution instead of failing safely
- Files: `src/app/api/referral/route.ts` (lines 44-50)
- Code: Points engine error is caught and logged but request succeeds with 200. Referral created but points not awarded
- Impact: Users see success but don't get rewards. Silent data inconsistency
- Fix approach: Either fail the entire referral (rollback insert) or implement async job queue for point reconciliation with retry logic

**Race Condition in Daily Spin:**
- Issue: Time zone handling for daily limit may have off-by-one error
- Files: `src/app/api/spin/route.ts` (lines 24-32)
- Problem: Uses `getMumbaiDate()` to format date string, compares strings. New Day detection is client-side JS date math in `src/app/spin/page.tsx` (lines 84-92)
- Impact: User at 23:59 Mumbai time might see inconsistent daily limits; manual localStorage manipulation bypasses server check
- Fix approach: Server-side store of unix timestamps; remove client-side localStorage date logic

## Performance Bottlenecks

**N+1 Query Pattern in Dashboard:**
- Issue: Multiple sequential Supabase queries on page load
- Files: `src/app/page.tsx` (lines 46-86)
- Queries:
  1. Fetch profile
  2. Count referrals (separate query)
  3. Fetch last login
  4. Count users above current points (can be expensive)
- Impact: 4 round-trips for dashboard; scales poorly with user base
- Fix approach: Create Supabase view that joins and aggregates; fetch once

**Unoptimized Leaderboard Query:**
- Issue: Orders by period_key AND points, then filters in JavaScript
- Files: `src/app/api/leaderboard/route.ts` (lines 42-66)
- Problem: May fetch 50+ records just to filter to one period; no index on (period_type, period_key, points)
- Impact: Leaderboard API slow with large bucket tables
- Fix approach: Add Postgres index; use `eq()` and `order()` together; defer sorting to database

**Missing Indexes on Hot Tables:**
- Issue: No visible index definitions for frequent queries
- Impact Areas:
  - `profiles` table queried by `telegram_id` (every request)
  - `referrals` table queried by `referee_id`
  - `leaderboard_buckets` queried by `period_type, period_key, points`
- Fix approach: Ensure Postgres indexes exist on these columns via migration

**Polling Every 5 Seconds:**
- Issue: `useProgression` interval updates all tab stats constantly
- Files: `src/hooks/useProgression.ts` (line 101)
- Cost: 12 API calls/min per user for syndicate count + supabase queries
- Fix approach: Increase interval to 30-60s; listen for user actions instead

## Known Bugs & Behavior Issues

**Referral Deduplication May Fail:**
- Issue: Uses `single()` to check existing referral but will error if no row exists
- Files: `src/app/api/referral/route.ts` (lines 19-23)
- Code: `.single()` throws if count != 1
- Impact: First referral triggers error, subsequent referrals are deduplicated. User sees "Already referred" on second attempt but points awarded differently
- Fix approach: Use `.maybeSingle()` or change to `.count()` with `eq('exact')`

**Telegram Message Blocking Not Handled Gracefully:**
- Issue: Blocks automatically disable push but user not notified
- Files: `src/lib/megaphone.ts` (lines 49-55)
- Code: Auto opt-out on 403 error (blocked by user) but no notification to user
- Impact: Users won't know notifications stopped; support confused by silent failures
- Fix approach: Add `blocked_at` timestamp; create admin UI to review; send in-app notification before disabling

**Spin Redirect Happens Regardless of Success:**
- Issue: Redirect to home happens in setTimeout regardless of API response
- Files: `src/app/spin/page.tsx` (lines 153-155)
- Problem: If API fails, timeout still redirects after 3s, losing context
- Impact: User thinks spin succeeded when it failed; points not awarded but user moved away
- Fix approach: Only redirect on `res.ok`, show error modal otherwise

**Double-Fetch on AuthWrapper Mount:**
- Issue: `useEffect` calls `syncUser()` immediately then again for referral handling
- Files: `src/components/AuthWrapper.tsx` (lines 54-95)
- Impact: Profile sync happens twice if user data available; database hit on every mount
- Fix approach: Single effect with conditional logic; memoize user data

## Fragile Areas

**Leaderboard Period Key Generation:**
- Files: `src/app/api/leaderboard/route.ts` (lines 25-35)
- Why fragile: Comment admits weekly key generation is "tricky in JS". Logic incomplete, commented with TODO. If Postgres function schema changes, JS query breaks
- Safe modification: Add Postgres function `get_period_key()` that returns key consistently. Use only that function from API
- Test coverage: No visible tests for weekly/daily period selection

**Telegram Bot Token Handling:**
- Files: `src/lib/telegramBot.ts` (lines 1-5)
- Why fragile: Token missing check only warns, doesn't prevent function calls. Function will fail at runtime with cryptic 401 from Telegram
- Safe modification: Validate token existence; throw in module initialization; add integration tests that verify Telegram connectivity
- Test coverage: None visible

**Points Engine RPC Call:**
- Files: `src/lib/pointsEngine.ts` (lines 27-32)
- Why fragile: Calls `award_points_v2` Postgres function. If function deleted or schema changes, all points awards fail silently (caught but logged)
- Safe modification: Create Supabase migration version control; add function signature tests; implement function wrapper with validation
- Test coverage: No tests visible

**AuthWrapper Cleanup:**
- Files: `src/components/AuthWrapper.tsx` (line 85)
- Why fragile: Cleanup only clears interval if referral found OR after 5s. If component unmounts during polling, interval may leak
- Safe modification: Move to useEffect return cleanup; always clear on unmount; use AbortController pattern
- Test coverage: None visible

## Missing Test Coverage

**API Route Security:**
- What's untested: All cron/secret validation, referral idempotency, rate limiting per user
- Files: `src/app/api/cron/nudge/route.ts`, `src/app/api/referral/route.ts`
- Risk: Brute force, duplicate rewards, unauthorized access possible without catching

**Points Engine Atomic Transactions:**
- What's untested: Multi-step point awards (insert referral + award points). Referral inserted but points fail = inconsistent state
- Files: `src/app/api/referral/route.ts` (lines 30-50)
- Risk: Data inconsistency undetected until reconciliation

**Telegram Messaging:**
- What's untested: Block detection, retry logic, message formatting
- Files: `src/lib/telegramBot.ts`, `src/lib/megaphone.ts`
- Risk: Messages silently fail to send; users think they're getting notifications but aren't

**Date/Time Handling:**
- What's untested: Mumbai timezone conversion, daily/weekly period boundaries
- Files: `src/app/api/spin/route.ts`, leaderboard logic
- Risk: Off-by-one errors at period boundaries; users exploit timezone differences

## Scaling Limits

**Polling Overhead:**
- Current: 5s intervals * N users * 2-3 API calls per poll = 24-36 calls/minute per user
- Limit: At 10k users = 240k-360k API calls/minute to Supabase. Likely hits rate limits
- Scaling path: Switch to realtime subscriptions; add edge caching for leaderboards

**Megaphone Batch Processing:**
- Current: 20 users per cron job (hour-based schedule)
- Limit: At 100k users, full cycle takes ~5000 hours (208 days) to notify each user once
- Scaling path: Increase batch size to 500-1000; run more frequently; parallelize with job queue (Bull, Temporal)

**Database Connections:**
- Current: Each API route creates Supabase admin client
- Limit: At 1000 concurrent requests, connection pool exhaustion
- Scaling path: Implement singleton pattern for admin client; add connection pooling config

**Leaderboard Read Amplification:**
- Current: Every daily/weekly request reads ALL buckets then filters
- Limit: At 10k users, 100+ bucket rows per day = 10k+ rows to scan per request
- Scaling path: Denormalize to current_leaderboard table; implement read replicas

## Dependencies at Risk

**Telegram WebApp SDK (@twa-dev/sdk):**
- Risk: Minimal maintenance, single maintainer. Type definitions may diverge from reality
- Usage: Core auth mechanism; app crashes if SDK unavailable
- Impact: Any breaking change in Telegram platform breaks authentication
- Migration plan: Implement abstraction layer `useWebAppIntegration()` that mocks SDK; use browser detection to swap implementations

**Next.js 16.1.4:**
- Risk: Very recent version; limited production use outside Vercel ecosystem
- Usage: Entire framework; cron, API routes, app router
- Impact: Breaking changes possible; security patches may lag
- Migration plan: Pin to 15.x LTS if available; implement compatibility layer for app router changes

**React 19.2.3:**
- Risk: Experimental version with Suspense/Promise-based features
- Usage: All components
- Impact: Changes in concurrent rendering may expose hydration bugs
- Migration plan: Use React.lazy() boundaries; add hydration error monitoring

## Missing Critical Features

**Error Recovery Mechanisms:**
- Problem: No retry logic for failed API calls or notifications
- Blocks: Users don't receive referral rewards or notifications if network drops
- Implementation: Add exponential backoff retry wrapper for all fetch() calls; implement dead-letter queue for failed messages

**User Account Recovery:**
- Problem: No way to recover if Telegram user loses access or changes ID
- Blocks: Users lose all progress; no migration path
- Implementation: Add email/phone verification; allow account linking; implement account merge on ID change

**Audit Logging:**
- Problem: No logs of points awards, referrals, or security events
- Blocks: Can't investigate disputes, detect fraud, or debug errors
- Implementation: Log all state changes to audit table; add admin UI to view logs

**Admin Dashboard:**
- Problem: No way to manually adjust points, disable users, or view system health
- Blocks: Can't respond to user support requests; can't fix data inconsistencies
- Implementation: Create protected `/admin` route with user/points/notification management

**Analytics/Monitoring:**
- Problem: No visibility into user behavior, API performance, or error rates
- Blocks: Can't optimize features; performance regressions undetected
- Implementation: Add Sentry for error tracking; implement custom analytics for user funnels

---

*Concerns audit: 2026-01-26*
