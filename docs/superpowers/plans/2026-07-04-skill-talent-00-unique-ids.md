# Skill↔Talent Link — Plan 00: Globally-Unique Catalog IDs

> Design source: `docs/superpowers/specs/2026-07-04-skill-talent-link-design.md` (supersedes D-f).
> **Runs before every other plan.** Prefix all skill/talent/trait ids so they are globally unique, and
> protect saved characters with a load-time migration map. All downstream plans author against the new ids.

**Goal:** Rename catalog ids to `skill_*` / `talent_* ` / `trait_*` (characteristics stay bare `WS…Fel`),
eliminating the 9 cross-catalog collisions permanently, with zero breakage to saved character progress.

## Scheme
- Skills: `skill_<snake>` — `dodge`→`skill_dodge`; spec ids follow automatically via
  `${skillId}_${toSnakeCase(name)}` → `skill_stealth_urban`.
- Talents: `talent_<snake>` — `hatred`→`talent_hatred`, `etiquette_nobles`→`talent_etiquette_nobles`.
- Traits: `trait_<snake>` — **normalise kebab→snake** — `chill-grasp`→`trait_chill_grasp`, `weapon`→`trait_weapon`.
- Characteristics: **unchanged** (`WS`…`Fel`) — already a distinct, collision-free namespace; renaming
  would churn `characteristicAdvances` for no benefit.

## Global Constraints
- Catalog-aware codemod — **prefix by context**, never a blind global replace (the 9 collisions +
  substring hazards). Within a `skillIds:[…]`/`skills` context → `skill_`; `talentIds:[…]` → `talent_`;
  trait instance arrays / `CreatureTraitId` → `trait_`.
- **NPC/generic `skills`/`talents` entries are display strings (`"Dodge 54"`), NOT ids — do not touch.**
- Every existing spec (`talent-references`, `career-steps`, `skills-data`, `talents-data`,
  `creature-traits`, `character-data`) must stay green.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/data/rules/wfrp4e/skills.ts` | Prefix base skill ids (SKILL_COPY keys, base list, `skillCharacteristicById`, `GROUPED_SPECIALISATIONS` keys) |
| Modify | `src/data/rules/wfrp4e/talents.ts` | Prefix all talent ids |
| Modify | `src/data/rules/wfrp4e/creatureTraits.ts` | Prefix + snake-normalise trait ids; `CreatureTraitId` follows |
| Modify | `src/data/rules/wfrp4e/careers/careerSteps.ts` | Re-point ~4,227 `skillIds`/`talentIds` entries |
| Modify | `src/data/characters/*`, `src/data/rules/wfrp4e/creatureCatalog/**` | Re-point `skillId`/`talentId`/trait-instance ids (72 char refs + creature trait instances) |
| Modify | `src/data/persistence.ts` | Load-time old→new migration map for stored `skills` keys + `talentIds` |
| Modify | `tests/*` | Update any hard-coded ids; add uniqueness guard |

## Task 1: Generate the old→new map (scripted)
- [ ] Script reads the three catalogs and emits `Record<oldId,newId>` per catalog (~303 entries). This
  map is the single source for the codemod **and** the runtime migration.

## Task 2: Rename catalog definitions
- [ ] Apply prefixes in `skills.ts`, `talents.ts`, `creatureTraits.ts`. Confirm spec-id generation and
  `CreatureTraitId` derive the prefixed forms automatically.

## Task 3: Re-point references (context-scoped codemod)
- [ ] `careerSteps.ts`: map entries inside `skillIds:[…]` via the skill map, `talentIds:[…]` via the
  talent map — **field-scoped**, so a colliding bare id gets the right prefix.
- [ ] Character files + creature catalog: re-point `skillId`/`talentId`/trait-instance ids.

## Task 4: Saved-data migration (the safety net)
- [ ] In `persistence.ts` load path, remap stored `CharacterProgress.skills` keys and `talentIds` through
  the old→new map (idempotent; leaves already-migrated/new ids untouched). Characteristics unaffected.
- [ ] Test: a fixture with old-id progress loads and resolves to the new ids.

## Task 5: Uniqueness guard
- [ ] New `tests/id-uniqueness.spec.ts`: the id sets of the three catalogs are pairwise disjoint
  (no cross-catalog collisions) and unique within each.

## Task 6: Verify
- [ ] `npm run lint && npm run build && npm test` fully green; drive the app (load a saved sheet, roll).

## Definition of done
- All catalog ids are prefixed + globally unique; every ref re-pointed; saved characters migrate on load;
  uniqueness enforced by a test. Downstream plans (01→13, A01→A08) author against the new ids.
