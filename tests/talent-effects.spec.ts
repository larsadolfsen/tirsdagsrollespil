import { expect, test } from "@playwright/test";
import type { TalentDefinition, TalentEffect } from "../src/types";
import type { ResolvedCharacterTalent } from "../src/data/characters/resolved";
import type { CreatureTraitModifier } from "../src/data/rules/wfrp4e/creatureTraits";
import {
  EFFECT_HANDLERS,
  formatTalentEffect,
  getTalentDamageBonus,
  getTalentEncumbranceBonus,
  getTalentSlBonus,
  getTalentSlBonusSources,
  mapCreatureTraitModifierToTalentEffect,
  resolveCreatureTraitEffects,
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

test("test_sl_bonus: without a structured ref, the effect never matches (Plan 13: no string fallback)", () => {
  const definition = def({
    id: "talent_no_ref",
    name: "No Ref",
    effects: [{ type: "test_sl_bonus", test: "Social Tests with cult members", valuePerLevel: 1 }],
  });
  const talents = [talentOf("No Ref", "talent_no_ref")];

  // Even an exact testName string match must NOT fire — `test` is display-only now.
  const stringMatch = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { testName: "Social Tests with cult members" },
  });
  expect(getTalentSlBonus(stringMatch.effects)).toBe(0);

  const withSkillRef = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_charm"] },
  });
  expect(getTalentSlBonus(withSkillRef.effects)).toBe(0);
});

test("talent_etiquette_cultists: test_sl_bonus routes via skill_charm ref (real data, Plan 13 backfill)", () => {
  const definition = def({
    id: "talent_etiquette_cultists",
    name: "Etiquette (Cultists)",
    effects: [{ type: "test_sl_bonus", test: "Social Tests with cult members", valuePerLevel: 1, skillIds: ["skill_charm"] }],
  });
  const talents = [talentOf("Etiquette (Cultists)", "talent_etiquette_cultists")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { skillIds: ["skill_charm"] },
  });
  expect(getTalentSlBonus(hit.effects)).toBe(1);

  // false-positive guard: matching testName string alone (no ref) must NOT fire.
  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { testName: "Social Tests with cult members", skillIds: ["skill_intimidate"] },
  });
  expect(getTalentSlBonus(miss.effects)).toBe(0);
});

test("test_sl_bonus: corruption routes via skill_endurance ref, not the testType/testName string", () => {
  const definition = def({
    id: "talent_resistance_corruption",
    name: "Resistance (Corruption)",
    effects: [{ type: "test_sl_bonus", test: "Endurance Tests to resist Corruption", valuePerLevel: 1, skillIds: ["skill_endurance"] }],
  });
  const talents = [talentOf("Resistance (Corruption)", "talent_resistance_corruption")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: {
      testName: "Corruption Test",
      testType: "corruption",
      skillIds: [{ skillId: "skill_endurance", specialisationId: undefined }],
    },
  });
  expect(getTalentSlBonus(hit.effects)).toBe(1);

  // false-positive guard: testType alone (no matching skill ref) must NOT fire —
  // proves the old `effectTest.includes("corruption")` special case is gone.
  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { testName: "Corruption Test", testType: "corruption" },
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

test("talent_warrior_born: attribute_bonus hits on characteristics WS, absent on BS", () => {
  const definition = def({
    id: "talent_warrior_born",
    name: "Warrior Born",
    effects: [{ type: "attribute_bonus", attribute: "weaponSkill", valuePerLevel: 5, condition: "starting_characteristic_only" }],
  });
  const talents = [talentOf("Warrior Born", "talent_warrior_born")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { conditionTags: ["starting_characteristic_only"], characteristics: ["WS"] },
  });
  expect(hit.effects).toHaveLength(1);
  expect(hit.effects[0].effect.type).toBe("attribute_bonus");

  // false-positive guard: a different characteristic must NOT trigger.
  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { conditionTags: ["starting_characteristic_only"], characteristics: ["BS"] },
  });
  expect(miss.effects).toHaveLength(0);
});

test("talent_suave: attribute_bonus hits on characteristics Fel, absent on WP", () => {
  const definition = def({
    id: "talent_suave",
    name: "Suave",
    effects: [{ type: "attribute_bonus", attribute: "fellowship", valuePerLevel: 5, condition: "starting_characteristic_only" }],
  });
  const talents = [talentOf("Suave", "talent_suave")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { conditionTags: ["starting_characteristic_only"], characteristics: ["Fel"] },
  });
  expect(hit.effects).toHaveLength(1);
  expect(hit.effects[0].effect.type).toBe("attribute_bonus");

  // false-positive guard: a different characteristic must NOT trigger.
  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { conditionTags: ["starting_characteristic_only"], characteristics: ["WP"] },
  });
  expect(miss.effects).toHaveLength(0);
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

test("talent_strike_mighty_blow: damage_bonus hits on melee_attacks, absent on ranged_attacks", () => {
  const definition = def({
    id: "talent_strike_mighty_blow",
    name: "Strike Mighty Blow",
    effects: [{ type: "damage_bonus", valuePerLevel: 1, condition: "melee_attacks" }],
  });
  const talents = [talentOf("Strike Mighty Blow", "talent_strike_mighty_blow")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { conditionTags: ["melee_attacks"] },
  });
  expect(getTalentDamageBonus(hit.effects)).toBe(1);

  // false-positive guard: an unrelated condition tag must NOT trigger.
  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { conditionTags: ["ranged_attacks"] },
  });
  expect(getTalentDamageBonus(miss.effects)).toBe(0);
});

test("talent_berserk_charge: damage_bonus hits on when_charging_in_melee, absent on melee_attacks alone", () => {
  const definition = def({
    id: "talent_berserk_charge",
    name: "Berserk Charge",
    effects: [{ type: "damage_bonus", valuePerLevel: 1, condition: "when_charging_in_melee" }],
  });
  const talents = [talentOf("Berserk Charge", "talent_berserk_charge")];

  const hit = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { conditionTags: ["when_charging_in_melee"] },
  });
  expect(getTalentDamageBonus(hit.effects)).toBe(1);

  // proves the two melee-damage condition tags are genuinely distinct, not interchangeable.
  const miss = resolveTalentEffects({
    talents,
    talentDefinitions: [definition],
    context: { conditionTags: ["melee_attacks"] },
  });
  expect(getTalentDamageBonus(miss.effects)).toBe(0);
});

test("talent_strong_back: encumbrance_bonus contributes valuePerLevel unconditionally", () => {
  const definition = def({
    id: "talent_strong_back",
    name: "Strong Back",
    effects: [
      { type: "test_sl_bonus", test: "Strength (Opposed)", valuePerLevel: 1, characteristics: ["S"] },
      { type: "encumbrance_bonus", valuePerLevel: 1 },
    ],
  });
  const talents = [
    talentOf("Strong Back", "talent_strong_back"),
    talentOf("Strong Back", "talent_strong_back"),
  ];

  const resolved = resolveTalentEffects({ talents, talentDefinitions: [definition] });
  expect(getTalentEncumbranceBonus(resolved.effects)).toBe(2); // 1 per level * 2 levels
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

test("Plan 09: useDiceRoller's context shape (object-array skillIds) reaches talent_menacing on the matching skill roll, absent on an unrelated one", () => {
  // Plan 06 Batch 1's real talent definition (unchanged from talent_menacing above), reused here to
  // prove the *context shape* useDiceRoller.ts's handleRoll now builds — not the simpler string-array
  // form used elsewhere in this file — still id-matches correctly end-to-end.
  const definition = def({
    id: "talent_menacing",
    name: "Menacing",
    effects: [{ type: "test_sl_bonus", test: "Intimidate Tests", valuePerLevel: 1, skillIds: ["skill_intimidate"] }],
  });
  const talents = [talentOf("Menacing", "talent_menacing")];

  // Simulates a roll on a ResolvedCharacterSkill for Intimidate: useDiceRoller.ts's handleRoll builds
  // `skillIds: [{ skillId: char.skillId, specialisationId: char.specialisationId }]` when char.skillId
  // is present (see src/features/dice/useDiceRoller.ts, resolveTalentEffects context build).
  const matchingRollContext = {
    testName: "Intimidate",
    testType: "dramatic" as const,
    skillIds: [{ skillId: "skill_intimidate", specialisationId: undefined }],
  };
  const hit = resolveTalentEffects({ talents, talentDefinitions: [definition], context: matchingRollContext });
  expect(getTalentSlBonus(hit.effects)).toBe(1);
  expect(getTalentSlBonusSources(hit.effects)).toEqual([{ label: "Menacing", value: 1 }]);

  // Same context shape but for an unrelated skill roll (e.g. rolling Charm instead of Intimidate):
  // the false-positive guard this plan exists to close — Menacing must NOT fire here.
  const unrelatedRollContext = {
    testName: "Charm",
    testType: "dramatic" as const,
    skillIds: [{ skillId: "skill_charm", specialisationId: undefined }],
  };
  const miss = resolveTalentEffects({ talents, talentDefinitions: [definition], context: unrelatedRollContext });
  expect(getTalentSlBonus(miss.effects)).toBe(0);
  expect(getTalentSlBonusSources(miss.effects)).toEqual([]);

  // A skill-less roll (char.skillId absent, e.g. a pure characteristic roll): useDiceRoller.ts omits
  // `skillIds` entirely in this case, so this must behave exactly like the pre-Plan-09 code path.
  const skillLessRollContext = { testName: "Charisma", testType: "dramatic" as const };
  const skillLess = resolveTalentEffects({ talents, talentDefinitions: [definition], context: skillLessRollContext });
  expect(getTalentSlBonus(skillLess.effects)).toBe(0);
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

// Plan A06: bestiary trait modifiers map into the SAME registry/resolver as
// talent effects, rather than a parallel trait-only path.

test("mapCreatureTraitModifierToTalentEffect: numeric skillTestBonus maps to test_sl_bonus with skillIds + condition", () => {
  const modifier: CreatureTraitModifier = { type: "skillTestBonus", skill: "skill_melee", amount: -10 };
  const effect = mapCreatureTraitModifierToTalentEffect(modifier, "using:swarm");
  expect(effect).toEqual({
    type: "test_sl_bonus",
    test: "skill_melee",
    valuePerLevel: -10,
    skillIds: ["skill_melee"],
    condition: "using:swarm",
  });
});

test("mapCreatureTraitModifierToTalentEffect: numeric characteristic maps to attribute_bonus", () => {
  const modifier: CreatureTraitModifier = { type: "characteristic", characteristic: "WS", amount: 10 };
  const effect = mapCreatureTraitModifierToTalentEffect(modifier);
  expect(effect).toEqual({ type: "attribute_bonus", attribute: "WS", valuePerLevel: 10, condition: undefined });
});

test("mapCreatureTraitModifierToTalentEffect: rank-formula amount ('agilityBonus') and 'all' targets are intentionally unmapped", () => {
  const formulaBased: CreatureTraitModifier = { type: "skillTestBonus", skill: "skill_stealth", amount: "agilityBonus" };
  const allTargeted: CreatureTraitModifier = { type: "skillTestBonus", skill: "all", amount: -20 };
  const unrelatedType: CreatureTraitModifier = { type: "combatFlag", target: "hatred" };

  expect(mapCreatureTraitModifierToTalentEffect(formulaBased)).toBeUndefined();
  expect(mapCreatureTraitModifierToTalentEffect(allTargeted)).toBeUndefined();
  expect(mapCreatureTraitModifierToTalentEffect(unrelatedType)).toBeUndefined();
});

test("resolveCreatureTraitEffects: trait skillTestBonus applies through the shared resolver on the matching skill only", () => {
  // Mirrors trait_infestation's real modifier shape (creatureTraits.ts): a numeric,
  // single-skill penalty against opponents attacking in melee.
  const resolved = resolveCreatureTraitEffects({
    traits: [
      {
        id: "trait_infestation",
        name: "Infestation",
        modifiers: [{ type: "skillTestBonus", skill: "skill_melee", amount: -10 }],
      },
    ],
    context: { skillIds: ["skill_melee"] },
  });
  expect(getTalentSlBonus(resolved.effects)).toBe(-10);

  // false-positive guard: an unrelated skill roll must not pick up the trait bonus.
  const miss = resolveCreatureTraitEffects({
    traits: [
      {
        id: "trait_infestation",
        name: "Infestation",
        modifiers: [{ type: "skillTestBonus", skill: "skill_melee", amount: -10 }],
      },
    ],
    context: { skillIds: ["skill_dodge"] },
  });
  expect(getTalentSlBonus(miss.effects)).toBe(0);
});

test("resolveCreatureTraitEffects: Hatred (Orcs)-style trait effect gates on its conditionTag, not on an unrelated target (Elves)", () => {
  // Not real creatureTraits.ts data (trait_hatred has no characteristic modifier
  // in the catalog) — a synthetic trait, same pattern as the talent_hatred_orcs
  // test above, proving trait conditionTags gate through the identical
  // conditionMatches() path talent effects use. "using:orcs" is the trait-side
  // conditionTag convention from adversaryRefs.parseTraitEntry (Plan A01).
  const hatredOfOrcs: CreatureTraitModifier = { type: "characteristic", characteristic: "WS", amount: 10 };

  const hit = resolveCreatureTraitEffects({
    traits: [{ id: "trait_hatred", name: "Hatred (Orcs)", modifiers: [hatredOfOrcs], condition: "using:orcs" }],
    context: { conditionTags: ["using:orcs"], characteristics: ["WS"] },
  });
  expect(hit.effects).toHaveLength(1);
  expect(hit.effects[0].effect.type).toBe("attribute_bonus");

  // The same trait, encountering Elves instead of Orcs: must NOT contribute.
  const miss = resolveCreatureTraitEffects({
    traits: [{ id: "trait_hatred", name: "Hatred (Orcs)", modifiers: [hatredOfOrcs], condition: "using:orcs" }],
    context: { conditionTags: ["using:elves"], characteristics: ["WS"] },
  });
  expect(miss.effects).toHaveLength(0);
});
