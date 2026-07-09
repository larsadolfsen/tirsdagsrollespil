import { expect, test } from "@playwright/test";
import {
  resolveSkillDisplay,
  resolveTalentDisplay,
  resolveTraitDisplay,
} from "../src/lib/adversaryDisplay";

test("resolveSkillDisplay resolves ungrouped skills to catalog name + value", () => {
  expect(resolveSkillDisplay("Dodge 54")).toMatchObject({
    displayName: "Dodge",
    value: 54,
    skillRef: "skill_dodge",
    unresolved: false,
  });
});

test("resolveSkillDisplay resolves grouped skills with specialisation", () => {
  expect(resolveSkillDisplay("Melee (Basic) 61")).toMatchObject({
    displayName: "Melee (Basic)",
    value: 61,
    skillRef: "skill_melee_basic",
    unresolved: false,
  });
});

test("resolveSkillDisplay falls back to raw label when unresolved", () => {
  const resolved = resolveSkillDisplay("Made Up Skill 12");
  expect(resolved.unresolved).toBe(true);
  expect(resolved.displayName).toBe("Made Up Skill");
  expect(resolved.value).toBe(12);
});

test("resolveTalentDisplay resolves a talent to its definition (name + description)", () => {
  const resolved = resolveTalentDisplay("Strike to Stun");
  expect(resolved).toMatchObject({
    displayName: "Strike to Stun",
    talentId: "talent_strike_to_stun",
    unresolved: false,
  });
  expect(resolved.description).toBeTruthy();
});

test("resolveTalentDisplay keeps a trailing rating and a specialisation", () => {
  expect(resolveTalentDisplay("Attractive 3")).toMatchObject({
    displayName: "Attractive",
    value: 3,
    unresolved: false,
  });
  expect(resolveTalentDisplay("Etiquette (Servants)")).toMatchObject({
    displayName: "Etiquette (Servants)",
    specialisation: "Servants",
    unresolved: false,
  });
});

test("resolveTalentDisplay falls back to raw label when unresolved", () => {
  const resolved = resolveTalentDisplay("Totally Fake Talent");
  expect(resolved.unresolved).toBe(true);
  expect(resolved.displayName).toBe("Totally Fake Talent");
  expect(resolved.description).toBeUndefined();
});

test("resolveTraitDisplay resolves 'Weapon (Sword) +8' to the Weapon trait, Sword, rating 8", () => {
  const resolved = resolveTraitDisplay("Weapon (Sword) +8");
  expect(resolved).toMatchObject({
    displayName: "Weapon",
    specialisation: "Sword",
    rating: 8,
    traitId: "trait_weapon",
    unresolved: false,
  });
  expect(resolved.summary).toBeTruthy();
});

test("resolveTraitDisplay falls back to raw label when unresolved", () => {
  const resolved = resolveTraitDisplay("Imaginary Trait +2");
  expect(resolved.unresolved).toBe(true);
  expect(resolved.displayName).toBe("Imaginary Trait");
  expect(resolved.rating).toBe(2);
  expect(resolved.summary).toBeUndefined();
});
