# Skill↔Talent Link — Plan 05: Reconcile Wrong Mechanics vs MD

> 🔶 **PARTIAL (2026-07-07 verified).** Done: **Gunner** (max Dexterity Bonus, reload SL effect, `relatedSkillIds`), **Magic Resistance** (max 1, oppose-with-Willpower rule), **accurate_shot** prose (+SL to ranged damage). Remaining: accurate_shot typed `damage_bonus` effect; **nimble_fingered/savvy/very_resilient** still have invented `tests` + max 1 — remodel as flat +5 `attribute_bonus` (`starting_characteristic_only`), no Tests. Only do Task 1's remaining bullets + Task 2.

> Design source: `…-skill-talent-link-design.md`. **Data-integrity priority.** Auto-apply MD as truth.
> Discrepancy list in `TODO.md` (R8 + "wrong MECHANIC").

**Goal:** Fix talents whose modelled effect/description contradicts the MD `Effect` column (not just
`max`). These change `description` and/or `effects`.

## Global Constraints
- MD `Effect` text is authoritative for the mechanic.
- Keep `effects[]` typed where a clear type exists; otherwise a `special_rule` with corrected prose.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/data/rules/wfrp4e/talents.ts` | Correct mechanics |
| Modify | `tests/talents-data.spec.ts` | Assert corrected effect shapes |

## Task 1: Known mechanic fixes
**Files:** `talents.ts`
- [ ] **Gunner** — MD: *Dexterity Bonus; +SL per level to reload Extended Tests for blackpowder
  weapons.* Current data has `BS Bonus` + a ranged-attack effect. Set `max: "Dexterity Bonus"`,
  effect → reload (relatedSkillIds `[ranged_blackpowder]`, not a ranged-attack SL bonus).
- [ ] **Magic Resistance** — MD: *Max 1; oppose incoming spells with Willpower.* Current data has
  `Toughness Bonus` + per-level SL bonus. Set `max: "1"`, effect → oppose-with-Willpower special rule.
- [ ] **accurate_shot** — MD: *+1 Damage per level with ranged weapons* (BS Bonus). Current describes
  the Sniper range mechanic. Correct to `damage_bonus` for ranged.
- [ ] **nimble_fingered / savvy / very_resilient** — MD: flat +5 characteristic, no Tests. Remove the
  invented `tests`; model as `attribute_bonus` (Dex/Int/T) `starting_characteristic_only`.

## Task 2: Lock with tests
- [ ] Assert Gunner/Magic Resistance `max` + effect `type` in `tests/talents-data.spec.ts`.

## Task 3: Verify
- [ ] `npm run lint && npm run build && npm test` green.

## Definition of done
- Mechanic-level discrepancies resolved to match MD; regression tests guard them.
