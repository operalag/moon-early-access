# Project Megaphone: Smart Retention Nudges
**Target Version:** v5.0.0
**Objective:** Increase DAU (Daily Active Users) by sending randomized, personality-driven Telegram notifications to users who are at risk of breaking their streak.

---

## 📅 Phased Implementation Plan (Scrum Sprints)

### ✅ Phase 1: Infrastructure & Consent (The "Silent" Phase)
*Focus: Database readiness and User Privacy.*

1.  **Story 1.1: Schema Update**
    *   **Task:** Add columns to `profiles`:
        *   `is_push_enabled` (boolean, default true).
        *   `last_notified_at` (timestamp, nullable).
    *   **Deliverable:** SQL Migration file.
    *   **Test:** Verify columns exist in Supabase.

2.  **Story 1.2: Settings UI**
    *   **Task:** Create a "Settings" page (or section in Profile).
    *   **Task:** Add a Toggle Switch: "Enable Notifications".
    *   **Deliverable:** UI updates in `/wallet` or new `/settings` page.
    *   **Test:** Toggling saves state to DB.

### 📢 Phase 2: The Voice (Messaging Logic)
*Focus: Bot Integration and Content.*

3.  **Story 2.1: Telegram Bot Wrapper**
    *   **Task:** Create `src/lib/telegramBot.ts`.
    *   **Function:** `sendTelegramMessage(chatId, text)`.
    *   **Deliverable:** Utility function using `process.env.TELEGRAM_BOT_TOKEN`.
    *   **Test:** Create a manual `/debug/test-message` page to send a "Hello World" to yourself.

4.  **Story 2.2: The Copywriter Engine**
    *   **Task:** Create `src/lib/nudges.ts`.
    *   **Content:** Define an array of 10+ catchy messages (e.g., "🔥 Your streak is burning out!").
    *   **Logic:** Function `getRandomNudge()` that picks a message.
    *   **Deliverable:** Library file.
    *   **Test:** Unit test ensuring random output.

### 🤖 Phase 3: The Engine (Automation)
*Focus: Selecting users and sending batches.*

5.  **Story 3.1: The Query**
    *   **Task:** Write Supabase query to find "Stale Users":
        *   `last_login` < 24h ago.
        *   `last_notified` < 48h ago (or null).
        *   `is_push_enabled` = true.
    *   **Deliverable:** API function in `src/lib/megaphone.ts`.

6.  **Story 3.2: The Cron Endpoint**
    *   **Task:** Create `/api/cron/nudge` (Secured by `CRON_SECRET`).
    *   **Logic:**
        1. Fetch batch (Limit 20 users).
        2. Loop & Send.
        3. Update `last_notified_at`.
    *   **Deliverable:** API Route.
    *   **Test:** Manually trigger via `curl`. Verify only 20 users get it.

### 🚀 Phase 4: Launch (Scheduling)
*Focus: Turning it on.*

7.  **Story 4.1: Vercel Cron**
    *   **Task:** Add `crons` config to `vercel.json`.
    *   **Schedule:** Run every 1 hour.
    *   **Deliverable:** Configuration update.
    *   **Test:** Monitor Vercel Logs for successful runs.

---

## 🛡️ Risk Management
*   **Rate Limits:** We limit batches to 20-50 users per run to respect Telegram's 30 msg/sec limit and Vercel's 10s timeout.
*   **Spam:** We respect `is_push_enabled` strictly. We only notify once every 48h per user.
