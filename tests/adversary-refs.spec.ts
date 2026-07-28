import { expect, test } from "@playwright/test";
import {
  tokenizeEntry,
  parseSkillEntry,
  parseTalentEntry,
  parseTraitEntry,
} from "../src/lib/adversaryRefs";

test("tokenizeEntry splits base, spec, value and extra", () => {
  expect(tokenizeEntry("Dodge 54")).toMatchObject({ baseName: "Dodge", value: 54 });
  expect(tokenizeEntry("Melee (Basic) 61")).toMatchObject({
    baseName: "Melee",
    specialisation: "Basic",
    value: 61,
  });
  expect(tokenizeEntry("Weapon (Sword) +8")).toMatchObject({
    baseName: "Weapon",
    specialisation: "Sword",
    value: 8,
  });
  expect(tokenizeEntry("Ranged (Whip) +6 (6)")).toMatchObject({
    baseName: "Ranged",
    specialisation: "Whip",
    value: 6,
    extra: 6,
  });
  expect(tokenizeEntry("Tough")).toMatchObject({ baseName: "Tough" });
});

test("parseSkillEntry resolves base and specialisation to prefixed ids", () => {
  expect(parseSkillEntry("Dodge 54")).toMatchObject({
    baseId: "skill_dodge",
    skillRef: "skill_dodge",
    value: 54,
    unresolved: false,
  });
  expect(parseSkillEntry("Melee (Basic) 61")).toMatchObject({
    baseId: "skill_melee",
    skillRef: "skill_melee_basic",
    unresolved: false,
  });
});

test("parseTalentEntry resolves talent names and turns spec into a condition tag", () => {
  expect(parseTalentEntry("Strike to Stun")).toMatchObject({
    talentId: "talent_strike_to_stun",
    unresolved: false,
  });
  const hatred = parseTalentEntry("Hatred (Orcs)");
  expect(hatred.talentId).toBe("talent_hatred");
  expect(hatred.conditionTag).toBe("target:orcs");
});

test("parseTraitEntry resolves trait names with rating and specialisation", () => {
  expect(parseTraitEntry("Weapon (Sword) +8")).toMatchObject({
    traitId: "trait_weapon",
    specialisation: "Sword",
    rating: 8,
    unresolved: false,
  });
  expect(parseTraitEntry("Armour (Leathers) 1")).toMatchObject({
    traitId: "trait_armour",
    rating: 1,
    unresolved: false,
  });
});

test("field-specific resolution is id-collision safe", () => {
  // A talent-only name resolves as a talent, not a trait.
  expect(parseTalentEntry("Strike to Stun").unresolved).toBe(false);
  expect(parseTraitEntry("Strike to Stun").unresolved).toBe(true);
  // "Weapon" is now trait-only (the meta talent was removed in Plan 04).
  expect(parseTalentEntry("Weapon (Sword) +8").unresolved).toBe(true);
  expect(parseTraitEntry("Weapon (Sword) +8").traitId).toBe("trait_weapon");
  // "Hatred" is a legitimate name in BOTH catalogs (a talent AND a bestiary trait).
  // Each parser resolves only within its own catalog — never the other's id.
  expect(parseTalentEntry("Hatred (Orcs)").talentId).toBe("talent_hatred");
  expect(parseTraitEntry("Hatred (Orcs)").traitId).toBe("trait_hatred");
  // Unknown strings resolve in neither.
  expect(parseSkillEntry("Definitely Not A Skill").unresolved).toBe(true);
});
