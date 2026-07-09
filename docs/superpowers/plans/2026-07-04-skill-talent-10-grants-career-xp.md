# Skill↔Talent Link — Plan 10: Skill-Granting Talents → Career/XP

> Design source: `…-skill-talent-link-design.md` (mapping C). Depends on Plans 01–02, 06.
> Wires `grantsSkillIds` talents into the character's available skills and the XP advance-cost math.

**Goal:** Talents that "add a skill to your Career / discount its Advances" (Perfect Pitch, Craftsman,
Seasoned Traveller, Witch!, …) actually function: the granted skill becomes available and its Advances
cost 5 XP less where the MD says so.

## Global Constraints
- Read `grantsSkillIds` from `TalentDefinition`; do not hard-code talent ids in the advancement logic.
- Reuse the existing advance-cost path (`useCareerAdvancement.ts`, `advanceCosts.ts`) — do not fork it.
- Verify against the app (`.claude/skills/verify`) — a granted skill shows up and costs less.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/hooks/useCareerAdvancement.ts` | Fold granted skills into career-skill set + discount |
| Modify | `src/data/characters/resolved.ts` (or skill-availability builder) | Include granted skills |
| Modify | `tests/advance-xp.spec.ts` (or new spec) | Assert grant + discount |

## Task 1: Collect grants from owned talents
- [ ] From the character's talents, gather `grantsSkillIds`; expand to concrete skills (spec-aware).

## Task 2: Availability + discount
- [ ] A granted skill is treated as a career skill for availability.
- [ ] Its Advance cost is reduced by 5 XP per Advance where the MD specifies a discount (Perfect Pitch,
  Craftsman, Seasoned Traveller, Witch!). Distinguish "adds to career" vs "−5 XP if already in career".

## Task 3: Test
- [ ] Spec: a character with Perfect Pitch has Entertain (Singing) available and its Advance costs 5 XP
  less than baseline.

## Task 4: Verify
- [ ] `npm run lint && npm run build && npm test`; then drive the app to confirm live.

## Open item (from spec)
- [ ] **artistic** grant target: MD says "Trade (Artist)" but Art is its own skill — confirm the ref
  before wiring (spec flag).

## Definition of done
- Grant/discount talents affect skill availability and XP cost; covered by a test + live verify.
