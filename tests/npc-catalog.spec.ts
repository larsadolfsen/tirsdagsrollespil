import { expect, test } from "@playwright/test";
import {
  adversaryTemplates,
  expandNpcTemplate,
  npcTemplates,
} from "../src/data/npcs";

test("named NPC records are individual characters", () => {
  const bundledNamedNpcs = npcTemplates
    .filter((npc) => npc.isNpc)
    .filter((npc) => (npc.count ?? 1) > 1 || Boolean(npc.members?.length))
    .map((npc) => npc.name);

  expect(bundledNamedNpcs).toEqual([]);
});

test("multi-person adversary records expand into individual records", () => {
  const groupedAdversaries = adversaryTemplates.filter((adversary) => (adversary.count ?? 1) > 1);

  for (const adversary of groupedAdversaries) {
    const individuals = expandNpcTemplate(adversary);
    expect(individuals).toHaveLength(adversary.members?.length ? adversary.count! : 1);

    for (const individual of individuals) {
      expect(individual.count, `${individual.name} must be added individually`).toBeUndefined();
      expect(individual.members, `${individual.name} must not remain a bundle`).toBeUndefined();
    }
  }
});

test("generic adversary records use reusable role names", () => {
  const removedScenarioSpecificNames = ["Gravin's Servants", "Cleaners", "Menials"];
  const adversaryNames = adversaryTemplates.map((adversary) => adversary.name);

  expect(adversaryNames).not.toEqual(expect.arrayContaining(removedScenarioSpecificNames));
  expect(adversaryNames).toEqual(expect.arrayContaining(["Handmaid", "Servant"]));
});

test("adversary records contain only one role type", () => {
  const mergedRolePattern = /(?:\s+(?:and|or)\s+|,|\/|&)/i;
  const mergedAdversaries = adversaryTemplates
    .filter((adversary) => mergedRolePattern.test(adversary.name))
    .map((adversary) => adversary.name);

  expect(mergedAdversaries).toEqual([]);
});
