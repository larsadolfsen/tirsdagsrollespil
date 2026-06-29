import { npcCatalog } from "./npcCatalog";
import { adversaryCatalog } from "./adversaryCatalog";
import type { NpcTemplate } from "./npcTypes";

export type { NpcStatBlock, NpcTemplate } from "./npcTypes";

export const npcTemplates: NpcTemplate[] = [
  ...npcCatalog,
];

export const adversaryTemplates: NpcTemplate[] = [
  ...adversaryCatalog,
];

export function expandNpcTemplate(npc: NpcTemplate): NpcTemplate[] {
  if (!npc.members?.length) {
    return [npc];
  }

  const { count: _count, members, ...sharedTemplate } = npc;
  return members.map((member) => ({
    ...sharedTemplate,
    ...member,
  }));
}

export const npcTemplatesById: Record<string, NpcTemplate> = Object.fromEntries(
  [...npcTemplates, ...adversaryTemplates]
    .flatMap((npc) => [npc, ...expandNpcTemplate(npc)])
    .map((npc) => [npc.id, npc]),
);

export function isNamedNpc(npc: NpcTemplate | undefined): npc is NpcTemplate {
  return Boolean(npc?.isNpc);
}
