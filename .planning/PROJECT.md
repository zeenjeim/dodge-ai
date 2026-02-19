# Dodge AI

## What This Is

A browser-based bullet hell game where an AI learns how you dodge and adapts to kill you. Players control a cursor-following character, dodging escalating waves of 9 projectile types across 6 phases while collecting power-ups, fighting bosses, navigating environmental hazards, and unlocking abilities. The AI tracks dodge patterns, detects micro-habits, and fires counter-pattern projectiles. The game includes daily challenges, a visual share card, and analytics — designed to be addictive, shareable, and ultimately monetized through ads once tier 1 traffic is established.

## Core Value

The AI feels genuinely intelligent — it learns your patterns, predicts your movement, and makes every death feel earned. That "holy shit, it figured me out" moment is the hook.

## Requirements

### Validated

- ✓ Core game loop — player dodges AI-fired projectiles, survives as long as possible — existing
- ✓ AI Brain — tracks dodge directions, reaction time, zone visits, persists across sessions via localStorage — existing
- ✓ 6 escalating phases (Scanning → Evolved) with distinct difficulty curves — existing
- ✓ 6 power-up types (Bullet Time, EMP, Smol Mode, Ghost, Personal Space, GTFO) — v1.0 (rebalanced from 8)
- ✓ Boss fights every 25s with health bars and unique attack patterns — existing
- ✓ 9 projectile types (normal, homing, splitter, bouncer, wave, accelerating, spiral, cluster, mine) — v1.0
- ✓ Game over screen with stats, share card, killed-by indicator, retry — v1.0
- ✓ Mobile touch support with 50px offset, gesture prevention, safe areas — v1.0
- ✓ Best time persistence via localStorage (top 5 personal bests list) — v1.0
- ✓ Visual polish (particles, shockwaves, warnings, phase announcements, background stars) — existing
- ✓ SEO-optimized meta tags, OG/Twitter Card, JSON-LD VideoGame schema — v1.0
- ✓ Canvas-generated 1200x630 visual share card with stats and AI commentary — v1.0
- ✓ GoatCounter analytics with 9 lifecycle event types — v1.0
- ✓ Below-fold SEO content section for search engine indexing — v1.0
- ✓ AI brain panel with live threat%, pattern count, and insight display — v1.0
- ✓ 4 pattern detectors (direction bias, safe zone, dodge sequence, panic) with counter-pattern firing — v1.0
- ✓ Adaptive difficulty with threat level 0.0-1.0, session cap, endgame cycling — v1.0
- ✓ Daily challenge mode with seeded PRNG (same game for all players per UTC date) — v1.0
- ✓ 3 environmental hazards (gravity well, danger zone, arena shrink) triggered by AI pattern detection — v1.0
- ✓ 4 unlockable player abilities (Dash Burst, Decoy, Phase Shift, Time Warp) with milestone progression — v1.0

### Active

- [ ] Streak tracking for consecutive daily challenge completions (deferred from v1)
- [ ] Streak rewards escalate (cosmetic titles, bragging rights) (deferred from v1)
- [ ] Streak penalty uses gentle ramp-down, not hard reset (deferred from v1)
- [ ] AI personality modes — distinct AI "characters" with unique attack styles and commentary
- [ ] Player progression — XP, levels
- [ ] Cosmetics and achievement badges
- [ ] Ad placement infrastructure (post-traffic)

### Out of Scope

- Multiplayer / real-time — high complexity, casual game doesn't need it
- Backend / server — keep it client-side, no auth or server costs
- Native mobile app — browser-first, PWA if needed later
- Paid content / microtransactions — ad-only monetization model
- Leaderboards with server persistence — localStorage-only for now

## Context

- Single HTML file (~4700 lines) with embedded CSS and JS — no build step, no dependencies
- All state in localStorage (best time, personal bests, total games, AI brain data, abilities, daily bests)
- AI Brain class with 4 pattern detectors: DirectionBias, SafeZone, DodgeSequence, Panic — all with decay-weighted analysis
- Threat level controller (0.0-1.0) drives adaptive difficulty via getPhaseDef() modifiers
- 6 game phases ramp difficulty: spawn rate, count, speed, aim%, type chances (9 projectile types)
- 3 environmental hazards spawned based on AI pattern confidence
- 4 player abilities unlocked via cumulative survival time milestones
- Boss system with health, attack patterns, visual effects
- Power-up system with 6 types and duration bars
- Daily challenge uses FNV-1a + mulberry32 seeded PRNG for deterministic gameplay
- Share card: 1200x630 canvas PNG via toBlob + navigator.share (mobile) / download (desktop)
- Analytics: GoatCounter with 9 event types (page-load, game-start, death-phase-N, milestone-phase-N, share-card, share-text, daily-death, session-games-N)
- Monetization goal: drive organic tier 1 traffic (US/UK/CA/AU/EU) via viral hooks + content marketing + SEO, then place display ads

## Constraints

- **Architecture**: Single HTML file (~4700 lines) — extraction recommended if future work continues significantly
- **Performance**: Must run 60fps on mid-tier mobile devices — casual game players have low tolerance for jank
- **Load time**: Sub-2-second first meaningful paint — critical for SEO and retention
- **Dependencies**: Zero external dependencies for the game itself — GoatCounter analytics is the only external script
- **Monetization timing**: Ads come AFTER consistent traffic, not before — don't degrade the experience prematurely

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single HTML file for game | Zero build step, instant shareability, CDN-friendly | ✓ Good — shipped v1.0 at ~4700 lines, still manageable but extraction recommended for v2 |
| localStorage only, no backend | No server costs, instant load, privacy-friendly | ✓ Good — brain, abilities, bests, daily all persist cleanly |
| Ad monetization over microtransactions | Simpler implementation, no payment processing, tier 1 CPMs are decent for casual games | — Pending (ads not yet placed, need traffic first) |
| Organic + SEO traffic strategy | Low cost, sustainable, builds genuine audience vs paid acquisition | — Pending (SEO foundation shipped, awaiting deployment + traffic data) |
| Remove AI callout toasts | User found them distracting during playtesting — brain panel stats are sufficient | ✓ Good — cleaner gameplay experience |
| Powerup rebalance (8→6) | Removed low-skill powerups (Plot Armor, Maximum Effort, Yoink), added skill-based GTFO dash | ✓ Good — gameplay feels tighter |
| GoatCounter for analytics | Privacy-first, no cookie consent, free tier sufficient for early traffic | — Pending (account not yet created) |
| Seeded PRNG for daily challenge | FNV-1a + mulberry32, cosmetic Math.random() preserved | ✓ Good — deterministic daily games without breaking visual effects |
| Phase Shift = projectiles only | Hazards still hurt during Phase Shift — intentional risk/reward tradeoff | ✓ Good — adds depth to ability choice |

---
*Last updated: 2026-02-19 after v1.0 milestone*
