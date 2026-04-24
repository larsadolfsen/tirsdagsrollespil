import { useEffect, useMemo, useState } from "react";
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
  ResolvedCharacterTalent,
} from "../data/characters/resolved";

export function useGameSession() {
  const [selectedCharacterId, setSelectedCharacterId] = useState(defaultCharacterId);

  const session = useMemo(() => loadGameSession(selectedCharacterId), [selectedCharacterId]);
  const {
    character,
    ruleset,
    rulesIndex,
    resourceCaps,
    initialCorruptionCurrent,
    initialFateCurrent,
    initialFortuneCurrent,
    initialResilienceCurrent,
    initialResolveCurrent,
    initialXpCurrent,
  } = session;

  const [woundsCurrent, setWoundsCurrent] = useState(character.wounds.current);
  const [corruptionCurrent, setCorruptionCurrent] = useState(initialCorruptionCurrent);
  const [fateCurrent, setFateCurrent] = useState(initialFateCurrent);
  const [fortuneCurrent, setFortuneCurrent] = useState(initialFortuneCurrent);
  const [resilienceCurrent, setResilienceCurrent] = useState(initialResilienceCurrent);
  const [resolveCurrent, setResolveCurrent] = useState(initialResolveCurrent);
  const [xpCurrent, setXpCurrent] = useState(initialXpCurrent);
  const [currentCareerRank, setCurrentCareerRank] = useState(character.level);
  const [characterSkills, setCharacterSkills] = useState(character.skills);
  const [characterTalents, setCharacterTalents] = useState(character.talents);
  const [equipmentState, setEquipmentState] = useState(character.equipment);

  useEffect(() => {
    setWoundsCurrent(character.wounds.current);
    setCorruptionCurrent(initialCorruptionCurrent);
    setFateCurrent(initialFateCurrent);
    setFortuneCurrent(initialFortuneCurrent);
    setResilienceCurrent(initialResilienceCurrent);
    setResolveCurrent(initialResolveCurrent);
    setXpCurrent(initialXpCurrent);
    setCurrentCareerRank(character.level);
    setCharacterSkills(character.skills);
    setCharacterTalents(character.talents);
    setEquipmentState(character.equipment);
  }, [
    character,
    initialCorruptionCurrent,
    initialFateCurrent,
    initialFortuneCurrent,
    initialResilienceCurrent,
    initialResolveCurrent,
    initialXpCurrent,
  ]);

  useEffect(() => {
    setFortuneCurrent((prev) => Math.min(prev, fateCurrent));
  }, [fateCurrent]);

  useEffect(() => {
    setResolveCurrent((prev) => Math.min(prev, resilienceCurrent));
  }, [resilienceCurrent]);

  useEffect(() => {
    saveGameSessionProgress(selectedCharacterId, {
      woundsCurrent,
      corruptionCurrent,
      fateCurrent,
      fortuneCurrent,
      resilienceCurrent,
      resolveCurrent,
      xpCurrent,
      xpBaselineTotal: character.xpTotal,
      careerCurrentRank: currentCareerRank,
      skills: Object.fromEntries(
        characterSkills.map((skill) => [getCharacterSkillKey(skill), skill.advances]),
      ),
      talentIds: characterTalents.map((talent) => talent.id),
      equipment: Object.fromEntries(
        equipmentState.map((item) => [item.id, item.equipped]),
      ),
      equipmentContainers: Object.fromEntries(
        equipmentState.map((item) => [item.id, item.containerId ?? null]),
      ),
      removedEquipmentIds: character.equipment
        .filter((item) => !equipmentState.some((currentItem) => currentItem.id === item.id))
        .map((item) => item.id),
    });
  }, [
    selectedCharacterId,
    character.equipment,
    woundsCurrent,
    corruptionCurrent,
    fateCurrent,
    fortuneCurrent,
    resilienceCurrent,
    resolveCurrent,
    xpCurrent,
    currentCareerRank,
    characterSkills,
    characterTalents,
    equipmentState,
  ]);

  const currentCareer =
    character.careerRecord.ranks.find((rank) => rank.rank === currentCareerRank) ??
    character.careerRecord.ranks.find((rank) => rank.rank === character.careerRecord.level) ??
    null;
  const characterData = {
    ...character,
    level: currentCareer?.rank ?? character.level,
    status: currentCareer?.status ?? character.status,
    careerRecord: {
      ...character.careerRecord,
      level: currentCareer?.rank ?? character.careerRecord.level,
      status: currentCareer?.status ?? character.careerRecord.status,
    },
  };

  const careerAdvancementData = getCareerAdvancementData(
    { name: characterData.career, tier: characterData.tier },
    rulesIndex,
  );

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
    currentCareerRank,
    setCurrentCareerRank,
    characterSkills,
    setCharacterSkills,
    characterTalents,
    setCharacterTalents,
    equipmentState,
    setEquipmentState,
  };
}

export type GameSessionHook = ReturnType<typeof useGameSession>;
export type GameSessionSkillState = ResolvedCharacterSkill;
export type GameSessionTalentState = ResolvedCharacterTalent;
export type GameSessionEquipmentState = ResolvedCharacterEquipment;
