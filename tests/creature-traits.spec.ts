import { expect, test } from "@playwright/test";
import { creatureTraitDefinitions } from "../src/data/rules/wfrp4e/creatureTraits";

// WFRP 4e Bestiary: a creature's natural-weapon Rating ALREADY includes its Strength Bonus
// ("...the Damage of the attack equals Rating and includes the creature's Strength Bonus
// already"). So damage must be expressed as the Rating alone — never "Strength Bonus + rating",
// which would double-count the bonus.
test("creature natural-weapon traits do not double-count Strength Bonus", () => {
  const offenders: string[] = [];

  for (const trait of creatureTraitDefinitions) {
    for (const modifier of trait.modifiers ?? []) {
      if (modifier.type === "weaponProfile" && /strength bonus/i.test(modifier.formula ?? "")) {
        offenders.push(`${trait.name}: weaponProfile formula "${modifier.formula}"`);
      }
    }

    if (/strength bonus (\+|plus) rating/i.test(trait.statBlock ?? "")) {
      offenders.push(`${trait.name}: statBlock "${trait.statBlock}"`);
    }
  }

  expect(offenders, `Traits double-counting Strength Bonus: ${offenders.join("; ")}`).toEqual([]);
});

function traitById(id: string) {
  const trait = creatureTraitDefinitions.find((definition) => definition.id === id);
  if (!trait) throw new Error(`Creature trait "${id}" not found`);
  return trait;
}

// WFRP 4e Bestiary: Chill Grasp deals 1d10 + SL Wounds (ignoring Toughness Bonus
// and armour). The damage must roll a die, not apply a flat 10.
test("Chill Grasp damage rolls a die rather than a flat value", () => {
  const damage = traitById("trait_chill_grasp").modifiers?.find((modifier) => modifier.type === "damage");
  expect(damage?.formula).toBe("1d10 + SL");
});

// WFRP 4e Bestiary: Petrifying Gaze inflicts 1 Stunned condition per 2 SL, not a
// flat "2 + SL". Permanent petrification past the threshold is tracked separately
// via the combat flag.
test("Petrifying Gaze applies Stunned scaled per 2 SL", () => {
  const stunned = traitById("trait_petrifying_gaze").modifiers?.find(
    (modifier) => modifier.type === "condition" && modifier.condition === "Stunned",
  );
  expect(stunned?.formula).toBe("1 Stunned per 2 SL");
});

// WFRP 4e Bestiary (R4): Breath is a Free Attack costing 2 Advantage, not a plain
// "Action" trigger.
test("Breath triggers as a Free Attack costing 2 Advantage", () => {
  const actionOption = traitById("trait_breath").modifiers?.find(
    (modifier) => modifier.type === "actionOption",
  );
  expect(actionOption?.trigger).toBe("Free Attack costing 2 Advantage");
});

// WFRP 4e Bestiary (R5): Daemonic's bracketed value is the ignore-blow roll target
// (roll 1d10 >= Target to ignore a blow entirely), not a "Patron or source" label,
// and the ignore-blow mechanic must be modelled as a modifier.
test("Daemonic parameter is the ignore-blow roll target, and the mechanic is modelled", () => {
  const trait = traitById("trait_daemonic");
  expect(trait.parameter?.kind).toBe("difficulty");
  expect(trait.parameter?.label).toBe("Ignore-blow roll target");
  expect(trait.parameter?.required).toBe(true);

  const ignoreBlow = trait.modifiers?.find(
    (modifier) => modifier.type === "diceHook" && modifier.target === "ignore-blow-roll",
  );
  expect(ignoreBlow).toBeTruthy();
});

// WFRP 4e Bestiary: Corruption (Strength) takes an enum value (Minor/Moderate/Major),
// not a numeric rating.
test("Corrupted parameter is a Strength type, not a numeric rating", () => {
  const trait = traitById("trait_corrupted");
  expect(trait.parameter?.kind).toBe("type");
});
