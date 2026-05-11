import type { CharacterRecord } from "../../types";
import { karlMuller } from "./karl-muller";
import { gerhardLehrmann } from "./gerhard-lehrmann";
import { thanoVoss } from "./thano-voss";

export const characterRecords: CharacterRecord[] = [thanoVoss, karlMuller, gerhardLehrmann];

export const characterRecordById = Object.fromEntries(
  characterRecords.map((character) => [character.id, character]),
);

export const defaultCharacterId = thanoVoss.id;
