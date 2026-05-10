import type { CharacterRecord } from "../../types";
import { gerlardo } from "./gerlardo";
import { tag } from "./tag";
import { thanoVoss } from "./thano-voss";

export const characterRecords: CharacterRecord[] = [thanoVoss, tag, gerlardo];

export const characterRecordById = Object.fromEntries(
  characterRecords.map((character) => [character.id, character]),
);

export const defaultCharacterId = thanoVoss.id;
