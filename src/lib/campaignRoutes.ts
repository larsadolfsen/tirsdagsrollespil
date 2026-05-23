import type { MainTab, MobileTabMenuTarget } from "../tabs/tabTypes";
import { defaultCampaignId } from "../data/campaigns";

export { defaultCampaignId } from "../data/campaigns";

const campaignCharacterRoutePattern = /^\/([^/]+)\/([^/]+)(?:\/([^/?#]+))?\/?$/;
const mainTabPathSegments: Record<MobileTabMenuTarget, string> = {
  characteristics: "characteristics",
  skills: "skills",
  actions: "actions",
  inventory: "inventory",
  spells: "spells",
  features: "talents",
  journal: "journal",
  career: "advance",
};
const tabAliases: Record<string, MobileTabMenuTarget> = {
  actions: "actions",
  action: "actions",
  advance: "career",
  career: "career",
  careers: "career",
  characteristics: "characteristics",
  karakteristika: "characteristics",
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
  tab: MobileTabMenuTarget;
  hasExplicitTab: boolean;
};

export const defaultCampaignCharacterTab: MobileTabMenuTarget = "characteristics";

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

  const [, campaignIdSegment, characterIdSegment, tabSegment] = match;
  const campaignId = decodePathSegment(campaignIdSegment);
  const characterId = decodePathSegment(characterIdSegment);
  const hasExplicitTab = Boolean(tabSegment);
  const tab = tabAliases[(tabSegment ?? mainTabPathSegments[defaultCampaignCharacterTab]).toLowerCase()];

  if (!campaignId || !characterId || !tab) return null;

  return {
    campaignId,
    characterId,
    tab,
    hasExplicitTab,
  };
}

export function buildCampaignCharacterPath({
  campaignId = defaultCampaignId,
  characterId,
  tab,
  omitDefaultTab = false,
}: {
  campaignId?: string;
  characterId: string;
  tab: MobileTabMenuTarget;
  omitDefaultTab?: boolean;
}) {
  const characterPath = `/${encodePathSegment(campaignId)}/${encodePathSegment(characterId)}`;

  if (omitDefaultTab && tab === defaultCampaignCharacterTab) {
    return characterPath;
  }

  return `${characterPath}/${mainTabPathSegments[tab]}`;
}
