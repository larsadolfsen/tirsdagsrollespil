import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MainTab, MobileTabMenuTarget } from "../tabs/tabTypes";

interface UseMobileNavigationOptions {
  setActiveMainTab: Dispatch<SetStateAction<MainTab>>;
}

export function useMobileNavigation({ setActiveMainTab }: UseMobileNavigationOptions) {
  const [activeMobileMainView, setActiveMobileMainView] =
    useState<MobileTabMenuTarget>("characteristics");
  const [isMobilePortraitMenuOpen, setIsMobilePortraitMenuOpen] = useState(false);

  const handleMobileMainViewSelect = (target: MobileTabMenuTarget) => {
    setActiveMobileMainView(target);

    if (target === "characteristics") {
      return;
    }

    setActiveMainTab(target);
  };

  return {
    activeMobileMainView,
    handleMobileMainViewSelect,
    isMobilePortraitMenuOpen,
    setActiveMobileMainView,
    setIsMobilePortraitMenuOpen,
  };
}
