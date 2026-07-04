---
name: talent-effects
description: Use before adding or changing any talent effect, talent→skill link, or effect type in src/data/rules/wfrp4e/talents.ts and src/lib/talentEffects.ts. Ensures every talent's rules are modelled and applied through the one effect registry, with consistent refs and tests. Use when backfilling talent batches or wiring a new effect kind.
---

# Talent effects & skill/characteristic links

Invoke this before touching talent effects, talent→skill references, or the resolver. Talent rules must
be **modelled as data** and **applied through one registry** — never re-implemented per call site.

Design source of truth: `docs/superpowers/specs/2026-07-04-skill-talent-link-design.md`.

---

## The one rule: register, don't scatter

All talent-effect logic lives behind a single resolver in `src/lib/talentEffects.ts`. Each effect
`type` has exactly one handler in the registry. Consumers (dice roller, derived stats, career/XP, UI)
call the resolver — they never branch on effect `type` themselves.

Adding a new effect kind = add one handler + its tests. If you find yourself writing
`if (effect.type === ...)` outside the registry, stop — put it in a handler.

---

## Reference conventions

| Ref | Type | Rule |
|---|---|---|
| Skill | `SkillRef` (`src/lib/skillRefs.ts`) | Base id (`endurance`) matches **any** specialisation; a spec ref (`stealth_urban`) matches only itself. Never free-text. |
| Characteristic | `CharacteristicKey` (`WS…Fel`) | Use the canonical union. Legacy `attribute` names go through `toCharacteristicKey`. `movement` is a derived stat, not a characteristic. |
| Display | `test` string | Keep for UI only. It is **not** used for matching once refs exist. |

Where refs live (from decision D-b):
- Roll-math effects (`test_sl_bonus`, `test_reverse_failed_roll`) → `effect.skillIds` / `effect.characteristics`.
- Cross-linking (any talent, incl. prose) → `TalentDefinition.relatedSkillIds`.
- Career/XP grants → `TalentDefinition.grantsSkillIds`.

---

## Effect type taxonomy

Model with a typed effect where the mechanic is clear; otherwise `special_rule` (prose) + a
`relatedSkillIds` cross-link. Do **not** invent a rules engine for prose talents.

| type | Applies at | Handler contributes |
|---|---|---|
| `test_sl_bonus` | roll | +SL to matching skill/characteristic tests |
| `test_reverse_failed_roll` | roll | may reverse a failed matching roll |
| `attribute_bonus` | derived / starting | +N to a characteristic (often `starting_characteristic_only`) |
| `damage_bonus` | roll (attack) | +N damage under condition |
| `encumbrance_bonus` | derived | +N carry capacity |
| `ignore_penalty` | roll | ignore a named penalty |
| `action_unlock` | action | unlock an action |
| `special_rule` | display | prose only; pair with `relatedSkillIds` |

New type checklist: add to `TalentEffect` union (`src/types/rules.ts`), add a registry handler
(match + contribute + format), add unit tests, update this table.

---

## Batch process (backfill is done by effect type)

Work one effect `type` per batch (decision: batch axis = by effect type). For each batch:

1. Pull the batch's talents from the spec's mapping tables (A/B/D/E) and the MD table
   `src/data/books/core-rulebook/skills-and-talents.md` (authoritative — auto-apply on disagreement).
2. Author refs on each talent using the conventions above.
3. Ensure the registry handler for that type exists and is exercised.
4. Tests must stay green: `tests/talent-skill-refs.spec.ts` (every ref resolves),
   `tests/talent-effects.spec.ts` (handler matches the right context, and is **absent** on unrelated
   rolls — the false-positive guard), plus `talents-data`/`talent-references`.
5. Small commit per batch.

---

## Matching rules (consistency guarantees)

- **Id-first.** If an effect has `skillIds`/`characteristics`, match structurally (via
  `skillRefMatches` / key equality). Only fall back to the `test` string when an effect has no refs
  (removed entirely in the final cleanup plan).
- **No token collisions.** Every new roll-math batch must add a test proving the bonus does **not**
  apply to an unrelated roll that shares a word (this is the original bug).
- **Base matches any spec; spec matches one.** Confirm you picked the right granularity per talent.

---

## Definition of done for any talent-effect change

- [ ] Rules modelled as data; no `effect.type` branching outside the registry.
- [ ] Refs use `SkillRef`/`CharacteristicKey`; validation spec green.
- [ ] Handler covered by a hit test **and** an absent/no-false-positive test.
- [ ] MD table reconciled where it disagreed; `talents-data` green.
- [ ] `npm run lint && npm run build && npm test` green.
