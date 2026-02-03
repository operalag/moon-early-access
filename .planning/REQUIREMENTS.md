# Requirements: Moon Prediction Mini App

**Defined:** 2026-02-03
**Core Value:** Educate and guide Telegram users into becoming active prediction market traders through gamified Cricket-themed education.

## v6.0.0 Requirements

Requirements for "Net Practice" Module 1. Each maps to roadmap phases.

### Navigation

- [ ] **NAV-01**: User can access "Net Practice" from main menu
- [ ] **NAV-02**: User sees pulsing indicator on menu item if education incomplete and no wallet connected

### Slide Engine

- [ ] **SLIDE-01**: User can swipe or tap to advance through slides
- [ ] **SLIDE-02**: User sees slide type-specific layouts (intro, concept, quiz, action, reward)
- [ ] **SLIDE-03**: User experiences haptic feedback on quiz selection (light impact for correct, heavy for wrong)
- [ ] **SLIDE-04**: User sees confetti animation on correct quiz answer

### Module 1 Content

- [ ] **MOD1-01**: User completes 6 slides teaching wallet concepts using Cricket metaphors
- [ ] **MOD1-02**: User answers quiz question about wallet ownership with immediate feedback
- [ ] **MOD1-03**: User can trigger wallet connect action from within a slide
- [ ] **MOD1-04**: User earns ~700 points on module completion (feeds existing points system)
- [ ] **MOD1-05**: User earns "Kit Owner" badge on module completion

### Progress Tracking

- [ ] **PROG-01**: User progress persisted in database (user_education_progress table)
- [ ] **PROG-02**: User can resume from last completed module/slide on return
- [ ] **PROG-03**: User sees earned badges in module list or profile area

### Module Gating

- [ ] **GATE-01**: User sees Module 2 & 3 as visually locked without wallet connected
- [ ] **GATE-02**: User sees "Connect wallet to unlock" teaser message on locked modules

### Content Storage

- [ ] **CONT-01**: Module content stored in static JSON file (education_modules.json)

## v6.1.0+ Requirements

Deferred to future releases. Tracked but not in current roadmap.

### Module 2: "The Ticket & The Score"

- **MOD2-01**: User completes 6 slides about TON vs USDT concepts
- **MOD2-02**: User answers quiz about gas fees
- **MOD2-03**: User can trigger deposit/buy crypto action from within slide
- **MOD2-04**: User earns ~700 points on module completion
- **MOD2-05**: User earns badge on module completion

### Module 3: "The Analyst vs. The Gambler"

- **MOD3-01**: User completes 6 slides about trading vs betting
- **MOD3-02**: User answers quiz about mid-match selling
- **MOD3-03**: User can navigate to market from within slide
- **MOD3-04**: User earns ~600 points on module completion (2000 total across all)
- **MOD3-05**: User earns "Rookie Analyst" badge on module completion

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Video content in slides | Keep app lightweight, text + Lottie only |
| Practice/testnet trading | Real trades teach better per research |
| Separate XP currency | Single currency (points) simpler |
| User-generated modules | Moderation overhead, content quality |
| Audio narration | Telegram Mini App constraints, accessibility |
| Offline mode | Always connected in Telegram |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | TBD | Pending |
| NAV-02 | TBD | Pending |
| SLIDE-01 | TBD | Pending |
| SLIDE-02 | TBD | Pending |
| SLIDE-03 | TBD | Pending |
| SLIDE-04 | TBD | Pending |
| MOD1-01 | TBD | Pending |
| MOD1-02 | TBD | Pending |
| MOD1-03 | TBD | Pending |
| MOD1-04 | TBD | Pending |
| MOD1-05 | TBD | Pending |
| PROG-01 | TBD | Pending |
| PROG-02 | TBD | Pending |
| PROG-03 | TBD | Pending |
| GATE-01 | TBD | Pending |
| GATE-02 | TBD | Pending |
| CONT-01 | TBD | Pending |

**Coverage:**
- v6.0.0 requirements: 17 total
- Mapped to phases: 0
- Unmapped: 17 ⚠️

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after initial definition*
