---
phase: 11
plan: 01
subsystem: education
tags: [database, typescript, json, supabase, education-modules]
dependency-graph:
  requires: []
  provides: [user_education_progress-table, education-types, module-1-content]
  affects: [12-progress-api, 12-slide-components]
tech-stack:
  added: []
  patterns: [discriminated-union, service-role-only-rls]
key-files:
  created:
    - supabase/migrations/20260203212020_user_education_progress.sql
    - src/lib/educationTypes.ts
    - src/data/education_modules.json
  modified: []
decisions:
  - TypeScript discriminated union pattern for slide variants
  - Service-role only RLS (no public policies) for progress table
  - JSON schema version field for future migrations
metrics:
  duration: ~3 minutes
  completed: 2026-02-03
---

# Phase 11 Plan 01: DB Migration, TypeScript Types, Module 1 JSON Content Summary

**One-liner:** Database schema for progress tracking, TypeScript discriminated unions for 5 slide types, and complete Module 1 content with 2 placeholder modules.

## What Was Built

### Database Migration (user_education_progress)

Created Supabase migration for tracking user progress through education modules:

- **Table columns:** id (UUID), user_id (BIGINT), module_id (TEXT), slide_index (INTEGER), completed_at (TIMESTAMPTZ), badge_earned (BOOLEAN), created_at, updated_at
- **Unique constraint:** One progress record per user per module
- **Indexes:** user_id (common queries), completed_at partial (completion analytics)
- **RLS:** Enabled with no public policies (service-role only pattern)

### TypeScript Types (educationTypes.ts)

Defined comprehensive type system using discriminated unions:

**5 Slide Types:**
1. `IntroSlide` - Welcome/intro with optional mascot image
2. `ConceptSlide` - Educational content with optional diagram
3. `QuizSlide` - Multiple choice with options, correct answer, explanation
4. `ActionSlide` - User action (wallet_connect, channel_join)
5. `RewardSlide` - Completion celebration with points/badge

**Supporting Types:**
- `Slide` - Union of all slide types
- `Module` - Module metadata and slides array
- `EducationModulesData` - Root JSON schema wrapper
- `UserEducationProgress` - Database row type

### Module 1 Content (education_modules.json)

**Module 1: "The Kit Bag" (6 slides)**
1. Intro - "Hey Future Analyst! Before you step onto the pitch..."
2. Concept - "Unlike a bank that holds your money..."
3. Quiz - "Who controls your crypto wallet?" (correct: Me)
4. Concept - "TON Wallet address like your Jersey Number"
5. Action - Connect wallet to complete
6. Reward - 700 points, Kit Owner badge

**Placeholder Modules:**
- Module 2: "The Ticket & The Score" (locked, requires module-1)
- Module 3: "The Analyst vs. The Gambler" (locked, requires module-2)

## Commits

| Commit | Description |
|--------|-------------|
| eaa6f4a | feat(11-01): add user_education_progress database migration |
| 8f55084 | feat(11-01): add TypeScript types for education modules |
| 0347aaf | feat(11-01): add Module 1 content and placeholder modules |

## Deviations from Plan

None - plan executed exactly as written.

## Technical Notes

### Discriminated Union Pattern

```typescript
export type Slide = IntroSlide | ConceptSlide | QuizSlide | ActionSlide | RewardSlide;
```

Each slide type has a `type` field as discriminator, enabling:
- Type-safe switch statements
- Proper TypeScript narrowing
- Easy extension for new slide types

### Service-Role Only RLS

Following the campaign_attributions pattern, the progress table has RLS enabled but no public policies. All access goes through supabaseAdmin (service role), ensuring only server-side API can read/write progress data.

### JSON Schema Version

The `version: "1.0.0"` field in education_modules.json allows future schema migrations if the slide structure changes.

## Next Phase Readiness

Phase 12 (Progress API & Slide Components) can now:
1. Import types from `src/lib/educationTypes.ts`
2. Query `user_education_progress` table via service role
3. Load module content from `src/data/education_modules.json`

**All prerequisites for Phase 12 are satisfied.**
