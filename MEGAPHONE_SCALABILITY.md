# Megaphone Scalability Roadmap
**Topic:** Handling high-volume Telegram notifications on Vercel.

---

## 📈 Current Capacity (v5.2.0)
- **Batch Size:** 20 users per run.
- **Frequency:** 1 hour.
- **Max Throughput:** 480 users / day.
- **Limit:** Vercel 10s execution timeout.

---

## 🛠️ Scale Tiers & Actions

### Tier 1: 1,000 - 10,000 Users
- **Problem:** Hourly runs don't reach everyone in time.
- **Action 1:** Increase Batch Size to 50 (max safe limit for a 10s Vercel function).
- **Action 2:** Increase Cron Frequency to every 10 minutes (`*/10 * * * *`).
- **Capacity:** ~7,200 users / day.

### Tier 2: 10,000 - 100,000 Users
- **Problem:** Function Timeouts (403/504 errors) and Telegram Rate Limits.
- **Action 1: Parallel Workers.** Split the cron into multiple endpoints (e.g., `/nudge?shard=1`, `/nudge?shard=2`) querying different ID ranges.
- **Action 2: Use Upstash QStash.** Move from Vercel Crons to a Dedicated Queue Manager (like Upstash). It can trigger thousands of "background" tasks that run independently.
- **Action 3: Dedicated Bot Nodes.** Deploy a small Node.js worker on Railway or DigitalOcean that doesn't have the 10s serverless timeout.

### Tier 3: 100,000+ Users
- **Problem:** Database Query Speed & Cost.
- **Action 1: Materialized Views.** Use a Postgres Materialized View to pre-calculate the "Stale User List" so the cron doesn't have to filter the whole `profiles` table every time.
- **Action 2: Redis Caching.** Store the `last_notified_at` in Redis for lightning-fast lookups.
- **Action 3: Multiple Bot Tokens.** Telegram limits one bot to ~30 messages per second. At 1M users, you need multiple "Helper Bots" to distribute the load.

---

## 🚨 To-Do List for Rapid Growth
1.  [ ] **Monitoring:** Set up Sentry or Axiom to log every "Failed" telegram send.
2.  [ ] **Concurrency:** Implement a "Locking" mechanism in Supabase so two cron runs don't notify the same user twice simultaneously.
3.  [ ] **Rate Limit Handling:** Update `telegramBot.ts` to respect `429 Too Many Requests` by reading the `retry_after` header.
4.  [ ] **Engagement Analytics:** Track which "Nudge Text" has the highest CTR (Click-Through Rate).
