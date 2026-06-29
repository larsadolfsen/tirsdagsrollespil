import { expect, test } from "@playwright/test";
import {
  adversaryTemplates,
  expandNpcTemplate,
  npcTemplates,
} from "../src/data/npcs";

test("multi-person NPC records expand into individual NPCs", () => {
  const groupedNpcs = npcTemplates.filter((npc) => (npc.count ?? 1) > 1);

  for (const npc of groupedNpcs) {
    expect(npc.members, `${npc.name} must list every individual NPC`).toHaveLength(npc.count!);

    const individuals = expandNpcTemplate(npc);
    expect(individuals).toHaveLength(npc.count!);
    expect(new Set(individuals.map((individual) => individual.id)).size).toBe(individuals.length);

    for (const individual of individuals) {
      expect(individual.count, `${individual.name} must be added individually`).toBeUndefined();
      expect(individual.members, `${individual.name} must not remain a bundle`).toBeUndefined();
    }
  }
});

test("adversary records contain only one role type", () => {
  const mergedRolePattern = /(?:\s+(?:and|or)\s+|,|\/|&)/i;
  const mergedAdversaries = adversaryTemplates
    .filter((adversary) => mergedRolePattern.test(adversary.name))
    .map((adversary) => adversary.name);

  expect(mergedAdversaries).toEqual([]);
});
