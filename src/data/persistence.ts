import type { CharacterProgressData } from "../types";

const characterProgressEndpoint = (characterId: string) =>
  `/api/character-progress/${encodeURIComponent(characterId)}`;

type CharacterProgressMap = Record<string, CharacterProgressData>;

let progressCache: CharacterProgressMap = {};

function readProgressMap(): CharacterProgressMap {
  return progressCache;
}

function writeProgressMap(progressMap: CharacterProgressMap) {
  progressCache = progressMap;
}

async function writeCharacterProgressFile(characterId: string, progress: CharacterProgressData) {
  if (typeof fetch === "undefined") {
    return;
  }

  try {
    await fetch(characterProgressEndpoint(characterId), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(progress),
    });
  } catch {
    // The UI keeps the latest values in memory, but durable saves require the server endpoint.
  }
}

async function deleteCharacterProgressFile(characterId: string) {
  if (typeof fetch === "undefined") {
    return;
  }

  try {
    await fetch(characterProgressEndpoint(characterId), {
      method: "DELETE",
    });
  } catch {
    // The UI keeps the latest values in memory, but durable saves require the server endpoint.
  }
}

export async function hydrateCharacterProgress(characterId: string) {
  if (typeof fetch === "undefined") {
    return;
  }

  try {
    const response = await fetch(characterProgressEndpoint(characterId));
    if (!response.ok) {
      return;
    }

    const characterProgress = (await response.json()) as CharacterProgressData | null;
    writeProgressMap({
      ...readProgressMap(),
      ...(characterProgress ? { [characterId]: characterProgress } : {}),
    });
  } catch {
    // Keep the current in-memory values if the server cannot be read.
  }
}

export function loadCharacterProgress(characterId: string): CharacterProgressData | null {
  return readProgressMap()[characterId] ?? null;
}

export function saveCharacterProgress(characterId: string, progress: CharacterProgressData) {
  writeProgressMap({
    ...readProgressMap(),
    [characterId]: progress,
  });
  void writeCharacterProgressFile(characterId, progress);
}

export function clearCharacterProgress(characterId: string) {
  const progressMap = { ...readProgressMap() };
  delete progressMap[characterId];
  writeProgressMap(progressMap);
  void deleteCharacterProgressFile(characterId);
}
