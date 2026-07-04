# Adversary Link — Plan A06: Trait Effects → Registry Handlers

> Design source: `…-adversary-skill-trait-link-design.md`. Governs: `.claude/skills/talent-effects`.
> Depends on character Plan 02b (registry) + A01. Batched by effect kind, like character Plan 06.

**Goal:** Traits that grant skill/characteristic bonuses (or conditional target bonuses) apply through
the **same** effect registry as talents — so a bonus is computed identically whether it comes from a
talent or a trait.

## Global Constraints
- Reuse the registry + resolver; do not add a parallel trait-effect path.
- Conditional specialisation (Hatred (Orcs), Weapon (Sword)) → `conditionTags` per the skill's rule.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/lib/talentEffects.ts` (or a shared `effectRegistry`) | Accept trait-sourced effects |
| Modify | `src/data/rules/wfrp4e/creatureTraits.ts` | Ensure trait `skillTestBonus`/characteristic modifiers carry `SkillRef`/`CharacteristicKey` |
| Modify | `tests/talent-effects.spec.ts` | Trait effect cases (hit + conditional absent) |

## Task 1: Unify the effect input
- [ ] Let the resolver accept effects from both talents and trait modifiers (map
  `CreatureTraitModifier` of type `skillTestBonus`/`characteristic` into the registry's effect shape).

## Task 2: Conditional application
- [ ] A specialised/target effect contributes only when `conditionTags` include its target
  (e.g. `target:orcs`, `using:sword`).

## Task 3: Tests
- [ ] Hatred (Orcs) adds damage vs Orcs and **not** vs Elves; a trait skillTestBonus applies on the
  matching skill only.

## Task 4: Verify
- [ ] `npm run lint && npm run build && npm test` green.

## Definition of done
- Trait and talent bonuses flow through one registry; conditional targets respected; tested.
