# Fire Lore Spells & Fire Mage Talents — Design

## Context

This tool already has a substantial magic implementation: `SpellsTab`, `SpellShopSidebar`, a `SpellDefinition` catalog (`src/data/rules/wfrp4e/spells.ts`, `additionalFireSpells.ts`), and the full Winds of Magic Aqshy chapter text sitting in `src/data/books/winds-of-magic/aqshy.md`. This is not a greenfield "Winds of Magic" feature — it's finishing and correcting the Fire lore slice that's already there, so a Bright Wizard / Pyromancer character can be built accurately with the existing Spells and Talents tabs.

Two problems block that today:

1. **Spell data is incomplete and partly inaccurate.** The 8 core-rulebook Lore of Fire spells in `spells.ts` (`fireLoreSpellIds`) are verified correct against `src/data/books/core-rulebook/magic.md`. But the 14 Winds-of-Magic Aqshy spells in `additionalFireSpells.ts` have wrong CN values, at least one wrong name, one clearly fabricated entry, and several missing spells, when checked against the source table in `aqshy.md`.
2. **There's no way to record which Lore a character's Arcane Magic talent covers.** `talent_arcane_magic` is `grouped: true` with `specialisationLabel: "Lore"`, mirroring how the `Channelling` and `Lore` *skills* already support specialisations (e.g. `Channelling (Aqshy)`) — but the skill-specialisation machinery (`SkillSpecialisationDefinition`, `specialisationId` on `CharacterSkillRecord`, the picker in `TalentSidebar`... actually in the skill shop) was never built out for talents. `CharacterTalentRecord` is just `{ talentId }`, and `TalentSidebar`/`TalentsTab` have no specialisation picker or display. So today a character can't actually be recorded as having "Arcane Magic (Fire)" — only generic "Arcane Magic."

This spec covers fixing both, scoped to Fire only. Both are prerequisites for the next phase (casting rolls), which needs correct CN values and needs to know a caster's Lore to filter which spells they can learn/cast.

## Non-goals

- Casting roll automation (CN vs SL, Overcasting, Miscasting) — future phase.
- Extending specialisation support to other grouped talents beyond what falls out naturally from building the generic mechanism (the mechanism will be generic — any `grouped` talent gets a picker — but no *new* lores/data beyond Fire are added).
- Book activation/deactivation settings and the Railway DB migration — separate, already-agreed prerequisite work, not touched here.
- Verifying/expanding any lore other than Fire (Aqshy).

## Part 1 — Spell catalog correction

### Source of truth

`src/data/books/core-rulebook/magic.md` (§ The Lore of Fire) for the 8 core spells, and `src/data/books/winds-of-magic/aqshy.md` (§ The Lore of Fire table) for the full 24-spell Winds of Magic list, which is a superset including the same 8 core spells plus 16 more.

### Corrections needed in `additionalFireSpellDefinitions` (`src/data/rules/wfrp4e/additionalFireSpells.ts`)

Cross-checked against the `aqshy.md` table:

| id | Issue | Fix |
|---|---|---|
| `boiling-blood` | cn 8, should be 5; range/target/duration/damage also don't match source | Correct all fields to match `aqshy.md` row |
| `burning-head` | cn 8, should be 6 | Correct cn (and verify other fields) |
| `captivating-flame` | cn 4, should be 3 | Correct cn |
| `choleric` | cn 4, should be 2 | Correct cn |
| `flamestorm` | cn 10, should be 8 | Correct cn |
| `inextinguishable-flame` | cn 6, should be 3; duration also differs | Correct fields |
| `magma-storm` | cn 12, should be 13; range differs ("Random Vortex" in source) | Correct fields |
| `yogthnars-flaming-blizzard` | id/name is "Yogthnar's", source spells it "Ygethmor's Flaming Blizzard"; cn 10 vs 12 | Rename id/name, correct cn |
| `body-of-fire` | cn 9 vs 5; range "Willpower yards" vs "You"; target "1" vs "You"; damage "Special" vs an actual effect ("Grapplers suffer 8+SL Damage...") | Correct all fields |
| `fury-of-tarmus` | Fabricated/garbled placeholder ("uploaded image title was unclear") — this is actually **Forge of Tarnus** (cn 6, Touch, 1 forge, WP Bonus hours, Trade (Smith) +1 SL benefit) | Replace with the real Forge of Tarnus entry, id `forge-of-tarnus` |
| `waiting-heat` | Does not appear anywhere in either book's source text — no evidence this is a real WFRP4E Fire spell | Remove, unless a source is found during implementation |
| `ignite`, `kindleflame`, `taste-of-fire` | cn already correct | No change |

### Spells missing entirely (present in `aqshy.md` but absent from the codebase)

- **Kindred of the Hearth** (cn 4, Touch, Special, WP Bonus rounds — summons a small flame elemental defender)
- **Sanguine Swords** (cn 6, Willpower yards, You, WP Bonus minutes — summons up to 6 hovering magic swords)
- **Withering Heat** (cn 6, AoE (Willpower yards), You, WP Bonus rounds — Fatigued on running/fleeing enemies, Ablaze on touching fire)

These three get added as new entries in `additionalFireSpellDefinitions`, following the existing `SpellDefinition` shape (`category: "school"`, `school: "fire"`, `schools: ["fire"]`).

### Net result

`additionalFireSpellDefinitions` goes from 14 (partly wrong) entries to 16 correct entries, all field-checked against `aqshy.md`. Combined with the 8 already-correct core spells in `spells.ts`, this gives the full, accurate 24-spell Lore of Fire. No changes to `SpellDefinition` the type, `spells.ts` aggregation logic, `SpellsTab`, or `SpellShopSidebar` — they already render whatever is in `allSpellDefinitions` correctly via the `school:fire` subtab.

### Verification

Since this is pure data correction, verification is a manual diff: for every fire-school spell, compare cn/range/target/duration/damage/description against the `aqshy.md` table row. No automated test currently exists for spell data content, and adding one isn't warranted for static reference data (matches project convention — e.g. talents/skills have no per-entry content tests either).

## Part 2 — Talent specialisation tracking (Fire, generically)

### Goal

Let a character record *which* Lore their Arcane Magic talent applies to (and, generically, which specialisation any `grouped` talent has), so "Arcane Magic (Fire)" is a real, distinguishable, displayed fact on a sheet — not just prose text on a generic "Arcane Magic" entry.

### Approach: mirror the existing skill-specialisation pattern exactly

This is a known, working pattern already in the codebase for skills (`Channelling (Aqshy)`, `Lore (Beasts)`, etc.) — Talents just needs the same pieces:

1. **New data type** `TalentSpecialisationDefinition` (`src/types/rules.ts`), identical shape to `SkillSpecialisationDefinition`:
   ```ts
   export interface TalentSpecialisationDefinition {
     id: string;
     talentId: string;
     name: string;
   }
   ```
2. **New data file/table** analogous to how skill specialisations are declared in `skills.ts` (e.g. `channelling: ["Aqshy", "Azyr", ...]`) — a `talentSpecialisations` list in `talents.ts` covering `talent_arcane_magic` with the 9 Lore names (Aqshy/Azyr/Chamon/Dhar/Ghyran/Ghur/Hysh/Shyish/Ulgu), since the Arcane Lore specialisation list is a fixed, known set (same list already used for `Channelling`/`Lore` skills) — not something to build out lore-by-lore. Populating all 9 here costs nothing extra and avoids a second follow-up change when Azyr/etc. spells are added later; only Fire's *spells and talents* are being verified this round, not the other 8 lores.
3. **`CharacterTalentRecord`** (`src/types/character.ts`) gains `specialisationId?: string`, matching `CharacterSkillRecord`.
4. **`ResolvedCharacterTalent`** (`src/data/characters/resolved.ts`) gains `specialisationId?: string` and a resolved display `name` that includes the specialisation (e.g. "Arcane Magic (Fire)"), matching how `getSkillDisplayName` composes `${skill.name} (${specialisation.name})`.
5. **`TalentSidebar`** gets a specialisation picker for grouped talents with specialisations defined — same interaction shape as however the skill shop currently offers `Channelling (Aqshy)` as a distinct purchasable option (via `buildResolvedSkillOptions`-style flattening: one list entry per talent×specialisation combo, id `talent_arcane_magic:spec_aqshy`). `purchaseTalent`/`onRemoveTalent` change from `(talentName: string)` to accept the composite option, so a character can hold e.g. both "Arcane Magic (Fire)" and (later) "Arcane Magic (Beasts)" as distinct, separately-tracked entries rather than colliding on one generic "Arcane Magic" count.
6. **`TalentsTab`** groups/displays rows by the resolved display name (already keys rows by `talent.name`, which will now naturally read "Arcane Magic (Fire)" once step 4 is in place) — no structural change needed beyond consuming the new resolved shape.
7. **Career data** (`pyromancer_wizard` in `careers.ts`): verify/update so its Arcane Magic grant (if any at the relevant career step) resolves to the Fire specialisation, rather than leaving it unspecialised.

### Why generic-but-Fire-populated, not Fire-hardcoded

Hardcoding a one-off "Arcane Magic (Fire)" talent id (e.g. `talent_arcane_magic_fire`) instead of building the specialisation mechanism would be faster today but would fight the grain of the existing `grouped`/`specialisationLabel` fields already sitting unused on `TalentDefinition`, and would require a second migration later when another lore's talents are verified. The skill-specialisation pattern already exists and is proven; mirroring it for talents is the smaller total change.

### Verification

- Manual: in the app, take "Arcane Magic" from the Talent sidebar, pick "Fire" as the specialisation, confirm the Talents tab shows "Arcane Magic (Fire)" with correct rule text, and confirm it can be removed correctly.
- `npm run lint && npm run build` for type correctness across the touched files (`types/rules.ts`, `types/character.ts`, `data/characters/resolved.ts`, `data/rules/wfrp4e/talents.ts`, `components/sidebar/TalentSidebar.tsx`, `tabs/TalentsTab.tsx`, `data/rules/wfrp4e/careers.ts`).
- `npm test` (Playwright) — check whether existing talent-related e2e tests reference `purchaseTalent`/talent names directly; update any that assumed the old `(talentName: string)` signature.
