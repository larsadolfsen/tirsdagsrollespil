import { useState } from "react";
import type {
  ResolvedCharacterRecord,
  ResolvedCharacterSkill,
  ResolvedCharacterTalent,
} from "../data/characters/resolved";
import {
  getAdvanceCost,
  getCharacteristicAdvanceCost,
  getTalentPurchaseCost,
} from "../lib/advanceCosts";
import { UI_LABELS } from "../labels";
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

  const pendingCharacteristicSpend = Object.entries(pendingCharacteristicAdvances).reduce<number>(
    (total, [characteristicKey, count]) => {
      const baseAdvances = currentCharacteristicAdvances[characteristicKey] ?? 0;

      let nextTotal = total;
      for (let step = 0; step < Number(count); step += 1) {
        nextTotal += getCharacteristicAdvanceCost(baseAdvances + step);
      }

      return nextTotal;
    },
    0,
  );

  const pendingSkillSpend = Object.entries(pendingSkillAdvances).reduce<number>(
    (total, [skillName, count]) => {
      const baseAdvances =
        characterSkills.find((skill) => skill.displayName === skillName)?.advances ?? 0;

      let nextTotal = total;
      for (let step = 0; step < Number(count); step += 1) {
        nextTotal += getAdvanceCost(baseAdvances + step);
      }

      return nextTotal;
    },
    0,
  );

  const pendingTalentSpend = Object.entries(pendingTalentPurchases).reduce<number>(
    (total, [talentName, count]) => {
      const baseTakenCount = characterTalents.filter((talent) => talent.name === talentName).length;

      let nextTotal = total;
      for (let step = 0; step < Number(count); step += 1) {
        nextTotal += getTalentPurchaseCost(baseTakenCount + step);
      }

      return nextTotal;
    },
    0,
  );

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
  const isCareerSkillName = (skillName: string) => {
    if (careerAdvancementData.skills.includes(skillName)) {
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
  const getCareerAdvanceCost = (rank: number) => (isCareerStepComplete(rank) ? 100 : 200);
  const pendingCareerSpend =
    pendingCareerRank === null || pendingCareerRank <= currentCareerRank
      ? 0
      : Array.from(
          { length: pendingCareerRank - currentCareerRank },
          (_, index) => currentCareerRank + index,
        ).reduce((total, rank) => total + getCareerAdvanceCost(rank), 0);
  const pendingSpentXp =
    pendingCharacteristicSpend + pendingSkillSpend + pendingTalentSpend + pendingCareerSpend;
  const pendingAvailableXp = Math.max(0, Number(xpCurrent) - pendingSpentXp);
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
  const nextCareerAdvanceCost = nextCareerRankRecord ? getCareerAdvanceCost(displayedCareerRank) : null;
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
    hasPendingCareerChanges,
    isCareerSkillName,
    nextCareerAdvanceCost,
    nextCareerRankRecord,
    pendingAvailableXp,
    pendingCareerRank,
    pendingCareerSpend,
    pendingCharacteristicAdvances,
    pendingCharacteristicSpend,
    pendingSkillAdvances,
    pendingSkillSpend,
    pendingSpentXp,
    pendingTalentPurchases,
    pendingTalentSpend,
    resetPendingAdvancements,
    setPendingCareerRank,
    setPendingCharacteristicAdvances,
    setPendingSkillAdvances,
    setPendingTalentPurchases,
  };
}
