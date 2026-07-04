# Skill↔Talent Link — Plan 07: Backfill Refs (Prose Talents) + Coverage Ratchet

> Design source: `…-skill-talent-link-design.md` (mapping E). Depends on Plan 06 (validation spec).
> Adds `relatedSkillIds` to the prose (`special_rule`) talents by sweeping the 91 `tests` strings.

**Goal:** Give every prose talent that clearly relates to a skill a `relatedSkillIds` cross-link, so the
UI (Plans 11–12) and validation cover the long tail. No mechanic changes — display/link only.

## Global Constraints
- `relatedSkillIds` is for cross-linking, not roll math — do not add `effects` here.
- Drive from the talent's `tests` string and the MD `Effect` column.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/data/rules/wfrp4e/talents.ts` | Add `relatedSkillIds` to prose talents |
| Modify | `tests/talent-skill-refs.spec.ts` | Add coverage ratchet |

## Task 1: Sweep the 91 `tests`-string talents
- [ ] For each talent with a `tests` string, map the named skill(s) to refs. Seeds from mapping E:
  `combat_aware`/`lip_reading`/`trapper`→`["perception"]`; `nose_for_trouble`/`sixth_sense`/
  `magical_sense`/`detect_artefact`/`holy_visions`→`["intuition"]`; `numismatics`→`["evaluate"]`;
  `shadow`→`["perception","stealth"]`; `rover`→`["stealth_rural"]`; `tunnel_rat`→`["stealth_underground"]`;
  `scale_sheer_surface`→`["climb"]`; `catfall`→`["athletics"]`; `strong_swimmer`→`["swim"]`;
  `savant_*`→`["lore"]`; `iron_jaw`→`["endurance"]`; `linguistics`→`["language"]`; `surgery`→`["heal"]`;
  `tinker`→`["trade"]`. Continue through the full list against the MD table.
- [ ] Leave truly skill-less talents (e.g. `doomed`, `luck`, `read_write`) with no ref.

## Task 2: Coverage ratchet
**Files:** `tests/talent-skill-refs.spec.ts`
- [ ] Add an allow-list of intentionally ref-less talents and assert every *other* talent with a `tests`
  string has ≥1 `relatedSkillIds`/effect ref — so new talents can't silently skip the link:
```ts
test("talents naming a skill test carry a structured ref", () => {
  const REFLESS_OK = new Set(["doomed", "luck", "read_write", /* … */]);
  const missing = talentDefinitions.filter((t) =>
    t.tests && !REFLESS_OK.has(t.id) &&
    !(t.relatedSkillIds?.length || t.effects?.some((e) => "skillIds" in e && e.skillIds?.length)));
  expect(missing.map((t) => t.id)).toEqual([]);
});
```

## Task 3: Verify
- [ ] `npm run lint && npm run build && npm test` green.

## Definition of done
- Prose talents cross-linked; coverage ratchet prevents future drift.
