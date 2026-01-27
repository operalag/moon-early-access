# Domain Pitfalls: Prediction Market Integration & Crypto Onboarding

**Domain:** Prediction market trading in Telegram Mini App with crypto onboarding for new users
**Target Context:** MOON - Cricket prediction market for Telegram users in India, new to crypto
**Researched:** 2026-01-27
**Overall Confidence:** MEDIUM-HIGH (verified through multiple sources, Telegram official docs, and industry research)

---

## Critical Pitfalls

Mistakes that cause rewrites, user abandonment, or regulatory issues.

---

### Pitfall 1: Premature Wallet Connection

**What goes wrong:** Asking users to connect a TON wallet before they understand the value proposition or have invested time in the app. Data shows 70%+ of new Web3 users abandon during initial wallet setup.

**Why it happens:** Developers think "we need blockchain" and front-load wallet connection. They treat crypto as prerequisite rather than reward.

**Consequences:**
- Up to 90% activation failure rate (worst across all financial services)
- Only 13% Week-1 retention for crypto wallets vs 60%+ for traditional fintech
- Users who haven't experienced value have no motivation to complete friction

**Warning signs:**
- Wallet connection appears before any gameplay/engagement
- Users see "Connect Wallet" before understanding what Strategy Points are for
- Drop-off analytics show cliff at wallet connection step

**Prevention:**
- **Play-first, wallet-later** architecture (already in STRATEGY.md Phase 4 placement - good!)
- Users accumulate points, build referral network, experience value BEFORE wallet prompt
- Wallet connection framed as "unlock your earned rewards" not "sign up"
- Minimum engagement threshold (e.g., 5 predictions made, 7-day streak) before wallet prompt appears

**Phase relevance:** Wallet Integration Phase - ensure this is late in user journey

**Source:** [Sequence Web3 Onboarding Guide](https://sequence.xyz/blog/how-to-simplify-user-onboarding-for-a-web3-app) [MEDIUM confidence - verified with multiple sources]

---

### Pitfall 2: TON-Only Mandate Compliance Failure

**What goes wrong:** Building wallet features using non-TON protocols, then facing Telegram enforcement (suspension/removal from Mini App directory).

**Why it happens:** Developers familiar with Ethereum/EVM chains attempt to reuse existing knowledge. Or they don't read Telegram's blockchain guidelines carefully.

**Consequences:**
- App suspension from Telegram Mini Apps
- Forced migration under deadline pressure
- Lost users during transition

**Warning signs:**
- Code imports for MetaMask, WalletConnect (non-bridging scenarios)
- References to Ethereum, BNB, Polygon wallets
- Multichain wallet promotion

**Prevention:**
- **Use TON Connect SDK exclusively** - no forks, no modifications
- Only promote TON-native wallets: Wallet, Tonkeeper, MyTonWallet
- No promotion of multichain wallets even if they support TON
- Review [Telegram Blockchain Guidelines](https://core.telegram.org/bots/blockchain-guidelines) before any wallet work

**What's explicitly forbidden (per official Telegram docs):**
- Issuing tokens/NFTs on non-TON chains
- Signing transactions on other blockchains
- Connecting Ethereum wallets (except bridging)
- Modifying/forking TON Connect SDK
- Promoting non-TON wallets or tokens

**Phase relevance:** Wallet Integration Phase - critical prerequisite research

**Source:** [Telegram Blockchain Guidelines](https://core.telegram.org/bots/blockchain-guidelines) [HIGH confidence - official documentation]

---

### Pitfall 3: "Trading" vs "Betting" Framing Inconsistency

**What goes wrong:** Marketing says "trading" but UX says "betting." Inconsistent language creates regulatory risk and user confusion about product identity.

**Why it happens:** Teams understand the regulatory positioning but don't systematically apply it to all user-facing content. Some copy-paste from betting platforms.

**Consequences:**
- Regulatory scrutiny (states actively challenging prediction markets)
- User perception as gambling rather than skill-based analysis
- Potential loss of access in jurisdictions cracking down on prediction markets
- Undermines "analyst" identity framing

**Warning signs:**
- UI copy uses "bet," "wager," "odds" instead of "trade," "position," "market price"
- Missing educational framing about market mechanics
- No distinction between prediction markets and sports betting in user communication
- Users describe the app as "betting" in reviews/social

**Prevention:**
- **Vocabulary audit:** Replace all gambling terminology
  - "Bet" -> "Position" or "Trade"
  - "Odds" -> "Market Price" or "Probability"
  - "Wager" -> "Stake" or "Investment"
  - "Win/Lose" -> "Profit/Loss" or "Market resolution"
- Educational onboarding explaining how prediction markets differ from betting
- Frame predictions as "market analysis" and "informed positions"
- "Strategy Points" and "Analyst Path" framing (already in STRATEGY.md - maintain consistency)

**Phase relevance:** ALL phases - vocabulary must be consistent from Day 1

**Source:** [Legal Sports Report - Prediction Markets Legal Landscape 2026](https://www.legalsportsreport.com/250145/foreshadowing-the-legal-landscape-of-prediction-markets-in-2026/) [MEDIUM confidence - industry analysis]

---

### Pitfall 4: Overwhelming Crypto Concepts During Onboarding

**What goes wrong:** Exposing new-to-crypto users to wallets, gas fees, seed phrases, network selection, and transaction signing before they understand the core product.

**Why it happens:** Crypto-native developers forget what it's like to be a beginner. They build for themselves instead of for users who have never held crypto.

**Consequences:**
- 60%+ of users lack confidence in crypto concepts
- Information overload causes immediate friction and abandonment
- Users who push through develop anxiety about "permanent mistakes"
- Technical errors (wrong network, failed transactions) create distrust

**Warning signs:**
- Users see terms like "gas," "seed phrase," "network," "smart contract" in first session
- Error messages contain blockchain jargon
- Transaction confirmations show hex addresses and technical details
- Support tickets about "what is gas" or "I lost my seed phrase"

**Prevention:**
- **Progressive disclosure:** Introduce concepts only when relevant
- **Abstract complexity:** Never show gas fees (sponsor them or bundle into app economics)
- **Familiar patterns:** Use Telegram login, not wallet-first auth
- **Human-readable transactions:** "Confirm trade: 50 points on India vs Australia" not "Sign transaction 0x..."
- **No seed phrases for beginners:** Use TON's embedded wallet features or custodial approach initially
- Educational content presented as "Analyst Training" not "Crypto 101"

**Phase relevance:** Onboarding Phase and Wallet Integration Phase

**Source:** [Crypto UX Crisis - Crypto.news](https://crypto.news/cryptos-ux-crisis-billions-people-still-arent-onboard/) [MEDIUM confidence - multiple sources agree]

---

### Pitfall 5: initData Validation Bypass in Production

**What goes wrong:** Developers disable Telegram initData validation during development, then deploy with validation disabled or improperly implemented.

**Why it happens:** Validation is complex and annoying during local development. Developers use shortcuts that accidentally reach production.

**Consequences:**
- Attackers can forge authentication credentials
- Impersonation of legitimate users
- Theft of points, positions, or wallet-linked assets
- Complete compromise of user trust

**Warning signs:**
- Validation code has `if (process.env.NODE_ENV === 'development')` bypasses
- initData validation happens client-side instead of server-side
- No validation tests in CI/CD pipeline
- Security audit finds authentication gaps

**Prevention:**
- **Server-side validation only:** Never validate initData on client
- **No development bypasses in codebase:** Use proper mocking for local dev
- **Automated security tests:** CI must verify initData validation works
- **Follow official Telegram documentation** for HMAC-SHA256 signature verification
- Code review checklist includes "initData validation present and correct"

**Phase relevance:** Foundation Phase - must be correct from start

**Source:** [Telegram Mini Apps Security Risks](https://www.nadcab.com/blog/security-risks-in-telegram-mini-apps) [MEDIUM confidence - security research]

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded user experience.

---

### Pitfall 6: Gamification That Undermines Trading Discipline

**What goes wrong:** Hedonic gamification elements (confetti, badges, achievement popups) encourage addictive behavior and reckless trading rather than informed decision-making.

**Why it happens:** Gamification increases engagement metrics short-term. Teams optimize for volume without considering trading quality.

**Consequences:**
- Users develop gambling-like behavior (dopamine-chasing, not analysis)
- Overconfidence bias: users believe achievements = skill
- Regulatory risk: app appears more like gambling than trading
- Users lose money due to reckless trading, then churn and leave negative reviews
- Undermines "Analyst" identity and educational goals

**Warning signs:**
- Celebrating every trade with animations regardless of quality
- Leaderboards ranked purely by volume, not profitability
- Users report "addiction" concerns
- Most active users have worst returns

**Prevention:**
- Gamify **learning and analysis quality**, not trading volume
- "Analyst badges" for correct predictions, not frequency
- Daily research tasks that inform better trades
- Show profit/loss prominently, not just activity
- Cooling-off features: "You've made 5 trades today. Review your positions?"
- Research shows gamification works best when it supports real goals (skill, discipline), not overshadows them

**Phase relevance:** Gamification Phase, Retention Mechanics Phase

**Source:** [Trading Gamification and Investor Behavior](https://pubsonline.informs.org/doi/10.1287/mnsc.2022.02650) [HIGH confidence - academic research]

---

### Pitfall 7: Education That Assumes Rather Than Teaches

**What goes wrong:** Educational content assumes baseline crypto knowledge, or uses technical jargon that alienates new users. Platform providers often "lack educational expertise."

**Why it happens:** Content is written by crypto-natives who forget what's obvious to them isn't obvious to everyone.

**Consequences:**
- Users feel stupid and disengage
- Knowledge gaps lead to costly mistakes
- Young users (high interest, low literacy) are particularly vulnerable
- Users skip education because it's intimidating, then make errors

**Warning signs:**
- Education modules have low completion rates
- Users complete education but still make basic errors
- Support tickets reveal fundamental misunderstandings
- "Glossary" approach without contextual learning

**Prevention:**
- **Learn-by-doing:** Education embedded in first trades, not separate modules
- **Contextual explanations:** Explain concepts when users encounter them
- **Plain language:** "Market price" not "implied probability derived from bid-ask spread"
- **Progressive complexity:** Start with "What is a prediction market?" not "How smart contracts execute"
- Test comprehension with low-stakes practice trades
- Indian audience consideration: Cricket analogies ("It's like the market odds shifting during an IPL auction")

**Phase relevance:** Education Phase - must be carefully designed

**Source:** [Springer Research on Crypto Education](https://link.springer.com/article/10.1007/s12525-025-00863-y) [MEDIUM confidence - academic research]

---

### Pitfall 8: Real Money Before Mastery

**What goes wrong:** Users transition from virtual points to real money trading before demonstrating competence, leading to losses and churn.

**Why it happens:** Business pressure to monetize quickly. No clear competency gates.

**Consequences:**
- Users lose money on first real trades, associate app with loss
- Negative reviews: "I lost money immediately"
- Regulatory scrutiny if users claim they weren't prepared
- Churn of users who would have been successful with more preparation

**Warning signs:**
- Users can deposit money on Day 1
- No minimum practice trade requirement
- No competency assessment before real-money trading
- High loss rates among new real-money traders

**Prevention:**
- **Competency gates:** Minimum number of successful practice predictions before real money unlocks
- **Graduated stakes:** First real trades capped at small amounts
- **Clear transition moment:** "You've proven your analysis skills. Ready for real markets?"
- **Cooling-off period:** Time delay between earning real-money access and first deposit
- Frame Strategy Points phase as "training camp" with real value (leaderboard status, community recognition)

**Phase relevance:** Trading Integration Phase, Post-MVP Phase

**Source:** [Gamification in Prop Trading](https://axcera.io/gamification-in-prop-trading-platforms-what-works-and-what-does-not/) [LOW-MEDIUM confidence - industry analysis]

---

### Pitfall 9: Backend Security Treating Mini App as Trusted

**What goes wrong:** Backend assumes requests from Mini App are legitimate because "it's running inside Telegram."

**Why it happens:** Developers don't realize Mini Apps are just web apps with Telegram APIs - they run untrusted client code like any web app.

**Consequences:**
- All standard web vulnerabilities apply (XSS, CSRF, injection)
- Session hijacking (documented in Hamster Kombat attacks)
- Unauthorized point transfers or trades
- User funds at risk

**Warning signs:**
- Backend accepts requests without verifying Telegram auth
- Client-side authorization decisions
- No rate limiting on sensitive endpoints
- Missing input validation

**Prevention:**
- **Treat Mini App like any untrusted web client**
- Server-side validation of ALL user inputs
- Rate limiting on all endpoints, especially financial operations
- Comprehensive input sanitization
- Session management follows OWASP guidelines
- Regular security audits before and after launch

**Phase relevance:** Foundation Phase, ongoing

**Source:** [Telegram Mini Apps Security Risks](https://www.nadcab.com/blog/security-risks-in-telegram-mini-apps) [MEDIUM confidence]

---

### Pitfall 10: Slow Time-to-First-Action

**What goes wrong:** Users download/open the app but take too long to complete their first meaningful action (making a prediction). The longer the delay, the higher the abandonment.

**Why it happens:** Onboarding has too many steps. Authentication, profile setup, tutorials all stand between user and value.

**Consequences:**
- 21-72% of users abandon during friction-heavy onboarding
- Day-1 retention crashes to ~26% baseline
- Users never experience the "aha moment"

**Warning signs:**
- Time-to-first-prediction exceeds 5 minutes
- Mandatory tutorials before any action
- Multi-step profile creation upfront
- User must leave app to complete any step (wallet download, email verification)

**Prevention:**
- **Under 60 seconds to first prediction** (with practice points)
- Telegram auth = instant user creation (already planned - good)
- Defer profile completion, wallet connection, and advanced features
- "Make your first prediction" should be possible in 2-3 taps after opening
- Measure and optimize time-to-first-action obsessively

**Phase relevance:** Onboarding Phase - critical metric

**Source:** [Setgreet - App Onboarding Numbers](https://www.setgreet.com/blog/what-the-numbers-actually-say-about-mobile-app-onboarding-(and-what-to-track)) [MEDIUM confidence]

---

## Minor Pitfalls

Issues that cause friction but are recoverable.

---

### Pitfall 11: Prediction Market Resolution Disputes

**What goes wrong:** Market resolution is disputed by users who disagree with the outcome determination.

**Why it happens:** Ambiguous market questions, edge cases not covered by rules, or actual resolution errors.

**Consequences:**
- User complaints and support burden
- Loss of trust in platform fairness
- Negative word-of-mouth
- Potential chargebacks/disputes if real money involved

**Prevention:**
- Crystal-clear market questions with explicit resolution criteria
- Resolution criteria visible BEFORE users trade
- Multiple data sources for outcome verification
- Appeal process for disputed resolutions
- Cricket-specific: Official ICC results as canonical source

**Phase relevance:** Market Operations Phase

---

### Pitfall 12: Leaderboard Gaming

**What goes wrong:** Users find exploits to climb leaderboards without genuine skill (multi-accounting, volume manipulation, timing exploits).

**Why it happens:** Incentives misaligned - rewards volume/activity rather than prediction quality.

**Consequences:**
- Genuine users feel cheated
- Leaderboards lose meaning and motivation
- Potential point/reward exploitation costs

**Prevention:**
- Leaderboard metrics include accuracy, not just volume
- Anti-multi-account detection (Telegram ID + device fingerprint)
- Cooldowns on rapid trading
- "Analyst rating" based on prediction quality over time

**Phase relevance:** Gamification Phase

---

### Pitfall 13: Mobile Performance on Low-End Devices

**What goes wrong:** App performs poorly on budget Android devices common in India.

**Why it happens:** Development on high-end devices, insufficient testing on target hardware.

**Consequences:**
- Core target audience (Indian cricket fans on budget phones) has poor experience
- Slow load times, janky animations, crashes
- Users blame the app, not their device

**Prevention:**
- Test on Jio Phone equivalents and budget Androids
- Performance budget: initial load under 3 seconds on 3G
- Minimize JavaScript bundle size
- Progressive loading of non-critical features
- Next.js SSR/ISR for fast initial paint

**Phase relevance:** All phases - testing requirement

---

## Phase-Specific Warning Summary

| Phase | Critical Pitfall Risk | Key Mitigation |
|-------|----------------------|----------------|
| **Foundation** | initData validation bypass (#5), Security (#9) | Server-side validation, treat as untrusted client |
| **Onboarding** | Slow time-to-first-action (#10), Crypto overwhelm (#4) | Under 60s to first prediction, progressive disclosure |
| **Gamification** | Gambling behavior (#6), Leaderboard gaming (#12) | Gamify learning quality, not volume |
| **Education** | Assumes knowledge (#7), Jargon (#4) | Learn-by-doing, plain language, cricket analogies |
| **Wallet Integration** | Premature connection (#1), TON compliance (#2), Crypto complexity (#4) | Play-first architecture, TON-only, abstract complexity |
| **Trading Integration** | Real money before mastery (#8), Framing inconsistency (#3) | Competency gates, vocabulary audit |
| **Market Operations** | Resolution disputes (#11) | Clear criteria, canonical data sources |

---

## Confidence Assessment

| Pitfall Category | Confidence | Reasoning |
|-----------------|------------|-----------|
| Wallet timing (#1) | HIGH | Multiple sources, quantitative data, industry consensus |
| TON compliance (#2) | HIGH | Official Telegram documentation verified |
| Trading/betting framing (#3) | MEDIUM | Legal landscape evolving, principle is sound |
| Crypto overwhelm (#4) | HIGH | Multiple sources, industry-wide recognition |
| initData validation (#5) | MEDIUM | Security research, not verified with Telegram directly |
| Gamification risks (#6) | HIGH | Academic research with quantitative findings |
| Education gaps (#7) | MEDIUM | Academic research, general principles |
| Real money transition (#8) | MEDIUM | Industry best practices, less specific research |
| Security (#9) | MEDIUM | General web security + Mini App specific research |
| Time-to-first-action (#10) | HIGH | Well-documented onboarding research |

---

## Sources

### Official Documentation (HIGH confidence)
- [Telegram Blockchain Guidelines](https://core.telegram.org/bots/blockchain-guidelines)

### Industry Research & Analysis (MEDIUM-HIGH confidence)
- [Sequence - Web3 Onboarding](https://sequence.xyz/blog/how-to-simplify-user-onboarding-for-a-web3-app)
- [Trading Gamification and Investor Behavior - Management Science](https://pubsonline.informs.org/doi/10.1287/mnsc.2022.02650)
- [Legal Sports Report - Prediction Markets 2026](https://www.legalsportsreport.com/250145/foreshadowing-the-legal-landscape-of-prediction-markets-in-2026/)
- [Springer - Crypto Education Research](https://link.springer.com/article/10.1007/s12525-025-00863-y)
- [Crypto News - UX Crisis](https://crypto.news/cryptos-ux-crisis-billions-people-still-arent-onboard/)

### Security Research (MEDIUM confidence)
- [Nadcab - Telegram Mini Apps Security](https://www.nadcab.com/blog/security-risks-in-telegram-mini-apps)

### User Experience Research (MEDIUM confidence)
- [Setgreet - Onboarding Statistics](https://www.setgreet.com/blog/what-the-numbers-actually-say-about-mobile-app-onboarding-(and-what-to-track))
- [Finance Magnates - Prediction Market Churn](https://www.financemagnates.com/forex/analysis/why-prediction-markets-could-kill-retail-trading-apps-golden-goose-a-churned-user-is-worth-zero/)
- [Medium - Coinbase Activation Crisis](https://medium.com/the-plg-insider/cryptos-user-activation-crisis-a-product-case-study-on-coinbase-s-activation-funnel-e2a21b6eef48)

### Platform Comparison (MEDIUM confidence)
- [Kalshi Trustpilot Reviews](https://www.trustpilot.com/review/kalshi.com)
- [Gambling Harm - Platform Comparison](https://gamblingharm.org/kalshi-vs-polymarket-which-is-worse-for-consumers/)
