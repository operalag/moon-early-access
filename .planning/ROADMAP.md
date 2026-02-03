# Project Roadmap

**Project:** Moon Prediction Mini App
**Version:** 1.0.0
**Created:** 2026-01-27

## Milestones

- **v1.0 MVP** - Phases 1-10 (in progress, paused at Phase 4 pending API)
- **v6.0.0 "Net Practice"** - Phases 11-14 (current focus)

## Phases Overview

<details>
<summary>Milestone 1: Prediction Market Integration (Phases 1-10)</summary>

### Phase 1: Launch Polish - COMPLETE (2026-01-27)
**Goal:** Ship a polished v1.0 release candidate with visual refinements
**Requirements:** Launch Polish items from PROJECT.md
- Leaderboard: Remove @username, show only name and avatar
- Visual tweaks across app (user declined - none needed)
- Page element reordering (user declined - none needed)

**Plans:**
- [x] 01-01: Remove @username from leaderboard + gather polish requirements
- [x] 01-02: Skipped (user specified no additional polish)

---

### Phase 2: Campaign Tracking - COMPLETE (2026-01-27)
**Goal:** Track user acquisition from marketing campaigns via startapp parameter
**Requirements:** Campaign attribution system

**Plans:**
- [x] 02-01: Create campaign_attributions table and POST /api/campaign endpoint
- [x] 02-02: Add detection logic to AuthWrapper and create debug endpoint

---

### Phase 3: Featured Market Gating - COMPLETE (2026-01-28)
**Goal:** Gate Featured Market access behind wallet connection with education and incentive

**Plans:**
- [x] 03-01: Wallet gating components and page integration

---

### Phase 4: themoon.business API Integration - BLOCKED
**Goal:** Connect to real market data from themoon.business
**Status:** BLOCKED until API documentation received

---

### Phase 5: Trading Execution
**Goal:** Enable real trades via TonConnect wallet integration
**Dependencies:** Phase 4 complete

---

### Phase 6: Tutorial & Onboarding
**Goal:** Guide new users through wallet setup and first trade
**Dependencies:** Phase 5 complete

---

### Phase 7: Position Management & Polish
**Goal:** Complete the trading loop with position tracking and settlement
**Dependencies:** Phase 6 complete

---

### Phase 8: Various Small Tasks - COMPLETE (2026-01-31)
**Goal:** Targeted UI polish - welcome page spacing and news feed limit

**Plans:**
- [x] 08-01: Welcome spacing adjustment + news feed limit

---

### Phase 9: Analytics Dashboard - COMPLETE
**Goal:** Build an admin dashboard with growth metrics

**Plans:**
- [x] 09-01: Foundation: deps, admin config, AdminGuard, overview API
- [x] 09-02: Core charts: user growth, wallet funnel, points economy
- [x] 09-03: Engagement: heatmap, retention curves, feature usage
- [x] 09-04: Marketing: campaign table, referral stats
- [x] 09-05: Polish: export, date picker, mobile responsive

---

### Phase 10: Admin Leaderboard View - COMPLETE (2026-02-02)
**Goal:** Display top 10 leaderboards in admin dashboard with export

**Plans:**
- [x] 10-01: Leaderboards API, LeaderboardTable component, dashboard integration

</details>

---

## Milestone 2: Net Practice (v6.0.0) - COMPLETE (2026-02-03)

Gamified educational onboarding using Cricket metaphors. Module 1 teaches wallet concepts through a 6-slide "Net Practice" session with quiz, haptic feedback, and rewards.

### Phase 11: Data Model & Content

**Goal:** Establish the foundation for education modules with database schema, content structure, and TypeScript types

**Depends on:** Nothing (standalone feature)

**Requirements:** PROG-01, CONT-01

**Success Criteria** (what must be TRUE):
1. Database table `user_education_progress` exists with columns for user_id, module_id, slide_index, completed_at, and badge_earned
2. Static JSON file `education_modules.json` contains Module 1 content with 6 slides
3. TypeScript types define Slide variants (intro, concept, quiz, action, reward) and Module structure
4. Module 2 and 3 placeholders exist in JSON (locked state)

**Plans:** 1 plan

Plans:
- [x] 11-01-PLAN.md — DB migration, TypeScript types, Module 1 JSON content

---

### Phase 12: Slide Engine Component

**Goal:** Build the core SlideEngine component that renders slides, handles navigation, and provides feedback

**Depends on:** Phase 11

**Requirements:** SLIDE-01, SLIDE-02, SLIDE-03, SLIDE-04, MOD1-02

**Success Criteria** (what must be TRUE):
1. User can swipe left/right or tap arrows to navigate between slides
2. Each slide type renders with its appropriate layout (intro with title/image, concept with text/illustration, quiz with options, action with CTA button, reward with animation)
3. Quiz slides show immediate feedback on selection (correct/incorrect state)
4. Correct quiz answers trigger haptic feedback (light impact) and confetti animation
5. Incorrect quiz answers trigger haptic feedback (heavy impact) without confetti

**Plans:** 2 plans

Plans:
- [x] 12-01-PLAN.md — SlideEngine with swipe/arrow navigation and all 5 slide type renderers
- [x] 12-02-PLAN.md — Quiz haptic feedback and confetti integration

---

### Phase 13: Module 1 Integration - COMPLETE (2026-02-03)

**Goal:** Wire up Module 1 content to SlideEngine with wallet connect action and completion rewards

**Depends on:** Phase 12

**Requirements:** MOD1-01, MOD1-03, MOD1-04, MOD1-05, PROG-02, PROG-03

**Success Criteria** (what must be TRUE):
1. User can complete all 6 slides of Module 1 ("The Kit Bag" wallet education)
2. Action slide triggers TonConnect wallet connection flow
3. On module completion, user earns ~700 points (awarded via existing points system)
4. On module completion, user earns "Kit Owner" badge (stored in database)
5. User returning to education sees their progress and can resume from last completed slide
6. Earned badges are visible in the module list view

**Plans:** 2 plans

Plans:
- [x] 13-01-PLAN.md — Progress/complete API routes, PointReason extension
- [x] 13-02-PLAN.md — Education pages, SlideEngine resume, wallet connect action

---

### Phase 14: Menu & Gating - COMPLETE (2026-02-03)

**Goal:** Add Net Practice entry point to main menu with attention indicator and locked module teasers

**Depends on:** Phase 13

**Requirements:** NAV-01, NAV-02, GATE-01, GATE-02

**Success Criteria** (what must be TRUE):
1. User can access "Net Practice" from the main navigation menu
2. Menu item shows pulsing indicator when education is incomplete AND wallet is not connected
3. Module 2 and Module 3 appear visually locked (grayed out, lock icon) when wallet is not connected
4. Locked modules display "Connect wallet to unlock" teaser message

**Plans:** 1 plan

Plans:
- [x] 14-01-PLAN.md — useEducationStatus hook, BottomNav with Net Practice tab and indicator, ModuleCard wallet-lock teaser

---

## Progress

**Execution Order:** 11 -> 12 -> 13 -> 14

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-3 | v1.0 | 4/4 | Complete | 2026-01-28 |
| 4-7 | v1.0 | 0/? | Blocked | - |
| 8 | v1.0 | 1/1 | Complete | 2026-01-31 |
| 9 | v1.0 | 5/5 | Complete | 2026-02-01 |
| 10 | v1.0 | 1/1 | Complete | 2026-02-02 |
| 11 - Data Model & Content | v6.0.0 | 1/1 | Complete | 2026-02-03 |
| 12 - Slide Engine | v6.0.0 | 2/2 | Complete | 2026-02-03 |
| 13 - Module 1 Integration | v6.0.0 | 2/2 | Complete | 2026-02-03 |
| 14 - Menu & Gating | v6.0.0 | 1/1 | Complete | 2026-02-03 |

---
*Roadmap created: 2026-01-27*
*v6.0.0 phases added: 2026-02-03*
