# Technology Stack

**Project:** Dodge AI - Ad-Monetized Browser Bullet Hell Game
**Researched:** 2026-02-18
**Overall Confidence:** HIGH (most recommendations verified via official docs and multiple sources)

---

## The Big Decision: Single File vs. Modular Build

### Recommendation: Stay Single File NOW, Migrate to Vite Later

**Confidence: HIGH**

The game is ~2800 lines in one HTML file today. The right question is not "should we split?" but "at what threshold does staying single-file hurt more than it helps?"

**Stay single-file when:**
- Under ~4000 lines of JS logic
- No build-time assets (sprites, sounds) that need processing
- The single developer (Zee) can navigate the file mentally
- Deployment is "copy one file to CDN"

**Migrate to Vite when:**
- JS logic exceeds ~4000 lines (progression system + AI improvements will push past this)
- You want TypeScript for the AI/progression modules (complex state = type safety matters)
- You need environment-specific builds (dev with debug tools, prod with analytics/ads)
- You want hot module replacement during development (huge DX win for game tuning)

**The migration path is smooth because `vite-plugin-singlefile` (v2.3.0) can output a single HTML file from modular source.** You get the best of both worlds: modular development with single-file deployment.

### When to Pull the Trigger

Based on the PROJECT.md roadmap, the migration should happen BEFORE adding progression systems. Here is why:

1. Progression (XP, levels, unlocks) adds ~500-800 lines of state management
2. Deeper AI learning adds ~300-500 lines of pattern analysis
3. Analytics + ad integration adds ~200-300 lines of wrapper code
4. Combined with existing 2800 lines, you cross the 4000-line threshold

**Recommendation:** Phase 1 features (AI improvements, new mechanics) stay single-file. Phase 2 (progression, analytics) triggers the Vite migration. Phase 3 (ads, SEO polish) benefits from modular structure.

---

## Recommended Stack

### Build Tool (Phase 2+)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vite | 7.3.x | Dev server + bundler | Fastest DX with HMR, esbuild-powered pre-bundling. Vite 7 is current stable (released 2025). Node 20.19+ required. |
| vite-plugin-singlefile | 2.3.0 | Single HTML output | Inlines all JS/CSS into one `index.html` for deployment. Preserves zero-dependency distribution. |
| TypeScript | 5.x | Type safety for game logic | Optional but recommended for AI Brain and progression modules where state complexity is high. |

**Why Vite over alternatives:**
- esbuild internally = 10-100x faster than webpack
- Native ES module dev server = instant startup regardless of codebase size
- HMR that actually works = tune game parameters without full reload
- Rollup for production = tree-shaking, code splitting if ever needed
- `vite-plugin-singlefile` = deploy as single HTML, preserving current architecture

**Why NOT esbuild directly:** Missing HMR, plugin ecosystem, and HTML handling. Vite wraps esbuild and adds what matters for game dev.

**Why NOT webpack:** Slower, more complex config, no benefit for this project size.

**Confidence: HIGH** - Vite 7.3.1 is current stable per npm/GitHub releases. vite-plugin-singlefile 2.3.0 is latest per npm.

### Analytics (Phase 2)

**Primary: Plausible Analytics (Cloud)**

| Technology | Version/Plan | Purpose | Why |
|------------|-------------|---------|-----|
| Plausible Analytics | Cloud, $9/mo starter | Traffic analytics | Sub-1KB script, cookie-free, GDPR-compliant out of the box, no consent banner needed. |

**Why Plausible over alternatives:**

| Criterion | Plausible | Google Analytics 4 | GameAnalytics | Umami |
|-----------|-----------|--------------------|----|-------|
| Script size | <1KB | ~45KB | 53-65KB | ~2KB |
| Cookie-free | Yes | No | No | Yes |
| GDPR consent banner | Not needed | Required | Required | Not needed |
| Custom events | Yes | Yes | Yes (game-specific) | Yes |
| Pricing | $9/mo (10K pageviews) | Free | Free | Free (self-hosted) / $9/mo cloud |
| Setup complexity | 1 script tag | Complex | Moderate | Moderate (self-hosted) |
| Performance impact | Negligible | Noticeable | Moderate | Negligible |

**The case for Plausible:** For a game that must load sub-2s and run 60fps on mid-tier mobile, every kilobyte matters. Plausible's <1KB script is 45x lighter than GA4. No cookie consent banner means no friction before gameplay. Custom events cover what matters: game starts, phase reached, time survived, share clicks, ad impressions.

**The case against GA4:** 45KB script, requires cookie consent in EU (bounce rate killer for a casual game), complex setup, overkill for the metrics that matter.

**The case for GameAnalytics as a secondary addition (Phase 3+):** Once you have ads running, GameAnalytics' free tier provides game-specific metrics (retention, progression funnels, monetization benchmarks via GameIntel). Its 53KB SDK is heavier but worth it when you need game-industry benchmarks. Add it AFTER ads are live, not before.

**Confidence: HIGH** - Plausible script size (<1KB) verified via GitHub repo description and multiple sources. Pricing verified via plausible.io. GameAnalytics SDK size (53-65KB) verified via official docs.

### Ad Monetization (Phase 3)

**Strategy: Layered approach, starting with AdSense H5 Games Ads + AppLixir rewarded video**

| Technology | Purpose | When to Add | Why |
|------------|---------|-------------|-----|
| Google AdSense H5 Games Ads | Display + interstitial ads | After consistent traffic (5K+ daily sessions) | Largest demand pool, familiar setup, good baseline CPM |
| AppLixir | Rewarded video ads | Alongside or after AdSense | Built specifically for HTML5 web games, lightweight SDK, good for small publishers, higher eCPMs on rewarded |
| AdinPlay/Venatus | Premium gaming ads | After 50K+ monthly pageviews | Gaming-native formats (skins, takeovers), header bidding, higher CPMs but require scale |

**Ad Format Priorities for This Game:**

1. **Interstitial (between deaths/retries)** - Natural break point. Player just died, show a full-screen ad before retry. This is the highest-value placement for a dodge game.
2. **Rewarded video (extra life / power-up)** - "Watch a 30s ad to start with a power-up." Player opts in, high engagement, highest CPMs ($10-20 industry average for rewarded).
3. **Pre-roll (before game start)** - Works for returning players but can hurt first-time bounce rate. Add LAST.

**What NOT to do:**
- No banner ads during gameplay (kills immersion and fps)
- No ads before first play (kills conversion from organic traffic)
- No forced video ads without reward (players will leave)

**Revenue model reality check:**
The critical metric is Session RPM, not eCPM alone. A $5 eCPM with 60% fill = $1 Session RPM. A $4.50 eCPM with 85% fill = $1.70 Session RPM. Fill rate matters more than headline CPM, which is why starting with AdSense (highest fill) then layering specialists (higher CPM) is the right sequence.

**Technical note on AdSense H5 Games Ads:**
Google requires an allowlisting process: account review + domain verification that the site hosts actual playable H5 games. The Ad Placement API uses `adBreak()` and `adConfig()` functions and must be in the same document as the game canvas. This works perfectly with the single-file architecture.

**Confidence: MEDIUM** - Ad network CPM rates are not publicly disclosed and vary by geo/traffic quality. The layered strategy and format priorities are well-supported by multiple industry sources. AppLixir's small-publisher friendliness is verified via their documentation. AdSense H5 Games program requirements verified via Google support docs.

### SEO Infrastructure (Phase 2-3)

| Technology | Purpose | Why |
|------------|---------|-----|
| Schema.org VideoGame JSON-LD | Structured data for game discovery | 60%+ of players discover games via Google search. Rich snippets with game info improve CTR. |
| Open Graph + Twitter Card meta tags | Social sharing previews | Already partially implemented. Need dynamic OG images per score for viral sharing. |
| web-vitals library | Performance monitoring | Google's own library (~2KB gzipped). Measures LCP, INP, CLS. Feeds into Plausible custom events. |
| Canonical URL + robots.txt + sitemap.xml | Crawlability | Single-page game still needs these for proper indexing. |

**Schema.org VideoGame implementation (JSON-LD):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "DODGE AI",
  "description": "A bullet hell game where an AI learns how you dodge and adapts to kill you.",
  "genre": ["Action", "Bullet Hell", "Arcade"],
  "gamePlatform": ["Web Browser"],
  "playMode": "SinglePlayer",
  "applicationCategory": "Game",
  "operatingSystem": "Any",
  "url": "https://dodge-ai.com",
  "author": {
    "@type": "Person",
    "name": "Zee"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
</script>
```

**Core Web Vitals targets for SEO ranking benefit:**

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| LCP (Largest Contentful Paint) | < 2.5s | Page load speed. Single HTML file with no external deps = easy win. |
| INP (Interaction to Next Paint) | < 200ms | Replaced FID in March 2024. Measures responsiveness across entire page lifecycle. Critical for games. |
| CLS (Cumulative Layout Shift) | < 0.1 | Layout stability. Canvas games score well here naturally. |

Sites meeting all three CWV thresholds see 8-15% visibility increase in search results, with CWV comprising 25-30% of Page Experience ranking weight for competitive queries.

**Confidence: HIGH** - Schema.org VideoGame type verified at schema.org. Core Web Vitals thresholds verified via web.dev and Google developer docs. web-vitals library verified via GitHub/npm.

### Social Sharing (Enhancement to Existing)

| Technology | Purpose | Why |
|------------|---------|-----|
| Open Graph meta tags | Facebook/LinkedIn previews | Already have static OG tags. Need dynamic per-score sharing. |
| Twitter Card meta tags | X/Twitter previews | `twitter:card = summary_large_image` for maximum visual impact. |
| Canvas-to-image (built-in) | Dynamic share images | Generate score card images from game canvas. No external dependency needed. |
| Web Share API | Native share dialog | `navigator.share()` on mobile. Better than clipboard-only. Falls back to clipboard on desktop. |

**OG image best practices:**
- Resolution: 1200x627 pixels
- File size: under 5MB
- Dynamic score cards showing: time survived, phase reached, AI adaptation level
- Consider a serverless OG image generator later (Cloudflare Worker) for truly dynamic meta tags

**Confidence: HIGH** - OG/Twitter Card specs verified via multiple authoritative sources. Web Share API is a web standard.

---

## Supporting Libraries (All Phases)

| Library | Size | Purpose | When to Add | Confidence |
|---------|------|---------|-------------|------------|
| Plausible script | <1KB | Traffic analytics | Phase 2 | HIGH |
| web-vitals | ~2KB gzip | CWV measurement | Phase 2 | HIGH |
| GameAnalytics JS SDK | 53KB min | Game-specific analytics | Phase 3 (post-ads) | HIGH |
| AdSense H5 Games API | ~15KB | Display/interstitial ads | Phase 3 | MEDIUM (size estimate) |
| AppLixir SDK | Light (unspecified) | Rewarded video ads | Phase 3 | MEDIUM |

**Total additional payload:** Under 20KB for Phase 2 (Plausible + web-vitals). Under 90KB additional for Phase 3 (GameAnalytics + ads). This keeps the game well under performance budgets.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Build tool | Vite 7 | Webpack 5 | Slower, more complex config, no advantage for this scale |
| Build tool | Vite 7 | esbuild direct | Missing HMR, HTML handling, plugin ecosystem |
| Build tool | Vite 7 | No build tool | Works today but limits DX as codebase grows past 4K lines |
| Analytics | Plausible | GA4 | 45x heavier script, requires cookie consent, overkill |
| Analytics | Plausible | Umami self-hosted | Requires server hosting (violates no-backend constraint) |
| Game analytics | GameAnalytics | Amplitude / Mixpanel | Not game-specific, heavier, designed for SaaS products |
| Ads (primary) | AdSense H5 | Standalone AdinPlay | AdSense has highest fill rate for new sites. AdinPlay better at scale. |
| Ads (rewarded) | AppLixir | AdMob | AdMob is mobile-app focused, not web-game friendly |
| SEO monitoring | web-vitals | Lighthouse CI | web-vitals is runtime monitoring; Lighthouse is build-time. Use both but start with runtime. |
| Sharing | Web Share API | Social SDK embeds | Web Share API is 0KB (browser built-in). Social SDKs add 100KB+. |

---

## Development Workflow

### Phase 1 (AI + Mechanics) - No Build Step

```
Edit index.html -> Open in browser -> Test -> Commit
```

Zero friction. No setup. This is correct for gameplay-focused work.

### Phase 2+ (Progression + Analytics) - Vite Dev Server

```bash
# One-time setup
npm init -y
npm install -D vite vite-plugin-singlefile typescript

# Development
npx vite        # Dev server with HMR at localhost:5173

# Production build (single HTML file)
npx vite build  # Outputs dist/index.html (single file, everything inlined)
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    target: 'es2020',
    minify: 'esbuild',
  },
});
```

**File structure after migration:**
```
dodge-ai/
  src/
    main.ts          # Entry point, game loop
    ai-brain.ts      # AI Brain class (extracted from monolith)
    progression.ts   # XP, levels, unlocks (new)
    analytics.ts     # Plausible + custom events wrapper (new)
    ads.ts           # Ad integration wrapper (new, Phase 3)
    types.ts         # Shared types
  index.html         # Shell HTML with <canvas> and HUD
  style.css          # Extracted styles
  vite.config.ts
  package.json
```

**The migration itself is mechanical:** Extract `<style>` to `style.css`, extract `<script>` content to `src/main.ts`, add `<script type="module" src="/src/main.ts">` to HTML. Vite handles the rest. The single-file plugin ensures `npx vite build` still outputs one `index.html`.

---

## Installation Commands

### Phase 1 (No installation needed)
```
# Nothing. Open index.html in browser. Ship it.
```

### Phase 2 (Analytics + Build Setup)
```bash
# Initialize project
npm init -y

# Build tooling
npm install -D vite@^7 vite-plugin-singlefile@^2.3 typescript@^5

# Analytics (loaded via script tag, not npm)
# Plausible: <script defer data-domain="dodge-ai.com" src="https://plausible.io/js/script.js"></script>

# Performance monitoring
npm install web-vitals@^5
```

### Phase 3 (Ads + Game Analytics)
```bash
# Game analytics
npm install gameanalytics@^4

# Ad SDKs loaded via script tags per provider documentation
# AdSense: <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
# AppLixir: Follow their integration guide (no npm package)
```

---

## Sources

### Verified (HIGH confidence)
- [Plausible Analytics - GitHub](https://github.com/plausible/analytics) - Script size <1KB confirmed
- [GameAnalytics JavaScript SDK Docs](https://docs.gameanalytics.com/event-tracking-and-integrations/sdks-and-collection-api/open-source-sdks/javascript/) - SDK size 53-65KB confirmed
- [Schema.org VideoGame Type](https://schema.org/VideoGame) - Structured data properties confirmed
- [Vite 7 Release](https://vite.dev/blog/announcing-vite7) - Current stable version confirmed
- [vite-plugin-singlefile on npm](https://www.npmjs.com/package/vite-plugin-singlefile) - v2.3.0 confirmed
- [web-vitals on GitHub](https://github.com/GoogleChrome/web-vitals) - v5.x, measures LCP/INP/CLS confirmed
- [Core Web Vitals - web.dev](https://web.dev/articles/vitals) - INP thresholds (<200ms good) confirmed
- [Google AdSense H5 Games Ads](https://support.google.com/adsense/answer/9959170) - Requirements and Ad Placement API confirmed

### Verified via Multiple Sources (MEDIUM confidence)
- [AdPushup - HTML5 Game Ads Strategy](https://www.adpushup.com/blog/HTML5-game-ads/) - Session RPM > eCPM insight
- [MonetizeMore - AdSense Alternatives for H5 Games](https://www.monetizemore.com/blog/best-adsense-alternatives-for-h5-game/) - Layered monetization strategy
- [DoonDook - Best Ad Networks for HTML5 Games](https://doondook.studio/best-ad-networks-monetize-html5-games/) - Network comparison
- [AppLixir - HTML5 Rewarded Video](https://www.applixir.com/blog/html5-game-development-reward-video-ads/) - Small publisher friendliness
- [GameAnalytics Pricing](https://www.gameanalytics.com/pricing) - Free tier confirmed via GamesBeat article
- [Plausible Pricing](https://plausible.io) - $9/mo starter plan via multiple sources

### WebSearch Only (LOW confidence - verify before implementing)
- Rewarded video CPM range ($10-20) - industry average cited in multiple articles but varies wildly by geo/traffic quality
- CWV comprising 25-30% of Page Experience ranking weight - cited in SEO industry articles, not directly from Google
- 60% of players discover games via Google search - cited in Playwire gaming SEO article
