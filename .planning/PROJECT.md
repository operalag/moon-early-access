# Moon Prediction Mini App

## What This Is

A Telegram Mini App for cricket and crypto predictions. Users earn points through daily activities (spins, logins, referrals), compete on leaderboards, and connect TON wallets. The app is preparing for launch with the goal of onboarding Telegram users into the prediction market ecosystem at themoon.business.

## Core Value

Get Telegram users engaged through gamification, then guide them into becoming active prediction market traders on themoon.business.

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

### Active

<!-- Current scope. Building toward these. -->

**Launch Polish (v1.0):**
- [ ] Leaderboard: Remove @username, show only name and avatar
- [ ] Visual tweaks across app
- [ ] Page element reordering

**Prediction Market Integration:**
- [ ] Integrate a market from themoon.business into the mini app
- [ ] Display market data and trading interface

**Tutorial/Onboarding (depends on market integration):**
- [ ] Wallet creation/connection coaching
- [ ] Prediction market basics education (trading, not betting)
- [ ] First trade completion with reward

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Full betting/gambling features — this is a prediction market (trading), explicitly not betting
- Multi-chain wallet support — TON only for v1
- Native mobile app — Telegram Mini App is the platform

## Context

- **Current state:** Release Candidate 260126 — app is functional and stable
- **Launch target:** Preparing for public launch
- **Platform:** Telegram Mini App ecosystem
- **Blockchain:** TON network
- **External dependency:** themoon.business prediction market platform
- **User journey:** Gamification → Wallet → Education → Trading

## Constraints

- **Platform:** Telegram Mini App (WebApp SDK constraints)
- **Blockchain:** TON network only
- **External API:** themoon.business must be integrated before tutorial can be built
- **Stack:** Next.js 16, React 19, Supabase, TailwindCSS (established patterns)

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use trading framing, not betting | Regulatory and positioning clarity | — Pending |
| Tutorial depends on market integration | Can't teach trading without a market to trade on | — Pending |
| Incremental launch polish before new features | Ship stable, then expand | — Pending |

---
*Last updated: 2025-01-26 after initialization*
