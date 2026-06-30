import { expect, test } from "@playwright/test";
import { characterRecords } from "../src/data/characters";

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
