import type { ResolvedCharacterTalent } from "../data/characters/resolved";
import type { TalentDefinition, TalentEffect } from "../types";
import type { RollTestType } from "../types/dice";

export interface ActiveTalentEffect {
  talentId: string;
  talentName: string;
  level: number;
  effect: TalentEffect;
}

export interface TalentEffectContext {
  testName?: string;
  actionId?: string;
  conditionTags?: string[];
  testType?: RollTestType;
}

export interface TalentSlBonusSource {
  label: string;
  value: number;
}

const normalize = (value?: string) => value?.trim().toLowerCase();

const conditionMatches = (effectCondition: string | undefined, conditionTags: string[] = []) => {
  if (!effectCondition) return true;

  const normalizedCondition = normalize(effectCondition);
  return conditionTags.some((tag) => normalize(tag) === normalizedCondition);
};

const testMatches = (
  effectTest: string | undefined,
  testName: string | undefined,
  testType?: RollTestType,
) => {
  if (!effectTest || !testName) return true;

  const normalizedEffectTest = normalize(effectTest);
  const normalizedTestName = normalize(testName);

  if (!normalizedEffectTest || !normalizedTestName) return false;

  if (normalizedEffectTest.includes("corruption")) {
    return testType === "corruption";
  }

  return (
    normalizedEffectTest.includes(normalizedTestName) ||
    normalizedTestName.includes(normalizedEffectTest)
  );
};

export function getTalentLevel(talents: Array<{ id?: string; name: string }>, definition: TalentDefinition) {
  return talents.filter((talent) => talent.id === definition.id || talent.name === definition.name).length;
}

export function getApplicableTalentEffects(params: {
  talents: ResolvedCharacterTalent[];
  talentDefinitions: TalentDefinition[];
  context?: TalentEffectContext;
}): ActiveTalentEffect[] {
  const context = params.context ?? {};
  const conditionTags = context.conditionTags ?? [];

  return params.talentDefinitions.flatMap((definition) => {
    const level = getTalentLevel(params.talents, definition);

    if (level === 0) return [];

    return (definition.effects ?? [])
      .filter((effect) => {
        if (effect.type === "test_sl_bonus" || effect.type === "test_reverse_failed_roll") {
          return testMatches(effect.test, context.testName, context.testType) && conditionMatches(effect.condition, conditionTags);
        }

        if (effect.type === "action_unlock") {
          return (!context.actionId || effect.action === context.actionId) && conditionMatches(effect.condition, conditionTags);
        }

        if ("condition" in effect) {
          return conditionMatches(effect.condition, conditionTags);
        }

        return true;
      })
      .map((effect) => ({
        talentId: definition.id,
        talentName: definition.name,
        level,
        effect,
      }));
  });
}

export function getTalentSlBonusSources(effects: ActiveTalentEffect[]): TalentSlBonusSource[] {
  return effects
    .filter((entry): entry is ActiveTalentEffect & { effect: Extract<TalentEffect, { type: "test_sl_bonus" }> } =>
      entry.effect.type === "test_sl_bonus",
    )
    .map((entry) => ({
      label: entry.talentName,
      value: entry.effect.valuePerLevel * entry.level,
    }));
}

export function getTalentSlBonus(effects: ActiveTalentEffect[]) {
  return getTalentSlBonusSources(effects).reduce((total, source) => total + source.value, 0);
}

export function getTalentDamageBonus(effects: ActiveTalentEffect[]) {
  return effects
    .filter((entry): entry is ActiveTalentEffect & { effect: Extract<TalentEffect, { type: "damage_bonus" }> } =>
      entry.effect.type === "damage_bonus",
    )
    .reduce((total, entry) => total + entry.effect.valuePerLevel * entry.level, 0);
}

export function formatTalentEffect(effect: TalentEffect) {
  switch (effect.type) {
    case "test_sl_bonus":
      return `+${effect.valuePerLevel} SL per level to ${effect.test}`;
    case "test_reverse_failed_roll":
      return `May reverse a failed ${effect.test} roll${effect.condition ? ` (${effect.condition})` : ""}`;
    case "attribute_bonus":
      return `+${effect.valuePerLevel} ${effect.attribute} per level${effect.condition ? ` (${effect.condition})` : ""}`;
    case "damage_bonus":
      return `+${effect.valuePerLevel} Damage per level${effect.condition ? ` (${effect.condition})` : ""}`;
    case "ignore_penalty":
      return `Ignore ${effect.penalty}${effect.condition ? ` (${effect.condition})` : ""}`;
    case "action_unlock":
      return `Unlock action: ${effect.action}${effect.condition ? ` (${effect.condition})` : ""}`;
    case "special_rule":
      return effect.rule;
    default:
      return "Talent rule";
  }
}
