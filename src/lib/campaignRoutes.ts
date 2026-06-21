import type { MainTab, MobileMainView } from "../tabs/tabTypes";
import { campaignById, defaultCampaignId } from "../data/campaigns";
import { characterRecords } from "../data/characters";

export { defaultCampaignId } from "../data/campaigns";

const campaignCharacterRoutePattern = /^\/([^/]+)\/([^/]+)(?:\/([^/?#]+))?\/?$/;
const characterViewPathSegments: Record<MobileMainView, string> = {
  characteristics: "characteristics",
  skills: "skills",
  actions: "actions",
  inventory: "inventory",
  spells: "spells",
  features: "talents",
  journal: "journal",
  career: "advance",
};
const viewAliases: Record<string, MobileMainView> = {
  action: "actions",
  actions: "actions",
  advance: "career",
  career: "career",
  careers: "career",
  characteristics: "characteristics",
  karakteristika: "characteristics",
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
const mainTabByCharacterView: Record<MobileMainView, MainTab> = {
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
  view: MobileMainView;
  tab: MainTab;
  hasExplicitView: boolean;
};

export const defaultCampaignCharacterTab: MobileMainView = "characteristics";

const decodePathSegment = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};
const encodePathSegment = (value: string) => encodeURIComponent(value);
const slugifyPathSegment = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function resolveRouteCharacterId(campaignId: string, characterId: string) {
  const normalizedCharacterId = characterId.trim();
  const directCharacter = characterRecords.find(
    (character) => character.id === normalizedCharacterId,
  );

  if (directCharacter) {
    return directCharacter.campaignId === campaignId ? directCharacter.id : null;
  }

  const normalizedRouteSlug = slugifyPathSegment(normalizedCharacterId.replace(/_/g, "-"));
  const matchingCharacters = characterRecords.filter((character) => {
    if (character.campaignId !== campaignId) return false;

    const aliases = [
      character.id,
      character.id.replace(/_/g, "-"),
      character.name,
      ...(character.aka ?? []),
    ].map(slugifyPathSegment);

    return aliases.includes(normalizedRouteSlug);
  });

  return matchingCharacters.length === 1 ? matchingCharacters[0].id : null;
}

export function parseCampaignCharacterPath(pathname: string): CampaignCharacterRoute | null {
  const match = campaignCharacterRoutePattern.exec(pathname);
  if (!match) return null;

  const [, campaignIdSegment, characterIdSegment, viewSegment] = match;
  const campaignId = decodePathSegment(campaignIdSegment);
  const routeCharacterId = decodePathSegment(characterIdSegment);
  const decodedViewSegment = viewSegment ? decodePathSegment(viewSegment) : null;
  const hasExplicitView = Boolean(viewSegment);
  const view = viewAliases[
    (decodedViewSegment ?? characterViewPathSegments.characteristics).toLowerCase()
  ];

  if (!campaignId || !campaignById[campaignId] || !routeCharacterId || !view) return null;

  const characterId = resolveRouteCharacterId(campaignId, routeCharacterId);
  if (!characterId) return null;

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
  view: MobileMainView;
  omitDefaultView?: boolean;
}) {
  const characterPath = `/${encodePathSegment(campaignId)}/${encodePathSegment(characterId)}`;

  if (omitDefaultView && view === defaultCampaignCharacterTab) {
    return characterPath;
  }

  return `${characterPath}/${characterViewPathSegments[view]}`;
}
