# Phase 3: Growth Foundation - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the game discoverable via search (SEO + structured data), shareable as a visual card (1200x630 image with stats and AI commentary), and measured with analytics (sessions, events, retention). No new gameplay features — this is infrastructure for growth.

</domain>

<decisions>
## Implementation Decisions

### Analytics events & tooling
- Provider: Claude's discretion (privacy-first, no cookies, no consent banner required)
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

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for SEO, share cards, and analytics in a single-file browser game.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-growth-foundation*
*Context gathered: 2026-02-19*
