import type { CharacterRecord } from "../../types";
import { thanoVoss } from "./thano-voss";

export const characterRecords: CharacterRecord[] = [thanoVoss];

export const characterRecordById = Object.fromEntries(
  characterRecords.map((character) => [character.id, character]),
);

export const defaultCharacterId = thanoVoss.id;
