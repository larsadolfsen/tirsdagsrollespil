import { expect, test } from "@playwright/test";
import { talentDefinitions } from "../src/data/rules/wfrp4e/talents";
import { careerSteps } from "../src/data/rules/wfrp4e/careers/careerSteps";
import { characterRecords } from "../src/data/characters";

// Every talent a career step or character references must resolve against the
// talent catalog: either an exact id, or a grouped specialisation written as
// "<baseId>_<specialisation>" (e.g. "acute_sense_sight", "etiquette_nobles").
test("every referenced talent id resolves to a known talent", () => {
  const ids = new Set(talentDefinitions.map((talent) => talent.id));
  const idList = [...ids];

  // Referenced by a Core career table but with no Core talent entry — likely a
  // talent from a supplement not yet imported. Tracked in TODO.md.
  const PENDING_FROM_OTHER_BOOKS = new Set(["street_fighting"]);

  const resolves = (ref: string) =>
    ids.has(ref) ||
    PENDING_FROM_OTHER_BOOKS.has(ref) ||
    idList.some((id) => ref.startsWith(`${id}_`));

  const referenced = new Map<string, string>();
  for (const step of careerSteps) {
    for (const id of step.talentIds ?? []) {
      if (!referenced.has(id)) referenced.set(id, `career step "${step.name}"`);
    }
  }
  for (const character of characterRecords) {
    for (const talent of character.talents ?? []) {
      if (!referenced.has(talent.talentId)) referenced.set(talent.talentId, `character "${character.name}"`);
    }
  }

  const unresolved = [...referenced.entries()]
    .filter(([id]) => !resolves(id))
    .map(([id, where]) => `"${id}" (${where})`);

  expect(unresolved, `Unresolved talent ids: ${unresolved.join("; ")}`).toEqual([]);
});
