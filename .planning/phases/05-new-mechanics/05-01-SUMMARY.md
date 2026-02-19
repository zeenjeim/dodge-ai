---
phase: 05-new-mechanics
plan: 01
subsystem: gameplay
tags: [projectiles, bullet-hell, canvas, game-mechanics, phase-gating]

# Dependency graph
requires:
  - phase: 02-ai-intelligence
    provides: getPhaseDef() with threat level modifiers, spawnProjectileFromWarning pipeline
  - phase: 04-retention
    provides: this.rng() deterministic seeding for daily challenges
provides:
  - 3 new projectile types (spiral, cluster, mine) with distinct movement/visuals
  - Phase-gated spawn chances in PHASE_DEFS (spiralChance, clusterChance, mineChance)
  - Cluster explosion and mine detonation child-spawning mechanics
  - Projectile cap at 80 for performance safety
affects: [05-02, 05-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Child-spawning projectile pattern (checkCluster/checkMineDetonate alongside checkSplit)"
    - "Phase-gated type roll chain in spawnProjectileFromWarning"
    - "drawShape extensible switch for new visual glyphs"

key-files:
  created: []
  modified: [index.html]

key-decisions:
  - "Spiral uses corkscrew oscillation (sin-based perpendicular offset) not true helix -- keeps 2D readability"
  - "Cluster fuse 0.8-1.2s with 6-bullet ring explosion -- short enough to feel urgent, ring pattern is readable"
  - "Mine dwell 2.0-3.0s with 4-bullet aimed detonation -- long telegraph with pulsing glow for fairness"
  - "Projectile cap at 80 prevents cluster/mine child multiplication from degrading performance"
  - "New type children marked splitChildren=true so they render as small triangles (consistent with splitter children)"

patterns-established:
  - "Child-spawning projectile lifecycle: travel -> trigger condition -> spawn children -> remove parent"
  - "Visual telegraph pattern: mines pulse with increasing intensity during dwell (opacity 0.3 + sin * 0.3)"

# Metrics
duration: 6min
completed: 2026-02-19
---

# Phase 5 Plan 1: New Projectile Types Summary

**3 new projectile types (spiral/cluster/mine) with corkscrew lanes, 6-bullet nova explosions, and pulsing area-denial mines -- 9 total types in spawn pipeline**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-02-19T21:00:00Z
- **Completed:** 2026-02-19T21:06:29Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added spiral projectiles (mint green, corkscrew oscillation) from Phase 3 (PREDICTING) onward
- Added cluster projectiles (amber, 6-bullet ring explosion) from Phase 4 (TIMING) onward
- Added mine projectiles (hot pink, slow travel + pulsing dwell + aimed detonation) from Phase 5 (HUNTING) onward
- All new types integrated into PHASE_DEFS, EVOLVED_BASE ramp, type roll chain, and visual pipeline
- Projectile cap at 80 prevents runaway child multiplication

## Task Commits

Each task was committed atomically:

1. **Task 1: Add spiral/cluster/mine type fields to PHASE_DEFS and type roll** - `d05cb87` (feat)
2. **Task 2: Add spiral/cluster/mine movement and rendering in Projectile class** - `3a99cd9` (feat)

## Files Created/Modified
- `index.html` - 3 new projectile types: PHASE_DEFS fields, spawn pipeline type roll, Projectile constructor/update/draw, checkCluster/checkMineDetonate methods, 3 new drawShape cases, Game.update integration, projectile cap

## Decisions Made
- Spiral uses sin-based perpendicular oscillation (spiralRadius=25px, spiralSpeed=6 rad/s) for readable corkscrew lanes
- Cluster fuse time randomized 0.8-1.2s via this.rng() with 6-child ring at 0.8x parent speed
- Mine travels at 0.3x speed for 0.5s, dwells 2.0-3.0s (this.rng()), detonates 4 aimed bullets at player
- Mine dwell telegraph uses pulsing glow (opacity oscillation + increasing intensity) to satisfy visual preview decision
- Child projectiles from cluster/mine use splitChildren=true for consistent small triangle rendering
- Particle effects: 8 amber particles on cluster explosion, 6 hot pink particles on mine detonation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- 9 projectile types now in the game (normal, splitter, bouncer, wave, accel, spiral, cluster, mine + homing variant)
- Ready for 05-02 (environmental hazards) and 05-03 (unlockable abilities)
- Projectile cap at 80 provides performance headroom for hazard-spawned projectiles in future plans

## Self-Check: PASSED

---
*Phase: 05-new-mechanics*
*Completed: 2026-02-19*
