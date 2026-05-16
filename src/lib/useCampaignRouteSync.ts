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
  setActiveMobileMainView: (target: MobileTabMenuTarget) => void;
  setSelectedCharacterId: (characterId: string) => void;
};

type SyncRouteOptions = {
  characterId?: string;
  view?: MobileTabMenuTarget;
  mode?: "push" | "replace";
  omitDefaultView?: boolean;
};

const getCurrentPathname = () => window.location.pathname;
const isMainTab = (target: MobileTabMenuTarget): target is MainTab => target !== "characteristics";

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
    view = currentCampaignRoute.current?.view ?? activeMainTab,
    mode = "replace",
    omitDefaultView = currentCampaignRoute.current?.hasExplicitView === false,
  }: SyncRouteOptions = {}) => {
    const campaignId = currentCampaignRoute.current?.campaignId ?? defaultCampaignId;
    const nextPath = buildCampaignCharacterPath({
      campaignId,
      characterId,
      view,
      omitDefaultView,
    });
    const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;
    const route = parseCampaignCharacterPath(nextPath);

    if (route) {
      currentCampaignRoute.current = route;
    }

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
      setActiveMobileMainView(route.view);
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
    syncCampaignRoute({ view: tab, mode: "push", omitDefaultView: false });
    setActiveMainTab(tab);
    setActiveMobileMainView(tab);
  }, [setActiveMainTab, setActiveMobileMainView, syncCampaignRoute]);

  const selectMobileMainView = useCallback((target: MobileTabMenuTarget) => {
    syncCampaignRoute({ view: target, mode: "push", omitDefaultView: false });
    setActiveMobileMainView(target);

    if (isMainTab(target)) {
      setActiveMainTab(target);
    }

    handleMobileMainViewSelect(target);
  }, [handleMobileMainViewSelect, setActiveMainTab, setActiveMobileMainView, syncCampaignRoute]);

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
