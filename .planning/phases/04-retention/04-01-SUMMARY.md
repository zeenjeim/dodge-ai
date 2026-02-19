---
phase: 04-retention
plan: 01
subsystem: gameplay
tags: [prng, seeded-rng, fnv1a, mulberry32, daily-challenge, retention]

# Dependency graph
requires:
  - phase: 03-growth-foundation
    provides: analytics tracking, share card, SEO foundation
provides:
  - Seeded PRNG infrastructure (fnv1aHash, mulberry32, getTodayUTC, getDailySeed)
  - Swappable Game.rng() for deterministic gameplay
  - Daily challenge mode with date-seeded games
  - Daily best time tracking in localStorage
affects: [04-02 (leaderboard/streaks will build on daily challenge infrastructure)]

# Tech tracking
tech-stack:
  added: []
  patterns: [seeded PRNG via FNV-1a hash + mulberry32, swappable RNG pattern for deterministic replay]

key-files:
  created: []
  modified: [index.html]

key-decisions:
  - "Unlimited daily attempts -- players can retry as many times as they want, best time tracked per UTC date"
  - "Cosmetic Math.random() preserved (~28 calls) while gameplay Math.random() replaced with this.rng() (~46 calls)"
  - "Daily best stored per-date in localStorage with dodge-ai-daily-YYYY-MM-DD keys"
  - "Retry preserves mode -- daily retry replays daily, normal retry replays normal"
  - "AIBrain.getPredictedDodgeTarget() Math.random() calls left untouched (brain prediction noise is separate from spawn determinism)"

patterns-established:
  - "Swappable RNG: Game.rng defaults to Math.random, daily mode sets it to mulberry32(seed)"
  - "Cosmetic vs gameplay separation: cosmetic effects (particles, stars, death explosions) use Math.random() directly, gameplay-affecting calls use this.rng()"
  - "Daily seed derivation: fnv1aHash('dodge-ai-daily-' + UTC date string)"

# Metrics
duration: 8min
completed: 2026-02-19
---

# Phase 4 Plan 1: Daily Challenge Mode Summary

**Seeded PRNG (fnv1aHash + mulberry32) with swappable this.rng(), daily challenge button, date-seeded deterministic gameplay, and per-day best time tracking**

## Performance

- **Duration:** ~8 min
- **Tasks:** 2/2
- **Files modified:** 1 (index.html)

## Accomplishments
- Added seeded PRNG infrastructure: fnv1aHash, mulberry32, getTodayUTC, getDailySeed as standalone utility functions
- Replaced 46 gameplay-affecting Math.random() calls with this.rng() across spawnWarnings, spawnProjectileFromWarning, spawnPowerup, announceBoss, dash fallback, and powerupTimer
- Preserved 28 cosmetic Math.random() calls (particles, background stars, death effects, boss explosions)
- Added DAILY CHALLENGE button on start screen with gold/amber accent
- Daily HUD label visible during daily games, game over screen shows daily context in gold
- Daily best time tracked per UTC date in localStorage, shown on button
- Retry preserves current mode (daily or normal)
- Analytics fires daily-specific events differentiating daily vs normal deaths

## Task Commits

Each task was committed atomically:

1. **Task 1: Add seeded PRNG functions and swappable rng() method** - `252feff` (feat)
2. **Task 2: Add daily challenge UI -- button, HUD label, game over, analytics** - `efa3493` (feat)

## Files Created/Modified
- `index.html` - Added PRNG utilities (fnv1aHash, mulberry32, getTodayUTC, getDailySeed), swappable Game.rng, DAILY CHALLENGE button + CSS, daily-hud element, startDaily() method, daily game over text, daily best localStorage tracking, daily analytics events

## Decisions Made
- Unlimited daily attempts with per-day best time tracking (no attempt limit)
- Cosmetic Math.random() kept separate from gameplay this.rng() -- particles, stars, death effects remain truly random even in daily mode
- AIBrain class Math.random() calls left untouched (brain prediction scatter is separate from spawn determinism)
- Daily best stored with `dodge-ai-daily-YYYY-MM-DD` localStorage keys -- naturally expires as new dates come
- btn-start explicitly sets isDailyChallenge = false before calling start() to prevent mode bleed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Daily challenge infrastructure complete and ready for leaderboard/streaks in plan 04-02
- Seeded PRNG pattern established for any future deterministic game modes
- localStorage daily keys can be read by future leaderboard UI

## Self-Check: PASSED

---
*Phase: 04-retention*
*Completed: 2026-02-19*
