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
| Modify | `server.mjs` | **Server-side** one-time SQLite migration of `sheet_json` blobs + read/write id normalization |
| Modify | `src/data/persistence.ts` | Client-side read/write normalization shim (defensive; stale-tab safety) |
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

## Task 4: Live-server transition (the safety net)
Durable data lives in the **server** SQLite (`character_progress.sheet_json` on the Railway volume), not
the client — the ids are inside the JSON blob (`skills` keys, `talentIds`, trait ids). Reuse the
existing `app_metadata` flag + `ensureLegacyMigration` idioms.
- [ ] **One-time startup migration** in `server.mjs`, guarded by an `app_metadata` key
  (`catalog-ids-prefixed-v1`), wrapped in a **transaction**: for each row, parse `sheet_json`, remap
  `skills` keys / `talentIds` / trait ids via the old→new map, re-serialize, `UPDATE`; set the flag.
  Idempotent; skips already-migrated/new ids.
- [ ] **Read + write normalization** (server PUT/GET, mirrored in `persistence.ts`): coerce old ids →
  new on both directions so a **stale cached client tab** saving an old-id sheet after migration is safe.
- [ ] **Back up the SQLite file before migrating** — the migration is forward-only; code rollback after
  it runs requires restoring the backup. Document this in the deploy step.
- [ ] **Audit `dice_rolls.roll_json` + `gm_sessions.scenes_json`** for embedded skill/talent ids; remap if any.
- [ ] Tests: a fixture row with old-id `sheet_json` migrates on boot; a PUT of an old-id sheet is normalized.

## Task 5: Uniqueness guard
- [ ] New `tests/id-uniqueness.spec.ts`: the id sets of the three catalogs are pairwise disjoint
  (no cross-catalog collisions) and unique within each.

## Task 6: Verify
- [ ] `npm run lint && npm run build && npm test` fully green; drive the app (load a saved sheet, roll).

## Definition of done
- All catalog ids are prefixed + globally unique; every ref re-pointed; the live server migrates
  `sheet_json` once on boot (flag-guarded, transactional, backed up) and normalizes stray old ids on
  read/write; uniqueness enforced by a test. Downstream plans (01→13, A01→A08) author against the new ids.
