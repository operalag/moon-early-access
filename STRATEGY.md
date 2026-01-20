# MOON: Telegram Prediction Market Campaign Strategy

## 1. Core Concept: "Trade Your Knowledge"
**Philosophy:** MOON is a skill-based prediction market, not a betting platform. Users "buy stock" in outcomes based on analysis, strategy, and market insight.
**Target Audience:** Telegram users in India, Cricket enthusiasts.
**Event Anchor:** Upcoming ICC Cricket World Cup 2026.
**Channels:** Integration with existing Cricket News Channel and AI Chatbot.

## 2. User Journey (The "Analyst" Path)

### Phase 1: The Scout (Entry & Registration)
*   **Entry:** Users enter via the Telegram Bot/Channel.
*   **Action:** Open the MOON Mini App.
*   **Authentication:** Frictionless "Log in with Telegram" (via Supabase Auth).
*   **Value:** Users receive "Strategy Points" (virtual currency) immediately upon entry to start practicing trading.

### Phase 2: The Network Effect (Referrals)
*   **Placement:** Placed *before* wallet connection to maximize viral coefficient while friction is low.
*   **Mechanic:** "Build Your Syndicate." Invite friends to trade against.
*   **Incentive:** Earn a percentage of friends' future trading fees (in points) or immediate point bonuses per invite.

### Phase 3: Daily Analysis (Retention & Engagement)
*   **Daily Login:** "Daily Market Brief." Log in to collect research credits/points.
*   **Gamification:** "Market Volatility" Spin Wheel. Prizes include points, avatar items, or analysis boosts.
*   **AI Integration:** Consult the AI Chatbot for historical stats on matchups to inform trading decisions.

### Phase 4: The Trader (Wallet Connection)
*   **Placement:** Final step. Users have invested time and accumulated points.
*   **Action:** "Verify Identity & Assets" -> Connect TON Wallet.
*   **Incentive:** Required to secure the "Early Access" spot, convert Strategy Points to on-chain assets, or qualify for the Mainnet airdrop.

## 3. Technical Architecture

### Frontend (The Mini App)
*   **Framework:** Next.js (React) - Optimized for mobile performance.
*   **Styling:** Tailwind CSS - For a sleek, modern, "FinTech" aesthetic.
*   **Platform:** Telegram Web Apps SDK (TWA) for native feel.

### Backend & Database (The Brain)
*   **Provider:** Supabase.
*   **Auth:** Telegram Login mapped to Supabase Auth.
*   **Database:** PostgreSQL.
    *   `users` (tg_id, points, rank)
    *   `referrals` (referrer_id, referee_id)
    *   `activities` (login_streaks, spin_wheel_logs)
    *   `wallets` (ton_address)
*   **Realtime:** Live leaderboards via Supabase Realtime.

### Blockchain (The Layer)
*   **Network:** TON (The Open Network).
*   **Integration:** TON Connect UI (React SDK).
