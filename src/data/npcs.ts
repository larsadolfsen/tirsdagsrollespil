import { npcCatalog } from "./npcs/index";
import { genericCatalog } from "./generic";
import type { NpcTemplate } from "./npcTypes";

export type { NpcStatBlock, NpcTemplate } from "./npcTypes";

export const npcTemplates: NpcTemplate[] = [
  ...npcCatalog,
];

export const genericTemplates: NpcTemplate[] = [
  ...genericCatalog,
];

export const genericTemplatesById: Record<string, NpcTemplate> = Object.fromEntries(
  genericTemplates.map((template) => [template.id, template]),
);

/** @deprecated Use genericTemplates. */
export const adversaryTemplates = genericTemplates;

const legacyNamedGenericAliases: Array<{
  id: string;
  name: string;
  templateId: string;
}> = [
  { id: "three-feathers-gunni-bart-hans-frederick", name: "Gunni", templateId: "three-feathers-morrian-smuggler" },
  { id: "three-feathers-bart", name: "Bart", templateId: "three-feathers-morrian-smuggler" },
  { id: "three-feathers-hans-frederick", name: "Hans-Frederick", templateId: "three-feathers-morrian-smuggler" },
  { id: "three-feathers-mho-larz-curls", name: "Mho", templateId: "three-feathers-hired-thug" },
  { id: "three-feathers-larz", name: "Larz", templateId: "three-feathers-hired-thug" },
  { id: "three-feathers-curls", name: "'Curls'", templateId: "three-feathers-hired-thug" },
  { id: "three-feathers-allrelia-elphoise-helga", name: "Allrelia", templateId: "three-feathers-ordo-ultima-agent" },
  { id: "three-feathers-elphoise", name: "Elphoise", templateId: "three-feathers-ordo-ultima-agent" },
  { id: "three-feathers-helga", name: "Helga", templateId: "three-feathers-ordo-ultima-agent" },
];

const legacyNamedGenericTemplates = legacyNamedGenericAliases.flatMap(
  ({ id, name, templateId }) => {
    const template = genericTemplatesById[templateId];
    return template ? [{ ...template, id, name, isNpc: true }] : [];
  },
);

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
  [...npcTemplates, ...genericTemplates, ...legacyNamedGenericTemplates]
    .flatMap((npc) => [npc, ...expandNpcTemplate(npc)])
    .map((npc) => [npc.id, npc]),
);

export function isNamedNpc(npc: NpcTemplate | undefined): npc is NpcTemplate {
  return Boolean(npc?.isNpc);
}
