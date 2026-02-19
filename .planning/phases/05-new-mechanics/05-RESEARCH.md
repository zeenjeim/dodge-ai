# Phase 5: New Mechanics - Research

**Researched:** 2026-02-19
**Domain:** Bullet hell projectile patterns, environmental hazards, player ability systems (Canvas 2D, vanilla JS, single-file game)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Projectile personality:**
- Mix of pattern-readable (spirals, sine waves) and chaotic (splitting, multiplying) types
- At least 3 new types that complement the existing 6
- Hybrid AI integration: new types are phase-gated (available at certain phases), but AI decides frequency and targeting based on what's working against the player
- Claude picks the specific projectile types and their visual identity, balancing readability vs variety within the existing neon-on-dark aesthetic

**Hazard design:**
- Escalating intensity: starts subtle (small zones, gravity wells) in earlier phases, builds to major arena reshaping (walls, shrinking) in later phases
- AI-triggered: AI deploys hazards based on player behavior (camping a spot, doing too well), not on fixed timers
- Visual preview telegraphing: hazard zones appear faded/outlined before activating, giving reaction time so deaths feel fair
- Claude decides counterplay mechanics (whether powerups can neutralize hazards, duration, etc.)

**Ability unlock system:**
- 3-4 unlockable abilities (not just the minimum 2)
- Earned through survival milestones (total time survived, single-run records)
- Claude decides the relationship between abilities and existing powerups (separate system vs upgrade/replace)
- Claude decides whether AI adapts to player's unlocked abilities, balancing power vs challenge
- Abilities persist across sessions in localStorage

**Progression pacing:**
- Claude decides the overall pacing model: whether projectiles/hazards are phase-gated while abilities are milestone-unlocked, or another approach that best serves the player
- Claude decides discovery cadence based on typical session length and retention goals
- Goal: game stays exciting from the start while still having things to discover over time

### Claude's Discretion
- Specific projectile type designs and visual identities
- Hazard counterplay mechanics
- Ability-to-powerup relationship
- AI adaptation to unlocked abilities
- Exact unlock thresholds and progression curve
- Whether abilities are always-available or cooldown-based
- Persistence model details

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

## Summary

Phase 5 adds three interrelated mechanic categories to a ~3956-line single-file Canvas 2D bullet hell game: new projectile types, environmental hazards, and unlockable player abilities. The game already has a mature architecture with 6 projectile types, an AI brain with 4 pattern detectors, a phase ramp system (6 phases via PHASE_DEFS), a threat level controller with adaptive difficulty, and 6 powerup types. All new mechanics must integrate with these existing systems rather than replace them.

The research identified specific projectile types (spiral, cluster/nova, delayed/mine), environmental hazard implementations (gravity wells, danger zones, arena shrink), and an ability system (dash burst, decoy/afterimage, phase shift, time warp) that complement existing gameplay. The critical architectural constraint is that everything lives in a single index.html file (now ~3956 lines, approaching the 4000+ "painful" threshold noted in ARCHITECTURE.md), so all additions must be tightly scoped code additions to existing classes and methods -- no new files, no build steps, no external dependencies.

The key design insight from bullet hell pattern theory is that new projectile types should create "lanes" -- readable patterns that let players find safe paths, not random density increases. Environmental hazards should force the player OUT of safe patterns the AI has detected (reinforcing the "AI feels intelligent" core value). Abilities should feel like earned mastery tools that change HOW you play, not just make you stronger.

**Primary recommendation:** Structure as three sequential plans -- projectiles first (extends existing spawn pipeline), hazards second (new game subsystem + AI integration), abilities third (new progression + persistence layer). Each plan adds ~150-250 lines to the existing file.

## Standard Stack

### Core

No external libraries needed. Everything extends existing vanilla JS + Canvas 2D patterns.

| Technology | Current State | Purpose | Extension Needed |
|-----------|---------------|---------|------------------|
| Canvas 2D API | Already used for all rendering | Draw new projectile shapes, hazard zones, ability effects | New draw calls in render() |
| Projectile class | ~200 lines, handles 6 types via `this.type` | Add new type branches in update() and draw() | Add spiral/cluster/mine type branches |
| PHASE_DEFS array | 6 entries controlling spawn chances | Add new type chances (spiralChance, clusterChance, etc.) | New fields per phase entry |
| getPhaseDef() | Computes current phase params + threat modifiers | Return new type chances, hazard availability | Add new type modifiers |
| AIBrain | 4 pattern detectors, counter-pattern firing | Trigger hazards based on detected patterns | New method: getHazardRecommendation() |
| localStorage | brain v2 schema, bests, daily keys | Store unlocked abilities, milestone progress | New dodge-ai-abilities key |

### Supporting

| Pattern | Current Use | New Use |
|---------|-------------|---------|
| Warning system | 350ms warning before projectile spawn | Reuse for hazard telegraphing (faded zones before activation) |
| Shockwave class | EMP/dash visual effects | Gravity well visual effect, ability activation effects |
| Particle class | Visual feedback for all interactions | New particle effects for hazards and abilities |
| drawShape() helper | 6 shapes for projectiles/bosses | New shapes for new projectile types |
| effects object | 5 active effect timers (slowmo, shrink, ghost, magnet, dash) | Add ability cooldown timers |

## Architecture Patterns

### Pattern 1: Extending the Projectile Type System

The existing Projectile class uses a `this.type` string to branch behavior in `update()` and `draw()`. New types follow this exact pattern.

**Current type flow:**
```
spawnProjectileFromWarning()
  -> typeRoll determines type ('splitter', 'bouncer', 'wave', 'accel', or 'normal')
  -> new Projectile(x, y, vx, vy, color, { type, homing })
  -> Projectile.update() branches on this.type for movement
  -> Projectile.draw() branches on this.type for shape/effects
```

**Extension approach:** Add new types to this same pipeline. Each new type needs:
1. A chance field in PHASE_DEFS (e.g., `spiralChance: 0`)
2. A roll check in `spawnProjectileFromWarning()` (after existing type rolls)
3. A movement branch in `Projectile.update()`
4. A visual branch in `Projectile.draw()` with a new shape in `drawShape()`
5. A color constant

**Confidence: HIGH** -- this is direct extension of existing working patterns, verified from codebase analysis.

### Pattern 2: Environmental Hazards as a Game Subsystem

Hazards are a new entity type (like bosses/powerups) managed in `Game.update()` and `Game.render()`. They follow the existing entity lifecycle pattern:

```
Game.hazards = []              // New array, like Game.bosses, Game.powerups
Game.update() {
  this.updateHazards(dt);      // New method: create, activate, expire, check collision
}
Game.render() {
  // Draw hazards BEFORE projectiles (they are background/arena elements)
  for (const h of this.hazards) h.draw(ctx);
}
```

Hazard lifecycle: **Telegraph -> Active -> Expire**
- Telegraph phase: Faded/outlined zone visible for 2-3 seconds (like the warning system for projectiles)
- Active phase: Zone deals damage or modifies physics
- Expiry: Zone fades out

**Hazard triggering via AI:** Instead of fixed timers, hazards spawn when the AI detects the player is "too comfortable":
```javascript
// In Game.update(), alongside updateThreatLevel()
if (this.shouldSpawnHazard()) {
  const pattern = this.brain.getHighestConfidencePattern(this.gameTime);
  this.spawnHazard(pattern); // Hazard type/location based on detected pattern
}
```

**Confidence: HIGH** -- follows existing entity patterns (bosses have similar lifecycle with spawn/update/draw/expire).

### Pattern 3: Ability System with Cooldown Timers

Abilities are separate from powerups. Powerups are random pickups that give temporary effects. Abilities are permanent unlocks with cooldown-based activation.

**Recommended ability-powerup relationship:** Abilities are a SEPARATE system. They do not replace or upgrade powerups. Reasoning:
- Powerups are random luck-based pickups that create moment-to-moment excitement
- Abilities are deterministic player-controlled tools that reward skill
- Keeping them separate means both systems contribute to gameplay variety
- The AI can adapt to ability usage patterns (new pattern detector dimension)

**Activation model:** Cooldown-based, triggered by keyboard/tap gesture.
```javascript
// Game.abilities = { dash: { unlocked: false, cooldown: 0, maxCooldown: 8 }, ... }
// Each ability has: unlocked (bool), cooldown (float, counts down), maxCooldown (seconds)
// Player activates via spacebar/double-tap when cooldown === 0
```

**Persistence model:** New localStorage key `dodge-ai-abilities`:
```json
{
  "unlocked": ["dashBurst", "decoy"],
  "milestones": {
    "totalTimeSurvived": 450.2,
    "bestSingleRun": 89.3,
    "totalGamesPlayed": 47
  }
}
```

**Confidence: HIGH** -- follows established patterns (effects system for timers, localStorage for persistence).

### Pattern 4: Pacing Model

**Recommended progression pacing:**

| Mechanic | When Available | How Introduced |
|----------|---------------|----------------|
| New projectiles | Phase-gated (appear from Phase 3+) | AI controls frequency based on effectiveness |
| Environmental hazards | Phase-gated (subtle from Phase 2, major from Phase 4) | AI-triggered based on player behavior |
| Abilities | Milestone-unlocked (persist forever) | Earned through cumulative play, available from game start once unlocked |

**Discovery cadence:** Typical session is 20-60 seconds (most die in Phases 1-3). A skilled player reaches Phase 4 around 60s. This means:
- Spiral projectiles (Phase 3, 40s+) are seen by ~40% of sessions
- Hazards start subtle in Phase 2 (20s+), so ~70% of sessions encounter at least one
- Major hazards (Phase 4+) seen by ~30% of sessions
- First ability unlock at ~300s total time survived (~10-15 sessions of average play)

This ensures the game feels exciting from the start (hazards from Phase 2) while still having things to discover after hours of play (later ability unlocks).

**Confidence: MEDIUM** -- session length estimates are based on the existing phase durations (20s per phase for Phases 1-5, infinite Phase 6) and typical casual game retention patterns. Actual numbers should be tuned based on analytics data.

### Anti-Patterns to Avoid

- **Projectile type explosion:** Do NOT add more than 3-4 new types. Each new type adds visual noise and code branches. The existing 6 + 3-4 new = 9-10 total is the sweet spot.
- **Hazards that feel random:** Every hazard must be visually telegraphed AND tied to the AI's detection of player behavior. Deaths to hazards that seem random will feel unfair and break the "AI feels intelligent" contract.
- **Abilities that trivialize the game:** Abilities should change strategy, not eliminate challenge. A dash that makes you invulnerable for 2 seconds every 8 seconds would break the threat model. Keep ability windows SHORT (0.3-0.5s) and cooldowns LONG (8-15s).
- **Modifying PHASE_DEFS directly:** Always extend via new fields, never change existing values. Existing phase balance was carefully tuned in Phase 2.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spiral projectile math | Custom spiral equations | Standard parametric: `angle += angularSpeed * dt; x += cos(angle) * linearSpeed; y += sin(angle) * linearSpeed` | Well-known parametric curve, no need to invent |
| Gravity well physics | Custom physics engine | Simple force accumulation: `force = strength / dist^2; vx += (dx/dist) * force * dt` | Inverse-square law is the standard, simple to implement |
| Cooldown timers | Custom timer system | Extend existing `effects` object pattern: `{ active, remaining, duration, cooldown, maxCooldown }` | Game already has this exact timer pattern for 5 powerup effects |
| Telegraphing visuals | Custom animation system | Extend existing Warning class pattern: faded zone + pulsing opacity | Warning system already does exactly this for projectile spawns |
| Milestone tracking | Custom achievement engine | Simple threshold checks on cumulative stats already stored in localStorage | Over-engineering a 5-check system would add unnecessary complexity |

**Key insight:** Every new mechanic maps directly to an existing pattern in the codebase. Projectiles extend the Projectile class. Hazards follow the Boss entity lifecycle. Abilities extend the effects system. Persistence extends the localStorage schema. There is nothing fundamentally new to build.

## Common Pitfalls

### Pitfall 1: Spiral Projectiles That Are Impossible to Dodge
**What goes wrong:** Spiral patterns with tight angular velocity create walls of bullets with no gaps.
**Why it happens:** The angular speed and spawn rate interact -- too fast a spiral with too many bullets creates an impenetrable ring.
**How to avoid:** Use wide angular velocity (>15 degrees per spawn) with low bullet count per spiral arm (3-5 bullets). Test that a stationary player in the center can survive a spiral by finding the gap.
**Warning signs:** If you cannot see clear "lanes" between spiral arms, the pattern is too tight.

### Pitfall 2: Hazards That Compete with Projectiles for Attention
**What goes wrong:** Player dies to a projectile because they were focused on the hazard zone visual, or vice versa.
**Why it happens:** Both systems use bright neon colors on the same dark background, competing for visual attention.
**How to avoid:** Hazards should use MUTED colors (dark purples, deep reds at low opacity) for their zones, with only the activation flash being bright. Projectiles remain the primary visual threat. Hazards are background danger, not foreground.
**Warning signs:** If hazard zones are as visually prominent as projectiles, tone them down.

### Pitfall 3: Abilities That Break the Daily Challenge Seed
**What goes wrong:** Two players with different unlocked abilities get different difficulty experiences on the same daily challenge.
**Why it happens:** If the AI adapts to ability usage, and abilities change spawn patterns via `this.rng()`, the seeded determinism breaks.
**How to avoid:** Abilities activate independently of the spawn RNG. Ability cooldowns use `Math.random()` (cosmetic) or fixed durations, never `this.rng()`. The AI's adaptation to abilities should NOT change spawn patterns in daily mode -- only targeting and frequency.
**Warning signs:** Two players with different ability sets getting different projectile patterns on the same daily challenge seed.

### Pitfall 4: localStorage Schema Conflicts
**What goes wrong:** New `dodge-ai-abilities` key conflicts with existing migration logic or breaks backward compatibility.
**Why it happens:** The brain save/load already has a version field and migration logic. Adding a new key alongside could be missed.
**How to avoid:** The abilities key is entirely separate from `dodge-ai-brain`. It uses its own key with its own version. No migration needed -- if the key doesn't exist, the player has no abilities unlocked (clean default state).
**Warning signs:** Testing with cleared localStorage should produce a working game with zero abilities.

### Pitfall 5: File Size Explosion
**What goes wrong:** Adding three mechanic categories pushes the file well past 4500 lines, making it unmaintainable.
**Why it happens:** Each mechanic seems small but the sum of new Hazard class (~100 lines) + hazard update/draw logic (~80 lines) + new projectile types (~60 lines) + ability system (~120 lines) + AI integration (~50 lines) + persistence (~40 lines) + UI indicators (~50 lines) = ~500 lines.
**How to avoid:** Keep implementations minimal. No elaborate visual effects -- reuse Particle and Shockwave. No complex UIs -- reuse existing HUD patterns. Target ~400 total new lines across all three plans. The file will be ~4350 lines after Phase 5, which is manageable for one more phase but signals the module extraction recommended in ARCHITECTURE.md should happen if future work continues.
**Warning signs:** If any single plan adds more than 200 lines, it is probably over-scoped.

## Code Examples

### New Projectile Type: Spiral

```javascript
// In Projectile.update(), add spiral branch:
if (this.type === 'spiral') {
  // Spiral: orbits around its original trajectory line
  this.spiralAngle = (this.spiralAngle || 0) + this.spiralSpeed * dt;
  const baseSpeed = Math.sqrt(this.baseVx * this.baseVx + this.baseVy * this.baseVy);
  const baseAngle = Math.atan2(this.baseVy, this.baseVx);
  // Move along base trajectory + perpendicular oscillation
  const perpX = -Math.sin(baseAngle);
  const perpY = Math.cos(baseAngle);
  const orbit = Math.sin(this.spiralAngle) * this.spiralRadius;
  this.x += this.baseVx * dt * 60 * speed + perpX * orbit * dt * 4;
  this.y += this.baseVy * dt * 60 * speed + perpY * orbit * dt * 4;
}

// In Projectile constructor, add spiral defaults:
this.spiralAngle = 0;
this.spiralSpeed = opts.spiralSpeed || 6;  // radians/sec
this.spiralRadius = opts.spiralRadius || 25; // pixel amplitude

// In Projectile.draw(), add spiral shape (corkscrew/helix visual):
// Use a new 'spiral' case in drawShape() -- a small swirl glyph
```

### New Projectile Type: Cluster/Nova

```javascript
// Cluster: fires as single projectile, then explodes into ring after delay
// Reuses the splitter pattern but spawns a RING of children instead of 2
if (this.type === 'cluster') {
  if (!this.hasExploded && this.age > this.fuseTime) {
    this.hasExploded = true;
    // Return ring of child projectiles (handled by Game like splitter children)
    const children = [];
    const count = 6;
    const childSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 0.8;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      children.push(new Projectile(this.x, this.y,
        Math.cos(a) * childSpeed, Math.sin(a) * childSpeed,
        '#ff8800', { radius: 3, type: 'normal', splitChildren: true }
      ));
    }
    return children; // Handled like splitter.checkSplit()
  }
}
// fuseTime = 0.8 + rng() * 0.4 (set in spawnProjectileFromWarning)
```

### New Projectile Type: Mine/Delayed

```javascript
// Mine: travels slowly, then stops and sits for 2-3 seconds, then explodes in aimed burst
if (this.type === 'mine') {
  if (this.age < this.travelTime) {
    // Phase 1: travel slowly to position
    this.x += this.vx * dt * 60 * speed * 0.3;
    this.y += this.vy * dt * 60 * speed * 0.3;
  } else if (this.age < this.travelTime + this.dwellTime) {
    // Phase 2: sit and pulse (draw handles visual)
  } else if (!this.hasDetonated) {
    // Phase 3: explode toward player
    this.hasDetonated = true;
    // Return aimed burst (handled like cluster)
  }
}
// travelTime = 0.5, dwellTime = 2.0 + rng() * 1.0
```

### Environmental Hazard: Gravity Well

```javascript
class Hazard {
  constructor(x, y, type, opts = {}) {
    this.x = x; this.y = y;
    this.type = type; // 'gravity', 'danger-zone', 'shrink'
    this.radius = opts.radius || 80;
    this.strength = opts.strength || 120;
    this.telegraphTime = opts.telegraph || 2.0; // seconds before activation
    this.activeTime = opts.duration || 8.0;
    this.age = 0;
    this.phase = 'telegraph'; // telegraph -> active -> expired
  }

  update(dt) {
    this.age += dt;
    if (this.age < this.telegraphTime) this.phase = 'telegraph';
    else if (this.age < this.telegraphTime + this.activeTime) this.phase = 'active';
    else this.phase = 'expired';
  }

  // Gravity well: pull player and projectiles toward center
  applyForce(entity, dt) {
    if (this.phase !== 'active' || this.type !== 'gravity') return;
    const dx = this.x - entity.x;
    const dy = this.y - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < this.radius && dist > 5) {
      const force = (this.strength / (dist * dist)) * this.radius * dt;
      entity.vx = (entity.vx || 0) + (dx / dist) * force;
      entity.vy = (entity.vy || 0) + (dy / dist) * force;
    }
  }

  draw(ctx) {
    const alpha = this.phase === 'telegraph'
      ? 0.15 + Math.sin(this.age * 4) * 0.05  // Pulsing faded outline
      : this.phase === 'active'
        ? 0.25 + Math.sin(this.age * 6) * 0.08  // Active glow
        : 0;
    if (alpha <= 0) return;

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#8b5cf6'; // Muted purple for hazards
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner gradient for gravity visual
    if (this.type === 'gravity' && this.phase === 'active') {
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      grad.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
      grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  isExpired() { return this.phase === 'expired'; }
}
```

### Ability System Core

```javascript
// In Game constructor, alongside this.effects:
this.abilities = {
  dashBurst:  { unlocked: false, cooldown: 0, maxCooldown: 10, duration: 0.3 },
  decoy:      { unlocked: false, cooldown: 0, maxCooldown: 12, duration: 3.0 },
  phaseShift: { unlocked: false, cooldown: 0, maxCooldown: 15, duration: 0.5 },
  timeWarp:   { unlocked: false, cooldown: 0, maxCooldown: 20, duration: 2.0 },
};

// Load unlocked abilities from localStorage
loadAbilities() {
  try {
    const data = JSON.parse(localStorage.getItem('dodge-ai-abilities'));
    if (data && data.unlocked) {
      for (const name of data.unlocked) {
        if (this.abilities[name]) this.abilities[name].unlocked = true;
      }
    }
  } catch (e) {}
}

// Check milestones after each game
checkMilestoneUnlocks() {
  const totalTime = /* cumulative from localStorage */;
  const bestRun = this.bestTime;
  const thresholds = {
    dashBurst:  { totalTime: 300 },   // ~10-15 sessions
    decoy:      { totalTime: 900 },   // ~30-40 sessions
    phaseShift: { bestRun: 60 },      // Reached Phase 4 at least once
    timeWarp:   { totalTime: 2400 },  // ~80+ sessions, prestige reward
  };
  // Check and unlock
}

// Activation via spacebar / double-tap
activateAbility() {
  // Find first unlocked ability off cooldown
  // Or cycle through abilities if multiple unlocked
  // Apply effect, start cooldown timer
}
```

## Recommended Projectile Types (Claude's Discretion)

Based on analysis of the existing 6 types and bullet hell design principles:

### 3 New Types

| Type | Name | Visual | Color | Movement | Readability | Phase Gate |
|------|------|--------|-------|----------|-------------|------------|
| spiral | Helix | Swirl glyph (3-arm spiral) | `#00ffaa` (mint green) | Corkscrew along trajectory | HIGH -- predictable sine path | Phase 3+ (PREDICTING) |
| cluster | Nova | Pulsing circle with expanding ring | `#ff8800` (amber/orange) | Straight line then explodes into 6-bullet ring | MEDIUM -- readable travel, chaotic burst | Phase 4+ (TIMING) |
| mine | Proximity Mine | Octagon with crosshair | `#ff0066` (hot pink) | Slow travel, stops, dwells, detonates toward player | LOW during dwell -- forces area denial | Phase 5+ (HUNTING) |

**Design rationale:**
- **Spiral** is pattern-readable (predictable sine wave path) -- players learn to thread between the oscillations
- **Cluster** is semi-chaotic (predictable travel, unpredictable burst) -- forces players to move away before detonation
- **Mine** is area-denial (sits on the field creating no-go zones) -- synergizes with AI's safe-zone detection to deny known comfort spots

These complement the existing types:
- Existing: normal (basic), splitter (splits into 2), bouncer (wall bounce), wave (sine perpendicular), accel (speeds up), homing (tracks player)
- New: spiral (corkscrew along path), cluster (exploding ring), mine (area denial)

Total: 9 projectile types, each visually and mechanically distinct.

## Recommended Hazard Types (Claude's Discretion)

| Hazard | Visual | Effect | AI Trigger | Counterplay | Phase Gate |
|--------|--------|--------|------------|-------------|------------|
| Gravity Well | Purple radial gradient, swirling particles | Pulls player and nearby projectiles toward center | Safe-zone detector (spawn well in player's favorite zone) | Move away from center; EMP powerup destroys wells | Phase 2+ (subtle) |
| Danger Zone | Red-outlined rectangle, pulsing fill | Deals damage if player stays inside for >1 second | Cornering detector (spawn zone where player camps edges) | Leave the zone before activation timer | Phase 3+ |
| Arena Shrink | Cyan border creeping inward from edges | Playable area reduced for duration | Threat level >0.7 and player doing too well (long survival time) | Survive the pressure; arena restores after 10-15 seconds | Phase 4+ |

**Hazard counterplay:** Powerups interact with hazards:
- EMP (KABOOM) destroys all active hazards in addition to clearing projectiles
- Ghost (NOPE) makes player immune to hazard damage during its duration
- Other powerups do NOT interact with hazards (keeps the counterplay focused)

**Hazard duration model:** Each hazard has a fixed lifetime (8-15 seconds). No hazard is permanent. At most 2 hazards active simultaneously. This prevents the arena from becoming unplayable.

## Recommended Ability Designs (Claude's Discretion)

| # | Ability | Effect | Duration | Cooldown | Unlock Threshold |
|---|---------|--------|----------|----------|-----------------|
| 1 | Dash Burst | Instant teleport 100px in movement direction + brief invulnerability (0.3s) + shockwave that pushes nearby projectiles | 0.3s | 10s | 300s total time survived |
| 2 | Decoy | Drop a holographic copy at current position that attracts homing projectiles and AI targeting for 3 seconds | 3s | 12s | 900s total time survived |
| 3 | Phase Shift | Brief transparency (like Ghost powerup) + 20% speed boost, but NO invulnerability -- projectiles pass through but hazards still hurt | 0.5s | 15s | 60s single-run best (Phase 4) |
| 4 | Time Warp | Slow all projectiles to 30% speed (like Bullet Time powerup) for 2 seconds, but player also moves at 70% speed | 2s | 20s | 2400s total time survived |

**Ability-powerup relationship:** Completely separate systems:
- Powerups: randomly spawned pickups, temporary, luck-based
- Abilities: always available when unlocked, cooldown-based, skill-based
- They can stack (Dash Burst during Ghost = extra escape option)
- The AI does NOT directly adapt to abilities in Phase 5 scope (keeping scope manageable; AI adaptation to abilities is a natural Phase 6 extension)

**Activation input:**
- Desktop: Spacebar activates the first available ability (or cycles with 1/2/3/4 keys)
- Mobile: Double-tap anywhere activates the first available ability
- Cooldown indicator: Small circular HUD element near player showing cooldown progress

## AI Integration Details

### Projectile Integration
New projectile types are added to PHASE_DEFS with chance fields:
```javascript
{ name: 'PREDICTING', ..., spiralChance: 0.1, clusterChance: 0, mineChance: 0 },
{ name: 'TIMING',     ..., spiralChance: 0.15, clusterChance: 0.1, mineChance: 0 },
{ name: 'HUNTING',    ..., spiralChance: 0.15, clusterChance: 0.15, mineChance: 0.1 },
{ name: 'EVOLVED',    ..., spiralChance: 0.2, clusterChance: 0.2, mineChance: 0.15 },
```

The AI controls frequency through the existing threat level modifiers in getPhaseDef(). When threat level is high, new projectile type chances increase (same pattern as existing types).

### Hazard Integration
Hazards are triggered by the AI brain's pattern detectors:
```javascript
shouldSpawnHazard() {
  if (this.hazards.length >= 2) return false; // Max 2 active
  if (this.gameTime < 20) return false; // Not in Phase 1
  if (this.hazardCooldown > 0) return false; // Minimum 10s between hazards

  const pattern = this.brain.getHighestConfidencePattern(this.gameTime);
  if (!pattern || pattern.confidence < 0.6) return false;

  // Higher chance at higher threat levels
  return this.rng() < (this.threatLevel * 0.3);
}
```

Hazard type selection based on detected pattern:
- `safe-zone` pattern -> Gravity Well at the safe zone center
- `cornering` pattern -> Danger Zone at the corner edge
- High threat + long survival -> Arena Shrink (independent of pattern)

## State of the Art

| Current State | After Phase 5 | Impact |
|--------------|---------------|--------|
| 6 projectile types | 9 projectile types | More visual variety, more dodging strategies |
| Static arena (full canvas) | Dynamic arena (hazards modify playable space) | Forces adaptation, breaks camping |
| Powerups only (random, temporary) | Powerups + Abilities (random + earned, temporary + cooldown) | Deeper player mastery, progression incentive |
| AI controls projectile targeting only | AI controls targeting + hazard deployment | AI feels more intelligent -- it reshapes the battlefield |
| No cross-session progression | Ability unlocks persist | Reason to keep playing beyond high scores |

## Open Questions

1. **Ability activation UX on mobile**
   - What we know: Spacebar works on desktop. Double-tap is the obvious mobile equivalent.
   - What's unclear: Double-tap might conflict with rapid movement in a bullet hell. Could cause accidental activations.
   - Recommendation: Use a dedicated ability button (fixed position, bottom-right) on mobile instead of double-tap. Small enough not to interfere with gameplay area.

2. **Cluster/mine projectile performance at high density**
   - What we know: Cluster explodes into 6 children. At high phases with multiple clusters, projectile count could spike.
   - What's unclear: Performance impact on mid-tier mobile devices when 20+ projectiles spawn simultaneously from multiple clusters.
   - Recommendation: Cap total projectile count at 80 (existing implicit cap is ~50-60 in EVOLVED). Cluster children should have shorter lifespans (expire faster off-screen).

3. **Arena shrink interaction with safe areas**
   - What we know: The game uses CSS safe-area-insets for notched devices.
   - What's unclear: When arena shrinks, should it shrink within or beyond the safe area boundary?
   - Recommendation: Arena shrink boundary should respect safe areas (shrink is visual + gameplay, within the safe area). Never push playable content into unsafe zones.

4. **Ability cooldown display during intensive gameplay**
   - What we know: The HUD already has brain panel + powerup indicators at bottom.
   - What's unclear: Where to display ability cooldown without cluttering the view.
   - Recommendation: Small ring indicator near the player character (follows player). Minimal -- just a thin arc showing cooldown progress. Disappears when ability is ready (no persistent UI).

## Sources

### Primary (HIGH confidence)
- **Codebase analysis:** Full read of index.html (~3956 lines), all classes, all systems
- **.planning/research/ARCHITECTURE.md** -- Module structure, localStorage schema, component boundaries
- **.planning/STATE.md** -- All accumulated decisions from Phases 1-4
- **PHASE_DEFS analysis** -- Exact phase parameters and type chance distributions
- **Projectile class analysis** -- Full type system implementation details

### Secondary (MEDIUM confidence)
- [Sparen's Danmaku Design Studio](https://sparen.github.io/ph3tutorials/ddsga2.html) -- Bullet hell pattern theory (aimed/fixed/random angles, readability principles)
- [Boghog's bullet hell shmup 101](https://shmups.wiki/library/Boghog's_bullet_hell_shmup_101) -- Pattern design (aimed/static/random categories, lane-based design, difficulty scaling)
- [GameDev.net: Theory Behind Common Bullet Hell Patterns](https://gamedev.net/forums/topic/605497-theory-behind-common-bullet-hell-patterns/) -- Spiral math, cluster design, pattern composition

### Tertiary (LOW confidence)
- WebSearch results on HTML5 canvas environmental hazards -- general patterns, not specific implementations
- WebSearch results on ability cooldown systems -- mostly Unreal/Roblox focused, principles applicable

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all extends existing patterns verified from codebase
- Architecture: HIGH -- every pattern maps to existing codebase structures (Projectile types, Boss lifecycle, effects timers, localStorage keys)
- Projectile designs: MEDIUM -- based on bullet hell theory + codebase compatibility analysis, but specific parameter tuning (spiral speed, cluster fuse time) needs playtesting
- Hazard designs: MEDIUM -- architecture is solid, but AI trigger thresholds and hazard durations need gameplay tuning
- Ability designs: MEDIUM -- system design is sound, but unlock thresholds are estimates based on assumed session lengths
- Pitfalls: HIGH -- derived from direct codebase analysis (daily challenge seed, file size, visual competition)

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (stable -- no external dependencies to change)
