# Robust Skill ↔ Talent Link — Design Spec

> Companion to the plans in `docs/superpowers/plans/2026-07-04-skill-talent-*`. This spec is the
> single source of design truth; the plans are the task-by-task execution of it.

## Problem

The connection between talents and the skills/tests they modify is free-text substring matching, and
for most talents it does not exist at all:

- `TalentDefinition.tests` and the `test` field on `test_sl_bonus`/`test_reverse_failed_roll` effects
  are display strings only — nothing links them to a `SkillDefinition.id`.
- `src/lib/talentEffects.ts:testMatches()` does a **two-way `includes()`** compare between the effect
  string and the roll's `testName`, with an ad-hoc `"corruption"` branch → false positives (token
  collisions) and false negatives (phrasing drift).
- At roll time, `useDiceRoller.ts:275` forwards only the **characteristic label** as `testName`; skill
  rolls pass the skill's *display name* but drop its **id + specialisation** (`SkillsTab.tsx:107`).
- Of **176** talents: `special_rule` (prose) **123**, `attribute_bonus` 8, `test_sl_bonus` 5,
  `ignore_penalty`/`encumbrance_bonus`/`damage_bonus` 1 each. **91** carry a free-text `tests` string.
  → the mechanical link is mostly missing, not just fragile.

## Goal

Replace the free-text coupling with a structured, id-based link that (1) is validated at build time,
(2) resolves deterministically at roll time, (3) reconciles the talent dataset against the canonical
`skills-and-talents.md` table, and (4) surfaces the relationship bidirectionally in the UI. Delivered
as many small, independently-testable pieces.

## Resolved decisions (2026-07-04)

| # | Decision | Choice |
|---|---|---|
| D-a | Grouped-skill ref granularity | **Both; base matches any spec.** `endurance` matches any Endurance test; `stealth_urban` matches only that specialisation. Reuse the `<baseId>_<spec>` convention already used by `talent-references.spec.ts`. |
| D-b | Where refs live | **Both.** Test-scoped `TalentEffect` variants get `skillIds?`/`characteristics?` (roll math); `TalentDefinition` gets `relatedSkillIds?` (cross-linking, prose talents included) and `grantsSkillIds?` (career/XP). |
| D-c | Reverse (skill→talents) index | **Derive at runtime** from talent refs. One source of truth. |
| D-d | Migration posture | **Keep the string, add refs, id-match first with string fallback.** Drop the fallback once coverage is complete. |
| D-e | Characteristic codes | **Adopt the existing `CharacteristicKey`** (`"WS"\|"BS"\|"S"\|"T"\|"I"\|"Ag"\|"Dex"\|"Int"\|"WP"\|"Fel"`, `creatureTraits.ts:1`). Add a `legacyAttributeName → CharacteristicKey` map for the current `attribute_bonus` values (`weaponSkill`→`WS`, …); `movement` stays a non-characteristic derived-stat ref. |
| Depth | Mechanic modelling | **Reference + typed-where-clear.** Add refs everywhere; add a typed effect only where one clearly exists. No full rules engine for the 123 prose talents. |
| Data | Reconciliation | **Auto-apply `skills-and-talents.md` as source of truth** where `talents.ts` disagrees (Max, mechanic, skill refs). |
| Grants | Skill-granting talents | **Wire into career/XP** — grant talents add the skill to the character and apply the XP discount. |
| Priority | Build order | **Data integrity / validation first** (types + validation + reconciliation), then roll-time, then career/XP + UI. |
| ~~D-f~~ | ~~Keep bare ids~~ | **Superseded by D-g.** |
| D-g | ID scheme (2026-07-04, final) | **Prefix all catalog ids for global uniqueness** — `skill_*` / `talent_*` / `trait_*`; characteristics stay bare (`WS…Fel`). Done as **Plan 00** before any other code, with a load-time old→new migration map so saved characters (progress keyed by id in `storage.ts`) don't break. Chosen because nothing is built yet (cheapest moment) and it kills the 9 cross-catalog collisions permanently → one generic parser, self-documenting refs, future mixed lists possible. `SkillRef`/`TalentRef`/`TraitRef` types still document intent; the field a ref lives in still signals kind. |

## Data model (additive, all optional — no breaking change, no data migration)

Refs live on rule *definitions*, never on stored `ResolvedCharacterTalent` instances or persisted
character JSON — so there is no persistence-format change.

```ts
// src/types/rules.ts
export type CharacteristicKey =            // re-export the existing union from creatureTraits.ts
  "WS" | "BS" | "S" | "T" | "I" | "Ag" | "Dex" | "Int" | "WP" | "Fel";

// Ref types are documented aliases (D-g: prefixed, globally-unique ids). Kind is also signalled by the
// field a ref lives in; data literals stay plain strings.
export type SkillRef = string;             // "skill_endurance" (base, matches any spec) | "skill_stealth_urban"
export type TalentRef = string;            // "talent_hatred" | "talent_etiquette_nobles"
export type TraitRef = string;             // "trait_weapon" | "trait_ranged" | "trait_chill_grasp"

// added to the test_sl_bonus and test_reverse_failed_roll variants of TalentEffect:
//   skillIds?: SkillRef[];
//   characteristics?: CharacteristicKey[];

export interface TalentDefinition extends RulesTextDefinition {
  // ...existing...
  relatedSkillIds?: SkillRef[];            // cross-linking + validation (prose talents too)
  grantsSkillIds?: SkillRef[];             // career/XP wiring (grant/discount talents)
}
```

## Helpers (Plan 01)

```ts
// src/lib/skillRefs.ts
import { skillDefinitions, skillSpecialisationDefinitions } from "../data/rules/wfrp4e";

// "Lore (Engineering)" style spec ref -> base "lore", spec "engineering"
export function parseSkillRef(ref: SkillRef): { baseId: string; specialisationId?: string };

// A base-id ref matches any specialisation; a spec ref matches only itself.
export function skillRefMatches(
  ref: SkillRef,
  target: { skillId: string; specialisationId?: string },
): boolean;

// resolve for validation: does this ref name a real skill / specialisation?
export function isResolvableSkillRef(ref: SkillRef): boolean;
```

```ts
// src/lib/characteristicKeys.ts
const LEGACY_ATTRIBUTE_TO_KEY: Record<string, CharacteristicKey> = {
  weaponSkill: "WS", ballisticSkill: "BS", strength: "S", toughness: "T",
  initiative: "I", agility: "Ag", dexterity: "Dex", intelligence: "Int",
  willpower: "WP", fellowship: "Fel",
  // "movement" intentionally absent — it is a derived stat, not a characteristic.
};
export function toCharacteristicKey(name: string): CharacteristicKey | undefined;
```

## Canonical skill ids (from `skills-and-talents.md`)

Base ids are snake_case of the skill name. Grouped families and their specialisation refs:

```
art, animal_training, entertain, language, lore, melee, channelling, perform, play, pray,
ranged, ride, sail, secret_signs, stealth, trade
```
Spec ref form `<base>_<spec>` (spec lowercased, spaces→`_`): e.g. `stealth_urban`, `lore_engineering`,
`trade_apothecary`, `entertain_singing`, `language_magick`, `melee_brawling`, `ranged_blackpowder`,
`lore_local`. (Specialisation lists live in `GROUPED_SPECIALISATIONS`, `skills.ts:287`.)

## Extracted talent → skill/characteristic mapping (from `skills-and-talents.md`)

The token-saver: authored refs for the backfill, grouped by effect kind. `id` = talent id in
`talents.ts`. This is the working draft the backfill plans consume; verify each against the row.

> **Prefix note (D-g):** ids in the tables below are shown *without* the prefix for brevity. After
> Plan 00, read them prefixed: `intimidate`→`skill_intimidate`, `stealth_urban`→`skill_stealth_urban`,
> talent ids `talent_*`, trait ids `trait_*`. Characteristic keys (`WS…Fel`) are unprefixed.

### A. `test_sl_bonus` — +SL to specific tests → `effect.skillIds` / `effect.characteristics`
| id | Max | ref | condition / note |
|---|---|---|---|
| menacing | Str Bonus | `skillIds: [intimidate]` | +SL per level to Intimidate |
| master_orator | Fel Bonus | `skillIds: [charm]` | while Public Speaking |
| strong_legs | Str Bonus | `skillIds: [athletics]` | Leaping only |
| strong_back | Str Bonus | `characteristics: [S]` | Opposed Strength; + `encumbrance_bonus` |
| resistance (base) | T Bonus | `skillIds: [endurance]` | **dedupe:** both bare `resistance` (:1002) and `resistance_corruption` (:83) exist — keep grouped base `resistance` + `resistance_<threat>` specs, drop the redundant one (char Plan 03/04); auto-pass first test/session |
| rapid_reload | Dex Bonus | `relatedSkillIds: [ranged]` | reload Extended Test (not a skill SL) |
| gunner | Dex Bonus | `relatedSkillIds: [ranged_blackpowder]` | reload Extended Test — **reconcile: current data has BS Bonus + ranged-attack effect (wrong)** |
| war_leader | Fel Bonus | `characteristics: [WP]` | subordinates add level to one WP Test/round |

### B. `test_reverse_failed_roll` — reverse a failed roll → `effect.skillIds`
| id | Max | ref |
|---|---|---|
| alley_cat | Init Bonus | `skillIds: [stealth_urban]` |
| bookish | Int Bonus | `skillIds: [research]` |
| carouser | T Bonus | `skillIds: [consume_alcohol]` |
| field_dressing | Int Bonus | `skillIds: [heal]` (cap +1 SL) |
| gregarious | Fel Bonus | `skillIds: [gossip]` |
| pharmacist | Int Bonus | `skillIds: [trade_apothecary]` |
| pilot | Init Bonus | `skillIds: [row, sail]` |

### C. Skill grant / discount → `TalentDefinition.grantsSkillIds` (career/XP wiring)
| id | Max | grants | note |
|---|---|---|---|
| perfect_pitch | Init Bonus | `entertain_singing` | add to Career or −5 XP/Advance |
| seasoned_traveller | Int Bonus | `lore_local` | add or discount, per Speciality |
| witch | WP Bonus | `language_magick` | add or discount |
| craftsman | Dex Bonus | `trade` (chosen spec) | id is `craftsman` (verified), not `craftsman_trade`; add a Trade to Career, or −5 XP |
| artistic | Dex Bonus | `art` (verify vs "Trade (Artist)") | **flag:** MD says "Trade (Artist)"; Art is its own skill — confirm target |
| master_tradesman | Dex Bonus | — (`relatedSkillIds: [trade]`) | id is `master_tradesman` (verified); reduces Extended Trade SL; no grant |

### D. `attribute_bonus` — permanent +5 starting characteristic → `effect.characteristics`
| id | key | | id | key |
|---|---|---|---|---|
| warrior_born | WS | | savvy | Int |
| marksman | BS | | coolheaded | WP |
| very_strong | S | | suave | Fel |
| very_resilient | T | | sharp | I |
| lightning_reflexes | Ag | | nimble_fingered | Dex |

### E. Prose talents with a clear related skill → `TalentDefinition.relatedSkillIds`
Representative (the full set comes from the 91-`tests`-string sweep in Plan 06):
`combat_aware`→[perception], `lip_reading`→[perception], `trapper`→[perception],
`nose_for_trouble`→[intuition], `sixth_sense`→[intuition], `numismatics`→[evaluate],
`shadow`→[perception, stealth], `rover`→[stealth_rural], `tunnel_rat`→[stealth_underground],
`scale_sheer_surface`→[climb], `catfall`→[athletics], `strong_swimmer`→[swim],
`savant_*`→[lore], `iron_jaw`→[endurance], `linguistics`→[language], `surgery`→[heal],
`magical_sense`/`detect_artefact`/`holy_visions`→[intuition], `tinker`→[trade].

## Consistency architecture (decided 2026-07-04)

Talent rules are applied the same way everywhere via **two mechanisms**:

- **Effect registry / single resolver (runtime consistency)** — Plan 02b. `talentEffects.ts` becomes one
  typed registry: each effect `type` has exactly one handler (`matches` / `contribute` / `format`), and
  every consumer (dice roller, derived stats, career/XP, UI) funnels through `resolveTalentEffects(context)`.
  No consumer branches on effect `type`. Adding effect type N+1 = one handler + its tests. This absorbs
  the former standalone matcher rewrite (old Plan 08).
- **Authoring skill (build-time consistency)** — `.claude/skills/talent-effects/SKILL.md`. Encodes the
  taxonomy, ref conventions, "register don't scatter", the batch-by-effect-type process, and required
  tests. Every batch and every new effect type follows it.

**Backfill is batched by effect type** (Plan 06): one effect `type` per batch, each exercising one
handler end-to-end, each an independent commit guarded by the validation + no-false-positive tests.

## Roll-time resolution (Plan 09)

- `TalentEffectContext` gains `skillId?`, `specialisationId?`, `characteristic?: CharacteristicKey`.
- `getApplicableTalentEffects`/`testMatches`: match by **id first** (skill ref via `skillRefMatches`,
  characteristic exact); fall back to the string compare **only** when an effect has no structured refs.
- Thread identity through the roll pipeline. `handleRoll` (`useDiceRoller.ts:250`) first arg is
  `{ key, label }` + optional `damage`, `options` — add id fields **additively**:
  `{ key, label, skillId?, specialisationId? }`. Populate at `SkillsTab.tsx:107` and the weapon/skill
  `ActionsTab.tsx` call sites (215/384/466/559). Pure-characteristic (`AppComposition.tsx:2296`
  corruption) and spell (`SpellsTab.tsx:132`) rolls keep `key` only → matcher uses `characteristic`.

## Data reconciliation (auto-apply MD as truth) — Plans 03–05

`skills-and-talents.md` is authoritative. Where `talents.ts` disagrees, change `talents.ts`. The
discrepancy inventory is already enumerated in `TODO.md` under **R6–R8** and the "wrong MAX / wrong
MECHANIC / extra-unverified" lists at the file bottom. Apply in small batches (Max values; non-Core
removals; mechanic fixes such as Gunner and Magic Resistance), each guarded by `talents-data.spec.ts`.

## Plan index (small, sequenced, each independently testable)

Data integrity first (priority), then behaviour, then UI.

| Plan | Piece | Test that proves it |
|---|---|---|
| **00** | **Globally-unique prefixed ids** (`skill_*`/`talent_*`/`trait_*`) + saved-data migration map | `id-uniqueness.spec.ts` (catalogs disjoint); existing suites green; old-id fixture migrates |
| 01 | `skillRefs.ts` + `characteristicKeys.ts` pure helpers | unit spec: parse/match/resolve + legacy-attr map cases |
| 02 | Additive ref fields on types (no data) | `npm run build` typechecks; no runtime change |
| **02b** | **Effect registry / single resolver** (the component; id-first matching) | `talent-effects.spec.ts`: handler hit + no-false-positive; consumers carry no type logic |
| — | **Authoring skill** `.claude/skills/talent-effects` (done) | governs every batch below |
| 03 | Reconcile talent **Max** values vs MD | `talents-data.spec.ts` asserts corrected Max set |
| 04 | Remove/rename non-Core talents (R7/R8 list) | `talent-references.spec.ts` still resolves all refs |
| 05 | Reconcile wrong **mechanics** (Gunner, Magic Resistance) | `talents-data.spec.ts` asserts effect shape |
| 06 | Backfill refs **in batches by effect type** (A/B/D: sl_bonus → reverse → attribute → damage/enc) | `talent-skill-refs.spec.ts` + per-batch hit/absent tests |
| 07 | Backfill refs: group E + `tests`-string sweep (relatedSkillIds) | coverage ratchet in the refs spec |
| 08 | *(superseded — matcher folded into 02b; placeholder to keep numbering)* | — |
| 09 | Thread `skillId`/`specialisationId` through `handleRoll` → resolver context | dice spec: SL bonus on the right skill, absent on an unrelated roll |
| 10 | Group-C grant/discount → career skill list + XP discount | advancement spec: granted skill available; advance costs −5 XP |
| 11 | UI: TalentsTab/TalentSidebar show related skills | component/e2e: links render and navigate |
| 12 | UI: SkillsTab/SkillSidebar show "talents affecting this skill" (derived index) | component/e2e: derived list correct |
| 13 | Drop the string fallback in the resolver (D-d cleanup) | resolver spec passes without fallback |

## Non-goals

- A rules engine that executes all 123 prose talents.
- Any persistence-format / stored-character migration (refs are on definitions only).
- Skills beyond WFRP4e Core + the already-present dataset (supplement talents stay pending).
