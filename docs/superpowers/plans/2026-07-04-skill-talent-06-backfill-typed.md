# Skill↔Talent Link — Plan 06: Backfill Refs (Typed Effects) + Validation

> Design source: `…-skill-talent-link-design.md` (see mapping tables A, B, D). Depends on Plans 01–02.
> Adds the structured refs to talents that already carry a typed effect, plus the CI validation test.

**Goal:** Author `skillIds`/`characteristics` on the `test_sl_bonus` and `test_reverse_failed_roll`
effects (mapping A + B) and `characteristics` on `attribute_bonus` effects (mapping D), and add a spec
that asserts every ref resolves.

## Global Constraints
- Keep the display `test` string; add refs alongside (migration posture D-d).
- Use `SkillRef`/`CharacteristicKey` from Plan 01–02; base-id matches any spec (D-a).

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/data/rules/wfrp4e/talents.ts` | Add refs per mapping A/B/D |
| Create | `tests/talent-skill-refs.spec.ts` | Every ref resolves; validation ratchet |

## Task 1: Group A (`test_sl_bonus`)
- [ ] `menacing`→`skillIds:["intimidate"]`; `master_orator`→`["charm"]`; `strong_legs`→`["athletics"]`;
  `strong_back`→`characteristics:["S"]`; resistance(threat)→`["endurance"]`; `war_leader`→`["WP"]`.

## Task 2: Group B (`test_reverse_failed_roll`)
- [ ] `alley_cat`→`["stealth_urban"]`; `bookish`→`["research"]`; `carouser`→`["consume_alcohol"]`;
  `field_dressing`→`["heal"]`; `gregarious`→`["gossip"]`; `pharmacist`→`["trade_apothecary"]`;
  `pilot`→`["row","sail"]`. (Add `test_reverse_failed_roll` effects where currently `special_rule`.)

## Task 3: Group D (`attribute_bonus` → `characteristics`)
- [ ] `warrior_born`→`["WS"]`, `marksman`→`["BS"]`, `very_strong`→`["S"]`, `very_resilient`→`["T"]`,
  `lightning_reflexes`→`["Ag"]`, `nimble_fingered`→`["Dex"]`, `savvy`→`["Int"]`, `coolheaded`→`["WP"]`,
  `suave`→`["Fel"]`, `sharp`→`["I"]`. (Migrate legacy `attribute` names via `toCharacteristicKey`.)

## Task 4: Validation spec
**Files:** `tests/talent-skill-refs.spec.ts`
```ts
import { expect, test } from "@playwright/test";
import { talentDefinitions } from "../src/data/rules/wfrp4e/talents";
import { isResolvableSkillRef } from "../src/lib/skillRefs";

test("every talent skill ref resolves", () => {
  const bad: string[] = [];
  for (const t of talentDefinitions) {
    const refs = [
      ...(t.relatedSkillIds ?? []), ...(t.grantsSkillIds ?? []),
      ...(t.effects ?? []).flatMap((e) => ("skillIds" in e ? e.skillIds ?? [] : [])),
    ];
    for (const r of refs) if (!isResolvableSkillRef(r)) bad.push(`${t.id}: ${r}`);
  }
  expect(bad, `Unresolved skill refs: ${bad.join("; ")}`).toEqual([]);
});
```

## Task 5: Verify
- [ ] `npm run lint && npm run build && npm test` green.

## Definition of done
- Mapping A/B/D refs authored; validation spec passes and now guards all future refs.
