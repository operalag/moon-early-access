# Phase 3: Featured Market Gating - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Gate the existing Featured Market card behind wallet connection. Users without a connected wallet see education and incentive to connect; users with wallet get direct access to themoon.business. Full wallet onboarding flow (create, fund, swap) is Phase 6.

</domain>

<decisions>
## Implementation Decisions

### Gated State Behavior
- Modal overlay (bottom sheet) appears when user taps Featured Market without wallet
- Featured Market card shows visual lock indicator + text hint ("Wallet required" or similar)
- Bottom sheet slides up from bottom, covers ~60% of screen
- Swipe down to dismiss, tap outside to dismiss
- Primary CTA: "Connect Wallet" (triggers TonConnect)
- Secondary: "Maybe later" dismiss option
- Modal shows on every tap until wallet connected (no cooldown)

### Education Content
- Main message: "Wallet needed to trade"
- Brief mention of TON + USDT requirement (details in Phase 6 onboarding)
- Do NOT mention themoon.business by name — keep generic ("prediction markets")
- Modal visual element: Claude's discretion based on app style

### Incentive/Motivation
- Points reward for connecting wallet (shown upfront in modal)
- Higher tier reward: ~1000+ points (major milestone)
- Urgency/FOMO tactics: Claude's discretion based on brand tone

### Connected State Behavior
- Tap Featured Market → direct link to themoon.business (no confirmation)
- Open via Telegram's openLink (system browser)
- URL: https://themoon.business (placeholder — will be refined later)
- Card appearance when connected: Claude's discretion (remove lock, clean look)

### Claude's Discretion
- Modal visual element (icon/illustration or text-only)
- Urgency messaging (limited time offer, social proof, or none)
- Connected card appearance (remove lock, add arrow, etc.)
- Exact copy/wording within guidelines

</decisions>

<specifics>
## Specific Ideas

- "Version string must be updated on deploy" — currently shows `SYSTEM V5.3.0-BETA • BUILD 2026-01-24-WELCOMEBONUSENGINE`
- Featured Market card already exists in the markets tab/page
- External link is temporary/placeholder — detailed integration discussed later

</specifics>

<deferred>
## Deferred Ideas

- Full wallet onboarding flow (create wallet, connect, fund with TON, swap to USDT) — Phase 6
- Asset verification before allowing trade access — future consideration
- Specific themoon.business market links — later refinement
- Version string update process — project-wide convention (not phase-specific)

</deferred>

---

*Phase: 03-featured-market-gating*
*Context gathered: 2026-01-28*
