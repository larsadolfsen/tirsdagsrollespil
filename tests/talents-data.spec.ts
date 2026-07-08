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

test("talent ids are unique", () => {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const talent of talentDefinitions) {
    if (seen.has(talent.id)) dupes.push(talent.id);
    seen.add(talent.id);
  }
  expect(dupes, `Duplicate talent ids: ${dupes.join(", ")}`).toEqual([]);
});

// Mechanic corrections from Plan 05: reconcile wrong mechanics vs MD source
test("talent_accurate_shot has damage_bonus effect for ranged attacks", () => {
  const talent = byId("talent_accurate_shot");
  expect(talent).toBeTruthy();
  expect(talent?.effects).toBeTruthy();
  const damageBonus = talent?.effects?.find((e) => e.type === "damage_bonus");
  expect(damageBonus).toBeTruthy();
  expect(damageBonus?.type === "damage_bonus" && damageBonus.valuePerLevel).toBe(1);
  expect(damageBonus?.type === "damage_bonus" && damageBonus.condition).toBe("ranged_attacks");
});

test("talent_nimble_fingered has attribute_bonus for dexterity with no tests field", () => {
  const talent = byId("talent_nimble_fingered");
  expect(talent).toBeTruthy();
  expect(talent?.tests).toBeUndefined();
  expect(talent?.effects).toBeTruthy();
  const dexBonus = talent?.effects?.find((e) => e.type === "attribute_bonus" && "attribute" in e && e.attribute === "dexterity");
  expect(dexBonus).toBeTruthy();
  expect(dexBonus?.type === "attribute_bonus" && dexBonus.attribute).toBe("dexterity");
  expect(dexBonus?.type === "attribute_bonus" && dexBonus.valuePerLevel).toBe(5);
  expect(dexBonus?.type === "attribute_bonus" && dexBonus.condition).toBe("starting_characteristic_only");
});

test("talent_savvy has attribute_bonus for intelligence with no tests field", () => {
  const talent = byId("talent_savvy");
  expect(talent).toBeTruthy();
  expect(talent?.tests).toBeUndefined();
  expect(talent?.effects).toBeTruthy();
  const intBonus = talent?.effects?.find((e) => e.type === "attribute_bonus" && "attribute" in e && e.attribute === "intelligence");
  expect(intBonus).toBeTruthy();
  expect(intBonus?.type === "attribute_bonus" && intBonus.attribute).toBe("intelligence");
  expect(intBonus?.type === "attribute_bonus" && intBonus.valuePerLevel).toBe(5);
  expect(intBonus?.type === "attribute_bonus" && intBonus.condition).toBe("starting_characteristic_only");
});

test("talent_very_resilient has attribute_bonus for toughness with no tests field", () => {
  const talent = byId("talent_very_resilient");
  expect(talent).toBeTruthy();
  expect(talent?.tests).toBeUndefined();
  expect(talent?.effects).toBeTruthy();
  const toughBonus = talent?.effects?.find((e) => e.type === "attribute_bonus" && "attribute" in e && e.attribute === "toughness");
  expect(toughBonus).toBeTruthy();
  expect(toughBonus?.type === "attribute_bonus" && toughBonus.attribute).toBe("toughness");
  expect(toughBonus?.type === "attribute_bonus" && toughBonus.valuePerLevel).toBe(5);
  expect(toughBonus?.type === "attribute_bonus" && toughBonus.condition).toBe("starting_characteristic_only");
});
