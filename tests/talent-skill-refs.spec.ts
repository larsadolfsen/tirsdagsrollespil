import { expect, test } from "@playwright/test";
import { talentDefinitions } from "../src/data/rules/wfrp4e/talents";
import { isResolvableSkillRef } from "../src/lib/skillRefs";

// Plan 06/07: every structured skill ref on a talent (effect skillIds, plus
// relatedSkillIds / grantsSkillIds on the definition) must resolve to a real
// skill or specialisation. Guards against id drift as refs are backfilled.
test("every talent skill ref resolves to a known skill", () => {
  const unresolved: string[] = [];
  for (const talent of talentDefinitions) {
    const refs = [
      ...(talent.relatedSkillIds ?? []),
      ...(talent.grantsSkillIds ?? []),
      ...(talent.effects ?? []).flatMap((effect) =>
        "skillIds" in effect ? (effect.skillIds ?? []) : [],
      ),
    ];
    for (const ref of refs) {
      if (!isResolvableSkillRef(ref)) {
        unresolved.push(`${talent.id}: ${ref}`);
      }
    }
  }

  expect(unresolved, `Unresolved talent skill refs: ${unresolved.join("; ")}`).toEqual([]);
});
