---
status: complete
phase: 03-featured-market-gating
source: [03-01-SUMMARY.md]
started: 2026-01-28T15:45:00Z
updated: 2026-01-28T16:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Lock Icon on Featured Market Card
expected: When wallet is NOT connected, the Featured Market card shows a lock icon in the top-right corner and "Wallet required to trade" text below the card.
result: pass

### 2. Bottom Sheet Modal Opens on Tap
expected: Tapping the Featured Market card (when no wallet connected) opens a bottom sheet modal that slides up from the bottom with wallet education content.
result: pass

### 3. Modal Shows Wallet Education and Points Incentive
expected: The modal displays "Wallet Required" title, educational text about TON/USDT, and "+1,000 Points" incentive badge clearly visible.
result: pass

### 4. Connect Wallet Triggers TonConnect
expected: Tapping "Connect Wallet" button in the modal closes the bottom sheet, then opens the TonConnect wallet selection modal.
result: pass

### 5. Maybe Later Dismisses Modal
expected: Tapping "Maybe later" closes the bottom sheet modal and returns to the dashboard.
result: pass

### 6. Connected Wallet Opens External Link
expected: When wallet IS connected, tapping the Featured Market card opens https://themoon.business in an external browser (or new tab in dev).
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
