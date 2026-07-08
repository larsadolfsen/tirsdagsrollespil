// Talent effect registry + single resolver (Plan 02b; Plan A06 unifies trait input).
// Exposes: EFFECT_HANDLERS (one handler per TalentEffect["type"]),
//   resolveTalentEffects / resolveCreatureTraitEffects (both delegate to the same
//   resolveEffectSources core), mapCreatureTraitModifierToTalentEffect (trait ->
//   registry effect shape), formatTalentEffect, and thin public wrappers
//   (getTalentSlBonus/DamageBonus/EncumbranceBonus + sources).
// Deps: skillRefMatches (id-first skill matching), CharacteristicKey union,
//   CreatureTraitModifier (bestiary trait modifiers, Plan A06).
import type { ResolvedCharacterTalent } from "../data/characters/resolved";
import type { CharacteristicKey, SkillRef, TalentDefinition, TalentEffect } from "../types";
import type { RollTestType } from "../types/dice";
import type { CreatureTraitModifier } from "../data/rules/wfrp4e/creatureTraits";
import { skillRefMatches } from "./skillRefs";
import { toCharacteristicKey } from "./characteristicKeys";

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
  // Plan 02b/13: structured, id-first matching. Roll-math handlers match these
  // exclusively; `test` on the effect is a display label only (see `format`).
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
  /** id/characteristic-first only (Plan 13): matches structured refs; `test` string is display-only. */
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

const asSkillTarget = (
  ref: { skillId: string; specialisationId?: string } | string,
): { skillId: string; specialisationId?: string } =>
  typeof ref === "string" ? { skillId: ref } : ref;

/**
 * Roll-math match (test_sl_bonus / test_reverse_failed_roll). Purely id-first
 * (Plan 13): matches only when the effect carries structured `skillIds`/
 * `characteristics` refs and the context supplies matching refs. `effect.test`
 * is a display label only (see `format` below) and plays no role in matching.
 * An effect with no structured refs simply never matches — that's a data gap
 * (missing ref), not something for the matcher to paper over.
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
  if (!hasRefs) return false;

  const skillHit = (effect.skillIds ?? []).some((ref) =>
    (ctx.skillIds ?? []).some((target) => skillRefMatches(ref, asSkillTarget(target))),
  );
  const charHit = (effect.characteristics ?? []).some((key) =>
    (ctx.characteristics ?? []).includes(key),
  );
  return skillHit || charHit;
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
  matches: (effect, ctx) => {
    if (!conditionMatches(effect.condition, ctx.conditionTags ?? [])) return false;
    if (ctx.characteristics && ctx.characteristics.length > 0) {
      const key = toCharacteristicKey(effect.attribute);
      return key !== undefined && ctx.characteristics.includes(key);
    }
    return true;
  },
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

/** A generic "thing that grants typed effects at a level" — a talent at N levels,
 *  or (Plan A06) a creature trait, whose modifiers have been mapped to this same
 *  TalentEffect shape and which always contributes at level 1 (traits don't stack
 *  by count the way talents do). */
interface EffectSource {
  id: string;
  name: string;
  level: number;
  effects: TalentEffect[];
}

/**
 * The single resolver core: matches + totals typed contributions for any list of
 * effect sources against a context. Both resolveTalentEffects and (Plan A06)
 * resolveCreatureTraitEffects delegate here — there is exactly one matching/
 * contribution pipeline, regardless of whether the effect originated from a
 * talent or a trait modifier.
 */
function resolveEffectSources(sources: EffectSource[], context: TalentEffectContext): ResolvedTalentEffects {
  const effects: ActiveTalentEffect[] = sources.flatMap((source) =>
    source.effects
      .filter((effect) => EFFECT_HANDLERS[effect.type].matches(effect, context))
      .map((effect) => ({
        talentId: source.id,
        talentName: source.name,
        level: source.level,
        effect,
      })),
  );

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

/**
 * Single entry point: resolves which talent effects are active for the given
 * context and totals their typed contributions. All consumers go through this.
 */
export function resolveTalentEffects(params: {
  talents: ResolvedCharacterTalent[];
  talentDefinitions: TalentDefinition[];
  context?: TalentEffectContext;
}): ResolvedTalentEffects {
  const sources: EffectSource[] = params.talentDefinitions.flatMap((definition) => {
    const level = getTalentLevel(params.talents, definition);
    if (level === 0) return [];
    return [{ id: definition.id, name: definition.name, level, effects: definition.effects ?? [] }];
  });

  return resolveEffectSources(sources, params.context ?? {});
}

// --- trait modifiers -> registry effects (Plan A06) --------------------------

/**
 * Maps a bestiary trait modifier into the shared TalentEffect shape so it flows
 * through the SAME registry/resolver talents use (EFFECT_HANDLERS, matches,
 * conditionTags). Only modifiers that are unambiguously a flat, single-target
 * bonus are representable this way: a numeric `amount` and a specific skill/
 * characteristic (not "all"). Rank-formula amounts (`agilityBonus`, `rating`, …)
 * and "all"-target modifiers need creature-specific computation the registry
 * doesn't do, so they intentionally map to `undefined` — mirrors the "typed
 * where clear" depth decision used for talents (no rules engine for every
 * trait's prose).
 */
export function mapCreatureTraitModifierToTalentEffect(
  modifier: CreatureTraitModifier,
  condition?: string,
): TalentEffect | undefined {
  if (modifier.type === "skillTestBonus") {
    if (typeof modifier.amount !== "number" || !modifier.skill || modifier.skill === "all") return undefined;
    return {
      type: "test_sl_bonus",
      test: modifier.skill,
      valuePerLevel: modifier.amount,
      skillIds: [modifier.skill],
      condition,
    };
  }

  if (modifier.type === "characteristic") {
    if (typeof modifier.amount !== "number" || !modifier.characteristic || modifier.characteristic === "all") {
      return undefined;
    }
    return {
      type: "attribute_bonus",
      attribute: modifier.characteristic,
      valuePerLevel: modifier.amount,
      condition,
    };
  }

  return undefined;
}

export interface CreatureTraitEffectSource {
  id: string;
  name: string;
  modifiers: CreatureTraitModifier[];
  /** Condition tag for a specialised/target trait instance (Plan A01 convention,
   *  e.g. `using:sword` for Weapon (Sword), `using:orcs` for Hatred (Orcs)). Gates
   *  the mapped effect exactly like a talent effect's `condition` field. */
  condition?: string;
}

/**
 * Trait-side counterpart to resolveTalentEffects: maps each trait's modifiers
 * into registry effects (mapCreatureTraitModifierToTalentEffect) and resolves
 * them through the same resolveEffectSources core — one registry, one resolver,
 * for both talents and traits.
 */
export function resolveCreatureTraitEffects(params: {
  traits: CreatureTraitEffectSource[];
  context?: TalentEffectContext;
}): ResolvedTalentEffects {
  const sources: EffectSource[] = params.traits.map((trait) => ({
    id: trait.id,
    name: trait.name,
    level: 1,
    effects: trait.modifiers
      .map((modifier) => mapCreatureTraitModifierToTalentEffect(modifier, trait.condition))
      .filter((effect): effect is TalentEffect => effect !== undefined),
  }));

  return resolveEffectSources(sources, params.context ?? {});
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
  return effects.flatMap((entry) => {
    const contribution = EFFECT_HANDLERS[entry.effect.type].contribute?.(entry.effect, entry.level, {});
    if (contribution?.kind !== "sl") return [];
    return [{ label: entry.talentName, value: contribution.value }];
  });
}

export function getTalentSlBonus(effects: ActiveTalentEffect[]) {
  return getTalentSlBonusSources(effects).reduce((total, source) => total + source.value, 0);
}

export function getTalentDamageBonus(effects: ActiveTalentEffect[]) {
  return effects.reduce((total, entry) => {
    const contribution = EFFECT_HANDLERS[entry.effect.type].contribute?.(entry.effect, entry.level, {});
    return contribution?.kind === "damage" ? total + contribution.value : total;
  }, 0);
}

export function getTalentEncumbranceBonus(effects: ActiveTalentEffect[]) {
  return effects.reduce((total, entry) => {
    const contribution = EFFECT_HANDLERS[entry.effect.type].contribute?.(entry.effect, entry.level, {});
    return contribution?.kind === "encumbrance" ? total + contribution.value : total;
  }, 0);
}

export function formatTalentEffect(effect: TalentEffect) {
  return EFFECT_HANDLERS[effect.type].format(effect);
}
