import { expect, test } from "@playwright/test";
import { weaponDefinitions } from "../src/data/rules/wfrp4e/weapons";

// WFRP 4e ranged weapons express damage as a "+N" modifier (e.g. Crossbow is
// Damage +9). A bare number parses differently from "+N"; non-damaging entries
// like Lasso ("-") or Incendiary ("Special") are allowed, but a raw digit is a
// formatting bug.
test("ranged weapon damage never uses a bare number", () => {
  const ranged = weaponDefinitions.filter((weapon) => weapon.groupType === "ranged");
  const bareNumber = ranged
    .filter((weapon) => /^\d/.test(String(weapon.damage)))
    .map((weapon) => `${weapon.name}: "${weapon.damage}"`);

  expect(bareNumber, `Ranged weapons with bare-number damage: ${bareNumber.join("; ")}`).toEqual([]);
});

test("Crossbow is Damage +9", () => {
  const crossbow = weaponDefinitions.find((weapon) => weapon.name === "Crossbow");
  expect(crossbow?.damage).toBe("+9");
});
