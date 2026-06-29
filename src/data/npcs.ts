import { threeFeathersNpcs } from "./rules/wfrp4e/threeFeathersNpcs";
import type { NpcTemplate } from "./npcTypes";

export type { NpcStatBlock, NpcTemplate } from "./npcTypes";

export const npcTemplates: NpcTemplate[] = [
  ...threeFeathersNpcs,
];

export const npcTemplatesById: Record<string, NpcTemplate> = Object.fromEntries(
  npcTemplates.map((npc) => [npc.id, npc]),
);
