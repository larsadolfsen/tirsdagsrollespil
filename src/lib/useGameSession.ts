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
  ResolvedCharacterSpell,
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
  const [characterCoins, setCharacterCoins] = useState(character.coins);
  const [currentCareerRank, setCurrentCareerRank] = useState(character.level);
  const [currentCharacteristicAdvances, setCurrentCharacteristicAdvances] = useState(character.characteristicAdvances);
  const [characterSkills, setCharacterSkills] = useState(character.skills);
  const [characterTalents, setCharacterTalents] = useState(character.talents);
  const [characterSpells, setCharacterSpells] = useState(character.spells);
  const [equipmentState, setEquipmentState] = useState(character.equipment);
  const [backgroundText, setBackgroundText] = useState(session.progress?.backgroundText ?? "");
  const [notes, setNotes] = useState(session.progress?.notes ?? []);

  useEffect(() => {
    setWoundsCurrent(character.wounds.current);
    setCorruptionCurrent(initialCorruptionCurrent);
    setFateCurrent(initialFateCurrent);
    setFortuneCurrent(initialFortuneCurrent);
    setResilienceCurrent(initialResilienceCurrent);
    setResolveCurrent(initialResolveCurrent);
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
