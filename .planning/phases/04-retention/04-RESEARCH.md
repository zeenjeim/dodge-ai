# Phase 4: Retention - Research

**Researched:** 2026-02-19
**Domain:** Daily challenge mode (date-seeded PRNG), personal best tracking (localStorage)
**Confidence:** HIGH

## Summary

Phase 4 adds two retention features to the existing ~3,700-line single HTML file game: a daily challenge mode where all players face the same date-seeded AI configuration, and a personal best list showing top 5 survival times with dates. The user has simplified this phase significantly -- streaks, cosmetic rewards, and global leaderboards are all deferred.

The technical core is a seeded pseudo-random number generator (PRNG) that replaces `Math.random()` during daily challenge gameplay so that projectile spawns, aim rolls, and type selections are deterministic for a given date. The standard approach is a lightweight inline PRNG (mulberry32 or the improved Weyl-sequence variant, ~6 lines of code) seeded with a hash of the date string. No external libraries are needed.

The personal best list is a straightforward localStorage array of `{time, date}` objects, sorted by time descending, capped at 5 entries. The game already stores `dodge-ai-best` (single best time) and `dodge-ai-games` (total count) -- this extends the pattern.

**Primary recommendation:** Implement a ~10-line seeded PRNG (hash function + generator) inline in the script. Wrap `Math.random()` calls in gameplay methods behind a `this.rng()` method that delegates to either `Math.random()` (normal mode) or the seeded generator (daily mode). Add a "DAILY" button to the start screen alongside "PLAY". Store personal bests as `dodge-ai-bests` JSON array in localStorage.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Phase 4 reduced to: daily challenge + personal best list
- Streaks REMOVED -- diminishing returns for a casual browser game
- Cosmetic rewards REMOVED -- unnecessary complexity
- Rationale: game will be public with ad monetization -- daily active users matter more than gamification depth
- Personal best list: show top 5 survival times with the date they happened
- Simple, clean, motivating -- no extra metadata needed

### Claude's Discretion
- **Daily challenge seed mechanism** -- how the date-based seed creates a consistent AI config
- **Entry point** -- how the player accesses the daily challenge (button, prompt, etc.)
- **Attempt limit** -- whether daily is one-shot or unlimited (best counts)
- **Completion criteria** -- what counts as "played" for daily purposes
- **Daily vs normal score separation** -- whether to keep one list or two
- **Daily reset timing** -- when the daily challenge rolls over
- **Visual distinction** -- how the daily challenge looks/feels different from normal play

### Deferred Ideas (OUT OF SCOPE)
- **Global leaderboard** -- requires a backend; powerful for virality but out of scope for single-file architecture
- **Streak system** -- could be re-added later if analytics show players want it
- **Cosmetic rewards** -- titles, visual effects for milestones; deferred unless retention data justifies the effort
- **Ad integration** -- monetization infrastructure is a separate future concern
</user_constraints>

## Standard Stack

### Core
| Tool | Size | Purpose | Why Standard |
|------|------|---------|--------------|
| Inline seeded PRNG (mulberry32 variant) | ~6 lines | Deterministic random numbers from a date seed | No dependencies, fast, proven quality, used across game dev |
| Inline string hash (cyrb53 or simpler) | ~8 lines | Convert date string to 32-bit integer seed | No dependencies, good distribution, well-tested |
| localStorage JSON array | Native | Store top 5 personal bests with dates | Already used throughout the game for brain/scores |
| `Date` API | Native | Date string generation and midnight rollover | Standard browser API, no timezone library needed |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `toLocaleDateString()` | Format dates for display in personal best list | Showing "Feb 19, 2026" next to survival times |
| `trackEvent()` | Analytics for daily challenge plays and completions | Already integrated from Phase 3 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline PRNG | seedrandom library (~5KB) | Library is battle-tested but adds external dependency to a zero-dependency game. Inline mulberry32 is sufficient for game randomness (not crypto). |
| Seeding all Math.random() calls | Seeding only AI config parameters | Seeding individual config params (speed, aimPct, etc.) would be simpler but wouldn't make the actual gameplay feel the same for all players. Projectile spawn positions, burst patterns, and type rolls all use Math.random(). For a true "same challenge" experience, the full random stream must be deterministic. |
| cyrb53 hash | Simple modular hash | cyrb53 has excellent distribution and collision resistance. Simpler hashes work but may produce clustering on sequential date strings. |
| UTC midnight rollover | Local midnight rollover | UTC ensures all players worldwide get the same challenge at the same wall-clock moment. Local midnight means the challenge changes at different real-world times. **Recommendation: use UTC** so the daily challenge is globally synchronized. |

**Installation:**
```
No packages. No build step. Everything is inline JavaScript.
```

## Architecture Patterns

### Pattern 1: Swappable RNG Method
**What:** Replace direct `Math.random()` calls in gameplay methods with `this.rng()` that delegates to either `Math.random()` (free play) or a seeded generator (daily challenge).
**When to use:** Any game that needs both free-play randomness and deterministic daily modes.
**Why this pattern:** The game currently has ~65 calls to `Math.random()` across spawning, aiming, powerup placement, boss behavior, and particle effects. Rather than conditionally branching at each call site, a single `rng()` method on the Game class provides a clean abstraction.

```javascript
// In Game class constructor/start:
this.rng = Math.random; // Default: normal mode

// For daily challenge:
startDaily() {
  const seed = hashDateString(getTodayUTC());
  const seededRng = mulberry32(seed);
  this.rng = seededRng;
  this.isDailyChallenge = true;
  this.start();
}

// Then replace Math.random() → this.rng() in:
// - spawnWarnings()
// - spawnProjectileFromWarning()
// - spawnPowerup()
// - spawnBoss()
// - particle effects (cosmetic -- could stay Math.random() if desired)
```

**Important distinction:** Particle effects, background stars, and other purely cosmetic randomness do NOT need to be seeded. Only gameplay-affecting randomness (projectile spawns, aim, types, powerups, boss spawns) must be deterministic. This keeps the visual experience varied while gameplay is identical.

### Pattern 2: Date-Based Seed Generation
**What:** Convert a UTC date string into a 32-bit integer seed for the PRNG.
**When to use:** Any daily challenge system that needs same-seed-for-same-day behavior.

```javascript
// Hash function: converts string to 32-bit integer
function hashString(str) {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }
  return h >>> 0; // Ensure unsigned 32-bit
}

// Date string: "2026-02-19" format (UTC)
function getTodayUTC() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

// Seeded PRNG: mulberry32 variant (equidistributed)
function mulberry32(seed) {
  return function() {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Usage:
const todaySeed = hashString(getTodayUTC()); // e.g., hashString("2026-02-19")
const rng = mulberry32(todaySeed);
rng(); // Always same first value for "2026-02-19"
rng(); // Always same second value
```

### Pattern 3: Personal Best List in localStorage
**What:** Store top N scores as a sorted JSON array with timestamps.
**When to use:** Any browser game tracking local high scores.

```javascript
// localStorage key: 'dodge-ai-bests'
// Schema: [{time: 42.3, date: "2026-02-19", daily: false}, ...]

function loadBests() {
  try {
    return JSON.parse(localStorage.getItem('dodge-ai-bests')) || [];
  } catch { return []; }
}

function saveBest(gameTime, isDaily) {
  const bests = loadBests();
  bests.push({
    time: parseFloat(gameTime.toFixed(1)),
    date: getTodayUTC(),
    daily: isDaily,
  });
  bests.sort((a, b) => b.time - a.time);
  const top5 = bests.slice(0, 5);
  localStorage.setItem('dodge-ai-bests', JSON.stringify(top5));
  return top5;
}
```

### Pattern 4: Mode Flag on Game Class
**What:** A simple boolean `isDailyChallenge` on the Game class controls mode-specific behavior (UI labels, analytics events, score storage).
**When to use:** When adding a second game mode to an existing single-mode game.

```javascript
// In start():
this.isDailyChallenge = false; // or true if daily

// In die():
if (this.isDailyChallenge) {
  trackEvent('daily-death', `Daily: ${this.gameTime.toFixed(1)}s`);
} else {
  trackEvent('death-phase-...', ...);
}

// In showGameOver():
// Show "DAILY CHALLENGE" header if isDailyChallenge
// Show daily-specific quip instead of generic one
```

### Recommended UI Structure

```
Start Screen (existing):
  DODGE AI
  Maximum effort. Minimum survival.
  Best: 42.3s
  [PLAY]              ← existing, starts normal mode
  [DAILY CHALLENGE]   ← NEW, starts daily mode (same visual weight as PLAY? or secondary?)
  [HOW TO PLAY]
  [STATS]             ← enhanced: now shows personal best list
  ...

During Daily Challenge:
  HUD shows "DAILY CHALLENGE" label or date badge
  Slightly different color accent (gold/amber #facc15 vs cyan #00f0ff?)
  Gameplay is identical mechanically

Game Over (daily mode):
  Shows "DAILY CHALLENGE" context
  Compares to today's best daily time
  Same retry/share/menu flow
```

### Anti-Patterns to Avoid
- **Overriding Math.random globally:** Never monkey-patch `Math.random` -- it would affect the entire page including analytics, third-party scripts, etc. Use a method on the Game instance instead.
- **Seeding cosmetic effects:** Particle trails, death explosions, and background stars should remain truly random. Only gameplay-affecting randomness needs seeding. This prevents the visual experience from feeling "canned."
- **Complex mode state machine:** With only two modes (normal/daily), a simple boolean is sufficient. Don't introduce a mode enum or state machine -- that's premature abstraction.
- **Separate Game class for daily:** The daily challenge uses the exact same Game class, mechanics, and phases. The only differences are: (1) seeded RNG, (2) UI labels, (3) analytics event names. Don't duplicate the Game class.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Seeded random numbers | Custom LCG or xorshift | Mulberry32 (proven, ~6 lines) | LCGs have known statistical weaknesses (sequential correlation). Mulberry32 passes gjrand tests and is equidistributed in its improved form. |
| Date string to integer | Naive char sum or multiply | FNV-1a hash or cyrb53 | Simple arithmetic on sequential date strings ("2026-02-19", "2026-02-20") produces correlated seeds. Hash functions distribute them evenly. |
| Score list management | Manual array manipulation | Sort + slice pattern | The sort-then-slice pattern handles insertions, duplicates, and cap enforcement in 3 lines. No need for custom insertion logic. |

**Key insight:** The seeded PRNG is the one piece that must be implemented correctly. A bad PRNG or a bad hash function will produce daily challenges that feel repetitive or have noticeable patterns (e.g., projectiles always coming from the same edge). The mulberry32 + FNV-1a combination is well-tested and produces good distribution.

## Common Pitfalls

### Pitfall 1: Math.random() Calls Outside the Game Loop
**What goes wrong:** The game uses `Math.random()` in places outside the main update/spawn loop -- such as `idleLoop()` background stars, `resize()`, and particle effects in `die()`. If these are accidentally seeded, the RNG sequence diverges between players who resize their window or have different idle durations.
**Why it happens:** Find-and-replace "Math.random()" catches everything, not just gameplay calls.
**How to avoid:** Only replace `Math.random()` with `this.rng()` inside methods that affect gameplay outcomes: `spawnWarnings()`, `spawnProjectileFromWarning()`, `spawnPowerup()`, `spawnBoss()`, `getPhaseDef()` (endgame cycle), and `activatePowerup()` (dash direction). Leave cosmetic calls as `Math.random()`.
**Warning signs:** Two players report different daily challenge experiences despite same date. Check if a cosmetic `Math.random()` call is interleaved with gameplay calls.

### Pitfall 2: Player Input Breaks Determinism
**What goes wrong:** The AI's pattern detection and counter-pattern firing depend on player input. Two players will always move differently, so the AI's `threatLevel`, counter-patterns, and zone-denial targeting will diverge.
**Why it happens:** The seeded PRNG only controls the "base" random stream. The AI's adaptive layer responds to player behavior, which is inherently non-deterministic.
**How to avoid:** Accept this as a feature, not a bug. The daily challenge means "same starting conditions" -- same projectile spawn sequence, same type rolls, same powerup timing. The AI still adapts to each player. This is actually more interesting than fully deterministic gameplay. Document this clearly: "Same challenge, different AI adaptation."
**Warning signs:** Players comparing notes and noticing different projectile patterns after 30+ seconds. This is expected and correct -- divergence increases over time as adaptive systems respond differently.

### Pitfall 3: Timezone-Based Challenge Desync
**What goes wrong:** Player A in UTC+0 and Player B in UTC+12 get different daily challenges because the date string is generated from local time.
**Why it happens:** `new Date().toISOString().slice(0, 10)` uses UTC, but `new Date().toLocaleDateString()` uses local time.
**How to avoid:** Always use UTC for seed generation: `getUTCFullYear()`, `getUTCMonth()`, `getUTCDate()`. Display the date to the player in their local format, but generate the seed from UTC.
**Warning signs:** Players in different timezones report different challenge experiences.

### Pitfall 4: RNG Call Count Divergence
**What goes wrong:** If any code path conditionally calls `rng()` (e.g., burst projectiles only sometimes spawn), the RNG sequence can diverge between players at the same game time because different players trigger different branches.
**Why it happens:** Seeded PRNGs are sequential -- the Nth call always returns the same value, but if Player A makes 100 RNG calls by t=10s and Player B makes 105, all subsequent values differ.
**How to avoid:** This is inherent and acceptable for this game. The adaptive AI already means no two players have identical experiences. The seed ensures the same "shape" of challenge (similar difficulty curve, similar projectile mix) without frame-perfect identical gameplay. This is the standard approach used by games like Spelunky and Hades for daily challenges.
**Warning signs:** None -- this is expected behavior. Don't try to fix it.

### Pitfall 5: localStorage Best List Migration
**What goes wrong:** Existing players have `dodge-ai-best` (single float) from the old system. If the new personal best list (`dodge-ai-bests`) doesn't migrate this value, their existing best time disappears.
**Why it happens:** New feature replaces old storage key without migration.
**How to avoid:** On first load, check if `dodge-ai-best` exists and `dodge-ai-bests` does not. If so, create the new array with the old best time as the first entry (with an estimated date or "Pre-update" label). Then continue using only the new key. Keep reading `dodge-ai-best` for backward compatibility but write to the new key.
**Warning signs:** Players complaining their best time disappeared after an update.

## Code Examples

### Complete Seeded PRNG Implementation
```javascript
// Source: bryc/code PRNGs.md + tommyettinger/mulberry32 gist (verified)
// FNV-1a hash: string → 32-bit unsigned integer
function fnv1aHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Mulberry32: 32-bit seed → sequential pseudo-random floats [0, 1)
function mulberry32(seed) {
  return function() {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Daily seed: UTC date → deterministic seed
function getDailySeed() {
  const d = new Date();
  const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  return fnv1aHash('dodge-ai-daily-' + dateStr);
}
```

### Personal Best List Management
```javascript
const BESTS_KEY = 'dodge-ai-bests';
const MAX_BESTS = 5;

function loadBests() {
  try {
    return JSON.parse(localStorage.getItem(BESTS_KEY)) || [];
  } catch { return []; }
}

function saveBest(gameTime, isDaily) {
  const bests = loadBests();
  const today = new Date();
  bests.push({
    time: parseFloat(gameTime.toFixed(1)),
    date: today.toISOString().slice(0, 10),
    daily: isDaily,
  });
  bests.sort((a, b) => b.time - a.time);
  localStorage.setItem(BESTS_KEY, JSON.stringify(bests.slice(0, MAX_BESTS)));
}

// Migration from old single-value format
function migrateBestTime() {
  const oldBest = parseFloat(localStorage.getItem('dodge-ai-best'));
  const newBests = localStorage.getItem(BESTS_KEY);
  if (oldBest > 0 && !newBests) {
    localStorage.setItem(BESTS_KEY, JSON.stringify([{
      time: oldBest,
      date: 'legacy',
      daily: false,
    }]));
  }
}
```

### Daily Challenge Entry Point
```javascript
// HTML: Add button to start screen menu
// <button class="menu-btn" id="btn-daily">DAILY CHALLENGE</button>

// JS: In setupInput()
document.getElementById('btn-daily').onclick = () => {
  const seed = getDailySeed();
  this.rng = mulberry32(seed);
  this.isDailyChallenge = true;
  this.start();
};

// In start(): reset RNG for non-daily games
if (!this.isDailyChallenge) {
  this.rng = Math.random;
}
```

## Discretion Recommendations

Based on the Claude's Discretion items from CONTEXT.md, here are specific recommendations:

### Daily Challenge Seed Mechanism
**Recommendation:** FNV-1a hash of `"dodge-ai-daily-YYYY-MM-DD"` (UTC) fed into mulberry32 PRNG.
**Rationale:** The prefix `"dodge-ai-daily-"` ensures the hash doesn't collide with other uses. UTC date ensures global consistency. FNV-1a is fast and well-distributed. Mulberry32 passes statistical quality tests.
**Confidence:** HIGH -- these are standard, well-tested algorithms.

### Entry Point
**Recommendation:** Add a "DAILY CHALLENGE" button to the start screen, visually distinct from PLAY but at the same hierarchy level. Position it right below PLAY. Use amber/gold color (#facc15) to distinguish from the cyan PLAY button.
**Rationale:** The daily challenge should be immediately visible and one-tap accessible. Hiding it in a submenu reduces daily engagement. The gold/amber color is already used for powerups in the game, creating a visual association with "special."
**Confidence:** HIGH -- standard pattern from Wordle, NYT Games, etc.

### Attempt Limit
**Recommendation:** Unlimited attempts, best time counts. No "one-shot" restriction.
**Rationale:** One-shot daily challenges increase stakes but also increase frustration. For a casual browser game optimizing for daily active users (not competitive integrity), letting players retry is better for retention. Players self-select their engagement depth. Store and display "today's daily best" so there's still a personal competition aspect.
**Confidence:** HIGH -- the user explicitly wants SIMPLE and is optimizing for DAU, not competitive purity.

### Completion Criteria
**Recommendation:** Any death in daily mode counts as a completion (the player "played" the daily). Track a `dodge-ai-daily-last` localStorage key with the UTC date of the last daily play, useful for potential future streak features.
**Rationale:** There's no meaningful "completion" in a survival game -- you always die. Dying = playing. Tracking last daily play date is cheap insurance for future streak features even though streaks are deferred.
**Confidence:** HIGH.

### Daily vs Normal Score Separation
**Recommendation:** Single unified personal best list. Each entry has a `daily` boolean flag. Display a small indicator (e.g., gold dot or "D" label) next to daily scores in the list.
**Rationale:** Two separate lists add UI complexity for minimal value. A unified list is simpler and lets players feel their daily time "counts" toward their overall bests. The `daily` flag preserves the data for future analysis if separate lists are ever wanted.
**Confidence:** MEDIUM -- reasonable people could prefer separate lists, but the user specifically asked for SIMPLE.

### Daily Reset Timing
**Recommendation:** UTC midnight (00:00 UTC). Display "New challenge in Xh Ym" countdown on the start screen when in daily mode context.
**Rationale:** UTC midnight means the challenge changes at the same absolute moment worldwide. This is simpler to implement and prevents timezone-based exploits (playing two dailies in one real day by crossing timezone boundaries). A countdown creates urgency and a reason to return.
**Confidence:** HIGH -- standard approach for global daily challenges.

### Visual Distinction
**Recommendation:** Minimal but clear changes during daily challenge:
1. HUD shows "DAILY CHALLENGE" label in gold (#facc15) where phase info normally shows (the phase info still appears but the daily label is above it)
2. Player glow is amber instead of cyan (subtle but noticeable)
3. Game over screen header says "DAILY CHALLENGE" instead of "Wow. That happened."
4. Start screen daily button shows today's date and "today's best" time if one exists

**Rationale:** The user wants minimal UI additions. Changing accent colors and labels is the lightest-touch distinction possible. The gameplay itself should feel identical -- same phases, same bosses, same mechanics. Only the framing differs.
**Confidence:** MEDIUM -- visual design is subjective, but this approach is minimal and reversible.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single high score | Top N list with metadata | Standard since 2010s | Richer player history, more motivating |
| Server-seeded challenges | Client-side date-seeded PRNG | Post-Wordle (2022+) | No backend needed, same result |
| Full determinism (replay-exact) | Partial determinism (same conditions, different adaptation) | Standard for AI games | More interesting than frame-perfect replays; AI adapts differently per player |
| Local timezone daily reset | UTC daily reset | Standard since Wordle | Global consistency, simpler implementation |

**Deprecated/outdated:**
- LCG (Linear Congruential Generator) PRNGs: Poor statistical quality, sequential correlation. Use mulberry32 or sfc32 instead.
- `Math.random()` monkey-patching: Never globally override built-in functions. Use instance methods.

## Open Questions

1. **Screen real estate for personal best list**
   - What we know: The stats modal already exists with a 2x3 grid layout. The personal best list could go there.
   - What's unclear: Whether the bests should appear on the start screen (always visible), in the stats modal (one click away), or both.
   - Recommendation: Show the single best time on the start screen (as now) and the full top 5 list in the stats modal. This avoids cluttering the start screen.

2. **Daily challenge and share card integration**
   - What we know: Phase 3 added a share card generator. The ROADMAP mentions "share card can include daily challenge results."
   - What's unclear: Whether the share card should visually indicate it was a daily challenge.
   - Recommendation: Add a small "DAILY CHALLENGE" badge to the share card when `isDailyChallenge` is true. Minimal change to the existing `generateShareCard()` method.

3. **Backward compatibility for `dodge-ai-best`**
   - What we know: The game currently reads/writes `dodge-ai-best` as a single float. Multiple places reference it.
   - What's unclear: Whether to keep the old key for backward compatibility or fully migrate.
   - Recommendation: Migrate on first load (copy old value to new array), then keep both keys in sync for one release cycle. The `updateStartScreen()` method and `showGameOver()` method can read from the new array's first entry instead of the old key.

## Sources

### Primary (HIGH confidence)
- Game source code (`index.html`, ~3,700 lines) -- direct inspection of Game class, AIBrain, localStorage usage, Math.random() call sites
- [bryc/code PRNGs.md](https://github.com/bryc/code/blob/master/jshash/PRNGs.md) -- Comprehensive PRNG comparison, mulberry32 quality assessment ("best 2^32 state JS PRNG, passes gjrand")
- [tommyettinger/mulberry32 gist](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c) -- Original mulberry32 author, updated notes on equidistribution fix

### Secondary (MEDIUM confidence)
- [Wordle daily mechanism analysis](https://epic.blog/hacking/2022/01/26/cracking-the-wordle-game.html) -- Verified date-based seed pattern: compute day offset from epoch, use as index/seed
- [gamedevjs.com localStorage high scores](https://gamedevjs.com/articles/using-local-storage-for-high-scores-and-game-progress/) -- Standard pattern for JSON array scores in localStorage
- [cyrb53 hash implementation](https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js) -- Reference for string-to-integer hash (FNV-1a recommended as simpler alternative for this use case)

### Tertiary (LOW confidence)
- [TC39 proposal-seeded-random](https://tc39.es/proposal-seeded-random/) -- Future JS standard for seeded PRNG (ChaCha 12). Not yet available in browsers. Monitor but don't depend on.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- inline PRNG + hash is well-established, no dependencies needed
- Architecture: HIGH -- swappable RNG pattern is standard in game dev, personal best list is trivial
- Pitfalls: HIGH -- all pitfalls identified from direct code inspection and known PRNG issues
- Discretion recommendations: MEDIUM -- visual design choices are subjective, but recommendations are grounded in user's "keep it simple" directive

**Research date:** 2026-02-19
**Valid until:** 2026-04-19 (60 days -- stable domain, no fast-moving dependencies)
