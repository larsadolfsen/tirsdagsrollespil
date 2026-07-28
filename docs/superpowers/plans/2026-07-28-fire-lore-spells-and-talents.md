# Fire Lore Spells & Fire Mage Talents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the Fire lore spell catalog against source text, and add generic talent-specialisation tracking (mirroring the existing skill-specialisation pattern) so "Arcane Magic (Fire)" is a real, purchasable, displayed fact on a character sheet.

**Architecture:** Part 1 is a pure data fix in one file, verified by a Playwright data-assertion test (no browser). Part 2 mirrors the skill-specialisation pattern (`SkillSpecialisationDefinition` → `buildResolvedSkillOptions` → `specialisationId` on the character record → `getSkillDisplayName`) one-for-one for talents, touching the type layer, the rules-index layer, the character-record/resolved layer, `AppComposition.tsx`'s purchase/remove/save logic, and the `TalentSidebar`/`talentUtils` UI layer.

**Tech Stack:** React 19 + TypeScript, Vite, Playwright (`@playwright/test`, both as a browser e2e runner and as a plain Node test runner for data-only specs).

## Global Constraints

- Follow `.agents/AGENTS.md` conventions: use `src/components/ui/` components, semantic Tailwind tokens, no raw HTML `<h1>`–`<h6>`/`<p>` with inline color.
- Run `npm run lint && npm run build && npm test` before considering any task done, per `CLAUDE.md`.
- Data under `data/` is never committed (irrelevant here — no runtime data touched).
- Source of truth for spell/talent facts: `src/data/books/core-rulebook/magic.md` and `src/data/books/winds-of-magic/aqshy.md`, already in the repo.

---

## Part 1 — Fire spell data corrections

### Task 1: Correct `additionalFireSpellDefinitions`

**Files:**
- Modify: `src/data/rules/wfrp4e/additionalFireSpells.ts`
- Test: `tests/fire-spells-data.spec.ts` (new)

**Interfaces:**
- Consumes: `SpellDefinition` type from `src/types` (unchanged).
- Produces: `additionalFireSpellDefinitions: SpellDefinition[]` — same export name/shape, corrected content. Downstream consumers (`src/data/rules/wfrp4e/index.ts`'s `allSpellDefinitions`, `SpellsTab`) need no changes.

- [ ] **Step 1: Write the failing data test**

Create `tests/fire-spells-data.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { additionalFireSpellDefinitions } from "../src/data/rules/wfrp4e/additionalFireSpells";

const byId = (id: string) => additionalFireSpellDefinitions.find((spell) => spell.id === id);

// Corrected CN/fields validated against src/data/books/winds-of-magic/aqshy.md's
// "The Lore of Fire" table.
const EXPECTED_CN: Record<string, number> = {
  "boiling-blood": 5,
  "burning-head": 6,
  "captivating-flame": 3,
  choleric: 2,
  flamestorm: 8,
  ignite: 3,
  "inextinguishable-flame": 3,
  kindleflame: 2,
  "magma-storm": 13,
  "taste-of-fire": 2,
  "ygethmors-flaming-blizzard": 12,
  "body-of-fire": 5,
  "forge-of-tarnus": 6,
  "kindred-of-the-hearth": 4,
  "sanguine-swords": 6,
  "withering-heat": 6,
};

test("corrected fire spell CN values match Winds of Magic source", () => {
  const wrong: string[] = [];
  for (const [id, expected] of Object.entries(EXPECTED_CN)) {
    const spell = byId(id);
    if (!spell) {
      wrong.push(`${id}: MISSING`);
    } else if (spell.cn !== expected) {
      wrong.push(`${id}: cn ${spell.cn} (expected ${expected})`);
    }
  }
  expect(wrong, `Wrong fire spell CN: ${wrong.join("; ")}`).toEqual([]);
});

test("fabricated/unsourced spell entries are gone", () => {
  expect(byId("fury-of-tarmus"), "fury-of-tarmus should be replaced by forge-of-tarnus").toBeUndefined();
  expect(byId("waiting-heat"), "waiting-heat has no source text and should be removed").toBeUndefined();
  expect(byId("yogthnars-flaming-blizzard"), "renamed to ygethmors-flaming-blizzard").toBeUndefined();
});

test("fire spell ids are unique", () => {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const spell of additionalFireSpellDefinitions) {
    if (seen.has(spell.id)) dupes.push(spell.id);
    seen.add(spell.id);
  }
  expect(dupes, `Duplicate fire spell ids: ${dupes.join(", ")}`).toEqual([]);
});

test("all 16 Winds of Magic-exclusive Fire spells are present", () => {
  const expectedIds = Object.keys(EXPECTED_CN);
  expect(additionalFireSpellDefinitions.map((s) => s.id).sort()).toEqual(expectedIds.sort());
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/fire-spells-data.spec.ts`
Expected: FAIL — several `MISSING`/wrong-cn entries reported, and the "all 16" test fails because the file currently has 14 (wrong) ids.

- [ ] **Step 3: Rewrite `additionalFireSpellDefinitions` with corrected and added entries**

Replace the full contents of `src/data/rules/wfrp4e/additionalFireSpells.ts`:

```ts
import type { SpellDefinition } from "../../../types";

export const additionalFireSpellDefinitions: SpellDefinition[] = [
  {
    id: "boiling-blood",
    name: "Boiling Blood",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "Failing a Difficult (-10) Endurance Test causes 2 Blinded Conditions and 10+SL Damage (ignoring Armour) each round; slain targets explode, Damage +1 to everyone within 2 yards.",
    cn: 5,
    range: "Touch",
    target: "1",
    duration: "1 round",
    damage: "10+SL",
  },
  {
    id: "burning-head",
    name: "Burning Head",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "A flying flaming head magic missile hits everyone in its path and inflicts 1 Ablaze; anyone wounded by it treats you as Fear (1).",
    cn: 6,
    range: "Willpower yards",
    target: "Special",
    duration: "Instant",
    damage: "+4",
  },
  {
    id: "captivating-flame",
    name: "Captivating Flame",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "A viewer of a small fire must pass a Challenging Cool Test or gain 3 Stunned; larger fires (+2/+4 SL) mesmerise more observers.",
    cn: 3,
    range: "Half WP yards",
    target: "1 fire",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "choleric",
    name: "Choleric",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "Inflicts Prejudice against a named target; +4 SL escalates to Animosity, +8 SL to Hatred.",
    cn: 2,
    range: "Half Initiative yards",
    target: "1",
    duration: "Willpower Bonus hours/days/weeks",
    damage: "-",
  },
  {
    id: "flamestorm",
    name: "Flamestorm",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "A pillar of fire (2 yards across/high, scalable by +2 SL) hits everyone present with Damage +8, 3 Ablaze, and knocks them Prone outside the area; lasts until dispelled or dawn.",
    cn: 8,
    range: "Willpower yards",
    target: "Special",
    duration: "Instant",
    damage: "+8",
  },
  {
    id: "ignite",
    name: "Ignite",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "Target gains 2 Ablaze Conditions; if already Ablaze, spreads 3 Ablaze among others within 2 yards instead.",
    cn: 3,
    range: "Willpower yards",
    target: "1",
    duration: "Instant",
    damage: "Special",
  },
  {
    id: "inextinguishable-flame",
    name: "Inextinguishable Flame",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "Makes a campfire-sized fire unquenchable for the Duration (extendable with SL); reverse casting extinguishes an equivalent fire; nothing else can put it out or dispel it.",
    cn: 3,
    range: "Half Initiative yards",
    target: "1 fire",
    duration: "Willpower Bonus hours/days/weeks/months",
    damage: "-",
  },
  {
    id: "kindleflame",
    name: "Kindleflame",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "Everything in the area becomes flammable (even water/stone); already-flammable things take +SL extra fire damage/Ablaze.",
    cn: 2,
    range: "Willpower yards",
    target: "AoE (Willpower Bonus yards)",
    duration: "1 round",
    damage: "-",
  },
  {
    id: "magma-storm",
    name: "Magma Storm",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "Summons a vortex of molten rock, Damage +12 magic missile and 2 Ablaze; uses Random Vortex rules, can spawn smaller vortices with high SL.",
    cn: 13,
    range: "Random Vortex",
    target: "AoE (2x Willpower Bonus yards)",
    duration: "Willpower Bonus rounds",
    damage: "+12",
  },
  {
    id: "taste-of-fire",
    name: "Taste of Fire",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description: "Turns food fiery-spicy, or a liquid into strong spirits or lamp oil.",
    cn: 2,
    range: "Willpower Bonus yards",
    target: "1 pot/jug/flask",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "ygethmors-flaming-blizzard",
    name: "Ygethmor's Flaming Blizzard",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "A gale of sparks: 8+SL Damage each round, Prone unless an Athletics Test is passed; flammables have a 25% chance to ignite each round; only hard cover shelters.",
    cn: 12,
    range: "Willpower yards",
    target: "AoE (Willpower yards)",
    duration: "Willpower Bonus rounds",
    damage: "8+SL",
  },
  {
    id: "body-of-fire",
    name: "Body of Fire",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "Grapplers suffer 8+SL Damage and must pass a Hard (-20) Cool Test each round or let go; being wounded in melee sprays fiery blood, magic missile Damage +3 at the attacker.",
    cn: 5,
    range: "You",
    target: "You",
    duration: "Toughness Bonus minutes",
    damage: "8+SL",
  },
  {
    id: "forge-of-tarnus",
    name: "Forge of Tarnus",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description: "Trade (Smith) Tests benefit from +1 SL while the forge burns.",
    cn: 6,
    range: "Touch",
    target: "1 forge",
    duration: "Willpower Bonus hours",
    damage: "-",
  },
  {
    id: "kindred-of-the-hearth",
    name: "Kindred of the Hearth",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "Thrusting your hands into a bonfire (6 Damage minus Toughness Bonus) summons a small flame elemental defender (Move 3, WS=WP, Damage +6, Fear 1) tethered to the fire.",
    cn: 4,
    range: "Touch",
    target: "Special",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "sanguine-swords",
    name: "Sanguine Swords",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "Summons up to 6 hovering magic swords (Fly 20, WS 60, Damage 8) that attack targets in range each round; indestructible but dispellable.",
    cn: 6,
    range: "Willpower yards",
    target: "You",
    duration: "Willpower Bonus minutes",
    damage: "8",
  },
  {
    id: "withering-heat",
    name: "Withering Heat",
    category: "school",
    school: "fire",
    schools: ["fire"],
    description:
      "Enemies in the area gain Fatigued when running/fleeing; touching any fire gives them Ablaze plus extra fire Damage equal to your SL.",
    cn: 6,
    range: "AoE (Willpower yards)",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "Special",
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/fire-spells-data.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/rules/wfrp4e/additionalFireSpells.ts tests/fire-spells-data.spec.ts
git commit -m "fix(spells): correct Fire lore spell data against Winds of Magic source"
```

---

## Part 2 — Talent specialisation tracking

### Task 2: Add `TalentSpecialisationDefinition` type and Fire-lore talent specialisation data

**Files:**
- Modify: `src/types/rules.ts`
- Modify: `src/data/rules/wfrp4e/talents.ts`
- Test: `tests/talent-specialisations-data.spec.ts` (new)

**Interfaces:**
- Produces: `TalentSpecialisationDefinition { id: string; talentId: string; name: string }` (exported from `src/types`), `talentSpecialisationDefinitions: TalentSpecialisationDefinition[]` and `getTalentDisplayName(talent, specialisation?)` and `buildResolvedTalentOptions(talents, specialisations)` (all exported from `src/data/rules/wfrp4e/talents.ts`), matching the shape/signatures of `SkillSpecialisationDefinition`/`getSkillDisplayName`/`buildResolvedSkillOptions` in `skills.ts`.

- [ ] **Step 1: Write the failing data test**

Create `tests/talent-specialisations-data.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import {
  buildResolvedTalentOptions,
  getTalentDisplayName,
  talentDefinitions,
  talentSpecialisationDefinitions,
} from "../src/data/rules/wfrp4e/talents";

test("talent_arcane_magic has the 8 core Arcane Lore specialisations", () => {
  const arcaneMagicSpecs = talentSpecialisationDefinitions
    .filter((spec) => spec.talentId === "talent_arcane_magic")
    .map((spec) => spec.name)
    .sort();

  expect(arcaneMagicSpecs).toEqual(
    ["Beasts", "Death", "Fire", "Heavens", "Life", "Light", "Metal", "Shadow"].sort(),
  );
});

test("talent specialisation ids are unique and reference a real talent", () => {
  const talentIds = new Set(talentDefinitions.map((talent) => talent.id));
  const seen = new Set<string>();
  const dupes: string[] = [];
  const orphans: string[] = [];

  for (const spec of talentSpecialisationDefinitions) {
    if (seen.has(spec.id)) dupes.push(spec.id);
    seen.add(spec.id);
    if (!talentIds.has(spec.talentId)) orphans.push(spec.id);
  }

  expect(dupes, `Duplicate specialisation ids: ${dupes.join(", ")}`).toEqual([]);
  expect(orphans, `Specialisations referencing unknown talents: ${orphans.join(", ")}`).toEqual([]);
});

test("getTalentDisplayName composes 'Arcane Magic (Fire)' for the Fire specialisation", () => {
  const arcaneMagic = talentDefinitions.find((talent) => talent.id === "talent_arcane_magic")!;
  const fireSpec = talentSpecialisationDefinitions.find(
    (spec) => spec.talentId === "talent_arcane_magic" && spec.name === "Fire",
  )!;

  expect(getTalentDisplayName(arcaneMagic, fireSpec)).toBe("Arcane Magic (Fire)");
  expect(getTalentDisplayName(arcaneMagic)).toBe("Arcane Magic");
});

test("buildResolvedTalentOptions expands grouped talents into one option per specialisation", () => {
  const options = buildResolvedTalentOptions(talentDefinitions, talentSpecialisationDefinitions);
  const arcaneMagicOptions = options.filter((option) => option.talentId === "talent_arcane_magic");

  expect(arcaneMagicOptions).toHaveLength(8);
  expect(arcaneMagicOptions.map((option) => option.name)).toContain("Arcane Magic (Fire)");

  const ungroupedOptions = options.filter((option) => option.talentId === "talent_hatred");
  expect(ungroupedOptions).toHaveLength(1);
  expect(ungroupedOptions[0]!.name).toBe("Hatred");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/talent-specialisations-data.spec.ts`
Expected: FAIL with import errors (`buildResolvedTalentOptions`, `getTalentDisplayName`, `talentSpecialisationDefinitions` don't exist yet).

- [ ] **Step 3: Add `TalentSpecialisationDefinition` to `src/types/rules.ts`**

Add immediately after the existing `SkillSpecialisationDefinition` interface (after line 79):

```ts
export interface TalentSpecialisationDefinition {
  id: string;
  talentId: string;
  name: string;
}
```

Add `talentSpecialisations: TalentSpecialisationDefinition[];` to the `Ruleset` interface, immediately after `talents: TalentDefinition[];`:

```ts
export interface Ruleset {
  id: string;
  name: string;
  races: RaceDefinition[];
  skills: SkillDefinition[];
  skillSpecialisations: SkillSpecialisationDefinition[];
  actions: ActionDefinition[];
  properties: PropertyDefinition[];
  talents: TalentDefinition[];
  talentSpecialisations: TalentSpecialisationDefinition[];
  spells: SpellDefinition[];
  items: ItemDefinition[];
  weapons: WeaponDefinition[];
  armours: ArmourDefinition[];
  careers: CareerDefinition[];
}
```

- [ ] **Step 4: Add specialisation data and helpers to `src/data/rules/wfrp4e/talents.ts`**

At the top of the file, add the import and a snake-case helper (mirroring `skills.ts`):

```ts
import type { TalentDefinition, TalentSpecialisationDefinition } from "../../../types";

function toSnakeCase(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
```

At the bottom of the file (after the `talentDefinitions` array closes), add:

```ts
const GROUPED_TALENT_SPECIALISATIONS: Record<string, string[]> = {
  talent_arcane_magic: ["Beasts", "Death", "Fire", "Heavens", "Life", "Light", "Metal", "Shadow"],
};

export const talentSpecialisationDefinitions: TalentSpecialisationDefinition[] = Object.entries(
  GROUPED_TALENT_SPECIALISATIONS,
).flatMap(([talentId, names]) =>
  names.map((name) => ({
    id: `${talentId}_${toSnakeCase(name)}`,
    talentId,
    name,
  })),
);

export function getTalentDisplayName(
  talent: Pick<TalentDefinition, "name" | "grouped">,
  specialisation?: Pick<TalentSpecialisationDefinition, "name"> | null,
) {
  if (talent.grouped && specialisation) {
    return `${talent.name} (${specialisation.name})`;
  }

  return talent.name;
}

export function buildResolvedTalentOptions(
  talents: TalentDefinition[],
  specialisations: TalentSpecialisationDefinition[],
) {
  const specialisationsByTalentId = specialisations.reduce<Record<string, TalentSpecialisationDefinition[]>>(
    (acc, specialisation) => {
      acc[specialisation.talentId] ??= [];
      acc[specialisation.talentId].push(specialisation);
      return acc;
    },
    {},
  );

  return talents.flatMap((talent) => {
    const groupedOptions = specialisationsByTalentId[talent.id] ?? [];
    if (talent.grouped && groupedOptions.length > 0) {
      return groupedOptions.map((specialisation) => ({
        id: `${talent.id}:${specialisation.id}`,
        talentId: talent.id,
        specialisationId: specialisation.id,
        name: getTalentDisplayName(talent, specialisation),
      }));
    }

    return [
      {
        id: talent.id,
        talentId: talent.id,
        specialisationId: undefined as string | undefined,
        name: getTalentDisplayName(talent),
      },
    ];
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx playwright test tests/talent-specialisations-data.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Wire the new ruleset field in `src/data/rules/wfrp4e/index.ts`**

Add `talentSpecialisationDefinitions` to the import from `./talents` (currently `import { talentDefinitions } from "./talents";`):

```ts
import { buildResolvedTalentOptions, getTalentDisplayName, talentDefinitions, talentSpecialisationDefinitions } from "./talents";
```

Add `talentSpecialisations: talentSpecialisationDefinitions,` to the `wfrp4eRuleset` object, immediately after `talents: talentDefinitions,`.

Add a re-export next to the existing skill one at the bottom of the file:

```ts
export { buildResolvedTalentOptions, getTalentDisplayName, talentDefinitions, talentSpecialisationDefinitions };
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: No new errors from this task (there will still be errors from later tasks' code not yet written if you're batching — if running this task in isolation, expect 0 errors).

- [ ] **Step 8: Commit**

```bash
git add src/types/rules.ts src/data/rules/wfrp4e/talents.ts src/data/rules/wfrp4e/index.ts tests/talent-specialisations-data.spec.ts
git commit -m "feat(talents): add talent specialisation type and Arcane Magic Lore data"
```

---

### Task 3: Add `specialisationId` to the character/resolved talent layer

**Files:**
- Modify: `src/types/character.ts`
- Modify: `src/data/characters/resolved.ts`

**Interfaces:**
- Consumes: `TalentSpecialisationDefinition`, `talentSpecialisationDefinitions`, `getTalentDisplayName` from Task 2.
- Produces: `CharacterTalentRecord { talentId: string; specialisationId?: string }`, `ResolvedCharacterTalent { ...; specialisationId?: string; displayName: string }`.

**Design note — identity stays name-based, matching skills:** Skills already use the *resolved display name* (e.g. `"Channelling (Aqshy)"`) as the identifier threaded through `purchaseSkillAdvance`/`saveCareerChanges`/pending-state maps — not a synthetic composite id. `getCharacterSkillKey` (`skillId:specialisationId`) exists only for de-duping entries *inside* `characterSkills` state. Talents will follow the exact same shape: `ResolvedCharacterTalent.displayName` (e.g. `"Arcane Magic (Fire)"`) becomes the string used everywhere a talent needs to be looked up or de-duped by name — no new "option id"/key-generation function is needed. This keeps `CareerTab.tsx`'s existing name-based `purchaseTalent(talentName)` / `updateTalentTaken(talentName, ...)` call sites working unchanged for ungrouped talents (Task 5 handles excluding grouped talents from that particular quick-editor).

- [ ] **Step 1: Update `CharacterTalentRecord` in `src/types/character.ts`**

Change:

```ts
export interface CharacterTalentRecord {
  talentId: string;
}
```

to:

```ts
export interface CharacterTalentRecord {
  talentId: string;
  specialisationId?: string;
}
```

- [ ] **Step 2: Update `ResolvedCharacterTalent` and its mapping in `src/data/characters/resolved.ts`**

Change the interface (currently lines 58–66):

```ts
export interface ResolvedCharacterTalent {
  id: string;
  name: string;
  description: string;
  max: string;
  tests?: string;
  effects?: TalentDefinition["effects"];
  relatedSkillIds?: TalentDefinition["relatedSkillIds"];
}
```

to:

```ts
export interface ResolvedCharacterTalent {
  id: string;
  name: string;
  displayName: string;
  specialisationId?: string;
  description: string;
  max: string;
  tests?: string;
  effects?: TalentDefinition["effects"];
  relatedSkillIds?: TalentDefinition["relatedSkillIds"];
}
```

Add the import at the top of the file alongside the existing rules imports:

```ts
import { getTalentDisplayName } from "../rules/wfrp4e/talents";
```

Change the talents-mapping block (currently lines 251–266):

```ts
    talents: character.talents.map((talent) => {
      const definition = talentsById[talent.talentId];
      if (!definition) {
        throw new Error(`Unknown talent "${talent.talentId}" for character "${character.id}".`);
      }

      return {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        max: definition.max,
        tests: definition.tests,
        effects: definition.effects,
        relatedSkillIds: definition.relatedSkillIds,
      };
    }),
```

to:

```ts
    talents: character.talents.map((talent) => {
      const definition = talentsById[talent.talentId];
      if (!definition) {
        throw new Error(`Unknown talent "${talent.talentId}" for character "${character.id}".`);
      }

      const specialisation = talent.specialisationId
        ? talentSpecialisationsById[talent.specialisationId]
        : null;

      if (talent.specialisationId && !specialisation) {
        throw new Error(
          `Unknown talent specialisation "${talent.specialisationId}" for character "${character.id}".`,
        );
      }

      return {
        id: definition.id,
        name: definition.name,
        displayName: getTalentDisplayName(definition, specialisation),
        specialisationId: talent.specialisationId,
        description: definition.description,
        max: definition.max,
        tests: definition.tests,
        effects: definition.effects,
        relatedSkillIds: definition.relatedSkillIds,
      };
    }),
```

Find where `talentsById` is built near the top of the resolving function (same pattern as `skillsById`/`skillSpecialisationsById` — search for `const talentsById =` in the file) and add a matching `talentSpecialisationsById`:

```ts
const talentSpecialisationsById = Object.fromEntries(
  ruleset.talentSpecialisations.map((specialisation) => [specialisation.id, specialisation]),
);
```

(Place it directly after the existing `skillSpecialisationsById` construction.)

- [ ] **Step 3: Type-check and run the existing data-test suite**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Run: `npx playwright test tests/fire-spells-data.spec.ts tests/talent-specialisations-data.spec.ts tests/character-data.spec.ts tests/talents-data.spec.ts`
Expected: all PASS — this confirms existing talent-resolution tests still pass with the new optional field (no talent in the current data has a `specialisationId` set yet, so `specialisation` resolves to `null` and `displayName` falls back to the plain `name` everywhere except the new Fire test data).

- [ ] **Step 4: Commit**

```bash
git add src/types/character.ts src/data/characters/resolved.ts
git commit -m "feat(talents): thread specialisationId and displayName through the resolved talent layer"
```

---

### Task 4: Wire `resolvedTalentOptions` into `RulesIndex`

**Files:**
- Modify: `src/lib/gameSession.ts`

**Interfaces:**
- Consumes: `buildResolvedTalentOptions` from Task 2.
- Produces: `RulesIndex.resolvedTalentOptions: Array<{ id: string; talentId: string; specialisationId?: string; name: string }>` — the talent analogue of `RulesIndex.resolvedSkillOptions`, consumed by `AppComposition.tsx` in Task 5/6.

- [ ] **Step 1: Add the field to the `RulesIndex` type**

In `src/lib/gameSession.ts`, change the `RulesIndex` type (currently ending at line 41):

```ts
export type RulesIndex = {
  skillDescriptionByName: Record<string, string>;
  actionDescriptionByName: Record<string, string>;
  propertyDescriptionByName: Record<string, string>;
  skillCharacteristicById: Record<string, string>;
  weaponStatsByName: Record<string, WeaponStats>;
  careerAdvancementByName: Record<string, { skills: string[]; talents: string[]; characteristics: Array<{ key: string; availableFromRank: number }> }>;
  resolvedSkillOptions: Array<{ id: string; skillId: string; specialisationId?: string; name: string }>;
  resolvedTalentOptions: Array<{ id: string; talentId: string; specialisationId?: string; name: string }>;
};
```

- [ ] **Step 2: Build the value in `buildRulesIndex`**

In the same file, update the import from `../data/rules/wfrp4e` (currently `import { buildResolvedSkillOptions, getSkillDisplayName, skillCharacteristicById } from "../data/rules/wfrp4e";`) to also pull in `buildResolvedTalentOptions`:

```ts
import {
  buildResolvedSkillOptions,
  buildResolvedTalentOptions,
  getSkillDisplayName,
  skillCharacteristicById,
} from "../data/rules/wfrp4e";
```

In `buildRulesIndex`, immediately after the existing `resolvedSkillOptions` assignment (currently lines 119–122):

```ts
  const resolvedSkillOptions = buildResolvedSkillOptions(
    ruleset.skills,
    ruleset.skillSpecialisations,
  );

  const resolvedTalentOptions = buildResolvedTalentOptions(
    ruleset.talents,
    ruleset.talentSpecialisations,
  );
```

Add `resolvedTalentOptions,` to the function's return object (currently lines 124–132).

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors (this task only adds a field; nothing consumes it yet).

- [ ] **Step 4: Commit**

```bash
git add src/lib/gameSession.ts
git commit -m "feat(talents): expose resolvedTalentOptions on RulesIndex"
```

---

### Task 5: Update talent purchase/remove/save logic in `AppComposition.tsx`

**Files:**
- Modify: `src/AppComposition.tsx`

**Interfaces:**
- Consumes: `rulesIndex.resolvedTalentOptions` (Task 4), `ResolvedCharacterTalent.displayName`/`specialisationId` (Task 3).
- Produces: `purchaseTalent(talentName: string): void`, `addTalentForFree(talentName: string): void`, `removeTalent(talentName: string): void`, `updateTalentTaken(talentName: string, takenCount: number): void` — **signatures are unchanged** (still plain strings, matching `purchaseSkillAdvance(skillName: string)`'s existing convention). What changes is which string flows through them: for grouped talents it's now the full resolved display name (e.g. `"Arcane Magic (Fire)"`), and the internal lookup resolves against `rulesIndex.resolvedTalentOptions` (by `option.name`) instead of `ruleset.talents` (by `talent.name`), so it can recover `specialisationId`. `CareerTab.tsx`'s existing calls to these four functions need **no changes** — they keep passing plain talent names for ungrouped talents (Task 5 Step 5 excludes grouped/specialised talents from the list `CareerTab` iterates, since that quick-editor has no specialisation picker).

- [ ] **Step 1: Update `purchaseTalent`**

Replace (currently lines 1099–1111):

```tsx
  const purchaseTalent = (talentName: string) => {
    const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
    if (!talentDefinition) {
      return;
    }

    // Queue the purchase as pending so it is costed and committed on save (saveCareerChanges),
    // consistent with skill/characteristic advances. Direct edits use addTalentForFree.
    setPendingTalentPurchases((prev) => ({
      ...prev,
      [talentName]: (prev[talentName] ?? 0) + 1,
    }));
  };
```

with:

```tsx
  const purchaseTalent = (talentName: string) => {
    const talentOption = rulesIndex.resolvedTalentOptions.find((option) => option.name === talentName);
    if (!talentOption) {
      return;
    }

    // Queue the purchase as pending so it is costed and committed on save (saveCareerChanges),
    // consistent with skill/characteristic advances. Direct edits use addTalentForFree.
    setPendingTalentPurchases((prev) => ({
      ...prev,
      [talentName]: (prev[talentName] ?? 0) + 1,
    }));
  };
```

- [ ] **Step 2: Update `addTalentForFree`**

Replace (currently lines 1113–1131):

```tsx
  const addTalentForFree = (talentName: string) => {
    const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
    if (!talentDefinition) {
      return;
    }

    setCharacterTalents((prev) => [
      ...prev,
      {
        id: talentDefinition.id,
        name: talentDefinition.name,
        description: talentDefinition.description,
        max: talentDefinition.max,
        tests: talentDefinition.tests,
        effects: talentDefinition.effects,
        relatedSkillIds: talentDefinition.relatedSkillIds,
      },
    ]);
  };
```

with:

```tsx
  const addTalentForFree = (talentName: string) => {
    const talentOption = rulesIndex.resolvedTalentOptions.find((option) => option.name === talentName);
    const talentDefinition = talentOption
      ? ruleset.talents.find((talent) => talent.id === talentOption.talentId)
      : null;
    if (!talentOption || !talentDefinition) {
      return;
    }

    setCharacterTalents((prev) => [
      ...prev,
      {
        id: talentDefinition.id,
        name: talentDefinition.name,
        displayName: talentOption.name,
        specialisationId: talentOption.specialisationId,
        description: talentDefinition.description,
        max: talentDefinition.max,
        tests: talentDefinition.tests,
        effects: talentDefinition.effects,
        relatedSkillIds: talentDefinition.relatedSkillIds,
      },
    ]);
  };
```

- [ ] **Step 3: Update `removeTalent`**

Replace (currently lines 1133–1147):

```tsx
  const removeTalent = (talentName: string) => {
    if ((pendingTalentPurchases[talentName] ?? 0) > 0) {
      removePendingTalentPurchase(talentName);
      return;
    }

    setCharacterTalents((prev) => {
      const removeIndex = prev.findLastIndex((talent) => talent.name === talentName);
      if (removeIndex < 0) {
        return prev;
      }

      return prev.filter((_, index) => index !== removeIndex);
    });
  };
```

with:

```tsx
  const removeTalent = (talentName: string) => {
    if ((pendingTalentPurchases[talentName] ?? 0) > 0) {
      removePendingTalentPurchase(talentName);
      return;
    }

    setCharacterTalents((prev) => {
      const removeIndex = prev.findLastIndex((talent) => talent.displayName === talentName);
      if (removeIndex < 0) {
        return prev;
      }

      return prev.filter((_, index) => index !== removeIndex);
    });
  };
```

- [ ] **Step 4: Update the talent-commit block inside `saveCareerChanges`**

Replace (currently lines within `saveCareerChanges`, the `pendingTalentPurchases` block):

```tsx
    if (Object.keys(pendingTalentPurchases).length > 0) {
      setCharacterTalents((prev) => {
        const nextTalents = [...prev];

        for (const [talentName, pendingCount] of Object.entries(pendingTalentPurchases)) {
          const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
          if (!talentDefinition) {
            continue;
          }

          const purchaseCount = Number(pendingCount);
          for (let step = 0; step < purchaseCount; step += 1) {
            nextTalents.push({
              id: talentDefinition.id,
              name: talentDefinition.name,
              description: talentDefinition.description,
              max: talentDefinition.max,
              tests: talentDefinition.tests,
              effects: talentDefinition.effects,
              relatedSkillIds: talentDefinition.relatedSkillIds,
            });
          }
        }

        return nextTalents;
      });
    }
```

with:

```tsx
    if (Object.keys(pendingTalentPurchases).length > 0) {
      setCharacterTalents((prev) => {
        const nextTalents = [...prev];

        for (const [talentName, pendingCount] of Object.entries(pendingTalentPurchases)) {
          const talentOption = rulesIndex.resolvedTalentOptions.find((option) => option.name === talentName);
          const talentDefinition = talentOption
            ? ruleset.talents.find((talent) => talent.id === talentOption.talentId)
            : null;
          if (!talentOption || !talentDefinition) {
            continue;
          }

          const purchaseCount = Number(pendingCount);
          for (let step = 0; step < purchaseCount; step += 1) {
            nextTalents.push({
              id: talentDefinition.id,
              name: talentDefinition.name,
              displayName: talentOption.name,
              specialisationId: talentOption.specialisationId,
              description: talentDefinition.description,
              max: talentDefinition.max,
              tests: talentDefinition.tests,
              effects: talentDefinition.effects,
              relatedSkillIds: talentDefinition.relatedSkillIds,
            });
          }
        }

        return nextTalents;
      });
    }
```

- [ ] **Step 5: Update `updateTalentTaken`, and exclude specialised talents from the `CareerTab` quick-editor list**

`updateTalentTaken` (immediately after `removeTalent`) currently matches by `talent.name === talentName`. Apply the same treatment as `removeTalent`'s Step 3: change its internal match from `talent.name === talentName` to `talent.displayName === talentName`, and change its add-path (the branch that pushes a new `CharacterTalentRecord`-shaped entry when increasing the count from 0) to resolve via `rulesIndex.resolvedTalentOptions.find((option) => option.name === talentName)` first, mirroring `addTalentForFree`'s Step 2 shape (populate `displayName: talentOption.name` and `specialisationId: talentOption.specialisationId` on the pushed object).

Then update `advancementTalentNames` (currently lines 746–750) to exclude talents that have specialisations, since `CareerTab`'s quick-editor (`filteredAdvancementTalentNames`) has no specialisation picker — a bare "Arcane Magic" row there would be ambiguous. Replace:

```tsx
  const advancementTalentNames = [...new Set([
    ...ruleset.talents.map((talent) => talent.name),
    ...careerAdvancementData.talents,
    ...characterTalents.map((talent) => talent.name),
  ])].sort((first, second) => first.localeCompare(second));
```

with:

```tsx
  const specialisedTalentIds = new Set(ruleset.talentSpecialisations.map((spec) => spec.talentId));
  const advancementTalentNames = [...new Set([
    ...ruleset.talents.filter((talent) => !specialisedTalentIds.has(talent.id)).map((talent) => talent.name),
    ...careerAdvancementData.talents.filter((name) => {
      const talent = ruleset.talents.find((t) => t.name === name);
      return !talent || !specialisedTalentIds.has(talent.id);
    }),
    ...characterTalents.filter((talent) => !talent.specialisationId).map((talent) => talent.name),
  ])].sort((first, second) => first.localeCompare(second));
```

(A character's already-owned specialised talents, e.g. "Arcane Magic (Fire)", are excluded from this quick-editor list via the `!talent.specialisationId` filter on `characterTalents` and continue to be managed from the Talent sidebar, updated in Task 6.)

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors from this task's changes — the four functions kept their `(talentName: string)` signature, so `CareerTab.tsx`'s existing calls remain valid. Any errors at this point come from `TalentSidebar`/`TalentsTab` still referencing the pre-Task-3 `ResolvedCharacterTalent` shape (missing `displayName`) — those are fixed in Task 6.

- [ ] **Step 7: Commit**

```bash
git add src/AppComposition.tsx
git commit -m "feat(talents): key talent purchase/remove/save by option id and specialisation"
```

---

### Task 6: Update `TalentSidebar`, `talentUtils`, and `TalentsTab` for specialised display

**Files:**
- Modify: `src/components/sidebar/TalentSidebar.tsx`
- Modify: `src/tabs/talents/talentUtils.ts`
- Modify: `src/tabs/TalentsTab.tsx`
- Modify: `src/AppComposition.tsx` (call-site wiring only)

**Interfaces:**
- Consumes: `rulesIndex.resolvedTalentOptions` (Task 4), `ResolvedCharacterTalent.displayName` (Task 3), `purchaseTalent`/`onRemoveTalent` (Task 5, unchanged `(talentName: string)` signature).
- Produces: `TalentSidebar` renders one row per talent option (so "Arcane Magic (Fire)" and "Arcane Magic (Shadow)" are separate, independently purchasable/removable list items, the same way `Channelling (Aqshy)` and `Channelling (Azyr)` already are in the skill shop) instead of one row per base talent name — each row's purchase/remove buttons call `purchaseTalent(option.name)`/`onRemoveTalent(option.name)` with the full resolved display name, no new id concept involved.

- [ ] **Step 1: Update `getCharacterTalentRows` in `src/tabs/talents/talentUtils.ts`**

Replace (currently lines 88–104):

```ts
export function getCharacterTalentRows(characterTalents: ResolvedCharacterTalent[]) {
  return Array.from<{ talent: ResolvedCharacterTalent; count: number }>(
    characterTalents
      .reduce<Map<string, { talent: ResolvedCharacterTalent; count: number }>>((rows, talent) => {
        const current = rows.get(talent.name);

        if (current) {
          current.count += 1;
          return rows;
        }

        rows.set(talent.name, { talent, count: 1 });
        return rows;
      }, new Map())
      .values(),
  ).sort((a, b) => a.talent.name.localeCompare(b.talent.name));
}
```

with (using `displayName` as the group key instead of `name`, so specialised talents no longer merge into a single generic row):

```ts
export function getCharacterTalentRows(characterTalents: ResolvedCharacterTalent[]) {
  return Array.from<{ talent: ResolvedCharacterTalent; count: number }>(
    characterTalents
      .reduce<Map<string, { talent: ResolvedCharacterTalent; count: number }>>((rows, talent) => {
        const current = rows.get(talent.displayName);

        if (current) {
          current.count += 1;
          return rows;
        }

        rows.set(talent.displayName, { talent, count: 1 });
        return rows;
      }, new Map())
      .values(),
  ).sort((a, b) => a.talent.displayName.localeCompare(b.talent.displayName));
}
```

- [ ] **Step 2: Update `TalentsTab.tsx` to render `displayName`**

In `src/tabs/TalentsTab.tsx`, the row key and displayed name currently use `talent.name` (lines 100 and 105–106). Change:

```tsx
                <SheetDataAccordionRow
                  key={talent.name}
                  summaryClassName={`${talentGridClass} gap-0`}
                  summary={(
                    <>
                      <span className="wfrp-no-roll-cell min-w-0 truncate text-left font-semibold text-gray-200">
                        {talent.name}
                      </span>
```

to:

```tsx
                <SheetDataAccordionRow
                  key={talent.displayName}
                  summaryClassName={`${talentGridClass} gap-0`}
                  summary={(
                    <>
                      <span className="wfrp-no-roll-cell min-w-0 truncate text-left font-semibold text-gray-200">
                        {talent.displayName}
                      </span>
```

Change the `onRemoveTalent` call site (currently line 146, `onClick={() => onRemoveTalent(talent.name)}`) to pass the resolved display name instead:

```tsx
                        onClick={() => onRemoveTalent(talent.displayName)}
```

No new imports needed in `TalentsTab.tsx` — `talent` is already a `ResolvedCharacterTalent`, which has `displayName` after Task 3.

- [ ] **Step 3: Rewrite `TalentSidebar.tsx` to list one row per talent option**

The current implementation iterates `talents: TalentDefinition[]` and matches ownership/cost by `talent.name`. Replace the props and body to iterate `rulesIndex`-resolved options instead, keeping `purchaseTalent`/`onRemoveTalent` as plain-name callbacks. Change the props signature:

```tsx
export function TalentSidebar({
  characterTalents,
  careerTalentIds,
  talents,
  talentOptions,
  getTalentMaxDisplay,
  getTalentPurchaseCost,
  isOpen,
  onClose,
  pendingAvailableXp,
  pendingTalentPurchases,
  onRemoveTalent,
  purchaseTalent,
}: {
  characterTalents: ResolvedCharacterTalent[];
  careerTalentIds: string[];
  talents: TalentDefinition[];
  talentOptions: Array<{ id: string; talentId: string; specialisationId?: string; name: string }>;
  getTalentMaxDisplay: (max: string) => string | number;
  getTalentPurchaseCost: (currentTimesTaken: number) => number;
  isOpen: boolean;
  onClose: () => void;
  pendingAvailableXp: number;
  pendingTalentPurchases: Record<string, number>;
  onRemoveTalent: (talentName: string) => void;
  purchaseTalent: (talentName: string) => void;
}) {
```

This keeps `getTalentMaxDisplay` as a required prop (unlike the dropped id-based `getTalentMaxDisplayByName`), since it resolves formulaic `max` strings like `"Willpower Bonus"` against the character's live attributes (`getTalentMaxDisplayValue(max, attributes)` in `AppComposition.tsx`) and can't be inlined into this component.

Replace the body's talent lookups from `talents: TalentDefinition[]` keyed by name to `talentOptions` keyed by resolved name, and `careerTalentNames`/`ownedTalentNames` from talent-name-based to option-name-based:

```tsx
  const [selectedFilters, setSelectedFilters] = useState<TalentFilterType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const ownedTalentNames = useMemo(
    () => new Set(characterTalents.map((talent) => talent.displayName)),
    [characterTalents],
  );
  const careerTalentIdSet = useMemo(() => new Set(careerTalentIds), [careerTalentIds]);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const getTalentPurchaseState = (option: (typeof talentOptions)[number]) => {
    const baseTakenCount = characterTalents.filter((entry) => entry.displayName === option.name).length;
    const pendingTakenCount = pendingTalentPurchases[option.name] ?? 0;
    const totalTakenCount = baseTakenCount + pendingTakenCount;
    const nextCost = getTalentPurchaseCost(totalTakenCount);
    const isCareerTalent = careerTalentIdSet.has(option.talentId);
    const baseTalent = talents.find((t) => t.id === option.talentId);
    const maxDisplay = getTalentMaxDisplay(baseTalent?.max ?? "1");
    const numericMax = typeof maxDisplay === "number" ? maxDisplay : Number.parseInt(String(maxDisplay), 10);
    const canGainTalent = Number.isFinite(numericMax) ? totalTakenCount < numericMax : true;
    const canPurchase = canGainTalent && isCareerTalent && pendingAvailableXp >= nextCost;

    return {
      baseTakenCount,
      canGainTalent,
      canPurchase,
      maxDisplay,
      nextCost,
      totalTakenCount,
    };
  };
```

Update the `talentItems` construction to map over `talentOptions` instead of `talents`, using `option.name` (the resolved display name) as both the purchase/remove identifier and the shown label:

```tsx
  const talentItems = talentOptions
    .filter((option) => {
      if (selectedFilters.length === 0) return true;
      return selectedFilters.some((filter) => {
        if (filter === "career") return careerTalentIdSet.has(option.talentId);
        if (filter === "other") return !careerTalentIdSet.has(option.talentId);
        return false;
      });
    })
    .filter((option) => {
      if (!normalizedSearchQuery) return true;
      const baseTalent = talents.find((t) => t.id === option.talentId);

      return [option.name, baseTalent?.description, baseTalent?.tests].some((value) =>
        value?.toLowerCase().includes(normalizedSearchQuery),
      );
    })
    .map((option) => {
      const baseTalent = talents.find((t) => t.id === option.talentId)!;
      const {
        canGainTalent,
        canPurchase,
        maxDisplay,
        nextCost,
        totalTakenCount,
      } = getTalentPurchaseState(option);
      const isOwned = ownedTalentNames.has(option.name);

      return {
        actions: [
          ...(isOwned ? [{
            className: "[&_span]:bg-[#4a4a4a] [&_span]:text-wfrp-muted-text hover:[&_span]:bg-[#555555]",
            label: "Remove",
            onClick: () => onRemoveTalent(option.name),
          }] : []),
          ...(canGainTalent ? [{
            disabled: !canPurchase,
            isActive: canPurchase,
            label: `Buy for ${nextCost} XP`,
            onClick: () => purchaseTalent(option.name),
          }] : []),
        ],
        description: baseTalent.description,
        details: [
          { label: "Tiers", value: `${totalTakenCount}/${maxDisplay}` },
          ...(baseTalent.tests ? [{ label: "Tests", value: baseTalent.tests }] : []),
        ],
        id: option.id,
        isMarked: isOwned,
        name: option.name,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
```

- [ ] **Step 4: Update the `TalentSidebar` call site in `AppComposition.tsx`**

Find the two `<TalentSidebar ... />` usages (lines ~1801 and ~2035 area) and update their props from `talents={ruleset.talents}` / `careerTalentNames={...}` to:

```tsx
              talents={ruleset.talents}
              talentOptions={rulesIndex.resolvedTalentOptions}
              careerTalentIds={careerAdvancementData.talents
                .map((talentName) => ruleset.talents.find((talent) => talent.name === talentName)?.id)
                .filter((id): id is string => Boolean(id))}
```

(Replacing whatever `talents={...}` / `careerTalentNames={...}` props were previously passed at each of the two call sites — keep every other existing prop, including `getTalentMaxDisplay`, unchanged.)

- [ ] **Step 5: Run the full lint/build**

Run: `npm run lint`
Expected: 0 errors. Fix any remaining places `tsc` flags a `TalentDefinition`-shaped value being passed where a resolved talent option or `ResolvedCharacterTalent` (with `displayName`) is now expected.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/sidebar/TalentSidebar.tsx src/tabs/talents/talentUtils.ts src/tabs/TalentsTab.tsx src/AppComposition.tsx
git commit -m "feat(talents): render one Talent sidebar row per specialisation option"
```

---

### Task 7: Grant Arcane Magic to the Pyromancer career and verify end-to-end

**Files:**
- Modify: `src/data/rules/wfrp4e/careers.ts`
- Test: `tests/talents.spec.ts` (extend, or create if it doesn't cover this — check first)

**Interfaces:** None new — this task only adds data and verifies the full stack built in Tasks 1–6.

- [ ] **Step 1: Add `arcane_magic` to the Pyromancer career's talent grants**

In `src/data/rules/wfrp4e/careers.ts`, in the `pyromancer_wizard` career entry (lines 176–182), add `"arcane_magic"` to `talentIds`, matching the existing bare-id convention already used by every other entry in that array:

```ts
    talentIds: [
      "aethyric_attunement",
      "arcane_magic",
      "instinctive_diction",
      "petty_magic",
      "read_write",
      "second_sight",
    ],
```

Per `src/data/books/winds-of-magic/aqshy.md`'s "The Pyromancer Career" section, this is granted as part of the standard Wizard progression — this change only adds the base talent grant; it does not force the Fire specialisation (the player picks "Arcane Magic (Fire)" specifically from the Talent sidebar once the base talent is a recognized career talent, same as any other grouped talent).

- [ ] **Step 2: Write/extend a Playwright e2e test for the purchase flow**

First check whether `tests/talents.spec.ts` or `tests/skill-talent-index.spec.ts` already drives the Talent sidebar via a browser — if a suitable existing spec file exists, add the test there instead of creating a new file. Otherwise create `tests/talent-specialisation-purchase.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("Arcane Magic (Fire) can be added from the Talent sidebar and displays correctly", async ({ page }) => {
  await page.route("**/api/character-progress/thano_voss", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, body: "null" });
      return;
    }

    await route.fulfill({ status: 204 });
  });
  await page.goto("/enemy_within/thano_voss");

  await page.getByRole("button", { name: "Talents" }).click();
  await page.getByRole("button", { name: "Add" }).click();

  const search = page.getByRole("searchbox", { name: "Search talents" });
  await search.fill("Arcane Magic (Fire)");
  await expect(page.getByRole("button", { name: /Arcane Magic \(Fire\)/ })).toBeVisible();

  const shadowOption = page.getByRole("button", { name: /Arcane Magic \(Shadow\)/ });
  await search.fill("Arcane Magic (Shadow)");
  await expect(shadowOption).toHaveCount(0);
});
```

(This test only asserts the sidebar lists distinct, correctly-named specialisation options — it deliberately doesn't assert a full purchase-and-display round trip through XP spending, since that flow depends on the character fixture's current XP/career state, which this plan doesn't control. If `thano_voss` isn't a Wizard-career character, adjust the assertion to just confirm the search finds "Arcane Magic (Fire)" as a listed, addable item rather than asserting purchasability.)

- [ ] **Step 3: Run it**

Run: `npx playwright test tests/talent-specialisation-purchase.spec.ts` (or the extended existing file)
Expected: PASS. If the fixture character doesn't expose the Talent "Add" button the way assumed, inspect the actual rendered sidebar (`npx playwright test --headed` or `--ui`) and adjust selectors — don't guess blindly.

- [ ] **Step 4: Run the entire test suite**

Run: `npm run lint && npm run build && npm test`
Expected: all green. Pay particular attention to any pre-existing test that referenced `purchaseTalent`/`onRemoveTalent`/`talents` props by their old name-based signature — fix any that break.

- [ ] **Step 5: Commit**

```bash
git add src/data/rules/wfrp4e/careers.ts tests/talent-specialisation-purchase.spec.ts
git commit -m "feat(talents): grant Arcane Magic on the Pyromancer career; add e2e coverage"
```

---

## Self-Review Notes

- **Spec coverage:** Part 1 (spell corrections) is fully covered by Task 1. Part 2 (talent specialisation mechanism, `CharacterTalentRecord`, `TalentSidebar`/`TalentsTab` display, career grant) is covered by Tasks 2–7, in the same order the design doc lists them (types → data → resolved layer → rules index → purchase logic → UI → career grant + verification).
- **Known pre-existing issue found during research, intentionally not touched:** `careers.ts`'s `talentIds`/`skillIds` are bare ids (`"petty_magic"`) while `talentDefinitions`/`skillDefinitions` ids are prefixed (`"talent_petty_magic"`, `"skill_channelling"`); the lookups in `careerAdvancementByName` (`src/lib/gameSession.ts` and the duplicate in `src/data/rules/wfrp4e/index.ts`) compare `talent.id === talentId` directly, which may never match. This plan adds `"arcane_magic"` to `pyromancer_wizard.talentIds` using the same (possibly-broken) convention as its neighbors for consistency, but does not investigate or fix the underlying id-matching bug — that's a separate, pre-existing issue outside this plan's scope.
