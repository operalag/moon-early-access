# Project Scoreboard: Centralized Points Engine & Time-Based Leaderboards
**Target Version:** v4.0.0
**Objective:** Move from ad-hoc point updates to a transactional ledger system that supports Daily, Weekly, and All-Time leaderboards automatically.

---

## 📅 Phased Implementation Plan

### ✅ Phase 1: The Foundation (Database & Core Logic)
*Focus: Backend Integrity*

1.  **Schema Design (`v4.0.0-alpha`)**
    *   Create `transactions` table (History log).
    *   Create `leaderboard_buckets` table (Aggregated scores by period).
    *   Write PL/pgSQL function `award_points` to handle the multi-table write atomically.

2.  **API Layer (`v4.0.0-beta`)**
    *   Create `src/lib/pointsEngine.ts` to abstract the SQL call.
    *   Create `src/app/api/engine/award/route.ts` as the internal webhook.

3.  **Testing**
    *   Playwright test: Trigger a point award and verify it appears in `profiles`, `transactions`, and `leaderboard_buckets`.

### 🔄 Phase 2: The Great Refactor (Integration)
*Focus: Cleaning Technical Debt*

4.  **Referrals (`v4.0.1`)**
    *   Update `/api/referral` to call `award_points` instead of direct update.
5.  **Daily Spin (`v4.0.2`)**
    *   **Major Change:** Move Spin logic from Client (insecure) to Server API (`/api/spin`).
    *   Connect to Engine.
6.  **Wallet & Channel (`v4.0.3`)**
    *   Update Wallet Verification to use Engine.
    *   Update Channel Verification to use Engine.

### 🏆 Phase 3: Visuals (Frontend)
*Focus: User Engagement*

7.  **Leaderboard API (`v4.1.0`)**
    *   Endpoint: `GET /api/leaderboard?period={daily|weekly|all_time}`.
8.  **UI Upgrade (`v4.2.0`)**
    *   Add Tabs to Leaderboard Page.
    *   Show "Points Earned Today" in Profile.

---

## 🛠️ Technical Specs

### Database Tables

**`transactions`**
- `id` (uuid)
- `user_id` (bigint)
- `amount` (int)
- `reason` (text) - e.g., 'referral', 'spin', 'wallet_connect'
- `created_at` (timestamp)

**`leaderboard_buckets`**
- `user_id` (bigint)
- `period_type` (text) - 'daily', 'weekly'
- `period_key` (text) - '2026-01-23', '2026-W04'
- `points` (int)
- *PK: (user_id, period_type, period_key)*

### SQL Function Logic (`award_points`)
```sql
BEGIN
  -- 1. Log Transaction
  INSERT INTO transactions ...;
  
  -- 2. Update Profile (Legacy/Global)
  UPDATE profiles SET total_points = total_points + amount ...;
  
  -- 3. Update Buckets
  -- Daily
  INSERT INTO leaderboard_buckets (...) VALUES (..., 'daily', TO_CHAR(now(), 'YYYY-MM-DD'), amount)
  ON CONFLICT DO UPDATE SET points = buckets.points + amount;
  
  -- Weekly
  INSERT INTO leaderboard_buckets (...) VALUES (..., 'weekly', TO_CHAR(now(), 'IYYY-IW'), amount)
  ON CONFLICT DO UPDATE SET points = buckets.points + amount;
END;
```
