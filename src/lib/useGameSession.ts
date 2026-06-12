import { useEffect, useMemo, useState } from "react";
import type { SetStateAction } from "react";
import { hydrateCharacterProgress } from "../data/persistence";
import { characterRecordById } from "../data/characters";
import { defaultCharacterId } from "../data/repository";
import {
  getCareerAdvancementData,
  getCharacterSkillKey,
  loadGameSession,
  saveGameSessionProgress,
} from "./gameSession";
import { parseCampaignCharacterPath } from "./campaignRoutes";
import { getConsumableCount } from "./consumables";
import type {
  ResolvedCharacterEquipment,
  ResolvedCharacterSkill,
  ResolvedCharacterSpell,
  ResolvedCharacterTalent,
} from "../data/characters/resolved";

const getCharacteristicInitials = (character: {
  attributes: Record<string, number>;
  characteristicAdvances?: Record<string, number>;
}) => Object.fromEntries(
  Object.entries(character.attributes).map(([key, value]) => [
    key,
    Number(value) - (character.characteristicAdvances?.[key] ?? 0),
  ]),
);

export type FortuneSpendAction =
  | "reroll-failed-test"
  | "add-one-sl"
  | "choose-initiative";

export const fortuneSpendActions: Array<{
  id: FortuneSpendAction;
  label: string;
  description: string;
}> = [
  {
    id: "reroll-failed-test",
    label: "Reroll failed Test",
    description: "Spend 1 Fortune to reroll a failed Test.",
  },
  {
    id: "add-one-sl",
    label: "Add +1 SL",
    description: "Spend 1 Fortune to add +1 SL after a Test is rolled.",
  },
  {
    id: "choose-initiative",
    label: "Choose Initiative timing",
    description: "Spend 1 Fortune to choose when to act this Round.",
  },
];

export type FateSpendAction =
  | "die-another-day"
  | "how-did-that-miss";

export const fateSpendActions: Array<{
  id: FateSpendAction;
  label: string;
  description: string;
}> = [
  {
    id: "die-another-day",
    label: "Die Another Day",
    description: "Spend 1 Fate to avoid death and survive the immediate danger.",
  },
  {
    id: "how-did-that-miss",
    label: "How Did That Miss?",
    description: "Spend 1 Fate to avoid all damage from an incoming attack or hazard.",
  },
];

export type ResilienceSpendAction =
  | "deny-mutation"
  | "choose-test-result";

export const resilienceSpendActions: Array<{
  id: ResilienceSpendAction;
  label: string;
  description: string;
}> = [
  {
    id: "deny-mutation",
    label: "I Deny You!",
    description: "Spend 1 Resilience to prevent a mutation.",
  },
  {
    id: "choose-test-result",
    label: "I Will Not Fail!",
    description: "Spend 1 Resilience to choose the result of a Test rather than roll.",
  },
];

export type ResolveSpendAction =
  | "ignore-psychology"
  | "ignore-critical-wounds"
  | "remove-prone";

export const resolveSpendActions: Array<{
  id: ResolveSpendAction;
  label: string;
  description: string;
}> = [
  {
    id: "ignore-psychology",
    label: "Ignore Psychology",
    description: "Spend 1 Resolve to become immune to Psychology until the end of the next round.",
  },
  {
    id: "ignore-critical-wounds",
    label: "Ignore Critical Wounds",
    description: "Spend 1 Resolve to ignore Critical Wound modifiers until the beginning of the next round.",
  },
  {
    id: "remove-prone",
    label: "Remove Prone",
    description: "Spend 1 Resolve to remove the Prone Condition and regain 1 Wound.",
  },
];

const clampResource = (value: number, max: number) =>
  Math.max(0, Math.min(value, max));

const resolveNumberStateAction = (action: SetStateAction<number>, previousValue: number) =>
  typeof action === "function"
    ? (action as (previousValue: number) => number)(previousValue)
    : action;

const getInitialSelectedCharacterId = () => {
  if (typeof window === "undefined") {
    return defaultCharacterId;
  }

  const route = parseCampaignCharacterPath(window.location.pathname);
  const routedCharacter = route ? characterRecordById[route.characterId] : null;

  return routedCharacter?.campaignId === route?.campaignId
    ? routedCharacter.id
    : defaultCharacterId;
};

export function useGameSession() {
  const [selectedCharacterId, setSelectedCharacterId] = useState(getInitialSelectedCharacterId);
  const [isProgressHydrated, setIsProgressHydrated] = useState(false);
  const [isSessionStateReadyToSave, setIsSessionStateReadyToSave] = useState(false);
  const [hydratedCharacterId, setHydratedCharacterId] = useState<string | null>(null);
  const [progressHydrationVersion, setProgressHydrationVersion] = useState(0);

  const session = useMemo(
    () => loadGameSession(selectedCharacterId),
    [selectedCharacterId, progressHydrationVersion],
  );
  const {
    character,
    ruleset,
    rulesIndex,
    initialTalentIds,
    resourceCaps: baseResourceCaps,
    initialCorruptionCurrent,
    initialFateCurrent,
    initialFortuneCurrent,
    initialResilienceCurrent,
    initialResolveCurrent,
    initialXpCurrent,
  } = session;

  const [woundsCurrent, setWoundsCurrent] = useState(character.wounds.current);
  const [corruptionCurrent, setCorruptionCurrent] = useState(initialCorruptionCurrent);
  const [fateCurrent, setRawFateCurrent] = useState(initialFateCurrent);
  const [fortuneCurrent, setRawFortuneCurrent] = useState(initialFortuneCurrent);
  const [resilienceCurrent, setRawResilienceCurrent] = useState(initialResilienceCurrent);
  const [resolveCurrent, setRawResolveCurrent] = useState(initialResolveCurrent);
  const [xpCurrent, setXpCurrent] = useState(initialXpCurrent);
  const [xpTotal, setXpTotal] = useState(character.xpTotal);
  const [characterName, setCharacterName] = useState(character.name);
  const [portraitDataUrl, setPortraitDataUrl] = useState(session.progress?.portraitDataUrl ?? "");
  const [characterCoins, setCharacterCoins] = useState(character.coins);
  const [coinContainerId, setCoinContainerId] = useState<string | null>(session.progress?.coinContainerId ?? null);
  const [currentCareerRank, setCurrentCareerRank] = useState(character.level);
  const [currentCharacteristicInitials, setCurrentCharacteristicInitials] = useState(
    session.progress?.characteristicInitials ?? getCharacteristicInitials(character),
  );
  const [currentCharacteristicAdvances, setCurrentCharacteristicAdvances] = useState(character.characteristicAdvances);
  const [characterSkills, setCharacterSkills] = useState(character.skills);
  const [characterTalents, setCharacterTalents] = useState(character.talents);
  const [characterSpells, setCharacterSpells] = useState(character.spells);
  const [equipmentState, setEquipmentState] = useState(character.equipment);
  const [backgroundText, setBackgroundText] = useState(session.progress?.backgroundText ?? "");
  const [notes, setNotes] = useState(session.progress?.notes ?? []);
  const normalizedCoinContainerId =
    coinContainerId && equipmentState.some((item) => item.id === coinContainerId)
      ? coinContainerId
      : null;

  const setFateCurrent = (action: SetStateAction<number>) => {
    setRawFateCurrent((previousFate) => {
      const nextFate = Math.max(0, resolveNumberStateAction(action, previousFate));

      setRawFortuneCurrent((previousFortune) =>
        clampResource(previousFortune, nextFate),
      );

      return nextFate;
    });
  };

  const setFortuneCurrent = (action: SetStateAction<number>) => {
    setRawFortuneCurrent((previousFortune) =>
      clampResource(resolveNumberStateAction(action, previousFortune), fateCurrent),
    );
  };

  const spendFate = () => {
    if (fateCurrent <= 0) {
      return false;
    }

    setFateCurrent((current) => current - 1);
    return true;
  };

  const spendFateForDieAnotherDay = () => spendFate();
  const spendFateForHowDidThatMiss = () => spendFate();

  const spendFortune = () => {
    if (fortuneCurrent <= 0) {
      return false;
    }

    setFortuneCurrent((current) => current - 1);
    return true;
  };

  const spendFortuneForRerollFailedTest = () => spendFortune();
  const spendFortuneForAddOneSl = () => spendFortune();
  const spendFortuneForChooseInitiative = () => spendFortune();

  const setResilienceCurrent = (action: SetStateAction<number>) => {
    setRawResilienceCurrent((previousResilience) => {
      const nextResilience = Math.max(0, resolveNumberStateAction(action, previousResilience));

      setRawResolveCurrent((previousResolve) =>
        clampResource(previousResolve, nextResilience),
      );

      return nextResilience;
    });
  };

  const spendResilience = () => {
    if (resilienceCurrent <= 0) {
      return false;
    }

    setResilienceCurrent((current) => current - 1);
    return true;
  };

  const spendResilienceForDenyMutation = () => spendResilience();
  const spendResilienceForChooseTestResult = () => spendResilience();

  const setResolveCurrent = (action: SetStateAction<number>) => {
    setRawResolveCurrent((previousResolve) =>
      clampResource(resolveNumberStateAction(action, previousResolve), resilienceCurrent),
    );
  };

  const spendResolve = () => {
    if (resolveCurrent <= 0) {
      return false;
    }

    setResolveCurrent((current) => current - 1);
    return true;
  };

  const spendResolveForIgnorePsychology = () => spendResolve();
  const spendResolveForIgnoreCriticalWounds = () => spendResolve();
  const spendResolveForRemoveProne = () => {
    const didSpend = spendResolve();

    if (didSpend) {
      setWoundsCurrent((current) =>
        clampResource(current + 1, character.wounds.max + character.wounds.temp),
      );
    }

    return didSpend;
  };

  useEffect(() => {
    let isCancelled = false;

    async function hydrateProgress() {
      await hydrateCharacterProgress(selectedCharacterId);

      if (!isCancelled) {
        setIsProgressHydrated(true);
        setHydratedCharacterId(selectedCharacterId);
        setProgressHydrationVersion((version) => version + 1);
      }
    }

    setIsProgressHydrated(false);
    setIsSessionStateReadyToSave(false);
    setHydratedCharacterId(null);
    void hydrateProgress();

    return () => {
      isCancelled = true;
    };
  }, [selectedCharacterId]);

  useEffect(() => {
    setWoundsCurrent(character.wounds.current);
    setCorruptionCurrent(initialCorruptionCurrent);
    setRawFateCurrent(initialFateCurrent);
    setRawFortuneCurrent(clampResource(initialFortuneCurrent, initialFateCurrent));
    setRawResilienceCurrent(initialResilienceCurrent);
    setRawResolveCurrent(clampResource(initialResolveCurrent, initialResilienceCurrent));
    setXpCurrent(initialXpCurrent);
    setXpTotal(character.xpTotal);
    setCharacterName(character.name);
    setPortraitDataUrl(session.progress?.portraitDataUrl ?? "");
    setCharacterCoins(character.coins);
    setCoinContainerId(session.progress?.coinContainerId ?? null);
    setCurrentCareerRank(character.level);
    setCurrentCharacteristicInitials(session.progress?.characteristicInitials ?? getCharacteristicInitials(character));
    setCurrentCharacteristicAdvances(character.characteristicAdvances);
    setCharacterSkills(character.skills);
    setCharacterTalents(character.talents);
    setCharacterSpells(character.spells);
    setEquipmentState(character.equipment);
    setBackgroundText(session.progress?.backgroundText ?? "");
    setNotes(session.progress?.notes ?? []);
    setIsSessionStateReadyToSave(isProgressHydrated);
  }, [
    character,
    isProgressHydrated,
    initialCorruptionCurrent,
    initialFateCurrent,
    initialFortuneCurrent,
    initialResilienceCurrent,
    initialResolveCurrent,
    initialXpCurrent,
    session.progress,
  ]);

  useEffect(() => {
    setRawFortuneCurrent((prev) => clampResource(prev, fateCurrent));
  }, [fateCurrent]);

  useEffect(() => {
    setRawResolveCurrent((prev) => clampResource(prev, resilienceCurrent));
  }, [resilienceCurrent]);

  useEffect(() => {
    if (
      !isProgressHydrated ||
      !isSessionStateReadyToSave ||
      hydratedCharacterId !== selectedCharacterId ||
      character.id !== selectedCharacterId
    ) {
      return;
    }

    saveGameSessionProgress(selectedCharacterId, {
      woundsCurrent,
      corruptionCurrent,
      fateCurrent,
      fortuneCurrent: clampResource(fortuneCurrent, fateCurrent),
      resilienceCurrent,
      resolveCurrent: clampResource(resolveCurrent, resilienceCurrent),
      xpCurrent,
      xpBaselineTotal: xpTotal,
      characterName,
      portraitDataUrl,
      coins: characterCoins,
      coinContainerId: normalizedCoinContainerId,
      careerCurrentRank: currentCareerRank,
      characteristicInitials: currentCharacteristicInitials,
      characteristicAdvances: currentCharacteristicAdvances,
      skills: Object.fromEntries(
        characterSkills.map((skill) => [getCharacterSkillKey(skill), skill.advances]),
      ),
      talentIds: characterTalents.map((talent) => talent.id),
      spellIds: characterSpells.map((spell) => spell.id),
      equipment: Object.fromEntries(
        equipmentState.map((item) => [item.id, item.equipped]),
      ),
      equipmentContainers: Object.fromEntries(
        equipmentState.map((item) => [item.id, item.containerId ?? null]),
      ),
      consumableCounts: Object.fromEntries(
        equipmentState
          .filter((item) => item.type === "Consumable")
          .map((item) => [item.id, getConsumableCount(item) ?? 1]),
      ),
      addedEquipment: equipmentState
        .filter((item) => item.id.startsWith("shop-"))
        .map((item) => ({
          id: item.id,
          itemId: item.itemId,
          equipped: item.equipped,
          containerId: item.containerId ?? null,
        })),
      removedEquipmentIds: character.equipment
        .filter((item) => !equipmentState.some((currentItem) => currentItem.id === item.id))
        .map((item) => item.id),
      backgroundText,
      notes,
    });
  }, [
    isProgressHydrated,
    isSessionStateReadyToSave,
    hydratedCharacterId,
    selectedCharacterId,
    character.id,
    character.equipment,
    woundsCurrent,
    corruptionCurrent,
    fateCurrent,
    fortuneCurrent,
    resilienceCurrent,
    resolveCurrent,
    xpCurrent,
    xpTotal,
    characterName,
    portraitDataUrl,
    characterCoins,
    normalizedCoinContainerId,
    currentCareerRank,
    currentCharacteristicInitials,
    currentCharacteristicAdvances,
    characterSkills,
    characterTalents,
    characterSpells,
    equipmentState,
    backgroundText,
    notes,
  ]);

  const currentCareer =
    character.careerRecord.ranks.find((rank) => rank.rank === currentCareerRank) ??
    character.careerRecord.ranks.find((rank) => rank.rank === character.careerRecord.level) ??
    null;
  const characterData = {
    ...character,
    name: characterName,
    xpTotal,
    attributes: Object.fromEntries(
      Object.keys(character.attributes).map((key) => {
        const baseInitial = getCharacteristicInitials(character)[key] ?? 0;
        const currentInitial = currentCharacteristicInitials[key] ?? baseInitial;
        const currentAdvances = currentCharacteristicAdvances[key] ?? 0;
        return [key, currentInitial + currentAdvances];
      }),
    ),
    characteristicAdvances: currentCharacteristicAdvances,
    coins: characterCoins,
    level: currentCareer?.rank ?? character.level,
    status: currentCareer?.status ?? character.status,
    careerRecord: {
      ...character.careerRecord,
      level: currentCareer?.rank ?? character.careerRecord.level,
      status: currentCareer?.status ?? character.careerRecord.status,
    },
    spells: characterSpells,
  };

  const careerAdvancementData = getCareerAdvancementData(
    { name: characterData.career, tier: characterData.tier },
    rulesIndex,
  );

  const resourceCaps = {
    ...baseResourceCaps,
    fate: fateCurrent,
    resilience: resilienceCurrent,
    fortune: fateCurrent,
    resolve: resilienceCurrent,
  };

  return {
    selectedCharacterId,
    setSelectedCharacterId,
    characterData,
    ruleset,
    rulesIndex,
    resourceCaps,
    careerAdvancementData,
    initialTalentIds,
    woundsCurrent,
    setWoundsCurrent,
    corruptionCurrent,
    setCorruptionCurrent,
    fateCurrent,
    setFateCurrent,
    fateSpendActions,
    spendFate,
    spendFateForDieAnotherDay,
    spendFateForHowDidThatMiss,
    fortuneCurrent,
    setFortuneCurrent,
    fortuneSpendActions,
    spendFortune,
    spendFortuneForRerollFailedTest,
    spendFortuneForAddOneSl,
    spendFortuneForChooseInitiative,
    resilienceCurrent,
    setResilienceCurrent,
    resilienceSpendActions,
    spendResilience,
    spendResilienceForDenyMutation,
    spendResilienceForChooseTestResult,
    resolveCurrent,
    setResolveCurrent,
    resolveSpendActions,
    spendResolve,
    spendResolveForIgnorePsychology,
    spendResolveForIgnoreCriticalWounds,
    spendResolveForRemoveProne,
    xpCurrent,
    setXpCurrent,
    xpTotal,
    setXpTotal,
    characterName,
    setCharacterName,
    portraitDataUrl,
    setPortraitDataUrl,
    characterCoins,
    setCharacterCoins,
    coinContainerId: normalizedCoinContainerId,
    setCoinContainerId,
    currentCareerRank,
    setCurrentCareerRank,
    currentCharacteristicInitials,
    setCurrentCharacteristicInitials,
    currentCharacteristicAdvances,
    setCurrentCharacteristicAdvances,
    characterSkills,
    setCharacterSkills,
    characterTalents,
    setCharacterTalents,
    characterSpells,
    setCharacterSpells,
    equipmentState,
    setEquipmentState,
    backgroundText,
    setBackgroundText,
    notes,
    setNotes,
  };
}

export type GameSessionHook = ReturnType<typeof useGameSession>;
export type GameSessionSkillState = ResolvedCharacterSkill;
export type GameSessionTalentState = ResolvedCharacterTalent;
export type GameSessionSpellState = ResolvedCharacterSpell;
export type GameSessionEquipmentState = ResolvedCharacterEquipment;
