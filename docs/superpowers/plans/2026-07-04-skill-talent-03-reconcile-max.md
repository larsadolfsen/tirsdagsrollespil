# Skill↔Talent Link — Plan 03: Reconcile Talent `max` vs MD

> Design source: `…-skill-talent-link-design.md`. **Data-integrity priority.** Auto-apply
> `skills-and-talents.md` as source of truth. Depends only on the dataset (independent of Plans 01–02).

**Goal:** Correct every talent `max` in `talents.ts` that disagrees with the `Max` column of
`skills-and-talents.md`. The discrepancy list is already enumerated in `TODO.md` (R6 + the
"wrong MAX" list at the file bottom).

## Global Constraints
- MD table is authoritative. No mechanic changes here (that is Plan 05) — `max` only.
- No runtime-data files (`data/`) touched.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/data/rules/wfrp4e/talents.ts` | Fix `max` values |
| Modify | `tests/talents-data.spec.ts` | Assert the corrected `max` set |

## Task 1: Apply `max` corrections
**Files:** `src/data/rules/wfrp4e/talents.ts`
- [ ] Work the "wrong MAX" list from `TODO.md` (e.g. `sixth_sense` 1→Initiative Bonus, `speedreader`
  5→Intelligence Bonus, `sprinter` 5→Strength Bonus, `step_aside` 5→Agility Bonus,
  `strike_mighty_blow` 1→Strength Bonus, `wealthy` 5→None, `combat_reflexes`→Initiative Bonus,
  `commanding_presence`/`luck`/`public_speaker`→Fellowship Bonus, `hatred`→Willpower Bonus, …).
  Cross-check each against the MD row before changing.
- [ ] For any talent not in the R6 list, spot-check its `max` against the MD table and fix if wrong.

## Task 2: Lock it with a test
**Files:** `tests/talents-data.spec.ts`
- [ ] Add a check that a representative corrected set has the expected `max` string, so regressions fail:
```ts
const expectedMax: Record<string, string> = {
  sixth_sense: "Initiative Bonus", strike_mighty_blow: "Strength Bonus", wealthy: "None", /* … */
};
for (const [id, max] of Object.entries(expectedMax)) {
  expect(talentDefinitions.find((t) => t.id === id)?.max, id).toBe(max);
}
```

## Task 3: Verify
- [ ] `npm run lint && npm run build && npm test` green.

## Definition of done
- Every `max` matches the MD table; a regression test guards the corrected values.
