import { expect, test } from "@playwright/test";
import { skillDefinitions, skillSpecialisationDefinitions } from "../src/data/rules/wfrp4e/skills";

const byId = (id: string) => skillDefinitions.find((skill) => skill.id === id);

// WFRP 4e Core: Art, Ride and Sail are Grouped Skills (they take specialisations).
test("Art, Ride and Sail are grouped", () => {
  for (const id of ["art", "ride", "sail"]) {
    expect(byId(id)?.grouped, `${id} should be grouped`).toBe(true);
  }
});

// WFRP 4e Core lists nine Channelling winds, including Dhar.
test("Channelling includes the Dhar specialisation", () => {
  const channellingSpecs = skillSpecialisationDefinitions
    .filter((spec) => spec.skillId === "channelling")
    .map((spec) => spec.name);
  expect(channellingSpecs).toContain("Dhar");
});
