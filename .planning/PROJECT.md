# Dodge AI

## What This Is

A browser-based bullet hell game where an AI learns how you dodge and adapts to kill you. Players control a cursor-following character, dodging escalating waves of projectiles across 6 phases while collecting power-ups and fighting bosses. The game is designed to be addictive, shareable, and ultimately monetized through ads once tier 1 traffic is established.

## Core Value

The AI feels genuinely intelligent — it learns your patterns, predicts your movement, and makes every death feel earned. That "holy shit, it figured me out" moment is the hook.

## Requirements

### Validated

- ✓ Core game loop — player dodges AI-fired projectiles, survives as long as possible — existing
- ✓ AI Brain — tracks dodge directions, reaction time, zone visits, persists across sessions via localStorage — existing
- ✓ 6 escalating phases (Scanning → Evolved) with distinct difficulty curves — existing
- ✓ 8 power-up types (Bullet Time, EMP, Plot Armor, Smol Mode, Ghost, Personal Space, Blink, Maximum Effort) — existing
- ✓ Boss fights every 25s with health bars and unique attack patterns — existing
- ✓ Multiple projectile types (homing, splitter, bouncer, wave, accelerating) — existing
- ✓ Game over screen with stats, share button, retry — existing
- ✓ Mobile touch support — existing
- ✓ Best time persistence via localStorage — existing
- ✓ Visual polish (particles, shockwaves, warnings, phase announcements, background stars) — existing
- ✓ OG meta tags for social sharing — existing

### Active

- [ ] Deeper AI learning — micro-habits, panic-move detection, preferred safe zones, dodge pattern memory
- [ ] Adaptive difficulty — AI adjusts based on skill level so it's always challenging but fair
- [ ] AI personality modes — distinct AI "characters" with unique attack styles and commentary
- [ ] Player progression — XP, levels, unlockable abilities
- [ ] Cosmetics and achievement badges
- [ ] New projectile types and environmental hazards
- [ ] New player abilities beyond power-ups
- [ ] Daily challenges / reason to come back
- [ ] Shareable score cards / viral share hooks
- [ ] SEO optimization for browser game discovery
- [ ] Analytics integration for traffic/engagement tracking
- [ ] Ad placement infrastructure (post-traffic)

### Out of Scope

- Multiplayer / real-time — high complexity, casual game doesn't need it
- Backend / server — keep it client-side, no auth or server costs
- Native mobile app — browser-first, PWA if needed later
- Paid content / microtransactions — ad-only monetization model
- Leaderboards with server persistence — localStorage-only for v1

## Context

- Single HTML file (~2800 lines) with embedded CSS and JS — no build step, no dependencies
- All state in localStorage (best time, total games, AI brain data)
- AI Brain class tracks: dodge direction bias, position zones (3x3 grid), reaction time samples, movement patterns
- 6 game phases ramp difficulty params: spawn rate, count, speed, aim%, burst/homing/splitter/bouncer/wave/accel chances
- Boss system with health, attack patterns, visual effects
- Power-up system with pickup announcements and duration bars
- Share via clipboard with pre-written quip based on phase reached
- Monetization goal: drive organic tier 1 traffic (US/UK/CA/AU/EU) via viral hooks + content marketing + SEO, then place display ads

## Constraints

- **Architecture**: Keep as single HTML file or minimal structure — no heavy frameworks, fast load is critical for bounce rate
- **Performance**: Must run 60fps on mid-tier mobile devices — casual game players have low tolerance for jank
- **Load time**: Sub-2-second first meaningful paint — critical for SEO and retention
- **Dependencies**: Zero external dependencies for the game itself — analytics/ads are the exception
- **Monetization timing**: Ads come AFTER consistent traffic, not before — don't degrade the experience prematurely

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single HTML file for game | Zero build step, instant shareability, CDN-friendly | — Pending (may need splitting as features grow) |
| localStorage only, no backend | No server costs, instant load, privacy-friendly | — Pending |
| Ad monetization over microtransactions | Simpler implementation, no payment processing, tier 1 CPMs are decent for casual games | — Pending |
| Organic + SEO traffic strategy | Low cost, sustainable, builds genuine audience vs paid acquisition | — Pending |

---
*Last updated: 2026-02-18 after initialization*
