// Talent effect registry + single resolver (Plan 02b).
// Exposes: EFFECT_HANDLERS (one handler per TalentEffect["type"]),
//   resolveTalentEffects (the single entry point), formatTalentEffect, and thin
//   public wrappers (getTalentSlBonus/DamageBonus/EncumbranceBonus + sources).
// Deps: skillRefMatches (id-first skill matching), CharacteristicKey union.
import type { ResolvedCharacterTalent } from "../data/characters/resolved";
import type { CharacteristicKey, SkillRef, TalentDefinition, TalentEffect } from "../types";
import type { RollTestType } from "../types/dice";
import { skillRefMatches } from "./skillRefs";

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
  // Plan 02b: id-first matching. When present, roll-math handlers match these
  // structurally and ignore the `test` string; otherwise they fall back to it.
  skillIds?: Array<{ skillId: string; specialisationId?: string } | string>;
  characteristics?: CharacteristicKey[];
}

/** Typed contribution a handler adds to a roll/derived stat. */
export type TalentContribution =
  | { kind: "sl"; value: number }
  | { kind: "damage"; value: number }
  | { kind: "encumbrance"; value: number }
  | { kind: "flag" };

export interface TalentEffectHandler<E extends TalentEffect = TalentEffect> {
  type: E["type"];
  /** id-first; falls back to the `test` string only when the effect carries no structured refs. */
  matches(effect: E, ctx: TalentEffectContext): boolean;
  /** contribution to a roll/derived stat (SL, damage, encumbrance, flag, …). */
  contribute?(effect: E, level: number, ctx: TalentEffectContext): TalentContribution;
  /** display string (single source of truth for formatting). */
  format(effect: E): string;
}

export interface TalentSlBonusSource {
  label: string;
  value: number;
}

// --- shared matching helpers -------------------------------------------------

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

const asSkillTarget = (
  ref: { skillId: string; specialisationId?: string } | string,
): { skillId: string; specialisationId?: string } =>
  typeof ref === "string" ? { skillId: ref } : ref;

/**
 * Roll-math match (test_sl_bonus / test_reverse_failed_roll). Id-first: when the
 * effect carries structured `skillIds`/`characteristics` and the context supplies
 * refs, match those structurally. Otherwise fall back to the `test` string compare
 * (kept until the Plan 13 cleanup).
 */
const rollMathMatches = (
  effect: {
    test: string;
    condition?: string;
    skillIds?: SkillRef[];
    characteristics?: CharacteristicKey[];
  },
  ctx: TalentEffectContext,
): boolean => {
  if (!conditionMatches(effect.condition, ctx.conditionTags ?? [])) return false;

  const hasRefs = (effect.skillIds?.length ?? 0) > 0 || (effect.characteristics?.length ?? 0) > 0;
  const ctxHasRefs = (ctx.skillIds?.length ?? 0) > 0 || (ctx.characteristics?.length ?? 0) > 0;

  if (hasRefs && ctxHasRefs) {
    const skillHit = (effect.skillIds ?? []).some((ref) =>
      (ctx.skillIds ?? []).some((target) => skillRefMatches(ref, asSkillTarget(target))),
    );
    const charHit = (effect.characteristics ?? []).some((key) =>
      (ctx.characteristics ?? []).includes(key),
    );
    return skillHit || charHit;
  }

  // No structured refs on the effect (or none in context): string fallback.
  return testMatches(effect.test, ctx.testName, ctx.testType);
};

// --- registry: one handler per effect type -----------------------------------

const testSlBonusHandler: TalentEffectHandler<Extract<TalentEffect, { type: "test_sl_bonus" }>> = {
  type: "test_sl_bonus",
  matches: (effect, ctx) => rollMathMatches(effect, ctx),
  contribute: (effect, level) => ({ kind: "sl", value: effect.valuePerLevel * level }),
  format: (effect) => `+${effect.valuePerLevel} SL per level to ${effect.test}`,
};

const testReverseFailedRollHandler: TalentEffectHandler<Extract<TalentEffect, { type: "test_reverse_failed_roll" }>> = {
  type: "test_reverse_failed_roll",
  matches: (effect, ctx) => rollMathMatches(effect, ctx),
  format: (effect) =>
    `May reverse a failed ${effect.test} roll${effect.condition ? ` (${effect.condition})` : ""}`,
};

const attributeBonusHandler: TalentEffectHandler<Extract<TalentEffect, { type: "attribute_bonus" }>> = {
  type: "attribute_bonus",
  matches: (effect, ctx) => conditionMatches(effect.condition, ctx.conditionTags ?? []),
  format: (effect) =>
    `+${effect.valuePerLevel} ${effect.attribute} per level${effect.condition ? ` (${effect.condition})` : ""}`,
};

const damageBonusHandler: TalentEffectHandler<Extract<TalentEffect, { type: "damage_bonus" }>> = {
  type: "damage_bonus",
  matches: (effect, ctx) => conditionMatches(effect.condition, ctx.conditionTags ?? []),
  contribute: (effect, level) => ({ kind: "damage", value: effect.valuePerLevel * level }),
  format: (effect) =>
    `+${effect.valuePerLevel} Damage per level${effect.condition ? ` (${effect.condition})` : ""}`,
};

const encumbranceBonusHandler: TalentEffectHandler<Extract<TalentEffect, { type: "encumbrance_bonus" }>> = {
  type: "encumbrance_bonus",
  matches: (effect, ctx) => conditionMatches(effect.condition, ctx.conditionTags ?? []),
  contribute: (effect, level) => ({ kind: "encumbrance", value: effect.valuePerLevel * level }),
  format: (effect) =>
    `+${effect.valuePerLevel} Encumbrance per level${effect.condition ? ` (${effect.condition})` : ""}`,
};

const ignorePenaltyHandler: TalentEffectHandler<Extract<TalentEffect, { type: "ignore_penalty" }>> = {
  type: "ignore_penalty",
  matches: (effect, ctx) => conditionMatches(effect.condition, ctx.conditionTags ?? []),
  format: (effect) => `Ignore ${effect.penalty}${effect.condition ? ` (${effect.condition})` : ""}`,
};

const actionUnlockHandler: TalentEffectHandler<Extract<TalentEffect, { type: "action_unlock" }>> = {
  type: "action_unlock",
  matches: (effect, ctx) =>
    (!ctx.actionId || effect.action === ctx.actionId) &&
    conditionMatches(effect.condition, ctx.conditionTags ?? []),
  format: (effect) => `Unlock action: ${effect.action}${effect.condition ? ` (${effect.condition})` : ""}`,
};

const specialRuleHandler: TalentEffectHandler<Extract<TalentEffect, { type: "special_rule" }>> = {
  type: "special_rule",
  matches: () => true,
  format: (effect) => effect.rule,
};

export const EFFECT_HANDLERS: Record<TalentEffect["type"], TalentEffectHandler> = {
  test_sl_bonus: testSlBonusHandler as TalentEffectHandler,
  test_reverse_failed_roll: testReverseFailedRollHandler as TalentEffectHandler,
  attribute_bonus: attributeBonusHandler as TalentEffectHandler,
  damage_bonus: damageBonusHandler as TalentEffectHandler,
  encumbrance_bonus: encumbranceBonusHandler as TalentEffectHandler,
  ignore_penalty: ignorePenaltyHandler as TalentEffectHandler,
  action_unlock: actionUnlockHandler as TalentEffectHandler,
  special_rule: specialRuleHandler as TalentEffectHandler,
};

// --- resolver ----------------------------------------------------------------

export function getTalentLevel(talents: Array<{ id?: string; name: string }>, definition: TalentDefinition) {
  return talents.filter((talent) => talent.id === definition.id || talent.name === definition.name).length;
}

export interface ResolvedTalentEffects {
  effects: ActiveTalentEffect[];
  slBonus: number;
  damageBonus: number;
  encumbranceBonus: number;
}

/**
 * Single entry point: resolves which talent effects are active for the given
 * context and totals their typed contributions. All consumers go through this.
 */
export function resolveTalentEffects(params: {
  talents: ResolvedCharacterTalent[];
  talentDefinitions: TalentDefinition[];
  context?: TalentEffectContext;
}): ResolvedTalentEffects {
  const context = params.context ?? {};

  const effects: ActiveTalentEffect[] = params.talentDefinitions.flatMap((definition) => {
    const level = getTalentLevel(params.talents, definition);
    if (level === 0) return [];

    return (definition.effects ?? [])
      .filter((effect) => EFFECT_HANDLERS[effect.type].matches(effect, context))
      .map((effect) => ({
        talentId: definition.id,
        talentName: definition.name,
        level,
        effect,
      }));
  });

  let slBonus = 0;
  let damageBonus = 0;
  let encumbranceBonus = 0;
  for (const entry of effects) {
    const contribution = EFFECT_HANDLERS[entry.effect.type].contribute?.(entry.effect, entry.level, context);
    if (!contribution) continue;
    if (contribution.kind === "sl") slBonus += contribution.value;
    else if (contribution.kind === "damage") damageBonus += contribution.value;
    else if (contribution.kind === "encumbrance") encumbranceBonus += contribution.value;
  }

  return { effects, slBonus, damageBonus, encumbranceBonus };
}

// --- public helpers (thin wrappers over the resolver / registry) -------------

/**
 * Back-compat: returns active effects for a context. Kept so unlisted call sites
 * keep working; prefer resolveTalentEffects for new code.
 */
export function getApplicableTalentEffects(params: {
  talents: ResolvedCharacterTalent[];
  talentDefinitions: TalentDefinition[];
  context?: TalentEffectContext;
}): ActiveTalentEffect[] {
  return resolveTalentEffects(params).effects;
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

export function getTalentEncumbranceBonus(effects: ActiveTalentEffect[]) {
  return effects
    .filter((entry): entry is ActiveTalentEffect & { effect: Extract<TalentEffect, { type: "encumbrance_bonus" }> } =>
      entry.effect.type === "encumbrance_bonus",
    )
    .reduce((total, entry) => total + entry.effect.valuePerLevel * entry.level, 0);
}

export function formatTalentEffect(effect: TalentEffect) {
  return EFFECT_HANDLERS[effect.type].format(effect);
}
