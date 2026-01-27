# Architecture Patterns: Prediction Market Integration

**Domain:** Prediction market trading interface for Telegram Mini App
**Researched:** 2026-01-27
**Confidence:** MEDIUM (verified patterns from Polymarket/TON docs, themoon.business API specifics unknown)

## Recommended Architecture

### High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TELEGRAM MINI APP                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Market    │  │  Trading    │  │  Position   │  │   Wallet    │         │
│  │  Discovery  │  │  Interface  │  │  Manager    │  │  Connector  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                   │                                          │
│                          ┌────────┴────────┐                                │
│                          │  State Manager  │                                │
│                          │  (React Context)│                                │
│                          └────────┬────────┘                                │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                              │
           ┌────────┴────────┐          ┌─────────┴─────────┐
           │   Next.js API   │          │    TonConnect     │
           │   Routes        │          │    (Direct)       │
           └────────┬────────┘          └─────────┬─────────┘
                    │                              │
        ┌───────────┴───────────┐                  │
        │                       │                  │
┌───────┴───────┐     ┌─────────┴─────────┐       │
│   Supabase    │     │ themoon.business  │       │
│   (User Data) │     │  (Market API)     │       │
└───────────────┘     └───────────────────┘       │
                                                   │
                                          ┌────────┴────────┐
                                          │  TON Blockchain │
                                          │  (Transactions) │
                                          └─────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With | Data Owned |
|-----------|---------------|-------------------|------------|
| **Market Discovery UI** | Browse/search markets, display odds | State Manager, Trading Interface | None (read-only) |
| **Trading Interface UI** | Order entry, buy/sell flow, confirmations | State Manager, Wallet Connector | Order draft state |
| **Position Manager UI** | Display open positions, P/L, settlement | State Manager | None (read-only) |
| **Wallet Connector** | TonConnect integration, transaction signing | TonConnect SDK, TON Blockchain | Connection state |
| **State Manager** | Centralize market/position state, cache | All UI components, API routes | Cached market data |
| **Next.js API Routes** | Backend logic, API proxying, auth verification | Supabase, themoon.business API | None (proxy) |
| **Supabase** | User profiles, points, trade history | API Routes only | User data, history |
| **themoon.business API** | Market data, order placement, positions | API Routes | Market state |

### Data Flow

**Market Data Flow (Read Path):**
```
1. User opens app / navigates to market
2. State Manager checks cache freshness
3. If stale: API Route fetches from themoon.business
4. API Route returns market data (odds, volume, outcomes)
5. State Manager updates cache, notifies UI
6. UI renders market cards/trading interface
```

**Trading Flow (Write Path):**
```
1. User enters trade parameters (outcome, amount)
2. Trading Interface validates input client-side
3. Trading Interface requests price quote from API Route
4. API Route fetches current price from themoon.business
5. User confirms trade, triggers wallet signing
6. TonConnect prompts user in Telegram wallet
7. User approves transaction in wallet app
8. Transaction submitted to TON blockchain
9. themoon.business detects on-chain transaction OR
   API Route notifies themoon.business of trade intent
10. Position updated, UI reflects new state
```

**Position/Settlement Flow:**
```
1. Polling mechanism checks position state every 10-30s
2. On market resolution: themoon.business settles outcomes
3. User's collateral unlocked based on outcome
4. Position Manager UI shows settled status
5. Points Engine (existing) awards points for participation
```

## Existing Architecture Integration

### Current Stack Alignment

The existing app provides strong foundations that the prediction market integration extends:

| Existing Pattern | How It Extends | Notes |
|------------------|----------------|-------|
| `TonProvider` wrapper | Add transaction sending capability | Currently only wallet connection |
| `TelegramContext` | Pass user identity to market API | Already handles auth |
| `AuthWrapper` | Add market-specific onboarding checks | Extend with wallet balance check |
| `/api/*` routes pattern | Add `/api/market/*` routes | Same Next.js API pattern |
| `supabaseAdmin` RPC calls | Add trade history logging | Same Supabase integration |
| `pointsEngine.ts` | Award points for trading activity | Add `prediction_trade` reason |
| Polling on visibility change | Apply to position updates | Same pattern as stats refresh |

### New Components Required

```
src/
  app/
    market/
      page.tsx              # Market list/discovery
      [marketId]/
        page.tsx            # Single market trading interface
    positions/
      page.tsx              # User's open positions
    api/
      market/
        route.ts            # List markets, search
        [marketId]/
          route.ts          # Get market details
          quote/
            route.ts        # Get price quote for trade
          trade/
            route.ts        # Submit trade intent
        positions/
          route.ts          # Get user positions
  lib/
    marketClient.ts         # themoon.business API client
    marketTypes.ts          # TypeScript types for market data
  hooks/
    useMarket.ts            # Market data fetching hook
    usePositions.ts         # Position tracking hook
    useTrade.ts             # Trade execution hook
  context/
    MarketContext.tsx       # Market state management
```

## Patterns to Follow

### Pattern 1: Optimistic UI with Defensive State

**What:** Show success immediately, persist asynchronously, recover gracefully on failure.

**When:** All trading actions, position updates.

**Why:** Telegram Mini Apps have volatile sessions; app can be backgrounded/killed without warning.

**Example:**
```typescript
// hooks/useTrade.ts
export function useTrade() {
  const [pendingTrades, setPendingTrades] = useState<Trade[]>(() => {
    // Recover from localStorage on mount
    const saved = localStorage.getItem('pending_trades');
    return saved ? JSON.parse(saved) : [];
  });

  const submitTrade = async (trade: TradeParams) => {
    // 1. Optimistic update
    const optimisticTrade = { ...trade, status: 'pending', id: crypto.randomUUID() };
    setPendingTrades(prev => {
      const next = [...prev, optimisticTrade];
      localStorage.setItem('pending_trades', JSON.stringify(next));
      return next;
    });

    try {
      // 2. Get wallet signature
      const txResult = await tonConnect.sendTransaction(/* ... */);

      // 3. Confirm with backend
      await fetch('/api/market/trade', {
        method: 'POST',
        body: JSON.stringify({ tradeId: optimisticTrade.id, txHash: txResult.hash })
      });

      // 4. Mark as confirmed
      setPendingTrades(prev =>
        prev.map(t => t.id === optimisticTrade.id ? { ...t, status: 'confirmed' } : t)
      );
    } catch (error) {
      // 5. Mark as failed, allow retry
      setPendingTrades(prev =>
        prev.map(t => t.id === optimisticTrade.id ? { ...t, status: 'failed', error } : t)
      );
    }
  };

  return { pendingTrades, submitTrade };
}
```

### Pattern 2: Backend-Verified User Identity

**What:** Never trust frontend-supplied user IDs; always verify Telegram initData on backend.

**When:** Every API route that accesses user data or submits trades.

**Why:** Security requirement for Telegram Mini Apps; prevents identity spoofing.

**Example:**
```typescript
// lib/verifyTelegramAuth.ts
import crypto from 'crypto';

export function verifyInitData(initData: string): TelegramUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.TELEGRAM_BOT_TOKEN!)
    .digest();

  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (hash !== expectedHash) return null;

  const authDate = parseInt(params.get('auth_date') || '0');
  if (Date.now() / 1000 - authDate > 3600) return null; // Expired

  return JSON.parse(params.get('user') || '{}');
}

// app/api/market/trade/route.ts
export async function POST(request: Request) {
  const { initData, ...tradeParams } = await request.json();

  const user = verifyInitData(initData);
  if (!user) {
    return NextResponse.json({ error: 'Invalid auth' }, { status: 401 });
  }

  // Use verified user.id, NOT any user ID from request body
  const result = await submitTrade(user.id, tradeParams);
  return NextResponse.json(result);
}
```

### Pattern 3: Short Polling for Position Updates

**What:** Poll positions every 10-30 seconds while app is visible; stop when backgrounded.

**When:** Position Manager, any view showing live market data.

**Why:** WebSockets drop when Mini App is backgrounded; polling is more reliable.

**Example:**
```typescript
// hooks/usePositions.ts
export function usePositions(userId: number) {
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    let active = true;

    const fetchPositions = async () => {
      if (!active) return;
      const res = await fetch(`/api/market/positions?userId=${userId}`);
      const data = await res.json();
      setPositions(data.positions);
    };

    // Initial fetch
    fetchPositions();

    // Poll every 15 seconds
    const interval = setInterval(fetchPositions, 15000);

    // Handle visibility changes (same pattern as existing page.tsx)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchPositions();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', fetchPositions);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchPositions);
    };
  }, [userId]);

  return positions;
}
```

### Pattern 4: API Route as Proxy

**What:** All external API calls go through Next.js API routes, never directly from frontend.

**When:** Any interaction with themoon.business API.

**Why:** Hide API keys, enforce rate limits, transform data, log activity, handle errors consistently.

**Example:**
```typescript
// lib/marketClient.ts (server-side only)
const THEMOON_API_BASE = process.env.THEMOON_API_URL;
const THEMOON_API_KEY = process.env.THEMOON_API_KEY;

export async function fetchMarkets(): Promise<Market[]> {
  const res = await fetch(`${THEMOON_API_BASE}/markets`, {
    headers: {
      'Authorization': `Bearer ${THEMOON_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Market API error: ${res.status}`);
  }

  return res.json();
}

// app/api/market/route.ts
export async function GET(request: Request) {
  try {
    const markets = await fetchMarkets();

    // Transform to frontend-friendly format
    const transformed = markets.map(m => ({
      id: m.id,
      question: m.title,
      outcomes: m.outcomes.map(o => ({
        name: o.label,
        probability: o.price,
        volume: o.volume24h
      })),
      endDate: m.resolutionDate,
      category: m.category
    }));

    return NextResponse.json({ markets: transformed });
  } catch (error) {
    console.error('Market fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 });
  }
}
```

### Pattern 5: TonConnect Transaction Handling

**What:** Use TonConnect for all blockchain transactions; handle the async signing flow.

**When:** Buying/selling positions, claiming settlements.

**Why:** TonConnect is mandatory for Telegram Mini Apps on TON; provides consistent UX.

**Example:**
```typescript
// hooks/useTrade.ts (extended)
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

export function useTrade() {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();

  const executeTrade = async (trade: TradeParams) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    // 1. Build transaction from backend
    const { transaction, estimatedGas } = await fetch('/api/market/trade/prepare', {
      method: 'POST',
      body: JSON.stringify({
        marketId: trade.marketId,
        outcome: trade.outcome,
        amount: trade.amount,
        walletAddress
      })
    }).then(r => r.json());

    // 2. Send via TonConnect (prompts user in wallet)
    const result = await tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 300, // 5 min
      messages: [
        {
          address: transaction.to,
          amount: transaction.value,
          payload: transaction.payload // BOC-encoded
        }
      ]
    });

    // 3. Confirm with backend
    await fetch('/api/market/trade/confirm', {
      method: 'POST',
      body: JSON.stringify({
        tradeId: trade.id,
        boc: result.boc
      })
    });

    return result;
  };

  return { executeTrade, isWalletConnected: !!walletAddress };
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Direct Frontend API Calls

**What:** Calling themoon.business API directly from React components.

**Why bad:** Exposes API keys, no rate limiting, no auth verification, CORS issues.

**Instead:** Route all external API calls through `/api/*` routes.

### Anti-Pattern 2: Trust Frontend User Identity

**What:** Using `userId` from request body instead of verified initData.

**Why bad:** Any user can spoof another user's ID; enables account hijacking.

**Instead:** Always verify Telegram initData signature server-side.

### Anti-Pattern 3: WebSocket-Only Real-Time

**What:** Relying exclusively on WebSocket connections for position updates.

**Why bad:** Connections drop when app is backgrounded; reconnection logic is complex.

**Instead:** Use short polling as primary; WebSocket as enhancement when active.

### Anti-Pattern 4: Storing Critical State in Memory Only

**What:** Keeping pending trades, user selections only in React state.

**Why bad:** Lost when app is suspended/reloaded by Telegram.

**Instead:** Persist critical state to localStorage progressively.

### Anti-Pattern 5: Blocking Synchronous Transactions

**What:** Freezing UI while waiting for blockchain confirmation.

**Why bad:** TON transactions can take 10-30 seconds; user thinks app is broken.

**Instead:** Show pending state, allow navigation, update asynchronously.

### Anti-Pattern 6: Unbounded Market Data Fetching

**What:** Fetching all markets on every render without pagination or caching.

**Why bad:** Slow load times, wasted bandwidth, poor UX.

**Instead:** Paginate market lists, cache with SWR or React Query, stale-while-revalidate.

## Build Order Implications

Based on component dependencies, recommended build sequence:

### Phase 1: Foundation (No External API Required)

1. **Market Types & Interfaces** (`lib/marketTypes.ts`)
   - Define TypeScript types for markets, positions, trades
   - Can be built with mock data

2. **Market Context Provider** (`context/MarketContext.tsx`)
   - State management shell
   - Mock data for development

3. **Market Discovery UI** (`app/market/page.tsx`)
   - Static layout, mock market cards
   - Build against mock data

### Phase 2: API Integration

4. **themoon.business API Client** (`lib/marketClient.ts`)
   - Requires API access/documentation
   - Start with market listing endpoint

5. **Market API Routes** (`app/api/market/`)
   - Proxy layer for frontend
   - Add initData verification

6. **Connect UI to Real Data**
   - Wire Market Discovery to API
   - Add loading/error states

### Phase 3: Trading Core

7. **Trading Interface UI** (`app/market/[marketId]/page.tsx`)
   - Order entry form
   - Price quote display

8. **TonConnect Transaction Flow** (`hooks/useTrade.ts`)
   - Build transaction preparation
   - Handle signing flow
   - Optimistic updates

9. **Trade API Routes** (`app/api/market/trade/`)
   - Quote endpoint
   - Prepare endpoint (builds TON transaction)
   - Confirm endpoint

### Phase 4: Position Management

10. **Positions API & Hook**
    - Fetch user positions from themoon.business
    - Short polling implementation

11. **Position Manager UI** (`app/positions/page.tsx`)
    - Display open positions
    - P/L calculations
    - Settlement status

### Phase 5: Integration & Polish

12. **Points Engine Integration**
    - Add `prediction_trade` point reason
    - Award points for trading activity

13. **Trade History Logging**
    - Store trade records in Supabase
    - Display in user profile

14. **Error Handling & Edge Cases**
    - Wallet disconnection mid-trade
    - Network failures
    - Session expiration

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 100K users |
|---------|--------------|--------------|---------------|
| **Market Data** | Direct API calls | Add Redis cache layer | CDN-cached market snapshots |
| **Position Polling** | 15s intervals | 30s intervals, batch queries | WebSocket when active, push notifications |
| **Trade Submission** | Synchronous | Queue with job ID | Distributed queue, async confirmation |
| **User State** | Supabase direct | Connection pooling | Read replicas, sharded by user region |
| **Rate Limiting** | Per-user simple counter | Redis-backed sliding window | Distributed rate limiting |

## Security Boundaries

| Boundary | Validation Method | Component Responsible |
|----------|-------------------|----------------------|
| User identity | Telegram initData HMAC-SHA256 | API Routes |
| Wallet ownership | TonConnect cryptographic proof | TonConnect SDK |
| Trade authorization | User must sign transaction | Wallet app |
| API access | Server-side keys only | API Routes |
| Position ownership | Backend verifies user owns position | themoon.business |

## Open Questions (Require themoon.business API Docs)

1. **Authentication mechanism** - API key? OAuth? User-specific tokens?
2. **Trade submission flow** - Direct on-chain or API-mediated?
3. **Position data structure** - How are open positions queried?
4. **Settlement trigger** - Automatic or user-initiated claim?
5. **WebSocket availability** - Real-time updates offered?
6. **Rate limits** - Requests per minute/hour?

## Sources

### HIGH Confidence (Official Documentation)
- [TON Connect Overview](https://docs.ton.org/develop/dapps/ton-connect/overview) - Protocol architecture
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps) - Platform constraints

### MEDIUM Confidence (Verified Patterns)
- [Polymarket Architecture](https://github.com/ahollic/polymarket-architecture) - CLOB/CTF patterns
- [Telegram Mini Apps Frontend-Backend Flow](https://www.nadcab.com/blog/frontend-backend-flow-in-telegram-mini-apps-complete-guide) - State management patterns
- [Conditional Token Framework](https://conditional-tokens.readthedocs.io/en/latest/developer-guide.html) - ERC-1155 prediction market standard

### LOW Confidence (Needs Validation)
- themoon.business API specifics - Not publicly documented; requires direct access
- TON-specific smart contract patterns for prediction markets - Limited public examples
