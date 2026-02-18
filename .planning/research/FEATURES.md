# Feature Landscape: Dodge AI

**Domain:** Ad-monetized browser bullet hell game with adaptive AI
**Researched:** 2026-02-18
**Mode:** Ecosystem (Features dimension)
**Context:** Subsequent milestone -- core game exists with AI learning, 6 phases, bosses, power-ups. Adding retention, progression, virality, and smarter AI.

---

## Table Stakes for Retention

Features players expect from a well-made browser game in 2025-2026. Missing any of these and players leave without coming back.

| Feature | Why Expected | Complexity | Confidence | Notes |
|---------|--------------|------------|------------|-------|
| **Personal Best Tracking (visible)** | Players need a clear goal to beat. Every casual game shows high score prominently. Dodge AI already persists best time in localStorage but it needs to be more prominent and central to the loop. | Low | HIGH | Already partially exists. Expand to show best time, best phase reached, most dodges. |
| **Instant Retry / Zero Friction Restart** | Bounce rate killer. If a player dies and has to click through menus, they leave. "One more try" must be one tap away. | Low | HIGH | Already exists via retry button. Verify it's fast (no animations blocking replay). |
| **Progressive Difficulty That Feels Fair** | Players quit when they feel cheated. The AI learning mechanic is the differentiator, but it MUST feel fair -- deaths need to feel earned, not random. Dynamic difficulty adjustment research shows games that adapt to skill level retain 40%+ better. | Med | MEDIUM | This is the hardest balance. AI that's too smart too fast = rage quit. AI that's too easy = boredom. Need a "flow state" calibration. Dodge AI's phase system helps, but the AI brain adaptation speed matters. |
| **Session Stats / Post-Death Summary** | Players want to understand what happened. Time survived, dodges, phase reached, what killed them. Creates a "I can do better" narrative. Vampire Survivors succeeds partly because every run has clear stat feedback. | Low | HIGH | Already partially exists in game over screen. Expand with richer stats: dodge count, closest calls, AI adaptation level. |
| **Mobile Performance (60fps)** | Over 60% of casual browser game traffic comes from mobile. Jank = immediate bounce. Already a stated constraint but bears repeating. | Low | HIGH | Already addressed in constraints. Maintain rigorously. |
| **Sub-2-Second Load** | Critical for both SEO and retention. Single HTML file architecture helps. Every added feature must be evaluated for load time impact. | Low | HIGH | Already a constraint. Ad scripts will threaten this later -- plan ahead. |
| **Clear Visual Feedback** | Players need to understand what hit them and what power-ups do. Every death should have a visible cause. Bullet patterns need readable visual language. | Med | HIGH | Partially exists with particle effects and warnings. Could be stronger on "what killed me" clarity. |
| **Audio Feedback (Optional/Muted Default)** | Browser games should NOT autoplay audio (anti-pattern). But having satisfying sound effects for dodges, pickups, deaths, and bosses significantly increases engagement when players opt in. | Med | MEDIUM | Not mentioned in current features. Important gap. Sound makes games feel 3x more polished. Muted by default with tap-to-unmute. |

## Differentiators

Features that set Dodge AI apart in the crowded browser game space. Not expected, but create competitive advantage and "holy shit" moments.

### Tier 1: High-Impact Differentiators (Build These)

| Feature | Value Proposition | Complexity | Confidence | Notes |
|---------|-------------------|------------|------------|-------|
| **AI That Visibly Learns You** | This IS the game's unique hook. The "holy shit, it figured me out" moment. But it needs to be VISIBLE -- the AI should telegraph that it's adapting. Show the player what the AI knows: "AI detected your clockwise dodge pattern" or "AI learned you favor the top-left zone." Making the invisible visible turns a mechanic into a story. | Med | HIGH | Core differentiator per PROJECT.md. Currently tracks dodge bias, zones, reaction time. Making this visible to the player transforms it from a hidden mechanic to a shareable moment. |
| **Spoiler-Free Shareable Results (Wordle-Style)** | Wordle's emoji grid was THE viral mechanic of the 2020s. Dodge AI needs its equivalent. A visual "survival story" -- a compact, beautiful image/emoji showing which phases you hit, when the AI adapted, where you died. NOT just a score number, but a narrative in miniature. Research shows social shares drove 70% of acquisition for successful browser games. | Med | HIGH | Current share button copies text with a quip. Upgrade to a visual card -- either emoji grid (phases as colored blocks, adaptation moments as special symbols) or a canvas-generated image card (1200x630 for Open Graph). The share content should make people who see it want to play. |
| **AI Personality / Commentary** | The AI talks to you during the game. Not random quips -- contextual trash talk based on what it's learned. "Ah, the top-left corner again. Predictable." or "Nice dodge. I won't fall for that twice." Gives the AI a character, makes it memeable, creates screenshot moments. | Med | MEDIUM | Listed in PROJECT.md as active requirement (AI personality modes). This is the viral multiplier -- people share funny/creepy AI comments. Keep comments short, punchy, and personality-driven. |
| **Daily Challenge Mode** | One curated AI configuration per day. Same for all players. Creates Wordle's scarcity effect (one per day = anticipation) and shared experience (we're all fighting the same AI today). Streak tracking for consecutive daily completions. Research: apps with streak mechanics see 40-60% higher DAU. | Med | HIGH | Not yet built. This is the single strongest retention feature to add. Wordle proved daily + same-for-everyone + shareable = viral. Pair with the visual share card for maximum impact. |
| **Streak System with Gentle Penalties** | Track consecutive daily plays. Reward escalates (cosmetics, titles, bragging rights). But use "gentle ramp-down" not "hard reset" when streak breaks -- research shows gradual decrease (50 to 40 to 30 to 20 to 10) retains players, while hard zero-reset causes permanent churn. | Low | HIGH | Depends on daily challenge mode. Duolingo's streak drives 55% DAU retention. For a no-backend game, localStorage streaks work fine. |

### Tier 2: Notable Differentiators (Build If Time Permits)

| Feature | Value Proposition | Complexity | Confidence | Notes |
|---------|-------------------|------------|------------|-------|
| **Meta-Progression / Permanent Unlocks** | Between-run progression that persists. XP, levels, unlockable player abilities, cosmetic skins. Vampire Survivors' success was built on "every run progresses something permanent." Creates investment -- a player with 20 hours of unlocks won't leave. | High | HIGH | Not yet built. Use exponential XP curves (easy early levels, harder later). Unlock new starting abilities, visual skins, title cards. All localStorage. This is the "addiction engine" but requires careful balance to not overwhelm the core dodge mechanic. |
| **Achievement / Badge System** | Named achievements for specific accomplishments. "Survive 60 seconds without moving", "Dodge 100 bullets in Phase 1", "Beat a boss without power-ups." Each badge is a micro-goal that creates intrinsic motivation. Research shows achievements extend game longevity significantly. | Med | HIGH | Great for retention depth. Each achievement is a reason to replay with a specific goal. Display on profile / share card. |
| **Environmental Hazards** | Moving walls, shrinking arena, gravity wells, conveyor belts. Changes the dodge space itself, not just the projectiles. Creates variety without requiring new AI behaviors. | Med | MEDIUM | Listed in PROJECT.md as active req. Good variety driver but secondary to progression/social features for retention. |
| **Procedural AI Variation** | Each run the AI has slightly different "personality" tendencies (aggressive vs. patient, zonal vs. tracking). Creates build diversity and replayability. "This AI plays different" keeps runs feeling fresh. | Med | MEDIUM | Builds on existing AI brain. Random seed per run for AI personality weights. Daily challenge mode uses fixed seed. |

## Viral Mechanics

Features specifically designed to make Dodge AI spread organically. Research shows successful browser games get 70% of acquisition from social shares.

| Feature | Why It Works | Complexity | Confidence | Notes |
|---------|-------------|------------|------------|-------|
| **Visual Score Card (Canvas-Generated)** | A 1200x630 image showing survival time, phase reached, AI adaptation moments, and a dramatic visual. Players share images more than text. Open Graph compatible for rich previews when shared as links. Wordle's emoji grid was shareable because it told a story without spoilers. | Med | HIGH | Use canvas API to generate. Include: time, phase, AI insights ("AI adapted 3 times"), dodge count. Make it visually striking with the game's neon aesthetic. |
| **"Challenge a Friend" Direct Link** | URL with parameters that set up a specific AI config. "Beat my 47.3s against THIS AI." Friend clicks, gets same AI behavior, can compare directly. Personal challenge > generic leaderboard for virality. | Med | MEDIUM | Encode AI seed/config in URL hash. No backend needed. Recipient plays against the same AI pattern. Losers share harder challenges. |
| **AI Roast / Commentary Screenshots** | When the AI says something funny/savage about your play style, a one-tap screenshot share. Meme-ready content. TikTok and Twitter thrive on game AI being savage. "#ChickenRoadChallenge videos generated 4.8 million views" -- give players content to post. | Low | MEDIUM | Depends on AI personality/commentary feature. Overlay the AI comment on a screenshot of the moment. Share button on game over screen with the AI's "final words." |
| **"How Long Can You Survive?" Hook** | The meta-description and OG tags frame the game as a personal challenge. Every share implicitly says "I bet you can't beat my time." This competitive framing drove .io game virality. | Low | HIGH | Already partially exists in OG tags. Refine the copy to be more challenge-oriented. Dynamic OG tags based on score would be ideal but requires server-side rendering. |
| **Spectate / Replay Ghost** | After death, see a ghost replay of your run. Share the replay link. "Watch how the AI figured me out in 23 seconds." Replay content is inherently shareable video material. | High | LOW | Complex to implement (record + replay state). Defer unless core features are solid. Would be incredible for content creators but high effort. |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain that would hurt retention or ad revenue.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Autoplay Audio** | Instant bounce on mobile. Browser autoplay policies block it anyway. Feels aggressive and cheap. | Muted by default. Prominent, friendly sound toggle. Play a satisfying sound on FIRST user interaction as a "taste" of what audio adds. |
| **Aggressive Ad Frequency** | Research: "ads every couple of seconds" is the #1 cause of casual game churn. Players prefer one 30-second ad per 10 minutes over several shorter ads. Hyper-casual day 7 retention drops to single digits partly due to ad fatigue. | Rewarded ads only initially (watch ad for extra life or power-up). Interstitials only at natural break points (every 3-5 deaths, NOT every death). Never interrupt gameplay. Ads come AFTER traffic, not before. |
| **Interstitial Ads Between Every Death** | Death already feels bad. An ad on top of death = rage quit + uninstall. This is the #1 monetization mistake in casual games. | Interstitials at natural break points only -- after every Nth game over, or when returning to menu from stats screen. Maximum 1 interstitial per 10-minute session. |
| **Pay-to-Win Power-Ups** | Already out of scope per PROJECT.md, but worth stating: any paid advantage kills the "fair challenge" feel that makes the AI learning mechanic special. | Ad-only monetization. Cosmetics-only unlocks. Power-ups earned through gameplay only. |
| **Mandatory Account / Login** | Browser games live on zero-friction. Requiring signup before play = 90%+ drop-off. Even optional signup walls reduce engagement. | localStorage for all state. No accounts. No email capture. If you ever add cloud sync, it's strictly optional and post-engagement. |
| **Tutorial Popup Before First Game** | Players learn by dying. A tutorial kills the "what is this?" curiosity that drives first-session engagement. Browser games especially need instant action. | Contextual hints during first 10 seconds of gameplay ("move to dodge"). No modal popups, no "click to continue" gates. Let them play immediately. |
| **Complex Menu System** | Every screen between "open URL" and "playing the game" is a bounce risk. Landing page should BE the game or be one tap from it. | Title screen with play button. That's it. Settings, stats, achievements accessible from pause/death screen, not pre-game. |
| **Leaderboard Without Anti-Cheat** | Client-side leaderboards are trivially hackable. A leaderboard full of "999999s" kills the competitive feel. Server-side leaderboards add complexity for questionable value in a casual game. | Personal bests only. Daily challenge comparisons via visual share cards (self-reported, social proof). If you add leaderboards later, they need server validation. |
| **Feature Bloat / Slow Iteration** | Adding too many features before validating core retention loop. The game is already feature-rich (6 phases, 8 power-ups, bosses). More features != more retention if the loop isn't tight. | Measure retention before building more. Add analytics first. Understand WHERE players drop off before building features to fix it. |
| **Overly Punishing AI Adaptation** | If the AI learns TOO fast, new players feel helpless. "The AI is cheating" = quit. The adaptation needs to be gradual and feel like a fair escalation, not a wall. | Cap AI adaptation speed per session. Reset AI aggression slightly each new game. The AI should feel "clever," not "unfair." Maintain a minimum dodge window so players always have a chance. |
| **Energy Systems / Timers** | "Wait 30 minutes to play again" -- standard mobile F2P dark pattern. Absolutely wrong for a browser game going for organic viral growth. | Unlimited plays. Always. No artificial scarcity on gameplay itself. Scarcity only on daily challenge (one per day by design choice, not restriction). |

## Progression System Design

Recommended structure for player progression, based on patterns from Vampire Survivors, roguelite genre, and casual game best practices.

### XP and Leveling

| Element | Recommendation | Rationale |
|---------|---------------|-----------|
| **XP Source** | Survival time + dodges + phase completion + boss kills | Multiple XP sources means every play style earns something |
| **XP Curve** | Exponential with coefficient 1.3-1.5x per level | Fast early levels (hook), slower later levels (depth). Level 1-10 in first few sessions. |
| **Level Cap** | 50-100 initially | High enough to feel aspirational, achievable enough that dedicated players reach it in weeks not months |
| **Prestige / Reset** | Not for v1 | Adds complexity without clear value until player base is established |

### Unlock Tiers

| Unlock Type | When | Examples | Why |
|-------------|------|----------|-----|
| **Cosmetic Skins** | Levels 2, 5, 8, 12, 18, 25, 35, 50 | Player trail colors, death animations, projectile themes | Visual reward, no gameplay impact, shareable identity |
| **Title Cards** | Achievements and milestones | "Phase 6 Survivor", "AI Whisperer", "Speed Demon" | Social identity, appears on share cards |
| **Starting Abilities** | Levels 10, 20, 30, 40 | Start with one power-up charge, slightly larger player, brief invincibility | Meaningful gameplay reward that speeds up early-game without trivializing late-game |
| **AI Modifiers** | Levels 15, 25, 35 | "Aggressive AI", "Chaotic AI", "Zen Mode" | Replayability through gameplay variety |

### Reward Pacing (Critical)

Based on Vampire Survivors' "never hide the fun" principle:
- **Every single run** should earn SOMETHING (XP at minimum)
- **Every 2-3 runs** should unlock something visible (cosmetic, badge, level)
- **First 5 runs** should produce at least 3 unlocks (fast early hook)
- **Never go more than 10 minutes** of play without a tangible reward

## Feature Dependencies

```
Core Game Loop (EXISTS)
  |
  +-- Analytics Integration
  |     (Must come FIRST -- measure before you optimize)
  |
  +-- Audio System (muted default)
  |     (Independent, adds polish)
  |
  +-- AI Visibility Layer
  |     |-- AI Commentary / Personality
  |     |-- AI Roast Screenshots (share)
  |     +-- "Challenge a Friend" Links
  |
  +-- Visual Score Card Generator
  |     |-- Canvas-based card (1200x630)
  |     +-- Share to social / clipboard
  |
  +-- Daily Challenge Mode
  |     |-- Fixed daily seed
  |     |-- Streak Tracking
  |     +-- Daily Share Card
  |
  +-- Meta-Progression System
  |     |-- XP / Leveling
  |     |-- Cosmetic Unlocks
  |     |-- Achievement / Badge System
  |     +-- Starting Ability Unlocks
  |
  +-- Ad Infrastructure (LAST, after traffic)
        |-- Rewarded ads (watch for extra life)
        |-- Interstitials (natural breaks only)
        +-- Banner (if needed, bottom of game-over screen)
```

**Key dependency insight:** Analytics MUST come before any new feature work. You need to know current D1/D7 retention, session length, and drop-off points before deciding which features to prioritize. Building a daily challenge system when players already play daily is wasted effort. Building it when D1 retention is 15% is critical.

## Priority Recommendation for Next Milestone

Based on research into what actually drives retention and virality in browser games, the build order should follow "measure, then hook, then retain, then grow, then monetize."

### Phase 1: Measure (Analytics + Audio Polish)
1. Analytics integration -- know your numbers
2. Audio system -- low effort, high polish impact
3. Session stats expansion -- richer game over screen

### Phase 2: Hook (Shareability)
1. Visual score card generator (canvas)
2. Improved share flow (one-tap to clipboard/social)
3. AI visibility layer ("AI learned your pattern")
4. AI commentary during gameplay

### Phase 3: Retain (Daily + Progression)
1. Daily challenge mode with fixed daily seed
2. Streak tracking with gentle ramp-down penalties
3. XP system + leveling
4. First batch of cosmetic unlocks

### Phase 4: Grow (Viral Mechanics)
1. "Challenge a friend" URL sharing
2. AI roast screenshot sharing
3. Achievement / badge system
4. More cosmetics and starting abilities

### Phase 5: Monetize (Ads, After Traffic)
1. Rewarded ad infrastructure (extra life)
2. Interstitial placement (every Nth death)
3. Ad frequency testing and optimization

**Rationale:** Shareability features (Phase 2) before retention features (Phase 3) because you need SOMETHING viral before optimizing for retention. A player who shares once and never returns still brought new players. A player who returns daily but never shares is a dead end for growth.

## Sources

### High Confidence (Multiple sources agree)
- Wordle viral mechanics (emoji grid, daily scarcity, shared experience): [Wordle History](https://stuckonwordle.com/history.html), [Wordle Viral Analysis](https://buildd.co/product/wordle-the-viral-sensation), [Smithsonian Psychology Analysis](https://www.smithsonianmag.com/smart-news/heres-why-the-word-game-wordle-went-viral-180979439/)
- Streak design best practices (gentle ramp-down, escalating rewards): [Yu-kai Chou Streak Design](https://yukaichou.com/gamification-study/master-the-art-of-streak-design-for-short-term-engagement-and-long-term-success/), [Plotline Streaks](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps)
- Vampire Survivors progression analysis: [Game Wisdom Analysis](https://game-wisdom.com/critical/success-vampire-survivors)
- Ad monetization anti-patterns: [Tenjin Benchmark 2025](https://tenjin.com/blog/ad-mon-gaming-2025/), [Udonis Monetization](https://www.blog.udonis.co/mobile-marketing/mobile-games/mobile-game-monetization)
- Dynamic difficulty adjustment: [Wikipedia DDA](https://en.wikipedia.org/wiki/Dynamic_game_difficulty_balancing), [IEEE Research](https://ieeexplore.ieee.org/document/7785854/)

### Medium Confidence (Verified with one official source)
- Browser game viral case study (42M sessions): [DigitalEdge Case Study](https://digitaledge.org/how-a-simple-browser-game-reached-42-million-sessions-in-q3-q4-2025-full-case-study/)
- SEO discovery strategies for games: [Global Media Insight Gaming SEO](https://www.globalmediainsight.com/blog/gaming-seo/), [Genieee Game SEO Guide](https://genieee.com/game-seo-guide-how-to-get-your-game-discovered/)
- Ad eCPM benchmarks (rewarded $15-25, interstitial $8-13, banner $1.50): [Tenjin 2025](https://tenjin.com/blog/ad-mon-gaming-2025/), [Business of Apps](https://www.businessofapps.com/ads/research/mobile-app-advertising-cpm-rates/)
- 40-60% DAU increase from streak mechanics: [Plotline](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps)

### Low Confidence (Single source or unverified)
- Specific 48% D1 retention benchmark from Chicken Road case study -- single source, specific to gambling-adjacent game
- "70% acquisition from social shares" statistic -- cited in case study, not independently verified
- Precise XP curve coefficients -- based on general game design theory, not browser-game-specific data
