---
phase: 03-growth-foundation
plan: 03
subsystem: analytics
tags: [goatcounter, analytics, privacy, events, tracking]

# Dependency graph
requires:
  - phase: 03-growth-foundation/03-02
    provides: share card system (share events hook into it)
  - phase: 03-growth-foundation/03-01
    provides: SEO foundation (analytics complements discoverability)
provides:
  - GoatCounter analytics integration with trackEvent() helper
  - Game lifecycle event tracking (start, death, phases, share, session)
  - Three-layer drop-off measurement (pre-play, per-session, return rate)
affects: [04-retention-hooks, 05-polish-launch]

# Tech tracking
tech-stack:
  added: [GoatCounter (external script, privacy-first analytics)]
  patterns: [fire-and-forget analytics, guarded global helper, async script polling]

key-files:
  created: []
  modified: [index.html]

key-decisions:
  - "trackEvent() uses double safety: try/catch + existence check for async load race condition"
  - "GoatCounter polling limited to 20 attempts (10s) then gives up gracefully"
  - "Session games capped at 10 to prevent unbounded event names"
  - "Analytics variables (_sessionGamesPlayed, _gameEverStarted) are module-level, not class members"

patterns-established:
  - "Fire-and-forget analytics: all trackEvent calls are single-line, never wrapped in conditionals that affect game logic"
  - "Event naming: kebab-case with category prefix (milestone-, death-phase-, share-, session-games-)"
  - "Guarded external script: poll for availability, no-op if unavailable"

# Metrics
duration: 3min
completed: 2026-02-19
---

# Phase 3 Plan 3: Analytics Integration Summary

**GoatCounter analytics with 9 event types tracking full game lifecycle: page load, game start, death-by-phase, phase milestones, share actions, and session depth**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-19T15:59:57Z
- **Completed:** 2026-02-19T16:02:24Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- GoatCounter script tag integrated with placeholder site code (swap DODGEAI when account created)
- trackEvent() helper provides guarded, fire-and-forget event tracking that never affects gameplay
- 9 distinct event types cover the full player lifecycle funnel
- Three-layer drop-off measurement: pre-play (page-load vs game-start), per-session (session-games-N), return rate (GoatCounter built-in unique visitors)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add GoatCounter script and trackEvent helper** - `81bed74` (feat)
2. **Task 2: Wire analytics events into game lifecycle** - `7ecf58c` (feat)

## Files Created/Modified
- `index.html` - GoatCounter script tag, trackEvent() helper, 9 analytics event hooks throughout game lifecycle

## Decisions Made
- trackEvent() placed as standalone utility (like getDirectionName) rather than Game class method -- analytics is cross-cutting, not game state
- Double safety pattern (try/catch + existence check) per research pitfall on async loading race conditions
- Session game count capped at 10 to avoid unbounded event name explosion in GoatCounter dashboard
- Page-load event uses polling (500ms intervals, max 20 attempts) since GoatCounter loads async after the game script
- Analytics variables are module-level globals (_sessionGamesPlayed, _gameEverStarted) since they persist across game restarts within a session

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

GoatCounter requires manual account creation:
1. Visit https://www.goatcounter.com/signup
2. Create a site (e.g., dodgeai.goatcounter.com)
3. Replace `DODGEAI` in the script tag's `data-goatcounter` attribute with the actual site code
4. Events will begin appearing in the GoatCounter dashboard immediately

Until the account is created, the script 404s silently and all trackEvent() calls no-op safely.

## Next Phase Readiness
- Phase 3 (Growth Foundation) is now COMPLETE: SEO (03-01), Share Card (03-02), Analytics (03-03)
- Analytics provides the measurement foundation for Phase 4 retention optimization
- GoatCounter dashboard data will inform which retention hooks to prioritize
- No blockers for Phase 4

## Self-Check: PASSED

---
*Phase: 03-growth-foundation*
*Completed: 2026-02-19*
