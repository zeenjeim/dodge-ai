# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** The AI feels genuinely intelligent — it learns your patterns, predicts your movement, and makes every death feel earned.
**Current focus:** Phase 4 (Retention Loops) in progress.

## Current Position

Phase: 4 of 5 (Retention Loops) — In progress
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-02-19 — Completed 04-01-PLAN.md (daily challenge mode)

Progress: [█████████░░░░] 69% overall (9/13 plans)
Phase 1: [██████████] 100% (2/2 plans)
Phase 2: [██████████] 100% (3/3 plans)
Phase 3: [██████████] 100% (3/3 plans)
Phase 4: [█████░░░░░] 50% (1/2 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: ~8min
- Total execution time: ~75min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-gameplay-polish | 2/2 | ~18min | ~9min |
| 02-ai-intelligence | 3/3 | ~30min | ~10min |
| 03-growth-foundation | 3/3 | ~12min | ~4min |
| 04-retention | 1/2 | ~8min | ~8min |

**Recent Trend:**
- Last 5 plans: 02-03 (~15min), 03-01 (~5min), 03-02 (~4min), 03-03 (~3min), 04-01 (~8min)
- Trend: Execution speed consistent, 04-01 slightly longer due to ~46 Math.random() replacements

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
- [02-01]: Brain save/load v2 schema with sessionsPlayed, lastPlayedAt, dominantPatterns
- [02-02]: 4 pattern detectors integrated into AIBrain with decay-weighted analysis
- [02-02]: Counter-pattern firing via spawnProjectileFromWarning with purple glow distinction
- [02-03]: Callout toast system REMOVED per user feedback — brain panel stats sufficient
- [02-03]: Threat level smoothed: max 0.015/s, cap 0.3-1.0/120s (originally 0.02/s, 0.5-1.0/90s)
- [02-03]: getPhaseDef() modifiers softened: aimPct +0.08, speed +0.8, spawnRate *0.85
- [02-03]: Brain panel: personality text → compact stats (threat%, patterns, insight line)
- [02-03]: Powerups rebalanced: removed Plot Armor, Maximum Effort, Yoink; added GTFO dash (8→6)
- [03-01]: URL placeholders use dodgeai.example.com -- updated when real domain chosen
- [03-01]: body overflow:hidden kept intact -- SEO content accessible to crawlers via HTML source
- [03-01]: SEO content styled in game aesthetic (monospace, cyan/purple, terminal-style bullets)
- [03-02]: toBlob used instead of toDataURL for PNG export (async, faster, binary Blob)
- [03-02]: Share card generated on-demand at click, not pre-rendered at game over
- [03-02]: navigator.canShare guard before navigator.share to prevent unsupported-files crash
- [03-02]: Emoji codes use String.fromCodePoint() instead of literal emoji for cross-platform safety
- [03-03]: trackEvent() uses double safety (try/catch + existence check) for async load race condition
- [03-03]: Session games capped at 10 to prevent unbounded event names in GoatCounter
- [03-03]: Analytics variables are module-level globals, not Game class members (persist across restarts)
- [03-03]: Page-load event uses 500ms polling (max 20 attempts) since GoatCounter loads async
- [04-01]: Unlimited daily attempts with per-day best time tracking (no attempt limit)
- [04-01]: Cosmetic Math.random() preserved (~28 calls), gameplay this.rng() (~46 calls)
- [04-01]: AIBrain Math.random() calls untouched (brain prediction noise separate from spawn determinism)
- [04-01]: Daily best stored with dodge-ai-daily-YYYY-MM-DD localStorage keys

### Pending Todos

None.

### Blockers/Concerns

- Brownfield codebase (~3800 lines single file after daily challenge additions) — approaching complexity threshold
- OG image placeholder needs real asset created (could leverage generateShareCard() pattern)
- GoatCounter account not yet created — analytics no-ops until DODGEAI placeholder is replaced with real site code

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed 04-01-PLAN.md. Phase 4 plan 1 complete. Next: 04-02 (streaks/leaderboard).
Resume file: None
