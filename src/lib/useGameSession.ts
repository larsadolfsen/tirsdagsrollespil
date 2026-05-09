import { useEffect, useMemo, useState } from "react";
import type { SetStateAction } from "react";
import { hydrateCharacterProgress } from "../data/persistence";
import { defaultCharacterId } from "../data/repository";
import {
  getCareerAdvancementData,
  getCharacterSkillKey,
  loadGameSession,
  saveGameSessionProgress,
} from "./gameSession";
import type {
  ResolvedCharacterEquipment,
  ResolvedCharacterSkill,
  ResolvedCharacterSpell,
  ResolvedCharacterTalent,
} from "../data/characters/resolved";

const getConsumableCount = (item: ResolvedCharacterEquipment) => {
  if (item.type !== "Consumable") return null;

  const match = item.name.match(/\((\d+)\)\s*$/);
  return match ? Number(match[1]) : 1;
};

const clampResource = (value: number, max: number) =>
  Math.max(0, Math.min(value, max));

const resolveNumberStateAction = (action: SetStateAction<number>, previousValue: number) =>
  typeof action === "function"
    ? (action as (previousValue: number) => number)(previousValue)
    : action;

export function useGameSession() {
  const [selectedCharacterId, setSelectedCharacterId] = useState(defaultCharacterId);
  const [isProgressHydrated, setIsProgressHydrated] = useState(false);
  const [progressHydrationVersion, setProgressHydrationVersion] = useState(0);

  const session = useMemo(
    () => loadGameSession(selectedCharacterId),
    [selectedCharacterId, progressHydrationVersion],
  );
  const {
    character,
    ruleset,
    rulesIndex,
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
  const [characterCoins, setCharacterCoins] = useState(character.coins);
  const [currentCareerRank, setCurrentCareerRank] = useState(character.level);
  const [currentCharacteristicAdvances, setCurrentCharacteristicAdvances] = useState(character.characteristicAdvances);
  const [characterSkills, setCharacterSkills] = useState(character.skills);
  const [characterTalents, setCharacterTalents] = useState(character.talents);
  const [characterSpells, setCharacterSpells] = useState(character.spells);
  const [equipmentState, setEquipmentState] = useState(character.equipment);
  const [backgroundText, setBackgroundText] = useState(session.progress?.backgroundText ?? "");
  const [notes, setNotes] = useState(session.progress?.notes ?? []);

  const setFateCurrent = (action: SetStateAction<number>) => {
    setRawFateCurrent((previousFate) => {
      const nextFate = clampResource(
        resolveNumberStateAction(action, previousFate),
        baseResourceCaps.fate,
      );

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

  const setResilienceCurrent = (action: SetStateAction<number>) => {
    setRawResilienceCurrent((previousResilience) => {
      const nextResilience = clampResource(
        resolveNumberStateAction(action, previousResilience),
        baseResourceCaps.resilience,
      );

      setRawResolveCurrent((previousResolve) =>
        clampResource(previousResolve, nextResilience),
      );

      return nextResilience;
    });
  };

  const setResolveCurrent = (action: SetStateAction<number>) => {
    setRawResolveCurrent((previousResolve) =>
      clampResource(resolveNumberStateAction(action, previousResolve), resilienceCurrent),
    );
  };

  useEffect(() => {
    let isCancelled = false;

    async function hydrateProgress() {
      await hydrateCharacterProgress();

      if (!isCancelled) {
        setIsProgressHydrated(true);
        setProgressHydrationVersion((version) => version + 1);
      }
    }

    setIsProgressHydrated(false);
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
    setCharacterCoins(character.coins);
    setCurrentCareerRank(character.level);
    setCurrentCharacteristicAdvances(character.characteristicAdvances);
    setCharacterSkills(character.skills);
    setCharacterTalents(character.talents);
    setCharacterSpells(character.spells);
    setEquipmentState(character.equipment);
    setBackgroundText(session.progress?.backgroundText ?? "");
    setNotes(session.progress?.notes ?? []);
  }, [
    character,
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
    if (!isProgressHydrated) {
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
      xpBaselineTotal: character.xpTotal,
      coins: characterCoins,
      careerCurrentRank: currentCareerRank,
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
    selectedCharacterId,
    character.equipment,
    woundsCurrent,
    corruptionCurrent,
    fateCurrent,
    fortuneCurrent,
    resilienceCurrent,
    resolveCurrent,
    xpCurrent,
    characterCoins,
    currentCareerRank,
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
    attributes: Object.fromEntries(
      Object.entries(character.attributes).map(([key, value]) => {
        const baseAdvances = character.characteristicAdvances[key] ?? 0;
        const currentAdvances = currentCharacteristicAdvances[key] ?? baseAdvances;
        return [key, Number(value) + (currentAdvances - baseAdvances)];
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
    woundsCurrent,
    setWoundsCurrent,
    corruptionCurrent,
    setCorruptionCurrent,
    fateCurrent,
    setFateCurrent,
    fortuneCurrent,
    setFortuneCurrent,
    resilienceCurrent,
    setResilienceCurrent,
    resolveCurrent,
    setResolveCurrent,
    xpCurrent,
    setXpCurrent,
    characterCoins,
    setCharacterCoins,
    currentCareerRank,
    setCurrentCareerRank,
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
