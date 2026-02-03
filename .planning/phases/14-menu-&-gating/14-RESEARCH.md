# Phase 14: Menu & Gating - Research

**Researched:** 2026-02-03
**Domain:** Navigation UI, conditional rendering, attention indicators, wallet-gated content
**Confidence:** HIGH

## Summary

This phase adds the "Net Practice" (education) entry point to the main navigation menu with a conditional pulsing attention indicator, plus enhances the existing ModuleCard component with wallet-gated locking for Modules 2 and 3. Research focused on four key areas: (1) existing BottomNav component architecture for adding a new menu item, (2) established patterns for pulsing/attention indicators in the codebase, (3) wallet connection detection via existing hooks, and (4) ModuleCard's current locking implementation.

The codebase has established, consistent patterns for all requirements. BottomNav uses a simple `tabs` array with `Link` components - adding "Net Practice" requires only appending to this array. Pulsing indicators use Tailwind's `animate-pulse` class, already present in multiple places (page.tsx header, chat status, etc.). Wallet connection is detected via `useTonAddress()` from `@tonconnect/ui-react` (pattern in useProgression.ts, page.tsx). ModuleCard already has `isLocked` prop with visual treatment - it just needs enhancement to show "Connect wallet to unlock" message and separate wallet-gating from prerequisite-gating.

**Primary recommendation:** Modify BottomNav.tsx to add "Net Practice" tab with conditional pulsing indicator, enhance ModuleCard.tsx to distinguish wallet-locked vs prerequisite-locked states with teaser message, and add education completion check via API call for indicator logic.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tonconnect/ui-react | ^2.3.1 | Wallet connection detection | `useTonAddress()` hook established in codebase |
| framer-motion | ^12.27.5 | Custom animations (optional) | Used throughout for transitions, could enhance pulse |
| lucide-react | ^0.562.0 | Icons | `GraduationCap` or similar for education menu item |
| tailwindcss | ^4 | Styling & animation | `animate-pulse` class established for attention indicators |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/navigation | 16.1.4 | usePathname for active state | Already used in BottomNav |
| next/link | 16.1.4 | Navigation | Already used in BottomNav |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind animate-pulse | Framer-motion custom animation | Framer-motion offers more control (scale + opacity) but animate-pulse is simpler and already established |
| API call for completion check | Direct Supabase query | API already exists (`/api/education/progress`), reuse it |
| Boolean `isLocked` prop | Object `lockReason` prop | Object provides more context for UI messaging |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── BottomNav.tsx              # MODIFY: Add Net Practice tab with indicator
│   └── education/
│       └── ModuleCard.tsx         # MODIFY: Add wallet-gated state with teaser
├── hooks/
│   └── useEducationStatus.ts      # NEW: Hook for education completion + wallet status
└── app/
    └── education/
        └── page.tsx               # No changes needed (existing)
```

### Pattern 1: Conditional Attention Indicator in BottomNav
**What:** Add a pulsing dot to a navigation item based on combined conditions
**When to use:** When menu item should draw attention only under specific circumstances
**Example:**
```typescript
// Source: Existing pattern in src/app/page.tsx line 164
// Pulsing indicator pattern: <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

// In BottomNav.tsx, add indicator logic:
const tabs = [
  { name: 'Markets', href: '/', icon: LayoutGrid },
  { name: 'AI Analyst', href: '/chat', icon: Bot },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Net Practice', href: '/education', icon: GraduationCap, showIndicator: true },
  { name: 'Settings', href: '/settings', icon: Settings },
];

// In tab render, conditionally show indicator:
{tab.showIndicator && shouldShowIndicator && (
  <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
)}
```

### Pattern 2: Education Status Hook
**What:** Custom hook combining education completion status and wallet connection
**When to use:** Determining whether to show attention indicator
**Example:**
```typescript
// src/hooks/useEducationStatus.ts
import { useState, useEffect } from 'react';
import { useTelegram } from './useTelegram';
import { useTonAddress } from '@tonconnect/ui-react';

interface EducationStatus {
  isEducationComplete: boolean;
  isWalletConnected: boolean;
  shouldShowIndicator: boolean;
  loading: boolean;
}

export function useEducationStatus(): EducationStatus {
  const { user } = useTelegram();
  const walletAddress = useTonAddress();
  const [isEducationComplete, setIsEducationComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const isWalletConnected = !!walletAddress;

  useEffect(() => {
    async function checkEducation() {
      if (!user?.id) return;
      try {
        // Check if module-1 is completed
        const res = await fetch(`/api/education/progress?userId=${user.id}&moduleId=module-1`);
        const data = await res.json();
        setIsEducationComplete(!!data.progress?.completed_at);
      } catch (err) {
        console.error('Education status check failed:', err);
      } finally {
        setLoading(false);
      }
    }
    checkEducation();
  }, [user?.id]);

  // Show indicator if education incomplete AND wallet not connected
  const shouldShowIndicator = !loading && !isEducationComplete && !isWalletConnected;

  return { isEducationComplete, isWalletConnected, shouldShowIndicator, loading };
}
```

### Pattern 3: Wallet-Gated ModuleCard with Teaser
**What:** Enhance ModuleCard to show different locked states (prerequisite vs wallet)
**When to use:** Modules 2 and 3 which require wallet connection
**Example:**
```typescript
// Source: Current ModuleCard.tsx, enhanced
interface ModuleCardProps {
  module: Module;
  progress: UserEducationProgress | null;
  isLocked: boolean;
  lockReason?: 'prerequisite' | 'wallet' | null;
  isWalletConnected?: boolean;
}

export default function ModuleCard({
  module,
  progress,
  isLocked,
  lockReason,
  isWalletConnected
}: ModuleCardProps) {
  // Determine if this is a wallet-gated lock
  const isWalletLocked = lockReason === 'wallet';

  const cardContent = (
    <div className={/* existing styling */}>
      {/* ... existing content ... */}

      {/* Teaser message for wallet-locked modules */}
      {isWalletLocked && (
        <div className="mt-2 flex items-center gap-1">
          <Wallet size={12} className="text-yellow-500/70" />
          <span className="text-[10px] text-yellow-500/70 font-medium">
            Connect wallet to unlock
          </span>
        </div>
      )}
    </div>
  );
  // ... rest of component
}
```

### Pattern 4: Lock Reason Computation in Education Page
**What:** Compute lock reason (prerequisite vs wallet) for each module
**When to use:** In education/page.tsx when rendering module list
**Example:**
```typescript
// In education/page.tsx
import { useTonAddress } from '@tonconnect/ui-react';

// ...inside component:
const walletAddress = useTonAddress();
const isWalletConnected = !!walletAddress;

// Compute lock state with reason
const computeLockState = (module: Module) => {
  // First check prerequisite
  if (module.prerequisiteModuleId) {
    const prereqProgress = progressMap[module.prerequisiteModuleId];
    if (!prereqProgress?.completed_at) {
      return { isLocked: true, lockReason: 'prerequisite' as const };
    }
  }

  // Then check wallet requirement for modules 2 and 3
  // (Module 1 doesn't require wallet to view, it teaches wallet connection)
  if (module.id !== 'module-1' && !isWalletConnected) {
    return { isLocked: true, lockReason: 'wallet' as const };
  }

  return { isLocked: false, lockReason: null };
};
```

### Anti-Patterns to Avoid
- **Hardcoding module IDs:** Use module.id checks, not array indices
- **Blocking Module 1 on wallet:** Module 1 TEACHES wallet connection, must remain accessible
- **Showing indicator when completed:** Only show when education incomplete AND no wallet
- **Calling API on every render:** Use effect with proper dependencies, consider caching

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pulsing animation | Custom keyframes | `animate-pulse` Tailwind class | Already established pattern, consistent |
| Wallet detection | Custom localStorage check | `useTonAddress()` hook | Reactive, handles all wallet states |
| Education completion check | New database query | Existing `/api/education/progress` | API already exists and handles auth |
| Navigation structure | Custom router | Next.js `Link` + `usePathname` | Existing BottomNav pattern |
| Lock icon | SVG or custom | `lucide-react` `Lock` | Already imported in ModuleCard |

**Key insight:** This phase is primarily UI enhancement work. All data sources (wallet status, education progress) already have hooks and APIs. The work is about conditional rendering and visual states, not new data fetching infrastructure.

## Common Pitfalls

### Pitfall 1: Indicator Shows for Authenticated Users Who Completed Education
**What goes wrong:** Users who finished Module 1 still see pulsing indicator
**Why it happens:** Completion check fails silently, defaults to showing indicator
**How to avoid:** Default `shouldShowIndicator` to false while loading; only show when explicitly determined
**Warning signs:** Indicator visible for users with `completed_at` in database

### Pitfall 2: Module 1 Becomes Inaccessible Without Wallet
**What goes wrong:** New users can't start education because they have no wallet
**Why it happens:** Wallet gating applied to all modules instead of just 2 and 3
**How to avoid:** Explicit check: `module.id !== 'module-1'` before wallet gating
**Warning signs:** Onboarding funnel drops to 0%

### Pitfall 3: BottomNav Re-renders Excessively Due to Hook
**What goes wrong:** Navigation flickers, poor performance
**Why it happens:** `useEducationStatus` hook causes re-renders on every wallet state change
**How to avoid:** Memoize the hook result, use stable dependencies, consider lifting state
**Warning signs:** React DevTools shows excessive BottomNav re-renders

### Pitfall 4: Pulsing Indicator Position Broken on Different Screen Sizes
**What goes wrong:** Indicator overlaps text or is cut off
**Why it happens:** Absolute positioning without proper container constraints
**How to avoid:** Use `relative` parent, test on various screen widths
**Warning signs:** Indicator invisible or overlapping on small screens

### Pitfall 5: Wallet-Locked Message Doesn't Trigger Wallet Connect
**What goes wrong:** User sees "Connect wallet to unlock" but no action happens when tapped
**Why it happens:** Message is just text, no click handler
**How to avoid:** Make the teaser clickable, trigger `useTonConnectUI().openModal()` on tap
**Warning signs:** Users tap teaser but nothing happens

### Pitfall 6: API Called Before User ID Available
**What goes wrong:** 400 error in console, completion check fails
**Why it happens:** Effect runs before Telegram user data loads
**How to avoid:** Guard clause: `if (!user?.id) return;`
**Warning signs:** Console errors about missing userId on page load

## Code Examples

Verified patterns from existing project code:

### Pulsing Attention Indicator (Established Pattern)
```typescript
// Source: src/app/page.tsx line 163-166
// "Early Access" badge with pulsing green dot

<div className="bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Early Access</span>
</div>
```

### Wallet Connection Detection (Established Pattern)
```typescript
// Source: src/hooks/useProgression.ts lines 20, 65-66
// Source: src/app/page.tsx line 16, 91

import { useTonAddress } from '@tonconnect/ui-react';

// In component:
const userFriendlyAddress = useTonAddress();
const isWalletConnected = !!userFriendlyAddress;
```

### Navigation Tab Structure (Established Pattern)
```typescript
// Source: src/components/BottomNav.tsx lines 11-16

const tabs = [
  { name: 'Markets', href: '/', icon: LayoutGrid },
  { name: 'AI Analyst', href: '/chat', icon: Bot },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Settings', href: '/settings', icon: Settings },
];
```

### Locked Module Visual Treatment (Established Pattern)
```typescript
// Source: src/components/education/ModuleCard.tsx lines 18-27, 48-52

// Conditional styling for locked state:
className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
  isLocked
    ? 'bg-white/[0.02] border-white/5 opacity-50'
    : /* other states */
}`}

// Lock icon in status area:
{isLocked ? (
  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
    <Lock size={16} className="text-white/30" />
  </div>
) : /* other states */}
```

### Progress API Fetch (Established Pattern)
```typescript
// Source: src/app/education/page.tsx lines 18-43

useEffect(() => {
  async function fetchProgress() {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/education/progress?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        // Process progress data...
      }
    } catch (error) {
      console.error('Error fetching education progress:', error);
    } finally {
      setIsLoading(false);
    }
  }
  fetchProgress();
}, [user?.id]);
```

### GraduationCap Icon Import
```typescript
// Source: lucide-react (already used in src/app/education/page.tsx)
import { GraduationCap } from 'lucide-react';
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS keyframe animations | Tailwind utility classes | Tailwind 2+ | Simpler, consistent |
| Prop drilling for wallet status | Context/hooks | React 16.8+ | Cleaner composition |
| Manual boolean flags | Discriminated unions | TypeScript adoption | Better type safety |

**Deprecated/outdated:**
- **None identified:** All patterns in the codebase are current and React 19 compatible

## Open Questions

Things that couldn't be fully resolved:

1. **Indicator Polling vs One-Time Check**
   - What we know: Current fetch happens once on mount
   - What's unclear: Should indicator update if user completes education in another tab?
   - Recommendation: Keep it simple (one-time check) for now; indicator disappears on next navigation anyway

2. **Module 2/3 "Coming Soon" vs "Wallet Locked"**
   - What we know: Modules 2 and 3 have empty slides arrays (`"slides": []`)
   - What's unclear: Are they truly ready but wallet-gated, or still in development?
   - Recommendation: Check slide content; if empty, show "Coming Soon" instead of wallet-lock teaser

3. **BottomNav Position Adjustment**
   - What we know: Currently 4 tabs, adding 5th will be tighter
   - What's unclear: Will 5 tabs fit comfortably on small screens?
   - Recommendation: Test on iPhone SE (320px), may need smaller text/icons or restructure

## Sources

### Primary (HIGH confidence)
- Existing codebase patterns:
  - `src/components/BottomNav.tsx` - Navigation structure and tab array
  - `src/components/education/ModuleCard.tsx` - Current lock implementation
  - `src/app/education/page.tsx` - Progress fetching and lock computation
  - `src/app/page.tsx` - Pulsing indicator pattern (line 164)
  - `src/hooks/useProgression.ts` - Wallet detection pattern
  - `src/data/education_modules.json` - Module structure and prerequisites

### Secondary (MEDIUM confidence)
- TonConnect React hooks documentation (useTonAddress behavior)
- Tailwind CSS animation utilities documentation

### Tertiary (LOW confidence)
- N/A - all patterns verified with existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already used with established patterns
- Architecture: HIGH - patterns derived from existing BottomNav, ModuleCard, and hook implementations
- Pitfalls: HIGH - based on observed code patterns and logical edge cases
- UI patterns: HIGH - animate-pulse and wallet detection patterns verified in multiple files

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable UI patterns, no external dependencies changing)
