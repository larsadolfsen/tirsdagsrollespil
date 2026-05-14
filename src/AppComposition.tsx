/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import {
  Menu,
  Settings,
  Dice5,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "./components/AppShell";
import { CharacterHeader } from "./components/CharacterHeader";
import { DiceLogSidebar } from "./components/DiceLogSidebar";
import { MobileTabMenu } from "./components/MobileTabMenu";
import { getAdvanceCost, getCharacteristicAdvanceCost, getTalentPurchaseCost } from "./lib/advanceCosts";
import { useMobileNavigation } from "./hooks/useMobileNavigation";
import { useDiceRoller } from "./hooks/useDiceRoller";
import { useCareerAdvancement } from "./hooks/useCareerAdvancement";
import { useInventoryActions } from "./hooks/useInventoryActions";
import { CharacterResourcesCards } from "./components/CharacterResourcesCards";
import {
  InlineSubtabs,
  PanelSectionHeader,
  ResourceCounterBar,
  ScrollableTabStrip,
} from "./components/ui";
import type { ActiveInfoState } from "./components/appTypes";
import { useGameSessionContext } from "./context/GameSessionContext";
import { LazyTabPanel } from "./tabs/LazyTabPanel";
import {
  formatCoinTotalValue,
  getCoinEncumbrance,
  getConsumableBaseName,
  getInventoryEncumbrance,
  isBackpackContainerItem,
  isPacksAndContainersItem,
  isWornInventoryItem,
  sortEquipmentByName,
} from "./tabs/inventory/inventoryUtils";
import {
  filterSpellsBySubtab,
  formatSpellDuration as formatSpellDurationValue,
  formatSpellRange as formatSpellRangeValue,
  formatSpellTarget as formatSpellTargetValue,
  getSpellSubtabOptions,
} from "./tabs/spells/spellUtils";
import {
  getCharacterTalentRows,
  getTalentMaxDisplay as getTalentMaxDisplayValue,
} from "./tabs/talents/talentUtils";
import type {
  ResolvedCharacterEquipment,
  ResolvedCharacterSkill,
} from "./data/characters/resolved";
import { listCharacters } from "./data/repository";
import { skillCharacteristicById } from "./data/rules/wfrp4e";
import {
  formatCharacterCoins,
  formatItemValue,
  getCharacterSkillKey,
} from "./lib/gameSession";
import { formatTalentEffect } from "./lib/talentEffects";
import { UI_LABELS } from "./labels";
import {
  mainTabOptions,
  mobilePageTitleByView,
  mobileTabMenuOptions,
} from "./tabs/tabOptions";
import type {
  ActionCategory,
  CareerSubtab,
  InventorySubtab,
  JournalSubtab,
  MainTab,
  MobileTabMenuTarget,
  SkillSubtab,
  SpellSubtab,
} from "./tabs/tabTypes";
import type { ArmourDefinition, ArmourLocation, Characteristic, Ruleset, SkillDefinition } from "./types";

const InfoSidebar = lazy(() =>
  import("./components/InfoSidebar").then((module) => ({ default: module.InfoSidebar })),
);
const ShopSidebar = lazy(() =>
  import("./components/ShopSidebar").then((module) => ({ default: module.ShopSidebar })),
);
const SpellShopSidebar = lazy(() =>
  import("./components/SpellShopSidebar").then((module) => ({ default: module.SpellShopSidebar })),
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

type RollActionButton = {
  id: string;
  label: string;
  onClick: () => void;
};

export function AppComposition() {
  const {
    selectedCharacterId,
    setSelectedCharacterId,
    characterData,
    ruleset,
    rulesIndex,
    resourceCaps,
    careerAdvancementData,
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
    setCharacterCoins,
    currentCareerRank,
    setCurrentCareerRank,
    currentCharacteristicAdvances,
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
  const availableCharacters = useMemo(() => listCharacters(), []);
  const [activeInfo, setActiveInfo] = useState<ActiveInfoState | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('skills');
  const [activeActionCategory, setActiveActionCategory] = useState<ActionCategory>('all');
  const [activeSkillSubtab, setActiveSkillSubtab] = useState<SkillSubtab>('trained');
  const [activeSpellSubtab, setActiveSpellSubtab] = useState<SpellSubtab>('all');
  const [activeInventorySubtab, setActiveInventorySubtab] = useState<InventorySubtab>('all');
  const [activeCareerSubtab, setActiveCareerSubtab] = useState<CareerSubtab>('all');
  const [activeJournalSubtab, setActiveJournalSubtab] = useState<JournalSubtab>('sessions');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSpellShopOpen, setIsSpellShopOpen] = useState(false);
  const [isCharacterBuilderOpen, setIsCharacterBuilderOpen] = useState(false);
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
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const {
    advancementCharacteristics,
    advancementProgress,
    availableCareerCharacteristicKeys,
    displayedCareerRank,
    displayedCareerRankRecord,
    getCareerSkillOptions,
    hasPendingCareerChanges,
    isCareerSkillName,
    nextCareerAdvanceCost,
    nextCareerRankRecord,
    pendingAvailableXp,
    pendingCareerRank,
    pendingCharacteristicAdvances,
    pendingCharacteristicSpend,
    pendingSkillAdvances,
    pendingSkillSpend,
    pendingSpentXp,
    pendingTalentPurchases,
    pendingTalentSpend,
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
    xpCurrent,
  });
  const {
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
  } = useMobileNavigation({ setActiveMainTab });

  useEffect(() => {
    document.title = `${characterData.name} - ${UI_LABELS.CAMPAIGN_NAME} WFRP 4E`;
  }, [characterData.name]);

  type ResolvedSkillOption = (typeof rulesIndex.resolvedSkillOptions)[number];
  const skillDefinitionById = new Map<string, SkillDefinition>(
    ruleset.skills.map((skill) => [skill.id, skill]),
  );
  const characterSkillByName = new Map<string, ResolvedCharacterSkill>(
    characterSkills.map((skill) => [skill.displayName, skill]),
  );
  const spellSubtabOptions = getSpellSubtabOptions(characterData.spells);
  const filteredSpells = filterSpellsBySubtab(characterData.spells, activeSpellSubtab);
  const isBasicSkillOption = (option: ResolvedSkillOption) => {
    const skillDefinition = skillDefinitionById.get(option.skillId);
    return (
      skillDefinition?.type === "basic" &&
      (!option.specialisationId || option.specialisationId.endsWith("_basic") || skillDefinition?.grouped)
    );
  };
  const getTalentMaxDisplay = (max: string) =>
    getTalentMaxDisplayValue(max, characterData.attributes as Record<string, number>);
  const advancementTalentNames = [...new Set([
    ...careerAdvancementData.talents,
    ...characterTalents.map((talent) => talent.name),
  ])];
  const characterTalentRows = getCharacterTalentRows(characterTalents);
  const formattedCoins = useMemo(
    () => formatCharacterCoins(characterData.coins),
    [characterData.coins],
  );
  const ownedShopItemIds = useMemo(
    () => new Set(equipmentState.map((item) => item.itemId)),
    [equipmentState],
  );
  const knownSpellIds = useMemo(
    () => new Set(characterData.spells.map((spell) => spell.id)),
    [characterData.spells],
  );

  useEffect(() => {
    setActiveInfo(null);
    setActiveMainTab("skills");
    setActiveMobileMainView("characteristics");
    setActiveActionCategory("all");
    setActiveSkillSubtab("trained");
    setActiveInventorySubtab("all");
    setActiveCareerSubtab("all");
    setActiveJournalSubtab("sessions");
    setActiveInventoryMenu(null);
    setIsShopOpen(false);
    resetPendingAdvancements();
    resetDiceRoller();
  }, [characterData.id, resetDiceRoller]);

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

  const attributes = characterData.attributes as Record<string, number>;
  const tb = Math.floor((attributes.T || 0) / 10);
  const wpb = Math.floor((attributes.WP || 0) / 10);
  const sb = Math.floor((attributes.S || 0) / 10);
  const maxCorruption = tb + wpb;
  const wp = attributes.WP || 0;

  useEffect(() => {
    setCorruptionCurrent((prev) => Math.min(prev, maxCorruption));
  }, [maxCorruption, setCorruptionCurrent]);

  const totalEncumbrance = equipmentState.reduce((sum, item) => {
    if (item.containerId) return sum;
    return sum + getInventoryEncumbrance(item);
  }, getCoinEncumbrance(characterData.coins));
  const carryCapacity = Math.max(sb + tb, 1);
  const encumbrancePercent = Math.min((totalEncumbrance / carryCapacity) * 100, 100);
  const containers = equipmentState.filter(isPacksAndContainersItem);
  const wornItems = sortEquipmentByName(equipmentState.filter(isWornInventoryItem));
  const carriedItems = sortEquipmentByName(
    equipmentState.filter(
      (item) => !item.containerId && !isWornInventoryItem(item),
    ),
  );
  const itemDefinitionsById = Object.fromEntries(
    ruleset.items.map((item) => [item.id, item]),
  );
  const armourDefinitionsById = Object.fromEntries(
    ruleset.armours.map((armour) => [armour.id, armour]),
  );

  type EquippedArmour = {
    item: ResolvedCharacterEquipment;
    armour: ArmourDefinition;
    locations: ArmourLocation[];
  };

  const getItemArmour = (item: ResolvedCharacterEquipment): EquippedArmour | null => {
    const definition = itemDefinitionsById[item.itemId];
    const armourId = item.armourId ?? definition?.armourId;
    if (!armourId) return null;

    const armour = armourDefinitionsById[armourId];
    const locations = item.armourLocations ?? definition?.armourLocations ?? armour?.locations;
    return armour && locations ? { item, armour, locations } : null;
  };

  const isSoftLeather = (armour: ArmourDefinition) => armour.category === "soft_leather";
  const isFlexible = (armour: ArmourDefinition) =>
    armour.qualities.some((quality) => quality.id === "flexible");

  const canLayerArmours = (first: ArmourDefinition, second: ArmourDefinition) => {
    if (isSoftLeather(first) || isSoftLeather(second)) {
      return !isSoftLeather(first) || !isSoftLeather(second);
    }

    return isFlexible(first) !== isFlexible(second);
  };

  const getArmourFitConflictsForArmour = (
    armourToFit: EquippedArmour,
    fittedArmours: EquippedArmour[],
  ) =>
    fittedArmours.filter((fittedArmour) =>
      armourToFit.locations.some((location) =>
        fittedArmour.locations.includes(location) &&
        !canLayerArmours(armourToFit.armour, fittedArmour.armour),
      ),
    );

  const getArmourFitConflicts = (
    itemToFit: ResolvedCharacterEquipment,
    items: ResolvedCharacterEquipment[],
  ) => {
    const armourToFit = getItemArmour(itemToFit);
    if (!armourToFit) return [];

    return getArmourFitConflictsForArmour(
      armourToFit,
      getFittedArmours(items),
    );
  };

  const getFittedArmours = (items: ResolvedCharacterEquipment[]) =>
    items.reduce<EquippedArmour[]>((fittedArmours, item) => {
      if (!item.equipped) return fittedArmours;

      const armourToFit = getItemArmour(item);
      if (!armourToFit || getArmourFitConflictsForArmour(armourToFit, fittedArmours).length > 0) {
        return fittedArmours;
      }

      return [...fittedArmours, armourToFit];
    }, []);

  const equippedArmours = getFittedArmours(equipmentState);
  const armourCoverageTotals = equippedArmours.reduce(
    (totals, { armour, locations }) => {
      locations.forEach((location) => {
        totals[location] += armour.aps;
      });
      return totals;
    },
    { head: 0, arms: 0, body: 0, legs: 0 } as Record<"head" | "arms" | "body" | "legs", number>,
  );
  const armourTotals = {
    head: armourCoverageTotals.head,
    leftArm: armourCoverageTotals.arms,
    rightArm: armourCoverageTotals.arms,
    body: armourCoverageTotals.body,
    leftLeg: armourCoverageTotals.legs,
    rightLeg: armourCoverageTotals.legs,
    shield: 0,
  };
  const equippedArmourNames = equippedArmours.map(({ armour }) => armour.name);

  const getContainerContents = (containerId: string) =>
    sortEquipmentByName(equipmentState.filter((item) => item.containerId === containerId));

  const getContainerUsedEncumbrance = (containerId: string) =>
    getContainerContents(containerId).reduce(
      (sum, item) => sum + Number(item.encumbrance || 0),
      0,
    );

  const {
    activeInventoryMenu,
    canDropInventoryItem,
    canStoreInContainer,
    handleAddShopItem,
    handleAddSpell,
    handleAdjustCoinType,
    handleCarryItem,
    handleConsumeItem,
    handleDropItem,
    handleInventoryDragEnd,
    handleInventoryDragOver,
    handleInventoryDragStart,
    handleInventoryDrop,
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
    equipmentState,
    getArmourFitConflicts,
    setActiveMainTab,
    setActiveMobileMainView,
    setCharacterCoins,
    setCharacterSpells,
    setEquipmentState,
  });

  const formatSpellRange = (range: string) => formatSpellRangeValue(range, wp, wpb);
  const formatSpellTarget = (target: string) => formatSpellTargetValue(target, wp, wpb);
  const formatSpellDuration = (duration: string) => formatSpellDurationValue(duration, wp, wpb);

  const adjustWounds = (delta: number) => {
    setWoundsCurrent(prev => Math.min(Math.max(0, prev + delta), characterData.wounds.max));
  };

  const adjustCorruption = (delta: number) => {
    setCorruptionCurrent(prev => Math.min(Math.max(0, prev + delta), maxCorruption));
  };

  const adjustFate = (delta: number) => {
    setFateCurrent(prev => Math.min(Math.max(0, prev + delta), resourceCaps.fate));
  };

  const adjustFortune = (delta: number) => {
    setFortuneCurrent(prev => Math.min(Math.max(0, prev + delta), fateCurrent));
  };

  const adjustResilience = (delta: number) => {
    setResilienceCurrent(prev => Math.min(Math.max(0, prev + delta), resourceCaps.resilience));
  };

  const adjustResolve = (delta: number) => {
    setResolveCurrent(prev => Math.min(Math.max(0, prev + delta), Math.min(resourceCaps.resolve, resilienceCurrent)));
  };

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const formatNoteDate = (value: string) =>
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  const formatNoteDay = (value: string) =>
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
    }).format(new Date(value));
  const getNoteDayKey = (value: string) => {
    const date = new Date(value);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  };
  const getNoteHashtags = (text: string) =>
    Array.from(text.matchAll(/(^|\s)#([A-Za-z0-9_-]+)/g), (match) => match[2].toLowerCase());
  const noteHashtags = [...new Set(sortedNotes.flatMap((note) => getNoteHashtags(note.text)))].sort();
  const normalizedNoteSearch = noteSearch.trim().toLowerCase();
  const filteredNotes = normalizedNoteSearch
    ? sortedNotes.filter((note) => {
      const text = note.text.toLowerCase();
      const title = (note.title ?? "").toLowerCase();
        const hashtags = getNoteHashtags(note.text);
        const search = normalizedNoteSearch.startsWith("#")
          ? normalizedNoteSearch.slice(1)
          : normalizedNoteSearch;

        return (
          text.includes(normalizedNoteSearch) ||
          title.includes(normalizedNoteSearch) ||
          hashtags.some((tag) => tag.includes(search))
        );
      })
    : sortedNotes;
  const groupNotesByDay = (entries: typeof sortedNotes) =>
    entries.reduce<Array<{ dayKey: string; date: string; notes: typeof sortedNotes }>>(
      (groups, note) => {
        const dayKey = getNoteDayKey(note.createdAt);
        const existingGroup = groups.find((group) => group.dayKey === dayKey);

        if (existingGroup) {
          existingGroup.notes.push(note);
        } else {
          groups.push({ dayKey, date: note.createdAt, notes: [note] });
        }

        return groups;
      },
      [],
    );
  const noteGroups = groupNotesByDay(filteredNotes);
  const npcNotes = filteredNotes.filter((note) =>
    getNoteHashtags(note.text).some((tag) => tag === "npc" || tag === "npcs"),
  );
  const npcNoteGroups = groupNotesByDay(npcNotes);
  const npcNoteHashtags = [...new Set(npcNotes.flatMap((note) => getNoteHashtags(note.text)))].sort();
  const addNote = () => {
    const title = newNoteTitle.trim();
    const text = newNoteText.trim();
    if (!title || !text) return;

    setNotes((prev) => [
      ...prev,
      {
        id: `note_${Date.now()}`,
        title,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewNoteTitle("");
    setNewNoteText("");
  };

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  const openTalentInfo = (talentName: string) => {
    const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
    setActiveInfo({
      type: "talent",
      name: talentName,
      extra: talentDefinition ? { description: talentDefinition.description } : undefined,
    });
    setRollState(prev => ({ ...prev, characteristic: null }));
  };

  const purchaseSkillAdvance = (skillName: string) => {
    const baseAdvances =
      characterSkills.find((skill) => skill.displayName === skillName)?.advances ?? 0;
    const pendingAdvances = pendingSkillAdvances[skillName] ?? 0;
    const nextCost = getAdvanceCost(baseAdvances + pendingAdvances);

    if (pendingAvailableXp < nextCost) return;

    setPendingSkillAdvances((prev) => ({
      ...prev,
      [skillName]: (prev[skillName] ?? 0) + 1,
    }));
  };

  const purchaseCharacteristicAdvance = (characteristicKey: string) => {
    const baseAdvances = currentCharacteristicAdvances[characteristicKey] ?? 0;
    const pendingAdvances = pendingCharacteristicAdvances[characteristicKey] ?? 0;
    const nextCost = getCharacteristicAdvanceCost(baseAdvances + pendingAdvances);

    if (pendingAvailableXp < nextCost) return;

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

    const baseTakenCount = characterTalents.filter((talent) => talent.name === talentName).length;
    const pendingTakenCount = pendingTalentPurchases[talentName] ?? 0;
    const nextCost = getTalentPurchaseCost(baseTakenCount + pendingTakenCount);

    if (pendingAvailableXp < nextCost) return;

    setPendingTalentPurchases((prev) => ({
      ...prev,
      [talentName]: (prev[talentName] ?? 0) + 1,
    }));
  };

  const increasePendingCareerRank = () => {
    if (!nextCareerRankRecord) return;
    if (nextCareerAdvanceCost === null || pendingAvailableXp < nextCareerAdvanceCost) return;
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

  const saveCareerChanges = () => {
    if (!hasPendingCareerChanges) return;

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
              characteristic: skillCharacteristicById[skillOption.skillId],
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

    setXpCurrent((prev) => Math.max(0, prev - pendingSpentXp));
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
          characterSkill?.characteristic ?? skillCharacteristicById[option.skillId] ?? "",
        advances: characterSkill?.advances ?? 0,
        isTrained: (characterSkill?.advances ?? 0) > 0,
        skillId: option.skillId,
        isGrouped: skillDef?.grouped ?? false,
        skillName: skillDef?.name ?? "",
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  
  // For untrained grouped skills, deduplicate to show parent skill once
  const untrainedBasicSkillRows = (() => {
    const untrained = basicSkillRows.filter((skill) => !skill.isTrained);
    const seen = new Set<string>();
    return untrained.filter((skill) => {
      // For grouped skills, use the skill ID to deduplicate
      const key = skill.isGrouped ? skill.skillId : skill.key;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      // For grouped skills, show parent skill name
      if (skill.isGrouped) {
        skill.displayName = skill.skillName;
      }
      return true;
    });
  })();
  
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
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  const basicVisibleSkillRows = [...trainedBasicSkillRows, ...untrainedBasicSkillRows].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );
  const trainedSkillRows = [...trainedBasicSkillRows, ...advancedSkillRows]
    .filter((skill) => skill.advances > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  const allSkillRows = [...basicVisibleSkillRows, ...advancedSkillRows].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );
  const visibleSkillRows =
    activeSkillSubtab === "all"
      ? allSkillRows
      : activeSkillSubtab === "trained"
        ? trainedSkillRows
        : activeSkillSubtab === "advanced"
          ? advancedSkillRows
          : basicVisibleSkillRows;
  const skillSections = [
    { id: "advanced" as const, title: "Advanced", skills: advancedSkillRows },
    { id: "basic-trained" as const, title: "Trained", skills: trainedBasicSkillRows },
    { id: "basic-untrained" as const, title: "Untrained", skills: untrainedBasicSkillRows },
  ];
  const advancementSkillNames = [...new Set([
    ...careerAdvancementData.skills.flatMap(getCareerSkillOptions),
    ...skillSections.flatMap((section) => section.skills.map((skill) => skill.displayName)),
  ])];
  const advancementSkillRows = advancementSkillNames
    .map((skillName) => {
      const skill = characterSkills.find((entry) => entry.displayName === skillName);
      const skillOption = rulesIndex.resolvedSkillOptions.find((option) => option.name === skillName);
      const pendingAdvances = pendingSkillAdvances[skillName] ?? 0;
      const baseAdvances = skill?.advances ?? 0;
      const characteristicKey =
        skill?.characteristic ??
        (skillOption ? skillCharacteristicById[skillOption.skillId] ?? "" : "");
      const baseCharacteristicValue =
        characteristicKey
          ? ((characterData.attributes as Record<string, number>)[characteristicKey] ?? 0)
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
            : false;

      return {
        skillName,
        skill,
        pendingAdvances,
        baseAdvances,
        characteristicKey,
        baseCharacteristicValue,
        nextSkillCost: getAdvanceCost(baseAdvances + pendingAdvances),
        isCareerSkill: isCareerSkillName(skillName),
        isBasicSkill,
        isTrained: baseAdvances + pendingAdvances > 0,
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

  const openAdvanceView = () => {
    setActiveInfo(null);
    setIsShopOpen(false);
    setIsSpellShopOpen(false);
    setIsDiceLogOpen(false);
    setActiveMainTab("career");
    setActiveMobileMainView("career");
  };

  const mobileAddAction =
    activeMobileMainView === "inventory"
      ? {
          label: "Add item",
          onClick: () => {
            setActiveInfo(null);
            setIsDiceLogOpen(false);
            setIsMobileNavigationOpen(false);
            setIsMobileCharacterListOpen(false);
            setIsMobilePortraitMenuOpen(false);
            setIsShopOpen(true);
          },
        }
      : activeMobileMainView === "spells"
        ? {
            label: "Add spell",
            onClick: () => {
              setIsMobileNavigationOpen(false);
              setIsMobileCharacterListOpen(false);
              setIsMobilePortraitMenuOpen(false);
              setIsSpellShopOpen(true);
            },
          }
        : null;

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
      mobileNavigation={(
        <MobileTabMenu
          activeMobileMainView={activeMobileMainView}
          availableCharacters={availableCharacters}
          campaignName={UI_LABELS.CAMPAIGN_NAME}
          characterName={characterData.name}
          closeMobileNavigation={closeMobileNavigation}
          handleMobileMainViewSelect={handleMobileMainViewSelect}
          isMobileCharacterListOpen={isMobileCharacterListOpen}
          isMobileNavigationOpen={isMobileNavigationOpen}
          mobileTabMenuOptions={mobileTabMenuOptions}
          onCreateCharacter={() => {
            setActiveInfo(null);
            setIsShopOpen(false);
            setIsSpellShopOpen(false);
            setIsDiceLogOpen(false);
            setRollState((prev) => ({ ...prev, characteristic: null }));
            setIsCharacterBuilderOpen(true);
            closeMobileNavigation();
          }}
          onOpenDiceLog={() => {
            setActiveInfo(null);
            setIsShopOpen(false);
            setIsDiceLogOpen(true);
            closeMobileNavigation();
          }}
          selectedCharacterId={selectedCharacterId}
          setIsMobileCharacterListOpen={setIsMobileCharacterListOpen}
          setSelectedCharacterId={setSelectedCharacterId}
        />
      )}
      sidebars={(
        <>
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

          <Suspense fallback={null}>
            {activeInfo ? (
              <InfoSidebar
                activeInfo={activeInfo}
                setActiveInfo={setActiveInfo}
                characterData={characterData}
                characterSkills={characterSkills}
                advancementTalentNames={advancementTalentNames}
                ruleset={ruleset}
                rulesIndex={rulesIndex}
                getCharacteristicDescription={getCharacteristicDescription}
                formatSpellDuration={formatSpellDuration}
                skillListRefs={skillListRefs}
                propertyListRefs={propertyListRefs}
                talentListRefs={talentListRefs}
              />
            ) : null}
            {isShopOpen ? (
              <ShopSidebar
                isOpen={isShopOpen}
                coins={formattedCoins}
                ownedItemIds={ownedShopItemIds}
                onAddToInventory={handleAddShopItem}
                onBuy={handleAddShopItem}
                onClose={() => setIsShopOpen(false)}
              />
            ) : null}
            {isSpellShopOpen ? (
              <SpellShopSidebar
                isOpen={isSpellShopOpen}
                spells={ruleset.spells}
                knownSpellIds={knownSpellIds}
                onAddSpell={handleAddSpell}
                onClose={() => setIsSpellShopOpen(false)}
              />
            ) : null}
          </Suspense>
        </>
      )}
    >
          
          {/* Compact Horizontal Header */}
          <div className="hidden md:block">
            <CharacterHeader
              characterData={characterData}
              availableCharacters={availableCharacters}
              selectedCharacterId={selectedCharacterId}
              xpCurrent={xpCurrent}
              onSelectCharacter={setSelectedCharacterId}
              onCreateCharacter={() => {
                setActiveInfo(null);
                setIsShopOpen(false);
                setIsSpellShopOpen(false);
                setIsDiceLogOpen(false);
                setRollState((prev) => ({ ...prev, characteristic: null }));
                setIsCharacterBuilderOpen(true);
              }}
              onOpenDice={() => {
                setActiveInfo(null);
                setIsShopOpen(false);
                setIsDiceLogOpen(true);
              }}
              onOpenAdvance={() => {
                openAdvanceView();
              }}
            />
          </div>

          <section className="md:hidden border-b border-wfrp-border bg-wfrp-surface shadow-lg shadow-black/20">
            <div className="flex h-[60px] items-center">
              <button
                type="button"
                onClick={() => openMobileNavigation(false)}
                className="flex h-full w-14 shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                aria-label="Open navigation drawer"
                aria-haspopup="dialog"
                aria-expanded={isMobileNavigationOpen}
              >
                <Menu size={18} />
              </button>
              <button
                type="button"
                onClick={() => openMobileNavigation(true)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                aria-label="Change character"
              >
                <span className="min-w-0">
                  <span className="block truncate font-serif text-xl font-bold leading-tight text-gray-100">
                    {characterData.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">
                    {UI_LABELS.CAMPAIGN_NAME}
                  </span>
                </span>
              </button>
              <div className="relative mr-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavigationOpen(false);
                    setIsMobileCharacterListOpen(false);
                    setIsMobilePortraitMenuOpen((isOpen) => !isOpen);
                  }}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-wfrp-gold/70 bg-black/30 p-0.5 shadow-inner transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                  aria-label="Open character actions"
                  aria-haspopup="menu"
                  aria-expanded={isMobilePortraitMenuOpen}
                >
                  <img
                    src="https://picsum.photos/seed/knight/200/200"
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-full w-full rounded-full object-cover grayscale brightness-90"
                  />
                </button>
                {isMobilePortraitMenuOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+0.5rem)] z-40 min-w-44 overflow-hidden rounded border border-wfrp-border bg-wfrp-popover shadow-2xl"
                    role="menu"
                    aria-label="Character actions"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        openAdvanceView();
                        setIsMobilePortraitMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                      role="menuitem"
                    >
                      <span>Advance</span>
                      <span className="text-xs font-bold text-blue-400">{xpCurrent}/{characterData.xpTotal}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMobilePortraitMenuOpen(false)}
                      className="flex w-full items-center gap-3 border-t border-white/5 px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                      role="menuitem"
                    >
                      <Settings size={14} />
                      Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-4 md:gap-8 md:px-0 md:py-0">
          <h1 className="font-serif text-2xl font-bold leading-tight tracking-tight text-gray-100 md:hidden">
            {mobilePageTitleByView[activeMobileMainView]}
          </h1>

          {/* Layout for Characteristics and Skills */}
          {/* Characteristics Section */}
          <section className={activeMobileMainView === "characteristics" ? "block" : "hidden md:block"}>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 lg:gap-3">
              {(UI_LABELS.CHARACTERISTICS as Characteristic[]).map((c) => {
                const value = (characterData.attributes as Record<string, number>)[c.key] || 0;
                const bonus = Math.floor(value / 10);
                return (
                  <div 
                    key={c.key} 
                    className="flex flex-col items-center group/char"
                  >
                    <span className="text-[10px] lg:text-[11px] font-bold text-gray-400 uppercase tracking-tighter mb-1.5 transition-colors group-hover/char:text-wfrp-gold whitespace-nowrap">
                      {c.label}
                    </span>
                    
                    <div className="relative">
                      <button 
                        onClick={() => handleRoll(c)}
                        className="w-[60px] lg:w-[80px] h-[80px] lg:h-[100px] flex flex-col items-center justify-center bg-wfrp-surface border-2 border-wfrp-border rounded-lg shadow-lg hover:border-wfrp-gold/60 hover:bg-wfrp-surface-hover transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                        aria-label={`Roll for ${c.label}`}
                      >
                        <div className="text-xl lg:text-3xl font-bold tracking-tight transition-colors group-hover/char:text-wfrp-gold">
                          {value}
                        </div>
                        <div className="absolute top-0 right-1.5 text-[8px] font-bold text-gray-700 transition-colors group-hover/char:text-wfrp-gold/30">
                          {c.key}
                        </div>
                      </button>

                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-wfrp-border bg-wfrp-surface flex items-center justify-center z-10 transition-colors group-hover/char:border-wfrp-gold/40">
                        <span className="text-[11px] font-bold text-gray-400 group-hover/char:text-wfrp-gold/60">
                          {bonus}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex flex-col md:flex-row gap-6">
            <div className={`w-full flex-col gap-6 md:flex md:w-[28%] xl:w-[24%] ${
              activeMobileMainView === "characteristics" ? "flex" : "hidden"
            }`}>
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
            />

            <section className="wfrp-card overflow-hidden p-0!">
              <div className="wfrp-card-tab-header">
                <h3 className="wfrp-panel-title">ARMOUR</h3>
              </div>
              <div className="wfrp-card-tab-body space-y-3 px-4 py-4">
                <div className="mx-auto grid w-[86%] grid-cols-10 gap-1">
                  {[
                    { label: "Head", value: armourTotals.head, className: "col-start-4 row-start-1 col-span-4 aspect-square rounded-full" },
                    { label: "Left arm", value: armourTotals.leftArm, className: "col-start-2 row-start-2 col-span-2 row-span-2 aspect-[1/2] rounded-full rounded-tr-none" },
                    { label: "Body", value: armourTotals.body, className: "col-start-4 row-start-2 col-span-4 row-span-2 aspect-square rounded-lg" },
                    { label: "Right arm", value: armourTotals.rightArm, className: "col-start-8 row-start-2 col-span-2 row-span-2 aspect-[1/2] rounded-full rounded-tl-none" },
                    { label: "Left leg", value: armourTotals.leftLeg, className: "col-start-4 row-start-4 col-span-2 row-span-2 aspect-[1/2] rounded-b-full rounded-t-lg" },
                    { label: "Right leg", value: armourTotals.rightLeg, className: "col-start-6 row-start-4 col-span-2 row-span-2 aspect-[1/2] rounded-b-full rounded-t-lg" },
                  ].map(({ label, value, className }) => (
                    <div
                      key={label}
                      className={`flex flex-col items-center justify-center border border-white/5 bg-black/30 px-3 py-2.5 text-center ${className}`}
                    >
                      <div className="text-[8px] font-bold uppercase leading-tight tracking-widest text-gray-500">
                        {label}
                      </div>
                      <div className="mt-1 text-lg font-bold text-gray-100">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Equipped
                  </span>
                  <span className="text-xs font-semibold leading-relaxed text-gray-300">
                    {equippedArmourNames.length > 0 ? equippedArmourNames.join(", ") : "None"}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Tabbed Info Box - 2/3 width on Desktop/Tablet */}
          <section className={`w-full flex-col overflow-visible self-start min-h-[500px] p-0! md:flex md:flex-1 md:overflow-hidden md:rounded-lg md:border md:border-wfrp-border md:bg-wfrp-surface md:shadow-lg ${
            activeMobileMainView === "characteristics" ? "hidden" : "flex"
          }`}>
              <ScrollableTabStrip className="hidden md:flex px-4 bg-wfrp-surface-subtle border-b border-wfrp-border gap-4 lg:gap-6 overflow-x-auto no-scrollbar">
                {mainTabOptions.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveMainTab(tab.id);
                      setActiveMobileMainView(tab.id);
                    }}
                    className={`relative py-3.5 px-0.5 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                      activeMainTab === tab.id 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    aria-current={activeMainTab === tab.id ? 'page' : undefined}
                  >
                    {tab.label}
                    {activeMainTab === tab.id && (
                      <motion.div 
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400"
                      />
                    )}
                  </button>
                ))}
              </ScrollableTabStrip>

              <div className="flex-1 flex flex-col min-h-0 bg-wfrp-bg/50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMainTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-1 flex flex-col min-h-0"
                  >
                    <LazyTabPanel>
                      {activeMainTab === 'skills' && (
                        <SkillsTab
                          activeSkillSubtab={activeSkillSubtab}
                          setActiveSkillSubtab={setActiveSkillSubtab}
                          visibleSkillRows={visibleSkillRows}
                          attributes={characterData.attributes as Record<string, number>}
                          handleRoll={handleRoll}
                          openSkillInfo={(skillName) => {
                            setActiveInfo({ type: 'skill', name: skillName });
                            setRollState(prev => ({ ...prev, characteristic: null }));
                          }}
                        />
                      )}

                      {activeMainTab === 'actions' && (
                        <ActionsTab
                          activeActionCategory={activeActionCategory}
                          setActiveActionCategory={setActiveActionCategory}
                          characterData={characterData}
                          characterSkills={characterSkills}
                          equipmentState={equipmentState}
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
                          setActiveInfo={setActiveInfo}
                          clearRollCharacteristic={() => {
                            setRollState(prev => ({ ...prev, characteristic: null }));
                          }}
                        />
                      )}

                      {activeMainTab === 'spells' && (
                        <SpellsTab
                        spellSubtabOptions={spellSubtabOptions}
                        activeSpellSubtab={activeSpellSubtab}
                        setActiveSpellSubtab={setActiveSpellSubtab}
                        filteredSpells={filteredSpells}
                        attributes={characterData.attributes as Record<string, number>}
                        characterSkills={characterSkills}
                        formatSpellRange={formatSpellRange}
                        formatSpellTarget={formatSpellTarget}
                        formatSpellDuration={formatSpellDuration}
                        handleRoll={handleRoll}
                        openSpellInfo={(spell, formattedSpell) => {
                          setActiveInfo({
                            type: 'spell',
                            name: spell.name,
                            extra: { ...spell, ...formattedSpell },
                          });
                          setRollState(prev => ({ ...prev, characteristic: null }));
                        }}
                        openSpellShop={() => setIsSpellShopOpen(true)}
                      />
                      )}
                      {activeMainTab === 'inventory' && (
                        <InventoryTab
                        activeInventorySubtab={activeInventorySubtab}
                        setActiveInventorySubtab={setActiveInventorySubtab}
                        characterData={characterData}
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
                        canDropInventoryItem={canDropInventoryItem}
                        canStoreInContainer={canStoreInContainer}
                        handleInventoryDragOver={handleInventoryDragOver}
                        handleInventoryDrop={handleInventoryDrop}
                        handleInventoryDragStart={handleInventoryDragStart}
                        handleInventoryDragEnd={handleInventoryDragEnd}
                        handleConsumeItem={handleConsumeItem}
                        handleToggleInventoryMenu={handleToggleInventoryMenu}
                        handleDropItem={handleDropItem}
                        handleWearItem={handleWearItem}
                        handleUnwearItem={handleUnwearItem}
                        handleCarryItem={handleCarryItem}
                        handleStoreItem={handleStoreItem}
                        formatItemValue={formatItemValue}
                        openShop={() => {
                          setActiveInfo(null);
                          setIsDiceLogOpen(false);
                          setIsShopOpen(true);
                        }}
                        openEquipmentInfo={(itemName) => {
                          setActiveInfo({ type: 'equipment', name: itemName });
                          setRollState(prev => ({ ...prev, characteristic: null }));
                        }}
                      />
                      )}
                    
                      {activeMainTab === 'features' && (
                        <TalentsTab
                        characterTalentRows={characterTalentRows}
                        openTalentInfo={openTalentInfo}
                        getTalentMaxDisplay={getTalentMaxDisplay}
                        formatTalentEffect={formatTalentEffect}
                      />
                      )}

                      {activeMainTab === 'career' && (
                        <CareerTab
                        activeCareerSubtab={activeCareerSubtab}
                        setActiveCareerSubtab={setActiveCareerSubtab}
                        saveCareerChanges={saveCareerChanges}
                        hasPendingCareerChanges={hasPendingCareerChanges}
                        characterData={characterData}
                        displayedCareerRank={displayedCareerRank}
                        displayedCareerRankRecord={displayedCareerRankRecord}
                        careerAdvancementData={careerAdvancementData}
                        advancementProgress={advancementProgress}
                        nextCareerAdvanceCost={nextCareerAdvanceCost}
                        pendingCareerRank={pendingCareerRank}
                        pendingAvailableXp={pendingAvailableXp}
                        nextCareerRankRecord={nextCareerRankRecord}
                        decreasePendingCareerRank={decreasePendingCareerRank}
                        increasePendingCareerRank={increasePendingCareerRank}
                        advancementCharacteristics={advancementCharacteristics}
                        availableCareerCharacteristicKeys={availableCareerCharacteristicKeys}
                        getCharacteristicAdvanceCost={getCharacteristicAdvanceCost}
                        getCharacteristicLabel={getCharacteristicLabel}
                        removePendingCharacteristicAdvance={removePendingCharacteristicAdvance}
                        purchaseCharacteristicAdvance={purchaseCharacteristicAdvance}
                        advancementSkillSections={advancementSkillSections}
                        removePendingSkillAdvance={removePendingSkillAdvance}
                        purchaseSkillAdvance={purchaseSkillAdvance}
                        advancementTalentNames={advancementTalentNames}
                        characterTalents={characterTalents}
                        pendingTalentPurchases={pendingTalentPurchases}
                        getTalentPurchaseCost={getTalentPurchaseCost}
                        removePendingTalentPurchase={removePendingTalentPurchase}
                        purchaseTalent={purchaseTalent}
                        openTalentInfo={openTalentInfo}
                        setActiveInfo={setActiveInfo}
                        clearRollCharacteristic={() => setRollState((prev) => ({ ...prev, characteristic: null }))}
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
                        deleteNote={deleteNote}
                        formatNoteDay={formatNoteDay}
                        formatNoteDate={formatNoteDate}
                        backgroundText={backgroundText}
                        setBackgroundText={setBackgroundText}
                      />
                      )}
                    </LazyTabPanel>
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>
    </AppShell>
  );
}
