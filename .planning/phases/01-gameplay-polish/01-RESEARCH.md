# Phase 1: Gameplay Polish - Research

**Researched:** 2026-02-18
**Domain:** Canvas game death feedback, mobile touch UX, browser gesture prevention, safe area insets
**Confidence:** HIGH

## Summary

This phase covers four requirements: death visual feedback (POLISH-01), mobile touch offset (POLISH-02), browser gesture prevention (POLISH-03), and device safe area support (POLISH-04). All four are achievable with zero external dependencies using established browser APIs -- CSS environment variables, touch event handling, CSS overscroll-behavior, and canvas drawing techniques.

The game is a single HTML file (~2770 lines) with all logic in one `<script>` block. The current `die()` method (line 2455) creates a particle explosion and shows a game-over screen, but stores zero information about what killed the player. The collision detection (lines 1904-1933 for projectiles, 1990-2019 for bosses) detects the lethal entity but immediately calls `die()` without recording it. The touch input (lines 1645-1646) maps touch position directly to the player target with no offset. There is no safe area handling -- the viewport meta tag (line 5) has `user-scalable=no` but no `viewport-fit=cover`, and no `env()` CSS usage exists.

**Primary recommendation:** Capture the killing entity (type, position, direction) at collision time, then use that data for a brief freeze-frame with directional indicator before transitioning to game over. For mobile, add a configurable Y-offset to touch input and layer CSS/JS defenses against browser gestures.

## Standard Stack

### Core

No external libraries needed. Everything uses built-in browser APIs.

| API/Feature | Purpose | Browser Support |
|-------------|---------|-----------------|
| Canvas 2D API | Death indicator rendering (arrows, highlights, freeze frame) | Universal |
| `touch-action: none` CSS | Primary gesture prevention | Universal |
| `overscroll-behavior: none` CSS | Prevent pull-to-refresh, scroll chaining | Baseline since Sep 2022 |
| `env(safe-area-inset-*)` CSS | Safe area inset values | Baseline since iOS 11.2, all modern browsers |
| `viewport-fit=cover` meta | Enable edge-to-edge rendering | iOS Safari, Chrome Android |
| `gesturestart`/`gesturechange` events | iOS-specific pinch prevention | iOS Safari |
| `event.scale` check on `touchmove` | Pinch-to-zoom prevention fallback | iOS Safari |

### Supporting

| Technique | Purpose | When to Use |
|-----------|---------|-------------|
| `CSS max()` with `env()` | Ensure minimum padding even without notch | When combining safe area with base padding |
| `@supports(padding: max(0px))` | Feature detection for max() | Progressive enhancement for older browsers |
| `performance.now()` | Frame-precise death timing | Already used in game loop |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS `env()` for safe areas | JavaScript `screen.availWidth` | JS is less reliable, CSS is declarative and auto-updates on rotation |
| Canvas-drawn death indicator | DOM overlay with HTML/CSS | Canvas is consistent with existing rendering pipeline, avoids z-index battles |
| Fixed touch offset (e.g., 50px) | Dynamic offset based on touch pressure/area | Pressure API has poor support; fixed offset is simpler and proven |

## Architecture Patterns

### Pattern 1: Death Context Capture

**What:** When collision is detected, record the killing entity's details before calling `die()`.

**When to use:** At every collision point in `update()` -- there are exactly 4 places where `this.die()` is called (2 for projectiles at line 1932, 2 for bosses at line 2018).

**Current code flow:**
```
collision detected -> this.die() -> particle explosion -> setTimeout -> showGameOver()
```

**New code flow:**
```
collision detected -> capture deathContext -> this.die(deathContext) -> freeze frame with indicator -> particle explosion -> setTimeout -> showGameOver(deathContext)
```

**Data to capture:**
```javascript
// Store on the Game instance at collision time
this.deathContext = {
  killerType: 'projectile', // or 'boss'
  killerSubtype: projectile.type, // 'normal', 'splitter', 'bouncer', 'wave', 'accel', 'homing'
  killerColor: projectile.color,
  killerX: projectile.x,
  killerY: projectile.y,
  killerVx: projectile.vx,
  killerVy: projectile.vy,
  playerX: this.player.x,
  playerY: this.player.y,
  directionAngle: Math.atan2(projectile.y - this.player.y, projectile.x - this.player.x),
  // For boss kills:
  bossName: boss?.bossType?.name || null,
  bossShape: boss?.bossType?.shape || null,
};
```

**Confidence:** HIGH -- this is a straightforward data capture pattern. The collision detection code is clear and all needed values are in scope at the collision points.

### Pattern 2: Death Freeze Frame with Directional Arrow

**What:** Brief freeze (200-400ms) showing the killing projectile/boss highlighted and a directional arrow pointing from player to killer.

**When to use:** Inside `renderDeathFrame()` (line 2482), which already renders one final frame.

**Implementation approach:**
1. In `die()`, set `this.deathFreezeTimer = 0.3` (300ms)
2. In `renderDeathFrame()`, draw a highlighted ring around the killer and an arrow from player to killer
3. The directional arrow should be drawn as a line from player center toward the killer, with an arrowhead
4. The killer projectile/boss should pulse with a bright outline
5. After freeze timer expires, proceed with existing death particle animation

**Visual elements:**
- Bright ring around killer (white or killer's color, pulsing)
- Arrow line from player to killer (white, 2-3px, with arrowhead)
- Brief screen flash (white overlay at 10-15% opacity, fading)
- Optional: text label showing projectile type name near the killer

**Confidence:** HIGH -- all rendering primitives already exist in the codebase (arc, moveTo/lineTo, globalAlpha).

### Pattern 3: Touch Offset for Mobile

**What:** On touch devices, the player character renders Y pixels above the actual touch point so the finger doesn't obscure it.

**When to use:** In `setupInput()` touch handlers (lines 1645-1646).

**Implementation approach:**
```javascript
// Detect touch device once
this.isTouchDevice = false;

// In setupInput():
this.canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  this.isTouchDevice = true;
  const touch = e.touches[0];
  onMove(touch.clientX, touch.clientY - this.touchOffsetY);
}, { passive: false });

this.canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const touch = e.touches[0];
  onMove(touch.clientX, touch.clientY - this.touchOffsetY);
}, { passive: false });

// Default offset: 50px above touch point (tunable)
this.touchOffsetY = 50;
```

**Key consideration:** The offset should only apply when touch input is active. Mouse input must NOT be offset. The current code already has separate `mousemove` and `touchmove` handlers, so this is a clean separation.

**Edge case:** When the player is near the top of the screen and the offset would push the target above the canvas, clamp the target Y to `playerRadius` minimum. This clamping already exists in `update()` at line 1843: `this.player.y = Math.max(pr, Math.min(this.h - pr, this.player.y))`.

**Confidence:** HIGH -- minimal code change, well-understood pattern used in many mobile games.

### Pattern 4: Safe Area CSS Integration

**What:** Use `viewport-fit=cover` and `env(safe-area-inset-*)` to ensure game content respects device notches and home indicators.

**Current viewport meta tag (line 5):**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
```

**Updated viewport meta tag:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
```

**CSS changes needed:**
```css
/* HUD elements need safe-area padding */
#hud {
  top: max(16px, env(safe-area-inset-top, 16px));
  left: max(16px, env(safe-area-inset-left, 16px));
}

#brain-panel {
  top: max(16px, env(safe-area-inset-top, 16px));
  right: max(16px, env(safe-area-inset-right, 16px));
}

#hud-powerups {
  bottom: max(16px, env(safe-area-inset-bottom, 16px));
}
```

**Canvas considerations:** The canvas itself is `position: fixed; top: 0; left: 0` and fills the full viewport. With `viewport-fit=cover`, the canvas will extend behind the notch/home indicator. This is actually desirable for the game background. What matters is that:
1. The player cannot be moved into unsafe areas (clamping)
2. HUD elements are inset from unsafe areas (CSS env())
3. Power-up spawning respects safe areas (JS margins)

**JavaScript safe area awareness:**
```javascript
// Read safe area insets from CSS custom properties or getComputedStyle
// These can be used for player clamping and spawn margins
getSafeArea() {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sa-top')) || 0,
    bottom: parseInt(style.getPropertyValue('--sa-bottom')) || 0,
    left: parseInt(style.getPropertyValue('--sa-left')) || 0,
    right: parseInt(style.getPropertyValue('--sa-right')) || 0,
  };
}
```

To bridge CSS env() values into JavaScript for canvas clamping, use a CSS custom property intermediary:
```css
:root {
  --sa-top: env(safe-area-inset-top, 0px);
  --sa-bottom: env(safe-area-inset-bottom, 0px);
  --sa-left: env(safe-area-inset-left, 0px);
  --sa-right: env(safe-area-inset-right, 0px);
}
```

Then read with `getComputedStyle()` in `resize()` and use for player clamping boundaries and spawn margins.

**Confidence:** HIGH -- `viewport-fit=cover` and `env()` are well-documented by WebKit and MDN, widely supported since 2018.

### Pattern 5: Browser Gesture Prevention (Layered Defense)

**What:** Multiple CSS and JS techniques layered to prevent pull-to-refresh, swipe-back, and pinch-to-zoom.

**Layer 1 - CSS (already partially present):**
```css
body {
  touch-action: none;           /* Already present (line 18) */
  -webkit-touch-callout: none;  /* Already present (line 19) */
  -webkit-user-select: none;    /* Already present (line 20) */
  user-select: none;            /* Already present (line 21) */
  overscroll-behavior: none;    /* NEW: prevents pull-to-refresh and swipe navigation */
}

html {
  overscroll-behavior: none;    /* NEW: must be on html too for full coverage */
}
```

**Layer 2 - JavaScript (for iOS Safari pinch-to-zoom bypass):**
```javascript
// iOS Safari ignores user-scalable=no, so add JS prevention
document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturechange', e => e.preventDefault(), { passive: false });
document.addEventListener('gestureend', e => e.preventDefault(), { passive: false });

// Additional pinch prevention via touchmove scale check
document.addEventListener('touchmove', e => {
  if (e.scale !== undefined && e.scale !== 1) {
    e.preventDefault();
  }
}, { passive: false });
```

**Layer 3 - Existing touch handlers (already present):**
The canvas touchmove and touchstart handlers already call `e.preventDefault()` with `{ passive: false }`. This prevents default browser handling for touches on the canvas.

**What's already handled vs. what's missing:**

| Gesture | Current Status | Fix Needed |
|---------|---------------|------------|
| Pull-to-refresh | `touch-action: none` on body partially prevents | Add `overscroll-behavior: none` on html + body |
| Swipe-back (Chrome Android) | Not prevented | Add `overscroll-behavior: none` |
| Pinch-to-zoom (iOS Safari) | `user-scalable=no` is IGNORED by iOS Safari | Add JS gesturestart/gesturechange prevention |
| Pinch-to-zoom (Android) | `user-scalable=no` works on most Android browsers | Already handled |
| Double-tap zoom | `touch-action: none` prevents this | Already handled |
| Long-press context menu | `-webkit-touch-callout: none` handles this | Already handled |

**Confidence:** HIGH -- `overscroll-behavior` is widely supported (baseline Sep 2022). iOS gesture events are well-documented. The layered approach ensures coverage across browsers.

### Anti-Patterns to Avoid

- **Replaying the last N seconds of gameplay on death:** Too complex for this phase, requires recording game state history. A static freeze-frame with directional indicator achieves the "earned death" feeling without replay infrastructure.
- **Using a fixed pixel offset for all screen sizes:** The touch offset should be relative or at minimum tested at common device sizes. 50px works well for phones (375-430px wide) but might need adjustment.
- **Querying safe area insets on every frame:** Read once in `resize()` and cache. `getComputedStyle()` triggers layout recalc and should not be in the hot path.
- **Putting `overscroll-behavior` only on body:** Must also be on `html` element for Chrome to respect it fully.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Safe area detection | Custom JS to detect notch via screen dimensions | CSS `env(safe-area-inset-*)` | OS provides exact values; JS heuristics break on new devices |
| Gesture prevention | Custom multi-touch angle detection | CSS `overscroll-behavior: none` + `touch-action: none` | Browser handles this correctly at CSS level |
| Pinch-to-zoom on iOS | Complex touch distance tracking | `gesturestart`/`gesturechange` event prevention | Safari provides dedicated gesture events |
| Direction arrow math | Custom trigonometry for arrow rendering | `Math.atan2(dy, dx)` + standard arrow drawing | Already used throughout codebase (Projectile.draw line 1180) |

**Key insight:** All four requirements use standard browser platform features. No polyfills, no libraries, no complex algorithms needed. The effort is in integration with the existing game code, not in solving novel problems.

## Common Pitfalls

### Pitfall 1: iOS Safari Ignores `user-scalable=no`

**What goes wrong:** The game already has `user-scalable=no` in the viewport meta tag, but iOS Safari intentionally ignores this for accessibility reasons. Players can still pinch-to-zoom during gameplay.
**Why it happens:** Apple decided this is an accessibility requirement -- users must always be able to zoom. This has been the case since iOS 10.
**How to avoid:** Add JavaScript `gesturestart`/`gesturechange` event listeners with `preventDefault()`. These events are Safari-specific and reliably prevent pinch gestures.
**Warning signs:** Testing only on Android where `user-scalable=no` works, then getting bug reports from iOS users.

### Pitfall 2: Safe Area Insets Are Zero on Non-Notched Devices

**What goes wrong:** Code that assumes safe area insets will always be positive values, leading to zero padding on devices without notches.
**Why it happens:** `env(safe-area-inset-top)` returns 0 on devices without a notch, even with `viewport-fit=cover`.
**How to avoid:** Always use `max(desired-padding, env(safe-area-inset-*))` pattern, never `env()` alone as the only padding.
**Warning signs:** HUD elements flush against screen edges on rectangular-screen devices.

### Pitfall 3: Touch Offset Creates Unreachable Zones

**What goes wrong:** With a 50px upward offset, when the player touches near the top of the screen, the game target goes 50px above their finger -- potentially off-screen or into the notch area.
**Why it happens:** Naive offset subtraction without clamping.
**How to avoid:** The existing player clamping in `update()` (line 1842-1843) already prevents the player from going off-screen. But the target position itself should also be clamped to safe areas, so the player doesn't "stick" at the top edge while the finger is 50px below.
**Warning signs:** Player gets stuck at top of screen during mobile gameplay.

### Pitfall 4: Death Indicator Obscures Gameplay Feel

**What goes wrong:** The death freeze-frame is too long or too visually noisy, breaking the flow of "die -> instant retry" that's critical for arcade games.
**Why it happens:** Over-engineering the death indicator with too many visual elements or too long a pause.
**How to avoid:** Keep freeze frame brief (200-300ms). Use a subtle directional arrow and highlight, not a full killcam replay. The game-over screen (which already has phase quips and AI commentary) carries the narrative weight -- the freeze frame just answers "what hit me?".
**Warning signs:** Playtesters say "retry feels slower" after the change.

### Pitfall 5: `overscroll-behavior` on Wrong Element

**What goes wrong:** Setting `overscroll-behavior: none` only on `body` doesn't prevent pull-to-refresh in all browsers.
**Why it happens:** Chrome requires it on `html` as well. The behavior is scoped to the scroll container, and `html` is the outermost scroll container.
**How to avoid:** Apply to both `html` and `body` selectors.
**Warning signs:** Pull-to-refresh still works in Chrome Android after adding the CSS.

### Pitfall 6: Safe Area Values Not Updating on Rotation

**What goes wrong:** Safe area insets are read once on load and cached, but when the device rotates, inset values change (e.g., notch moves from top to left in landscape).
**Why it happens:** Not re-reading insets on resize/orientation change.
**How to avoid:** Re-read safe area CSS values in the `resize()` method, which already fires on `window.resize`. The CSS `env()` values update automatically for DOM elements, but JS-side cached values need refreshing.
**Warning signs:** Game works in portrait but HUD overlaps notch in landscape.

## Code Examples

### Death Context Capture (at collision point)

```javascript
// In the projectile collision loop (around line 1904-1933):
if (dist < hitDist) {
  if (this.effects.ghost.active) { /* ... */ continue; }
  if (this.effects.shield.active) { /* ... */ continue; }
  // NEW: capture what killed the player
  this.deathContext = {
    type: 'projectile',
    subtype: p.type,
    homing: p.homing,
    color: p.color,
    x: p.x,
    y: p.y,
    vx: p.vx,
    vy: p.vy,
    angle: Math.atan2(p.y - this.player.y, p.x - this.player.x),
    playerX: this.player.x,
    playerY: this.player.y,
    bossName: null,
  };
  this.die();
  return;
}

// In the boss collision loop (around line 1996-2019):
// Similar capture with bossName and bossType info
```

### Directional Kill Arrow (in renderDeathFrame)

```javascript
// Draw directional arrow from player to killer
renderDeathIndicator(ctx) {
  const d = this.deathContext;
  if (!d) return;

  const angle = d.angle;
  const px = d.playerX;
  const py = d.playerY;
  const kx = d.x;
  const ky = d.y;

  // Pulsing highlight ring around killer
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(kx, ky, (d.type === 'boss' ? 30 : 12), 0, Math.PI * 2);
  ctx.stroke();

  // Arrow line from player to killer
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = '#ff3355';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(kx, ky);
  ctx.stroke();

  // Arrowhead
  const headLen = 12;
  ctx.beginPath();
  ctx.moveTo(kx, ky);
  ctx.lineTo(
    kx - headLen * Math.cos(angle - 0.4),
    ky - headLen * Math.sin(angle - 0.4)
  );
  ctx.moveTo(kx, ky);
  ctx.lineTo(
    kx - headLen * Math.cos(angle + 0.4),
    ky - headLen * Math.sin(angle + 0.4)
  );
  ctx.stroke();

  // Label (e.g., "HOMING" or "SPLITTER" or boss name)
  const label = d.bossName || d.subtype.toUpperCase();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = d.color;
  ctx.font = 'bold 10px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(label, kx, ky - 18);

  ctx.globalAlpha = 1;
}
```

### Safe Area CSS Variables Bridge

```css
:root {
  --sa-top: env(safe-area-inset-top, 0px);
  --sa-bottom: env(safe-area-inset-bottom, 0px);
  --sa-left: env(safe-area-inset-left, 0px);
  --sa-right: env(safe-area-inset-right, 0px);
}

html, body {
  overscroll-behavior: none;
}

#hud {
  top: max(16px, calc(8px + var(--sa-top)));
  left: max(16px, calc(8px + var(--sa-left)));
}

#brain-panel {
  top: max(16px, calc(8px + var(--sa-top)));
  right: max(16px, calc(8px + var(--sa-right)));
}

#hud-powerups {
  bottom: max(16px, calc(8px + var(--sa-bottom)));
}
```

### JavaScript Safe Area Reading (in resize())

```javascript
resize() {
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.w = this.canvas.width;
  this.h = this.canvas.height;

  // Read safe area insets for canvas-side clamping
  const style = getComputedStyle(document.documentElement);
  this.safeArea = {
    top: parseFloat(style.getPropertyValue('--sa-top')) || 0,
    bottom: parseFloat(style.getPropertyValue('--sa-bottom')) || 0,
    left: parseFloat(style.getPropertyValue('--sa-left')) || 0,
    right: parseFloat(style.getPropertyValue('--sa-right')) || 0,
  };
}
```

### iOS Pinch Prevention

```javascript
// Add in constructor or setupInput():
document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturechange', e => e.preventDefault(), { passive: false });
document.addEventListener('gestureend', e => e.preventDefault(), { passive: false });

// Additional fallback for multi-touch pinch
document.addEventListener('touchmove', e => {
  if (e.scale !== undefined && e.scale !== 1) {
    e.preventDefault();
  }
}, { passive: false });
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `user-scalable=no` to prevent zoom | CSS `touch-action: none` + JS gesture events | iOS 10 (2016) | `user-scalable=no` is ignored on iOS Safari |
| `constant()` for safe area | `env()` for safe area | iOS 11.2 (2017) | `constant()` is deprecated |
| JS scroll prevention hacks | `overscroll-behavior: none` CSS | Baseline Sep 2022 | Single CSS property replaces complex JS |
| JavaScript-based device detection for notch | CSS `env(safe-area-inset-*)` | iOS 11 (2017) | Declarative, auto-updates, works on all notched devices |

**Deprecated/outdated:**
- `constant(safe-area-inset-*)`: Replaced by `env()`. Only needed for iOS 11.0-11.1 (negligible user base in 2026).
- JavaScript scroll event cancellation for pull-to-refresh: Use `overscroll-behavior: none` instead.
- CSS `padding: env(safe-area-inset-top)` without fallback: Always use `max()` or fallback value to handle non-notched devices.

## Codebase-Specific Notes

These observations about the existing `index.html` are critical for the planner:

### Death Flow (lines 2455-2537)
1. `die()` is called from 4 places: projectile collision (line 1932), boss collision (line 2018), and their identical paths
2. `die()` sets `this.running = false`, saves AI brain, increments game count, creates death particles, calls `renderDeathFrame()`, then `setTimeout(() => this.showGameOver(), 600)`
3. `renderDeathFrame()` renders one final frame of projectiles/particles/shockwaves, then starts a `deathAnim` requestAnimationFrame loop that fades particles out
4. The 600ms delay before game-over screen is the window for showing the death indicator

### Touch Input (lines 1642-1646)
1. `setupInput()` creates a shared `onMove(x, y)` closure that sets `this.targetX` and `this.targetY`
2. `mousemove` calls `onMove(e.clientX, e.clientY)` -- no offset
3. `touchmove` and `touchstart` call `onMove(e.touches[0].clientX, e.touches[0].clientY)` with `preventDefault()`
4. The player position lerps toward target in `update()` at line 1836-1837 with `PLAYER_LERP = 0.12`

### Canvas Sizing (line 1635-1639)
1. `resize()` sets canvas to `window.innerWidth` x `window.innerHeight`
2. Player clamping uses `playerRadius` as boundary margin (lines 1842-1843)
3. Powerup spawning uses `margin = 60` (line 2083) -- should incorporate safe area
4. Warning/projectile spawning uses edge positions (lines 2291-2297, 2310-2314) -- these are fine at screen edges

### Existing Gesture Prevention (lines 18-22)
1. `touch-action: none` on body -- good, prevents most touch gestures
2. `-webkit-touch-callout: none` -- good, prevents iOS callout
3. `user-select: none` -- good, prevents text selection
4. `cursor: default` on body -- irrelevant for touch
5. MISSING: `overscroll-behavior: none` on html and body
6. MISSING: JavaScript gesture event prevention for iOS pinch

### Game Over Screen (lines 698-723)
1. Shows time, phase quip, dodged count, closest call, games played
2. Has "SHARE", "RETRY", "MENU" buttons
3. Has `go-ai-learned` div for AI commentary
4. Currently no mention of what killed the player -- this is where POLISH-01 adds the death cause info

### Projectile Types with Distinct Visual Identity
Already implemented with shapes and colors:
- Normal: circle, phase color
- Homing: star, #ffaa00
- Splitter: diamond, #ff69b4
- Bouncer: triangle, #00ff88
- Wave: hexagon, #a78bfa
- Accel: arrow, #ff4400

This means the death indicator can reference both the shape and color to clearly communicate "this type of projectile killed you."

## Open Questions

1. **Touch offset magnitude (50px):** The 50px offset is a starting point. It may need tuning per device size. This can be addressed during implementation with a simple responsive calculation (e.g., `Math.min(50, screenHeight * 0.07)`), but the exact value is best determined through playtesting.
   - What we know: 40-60px is the standard range used in popular mobile games
   - What's unclear: Whether 50px feels right for this specific game's pace
   - Recommendation: Start with 50px, treat as a tunable constant

2. **Death indicator in game-over screen vs. freeze frame:** The requirements say "Player sees a death replay indicator showing which projectile killed them and from what direction." This could mean:
   - (a) A brief freeze-frame on the canvas during the death animation (recommended)
   - (b) Text/visual in the game-over screen overlay
   - (c) Both
   - Recommendation: Implement both -- a freeze-frame visual AND text in the game-over screen (e.g., "Killed by: SPLITTER from the left")

3. **Should safe area clamping affect player movement or just HUD?**
   - If the canvas extends behind the notch (with `viewport-fit=cover`), the game background will fill the notch area -- this looks better than black bars
   - HUD elements MUST be inset from safe areas
   - Player clamping SHOULD incorporate safe area so the player can't hide behind the notch
   - Projectile spawning at edges can stay at actual screen edges -- projectiles entering from behind the notch is actually a cool visual effect
   - Recommendation: Safe area affects HUD positioning and player clamping. Projectile spawning stays at actual screen edges.

## Sources

### Primary (HIGH confidence)
- [WebKit: Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/) -- viewport-fit=cover, env() syntax, max() pattern
- [MDN: overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior) -- CSS property syntax, browser compatibility (baseline Sep 2022)
- [MDN: touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) -- already used in codebase
- [Chrome Developers: overscroll-behavior](https://developer.chrome.com/blog/overscroll-behavior) -- pull-to-refresh prevention pattern
- Direct codebase analysis of `index.html` lines 1-2771 -- all implementation details verified against actual code

### Secondary (MEDIUM confidence)
- [Envato Tuts+: On-Screen Indicators for Off-Screen Targets](https://gamedevelopment.tutsplus.com/tutorials/positioning-on-screen-indicators-to-point-to-off-screen-targets--gamedev-6644) -- directional arrow math
- [Gamedeveloper.com: Making Great Touchscreen Controls](https://www.gamedeveloper.com/design/let-s-talk-about-touching-making-great-touchscreen-controls) -- touch offset UX principles
- [Smashing Magazine: The Thumb Zone](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/) -- mobile touch ergonomics
- Multiple sources confirming iOS Safari ignores `user-scalable=no` since iOS 10

### Tertiary (LOW confidence)
- 40-60px touch offset range -- cited in multiple game dev discussions, not formally documented
- `event.scale` property for pinch detection -- works in practice but MDN docs are sparse on this specific property

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all browser APIs are well-documented and widely supported
- Architecture: HIGH -- based on direct analysis of existing codebase with line-number references
- Pitfalls: HIGH -- iOS Safari behavior is well-documented; safe area edge cases are known patterns
- Code examples: HIGH -- written against the actual codebase structure, using existing patterns

**Research date:** 2026-02-18
**Valid until:** Indefinite -- these are stable browser platform features, not library-version-dependent
