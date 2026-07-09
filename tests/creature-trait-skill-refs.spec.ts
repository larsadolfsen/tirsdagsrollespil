import { expect, test } from "@playwright/test";
import { creatureTraitDefinitions } from "../src/data/rules/wfrp4e/creatureTraits";
import { isResolvableSkillRef } from "../src/lib/skillRefs";

// Plan A07: every skillTestBonus modifier's `skill` must resolve to a real
// skill/specialisation, matching how talent skill refs and NPC trait skill
// refs already validate. `"all"` is a legitimate wildcard (e.g. Distracting:
// "-20 to Tests", not tied to one skill), so it is exempt rather than treated
// as an unresolved ref.
test("every creature trait skillTestBonus modifier resolves to a known skill", () => {
  const unresolved: string[] = [];

  for (const trait of creatureTraitDefinitions) {
    for (const modifier of trait.modifiers) {
      if (modifier.type !== "skillTestBonus" || !modifier.skill || modifier.skill === "all") {
        continue;
      }
      if (!isResolvableSkillRef(modifier.skill)) {
        unresolved.push(`${trait.id}: ${modifier.skill}`);
      }
    }
  }

  expect(unresolved, `Unresolved creature trait skill refs: ${unresolved.join("; ")}`).toEqual([]);
});
