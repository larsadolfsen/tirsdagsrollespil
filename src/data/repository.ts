import type { CharacterProgressData, CharacterRecord, Ruleset } from "../types";
import { defaultCharacterId, characterRecordById } from "./characters";
import type { ResolvedCharacterRecord } from "./characters/resolved";
import { resolveCharacterRecord } from "./characters/resolved";
import {
  clearCharacterProgress,
  loadCharacterProgress as loadPersistedCharacterProgress,
  saveCharacterProgress as persistCharacterProgress,
} from "./persistence";
import { campaignById, campaigns, type CampaignRecord } from "./campaigns";
import { rulesetById, rulesets } from "./rules";

export interface CharacterSummary {
  id: string;
  campaignId: string;
  name: string;
  aka: string[];
  rulesetId: string;
}

export { defaultCharacterId };

export function listCampaigns(): CampaignRecord[] {
  return campaigns;
}

export function loadCampaign(campaignId: string): CampaignRecord {
  const campaign = campaignById[campaignId];
  if (!campaign) {
    throw new Error(`Unknown campaign "${campaignId}".`);
  }

  return campaign;
}

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
    campaignId: character.campaignId,
    name: character.name,
    aka: character.aka ?? [],
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
