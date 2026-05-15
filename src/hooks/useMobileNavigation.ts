import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MainTab, MobileTabMenuTarget } from "../tabs/tabTypes";

interface UseMobileNavigationOptions {
  setActiveMainTab: Dispatch<SetStateAction<MainTab>>;
}

export function useMobileNavigation({ setActiveMainTab }: UseMobileNavigationOptions) {
  const [activeMobileMainView, setActiveMobileMainView] =
    useState<MobileTabMenuTarget>("characteristics");
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const [isMobileCharacterListOpen, setIsMobileCharacterListOpen] = useState(false);
  const [isMobilePortraitMenuOpen, setIsMobilePortraitMenuOpen] = useState(false);

  const handleMobileMainViewSelect = useCallback((target: MobileTabMenuTarget) => {
    setActiveMobileMainView(target);

    if (target === "characteristics") {
      return;
    }

    setActiveMainTab(target);
  }, [setActiveMainTab]);

  const closeMobileNavigation = useCallback(() => {
    setIsMobileNavigationOpen(false);
    setIsMobileCharacterListOpen(false);
  }, []);

  useEffect(() => {
    if (!isMobileNavigationOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileNavigationOpen(false);
        setIsMobileCharacterListOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobileNavigationOpen]);

  const openMobileNavigation = useCallback((showCharacterList = false) => {
    setIsMobilePortraitMenuOpen(false);
    setIsMobileCharacterListOpen(showCharacterList);
    setIsMobileNavigationOpen(true);
  }, []);

  return {
    activeMobileMainView,
    closeMobileNavigation,
    handleMobileMainViewSelect,
    isMobileCharacterListOpen,
    isMobileNavigationOpen,
    isMobilePortraitMenuOpen,
    openMobileNavigation,
    setActiveMobileMainView,
    setIsMobileCharacterListOpen,
    setIsMobileNavigationOpen,
    setIsMobilePortraitMenuOpen,
  };
}
