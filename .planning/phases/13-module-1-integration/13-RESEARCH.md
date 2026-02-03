# Phase 13: Module 1 Integration - Research

**Researched:** 2026-02-03
**Domain:** Module integration, wallet connection, points system, progress persistence, badge system
**Confidence:** HIGH

## Summary

This phase wires up the Module 1 content from Phase 11 to the SlideEngine from Phase 12, integrating with existing systems for wallet connection, points awarding, and progress tracking. Research focused on five key areas: (1) how to trigger TonConnect wallet connection from within the education flow, (2) how to award points via the existing points engine, (3) how to persist progress to the database, (4) where badges are stored and how to display them, and (5) how to structure the education page hierarchy.

The codebase has established patterns for all required integrations. TonConnect is triggered via `useTonConnectUI().openModal()` (pattern in WalletGateModal.tsx). Points are awarded via `awardPoints()` from pointsEngine.ts which requires adding a new reason type. Progress is stored in `user_education_progress` with `badge_earned` boolean already present. The module list view does not exist yet and must be created.

**Primary recommendation:** Create an `/education` route with ModuleListPage showing all modules with progress/badges, and a `/education/[moduleId]` dynamic route that wraps SlideEngine. Use existing patterns: `useTonConnectUI` for wallet action, `awardPoints()` with new 'education_complete' reason for points, and `supabaseAdmin` for progress CRUD.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tonconnect/ui-react | ^2.0.16 | Wallet connection | Already installed, useTonConnectUI pattern established |
| supabaseAdmin | N/A | Progress CRUD | Service-role access for RLS-protected table |
| pointsEngine.ts | N/A | Points awarding | Centralized points system, used by wallet/verify |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| framer-motion | ^12.27.5 | Page transitions | Route transitions, consistent with app |
| useTelegram | N/A | User ID | Get telegram_id for progress tracking |
| useTonAddress | N/A | Wallet status check | Detect wallet connection for ActionSlide |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dynamic route [moduleId] | Query param ?module= | Dynamic route cleaner, more Next.js idiomatic |
| API route for progress | Direct client supabase | RLS has no public policies; must use service role |
| New points reason | Reuse existing | Clarity in analytics; 'education_complete' is distinct |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── education/
│       ├── page.tsx                    # ModuleListPage - shows all modules with progress/badges
│       └── [moduleId]/
│           └── page.tsx                # ModulePage - wraps SlideEngine for specific module
├── components/
│   └── education/
│       ├── ModuleCard.tsx              # Module card showing title, progress, badge
│       ├── SlideEngine.tsx             # (Phase 12 - exists)
│       └── slides/                     # (Phase 12 - exists)
└── app/
    └── api/
        └── education/
            ├── progress/
            │   └── route.ts            # GET/POST for progress CRUD
            └── complete/
                └── route.ts            # POST for module completion (points + badge)
```

### Pattern 1: TonConnect Wallet Action in ActionSlide
**What:** Trigger TonConnect modal from within ActionSlide when actionType is 'wallet_connect'
**When to use:** When user reaches the wallet connect action slide
**Example:**
```typescript
// Source: Existing pattern in WalletGateModal.tsx
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

function ActionSlideComponent({ slide, onActionComplete }: ActionSlideComponentProps) {
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const isConnected = !!userFriendlyAddress;

  const handleActionClick = () => {
    if (slide.actionType === 'wallet_connect') {
      if (isConnected) {
        // Already connected, proceed
        onActionComplete?.();
      } else {
        // Open TonConnect modal
        tonConnectUI.openModal();
      }
    }
  };

  // Monitor connection status to auto-advance
  useEffect(() => {
    if (slide.actionType === 'wallet_connect' && isConnected) {
      onActionComplete?.();
    }
  }, [isConnected, slide.actionType, onActionComplete]);

  return (
    <div>
      {/* ... */}
      <button onClick={handleActionClick}>
        {isConnected ? 'Continue' : slide.buttonText}
      </button>
    </div>
  );
}
```

### Pattern 2: Progress API with Service Role
**What:** API route that uses supabaseAdmin for reading/writing progress
**When to use:** All education progress operations (RLS has no public policies)
**Example:**
```typescript
// src/app/api/education/progress/route.ts
// Source: Existing pattern in /api/wallet/verify/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const moduleId = searchParams.get('moduleId');

  const { data, error } = await supabaseAdmin
    .from('user_education_progress')
    .select('*')
    .eq('user_id', Number(userId))
    .eq('module_id', moduleId)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found is ok
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data });
}

export async function POST(request: Request) {
  const { userId, moduleId, slideIndex } = await request.json();

  const { data, error } = await supabaseAdmin
    .from('user_education_progress')
    .upsert({
      user_id: Number(userId),
      module_id: moduleId,
      slide_index: slideIndex,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,module_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data });
}
```

### Pattern 3: Module Completion with Points and Badge
**What:** API route that marks module complete, awards points, and grants badge
**When to use:** When user reaches the final (reward) slide
**Example:**
```typescript
// src/app/api/education/complete/route.ts
// Source: pointsEngine.ts pattern + existing awardPoints usage
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { awardPoints, PointReason } from '@/lib/pointsEngine';

export async function POST(request: Request) {
  const { userId, moduleId, pointsAmount, badgeId } = await request.json();

  // 1. Check if already completed (prevent double-awarding)
  const { data: existing } = await supabaseAdmin
    .from('user_education_progress')
    .select('completed_at')
    .eq('user_id', Number(userId))
    .eq('module_id', moduleId)
    .single();

  if (existing?.completed_at) {
    return NextResponse.json({ success: true, message: 'Already completed' });
  }

  // 2. Mark module as completed with badge
  const { error: updateError } = await supabaseAdmin
    .from('user_education_progress')
    .upsert({
      user_id: Number(userId),
      module_id: moduleId,
      completed_at: new Date().toISOString(),
      badge_earned: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,module_id' });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 3. Award points (requires adding 'education_complete' to PointReason type)
  try {
    await awardPoints(userId, pointsAmount, 'education_complete' as PointReason, {
      module_id: moduleId,
      badge_id: badgeId
    });
  } catch (err: any) {
    console.error('Points award error:', err);
    // Don't fail the whole request - points are secondary
  }

  return NextResponse.json({ success: true });
}
```

### Pattern 4: SlideEngine with Callbacks
**What:** Extend SlideEngine to accept callbacks for slide changes, actions, and completion
**When to use:** Connecting SlideEngine to page-level logic
**Example:**
```typescript
// Updated SlideEngine props
interface SlideEngineProps {
  slides: Slide[];
  initialSlideIndex?: number;          // For resume functionality
  onSlideChange?: (index: number) => void;
  onActionRequest?: (actionType: ActionType) => void;
  onComplete?: () => void;
}

// In ModulePage
function ModulePage({ moduleId }: { moduleId: string }) {
  const [tonConnectUI] = useTonConnectUI();
  const { user } = useTelegram();

  const handleSlideChange = async (index: number) => {
    // Persist progress
    await fetch('/api/education/progress', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, moduleId, slideIndex: index })
    });
  };

  const handleActionRequest = (actionType: ActionType) => {
    if (actionType === 'wallet_connect') {
      tonConnectUI.openModal();
    }
  };

  const handleComplete = async () => {
    await fetch('/api/education/complete', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        moduleId,
        pointsAmount: module.totalPoints,
        badgeId: module.badgeId
      })
    });
    // Navigate back to module list
    router.push('/education');
  };

  return (
    <SlideEngine
      slides={module.slides}
      initialSlideIndex={progress?.slide_index || 0}
      onSlideChange={handleSlideChange}
      onActionRequest={handleActionRequest}
      onComplete={handleComplete}
    />
  );
}
```

### Pattern 5: Module List with Progress and Badges
**What:** ModuleListPage showing all modules with completion status and earned badges
**When to use:** Main education landing page
**Example:**
```typescript
// Source: Existing ProgressionCard.tsx pattern
function ModuleCard({ module, progress }: ModuleCardProps) {
  const isCompleted = !!progress?.completed_at;
  const hasBadge = progress?.badge_earned;

  return (
    <Link
      href={module.isLocked ? '#' : `/education/${module.id}`}
      className={module.isLocked ? 'opacity-50 pointer-events-none' : ''}
    >
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{module.icon}</span>
          <div className="flex-1">
            <h3 className="text-white font-bold">{module.title}</h3>
            <p className="text-white/50 text-sm">{module.description}</p>
          </div>
          {hasBadge && (
            <div className="bg-amber-500/20 px-2 py-1 rounded-full">
              <span className="text-amber-400 text-xs">{module.badgeName}</span>
            </div>
          )}
          {isCompleted ? (
            <Check className="text-green-500" />
          ) : module.isLocked ? (
            <Lock className="text-white/30" />
          ) : (
            <ChevronRight className="text-white/30" />
          )}
        </div>
      </div>
    </Link>
  );
}
```

### Anti-Patterns to Avoid
- **Calling awardPoints from client:** Points engine requires service role; always use API route
- **Polling for wallet connection:** Use useTonAddress reactively, not intervals
- **Persisting every slide in real-time:** Only persist meaningful checkpoints (completion, module switch)
- **Storing badge names in database:** Badge names come from JSON; database only stores badge_earned boolean
- **Creating separate badge table:** Overkill for 3 modules; badge_earned per progress row is sufficient

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Wallet connection | Custom wallet flow | useTonConnectUI().openModal() | TonConnect handles all wallet types, QR codes, etc. |
| Points awarding | Direct DB update | awardPoints() from pointsEngine.ts | Triggers leaderboard updates, consistent logging |
| User identification | Session/cookie | useTelegram().user.id | Telegram provides authenticated user ID |
| Progress deduplication | Manual checks | UNIQUE constraint + upsert | Database handles race conditions |
| Module content | Fetch from API | Import education_modules.json | Static JSON is faster, simpler for 3 modules |

**Key insight:** This phase is primarily integration work. Every system (TonConnect, points, database, JSON content) already exists and has established patterns. Follow those patterns rather than inventing new ones.

## Common Pitfalls

### Pitfall 1: Double Points Award on Completion
**What goes wrong:** User receives 1400 points instead of 700 (awarded twice)
**Why it happens:** Race condition if complete button clicked twice, or page refreshed after completion
**How to avoid:** Check `completed_at` before awarding; idempotent API design
**Warning signs:** Points balance jumps unexpectedly, completed_at timestamp exists but points awarded again

### Pitfall 2: Wallet Connection Not Detected in ActionSlide
**What goes wrong:** User connects wallet but ActionSlide doesn't update, can't proceed
**Why it happens:** useTonAddress hook not re-rendering, or stale closure
**How to avoid:** Use useEffect with useTonAddress dependency; trigger callback when address appears
**Warning signs:** User stuck on action slide after successfully connecting wallet

### Pitfall 3: Progress Lost on Browser Close
**What goes wrong:** User completes slides, closes app, returns to slide 0
**Why it happens:** Progress only in React state, not persisted to database
**How to avoid:** Call progress API on significant events (slide change, completion); load initial state from API
**Warning signs:** slide_index in database remains 0 despite user progress

### Pitfall 4: TonConnect Modal Z-Index Conflict
**What goes wrong:** TonConnect modal appears behind slide content or is not clickable
**Why it happens:** SlideEngine has high z-index, TonConnect modal rendered at same level
**How to avoid:** Ensure TonConnect modal appears above all UI (check TonProvider placement in app layout)
**Warning signs:** Modal visible but button clicks don't register

### Pitfall 5: pointsEngine.ts Missing 'education_complete' Reason
**What goes wrong:** TypeScript error when calling awardPoints with 'education_complete'
**Why it happens:** PointReason type doesn't include the new reason
**How to avoid:** Add 'education_complete' to PointReason union type BEFORE calling
**Warning signs:** Type error: Argument of type '"education_complete"' is not assignable

### Pitfall 6: User Returns to Completed Module, Re-triggers Completion
**What goes wrong:** User navigates to completed module, onComplete fires again
**Why it happens:** SlideEngine calls onComplete at last slide regardless of prior completion
**How to avoid:** Check completion status before rendering SlideEngine; show completion summary instead
**Warning signs:** API logs show multiple complete calls for same user/module

## Code Examples

Verified patterns from existing project code:

### Adding New Points Reason
```typescript
// src/lib/pointsEngine.ts - add to union type
export type PointReason =
  | 'referral'
  | 'daily_spin'
  | 'daily_login'
  | 'wallet_connect'
  | 'channel_join'
  | 'prediction_win'
  | 'admin_adjustment'
  | 'welcome_bonus'
  | 'education_complete';  // NEW
```

### Loading Progress on Page Mount
```typescript
// Source: Existing pattern in useProgression.ts
useEffect(() => {
  async function loadProgress() {
    if (!user) return;
    try {
      const res = await fetch(`/api/education/progress?userId=${user.id}&moduleId=${moduleId}`);
      const data = await res.json();
      if (data.progress) {
        setInitialSlideIndex(data.progress.slide_index);
        setIsCompleted(!!data.progress.completed_at);
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  }
  loadProgress();
}, [user, moduleId]);
```

### Wallet Connection Detection in ActionSlide
```typescript
// Source: Existing useTonAddress pattern in multiple components
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';

function ActionSlideComponent({ slide, onActionComplete }: Props) {
  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const isConnected = !!userFriendlyAddress;
  const hasTriggeredComplete = useRef(false);

  // Auto-advance when wallet connects
  useEffect(() => {
    if (slide.actionType === 'wallet_connect' && isConnected && !hasTriggeredComplete.current) {
      hasTriggeredComplete.current = true;
      onActionComplete?.();
    }
  }, [isConnected, slide.actionType, onActionComplete]);

  const handleClick = () => {
    if (slide.actionType === 'wallet_connect' && !isConnected) {
      tonConnectUI.openModal();
    } else {
      onActionComplete?.();
    }
  };

  return (
    <button onClick={handleClick}>
      {isConnected ? 'Continue' : slide.buttonText}
    </button>
  );
}
```

### Module List with All Progress
```typescript
// Fetching all module progress for a user
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  const { data, error } = await supabaseAdmin
    .from('user_education_progress')
    .select('module_id, slide_index, completed_at, badge_earned')
    .eq('user_id', Number(userId));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert to map for easy lookup
  const progressMap: Record<string, UserEducationProgress> = {};
  data?.forEach(p => { progressMap[p.module_id] = p; });

  return NextResponse.json({ progress: progressMap });
}
```

### Upsert Progress Pattern
```typescript
// Source: PostgreSQL upsert pattern used in project
// The UNIQUE constraint on (user_id, module_id) enables this
const { data, error } = await supabaseAdmin
  .from('user_education_progress')
  .upsert({
    user_id: Number(userId),
    module_id: moduleId,
    slide_index: slideIndex,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id,module_id',  // Match the unique constraint
    ignoreDuplicates: false            // Update existing row
  })
  .select()
  .single();
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Callback props for all events | React hooks + context | React 16.8+ | Cleaner component composition |
| Manual wallet polling | useTonAddress reactive hook | TonConnect v2+ | Automatic updates on connection |
| Pages router getServerSideProps | App router server components | Next.js 13+ | Simpler data loading patterns |
| Class-based async state | async/await in useEffect | ES2017+ | Cleaner async handling |

**Deprecated/outdated:**
- **Direct Supabase client queries for protected data:** Service role required due to RLS policies
- **Storing points in component state then syncing:** Always go through pointsEngine for consistency

## Open Questions

Things that couldn't be fully resolved:

1. **Slide-level vs Module-level Progress Persistence**
   - What we know: Database has slide_index column
   - What's unclear: Should every slide change trigger API call, or only on pause/completion?
   - Recommendation: Persist on significant events only (completion, app minimize) to reduce API calls; use local state during active session

2. **Action Slide Blocking vs Non-Blocking**
   - What we know: ActionSlide has 'wallet_connect' actionType
   - What's unclear: Should user be prevented from advancing until action complete?
   - Recommendation: Block advancement - the purpose is to ensure wallet is connected before earning badge/points

3. **Module 2+ Unlocking Logic**
   - What we know: Module 2 has `prerequisiteModuleId: "module-1"` and `isLocked: true`
   - What's unclear: Is isLocked read from JSON or computed from progress?
   - Recommendation: Compute dynamically - check if prerequisite module has `completed_at` set. JSON `isLocked` is just initial/default state for users who haven't started.

4. **Badge Display Location**
   - What we know: Success criteria says "badges visible in module list view"
   - What's unclear: Should badges also appear elsewhere (profile, leaderboard)?
   - Recommendation: Start with module list only (Phase 13 scope); extend to profile in future phase if needed

## Sources

### Primary (HIGH confidence)
- Existing codebase patterns:
  - `src/components/WalletGateModal.tsx` - TonConnect modal trigger pattern
  - `src/app/api/wallet/verify/route.ts` - Points awarding + database update pattern
  - `src/lib/pointsEngine.ts` - awardPoints function signature and usage
  - `src/hooks/useProgression.ts` - Progress fetching and state management
  - `src/components/ProgressionCard.tsx` - UI pattern for showing completion status
  - `supabase/migrations/20260203212020_user_education_progress.sql` - Database schema
  - `.planning/phases/11-data-model-content/11-RESEARCH.md` - Type definitions and patterns
  - `.planning/phases/12-slide-engine-component/12-RESEARCH.md` - SlideEngine architecture

### Secondary (MEDIUM confidence)
- TonConnect documentation for useTonAddress behavior
- Next.js App Router documentation for dynamic routes

### Tertiary (LOW confidence)
- N/A - all patterns verified with existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already used in codebase with established patterns
- Architecture: HIGH - patterns derived directly from existing code (WalletGateModal, wallet/verify, pointsEngine)
- Pitfalls: HIGH - based on observed patterns and database constraints
- Integration points: HIGH - every integration point has existing analogous code

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable integration patterns, no external dependencies changing)
