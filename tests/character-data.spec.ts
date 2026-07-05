import { expect, test } from "@playwright/test";
import { characterRecords } from "../src/data/characters";
import { loadResolvedCharacter } from "../src/data/repository";

// Every player character must fully resolve: each skill/specialisation id it lists
// has to exist in the (prefixed) rules catalog. A single unresolved ref throws in
// resolveCharacterRecord, and with no error boundary that blanks the whole app.
test("every player character resolves without unknown skill or specialisation refs", () => {
  const failures: string[] = [];

  for (const character of characterRecords) {
    try {
      loadResolvedCharacter(character.id);
    } catch (error) {
      failures.push(`${character.id}: ${(error as Error).message}`);
    }
  }

  expect(failures, `Characters that failed to resolve: ${failures.join("; ")}`).toEqual([]);
});

// A character must never list the same talent twice — a duplicate inflates the
// talent's effective "times taken" and corrupts XP/derived calculations.
test("player characters have no duplicate talents", () => {
  const duplicates: string[] = [];

  for (const character of characterRecords) {
    const seen = new Set<string>();
    for (const talent of character.talents ?? []) {
      if (seen.has(talent.talentId)) {
        duplicates.push(`${character.name}: ${talent.talentId}`);
      }
      seen.add(talent.talentId);
    }
  }

  expect(duplicates, `Duplicate character talents: ${duplicates.join("; ")}`).toEqual([]);
});
