/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import {
  Dice5,
  X,
} from "lucide-react";
import { AppShell } from "./components/AppShell";
import { ArmourCard } from "./components/ArmourCard";
import { CharacterSheetFrame } from "./components/CharacterSheetFrame";
import { CharacterSheetHeader } from "./components/CharacterSheetHeader";
import { CharacteristicsView } from "./components/CharacteristicsView";
import { LandingPage } from "./components/LandingPage";
import { MobileMainViewSwipeProvider } from "./components/MobileMainViewSwipeContext";
import { getAdvanceCost, getTalentPurchaseCost } from "./lib/advanceCosts";
import { useAppShellState } from "./hooks/useAppShellState";
import { useCharacterDerivedStats } from "./hooks/useCharacterDerivedStats";
import { useDiceRoller } from "./features/dice/useDiceRoller";
import { useCareerAdvancement } from "./hooks/useCareerAdvancement";
import { useInventoryActions } from "./hooks/useInventoryActions";
import { useHorizontalSwipePager } from "./hooks/useHorizontalSwipePager";
import { useNotesViewModel } from "./hooks/useNotesViewModel";
import { CharacterResourcesCards } from "./components/CharacterResourcesCards";
import {
  InlineSubtabs,
  NamedButton,
  PanelSectionHeader,
  ResourceCounterBar,
  ScrollableTabStrip,
} from "./components/ui";
import { useGameSessionContext } from "./context/GameSessionContext";
import { LazyTabPanel } from "./tabs/LazyTabPanel";
import {
  getConsumableBaseName,
  isBackpackContainerItem,
} from "./tabs/inventory/inventoryUtils";
import { filterSpellDefinitionsForMode } from "./tabs/spells/spellUtils";
import { useSpellsViewModel } from "./tabs/spells/useSpellsViewModel";
import {
  getCharacterTalentRows,
  getTalentMaxDisplay as getTalentMaxDisplayValue,
} from "./tabs/talents/talentUtils";
import type {
  ResolvedCharacterSkill,
  ResolvedCharacterTalent,
} from "./data/characters/resolved";
import { listCharacters } from "./data/repository";
import {
  formatItemValue,
  getCharacterSkillKey,
} from "./lib/gameSession";
import { useCampaignRouteSync } from "./lib/useCampaignRouteSync";
import { buildCampaignCharacterPath, parseCampaignCharacterPath } from "./lib/campaignRoutes";
import {
  mainTabButtonActiveClassName,
  mainTabButtonBaseClassName,
  mainTabButtonInactiveClassName,
  mainTabUnderlineClassName,
} from "./lib/tabStyles";
import { cn } from "./lib/utils";
import { formatTalentEffect } from "./lib/talentEffects";
import { UI_LABELS } from "./labels";
import {
  mainTabOptions,
} from "./tabs/tabOptions";
import type { CareerTabHandle } from "./tabs/CareerTab";
import type { CareerSubtab, MobileTabMenuTarget } from "./tabs/tabTypes";
import type { Characteristic, Ruleset, SkillDefinition, SkillSpecialisationDefinition } from "./types";

const InfoSidebar = lazy(() =>
  import("./components/InfoSidebar").then((module) => ({ default: module.InfoSidebar })),
);
const ShopSidebar = lazy(() =>
  import("./components/ShopSidebar").then((module) => ({ default: module.ShopSidebar })),
);
const SpellShopSidebar = lazy(() =>
  import("./components/SpellShopSidebar").then((module) => ({ default: module.SpellShopSidebar })),
);
const TalentSidebar = lazy(() =>
  import("./components/sidebar").then((module) => ({ default: module.TalentSidebar })),
);
const SkillSidebar = lazy(() =>
  import("./components/sidebar").then((module) => ({ default: module.SkillSidebar })),
);
const DiceLogSidebar = lazy(() =>
  import("./features/dice/DiceLogSidebar").then((module) => ({ default: module.DiceLogSidebar })),
);
const MobileTabMenu = lazy(() =>
  import("./components/MobileTabMenu").then((module) => ({ default: module.MobileTabMenu })),
);
const CharacterBuilderScreen = lazy(() =>
  import("./components/CharacterBuilderScreen").then((module) => ({ default: module.CharacterBuilderScreen })),
);
const SkillsTab = lazy(() => import("./tabs/SkillsTab").then((module) => ({ default: module.SkillsTab })));
const ActionsTab = lazy(() => import("./tabs/ActionsTab").then((module) => ({ default: module.ActionsTab })));
const InventoryTab = lazy(() => import("./tabs/InventoryTab").then((module) => ({ default: module.InventoryTab })));
const SpellsTab = lazy(() => import("./tabs/SpellsTab").then((module) => ({ default: module.SpellsTab })));
const TalentsTab = lazy(() => import("./tabs/TalentsTab").then((module) => ({ default: module.TalentsTab })));
const JournalTab = lazy(() => import("./tabs/JournalTab").then((module) => ({ default: module.JournalTab })));
const CareerTab = lazy(() => import("./tabs/CareerTab").then((module) => ({ default: module.CareerTab })));

const editCharacterTabOptions: Array<{ id: CareerSubtab; label: string }> = [
  { id: "experience", label: "Experience" },
  { id: "characteristics", label: "Characteristics" },
  { id: "careers", label: "Careers" },
  { id: "skills", label: "Skills" },
  { id: "talents", label: "Talents" },
];

type RollActionButton = {
  id: string;
  label: string;
  onClick: () => void;
};

function useIsDesktopLayout() {
  const [isDesktopLayout, setIsDesktopLayout] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = () => setIsDesktopLayout(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isDesktopLayout;
}

export function AppComposition() {
  const {
    selectedCharacterId,
    setSelectedCharacterId,
    characterData,
    ruleset,
    rulesIndex,
    resourceCaps,
    careerAdvancementData,
    initialTalentIds,
    woundsCurrent,
    setWoundsCurrent,
    corruptionCurrent,
    setCorruptionCurrent,
    fateCurrent,
    setFateCurrent,
    fortuneCurrent,
    setFortuneCurrent,
    resilienceCurrent,
    setResilienceCurrent,
    resolveCurrent,
    setResolveCurrent,
    xpCurrent,
    setXpCurrent,
    setXpTotal,
    coinContainerId,
    setCharacterCoins,
    setCoinContainerId,
    currentCareerRank,
    setCurrentCareerRank,
    currentCharacteristicAdvances,
    setCurrentCharacteristicInitials,
    setCurrentCharacteristicAdvances,
    characterSkills,
    setCharacterSkills,
    characterTalents,
    setCharacterTalents,
    setCharacterSpells,
    equipmentState,
    setEquipmentState,
    backgroundText,
    setBackgroundText,
    notes,
    setNotes,
  } = useGameSessionContext();
  const [pendingXpAdjustment, setPendingXpAdjustment] = useState(0);
  const [pendingTotalXpAdjustment, setPendingTotalXpAdjustment] = useState(0);
  const [hasCareerTabDraftChanges, setHasCareerTabDraftChanges] = useState(false);
  const [isTalentSidebarOpen, setIsTalentSidebarOpen] = useState(false);
  const [isSkillSidebarOpen, setIsSkillSidebarOpen] = useState(false);
  const careerTabRef = useRef<CareerTabHandle>(null);
  const [isLandingPageOpen, setIsLandingPageOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return parseCampaignCharacterPath(window.location.pathname) === null;
  });
  const isDesktopLayout = useIsDesktopLayout();
  const availableCharacters = useMemo(() => listCharacters(), []);
  const {
    activeInfo,
    activeMainTab,
    activeActionCategory,
    activeSkillSubtab,
    activeSpellSubtab,
    activeInventorySubtab,
    activeCareerSubtab,
    activeJournalSubtab,
    activeMobileMainView,
    closeMobileNavigation,
    handleMobileMainViewSelect,
    isMobileCharacterListOpen,
    isMobileNavigationOpen,
    isMobilePortraitMenuOpen,
    isShopOpen,
    isSpellShopOpen,
    isCharacterBuilderOpen,
    openMobileNavigation,
    resetAppShellState,
    setActiveInfo,
    setActiveMainTab,
    setActiveActionCategory,
    setActiveSkillSubtab,
    setActiveSpellSubtab,
    setActiveInventorySubtab,
    setActiveCareerSubtab,
    setActiveJournalSubtab,
    setActiveMobileMainView,
    setIsMobileCharacterListOpen,
    setIsMobileNavigationOpen,
    setIsMobilePortraitMenuOpen,
    setIsShopOpen,
    setIsSpellShopOpen,
    setIsCharacterBuilderOpen,
  } = useAppShellState();
  const {
    activeRollerRef,
    archiveRoll,
    canRollCritical,
    canUseFortuneActions,
    canUseResilienceAction,
    displayRoll,
    executeRoll,
    formatSignedSl,
    getDamageTotal,
    getDifficultyLabel,
    getHitLocation,
    getIsCritical,
    getOutcome,
    getRollBaseValue,
    getRollTarget,
    getTargetBonusTotal,
    getTestTypeTitle,
    handleAddSl,
    handleIWillNotFail,
    handleReroll,
    handleRoll,
    handleRollCritical,
    isDiceLogOpen,
    resetDiceRoller,
    rollHistory,
    rollState,
    setIsDiceLogOpen,
    setRollState,
  } = useDiceRoller({
    characterData,
    characterSkills,
    characterTalents,
    fortuneCurrent,
    resilienceCurrent,
    ruleset,
    setActiveInfo,
    setFortuneCurrent,
    setIsShopOpen,
    setResilienceCurrent,
  });
  const {
    addNote,
    cancelNoteComposer,
    deleteNote,
    editingNoteId,
    editNote,
    formatNoteDate,
    formatNoteDay,
    isNoteComposerOpen,
    newNoteText,
    newNoteTitle,
    noteGroups,
    noteHashtags,
    noteSearch,
    npcNoteGroups,
    npcNoteHashtags,
    npcNotes,
    openNoteComposer,
    setNewNoteText,
    setNewNoteTitle,
    setNoteSearch,
    sortedNotes,
  } = useNotesViewModel({ notes, setNotes });
  const {
    advancementCharacteristics,
    displayedCareerRank,
    displayedCareerRankRecord,
    getCareerSkillOptions,
    hasPendingCareerChanges,
    isCareerSkillName,
    nextCareerRankRecord,
    pendingAvailableXp,
    pendingCareerRank,
    pendingCharacteristicAdvances,
    pendingSkillAdvances,
    pendingTalentPurchases,
    resetPendingAdvancements,
    setPendingCareerRank,
    setPendingCharacteristicAdvances,
    setPendingSkillAdvances,
    setPendingTalentPurchases,
  } = useCareerAdvancement({
    careerAdvancementData,
    characterData,
    characterSkills,
    characterTalents,
    currentCareerRank,
    currentCharacteristicAdvances,
    rulesIndex,
    ruleset,
    xpCurrent: Math.max(0, xpCurrent + pendingXpAdjustment),
  });
  const hasPendingAdvanceChanges =
    hasPendingCareerChanges || pendingXpAdjustment !== 0 || pendingTotalXpAdjustment !== 0;
  const hasUnsavedCareerEdits = hasPendingAdvanceChanges || hasCareerTabDraftChanges;
  const handleCareerTabDraftChangesChange = useCallback((hasDraftChanges: boolean) => {
    setHasCareerTabDraftChanges(hasDraftChanges);
  }, []);
  const handleEditCharacterSave = useCallback(() => {
    if (!hasUnsavedCareerEdits) return;

    careerTabRef.current?.saveChanges();
  }, [hasUnsavedCareerEdits]);
  useEffect(() => {
    document.title = isLandingPageOpen
      ? `${UI_LABELS.CAMPAIGN_NAME} WFRP 4E`
      : `${characterData.name} - ${UI_LABELS.CAMPAIGN_NAME} WFRP 4E`;
  }, [characterData.name, isLandingPageOpen]);

  type ResolvedSkillOption = (typeof rulesIndex.resolvedSkillOptions)[number];
  const skillDefinitionById = new Map<string, SkillDefinition>(
    ruleset.skills.map((skill) => [skill.id, skill]),
  );
  const skillDefinitionByName = new Map<string, SkillDefinition>(
    ruleset.skills.map((skill) => [skill.name, skill]),
  );
  const skillSpecialisationById = new Map<string, SkillSpecialisationDefinition>(
    ruleset.skillSpecialisations.map((specialisation) => [specialisation.id, specialisation]),
  );
  const characterSkillByName = new Map<string, ResolvedCharacterSkill>(
    characterSkills.map((skill) => [skill.displayName, skill]),
  );
  const isBasicSkillOption = (option: ResolvedSkillOption) => {
    const skillDefinition = skillDefinitionById.get(option.skillId);
    return (
      skillDefinition?.type === "basic" &&
      (!option.specialisationId || option.specialisationId.endsWith("_basic") || skillDefinition?.grouped)
    );
  };
  const advancementTalentNames = [...new Set([
    ...careerAdvancementData.talents,
    ...characterTalents.map((talent) => talent.name),
  ])];
  const characterTalentRows = getCharacterTalentRows(characterTalents);
  const talentRowsBySource = useMemo(() => {
    const careerTalentNames = new Set(careerAdvancementData.talents);
    const originTalentIds = new Set(initialTalentIds);
    const getFilteredRows = (predicate: (talent: ResolvedCharacterTalent) => boolean) =>
      getCharacterTalentRows(characterTalents.filter(predicate));

    return {
      all: characterTalentRows,
      career: getFilteredRows((talent) => careerTalentNames.has(talent.name)),
      origin: getFilteredRows((talent) => originTalentIds.has(talent.id) && !careerTalentNames.has(talent.name)),
      other: getFilteredRows(
        (talent) => !careerTalentNames.has(talent.name) && !originTalentIds.has(talent.id),
      ),
    };
  }, [
    careerAdvancementData.talents,
    characterTalentRows,
    characterTalents,
    initialTalentIds,
  ]);
  const {
    attributes,
    armourTotals,
    carriedItems,
    carryCapacity,
    containers,
    encumbrancePercent,
    equippedArmourNames,
    formatSpellDuration,
    formatSpellRange,
    formatSpellTarget,
    formattedCoins,
    getArmourFitConflicts,
    getContainerContents,
    getContainerUsedEncumbrance,
    maxCorruption,
    ownedShopItemIds,
    totalEncumbrance,
    wornItems,
  } = useCharacterDerivedStats({
    characterData,
    coinContainerId,
    equipmentState,
    ruleset,
  });
  const getTalentMaxDisplay = (max: string) =>
    getTalentMaxDisplayValue(max, attributes);
  const getTalentMaxDisplayByName = (talentName: string) => {
    const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
    return talentDefinition ? getTalentMaxDisplay(talentDefinition.max) : "-";
  };
  const isPrayerCaster = useMemo(() => {
    const careerText = [
      characterData.careerRecord.id,
      characterData.careerRecord.name,
      characterData.careerRecord.tier,
      characterData.career,
      characterData.tier,
    ].join(" ");

    return /\bpriest\b|(^|_)priest(_|$)/i.test(careerText);
  }, [
    characterData.career,
    characterData.careerRecord.id,
    characterData.careerRecord.name,
    characterData.careerRecord.tier,
    characterData.tier,
  ]);
  const displayedMainTabOptions = useMemo(
    () =>
      mainTabOptions.map((tab) =>
        tab.id === "spells" ? { ...tab, label: isPrayerCaster ? "Prayers" : "Spells" } : tab,
      ),
    [isPrayerCaster],
  );
  const displayedMobileTabMenuOptions = useMemo(
    () => [{ id: "characteristics" as const, label: "Characteristics" }, ...displayedMainTabOptions],
    [displayedMainTabOptions],
  );
  const displayedMobilePageTitleByView = useMemo(
    () =>
      displayedMobileTabMenuOptions.reduce(
        (titles, option) => ({ ...titles, [option.id]: option.label }),
        { career: "Edit Character" } as Record<MobileTabMenuTarget, string>,
      ),
    [displayedMobileTabMenuOptions],
  );
  const availableSpellDefinitions = useMemo(
    () => filterSpellDefinitionsForMode(ruleset.spells, isPrayerCaster),
    [isPrayerCaster, ruleset.spells],
  );
  const availableCharacterSpells = useMemo(
    () => filterSpellDefinitionsForMode(characterData.spells, isPrayerCaster),
    [characterData.spells, isPrayerCaster],
  );
  const knownAvailableSpellIds = useMemo(
    () => new Set(availableCharacterSpells.map((spell) => spell.id)),
    [availableCharacterSpells],
  );
  const {
    openSpellShop,
    spellRows,
    spellSubtabOptions,
  } = useSpellsViewModel({
    activeSpellSubtab,
    attributes,
    characterSkills,
    formatSpellDuration,
    formatSpellRange,
    formatSpellTarget,
    isPrayerMode: isPrayerCaster,
    setIsSpellShopOpen,
    spells: availableCharacterSpells,
  });

  useEffect(() => {
    if (!spellSubtabOptions.some((option) => option.id === activeSpellSubtab)) {
      setActiveSpellSubtab("all");
    }
  }, [activeSpellSubtab, setActiveSpellSubtab, spellSubtabOptions]);

  const {
    restoreRouteForCharacter,
    selectCharacter,
    selectMainTab,
    selectMobileMainView,
  } = useCampaignRouteSync({
    activeMainTab,
    activeMobileMainView,
    availableCharacters,
    handleMobileMainViewSelect,
    routeSyncEnabled: !isLandingPageOpen,
    selectedCharacterId,
    setActiveMainTab,
    setActiveMobileMainView,
    setSelectedCharacterId,
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsLandingPageOpen(parseCampaignCharacterPath(window.location.pathname) === null);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const openCharacterFromLanding = useCallback((characterId: string) => {
    const character = availableCharacters.find((availableCharacter) => availableCharacter.id === characterId);
    const nextPath = buildCampaignCharacterPath({
      campaignId: character?.campaignId,
      characterId,
      view: "characteristics",
      omitDefaultView: true,
    });
    const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;

    window.history.pushState(null, "", nextUrl);
    setIsLandingPageOpen(false);
    setSelectedCharacterId(characterId);
  }, [availableCharacters, setSelectedCharacterId]);

  useEffect(() => {
    resetAppShellState();
    setActiveInventoryMenu(null);
    resetPendingAdvancements();
    setPendingXpAdjustment(0);
    setPendingTotalXpAdjustment(0);
    resetDiceRoller();

    restoreRouteForCharacter(characterData.id);
  }, [characterData.id, resetDiceRoller, restoreRouteForCharacter]);

  useEffect(() => {
    if (activeInfo) {
      setIsShopOpen(false);
    }
  }, [activeInfo]);



  const skillListRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const propertyListRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const talentListRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleAdvanceSkill = (skillName: string) => {
    const skillIndex = characterSkills.findIndex(s => s.displayName === skillName);
    if (skillIndex === -1) return;

    const skill = characterSkills[skillIndex];
    const cost = getAdvanceCost(skill.advances);

    if (xpCurrent >= cost) {
      const newSkills = [...characterSkills];
      newSkills[skillIndex] = { ...skill, advances: skill.advances + 1 };
      setCharacterSkills(newSkills);
      setXpCurrent(prev => prev - cost);
    }
  };

  // Removed automatic scroll to skill as per "scroll with the rest" request
  /* 
  useEffect(() => {
    if (activeSkillInfo && skillListRefs.current[activeSkillInfo]) {
      setTimeout(() => {
        skillListRefs.current[activeSkillInfo]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [activeSkillInfo]);
  */

  useEffect(() => {
    setCorruptionCurrent((prev) => Math.min(prev, maxCorruption));
  }, [maxCorruption, setCorruptionCurrent]);

  const {
    activeInventoryMenu,
    canDropInventoryDrag,
    canDropInventoryItem,
    canStoreCoinsInContainer,
    canStoreInContainer,
    handleAddConsumableItem,
    handleAddShopItem,
    handleAddSpell,
    handleAdjustCoinType,
    handleCarryItem,
    handleCoinDragStart,
    handleConsumeItem,
    handleDropItem,
    handleInventoryDragEnd,
    handleInventoryDragOver,
    handleInventoryDragStart,
    handleInventoryDrop,
    handleMoveCoins,
    handleResolveArmourFit,
    handleStoreItem,
    handleToggleInventoryMenu,
    handleUnwearItem,
    handleWearItem,
    inventoryDrag,
    inventoryDropTarget,
    inventoryMenuRef,
    setActiveInventoryMenu,
    setInventoryDropTarget,
  } = useInventoryActions({
    characterCoins: characterData.coins,
    coinContainerId,
    equipmentState,
    getArmourFitConflicts,
    setActiveMainTab,
    setActiveMobileMainView,
    setCharacterCoins,
    setCoinContainerId,
    setCharacterSpells,
    setEquipmentState,
  });

  const adjustWounds = (delta: number) => {
    setWoundsCurrent(prev => Math.min(Math.max(0, prev + delta), characterData.wounds.max));
  };

  const adjustCorruption = (delta: number) => {
    setCorruptionCurrent(prev => Math.min(Math.max(0, prev + delta), maxCorruption));
  };

  const adjustFate = (delta: number) => {
    setFateCurrent(prev => Math.max(0, prev + delta));
  };

  const adjustFortune = (delta: number) => {
    setFortuneCurrent(prev => Math.min(Math.max(0, prev + delta), fateCurrent));
  };

  const adjustResilience = (delta: number) => {
    setResilienceCurrent(prev => Math.max(0, prev + delta));
  };

  const adjustResolve = (delta: number) => {
    setResolveCurrent(prev => Math.min(Math.max(0, prev + delta), Math.min(resourceCaps.resolve, resilienceCurrent)));
  };

  const awardXp = (amount: number) => {
    const gainedXp = Math.max(0, Math.floor(amount));

    if (gainedXp <= 0) {
      return;
    }

    setXpCurrent(prev => prev + gainedXp);
    setXpTotal(prev => prev + gainedXp);
  };

  const openTalentInfo = (talentName: string) => {
    const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
    closeSidebars();
    setActiveInfo({
      type: "talent",
      name: talentName,
      extra: talentDefinition ? { description: talentDefinition.description } : undefined,
    });
  };

  const purchaseSkillAdvance = (skillName: string) => {
    setPendingSkillAdvances((prev) => ({
      ...prev,
      [skillName]: (prev[skillName] ?? 0) + 1,
    }));
  };

  const purchaseTalent = (talentName: string) => {
    const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
    if (!talentDefinition) {
      return;
    }

    setCharacterTalents((prev) => [
      ...prev,
      {
        id: talentDefinition.id,
        name: talentDefinition.name,
        description: talentDefinition.description,
        max: talentDefinition.max,
        tests: talentDefinition.tests,
        effects: talentDefinition.effects,
      },
    ]);
  };

  const addTalentForFree = (talentName: string) => {
    const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
    if (!talentDefinition) {
      return;
    }

    setCharacterTalents((prev) => [
      ...prev,
      {
        id: talentDefinition.id,
        name: talentDefinition.name,
        description: talentDefinition.description,
        max: talentDefinition.max,
        tests: talentDefinition.tests,
        effects: talentDefinition.effects,
      },
    ]);
  };

  const removeTalent = (talentName: string) => {
    if ((pendingTalentPurchases[talentName] ?? 0) > 0) {
      removePendingTalentPurchase(talentName);
      return;
    }

    setCharacterTalents((prev) => {
      const removeIndex = prev.findLastIndex((talent) => talent.name === talentName);
      if (removeIndex < 0) {
        return prev;
      }

      return prev.filter((_, index) => index !== removeIndex);
    });
  };

  const updateTalentTaken = (talentName: string, takenCount: number) => {
    const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
    if (!talentDefinition) {
      return;
    }

    setCharacterTalents((prev) => {
      const safeTakenCount = Math.max(0, Math.floor(takenCount));
      const firstTalentIndex = prev.findIndex((talent) => talent.name === talentName);
      const nextTalents = prev.filter((talent) => talent.name !== talentName);
      const replacementTalents = Array.from({ length: safeTakenCount }, () => ({
        id: talentDefinition.id,
        name: talentDefinition.name,
        description: talentDefinition.description,
        max: talentDefinition.max,
        tests: talentDefinition.tests,
        effects: talentDefinition.effects,
      }));

      if (firstTalentIndex < 0) {
        return [...nextTalents, ...replacementTalents];
      }

      nextTalents.splice(firstTalentIndex, 0, ...replacementTalents);
      return nextTalents;
    });
  };

  const removeSpell = (spellId: string) => {
    setCharacterSpells((prev) => prev.filter((spell) => spell.id !== spellId));
  };

  const increasePendingCareerRank = () => {
    if (!nextCareerRankRecord) return;
    setPendingCareerRank(displayedCareerRank + 1);
  };

  const decreasePendingCareerRank = () => {
    setPendingCareerRank((prev) => {
      if (prev === null) return null;
      return prev <= currentCareerRank ? null : prev - 1;
    });
  };

  const removePendingSkillAdvance = (skillName: string) => {
    setPendingSkillAdvances((prev) => {
      const current = prev[skillName] ?? 0;
      if (current <= 1) {
        const { [skillName]: _removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [skillName]: current - 1,
      };
    });
  };

  const removePendingTalentPurchase = (talentName: string) => {
    setPendingTalentPurchases((prev) => {
      const current = prev[talentName] ?? 0;
      if (current <= 1) {
        const { [talentName]: _removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [talentName]: current - 1,
      };
    });
  };

  const clampAdvanceEditValue = (value: number) => Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));

  const updateCharacteristicInitial = (characteristicKey: string, initialValue: number) => {
    setCurrentCharacteristicInitials((prev) => ({
      ...prev,
      [characteristicKey]: clampAdvanceEditValue(initialValue),
    }));
  };

  const updateCharacteristicAdvances = (characteristicKey: string, advances: number) => {
    setCurrentCharacteristicAdvances((prev) => ({
      ...prev,
      [characteristicKey]: clampAdvanceEditValue(advances),
    }));
  };

  const updateSkillAdvances = (skillName: string, advances: number) => {
    const nextAdvances = clampAdvanceEditValue(advances);

    setCharacterSkills((prev) => {
      const skillOption = rulesIndex.resolvedSkillOptions.find((option) => option.name === skillName);
      const skillDefinition = skillOption
        ? ruleset.skills.find((skill) => skill.id === skillOption.skillId)
        : null;

      if (!skillOption || !skillDefinition) return prev;

      const skillKey = getCharacterSkillKey(skillOption);
      const existingIndex = prev.findIndex((skill) => getCharacterSkillKey(skill) === skillKey);

      if (existingIndex >= 0) {
        if (nextAdvances === 0) {
          return prev.filter((_, index) => index !== existingIndex);
        }

        return prev.map((skill, index) =>
          index === existingIndex
            ? {
                ...skill,
                advances: nextAdvances,
              }
            : skill,
        );
      }

      if (nextAdvances === 0) return prev;

      return [
        ...prev,
        {
          skillId: skillOption.skillId,
          specialisationId: skillOption.specialisationId,
          advances: nextAdvances,
          baseName: skillDefinition.name,
          displayName: skillOption.name,
          characteristic: rulesIndex.skillCharacteristicById[skillOption.skillId],
        },
      ];
    });
  };

  const saveCareerChanges = () => {
    if (!hasPendingAdvanceChanges) return;

    if (Object.keys(pendingCharacteristicAdvances).length > 0) {
      setCurrentCharacteristicAdvances((prev) => {
        const nextAdvances = { ...prev };

        for (const [characteristicKey, pendingCount] of Object.entries(pendingCharacteristicAdvances)) {
          nextAdvances[characteristicKey] = (nextAdvances[characteristicKey] ?? 0) + pendingCount;
        }

        return nextAdvances;
      });
    }

    if (Object.keys(pendingSkillAdvances).length > 0) {
      setCharacterSkills((prev) => {
        let nextSkills = [...prev];

        for (const [skillName, pendingCount] of Object.entries(pendingSkillAdvances)) {
          const skillOption = rulesIndex.resolvedSkillOptions.find((option) => option.name === skillName);
          const skillDefinition = skillOption
            ? ruleset.skills.find((skill) => skill.id === skillOption.skillId)
            : null;

          if (!skillOption || !skillDefinition) continue;

          const skillKey = getCharacterSkillKey(skillOption);
          const existingIndex = nextSkills.findIndex((skill) => getCharacterSkillKey(skill) === skillKey);

          if (existingIndex >= 0) {
            nextSkills[existingIndex] = {
              ...nextSkills[existingIndex],
              advances: nextSkills[existingIndex].advances + pendingCount,
            };
            continue;
          }

          nextSkills = [
            ...nextSkills,
            {
              skillId: skillOption.skillId,
              specialisationId: skillOption.specialisationId,
              advances: pendingCount,
              baseName: skillDefinition.name,
              displayName: skillOption.name,
              characteristic: rulesIndex.skillCharacteristicById[skillOption.skillId],
            },
          ];
        }

        return nextSkills;
      });
    }

    if (Object.keys(pendingTalentPurchases).length > 0) {
      setCharacterTalents((prev) => {
        const nextTalents = [...prev];

        for (const [talentName, pendingCount] of Object.entries(pendingTalentPurchases)) {
          const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
          if (!talentDefinition) {
            continue;
          }

          const purchaseCount = Number(pendingCount);
          for (let step = 0; step < purchaseCount; step += 1) {
            nextTalents.push({
              id: talentDefinition.id,
              name: talentDefinition.name,
              description: talentDefinition.description,
              max: talentDefinition.max,
              tests: talentDefinition.tests,
              effects: talentDefinition.effects,
            });
          }
        }

        return nextTalents;
      });
    }

    if (pendingCareerRank !== null) {
      setCurrentCareerRank(pendingCareerRank);
    }

    setXpCurrent((prev) => Math.max(0, prev + pendingXpAdjustment));
    setXpTotal((prev) => Math.max(0, prev + pendingTotalXpAdjustment));
    setPendingXpAdjustment(0);
    setPendingTotalXpAdjustment(0);
    resetPendingAdvancements();
  };

  const getCharacteristicLabel = (key: Characteristic["key"]) => {
    const labels: Record<Characteristic["key"], string> = {
      WS: "Weapon Skill",
      BS: "Ballistic Skill",
      S: "Strength",
      T: "Toughness",
      I: "Initiative",
      Ag: "Agility",
      Dex: "Dexterity",
      Int: "Intelligence",
      WP: "Willpower",
      Fel: "Fellowship",
    };
    return labels[key];
  };

  const getCharacteristicDescription = (key: Characteristic["key"]) => {
    const descriptions: Record<Characteristic["key"], string> = {
      WS: "Your training and accuracy in close combat, used when striking with melee weapons and defending blade to blade.",
      BS: "Your accuracy with ranged weapons, covering bows, crossbows, firearms, and other shots made at a distance.",
      S: "Your raw physical power, used when lifting, forcing, grappling, and adding force behind many attacks.",
      T: "Your hardiness and endurance, reflecting how well you withstand injury, hardship, poison, and fatigue.",
      I: "Your awareness and instinctive reactions, useful for noticing danger and acting in the moment.",
      Ag: "Your balance, speed, and bodily control, used for movement, dodging, and physical finesse.",
      Dex: "Your hand precision and fine motor control, used for delicate work, craft, and careful manipulation.",
      Int: "Your reasoning, memory, and learned understanding, used for knowledge, deduction, and study.",
      WP: "Your mental discipline and resolve, used to resist fear, pressure, corruption, and magical strain.",
      Fel: "Your force of personality and social presence, used when leading, persuading, deceiving, or inspiring others.",
    };

    return descriptions[key];
  };

  const basicSkillRows = rulesIndex.resolvedSkillOptions
    .filter(isBasicSkillOption)
    .map((option) => {
      const characterSkill = characterSkillByName.get(option.name);
      const skillDef = skillDefinitionById.get(option.skillId);
      return {
        key: option.id,
        displayName: option.name,
        characteristic:
          characterSkill?.characteristic ?? rulesIndex.skillCharacteristicById[option.skillId] ?? "",
        advances: characterSkill?.advances ?? 0,
        shortDescription: skillDef?.shortDescription,
        description: skillDef?.description,
        specialization: option.specialisationId
          ? skillSpecialisationById.get(option.specialisationId)?.name
          : undefined,
        isTrained: (characterSkill?.advances ?? 0) > 0,
        skillId: option.skillId,
        isGrouped: skillDef?.grouped ?? false,
        skillName: skillDef?.name ?? "",
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  
  const untrainedBasicSkillRows = basicSkillRows.filter((skill) => !skill.isTrained);
  
  const trainedBasicSkillRows = basicSkillRows.filter((skill) => skill.isTrained);
  const advancedSkillRows = characterSkills
    .filter(
      (skill) =>
        !isBasicSkillOption({
          id: getCharacterSkillKey(skill),
          skillId: skill.skillId,
          specialisationId: skill.specialisationId,
          name: skill.displayName,
        }) &&
        skill.advances > 0,
    )
    .map((skill) => ({
      key: getCharacterSkillKey(skill),
      displayName: skill.displayName,
      characteristic: skill.characteristic,
      advances: skill.advances,
      shortDescription: skillDefinitionById.get(skill.skillId)?.shortDescription,
      description: skillDefinitionById.get(skill.skillId)?.description,
      specialization: skill.specialisationId
        ? skillSpecialisationById.get(skill.specialisationId)?.name
        : undefined,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  const allSkillRows = [...trainedBasicSkillRows, ...advancedSkillRows].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );
  const visibleSkillRows =
    activeSkillSubtab === "all"
      ? allSkillRows
      : activeSkillSubtab === "advanced"
          ? advancedSkillRows
          : trainedBasicSkillRows;
  const skillSections = [
    { id: "advanced" as const, title: "Advanced", skills: advancedSkillRows },
    { id: "basic-trained" as const, title: "Trained", skills: trainedBasicSkillRows },
    { id: "basic-untrained" as const, title: "Untrained", skills: untrainedBasicSkillRows },
  ];
  const advancementSkillNames = [...new Set([
    ...careerAdvancementData.skills,
    ...careerAdvancementData.skills.flatMap(getCareerSkillOptions),
    ...rulesIndex.resolvedSkillOptions.map((option) => option.name),
    ...skillSections.flatMap((section) => section.skills.map((skill) => skill.displayName)),
  ])];
  const sidebarCareerSkillNames = new Set(careerAdvancementData.skills);
  const advancementSkillRows = advancementSkillNames
    .map((skillName) => {
      const skill = characterSkills.find((entry) => entry.displayName === skillName);
      const skillOption = rulesIndex.resolvedSkillOptions.find((option) => option.name === skillName);
      const specialisationId = skillOption?.specialisationId ?? skill?.specialisationId;
      const skillDefinition =
        skillDefinitionById.get(skillOption?.skillId ?? skill?.skillId ?? "") ??
        skillDefinitionByName.get(skillName);
      const pendingAdvances = pendingSkillAdvances[skillName] ?? 0;
      const baseAdvances = skill?.advances ?? 0;
      const characteristicKey =
        skill?.characteristic ??
        (skillOption
          ? rulesIndex.skillCharacteristicById[skillOption.skillId] ?? ""
          : skillDefinition
            ? rulesIndex.skillCharacteristicById[skillDefinition.id] ?? ""
            : "");
      const baseCharacteristicValue =
        characteristicKey
          ? (attributes[characteristicKey] ?? 0)
          : 0;
      const isBasicSkill =
        skillOption
          ? isBasicSkillOption(skillOption)
          : skill
            ? isBasicSkillOption({
                id: getCharacterSkillKey(skill),
                skillId: skill.skillId,
                specialisationId: skill.specialisationId,
                name: skill.displayName,
              })
            : skillDefinition?.type === "basic";

      return {
        skillName,
        skill,
        pendingAdvances,
        baseAdvances,
        characteristicKey,
        baseCharacteristicValue,
        nextSkillCost: getAdvanceCost(baseAdvances + pendingAdvances),
        isCareerSkill: isCareerSkillName(skillName),
        isSidebarCareerSkill: sidebarCareerSkillNames.has(skillName),
        isBasicSkill,
        isTrained: baseAdvances + pendingAdvances > 0,
        shortDescription: skillDefinition?.shortDescription,
        description: skillDefinition?.description,
        specialization: specialisationId
          ? skillSpecialisationById.get(specialisationId)?.name
          : undefined,
      };
    })
    .sort((a, b) => a.skillName.localeCompare(b.skillName));
  const advancementSkillSections = [
    {
      id: "advanced" as const,
      title: "Advanced",
      skills: advancementSkillRows.filter(
        (skill) => !skill.isBasicSkill && skill.isCareerSkill && Boolean(skill.skill),
      ),
    },
    {
      id: "basic-trained" as const,
      title: "Trained",
      skills: advancementSkillRows.filter((skill) => skill.isBasicSkill && skill.isTrained),
    },
    {
      id: "basic-untrained" as const,
      title: "Untrained",
      skills: advancementSkillRows.filter((skill) => skill.isBasicSkill && !skill.isTrained),
    },
  ];

  const closeSidebars = () => {
    setActiveInfo(null);
    setIsShopOpen(false);
    setIsSpellShopOpen(false);
    setIsDiceLogOpen(false);
    setIsSkillSidebarOpen(false);
    setIsTalentSidebarOpen(false);
    setRollState((prev) => ({ ...prev, characteristic: null }));
  };

  const openAdvanceView = () => {
    closeSidebars();
    selectMainTab("career");
  };

  const openCharacterBuilder = () => {
    closeSidebars();
    setIsCharacterBuilderOpen(true);
  };

  const openDiceLog = () => {
    closeSidebars();
    setIsDiceLogOpen(true);
  };

  const openMobileAdvanceView = () => {
    openAdvanceView();
    setIsMobilePortraitMenuOpen(false);
  };

  const openTalentSidebar = () => {
    closeSidebars();
    setIsTalentSidebarOpen(true);
  };

  const openSkillSidebar = () => {
    closeSidebars();
    setIsSkillSidebarOpen(true);
  };

  const openMobileTalentSidebar = () => {
    openTalentSidebar();
    setIsMobilePortraitMenuOpen(false);
  };

  const openMobileSkillSidebar = () => {
    openSkillSidebar();
    setIsMobilePortraitMenuOpen(false);
  };

  const openMobileCharacterActions = () => {
    setIsMobileNavigationOpen(false);
    setIsMobileCharacterListOpen(false);
    setIsMobilePortraitMenuOpen((isOpen) => !isOpen);
  };

  const openMobileJournalEntry = () => {
    setIsMobileNavigationOpen(false);
    setIsMobileCharacterListOpen(false);
    setIsMobilePortraitMenuOpen(false);
    openNoteComposer();

    if (activeJournalSubtab === "npcs" && !/(^|\s)#npcs?(\s|$)/i.test(newNoteText)) {
      setNewNoteText(newNoteText.trim() ? `${newNoteText.trim()}\n\n#npc` : "#npc");
    }

    window.setTimeout(() => {
      document.getElementById("journal-new-note-title")?.focus();
    }, 0);
  };

  const mobileAddAction =
    activeMobileMainView === "skills"
      ? {
          label: "Open skill sidebar",
          onClick: openMobileSkillSidebar,
        }
      : activeMobileMainView === "features"
        ? {
            label: "Open talent sidebar",
            onClick: openMobileTalentSidebar,
          }
      : activeMobileMainView === "inventory"
      ? {
          label: "Add Inventory",
          onClick: () => {
            closeSidebars();
            setIsMobileNavigationOpen(false);
            setIsMobileCharacterListOpen(false);
            setIsMobilePortraitMenuOpen(false);
            setIsShopOpen(true);
          },
        }
      : activeMobileMainView === "spells"
        ? {
            label: isPrayerCaster ? "Add prayer" : "Add spell",
            onClick: () => {
              closeSidebars();
              setIsMobileNavigationOpen(false);
              setIsMobileCharacterListOpen(false);
              setIsMobilePortraitMenuOpen(false);
              setIsSpellShopOpen(true);
            },
          }
      : activeMobileMainView === "journal" && activeJournalSubtab !== "background"
        ? {
            label: activeJournalSubtab === "npcs" ? "Add NPC" : "Add session",
            onClick: openMobileJournalEntry,
          }
      : null;

  const navigateMobileMainView = (direction: -1 | 1) => {
    const currentIndex = displayedMobileTabMenuOptions.findIndex((option) => option.id === activeMobileMainView);
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex =
      (safeCurrentIndex + direction + displayedMobileTabMenuOptions.length) % displayedMobileTabMenuOptions.length;

    selectMobileMainView(displayedMobileTabMenuOptions[nextIndex].id);
  };
  const mobileMainViewSwipeHandlers = useHorizontalSwipePager({
    onNext: () => navigateMobileMainView(1),
    onPrevious: () => navigateMobileMainView(-1),
  });
  const shouldRenderMainTabPanel = isDesktopLayout || activeMobileMainView !== "characteristics";
  const mobilePageTitle = activeMainTab === "career"
    ? "Edit Character"
    : displayedMobilePageTitleByView[activeMobileMainView];
  const closeEditCharacterPage = () => selectMainTab("skills");
  const advancePageContent = (
    <LazyTabPanel>
      <CareerTab
        ref={careerTabRef}
        activeCareerSubtab={activeCareerSubtab}
        saveCareerChanges={saveCareerChanges}
        hasPendingCareerChanges={hasPendingAdvanceChanges}
        onDraftChangesChange={handleCareerTabDraftChangesChange}
        characterData={characterData}
        pendingXpAdjustment={pendingXpAdjustment}
        pendingTotalXpAdjustment={pendingTotalXpAdjustment}
        setPendingXpAdjustment={setPendingXpAdjustment}
        setPendingTotalXpAdjustment={setPendingTotalXpAdjustment}
        displayedCareerRank={displayedCareerRank}
        displayedCareerRankRecord={displayedCareerRankRecord}
        careerAdvancementData={careerAdvancementData}
        pendingAvailableXp={pendingAvailableXp}
        nextCareerRankRecord={nextCareerRankRecord}
        increasePendingCareerRank={increasePendingCareerRank}
        advancementCharacteristics={advancementCharacteristics}
        getCharacteristicLabel={getCharacteristicLabel}
        updateCharacteristicInitial={updateCharacteristicInitial}
        updateCharacteristicAdvances={updateCharacteristicAdvances}
        advancementSkillSections={advancementSkillSections}
        updateSkillAdvances={updateSkillAdvances}
        advancementTalentNames={advancementTalentNames}
        characterTalents={characterTalents}
        purchaseTalent={purchaseTalent}
        updateTalentTaken={updateTalentTaken}
        getTalentMaxDisplayByName={getTalentMaxDisplayByName}
        openTalentInfo={openTalentInfo}
        setActiveInfo={setActiveInfo}
        clearRollCharacteristic={() => setRollState((prev) => ({ ...prev, characteristic: null }))}
      />
    </LazyTabPanel>
  );

  if (isLandingPageOpen) {
    return (
      <LandingPage
        characters={availableCharacters}
        onSelectCharacter={openCharacterFromLanding}
      />
    );
  }

  if (isCharacterBuilderOpen) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-wfrp-dark" />}>
        <CharacterBuilderScreen
          ruleset={ruleset}
          onClose={() => setIsCharacterBuilderOpen(false)}
          onFinish={() => setIsCharacterBuilderOpen(false)}
        />
      </Suspense>
    );
  }

  return (
    <AppShell
      mobileAddAction={mobileAddAction}
      mobileNavigation={isMobileNavigationOpen ? (
        <Suspense fallback={null}>
          <MobileTabMenu
            activeMobileMainView={activeMobileMainView}
            availableCharacters={availableCharacters}
            campaignName={UI_LABELS.CAMPAIGN_NAME}
            characterName={characterData.name}
            closeMobileNavigation={closeMobileNavigation}
            handleMobileMainViewSelect={selectMobileMainView}
            isMobileCharacterListOpen={isMobileCharacterListOpen}
            isMobileNavigationOpen={isMobileNavigationOpen}
            mobileTabMenuOptions={displayedMobileTabMenuOptions}
            onCreateCharacter={() => {
              openCharacterBuilder();
              closeMobileNavigation();
            }}
            onOpenDiceLog={() => {
              openDiceLog();
              closeMobileNavigation();
            }}
            selectedCharacterId={selectedCharacterId}
            setIsMobileCharacterListOpen={setIsMobileCharacterListOpen}
            setSelectedCharacterId={selectCharacter}
          />
        </Suspense>
      ) : null}
      sidebars={(
        <>
          {(isDiceLogOpen || Boolean(rollState.characteristic)) && (
            <Suspense fallback={null}>
              <DiceLogSidebar
                activeRollerRef={activeRollerRef}
                archiveRoll={archiveRoll}
                canRollCritical={canRollCritical}
                canUseFortuneActions={canUseFortuneActions}
                canUseResilienceAction={canUseResilienceAction}
                displayRoll={displayRoll}
                executeRoll={executeRoll}
                formatSignedSl={formatSignedSl}
                getDamageTotal={getDamageTotal}
                getDifficultyLabel={getDifficultyLabel}
                getHitLocation={getHitLocation}
                getIsCritical={getIsCritical}
                getOutcome={getOutcome}
                getRollBaseValue={getRollBaseValue}
                getRollTarget={getRollTarget}
                getTargetBonusTotal={getTargetBonusTotal}
                getTestTypeTitle={getTestTypeTitle}
                handleAddSl={handleAddSl}
                handleIWillNotFail={handleIWillNotFail}
                handleReroll={handleReroll}
                handleRollCritical={handleRollCritical}
                isOpen={isDiceLogOpen || Boolean(rollState.characteristic)}
                rollHistory={rollHistory}
                rollState={rollState}
                setIsDiceLogOpen={setIsDiceLogOpen}
                setRollState={setRollState}
              />
            </Suspense>
          )}

          <Suspense fallback={null}>
            {activeInfo ? (
              <InfoSidebar
                activeInfo={activeInfo}
                setActiveInfo={setActiveInfo}
                getCharacteristicDescription={getCharacteristicDescription}
              />
            ) : null}
            {isShopOpen ? (
              <ShopSidebar
                isOpen={isShopOpen}
                coins={characterData.coins}
                ownedItemIds={ownedShopItemIds}
                onAddToInventory={handleAddShopItem}
                onBuy={handleAddShopItem}
                onClose={() => setIsShopOpen(false)}
              />
            ) : null}
            {isSpellShopOpen ? (
              <SpellShopSidebar
                isOpen={isSpellShopOpen}
                spells={availableSpellDefinitions}
                knownSpellIds={knownAvailableSpellIds}
                isPrayerMode={isPrayerCaster}
                onAddSpell={handleAddSpell}
                onClose={() => setIsSpellShopOpen(false)}
                onRemoveSpell={removeSpell}
              />
            ) : null}
            <SkillSidebar
              initialFilter="all"
              isOpen={isSkillSidebarOpen}
              onClose={() => setIsSkillSidebarOpen(false)}
              pendingAvailableXp={pendingAvailableXp}
              purchaseSkillAdvance={purchaseSkillAdvance}
              removePendingSkillAdvance={removePendingSkillAdvance}
              skills={advancementSkillRows}
            />
            <TalentSidebar
              characterTalents={characterTalents}
              careerTalentNames={careerAdvancementData.talents}
              getTalentMaxDisplay={getTalentMaxDisplay}
              getTalentPurchaseCost={getTalentPurchaseCost}
              isOpen={isTalentSidebarOpen}
              pendingAvailableXp={pendingAvailableXp}
              pendingTalentPurchases={pendingTalentPurchases}
              onRemoveTalent={removeTalent}
              purchaseTalent={purchaseTalent}
              talents={ruleset.talents}
              onClose={() => setIsTalentSidebarOpen(false)}
            />
          </Suspense>
        </>
      )}
    >
          
          <CharacterSheetFrame
            desktopHeader={(
              <CharacterSheetHeader
                availableCharacters={availableCharacters}
                characterData={characterData}
                isMobileNavigationOpen={isMobileNavigationOpen}
                isMobilePortraitMenuOpen={isMobilePortraitMenuOpen}
                onCloseMobilePortraitMenu={() => setIsMobilePortraitMenuOpen(false)}
                onCreateCharacter={openCharacterBuilder}
                onOpenAdvance={openAdvanceView}
                onOpenDice={openDiceLog}
                onOpenMobileCharacterActions={openMobileCharacterActions}
                onOpenMobileCharacterList={() => openMobileNavigation(true)}
                onOpenMobileNavigation={() => openMobileNavigation(false)}
                onSelectCharacter={selectCharacter}
                onAwardXp={awardXp}
                selectedCharacterId={selectedCharacterId}
                variant="desktop"
                xpCurrent={xpCurrent}
              />
            )}
            mobileHeader={(
              <CharacterSheetHeader
                availableCharacters={availableCharacters}
                characterData={characterData}
                isMobileNavigationOpen={isMobileNavigationOpen}
                isMobilePortraitMenuOpen={isMobilePortraitMenuOpen}
                onCloseMobilePortraitMenu={() => setIsMobilePortraitMenuOpen(false)}
                onCreateCharacter={openCharacterBuilder}
                onOpenAdvance={openMobileAdvanceView}
                onOpenDice={openDiceLog}
                onOpenMobileCharacterActions={openMobileCharacterActions}
                onOpenMobileCharacterList={() => openMobileNavigation(true)}
                onOpenMobileNavigation={() => openMobileNavigation(false)}
                onSelectCharacter={selectCharacter}
                onAwardXp={awardXp}
                selectedCharacterId={selectedCharacterId}
                variant="mobile"
                xpCurrent={xpCurrent}
              />
            )}
            mobileTitle={mobilePageTitle}
            onMobileNextView={() => navigateMobileMainView(1)}
            onMobilePreviousView={() => navigateMobileMainView(-1)}
          >

          {activeMainTab === "career" ? (
            <>
              <div className="hidden items-center justify-between gap-3 md:flex">
                <h1 className="min-w-0 truncate font-serif text-2xl font-bold leading-tight tracking-tight text-gray-100">
                  Edit Character
                </h1>
              </div>
              <section className="min-h-[500px] overflow-hidden rounded-lg border border-wfrp-border bg-card shadow-lg">
                <ScrollableTabStrip className="flex rounded-t-lg px-4 sm:!pl-4 sm:!pr-4 md:!pl-4 md:!pr-4 lg:!pr-12 bg-wfrp-surface-subtle border-b border-wfrp-border overflow-x-auto no-scrollbar">
                  <div className="flex w-full min-w-max items-center justify-between gap-4">
                    <div className="flex min-w-max items-center gap-4 lg:gap-6">
                      {editCharacterTabOptions.map((tab) => (
                        <NamedButton
                          key={tab.id}
                          type="button"
                          name={tab.label}
                          onClick={() => setActiveCareerSubtab(tab.id)}
                          className={cn(
                            mainTabButtonBaseClassName,
                            activeCareerSubtab === tab.id ? mainTabButtonActiveClassName : mainTabButtonInactiveClassName,
                          )}
                          aria-current={activeCareerSubtab === tab.id ? "page" : undefined}
                        >
                          {activeCareerSubtab === tab.id ? (
                            <div className={mainTabUnderlineClassName} />
                          ) : null}
                        </NamedButton>
                      ))}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <NamedButton
                        type="button"
                        name="Save"
                        onClick={handleEditCharacterSave}
                        isDeactivated={!hasUnsavedCareerEdits}
                        isGolden={hasUnsavedCareerEdits}
                        className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 disabled:cursor-not-allowed"
                        aria-label="Save edit character changes"
                      />
                      <NamedButton
                        type="button"
                        name="Close"
                        onClick={closeEditCharacterPage}
                        className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-wfrp-border bg-wfrp-surface px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-300 shadow-sm transition-all hover:border-wfrp-gold/50 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                        aria-label="Close Edit Character page"
                        leadingIcon={<X size={14} />}
                      />
                    </div>
                  </div>
                </ScrollableTabStrip>
                {advancePageContent}
              </section>
            </>
          ) : (
            <>
          <div {...mobileMainViewSwipeHandlers}>
            <CharacteristicsView
              activeMobileMainView={activeMobileMainView}
              attributes={attributes}
              onRoll={handleRoll}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div
              {...mobileMainViewSwipeHandlers}
              className={`w-full min-w-0 flex-col gap-6 md:flex md:w-[28%] md:min-w-[320px] xl:w-[24%] ${
                activeMobileMainView === "characteristics" ? "flex" : "hidden"
              }`}
            >
            <CharacterResourcesCards
              woundsCurrent={woundsCurrent}
              woundsMax={characterData.wounds.max}
              onAdjustWounds={adjustWounds}
              corruptionCurrent={corruptionCurrent}
              corruptionMax={maxCorruption}
              onAdjustCorruption={adjustCorruption}
              fateCurrent={fateCurrent}
              fateMax={resourceCaps.fate}
              onAdjustFate={adjustFate}
              fortuneCurrent={fortuneCurrent}
              onAdjustFortune={adjustFortune}
              resilienceCurrent={resilienceCurrent}
              resilienceMax={resourceCaps.resilience}
              onAdjustResilience={adjustResilience}
              resolveCurrent={resolveCurrent}
              resolveMax={Math.min(resourceCaps.resolve, resilienceCurrent)}
              onAdjustResolve={adjustResolve}
              coins={characterData.coins}
              onAdjustCoin={handleAdjustCoinType}
              onOpenRoll={(characteristic) => {
              handleRoll(characteristic, undefined, { testType: "corruption" });
  }}
/>

            <ArmourCard
              armourTotals={armourTotals}
              equippedArmourNames={equippedArmourNames}
            />
          </div>

          {/* Tabbed Info Box - 2/3 width on Desktop/Tablet */}
          <section
            {...mobileMainViewSwipeHandlers}
            className={`w-full flex-col overflow-visible self-start min-h-[500px] p-0! md:flex md:flex-1 md:overflow-hidden md:rounded-lg md:border md:border-wfrp-border md:bg-card md:shadow-lg ${
              activeMobileMainView === "characteristics" ? "hidden" : "flex"
            }`}
          >
              <ScrollableTabStrip className="hidden sm:flex rounded-t-lg px-4 sm:!pl-4 sm:!pr-4 md:!pl-4 md:!pr-4 lg:!pr-12 bg-wfrp-surface-subtle border-b border-wfrp-border overflow-x-auto no-scrollbar">
                <div className="mx-auto flex w-full min-w-max justify-center gap-4 lg:mx-0 lg:w-max lg:min-w-0 lg:justify-start lg:gap-6">
                  {displayedMainTabOptions.map((tab) => (
                    <NamedButton
                      key={tab.id}
                      name={tab.label}
                      onClick={() => selectMainTab(tab.id)}
                      className={cn(
                        mainTabButtonBaseClassName,
                        activeMainTab === tab.id ? mainTabButtonActiveClassName : mainTabButtonInactiveClassName,
                      )}
                      aria-current={activeMainTab === tab.id ? 'page' : undefined}
                    >
                      {activeMainTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wfrp-muted-text" />
                      )}
                    </NamedButton>
                  ))}
                </div>
              </ScrollableTabStrip>

              <div className="flex-1 flex flex-col min-h-0 md:bg-card">
                {shouldRenderMainTabPanel ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <MobileMainViewSwipeProvider handlers={mobileMainViewSwipeHandlers}>
                      <LazyTabPanel>
                        {activeMainTab === 'skills' && (
                          <SkillsTab
                            activeSkillSubtab={activeSkillSubtab}
                            setActiveSkillSubtab={setActiveSkillSubtab}
                            visibleSkillRows={visibleSkillRows}
                            attributes={attributes}
                            handleRoll={handleRoll}
                            onOpenAdvance={openSkillSidebar}
                            openSkillInfo={(skillName) => {
                              closeSidebars();
                              setActiveInfo({ type: 'skill', name: skillName });
                            }}
                          />
                        )}

                      {activeMainTab === 'actions' && (
                        <ActionsTab
                          activeActionCategory={activeActionCategory}
                          setActiveActionCategory={setActiveActionCategory}
                          characterData={{ ...characterData, spells: availableCharacterSpells }}
                        characterSkills={characterSkills}
                        equipmentState={equipmentState}
                        isPrayerMode={isPrayerCaster}
                        rulesIndex={rulesIndex}
                          getCharacteristicLabel={getCharacteristicLabel}
                          getTargetBonusTotal={getTargetBonusTotal}
                          handleRoll={handleRoll}
                          setRollAdjustments={(modifier, targetBonusSources) => {
                            setRollState(prev => ({
                              ...prev,
                              modifier,
                              targetBonusSources,
                            }));
                          }}
                        />
                      )}

                      {activeMainTab === 'spells' && (
                        <SpellsTab
                        spellSubtabOptions={spellSubtabOptions}
                        activeSpellSubtab={activeSpellSubtab}
                        setActiveSpellSubtab={setActiveSpellSubtab}
                        spellRows={spellRows}
                        handleRoll={handleRoll}
                        isPrayerMode={isPrayerCaster}
                        onRemoveSpell={removeSpell}
                        openSpellShop={openSpellShop}
                      />
                      )}
                      {activeMainTab === 'inventory' && (
                        <InventoryTab
                        activeInventorySubtab={activeInventorySubtab}
                        setActiveInventorySubtab={setActiveInventorySubtab}
                        characterData={characterData}
                        coinContainerId={coinContainerId}
                        equipmentState={equipmentState}
                        totalEncumbrance={totalEncumbrance}
                        carryCapacity={carryCapacity}
                        encumbrancePercent={encumbrancePercent}
                        containers={containers}
                        wornItems={wornItems}
                        carriedItems={carriedItems}
                        inventoryDrag={inventoryDrag}
                        inventoryDropTarget={inventoryDropTarget}
                        setInventoryDropTarget={setInventoryDropTarget}
                        activeInventoryMenu={activeInventoryMenu}
                        inventoryMenuRef={inventoryMenuRef}
                        getContainerUsedEncumbrance={getContainerUsedEncumbrance}
                        getContainerContents={getContainerContents}
                        canDropInventoryDrag={canDropInventoryDrag}
                        canDropInventoryItem={canDropInventoryItem}
                        canStoreCoinsInContainer={canStoreCoinsInContainer}
                        canStoreInContainer={canStoreInContainer}
                        handleInventoryDragOver={handleInventoryDragOver}
                        handleInventoryDrop={handleInventoryDrop}
                        handleInventoryDragStart={handleInventoryDragStart}
                        handleCoinDragStart={handleCoinDragStart}
                        handleInventoryDragEnd={handleInventoryDragEnd}
                        handleMoveCoins={handleMoveCoins}
                        handleAddConsumableItem={handleAddConsumableItem}
                        handleConsumeItem={handleConsumeItem}
                        handleToggleInventoryMenu={handleToggleInventoryMenu}
                        handleDropItem={handleDropItem}
                        handleWearItem={handleWearItem}
                        handleUnwearItem={handleUnwearItem}
                        handleCarryItem={handleCarryItem}
                        handleStoreItem={handleStoreItem}
                        formatItemValue={formatItemValue}
                        openShop={() => {
                          closeSidebars();
                          setIsShopOpen(true);
                        }}
                      />
                      )}
                    
                      {activeMainTab === 'features' && (
                        <TalentsTab
                        talentRowsBySource={talentRowsBySource}
                        getTalentMaxDisplay={getTalentMaxDisplay}
                        formatTalentEffect={formatTalentEffect}
                        onOpenTalentSidebar={openTalentSidebar}
                        onRemoveTalent={removeTalent}
                      />
                      )}

                      {activeMainTab === 'journal' && (
                        <JournalTab
                        activeJournalSubtab={activeJournalSubtab}
                        setActiveJournalSubtab={setActiveJournalSubtab}
                        sortedNotes={sortedNotes}
                        noteGroups={noteGroups}
                        noteHashtags={noteHashtags}
                        npcNotes={npcNotes}
                        npcNoteGroups={npcNoteGroups}
                        npcNoteHashtags={npcNoteHashtags}
                        noteSearch={noteSearch}
                        setNoteSearch={setNoteSearch}
                        newNoteTitle={newNoteTitle}
                        setNewNoteTitle={setNewNoteTitle}
                        newNoteText={newNoteText}
                        setNewNoteText={setNewNoteText}
                        addNote={addNote}
                        cancelNoteComposer={cancelNoteComposer}
                        deleteNote={deleteNote}
                        editingNoteId={editingNoteId}
                        editNote={editNote}
                        isNoteComposerOpen={isNoteComposerOpen}
                        openNoteComposer={openNoteComposer}
                        formatNoteDay={formatNoteDay}
                        formatNoteDate={formatNoteDate}
                        backgroundText={backgroundText}
                        setBackgroundText={setBackgroundText}
                      />
                      )}
                      </LazyTabPanel>
                    </MobileMainViewSwipeProvider>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
            </>
          )}
          </CharacterSheetFrame>
    </AppShell>
  );
}
