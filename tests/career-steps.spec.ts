import { expect, test } from "@playwright/test";
import { careerSteps } from "../src/data/rules/wfrp4e/careers/careerSteps";
import { skillCharacteristicById } from "../src/data/rules/wfrp4e/skills";

// Every skill a career step grants must resolve against the skill catalog,
// either as a base skill id (e.g. "set_trap") or as a specialisation written
// as "<baseId>_<specialisation>" (e.g. "art_writing"). Base ids can themselves
// contain underscores, so resolution checks an exact id first, then a "<base>_"
// prefix. This guards against id drift like "bribe"/"intimidation"/"set_traps".
test("every career step skill id resolves to a known skill", () => {
  const baseSkillIds = Object.keys(skillCharacteristicById);
  const baseSkillIdSet = new Set(baseSkillIds);

  const resolves = (skillId: string) =>
    baseSkillIdSet.has(skillId) || baseSkillIds.some((base) => skillId.startsWith(`${base}_`));

  const unresolved: string[] = [];
  for (const step of careerSteps) {
    for (const skillId of step.skillIds ?? []) {
      if (!resolves(skillId)) {
        unresolved.push(`${step.name} (rank ${step.rank}): "${skillId}"`);
      }
    }
  }

  expect(unresolved, `Unresolved career skill ids: ${unresolved.join("; ")}`).toEqual([]);
});
