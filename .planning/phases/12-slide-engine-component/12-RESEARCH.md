# Phase 12: Slide Engine Component - Research

**Researched:** 2026-02-03
**Domain:** React gestures, Framer Motion animations, Telegram haptic feedback, canvas-confetti
**Confidence:** HIGH

## Summary

This phase builds the SlideEngine component for navigating education module slides with swipe gestures, haptic feedback, and celebration effects. Research focused on four areas: swipe gesture handling, Telegram haptic API, slide transitions with AnimatePresence, and confetti animation patterns.

The project already has framer-motion (v12.27.5) and canvas-confetti (v1.9.4) installed, with established patterns for both. The Telegram WebApp SDK (@twa-dev/sdk v8.0.2) provides haptic feedback through `webApp.HapticFeedback.impactOccurred()`. Framer-motion's built-in `drag` prop combined with `AnimatePresence` provides the cleanest solution for swipeable slides without adding new dependencies.

**Primary recommendation:** Use framer-motion's native drag gesture with threshold detection (not @use-gesture/react) since framer-motion is already installed and provides swipe detection through `onDragEnd` with offset/velocity checks. Wrap slides in AnimatePresence with a direction-aware variant system for smooth enter/exit transitions.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | ^12.27.5 | Drag gestures + animations | Already installed, used throughout codebase |
| @twa-dev/sdk | ^8.0.2 | Telegram haptic feedback | Already installed, provides HapticFeedback API |
| canvas-confetti | ^1.9.4 | Celebration animation | Already installed, pattern in ProgressionCard.tsx |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React | 19.2.3 | Component framework | Base framework |
| TypeScript | ^5 | Type safety | Project standard |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| framer-motion drag | @use-gesture/react | Extra dependency, framer-motion already sufficient |
| Native touch events | framer-motion drag | More code, less smooth animations |
| CSS transitions | framer-motion | No exit animations, less control |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── education/
│       ├── SlideEngine.tsx        # Main slide carousel with gestures
│       ├── slides/
│       │   ├── IntroSlide.tsx     # Slide type renderers
│       │   ├── ConceptSlide.tsx
│       │   ├── QuizSlide.tsx
│       │   ├── ActionSlide.tsx
│       │   └── RewardSlide.tsx
│       └── SlideProgress.tsx      # Dot indicators
├── hooks/
│   └── useHapticFeedback.ts       # Telegram haptic wrapper
└── lib/
    └── educationTypes.ts          # Types from Phase 11
```

### Pattern 1: Framer Motion Drag with Swipe Detection
**What:** Use framer-motion's `drag="x"` with `onDragEnd` to detect swipes based on offset and velocity
**When to use:** For horizontal swipe navigation between slides
**Example:**
```typescript
// Source: framer-motion docs + dev.to carousel pattern
const SWIPE_THRESHOLD = 50; // pixels
const SWIPE_VELOCITY = 500; // pixels/second

function SlideEngine({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info;

    // Swipe left (next) - negative offset
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY) {
      if (currentIndex < slides.length - 1) {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
      }
    }
    // Swipe right (prev) - positive offset
    else if (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY) {
      if (currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  return (
    <AnimatePresence custom={direction} mode="wait">
      <motion.div
        key={currentIndex}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="active"
        exit="exit"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {/* Slide content */}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Pattern 2: Direction-Aware Slide Variants
**What:** AnimatePresence with custom prop for bidirectional slide animations
**When to use:** When slides should enter/exit from different directions based on navigation
**Example:**
```typescript
// Source: dev.to/satel/animated-carousel-with-framer-motion-2fp
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  active: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
  }),
};
```

### Pattern 3: Telegram Haptic Feedback Hook
**What:** Wrapper hook for Telegram WebApp haptic feedback with fallback
**When to use:** For all haptic feedback needs in the app
**Example:**
```typescript
// Source: Telegram WebApp docs - core.telegram.org/bots/webapps
import { useTelegram } from '@/hooks/useTelegram';

export function useHapticFeedback() {
  const { webApp } = useTelegram();

  const impactOccurred = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(style);
    }
  };

  const notificationOccurred = (type: 'success' | 'error' | 'warning') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  };

  return { impactOccurred, notificationOccurred };
}
```

### Pattern 4: Quiz Feedback with Haptics
**What:** Immediate visual + haptic feedback on quiz answer selection
**When to use:** For QuizSlide correct/incorrect feedback
**Example:**
```typescript
// Source: Requirements SLIDE-03, SLIDE-04
const handleQuizAnswer = (selectedId: string) => {
  const isCorrect = selectedId === slide.correctOptionId;
  setSelectedAnswer(selectedId);
  setShowResult(true);

  if (isCorrect) {
    // Light impact + confetti for correct
    impactOccurred('light');
    fireConfetti();
  } else {
    // Heavy impact for incorrect (no confetti)
    impactOccurred('heavy');
  }
};
```

### Pattern 5: Confetti Burst (Existing Pattern)
**What:** Fire confetti from both sides for celebration
**When to use:** On correct quiz answer, module completion
**Example:**
```typescript
// Source: src/components/ProgressionCard.tsx (existing pattern)
import confetti from 'canvas-confetti';

const fireConfetti = () => {
  const colors = ['#fbbf24', '#f59e0b', '#eab308', '#facc15'];

  // Left burst
  confetti({
    particleCount: 30,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.6 },
    colors,
  });

  // Right burst
  confetti({
    particleCount: 30,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.6 },
    colors,
  });
};
```

### Anti-Patterns to Avoid
- **Adding @use-gesture/react:** Framer-motion already handles drag gestures; don't add redundant dependencies
- **CSS-only transitions for exit animations:** CSS cannot animate unmounting components; use AnimatePresence
- **Mixing Tailwind transitions with framer-motion:** Remove `transition` class from elements animated by framer-motion
- **Checking webApp.HapticFeedback without null check:** Always check if webApp exists first (browser testing has no haptics)
- **Using onDrag instead of onDragEnd for pagination:** onDrag fires continuously; use onDragEnd for discrete navigation

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Swipe detection | Custom touch event handlers | framer-motion `drag` + `onDragEnd` | Handles all edge cases, smooth animations |
| Exit animations | CSS transitions with cleanup | AnimatePresence | React can't delay unmount; AnimatePresence can |
| Haptic feedback | Browser vibration API only | Telegram WebApp HapticFeedback | Telegram provides richer haptic patterns |
| Confetti | Custom particle system | canvas-confetti | Performant, configurable, already installed |
| Slide type rendering | Single component with if/else | Discriminated union switch | TypeScript exhaustiveness checking |

**Key insight:** The project already has all required dependencies installed. The patterns used in ProgressionCard.tsx (confetti) and spin/page.tsx (AnimatePresence) should be followed.

## Common Pitfalls

### Pitfall 1: AnimatePresence Without Key
**What goes wrong:** Slides don't animate on change, just swap instantly
**Why it happens:** AnimatePresence needs a changing `key` to detect mount/unmount
**How to avoid:** Always pass `key={currentIndex}` to the motion element inside AnimatePresence
**Warning signs:** No enter/exit animations, but animate state works

### Pitfall 2: Drag Constraints Too Loose
**What goes wrong:** User can drag slide completely off-screen
**Why it happens:** Missing or incorrect `dragConstraints`
**How to avoid:** Set `dragConstraints={{ left: 0, right: 0 }}` to snap back; use `dragElastic` for rubber-band feel
**Warning signs:** Slides disappear when dragged, don't return to position

### Pitfall 3: Direction State Not Updated Before Index
**What goes wrong:** Slides animate in wrong direction
**Why it happens:** Setting direction after index update; AnimatePresence uses stale direction
**How to avoid:** Always update direction BEFORE index in the same handler (or use functional updates)
**Warning signs:** Slides enter from left when swiping left (should enter from right)

### Pitfall 4: Haptic Feedback in Browser Testing
**What goes wrong:** TypeError or silent failure when testing outside Telegram
**Why it happens:** webApp.HapticFeedback is undefined in browser
**How to avoid:** Always check `if (webApp?.HapticFeedback)` before calling
**Warning signs:** Console errors about "Cannot read property of undefined"

### Pitfall 5: Quiz Answer Persists Across Retries
**What goes wrong:** User returns to quiz slide and sees previous answer highlighted
**Why it happens:** Selected answer state not reset when navigating
**How to avoid:** Reset quiz state when slide changes OR store per-slide state
**Warning signs:** Previously selected options still highlighted

### Pitfall 6: Confetti Z-Index Below Modal
**What goes wrong:** Confetti particles appear behind UI elements
**Why it happens:** canvas-confetti creates a fixed canvas; z-index conflicts
**How to avoid:** canvas-confetti defaults to z-index 100000; ensure no higher z-index elements
**Warning signs:** Confetti particles clipped or invisible

## Code Examples

Verified patterns from official sources and existing project code:

### Complete Slide Variants
```typescript
// Source: dev.to carousel pattern, verified with framer-motion docs
const X_OFFSET = 300; // pixels to slide

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? X_OFFSET : -X_OFFSET,
    opacity: 0,
  }),
  active: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1], // iOS-like easing
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -X_OFFSET : X_OFFSET,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
};
```

### Telegram Haptic Feedback Usage
```typescript
// Source: core.telegram.org/bots/webapps - HapticFeedback section
// Impact styles: light, medium, heavy, rigid, soft
// Notification types: success, error, warning

// For correct quiz answer (SLIDE-03 requirement)
webApp.HapticFeedback.impactOccurred('light');

// For incorrect quiz answer (SLIDE-03 requirement)
webApp.HapticFeedback.impactOccurred('heavy');

// For successful action completion
webApp.HapticFeedback.notificationOccurred('success');
```

### Discriminated Union Slide Renderer
```typescript
// Source: TypeScript handbook + Phase 11 educationTypes.ts
import type { Slide } from '@/lib/educationTypes';

function SlideRenderer({ slide }: { slide: Slide }) {
  switch (slide.type) {
    case 'intro':
      return <IntroSlide {...slide} />;
    case 'concept':
      return <ConceptSlide {...slide} />;
    case 'quiz':
      return <QuizSlide {...slide} />;
    case 'action':
      return <ActionSlide {...slide} />;
    case 'reward':
      return <RewardSlide {...slide} />;
    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = slide;
      return _exhaustive;
  }
}
```

### Confetti with Custom Origin
```typescript
// Source: canvas-confetti npm docs + existing ProgressionCard.tsx pattern
import confetti from 'canvas-confetti';

// Quiz correct answer celebration
const celebrateCorrectAnswer = () => {
  const colors = ['#22c55e', '#16a34a', '#15803d']; // Green theme

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { x: 0.5, y: 0.7 }, // Center-bottom
    colors,
    startVelocity: 30,
    gravity: 1.2,
  });
};

// Module completion celebration (larger burst)
const celebrateModuleComplete = () => {
  const colors = ['#fbbf24', '#f59e0b', '#eab308', '#facc15'];
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};
```

### Drag Gesture Integration
```typescript
// Source: framer-motion gesture docs + verified carousel patterns
<motion.div
  key={currentIndex}
  custom={direction}
  variants={slideVariants}
  initial="enter"
  animate="active"
  exit="exit"
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.2}
  onDragEnd={(event, info) => {
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;

    if (swipe) {
      const isSwipeLeft = offset.x < 0;
      if (isSwipeLeft && currentIndex < slides.length - 1) {
        setDirection(1);
        setCurrentIndex(i => i + 1);
      } else if (!isSwipeLeft && currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex(i => i - 1);
      }
    }
  }}
  className="w-full touch-pan-y" // Allow vertical scroll
>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Touch Events | framer-motion gestures | framer-motion v4+ | Built-in physics, spring animations |
| mode="sync" (default) | mode="wait" | framer-motion v10+ | Clean sequential transitions |
| Browser Vibration API | Telegram HapticFeedback | TWA SDK v6.1+ | Richer haptic patterns (5 impact styles) |
| Custom particle systems | canvas-confetti | 2020+ | GPU-accelerated, zero config |

**Deprecated/outdated:**
- **react-swipeable:** Still works but unnecessary when framer-motion already installed
- **AnimatePresence exitBeforeEnter:** Renamed to `mode="wait"` in framer-motion v5+

## Open Questions

Things that couldn't be fully resolved:

1. **Quiz retry behavior**
   - What we know: User can see correct/incorrect feedback
   - What's unclear: Can user retry a quiz? Does progress block on wrong answer?
   - Recommendation: Allow continue after feedback delay; track first-attempt correctness for analytics

2. **Action slide completion detection**
   - What we know: ActionSlide has actionType: 'wallet_connect' | 'channel_join'
   - What's unclear: How to detect wallet connection completion in SlideEngine
   - Recommendation: Use existing useTonConnectUI hook, poll connection status, or use callback from TonConnect

3. **Slide progress persistence**
   - What we know: Phase 11 created user_education_progress table
   - What's unclear: When to persist (every slide? only on completion?)
   - Recommendation: Persist on module completion only; use local state during session (Phase 13/14 scope)

## Sources

### Primary (HIGH confidence)
- [Telegram WebApp HapticFeedback](https://core.telegram.org/bots/webapps) - Official API documentation for impactOccurred and notificationOccurred
- [framer-motion Gestures](https://motion.dev/motion/gestures/) - Official drag gesture documentation
- [canvas-confetti npm](https://www.npmjs.com/package/canvas-confetti) - Official API for customization options
- Existing codebase patterns:
  - `src/components/ProgressionCard.tsx` - confetti burst pattern
  - `src/app/spin/page.tsx` - AnimatePresence with mode="wait"
  - `src/hooks/useTelegram.tsx` - WebApp access pattern

### Secondary (MEDIUM confidence)
- [Animated Carousel with Framer Motion](https://dev.to/satel/animated-carousel-with-framer-motion-2fp) - Direction-aware variant pattern, verified against framer-motion docs
- [framer-carousel demo](https://framer-carousel.vercel.app/) - Swipe threshold implementation pattern

### Tertiary (LOW confidence)
- N/A - all patterns verified with primary sources or existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed, versions verified in package.json
- Architecture: HIGH - patterns verified with existing codebase usage
- Pitfalls: HIGH - derived from framer-motion documentation and practical experience
- Haptic feedback: HIGH - verified with official Telegram WebApp documentation

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - framer-motion and Telegram SDK are stable)
