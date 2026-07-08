import { expect, test } from "@playwright/test";
import type { TalentDefinition, TalentEffect } from "../src/types";
import type { ResolvedCharacterTalent } from "../src/data/characters/resolved";
import {
  EFFECT_HANDLERS,
  formatTalentEffect,
  getTalentDamageBonus,
  getTalentEncumbranceBonus,
  getTalentSlBonus,
  resolveTalentEffects,
} from "../src/lib/talentEffects";

// Plan 02b: the effect registry + single resolver. Each handler must match the
// right context, stay ABSENT on an unrelated context (false-positive guard),
// contribute the expected value at a given level, and format for display.

const talentOf = (name: string, id: string): ResolvedCharacterTalent =>
  ({ id, name } as ResolvedCharacterTalent);

const def = (partial: Partial<TalentDefinition> & Pick<TalentDefinition, "id" | "name" | "effects">): TalentDefinition =>
  ({ max: "1", ...partial } as TalentDefinition);

test("registry has exactly one handler per effect type", () => {
  const types: TalentEffect["type"][] = [
    "test_sl_bonus",
    "test_reverse_failed_roll",
    "attribute_bonus",
    "damage_bonus",
    "encumbrance_bonus",
    "ignore_penalty",
    "action_unlock",
    "special_rule",
  ];
  for (const type of types) {
    expect(EFFECT_HANDLERS[type], `missing handler for ${type}`).toBeTruthy();
    expect(EFFECT_HANDLERS[type].type).toBe(type);
  }
});

test("test_sl_bonus: id-first match, contributes valuePerLevel*level, formats", () => {
  const definition = def({
    id: "talent_marksman",
    name: "Marksman",
    effects: [{ type: "test_sl_bonus", test: "Charm Tests", valuePerLevel: 1, skillIds: ["skill_charm"] }],
  });
  const talents = [talentOf("Marksman", "talent_marksman"), talentOf("Marksman", "talent_marksman")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_charm"] },
  });
  expect(getTalentSlBonus(hit.effects)).toBe(2); // 1 per level * 2 levels

  // false-positive guard: an unrelated skill must NOT trigger the id-first effect.
  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_stealth"] },
  });
  expect(getTalentSlBonus(miss.effects)).toBe(0);

  expect(formatTalentEffect(definition.effects![0])).toContain("SL");
});

test("test_sl_bonus: string fallback when the effect carries no refs", () => {
  const definition = def({
    id: "talent_speaker",
    name: "Speaker",
    effects: [{ type: "test_sl_bonus", test: "Social Tests with cult members", valuePerLevel: 1 }],
  });
  const talents = [talentOf("Speaker", "talent_speaker")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { testName: "Social Tests" },
  });
  expect(getTalentSlBonus(hit.effects)).toBe(1);

  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { testName: "Melee" },
  });
  expect(getTalentSlBonus(miss.effects)).toBe(0);
});

test("test_sl_bonus: corruption routes via characteristics/testType", () => {
  const definition = def({
    id: "talent_pure_soul",
    name: "Pure Soul",
    effects: [{ type: "test_sl_bonus", test: "Endurance Tests to resist Corruption", valuePerLevel: 1 }],
  });
  const talents = [talentOf("Pure Soul", "talent_pure_soul")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { testName: "Corruption Test", testType: "corruption" },
  });
  expect(getTalentSlBonus(hit.effects)).toBe(1);

  // false-positive guard: a non-corruption test that shares no meaning must not fire.
  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { testName: "Melee", testType: "dramatic" },
  });
  expect(getTalentSlBonus(miss.effects)).toBe(0);
});

test("test_reverse_failed_roll: matches by characteristic ref, absent otherwise, formats", () => {
  const effect = { type: "test_reverse_failed_roll" as const, test: "Cool", characteristics: ["WP" as const] };
  const definition = def({ id: "talent_resolute", name: "Resolute", effects: [effect] });
  const talents = [talentOf("Resolute", "talent_resolute")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { characteristics: ["WP"] },
  });
  expect(hit.effects.some((e) => e.effect.type === "test_reverse_failed_roll")).toBe(true);

  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { characteristics: ["Ag"] },
  });
  expect(miss.effects.some((e) => e.effect.type === "test_reverse_failed_roll")).toBe(false);

  expect(formatTalentEffect(effect)).toContain("reverse");
});

test("attribute_bonus: format renders the characteristic and value", () => {
  const effect = { type: "attribute_bonus" as const, attribute: "willpower", valuePerLevel: 5 };
  expect(formatTalentEffect(effect)).toContain("willpower");
  expect(formatTalentEffect(effect)).toContain("5");
});

test("damage_bonus: contributes valuePerLevel*level and formats", () => {
  const definition = def({
    id: "talent_strike_mighty",
    name: "Strike Mighty Blow",
    effects: [{ type: "damage_bonus", valuePerLevel: 1 }],
  });
  const talents = [
    talentOf("Strike Mighty Blow", "talent_strike_mighty"),
    talentOf("Strike Mighty Blow", "talent_strike_mighty"),
  ];

  const resolved = resolveTalentEffects({ talents, talentDefinitions: [definition] });
  expect(getTalentDamageBonus(resolved.effects)).toBe(2);
  expect(formatTalentEffect(definition.effects![0])).toContain("Damage");
});

test("encumbrance_bonus: contributes valuePerLevel*level and formats", () => {
  const definition = def({
    id: "talent_strong_back",
    name: "Strong Back",
    effects: [{ type: "encumbrance_bonus", valuePerLevel: 1 }],
  });
  const talents = [talentOf("Strong Back", "talent_strong_back")];

  const resolved = resolveTalentEffects({ talents, talentDefinitions: [definition] });
  expect(getTalentEncumbranceBonus(resolved.effects)).toBe(1);
  expect(formatTalentEffect(definition.effects![0])).toContain("Encumbrance");
});

test("action_unlock: matches its action, absent for another action, formats", () => {
  const effect = { type: "action_unlock" as const, action: "shield_bash" };
  const definition = def({ id: "talent_shieldsman", name: "Shieldsman", effects: [effect] });
  const talents = [talentOf("Shieldsman", "talent_shieldsman")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { actionId: "shield_bash" },
  });
  expect(hit.effects.some((e) => e.effect.type === "action_unlock")).toBe(true);

  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { actionId: "disarm" },
  });
  expect(miss.effects.some((e) => e.effect.type === "action_unlock")).toBe(false);

  expect(formatTalentEffect(effect)).toContain("shield_bash");
});

test("ignore_penalty & special_rule: present and format", () => {
  const ignore = { type: "ignore_penalty" as const, penalty: "outnumbered" };
  const special = { type: "special_rule" as const, rule: "Never suffers fear." };
  expect(formatTalentEffect(ignore)).toContain("outnumbered");
  expect(formatTalentEffect(special)).toBe("Never suffers fear.");

  const definition = def({
    id: "talent_fearless",
    name: "Fearless",
    effects: [ignore, special],
  });
  const talents = [talentOf("Fearless", "talent_fearless")];
  const resolved = resolveTalentEffects({ talents, talentDefinitions: [definition] });
  expect(resolved.effects).toHaveLength(2);
});

test("talent_menacing: test_sl_bonus hits on skill_intimidate, absent on skill_charm", () => {
  const definition = def({
    id: "talent_menacing",
    name: "Menacing",
    effects: [{ type: "test_sl_bonus", test: "Intimidate Tests", valuePerLevel: 1, skillIds: ["skill_intimidate"] }],
  });
  const talents = [talentOf("Menacing", "talent_menacing")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_intimidate"] },
  });
  expect(getTalentSlBonus(hit.effects)).toBe(1);

  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_charm"] },
  });
  expect(getTalentSlBonus(miss.effects)).toBe(0);
});

test("talent_master_orator: test_sl_bonus hits on skill_charm, absent on skill_intimidate", () => {
  const definition = def({
    id: "talent_master_orator",
    name: "Master Orator",
    effects: [{ type: "test_sl_bonus", test: "Charm when speaking publicly", valuePerLevel: 1, skillIds: ["skill_charm"] }],
  });
  const talents = [talentOf("Master Orator", "talent_master_orator")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_charm"] },
  });
  expect(getTalentSlBonus(hit.effects)).toBe(1);

  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_intimidate"] },
  });
  expect(getTalentSlBonus(miss.effects)).toBe(0);
});

test("talent_strong_legs: test_sl_bonus hits on skill_athletics, absent on unrelated skill", () => {
  const definition = def({
    id: "talent_strong_legs",
    name: "Strong Legs",
    effects: [{ type: "test_sl_bonus", test: "Athletics (Leaping)", valuePerLevel: 1, skillIds: ["skill_athletics"] }],
  });
  const talents = [talentOf("Strong Legs", "talent_strong_legs")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_athletics"] },
  });
  expect(getTalentSlBonus(hit.effects)).toBe(1);

  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_stealth"] },
  });
  expect(getTalentSlBonus(miss.effects)).toBe(0);
});

test("talent_strong_back: test_sl_bonus hits on characteristics S, absent on T", () => {
  const definition = def({
    id: "talent_strong_back",
    name: "Strong Back",
    effects: [
      { type: "test_sl_bonus", test: "Strength (Opposed)", valuePerLevel: 1, characteristics: ["S"] },
      { type: "special_rule", rule: "Can bear more Encumbrance before being weighed down." },
    ],
  });
  const talents = [talentOf("Strong Back", "talent_strong_back")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { characteristics: ["S"] },
  });
  expect(getTalentSlBonus(hit.effects)).toBe(1);

  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { characteristics: ["T"] },
  });
  expect(getTalentSlBonus(miss.effects)).toBe(0);
});

test("talent_alley_cat: test_reverse_failed_roll hits on skill_stealth_urban, absent on skill_stealth_rural", () => {
  const definition = def({
    id: "talent_alley_cat",
    name: "Alley Cat",
    effects: [{ type: "test_reverse_failed_roll", test: "Stealth (Urban)", skillIds: ["skill_stealth_urban"] }],
  });
  const talents = [talentOf("Alley Cat", "talent_alley_cat")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: [{ skillId: "skill_stealth", specialisationId: "skill_stealth_urban" }] },
  });
  expect(hit.effects).toHaveLength(1);
  expect(hit.effects[0].effect.type).toBe("test_reverse_failed_roll");

  // near-miss guard: a different specialisation of the same base skill must NOT trigger.
  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: [{ skillId: "skill_stealth", specialisationId: "skill_stealth_rural" }] },
  });
  expect(miss.effects).toHaveLength(0);
});

test("talent_gregarious: test_reverse_failed_roll hits when condition tag + skill both match, absent without the tag", () => {
  const definition = def({
    id: "talent_gregarious",
    name: "Gregarious",
    effects: [
      {
        type: "test_reverse_failed_roll",
        test: "Gossip with travellers",
        skillIds: ["skill_gossip"],
        condition: "with_travellers_or_strangers",
      },
    ],
  });
  const talents = [talentOf("Gregarious", "talent_gregarious")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_gossip"], conditionTags: ["with_travellers_or_strangers"] },
  });
  expect(hit.effects).toHaveLength(1);
  expect(hit.effects[0].effect.type).toBe("test_reverse_failed_roll");

  // condition tag absent (e.g. gossiping with a local, not a traveller/stranger): must not trigger.
  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_gossip"], conditionTags: [] },
  });
  expect(miss.effects).toHaveLength(0);
});

test("condition tags gate an effect on/off", () => {
  const definition = def({
    id: "talent_hatred_orcs",
    name: "Hatred (Orcs)",
    effects: [{ type: "damage_bonus", valuePerLevel: 1, condition: "orcs" }],
  });
  const talents = [talentOf("Hatred (Orcs)", "talent_hatred_orcs")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { conditionTags: ["orcs"] },
  });
  expect(getTalentDamageBonus(hit.effects)).toBe(1);

  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { conditionTags: ["elves"] },
  });
  expect(getTalentDamageBonus(miss.effects)).toBe(0);
});
