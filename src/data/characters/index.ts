import type { CharacterRecord } from "../../types";
import { karlMuller } from "./karl-muller";
import { gerlardo } from "./gerlardo";
import { thanoVoss } from "./thano-voss";

export const characterRecords: CharacterRecord[] = [thanoVoss, karlMuller, gerlardo];

export const characterRecordById = Object.fromEntries(
  characterRecords.map((character) => [character.id, character]),
);

export const defaultCharacterId = thanoVoss.id;
