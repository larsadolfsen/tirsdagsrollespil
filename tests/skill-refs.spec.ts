import { expect, test } from "@playwright/test";
import { parseSkillRef, isResolvableSkillRef, skillRefMatches } from "../src/lib/skillRefs";
import { toCharacteristicKey } from "../src/lib/characteristicKeys";

test("base ref matches any specialisation", () => {
  expect(
    skillRefMatches("skill_stealth", { skillId: "skill_stealth", specialisationId: "skill_stealth_urban" }),
  ).toBe(true);
  expect(skillRefMatches("skill_stealth", { skillId: "skill_stealth" })).toBe(true);
});

test("spec ref matches only itself", () => {
  expect(
    skillRefMatches("skill_stealth_urban", { skillId: "skill_stealth", specialisationId: "skill_stealth_urban" }),
  ).toBe(true);
  expect(
    skillRefMatches("skill_stealth_urban", { skillId: "skill_stealth", specialisationId: "skill_stealth_rural" }),
  ).toBe(false);
});

test("unrelated skill never matches", () => {
  expect(skillRefMatches("skill_endurance", { skillId: "skill_athletics" })).toBe(false);
});

test("parseSkillRef splits base and specialisation", () => {
  expect(parseSkillRef("skill_stealth_urban")).toEqual({
    baseId: "skill_stealth",
    specialisationId: "skill_stealth_urban",
  });
  expect(parseSkillRef("skill_endurance")).toEqual({ baseId: "skill_endurance" });
});

test("isResolvableSkillRef accepts real refs and rejects unknown", () => {
  expect(isResolvableSkillRef("skill_endurance")).toBe(true);
  expect(isResolvableSkillRef("skill_stealth_urban")).toBe(true);
  expect(isResolvableSkillRef("skill_not_a_real_skill")).toBe(false);
  expect(isResolvableSkillRef("endurance")).toBe(false); // unprefixed no longer resolves
});

test("characteristic key: canonical + legacy + non-characteristic", () => {
  expect(toCharacteristicKey("WS")).toBe("WS");
  expect(toCharacteristicKey("weaponSkill")).toBe("WS");
  expect(toCharacteristicKey("fellowship")).toBe("Fel");
  expect(toCharacteristicKey("movement")).toBeUndefined();
});
