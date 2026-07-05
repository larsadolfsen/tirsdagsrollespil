import { expect, test } from "@playwright/test";
import { talentDefinitions } from "../src/data/rules/wfrp4e/talents";

const byId = (id: string) => talentDefinitions.find((talent) => talent.id === id);

// Corrected Max values validated against the WFRP 4e Core Rulebook talent list.
// The recurring bug was a flat "1"/"5" where the book uses a Characteristic Bonus.
const EXPECTED_MAX: Record<string, string> = {
  talent_argumentative: "Fellowship Bonus",
  talent_attractive: "Fellowship Bonus",
  talent_blather: "Fellowship Bonus",
  talent_bookish: "Intelligence Bonus",
  talent_carouser: "Toughness Bonus",
  talent_combat_reflexes: "Initiative Bonus",
  talent_commanding_presence: "Fellowship Bonus",
  talent_dealmaker: "Fellowship Bonus",
  talent_etiquette: "Fellowship Bonus",
  talent_fast_hands: "Dexterity Bonus",
  talent_hatred: "Willpower Bonus",
  talent_iron_will: "Willpower Bonus",
  talent_lip_reading: "Initiative Bonus",
  talent_luck: "Fellowship Bonus",
  talent_menacing: "Strength Bonus",
  talent_mimic: "Initiative Bonus",
  talent_night_vision: "Initiative Bonus",
  talent_public_speaker: "Fellowship Bonus",
  talent_relentless: "Agility Bonus",
  talent_reversal: "Weapon Skill Bonus",
  talent_shadow: "Agility Bonus",
  talent_shieldsman: "Strength Bonus",
  talent_sixth_sense: "Initiative Bonus",
  talent_speedreader: "Intelligence Bonus",
  talent_sprinter: "Strength Bonus",
  talent_step_aside: "Agility Bonus",
  talent_strike_mighty_blow: "Strength Bonus",
  talent_wealthy: "None",
  // Mechanic corrections:
  talent_gunner: "Dexterity Bonus",
  talent_magic_resistance: "1",
};

test("corrected talent Max values match the Core Rulebook", () => {
  const wrong: string[] = [];
  for (const [id, expected] of Object.entries(EXPECTED_MAX)) {
    const talent = byId(id);
    if (!talent) {
      wrong.push(`${id}: MISSING`);
    } else if (talent.max !== expected) {
      wrong.push(`${id}: "${talent.max}" (expected "${expected}")`);
    }
  }
  expect(wrong, `Wrong talent Max: ${wrong.join("; ")}`).toEqual([]);
});

// Plan 05: mechanic corrections modelled as typed effects, validated against
// skills-and-talents.md (the authoritative Core Rulebook table). These talents
// previously invented a Test where the book grants a flat +5 starting characteristic.
test("flat +5 starting-characteristic talents are modelled as attribute_bonus, not invented Tests", () => {
  const expected: Record<string, string> = {
    talent_nimble_fingered: "dexterity",
    talent_savvy: "intelligence",
    talent_very_resilient: "toughness",
  };
  for (const [id, attribute] of Object.entries(expected)) {
    const talent = byId(id);
    expect(talent, id).toBeTruthy();
    expect(talent?.tests, `${id} should not invent a Test`).toBeUndefined();
    const effect = talent?.effects?.find((entry) => entry.type === "attribute_bonus");
    expect(effect, `${id} attribute_bonus effect`).toEqual({
      type: "attribute_bonus",
      attribute,
      valuePerLevel: 5,
      condition: "starting_characteristic_only",
    });
  }
});

test("accurate_shot adds ranged Damage per level, not the Sniper range mechanic", () => {
  const talent = byId("talent_accurate_shot");
  expect(talent?.tests, "accurate_shot should not carry the Sniper range Test").toBeUndefined();
  const effect = talent?.effects?.find((entry) => entry.type === "damage_bonus");
  expect(effect).toEqual({ type: "damage_bonus", valuePerLevel: 1, condition: "ranged_attack" });
});

test("talent ids are unique", () => {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const talent of talentDefinitions) {
    if (seen.has(talent.id)) dupes.push(talent.id);
    seen.add(talent.id);
  }
  expect(dupes, `Duplicate talent ids: ${dupes.join(", ")}`).toEqual([]);
});
