import { expect, test } from "@playwright/test";
import { buildSkillTalentIndex, talentsAffectingSkill } from "../src/lib/skillTalentIndex";

test("index maps a skill to the talents that reference it", () => {
  const index = buildSkillTalentIndex();
  const intimidate = (index.get("skill_intimidate") ?? []).map((t) => t.id);
  expect(intimidate).toContain("talent_menacing");
});

test("specialisation refs land under their base skill", () => {
  // Alley Cat references skill_stealth_urban -> indexed under skill_stealth.
  const stealth = (buildSkillTalentIndex().get("skill_stealth") ?? []).map((t) => t.id);
  expect(stealth).toContain("talent_alley_cat");
});

test("talentsAffectingSkill resolves base and specialisation queries", () => {
  const byBase = talentsAffectingSkill("skill_stealth").map((t) => t.id);
  const bySpec = talentsAffectingSkill("skill_stealth_urban").map((t) => t.id);
  // A specialisation query resolves to the base, so it finds base-indexed talents.
  expect(bySpec).toEqual(byBase);
  expect(byBase).toContain("talent_alley_cat");
});

test("a skill with no linked talents returns empty", () => {
  expect(talentsAffectingSkill("skill_not_a_real_skill")).toEqual([]);
});
