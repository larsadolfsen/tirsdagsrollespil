import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
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
  const location = useLocation();
  const navigate = useNavigate();
  const [hasAppliedInitialRoute, setHasAppliedInitialRoute] = useState(false);
  const currentCampaignRoute = useRef<CampaignCharacterRoute | null>(
    parseCampaignCharacterPath(location.pathname),
  );
  const locationRef = useRef(location);
  locationRef.current = location;

  const syncCampaignRoute = useCallback(({
    characterId = selectedCharacterId,
    view = currentCampaignRoute.current?.view ?? activeMobileMainView,
    mode = "replace",
    omitDefaultView = currentCampaignRoute.current ? currentCampaignRoute.current.hasExplicitView === false : true,
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
    const { hash, pathname, search } = locationRef.current;
    const nextUrl = `${nextPath}${search}${hash}`;
    const route = parseCampaignCharacterPath(nextPath);

    if (route) {
      currentCampaignRoute.current = route;
    }

    if (pathname === nextPath) {
      return;
    }

    navigate(nextUrl, { replace: mode !== "push" });
  }, [activeMobileMainView, characterName, navigate, routeSyncEnabled, selectedCharacterId]);

  // Applies the URL to app state. Runs on mount, on every location change
  // (covers back/forward — React Router owns popstate now), and again when
  // hydration completes so renamed-character slugs resolve correctly.
  // Idempotent: after our own navigate() calls it re-applies the same values.
  useEffect(() => {
    if (!routeSyncEnabled) {
      setHasAppliedInitialRoute(false);
      currentCampaignRoute.current = null;
      return;
    }

    const route = parseCampaignCharacterPath(location.pathname);
    if (route) {
      currentCampaignRoute.current = route;

      if (availableCharacters.some((character) => character.id === route.characterId)) {
        setSelectedCharacterId(route.characterId);
      }

      setActiveMainTab(route.tab);
      setActiveMobileMainView(route.view);
    }

    setHasAppliedInitialRoute(true);
  }, [
    availableCharacters,
    location.pathname,
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
    syncCampaignRoute({ characterId, mode: "push", omitDefaultView: true });
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
