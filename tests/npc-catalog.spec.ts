import { expect, test } from "@playwright/test";
import {
  expandNpcTemplate,
  genericTemplates,
  npcTemplates,
} from "../src/data/npcs";
import { roughNightAtTheThreeFeathersScenario } from "../src/data/scenarios";

test("named NPC records are individual characters", () => {
  const bundledNamedNpcs = npcTemplates
    .filter((npc) => npc.isNpc)
    .filter((npc) => (npc.count ?? 1) > 1 || Boolean(npc.members?.length))
    .map((npc) => npc.name);

  expect(bundledNamedNpcs).toEqual([]);
});

test("generic records are reusable single-role templates", () => {
  const groupedGenerics = genericTemplates.filter((generic) => (generic.count ?? 1) > 1);

  expect(groupedGenerics).toEqual([]);
  for (const generic of groupedGenerics) {
    const individuals = expandNpcTemplate(generic);
    expect(individuals).toHaveLength(generic.members?.length ? generic.count! : 1);

    for (const individual of individuals) {
      expect(individual.count, `${individual.name} must be added individually`).toBeUndefined();
      expect(individual.members, `${individual.name} must not remain a bundle`).toBeUndefined();
    }
  }
});

test("generic records use reusable role names", () => {
  const removedScenarioSpecificNames = ["Gravin's Servants", "Cleaners", "Menials"];
  const genericNames = genericTemplates.map((generic) => generic.name);

  expect(genericNames).not.toEqual(expect.arrayContaining(removedScenarioSpecificNames));
  expect(genericNames).toEqual(expect.arrayContaining(["Handmaid", "Servant"]));
});

test("generic records contain only one role type", () => {
  const mergedRolePattern = /(?:\s+(?:and|or)\s+|,|\/|&)/i;
  const mergedGenerics = genericTemplates
    .filter((generic) => mergedRolePattern.test(generic.name))
    .map((generic) => generic.name);

  expect(mergedGenerics).toEqual([]);
});

test("scenario generic character instances require names and inherit templates", () => {
  const genericInstances = roughNightAtTheThreeFeathersScenario.characters
    .filter((character) => character.source === "generic");
  const genericIds = new Set(genericTemplates.map((template) => template.id));

  expect(genericInstances.length).toBeGreaterThan(0);
  for (const instance of genericInstances) {
    expect(instance.name.trim()).not.toBe("");
    expect(genericIds.has(instance.templateId), `${instance.name} must reference a Generic template`).toBe(true);
  }
});

test("repeated Three Feathers characters are named Generic instances", () => {
  const migratedNames = [
    "Gunni",
    "Bart",
    "Hans-Frederick",
    "Mho",
    "Larz",
    "'Curls'",
    "Allrelia",
    "Elphoise",
    "Helga",
  ];
  const npcNames = npcTemplates.map((npc) => npc.name);
  const genericInstanceNames = roughNightAtTheThreeFeathersScenario.characters
    .filter((character) => character.source === "generic")
    .map((character) => character.name);

  expect(npcNames).not.toEqual(expect.arrayContaining(migratedNames));
  expect(genericInstanceNames).toEqual(expect.arrayContaining(migratedNames));
});

test("scenario encounters reference named Generic instances", () => {
  const genericEncounterGroups = roughNightAtTheThreeFeathersScenario.scenes
    .flatMap((scene) => scene.components)
    .filter((component) => component.type === "encounter")
    .flatMap((component) => component.encounterData.monsterGroups)
    .filter((group) => group.source === "generic");

  expect(genericEncounterGroups.length).toBeGreaterThan(0);
  for (const group of genericEncounterGroups) {
    expect(group.scenarioCharacterId).toBeTruthy();
    expect(group.name.trim()).not.toBe("");
  }
});
