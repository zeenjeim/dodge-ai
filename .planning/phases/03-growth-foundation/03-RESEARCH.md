# Phase 3: Growth Foundation - Research

**Researched:** 2026-02-19
**Domain:** SEO, social sharing (canvas-generated image), privacy-first analytics
**Confidence:** HIGH

## Summary

Phase 3 adds three growth capabilities to the existing ~3,356-line single HTML file game: SEO discoverability (meta tags, JSON-LD, visible content), a visual share card (1200x630 PNG generated via offscreen canvas), and privacy-first analytics (session/event tracking without cookies). No new gameplay features -- purely infrastructure.

The standard approach uses native browser APIs exclusively: Canvas 2D for the share card (no libraries), Schema.org VideoGame JSON-LD for structured data, Open Graph meta tags for social previews, and either Plausible (cloud, $9/mo) or GoatCounter (free hosted) for analytics. The game is currently a single HTML file with zero dependencies and should stay that way (3,356 lines, under the 4,000-line Vite migration threshold).

**Primary recommendation:** Use GoatCounter (free, ~3.5KB script, no cookies, built-in dashboard) for analytics, native Canvas 2D API for share card generation, and standard JSON-LD + Open Graph for SEO. No external libraries needed for any of this.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Analytics provider: Claude's discretion (privacy-first, no cookies, no consent banner required)
- Track both death events and session milestones:
  - **Deaths**: survival duration, phase reached, cause of death
  - **Milestones**: first game, reached phase X, used powerup, hit score threshold
- Drop-off tracking covers three layers:
  - Pre-play: loaded page but never started a game
  - Per-session: how many games played before closing tab
  - Return rate: whether player comes back next day/session
- Dashboard vs data-only: Claude's discretion based on tooling choice

### Claude's Discretion
- Analytics provider selection and integration approach
- Dashboard setup (hosted dashboard vs data-only)
- Share card visual design, layout, stats shown, AI commentary style
- SEO page content structure (how-to-play, about section, placement relative to canvas)
- Share button placement and flow (clipboard, native share API, download)
- Meta tags, Open Graph, JSON-LD structured data specifics

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

## Standard Stack

### Core
| Tool | Version/Size | Purpose | Why Standard |
|------|-------------|---------|--------------|
| Canvas 2D API | Native browser | Generate 1200x630 share card image | Zero dependencies, already used by the game, full text/shape drawing |
| `canvas.toBlob()` | Native browser | Convert canvas to PNG Blob for download/share | Async, 2-5x faster than toDataURL, returns binary Blob |
| `navigator.share()` | Web Share API | Native OS share dialog for mobile/desktop | Shares files (images) natively on Android/iOS/Windows/ChromeOS |
| Schema.org VideoGame | JSON-LD | Structured data for Google rich results | Google-recommended format, VideoGame is the correct type |
| Open Graph | Meta tags | Social media preview cards (Twitter/Facebook/LinkedIn) | Universal standard for link previews |
| GoatCounter | ~3.5KB script | Privacy-first analytics (sessions, events, pages) | Free hosted tier, no cookies, no consent banner, built-in dashboard |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `navigator.canShare()` | Feature detection for Web Share API | Always check before calling navigator.share() |
| `URL.createObjectURL()` | Create download link from Blob | Fallback when Web Share API unavailable |
| `navigator.clipboard` | Copy text to clipboard | Already in use for existing share function |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GoatCounter | Plausible Cloud ($9/mo) | Plausible has a more polished dashboard and richer custom event properties (up to 30 key-value pairs). But it costs $9/mo minimum and the game has zero revenue. GoatCounter is free for public sites. |
| GoatCounter | Plausible self-hosted (free) | Requires running your own server with Docker/Elixir. Overkill for a single-page browser game. |
| Canvas 2D API | html-to-image library | Adds a dependency. Canvas 2D is already used by the game and can draw everything needed (text, shapes, gradients). No reason to add a library. |
| OffscreenCanvas | Regular Canvas (hidden) | OffscreenCanvas has incomplete Firefox support (requires about:config flag). A hidden regular canvas element is universally supported and works identically. |

**Installation:**
```html
<!-- GoatCounter: single script tag, no npm install needed -->
<script data-goatcounter="https://SITENAME.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

No npm packages. No build step. Everything is native browser APIs plus one analytics script tag.

## Architecture Patterns

### Recommended Content Structure
The current file has the game canvas filling the entire viewport with overlays. For SEO, visible text content must exist in the HTML that search engines can index. The pattern is to add content BELOW the canvas viewport that becomes visible when scrolling, or to restructure the page so the game sits within a content page.

```
<head>
  <!-- SEO meta tags, Open Graph, JSON-LD -->
</head>
<body>
  <!-- Game area (existing: canvas + HUD + overlays) -->
  <main id="game-container">
    <canvas>...</canvas>
    <!-- existing HUD, game over screen, start screen, etc. -->
  </main>

  <!-- SEO content: visible text below game viewport -->
  <section id="about" class="seo-content">
    <h1>DODGE AI -- Browser Game Where the AI Learns How You Play</h1>
    <p>Description, how-to-play, features...</p>
  </section>

  <!-- Analytics script -->
  <script data-goatcounter="..."></script>
</body>
```

### Pattern 1: Offscreen Canvas for Share Card
**What:** Create a separate hidden canvas element (1200x630), draw the share card content onto it, then export as PNG.
**When to use:** On game over, when user taps "Share".
**Example:**
```javascript
// Source: MDN Canvas API + toBlob() documentation
function generateShareCard(stats) {
  const card = document.createElement('canvas');
  card.width = 1200;
  card.height = 630;
  const ctx = card.getContext('2d');

  // Dark background
  ctx.fillStyle = '#06060f';
  ctx.fillRect(0, 0, 1200, 630);

  // Title
  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillStyle = '#00f0ff';
  ctx.fillText('DODGE AI', 60, 80);

  // Survival time (big number)
  ctx.font = 'bold 120px "Courier New", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${stats.time}s`, 60, 240);

  // Phase reached
  ctx.font = '28px "Courier New", monospace';
  ctx.fillStyle = '#8b5cf6';
  ctx.fillText(`Phase ${stats.phase + 1}: ${stats.phaseName}`, 60, 300);

  // Stats row
  ctx.font = '22px "Courier New", monospace';
  ctx.fillStyle = '#888';
  ctx.fillText(`Dodged: ${stats.dodged}  |  AI Confidence: ${stats.confidence}%`, 60, 360);

  // AI commentary (the hook)
  ctx.font = 'italic 24px "Courier New", monospace';
  ctx.fillStyle = '#ff3355';
  const commentary = stats.aiCommentary;
  ctx.fillText(commentary, 60, 440);

  // CTA
  ctx.font = '20px "Courier New", monospace';
  ctx.fillStyle = '#555';
  ctx.fillText('Think you can last longer? Play at dodgeai.com', 60, 580);

  return card;
}
```

### Pattern 2: Share Flow with Fallbacks
**What:** Try Web Share API first (native share dialog with image file), fall back to download, always offer clipboard text copy.
**When to use:** When user clicks Share button on game over screen.
**Example:**
```javascript
// Source: MDN Web Share API + benkaiser.dev sharing guide
async function shareCard(canvas) {
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const file = new File([blob], 'dodge-ai-score.png', { type: 'image/png' });

  // Try native share (works on mobile, some desktop)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'DODGE AI Score',
        text: 'Think you can beat my score?'
      });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return; // User cancelled
    }
  }

  // Fallback: download the image
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dodge-ai-score.png';
  a.click();
  URL.revokeObjectURL(url);
}
```

### Pattern 3: GoatCounter Custom Events
**What:** Fire custom events for game milestones and deaths.
**When to use:** At key game moments (start, death, milestone).
**Example:**
```javascript
// Source: GoatCounter JS API documentation
// Event tracking helper (handles async loading)
function trackEvent(name, title) {
  if (window.goatcounter && window.goatcounter.count) {
    window.goatcounter.count({
      path: name,
      title: title || name,
      event: true,
    });
  }
}

// Usage examples:
trackEvent('game-start', 'Game Started');
trackEvent('death-phase-3', 'Died in Phase 3: PREDICTING');
trackEvent('milestone-first-game', 'First Game Played');
trackEvent('milestone-phase-5', 'Reached Phase 5');
trackEvent('share-card', 'Share Card Generated');
```

### Pattern 4: JSON-LD VideoGame Structured Data
**What:** Add a `<script type="application/ld+json">` block to `<head>` with Schema.org VideoGame markup.
**When to use:** Static content in the HTML head.
**Example:**
```html
<!-- Source: schema.org/VideoGame -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "DODGE AI",
  "description": "A browser-based bullet hell game where an AI learns how you dodge and adapts to kill you.",
  "url": "https://dodgeai.com",
  "genre": ["Bullet Hell", "Action", "Browser Game"],
  "gamePlatform": ["Web Browser"],
  "operatingSystem": "Any",
  "applicationCategory": "Game",
  "playMode": "SinglePlayer",
  "numberOfPlayers": {
    "@type": "QuantitativeValue",
    "value": 1
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Person",
    "name": "Zee"
  }
}
</script>
```

### Anti-Patterns to Avoid
- **Generating share card on every game over:** Only generate when user clicks Share. Canvas drawing is cheap but not free -- no reason to do it preemptively.
- **Using toDataURL instead of toBlob:** toDataURL is synchronous and creates a large base64 string. toBlob is async, 2-5x faster, and returns a proper Blob.
- **Blocking on analytics:** Never let analytics failures affect gameplay. All tracking calls should be fire-and-forget with no error handling that could disrupt the game loop.
- **Putting SEO text inside the canvas:** Search engines cannot see canvas-rendered text. All indexable content must be in actual HTML elements.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image generation | Server-side image API | Canvas 2D API + toBlob() | Native browser API, zero latency, works offline |
| Share dialog | Custom share menu with platform icons | navigator.share() + fallback download | Native OS integration, automatically shows relevant apps |
| Analytics | Custom event tracking + localStorage dashboard | GoatCounter hosted service | Free, maintained, has a dashboard, handles privacy compliance |
| Structured data | Manual meta tag management | JSON-LD script block | Google's recommended format, decoupled from HTML content |
| Social preview images | Dynamic OG image server | Static OG image + dynamic share card | OG images are static (set at page load); dynamic images are the share card |

**Key insight:** This entire phase can be implemented with zero new dependencies. Every capability (image generation, sharing, structured data, analytics) has a native browser or free hosted solution. The game already uses Canvas 2D extensively, so the share card is just drawing to a second canvas.

## Common Pitfalls

### Pitfall 1: OG Image vs Share Card Confusion
**What goes wrong:** Developers conflate the static OG meta tag image (shown when someone pastes a link) with the dynamic share card (generated per game session with stats).
**Why it happens:** Both are "share images" but serve different purposes.
**How to avoid:** The OG image (`og:image`) is a static promotional image baked into the HTML meta tags -- it shows when someone shares the URL. The share card is a dynamic per-session image generated via canvas that the user downloads or shares as a file. They are separate things.
**Warning signs:** Trying to dynamically update og:image meta tags (social media crawlers read them at crawl time, not runtime).

### Pitfall 2: Web Share API Desktop Support
**What goes wrong:** navigator.share() with files is poorly supported on desktop browsers (especially Firefox). Developers assume it works everywhere.
**Why it happens:** Mobile browsers have good support, desktop is inconsistent.
**How to avoid:** Always check `navigator.canShare({ files: [file] })` before attempting file share. Provide download fallback as primary desktop path. Keep the existing clipboard text share as an additional option.
**Warning signs:** Share button does nothing on desktop Firefox/Safari.

### Pitfall 3: GoatCounter Async Loading Race Condition
**What goes wrong:** `window.goatcounter.count()` called before the async script loads, causing a TypeError.
**Why it happens:** The script loads with `async` attribute, so it may not be ready when game code runs.
**How to avoid:** Always guard with `if (window.goatcounter && window.goatcounter.count)`. For critical first-page events, use a polling interval or queue events to fire when the script loads.
**Warning signs:** Analytics events missing for fast interactions (page load, first game start).

### Pitfall 4: Canvas Font Rendering Inconsistency
**What goes wrong:** Share card text renders differently across browsers/OS because system fonts vary.
**Why it happens:** "Courier New" may not exist on all systems, and canvas font fallback behavior differs.
**How to avoid:** Use the same monospace font already in use by the game (`'Courier New', monospace`). Since the game already renders with this font, the share card will match. For pixel-perfect consistency, could embed a web font -- but unnecessary for this use case.
**Warning signs:** Share card looks different on Android vs iOS vs Windows.

### Pitfall 5: JSON-LD Validation Failures
**What goes wrong:** Google Search Console shows structured data errors because of missing required properties or wrong types.
**Why it happens:** Schema.org VideoGame inherits from both Game and SoftwareApplication, creating confusion about required fields.
**How to avoid:** Test with Google's Rich Results Test (https://search.google.com/test/rich-results) before deploying. Keep the JSON-LD simple -- name, description, url, genre, playMode are the core fields.
**Warning signs:** Google Search Console shows "missing field" warnings for the VideoGame rich result.

### Pitfall 6: Analytics Event Naming Chaos
**What goes wrong:** Event names become inconsistent ("game_start" vs "gameStart" vs "Game Start"), making dashboard analysis painful.
**Why it happens:** No convention established upfront, multiple event-firing locations.
**How to avoid:** Define an event naming convention upfront. GoatCounter uses `path` as the event identifier. Use kebab-case with category prefixes: `game-start`, `death-phase-3`, `milestone-phase-5`, `share-card-generated`.
**Warning signs:** Dashboard shows dozens of similar-but-different event names.

## Code Examples

### Complete Share Button Flow
```javascript
// Source: MDN Web Share API, Canvas toBlob, verified patterns
share() {
  // 1. Generate card
  const card = this.generateShareCard();

  // 2. Convert to blob
  card.toBlob(async (blob) => {
    if (!blob) return;

    const file = new File([blob], 'dodge-ai-score.png', { type: 'image/png' });

    // 3. Try native share (mobile-first)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'DODGE AI',
          text: `I survived ${this.gameTime.toFixed(1)}s. Think you can beat that?`
        });
        trackEvent('share-native', 'Shared via native dialog');
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }

    // 4. Fallback: download image
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dodge-ai-score.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackEvent('share-download', 'Shared via image download');

  }, 'image/png');
}
```

### GoatCounter Drop-off Tracking
```javascript
// Source: GoatCounter events API documentation
// Pre-play tracking: fire on page load, detect if game ever starts
let gameEverStarted = false;

// On page load (after GoatCounter loads)
function initAnalytics() {
  trackEvent('page-load', 'Page Loaded');

  // Track pre-play drop-off: if user leaves without playing
  window.addEventListener('beforeunload', () => {
    if (!gameEverStarted) {
      trackEvent('dropoff-pre-play', 'Left without playing');
    }
  });
}

// On game start
function onGameStart() {
  gameEverStarted = true;
  sessionGamesPlayed++;
  trackEvent('game-start', `Game ${sessionGamesPlayed} started`);
  if (sessionGamesPlayed === 1) {
    trackEvent('milestone-first-game', 'First game this session');
  }
}

// On death
function onDeath(stats) {
  trackEvent(
    `death-phase-${stats.phase + 1}`,
    `Died at ${stats.time.toFixed(1)}s in Phase ${stats.phase + 1}`
  );
}

// Per-session tracking
window.addEventListener('beforeunload', () => {
  if (sessionGamesPlayed > 0) {
    trackEvent(`session-games-${sessionGamesPlayed}`,
      `Session ended after ${sessionGamesPlayed} games`);
  }
});
```

### Open Graph Meta Tags (Complete)
```html
<!-- Source: Open Graph Protocol (ogp.me) -->
<meta property="og:title" content="DODGE AI -- The AI That Learns How You Dodge">
<meta property="og:description" content="A bullet hell browser game where the AI studies your patterns and adapts. How long can you survive?">
<meta property="og:type" content="website">
<meta property="og:url" content="https://dodgeai.com">
<meta property="og:image" content="https://dodgeai.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="DODGE AI browser game - neon bullet hell with AI that learns your patterns">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="DODGE AI -- The AI That Learns How You Dodge">
<meta name="twitter:description" content="A bullet hell browser game where the AI studies your patterns and adapts.">
<meta name="twitter:image" content="https://dodgeai.com/og-image.png">
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| canvas.toDataURL() | canvas.toBlob() | 2020+ widely supported | 2-5x faster, async, returns binary Blob |
| Google Analytics (cookies) | Privacy-first analytics (GoatCounter/Plausible) | 2020+ GDPR era | No consent banner needed, lighter scripts |
| Server-side OG image generation | Static OG image + client-side share card | N/A | No server needed for a client-side game |
| Microdata/RDFa | JSON-LD | 2015+ Google recommendation | Cleaner, decoupled from HTML, easier to maintain |
| navigator.clipboard.writeText() only | navigator.share() with files | 2020+ mobile, 2022+ some desktop | Native OS share dialog with image support |

**Deprecated/outdated:**
- `canvas.toDataURL()` for large images: Still works but toBlob is strictly better for anything that will be downloaded/shared
- Google Analytics Universal: Deprecated by Google in 2023, replaced by GA4 which still requires cookies/consent

## Open Questions

1. **Domain name for the game**
   - What we know: The game needs a URL for OG tags, JSON-LD, and the share card CTA. Currently appears to be a local file or undeployed.
   - What's unclear: Whether it's deployed somewhere, what domain will be used
   - Recommendation: Use a placeholder in meta tags (e.g., `https://dodgeai.example.com`) that gets updated when deployed. The share card can omit the URL until a domain is chosen.

2. **Static OG image creation**
   - What we know: OG image must be a static file hosted at a URL (social media crawlers fetch it at crawl time, not runtime)
   - What's unclear: Whether to create a generic promotional OG image or skip it until deployment
   - Recommendation: Create a static OG image once (can be a screenshot or designed card) and reference it. For now, use a placeholder path. The dynamic share card is separate from this.

3. **GoatCounter account setup**
   - What we know: GoatCounter requires creating an account at goatcounter.com to get a site code (e.g., `dodgeai.goatcounter.com`)
   - What's unclear: Whether the user has already set this up or needs to
   - Recommendation: Code should work with or without the analytics script loaded. Use the `SITENAME.goatcounter.com` pattern and make it easy to swap in the real site code.

4. **beforeunload reliability for drop-off tracking**
   - What we know: `beforeunload` event is unreliable on mobile browsers (iOS Safari especially). GoatCounter doesn't support `navigator.sendBeacon` natively.
   - What's unclear: How much drop-off data will actually be captured on mobile
   - Recommendation: Track drop-off at best-effort. The page-load event fires reliably; comparing page-load count vs game-start count gives pre-play drop-off. Per-session games can be tracked on each game-start event instead of relying on beforeunload.

## Analytics Provider Recommendation: GoatCounter

**Decision: GoatCounter** (Claude's discretion area)

| Criterion | GoatCounter | Plausible Cloud |
|-----------|-------------|-----------------|
| Price | Free (hosted) | $9/mo minimum |
| Script size | ~3.5KB | <1KB |
| Cookie-free | Yes | Yes |
| Consent banner | Not needed | Not needed |
| Custom events | Yes (path-based) | Yes (richer, with props) |
| Dashboard | Built-in (basic but functional) | Built-in (polished) |
| Custom properties on events | No (event name only) | Yes (up to 30 key-value pairs) |

**Why GoatCounter over Plausible:**
- The game has zero revenue. $9/mo for analytics on a free browser game is premature.
- GoatCounter's free hosted tier covers everything needed: pageviews, custom events, referrer tracking, browser/device breakdown.
- Custom event properties (Plausible's advantage) are nice-to-have but not essential. We can encode context into the event name: `death-phase-3-homing` tells us phase and cause of death without needing key-value properties.
- If the game grows and generates ad revenue, migrating to Plausible is trivial (swap one script tag).

**Dashboard:** GoatCounter provides a hosted dashboard at `SITENAME.goatcounter.com` showing pageviews, events, referrers, browsers, screen sizes, and locations. No need to build a custom dashboard.

**Limitation acknowledged:** GoatCounter events are path-based (no structured properties). For the three-layer drop-off tracking, we encode information in event names rather than properties. This is slightly less elegant but fully functional for the required tracking:
- Pre-play: compare `page-load` event count vs `game-start` event count
- Per-session: `session-games-1`, `session-games-2`, etc.
- Return rate: GoatCounter tracks unique visitors by day natively in its dashboard

## Share Card Design Recommendation

**Decision: Dark theme card matching game aesthetic** (Claude's discretion area)

Layout (1200x630):
```
+--------------------------------------------------+
|  DODGE AI                           [AI Brain %]  |
|                                                    |
|  42.7s                                            |
|  Phase 4: HUNTING                                 |
|                                                    |
|  Dodged: 127  |  Closest: 3px  |  Games: 14      |
|                                                    |
|  "You dodge left 67% of the time.                 |
|   Real original." -- The AI                        |
|                                                    |
|  Think you can survive longer?                    |
+--------------------------------------------------+
```

**Stats shown:** Survival time (hero number), phase reached, dodges, closest call, total games, AI confidence
**AI commentary:** Use the existing `go-ai-learned` text from showGameOver() -- it already contains the AI's analysis of the player's patterns
**Visual style:** Dark background (#06060f), cyan title (#00f0ff), purple phase (#8b5cf6), red AI commentary (#ff3355) -- matching the game's existing color palette
**Share flow:** Share button on game over screen generates card -> try navigator.share (mobile) -> fallback to download -> always keep clipboard text copy as secondary option

## SEO Content Recommendation

**Decision: Below-fold visible content section** (Claude's discretion area)

Add a `<section>` below the game viewport with:
1. **H1 tag** with primary keyword: "DODGE AI -- Browser Game Where the AI Learns How You Play"
2. **How to Play** section (repurpose existing modal content into visible HTML)
3. **About** section describing the AI learning mechanic (the unique selling point)
4. **Feature list** for long-tail keywords (bullet hell, pattern recognition, adaptive difficulty)

This content scrolls below the game canvas. Players never see it (game is fullscreen). Search engines index it. The game's existing `<title>` and `<meta name="description">` get upgraded with better keyword targeting.

**Target keywords:** "browser game AI learns", "bullet hell game online", "dodge game no download", "AI game free online", "bullet hell browser game"

## Sources

### Primary (HIGH confidence)
- [MDN: HTMLCanvasElement.toBlob()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) - Canvas to PNG conversion
- [MDN: Navigator.share()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) - Web Share API with file support
- [MDN: Navigator.canShare()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare) - Feature detection
- [Schema.org: VideoGame](https://schema.org/VideoGame) - Structured data type and properties
- [Open Graph Protocol](https://ogp.me/) - OG meta tag specification
- [GoatCounter JS API](https://www.goatcounter.com/help/js) - JavaScript API reference
- [GoatCounter Events](https://www.goatcounter.com/help/events) - Custom event tracking

### Secondary (MEDIUM confidence)
- [Plausible Custom Events](https://plausible.io/docs/custom-event-goals) - Custom event API (for comparison)
- [Plausible Events API](https://plausible.io/docs/events-api) - Server-side events endpoint
- [benkaiser.dev: Sharing Images via Web Share API](https://benkaiser.dev/sharing-images-using-the-web-share-api/) - Canvas to File sharing pattern
- [GoatCounter homepage](https://www.goatcounter.com) - Pricing and features

### Tertiary (LOW confidence)
- Browser game SEO community practices - gathered from multiple WebSearch results, patterns consistent but no single authoritative source

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools are native browser APIs or well-documented free services with official documentation verified
- Architecture: HIGH - Canvas 2D and Web Share API patterns verified against MDN; GoatCounter API verified against official docs
- Pitfalls: HIGH - Known issues documented in MDN (Web Share desktop support), GoatCounter docs (async loading), and Schema.org (VideoGame type hierarchy)
- Analytics recommendation: MEDIUM - GoatCounter vs Plausible is a judgment call; GoatCounter's free tier is verified but Plausible's richer events could matter if the game scales

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (stable domain -- browser APIs and Schema.org don't change frequently)
