import type { NpcTemplate } from "./npcTypes";
import type { CreatureTemplate } from "./rules/wfrp4e/creatureCatalog";

export type AdversaryEditorType = "npc" | "generic" | "creature";

export type AdversaryEditorRecord =
  | { type: "npc"; record: NpcTemplate }
  | { type: "generic"; record: NpcTemplate }
  | { type: "creature"; record: CreatureTemplate };
