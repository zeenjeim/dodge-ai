# Phase 4: Retention - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Daily challenge mode and personal best tracking give players a reason to return. The original roadmap included streaks and cosmetic rewards — user decision to simplify: daily challenge + personal bests only. Streaks, cosmetics, and global leaderboards are deferred.

</domain>

<decisions>
## Implementation Decisions

### Scope simplification
- Phase 4 reduced to: daily challenge + personal best list
- Streaks REMOVED — diminishing returns for a casual browser game
- Cosmetic rewards REMOVED — unnecessary complexity
- Rationale: game will be public with ad monetization — daily active users matter more than gamification depth

### Personal best list
- Show top 5 survival times with the date they happened
- Simple, clean, motivating — no extra metadata needed

### Claude's Discretion
- **Daily challenge seed mechanism** — how the date-based seed creates a consistent AI config
- **Entry point** — how the player accesses the daily challenge (button, prompt, etc.)
- **Attempt limit** — whether daily is one-shot or unlimited (best counts)
- **Completion criteria** — what counts as "played" for daily purposes
- **Daily vs normal score separation** — whether to keep one list or two
- **Daily reset timing** — when the daily challenge rolls over
- **Visual distinction** — how the daily challenge looks/feels different from normal play

</decisions>

<specifics>
## Specific Ideas

- Long-term goal is to upload the game live, generate traffic, and run ads — retention features should serve daily active user growth
- User wants this SIMPLE — minimal UI additions, minimal new systems
- Personal best list: top 5 survival times with dates, nothing more

</specifics>

<deferred>
## Deferred Ideas

- **Global leaderboard** — requires a backend; powerful for virality but out of scope for single-file architecture
- **Streak system** — could be re-added later if analytics show players want it
- **Cosmetic rewards** — titles, visual effects for milestones; deferred unless retention data justifies the effort
- **Ad integration** — monetization infrastructure is a separate future concern

</deferred>

---

*Phase: 04-retention*
*Context gathered: 2026-02-19*
