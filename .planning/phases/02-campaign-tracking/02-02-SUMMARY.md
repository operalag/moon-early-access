---
phase: 02-campaign-tracking
plan: 02
subsystem: api
tags: [telegram-mini-app, startapp-param, campaign-tracking, attribution, debug-endpoint]

# Dependency graph
requires:
  - phase: 02-01
    provides: campaign_attributions table and POST /api/campaign endpoint
provides:
  - Detection logic to distinguish referral vs campaign codes in AuthWrapper
  - Routing logic for startapp parameter (numeric -> referral, alphanumeric -> campaign)
  - Debug endpoint GET /api/debug/campaigns for campaign attribution queries
affects: [analytics, marketing-dashboard, campaign-reporting]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Code type detection via regex (isReferralCode)
    - Silent attribution for marketing tracking (no UI feedback)
    - Separate session storage keys for different attribution types

key-files:
  created:
    - src/app/api/debug/campaigns/route.ts
  modified:
    - src/components/AuthWrapper.tsx

key-decisions:
  - "Referral = purely numeric (Telegram user IDs like 458184707)"
  - "Campaign = contains letters (alphanumeric codes like V1a, TW2b)"
  - "Separate session storage keys (referral_processed vs campaign_processed)"
  - "Campaign attribution is silent - no user-facing UI"

patterns-established:
  - "startapp param routing: check isReferralCode() first, then branch"
  - "Debug endpoints in /api/debug/* with multiple query modes"

# Metrics
duration: 2min
completed: 2026-01-27
---

# Phase 02 Plan 02: TMA Integration Summary

**startapp parameter detection and routing in AuthWrapper with debug endpoint for campaign attribution queries**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-27T16:37:26Z
- **Completed:** 2026-01-27T16:39:02Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments
- Added isReferralCode() function to distinguish numeric referrals from alphanumeric campaigns
- Implemented handleCampaign() for silent campaign attribution via POST /api/campaign
- Created GET /api/debug/campaigns endpoint with 3 query modes (stats, by campaign, by user)
- Preserved existing referral flow unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Add campaign detection and routing to AuthWrapper** - `9390cc1` (feat)
2. **Task 2: Create debug endpoint for campaign data** - `192d1e7` (feat)

## Files Created/Modified
- `src/components/AuthWrapper.tsx` - Added isReferralCode(), handleCampaign(), routing logic
- `src/app/api/debug/campaigns/route.ts` - Debug endpoint with 3 query modes

## Decisions Made
- **Code type detection:** Purely numeric = referral (Telegram user ID), contains letters = campaign
- **Separate session storage:** referral_processed vs campaign_processed keys allow user to have both
- **Silent attribution:** Campaign tracking has no UI feedback (unlike referrals which show toast)
- **Debug endpoint modes:** Aggregated stats (default), by campaignId, by userId

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation following existing patterns.

## User Setup Required

None - no external service configuration required. Uses existing supabaseAdmin client.

## Next Phase Readiness
- Campaign tracking feature complete (Phase 2 done)
- Detection: startapp param routing works
- Storage: campaign_attributions table populated via API
- Querying: debug endpoint available for marketing analytics
- Ready for Phase 3: Mock Trading UI

---
*Phase: 02-campaign-tracking*
*Completed: 2026-01-27*
