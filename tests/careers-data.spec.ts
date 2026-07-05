import { expect, test } from "@playwright/test";
import { careerDefinitions } from "../src/data/rules/wfrp4e/careers";
import { skillDefinitions } from "../src/data/rules/wfrp4e/skills";
import { talentDefinitions } from "../src/data/rules/wfrp4e/talents";

// Career advancement (the Advance -> Career skills/talents filter) resolves a career's
// skillIds/talentIds against the prefixed rules catalog by exact id. If a career still
// carries an old unprefixed id (e.g. "dodge" instead of "skill_dodge"), it silently
// resolves to nothing and the Career filter shows "No skills listed for this section".
test("every career skillId resolves to a known skill", () => {
  const skillIds = new Set(skillDefinitions.map((skill) => skill.id));
  const unresolved: string[] = [];

  for (const career of careerDefinitions) {
    for (const skillId of career.skillIds) {
      if (!skillIds.has(skillId)) {
        unresolved.push(`${career.id}: ${skillId}`);
      }
    }
  }

  expect(unresolved, `Unresolved career skillIds: ${unresolved.join("; ")}`).toEqual([]);
});

test("every career talentId resolves to a known talent", () => {
  const talentIds = new Set(talentDefinitions.map((talent) => talent.id));
  const unresolved: string[] = [];

  for (const career of careerDefinitions) {
    for (const talentId of career.talentIds) {
      if (!talentIds.has(talentId)) {
        unresolved.push(`${career.id}: ${talentId}`);
      }
    }
  }

  expect(unresolved, `Unresolved career talentIds: ${unresolved.join("; ")}`).toEqual([]);
});
