# MOON: Implementation Plan (Scrum Approach)

**Role:** Senior Scrum Master
**Goal:** Deliver an MVP Telegram Mini App for the "MOON" prediction market.
**Tech Stack:** Next.js, Tailwind CSS, Supabase, TON Connect.

---

## Phase 1: Foundation & Authentication (Sprint 1)
*Goal: A working Mini App inside Telegram where users can "Log In" and see their profile.*

### 1.1 Project Scaffolding
- [ ] Initialize Next.js project with TypeScript.
- [ ] Configure Tailwind CSS.
- [ ] Install `@twa-dev/sdk` (Telegram Web App SDK).
- [ ] Set up basic layout (Mobile-first container).

### 1.2 Database Schema (Supabase)
- [ ] Create `profiles` table:
    - `id` (UUID, PK)
    - `telegram_id` (BigInt, Unique)
    - `username` (String)
    - `first_name` (String)
    - `avatar_url` (String)
    - `created_at` (Timestamp)
    - `total_points` (Integer, default: 0)
    - `is_wallet_connected` (Boolean)

### 1.3 Authentication Logic
- [ ] Implement Telegram Widget or `initData` validation on the backend.
- [ ] Create API route `/api/auth/telegram` to verify Telegram signature.
- [ ] Upsert user into Supabase `profiles` on launch.
- [ ] Display User Profile (Avatar + Name) on the Home Screen.

---

## Phase 2: The Viral Loop - Referrals (Sprint 2)
*Goal: Users can generate invite links and earn points for bringing friends.*

### 2.1 Database Updates
- [ ] Create `referrals` table:
    - `id` (UUID)
    - `referrer_id` (FK -> profiles.telegram_id)
    - `referee_id` (FK -> profiles.telegram_id)
    - `status` (Enum: 'pending', 'completed')
- [ ] Add `referral_code` to `profiles` (can use `telegram_id` or a hash).

### 2.2 Frontend - Referral System
- [ ] Create "Syndicate" (Referral) Page.
- [ ] Implement "Share" button using `Telegram.WebApp.openTelegramLink` to pre-fill a message.
- [ ] Logic: When a new user opens the app with `?startapp=REF_CODE`, capture the code.
- [ ] Backend: Credit points to both Referrer and Referee upon successful registration.

---

## Phase 3: Retention & Gamification (Sprint 3)
*Goal: Keep users coming back daily with rewards and AI interaction.*

### 3.1 Daily Login System
- [ ] Create `daily_logins` table.
- [ ] Logic: Check last login date. If > 24h, reset streak? Or if missed day, reset?
- [ ] Frontend: "Claim Daily Supply" button.
- [ ] Visual: Streak counter flame icon.

### 3.2 The "Market Volatility" Spin Wheel
- [ ] Implement a CSS/Canvas based Spin Wheel component.
- [ ] Backend Logic: Random number generator (server-side) to determine prize to prevent cheating.
- [ ] Prizes: Strategy Points, XP, "Market Insight" badges.

### 3.3 AI Chat Integration (Lite)
- [ ] Embed a simple chat interface or link to existing AI bot.
- [ ] Optional: Display "AI Prediction of the Day" (fetched from your existing bot source) on the Dashboard.

---

## Phase 4: TON Wallet Integration (Sprint 4)
*Goal: The final conversion step.*

### 4.1 Integration
- [ ] Install `@tonconnect/ui-react`.
- [ ] Configure `manifest.json` for TON Connect.
- [ ] Create "Assets" or "Verify" page.

### 4.2 Wallet Logic
- [ ] Add `ton_wallet_address` column to `profiles`.
- [ ] Implement `TonConnectButton`.
- [ ] `onWalletConnected` callback: Send address to Supabase backend to save.
- [ ] Unlock "Early Access Badge" in UI once connected.

---

## Phase 5: Polish & Launch (Sprint 5)
*Goal: Production readiness.*

### 5.1 UI/UX Polish
- [ ] Add Loading Skeletons.
- [ ] Ensure dark mode support (matches Telegram theme).
- [ ] Haptic Feedback (using `Telegram.WebApp.HapticFeedback`) on button clicks.

### 5.2 Deployment
- [ ] Deploy frontend to Vercel.
- [ ] Configure Environment Variables.
- [ ] Connect Vercel URL to Telegram Bot via BotFather.

### 5.3 QA
- [ ] Test referral flow with multiple Telegram accounts.
- [ ] Verify point calculations.
- [ ] Security audit (RLS policies in Supabase).
