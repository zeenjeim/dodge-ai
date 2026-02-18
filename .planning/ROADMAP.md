# Roadmap: Dodge AI

## Overview

Dodge AI is a working browser bullet hell game (~2800 lines, single HTML file) with an AI that learns your dodge patterns. This roadmap takes the existing game from "fun prototype" to "polished, discoverable, sticky product" across 5 phases: tighten the mobile/death experience, deepen the AI's intelligence (the core differentiator), add analytics and shareability for discovery, build daily challenge and streak retention loops, and expand gameplay with new mechanics. All 22 v1 requirements are covered. No backend, no frameworks, no build tooling changes until Phase 3.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Gameplay Polish** - Mobile and death experience feel right
- [ ] **Phase 2: AI Intelligence** - The AI visibly learns, adapts, and feels fair
- [ ] **Phase 3: Growth Foundation** - Game is discoverable, shareable, and measured
- [ ] **Phase 4: Retention** - Daily challenge and streaks give players a reason to return
- [ ] **Phase 5: New Mechanics** - Fresh projectiles, hazards, and abilities keep gameplay evolving

## Phase Details

### Phase 1: Gameplay Polish
**Goal**: Every death feels earned and mobile play feels native
**Depends on**: Nothing (first phase)
**Requirements**: POLISH-01, POLISH-02, POLISH-03, POLISH-04
**Success Criteria** (what must be TRUE):
  1. Player sees a death replay indicator showing which projectile killed them and from what direction
  2. On mobile, the player character is offset above the touch point so the finger never obscures it
  3. Pull-to-refresh, swipe-back, and pinch-to-zoom are all disabled during gameplay on mobile browsers
  4. Game canvas respects device safe areas (notch, home indicator) with no content clipped on iOS or Android
**Plans**: TBD

Plans:
- [ ] 01-01: Death feedback and visual kill indicator
- [ ] 01-02: Mobile touch improvements and safe areas

### Phase 2: AI Intelligence
**Goal**: The AI visibly learns player patterns, adapts its attacks, and stays fair
**Depends on**: Phase 1 (death feedback supports AI transparency — player sees what killed them before AI explains why)
**Requirements**: AI-01, AI-02, AI-03, AI-04, AI-05, AI-06
**Success Criteria** (what must be TRUE):
  1. During gameplay, visible messages appear showing what the AI has learned ("Detected clockwise dodge pattern", "You favor the top-left zone")
  2. The AI fires projectiles that specifically counter the player's observed habits (targeting safe zones, predicting dodge direction)
  3. A first-time player and a veteran player face noticeably different AI aggression levels within the same session
  4. The AI never escalates faster than a defined cap per session, preventing a frustration spiral where the game feels unbeatable
  5. AI learning data persists across sessions via localStorage — the AI remembers returning players
**Plans**: TBD

Plans:
- [ ] 02-01: AI visibility layer (learning messages and pattern display)
- [ ] 02-02: Micro-habit detection and counter-pattern firing
- [ ] 02-03: Adaptive difficulty and session-capped adaptation

### Phase 3: Growth Foundation
**Goal**: The game is discoverable via search, shareable as a visual card, and measured with analytics
**Depends on**: Phase 2 (AI commentary powers the share card content; AI learning messages create shareable moments)
**Requirements**: GROW-01, GROW-02, GROW-03, GROW-04, GROW-05
**Success Criteria** (what must be TRUE):
  1. Game over screen offers a "Share" button that generates a 1200x630 image card with stats, phase reached, and AI commentary
  2. Google Search Console shows the game indexed with VideoGame rich result (JSON-LD structured data renders in search)
  3. Page HTML includes visible text content (title, description, how-to-play) that search engines can index beyond the canvas
  4. A lightweight analytics dashboard (Plausible or equivalent) tracks sessions, retention, and drop-off points without requiring cookie consent
**Plans**: TBD

Plans:
- [ ] 03-01: SEO foundation (meta tags, JSON-LD, visible text content)
- [ ] 03-02: Visual share card generator
- [ ] 03-03: Analytics integration

### Phase 4: Retention
**Goal**: Players have a reason to come back every day and a streak they don't want to break
**Depends on**: Phase 3 (analytics data informs whether retention features are working; share card can include daily challenge results)
**Requirements**: RET-01, RET-02, RET-03, RET-04
**Success Criteria** (what must be TRUE):
  1. A "Daily Challenge" mode is available where all players face the same date-seeded AI configuration each day
  2. Consecutive daily challenge completions are tracked as a streak, visible on the main screen
  3. Streak milestones unlock escalating cosmetic rewards (titles, visual flair) that persist in localStorage
  4. Missing a day reduces the streak gradually (gentle ramp-down) rather than resetting to zero
**Plans**: TBD

Plans:
- [ ] 04-01: Daily challenge mode with date-seeded AI
- [ ] 04-02: Streak system with rewards and gentle ramp-down

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
| 1. Gameplay Polish | 0/2 | Not started | - |
| 2. AI Intelligence | 0/3 | Not started | - |
| 3. Growth Foundation | 0/3 | Not started | - |
| 4. Retention | 0/2 | Not started | - |
| 5. New Mechanics | 0/3 | Not started | - |

---
*Roadmap created: 2026-02-18*
*Last updated: 2026-02-18*
