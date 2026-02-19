---
phase: 05-new-mechanics
plan: 02
subsystem: gameplay
tags: [hazards, gravity-well, danger-zone, arena-shrink, ai-brain, environmental-hazards]

# Dependency graph
requires:
  - phase: 02-ai-intelligence
    provides: "AIBrain pattern detectors (safe-zone, cornering) and getHighestConfidencePattern()"
  - phase: 05-new-mechanics plan 01
    provides: "Projectile types with vx/vy for gravity pull interaction"
provides:
  - "Hazard class with 3 types (gravity, danger-zone, shrink) and telegraph/active/expire lifecycle"
  - "AI-triggered hazard spawning based on detected player behavior patterns"
  - "EMP destroys hazards, Ghost grants immunity"
affects: [05-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hazard lifecycle: telegraph (2.5s preview) -> active -> expired"
    - "AI pattern -> hazard type mapping (safe-zone -> gravity, cornering -> danger-zone, high threat -> shrink)"
    - "Muted visual design for background hazards (max alpha 0.18)"

key-files:
  created: []
  modified:
    - "index.html"

key-decisions:
  - "Hazard visuals use muted colors (max alpha 0.18) so projectiles remain primary visual threat"
  - "AI needs pattern confidence >= 0.6 to trigger hazard spawn"
  - "Gravity wells pull both player AND nearby projectiles toward center"
  - "Danger zone gives 1s grace period before killing player"
  - "Ghost powerup blocks all hazard effects; dash does not (per plan spec)"

patterns-established:
  - "Hazard telegraph phase uses pulsing low-opacity outlines to communicate upcoming danger"
  - "Hazard type selected based on AI-detected pattern type, not random"

# Metrics
duration: ~5min
completed: 2026-02-19
---

# Phase 5 Plan 2: Environmental Hazards Summary

**3 AI-triggered environmental hazards (gravity well, danger zone, arena shrink) with telegraph/active/expire lifecycle and powerup counterplay**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-19
- **Completed:** 2026-02-19
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Hazard class with shared lifecycle (telegraph -> active -> expired) and 3 distinct hazard types
- AI brain pattern detection drives hazard selection: safe-zone camping triggers gravity wells, cornering triggers danger zones, high threat triggers arena shrink
- Gravity wells pull both player and projectiles toward center, creating dynamic dodge geometry
- EMP powerup destroys all hazards; Ghost powerup grants full hazard immunity
- Maximum 2 hazards active simultaneously with 10s cooldown between spawns
- Muted visual design ensures hazards are background danger, not competing with projectiles

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Hazard class with telegraph/active/expire lifecycle** - `f41ec43` (feat)
2. **Task 2: Integrate hazards into Game class with AI-triggered spawning** - `dba639c` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `index.html` - Hazard class (3 types with lifecycle, drawing, and per-type mechanics), Game class integration (spawning, update loop, render, EMP/Ghost counterplay)

## Decisions Made
- Hazard visuals capped at 0.18 max alpha -- projectiles remain the primary visual threat per research pitfalls
- AI needs confidence >= 0.6 to spawn hazards -- prevents premature/random-feeling hazard deployment
- Gravity wells affect projectiles at 50% strength compared to player pull -- creates interesting tactical opportunities without breaking projectile readability
- Danger zone has 1s grace period -- deaths feel fair since player has time to react
- Ghost powerup blocks hazard effects; dash does not -- per plan specification, only Ghost was mentioned
- Arena shrink phase-gated to phase >= 3 -- prevents overwhelming early game

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 3 hazard types operational with AI-triggered spawning
- Ready for 05-03 (boss abilities / final plan in phase)
- Codebase now ~4350 lines in single file -- complexity remains manageable for final plan

## Self-Check: PASSED

---
*Phase: 05-new-mechanics*
*Completed: 2026-02-19*
