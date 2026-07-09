import { expect, test } from "@playwright/test";
import { skillDefinitions, skillSpecialisationDefinitions } from "../src/data/rules/wfrp4e/skills";
import { talentDefinitions } from "../src/data/rules/wfrp4e/talents";
import { creatureTraitDefinitions } from "../src/data/rules/wfrp4e/creatureTraits";

// Plan 00: catalog ids are prefixed for global uniqueness. Guards against a new
// unintended cross-catalog collision or an unprefixed id slipping back in.
const skillIds = [
  ...skillDefinitions.map((s) => s.id),
  ...skillSpecialisationDefinitions.map((s) => s.id),
];
const talentIds = talentDefinitions.map((t) => t.id);
const traitIds = creatureTraitDefinitions.map((t) => t.id);

test("every catalog id carries its kind prefix", () => {
  expect(skillIds.filter((id) => !id.startsWith("skill_")), "unprefixed skill ids").toEqual([]);
  expect(talentIds.filter((id) => !id.startsWith("talent_")), "unprefixed talent ids").toEqual([]);
  expect(traitIds.filter((id) => !id.startsWith("trait_")), "unprefixed trait ids").toEqual([]);
});

test("catalog id sets are pairwise disjoint (no cross-catalog collisions)", () => {
  const sets = { skill: new Set(skillIds), talent: new Set(talentIds), trait: new Set(traitIds) };
  const overlap = (a: Set<string>, b: Set<string>) => [...a].filter((id) => b.has(id));
  expect(overlap(sets.skill, sets.talent), "skill∩talent").toEqual([]);
  expect(overlap(sets.skill, sets.trait), "skill∩trait").toEqual([]);
  expect(overlap(sets.talent, sets.trait), "talent∩trait").toEqual([]);
});

test("ids are unique within each catalog", () => {
  for (const [name, ids] of [["skill", skillIds], ["talent", talentIds], ["trait", traitIds]] as const) {
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes, `duplicate ${name} ids`).toEqual([]);
  }
});
