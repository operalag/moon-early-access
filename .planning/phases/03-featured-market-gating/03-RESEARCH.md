# Phase 3: Featured Market Gating - Research

**Researched:** 2026-01-28
**Domain:** Wallet gating UI, TonConnect integration, Framer Motion bottom sheets
**Confidence:** HIGH

## Summary

This phase gates the existing Featured Market card behind wallet connection status. Users without a connected wallet see an educational bottom sheet modal with incentive to connect; users with a connected wallet tap through directly to themoon.business.

The codebase already has TonConnect integration (`@tonconnect/ui-react v2.3.1`), Framer Motion (`framer-motion v12.27.5`), and an existing bottom sheet pattern in `InfoContext.tsx`. The implementation requires:
1. A new bottom sheet modal component with wallet education content
2. Conditional rendering on the Featured Market card (locked vs unlocked state)
3. Integration with existing `useTonAddress()` hook for wallet detection
4. Use of `useTonConnectUI().openModal()` to trigger wallet connection
5. Use of Telegram WebApp's `openLink()` for external navigation

**Primary recommendation:** Build a custom `WalletGateModal` component using the existing Framer Motion bottom sheet pattern from `InfoContext.tsx`, integrate with TonConnect's `useTonConnectUI` hook for programmatic wallet connection, and use Telegram's `openLink()` method for external navigation.

## Standard Stack

The existing codebase already includes all required libraries. No additional dependencies needed.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tonconnect/ui-react` | ^2.3.1 | Wallet connection UI and hooks | Official TonConnect React SDK for TON ecosystem |
| `framer-motion` | ^12.27.5 | Bottom sheet animations and gestures | Already used throughout app for animations |
| `@twa-dev/sdk` | ^8.0.2 | Telegram Mini App WebApp API | Already integrated for Telegram platform features |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | ^0.562.0 | Icons (Lock, Unlock, etc.) | Card state indicators |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom bottom sheet | `react-modal-sheet` | Adds dependency; existing pattern works fine |
| Native dialog | Framer Motion sheet | Native lacks gesture support; FM already in use |

**Installation:**
```bash
# No new dependencies required - all libraries already installed
```

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── WalletGateModal.tsx       # New: Bottom sheet with wallet education
│   └── FeaturedMarketCard.tsx    # New: Extract from page.tsx, add gating logic
├── hooks/
│   └── useWalletGate.ts          # New: Encapsulate gating logic (optional)
└── app/
    └── page.tsx                   # Modify: Use new components
```

### Pattern 1: Wallet State Detection
**What:** Use `useTonAddress()` to detect wallet connection status
**When to use:** Anywhere wallet-dependent UI is needed
**Example:**
```typescript
// Source: Existing pattern in src/app/page.tsx, src/hooks/useProgression.ts
import { useTonAddress } from '@tonconnect/ui-react';

const userFriendlyAddress = useTonAddress();
const isWalletConnected = !!userFriendlyAddress;
```

### Pattern 2: Programmatic Wallet Modal
**What:** Open TonConnect modal without using TonConnectButton
**When to use:** Custom wallet connection triggers (like our bottom sheet CTA)
**Example:**
```typescript
// Source: https://docs.ton.org/v3/guidelines/ton-connect/frameworks/react
import { useTonConnectUI } from '@tonconnect/ui-react';

const [tonConnectUI] = useTonConnectUI();

const handleConnectWallet = () => {
  tonConnectUI.openModal();
};
```

### Pattern 3: Bottom Sheet Modal (Existing Pattern)
**What:** Framer Motion animated bottom sheet with backdrop
**When to use:** Modal overlays that need gesture support
**Example:**
```typescript
// Source: src/context/InfoContext.tsx (existing implementation)
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[70] bg-[#121212] border-t border-white/10 p-6 rounded-t-3xl"
      >
        {/* Content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Pattern 4: Telegram External Link
**What:** Open URLs in external browser from Telegram Mini App
**When to use:** Navigating to external sites (themoon.business)
**Example:**
```typescript
// Source: https://core.telegram.org/bots/webapps, existing pattern in src/app/syndicate/page.tsx
import { useTelegram } from '@/hooks/useTelegram';

const { webApp } = useTelegram();

const handleOpenExternal = () => {
  // openLink opens in external browser, Mini App stays open
  if (webApp?.openLink) {
    webApp.openLink('https://themoon.business');
  } else {
    // Fallback for browser testing
    window.open('https://themoon.business', '_blank');
  }
};
```

### Anti-Patterns to Avoid
- **Using openTelegramLink for external URLs:** Only use for Telegram-internal links (t.me/*, etc.). For external URLs use `openLink()`.
- **Relying on TonConnectButton for custom flows:** Use `useTonConnectUI().openModal()` for programmatic control.
- **Hardcoding wallet check logic:** Use `useTonAddress()` hook; it handles SDK state properly.
- **Creating new context for modal state:** Local component state is sufficient for a single modal; don't over-engineer.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Wallet connection detection | Custom storage/polling | `useTonAddress()` | Hook auto-updates, handles SDK lifecycle |
| Wallet connect trigger | Custom deeplinks | `useTonConnectUI().openModal()` | Handles multi-wallet, QR, mobile detection |
| Bottom sheet animation | CSS transitions | Framer Motion pattern | Gesture support, spring physics, consistent |
| External link in TMA | `window.open()` | `webApp.openLink()` | Proper TMA lifecycle, iOS/Android consistent |

**Key insight:** The codebase already has patterns for all these problems. The implementation is primarily about composing existing patterns, not creating new ones.

## Common Pitfalls

### Pitfall 1: Wallet State Race Condition
**What goes wrong:** Checking wallet state before TonConnect SDK initializes
**Why it happens:** `useTonAddress()` returns empty string during initialization
**How to avoid:** Use `useIsConnectionRestored()` to detect initialization complete, or accept that initial render may show "disconnected" state
**Warning signs:** Flash of "Connect Wallet" state even when wallet is connected

### Pitfall 2: Missing openLink Fallback
**What goes wrong:** `webApp.openLink()` fails silently in browser dev mode
**Why it happens:** WebApp SDK only fully works in Telegram environment
**How to avoid:** Always provide `window.open()` fallback for dev testing
**Warning signs:** Nothing happens when clicking external link in Chrome

### Pitfall 3: Modal Z-Index Conflicts
**What goes wrong:** TonConnect modal appears behind custom modal
**Why it happens:** TonConnect modal has its own z-index stack
**How to avoid:** Close custom bottom sheet BEFORE calling `tonConnectUI.openModal()`
**Warning signs:** User can't see wallet selection after clicking "Connect Wallet"

### Pitfall 4: Points Double-Award
**What goes wrong:** User receives wallet connect points multiple times
**Why it happens:** Calling `/api/wallet/verify` on every app load
**How to avoid:** The existing API already handles this (checks `is_wallet_connected` first). Don't bypass it.
**Warning signs:** Points log shows multiple `wallet_connect` entries for same user

### Pitfall 5: Gesture Conflicts on Mobile
**What goes wrong:** Swipe-to-dismiss interferes with scroll inside modal
**Why it happens:** Touch gestures captured at wrong element level
**How to avoid:** Apply drag handlers only to modal header/handle, not content area
**Warning signs:** Can't scroll content, or modal dismisses unexpectedly

## Code Examples

### Featured Market Card with Lock State
```typescript
// New component: src/components/FeaturedMarketCard.tsx
'use client';

import { useTonAddress } from '@tonconnect/ui-react';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import WalletGateModal from './WalletGateModal';

interface FeaturedMarketCardProps {
  onNavigate: () => void;
}

export default function FeaturedMarketCard({ onNavigate }: FeaturedMarketCardProps) {
  const userFriendlyAddress = useTonAddress();
  const isWalletConnected = !!userFriendlyAddress;
  const [showGateModal, setShowGateModal] = useState(false);

  const handleTap = () => {
    if (isWalletConnected) {
      onNavigate();
    } else {
      setShowGateModal(true);
    }
  };

  return (
    <>
      <button onClick={handleTap} className="w-full text-left">
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-1 relative">
          {!isWalletConnected && (
            <div className="absolute top-3 right-3 z-10">
              <Lock size={16} className="text-yellow-500/70" />
            </div>
          )}
          {/* Existing card content */}
        </div>
        {!isWalletConnected && (
          <p className="text-white/30 text-[10px] text-center mt-2">
            Wallet required to trade
          </p>
        )}
      </button>

      <WalletGateModal
        isOpen={showGateModal}
        onClose={() => setShowGateModal(false)}
      />
    </>
  );
}
```

### Wallet Gate Modal with Connect Action
```typescript
// New component: src/components/WalletGateModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Wallet, Zap } from 'lucide-react';

interface WalletGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletGateModal({ isOpen, onClose }: WalletGateModalProps) {
  const [tonConnectUI] = useTonConnectUI();

  const handleConnectWallet = () => {
    onClose(); // Close our modal first to avoid z-index conflict
    tonConnectUI.openModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-[#121212] border-t border-white/10 p-6 rounded-t-3xl"
          >
            {/* Drag handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

            {/* Content */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Wallet Required
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Connect your TON wallet to access prediction markets.
                You'll need TON for gas and USDT for trading.
              </p>
            </div>

            {/* Reward callout */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <Zap className="text-yellow-500" size={24} />
              <div>
                <p className="text-yellow-500 font-bold text-sm">+1,000 Points</p>
                <p className="text-white/40 text-xs">Reward for connecting wallet</p>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleConnectWallet}
              className="w-full bg-yellow-500 text-black font-bold py-4 rounded-2xl mb-3"
            >
              Connect Wallet
            </button>
            <button
              onClick={onClose}
              className="w-full bg-white/5 text-white/60 font-medium py-3 rounded-xl"
            >
              Maybe later
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### External Navigation Handler
```typescript
// Pattern for navigating to themoon.business
import { useTelegram } from '@/hooks/useTelegram';

const { webApp } = useTelegram();

const handleNavigateToMarket = () => {
  const url = 'https://themoon.business';

  if (webApp?.openLink) {
    webApp.openLink(url);
  } else {
    // Fallback for browser dev testing
    window.open(url, '_blank');
  }
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package | 2024 | react-modal-sheet requires `motion` not `framer-motion` |
| Manual wallet polling | `useTonAddress()` hook | TonConnect UI 2.x | Reactive updates, no polling needed |
| Custom wallet UI | `useTonConnectUI().openModal()` | TonConnect UI 2.x | Standard UX across TON ecosystem |

**Deprecated/outdated:**
- N/A - Current stack is modern

**Note:** The codebase uses `framer-motion` v12 which is the current package. The `motion` package is the new naming but `framer-motion` still works and receives updates.

## Open Questions

Things that couldn't be fully resolved:

1. **Exact themoon.business URL structure**
   - What we know: Base URL is `https://themoon.business`
   - What's unclear: Whether to link to homepage or specific market
   - Recommendation: Use base URL for now; refinement is noted as future work in CONTEXT.md

2. **Swipe-to-dismiss gesture implementation**
   - What we know: CONTEXT.md specifies "swipe down to dismiss"
   - What's unclear: Whether to implement custom drag or keep simple tap-outside
   - Recommendation: Start with tap-outside (existing pattern); add swipe if UX testing shows need. Adding `drag="y"` and `dragConstraints` is straightforward if needed.

3. **Connected card visual treatment**
   - What we know: Should look different when wallet connected (Claude's discretion)
   - What's unclear: Specific design direction
   - Recommendation: Remove lock icon, optionally add subtle arrow indicator

## Sources

### Primary (HIGH confidence)
- [TON Connect React Documentation](https://docs.ton.org/v3/guidelines/ton-connect/frameworks/react) - useTonConnectUI, openModal() method
- [TonConnect UI React API Reference](https://ton-connect.github.io/sdk/modules/_tonconnect_ui-react.html) - Hook return types
- [Telegram Mini Apps WebApp API](https://core.telegram.org/bots/webapps) - openLink() method, parameters
- Existing codebase: `src/context/InfoContext.tsx` - Bottom sheet pattern
- Existing codebase: `src/app/page.tsx` - useTonAddress() usage
- Existing codebase: `src/app/syndicate/page.tsx` - openTelegramLink pattern

### Secondary (MEDIUM confidence)
- [Framer Motion Gestures Documentation](https://www.framer.com/motion/gestures/) - Drag controls for potential swipe-to-dismiss
- [react-modal-sheet GitHub](https://github.com/Temzasse/react-modal-sheet) - Reference implementation for advanced sheet features
- [Web3 UX Best Practices 2026](https://bricxlabs.com/blogs/web-3-ux-design-trends) - Wallet gating UX patterns

### Tertiary (LOW confidence)
- N/A

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and in use
- Architecture: HIGH - Patterns extracted from existing codebase
- Pitfalls: HIGH - Based on documented issues and codebase analysis

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - stable patterns)
