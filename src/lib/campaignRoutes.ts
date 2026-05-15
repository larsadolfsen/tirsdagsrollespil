import type { MainTab } from "../tabs/tabTypes";

const campaignCharacterRoutePattern = /^\/kampagne\/([^/]+)\/karakter\/([^/]+)(?:\/([^/?#]+))?\/?$/;
const mainTabPathSegments: Record<MainTab, string> = {
  skills: "faner",
  actions: "actions",
  inventory: "inventory",
  spells: "spells",
  features: "talents",
  journal: "journal",
  career: "advance",
};
const tabAliases: Record<string, MainTab> = {
  actions: "actions",
  action: "actions",
  advance: "career",
  career: "career",
  careers: "career",
  faner: "skills",
  features: "features",
  inventory: "inventory",
  journal: "journal",
  notes: "journal",
  skills: "skills",
  spells: "spells",
  talents: "features",
};

export type CampaignCharacterRoute = {
  campaignId: string;
  characterId: string;
  tab: MainTab;
};

export const defaultCampaignId = "min-kampagne";

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

  const [, campaignIdSegment, characterIdSegment, tabSegment = mainTabPathSegments.skills] = match;
  const campaignId = decodePathSegment(campaignIdSegment);
  const characterId = decodePathSegment(characterIdSegment);
  const tab = tabAliases[tabSegment.toLowerCase()];

  if (!campaignId || !characterId || !tab) return null;

  return {
    campaignId,
    characterId,
    tab,
  };
}

export function buildCampaignCharacterPath({
  campaignId = defaultCampaignId,
  characterId,
  tab,
}: {
  campaignId?: string;
  characterId: string;
  tab: MainTab;
}) {
  return `/kampagne/${encodePathSegment(campaignId)}/karakter/${encodePathSegment(characterId)}/${mainTabPathSegments[tab]}`;
}
