---
phase: 03-featured-market-gating
plan: 01
subsystem: ui/wallet-gating
tags: [wallet, gating, modal, featured-market, tonconnect]

dependency-graph:
  requires: [01-launch-polish, 02-campaign-tracking]
  provides: [wallet-gated-featured-market, wallet-education-modal]
  affects: [06-tutorial-onboarding]

tech-stack:
  added: []
  patterns: [bottom-sheet-modal, wallet-state-gating]

key-files:
  created:
    - src/components/WalletGateModal.tsx
    - src/components/FeaturedMarketCard.tsx
  modified:
    - src/app/page.tsx

decisions:
  - id: gate-modal-close-first
    choice: "Close modal before opening TonConnect"
    reason: "Avoid z-index conflicts between overlapping modals"
  - id: button-accessibility
    choice: "Card is button element"
    reason: "Better accessibility for interactive card"

metrics:
  duration: 2m 0s
  completed: 2026-01-28
---

# Phase 03 Plan 01: Featured Market Gating Summary

**One-liner:** Bottom sheet wallet gate modal with +1000 points incentive, extracted FeaturedMarketCard component with lock indicator and wallet state detection

## Changes Made

### Task 1: WalletGateModal Component
Created bottom sheet modal for wallet education at `src/components/WalletGateModal.tsx`:
- AnimatePresence + motion for smooth slide-up animation
- Backdrop with blur effect (z-60), sheet (z-70)
- Drag handle for visual affordance
- Wallet icon in yellow-500 circular badge
- Title: "Wallet Required"
- Body: Educational text about TON/USDT needs
- Points incentive: "+1,000 Points" badge with yellow styling
- Primary CTA: "Connect Wallet" (yellow-500 bg, black text)
- Secondary: "Maybe later" dismiss option
- Critical: onClose() called before tonConnectUI.openModal() to avoid z-index conflicts

### Task 2: FeaturedMarketCard Component
Extracted market card to `src/components/FeaturedMarketCard.tsx`:
- Uses useTonAddress hook for wallet detection
- Lock icon (top-right) when wallet not connected
- "Wallet required to trade" hint text below card when locked
- handleCardTap: opens WalletGateModal (no wallet) or calls onNavigate (wallet connected)
- Card is accessible button element
- Renders WalletGateModal internally

### Task 3: Dashboard Integration
Updated `src/app/page.tsx`:
- Added FeaturedMarketCard import
- Added handleNavigateToMarket handler
  - Uses webApp.openLink for Telegram environment
  - Falls back to window.open for browser testing
  - Target URL: https://themoon.business
- Replaced inline Featured Market markup with component
- Preserved section header with InfoTrigger

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Modal close order | Close gate modal before TonConnect | Prevents z-index conflicts between overlapping modals |
| Card element type | button | Better accessibility for interactive elements |
| Lock indicator position | top-right corner | Non-intrusive but clearly visible |
| Points incentive | +1,000 | Major milestone reward to drive conversion |

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 52b0e79 | feat | Create WalletGateModal component |
| c6d02ea | feat | Create FeaturedMarketCard component |
| 4dca427 | feat | Integrate FeaturedMarketCard into dashboard |

## Verification Results

- [x] WalletGateModal.tsx exists (87 lines)
- [x] FeaturedMarketCard.tsx exists (71 lines)
- [x] page.tsx imports FeaturedMarketCard
- [x] FeaturedMarketCard imports WalletGateModal
- [x] useTonAddress hook used for wallet detection
- [x] No new lint errors introduced

## Next Phase Readiness

Phase 03 Plan 01 complete. The Featured Market card is now gated behind wallet connection with:
- Visual lock indicator
- Educational bottom sheet modal
- +1,000 points incentive
- TonConnect integration for wallet connection

**Visual verification needed (manual):**
- Lock icon visibility when no wallet
- Bottom sheet animation on tap
- TonConnect modal opens after "Connect Wallet" tap
- External link opens when wallet connected

---

*Generated: 2026-01-28*
*Duration: 2m 0s*
