# Skill↔Talent Link — Plan 12: UI — Skill → Affecting Talents

> ✅ **DONE (2026-07-08, `71a8f0c`).** Task 1+3 done (`24a272d`): `src/lib/skillTalentIndex.ts` +
> `tests/skill-talent-index.spec.ts` green. Task 2: `SkillsTab` now shows an "Affecting Talents" row
> (all catalog talents, not filtered to owned talents — matches Plan 11's symmetric behavior), linking
> back to the Talents section via `selectMainTab`. Tested in `tests/skill-affecting-talents.spec.ts`.

> Design source: `…-skill-talent-link-design.md` (UI cross-linking, D-c derive reverse). Depends on 06–07.
> Shows, on a skill, which talents affect it — from a derived reverse index (no stored back-refs).

**Goal:** In `SkillsTab` / `SkillSidebar`, list "Talents affecting this skill" computed at runtime from
talent refs. Single source of truth; no duplicate data.

## Global Constraints
- Derive the index (skillId → talents) from `talentDefinitions`; memoise. Do not store back-refs (D-c).
- Base-id refs contribute to every specialisation of that skill (D-a).
- UI-component + token rules as in `.claude/skills/ui-components`.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Create | `src/lib/skillTalentIndex.ts` | Build `skillId → TalentDefinition[]` from refs |
| Modify | `src/tabs/SkillsTab.tsx` and/or `src/components/sidebar/SkillSidebar.tsx` | Render the list |
| Create | `tests/skill-talent-index.spec.ts` | Index correctness |

## Task 1: Reverse index
```ts
// src/lib/skillTalentIndex.ts
export function buildSkillTalentIndex(talents: TalentDefinition[]): Map<string, TalentDefinition[]>;
// keys are base skill ids; a talent with a spec ref lands under its base id too.
```

## Task 2: Render on the skill
- [x] Add an "Affecting talents" section to the skill detail; only show for talents the character owns
  (or all, per product choice — confirm). Link each talent back to its detail (pairs with Plan 11).

## Task 3: Test
- [ ] `skill-talent-index.spec.ts`: Menacing indexes under `intimidate`; Alley Cat under `stealth`;
  a base-id ref appears for every specialisation query.

## Task 4: Verify
- [x] `npm run lint && npm run build && npm test`; drive the app.

## Open question
- [x] Resolved: show ALL affecting talents from the catalog (not filtered to owned talents),
  mirroring Plan 11's catalog-wide talent → related skills behavior.

## Definition of done
- Skill detail shows affecting talents from the derived index; tested + verified.
