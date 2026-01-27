# Feature Landscape: Prediction Market Integration & Crypto Onboarding Tutorial

**Domain:** Prediction Market Trading Interface + Crypto Onboarding for Telegram Mini App
**Researched:** 2026-01-27
**Target Users:** Telegram users new to crypto/prediction markets
**Confidence:** MEDIUM (research-based with multiple sources)

---

## Table Stakes

Features users expect from prediction market trading interfaces. Missing = product feels incomplete or untrustworthy.

### Trading Interface Features

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Market listing with clear outcomes** | Users need to know what they're trading on | Low | Binary Yes/No format is clearest. Show event name, resolution date, and resolution source |
| **Live price display as probability** | "Share price = probability" is core concept. Users expect to see 65% not $0.65 | Low | Display both formats initially, transition to probability-first |
| **Buy/Sell buttons** | Basic action users need to take | Med | Market orders only for MVP; limit orders are advanced |
| **Position display** | Users must see what they own | Low | "You hold X YES shares at avg price Y" |
| **Real-time price updates** | Polymarket users expect instant updates. Lag = distrust | Med | WebSocket or polling, must feel responsive |
| **Transaction confirmation** | Crypto users expect to see their transaction status | Low | Show pending/confirmed states with clear feedback |
| **Clear outcome display** | "What happens if I'm right vs wrong" | Low | Show potential payout before confirming trade |
| **Fee transparency** | Users distrust hidden costs | Low | Show all fees before trade execution |
| **Market resolution rules** | Users need to know how outcome is determined | Low | Link to resolution source (e.g., official results) |

### Wallet & Security Features

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Wallet connection flow** | Can't trade without connected wallet | Med | TON Connect already integrated in app |
| **Balance display** | Users need to see available funds | Low | Show TON and USDT balances prominently |
| **Transaction history** | Standard in any financial app | Med | List of trades with P&L per trade |
| **Secure transaction signing** | Users expect wallet confirmation popup | Low | Standard TON Connect behavior |

### Onboarding/Tutorial Features

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Progressive disclosure** | Don't overwhelm beginners | Med | Show features as users need them, not all at once |
| **Clear CTAs** | Users need to know what action to take next | Low | "Connect Wallet" -> "Fund Account" -> "Make First Trade" |
| **Visual feedback for actions** | Confirmation builds confidence | Low | Success/error animations, progress indicators |
| **Plain language, no jargon** | "Gas fee" and "smart contract" confuse newbies | Low | Use "transaction fee" and "automated contract" |
| **Practice/demo mode** | 44% cite lack of knowledge as barrier (Coinbase Institute) | High | Optional: testnet mode or paper trading simulation |

---

## Differentiators

Features that set the product apart from competitors. Not expected but valued highly.

### Trading Experience Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **One-tap trading** | Pariflow's key differentiator - removes friction | Med | Simplified interface for common actions |
| **Gamified first trade reward** | Convert gamification users to traders | Low | Award bonus points or badge for first real trade |
| **Market sentiment overlay** | Show community confidence beyond price | Med | "83% of users are bullish" type indicators |
| **Position P&L visualization** | Real-time profit/loss with breakeven price | Med | More visual than table-based P&L tracking |
| **Smart money indicators** | Show what "whales" or top traders are doing | High | Requires analytics infrastructure |
| **AI-powered market insights** | 35% forecast accuracy increase (Gartner 2026) | High | Summarize news affecting market |
| **Mobile-optimized charts** | 68% of prediction trades happen on mobile | Med | Touch-friendly, simplified chart view |

### Onboarding Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Interactive tutorial with real market** | Learn by doing beats reading docs | Med | Step-by-step overlay guiding first trade |
| **Gasless first trade** | Remove gas fee confusion for first action | Med | Sponsor user's first transaction fee |
| **Progress bar/checklist** | Zeigarnik effect - people complete unfinished tasks | Low | "3/5 steps complete to become a trader" |
| **Achievement badges for learning** | Leverage existing gamification in app | Low | "Market Student", "First Trader", "Prediction Pro" |
| **Embedded wallet creation** | No external app needed, 40%+ retention boost | High | Account abstraction with email/passkey login |
| **Contextual tooltips** | Education at moment of need | Low | "What's this?" triggers inline explanation |
| **Video micro-tutorials** | Different learning styles | Med | 15-30 second clips for key concepts |
| **"Trading not betting" framing** | Clear positioning, regulatory clarity | Low | Educational content emphasizing market mechanics |
| **Risk disclosure done right** | Build trust, not scare users away | Low | Clear but not alarming risk communication |

### Social Features

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Share trade to Telegram** | Viral loop, social proof | Low | "I just predicted X will win" share card |
| **Syndicate/referral trading leaderboard** | Existing feature extended | Med | Track referred users' trading performance |
| **Community market requests** | 10x engagement from user-generated markets | High | Defer - requires moderation infrastructure |

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Casino-style UI elements** | Triggers gambling association, regulatory risk, mental health concerns | Use trading/finance aesthetic - charts, data, clean lines |
| **Countdown timers for FOMO** | Predatory design, erodes trust | Show market close date calmly, no urgency manipulation |
| **Complex order types at launch** | Limit/stop orders confuse beginners | Start with market orders only, add limit orders later |
| **Full order book display** | Overwhelming for beginners, "crypto-first, human-second" | Hide by default, show on demand for advanced users |
| **Leverage/margin trading** | High risk, regulatory nightmare | Keep to simple 1:1 position sizing |
| **Auto-trading bots** | Complexity, manipulation risk, regulatory issues | Manual trading only |
| **Seed phrase wallet creation** | Account abstraction is the new standard | Use email/passkey login with embedded wallet |
| **Long text-heavy tutorials** | 38% abandon if onboarding too long | Interactive step-by-step, max 2 minutes total |
| **Mandatory KYC before exploring** | 68% abandon due to time-consuming onboarding | Allow browsing/learning before KYC wall |
| **Technical jargon everywhere** | "Gas", "smart contract", "liquidity" alienate beginners | Plain language, tooltips for technical terms |
| **Hidden fees or slippage** | Destroys trust instantly | Always show total cost before confirmation |
| **Multi-chain complexity** | TON only is the right constraint | Don't add Ethereum, Polygon etc. for v1 |
| **Price alerts/notifications spam** | Leads to addictive checking behavior | Thoughtful, opt-in notifications only |
| **"Odds" terminology** | Implies gambling | Use "probability" or "price" instead |

---

## Feature Dependencies

```
Wallet Connection (existing)
    |
    v
[Tutorial Phase 1: Wallet Education]
    |
    v
Market Data Integration (themoon.business API)
    |
    v
[Tutorial Phase 2: Understanding Markets]
    |
    v
Trading Interface (buy/sell)
    |
    v
[Tutorial Phase 3: First Trade Coaching]
    |
    v
Position Management
    |
    v
[Tutorial Phase 4: Portfolio Tracking]
    |
    v
Advanced Features (limit orders, charts, P&L)
```

**Critical Path:**
1. themoon.business API integration must come before trading interface
2. Trading interface must exist before tutorial can teach "first trade"
3. Wallet connection (already done) is prerequisite for everything

---

## MVP Recommendation

### Must Have for MVP

**Trading Interface:**
1. Market listing with probability display
2. One-click buy/sell (market orders only)
3. Position display with current value
4. Transaction confirmation flow
5. Basic fee transparency

**Tutorial:**
1. Wallet connection coaching (extend existing)
2. "What is a prediction market" intro screen
3. Interactive first trade walkthrough
4. Reward for completing first trade (points bonus)
5. Contextual tooltips on key interface elements

### Defer to Post-MVP

| Feature | Reason to Defer |
|---------|-----------------|
| Limit orders | Adds complexity, beginners don't need |
| Order book display | Overwhelming, not needed for basic trades |
| P&L charts/analytics | Nice-to-have, not critical path |
| Smart money indicators | Requires significant analytics backend |
| Video tutorials | Can do text/interactive first |
| Practice/testnet mode | Complexity, real trades teach better |
| AI insights | High complexity, defer to validate demand |
| Community market creation | Moderation overhead |

---

## Complexity Estimates

| Category | Feature Count | Low | Med | High |
|----------|---------------|-----|-----|------|
| Trading Table Stakes | 13 | 9 | 4 | 0 |
| Wallet Table Stakes | 4 | 2 | 2 | 0 |
| Onboarding Table Stakes | 5 | 3 | 1 | 1 |
| Trading Differentiators | 7 | 1 | 4 | 2 |
| Onboarding Differentiators | 9 | 5 | 3 | 1 |
| Social Differentiators | 3 | 1 | 1 | 1 |

**MVP Scope:** ~22 features (all table stakes + 2-3 differentiators)
**Full Scope:** ~41 features across all categories

---

## Sources

### Prediction Market Interfaces
- [TRUEiGTECH - Top Prediction Market Software Features 2026](https://www.trueigtech.com/top-prediction-market-software-features/)
- [Medium - Prediction Markets in 2026](https://medium.com/@neuroticker7/prediction-markets-in-2026-the-year-event-trading-goes-mainstream-3c43a739e4f0)
- [Polymarket Documentation](https://docs.polymarket.com/)
- [CoinGecko - What Is Polymarket](https://www.coingecko.com/learn/what-is-polymarket-decentralized-prediction-markets-guide)
- [PokerNews - Polymarket Review 2026](https://www.pokernews.com/prediction-markets/polymarket/)
- [Guru Polymarket - Order Book Tutorial](https://gurupolymarket.com/en/tutorials/how-the-order-book-works/)

### Portfolio & Analytics
- [PredictFolio - Polymarket Analytics](https://predictfolio.com/)
- [CoinCodeCap - Polymarket Portfolio Trackers](https://coincodecap.com/polymarket-portfolio-tracker)
- [Polymarket Analytics](https://polymarketanalytics.com/)

### Crypto Onboarding Best Practices
- [Hoptrail - Onboarding a Crypto Investor](https://www.hoptrail.io/post/onboarding-a-crypto-investor-a-complete-guide)
- [Krayon Digital - Simplify Crypto Onboarding](https://www.krayondigital.com/blog/simplify-crypto-user-onboarding-5-tips)
- [Transak - 5 Ways to Simplify Onboarding](https://transak.com/blog/5-ways-to-simplify-user-onboarding-to-crypto-apps)
- [CRADL - Onboarding to Cryptocurrency](https://www.cradl.org/onboarding-to-crypto)

### Web3 Wallet & UX
- [BricxLabs - Web3 UX Design Trends 2026](https://bricxlabs.com/blogs/web-3-ux-design-trends)
- [Helius - Frictionless Web3 UX](https://www.helius.dev/blog/web3-ux)
- [The Block - Smart Wallets and UX for Mainstream Adoption](https://www.theblock.co/post/375647/smart-wallets-ai-ux-mainstream-crypto-adoption)
- [Magic.link - User Onboarding in Web3](https://magic.link/posts/user-onboarding-web3-challenges-best-practices)

### Telegram Mini Apps
- [BingX - Top Telegram Mini Apps on TON 2026](https://bingx.com/en/learn/article/top-telegram-mini-apps-on-ton-network-ecosystem)
- [Merge - Building Crypto Telegram Mini App](https://merge.rocks/blog/guide-to-building-a-crypto-telegram-mini-app)
- [CNBC - Telegram Crypto Wallet US Launch](https://www.cnbc.com/2025/07/22/telegram-crypto-wallet-us.html)
- [Telegram Blockchain Guidelines](https://core.telegram.org/bots/blockchain-guidelines)

### UX Failures to Avoid
- [Artkai - UX Cryptocurrency Trading](https://artkai.io/blog/ux-cryptocurrency-simplifying-trading-for-everyone)
- [CoinCodex - Mistakes When Launching Exchanges](https://coincodex.com/article/78396/top-7-mistakes-crypto-businesses-make-when-launching-their-first-exchange/)
- [Coincub - Mistakes Causing Crypto Users to Leave](https://coincub.com/6-mistakes-causing-your-crypto-users-to-leave/)
- [MPost - Mistakes in Prediction Markets](https://mpost.io/7-mistakes-new-users-make-when-trading-in-prediction-markets/)

### Gamification & Tutorials
- [UserPilot - Onboarding Gamification Examples](https://userpilot.com/blog/onboarding-gamification/)
- [Appcues - Gamification Tips for SaaS Onboarding](https://www.appcues.com/blog/onboarding-gamification-strategies)
- [Yu-kai Chou - Onboarding Phase in Gamification](https://yukaichou.com/gamification-study/4-experience-phases-gamification-2-onboarding-phase/)

### Trading Education
- [BabyPips - Crypto Trading for Beginners](https://www.babypips.com/crypto/learn/crypto-trading-for-beginners)
- [Coursera - How to Trade Cryptocurrency](https://www.coursera.org/articles/how-to-trade-cryptocurrency)
- [MetaMask - Prediction Market Concepts](https://metamask.io/news/prediction-markets-concepts-terminology)

---

## Confidence Notes

| Category | Confidence | Rationale |
|----------|------------|-----------|
| Trading interface features | HIGH | Multiple authoritative sources (Polymarket docs, reviews) |
| Onboarding best practices | HIGH | Verified across crypto onboarding guides with statistics |
| Telegram Mini App integration | MEDIUM | Official docs available, TON ecosystem specifics verified |
| Anti-features | HIGH | Consistent across UX research and industry post-mortems |
| themoon.business specifics | LOW | Could not find specific documentation for this platform |

**Note:** themoon.business API documentation should be reviewed when available to validate trading interface requirements against actual API capabilities.
