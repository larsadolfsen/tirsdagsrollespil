import { namedNpcsAG } from "./a-g";
import { namedNpcsHZ } from "./h-z";

const namedGenericInstanceIds = new Set([
  "three-feathers-gunni-bart-hans-frederick",
  "three-feathers-bart",
  "three-feathers-hans-frederick",
  "three-feathers-mho-larz-curls",
  "three-feathers-larz",
  "three-feathers-curls",
  "three-feathers-allrelia-elphoise-helga",
  "three-feathers-elphoise",
  "three-feathers-helga",
]);

export const namedNpcCatalog = [...namedNpcsAG, ...namedNpcsHZ].filter(
  (npc) => !namedGenericInstanceIds.has(npc.id),
);
