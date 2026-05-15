import type { MainTab } from "../tabs/tabTypes";

const campaignCharacterRoutePattern = /^\/kampagne\/([^/]+)\/karakter\/([^/]+)(?:\/([^/?#]+))?\/?$/;
const mainTabIds: readonly MainTab[] = ["skills", "actions", "inventory", "spells", "features", "journal", "career"];
const tabAliases: Record<string, MainTab> = {
  faner: "skills",
  talents: "features",
  advance: "career",
};

export type CampaignCharacterRoute = {
  campaignId: string;
  characterId: string;
  tab: MainTab;
};

export const defaultCampaignId = "min-kampagne";

const decodePathSegment = (value: string) => decodeURIComponent(value.replace(/\+/g, " "));
const encodePathSegment = (value: string) => encodeURIComponent(value);

export function parseCampaignCharacterPath(pathname: string): CampaignCharacterRoute | null {
  const match = campaignCharacterRoutePattern.exec(pathname);
  if (!match) return null;

  const [, campaignId, characterId, tabSegment = "skills"] = match;
  const normalizedTab = tabSegment.toLowerCase();
  const tab = mainTabIds.includes(normalizedTab as MainTab)
    ? normalizedTab as MainTab
    : tabAliases[normalizedTab];

  if (!tab) return null;

  return {
    campaignId: decodePathSegment(campaignId),
    characterId: decodePathSegment(characterId),
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
  return `/kampagne/${encodePathSegment(campaignId)}/karakter/${encodePathSegment(characterId)}/${tab}`;
}
