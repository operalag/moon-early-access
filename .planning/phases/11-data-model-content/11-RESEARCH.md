# Phase 11: Data Model & Content - Research

**Researched:** 2026-02-03
**Domain:** Supabase schema design, TypeScript type modeling, static JSON content
**Confidence:** HIGH

## Summary

This phase establishes the foundation for education modules with three deliverables: a Supabase database table for tracking user progress, a static JSON file for module content, and TypeScript types defining the data structures.

The research found that the existing project patterns provide clear templates to follow. The codebase uses Supabase migrations with RLS enabled, defines TypeScript interfaces inline (no auto-generated types), and uses the `resolveJsonModule` compiler option for direct JSON imports. The education module content will use a discriminated union pattern for slide variants, which provides exhaustive type checking and excellent IDE support.

**Primary recommendation:** Follow existing project patterns - create a migration for `user_education_progress`, define slide types as a discriminated union with `type` as discriminator, and place `education_modules.json` in `src/data/` for direct import.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Supabase | ^2.91.0 | Database + Auth | Already in use, matches project patterns |
| TypeScript | ^5 | Type safety | Project standard, `resolveJsonModule: true` enabled |
| Next.js | 16.1.4 | App framework | Server components can import JSON directly |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Supabase CLI | 2.75.1 | Migrations | Creating new table migration |
| date-fns | ^4.1.0 | Timestamps | Already used for date formatting |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static JSON | CMS (Sanity, Contentful) | Overkill for 3 modules; static is simpler |
| Inline types | supabase gen types | Project doesn't use auto-gen; keep consistent |
| UUID primary key | BIGINT identity | UUID matches campaign_attributions pattern |

**Installation:**
```bash
# No new packages needed - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── data/
│   └── education_modules.json    # Static module content
├── lib/
│   └── educationTypes.ts         # TypeScript type definitions
└── app/
    └── api/
        └── education/            # Future API routes (Phase 12+)

supabase/
└── migrations/
    └── YYYYMMDDHHMMSS_user_education_progress.sql
```

### Pattern 1: Discriminated Union for Slide Variants
**What:** Use a `type` field as discriminator to differentiate slide variants (intro, concept, quiz, action, reward)
**When to use:** When you have multiple related types that share some properties but have variant-specific fields
**Example:**
```typescript
// Source: TypeScript handbook - Discriminated Unions
// https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html

type SlideBase = {
  id: string;
  title: string;
};

type IntroSlide = SlideBase & {
  type: 'intro';
  body: string;
  mascotImage?: string;
};

type ConceptSlide = SlideBase & {
  type: 'concept';
  body: string;
  diagram?: string;
};

type QuizSlide = SlideBase & {
  type: 'quiz';
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
};

type ActionSlide = SlideBase & {
  type: 'action';
  instruction: string;
  actionType: 'wallet_connect' | 'channel_join';
  buttonText: string;
};

type RewardSlide = SlideBase & {
  type: 'reward';
  body: string;
  pointsAwarded: number;
  badgeId: string;
  badgeName: string;
};

type Slide = IntroSlide | ConceptSlide | QuizSlide | ActionSlide | RewardSlide;
```

### Pattern 2: Progress Table with Composite Key
**What:** Track user progress per module with a composite unique constraint on (user_id, module_id)
**When to use:** When each user can have exactly one progress record per module
**Example:**
```sql
-- Source: Existing project pattern (campaign_attributions.sql)
CREATE TABLE public.user_education_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL,
  module_id TEXT NOT NULL,
  slide_index INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  badge_earned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One progress record per user per module
  CONSTRAINT user_education_progress_user_module_key UNIQUE (user_id, module_id)
);
```

### Pattern 3: Module JSON Structure
**What:** Static JSON with modules array, each containing metadata and slides array
**When to use:** When content is updated infrequently and needs no CMS
**Example:**
```typescript
// Source: Project pattern - direct JSON import with resolveJsonModule
type Module = {
  id: string;
  title: string;
  description: string;
  icon: string;
  totalPoints: number;
  badgeId: string;
  badgeName: string;
  isLocked: boolean;
  prerequisiteModuleId: string | null;
  slides: Slide[];
};

type EducationModulesData = {
  version: string;
  modules: Module[];
};
```

### Anti-Patterns to Avoid
- **Storing slide content in database:** Content is static; database adds latency and complexity for no benefit
- **Mixing authenticated and service-role queries:** Progress updates should use supabaseAdmin for consistency with points system
- **Generic JSON column for progress:** Use explicit columns (slide_index, completed_at, badge_earned) for queryability
- **Auto-incrementing slide IDs:** Use semantic IDs like "module-1-slide-3" for easier debugging

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON type safety | Runtime validation | TypeScript + discriminated unions | Compile-time checking, IDE autocomplete |
| User ID from Telegram | Custom extraction | Use existing user.id from useTelegram hook | Consistent with project patterns |
| Points awarding | Direct DB update | awardPoints() from pointsEngine.ts | Centralizes logic, updates leaderboards |
| Date formatting | Manual string building | date-fns (already installed) | Handles edge cases, timezone-aware |

**Key insight:** The project already has established patterns for user identification (Telegram ID as BIGINT), points (pointsEngine.ts), and database access (supabaseAdmin for server-side). Reuse these.

## Common Pitfalls

### Pitfall 1: Forgetting RLS Policies
**What goes wrong:** Table created but no policies = all queries return empty results
**Why it happens:** RLS enabled but SELECT/INSERT/UPDATE policies missing
**How to avoid:** Always add policies immediately after enabling RLS; test with both anon and authenticated roles
**Warning signs:** Queries return empty arrays but data exists in Supabase dashboard

### Pitfall 2: Using auth.uid() When Users Aren't Supabase Auth Users
**What goes wrong:** auth.uid() returns null because users are authenticated via Telegram, not Supabase Auth
**Why it happens:** Project uses Telegram ID (BIGINT) as user identifier, not Supabase UUID
**How to avoid:** Use service role (supabaseAdmin) for all progress operations; client never directly queries progress table
**Warning signs:** RLS policies that reference auth.uid() always fail

### Pitfall 3: Quiz Answer Stored in Client-Visible JSON
**What goes wrong:** Users can inspect JSON to find correct answers
**Why it happens:** education_modules.json is bundled with client code
**How to avoid:** This is acceptable for educational content (not a competition); answers shown after selection anyway
**Warning signs:** N/A - this is a design tradeoff, not a bug

### Pitfall 4: Module 2/3 Content Missing Causes Runtime Errors
**What goes wrong:** JSON parsing fails or slides array is undefined
**Why it happens:** Module 2/3 are placeholders with no slides yet
**How to avoid:** Always include empty slides array `[]` for locked modules; TypeScript catches missing required fields
**Warning signs:** TypeScript errors about undefined slides property

### Pitfall 5: Inconsistent User ID Types
**What goes wrong:** Type mismatch between Telegram ID (number) and database (BIGINT)
**Why it happens:** TypeScript treats them as different types
**How to avoid:** Always cast to number before database operations (matches pointsEngine pattern)
**Warning signs:** TypeScript errors about number vs bigint

## Code Examples

Verified patterns from official sources and existing project code:

### Creating Migration File
```bash
# Source: Supabase CLI docs
# https://supabase.com/docs/reference/cli/supabase-gen-types
npx supabase migration new user_education_progress
# Creates: supabase/migrations/YYYYMMDDHHMMSS_user_education_progress.sql
```

### Migration SQL (Full)
```sql
-- Source: Existing project pattern (campaign_attributions.sql)
-- User Education Progress Table
-- Tracks each user's progress through education modules

CREATE TABLE public.user_education_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL,
  module_id TEXT NOT NULL,
  slide_index INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  badge_earned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One progress record per user per module
  CONSTRAINT user_education_progress_user_module_key UNIQUE (user_id, module_id)
);

-- Index for user lookups (most common query)
CREATE INDEX idx_user_education_progress_user_id
  ON public.user_education_progress(user_id);

-- Index for completion queries
CREATE INDEX idx_user_education_progress_completed
  ON public.user_education_progress(completed_at)
  WHERE completed_at IS NOT NULL;

-- Enable RLS (admin-only access via service role)
ALTER TABLE public.user_education_progress ENABLE ROW LEVEL SECURITY;

-- No public policies - all access via supabaseAdmin (service role)
-- This ensures only server-side API can read/write progress data
```

### TypeScript Types (educationTypes.ts)
```typescript
// Source: TypeScript handbook discriminated unions + project patterns

// Slide variants using discriminated union
export type SlideBase = {
  id: string;
  title: string;
};

export type IntroSlide = SlideBase & {
  type: 'intro';
  body: string;
  mascotImage?: string;
};

export type ConceptSlide = SlideBase & {
  type: 'concept';
  body: string;
  diagram?: string;
};

export type QuizSlide = SlideBase & {
  type: 'quiz';
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
};

export type ActionSlide = SlideBase & {
  type: 'action';
  instruction: string;
  actionType: 'wallet_connect' | 'channel_join';
  buttonText: string;
};

export type RewardSlide = SlideBase & {
  type: 'reward';
  body: string;
  pointsAwarded: number;
  badgeId: string;
  badgeName: string;
};

export type Slide = IntroSlide | ConceptSlide | QuizSlide | ActionSlide | RewardSlide;

// Module structure
export type Module = {
  id: string;
  title: string;
  description: string;
  icon: string;
  totalPoints: number;
  badgeId: string;
  badgeName: string;
  isLocked: boolean;
  prerequisiteModuleId: string | null;
  slides: Slide[];
};

export type EducationModulesData = {
  version: string;
  modules: Module[];
};

// Database row type (matches migration)
export type UserEducationProgress = {
  id: string;
  user_id: number;
  module_id: string;
  slide_index: number;
  completed_at: string | null;
  badge_earned: boolean;
  created_at: string;
  updated_at: string;
};
```

### JSON Import Pattern
```typescript
// Source: Project tsconfig.json has resolveJsonModule: true
import educationData from '@/data/education_modules.json';
import type { EducationModulesData } from '@/lib/educationTypes';

// Type assertion for imported JSON
const modules = educationData as EducationModulesData;
```

### Exhaustive Type Switch
```typescript
// Source: TypeScript handbook - exhaustiveness checking
function renderSlide(slide: Slide) {
  switch (slide.type) {
    case 'intro':
      return <IntroSlideComponent {...slide} />;
    case 'concept':
      return <ConceptSlideComponent {...slide} />;
    case 'quiz':
      return <QuizSlideComponent {...slide} />;
    case 'action':
      return <ActionSlideComponent {...slide} />;
    case 'reward':
      return <RewardSlideComponent {...slide} />;
    default:
      // TypeScript will error if we miss a case
      const _exhaustive: never = slide;
      return _exhaustive;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router getStaticProps | App Router Server Components | Next.js 13+ | Direct imports work in server components |
| Manual type guards | Discriminated unions | TypeScript 2.0+ | Compiler handles narrowing automatically |
| UUID v4 | gen_random_uuid() | PostgreSQL 13+ | Built-in, no extension needed |

**Deprecated/outdated:**
- **getStaticProps for JSON:** Not needed in App Router; use direct imports in Server Components
- **Manual RLS for every query:** Project uses service role; RLS is backup security layer

## Open Questions

Things that couldn't be fully resolved:

1. **Badge Storage Location**
   - What we know: badgeId and badgeName stored in JSON per module
   - What's unclear: Should badges be a separate database table for extensibility?
   - Recommendation: Keep in JSON for now; extract if badge system grows beyond modules

2. **Points Distribution Within Module**
   - What we know: Total ~700 points for Module 1
   - What's unclear: Exact distribution per slide (quiz correct, action complete, etc.)
   - Recommendation: Define in JSON; planner should specify (e.g., quiz: 100, action: 200, completion: 400)

3. **Module 2/3 Gate Check**
   - What we know: Module 2+ require wallet connection
   - What's unclear: Should this be in JSON (isLocked) or checked dynamically?
   - Recommendation: Use `prerequisiteModuleId` + dynamic wallet check; JSON `isLocked` is just initial state

## Sources

### Primary (HIGH confidence)
- Existing project code - `supabase/migrations/20260127173157_campaign_attributions.sql` - migration pattern
- Existing project code - `src/lib/pointsEngine.ts` - user ID handling, service role pattern
- Existing project code - `tsconfig.json` - resolveJsonModule enabled
- [TypeScript Handbook - Unions and Intersections](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html) - discriminated unions
- [Supabase Docs - Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS patterns

### Secondary (MEDIUM confidence)
- [Supabase Docs - Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations) - migration file naming
- [Supabase Docs - Generating Types](https://supabase.com/docs/guides/api/rest/generating-types) - type generation (not used but available)
- [Next.js Docs - Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - JSON import patterns

### Tertiary (LOW confidence)
- N/A - all findings verified with primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified against existing project dependencies
- Architecture: HIGH - patterns derived from existing codebase + official TypeScript docs
- Pitfalls: MEDIUM - based on project-specific authentication (Telegram vs Supabase Auth)

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable patterns, no fast-moving dependencies)
