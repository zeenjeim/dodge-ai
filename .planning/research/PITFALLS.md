# Common Pitfalls

**Domain:** Ad-monetized browser bullet hell game with adaptive AI
**Researched:** 2026-02-18
**Confidence:** HIGH (synthesized from Stack, Features, Architecture research + domain knowledge)

---

## Critical Pitfalls

### 1. AI That Feels Unfair (Rage Quit Loop)

**Risk:** HIGH | **Phase:** AI Improvements (Phase 1-2)

The AI learning mechanic is the core differentiator, but if it adapts too fast, players feel cheated. "The game is broken" not "the game outsmarted me." This is the #1 retention killer for adaptive difficulty games.

**Warning signs:**
- Average session length drops below 30 seconds
- Retry rate drops (players quit instead of retrying)
- Players clear Phase 1 easily but die instantly in Phase 3+
- AI brain data shows extreme adaptation after just 2-3 games

**Prevention:**
- Cap AI adaptation speed per session (don't let it learn everything in one game)
- Add a "learning cooldown" — AI gets smarter gradually across sessions, not within a single run
- Ensure every death has clear visual cause (player sees WHY they died)
- Keep early phases genuinely accessible regardless of AI learning
- Playtest the "first 5 games" experience obsessively — this is where retention is won or lost

**Anti-pattern:** Making the AI's learned predictions 100% accurate. Even the "smartest" AI should have noise/randomness so players feel they have agency.

---

### 2. Premature Ad Integration (Killing the Golden Goose)

**Risk:** HIGH | **Phase:** Monetization (Phase 5+)

Putting ads in before you have consistent traffic is the most common indie game monetization mistake. It degrades the experience for your small audience while generating pennies.

**Warning signs:**
- Adding ad SDK before 10K monthly pageviews
- Interstitial ads after every death
- Banner ads during gameplay
- Ad scripts increasing load time above 2s
- Players complaining about ads in reviews/shares

**Prevention:**
- Ads are the LAST phase, after traffic is established
- Use rewarded ads first (opt-in, player gets something) — 3-5x higher eCPM than interstitials
- Maximum 1 interstitial per 3-4 deaths (never every death)
- Never show ads during gameplay — only during natural breaks (game over, menu)
- Lazy-load ad scripts (don't block first paint)
- Build ad hooks with graceful no-ops so the game works perfectly without ads loaded

**Anti-pattern:** Interstitial between every retry. This is the fastest way to kill a browser game's retention.

---

### 3. Feature Creep Destroying Load Time

**Risk:** HIGH | **Phase:** All phases

Every feature adds weight. Sound files, analytics scripts, ad SDKs, sprite sheets — they compound. Browser games live or die by first paint time. Mobile users on 3G bounce at 3 seconds.

**Warning signs:**
- Total page weight exceeding 500KB
- First Contentful Paint above 2 seconds
- Adding external fonts, icon libraries, or CSS frameworks
- Bundling unused analytics features
- Loading all assets at startup instead of lazy-loading

**Prevention:**
- Budget every addition: analytics (Plausible <1KB), ads (lazy-loaded), sounds (Web Audio API, compressed)
- Measure Core Web Vitals after every feature addition
- If audio is added, compress aggressively (OGG/WebM, short clips, sprite sheets)
- Keep the game playable while optional assets load in the background
- Set a hard budget: game must load in <2s on throttled 3G

---

### 4. SEO Mistakes for Single-Page Browser Games

**Risk:** MEDIUM | **Phase:** SEO/Growth (Phase 3-4)

Browser games have unique SEO challenges. Google can't play your game, so it needs structured data and content to understand what it is.

**Warning signs:**
- No Schema.org VideoGame markup
- Missing or generic meta description
- No meaningful text content on the page (just a canvas)
- OG image is a screenshot rather than a designed card
- No sitemap or robots.txt
- Title is generic ("My Game" instead of "Dodge AI - The AI That Learns How You Play")

**Prevention:**
- Add Schema.org VideoGame JSON-LD early (name, description, genre, platform, screenshot)
- Write compelling meta description that targets search intent ("free browser game", "bullet hell", "AI game")
- Include visible text content around the canvas (how to play, game description) — this is what Google indexes
- Design a proper OG image (1200x630) for social sharing
- Create a descriptive, keyword-rich title tag
- Consider a /about or /how-to-play page if the game gets its own domain

---

### 5. Progression System That Overwhelms Core Gameplay

**Risk:** MEDIUM | **Phase:** Progression (Phase 3-4)

Adding XP, levels, unlockables, and achievements is powerful for retention, but if overdone, it buries the core "dodge the AI" loop under menus and numbers.

**Warning signs:**
- More time in menus than playing the game
- Players confused about what their unlocks do
- XP curve feels like grinding (too slow) or trivial (too fast)
- Unlockable abilities that make the game too easy
- Achievement spam during gameplay

**Prevention:**
- Progression should ENHANCE the dodge loop, not replace it
- Keep the unlock tree shallow for v1 (5-8 meaningful unlocks, not 50 filler ones)
- Unlockable abilities should add options, not power (new dodge style, not more health)
- Achievements should pop post-death in the summary, not during gameplay
- Test the game with zero progression — it should still be fun stand-alone

---

### 6. localStorage Data Loss / Corruption

**Risk:** MEDIUM | **Phase:** Architecture (Phase 2+)

As more data goes into localStorage (AI brain, progression, streaks, achievements), the risk of corruption, format changes, or browser clearing grows.

**Warning signs:**
- No version field in stored data
- Schema changes that break existing saves
- No migration path between data versions
- Data exceeding 5MB localStorage limit (unlikely but possible with excessive history)
- Private/incognito mode users losing everything

**Prevention:**
- Version your localStorage schema from day 1 (add a `schemaVersion` field)
- Write migration functions that upgrade v1 → v2 → v3 on load
- Wrap all localStorage access in try/catch (Safari private mode throws on write)
- Keep total stored data under 100KB (plenty for all planned features)
- Surface "data might be lost" warning for incognito users
- Consider optional export/import of save data for dedicated players

---

### 7. Mobile Touch UX Gaps

**Risk:** MEDIUM | **Phase:** Polish (ongoing)

The game has touch support, but "works on mobile" and "feels great on mobile" are very different. Casual browser games get 60%+ mobile traffic.

**Warning signs:**
- Player's finger covers where they're trying to dodge
- UI elements too small to tap
- Accidental browser gestures (pull-to-refresh, swipe-back)
- Game doesn't respect notch/safe areas
- Touch input feels laggy vs. mouse

**Prevention:**
- Offset the player position above the touch point (so finger doesn't cover character)
- Add `overscroll-behavior: none` and `touch-action: none` to prevent browser gestures
- Test on actual phones, not just DevTools emulation
- Respect `env(safe-area-inset-*)` for notched devices
- HUD elements need minimum 44x44px tap targets
- Consider haptic feedback via Vibration API for hits/deaths

---

### 8. Viral Share That Nobody Wants to Share

**Risk:** MEDIUM | **Phase:** Shareability (Phase 2-3)

A share button that copies "I survived 34 seconds!" is not shareable. Nobody cares about your score. They care about a story, a flex, or something funny.

**Warning signs:**
- Share content is just a number
- No visual component (text-only shares get <10% of image share engagement)
- Share message sounds like marketing copy
- No personality in the share content

**Prevention:**
- Generate a visual share card (canvas-to-image, 1200x630)
- Include the AI's commentary/personality in the share ("The AI called me 'predictable'")
- Make the share funny, not braggy — humor travels further
- Include a call-to-action that creates curiosity ("Can you beat an AI that learns your moves?")
- Phase-based share content (dying in Phase 1 = self-deprecating humor, Phase 6 = flex)
- The existing quip system is good — expand it and pair with visuals

---

## Summary Table

| # | Pitfall | Risk | Relevant Phase | Core Prevention |
|---|---------|------|----------------|-----------------|
| 1 | AI feels unfair | HIGH | AI improvements | Cap adaptation speed, ensure clear visual causality |
| 2 | Premature ads | HIGH | Monetization | Ads LAST, rewarded first, lazy-load |
| 3 | Load time bloat | HIGH | All phases | Budget every KB, measure CWV after each feature |
| 4 | SEO mistakes | MEDIUM | Growth/SEO | Schema.org JSON-LD, visible text content, good meta |
| 5 | Progression overwhelm | MEDIUM | Progression | Shallow tree, enhance don't replace core loop |
| 6 | localStorage fragility | MEDIUM | Architecture | Version schema, migrations, try/catch |
| 7 | Mobile UX gaps | MEDIUM | Polish | Finger offset, gesture prevention, real device testing |
| 8 | Boring share content | MEDIUM | Shareability | Visual cards, humor, AI personality in shares |

---
*Researched: 2026-02-18*
