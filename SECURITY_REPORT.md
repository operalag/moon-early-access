# Security Vulnerability Report: Client-Side Authentication

## 1. The Current Implementation
The current application uses `WebApp.initDataUnsafe` from the Telegram Web Apps SDK to identify users. This logic happens entirely on the **client-side** (in the user's browser/phone).

**Flow:**
1. App reads `window.Telegram.WebApp.initDataUnsafe.user`.
2. App sends this `user.id` to Supabase via `supabase-js` client.
3. Supabase RLS (Row Level Security) allows this insertion based on the policy: "Enable insert for authenticated users only" (which currently treats 'anon' key users as authenticated enough for this operation or uses a public policy).

## 2. The Vulnerability
Since the data is read and processed on the client, it can be spoofed.

**Attack Scenario:**
A malicious user opens the web version of the Mini App in Chrome DevTools. They manually execute:
```javascript
// Spoofing a fake user
window.Telegram = { 
  WebApp: { 
    initDataUnsafe: { 
      user: { id: 123456789, first_name: "Hacker" } 
    } 
  } 
};
```
Your `AuthWrapper` component will see this fake data and create a legitimate user record in your database for ID `123456789`. They could script this to create thousands of fake accounts to flood your leaderboard or referral system.

## 3. Risk Assessment
*   **Severity:** Medium (High if real money/tokens were involved).
*   **Impact:** Leaderboard manipulation, referral farming, database spam.
*   **Mitigation Priority:** Recommended before Mainnet/Airdrop distribution.

## 4. Tasklist to Fix (Backend Verification)

To secure this, we must verify the **Cryptographic Signature** provided by Telegram.

### Step 1: Create a Next.js API Route
Instead of writing to Supabase directly from the client, the client should send the raw `initData` string to your backend.

- [ ] Create `src/app/api/auth/login/route.ts`.

### Step 2: Implement Validation Logic
The backend must use your **Telegram Bot Token** to validate the hash.

**Algorithm:**
1. Parse the `initData` string (e.g., `query_id=...&user=...&hash=...`).
2. Extract the `hash`.
3. Sort the rest of the keys alphabetically.
4. Create a Data-Check-String.
5. Calculate HMAC-SHA256 signature using your Bot Token.
6. Compare your calculated hash with the received `hash`.
7. **If they match:** The data is 100% authentic from Telegram.
8. **If not:** Reject the request.

### Step 3: Issue a Session Token (JWT)
Once validated:
1. The API route signs a Supabase JWT (using the Supabase Secret Key).
2. Returns this JWT to the client.

### Step 4: Update Frontend
1. Client receives JWT.
2. Client initializes Supabase with this JWT (`supabase.auth.setSession`).
3. Now, all database requests are authenticated as that specific user.

### Step 5: Lock Down Database
1. Update Supabase RLS policies.
2. Disable "anon" access for inserts/updates.
3. Only allow access if `auth.uid()` matches the `telegram_id`.

## 5. Conclusion
For the current "Early Access" campaign where points are just numbers in a DB, the current risk is acceptable for speed. However, before any "Wallet Connect" events trigger real on-chain transactions or airdrops, this **Must** be implemented.
