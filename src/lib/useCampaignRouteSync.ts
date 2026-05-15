import { useCallback, useEffect, useRef } from "react";
import type { CampaignCharacterRoute } from "./campaignRoutes";
import { buildCampaignCharacterPath, defaultCampaignId, parseCampaignCharacterPath } from "./campaignRoutes";
import type { MainTab, MobileTabMenuTarget } from "../tabs/tabTypes";

type CharacterRouteOption = {
  id: string;
};

type UseCampaignRouteSyncOptions = {
  activeMainTab: MainTab;
  availableCharacters: CharacterRouteOption[];
  handleMobileMainViewSelect: (target: MobileTabMenuTarget) => void;
  selectedCharacterId: string;
  setActiveMainTab: (tab: MainTab) => void;
  setActiveMobileMainView: (target: MainTab) => void;
  setSelectedCharacterId: (characterId: string) => void;
};

type SyncRouteOptions = {
  characterId?: string;
  tab?: MainTab;
  mode?: "push" | "replace";
};

const getCurrentPathname = () => window.location.pathname;

export function useCampaignRouteSync({
  activeMainTab,
  availableCharacters,
  handleMobileMainViewSelect,
  selectedCharacterId,
  setActiveMainTab,
  setActiveMobileMainView,
  setSelectedCharacterId,
}: UseCampaignRouteSyncOptions) {
  const currentCampaignRoute = useRef<CampaignCharacterRoute | null>(
    parseCampaignCharacterPath(getCurrentPathname()),
  );

  const syncCampaignRoute = useCallback(({
    characterId = selectedCharacterId,
    tab = activeMainTab,
    mode = "replace",
  }: SyncRouteOptions = {}) => {
    const campaignId = currentCampaignRoute.current?.campaignId ?? defaultCampaignId;
    const nextPath = buildCampaignCharacterPath({
      campaignId,
      characterId,
      tab,
    });
    const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;

    currentCampaignRoute.current = { campaignId, characterId, tab };

    if (getCurrentPathname() === nextPath) {
      return;
    }

    if (mode === "push") {
      window.history.pushState(null, "", nextUrl);
      return;
    }

    window.history.replaceState(null, "", nextUrl);
  }, [activeMainTab, selectedCharacterId]);

  useEffect(() => {
    const applyRoute = (pathname: string) => {
      const route = parseCampaignCharacterPath(pathname);
      if (!route) return;

      currentCampaignRoute.current = route;

      if (availableCharacters.some((character) => character.id === route.characterId)) {
        setSelectedCharacterId(route.characterId);
      }

      setActiveMainTab(route.tab);
      setActiveMobileMainView(route.tab);
    };

    applyRoute(getCurrentPathname());

    const handlePopState = () => applyRoute(getCurrentPathname());
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [availableCharacters, setActiveMainTab, setActiveMobileMainView, setSelectedCharacterId]);

  useEffect(() => {
    syncCampaignRoute();
  }, [syncCampaignRoute]);

  const selectMainTab = useCallback((tab: MainTab) => {
    syncCampaignRoute({ tab, mode: "push" });
    setActiveMainTab(tab);
    setActiveMobileMainView(tab);
  }, [setActiveMainTab, setActiveMobileMainView, syncCampaignRoute]);

  const selectMobileMainView = useCallback((target: MobileTabMenuTarget) => {
    if (target !== "characteristics") {
      syncCampaignRoute({ tab: target, mode: "push" });
    }

    handleMobileMainViewSelect(target);
  }, [handleMobileMainViewSelect, syncCampaignRoute]);

  const selectCharacter = useCallback((characterId: string) => {
    syncCampaignRoute({ characterId, mode: "push" });
    setSelectedCharacterId(characterId);
  }, [setSelectedCharacterId, syncCampaignRoute]);

  const getCurrentCampaignRoute = useCallback(() => currentCampaignRoute.current, []);

  return {
    getCurrentCampaignRoute,
    selectCharacter,
    selectMainTab,
    selectMobileMainView,
  };
}
