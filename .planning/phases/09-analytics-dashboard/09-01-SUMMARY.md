---
phase: 09-analytics-dashboard
plan: 01
subsystem: admin
tags: [recharts, date-fns, analytics, admin-dashboard, supabase]

# Dependency graph
requires:
  - phase: 02-campaign-tracking
    provides: supabaseAdmin pattern for server-side queries
provides:
  - Admin route protection via AdminGuard component
  - Overview API endpoint returning key metrics
  - Dashboard page with MetricCard grid
  - Charting dependencies (recharts, date-fns, heat-map, react-csv)
affects: [09-02-user-growth-charts, 09-03-user-engagement, 09-04-csv-export]

# Tech tracking
tech-stack:
  added: [recharts, date-fns, @uiw/react-heat-map, react-csv]
  patterns: [AdminGuard route protection, MetricCard display, auto-refresh dashboard]

key-files:
  created:
    - src/lib/adminConfig.ts
    - src/components/admin/AdminGuard.tsx
    - src/components/admin/MetricCard.tsx
    - src/app/admin/layout.tsx
    - src/app/admin/page.tsx
    - src/app/api/admin/analytics/overview/route.ts
    - src/app/admin/dashboard/page.tsx
  modified:
    - package.json

key-decisions:
  - "Admin ID allowlist pattern for route protection"
  - "AdminGuard shows Access Denied then redirects after 2 seconds"
  - "60-second auto-refresh for dashboard metrics"
  - "Mock user (ID 777000) is not in admin list - dev testing blocked by design"

patterns-established:
  - "AdminGuard: Client-side route protection using useTelegram + isAdmin"
  - "MetricCard: Reusable metric display with title, value, change, trend"
  - "Admin API: /api/admin/analytics/* pattern for analytics endpoints"

# Metrics
duration: 8min
completed: 2026-02-01
---

# Phase 09 Plan 01: Admin Dashboard Foundation Summary

**Protected admin routes with AdminGuard component, overview API returning 5 key metrics, and dashboard page with 4 MetricCards auto-refreshing every 60 seconds**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-01T11:00:00Z
- **Completed:** 2026-02-01T11:08:00Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Installed charting dependencies (recharts, date-fns, @uiw/react-heat-map, react-csv)
- Created admin route protection with AdminGuard and isAdmin allowlist
- Built overview API returning totalUsers, walletsConnected, walletConversionRate, totalPointsDistributed, totalReferrals
- Implemented dashboard page with responsive MetricCard grid (2 cols mobile, 4 cols desktop)
- Added 60-second auto-refresh with loading skeleton and error state handling

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create admin config** - `a4a2f64` (feat)
2. **Task 2: Create AdminGuard component and admin layout** - `6cdcb3d` (feat)
3. **Task 3: Create overview API and dashboard page** - `8b00c03` (feat)

## Files Created/Modified
- `package.json` - Added recharts, date-fns, @uiw/react-heat-map, react-csv, @types/react-csv
- `src/lib/adminConfig.ts` - Admin ID allowlist and isAdmin function
- `src/components/admin/AdminGuard.tsx` - Route protection with Access Denied UI
- `src/components/admin/MetricCard.tsx` - Reusable metric display component
- `src/app/admin/layout.tsx` - Admin layout wrapping children in AdminGuard
- `src/app/admin/page.tsx` - Index page redirecting to /admin/dashboard
- `src/app/api/admin/analytics/overview/route.ts` - Overview metrics API endpoint
- `src/app/admin/dashboard/page.tsx` - Dashboard with 4 MetricCards and auto-refresh

## Decisions Made
- **Admin ID allowlist pattern**: Using ADMIN_TELEGRAM_IDS array with isAdmin function for simple, explicit authorization
- **Access Denied behavior**: Shows message for 2 seconds then redirects to home (user feedback before redirect)
- **60-second auto-refresh**: Balance between data freshness and API load
- **Dev mode consideration**: Mock user ID 777000 is not in admin allowlist - prevents accidental admin access in browser testing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Build fails without SUPABASE_SERVICE_ROLE_KEY**: This is a known blocker documented in STATE.md. TypeScript compilation passes (npx tsc --noEmit succeeds), but npm run build fails during page data collection because API routes try to initialize supabaseAdmin without the service role key. This does not block development or the correctness of the code.

## User Setup Required

None - no external service configuration required. Admin user ID 458184707 is already configured.

## Next Phase Readiness

- Admin route protection infrastructure complete
- MetricCard component ready for reuse in charts
- Charting dependencies installed and ready
- Ready for Plan 02 (User Growth Charts) to add time-series visualizations

**Note:** To test the dashboard locally:
1. Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local
2. Run `npm run dev`
3. Access /admin/dashboard (requires Telegram user ID 458184707)

---
*Phase: 09-analytics-dashboard*
*Completed: 2026-02-01*
