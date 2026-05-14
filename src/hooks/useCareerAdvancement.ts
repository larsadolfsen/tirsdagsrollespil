import { useState } from "react";
import type { ResolvedCharacterSkill, ResolvedCharacterTalent } from "../data/characters/resolved";
import {
  getAdvanceCost,
  getCharacteristicAdvanceCost,
  getTalentPurchaseCost,
} from "../lib/advanceCosts";

interface UseCareerAdvancementOptions {
  characterSkills: ResolvedCharacterSkill[];
  characterTalents: ResolvedCharacterTalent[];
  currentCareerRank: number;
  currentCharacteristicAdvances: Record<string, number>;
}

export function useCareerAdvancement({
  characterSkills,
  characterTalents,
  currentCareerRank,
  currentCharacteristicAdvances,
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
    displayedCareerRank,
    hasPendingCareerChanges,
    pendingCareerRank,
    pendingCharacteristicAdvances,
    pendingCharacteristicSpend,
    pendingSkillAdvances,
    pendingSkillSpend,
    pendingTalentPurchases,
    pendingTalentSpend,
    resetPendingAdvancements,
    setPendingCareerRank,
    setPendingCharacteristicAdvances,
    setPendingSkillAdvances,
    setPendingTalentPurchases,
  };
}
