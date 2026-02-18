# Architecture Patterns

**Domain:** Browser-based bullet hell game with adaptive AI, progression, analytics, and ad monetization
**Researched:** 2026-02-18
**Confidence:** HIGH (based on codebase analysis + verified patterns)

## Current Architecture

The game is a single `index.html` file (~2770 lines) with three embedded sections:

| Section | Lines | Content |
|---------|-------|---------|
| CSS | ~578 | All styles including HUD, modals, game over, mobile responsive |
| HTML | ~150 | Canvas, HUD elements, modals, start/game-over screens, ad zone placeholder |
| JavaScript | ~2040 | 8 classes, constants, game loop, input handling, DOM manipulation |

### Current Class Map

```
AIBrain          (~150 lines)  - Pattern learning, prediction, localStorage persistence
Particle         (~20 lines)   - Visual particle effects
Shockwave        (~30 lines)   - Expanding ring visual effects
Projectile       (~180 lines)  - All projectile types (normal, homing, splitter, bouncer, wave, accel)
Boss             (~230 lines)  - Boss entities with behavior types, shooting, collision
Warning          (~15 lines)   - Pre-spawn warning indicators
PowerUp          (~30 lines)   - Collectible power-up entities
Game             (~1200 lines) - Everything else: loop, rendering, spawning, collision, UI, input, state
```

### Current Data Flow

```
Input (mouse/touch)
  |
  v
Game.targetX/Y  -->  Game.update(dt)  -->  Game.render()  -->  Canvas
                        |
                        +-- Player movement (lerp toward target)
                        +-- AIBrain.trackPosition() (records behavior)
                        +-- Spawn cycle: Warning -> Projectile (uses brain predictions)
                        +-- Collision detection (player vs projectiles, bosses)
                        +-- PowerUp collection & effect application
                        +-- Boss update & shooting
                        +-- Particle/Shockwave lifecycle
                        +-- Phase progression (time-based)
                        |
                        v
                     Game.updateUI()  -->  DOM HUD elements
```

### Current localStorage Schema

```
dodge-ai-brain   = JSON { directionBias, totalSamples, reactionSamples, zoneVisits }
dodge-ai-best    = string (float, best time)
dodge-ai-games   = string (int, total games played)
dodge-ai-feedback = JSON array [{ text, time }]
```

## When Does Single-File Become a Problem?

**Short answer: It is already at the threshold, but splitting is not urgent yet.**

At ~2770 lines, the file is navigable but adding the planned features (progression, deeper AI, analytics, ads) would push it past 4000+ lines. The real trigger for splitting is not line count but **concern collision**: when modifying the AI brain requires scrolling past 1200 lines of unrelated Game class code, or when adding analytics means touching the same file that handles particle rendering.

### Split Triggers (When to Actually Do It)

| Trigger | Current State | Threshold |
|---------|---------------|-----------|
| File size | ~2770 lines | 3500+ lines becomes painful |
| Concern overlap | Game class does rendering AND logic AND UI | Already happening |
| Feature velocity | Adding new features requires understanding whole file | Will worsen with progression + AI + analytics |
| Bug surface area | Every edit risks breaking unrelated systems | Moderate risk now |
| Team size | Solo developer (Zee) | Not a factor yet |

**Recommendation: Split during the next major feature addition, NOT as a standalone refactor.** Do not burn a phase just reorganizing files. Instead, extract modules as you build new systems.

## Recommended Architecture: Gentle Module Extraction

### NOT Recommended: Full ECS Rewrite

Entity-Component-System is overkill for this game. The entity types are fixed (player, projectile, boss, powerup, particle, shockwave) and there is no need for dynamic composition. The current class-per-entity-type pattern is the right level of abstraction. Do not over-engineer.

### NOT Recommended: Stay Single File Forever

Adding progression (XP, levels, unlockables), deeper AI learning, analytics tracking, and ad integration into the existing single file would create an unmaintainable monolith. The Game class alone would balloon to 2000+ lines.

### Recommended: ES Modules with esbuild Bundle

Use native ES modules during development for clean separation, then bundle into a single file for production using esbuild. This preserves the "open index.html and it works" deployment model while enabling clean code organization.

**Why esbuild:** Sub-second builds, zero config for JS bundling, produces a single output file. No Babel, no Webpack config hell. One `npx esbuild` command.

**Why NOT unbundled ES modules in production:** The game must load fast (sub-2-second target). While browsers support native ES modules, the waterfall of HTTP requests for 10-15 module files adds latency. A single bundled JS file is the right choice for a game that needs instant loading.

### Target File Structure

```
dodge-ai/
  index.html              <-- Minimal: canvas + DOM elements + <script src="dist/game.js">
  src/
    main.js               <-- Entry point, boots Game
    game.js               <-- Game class (loop, state machine, orchestration)
    renderer.js           <-- All canvas drawing extracted from Game
    input.js              <-- Mouse/touch input handling
    ui.js                 <-- DOM manipulation (HUD, modals, screens)
    entities/
      player.js           <-- Player state and movement
      projectile.js       <-- Projectile class (exists, just move it)
      boss.js             <-- Boss class (exists, just move it)
      powerup.js          <-- PowerUp class (exists, just move it)
      particle.js         <-- Particle + Shockwave (exists)
      warning.js          <-- Warning class (exists)
    systems/
      ai-brain.js         <-- AIBrain class (exists, ~150 lines)
      progression.js      <-- NEW: XP, levels, unlockables
      spawner.js          <-- Projectile/boss/powerup spawn logic (extracted from Game)
      collision.js        <-- Collision detection (extracted from Game)
      effects.js          <-- Active effect management (slowmo, shield, etc.)
    data/
      phases.js           <-- PHASE_DEFS, EVOLVED_BASE constants
      powerup-types.js    <-- POWERUP_TYPES constants
      boss-types.js       <-- BOSS_TYPES constants
      constants.js        <-- All numeric constants
    services/
      storage.js          <-- localStorage abstraction
      analytics.js        <-- Analytics event dispatch
      ads.js              <-- Ad Placement API wrapper
  dist/
    game.js               <-- Bundled output (esbuild)
  package.json            <-- Scripts: build, dev
  esbuild.config.mjs      <-- Build config (optional, CLI flags may suffice)
```

### Build Command

```bash
# Development (watch mode with source maps)
npx esbuild src/main.js --bundle --outfile=dist/game.js --sourcemap --watch

# Production (minified, single file)
npx esbuild src/main.js --bundle --outfile=dist/game.js --minify
```

**Confidence: HIGH** -- esbuild is proven for this exact use case per official docs.

## Component Boundaries

### What Each Module Owns

| Component | Owns | Does NOT Own |
|-----------|------|-------------|
| `game.js` | Game state machine (start, running, dead), main loop tick, component orchestration | Drawing, DOM updates, collision math |
| `renderer.js` | All `ctx.*` drawing calls, background, grid, stars | Game state, entity behavior |
| `input.js` | Mouse/touch event listeners, target position | Player movement (that is physics in game.js) |
| `ui.js` | DOM element manipulation (HUD, modals, screens, announcements) | Canvas rendering |
| `ai-brain.js` | Pattern tracking, predictions, confidence, persistence | Projectile spawning decisions (game.js uses brain's predictions) |
| `spawner.js` | When and where to spawn projectiles/bosses/powerups | Entity creation details (uses entity constructors) |
| `collision.js` | Distance checks, hit detection, near-miss tracking | What happens on collision (game.js decides) |
| `effects.js` | Active effect timers, activation/deactivation | Visual effects of active states (renderer handles those) |
| `progression.js` | XP, levels, unlock state, session rewards | Gameplay mechanics (game.js grants XP based on events) |
| `storage.js` | All localStorage reads/writes, schema migration | Business logic of what to store |
| `analytics.js` | Event dispatch to analytics provider | Gameplay events (game.js calls analytics at the right moments) |
| `ads.js` | adBreak/adConfig calls, ad state management | Game flow control (game.js pauses/resumes around ads) |

### Data Flow Direction

```
Input --> Game (orchestrator)
            |
            +--> reads AIBrain predictions
            +--> calls Spawner (creates entities)
            +--> calls Collision (checks hits)
            +--> calls Effects (manages active powerups)
            +--> calls Progression (grants XP on events)
            +--> calls Analytics (fires events)
            |
            +--> passes state to Renderer (draws frame)
            +--> passes state to UI (updates DOM)
            |
            +--> on death: calls Ads (ad break opportunity)
            +--> on death: calls Storage (save all state)
```

**Key principle: Game.js is the orchestrator. It calls everything else. Nothing else calls Game.** This prevents circular dependencies and keeps data flow unidirectional.

## localStorage Schema for Progression

### Current Schema (v1)

```json
{
  "dodge-ai-brain": {
    "directionBias": { "left": 0, "right": 0, "up": 0, "down": 0 },
    "totalSamples": 0,
    "reactionSamples": [],
    "zoneVisits": [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  "dodge-ai-best": "0",
  "dodge-ai-games": "0",
  "dodge-ai-feedback": []
}
```

### Target Schema (v2 -- with progression)

```json
{
  "dodge-ai-v": 2,
  "dodge-ai-brain": {
    "directionBias": { "left": 0, "right": 0, "up": 0, "down": 0 },
    "totalSamples": 0,
    "reactionSamples": [],
    "zoneVisits": [0, 0, 0, 0, 0, 0, 0, 0, 0],
    "microHabits": {
      "panicDirection": null,
      "cornerAffinity": 0,
      "circlingTendency": 0,
      "reverseFrequency": 0
    },
    "dodgePatterns": [],
    "sessionHistory": []
  },
  "dodge-ai-player": {
    "xp": 0,
    "level": 1,
    "totalGames": 0,
    "bestTime": 0,
    "bestPhase": 0,
    "totalTimePlayed": 0,
    "totalDodged": 0,
    "totalBossesDefeated": 0,
    "unlocks": {
      "abilities": [],
      "cosmetics": [],
      "achievements": []
    },
    "dailyChallengeLastDate": null,
    "dailyChallengeStreak": 0
  },
  "dodge-ai-settings": {
    "soundEnabled": true,
    "particles": "full",
    "showBrainPanel": true
  },
  "dodge-ai-feedback": []
}
```

### Schema Migration Strategy

The `storage.js` module should check `dodge-ai-v` on load:
- If missing or `1`: migrate v1 keys into v2 structure, set version to 2
- If `2`: load normally
- Always write version on save

This prevents data loss for existing players while enabling the new structure.

```javascript
// storage.js pseudocode
export function loadAll() {
  const version = parseInt(localStorage.getItem('dodge-ai-v') || '1');
  if (version < 2) return migrateV1toV2();
  return {
    brain: JSON.parse(localStorage.getItem('dodge-ai-brain')),
    player: JSON.parse(localStorage.getItem('dodge-ai-player')),
    settings: JSON.parse(localStorage.getItem('dodge-ai-settings')),
  };
}
```

**Estimated localStorage usage:** Under 50KB even with extensive progression data. The 5MB limit is not a concern.

## AI Brain Architecture for Deeper Learning

### Current Brain Capabilities

The existing AIBrain tracks:
- Dodge direction bias (4 cardinal directions)
- Position zone visits (3x3 grid)
- Reaction time samples (last 30)
- Recent dodge direction vectors (last 80)
- Position history (last 150 frames)

### Recommended Extensions

**1. Micro-Habit Detection**

Track patterns that emerge over multiple sessions, not just raw direction counts:

```javascript
// Within ai-brain.js
microHabits: {
  // Does player always dodge the same way when panicked?
  panicDirection: {
    samples: [],          // { direction, wasUnderPressure: bool }
    dominantPanic: null,  // 'left' | 'right' | 'up' | 'down'
    confidence: 0         // 0-1
  },
  // Does player gravitate to corners or edges?
  cornerAffinity: {
    cornerTime: [0, 0, 0, 0],  // time spent in each corner quadrant
    edgeTime: 0,
    centerTime: 0
  },
  // Does player circle in one direction?
  circlingTendency: {
    clockwise: 0,
    counterclockwise: 0
  },
  // Does player reverse direction predictably?
  reverseFrequency: {
    afterNearMiss: 0,      // reversals right after a close call
    afterBossSpawn: 0,     // reversals when boss appears
    totalReversals: 0
  }
}
```

**2. Dodge Pattern Memory**

Instead of just tracking direction bias, record sequences:

```javascript
dodgePatterns: [
  { sequence: ['left', 'up', 'left'], count: 5, lastSeen: timestamp },
  { sequence: ['right', 'down'], count: 12, lastSeen: timestamp },
]
// Cap at 20 most-frequent patterns, prune by recency + frequency
```

The brain can then predict: "Player dodged left twice, they will likely dodge left or up again."

**3. Session-Level Learning**

Track how the player adapts across sessions:

```javascript
sessionHistory: [
  { date: '2026-02-18', bestTime: 34.2, avgTime: 18.5, dominantDodge: 'left', gamesPlayed: 5 },
  // Keep last 10 sessions
]
```

This enables the AI to detect if the player is improving and ramp difficulty accordingly, or notice if the player changed their dominant dodge direction (meaning they adapted, and the AI should re-learn).

### Brain Data Size Budget

| Data | Estimated Size |
|------|---------------|
| Direction bias + samples | ~500 bytes |
| Zone visits | ~100 bytes |
| Micro-habits | ~400 bytes |
| Dodge patterns (20 entries) | ~1 KB |
| Session history (10 entries) | ~500 bytes |
| **Total** | **~2.5 KB** |

Well within localStorage limits. No compression needed.

## Analytics Integration

### Recommendation: Start with Custom Lightweight, Migrate to GameAnalytics Later

**Phase 1 (pre-traffic):** Build a minimal analytics module that stores events in localStorage and can export them. This lets you understand player behavior without any external dependency. Zero cost, zero latency impact.

**Phase 2 (with traffic):** Integrate GameAnalytics JS SDK (~48KB minified without logging). It is the standard for HTML5 games and provides dashboards, funnels, and retention charts out of the box.

### Analytics Event Design

```javascript
// analytics.js - Event types to track
const EVENTS = {
  // Session events
  GAME_START: 'game_start',
  GAME_OVER: 'game_over',         // { time, phase, dodged, closestCall }
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',      // { totalGames, totalTime }

  // Progression events
  PHASE_REACHED: 'phase_reached',  // { phase, time }
  BOSS_ENCOUNTERED: 'boss',        // { bossType, survived: bool }
  POWERUP_COLLECTED: 'powerup',    // { type }
  NEW_BEST: 'new_best',            // { time, previousBest }

  // AI events
  AI_CONFIDENCE: 'ai_confidence',  // { confidence } -- logged at game over
  AI_PREDICTION_USED: 'ai_predict',// { type: 'dodge'|'zone'|'future' }

  // Engagement events
  SHARE_CLICKED: 'share',
  RETRY_IMMEDIATE: 'retry',        // clicked retry vs went to menu
  FEEDBACK_SUBMITTED: 'feedback',

  // Ad events (future)
  AD_OPPORTUNITY: 'ad_opportunity', // { type, shown: bool }
  AD_COMPLETED: 'ad_completed',    // { type, duration }
};
```

### Performance Guard

Analytics must NEVER impact the game loop. All event dispatch happens:
- After game over (not during gameplay)
- Asynchronously (requestIdleCallback or setTimeout(fn, 0))
- Batched (collect during game, flush on game over)

```javascript
// analytics.js pattern
class Analytics {
  constructor() {
    this.queue = [];
  }

  track(event, data) {
    this.queue.push({ event, data, time: Date.now() });
  }

  flush() {
    // Only called on game over or session end
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => this._send());
    } else {
      setTimeout(() => this._send(), 0);
    }
  }

  _send() {
    // Phase 1: store to localStorage
    // Phase 2: send to GameAnalytics SDK
    const events = this.queue.splice(0);
    // ... dispatch
  }
}
```

**Confidence: HIGH** -- requestIdleCallback is supported in all major browsers and is the standard pattern for non-critical work.

## Ad Integration Architecture

### Google H5 Games Ads (Ad Placement API)

This is the recommended ad platform. It is specifically designed for HTML5 games and uses the same AdSense code. The API is lightweight and provides natural ad placement hooks.

**Confidence: HIGH** -- verified via official Google developer docs.

### Integration Points in the Game

There are exactly three natural ad break moments in this game:

| Moment | Ad Type | Player State |
|--------|---------|-------------|
| Game over -> retry | Interstitial | Player just died, deciding to retry |
| Game over -> menu | Interstitial | Player going back to menu |
| Continue with bonus (future) | Rewarded | Player opts in for extra life or powerup |

**Critical rule: NEVER show ads during gameplay.** The game is real-time reflex-based. Any interruption during play would be rage-inducing and destroy retention.

### ads.js Module Design

```javascript
// ads.js
let adBreak, adConfig;

export function initAds(publisherId) {
  // Load AdSense script dynamically
  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);

  window.adsbygoogle = window.adsbygoogle || [];
  adBreak = adConfig = function(o) { window.adsbygoogle.push(o); };

  adConfig({ preloadAdBreaks: 'on', sound: 'on' });
}

export function showInterstitial({ beforeAd, afterAd }) {
  if (!adBreak) { afterAd?.(); return; }
  adBreak({
    type: 'next',
    name: 'game-over',
    beforeAd: () => beforeAd?.(),
    afterAd: () => afterAd?.(),
    adBreakDone: (info) => {
      // info.breakStatus tells you if ad was shown, no fill, etc.
      // Track with analytics
    }
  });
}

export function showRewarded({ beforeReward, adViewed, adDismissed, afterAd }) {
  if (!adBreak) { adDismissed?.(); return; }
  adBreak({
    type: 'reward',
    name: 'continue-game',
    beforeReward: (showAdFn) => beforeReward?.(showAdFn),
    adViewed: () => adViewed?.(),
    adDismissed: () => adDismissed?.(),
    afterAd: () => afterAd?.(),
  });
}
```

### Ad Frequency Control

Do not show an ad on every game over. The Ad Placement API has built-in frequency controls, but also implement game-side throttling:

- Show interstitial at most once every 3 game overs
- Never show interstitial if the game lasted less than 10 seconds (player would feel punished for dying fast)
- Rewarded ads are always opt-in, no throttling needed

### Performance Impact

The AdSense script loads asynchronously and does NOT block the game. The `adBreak()` call is non-blocking -- if no ad is available, the callback fires immediately. The only performance cost is the initial script download (~100KB), which happens in parallel with game play.

**Critical: Load the ad script AFTER the game is interactive.** Do not put it in `<head>`. Load it dynamically after the first frame renders or when the player is on the start screen.

## Build Order: What Depends on What

### Dependency Graph

```
storage.js          <-- No dependencies (pure localStorage abstraction)
constants.js        <-- No dependencies (pure data)
phases.js           <-- No dependencies (pure data)
powerup-types.js    <-- No dependencies (pure data)
boss-types.js       <-- No dependencies (pure data)

particle.js         <-- No dependencies
warning.js          <-- No dependencies
shockwave.js        <-- No dependencies
projectile.js       <-- constants.js
powerup.js          <-- powerup-types.js
boss.js             <-- boss-types.js, constants.js
player.js           <-- constants.js

ai-brain.js         <-- storage.js
effects.js          <-- No dependencies (manages timers)
collision.js        <-- No dependencies (pure math)
spawner.js          <-- projectile.js, boss.js, powerup.js, warning.js, phases.js, ai-brain.js

input.js            <-- No dependencies (sets target position)
ui.js               <-- No dependencies (reads state, writes DOM)
renderer.js         <-- All entity types (reads state, draws)

analytics.js        <-- storage.js (for offline queue)
ads.js              <-- No game dependencies (talks to Google SDK)

progression.js      <-- storage.js, constants.js

game.js             <-- EVERYTHING above (orchestrator)
main.js             <-- game.js (entry point)
```

### Build Phases Implication

This dependency graph tells us the natural build order:

1. **Foundation (data + storage):** Extract constants, data files, storage abstraction. These have zero dependencies and can be extracted safely.

2. **Entities:** Move existing classes into their own files. They are already well-encapsulated. Mostly copy-paste with import/export added.

3. **Systems:** Extract spawner, collision, effects from Game class. These are the surgeries -- they require understanding Game.update() intimately.

4. **Game orchestrator:** Slim Game class down to orchestration-only. It imports and calls everything else.

5. **New features (progression, analytics, ads):** Build as new modules that plug into the orchestrator pattern.

**Key insight: Steps 1-4 can happen incrementally alongside feature work. You do NOT need to restructure everything before adding progression.** The recommended approach is:

- When building progression, extract `storage.js` and `progression.js` at the same time
- When building deeper AI, extract `ai-brain.js` at the same time
- When building analytics, create `analytics.js` as a new module
- When building ads, create `ads.js` as a new module

Each feature addition naturally motivates the extraction of related modules.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Premature Splitting
**What:** Restructuring all 2770 lines into 15 files before adding any features.
**Why bad:** Burn a full phase on zero user-visible value. Risk breaking the working game. The split should serve the feature, not be the feature.
**Instead:** Split modules as you build the features that need them.

### Anti-Pattern 2: Circular Dependencies
**What:** game.js imports ai-brain.js, ai-brain.js imports game.js for player position.
**Why bad:** Breaks module loading, creates maintenance nightmares.
**Instead:** Game passes data TO brain via method calls. Brain never reaches back into Game. Data flows one direction.

### Anti-Pattern 3: God Renderer
**What:** Putting all draw logic into renderer.js but also all entity state.
**Why bad:** Creates a new monolith. Renderer becomes Game 2.0.
**Instead:** Each entity keeps its own `draw(ctx)` method (they already do). Renderer just calls them in the right order and handles background/grid/stars.

### Anti-Pattern 4: Over-Abstracting localStorage
**What:** Building an ORM-like abstraction with schemas, validators, migrations engine.
**Why bad:** It is localStorage. It stores strings. The data is 3KB. A simple read/write/migrate module is sufficient.
**Instead:** `storage.js` with `load()`, `save(key, data)`, `migrate()`. Under 50 lines.

### Anti-Pattern 5: Analytics in the Hot Path
**What:** Calling `analytics.track()` inside the game loop (60fps = 60 calls/second).
**Why bad:** Even lightweight operations at 60fps add up. localStorage writes are synchronous and can cause frame drops.
**Instead:** Queue events during gameplay, flush once on game over using requestIdleCallback.

### Anti-Pattern 6: Ads Before Traffic
**What:** Integrating ads in phase 1 when there are 0 visitors.
**Why bad:** Adds complexity, may degrade experience during development, earns $0. Ad networks may reject sites with no traffic.
**Instead:** Build the ad hook points (pause/resume callbacks), but don't load the actual ad SDK until traffic exists. The `ads.js` module should gracefully no-op when ads are disabled.

## Scalability Considerations

| Concern | Now (dev) | At 1K daily users | At 100K daily users |
|---------|-----------|--------------------|--------------------|
| Hosting | Static file, any CDN | Same (it is a static file) | Same with CDN caching |
| Load time | Instant (local) | Sub-2s with CDN | Sub-2s with edge CDN |
| Analytics | localStorage only | GameAnalytics free tier | GameAnalytics free tier (up to 100K MAU) |
| Ad revenue | $0 | $50-150/mo (estimated, tier 1 eCPM ~$3-8 for casual games) | $5K-15K/mo |
| localStorage | No concerns | No concerns (per-user, 5MB limit) | No concerns |
| Server costs | $0 | $0 (static hosting) | $0-5/mo (CDN bandwidth) |

The beauty of this architecture is that it scales to any traffic level without changing. There is no backend. No database. No server. The only variable cost is CDN bandwidth, which is negligible for a single HTML+JS file.

## Sources

- [MDN JavaScript Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [esbuild Official Documentation](https://esbuild.github.io/)
- [Google Ad Placement API - HTML5 Game Structure](https://developers.google.com/ad-placement/docs/html5-game-structure)
- [Google Ad Placement API - Usage](https://developers.google.com/ad-placement/apis)
- [Google Ad Placement API - Example Implementation](https://developers.google.com/ad-placement/docs/example)
- [Google AdSense H5 Games Ads](https://support.google.com/adsense/answer/9959170?hl=en)
- [GameAnalytics for HTML5/JS Games](https://gameanalytics.com/blog/free-analytics-for-html5-javascript-games/)
- [ES Modules in Production Experience](https://www.bryanbraun.com/2020/10/23/es-modules-in-production-my-experience-so-far/)
- [Philip Walton - Native JS Modules in Production](https://philipwalton.com/articles/using-native-javascript-modules-in-production-today/)
- [web.dev - Code Split JavaScript](https://web.dev/learn/performance/code-split-javascript)
- [H5 Game Ads Revenue Optimization](https://blog.clickio.com/h5-game-ads-google-ad-manager-adsense/)
