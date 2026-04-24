import type { CharacterProgressData, CharacterRecord, Ruleset } from "../types";
import { defaultCharacterId, characterRecordById } from "./characters";
import type { ResolvedCharacterRecord } from "./characters/resolved";
import { resolveCharacterRecord } from "./characters/resolved";
import {
  clearCharacterProgress,
  loadCharacterProgress as loadPersistedCharacterProgress,
  saveCharacterProgress as persistCharacterProgress,
} from "./persistence";
import { rulesetById, rulesets } from "./rules";

export interface CharacterSummary {
  id: string;
  name: string;
  rulesetId: string;
}

export { defaultCharacterId };

export function listRulesets(): Ruleset[] {
  return rulesets;
}

export function loadRuleset(rulesetId: string): Ruleset {
  const ruleset = rulesetById[rulesetId];
  if (!ruleset) {
    throw new Error(`Unknown ruleset "${rulesetId}".`);
  }

  return ruleset;
}

export function listCharacters(): CharacterSummary[] {
  return Object.values(characterRecordById).map((character) => ({
    id: character.id,
    name: character.name,
    rulesetId: character.rulesetId,
  }));
}

export function loadCharacterRecord(characterId: string): CharacterRecord {
  const character = characterRecordById[characterId];
  if (!character) {
    throw new Error(`Unknown character "${characterId}".`);
  }

  return character;
}

export function loadResolvedCharacter(characterId: string): ResolvedCharacterRecord {
  const character = loadCharacterRecord(characterId);
  const ruleset = loadRuleset(character.rulesetId);

  return resolveCharacterRecord(character, ruleset);
}

export function loadDefaultCharacter(): ResolvedCharacterRecord {
  return loadResolvedCharacter(defaultCharacterId);
}

export function loadCharacterProgress(characterId: string): CharacterProgressData | null {
  return loadPersistedCharacterProgress(characterId);
}

export function saveCharacterProgress(characterId: string, progress: CharacterProgressData) {
  persistCharacterProgress(characterId, progress);
}

export function resetCharacterProgress(characterId: string) {
  clearCharacterProgress(characterId);
}
