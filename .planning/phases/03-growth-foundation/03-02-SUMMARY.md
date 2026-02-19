---
phase: 03-growth-foundation
plan: 02
subsystem: sharing
tags: [share-card, canvas-api, navigator-share, png-export, viral-loop]

# Dependency graph
requires:
  - phase: 02-ai-intelligence
    provides: "AI brain with getConfidence(), pattern analysis, and trash-talk commentary"
  - phase: 03-01
    provides: "SEO foundation with OG tags ready for share card integration"
provides:
  - "generateShareCard() producing 1200x630 PNG canvas with game stats and AI commentary"
  - "Native OS share dialog on mobile via navigator.share with File object"
  - "PNG download fallback on desktop via createObjectURL"
  - "Clipboard text share as secondary option"
affects: [03-03-analytics, 04-monetization]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Canvas 2D API for share card generation", "navigator.canShare + navigator.share for mobile-first sharing", "toBlob for async PNG export"]

key-files:
  created: []
  modified: ["index.html"]

key-decisions:
  - "toBlob used instead of toDataURL per research anti-patterns (async, faster, returns binary Blob)"
  - "Card generated on-demand at share click, not pre-rendered at game over"
  - "navigator.canShare guard before navigator.share to prevent unsupported-files crash"
  - "Emoji codes use String.fromCodePoint() instead of literal emoji for cross-platform safety"

patterns-established:
  - "Share card pattern: canvas draw -> toBlob -> navigator.share (mobile) / download (desktop) / clipboard (fallback)"
  - "Word-wrap algorithm using measureText for canvas text rendering"

# Metrics
duration: 4min
completed: 2026-02-19
---

# Phase 3 Plan 2: Visual Share Card Summary

**Canvas-generated 1200x630 PNG share card with survival stats, phase, dodge count, and AI trash-talk commentary as the viral hook**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-19
- **Completed:** 2026-02-19
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added `generateShareCard()` method creating a 1200x630 canvas with game-aesthetic dark background and cyan grid pattern
- Card displays: title (cyan), AI confidence (red, top-right), survival time (100px white hero stat), phase name (purple), divider line, stats row (dodged/closest call/games played in gray), and word-wrapped AI commentary (red italic)
- Replaced text-only `share()` with image-first flow: `toBlob` -> `navigator.share` (mobile) -> download fallback (desktop) -> clipboard text (secondary)
- Mobile users get native OS share dialog with PNG file attachment
- Desktop users get automatic PNG download named `dodge-ai-score.png`
- Clipboard text share always fires as secondary regardless of platform

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement generateShareCard() and update share flow** - `96c6715` (feat)

## Files Created/Modified
- `index.html` - Replaced `share()` method (6 lines) with `generateShareCard()` (92 lines) + new `share()` (55 lines); total +137/-6 lines

## Decisions Made
- Used `toBlob` instead of `toDataURL` for PNG export -- async, faster, returns binary Blob directly usable as File (per research anti-patterns)
- Card generated on-demand when Share is clicked, not pre-rendered at every game over -- avoids wasted computation for players who never share
- `navigator.canShare({ files: [file] })` guard before `navigator.share()` -- prevents crash on browsers that support share API but not file sharing
- Emoji characters in text share use `String.fromCodePoint()` hex codes instead of literal emoji -- avoids encoding issues across platforms
- AI commentary pulled from `#go-ai-learned` DOM element (already populated by `showGameOver()`) rather than re-computing -- single source of truth

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None -- pure client-side Canvas 2D API, no external services.

## Next Phase Readiness
- Visual share card complete and ready for social sharing
- GROW-01 requirement satisfied: canvas-generated visual share card with stats, phase, AI commentary
- Ready for Plan 03 (analytics/tracking) to measure share conversion rates
- OG image placeholder from 03-01 could potentially be auto-generated from this card system in future

## Self-Check: PASSED

---
*Phase: 03-growth-foundation*
*Completed: 2026-02-19*
