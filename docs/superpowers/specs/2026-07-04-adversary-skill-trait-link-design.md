# Robust Skill/Talent/Trait Link for Adversaries — Design Spec

> Sibling of `2026-07-04-skill-talent-link-design.md` (the character effort). Extends the same
> structured-link approach to the three adversary catalog types: **NPC** (named), **Generic**
> (unnamed stat block), and **Creature** (trait-based). Reuses the character-side helpers
> (`skillRefs`, `characteristicKeys`), the effect registry (Plan 02b), and the `.claude/skills/talent-effects` skill.

## The catalog rule (from the user, 2026-07-04)

- **Talents** come from the **skills-and-talents chapter** → the talent catalog (`talentDefinitions`).
- **Traits** come from the **bestiary chapter** → the trait catalog (`creatureTraitDefinitions`).
- They are **separate catalogs**. Any entity that uses talents uses *the* talent catalog; any entity
  that uses traits uses *the* trait catalog. Characters, NPCs, Generics, and Creatures all share these
  two catalogs (plus the one skill catalog). No per-entity duplicate catalogs.

## Problem / current state

- `NpcTemplate` (`src/data/npcTypes.ts`) has only `skills?: string[]` and `talents?: string[]` — **no
  `traits` field**. Skills/talents/traits are stored as **free-text strings**, resolving to nothing:
  - skills: `"Dodge 54"`, `"Melee (Basic) 61"` (name + target number)
  - talents: `"Strike to Stun"`
  - **traits mis-filed as talents**: `"Weapon (Sword) +8"`, `"Armour (Leathers) 1"`,
    `"Ranged (Whip) +6 (6)"`, `"Tough"`, `"Prejudice (Warriors)"` — these are bestiary **traits**.
- **Creatures already do it right**: `CreatureTemplate` references traits as structured
  `CreatureTraitInstance { id: CreatureTraitId, rating?, value?, label? }` against `creatureTraitDefinitions`.
  Their gap is smaller: `CreatureTraitModifier.skill` is still a free string, not a `SkillRef`.

## Goal

Give NPCs and Generics the same structured, validated, catalog-resolved references creatures already
have — a distinct `traits` field de-conflated from `talents`, all three reference kinds (skill /
talent / trait) resolving to the shared catalogs — and finish the creature side by resolving trait
`skill` strings to `SkillRef`. Delivered as small, testable batches.

## Key facts

| | Talent catalog | Trait catalog | Skill catalog |
|---|---|---|---|
| Source of truth | `skills-and-talents.md` | `bestiary.md` | `skills-and-talents.md` |
| Structured as | `talentDefinitions` | `creatureTraitDefinitions` | `skillDefinitions` |
| Instance shape | id (+ `_spec`) | `CreatureTraitInstance` | `SkillRef` + value |
| Characters | ✅ (ids) | — | strings→refs (char effort) |
| Creatures | — | ✅ (instances) | ⚠️ `modifier.skill` is a raw string |
| NPCs / Generics | ⚠️ strings | ⚠️ strings in `talents[]` | ⚠️ strings `"Name NN"` |

## Resolved decisions

- **Two shared catalogs, no duplication** (user rule above).
- **NPCs/Generics get a `traits?` field**; de-conflate the current `talents[]` (move
  Weapon/Armour/Ranged/Tough/Prejudice/etc. into `traits`).
- **Trait instances reuse the existing `CreatureTraitInstance` shape** — the same structure creatures
  already use — so `"Weapon (Sword) +8"` parses to `{ id: "weapon", value: "Sword", rating: 8 }`. (This
  is the plain-language answer to the earlier "how far to parse" question: parse into the shape that
  already exists, capturing base id + specialisation + rating; no new bespoke format.)
- **A parenthetical `(…)` is a specialisation/target — handled as one, applied conditionally.**
  Whether talent or trait, `Name (X)` is the single base `Name` aimed at target `X`
  (weapon / race / group / lore / threat). There is **one** catalog definition; the specialisation is
  instance data, not a new catalog entry. Its effect **only applies when the roll context matches `X`**
  (e.g. Hatred (Orcs) → +damage vs Orcs; Weapon (Sword) → only when wielding a sword; Resistance
  (Poison) → only on poison tests; Prejudice (Warriors) → only vs Warriors). The specialisation
  therefore becomes a **condition tag** on the effect (fed to the resolver's `conditionTags`), except
  where the specialisation is itself a skill area (e.g. Etiquette (Nobles), Lore (Engineering)), in
  which case it maps to a `SkillRef` specialisation instead.
- **Trait catalog reconciled against `bestiary.md`** as source of truth (mirrors talents↔MD, auto-apply).
- **Reuse character-side infrastructure**: `skillRefs`, `characteristicKeys`, the effect registry
  (trait effects become handlers too), and the authoring skill.

## ⚠️ ID uniqueness & cross-catalog collisions (verified 2026-07-04)

**Resolved by Plan 00 (prefixed ids).** Before the prefix, ids were unique **within** each catalog but
**not across** them — nine collided in **both** the talent and trait catalogs (normalising `-`/`_`):

`armour`, `frenzy`, `hardy`, `hatred`, `magic_resistance`, `night_vision`, `prejudice`, `ranged`, `weapon`

- **Four** (`armour`, `weapon`, `ranged`, `prejudice`) are the R7/R8 meta-entries wrongly in the talent
  catalog; char Plan 04 removes them → trait-only afterwards.
- **Five** (`frenzy`, `hardy`, `hatred`, `magic_resistance`, `night_vision`) are **legitimately in both
  books** (a player talent *and* a creature trait). The collision is permanent.

**Decision (2026-07-04, final — char spec D-g): prefix all catalog ids** (`skill_*`/`talent_*`/`trait_*`;
characteristics bare) via **Plan 00**, so ids are globally unique and the collision is gone at the id
level. Kind is *also* signalled by the field a ref lives in.

**But de-conflation still needs a human judgement.** The prefix removes *id* ambiguity, not *authoring*
ambiguity: an NPC's `talents[]` still lists **display names** (`"Hatred (Orcs)"`), and the name Hatred
exists in both books. So `parseTalentEntry` resolves to `talent_hatred` and `parseTraitEntry` to
`trait_hatred` (field-specific), and **A03** still decides which array a currently-conflated string
belongs in — for the 5 legitimate-both names it uses entity kind (bestiary creature/beast → trait;
human NPC → talent) and **flags each for review** rather than guessing.

Also: `resistance` exists as both a bare base talent (`:1002`) and `resistance_corruption` (`:83`) —
a duplicate to resolve in char Plan 03/04 (pick the grouped base `resistance` + `resistance_<threat>`
specialisations, drop the redundant one).

## Dependency on the character effort

Character **Plan 04** removes the non-Core meta-"talents" `armour`/`weapon`/`ranged`/`tough`/`prejudice`.
Those exist only to resolve NPC/generic trait strings. **This spec's de-conflation (Plan A03) must land
before character Plan 04**, or those deletions break NPC/generic references. Sequence: A01→A03, then char-04.

## Data model (additive)

```ts
// src/data/npcTypes.ts
export interface NpcTemplate {
  // ...existing...
  skills?: readonly string[];   // kept as authored; resolved via parser (Plan A01)
  talents?: readonly string[];  // real talents only, after de-conflation
  traits?: readonly string[];   // NEW: bestiary traits, parsed to CreatureTraitInstance
}
```
Parsing stays string-authored in data files (low churn, human-readable) with a resolver that produces
structured instances; validation runs over the resolved output.

## Parsers (Plan A01) — pure, tested

```ts
// src/lib/adversaryRefs.ts
parseSkillEntry("Melee (Basic) 61")  // -> { skillRef: "melee_basic", baseId: "melee", value: 61 }
parseTalentEntry("Strike to Stun")    // -> { talentId: "strike_to_stun" }
parseTraitEntry("Ranged (Whip) +6 (6)") // -> { id: "ranged", value: "Whip", rating: 6, extra: 6 }
```
Resolve names→ids via the shared catalogs (dasherise/snake as each catalog uses; creature trait ids are
kebab-case, e.g. `chill-grasp`). Base-matches-any specialisation via `skillRefs` semantics.

**Specialisation handling.** The parenthetical becomes:
- a **condition tag** when it names a target (weapon/race/group/threat) — `Hatred (Orcs)` →
  `{ talentId: "hatred", specialisation: "Orcs", conditionTag: "target:orcs" }`; the effect applies
  only when the roll context carries that tag.
- a **skill-spec ref** when it names a skill area — `Lore (Engineering)` → `lore_engineering`.
- a **trait parameter** (`value`) when it names the trait's subject — `Weapon (Sword)` →
  `{ id: "weapon", value: "Sword" }`, condition `using:sword`.

One instance = one base + one specialisation; a stat block listing `Hatred (Orcs)` and `Hatred (Elves)`
is the same base talent with two conditional instances.

## Plan index (small, testable; sequenced)

| Plan | Piece | Test |
|---|---|---|
| A01 | `adversaryRefs.ts` parsers (skill/talent/trait strings → structured) | unit spec: the three formats + edge cases |
| A02 | Add `traits?` field to `NpcTemplate` (+ any editor types) | build; existing data unaffected |
| A03 | De-conflate `talents[]` → move trait entries into `traits[]` (batched by data file) | `adversary-references.spec.ts` resolves all |
| A04 | Validation: every NPC/generic skill/talent/trait ref resolves to a shared catalog | new `adversary-references.spec.ts` |
| A05 | Reconcile trait catalog vs `bestiary.md` (source of truth), batched | `creature-traits` data spec |
| A06 | Trait effects → registry handlers (traits granting skill/characteristic bonuses) | `talent-effects.spec.ts` gains trait cases |
| A07 | Creatures: resolve `CreatureTraitModifier.skill` string → `SkillRef` + validate | index/refs spec |
| A08 | UI: adversary/creature stat blocks + editor show resolved, linked skills/talents/traits | component/e2e |

## Non-goals
- No stat-block re-authoring beyond de-conflation and reference structuring.
- No rules engine for every trait's prose (typed-where-clear, mirroring the character depth decision).
