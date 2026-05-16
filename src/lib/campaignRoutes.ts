import type { MainTab, MobileTabMenuTarget } from "../tabs/tabTypes";
import { defaultCampaignId } from "../data/campaigns";

export { defaultCampaignId } from "../data/campaigns";

const campaignCharacterRoutePattern = /^\/([^/]+)\/([^/]+)(?:\/([^/?#]+))?\/?$/;
const characterViewPathSegments: Record<MobileTabMenuTarget, string> = {
  characteristics: "characteristics",
  skills: "skills",
  actions: "actions",
  inventory: "inventory",
  spells: "spells",
  features: "talents",
  journal: "journal",
  career: "advance",
};
const viewAliases: Record<string, MobileTabMenuTarget> = {
  action: "actions",
  actions: "actions",
  advance: "career",
  career: "career",
  careers: "career",
  characteristics: "characteristics",
  features: "features",
  inventory: "inventory",
  journal: "journal",
  notes: "journal",
  skills: "skills",
  spells: "spells",
  talents: "features",

  // Keep existing routes working while new URLs use page-title slugs.
  faner: "skills",
};
const mainTabByCharacterView: Record<MobileTabMenuTarget, MainTab> = {
  characteristics: "skills",
  skills: "skills",
  actions: "actions",
  inventory: "inventory",
  spells: "spells",
  features: "features",
  journal: "journal",
  career: "career",
};

export type CampaignCharacterRoute = {
  campaignId: string;
  characterId: string;
  view: MobileTabMenuTarget;
  tab: MainTab;
  hasExplicitView: boolean;
};

const decodePathSegment = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};
const encodePathSegment = (value: string) => encodeURIComponent(value);

export function parseCampaignCharacterPath(pathname: string): CampaignCharacterRoute | null {
  const match = campaignCharacterRoutePattern.exec(pathname);
  if (!match) return null;

  const [, campaignIdSegment, characterIdSegment, viewSegment] = match;
  const campaignId = decodePathSegment(campaignIdSegment);
  const characterId = decodePathSegment(characterIdSegment);
  const hasExplicitView = Boolean(viewSegment);
  const view = viewAliases[(viewSegment ?? characterViewPathSegments.characteristics).toLowerCase()];

  if (!campaignId || !characterId || !view) return null;

  return {
    campaignId,
    characterId,
    view,
    tab: mainTabByCharacterView[view],
    hasExplicitView,
  };
}

export function buildCampaignCharacterPath({
  campaignId = defaultCampaignId,
  characterId,
  view,
  omitDefaultView = false,
}: {
  campaignId?: string;
  characterId: string;
  view: MobileTabMenuTarget;
  omitDefaultView?: boolean;
}) {
  const characterPath = `/${encodePathSegment(campaignId)}/${encodePathSegment(characterId)}`;

  if (omitDefaultView && view === "characteristics") {
    return characterPath;
  }

  return `${characterPath}/${characterViewPathSegments[view]}`;
}
