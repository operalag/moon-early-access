# Moon Prediction Mini App

## What This Is

A Telegram Mini App for cricket and crypto predictions. Users earn points through daily activities (spins, logins, referrals), compete on leaderboards, connect TON wallets, and learn Web3 concepts through gamified education. The app converts "Passive Watchers" into "Active Analysts" through gamified education and prediction market trading.

## Core Value

Get Telegram users engaged through gamification, then educate and guide them into becoming active prediction market traders on themoon.business.

## Current State (v6.0.0)

**Shipped:** 2026-02-03 — "Net Practice" educational onboarding

**What's working:**
- Net Practice menu with attention indicator
- Module 1 "The Kit Bag" — 6 slides teaching wallet concepts
- SlideEngine with swipe/arrow navigation
- Quiz with haptic feedback and confetti
- Progress tracking with resume capability
- 700 points + "Kit Owner" badge on completion
- Wallet-gated Module 2 & 3 teasers

**Codebase:** ~9,200 lines TypeScript
**Tech stack:** Next.js 16, React 19, Supabase, TailwindCSS, framer-motion, TonConnect

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
- ✓ Net Practice menu with attention indicator — v6.0.0
- ✓ SlideEngine with swipe/tap navigation — v6.0.0
- ✓ Haptic feedback on quiz answers — v6.0.0
- ✓ Module 1 wallet education (6 slides) — v6.0.0
- ✓ Quiz with right/wrong validation — v6.0.0
- ✓ Points award on module completion (700 pts) — v6.0.0
- ✓ Badge award ("Kit Owner") — v6.0.0
- ✓ Progress tracking and resume — v6.0.0
- ✓ Wallet-gated module teasers — v6.0.0

### Active

<!-- Current scope. Building toward these. -->

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

- **Current state:** v6.0.0 shipped — Education Module 1 complete
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
| Static JSON for education content | Easy updates without deploy | ✓ Good |
| Points not XP | Single currency, existing engine | ✓ Good |
| Module 2+ wallet-gated | Incentivize wallet connection | ✓ Good |
| Incremental module release | Test Module 1 before 2 & 3 | ✓ Good |
| Discriminated union for slides | Type-safe variant handling | ✓ Good |
| Service-role only RLS | Security via server-side API only | ✓ Good |
| Haptic in component, confetti in engine | Separation of concerns | ✓ Good |
| AND logic for indicator | Avoid over-notification | ✓ Good |

---
*Last updated: 2026-02-03 after v6.0.0 milestone shipped*
