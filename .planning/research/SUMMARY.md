# Project Research Summary

**Project:** Dodge AI - Ad-Monetized Browser Bullet Hell Game
**Domain:** Browser-based arcade game with adaptive AI, social virality, and ad monetization
**Researched:** 2026-02-18
**Confidence:** HIGH

## Executive Summary

Dodge AI is a browser-based bullet hell game where the AI learns your dodge patterns and adapts to kill you. The core game already exists (~2770 lines, single HTML file) with a working AI brain, 6 phases, bosses, and power-ups. The research covers the next milestone: adding retention mechanics (progression, daily challenge, streaks), social virality (visual share cards, AI commentary), better AI visibility, analytics, and eventual ad monetization. The project constraint is no backend — everything must work as a static file deployable to any CDN, with all state in localStorage.

The recommended build sequence is: measure first (analytics), then hook (shareability and AI visibility), then retain (daily challenge, progression), then grow (viral mechanics), then monetize (ads after traffic exists). This order is non-negotiable: adding ads before traffic earns nothing and destroys retention; building progression before analytics means building blind. The architecture should stay single-file for Phase 1 (AI improvements), then migrate to ES modules with esbuild bundling when adding progression, treating module extraction as something that happens *alongside* feature work rather than as a separate refactor phase.

The two highest risks are: (1) AI adaptation speed — if the AI learns too fast, players feel cheated and leave, killing the core differentiator; and (2) premature monetization — adding ads before 10K+ monthly pageviews degrades experience and earns pennies. Both risks are avoidable with deliberate pacing. The viral mechanics are strong on paper (Wordle-style daily challenge + visual share cards + AI commentary), but their success depends on getting the core retention loop right first. A player who doesn't return to play won't share.

## Key Findings

### Recommended Stack

See [STACK.md](./STACK.md) for full details.

The game stays as a single HTML file through Phase 1 (AI/mechanics). Phase 2 (progression + analytics) triggers migration to Vite 7 + `vite-plugin-singlefile`, which preserves single-file deployment while enabling modular source code and HMR during development. The key insight from ARCHITECTURE.md is that esbuild (via Vite) is the right bundler — not webpack (too heavy), not bare ES modules in production (too many HTTP requests for a sub-2s load target). TypeScript is optional but recommended for the AI Brain and progression modules where state complexity is high.

**Core technologies:**
- **Vite 7 + vite-plugin-singlefile**: Build tooling for Phase 2+ — modular development, single-file deployment
- **Plausible Analytics (<1KB)**: Traffic analytics without cookie consent banner — 45x lighter than GA4, critical for mobile performance budget
- **GameAnalytics JS SDK (53KB)**: Game-specific analytics for retention funnels — add after ads are live, not before
- **Google AdSense H5 Games API**: Primary ad platform via `adBreak()`/`adConfig()` API — highest fill rate, requires allowlisting process
- **AppLixir SDK**: Rewarded video ads — built for small HTML5 game publishers, opt-in model
- **web-vitals library (~2KB)**: Runtime Core Web Vitals measurement feeding Plausible custom events
- **Schema.org VideoGame JSON-LD**: Structured data for game search discovery — 60%+ of players find games via Google

### Expected Features

See [FEATURES.md](./FEATURES.md) for full details with dependency graph and reward pacing design.

**Must have (table stakes):**
- Personal best tracking, prominently displayed — players need a clear goal to beat
- Instant retry with zero friction — any animation blocking replay causes bounce
- Session stats / post-death summary — "I can do better" narrative drives retry
- Mobile 60fps performance — 60%+ of casual browser game traffic is mobile
- Sub-2s load time — both SEO ranking factor and retention factor
- Clear visual feedback on death cause — every death must feel earned

**Should have (differentiators):**
- AI visibility layer ("AI detected your clockwise dodge pattern") — makes the hidden mechanic a story
- Visual score card generator (canvas, 1200x630) — Wordle-style shareable image
- AI commentary/personality during gameplay — contextual trash talk that creates meme moments
- Daily challenge mode with fixed seed — Wordle's scarcity effect, streak mechanics, shared experience
- Streak system with gentle ramp-down (not hard reset) — Duolingo-proven, 40-60% DAU lift
- XP/leveling with cosmetic unlocks — investment hook, "every run earns something"
- Audio system muted by default — polish multiplier, low effort

**Defer to v2+:**
- Spectate/replay ghost — high complexity, high viral potential but non-essential
- "Challenge a friend" direct link (URL-encoded AI seed) — notable viral mechanic, secondary to daily challenge
- Server-side leaderboards — needs anti-cheat, adds backend complexity
- Prestige/reset system — not until player base established
- Environmental hazards — gameplay variety driver, secondary to retention/social features

**Explicit anti-features (never build):**
- Interstitial ads on every death — #1 casual game churn driver
- Mandatory account/login — 90%+ drop-off at any signup wall
- Tutorial popup before first play — kills curiosity-driven first session
- Energy systems or play timers — wrong genre, wrong audience
- Client-side leaderboards without anti-cheat — trivially exploited, ruins competitive feel

### Architecture Approach

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module map, data flow diagrams, localStorage schema, and build commands.

The current single-file monolith is at the threshold — ~2770 lines is navigable solo, but progression + analytics + deeper AI will push it past 4000 lines. The recommended pattern is **incremental module extraction alongside feature work**: when building progression, extract `storage.js` and `progression.js` at the same time; when building analytics, create `analytics.js` as a new module. Don't burn a phase on pure refactoring. Game.js becomes the orchestrator — it calls everything else, nothing calls back into Game (prevents circular dependencies). The ad integration must be built with graceful no-ops so the game works perfectly without ads loaded.

**Major components:**
1. `game.js` (orchestrator) — state machine, main loop, calls all systems; owns nothing except coordination
2. `ai-brain.js` — pattern tracking, micro-habit detection, confidence scoring; accessed by game, never reaches back
3. `progression.js` — XP, levels, unlock state, achievement tracking; called by game on events
4. `renderer.js` — all canvas drawing; reads state, never mutates it
5. `storage.js` — localStorage abstraction with schema versioning and v1→v2 migration
6. `analytics.js` — event queue, flushed async via requestIdleCallback on game over; never in hot path
7. `ads.js` — Google H5 Games Ads wrapper with graceful no-ops; loaded after first frame

### Critical Pitfalls

See [PITFALLS.md](./PITFALLS.md) for full details with warning signs per pitfall.

1. **AI feels unfair (rage quit loop)** — Cap adaptation speed per session; add learning cooldown between sessions; ensure every death has a visible cause; never let AI predictions be 100% accurate (maintain player agency noise). This is the core mechanic — getting it wrong destroys the game.

2. **Premature ad integration** — Ads are the last phase, period. No ad SDK before 10K monthly pageviews. Build ad hook points (`pause`/`resume` callbacks) early so the plumbing exists, but keep `ads.js` in no-op mode until traffic exists. Rewarded ads before interstitials.

3. **Load time bloat from feature accumulation** — Budget every addition. Plausible <1KB, web-vitals ~2KB, GameAnalytics 53KB (Phase 3 only), AdSense lazy-loaded. Measure Core Web Vitals after every feature addition. Hard rule: game must load in <2s on throttled 3G.

4. **localStorage schema fragility** — Version the schema from day 1 (`dodge-ai-v` key). Write migration functions (v1→v2) on first load. Wrap all writes in try/catch (Safari private mode throws). Keep total stored data under 100KB.

5. **Viral share that nobody shares** — Text-only share ("I survived 34 seconds!") gets <10% of image share engagement. Visual canvas-generated card required. AI commentary/personality must be in the share content. Make it funny, not braggy — humor travels further than score flexing.

## Implications for Roadmap

Based on combined research, the build sequence must follow: **measure → hook → retain → grow → monetize**.

### Phase 1: Gameplay Polish + AI Depth
**Rationale:** The core loop must feel polished before building shareability. Audio, AI visibility, and session stats expansion are low-complexity, high-impact improvements that strengthen the foundation everything else builds on. Stay single-file — no build tooling changes needed yet.
**Delivers:** Audio system (muted default), expanded post-death stats, AI visibility layer showing what patterns were detected, improved visual feedback on deaths
**Addresses:** Table stakes (clear visual feedback, session stats), Differentiator Tier 1 (AI visibility)
**Avoids:** Pitfall 1 (AI unfairness) — AI visibility also serves as a fairness signal; player sees that the AI detected something legitimate

### Phase 2: Analytics + Shareability
**Rationale:** Analytics MUST come before progression decisions. You need D1/D7 retention numbers and drop-off points before deciding what to build. Shareability features (visual score card, AI commentary) are the growth engine and should come before retention optimization — a player who shares once and never returns still brought new players.
**Delivers:** Plausible analytics integration, web-vitals monitoring, visual score card generator (canvas → 1200x630 image), improved share flow with AI personality commentary, "How long can you survive?" social hook
**Uses:** Vite migration (progression code will push past 4000 lines soon — migrate here), Plausible (<1KB script tag), web-vitals npm package
**Implements:** `analytics.js` (async queue pattern), `storage.js` (extracted with v2 schema), share card canvas rendering
**Avoids:** Pitfall 3 (load time), Pitfall 8 (boring share content)
**Research flag:** SKIP — analytics script tags and canvas image generation are well-documented patterns

### Phase 3: Retention (Daily Challenge + Progression)
**Rationale:** Now that analytics reveals where players drop off, build the retention systems that address actual gaps. Daily challenge is the highest-impact single feature: Wordle proved daily + same-for-everyone + shareable = organic viral loop. Streak mechanics drive DAU. XP/progression creates investment that prevents churn.
**Delivers:** Daily challenge mode (fixed daily seed, all-players-same-AI), streak system with gentle ramp-down, XP system, first cosmetic unlocks (levels 2/5/8/12), achievement system foundations
**Implements:** `progression.js` module (XP, levels, unlock state), localStorage v2 schema migration, daily challenge seed algorithm (date-seeded RNG)
**Addresses:** Differentiator Tier 1 (daily challenge, streaks), Differentiator Tier 2 (meta-progression)
**Avoids:** Pitfall 5 (progression overwhelm) — shallow unlock tree, enhancements not replacements, test game without progression
**Research flag:** MAYBE — streak system and XP curve design are well-documented; daily challenge seed algorithm is trivial; no external dependencies

### Phase 4: Viral Mechanics
**Rationale:** With retention loop proven (analytics showing D7 numbers), now optimize the acquisition loop. "Challenge a friend" URL sharing, AI roast screenshot flow, and achievement showcase on share cards amplify the sharing behavior analytics will have confirmed is happening.
**Delivers:** "Challenge a friend" URL (date-seeded AI config in URL hash), AI roast screenshot share flow, achievement badges on share cards, GameAnalytics integration for game-industry retention benchmarks
**Implements:** URL hash encoding for AI seed, canvas overlay for roast screenshots, GameAnalytics JS SDK
**Avoids:** Pitfall 8 (boring share content) — humor and challenge framing
**Research flag:** SKIP — canvas manipulation and URL hash encoding are standard patterns

### Phase 5: Monetization (Ads)
**Rationale:** Ads come last. Not before consistent traffic. The ad hook architecture (pause/resume callbacks, graceful no-ops) should be built into `game.js` from Phase 2, so this phase is activation, not plumbing. Start with rewarded ads (opt-in, highest eCPM), add interstitials at natural break points only.
**Delivers:** Google AdSense H5 Games Ads activation, rewarded ad flow ("watch ad for extra life"), interstitial placement (every 3 deaths minimum), ad frequency controls, AppLixir rewarded video integration
**Uses:** `ads.js` module (pre-built as no-op), AdSense H5 Games API (`adBreak()`/`adConfig()`), AppLixir SDK
**Avoids:** Pitfall 2 (premature ads) — traffic gate, rewarded-first sequence
**Research flag:** NEEDS RESEARCH — AdSense allowlisting process, actual fill rates for a new site, AppLixir integration specifics need validation against actual API docs when the time comes

### Phase Ordering Rationale

- **Analytics before everything else** is the strongest constraint from FEATURES.md: "Measure retention before building more." Building daily challenge when players already play daily is waste; building it when D1 is 15% is critical.
- **Shareability before retention** because growth and retention serve different goals. Virality is top-of-funnel; progression is bottom-of-funnel. You need both but shareability-first means new players arrive to find a polished retention loop.
- **No backend means no leaderboards, no server-side daily challenge seeding, no cloud sync** — every phase must keep this constraint. The date-seeded RNG approach for daily challenges is the correct workaround.
- **Module extraction is feature-adjacent, not a standalone phase** — ARCHITECTURE.md makes this clear. Don't waste a phase reorganizing code with zero user-visible output.
- **Ads require traffic gate** — building ad integration at Phase 2 or 3 when pageviews are low earns nothing and risks AdSense rejection for insufficient traffic.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Monetization):** AdSense H5 Games allowlisting timeline and requirements, AppLixir SDK current integration docs, actual eCPM benchmarks for a new-site casual game (the $10-20 rewarded CPM figure is geo/traffic-quality dependent and needs validation with real data)

Phases with standard patterns (skip research-phase):
- **Phase 1 (Gameplay Polish):** Audio via Web Audio API, canvas visual effects — established browser game patterns, no external dependencies
- **Phase 2 (Analytics + Shareability):** Plausible script tag, canvas-to-image, web-vitals — all well-documented with official sources verified
- **Phase 3 (Retention):** localStorage streak tracking, date-seeded RNG, XP curves — well-understood patterns, no ambiguity
- **Phase 4 (Viral Mechanics):** URL hash encoding, canvas overlays — trivial web platform features

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Vite 7, vite-plugin-singlefile 2.3.0, Plausible, web-vitals all verified against official docs and npm. esbuild bundling pattern verified against official docs. |
| Features | HIGH | Core retention/viral patterns verified against multiple sources (Wordle analysis, Vampire Survivors, Duolingo streak data, DDA research). Anti-features are industry consensus. |
| Architecture | HIGH | Module structure based on codebase analysis of actual current code. Dependency graph is derived from real file contents. localStorage schema migration pattern is standard. |
| Pitfalls | HIGH | Synthesized from Stack + Features + Architecture research. Warning signs are specific and actionable. Ad-related risks backed by industry sources. |

**Overall confidence:** HIGH

### Gaps to Address

- **Ad revenue expectations**: The $10-20 rewarded CPM figure is an industry average that varies wildly by geo and traffic quality. Validate actual rates only after first month of live ads — don't plan revenue projections off these numbers.
- **AdSense allowlisting timeline**: The H5 Games Ads program requires account review and domain verification. Timeline is undisclosed by Google. Plan for 2-4 week approval process before Phase 5 can go live.
- **AI adaptation speed calibration**: PITFALLS.md identifies this as HIGH risk but optimal adaptation rate requires actual playtesting data, not research. The specific "cap per session" values need to be discovered empirically during Phase 1 development.
- **D1/D7 retention baseline**: All retention feature prioritization in Phase 3 depends on analytics data from Phase 2. The phase ordering is correct, but specific feature priority within Phase 3 may shift based on what analytics reveals.

## Sources

### Primary (HIGH confidence)
- [Vite 7 Release Announcement](https://vite.dev/blog/announcing-vite7) — current stable version confirmed
- [vite-plugin-singlefile on npm](https://www.npmjs.com/package/vite-plugin-singlefile) — v2.3.0 confirmed
- [Plausible Analytics GitHub](https://github.com/plausible/analytics) — <1KB script size confirmed
- [GameAnalytics JavaScript SDK Docs](https://docs.gameanalytics.com/event-tracking-and-integrations/sdks-and-collection-api/open-source-sdks/javascript/) — 53-65KB size confirmed
- [Google AdSense H5 Games Ads](https://support.google.com/adsense/answer/9959170) — allowlisting requirements, Ad Placement API confirmed
- [Google Ad Placement API Docs](https://developers.google.com/ad-placement/apis) — adBreak/adConfig usage confirmed
- [Schema.org VideoGame Type](https://schema.org/VideoGame) — structured data properties confirmed
- [web-vitals GitHub](https://github.com/GoogleChrome/web-vitals) — v5.x, LCP/INP/CLS confirmed
- [web.dev Core Web Vitals](https://web.dev/articles/vitals) — INP <200ms threshold confirmed
- [esbuild Official Docs](https://esbuild.github.io/) — bundling pattern confirmed
- [MDN JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) — ES module patterns

### Secondary (MEDIUM confidence)
- [Wordle Viral Analysis (buildd.co)](https://buildd.co/product/wordle-the-viral-sensation) — daily scarcity + share mechanics
- [Smithsonian - Why Wordle Went Viral](https://www.smithsonianmag.com/smart-news/heres-why-the-word-game-wordle-went-viral-180979439/) — psychology of shared daily challenge
- [Vampire Survivors Success Analysis (game-wisdom.com)](https://game-wisdom.com/critical/success-vampire-survivors) — "never hide the fun" progression principle
- [Yu-kai Chou - Streak Design](https://yukaichou.com/gamification-study/master-the-art-of-streak-design-for-short-term-engagement-and-long-term-success/) — gentle ramp-down vs. hard reset
- [Plotline - Streaks in Apps](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps) — 40-60% DAU lift from streak mechanics
- [Tenjin Ad Monetization 2025](https://tenjin.com/blog/ad-mon-gaming-2025/) — eCPM benchmarks, rewarded > interstitial
- [DigitalEdge Browser Game Case Study](https://digitaledge.org/how-a-simple-browser-game-reached-42-million-sessions-in-q3-q4-2025-full-case-study/) — 42M sessions case study
- [IEEE DDA Research](https://ieeexplore.ieee.org/document/7785854/) — dynamic difficulty adjustment retention impact
- [AppLixir - HTML5 Rewarded Video](https://www.applixir.com/blog/html5-game-development-reward-video-ads/) — small publisher friendliness

### Tertiary (LOW confidence — verify before using)
- Rewarded video CPM range ($10-20) — industry average cited in multiple articles, varies wildly by geo/traffic quality
- "70% acquisition from social shares" — cited in case study, not independently verified
- CWV comprising 25-30% of Page Experience ranking weight — SEO industry articles, not confirmed directly by Google
- "60% of players discover games via Google search" — cited in Playwire gaming SEO article, single source

---
*Research completed: 2026-02-18*
*Ready for roadmap: yes*
