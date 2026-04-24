import type { CharacterRecord } from "../../types";
import { eldricHornwood } from "./eldric-hornwood";

export const characterRecords: CharacterRecord[] = [eldricHornwood];

export const characterRecordById = Object.fromEntries(
  characterRecords.map((character) => [character.id, character]),
);

export const defaultCharacterId = eldricHornwood.id;
