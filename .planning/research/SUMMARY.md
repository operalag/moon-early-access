# Project Research Summary

**Project:** Moon Prediction Mini App - Prediction Market Integration
**Domain:** Prediction market trading interface + crypto onboarding for Telegram Mini App
**Researched:** 2026-01-27
**Confidence:** MEDIUM (high confidence on stack/patterns, low confidence on themoon.business API specifics)

## Executive Summary

This project integrates a prediction market trading interface (themoon.business) into an existing Telegram Mini App that already has gamification, wallet connection (TonConnect), and user engagement features. The recommended approach is a **play-first, trade-later** architecture where users build engagement through virtual points before transitioning to real money trading. The existing Next.js 16 + React 19 + Supabase + TonConnect stack provides strong foundations; new additions are limited to TanStack Query (server state), Zustand (client state), @ton/ton (blockchain transactions), and lightweight-charts (financial visualization).

The most significant research finding is the **critical dependency on themoon.business API documentation**. The recommended integration approach (direct API) cannot proceed without API access, and fallback options (smart contract direct or iframe embed) each have significant trade-offs. The integration approach must be confirmed with themoon.business before detailed implementation planning.

Key risks center on user experience: premature wallet prompts cause 70%+ abandonment, crypto jargon overwhelms beginners, and gambling-like gamification creates regulatory exposure. These are mitigated by progressive disclosure, plain-language UI, and gamifying analysis quality rather than trading volume. Telegram's mandatory TON-only policy is a hard compliance requirement that must be followed precisely.

## Key Findings

### Recommended Stack

The existing stack (Next.js 16, React 19, Supabase, TonConnect 2.3.1, @twa-dev/sdk, Framer Motion) remains unchanged. New additions are focused and minimal.

**Core technologies to add:**
- **@tanstack/react-query ^5.90.x**: Server state management with built-in polling for real-time market data, suspense support, excellent caching
- **zustand ^5.0.x**: Client state management for trade slip, tutorial progress, UI preferences; lightweight with no boilerplate
- **@ton/ton ^16.1.0 + @ton/core ^0.62.0**: TON blockchain client for transaction building, wallet operations, contract interactions
- **lightweight-charts ^5.1.0**: TradingView's open-source financial charts library; 45KB, optimized for candlestick and time-series

**Optional (conditional on needs):**
- @ton-api/client + @ton-api/streaming: For real-time TON monitoring (in "public alpha" - expect changes)
- @ston-fi/sdk: Only if themoon.business uses STON.fi pools for liquidity

**Bundle impact:** ~125KB gzipped worst case; mitigate with dynamic imports for charts and trading components.

### Expected Features

**Must have (table stakes):**
- Market listing with probability display (65% not $0.65)
- Buy/sell interface (market orders only for MVP)
- Position display with current value and P&L
- Transaction confirmation with clear fee transparency
- Real-time price updates (polling or WebSocket)
- Wallet balance display and connection state

**Should have (differentiators):**
- Interactive tutorial guiding first trade (not separate modules)
- Gamified first-trade reward (points bonus, achievement badge)
- One-tap trading (Pariflow-style friction reduction)
- Progress bar/checklist for onboarding completion
- Contextual tooltips explaining concepts at moment of need

**Defer (v2+):**
- Limit orders, order book display
- P&L charts and analytics dashboard
- Smart money indicators, AI insights
- Practice/testnet mode (real trades teach better)
- Community market creation (moderation overhead)

### Architecture Approach

The architecture extends existing patterns: API routes proxy external calls (hiding keys, enforcing auth), TelegramContext provides user identity, TonProvider handles wallet operations. New components follow established boundaries.

**Major components:**
1. **Market Discovery UI** (app/market/page.tsx) - Browse/search markets, display odds; read-only
2. **Trading Interface UI** (app/market/[marketId]/page.tsx) - Order entry, buy/sell, confirmations; owns order draft state
3. **Position Manager UI** (app/positions/page.tsx) - Display open positions, P&L, settlement; read-only
4. **Market API Routes** (/api/market/*) - Proxy to themoon.business, verify initData, transform data
5. **Market Client** (lib/marketClient.ts) - Server-side themoon.business API wrapper
6. **Market State** (context/MarketContext.tsx or Zustand store) - Cached market data, trade slip state

**Key patterns to follow:**
- Optimistic UI with localStorage recovery for pending trades
- Server-side initData verification on every API route
- Short polling (15s) for positions; stop when backgrounded
- API routes as proxy (never expose external API keys to frontend)

### Critical Pitfalls

1. **Premature wallet connection** - 70%+ abandonment when wallet prompt appears before value demonstration. Mitigation: Play-first architecture; wallet unlocks after engagement threshold (5 predictions, 7-day streak).

2. **TON-only mandate violation** - Telegram enforces TON-only for Mini Apps; violation = app suspension. Mitigation: Use TON Connect SDK exclusively, promote only Tonkeeper/Wallet/MyTonWallet, no multichain.

3. **Trading vs betting framing inconsistency** - Gambling terminology triggers regulatory risk. Mitigation: Vocabulary audit replacing "bet/odds/wager" with "position/probability/stake."

4. **Crypto concept overload** - 60%+ users lack crypto confidence; jargon causes abandonment. Mitigation: Progressive disclosure, abstract gas fees, human-readable transactions.

5. **initData validation bypass** - Developers disable validation during dev, ship to production. Mitigation: Server-side only validation, no dev bypasses in codebase, CI tests for auth.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Types
**Rationale:** Establishes data contracts and state management before any API integration; enables parallel development of UI components with mock data.
**Delivers:** TypeScript types for markets/positions/trades, Zustand store skeleton, MarketContext provider, TanStack Query setup.
**Addresses:** Architecture foundation, development velocity.
**Avoids:** Pitfall #5 (initData validation) - establish security patterns from start.

### Phase 2: Mock Trading UI
**Rationale:** Build and polish trading interface before external API dependency; faster iteration without API rate limits or availability concerns.
**Delivers:** Market listing page, single market trading interface, position display; all with mock data.
**Addresses:** Table stakes trading UI features from FEATURES.md.
**Implements:** Market Discovery UI, Trading Interface UI, Position Manager UI components.

### Phase 3: themoon.business API Integration
**Rationale:** Depends on API documentation from themoon.business; this phase may be blocked pending external input.
**Delivers:** Market client library, API routes, real market data flow.
**Uses:** @tanstack/react-query for data fetching, existing Supabase for user data.
**Research flag:** HIGH - requires API documentation from themoon.business before detailed planning.

### Phase 4: Trading Execution & TonConnect
**Rationale:** Transaction flow depends on API integration and understanding of themoon.business settlement mechanism.
**Delivers:** Trade preparation endpoint, TonConnect transaction signing, optimistic trade UI, transaction confirmation.
**Uses:** @ton/ton + @ton/core for transaction building.
**Avoids:** Pitfall #1 (premature wallet) - wallet used for trading, not onboarding gate.

### Phase 5: Tutorial & Onboarding
**Rationale:** Tutorial guides users through trading interface; requires trading UI to exist first.
**Delivers:** Interactive first-trade walkthrough, contextual tooltips, progress tracking, first-trade reward.
**Addresses:** Onboarding differentiators from FEATURES.md.
**Avoids:** Pitfall #4 (crypto overload), #7 (assumes knowledge), #10 (slow first-action).

### Phase 6: Position Management & Points
**Rationale:** Requires trading to exist; extends existing points engine.
**Delivers:** Position polling, P&L display, settlement handling, points for trading activity.
**Integrates:** Existing pointsEngine.ts with prediction_trade reason.

### Phase 7: Charts & Advanced Features
**Rationale:** Post-MVP enhancement; defer until core trading loop validated.
**Delivers:** Price history charts (lightweight-charts), enhanced analytics.
**Uses:** lightweight-charts, TanStack Query for historical data.

### Phase Ordering Rationale

- **Types before UI**: Data contracts enable parallel work and prevent integration churn.
- **Mock UI before API**: Faster iteration, no external dependency; UI can be refined while waiting for API access.
- **API before transactions**: Must understand market data before building trade execution.
- **Transactions before tutorial**: Tutorial teaches trading; trading must work first.
- **Tutorial before advanced features**: Ensure users can succeed before adding complexity.

This ordering respects the dependency chain from ARCHITECTURE.md and avoids the critical pitfalls around premature complexity.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 3 (API Integration):** BLOCKED until themoon.business provides API documentation. Integration approach depends on API availability. Fallback options: smart contract direct (needs contract ABIs) or iframe embed (limited customization).
- **Phase 4 (Trading Execution):** May need research-phase if themoon.business uses non-standard transaction flow (e.g., meta-transactions, relayers).

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** TanStack Query + Zustand setup is well-documented.
- **Phase 2 (Mock UI):** Standard React component development.
- **Phase 5 (Tutorial):** Framer Motion already in stack; custom tutorial with existing tools.
- **Phase 6 (Positions):** Extends existing polling patterns already in codebase.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified npm packages, official docs, React 19 compatibility confirmed |
| Features | HIGH | Multiple authoritative sources (Polymarket, industry guides, UX research) |
| Architecture | MEDIUM | Verified patterns, but themoon.business-specific flow unknown |
| Pitfalls | HIGH | Multiple sources, academic research, official Telegram docs |

**Overall confidence:** MEDIUM

Architecture and integration details depend on themoon.business API, which has no public documentation. Stack and pitfall research is solid.

### Gaps to Address

- **themoon.business API documentation:** Must be obtained before Phase 3. Schedule technical call with themoon.business team.
- **Authentication mechanism:** Does themoon.business use API keys, OAuth, or user-specific tokens? Affects API route design.
- **Trade submission flow:** Is trading API-mediated or direct on-chain? Affects Phase 4 implementation.
- **Settlement mechanism:** Automatic or user-initiated claim? Affects position management UX.
- **Token/currency:** What token for trades (TON, USDT, custom)? Affects balance display and transaction building.
- **WebSocket availability:** Real-time feeds offered? Affects polling vs streaming decision.

## Sources

### Primary (HIGH confidence)
- [Telegram Blockchain Guidelines](https://core.telegram.org/bots/blockchain-guidelines) - TON-only mandate, compliance requirements
- [TanStack Query v5 Docs](https://tanstack.com/query/v5/docs/react/installation) - React 19 compatibility, setup patterns
- [TON Connect SDK Docs](https://docs.ton.org/v3/guidelines/ton-connect/frameworks/react) - Wallet integration patterns
- [Lightweight Charts Docs](https://tradingview.github.io/lightweight-charts/docs) - Financial charting setup

### Secondary (MEDIUM confidence)
- [Trading Gamification Research (Management Science)](https://pubsonline.informs.org/doi/10.1287/mnsc.2022.02650) - Gamification pitfalls
- [Polymarket Documentation](https://docs.polymarket.com/) - Prediction market interface patterns
- [Sequence Web3 Onboarding Guide](https://sequence.xyz/blog/how-to-simplify-user-onboarding-for-a-web3-app) - Wallet connection timing
- [STON.fi SDK Documentation](https://docs.ston.fi/developer-section/dex/sdk) - DEX integration (if needed)

### Tertiary (LOW confidence)
- themoon.business architecture - No public documentation; inferred from domain knowledge
- TON prediction market smart contract patterns - Limited public examples; needs validation

---
*Research completed: 2026-01-27*
*Ready for roadmap: yes (with API access caveat)*
