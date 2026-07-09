# Adversary Link — Plan A03: De-conflate `talents[]` → `traits[]`

> ✅ **IMPLEMENTED (2026-07-04).** `34b3b19` — trait strings moved to `traits[]` in `generic/index.ts` (9), `npcs/named/a-g.ts` (12), `h-z.ts` (14); `tests/adversary-references.spec.ts` green. Character Plan 04 unblocked (and since done). Skip.

> Design source: `…-adversary-skill-trait-link-design.md`. Depends on A01, A02.
> **Blocks character Plan 04** (which removes the meta-"talents" armour/weapon/ranged/tough/prejudice).
> Batched by data file so each move is small and verifiable.

**Goal:** Move every bestiary-trait entry currently mis-filed in `NpcTemplate.talents[]` into
`traits[]`, leaving `talents[]` holding only real skills-and-talents talents.

## Global Constraints
- Use `parseTraitEntry`/`parseTalentEntry` (A01) to classify each string; a string that resolves as a
  trait id moves to `traits[]`, one that resolves as a talent stays.
- No runtime-data files (`data/`). One data file (or small group) per batch/commit.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/data/generic/index.ts` | Move trait entries (Weapon/Armour/Ranged/Tough/Prejudice/…) |
| Modify | `src/data/npcs/named/a-g.ts`, `h-z.ts` | Same for named NPCs |

## Task 1: Classify + move (batch per file)
- [ ] For each template, split `talents[]` into talents-that-resolve-as-talents vs trait strings; put
  the trait strings in `traits[]`.
- [ ] Known trait bases to move: `weapon`, `armour`, `ranged`, `tough`, `prejudice`, plus any other
  string whose base resolves to `creatureTraitDefinitions`.
- [ ] **Collision review (the 5 legitimate-both ids):** `frenzy`, `hardy`, `hatred`, `magic_resistance`,
  `night_vision` exist in *both* catalogs — name alone can't classify them. Decide by entity kind
  (bestiary creature/beast → trait; human NPC → talent) and **flag each occurrence for confirmation**
  rather than auto-moving. The 4 meta-entries (`weapon`/`armour`/`ranged`/`prejudice`) are always traits.

## Task 2: Guard
- [ ] `adversary-references.spec.ts` (Plan A04) must resolve every remaining `talents[]` entry to the
  talent catalog and every `traits[]` entry to the trait catalog.

## Task 3: Verify
- [ ] `npm run lint && npm run build && npm test` green per batch.

## Definition of done
- No trait strings remain in any `talents[]`; traits live in `traits[]`; validation green. Character
  Plan 04 is now safe to run.
