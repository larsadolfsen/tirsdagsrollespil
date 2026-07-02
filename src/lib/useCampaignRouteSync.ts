import { useCallback, useEffect, useRef, useState } from "react";
import type { CampaignCharacterRoute } from "./campaignRoutes";
import {
  buildCampaignCharacterPath,
  defaultCampaignId,
  parseCampaignCharacterPath,
} from "./campaignRoutes";
import type { MainTab, MobileMainView } from "../tabs/tabTypes";

type CharacterRouteOption = {
  id: string;
};

type UseCampaignRouteSyncOptions = {
  activeMainTab: MainTab;
  activeMobileMainView: MobileMainView;
  availableCharacters: CharacterRouteOption[];
  handleMobileMainViewSelect: (target: MobileMainView) => void;
  routeSyncEnabled?: boolean;
  selectedCharacterId: string;
  setActiveMainTab: (tab: MainTab) => void;
  setActiveMobileMainView: (target: MobileMainView) => void;
  setSelectedCharacterId: (characterId: string) => void;
  isAllProgressHydrated?: boolean;
  characterName?: string;
};

type SyncRouteOptions = {
  characterId?: string;
  view?: MobileMainView;
  mode?: "push" | "replace";
  omitDefaultView?: boolean;
};

const getCurrentPathname = () => window.location.pathname;
const isMainTab = (target: MobileMainView): target is MainTab => target !== "characteristics";

export function useCampaignRouteSync({
  activeMainTab,
  activeMobileMainView,
  availableCharacters,
  handleMobileMainViewSelect,
  routeSyncEnabled = true,
  selectedCharacterId,
  setActiveMainTab,
  setActiveMobileMainView,
  setSelectedCharacterId,
  isAllProgressHydrated = false,
  characterName = "",
}: UseCampaignRouteSyncOptions) {
  const [hasAppliedInitialRoute, setHasAppliedInitialRoute] = useState(false);
  const currentCampaignRoute = useRef<CampaignCharacterRoute | null>(
    parseCampaignCharacterPath(getCurrentPathname()),
  );

  const syncCampaignRoute = useCallback(({
    characterId = selectedCharacterId,
    view = currentCampaignRoute.current?.view ?? activeMobileMainView,
    mode = "replace",
    omitDefaultView = currentCampaignRoute.current?.hasExplicitView === false,
  }: SyncRouteOptions = {}) => {
    if (!routeSyncEnabled) return;

    const campaignId = currentCampaignRoute.current?.campaignId ?? defaultCampaignId;
    const nextPath = buildCampaignCharacterPath({
      campaignId,
      characterId,
      view,
      omitDefaultView,
      characterName,
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
  }, [activeMobileMainView, routeSyncEnabled, selectedCharacterId, characterName]);

  useEffect(() => {
    if (!routeSyncEnabled) {
      setHasAppliedInitialRoute(false);
      currentCampaignRoute.current = null;
      return;
    }

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
    setHasAppliedInitialRoute(true);

    const handlePopState = () => applyRoute(getCurrentPathname());
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    availableCharacters,
    routeSyncEnabled,
    setActiveMainTab,
    setActiveMobileMainView,
    setSelectedCharacterId,
    isAllProgressHydrated,
  ]);

  useEffect(() => {
    if (!hasAppliedInitialRoute) return;

    syncCampaignRoute();
  }, [hasAppliedInitialRoute, syncCampaignRoute]);

  const selectMainTab = useCallback((tab: MainTab) => {
    syncCampaignRoute({ view: tab, mode: "push", omitDefaultView: false });
    setActiveMainTab(tab);
    setActiveMobileMainView(tab);
  }, [setActiveMainTab, setActiveMobileMainView, syncCampaignRoute]);

  const selectMobileMainView = useCallback((target: MobileMainView) => {
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

  const restoreRouteForCharacter = useCallback((characterId: string) => {
    const route = currentCampaignRoute.current;
    if (route?.characterId !== characterId) {
      return false;
    }

    setActiveMainTab(route.tab);
    setActiveMobileMainView(route.hasExplicitView ? route.view : "characteristics");
    return true;
  }, [setActiveMainTab, setActiveMobileMainView]);

  return {
    restoreRouteForCharacter,
    selectCharacter,
    selectMainTab,
    selectMobileMainView,
  };
}
