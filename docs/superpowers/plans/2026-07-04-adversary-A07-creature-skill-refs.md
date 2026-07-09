# Adversary Link — Plan A07: Resolve Creature Trait `skill` Strings → `SkillRef`

> Design source: `…-adversary-skill-trait-link-design.md`. Depends on character Plan 01. Finishes the
> creature side (creatures already use structured trait instances; only the `skill` field is a raw string).

**Goal:** `CreatureTraitModifier.skill` (currently `string`) resolves to a `SkillRef`, so creature trait
skill bonuses match the same way as talents/NPC traits, and are validated.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/data/rules/wfrp4e/creatureTraits.ts` | Type `skill` as `SkillRef`; fix any non-resolving values |
| Create/Modify | `tests/adversary-references.spec.ts` | Assert every `modifier.skill` resolves |

## Task 1: Tighten the type + data
- [ ] Change `CreatureTraitModifier.skill?: string` → `SkillRef`; update values to real skill ids
  (base-or-spec) via `isResolvableSkillRef`.

## Task 2: Validate
- [ ] Extend the adversary refs spec: every `skillTestBonus` modifier's `skill` resolves.

## Task 3: Verify
- [ ] `npm run lint && npm run build && npm test` green.

## Definition of done
- Creature trait skill references are structured and validated.
