# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** The AI feels genuinely intelligent — it learns your patterns, predicts your movement, and makes every death feel earned.
**Current focus:** Phase 2: AI Intelligence (In progress)

## Current Position

Phase: 2 of 5 (AI Intelligence)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-19 — Completed 02-01-PLAN.md (AI visibility layer)

Progress: [███░░░░░░░░░░] 23% overall (3/13 plans)
Phase 1: [██████████] 100% (2/2 plans)
Phase 2: [███░░░░░░░] 33% (1/3 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: ~8min
- Total execution time: ~25min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-gameplay-polish | 2/2 | ~18min | ~9min |
| 02-ai-intelligence | 1/3 | ~7min | ~7min |

**Recent Trend:**
- Last 5 plans: 01-01 (3min), 01-02 (~15min), 02-01 (~7min)
- Trend: 02-01 clean execution, no checkpoints or blockers

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Single HTML file stays through Phase 2; Vite migration considered at Phase 3 if file exceeds ~4000 lines
- [Roadmap]: Analytics before retention (measure before optimizing)
- [Roadmap]: Share card ships with SEO/analytics in Phase 3 (AI commentary from Phase 2 powers it)
- [01-01]: deathContext pattern captures killer identity at collision time before die() call
- [01-01]: getDirectionName() placed as standalone utility (pure function, not class method)
- [01-01]: deathIndicatorFrames counter (20 frames) keeps indicator visible during fade-out without extra delay
- [01-02]: 50px touch offset on touchmove/touchstart only, not mousemove -- desktop input stays un-offset
- [01-02]: Safe area CSS-to-JS bridge via custom properties + getComputedStyle (no hardcoded pixel values)
- [01-02]: Death indicator enhanced to 300ms freeze + dim overlay after user feedback (barely visible)
- [02-01]: AI callout center-screen positioned (fixed top:50% left:50%) for visibility without blocking HUD
- [02-01]: Cooldown randomized 8-12s, max 3 per type+text per run, auto-hide after 3s
- [02-01]: Welcome-back taunt delayed 1.5s, dominant pattern threshold >30% dodge bias or >20 zone visits
- [02-01]: Brain save/load v2 schema with sessionsPlayed, lastPlayedAt, dominantPatterns

### Pending Todos

None.

### Blockers/Concerns

- AI adaptation speed calibration (Phase 2) requires empirical playtesting — no formula, must discover through iteration
- Brownfield codebase (~3080 lines single file) approaching complexity threshold for later phases

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed 02-01-PLAN.md — AI visibility layer done, Plans 02-03 pending
Resume file: None
