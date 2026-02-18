# Requirements: Dodge AI

**Defined:** 2026-02-18
**Core Value:** The AI feels genuinely intelligent — it learns your patterns, predicts your movement, and makes every death feel earned.

## v1 Requirements

### Gameplay Polish

- [x] **POLISH-01**: Player sees clear visual indicator of what killed them (projectile type, direction)
- [x] **POLISH-02**: Mobile touch input uses finger offset so character isn't hidden under thumb
- [x] **POLISH-03**: Browser gestures prevented on mobile (pull-to-refresh, swipe-back)
- [x] **POLISH-04**: Game respects device safe areas (notch, navigation bar)

### AI Intelligence

- [ ] **AI-01**: AI displays visible learning messages during gameplay ("Detected clockwise pattern", "You favor top-left zone")
- [ ] **AI-02**: AI detects micro-habits (panic moves, cornering tendency, speed changes under pressure)
- [ ] **AI-03**: AI tracks preferred safe zones and exploits them with targeted spawns
- [ ] **AI-04**: AI remembers dodge sequences and fires counter-patterns
- [ ] **AI-05**: Adaptive difficulty adjusts AI aggression based on player skill level
- [ ] **AI-06**: Adaptation speed is capped per session to prevent rage-quit spiral

### Retention

- [ ] **RET-01**: Daily challenge mode with date-seeded AI configuration (same for all players)
- [ ] **RET-02**: Streak tracking for consecutive daily challenge completions
- [ ] **RET-03**: Streak rewards escalate (cosmetic titles, bragging rights)
- [ ] **RET-04**: Streak penalty uses gentle ramp-down, not hard reset

### New Mechanics

- [ ] **MECH-01**: New projectile types beyond current 6 (e.g., spiral, cluster, delayed)
- [ ] **MECH-02**: Environmental hazards that change the dodge space (moving walls, shrinking arena, gravity wells)
- [ ] **MECH-03**: Unlockable player abilities (dash, brief invulnerability, decoy)

### Growth & Virality

- [ ] **GROW-01**: Canvas-generated visual share card (1200x630) with stats, phase, AI commentary
- [ ] **GROW-02**: Schema.org VideoGame JSON-LD structured data
- [ ] **GROW-03**: SEO-optimized meta tags, title, description targeting browser game searches
- [ ] **GROW-04**: Visible text content around canvas for search engine indexing
- [ ] **GROW-05**: Analytics integration (lightweight, privacy-friendly) tracking sessions, retention, drop-off

## v2 Requirements

### Audio

- **AUDIO-01**: Sound effects for dodges, deaths, pickups, bosses (muted by default)
- **AUDIO-02**: Contextual audio that responds to game intensity

### AI Personality

- **AIPER-01**: Distinct AI personality modes with unique attack styles
- **AIPER-02**: Contextual AI commentary/trash talk based on learned patterns

### Progression

- **PROG-01**: XP earned from surviving, dodging, defeating bosses
- **PROG-02**: Level system with unlockable cosmetics
- **PROG-03**: Achievement badge system for specific accomplishments

### Monetization

- **MON-01**: Ad placement infrastructure with graceful no-ops
- **MON-02**: Rewarded video ads for optional power-ups or continues
- **MON-03**: Interstitial ads at natural breaks with frequency caps

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multiplayer / real-time | High complexity, casual game doesn't need it |
| Backend / server | Keep client-side, no auth or server costs |
| Native mobile app | Browser-first, PWA if needed later |
| Microtransactions | Ad-only monetization model |
| Server-side leaderboards | localStorage-only for v1 |
| OAuth / user accounts | No login required, reduces friction |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| POLISH-01 | Phase 1 | Complete |
| POLISH-02 | Phase 1 | Complete |
| POLISH-03 | Phase 1 | Complete |
| POLISH-04 | Phase 1 | Complete |
| AI-01 | Phase 2 | Pending |
| AI-02 | Phase 2 | Pending |
| AI-03 | Phase 2 | Pending |
| AI-04 | Phase 2 | Pending |
| AI-05 | Phase 2 | Pending |
| AI-06 | Phase 2 | Pending |
| RET-01 | Phase 4 | Pending |
| RET-02 | Phase 4 | Pending |
| RET-03 | Phase 4 | Pending |
| RET-04 | Phase 4 | Pending |
| MECH-01 | Phase 5 | Pending |
| MECH-02 | Phase 5 | Pending |
| MECH-03 | Phase 5 | Pending |
| GROW-01 | Phase 3 | Pending |
| GROW-02 | Phase 3 | Pending |
| GROW-03 | Phase 3 | Pending |
| GROW-04 | Phase 3 | Pending |
| GROW-05 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-02-18*
*Last updated: 2026-02-18 after Phase 1 completion*
