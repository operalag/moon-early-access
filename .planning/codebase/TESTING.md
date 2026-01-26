# Testing Patterns

**Analysis Date:** 2026-01-26

## Current Testing Status

**No test files detected in codebase.** No test framework is configured or in use.

Test-related searches:
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files found
- No test configuration files (`jest.config.*`, `vitest.config.*`, `*.test.config.*`)
- No testing libraries in `package.json` (no Jest, Vitest, Testing Library, Cypress, Playwright, etc.)
- 42 source files (`.ts` and `.tsx`) with zero test coverage

## Test Framework (Not Configured)

**Runner:** None configured
**Assertion Library:** None configured

**Run Commands:** Not applicable - no test commands in `package.json`

Available commands are:
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

## Recommendations for Testing Implementation

### Priority Testing Areas

Given the codebase structure, if testing were to be implemented, focus on these areas:

**High Priority:**
1. **API Routes** (`src/app/api/**/*.ts`)
   - Critical business logic: `src/app/api/auth/welcome/route.ts` (welcome bonus logic)
   - Points engine calls: `src/app/api/referral/route.ts`, `src/app/api/spin/route.ts`
   - Idempotency checks and transaction handling

2. **Utility Functions** (`src/lib/**/*.ts`)
   - `src/lib/pointsEngine.ts` - Core points distribution logic
   - `src/lib/megaphone.ts` - Notification batch processing
   - `src/lib/nudges.ts` - Nudge generation
   - Error cases and edge conditions

3. **Custom Hooks** (`src/hooks/**/*.ts`)
   - `src/hooks/useDailyLogin.tsx` - Daily login streak logic
   - `src/hooks/useProgression.ts` - User progression tracking
   - Async state management and side effects

**Medium Priority:**
1. **Context Providers** (`src/context/**/*.tsx`)
   - `src/context/InfoContext.tsx` - Modal state and transitions
   - `src/hooks/useTelegram.tsx` - Telegram SDK integration and fallbacks

2. **Page Components** (`src/app/**/*.tsx`)
   - Critical user flows (dashboard, leaderboard, wallet)
   - Data fetching and error states

**Low Priority:**
1. **Presentation Components** (`src/components/**/*.tsx`)
   - UI rendering (less critical, can be manual tested)

### Suggested Testing Framework

**Jest + React Testing Library** would be the standard choice for Next.js projects:

**Installation:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest ts-jest
```

**Configuration Pattern** (`jest.config.ts`):
```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
}

export default createJestConfig(config)
```

### Test File Organization Pattern

**Recommended Structure:**
```
src/
├── lib/
│   ├── pointsEngine.ts
│   └── __tests__/
│       └── pointsEngine.test.ts
├── hooks/
│   ├── useDailyLogin.tsx
│   └── __tests__/
│       └── useDailyLogin.test.tsx
└── app/
    └── api/
        ├── auth/
        │   ├── welcome/
        │   │   ├── route.ts
        │   │   └── route.test.ts
        └── referral/
            ├── route.ts
            └── route.test.ts
```

Co-located tests in `__tests__` directories keep tests near implementation.

## Current Code Quality Indicators

### Error Handling Patterns (Present)
Codebase uses structured error handling that is testable:

**Pattern in `src/app/api/referral/route.ts`:**
```typescript
try {
  const { referrerId, refereeId } = await request.json();

  if (!referrerId || !refereeId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Idempotency check
  const { data: existing } = await supabaseAdmin
    .from('referrals')
    .select('id')
    .eq('referee_id', refereeId)
    .single();

  if (existing) {
    return NextResponse.json({ message: 'Already referred' }, { status: 200 });
  }

} catch (error: any) {
  console.error('Referral API Error:', error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

This structure is well-suited for unit testing with mock Supabase clients.

### Testable Logic Patterns

**Weighted Random Selection** in `src/app/api/spin/route.ts`:
```typescript
function getWeightedPrize() {
  const totalWeight = PRIZES.reduce((acc, p) => acc + p.weight, 0);
  let random = Math.random() * totalWeight;
  for (const prize of PRIZES) {
    if (random < prize.weight) return prize;
    random -= prize.weight;
  }
  return PRIZES[0];
}
```
Could be unit tested with mocked Math.random().

**Date/Timezone Handling** in `src/app/api/spin/route.ts`:
```typescript
const getMumbaiDate = (dateStr?: string) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};
```
Could be tested with various date inputs to ensure correct timezone conversion.

**Async State Management** in `src/hooks/useDailyLogin.tsx`:
```typescript
async function checkLoginStatus() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: todayLog } = await supabase
      .from('daily_logins')
      .select('*')
      .eq('user_id', user.id)
      .eq('login_date', today)
      .single();

    if (todayLog) {
      setHasClaimedToday(true);
      setStreak(todayLog.streak_count);
    }
  } catch (err) {
    console.error(err);
  }
}
```
Could be tested using React Testing Library hooks testing utilities and mocked Supabase.

## Testing Blockers & Considerations

1. **Supabase Client Dependencies**
   - Most logic depends on `supabaseAdmin` or `supabase` clients
   - Would require mocking Supabase calls or using `@supabase/supabase-js` test client

2. **External Service Dependencies**
   - Telegram Web App SDK (`@twa-dev/sdk`) in `src/hooks/useTelegram.tsx`
   - TON Connect UI (`@tonconnect/ui-react`) in wallet features
   - These would require mocking or stub implementations

3. **No Existing Test Infrastructure**
   - No test utilities, test helpers, or fixture factories
   - Starting from scratch would require establishing testing conventions

4. **Async Data Flow**
   - Many components load data on mount via `useEffect`
   - Tests would need to handle async operations and state updates

## Code Patterns Supporting Testability

Despite no tests being present, the codebase has patterns that make testing feasible:

1. **Separation of Concerns**
   - API logic in routes (`src/app/api/`)
   - Business logic in utilities (`src/lib/`)
   - UI in components (`src/components/`)
   - State management in hooks and context

2. **Dependency Injection Ready**
   - Supabase client imported but not instantiated inline
   - Could be passed as prop or via context for testing

3. **Error Handling**
   - Try-catch blocks allow testing of success and error paths
   - Meaningful error messages aid debugging

4. **Pure Functions**
   - Helper functions like `getWeightedPrize()` and `getMumbaiDate()` are pure
   - Easy to test with different inputs

## Testing Gaps & Risks

**No coverage of:**
- User authentication flows (AuthWrapper.tsx)
- Referral system edge cases
- Daily spin probability distribution
- Streak reset logic
- Leaderboard calculations
- Telegram integration fallbacks
- Navigation and routing
- Form validation

**Potential bugs that would be caught by tests:**
- Off-by-one errors in streak calculations
- Timezone-related bugs with daily resets
- Race conditions in parallel requests
- Idempotency failures
- Points calculation errors

---

*Testing analysis: 2026-01-26*
