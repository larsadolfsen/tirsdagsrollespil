import { expect, test } from "@playwright/test";
import { talentDefinitions } from "../src/data/rules/wfrp4e/talents";

const byId = (id: string) => talentDefinitions.find((talent) => talent.id === id);

// Corrected Max values validated against the WFRP 4e Core Rulebook talent list.
// The recurring bug was a flat "1"/"5" where the book uses a Characteristic Bonus.
const EXPECTED_MAX: Record<string, string> = {
  argumentative: "Fellowship Bonus",
  attractive: "Fellowship Bonus",
  blather: "Fellowship Bonus",
  bookish: "Intelligence Bonus",
  carouser: "Toughness Bonus",
  combat_reflexes: "Initiative Bonus",
  commanding_presence: "Fellowship Bonus",
  dealmaker: "Fellowship Bonus",
  etiquette: "Fellowship Bonus",
  fast_hands: "Dexterity Bonus",
  hatred: "Willpower Bonus",
  iron_will: "Willpower Bonus",
  lip_reading: "Initiative Bonus",
  luck: "Fellowship Bonus",
  menacing: "Strength Bonus",
  mimic: "Initiative Bonus",
  night_vision: "Initiative Bonus",
  public_speaker: "Fellowship Bonus",
  relentless: "Agility Bonus",
  reversal: "Weapon Skill Bonus",
  shadow: "Agility Bonus",
  shieldsman: "Strength Bonus",
  sixth_sense: "Initiative Bonus",
  speedreader: "Intelligence Bonus",
  sprinter: "Strength Bonus",
  step_aside: "Agility Bonus",
  strike_mighty_blow: "Strength Bonus",
  wealthy: "None",
  // Mechanic corrections:
  gunner: "Dexterity Bonus",
  magic_resistance: "1",
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
