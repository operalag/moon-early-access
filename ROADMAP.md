# MOON Project: Strategic Roadmap

## Phase 1: MVP Refinement (Current)
*Goal: Polish and stability for the first 1,000 users.*
- [ ] **Security Hardening:** Implement backend validation of Telegram `initData` signature to prevent user spoofing.
- [ ] **DB Automation:** Create a SQL migration script to ensure `last_spin_at` and other columns exist automatically.
- [ ] **SEO/Sharing:** Add Open Graph meta tags so sharing the link on Twitter/WhatsApp looks professional.

## Phase 2: The "Live" Experience (ICC World Cup Prep)
*Goal: Real-time engagement during matches.*
- [ ] **Live Odds Ticker:** Connect to a Cricket Data API (e.g., CricAPI) to show real match scores on the Dashboard.
- [ ] **Market Trading:** Implement the actual "Buy/Sell" logic for Outcome Tokens (currently just a UI placeholder).
- [ ] **Push Notifications:** Use Telegram Bot API to send alerts: "India just took a wicket! Market moving!"

## Phase 3: Web3 Integration (Mainnet)
*Goal: Conversion from Points to Tokens.*
- [ ] **Smart Contracts:** Deploy FunC contracts on TON for the prediction market logic.
- [ ] **Token Generation Event (TGE):** Launch $MOON token.
- [ ] **Airdrop Script:** Calculate final leaderboard standings and distribute tokens based on "Strategy Points".

## Phase 4: Expansion
- [ ] **Social Betting:** Allow users to create private leagues ("Syndicate vs Syndicate").
- [ ] **Multilingual Support:** Hindi translation for broader Indian market reach.
- [ ] **Native Mobile App:** Wrap the TWA into a React Native container for Play Store listing.
