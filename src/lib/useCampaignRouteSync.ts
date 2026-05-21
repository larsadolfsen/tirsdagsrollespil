import { useCallback, useEffect, useRef } from "react";
import type { CampaignCharacterRoute } from "./campaignRoutes";
import { buildCampaignCharacterPath, defaultCampaignId, parseCampaignCharacterPath } from "./campaignRoutes";
import type { MainTab, MobileTabMenuTarget } from "../tabs/tabTypes";

type CharacterRouteOption = {
  id: string;
};

type UseCampaignRouteSyncOptions = {
  activeMainTab: MainTab;
  activeMobileMainView: MobileTabMenuTarget;
  availableCharacters: CharacterRouteOption[];
  handleMobileMainViewSelect: (target: MobileTabMenuTarget) => void;
  selectedCharacterId: string;
  setActiveMainTab: (tab: MainTab) => void;
  setActiveMobileMainView: (target: MobileTabMenuTarget) => void;
  setSelectedCharacterId: (characterId: string) => void;
};

type SyncRouteOptions = {
  characterId?: string;
  tab?: MobileTabMenuTarget;
  mode?: "push" | "replace";
  omitDefaultTab?: boolean;
};

const getCurrentPathname = () => window.location.pathname;

export function useCampaignRouteSync({
  activeMainTab,
  activeMobileMainView,
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
    tab = activeMobileMainView === "characteristics" ? activeMobileMainView : activeMainTab,
    mode = "replace",
    omitDefaultTab = currentCampaignRoute.current?.hasExplicitTab === false,
  }: SyncRouteOptions = {}) => {
    const campaignId = currentCampaignRoute.current?.campaignId ?? defaultCampaignId;
    const nextPath = buildCampaignCharacterPath({
      campaignId,
      characterId,
      tab,
      omitDefaultTab,
    });
    const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;

    currentCampaignRoute.current = {
      campaignId,
      characterId,
      tab,
      hasExplicitTab: !omitDefaultTab,
    };

    if (getCurrentPathname() === nextPath) {
      return;
    }

    if (mode === "push") {
      window.history.pushState(null, "", nextUrl);
      return;
    }

    window.history.replaceState(null, "", nextUrl);
  }, [activeMainTab, activeMobileMainView, selectedCharacterId]);

  useEffect(() => {
    const applyRoute = (pathname: string) => {
      const route = parseCampaignCharacterPath(pathname);
      if (!route) return;

      currentCampaignRoute.current = route;

      if (availableCharacters.some((character) => character.id === route.characterId)) {
        setSelectedCharacterId(route.characterId);
      }

      if (route.tab !== "characteristics") {
        setActiveMainTab(route.tab);
      }
      setActiveMobileMainView(route.hasExplicitTab ? route.tab : "characteristics");
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
    syncCampaignRoute({ tab, mode: "push", omitDefaultTab: false });
    setActiveMainTab(tab);
    setActiveMobileMainView(tab);
  }, [setActiveMainTab, setActiveMobileMainView, syncCampaignRoute]);

  const selectMobileMainView = useCallback((target: MobileTabMenuTarget) => {
    syncCampaignRoute({ tab: target, mode: "push", omitDefaultTab: false });
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
