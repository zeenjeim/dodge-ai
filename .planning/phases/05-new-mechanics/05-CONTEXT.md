# Phase 5: New Mechanics - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Expand gameplay with new projectile types, environmental hazards, and unlockable player abilities. All three mechanic categories integrate with the existing AI brain and phase ramp system. No new UI screens or menus beyond what's needed to surface these mechanics in-game.

</domain>

<decisions>
## Implementation Decisions

### Projectile personality
- Mix of pattern-readable (spirals, sine waves) and chaotic (splitting, multiplying) types
- At least 3 new types that complement the existing 6
- Hybrid AI integration: new types are phase-gated (available at certain phases), but AI decides frequency and targeting based on what's working against the player
- Claude picks the specific projectile types and their visual identity, balancing readability vs variety within the existing neon-on-dark aesthetic

### Hazard design
- Escalating intensity: starts subtle (small zones, gravity wells) in earlier phases, builds to major arena reshaping (walls, shrinking) in later phases
- AI-triggered: AI deploys hazards based on player behavior (camping a spot, doing too well), not on fixed timers
- Visual preview telegraphing: hazard zones appear faded/outlined before activating, giving reaction time so deaths feel fair
- Claude decides counterplay mechanics (whether powerups can neutralize hazards, duration, etc.)

### Ability unlock system
- 3-4 unlockable abilities (not just the minimum 2)
- Earned through survival milestones (total time survived, single-run records)
- Claude decides the relationship between abilities and existing powerups (separate system vs upgrade/replace)
- Claude decides whether AI adapts to player's unlocked abilities, balancing power vs challenge
- Abilities persist across sessions in localStorage

### Progression pacing
- Claude decides the overall pacing model: whether projectiles/hazards are phase-gated while abilities are milestone-unlocked, or another approach that best serves the player
- Claude decides discovery cadence based on typical session length and retention goals
- Goal: game stays exciting from the start while still having things to discover over time

### Claude's Discretion
- Specific projectile type designs and visual identities
- Hazard counterplay mechanics
- Ability-to-powerup relationship
- AI adaptation to unlocked abilities
- Exact unlock thresholds and progression curve
- Whether abilities are always-available or cooldown-based
- Persistence model details

</decisions>

<specifics>
## Specific Ideas

No specific requirements -- open to standard approaches. User wants the AI integration to feel natural (hybrid model for projectiles, AI-triggered hazards) and gave Claude wide latitude on implementation details. The key constraint: everything should reinforce the core value of "the AI feels genuinely intelligent."

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 05-new-mechanics*
*Context gathered: 2026-02-19*
