# Roadmap: Dodge AI

## Overview

Dodge AI is a working browser bullet hell game (~2800 lines, single HTML file) with an AI that learns your dodge patterns. This roadmap takes the existing game from "fun prototype" to "polished, discoverable, sticky product" across 5 phases: tighten the mobile/death experience, deepen the AI's intelligence (the core differentiator), add analytics and shareability for discovery, build daily challenge and streak retention loops, and expand gameplay with new mechanics. All 22 v1 requirements are covered. No backend, no frameworks, no build tooling changes until Phase 3.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Gameplay Polish** - Mobile and death experience feel right
- [x] **Phase 2: AI Intelligence** - The AI visibly learns, adapts, and feels fair
- [x] **Phase 3: Growth Foundation** - Game is discoverable, shareable, and measured
- [ ] **Phase 4: Retention** - Daily challenge and streaks give players a reason to return
- [ ] **Phase 5: New Mechanics** - Fresh projectiles, hazards, and abilities keep gameplay evolving

## Phase Details

### Phase 1: Gameplay Polish
**Goal**: Every death feels earned and mobile play feels native
**Depends on**: Nothing (first phase)
**Requirements**: POLISH-01, POLISH-02, POLISH-03, POLISH-04
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Death context capture, freeze-frame kill indicator, and game-over kill text
- [x] 01-02-PLAN.md — Mobile touch offset, gesture prevention, and safe area integration

### Phase 2: AI Intelligence
**Goal**: The AI visibly learns player patterns, adapts its attacks, and stays fair
**Depends on**: Phase 1 (death feedback supports AI transparency — player sees what killed them before AI explains why)
**Requirements**: AI-01, AI-02, AI-03, AI-04, AI-05, AI-06
**Plans**: 3 plans (3 waves, sequential — all modify index.html)

Plans:
- [x] 02-01-PLAN.md — AI callout toast system, welcome-back taunts, expanded localStorage persistence (wave 1)
- [x] 02-02-PLAN.md — 4 pattern detectors, counter-pattern firing with purple glow, detection/taunt callouts (wave 2)
- [x] 02-03-PLAN.md — Threat level controller, adaptive difficulty, endgame cycling, powerup rebalance (wave 3)

### Phase 3: Growth Foundation
**Goal**: The game is discoverable via search, shareable as a visual card, and measured with analytics
**Depends on**: Phase 2 (AI commentary powers the share card content; AI learning messages create shareable moments)
**Requirements**: GROW-01, GROW-02, GROW-03, GROW-04, GROW-05
**Success Criteria** (what must be TRUE):
  1. Game over screen offers a "Share" button that generates a 1200x630 image card with stats, phase reached, and AI commentary
  2. Google Search Console shows the game indexed with VideoGame rich result (JSON-LD structured data renders in search)
  3. Page HTML includes visible text content (title, description, how-to-play) that search engines can index beyond the canvas
  4. A lightweight analytics dashboard (Plausible or equivalent) tracks sessions, retention, and drop-off points without requiring cookie consent
**Plans**: 3 plans (3 waves, sequential — all modify index.html)

Plans:
- [x] 03-01-PLAN.md — SEO foundation: meta tags, OG/Twitter Card, JSON-LD VideoGame, below-fold content section
- [x] 03-02-PLAN.md — Visual share card: 1200x630 canvas-generated PNG with stats and AI commentary
- [x] 03-03-PLAN.md — Analytics: GoatCounter integration with lifecycle events and drop-off tracking

### Phase 4: Retention
**Goal**: Daily challenge mode and personal best tracking give players a reason to return
**Depends on**: Phase 3 (analytics data informs whether retention features are working; share card can include daily challenge results)
**Requirements**: RET-01 (RET-02, RET-03, RET-04 deferred by user)
**Success Criteria** (what must be TRUE):
  1. A "Daily Challenge" mode is available where all players face the same date-seeded AI configuration each day
  2. A personal best list shows top 5 survival times with dates
**Plans**: 2 plans (2 waves, sequential -- both modify index.html)

Plans:
- [ ] 04-01-PLAN.md -- Seeded PRNG, swappable rng(), daily challenge mode with button/HUD/game-over
- [ ] 04-02-PLAN.md -- Personal best list (localStorage, migration, stats modal, share card daily badge)

### Phase 5: New Mechanics
**Goal**: Gameplay stays fresh with new projectile types, environmental hazards, and player abilities
**Depends on**: Phase 2 (AI intelligence must be in place so new projectiles and hazards interact with adaptive difficulty; new abilities must be balanced against AI learning)
**Requirements**: MECH-01, MECH-02, MECH-03
**Success Criteria** (what must be TRUE):
  1. At least 3 new projectile types (e.g., spiral, cluster, delayed) appear in later game phases alongside existing types
  2. Environmental hazards (moving walls, shrinking arena, or gravity wells) change the playable space during gameplay
  3. Players can unlock at least 2 new abilities (e.g., dash, decoy) that are earned through play and persist across sessions
**Plans**: TBD

Plans:
- [ ] 05-01: New projectile types
- [ ] 05-02: Environmental hazards
- [ ] 05-03: Unlockable player abilities

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Gameplay Polish | 2/2 | Complete | 2026-02-18 |
| 2. AI Intelligence | 3/3 | Complete | 2026-02-19 |
| 3. Growth Foundation | 3/3 | Complete | 2026-02-19 |
| 4. Retention | 0/2 | Planned | - |
| 5. New Mechanics | 0/3 | Not started | - |

---
*Roadmap created: 2026-02-18*
*Last updated: 2026-02-19 after Phase 4 planning*
