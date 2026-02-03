# Moon Prediction Mini App

## What This Is

A Telegram Mini App for cricket and crypto predictions. Users earn points through daily activities (spins, logins, referrals), compete on leaderboards, and connect TON wallets. The app converts "Passive Watchers" into "Active Analysts" through gamified education and prediction market trading.

## Core Value

Get Telegram users engaged through gamification, then educate and guide them into becoming active prediction market traders on themoon.business.

## Current Milestone: v6.0.0 "Net Practice"

**Goal:** Ship an educational onboarding module that teaches Web3 and prediction market concepts using Cricket metaphors, increasing wallet connection and first trade rates.

**Target features:**
- New "Net Practice" menu item
- SlideEngine component (swipe/tap stories format)
- Module 1: "The Kit Bag" — 6 slides teaching wallet concepts
- Quiz logic with haptic feedback and confetti
- Points integration (2000 total across all modules)
- Progress tracking with badges
- Locked module teasers for wallet-gated content

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Telegram authentication via WebApp SDK — existing
- ✓ Points engine with atomic transactions (RPC) — existing
- ✓ Daily spin with weighted prizes — existing
- ✓ Referral system with points rewards — existing
- ✓ Daily login streaks — existing
- ✓ Leaderboard (daily/weekly/all-time) — existing
- ✓ TON wallet connection via TonConnect — existing
- ✓ Settings with notification preferences — existing
- ✓ Megaphone nudge system for re-engagement — existing
- ✓ Channel membership verification — existing
- ✓ Campaign tracking for marketing attribution — Phase 2
- ✓ Wallet gating for Featured Market — Phase 3
- ✓ Admin analytics dashboard — Phase 9
- ✓ Admin leaderboard view with CSV export — Phase 10
- ✓ Weekly rewards banner — v5.7.0
- ✓ Dynamic leaderboard (user-centered) — v5.9.0
- ✓ Task completion confetti — v5.10.0

### Active

<!-- Current scope. Building toward these. -->

**Net Practice (v6.0.0):**
- [ ] "Net Practice" menu item in main navigation
- [ ] SlideEngine component with swipe/tap navigation
- [ ] Haptic feedback on quiz answers (correct/wrong)
- [ ] Module 1: "The Kit Bag" (6 slides) — wallet education
- [ ] Quiz logic with right/wrong validation
- [ ] Points award on module completion (~700 pts for Module 1)
- [ ] Badge award ("Kit Owner") on module completion
- [ ] Progress tracking (user_education_progress table)
- [ ] Locked Module 2 & 3 with "Connect wallet to unlock" teaser
- [ ] Action triggers (wallet connect from within slides)

**Future Modules (v6.1.0+):**
- [ ] Module 2: "The Ticket & The Score" — TON vs USDT education
- [ ] Module 3: "The Analyst vs. The Gambler" — Trading vs Betting

**Prediction Market Integration (blocked):**
- [ ] Integrate market from themoon.business
- [ ] Display market data and trading interface

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Full betting/gambling features — this is a prediction market (trading), explicitly not betting
- Multi-chain wallet support — TON only for v1
- Native mobile app — Telegram Mini App is the platform
- Video content in education — Keep lightweight, text + Lottie only
- Practice/testnet trading mode — Real trades teach better
- Community market creation — Moderation overhead too high

## Context

- **Current state:** v5.10.0-beta — gamification complete, education next
- **Target audience:** Cricket fans in India, Pakistan, Bangladesh
- **Platform:** Telegram Mini App ecosystem
- **Blockchain:** TON network
- **External dependency:** themoon.business prediction market platform (blocked)
- **User journey:** Gamification → Education → Wallet → Trading
- **Content format:** Static JSON (education_modules.json) for easy updates

## Constraints

- **Platform:** Telegram Mini App (WebApp SDK constraints)
- **Blockchain:** TON network only (Telegram mandate)
- **Stack:** Next.js 16, React 19, Supabase, TailwindCSS (established patterns)
- **Content:** Static JSON for education modules (no CMS needed)
- **Points:** Feeds into existing points system (not separate XP)

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use trading framing, not betting | Regulatory and positioning clarity | ✓ Good |
| Play-first architecture | Wallet unlocks after engagement | ✓ Good |
| Static JSON for education content | Easy updates without deploy | — Pending |
| Points not XP | Single currency, existing engine | — Pending |
| Module 2+ wallet-gated | Incentivize wallet connection | — Pending |
| Incremental module release | Test Module 1 before 2 & 3 | — Pending |

---
*Last updated: 2026-02-03 after milestone v6.0.0 started*
