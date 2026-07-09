import { expect, test } from "@playwright/test";
import { buildTalentRollContext } from "../src/features/dice/rollContext";
import { getTalentSlBonusSources, resolveTalentEffects } from "../src/lib/talentEffects";
import { talentDefinitions } from "../src/data/rules/wfrp4e/talents";
import type { ResolvedCharacterTalent } from "../src/data/characters/resolved";

// A08 fix (whole-branch-review finding): the roller's talent-effect matching context
// never populated `characteristics`, so characteristic-gated roll-math effects (e.g.
// Strong Back's +SL to Opposed Strength Tests) were dead in the live app. This spec
// pins the extracted, pure context builder and proves the seam end-to-end.

test("buildTalentRollContext: raw characteristic roll sets characteristics, not skillIds", () => {
  const context = buildTalentRollContext({ key: "S", label: "Strength" }, "dramatic");
  expect(context.characteristics).toEqual(["S"]);
  expect(context.skillIds).toBeUndefined();
  expect(context.testName).toBe("Strength");
  expect(context.testType).toBe("dramatic");
});

test("buildTalentRollContext: skill roll sets skillIds, not characteristics", () => {
  const context = buildTalentRollContext(
    { key: "S", label: "Charm", skillId: "skill_charm", specialisationId: undefined },
    "dramatic",
  );
  expect(context.skillIds).toEqual([{ skillId: "skill_charm", specialisationId: undefined }]);
  expect(context.characteristics).toBeUndefined();
});

test("buildTalentRollContext: corruption test uses 'Corruption Test' as testName", () => {
  const context = buildTalentRollContext({ key: "T", label: "Toughness" }, "corruption");
  expect(context.testName).toBe("Corruption Test");
  expect(context.characteristics).toEqual(["T"]);
});

test("A08 fix seam: a raw Strength roll now makes Strong Back's SL bonus fire (was dead before this fix)", () => {
  const strongBack = talentDefinitions.find((t) => t.id === "talent_strong_back");
  expect(strongBack).toBeTruthy();

  const talents: ResolvedCharacterTalent[] = [
    { id: "talent_strong_back", name: "Strong Back" } as ResolvedCharacterTalent,
  ];

  const context = buildTalentRollContext({ key: "S", label: "Strength" }, "dramatic");
  const resolved = resolveTalentEffects({ talents, talentDefinitions: [strongBack!], context });

  const slSources = getTalentSlBonusSources(resolved.effects);
  expect(slSources).toEqual([{ label: "Strong Back", value: 1 }]);

  // false-positive guard: a Toughness roll must not pick up Strong Back's Strength-gated bonus.
  const unrelatedContext = buildTalentRollContext({ key: "T", label: "Toughness" }, "dramatic");
  const missResolved = resolveTalentEffects({ talents, talentDefinitions: [strongBack!], context: unrelatedContext });
  expect(getTalentSlBonusSources(missResolved.effects)).toEqual([]);
});
