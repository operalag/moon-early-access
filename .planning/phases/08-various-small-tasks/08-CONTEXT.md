# Phase 8: Various Small Tasks - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Two targeted improvements: fix welcome page spacing and integrate news feed from Telegram channel. No other screens or features are modified.

</domain>

<decisions>
## Implementation Decisions

### Welcome Page Spacing
- Slight reduction of top padding (approximately 20-30% less)
- Only adjust top padding — keep spacing between elements unchanged
- Only welcome screen is modified; every other screen stays exactly as-is
- No other visual changes (fonts, buttons, layout all remain the same)

### News Integration
- Source: @cricketandcrypto Telegram channel
- Display: Latest 4 news items
- Location: News menu section

### Claude's Discretion
- News card layout and styling
- What info to display per news item (title, date, image, excerpt)
- Click/tap behavior for news items
- Loading and error states for news feed
- How to fetch from Telegram channel (API approach)

</decisions>

<specifics>
## Specific Ideas

- User emphasized: "every other screen is perfect and has to stay exactly the way it is"
- Welcome page content should move up, not redistribute spacing throughout

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-various-small-tasks*
*Context gathered: 2026-01-30*
