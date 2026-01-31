# Project Roadmap

**Project:** Moon Prediction Mini App
**Version:** 1.0.0
**Created:** 2026-01-27

## Milestone 1: Prediction Market Integration (Current)

Transform the gamified Telegram Mini App into an active prediction market trading platform with guided onboarding.

---

### Phase 1: Launch Polish ✓
**Goal:** Ship a polished v1.0 release candidate with visual refinements
**Requirements:** Launch Polish items from PROJECT.md
- ✓ Leaderboard: Remove @username, show only name and avatar
- ✓ Visual tweaks across app (user declined - none needed)
- ✓ Page element reordering (user declined - none needed)

**Estimated complexity:** S (1-2 days)
**Research needed:** No
**Dependencies:** None
**Status:** COMPLETE (2026-01-27)
**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Remove @username from leaderboard + gather polish requirements
- [x] 01-02-PLAN.md — Skipped (user specified no additional polish)

**Success Criteria:**
- ✓ Leaderboard displays name and avatar only (no @username)
- ✓ Visual tweaks applied per user feedback (none requested)
- ✓ Page elements reordered as specified (none requested)

---

### Phase 2: Campaign Tracking ✓
**Goal:** Track user acquisition from marketing campaigns via startapp parameter
**Requirements:** Campaign attribution system
- ✓ Detect if startapp parameter is a campaign ID (e.g., "V1a", "V1b") or a referral (numeric user ID)
- ✓ For referrals: keep existing flow unchanged
- ✓ For campaigns: record campaign attribution (user_id, campaign_id, timestamp)
- ✓ Database table to store campaign attributions
- ✓ Admin view to see which users came through which campaigns

**Estimated complexity:** S (1 day)
**Research needed:** No
**Dependencies:** Phase 1 complete
**Status:** COMPLETE (2026-01-27)
**Plans:** 2 plans

Plans:
- [x] 02-01-PLAN.md — Create campaign_attributions table and POST /api/campaign endpoint
- [x] 02-02-PLAN.md — Add detection logic to AuthWrapper and create debug endpoint

**Success Criteria:**
- ✓ startapp parameter correctly identified as campaign vs referral
- ✓ Campaign attributions stored in database
- ✓ Existing referral flow unchanged
- ✓ Campaign data queryable (debug endpoint)

---

### Phase 3: Featured Market Gating ✓
**Goal:** Gate Featured Market access behind wallet connection with education and incentive
**Requirements:** Prediction Market Integration - Wallet gating before external market access
- ✓ Featured Market card shows lock indicator when wallet not connected
- ✓ Tap triggers bottom sheet modal with wallet education
- ✓ Points reward (~1000+) for connecting wallet (shown upfront)
- ✓ Connected users go directly to themoon.business via Telegram openLink

**Estimated complexity:** S (1-2 days)
**Research needed:** No
**Dependencies:** Phase 2 complete ✓
**Status:** COMPLETE (2026-01-28)
**Plans:** 1 plan

Plans:
- [x] 03-01-PLAN.md — Wallet gating components and page integration

**Success Criteria:**
- ✓ Featured Market card shows lock + "Wallet required" when no wallet
- ✓ Bottom sheet modal explains requirement, offers "Connect Wallet" CTA
- ✓ Points awarded on wallet connection
- ✓ Connected users redirected to themoon.business on tap

---

### Phase 4: themoon.business API Integration
**Goal:** Connect to real market data from themoon.business
**Requirements:** Prediction Market Integration - Integrate a market from themoon.business
- Market client library (lib/marketClient.ts)
- API routes proxying to themoon.business
- Real market data flowing to UI
- Error handling and loading states

**Estimated complexity:** L (3-5 days)
**Research needed:** YES - BLOCKED until API documentation received
**Dependencies:** Phase 3 complete, themoon.business API access

**Success Criteria:**
- Real markets displayed from themoon.business
- Market data updates in real-time (polling or WebSocket)
- API errors handled gracefully
- initData validation on all API routes

**Research Notes:**
- Contact themoon.business for API documentation
- Clarify: authentication mechanism, trade submission flow, settlement, token type
- Fallback options: direct smart contract, iframe embed

---

### Phase 5: Trading Execution
**Goal:** Enable real trades via TonConnect wallet integration
**Requirements:** Prediction Market Integration - Trading interface
- Trade preparation endpoint
- TonConnect transaction signing flow
- Optimistic trade UI with recovery
- Transaction confirmation and receipts

**Estimated complexity:** M (2-3 days)
**Research needed:** Maybe - depends on themoon.business transaction flow
**Dependencies:** Phase 4 complete, TonConnect patterns established

**Success Criteria:**
- User can submit a trade and sign with TonConnect
- Transaction status shows (pending, confirmed, failed)
- Optimistic UI updates immediately, reconciles on confirmation
- Gas fees displayed transparently before signing

---

### Phase 6: Tutorial & Onboarding
**Goal:** Guide new users through wallet setup and first trade
**Requirements:** Tutorial/Onboarding items from PROJECT.md
- Wallet creation/connection coaching
- Prediction market basics education
- First trade completion with reward

**Estimated complexity:** M (2-3 days)
**Research needed:** No
**Dependencies:** Phase 5 complete (trading must work to teach it)

**Success Criteria:**
- New user guided through wallet connection (not required upfront)
- Tutorial explains prediction market concepts in plain language
- User completes first trade with guided walkthrough
- First trade reward granted (points, badge, or both)
- Progress tracked and persisted

---

### Phase 7: Position Management & Polish
**Goal:** Complete the trading loop with position tracking and settlement
**Requirements:** Prediction Market Integration - final polish
- Position polling with real-time updates
- Settlement handling (claim winnings)
- Points engine integration for trading activity
- Final UX polish and edge cases

**Estimated complexity:** M (2-3 days)
**Research needed:** No
**Dependencies:** Phase 6 complete

**Success Criteria:**
- User can view all open positions with live P&L
- Settlement flow works (automatic or user-initiated)
- Points awarded for trading milestones
- Error states and edge cases handled

---

### Phase 8: Various Small Tasks ✓
**Goal:** Targeted UI polish - welcome page spacing and news feed limit
**Requirements:** Various small tasks and improvements
- ✓ Reduce welcome page top spacing (~20-30% less top gap)
- ✓ Limit news feed to 4 items
**Estimated complexity:** S
**Research needed:** No
**Dependencies:** None (independent of other phases)
**Status:** COMPLETE (2026-01-31)
**Plans:** 1 plan

Plans:
- [x] 08-01-PLAN.md — Welcome spacing adjustment + news feed limit

**Success Criteria:**
- ✓ Welcome screen content positioned higher (reduced top gap)
- ✓ News section displays exactly 4 items
- ✓ All other screens unchanged

---

## Success Criteria for Milestone 1

Milestone 1 is complete when:
- [x] Launch Polish shipped (v1.0 ready)
- [ ] User can browse real markets from themoon.business
- [ ] User can execute a trade via TonConnect
- [ ] New user can complete tutorial and first trade with reward
- [ ] Positions tracked with P&L display
- [ ] Trading vocabulary uses "trading" framing, not "betting"

## Risk Summary

| Risk | Mitigation | Phase |
|------|------------|-------|
| themoon.business API unavailable | Fallback to iframe or smart contract direct | Phase 4 |
| Premature wallet prompts cause abandonment | Wallet deferred until trading; tutorial guides | Phase 6 |
| Crypto jargon overwhelms users | Plain language, progressive disclosure | Phase 6 |
| TON-only violation | TonConnect SDK only, no multichain | Phase 5 |

## Timeline Estimate

| Phase | Complexity | Days |
|-------|------------|------|
| 1 - Launch Polish | S | 1-2 |
| 2 - Campaign Tracking | S | 1 |
| 3 - Mock Trading UI | M | 2-3 |
| 4 - API Integration | L | 3-5 |
| 5 - Trading Execution | M | 2-3 |
| 6 - Tutorial & Onboarding | M | 2-3 |
| 7 - Position Management | M | 2-3 |
| **Total** | | **14-21 days** |

Note: Phase 4 may be blocked pending themoon.business API access. Phases 1-3 can proceed immediately.

---
*Roadmap created: 2026-01-27*
*Based on: PROJECT.md requirements, research/SUMMARY.md findings*
