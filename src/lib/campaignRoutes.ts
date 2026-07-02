import type { MainTab, MobileMainView } from "../tabs/tabTypes";
import { campaignById, defaultCampaignId } from "../data/campaigns";
import { characterRecords } from "../data/characters";
import { loadCharacterProgress } from "../data/persistence";

export { defaultCampaignId } from "../data/campaigns";

const campaignCharacterRoutePattern = /^\/([^/]+)\/([^/]+)(?:\/([^/?#]+)(?:\/([^/?#]+)(?:\/([^/?#]+))?)?)?\/?$/;
const characterViewPathSegments: Record<MobileMainView, string> = {
  characteristics: "characteristics",
  skills: "skills",
  actions: "actions",
  inventory: "inventory",
  spells: "spells",
  features: "talents",
  journal: "journal",
  dice: "dice-log",
  career: "advance",
  books: "books",
};
const viewAliases: Record<string, MobileMainView> = {
  action: "actions",
  actions: "actions",
  advance: "career",
  books: "books",
  career: "career",
  careers: "career",
  characteristics: "characteristics",
  karakteristika: "characteristics",
  features: "features",
  inventory: "inventory",
  journal: "journal",
  dice: "dice",
  "dice-log": "dice",
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
  dice: "dice",
  career: "career",
  books: "books",
};

export type CampaignCharacterRoute = {
  campaignId: string;
  characterId: string;
  view: MobileMainView;
  tab: MainTab;
  hasExplicitView: boolean;
  bookId: string | null;
  chapterId: string | null;
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

    const progress = loadCharacterProgress(character.id);
    const currentName = progress?.characterName?.trim() || character.name;

    const aliases = [
      character.id,
      character.id.replace(/_/g, "-"),
      currentName,
      ...(character.aka ?? []),
    ].map(slugifyPathSegment);

    return aliases.includes(normalizedRouteSlug);
  });

  return matchingCharacters.length === 1 ? matchingCharacters[0].id : null;
}

export function parseCampaignCharacterPath(pathname: string): CampaignCharacterRoute | null {
  const match = campaignCharacterRoutePattern.exec(pathname);
  if (!match) return null;

  const [, campaignIdSegment, characterIdSegment, viewSegment, bookSlugSegment, chapterSlugSegment] = match;
  const campaignId = decodePathSegment(campaignIdSegment);
  const routeCharacterId = decodePathSegment(characterIdSegment);
  const decodedViewSegment = viewSegment ? decodePathSegment(viewSegment) : null;
  const hasExplicitView = Boolean(viewSegment);
  const view = viewAliases[
    (decodedViewSegment ?? characterViewPathSegments.characteristics).toLowerCase()
  ];

  if (!campaignId || !campaignById[campaignId] || !routeCharacterId || !view) return null;
  if ((bookSlugSegment || chapterSlugSegment) && view !== "books") return null;

  const characterId = resolveRouteCharacterId(campaignId, routeCharacterId);
  if (!characterId) return null;

  const bookId = view === "books" && bookSlugSegment ? decodePathSegment(bookSlugSegment) : null;
  const chapterId = view === "books" && bookId && chapterSlugSegment ? decodePathSegment(chapterSlugSegment) : null;

  return {
    campaignId,
    characterId,
    view,
    tab: mainTabByCharacterView[view],
    hasExplicitView,
    bookId,
    chapterId,
  };
}

export function buildCampaignCharacterPath({
  campaignId = defaultCampaignId,
  characterId,
  view,
  omitDefaultView = false,
  characterName,
  bookId = null,
  chapterId = null,
}: {
  campaignId?: string;
  characterId: string;
  view: MobileMainView;
  omitDefaultView?: boolean;
  characterName?: string;
  bookId?: string | null;
  chapterId?: string | null;
}) {
  const progress = loadCharacterProgress(characterId);
  const character = characterRecords.find((c) => c.id === characterId);
  const resolvedName = characterName || progress?.characterName?.trim() || character?.name || characterId;
  const characterSlug = slugifyPathSegment(resolvedName);

  const characterPath = `/${encodePathSegment(campaignId)}/${encodePathSegment(characterSlug)}`;

  if (omitDefaultView && view === defaultCampaignCharacterTab) {
    return characterPath;
  }

  const viewPath = `${characterPath}/${characterViewPathSegments[view]}`;

  if (view !== "books" || !bookId) {
    return viewPath;
  }

  const bookPath = `${viewPath}/${encodePathSegment(bookId)}`;

  return chapterId ? `${bookPath}/${encodePathSegment(chapterId)}` : bookPath;
}
