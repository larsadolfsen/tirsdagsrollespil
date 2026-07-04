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

// Plan 07 coverage ratchet: any talent with a `tests` string should carry a
// structured skill ref, unless it is one of the genuinely skill-less talents
// (characteristic boosts, psychology, movement, spell flavour) allow-listed here.
// A new tests-bearing talent then can't silently skip its link.
const SKILL_LESS_TESTS_OK = new Set<string>([
  "talent_second_sight",
  "talent_mimic",
  "talent_embezzle",
  "talent_super_numerate",
  "talent_suffuse_with",
  "talent_flagellant",
  "talent_jump_up",
  "talent_strong_back",
  "talent_stout_hearted",
  "talent_sturdy",
  "talent_combat_reflexes",
  "talent_iron_will",
  "talent_nimble_fingered",
  "talent_relentless",
  "talent_savvy",
  "talent_sprinter",
  "talent_very_resilient",
]);

test("every talent that names a Test carries a skill ref (or is allow-listed)", () => {
  const hasRef = (talent: (typeof talentDefinitions)[number]) =>
    (talent.relatedSkillIds?.length ?? 0) > 0 ||
    (talent.grantsSkillIds?.length ?? 0) > 0 ||
    (talent.effects ?? []).some((effect) => "skillIds" in effect && (effect.skillIds?.length ?? 0) > 0);

  const missing = talentDefinitions
    .filter((talent) => talent.tests && !SKILL_LESS_TESTS_OK.has(talent.id) && !hasRef(talent))
    .map((talent) => talent.id);

  expect(missing, `tests-bearing talents missing a skill ref: ${missing.join(", ")}`).toEqual([]);
});
