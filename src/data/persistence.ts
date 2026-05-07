import type { CharacterProgressData } from "../types";

const FILE_PROGRESS_ENDPOINT = "/api/character-progress";

type CharacterProgressMap = Record<string, CharacterProgressData>;

let progressCache: CharacterProgressMap = {};

function readProgressMap(): CharacterProgressMap {
  return progressCache;
}

function writeProgressMap(progressMap: CharacterProgressMap) {
  progressCache = progressMap;
}

async function writeProgressFile(progressMap: CharacterProgressMap) {
  if (typeof fetch === "undefined") {
    return;
  }

  try {
    await fetch(FILE_PROGRESS_ENDPOINT, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(progressMap),
    });
  } catch {
    // The UI keeps the latest values in memory, but durable saves require the server endpoint.
  }
}

export async function hydrateCharacterProgress() {
  if (typeof fetch === "undefined") {
    return;
  }

  try {
    const response = await fetch(FILE_PROGRESS_ENDPOINT);
    if (!response.ok) {
      return;
    }

    const fileProgressMap = (await response.json()) as CharacterProgressMap;
    writeProgressMap(fileProgressMap ?? {});
  } catch {
    // Keep the current in-memory values if the server cannot be read.
  }
}

export function loadCharacterProgress(characterId: string): CharacterProgressData | null {
  return readProgressMap()[characterId] ?? null;
}

export function saveCharacterProgress(characterId: string, progress: CharacterProgressData) {
  const progressMap = readProgressMap();
  progressMap[characterId] = progress;
  writeProgressMap(progressMap);
  void writeProgressFile(progressMap);
}

export function clearCharacterProgress(characterId: string) {
  const progressMap = readProgressMap();
  delete progressMap[characterId];
  writeProgressMap(progressMap);
  void writeProgressFile(progressMap);
}
