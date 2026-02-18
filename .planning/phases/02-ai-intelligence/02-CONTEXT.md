# Phase 2: AI Intelligence - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

The AI visibly learns player patterns, adapts its attacks to counter habits, and stays fair with capped escalation. Covers in-game learning messages, pattern detection, counter-pattern firing, adaptive difficulty, and cross-session memory via localStorage. Share cards, new projectile types, and retention loops are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Fairness & escalation feel
- AI stance is **adversarial** — it's an opponent trying to beat you, not a coach helping you improve
- Death is **inevitable** — the game is about how LONG you survive, not IF you die. AI escalates until it overwhelms
- Escalation speed is **fast** — AI starts reacting to patterns within 30-60 seconds. Short, intense runs with quick feedback
- Per-session escalation cap behavior: **Claude's discretion** — pick whatever creates the best endgame feel (plateau vs cycling patterns)

### Adaptation behavior
- AI adapts **both within a run and across runs** — learns patterns live during play AND remembers returning players via localStorage
- Counter-attacks use **explicit callouts** — AI announces what it detected ("Targeting your safe zone", "Detected clockwise pattern") so the player knows they've been read
- Pattern change handling: **Claude's discretion** — pick whether AI resets on new patterns or stacks knowledge, based on what creates the best cat-and-mouse dynamic
- Returning player experience: **welcome back taunt** — AI greets returning players with a message referencing their past habits ("Still dodging clockwise?")

### Claude's Discretion
- Endgame cap behavior (plateau vs cycling patterns)
- Pattern memory strategy (reset vs stack when player adapts)
- AI personality & messaging tone (not discussed — Claude has full flexibility on voice, wording, placement of learning messages)
- Learning visibility depth (not discussed — Claude decides how much of the AI's "brain" to expose via HUD or messages)

</decisions>

<specifics>
## Specific Ideas

- The "welcome back taunt" referencing specific past habits creates a rivalry feel — the AI remembers YOU personally
- Explicit callouts before counter-attacks create a mind-game dynamic: player sees "Targeting your safe zone" and must decide whether to stay or move
- 30-60s adaptation window means runs are short and intense — no slow warmup phase

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-ai-intelligence*
*Context gathered: 2026-02-18*
