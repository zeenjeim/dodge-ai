# Phase 2: AI Intelligence - Research

**Researched:** 2026-02-18
**Domain:** Game AI pattern detection, adaptive difficulty, cross-session learning, in-game learning visibility
**Confidence:** HIGH

## Summary

This phase transforms the existing AIBrain class from a passive data collector into an active adversarial intelligence that visibly learns, adapts, and taunts the player. The existing codebase already has the foundational infrastructure: an `AIBrain` class (lines 812-964) that tracks direction bias, reaction time, zone visits, and position history, plus a brain panel HUD (lines 622-649) and insight messages (lines 924-939). The game also already uses brain data to aim projectiles in later phases (lines 2413-2487). What's missing is: (1) richer pattern detection beyond direction bias, (2) explicit counter-pattern firing that the player can feel, (3) visible callouts when the AI adapts, (4) adaptive difficulty tied to observed skill level, (5) session escalation caps, and (6) cross-session memory for returning players.

The implementation requires zero external libraries. All pattern detection, adaptive difficulty, and learning visibility features can be built using the existing canvas rendering, DOM HUD, and localStorage APIs already used in the codebase. The primary challenge is not technical complexity but **tuning** -- making the AI feel smart without feeling unfair, and making escalation feel fast (30-60s) without triggering rage-quit spirals.

**Primary recommendation:** Extend AIBrain with dedicated detector classes (MovementPatternDetector, PanicDetector, SafeZoneTracker, DodgeSequenceAnalyzer), add an AdaptiveDifficulty controller that modulates existing PHASE_DEFS parameters, implement a toast/callout UI system for learning messages, and expand localStorage persistence to carry richer pattern data across sessions. Cap escalation per session using a "threat level" metric with a hard ceiling that either plateaus or cycles between attack styles.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- AI stance is **adversarial** -- it's an opponent trying to beat you, not a coach helping you improve
- Death is **inevitable** -- the game is about how LONG you survive, not IF you die. AI escalates until it overwhelms
- Escalation speed is **fast** -- AI starts reacting to patterns within 30-60 seconds. Short, intense runs with quick feedback
- AI adapts **both within a run and across runs** -- learns patterns live during play AND remembers returning players via localStorage
- Counter-attacks use **explicit callouts** -- AI announces what it detected ("Targeting your safe zone", "Detected clockwise pattern") so the player knows they've been read
- Returning player experience: **welcome back taunt** -- AI greets returning players with a message referencing their past habits ("Still dodging clockwise?")

### Claude's Discretion
- Endgame cap behavior (plateau vs cycling patterns)
- Pattern memory strategy (reset vs stack when player adapts)
- AI personality & messaging tone (not discussed -- Claude has full flexibility on voice, wording, placement of learning messages)
- Learning visibility depth (not discussed -- Claude decides how much of the AI's "brain" to expose via HUD or messages)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core

No external libraries needed. Everything uses built-in browser APIs and patterns already present in the codebase.

| API/Feature | Purpose | Already Used? |
|-------------|---------|---------------|
| Canvas 2D API | Render callout messages, visual indicators | Yes (entire game) |
| DOM HUD elements | Brain panel, learning message toasts | Yes (brain-panel, phase-announce) |
| `localStorage` | Cross-session AI memory persistence | Yes (AIBrain.save/load) |
| `performance.now()` | Frame timing for pattern detection windows | Yes (game loop) |
| `Math.atan2`, trig | Angle-based pattern classification | Yes (throughout) |
| Circular buffers (arrays) | Sliding window pattern detection | Yes (positionLog, dodgeDirections) |

### Supporting

| Technique | Purpose | When to Use |
|-----------|---------|-------------|
| Exponential Moving Average (EMA) | Smooth noisy signals (reaction time, speed changes) | Detecting micro-habits without spurious triggers |
| Zone heatmap (3x3 grid) | Track safe zone preferences | Already exists as `zoneVisits[9]` -- needs weighting by recency |
| Sequence similarity (LCS/edit distance) | Detect repeating dodge sequences | When comparing current movement to stored patterns |
| Clamped linear interpolation | Map raw metrics to difficulty parameters | Adaptive difficulty scaling |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-coded pattern detectors | TensorFlow.js neural network | Massive overkill for this game -- neural net needs training data, adds 500KB+ dependency, and the game's pattern space is small enough for heuristics |
| Circular buffer arrays | Formal ring buffer class | Arrays with shift/push are sufficient at 80-150 element sizes already used |
| DOM toasts for callouts | Canvas-rendered text | DOM is easier to animate with CSS transitions, matches existing announcement pattern (phase-announce, pickup-announce) |
| localStorage raw JSON | IndexedDB | localStorage is simpler, already used, and AI brain data is well under 5KB |

**Installation:** None. Zero dependencies added.

## Architecture Patterns

### Existing Code to Extend (Not Replace)

The existing AIBrain (lines 812-964) is the foundation. Critical to understand what exists:

```
AIBrain (current):
  Data:
    - dodgeDirections[] (last 80 dodge vectors with timestamps)
    - positionLog[] (last 150 positions)
    - reactionSamples[] (last 30 reaction times)
    - directionBias { left, right, up, down } (cumulative counts)
    - zoneVisits[9] (3x3 grid, cumulative)
    - totalSamples (cumulative counter)

  Methods:
    - trackPosition(x, y, time, w, h) -- called every frame from update()
    - onProjectileFired(time) -- called when projectile spawns
    - getAvgReaction() -- average of reactionSamples
    - getDominantDodge() -- top direction from directionBias
    - getBiasPercentages() -- normalized directional percentages
    - getFavoriteZone(w, h) -- highest zoneVisit cell center
    - getPredictedDodgeTarget(px, py, w, h) -- aims at predicted dodge destination
    - getPredictedFuturePos(px, py, vx, vy, t) -- linear extrapolation
    - getConfidence() -- 0-97 based on totalSamples
    - getInsight() -- rotating text messages for brain panel
    - save()/load() -- persists directionBias, totalSamples, reactionSamples, zoneVisits
```

The game already USES brain data for aiming in phases 2-5 (lines 2426-2458 in `spawnProjectileFromWarning`):
- Phase 2: 65% chance to aim at predicted dodge target
- Phase 3: 40% predicted dodge, 30% favorite zone, 30% direct
- Phase 4+: 30% future position, 25% predicted dodge, 20% favorite zone, 25% direct

### Pattern 1: Detector Module Pattern

**What:** Separate pattern detection into focused detector objects that each own their data and detection logic, all fed by the same player position stream.

**When to use:** For each requirement (micro-habits AI-02, safe zones AI-03, dodge sequences AI-04). Each detector is a self-contained analysis unit.

**Structure:**
```javascript
// Each detector implements the same interface
class PanicDetector {
  constructor() {
    this.recentSpeeds = [];        // sliding window
    this.panicEvents = [];         // detected panic moments
    this.corneringCount = 0;       // times player hit edge
  }

  // Called every frame with player state
  update(px, py, vx, vy, gameTime, w, h) {
    // Track speed changes, edge proximity, direction reversals
  }

  // Returns current detected patterns (or null)
  getActivePattern() {
    // { type: 'panic-reversal', confidence: 0.8, description: '...' }
  }

  // Serializable state for localStorage
  serialize() { /* ... */ }
  deserialize(data) { /* ... */ }
}
```

Each detector is created in the AIBrain constructor and updated via `trackPosition()`. The AIBrain becomes an orchestrator that delegates to specialized detectors.

**Confidence:** HIGH -- this is standard composition, and the existing AIBrain already has the tracking entry point (`trackPosition` called every frame from line 1908).

### Pattern 2: Threat Level Controller

**What:** A single numeric "threat level" (0.0 to 1.0) that encapsulates how aggressively the AI is adapting. It rises as patterns are detected, is capped per session, and modulates the existing PHASE_DEFS parameters.

**When to use:** As the central adaptive difficulty mechanism (AI-05, AI-06). Instead of directly mutating PHASE_DEFS, the threat level is applied as a multiplier/modifier to the values returned by `getPhaseDef()`.

**How it works:**
```
threatLevel rises when:
  - AI confidence increases (patterns detected)
  - Player survives longer (time-based ramp)
  - Same patterns persist (player isn't adapting)

threatLevel affects:
  - aimPct: base + threatLevel * 0.15 (more accurate aim)
  - speed: base + threatLevel * 1.5 (faster projectiles)
  - spawnRate: base * (1 - threatLevel * 0.3) (more frequent spawns)
  - Counter-pattern chance: threadLevel * 0.6 (likelihood of targeted attacks)
  - homingChance: base + threatLevel * 0.1

threatLevel is CAPPED:
  - Hard ceiling per session (e.g., 0.85 max in first 60s, 1.0 after)
  - Rate limit: max +0.02 per second of gameplay
  - Session cap: threatLevel <= sessionCap where sessionCap ramps from 0.5 to 1.0 over 90 seconds
```

This naturally creates the fast adaptation (30-60s to feel AI react) while preventing runaway difficulty spikes. The cap ensures AI-06 compliance.

**Confidence:** HIGH -- this is a standard DDA pattern used in RE4 and Left 4 Dead. The innovation here is making it **visible** (adversarial, not hidden), which aligns with the user's locked decision.

### Pattern 3: Learning Message System (Toast UI)

**What:** Temporary text messages that appear on screen when the AI detects a pattern, with the AI's adversarial personality.

**When to use:** When any detector reaches a confidence threshold for a new pattern, or when the AI starts counter-attacking based on a pattern.

**Implementation approach:**
The game already has an announcement system for phases (lines 651-656, phase-announce with show/hide CSS) and pickups (line 665, pickup-announce). The learning messages should follow the same pattern: a DOM element with CSS transition, positioned below the brain panel or center-screen.

```
Message types:
1. Detection callout: "Detected clockwise pattern" -- appears when pattern first detected
2. Counter-attack warning: "Targeting your safe zone" -- appears when AI fires based on pattern
3. Taunt: "Still predictable" -- appears on pattern persistence
4. Welcome back: "Still dodging clockwise?" -- appears at session start if returning player

Timing:
- Max 1 message visible at a time
- Display duration: 2-3 seconds
- Cooldown between messages: 8-12 seconds (avoid spam)
- Priority: counter-attack warnings > new detections > taunts
```

**Confidence:** HIGH -- builds on existing DOM announcement patterns in the codebase.

### Pattern 4: Cross-Session Memory Expansion

**What:** Expand what's saved/loaded from localStorage to include detector states and threat level history.

**Current save data (line 942-949):**
```javascript
{
  directionBias: { left, right, up, down },
  totalSamples: number,
  reactionSamples: number[],
  zoneVisits: number[9],
}
```

**Expanded save data:**
```javascript
{
  // Existing
  directionBias: { left, right, up, down },
  totalSamples: number,
  reactionSamples: number[],
  zoneVisits: number[9],

  // New
  version: 2,                          // Schema version for migration
  sessionsPlayed: number,              // Total sessions for returning player detection
  lastPlayedAt: number,                // Timestamp for welcome-back freshness
  bestSurvivalTime: number,            // Skill proxy for adaptive difficulty seeding
  dominantPatterns: string[],          // Top 3 patterns detected across sessions
  panicProfile: {                      // Micro-habit summary
    avgPanicSpeed: number,
    cornerPreference: string,          // 'top-left', 'center', etc.
    reversalFrequency: number,
  },
  dodgeSequenceHash: string[],         // Hashed common dodge sequences
  threatLevelHistory: number[],        // Last 5 session peak threat levels
}
```

Size estimate: ~500 bytes JSON, well within localStorage limits.

**Welcome-back taunt logic:** On game start, if `sessionsPlayed > 0` and `lastPlayedAt` exists, generate a taunt from `dominantPatterns`. Example: if `dominantPatterns` includes "right-dodge-bias", display "Back again? Still dodging right, I bet."

**Confidence:** HIGH -- straightforward JSON serialization, same pattern as existing save/load.

### Recommended Approach: Endgame Cap Behavior (Claude's Discretion)

**Decision: Cycling patterns with a plateau ceiling.**

Rationale: A hard plateau creates a monotonous endgame where the AI stops adapting and the player finds a stable strategy. Cycling patterns -- where the AI rotates between different counter-strategies at max threat level -- keeps the endgame dynamic and unpredictable. The ceiling prevents difficulty from going absurd, but the cycling means the player must keep adapting even at max difficulty.

Implementation: At threatLevel >= 0.9 (session cap reached), the AI cycles between three attack modes on a 10-15 second rotation:
1. **Zone denial** -- heavy targeting of player's preferred zones
2. **Prediction spam** -- high percentage of predictive/leading shots
3. **Speed pressure** -- faster projectiles, shorter spawn intervals

This creates a "final boss AI" feel where death is inevitable but the player faces varied challenges until the end.

### Recommended Approach: Pattern Memory Strategy (Claude's Discretion)

**Decision: Stack with decay.**

Rationale: Full reset when the player changes patterns is too forgiving -- the AI should feel like it remembers. Full stacking without decay means old irrelevant patterns pollute current analysis. Stacking with decay (exponential decay weighted toward recent data) is the best cat-and-mouse dynamic: the AI remembers your old tricks but gives more weight to what you're doing now.

Implementation: Use time-weighted data in detectors. Recent samples (last 10s) count 3x more than older samples (30s+). When calculating dominant dodge direction, weight recent dodges more heavily. If the player switches from right-dodge to left-dodge, within 15-20 seconds the AI's counter-strategy shifts, but it retains awareness that the player might revert to right-dodge.

Cross-session memory uses even heavier decay -- last session's patterns are weighted 0.5x, two sessions ago 0.25x. This means a returning player who changed their habits will see the AI adapt within their first run, not stay stuck on stale data.

### Recommended Approach: AI Personality & Messaging Tone (Claude's Discretion)

**Decision: Smug, adversarial trash-talk -- "I'm smarter than you and I know it."**

This aligns with the existing game personality (game over quips like "Wow. That happened.", brain panel title "The AI's Diary", insights like "My grandma dodges faster"). The AI is a cocky, confident opponent that enjoys calling out your patterns. Not cruel -- more like a competitive friend who's beating you and won't shut up about it.

Message bank structure:
```
Detection messages (when pattern first detected):
- "Clockwise? Really? I had you in 12 seconds."
- "You love that top-left corner. Noted."
- "Panic dodge detected. That's basically a homing beacon."
- "Speed drop when pressured. Filing that under 'exploitable.'"

Counter-attack messages (when AI fires based on pattern):
- "Targeting your safe zone."
- "Aiming where you're GOING to be."
- "Let's see you dodge right again."
- "Here's a surprise for your favorite corner."

Taunt messages (pattern persists after callout):
- "Still doing the same thing? Bold strategy."
- "I already told you I see that. You just don't care, do you?"
- "At this point I'm predicting your predictions."

Welcome-back messages:
- "Oh, you're back. Still dodging [direction]?"
- "Missed you. Your reaction time hasn't improved though."
- "Return of the [corner]-hugger. I remember everything."
- "Session [N]. Your patterns haven't changed. Mine have."
```

### Recommended Approach: Learning Visibility Depth (Claude's Discretion)

**Decision: Medium visibility -- brain panel stays, add floating callout toasts, but don't expose raw numbers or algorithm internals.**

The brain panel already shows confidence %, reaction time, move count, and directional bias percentages. That's enough numerical detail. The new learning messages should be **personality-driven text**, not data readouts. The player should feel the AI's intelligence through its taunts and counter-attacks, not through seeing raw analytics.

What to show:
- Brain panel (existing): keep as-is, it's the AI's "status display"
- Floating callouts (new): personality text when patterns detected/exploited
- Counter-attack visual (new): brief flash or color change on projectiles fired as counter-patterns, so the player can distinguish "random" shots from "targeted" ones

What NOT to show:
- Raw threat level number
- Exact pattern detection algorithm state
- Detector confidence percentages
- Decay weights or timing windows

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Complex neural net for pattern detection | TensorFlow.js model | Heuristic detectors with sliding windows | Pattern space is tiny (4 directions, 9 zones, ~5 micro-habits). Neural net is 1000x overkill. |
| Custom animation library for callout toasts | JavaScript animation framework | CSS transitions + classList toggle | Same pattern used for phase-announce and pickup-announce already works perfectly |
| Persistent database for AI memory | IndexedDB, Firebase | localStorage JSON | Data is <1KB, single-player only, no complex queries needed |
| Statistical significance testing | p-value calculations for pattern confidence | Simple threshold + sample size minimums | Game runs at 60fps with 150-sample buffers. If a pattern shows up in 30+ samples with >35% frequency, it's real enough to act on. |
| Formal state machine for AI modes | XState or custom FSM library | Simple if/else with mode enum | Three cycling modes at endgame doesn't justify a state machine framework |

**Key insight:** The game's AI intelligence needs to FEEL smart, not BE smart. Simple heuristics with good messaging create a more impressive experience than a sophisticated algorithm with no feedback. The personality layer (callouts, taunts) does more heavy lifting than the detection layer.

## Common Pitfalls

### Pitfall 1: AI Feels Unfair Instead of Smart

**What goes wrong:** Players perceive the AI as "cheating" rather than "learning." They feel punished randomly rather than outplayed.
**Why it happens:** Counter-attacks fire without explanation. The AI gets harder but the player doesn't understand why. No visible connection between their behavior and the AI's response.
**How to avoid:** Always show a callout BEFORE or AT the moment of counter-attack ("Targeting your safe zone" appears 1-2 seconds before zone-targeted projectiles arrive). The locked decision for explicit callouts directly prevents this pitfall. The player should always be able to think "oh, it caught me doing that" rather than "why did that happen."
**Warning signs:** Playtesting shows frustration without "oh that's clever" moments.

### Pitfall 2: Adaptation Too Fast = Feels Broken

**What goes wrong:** AI detects a "pattern" from 3-4 samples and immediately fires counter-attacks, but the pattern was just noise/coincidence.
**Why it happens:** Detection thresholds too low, minimum sample sizes too small. A player who dodged right twice isn't a "right-dodger" -- they might have been avoiding two projectiles from the left.
**How to avoid:** Set minimum sample counts before any pattern is reported. Direction bias needs 15+ samples. Zone preference needs 20+ visits to that zone. Dodge sequence repetition needs 3+ identical sequences. Micro-habits (panic, cornering) need 5+ events.
**Warning signs:** AI starts calling out patterns in the first 10 seconds.

### Pitfall 3: Cross-Session Memory Makes First 30 Seconds Unplayable

**What goes wrong:** Returning player faces immediate max-difficulty AI because all patterns are loaded from localStorage on start. There's no ramp-up, no warm-up, just instant death.
**Why it happens:** Threat level is seeded from stored data without session-start grace period.
**How to avoid:** Cross-session memory affects WHAT the AI knows (which patterns to look for) but NOT how aggressively it acts initially. Threat level always starts at 0 and ramps within the session. The AI might fire a welcome-back taunt referencing old patterns, but it still needs to re-observe them before counter-attacking. This creates the "the AI remembers me" feel without the "I can't survive 5 seconds" frustration.
**Warning signs:** Returning players survive shorter than first-time players.

### Pitfall 4: Too Many Callout Messages = Noise

**What goes wrong:** Messages fire every few seconds, becoming background noise the player ignores. The learning messages lose their impact.
**Why it happens:** Multiple detectors all reaching thresholds at similar times, no global cooldown on messages.
**How to avoid:** Implement a message queue with priority and cooldown. Maximum 1 message per 8-12 seconds. Counter-attack warnings take priority over general detections. If multiple patterns trigger simultaneously, show only the highest-confidence one. After 3 messages of the same type, stop showing that type (player already knows).
**Warning signs:** Brain panel and callout text are constantly changing, player stops reading them.

### Pitfall 5: Threat Level Ratchet -- Can Never Come Down

**What goes wrong:** Threat level only goes up, never down. A player who changes their patterns and becomes harder to predict still faces escalating difficulty because the threat level never retreats.
**Why it happens:** Threat level is designed to rise but has no mechanism to decrease when the AI loses confidence.
**How to avoid:** Threat level should decay slowly when the AI's predictions miss. If counter-pattern shots are dodged successfully, threat level decreases slightly. This creates the cat-and-mouse dynamic: player adapts -> AI loses confidence -> threat drops slightly -> AI observes new patterns -> threat rises again.
**Warning signs:** Mid-run difficulty never decreases even when the player deliberately changes behavior.

### Pitfall 6: Mutating PHASE_DEFS Global State

**What goes wrong:** The adaptive difficulty directly modifies PHASE_DEFS array values, causing the base difficulty to permanently shift during a session.
**Why it happens:** Easier to modify the source data than to apply modifiers at read time.
**How to avoid:** PHASE_DEFS must remain immutable (the game already has `EVOLVED_BASE = { ...PHASE_DEFS[5] }` as a pattern for this). The `getPhaseDef()` method (lines 1851-1868) is the correct place to apply adaptive difficulty modifiers -- it already computes dynamic values for the EVOLVED phase. Extend this pattern for all phases.
**Warning signs:** Restarting a run within the same page load doesn't reset difficulty to baseline.

## Code Examples

### Micro-Habit Detection: Panic Reversal

```javascript
// Detect when player rapidly reverses direction (panic move)
// Called from trackPosition() with velocity data

detectPanicReversal(vx, vy, prevVx, prevVy, gameTime) {
  // Dot product of consecutive velocity vectors
  // Negative = reversal (moving in opposite direction)
  const dot = vx * prevVx + vy * prevVy;
  const speed = Math.sqrt(vx * vx + vy * vy);
  const prevSpeed = Math.sqrt(prevVx * prevVx + prevVy * prevVy);

  if (speed > 2 && prevSpeed > 2 && dot < -0.5) {
    this.panicReversals.push({
      time: gameTime,
      x: this.lastPlayerPos.x,
      y: this.lastPlayerPos.y,
      angle: Math.atan2(vy, vx),
    });
    if (this.panicReversals.length > 20) this.panicReversals.shift();
  }
}

// Pattern detected when 5+ reversals in last 15 seconds
getPanicPattern(gameTime) {
  const recent = this.panicReversals.filter(r => gameTime - r.time < 15);
  if (recent.length < 5) return null;

  // Find dominant reversal direction
  const avgAngle = Math.atan2(
    recent.reduce((s, r) => s + Math.sin(r.angle), 0) / recent.length,
    recent.reduce((s, r) => s + Math.cos(r.angle), 0) / recent.length
  );

  return {
    type: 'panic-reversal',
    frequency: recent.length,
    dominantAngle: avgAngle,
    description: 'Panic reversal detected',
  };
}
```

### Adaptive Difficulty: Threat Level Application

```javascript
// In getPhaseDef() -- apply threat level as modifier
getPhaseDef() {
  let base;
  if (this.phase < PHASE_DEFS.length - 1) {
    base = { ...PHASE_DEFS[this.phase] };
  } else {
    // EVOLVED ramp (existing logic)
    const phaseDurations = PHASE_DEFS.slice(0, 5).reduce((s, p) => s + p.dur, 0);
    const t = Math.max(0, this.gameTime - phaseDurations);
    const ramp = Math.floor(t / 20);
    base = {
      ...EVOLVED_BASE,
      speed: 6.0 + ramp * 0.4,
      spawnRate: Math.max(0.2, 0.35 - ramp * 0.03),
      count: Math.min(6, 4 + Math.floor(t / 30)),
      // ... existing ramp logic
    };
  }

  // Apply threat level modifiers
  const t = this.threatLevel; // 0.0 to 1.0
  return {
    ...base,
    aimPct: Math.min(0.98, base.aimPct + t * 0.15),
    speed: base.speed + t * 1.5,
    spawnRate: base.spawnRate * (1 - t * 0.25),
    // Counter-pattern firing chance (new property)
    counterPatternChance: t * 0.6,
  };
}
```

### Counter-Pattern Firing

```javascript
// In spawnProjectileFromWarning(), add counter-pattern targeting
// Inserted alongside existing aim logic (lines 2426-2458)

const def = this.getPhaseDef();

// NEW: Counter-pattern firing (when threat level is high enough)
if (Math.random() < def.counterPatternChance) {
  const pattern = this.brain.getHighestConfidencePattern();
  if (pattern) {
    switch (pattern.type) {
      case 'safe-zone':
        // Target the player's preferred zone
        targetX = pattern.zoneCenter.x + (Math.random() - 0.5) * 40;
        targetY = pattern.zoneCenter.y + (Math.random() - 0.5) * 40;
        this.showLearningMessage('counter', `Targeting your safe zone.`);
        break;
      case 'direction-bias':
        // Aim where player tends to dodge TO
        const predicted = this.brain.getPredictedDodgeTarget(px, py, this.w, this.h);
        if (predicted) { targetX = predicted.x; targetY = predicted.y; }
        this.showLearningMessage('counter', `Aiming ${pattern.direction}. You're welcome.`);
        break;
      case 'panic-reversal':
        // Fire from the direction the player tends to reverse toward
        // (catching them mid-reversal)
        targetX = px + Math.cos(pattern.dominantAngle) * 80;
        targetY = py + Math.sin(pattern.dominantAngle) * 80;
        this.showLearningMessage('counter', `Exploiting your panic reflex.`);
        break;
    }
  }
}
```

### Session Escalation Cap

```javascript
// Threat level management
updateThreatLevel(dt) {
  const maxRatePerSecond = 0.02; // Maximum rise rate

  // Session cap: ramps from 0.5 to 1.0 over 90 seconds
  const sessionCap = Math.min(1.0, 0.5 + (this.gameTime / 90) * 0.5);

  // Rise based on AI confidence and pattern persistence
  const confidence = this.brain.getConfidence() / 100; // 0.0 to 0.97
  const activePatterns = this.brain.getActivePatternCount();
  const riseRate = (confidence * 0.015 + activePatterns * 0.005) * dt;

  // Decay when AI predictions miss (counter-shots dodged)
  const decayRate = this.recentCounterMisses > 2 ? 0.005 * dt : 0;

  // Apply with cap
  this.threatLevel = Math.min(
    sessionCap,
    Math.max(0, this.threatLevel + Math.min(riseRate, maxRatePerSecond * dt) - decayRate)
  );
}
```

### Endgame Cycling (at max threat level)

```javascript
// When threat level is at session cap for 5+ seconds, cycle attack modes
updateEndgameCycle(dt) {
  if (this.threatLevel < 0.9) {
    this.endgameCycleTimer = 0;
    this.endgameMode = null;
    return;
  }

  this.endgameCycleTimer += dt;
  const cycleDuration = 12; // seconds per mode
  const modeIndex = Math.floor(this.endgameCycleTimer / cycleDuration) % 3;
  const modes = ['zone-denial', 'prediction-spam', 'speed-pressure'];
  const newMode = modes[modeIndex];

  if (newMode !== this.endgameMode) {
    this.endgameMode = newMode;
    const modeMessages = {
      'zone-denial': 'Locking down your safe zones.',
      'prediction-spam': 'Full prediction mode. Good luck.',
      'speed-pressure': 'Speed increased. Try to keep up.',
    };
    this.showLearningMessage('taunt', modeMessages[newMode]);
  }
}
```

### Welcome-Back Taunt (on game start)

```javascript
// In start() method, after brain.load()
showWelcomeBack() {
  const savedData = this.brain.getSavedProfile();
  if (!savedData || savedData.sessionsPlayed < 1) return;

  const patterns = savedData.dominantPatterns || [];
  const templates = [
    (p) => `Oh, you're back. Still dodging ${p}?`,
    (p) => `Session ${savedData.sessionsPlayed + 1}. I still remember your ${p} habit.`,
    (p) => `Return of the ${p} fan. My aim has improved. Yours... probably hasn't.`,
    () => `Missed you. Well, not literally. I never miss.`,
    () => `Back for more? Your pattern data is still warm.`,
  ];

  const hasPattern = patterns.length > 0;
  const pool = hasPattern
    ? templates.filter(t => t.length > 0)
    : templates.slice(-2); // Use generic templates if no patterns stored
  const template = pool[Math.floor(Math.random() * pool.length)];
  const msg = hasPattern ? template(patterns[0]) : template();

  // Show as initial learning message with slight delay
  setTimeout(() => this.showLearningMessage('welcome', msg), 1500);
}
```

### Learning Message Toast System

```javascript
// DOM element (add near existing announcements)
// <div id="ai-callout"></div>

// CSS (matches existing announcement style)
// #ai-callout {
//   position: fixed;
//   top: 50%;
//   right: max(16px, calc(8px + var(--sa-right)));
//   transform: translateY(-50%);
//   z-index: 15;
//   font-size: 12px;
//   color: #8b5cf6;
//   letter-spacing: 1px;
//   text-align: right;
//   max-width: 220px;
//   opacity: 0;
//   transition: opacity 0.3s;
//   pointer-events: none;
// }
// #ai-callout.show { opacity: 1; }

showLearningMessage(type, text) {
  const now = this.gameTime;
  if (now - this.lastCalloutTime < this.calloutCooldown) return;

  const el = document.getElementById('ai-callout');
  el.textContent = text;
  el.className = ''; // reset
  el.classList.add('show');
  // Type-specific styling could be applied here

  this.lastCalloutTime = now;
  this.calloutCooldown = 8 + Math.random() * 4; // 8-12s between messages
  setTimeout(() => el.classList.remove('show'), 3000);
}
```

## Codebase-Specific Integration Points

These observations map exactly where new code integrates with the existing ~2937 lines:

### Entry Points for Pattern Detection (all in update loop)
1. **Line 1908**: `this.brain.trackPosition(...)` -- extend this to feed all detectors
2. **Line 2487**: `this.brain.onProjectileFired(...)` -- track what was fired and whether it was a counter-pattern
3. **Lines 1962-2013**: Projectile collision loop -- track near-misses and dodged projectiles for threat decay
4. **Lines 2015-2018**: Projectile off-screen (dodged) -- increment counter-miss if it was a counter-pattern shot

### Entry Points for Adaptive Difficulty
5. **Lines 1851-1868**: `getPhaseDef()` -- apply threat level modifiers here (already computes dynamic values)
6. **Lines 2413-2487**: `spawnProjectileFromWarning()` -- add counter-pattern targeting alongside existing aim logic

### Entry Points for Visibility
7. **Lines 924-939**: `getInsight()` -- expand with pattern-specific messages
8. **Lines 2899-2931**: `updateUI()` -- update brain panel and callout element
9. **Line 1824**: `this.announcePhase()` in `start()` -- add welcome-back taunt for returning players

### Entry Points for Persistence
10. **Lines 942-963**: `save()/load()` -- expand serialized data structure
11. **Line 2549**: `this.brain.save()` in `die()` -- save expanded data on death
12. **Lines 1757-1762**: Reset AI button -- must clear expanded data too

### Lines to Modify But NOT Break
- **Line 782**: `EVOLVED_BASE` deep copy pattern -- don't mutate PHASE_DEFS
- **Line 826-831**: `brain.reset()` -- this resets per-session data but must preserve cross-session data
- **Lines 2426-2458**: Existing aim logic in `spawnProjectileFromWarning()` -- add counter-pattern as an additional branch, don't replace existing branches

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hidden DDA (RE4 style) | Visible adversarial AI (player knows it's learning) | Emerging trend 2023+ | Player engagement increases when they feel outsmarted vs. when difficulty silently changes |
| Neural net for pattern detection | Heuristic detectors with sliding windows | Always valid for small pattern spaces | Neural nets add complexity without meaningful accuracy gain when pattern space is <20 categories |
| Single difficulty scalar | Multi-dimensional threat model (speed, accuracy, targeting, spawn rate) | Standard in modern DDA | Avoids "everything gets hard at once" feeling |
| Session-only learning | Cross-session persistence with decay | Standard since localStorage became universal | Creates returning player experience without stale data problems |

**Deprecated/outdated:**
- Full neural network approach for this scale of game: overkill, adds dependency, harder to tune
- Hard difficulty levels with thresholds: replaced by continuous adaptation
- Invisible DDA: works for some games, but this game's adversarial stance means visibility IS the feature

## Open Questions

1. **Exact timing for 30-60 second adaptation feel**
   - What we know: AI starts detecting patterns after ~15-20 samples, which at typical play speed is ~10-15 seconds. First counter-attack can fire at ~20-25 seconds. First callout message at ~15-20 seconds.
   - What's unclear: Whether this FEELS like 30-60 seconds to the player, or whether the callout timing needs to be deliberately delayed even after detection to match the expected pace.
   - Recommendation: Implement with natural detection timing, playtest, and add artificial delay if it feels too fast. Easier to slow down than speed up.

2. **Counter-pattern projectile visual distinction**
   - What we know: Player should be able to tell which projectiles are "AI counter-attacks" vs regular phase projectiles.
   - What's unclear: Best visual approach -- different color tint? Pulsing effect? Small icon? Trail color?
   - Recommendation: Subtle purple tint or glow matching the brain panel color (#8b5cf6) on counter-pattern projectiles. Keeps visual language consistent.

3. **How many detectors is enough?**
   - What we know: Requirements specify direction bias, safe zones, dodge sequences, panic moves, speed changes, cornering tendency.
   - What's unclear: Whether all six need to be distinct detectors or some can be merged.
   - Recommendation: Group into 4 detectors:
     1. **DirectionBiasDetector** (enhance existing) -- direction preferences + clockwise/counterclockwise patterns
     2. **SafeZoneDetector** (enhance existing zoneVisits) -- preferred zones + zone transition patterns
     3. **DodgeSequenceDetector** (new) -- repeating dodge sequences + timing patterns
     4. **PanicDetector** (new) -- speed changes, direction reversals, cornering under pressure

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of `index.html` lines 1-2937 -- all integration points, existing AI brain, game loop, and phase system verified against actual code
- [GameDeveloper: Secrets of Dynamic Difficulty Adjustment](https://www.gamedeveloper.com/design/more-than-meets-the-eye-the-secrets-of-dynamic-difficulty-adjustment) -- DDA invisibility principles, parameter tuning, RE4/L4D patterns
- [GameDeveloper: Building Bullet Hell Systems (Luna Abyss)](https://www.gamedeveloper.com/design/building-the-bullet-hell-systems-of-luna-abyss) -- bullet pattern design for adaptive difficulty

### Secondary (MEDIUM confidence)
- [IntechOpen: DDA Concepts, Techniques, and Applications](https://www.intechopen.com/chapters/1228576) -- academic overview of DDA implementation approaches
- [Springer: DDA Systematic Literature Review](https://link.springer.com/article/10.1007/s11042-024-18768-x) -- survey of performance metrics and player modeling
- [Paste Magazine: Bullet Hell Genre Lessons](https://www.pastemagazine.com/games/bullet-hell/what-other-games-can-learn-from-the-bullet-hell-ge) -- pattern readability in bullet hell design
- [Gamedevjs: localStorage for High Scores and Progress](https://gamedevjs.com/articles/using-local-storage-for-high-scores-and-game-progress/) -- localStorage patterns for browser games

### Tertiary (LOW confidence)
- [Talakat: Bullet Hell Generation (arXiv)](https://arxiv.org/pdf/1806.04718) -- procedural bullet pattern generation, useful background but not directly applicable
- Community discussions on adaptive AI in bullet hell games -- limited concrete implementations found

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero dependencies, all browser-native APIs already in use
- Architecture: HIGH -- based on direct analysis of existing 2937-line codebase with precise line references for every integration point
- Pitfalls: HIGH -- grounded in established DDA research and direct observation of existing code patterns
- Code examples: HIGH -- written against actual codebase structure, using existing patterns and variable names
- Discretion recommendations: MEDIUM -- based on game design judgment and DDA research, but requires playtesting validation

**Research date:** 2026-02-18
**Valid until:** Indefinite -- this is game logic using stable browser APIs, not library-version-dependent
