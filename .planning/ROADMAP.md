# Project Roadmap

**Project:** Moon Prediction Mini App
**Version:** 1.0.0
**Created:** 2026-01-27

## Milestones

- **v5.x Partial** — Phases 1-10 (blocked at Phase 4 pending API)
- **v6.0.0 "Net Practice"** — Phases 11-14 (SHIPPED 2026-02-03)

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

<details>
<summary>v6.0.0 Net Practice (Phases 11-14) — SHIPPED 2026-02-03</summary>

Gamified educational onboarding using Cricket metaphors. Module 1 teaches wallet concepts through a 6-slide "Net Practice" session with quiz, haptic feedback, and rewards.

- [x] Phase 11: Data Model & Content (1/1 plans) — 2026-02-03
- [x] Phase 12: Slide Engine Component (2/2 plans) — 2026-02-03
- [x] Phase 13: Module 1 Integration (2/2 plans) — 2026-02-03
- [x] Phase 14: Menu & Gating (1/1 plans) — 2026-02-03

**Archive:** `.planning/milestones/v6.0.0-ROADMAP.md`

</details>

---

## Progress

**Execution Order:** 1-3, 8-10, 11-14 (4-7 blocked)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-3 | v5.x | 4/4 | Complete | 2026-01-28 |
| 4-7 | v5.x | 0/? | Blocked | - |
| 8 | v5.x | 1/1 | Complete | 2026-01-31 |
| 9 | v5.x | 5/5 | Complete | 2026-02-01 |
| 10 | v5.x | 1/1 | Complete | 2026-02-02 |
| 11-14 | v6.0.0 | 6/6 | SHIPPED | 2026-02-03 |

---
*Roadmap created: 2026-01-27*
*v6.0.0 shipped: 2026-02-03*
