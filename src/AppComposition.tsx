/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import {
  Dice5,
} from "lucide-react";
import { AppShell } from "./components/AppShell";
import { ArmourCard } from "./components/ArmourCard";
import { CharacterSheetFrame } from "./components/CharacterSheetFrame";
import { CharacterSheetHeader } from "./components/CharacterSheetHeader";
import { GainExperiencePage } from "./components/GainExperiencePage";
import { CharacteristicsView } from "./components/CharacteristicsView";
import { LandingPage } from "./components/LandingPage";
import { GameMasterPage } from "./components/GameMasterPage";
import { MobileMainViewSwipeProvider } from "./components/MobileMainViewSwipeContext";
import { getAdvanceCost, getCharacteristicAdvanceCost, getTalentPurchaseCost } from "./lib/advanceCosts";
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
  MainTabMenu,
  Breadcrumbs,
  BottomSheetPaper,
  Button,
  Heading,
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
import {
  getCharacterTalentRows,
  getTalentMaxDisplay as getTalentMaxDisplayValue,
} from "./tabs/talents/talentUtils";
import type {
  ResolvedCharacterSkill,
  ResolvedCharacterTalent,
} from "./data/characters/resolved";
import { listCharacters, loadCharacterProgress } from "./data/repository";
import {
  loadCampaignSessions,
  saveCampaignSession,
  deleteCampaignSession,
  type GMScene,
  type GMSession,
} from "./data/gmSessions";
import {
  buildScenarioSessionScenes,
  type ScenarioSessionImportDefinition,
} from "./data/scenarios";
import {
  formatItemValue,
  getCharacterSkillKey,
} from "./lib/gameSession";
import { useCampaignRouteSync } from "./lib/useCampaignRouteSync";
import { buildCampaignCharacterPath, parseCampaignCharacterPath } from "./lib/campaignRoutes";
import { campaignById } from "./data/campaigns";
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
import type { CareerSubtab, MobileMainView } from "./tabs/tabTypes";
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
const CharacteristicSidebar = lazy(() =>
  import("./components/sidebar").then((module) => ({ default: module.CharacteristicSidebar })),
);
const MobileMenuSidebar = lazy(() =>
  import("./components/sidebar").then((module) => ({ default: module.MobileMenuSidebar })),
);
const SkillSidebar = lazy(() =>
  import("./components/sidebar").then((module) => ({ default: module.SkillSidebar })),
);
const DiceLogPage = lazy(() =>
  import("./features/dice/DiceLogSidebar").then((module) => ({ default: module.DiceLogPage })),
);
const DiceRollerSidebar = lazy(() =>
  import("./features/dice/DiceLogSidebar").then((module) => ({ default: module.DiceRollerSidebar })),
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
const BooksTab = lazy(() => import("./tabs/BooksTab").then((module) => ({ default: module.BooksTab })));

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

function toSessionSlug(sessionNumber: number, name: string): string {
  const normalized = name
    .replace(/ä/gi, "ae")
    .replace(/ö/gi, "oe")
    .replace(/ü/gi, "ue")
    .replace(/å/gi, "aa")
    .replace(/æ/gi, "ae")
    .replace(/ø/gi, "oe")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `session-${sessionNumber + 1}-${normalized}`;
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
    isAllProgressHydrated,
  } = useGameSessionContext();
  const [pendingXpAdjustment, setPendingXpAdjustment] = useState(0);
  const [pendingTotalXpAdjustment, setPendingTotalXpAdjustment] = useState(0);
  const [hasCareerTabDraftChanges, setHasCareerTabDraftChanges] = useState(false);
  const [isCharacteristicSidebarOpen, setIsCharacteristicSidebarOpen] = useState(false);
  const [isTalentSidebarOpen, setIsTalentSidebarOpen] = useState(false);
  const [isSkillSidebarOpen, setIsSkillSidebarOpen] = useState(false);
  const [isMobileMenuSidebarOpen, setIsMobileMenuSidebarOpen] = useState(false);
  const [isMobileGainExperienceOpen, setIsMobileGainExperienceOpen] = useState(false);
  const careerTabRef = useRef<CareerTabHandle>(null);
  const [isLandingPageOpen, setIsLandingPageOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return parseCampaignCharacterPath(window.location.pathname) === null && !window.location.pathname.includes("/campaign");
  });
  const [isGameMasterOpen, setIsGameMasterOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.location.pathname.includes("/campaign");
  });

  // GM Sessions States
  const [gmSessions, setGmSessions] = useState<GMSession[]>([]);
  const gmSessionsRef = useRef<GMSession[]>([]);
  useEffect(() => {
    gmSessionsRef.current = gmSessions;
  }, [gmSessions]);
  const [selectedGmSessionId, setSelectedGmSessionId] = useState<string | null>(null);
  const [isLoadingGmSessions, setIsLoadingGmSessions] = useState(false);
  const [isSessionsSidebarOpen, setIsSessionsSidebarOpen] = useState(false);

  const handleSelectSessionOnMobile = (sessionId: string) => {
    latestScenesRef.current = [];
    setSelectedGmSessionId(sessionId);
    if (typeof window !== "undefined" && window.innerWidth < 1920) {
      setIsSessionsSidebarOpen(false);
    }
    const session = gmSessions.find((s) => s.id === sessionId);
    if (session) {
      const slug = toSessionSlug(session.sessionNumber, session.name);
      const newPath = `/${characterData.campaignId}/campaign/${slug}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, "", newPath);
      }
    }
  };

  const [editingSessionName, setEditingSessionName] = useState("");
  const [editingSessionNumber, setEditingSessionNumber] = useState<number | "">("");
  const [editingSessionDate, setEditingSessionDate] = useState("");
  const [editingSessionNotes, setEditingSessionNotes] = useState("");

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestScenesRef = useRef<GMScene[]>([]);
  const activeGmSessionRef = useRef<GMSession | null>(null);

  // Sync editing state with the selected session when selection changes
  const activeGmSession = useMemo(() => {
    return gmSessions.find((s) => s.id === selectedGmSessionId) || null;
  }, [gmSessions, selectedGmSessionId]);
  useEffect(() => { activeGmSessionRef.current = activeGmSession; }, [activeGmSession]);

  useEffect(() => {
    if (activeGmSession) {
      setEditingSessionName(activeGmSession.name);
      setEditingSessionNumber(activeGmSession.sessionNumber);
      setEditingSessionDate(activeGmSession.date);
      setEditingSessionNotes(activeGmSession.notes);
    } else {
      setEditingSessionName("");
      setEditingSessionNumber("");
      setEditingSessionDate("");
      setEditingSessionNotes("");
    }
  }, [selectedGmSessionId, activeGmSession]);

  // Fetch sessions when GM page is open
  useEffect(() => {
    if (!isGameMasterOpen) return;

    let isCancelled = false;
    async function fetchSessions() {
      setIsLoadingGmSessions(true);
      try {
        const data = await loadCampaignSessions(characterData.campaignId);
        if (isCancelled) return;
        // Sort sessions by session number descending, then by date descending
        const sorted = [...data].sort((a, b) => {
          if (b.sessionNumber !== a.sessionNumber) {
            return b.sessionNumber - a.sessionNumber;
          }
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setGmSessions(sorted);
        if (sorted.length > 0 && !selectedGmSessionId) {
          const pathParts = window.location.pathname.split("/");
          const gmIndex = pathParts.findIndex((p) => p === "campaign");
          const urlSlug = gmIndex >= 0 ? pathParts[gmIndex + 1] : undefined;
          const matched = urlSlug
            ? sorted.find((s) => toSessionSlug(s.sessionNumber, s.name) === urlSlug)
            : null;
          setSelectedGmSessionId(matched ? matched.id : null);
        }
      } catch (err) {
        console.error("Failed to load GM sessions", err);
      } finally {
        if (!isCancelled) {
          setIsLoadingGmSessions(false);
        }
      }
    }

    void fetchSessions();

    return () => {
      isCancelled = true;
    };
  }, [isGameMasterOpen, characterData.campaignId]);

  // Debounced Network Save
  const triggerSave = useCallback((updatedSession: GMSession) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveCampaignSession(characterData.campaignId, {
          ...updatedSession,
          scenes: latestScenesRef.current,
        });
      } catch (err) {
        console.error("Failed to save GM session to database:", err);
      }
    }, 500);
  }, [characterData.campaignId]);

  const handleScenesChange = useCallback((scenes: GMScene[]) => {
    latestScenesRef.current = scenes;
    const session = activeGmSessionRef.current;
    if (!session) return;
    triggerSave({ ...session, scenes });
  }, [triggerSave]);

  const handleUpdateActiveSession = (
    field: "name" | "sessionNumber" | "date" | "notes",
    value: any
  ) => {
    if (!activeGmSession) return;

    let updatedSession = { ...activeGmSession };

    if (field === "name") {
      setEditingSessionName(value);
      updatedSession.name = value;
    } else if (field === "sessionNumber") {
      const parsed = parseInt(value, 10);
      const safeNum = isNaN(parsed) ? 0 : parsed;
      setEditingSessionNumber(value === "" ? "" : safeNum);
      updatedSession.sessionNumber = safeNum;
    } else if (field === "date") {
      setEditingSessionDate(value);
      updatedSession.date = value;
    } else if (field === "notes") {
      setEditingSessionNotes(value);
      updatedSession.notes = value;
    }

    // Update in-memory sessions list immediately so the sidebar reflects changes
    const updatedSessions = gmSessions.map((s) =>
      s.id === activeGmSession.id ? updatedSession : s
    );
    // Sort if sessionNumber changes
    if (field === "sessionNumber") {
      updatedSessions.sort((a, b) => {
        if (b.sessionNumber !== a.sessionNumber) {
          return b.sessionNumber - a.sessionNumber;
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }
    setGmSessions(updatedSessions);

    // Trigger debounced network save
    triggerSave(updatedSession);
  };

  const handleCreateGmSession = async () => {
    // Find next session number: starting with session 0.
    // If no sessions, next session number is 0.
    // Otherwise, max(sessionNumber) + 1.
    const maxNum = gmSessions.length > 0
      ? Math.max(...gmSessions.map((s) => s.sessionNumber))
      : -1;
    const nextNum = maxNum + 1;

    const newSession: GMSession = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      campaignId: characterData.campaignId,
      sessionNumber: nextNum,
      name: "Name this session",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    };

    // Prepend/insert and sort
    const updated = [newSession, ...gmSessions].sort((a, b) => {
      if (b.sessionNumber !== a.sessionNumber) {
        return b.sessionNumber - a.sessionNumber;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setGmSessions(updated);
    setSelectedGmSessionId(newSession.id);
    if (typeof window !== "undefined" && window.innerWidth < 1920) {
      setIsSessionsSidebarOpen(false);
    }

    try {
      await saveCampaignSession(characterData.campaignId, newSession);
    } catch (err) {
      console.error("Failed to create session on server", err);
    }
  };

  const handleImportGmScenario = async (scenario: ScenarioSessionImportDefinition) => {
    const maxNum = gmSessions.length > 0
      ? Math.max(...gmSessions.map((session) => session.sessionNumber))
      : -1;
    const scenes = buildScenarioSessionScenes(scenario);
    const newSession: GMSession = {
      id: `${scenario.id}-${Date.now().toString(36)}`,
      campaignId: characterData.campaignId,
      sessionNumber: maxNum + 1,
      name: scenario.defaultSession.name,
      date: new Date().toISOString().split("T")[0],
      notes: scenario.defaultSession.notes,
      scenes,
    };

    await saveCampaignSession(characterData.campaignId, newSession);

    latestScenesRef.current = scenes;
    setGmSessions((currentSessions) => (
      [newSession, ...currentSessions].sort((a, b) => {
        if (b.sessionNumber !== a.sessionNumber) {
          return b.sessionNumber - a.sessionNumber;
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
    ));
    setSelectedGmSessionId(newSession.id);
    if (typeof window !== "undefined" && window.innerWidth < 1920) {
      setIsSessionsSidebarOpen(false);
    }
  };

  const handleDeleteGmSession = async (id: string) => {
    const updated = gmSessions.filter((s) => s.id !== id);
    setGmSessions(updated);
    if (selectedGmSessionId === id) {
      setSelectedGmSessionId(null);
    }

    try {
      await deleteCampaignSession(characterData.campaignId, id);
    } catch (err) {
      console.error("Failed to delete session on server", err);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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
    handleMobileMainViewSelect,
    isMobilePortraitMenuOpen,
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
    setActiveMobileMainView,
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
    refreshRollHistory,
    resetDiceRoller,
    rollHistory,
    rollState,
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
    pendingAdvancesXpCost,
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

  const prevOpenSidebarRef = useRef<string | null>(null);

  useEffect(() => {
    const openSidebars: string[] = [];
    if (isCharacteristicSidebarOpen) openSidebars.push("characteristic");
    if (isTalentSidebarOpen) openSidebars.push("talent");
    if (isSkillSidebarOpen) openSidebars.push("skill");
    if (isMobileMenuSidebarOpen) openSidebars.push("mobileMenu");
    if (isMobileGainExperienceOpen) openSidebars.push("mobileGainExperience");
    if (activeInfo) openSidebars.push("info");
    if (isShopOpen) openSidebars.push("shop");
    if (isSpellShopOpen) openSidebars.push("spellShop");
    if (rollState.characteristic) openSidebars.push("diceRoller");

    if (openSidebars.length > 1) {
      const newlyOpened = openSidebars.find((name) => name !== prevOpenSidebarRef.current) || openSidebars[0];

      if (newlyOpened !== "characteristic") setIsCharacteristicSidebarOpen(false);
      if (newlyOpened !== "talent") setIsTalentSidebarOpen(false);
      if (newlyOpened !== "skill") setIsSkillSidebarOpen(false);
      if (newlyOpened !== "mobileMenu") setIsMobileMenuSidebarOpen(false);
      if (newlyOpened !== "mobileGainExperience") setIsMobileGainExperienceOpen(false);
      if (newlyOpened !== "info") setActiveInfo(null);
      if (newlyOpened !== "shop") setIsShopOpen(false);
      if (newlyOpened !== "spellShop") setIsSpellShopOpen(false);
      if (newlyOpened !== "diceRoller") {
        setRollState((prev) => (prev.characteristic ? { ...prev, characteristic: null } : prev));
      }

      prevOpenSidebarRef.current = newlyOpened;
    } else {
      prevOpenSidebarRef.current = openSidebars[0] || null;
    }
  }, [
    isCharacteristicSidebarOpen,
    isTalentSidebarOpen,
    isSkillSidebarOpen,
    isMobileMenuSidebarOpen,
    isMobileGainExperienceOpen,
    activeInfo,
    isShopOpen,
    isSpellShopOpen,
    rollState.characteristic,
    setActiveInfo,
    setIsShopOpen,
    setIsSpellShopOpen,
    setRollState,
  ]);

  useEffect(() => {
    if (isLandingPageOpen) {
      document.title = `${UI_LABELS.CAMPAIGN_NAME} WFRP 4E`;
    } else if (isGameMasterOpen) {
      const sessionPrefix = activeGmSession ? `${activeGmSession.name} - ` : "";
      document.title = `${sessionPrefix}Campaign - ${UI_LABELS.CAMPAIGN_NAME} WFRP 4E`;
    } else {
      document.title = `${characterData.name} - ${UI_LABELS.CAMPAIGN_NAME} WFRP 4E`;
    }
  }, [characterData.name, isLandingPageOpen, isGameMasterOpen, activeGmSession?.name]);

  // Sync URL to selected session slug when GM page is open.
  useEffect(() => {
    if (!isGameMasterOpen) return;
    const basePath = `/${characterData.campaignId}/campaign`;
    const slug = activeGmSession ? toSessionSlug(activeGmSession.sessionNumber, activeGmSession.name) : "";
    const newPath = slug ? `${basePath}/${slug}` : basePath;
    if (window.location.pathname !== newPath) {
      window.history.replaceState(null, "", newPath);
    }
  }, [isGameMasterOpen, selectedGmSessionId, activeGmSession?.name, characterData.campaignId]);

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
    ...ruleset.talents.map((talent) => talent.name),
    ...careerAdvancementData.talents,
    ...characterTalents.map((talent) => talent.name),
  ])].sort((first, second) => first.localeCompare(second));
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
  const isSpellcaster = useMemo(
    () =>
      characterData.spells.length > 0 ||
      characterData.skills.some(
        (skill) => skill.baseName === "Channelling" || skill.baseName === "Pray",
      ),
    [characterData.skills, characterData.spells],
  );
  const displayedMainTabOptions = useMemo(
    () =>
      mainTabOptions
        .filter((tab) => tab.id !== "spells" || isSpellcaster)
        .map((tab) =>
          tab.id === "spells" ? { ...tab, label: isPrayerCaster ? "Prayers" : "Spells" } : tab,
        ),
    [isPrayerCaster, isSpellcaster],
  );
  const displayedMobileMainViewOptions = useMemo(
    () => [{ id: "characteristics" as const, label: "Characteristics" }, ...displayedMainTabOptions],
    [displayedMainTabOptions],
  );
  const displayedMobilePageTitleByView = useMemo(
    () =>
      displayedMobileMainViewOptions.reduce(
        (titles, option) => ({ ...titles, [option.id]: option.label }),
        { career: "Edit Character", dice: "Dice Log", books: "Books" } as Record<MobileMainView, string>,
      ),
    [displayedMobileMainViewOptions],
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
    restoreRouteForCharacter,
    selectCharacter,
    selectMainTab,
    selectMobileMainView,
    bookId: selectedBooksBookId,
    chapterId: selectedBooksChapterId,
    selectBook,
    selectChapter,
  } = useCampaignRouteSync({
    activeMainTab,
    activeMobileMainView,
    availableCharacters,
    handleMobileMainViewSelect,
    routeSyncEnabled: !isLandingPageOpen && !isGameMasterOpen,
    selectedCharacterId,
    setActiveMainTab,
    setActiveMobileMainView,
    setSelectedCharacterId,
    isAllProgressHydrated,
    characterName: characterData.name,
  });

  useEffect(() => {
    const handlePopState = () => {
      const isGM = window.location.pathname.includes("/campaign");
      const isLanding = parseCampaignCharacterPath(window.location.pathname) === null && !isGM;
      setIsLandingPageOpen(isLanding);
      setIsGameMasterOpen(isGM);

      if (isGM) {
        const pathParts = window.location.pathname.split("/");
        const gmIndex = pathParts.findIndex((p) => p === "campaign");
        const urlSlug = gmIndex >= 0 ? pathParts[gmIndex + 1] : undefined;
        if (urlSlug) {
          const matched = gmSessionsRef.current.find((s) => toSessionSlug(s.sessionNumber, s.name) === urlSlug);
          setSelectedGmSessionId(matched ? matched.id : null);
        } else {
          setSelectedGmSessionId(null);
        }
      }
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
    setIsGameMasterOpen(false);
    setSelectedCharacterId(characterId);
  }, [availableCharacters, setSelectedCharacterId]);

  const openGameMasterFromLanding = useCallback(() => {
    const nextPath = `/${characterData.campaignId}/campaign`;
    const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;

    window.history.pushState(null, "", nextUrl);
    setIsLandingPageOpen(false);
    setIsGameMasterOpen(true);
  }, [characterData.campaignId]);

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

  const purchaseCharacteristicAdvance = (characteristicKey: string) => {
    setPendingCharacteristicAdvances((prev) => ({
      ...prev,
      [characteristicKey]: (prev[characteristicKey] ?? 0) + 1,
    }));
  };

  const purchaseTalent = (talentName: string) => {
    const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
    if (!talentDefinition) {
      return;
    }

    // Queue the purchase as pending so it is costed and committed on save (saveCareerChanges),
    // consistent with skill/characteristic advances. Direct edits use addTalentForFree.
    setPendingTalentPurchases((prev) => ({
      ...prev,
      [talentName]: (prev[talentName] ?? 0) + 1,
    }));
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

  const updateCareerTier = (tier: number) => {
    const availableRanks = characterData.careerRecord.ranks.map((rank) => rank.rank);
    const minimumTier = Math.min(...availableRanks);
    const maximumTier = Math.max(...availableRanks);
    const safeTier = Math.min(maximumTier, Math.max(minimumTier, Math.floor(tier)));
    setPendingCareerRank(safeTier === currentCareerRank ? null : safeTier);
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

  const removePendingCharacteristicAdvance = (characteristicKey: string) => {
    setPendingCharacteristicAdvances((prev) => {
      const current = prev[characteristicKey] ?? 0;
      if (current <= 1) {
        const { [characteristicKey]: _removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [characteristicKey]: current - 1,
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

    setXpCurrent((prev) => Math.max(0, prev + pendingXpAdjustment - pendingAdvancesXpCost));
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
      const isBasicSkill = Boolean(
        skillOption
          ? isBasicSkillOption(skillOption)
          : skill
            ? isBasicSkillOption({
                id: getCharacterSkillKey(skill),
                skillId: skill.skillId,
                specialisationId: skill.specialisationId,
                name: skill.displayName,
              })
            : skillDefinition?.type === "basic",
      );

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
      id: "all" as const,
      title: "All",
      skills: advancementSkillRows,
    },
  ];

  const closeSidebars = () => {
    setActiveInfo(null);
    setIsShopOpen(false);
    setIsSpellShopOpen(false);
    setIsCharacteristicSidebarOpen(false);
    setIsSkillSidebarOpen(false);
    setIsTalentSidebarOpen(false);
    setIsMobileMenuSidebarOpen(false);
    setIsMobileGainExperienceOpen(false);
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
    archiveRoll(rollState);
    closeSidebars();
    selectMainTab("dice");
    void refreshRollHistory();
  };

  useEffect(() => {
    if (activeMainTab !== "dice") return;

    void refreshRollHistory();
    const refreshInterval = window.setInterval(() => {
      void refreshRollHistory();
    }, 15_000);

    return () => window.clearInterval(refreshInterval);
  }, [activeMainTab, refreshRollHistory]);

  const openMobileAdvanceView = () => {
    openAdvanceView();
    setIsMobilePortraitMenuOpen(false);
  };

  const openTalentSidebar = () => {
    closeSidebars();
    setIsTalentSidebarOpen(true);
  };

  const openCharacteristicSidebar = () => {
    closeSidebars();
    setIsCharacteristicSidebarOpen(true);
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
    setIsMobilePortraitMenuOpen((isOpen) => !isOpen);
  };

  const openMobileMenuSidebar = () => {
    closeSidebars();
    setIsMobilePortraitMenuOpen(false);
    setIsMobileMenuSidebarOpen(true);
  };

  const openMobileGainExperience = () => {
    closeSidebars();
    setIsMobilePortraitMenuOpen(false);
    setIsMobileGainExperienceOpen(true);
  };

  const openMobileJournalEntry = () => {
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
    activeMobileMainView === "characteristics"
      ? {
          label: "Open characteristic advances",
          onClick: openCharacteristicSidebar,
        }
      : activeMobileMainView === "skills"
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
            setIsMobilePortraitMenuOpen(false);
            setIsShopOpen(true);
          },
        }
      : activeMobileMainView === "spells"
        ? {
            label: isPrayerCaster ? "Add prayer" : "Add spell",
            onClick: () => {
              closeSidebars();
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
    const currentIndex = displayedMobileMainViewOptions.findIndex((option) => option.id === activeMobileMainView);
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex =
      (safeCurrentIndex + direction + displayedMobileMainViewOptions.length) % displayedMobileMainViewOptions.length;

    selectMobileMainView(displayedMobileMainViewOptions[nextIndex].id);
  };
  const navigateEditCharacterSubtab = (direction: -1 | 1) => {
    const currentIndex = editCharacterTabOptions.findIndex((option) => option.id === activeCareerSubtab);
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex =
      (safeCurrentIndex + direction + editCharacterTabOptions.length) % editCharacterTabOptions.length;

    setActiveCareerSubtab(editCharacterTabOptions[nextIndex].id);
  };
  const navigateMobileFrameNext = () => {
    if (activeMainTab === "career") {
      navigateEditCharacterSubtab(1);
      return;
    }

    navigateMobileMainView(1);
  };
  const navigateMobileFramePrevious = () => {
    if (activeMainTab === "career") {
      navigateEditCharacterSubtab(-1);
      return;
    }

    navigateMobileMainView(-1);
  };
  const mobileMainViewSwipeHandlers = useHorizontalSwipePager({
    onNext: () => navigateMobileMainView(1),
    onPrevious: () => navigateMobileMainView(-1),
  });
  const shouldRenderMainTabPanel = isDesktopLayout || activeMobileMainView !== "characteristics";
  const mobilePageTitle = activeMainTab === "career"
    ? "Edit Character"
    : displayedMobilePageTitleByView[activeMobileMainView];
  const showMobileGainExperiencePage = isMobileGainExperienceOpen && !isDesktopLayout;
  const displayedMobilePageTitle = showMobileGainExperiencePage ? "Gain Experience" : mobilePageTitle;
  const campaignName = campaignById[characterData.campaignId]?.name ?? UI_LABELS.CAMPAIGN_NAME;
  const characterRootPath = buildCampaignCharacterPath({
    campaignId: characterData.campaignId,
    characterId: characterData.id,
    view: "characteristics",
    omitDefaultView: true,
    characterName: characterData.name,
  });
  const currentSectionLabel = showMobileGainExperiencePage
    ? "Gain Experience"
    : activeMainTab === "career"
      ? "Edit Character"
      : displayedMobilePageTitleByView[activeMobileMainView];
  const activeCareerSubtabLabel = editCharacterTabOptions.find(
    (option) => option.id === activeCareerSubtab,
  )?.label;
  const breadcrumbItems = [
    {
      label: campaignName,
      href: "/",
      onClick: () => {
        window.history.pushState(null, "", "/");
        setIsLandingPageOpen(true);
        setIsGameMasterOpen(false);
      },
    },
    {
      label: characterData.name,
      href: characterRootPath,
      onClick: () => selectMobileMainView("characteristics"),
    },
    { label: currentSectionLabel },
    ...(activeMainTab === "career" && activeCareerSubtabLabel
      ? [{ label: activeCareerSubtabLabel }]
      : []),
  ];
  const cancelEditCharacterPage = () => {
    careerTabRef.current?.discardChanges();
    resetPendingAdvancements();
    setPendingXpAdjustment(0);
    setPendingTotalXpAdjustment(0);
    setHasCareerTabDraftChanges(false);
  };
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
        updateCareerTier={updateCareerTier}
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
        campaignName={campaignName}
        characters={availableCharacters}
        onSelectCharacter={openCharacterFromLanding}
        onSelectGameMaster={openGameMasterFromLanding}
      />
    );
  }

  if (isGameMasterOpen) {
    const gmBreadcrumbs = activeGmSession
      ? [
          {
            label: campaignName,
            href: "/",
            onClick: () => {
              window.history.pushState(null, "", "/");
              setIsLandingPageOpen(true);
              setIsGameMasterOpen(false);
            },
          },
          {
            label: "Campaign",
            href: `/${characterData.campaignId}/campaign`,
            onClick: () => {
              setSelectedGmSessionId(null);
              const basePath = `/${characterData.campaignId}/campaign`;
              window.history.pushState(null, "", basePath);
            },
          },
          { label: `Session ${activeGmSession.sessionNumber + 1} - ${activeGmSession.name}` },
        ]
      : [
          {
            label: campaignName,
            href: "/",
            onClick: () => {
              window.history.pushState(null, "", "/");
              setIsLandingPageOpen(true);
              setIsGameMasterOpen(false);
            },
          },
          { label: "Campaign" },
        ];

    return (
      <GameMasterPage
        activeSession={activeGmSession}
        breadcrumbs={gmBreadcrumbs}
        campaignName={campaignName}
        characters={availableCharacters}
        editingSessionName={editingSessionName}
        isLoadingSessions={isLoadingGmSessions}
        isSessionsSidebarOpen={isSessionsSidebarOpen}
        onCreateSession={handleCreateGmSession}
        onImportScenario={handleImportGmScenario}
        onScenesChange={handleScenesChange}
        onSelectSession={handleSelectSessionOnMobile}
        onSessionsSidebarOpenChange={setIsSessionsSidebarOpen}
        onUpdateSession={handleUpdateActiveSession}
        onDeleteSession={handleDeleteGmSession}
        selectedSessionId={selectedGmSessionId}
        sessions={gmSessions}
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
      sidebars={(
        <>
          {Boolean(rollState.characteristic) && (
            <Suspense fallback={null}>
              <DiceRollerSidebar
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
                rollHistory={rollHistory}
                rollState={rollState}
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
            <CharacteristicSidebar
              characteristics={advancementCharacteristics}
              careerCharacteristicKeys={careerAdvancementData.characteristics
                .filter((item) => item.availableFromRank <= displayedCareerRank)
                .map((item) => item.key)}
              getCharacteristicDescription={getCharacteristicDescription}
              getNextAdvanceCost={getCharacteristicAdvanceCost}
              isOpen={isCharacteristicSidebarOpen}
              onClose={() => setIsCharacteristicSidebarOpen(false)}
              pendingAvailableXp={pendingAvailableXp}
              purchaseCharacteristicAdvance={purchaseCharacteristicAdvance}
              removePendingCharacteristicAdvance={removePendingCharacteristicAdvance}
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
            <MobileMenuSidebar
              isOpen={isMobileMenuSidebarOpen}
              onClose={() => setIsMobileMenuSidebarOpen(false)}
              onOpenBooks={() => {
                setIsMobileMenuSidebarOpen(false);
                setIsMobileGainExperienceOpen(false);
                selectMainTab("books");
              }}
              onOpenCharacterSheet={() => {
                setIsMobileMenuSidebarOpen(false);
                setIsMobileGainExperienceOpen(false);
                selectMainTab("skills");
              }}
              onOpenDiceLog={openDiceLog}
              onOpenEditCharacter={() => {
                setIsMobileMenuSidebarOpen(false);
                setIsMobileGainExperienceOpen(false);
                openAdvanceView();
              }}
              onOpenGainExperience={openMobileGainExperience}
            />
          </Suspense>
        </>
      )}
    >
          
          <CharacterSheetFrame
            breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
            desktopHeader={(
              <CharacterSheetHeader
                activeMenuItem={activeMainTab === "dice" ? "dice" : activeMainTab === "career" ? "edit" : activeMainTab === "books" ? "books" : "sheet"}
                characterData={characterData}
                isMobilePortraitMenuOpen={isMobilePortraitMenuOpen}
                onCloseMobilePortraitMenu={() => setIsMobilePortraitMenuOpen(false)}
                onOpenCharacterSheet={() => selectMainTab("skills")}
                onOpenAdvance={openAdvanceView}
                onOpenDice={openDiceLog}
                onOpenBooks={() => selectMainTab("books")}
                onOpenMobileCharacterActions={openMobileCharacterActions}
                onOpenMobileGainExperience={openMobileGainExperience}
                onOpenMobileMenu={openMobileMenuSidebar}
                onAwardXp={awardXp}
                variant="desktop"
                xpCurrent={xpCurrent}
              />
            )}
            mobileHeader={(
              <CharacterSheetHeader
                activeMenuItem={activeMainTab === "dice" ? "dice" : activeMainTab === "career" ? "edit" : activeMainTab === "books" ? "books" : "sheet"}
                characterData={characterData}
                isMobilePortraitMenuOpen={isMobilePortraitMenuOpen}
                onCloseMobilePortraitMenu={() => setIsMobilePortraitMenuOpen(false)}
                onOpenCharacterSheet={() => selectMainTab("skills")}
                onOpenAdvance={openMobileAdvanceView}
                onOpenDice={openDiceLog}
                onOpenBooks={() => selectMainTab("books")}
                onOpenMobileCharacterActions={openMobileCharacterActions}
                onOpenMobileGainExperience={openMobileGainExperience}
                onOpenMobileMenu={openMobileMenuSidebar}
                onAwardXp={awardXp}
                variant="mobile"
                xpCurrent={xpCurrent}
              />
            )}
            hideMobileNavigation={showMobileGainExperiencePage || activeMainTab === "dice" || activeMainTab === "books"}
            mobileTitle={displayedMobilePageTitle}
            onMobileNextView={showMobileGainExperiencePage ? () => setIsMobileGainExperienceOpen(false) : navigateMobileFrameNext}
            onMobilePreviousView={showMobileGainExperiencePage ? () => setIsMobileGainExperienceOpen(false) : navigateMobileFramePrevious}
          >

          {showMobileGainExperiencePage ? (
            <GainExperiencePage
              onAwardXp={(amount) => {
                awardXp(amount);
                setIsMobileGainExperienceOpen(false);
              }}
              onCancel={() => setIsMobileGainExperienceOpen(false)}
              xpCurrent={xpCurrent}
              xpTotal={characterData.xpTotal}
            />
          ) : activeMainTab === "dice" ? (
            <DiceLogPage
              activeRollerRef={activeRollerRef}
              archiveRoll={archiveRoll}
              campaignCharacters={availableCharacters
                .filter((character) => character.campaignId === characterData.campaignId)
                .map((character) => ({
                  id: character.id,
                  name: character.name,
                  portraitDataUrl: loadCharacterProgress(character.id)?.portraitDataUrl,
                }))}
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
              rollHistory={rollHistory}
              rollState={rollState}
              setRollState={setRollState}
            />
          ) : activeMainTab === "career" ? (
            <>
              <div className="hidden items-center justify-between gap-3 md:flex">
                <div className="min-w-0">
                  <Heading level={1} variant="page" truncate>
                    Edit Character
                  </Heading>
                </div>
              </div>
              <section className="min-h-[500px] overflow-visible rounded-lg border border-wfrp-border bg-card pb-32 shadow-lg md:overflow-hidden md:pb-0">
                <ScrollableTabStrip className="flex rounded-t-lg px-4 sm:!pl-4 sm:!pr-4 md:!pl-4 md:!pr-4 lg:!pr-12 bg-wfrp-surface-subtle border-b border-wfrp-border overflow-x-auto no-scrollbar">
                  <div className="flex w-full min-w-max items-center justify-between gap-4">
                    <div className="flex min-w-max items-center gap-4 lg:gap-6">
                      {editCharacterTabOptions.map((tab) => (
                        <Button variant="unstyled"
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
                        </Button>
                      ))}
                    </div>
                    <div className="hidden shrink-0 items-center gap-2 md:flex">
                      <Button
                        type="button"
                        name="Cancel"
                        onClick={cancelEditCharacterPage}
                        isDeactivated={!hasUnsavedCareerEdits}
                        aria-label="Cancel edit character changes"
                      />
                      <Button
                        type="button"
                        name="Save"
                        onClick={handleEditCharacterSave}
                        isDeactivated={!hasUnsavedCareerEdits}
                        isGolden={hasUnsavedCareerEdits}
                        aria-label="Save edit character changes"
                      />
                    </div>
                  </div>
                </ScrollableTabStrip>
                {advancePageContent}
                <BottomSheetPaper className="md:hidden">
                  <Button
                    type="button"
                    name="Cancel"
                    onClick={cancelEditCharacterPage}
                    isDeactivated={!hasUnsavedCareerEdits}
                    aria-label="Cancel edit character changes"
                  />
                  <Button
                    type="button"
                    name="Save"
                    onClick={handleEditCharacterSave}
                    isDeactivated={!hasUnsavedCareerEdits}
                    isGolden={hasUnsavedCareerEdits}
                    aria-label="Save edit character changes"
                  />
                </BottomSheetPaper>
              </section>
            </>
          ) : activeMainTab === "books" ? (
            <BooksTab
              bookId={selectedBooksBookId}
              chapterId={selectedBooksChapterId}
              onSelectBook={selectBook}
              onSelectChapter={selectChapter}
            />
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
                <MainTabMenu
                  activeId={activeMainTab}
                  ariaLabel="Character sheet sections"
                  className="mx-auto w-full min-w-max justify-center gap-4 lg:mx-0 lg:w-max lg:min-w-0 lg:justify-start lg:gap-6"
                  options={displayedMainTabOptions}
                  onChange={selectMainTab}
                />
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
                        activeSpellSubtab={activeSpellSubtab}
                        attributes={attributes}
                        characterData={characterData}
                        characterSkills={characterSkills}
                        setActiveSpellSubtab={setActiveSpellSubtab}
                        handleRoll={handleRoll}
                        isPrayerMode={isPrayerCaster}
                        onRemoveSpell={removeSpell}
                        setIsSpellShopOpen={setIsSpellShopOpen}
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
