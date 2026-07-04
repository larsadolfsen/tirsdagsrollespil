# Skill↔Talent Link — Plan 04: Remove/Rename Non-Core Talents

> Design source: `…-skill-talent-link-design.md`. **Data-integrity priority.** Auto-apply MD as truth.
> Discrepancy list is in `TODO.md` (R7 + "extra / unverified in code").

**Goal:** Delete or rename talents that are not in the Core MD list, and repoint every reference so
`talent-references.spec.ts` still resolves.

## Global Constraints
- Removing an id requires repointing all references (career steps, characters, generics, NPCs).
- MD table is the canonical talent set.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/data/rules/wfrp4e/talents.ts` | Remove/rename non-Core entries |
| Modify | `src/data/rules/wfrp4e/careers/careerSteps.ts` | Repoint career refs |
| Modify | `src/data/characters/*`, `src/data/generic/index.ts`, `src/data/npcs/**` | Repoint refs |
| Modify | `tests/talent-references.spec.ts` | Drop stale `PENDING_FROM_OTHER_BOOKS`/exceptions as resolved |

## Task 1: Remove/rename per R7/R8
**Files:** `talents.ts`
- [ ] `shields_up` → remove (duplicate of `shieldsman`); `public_speaking` → remove (dupe of
  `public_speaker`); `tough` → remove (creature trait; use `hardy`/`robust`/`very_resilient`);
  `fanatical` → verify vs MD, remove if absent.
- [ ] Decide `armour`, `ranged`, `weapon`, `prejudice` meta-entries: these are equipment/creature/
  Psychology constructs, not Core player talents — confirm intent (they surface in generic/NPC data),
  keep them clearly separated or move out of `talentDefinitions`. **Flag for review if unsure.**

## Task 2: Repoint references
- [ ] Grep each removed/renamed id across `src/data/**` and update to the canonical id.
- [ ] Run `tests/talent-references.spec.ts` — must be green (every ref resolves).

## Task 3: Verify
- [ ] `npm run lint && npm run build && npm test` green.

## Definition of done
- No non-Core talent ids remain (or they are intentionally partitioned); all references resolve.
