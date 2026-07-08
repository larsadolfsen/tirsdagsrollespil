import { useState } from "react";
import type {
  ResolvedCharacterRecord,
  ResolvedCharacterSkill,
  ResolvedCharacterTalent,
} from "../data/characters/resolved";
import { UI_LABELS } from "../labels";
import { getAdvanceCost, getCharacteristicAdvanceCost, getTalentPurchaseCost } from "../lib/advanceCosts";
import type { Ruleset, SkillDefinition } from "../types";

interface UseCareerAdvancementOptions {
  careerAdvancementData: {
    characteristics: Array<{
      key: string;
      availableFromRank: number;
    }>;
    skills: string[];
    talents: string[];
  };
  characterData: ResolvedCharacterRecord;
  characterSkills: ResolvedCharacterSkill[];
  characterTalents: ResolvedCharacterTalent[];
  currentCareerRank: number;
  currentCharacteristicAdvances: Record<string, number>;
  rulesIndex: {
    resolvedSkillOptions: Array<{
      id: string;
      skillId: string;
      specialisationId?: string;
      name: string;
    }>;
  };
  ruleset: Ruleset;
  xpCurrent: number;
}

export function useCareerAdvancement({
  careerAdvancementData,
  characterData,
  characterSkills,
  characterTalents,
  currentCareerRank,
  currentCharacteristicAdvances,
  rulesIndex,
  ruleset,
  xpCurrent,
}: UseCareerAdvancementOptions) {
  const [pendingCharacteristicAdvances, setPendingCharacteristicAdvances] = useState<Record<string, number>>({});
  const [pendingSkillAdvances, setPendingSkillAdvances] = useState<Record<string, number>>({});
  const [pendingTalentPurchases, setPendingTalentPurchases] = useState<Record<string, number>>({});
  const [pendingCareerRank, setPendingCareerRank] = useState<number | null>(null);

  const displayedCareerRank = pendingCareerRank ?? currentCareerRank;
  const displayedCareerRankRecord =
    characterData.careerRecord.ranks.find((rank) => rank.rank === displayedCareerRank) ??
    characterData.careerRecord.ranks.find((rank) => rank.rank === characterData.careerRecord.level) ??
    null;
  const nextCareerRankRecord =
    characterData.careerRecord.ranks.find((rank) => rank.rank === displayedCareerRank + 1) ?? null;
  const advancementCharacteristics = UI_LABELS.CHARACTERISTICS.map(({ key, label }) => {
    const advances = currentCharacteristicAdvances[key] ?? 0;
    const pendingAdvances = pendingCharacteristicAdvances[key] ?? 0;
    const value = characterData.attributes[key] ?? 0;

    return {
      key,
      label,
      advances,
      initial: value - advances,
      pendingAdvances,
      value,
    };
  });
  const availableCareerCharacteristicKeys = careerAdvancementData.characteristics
    .filter((item) => item.availableFromRank <= displayedCareerRank)
    .map((item) => item.key);
  const characterSkillByName = new Map<string, ResolvedCharacterSkill>(
    characterSkills.map((skill) => [skill.displayName, skill]),
  );
  type ResolvedSkillOption = (typeof rulesIndex.resolvedSkillOptions)[number];
  const skillDefinitionById = new Map<string, SkillDefinition>(
    ruleset.skills.map((skill) => [skill.id, skill]),
  );
  const skillDefinitionByName = new Map<string, SkillDefinition>(
    ruleset.skills.map((skill) => [skill.name, skill]),
  );
  const skillOptionByName = new Map<string, ResolvedSkillOption>(
    rulesIndex.resolvedSkillOptions.map((option) => [option.name, option]),
  );
  const getSkillAdvanceTotal = (skillName: string) => {
    const baseAdvances = characterSkillByName.get(skillName)?.advances ?? 0;
    const pendingAdvances = pendingSkillAdvances[skillName] ?? 0;
    return baseAdvances + pendingAdvances;
  };
  const getCareerSkillAdvanceTotal = (careerSkillName: string) => {
    const skillDefinition = skillDefinitionByName.get(careerSkillName);

    if (!skillDefinition?.grouped) {
      return getSkillAdvanceTotal(careerSkillName);
    }

    return Math.max(
      0,
      ...rulesIndex.resolvedSkillOptions
        .filter((option) => option.skillId === skillDefinition.id)
        .map((option) => getSkillAdvanceTotal(option.name)),
    );
  };
  const getCareerSkillOptions = (careerSkillName: string) => {
    const skillDefinition = skillDefinitionByName.get(careerSkillName);

    if (!skillDefinition?.grouped) {
      return [careerSkillName];
    }

    return rulesIndex.resolvedSkillOptions
      .filter((option) => option.skillId === skillDefinition.id)
      .map((option) => option.name);
  };
  // Plan 10: skills granted by owned talents (e.g. Perfect Pitch → Entertain (Sing)) become
  // purchasable as if they were career skills, and where the talent specifies it, their Advances
  // cost less. Resolve each granted SkillRef to its display name(s) the same way career skill
  // names are resolved elsewhere in this hook: a direct skill id maps to one name, a grouped base
  // skill id (e.g. "skill_trade") expands to all of its specialisation option names.
  const grantedSkillNames = new Set<string>();
  const grantedSkillDiscountByName = new Map<string, number>();
  for (const characterTalent of characterTalents) {
    const talentDefinition = ruleset.talents.find(
      (talent) => talent.id === characterTalent.id || talent.name === characterTalent.name,
    );
    const grantsSkillIds = talentDefinition?.grantsSkillIds ?? [];
    const discount = talentDefinition?.grantedSkillDiscount;

    for (const skillRef of grantsSkillIds) {
      const directSkill = skillDefinitionById.get(skillRef);
      const names = directSkill?.grouped
        ? rulesIndex.resolvedSkillOptions
            .filter((option) => option.skillId === directSkill.id)
            .map((option) => option.name)
        : directSkill
          ? [directSkill.name]
          : [];

      for (const name of names) {
        grantedSkillNames.add(name);
        if (discount !== undefined) {
          const existingDiscount = grantedSkillDiscountByName.get(name) ?? 0;
          grantedSkillDiscountByName.set(name, Math.max(existingDiscount, discount));
        }
      }
    }
  }
  const getGrantedSkillDiscount = (skillName: string) => grantedSkillDiscountByName.get(skillName) ?? 0;
  const isCareerSkillName = (skillName: string) => {
    if (careerAdvancementData.skills.includes(skillName) || grantedSkillNames.has(skillName)) {
      return true;
    }

    const skillOption = skillOptionByName.get(skillName);
    if (!skillOption) {
      return false;
    }

    const parentSkill = skillDefinitionById.get(skillOption.skillId);
    return parentSkill ? careerAdvancementData.skills.includes(parentSkill.name) : false;
  };
  const hasCareerTalentRequirement = careerAdvancementData.talents.some((talentName) =>
    characterTalents.some((talent) => talent.name === talentName) ||
    (pendingTalentPurchases[talentName] ?? 0) > 0,
  );
  const isCareerStepComplete = (rank: number) => {
    const requiredAdvances = rank * 5;
    const availableCharacteristicKeys = careerAdvancementData.characteristics
      .filter((item) => item.availableFromRank <= rank)
      .map((item) => item.key);
    const completedCharacteristics = availableCharacteristicKeys.filter((characteristicKey) => {
      const baseAdvances = currentCharacteristicAdvances[characteristicKey] ?? 0;
      const pendingAdvances = pendingCharacteristicAdvances[characteristicKey] ?? 0;
      return baseAdvances + pendingAdvances >= requiredAdvances;
    }).length;
    const completedSkills = careerAdvancementData.skills.filter((skillName) => {
      return getCareerSkillAdvanceTotal(skillName) >= requiredAdvances;
    }).length;

    return (
      completedCharacteristics === availableCharacteristicKeys.length &&
      completedSkills === careerAdvancementData.skills.length &&
      hasCareerTalentRequirement
    );
  };
  // Total XP cost of every queued (pending) advance, charged on save. Each successive
  // advance is priced against the next band, so costs are summed incrementally.
  const pendingAdvancesXpCost = (() => {
    let total = 0;
    for (const [key, count] of Object.entries(pendingCharacteristicAdvances)) {
      const base = currentCharacteristicAdvances[key] ?? 0;
      for (let step = 0; step < count; step += 1) {
        total += getCharacteristicAdvanceCost(base + step);
      }
    }
    for (const [skillName, count] of Object.entries(pendingSkillAdvances)) {
      const base = characterSkillByName.get(skillName)?.advances ?? 0;
      const discount = grantedSkillDiscountByName.get(skillName) ?? 0;
      for (let step = 0; step < count; step += 1) {
        total += Math.max(0, getAdvanceCost(base + step) - discount);
      }
    }
    for (const [talentName, count] of Object.entries(pendingTalentPurchases)) {
      const base = characterTalents.filter((talent) => talent.name === talentName).length;
      for (let step = 0; step < count; step += 1) {
        total += getTalentPurchaseCost(base + step);
      }
    }
    return total;
  })();
  // `xpCurrent` already folds in the manual XP adjustment (see call site), so subtracting the
  // queued advance cost yields the XP still available to spend. This drives both the purchase
  // affordability gates (sidebars) and the live "Current Experience" display.
  const pendingAvailableXp = Math.max(0, Number(xpCurrent) - pendingAdvancesXpCost);
  const requiredCareerAdvances = displayedCareerRank * 5;
  const completedCareerCharacteristics = availableCareerCharacteristicKeys.filter((characteristicKey) => {
    const baseAdvances = currentCharacteristicAdvances[characteristicKey] ?? 0;
    const pendingAdvances = pendingCharacteristicAdvances[characteristicKey] ?? 0;
    return baseAdvances + pendingAdvances >= requiredCareerAdvances;
  }).length;
  const completedCareerSkills = careerAdvancementData.skills.filter((skillName) => {
    return getCareerSkillAdvanceTotal(skillName) >= requiredCareerAdvances;
  }).length;
  const careerProgressGoalCount = availableCareerCharacteristicKeys.length + careerAdvancementData.skills.length + 1;
  const careerProgressCompletedCount =
    completedCareerCharacteristics + completedCareerSkills + (hasCareerTalentRequirement ? 1 : 0);
  const advancementProgress = careerProgressGoalCount === 0
    ? 0
    : Math.round((careerProgressCompletedCount / careerProgressGoalCount) * 100);
  const hasPendingCareerChanges =
    Object.keys(pendingCharacteristicAdvances).length > 0 ||
    Object.keys(pendingSkillAdvances).length > 0 ||
    Object.keys(pendingTalentPurchases).length > 0 ||
    pendingCareerRank !== null;

  const resetPendingAdvancements = () => {
    setPendingCharacteristicAdvances({});
    setPendingSkillAdvances({});
    setPendingTalentPurchases({});
    setPendingCareerRank(null);
  };

  return {
    advancementCharacteristics,
    advancementProgress,
    availableCareerCharacteristicKeys,
    displayedCareerRank,
    displayedCareerRankRecord,
    getCareerSkillOptions,
    getGrantedSkillDiscount,
    hasPendingCareerChanges,
    isCareerSkillName,
    nextCareerRankRecord,
    pendingAdvancesXpCost,
    pendingAvailableXp,
    pendingCareerRank,
    pendingCharacteristicAdvances,
    pendingSkillAdvances,
    pendingTalentPurchases,
    resetPendingAdvancements,
    setPendingCareerRank,
    setPendingCharacteristicAdvances,
    setPendingSkillAdvances,
    setPendingTalentPurchases,
  };
}
