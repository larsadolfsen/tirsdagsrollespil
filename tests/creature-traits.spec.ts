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
