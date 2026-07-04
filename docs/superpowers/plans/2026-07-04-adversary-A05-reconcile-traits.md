# Adversary Link — Plan A05: Reconcile Trait Catalog vs `bestiary.md`

> Design source: `…-adversary-skill-trait-link-design.md`. Auto-apply `bestiary.md` as source of truth
> (mirrors talents↔skills-and-talents.md). Batched by trait group.

**Goal:** Ensure `creatureTraitDefinitions` matches the bestiary chapter — correct wrong ratings/params,
add any trait an adversary references but the catalog lacks (surfaced by A04).

## Global Constraints
- `src/data/books/core-rulebook/bestiary.md` is authoritative.
- Keep the existing `CreatureTraitDefinition`/parameter shape; don't restructure.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/data/rules/wfrp4e/creatureTraits.ts` | Fix/add trait definitions |
| Modify | `tests/creature-traits.spec.ts` | Assert corrected/added traits |

## Task 1: Fill gaps from A04
- [ ] For each unresolved trait id from `adversary-references.spec.ts`, add or correct the definition
  against `bestiary.md` (e.g. confirm `weapon`, `ranged`, `armour`, `prejudice`, `tough` exist with the
  right parameters and specialisation semantics).

## Task 2: Spot-reconcile
- [ ] Compare a sample of existing trait definitions to their bestiary rows; fix discrepancies.

## Task 3: Verify
- [ ] `npm run lint && npm run build && npm test` green; A04 now fully resolves.

## Definition of done
- Trait catalog matches the bestiary; all adversary trait refs resolve.
