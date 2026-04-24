import type { CharacterProgressData } from "../types";

const STORAGE_KEY = "wfrp-sheet.character-progress.v1";

type CharacterProgressMap = Record<string, CharacterProgressData>;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readProgressMap(): CharacterProgressMap {
  if (!canUseStorage()) {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as CharacterProgressMap;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function writeProgressMap(progressMap: CharacterProgressMap) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
}

export function loadCharacterProgress(characterId: string): CharacterProgressData | null {
  return readProgressMap()[characterId] ?? null;
}

export function saveCharacterProgress(characterId: string, progress: CharacterProgressData) {
  const progressMap = readProgressMap();
  progressMap[characterId] = progress;
  writeProgressMap(progressMap);
}

export function clearCharacterProgress(characterId: string) {
  const progressMap = readProgressMap();
  delete progressMap[characterId];
  writeProgressMap(progressMap);
}
