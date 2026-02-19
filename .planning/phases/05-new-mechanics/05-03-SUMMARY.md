---
phase: 05-new-mechanics
plan: 03
subsystem: gameplay
tags: [abilities, cooldowns, milestones, localStorage, progression, input-handling]

# Dependency graph
requires:
  - phase: 05-02
    provides: environmental hazards system (Phase Shift does NOT protect from hazards)
  - phase: 04-01
    provides: daily challenge seeded RNG (abilities preserve determinism)
provides:
  - 4 unlockable player abilities with distinct effects
  - milestone-based unlock system with cumulative tracking
  - localStorage persistence under dodge-ai-abilities key
  - spacebar/button activation with cooldown system
  - cooldown HUD indicator near player
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Ability system separate from powerup system (abilities=skill, powerups=luck)"
    - "Cooldown timers use real-time dt, cosmetic effects use Math.random() -- preserves daily challenge seed"
    - "Priority-ordered ability activation (first unlocked+ready ability fires)"

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "Abilities use real-time dt for cooldowns, Math.random() for cosmetics -- daily seed unaffected"
  - "Dash Burst grants 0.3s invulnerability during teleport + 80px shockwave push on nearby projectiles"
  - "Phase Shift blocks projectile damage only -- hazards (danger zones, gravity wells, arena shrink) still hurt"
  - "Time Warp slows projectiles to 30% AND player to 70% -- a risk/reward tradeoff"
  - "Milestone thresholds: dashBurst=300s total, decoy=900s total, phaseShift=60s best run, timeWarp=2400s total"
  - "Priority ordering (dashBurst > decoy > phaseShift > timeWarp) determines which ability fires first"

patterns-established:
  - "Ability system: separate from effects, with own cooldown/duration/active lifecycle"
  - "Milestone tracking: cumulative totalTimeSurvived persisted across sessions"

# Metrics
duration: ~7min
completed: 2026-02-19
---

# Phase 5 Plan 3: Unlockable Abilities Summary

**4 unlockable abilities (Dash Burst, Decoy, Phase Shift, Time Warp) with milestone progression, cooldown system, spacebar/touch activation, and localStorage persistence**

## Performance

- **Duration:** ~7 min
- **Tasks:** 2/2
- **Files modified:** 1

## Accomplishments
- Dash Burst teleports player 100px in movement direction with shockwave that pushes nearby projectiles and 0.3s invulnerability
- Decoy drops a holographic copy at player position that attracts homing projectiles for 3 seconds
- Phase Shift makes projectiles pass through player (0.5s duration) but hazards still kill
- Time Warp slows all projectiles to 30% speed and player to 70% for 2 seconds
- Milestone unlock system tracks cumulative survival time across sessions with 4 unlock thresholds
- Cooldown ring indicator follows player showing ready/charging/active state
- Mobile ability button shows on touch devices with ability label or cooldown countdown

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ability system with unlock thresholds, persistence, activation logic, and cooldown timers** - `f38d967` (feat)
2. **Task 2: Add ability input handlers, cooldown HUD indicator, unlock notification, and game-over display** - `4ad307a` (feat)

## Files Created/Modified
- `index.html` - Added ability system (abilities object, milestone tracking, loadAbilities/saveAbilities, checkMilestoneUnlocks, activateAbility), input handlers (spacebar keydown, mobile button), rendering (cooldown ring, decoy hologram, phase shift transparency, time warp tint), and game-over UI (unlock announcement, abilities count)

## Decisions Made
- Abilities use real-time dt for cooldowns and Math.random() for cosmetic particles (not this.rng()) to preserve daily challenge seed determinism
- Dash Burst shockwave uses existing Shockwave class for visual + direct velocity push on nearby projectiles for functional effect
- Phase Shift is projectile-only immunity (not hazard immunity) as an intentional gameplay tradeoff
- Time Warp affects both projectiles (30% via getSlowMod) and player movement (70% via lerp multiplier) for risk/reward
- Priority ordering determines ability activation when multiple are unlocked and ready
- Mobile button uses abbreviations (DB, DC, PS, TW) to fit the compact 50px circle format

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed plan reference to non-existent Particle 'shockwave' type**
- **Found during:** Task 1 (activateAbility implementation)
- **Issue:** Plan used `new Particle(x, y, '#00ffaa', 'shockwave')` but Particle constructor takes (x, y, vx, vy, life, color, radius) -- no 'shockwave' type
- **Fix:** Used existing Shockwave class + burst Particle array for visual effects
- **Files modified:** index.html
- **Committed in:** f38d967

**2. [Rule 1 - Bug] Fixed plan reference to `this.state` (does not exist)**
- **Found during:** Task 1 (activateAbility)
- **Issue:** Plan used `this.state !== 'playing'` but game uses `this.running` boolean
- **Fix:** Changed to `!this.running`
- **Files modified:** index.html
- **Committed in:** f38d967

---

**Total deviations:** 2 auto-fixed (2 bugs from plan pseudo-code not matching actual codebase API)
**Impact on plan:** Both fixes corrected plan pseudo-code to match actual codebase API. No scope change.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 5 (New Mechanics) is now complete with all 3 plans delivered
- All 5 phases of the project roadmap are complete
- Codebase is ~4700 lines in single file -- if future work is needed, consider extraction

## Self-Check: PASSED

---
*Phase: 05-new-mechanics*
*Completed: 2026-02-19*
