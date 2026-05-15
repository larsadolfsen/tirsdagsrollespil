import { useCallback, useState } from "react";
import type { ActiveInfoState } from "../components/appTypes";
import type {
  ActionCategory,
  CareerSubtab,
  InventorySubtab,
  JournalSubtab,
  MainTab,
  SkillSubtab,
  SpellSubtab,
} from "../tabs/tabTypes";
import { useMobileNavigation } from "./useMobileNavigation";

export function useAppShellState() {
  const [activeInfo, setActiveInfo] = useState<ActiveInfoState | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("skills");
  const [activeActionCategory, setActiveActionCategory] = useState<ActionCategory>("all");
  const [activeSkillSubtab, setActiveSkillSubtab] = useState<SkillSubtab>("trained");
  const [activeSpellSubtab, setActiveSpellSubtab] = useState<SpellSubtab>("all");
  const [activeInventorySubtab, setActiveInventorySubtab] = useState<InventorySubtab>("all");
  const [activeCareerSubtab, setActiveCareerSubtab] = useState<CareerSubtab>("all");
  const [activeJournalSubtab, setActiveJournalSubtab] = useState<JournalSubtab>("sessions");
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSpellShopOpen, setIsSpellShopOpen] = useState(false);
  const [isCharacterBuilderOpen, setIsCharacterBuilderOpen] = useState(false);

  const mobileNavigation = useMobileNavigation({ setActiveMainTab });

  const resetAppShellState = useCallback(() => {
    setActiveInfo(null);
    setActiveMainTab("skills");
    mobileNavigation.setActiveMobileMainView("characteristics");
    setActiveActionCategory("all");
    setActiveSkillSubtab("trained");
    setActiveSpellSubtab("all");
    setActiveInventorySubtab("all");
    setActiveCareerSubtab("all");
    setActiveJournalSubtab("sessions");
    setIsShopOpen(false);
    setIsSpellShopOpen(false);
  }, [mobileNavigation.setActiveMobileMainView]);

  return {
    activeInfo,
    activeMainTab,
    activeActionCategory,
    activeSkillSubtab,
    activeSpellSubtab,
    activeInventorySubtab,
    activeCareerSubtab,
    activeJournalSubtab,
    isShopOpen,
    isSpellShopOpen,
    isCharacterBuilderOpen,
    resetAppShellState,
    setActiveInfo,
    setActiveMainTab,
    setActiveActionCategory,
    setActiveSkillSubtab,
    setActiveSpellSubtab,
    setActiveInventorySubtab,
    setActiveCareerSubtab,
    setActiveJournalSubtab,
    setIsShopOpen,
    setIsSpellShopOpen,
    setIsCharacterBuilderOpen,
    ...mobileNavigation,
  };
}
