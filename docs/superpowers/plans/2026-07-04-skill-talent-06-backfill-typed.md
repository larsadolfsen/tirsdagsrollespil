# Skill↔Talent Link — Plan 06: Backfill in Batches (by Effect Type)

> Design source: `…-skill-talent-link-design.md` (mapping A/B/D). Governs: `.claude/skills/talent-effects`.
> Depends on Plans 01, 02, 02b (registry). **Batch axis = effect type** — one type per batch, each an
> independent commit guarded by the validation + no-false-positive tests.

**Goal:** Author structured refs on the talents that carry typed effects, one effect type at a time,
each batch exercising exactly one registry handler end-to-end.

## Global Constraints
- Follow `.claude/skills/talent-effects` for every batch (refs, tests, register-don't-scatter).
- Keep display `test` strings; add refs alongside. MD table is authoritative.
- Each batch: green `tests/talent-skill-refs.spec.ts` + a handler hit test + an absent test.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/data/rules/wfrp4e/talents.ts` | Add refs per batch |
| Create | `tests/talent-skill-refs.spec.ts` | Every ref resolves (created in Batch 1) |
| Modify | `tests/talent-effects.spec.ts` | Per-batch hit + absent tests |

---

## Batch 1 — `test_sl_bonus` (mapping A)
- [ ] `menacing`→`skillIds:["intimidate"]`; `master_orator`→`["charm"]` (Public Speaking);
  `strong_legs`→`["athletics"]` (Leaping); `strong_back`→`characteristics:["S"]` (+encumbrance);
  resistance(threat)→`["endurance"]`; `war_leader`→`characteristics:["WP"]`.
- [ ] Create `tests/talent-skill-refs.spec.ts` (every ref resolves — see spec Plan 06 snippet).
- [ ] Handler tests: Menacing applies on `{skillId:"intimidate"}`, absent on `{skillId:"charm"}`.

## Batch 2 — `test_reverse_failed_roll` (mapping B)
- [ ] Add `test_reverse_failed_roll` effects (where currently `special_rule`) with:
  `alley_cat`→`["stealth_urban"]`; `bookish`→`["research"]`; `carouser`→`["consume_alcohol"]`;
  `field_dressing`→`["heal"]`; `gregarious`→`["gossip"]`; `pharmacist`→`["trade_apothecary"]`;
  `pilot`→`["row","sail"]`.
- [ ] Handler tests: Alley Cat matches Stealth (Urban), absent on Stealth (Rural).

## Batch 3 — `attribute_bonus` → `characteristics` (mapping D)
- [ ] `warrior_born`→`["WS"]`, `marksman`→`["BS"]`, `very_strong`→`["S"]`, `very_resilient`→`["T"]`,
  `lightning_reflexes`→`["Ag"]`, `nimble_fingered`→`["Dex"]`, `savvy`→`["Int"]`, `coolheaded`→`["WP"]`,
  `suave`→`["Fel"]`, `sharp`→`["I"]`. Migrate legacy `attribute` names via `toCharacteristicKey`.
- [ ] Handler test: Warrior Born contributes +5 to WS as `starting_characteristic_only`.

## Batch 4 — `damage_bonus` / `encumbrance_bonus` / `ignore_penalty`
- [ ] Add refs/conditions where a skill or characteristic is implicated (e.g. `strong_back` encumbrance;
  `strike_mighty_blow`/`dirty_fighting`/`berserk_charge` damage → melee context tags).
- [ ] Handler tests for each contribution + condition.

## Verify (each batch)
- [ ] `npm run lint && npm run build && npm test` green before committing the batch.

## Definition of done
- Every typed-effect talent carries structured refs; each effect type has hit + absent tests; the
  validation spec guards all future refs.
