# Technology Stack: Prediction Market Integration

**Project:** Moon Prediction Mini App - Prediction Market Milestone
**Researched:** 2026-01-27
**Research Focus:** Stack additions for integrating themoon.business prediction market

## Context

This research covers NEW libraries needed for the prediction market integration milestone. The existing stack (Next.js 16, React 19, Supabase, TonConnect 2.3.1, @twa-dev/sdk) is already in place and should NOT be replaced.

**Target integration:** themoon.business - a TON-native cricket prediction market platform
**User journey:** Gamification (existing) -> Wallet (existing) -> Education (new) -> Trading (new)

---

## Recommended Stack Additions

### Data Fetching & State Management

| Library | Version | Purpose | Why | Confidence |
|---------|---------|---------|-----|------------|
| @tanstack/react-query | ^5.90.x | Server state management | React 19 compatible, built-in polling for real-time market data, suspense support, excellent cache management. Already widely adopted (TanStack Query is recommended for "highly interactive SPAs, real-time apps"). Essential for polling market prices. | HIGH |
| zustand | ^5.0.x | Client state management | Lightweight (no boilerplate), handles React 19's useSyncExternalStore, 5K+ dependents. Better than Context for complex cross-component state like trade slip, user positions, tutorial progress. | HIGH |

**Rationale:** TanStack Query handles server state (market data, positions) with automatic refetching. Zustand handles UI state (trade slip, tutorial step, UI preferences). This separation is a recommended pattern for trading UIs.

### TON Blockchain Integration (Additions to Existing)

| Library | Version | Purpose | Why | Confidence |
|---------|---------|---------|-----|------------|
| @ton/ton | ^16.1.0 | Low-level TON blockchain client | Required for transaction building, wallet operations, contract interactions. 219+ npm dependents. Already standard for TON dApps. | HIGH |
| @ton/core | ^0.62.0 | TON primitives | Required peer dependency for @ton/ton. Provides Cell, Address, and other TON types. | HIGH |
| @ton-api/client | latest | TonAPI HTTP client | Provides indexed TON data access without running nodes. Type-safe, auto-generated from TonAPI spec. In "public alpha" but actively maintained by Tonkeeper. | MEDIUM |
| @ton-api/streaming | latest | Real-time TON events | WebSocket/SSE subscriptions for account transactions, traces. Essential for tracking trade confirmations and balance changes in real-time. | MEDIUM |

**Rationale:** The existing @tonconnect/ui-react handles wallet connection UI. These additions enable actual blockchain interaction - building transactions, monitoring confirmations, querying balances.

**Note on @ton-api packages:** The packages are in "public alpha" per npm. While actively maintained by the Tonkeeper team (official TON wallet), be prepared for potential breaking changes. For production stability, consider using TONAPI REST endpoints directly as fallback.

### DEX/Trading Infrastructure (If Direct Integration Needed)

| Library | Version | Purpose | Why | Confidence |
|---------|---------|---------|-----|------------|
| @ston-fi/sdk | ^2.4.0 | STON.fi DEX integration | If themoon.business uses STON.fi pools for liquidity. Provides swap building, pool queries. 4,500+ weekly downloads. | MEDIUM |
| @ston-fi/api | ^0.29.0 | STON.fi market data | REST API client for pools, markets, asset prices. No rate limits on DEX API. | MEDIUM |
| @ston-fi/omniston-sdk-react | ^0.4.2 | Cross-DEX aggregation | If routing across STON.fi + DeDust needed. React hooks powered by TanStack Query. Still v0.x (breaking changes possible). | LOW |

**IMPORTANT:** These are conditional recommendations. themoon.business appears to be a standalone prediction market platform. If it has its own smart contracts (likely), direct DEX SDKs may not be needed. Wait for themoon.business API documentation before adding these.

### Charting & Visualization

| Library | Version | Purpose | Why | Confidence |
|---------|---------|---------|-----|------------|
| lightweight-charts | ^5.1.0 | Financial charts | TradingView's open-source library. 45KB, performant, candlestick support. Perfect for prediction market price history. Apache-2.0 license (attribution required). | HIGH |

**Alternative considered:** Recharts (24K+ GitHub stars, good for general charts) - but lightweight-charts is specifically designed for financial/trading UIs and has better candlestick and time-series support.

**NOT recommended:**
- `react-stockcharts` - Deprecated, not maintained
- `@tradingview/advanced-chart-widget` - Commercial license, overkill for prediction markets
- ApexCharts - Larger bundle, not trading-focused

### Tutorial/Onboarding

| Library | Version | Purpose | Why | Confidence |
|---------|---------|---------|-----|------------|
| framer-motion | (existing 12.27.5) | Tutorial animations | Already in project. Use for step transitions, highlights. | HIGH |
| (custom) | - | Tutorial state | Use Zustand for tutorial progress tracking, persist to Supabase. No dedicated library needed. | HIGH |

**NOT recommended:**
- intro.js, shepherd.js, react-joyride - Heavy for mobile Telegram Mini App. Custom implementation with Framer Motion will be lighter and more integrated with existing UI patterns.

---

## Integration Strategy for themoon.business

Based on research, themoon.business is a **TON-native Telegram Mini App** prediction market for cricket. Integration options (in order of recommendation):

### Option 1: API Integration (RECOMMENDED if available)

**What:** Direct API calls to themoon.business backend
**Pros:** Full control over UI, deep integration, best UX
**Cons:** Requires API documentation from themoon.business
**Confidence:** MEDIUM (depends on API availability)

**Required stack:** TanStack Query + Zustand + lightweight-charts

### Option 2: Smart Contract Direct Integration

**What:** Interact with themoon.business smart contracts directly
**Pros:** Decentralized, no API dependency
**Cons:** Need contract addresses/ABIs, more complex implementation
**Confidence:** LOW (no public contract documentation found)

**Required stack:** @ton/ton + @ton/core + TanStack Query

### Option 3: Embed/Widget Integration

**What:** Embed themoon.business trading interface via iframe or WebView
**Pros:** Fastest implementation, no API needed
**Cons:** Limited customization, feels disconnected, harder tutorial integration
**Confidence:** MEDIUM (standard web pattern, but may have CORS/Telegram limitations)

**Required stack:** None additional (just iframe)

**RECOMMENDATION:** Pursue Option 1 first. Contact themoon.business for API documentation. If unavailable, fall back to Option 3 for MVP, then negotiate API access for v2.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Data fetching | TanStack Query | SWR | TanStack has better DevTools, more features for complex trading UIs |
| State management | Zustand | Redux Toolkit | Zustand is lighter, less boilerplate, better for Telegram Mini App size constraints |
| State management | Zustand | Jotai | Zustand better for global state (trade slip); Jotai atomic model less intuitive for trading UI |
| Charts | lightweight-charts | Recharts | lightweight-charts built for trading, smaller bundle, TradingView backing |
| Charts | lightweight-charts | Chart.js | Chart.js not designed for financial data, no candlestick support |
| TON client | @ton/ton | tonweb | @ton/ton is the modern replacement, TypeScript-first, actively maintained |
| TON API | @ton-api/client | toncenter API | @ton-api/client is type-safe SDK; toncenter requires manual REST calls |

---

## Installation

```bash
# Required additions
npm install @tanstack/react-query zustand @ton/ton @ton/core lightweight-charts

# Optional (for real-time TON monitoring)
npm install @ton-api/client @ton-api/streaming

# Optional (only if DEX integration needed)
npm install @ston-fi/sdk @ston-fi/api
```

### Dev Dependencies (already satisfied by existing stack)

No additional dev dependencies required. TypeScript types are bundled with all recommended packages.

---

## Configuration Requirements

### TanStack Query Setup

```typescript
// src/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000, // 5 seconds - appropriate for market data
      refetchInterval: 10000, // Poll every 10 seconds for prices
      refetchOnWindowFocus: true,
    },
  },
});
```

### Zustand Store Pattern

```typescript
// src/stores/tradeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TradeState {
  selectedMarket: string | null;
  position: 'yes' | 'no' | null;
  amount: number;
  // ... trade slip state
}

export const useTradeStore = create<TradeState>()(
  persist(
    (set) => ({
      selectedMarket: null,
      position: null,
      amount: 0,
    }),
    { name: 'trade-store' }
  )
);
```

### TonAPI Token

For production use of @ton-api/client and @ton-api/streaming:

1. Obtain API token from [TON Console](https://console.ton.org)
2. Add to environment: `TONAPI_TOKEN=your_token`
3. Free tier available, rate limits apply without token

---

## Version Pinning Strategy

| Package | Pin Strategy | Reason |
|---------|--------------|--------|
| @tanstack/react-query | ^5.90.x | Stable v5, minor updates safe |
| zustand | ^5.0.x | Stable v5, minor updates safe |
| @ton/ton | ^16.x | Active development, watch for breaking changes |
| @ton/core | ^0.62.x | Peer of @ton/ton, keep in sync |
| @ton-api/* | latest | Alpha packages, expect updates |
| lightweight-charts | ^5.1.x | Stable, minor updates safe |
| @ston-fi/* | latest | v0.x/v2.x, still evolving |

---

## Bundle Size Impact

| Package | Gzipped Size | Impact |
|---------|-------------|--------|
| @tanstack/react-query | ~12KB | Moderate - justified by features |
| zustand | ~1KB | Minimal |
| @ton/ton + @ton/core | ~50KB | Significant - but required for TON |
| lightweight-charts | ~45KB | Moderate - only load on market pages |
| @ston-fi/sdk | ~15KB | Moderate - conditionally import |

**Total additional bundle:** ~125KB gzipped (worst case with all packages)

**Mitigation:**
- Use Next.js dynamic imports for chart and trading components
- @ston-fi packages only if needed
- @ton-api packages are lightweight wrappers

---

## Sources

### HIGH Confidence (Official Documentation)
- [TanStack Query Installation](https://tanstack.com/query/v5/docs/react/installation) - v5 docs confirm React 18+ (includes 19) compatibility
- [STON.fi SDK Documentation](https://docs.ston.fi/developer-section/dex/sdk) - Official SDK docs
- [TON Connect SDK Docs](https://docs.ton.org/v3/guidelines/ton-connect/frameworks/react) - Official TON Connect React guide
- [TonAPI Streaming Docs](https://docs.tonconsole.com/tonapi/streaming-api) - Official WebSocket/SSE documentation
- [Lightweight Charts Docs](https://tradingview.github.io/lightweight-charts/docs) - TradingView official docs

### MEDIUM Confidence (npm + Multiple Sources)
- [@tanstack/react-query npm](https://www.npmjs.com/package/@tanstack/react-query) - v5.90.19 verified
- [@ton/ton npm](https://www.npmjs.com/package/@ton/ton) - v16.1.0 verified
- [@ston-fi/sdk npm](https://www.npmjs.com/package/@ston-fi/sdk) - v2.4.0 verified
- [Zustand npm](https://www.npmjs.com/package/zustand) - v5.0.10 verified
- [MyTonSwap SDK GitHub](https://github.com/MyTonSwap/sdk) - Alternative DEX SDK option

### LOW Confidence (Web Search Only)
- themoon.business technical architecture - No public API documentation found
- TON prediction market smart contract patterns - No established patterns found specific to TON

---

## Open Questions (Require External Input)

1. **themoon.business API:** Does themoon.business provide a public API or SDK? Contact team directly.
2. **Smart contract addresses:** Are themoon.business contracts published? Need ABIs for direct integration.
3. **Embed support:** Does themoon.business support iframe embedding for Telegram Mini Apps?
4. **Token/currency:** What token does themoon.business use for trades (native TON, USDT, custom token)?
5. **WebSocket/real-time:** Does themoon.business provide real-time price feeds?

**RECOMMENDATION:** Schedule technical call with themoon.business team before finalizing implementation approach.

---

*Research completed: 2026-01-27*
*Confidence: MEDIUM overall (HIGH for library recommendations, LOW for themoon.business-specific integration due to lack of public documentation)*
