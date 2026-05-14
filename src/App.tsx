/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState, useEffect, useMemo, useRef } from "react";
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Menu,
  Plus,
  Minus,
  Settings,
  Trash2,
  X,
  Dice5,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CharacterHeader } from "./components/CharacterHeader";
import { CharacterResourcesCards } from "./components/CharacterResourcesCards";
import {
  InlineSubtabs,
  PanelSectionHeader,
  ResourceCounterBar,
  ScrollableTabStrip,
} from "./components/ui";
import type { ActiveInfoState } from "./components/appTypes";
import { GameSessionProvider, useGameSessionContext } from "./context/GameSessionContext";
import { LazyTabPanel } from "./tabs/LazyTabPanel";
import {
  formatCoinTotalValue,
  formatConsumableName,
  getCoinEncumbrance,
  getConsumableBaseName,
  getConsumableCount,
  getInventoryEncumbrance,
  isBackpackContainerItem,
  isPacksAndContainersItem,
  isWearableInventoryItem,
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
import {
  formatTalentEffect,
  getApplicableTalentEffects,
  getTalentSlBonus,
} from "./lib/talentEffects";
import { UI_LABELS } from "./labels";
import {
  mainTabOptions,
  mobilePageTitleByView,
  mobileTabMenuOptions,
} from "./tabs/tabOptions";
import type {
  ActionCategory,
  CareerSubtab,
  CoinKey,
  InventorySubtab,
  MainTab,
  MobileTabMenuTarget,
  SkillSubtab,
  SpellSubtab,
} from "./tabs/tabTypes";
import type { ArmourDefinition, ArmourLocation, Characteristic, Ruleset, SkillDefinition } from "./types";
import type { ItemDefinition, SpellDefinition } from "./types";

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
const BackgroundTab = lazy(() => import("./tabs/BackgroundTab").then((module) => ({ default: module.BackgroundTab })));
const NotesTab = lazy(() => import("./tabs/NotesTab").then((module) => ({ default: module.NotesTab })));
const CareerTab = lazy(() => import("./tabs/CareerTab").then((module) => ({ default: module.CareerTab })));

interface RollHistoryItem {
  id: string;
  label: string;
  title?: string | null;
  testType: "dramatic" | "attack" | "channeling";
  result: number;
  sl: number;
  isSuccess: boolean;
  modifier: number;
  targetBonusSources: RollBonusSource[];
  target: number;
  damage?: number | null;
  hitLocation?: string | null;
  isCritical?: boolean;
}

interface RollBonusSource {
  label: string;
  value: number;
}

interface RollState {
  characteristic: Characteristic | null;
  title: string | null;
  baseValueOverride: number | null;
  testType: "dramatic" | "attack" | "channeling";
  modifier: number;
  targetBonusSources: RollBonusSource[];
  result: number | null;
  isSuccess: boolean | null;
  rawSl: number | null;
  sl: number | null;
  isRolling: boolean;
  damageBase: number | null;
  bonusSources: RollBonusSource[];
  fortuneActionUsed: boolean;
}

interface InventoryMenuState {
  id: string;
  mode: "move" | "drop";
  top: number;
  left: number;
}

type InventoryDropTargetId = "carried" | string;

interface InventoryDragState {
  itemId: string;
}

type RollActionButton = {
  id: string;
  label: string;
  onClick: () => void;
};

function AppScreen() {
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
  const [activeMobileMainView, setActiveMobileMainView] = useState<MobileTabMenuTarget>("characteristics");
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const [isMobileCharacterListOpen, setIsMobileCharacterListOpen] = useState(false);
  const [isMobilePortraitMenuOpen, setIsMobilePortraitMenuOpen] = useState(false);
  const [activeActionCategory, setActiveActionCategory] = useState<ActionCategory>('all');
  const [activeSkillSubtab, setActiveSkillSubtab] = useState<SkillSubtab>('trained');
  const [activeSpellSubtab, setActiveSpellSubtab] = useState<SpellSubtab>('all');
  const [activeInventorySubtab, setActiveInventorySubtab] = useState<InventorySubtab>('all');
  const [activeCareerSubtab, setActiveCareerSubtab] = useState<CareerSubtab>('all');
  const [rollHistory, setRollHistory] = useState<RollHistoryItem[]>([]);
  const [isDiceLogOpen, setIsDiceLogOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSpellShopOpen, setIsSpellShopOpen] = useState(false);
  const [isCharacterBuilderOpen, setIsCharacterBuilderOpen] = useState(false);
  const [rollState, setRollState] = useState<RollState>({
    characteristic: null,
    title: null,
    baseValueOverride: null,
    testType: "dramatic",
    modifier: 0,
    targetBonusSources: [],
    result: null,
    isSuccess: null,
    rawSl: null,
    sl: null,
    isRolling: false,
    damageBase: null,
    bonusSources: [],
    fortuneActionUsed: false,
  });
  const [displayRoll, setDisplayRoll] = useState(0);
  const [activeInventoryMenu, setActiveInventoryMenu] = useState<InventoryMenuState | null>(null);
  const [inventoryDrag, setInventoryDrag] = useState<InventoryDragState | null>(null);
  const [inventoryDropTarget, setInventoryDropTarget] = useState<InventoryDropTargetId | null>(null);
  const [pendingCharacteristicAdvances, setPendingCharacteristicAdvances] = useState<Record<string, number>>({});
  const [pendingSkillAdvances, setPendingSkillAdvances] = useState<Record<string, number>>({});
  const [pendingTalentPurchases, setPendingTalentPurchases] = useState<Record<string, number>>({});
  const [pendingCareerRank, setPendingCareerRank] = useState<number | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const activeRollerRef = useRef<HTMLDivElement>(null);
  const inventoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = `${characterData.name} - ${UI_LABELS.CAMPAIGN_NAME} WFRP 4E`;
  }, [characterData.name]);

  const pendingCharacteristicSpend = Object.entries(pendingCharacteristicAdvances).reduce<number>(
    (total, [characteristicKey, count]) => {
      const baseAdvances = currentCharacteristicAdvances[characteristicKey] ?? 0;

      let nextTotal = total;
      for (let step = 0; step < Number(count); step += 1) {
        nextTotal += getCharacteristicAdvanceCost(baseAdvances + step);
      }

      return nextTotal;
    },
    0,
  );
  const pendingSkillSpend = Object.entries(pendingSkillAdvances).reduce<number>(
    (total, [skillName, count]) => {
      const baseAdvances =
        characterSkills.find((skill) => skill.displayName === skillName)?.advances ?? 0;

      let nextTotal = total;
      for (let step = 0; step < Number(count); step += 1) {
        nextTotal += getAdvanceCost(baseAdvances + step);
      }

      return nextTotal;
    },
    0,
  );
  const pendingTalentSpend = Object.entries(pendingTalentPurchases).reduce<number>(
    (total, [talentName, count]) => {
      const baseTakenCount = characterTalents.filter((talent) => talent.name === talentName).length;

      let nextTotal = total;
      for (let step = 0; step < Number(count); step += 1) {
        nextTotal += getTalentPurchaseCost(baseTakenCount + step);
      }

      return nextTotal;
    },
    0,
  );
  const displayedCareerRank = pendingCareerRank ?? currentCareerRank;
  const hasPendingCareerChanges =
    Object.keys(pendingCharacteristicAdvances).length > 0 ||
    Object.keys(pendingSkillAdvances).length > 0 ||
    Object.keys(pendingTalentPurchases).length > 0 ||
    pendingCareerRank !== null;
  const totalEarnedXp = characterData.xpTotal;
  const spentXp = Math.max(0, totalEarnedXp - xpCurrent);
  const displayedCareerRankRecord =
    characterData.careerRecord.ranks.find((rank) => rank.rank === displayedCareerRank) ??
    characterData.careerRecord.ranks.find((rank) => rank.rank === characterData.careerRecord.level) ??
    null;
  const nextCareerRankRecord =
    characterData.careerRecord.ranks.find((rank) => rank.rank === displayedCareerRank + 1) ?? null;
  const advancementCharacteristics = UI_LABELS.CHARACTERISTICS.map(({ key, label }) => ({
    key,
    label,
    advances: currentCharacteristicAdvances[key] ?? 0,
    pendingAdvances: pendingCharacteristicAdvances[key] ?? 0,
    value: characterData.attributes[key] ?? 0,
  }));
  const availableCareerCharacteristicKeys = careerAdvancementData.characteristics
    .filter((item) => item.availableFromRank <= displayedCareerRank)
    .map((item) => item.key);
  const characterSkillByName = new Map<string, ResolvedCharacterSkill>(
    characterSkills.map((skill) => [skill.displayName, skill]),
  );
  type ResolvedSkillOption = (typeof rulesIndex.resolvedSkillOptions)[number];
  const skillDefinitionById = new Map<string, SkillDefinition>(
    ruleset.skills.map((skill) => [skill.id, skill]),
  );
  const skillDefinitionByName = new Map<string, SkillDefinition>(
    ruleset.skills.map((skill) => [skill.name, skill]),
  );
  const skillOptionByName = new Map<string, ResolvedSkillOption>(
    rulesIndex.resolvedSkillOptions.map((option) => [option.name, option]),
  );
  const getSkillAdvanceTotal = (skillName: string) => {
    const baseAdvances = characterSkillByName.get(skillName)?.advances ?? 0;
    const pendingAdvances = pendingSkillAdvances[skillName] ?? 0;
    return baseAdvances + pendingAdvances;
  };
  const spellSubtabOptions = getSpellSubtabOptions(characterData.spells);
  const filteredSpells = filterSpellsBySubtab(characterData.spells, activeSpellSubtab);
  const getCareerSkillAdvanceTotal = (careerSkillName: string) => {
    const skillDefinition = skillDefinitionByName.get(careerSkillName);

    if (!skillDefinition?.grouped) {
      return getSkillAdvanceTotal(careerSkillName);
    }

    return Math.max(
      0,
      ...rulesIndex.resolvedSkillOptions
        .filter((option) => option.skillId === skillDefinition.id)
        .map((option) => getSkillAdvanceTotal(option.name)),
    );
  };
  const getCareerSkillOptions = (careerSkillName: string) => {
    const skillDefinition = skillDefinitionByName.get(careerSkillName);

    if (!skillDefinition?.grouped) {
      return [careerSkillName];
    }

    return rulesIndex.resolvedSkillOptions
      .filter((option) => option.skillId === skillDefinition.id)
      .map((option) => option.name);
  };
  const isCareerSkillName = (skillName: string) => {
    if (careerAdvancementData.skills.includes(skillName)) {
      return true;
    }

    const skillOption = skillOptionByName.get(skillName);
    if (!skillOption) {
      return false;
    }

    const parentSkill = skillDefinitionById.get(skillOption.skillId);
    return parentSkill ? careerAdvancementData.skills.includes(parentSkill.name) : false;
  };
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
  const hasCareerTalentRequirement = careerAdvancementData.talents.some((talentName) =>
    characterTalents.some((talent) => talent.name === talentName) ||
    (pendingTalentPurchases[talentName] ?? 0) > 0,
  );
  const isCareerStepComplete = (rank: number) => {
    const requiredAdvances = rank * 5;
    const availableCharacteristicKeys = careerAdvancementData.characteristics
      .filter((item) => item.availableFromRank <= rank)
      .map((item) => item.key);
    const completedCharacteristics = availableCharacteristicKeys.filter((characteristicKey) => {
      const baseAdvances = currentCharacteristicAdvances[characteristicKey] ?? 0;
      const pendingAdvances = pendingCharacteristicAdvances[characteristicKey] ?? 0;
      return baseAdvances + pendingAdvances >= requiredAdvances;
    }).length;
    const completedSkills = careerAdvancementData.skills.filter((skillName) => {
      return getCareerSkillAdvanceTotal(skillName) >= requiredAdvances;
    }).length;

    return (
      completedCharacteristics === availableCharacteristicKeys.length &&
      completedSkills === careerAdvancementData.skills.length &&
      hasCareerTalentRequirement
    );
  };
  const getCareerAdvanceCost = (rank: number) => (isCareerStepComplete(rank) ? 100 : 200);
  const pendingCareerSpend =
    pendingCareerRank === null || pendingCareerRank <= currentCareerRank
      ? 0
      : Array.from(
          { length: pendingCareerRank - currentCareerRank },
          (_, index) => currentCareerRank + index,
        ).reduce((total, rank) => total + getCareerAdvanceCost(rank), 0);
  const pendingSpentXp =
    pendingCharacteristicSpend + pendingSkillSpend + pendingTalentSpend + pendingCareerSpend;
  const pendingAvailableXp = Math.max(0, Number(xpCurrent) - pendingSpentXp);
  const requiredCareerAdvances = displayedCareerRank * 5;
  const completedCareerCharacteristics = availableCareerCharacteristicKeys.filter((characteristicKey) => {
    const baseAdvances = currentCharacteristicAdvances[characteristicKey] ?? 0;
    const pendingAdvances = pendingCharacteristicAdvances[characteristicKey] ?? 0;
    return baseAdvances + pendingAdvances >= requiredCareerAdvances;
  }).length;
  const completedCareerSkills = careerAdvancementData.skills.filter((skillName) => {
    return getCareerSkillAdvanceTotal(skillName) >= requiredCareerAdvances;
  }).length;
  const careerProgressGoalCount = availableCareerCharacteristicKeys.length + careerAdvancementData.skills.length + 1;
  const careerProgressCompletedCount =
    completedCareerCharacteristics + completedCareerSkills + (hasCareerTalentRequirement ? 1 : 0);
  const advancementProgress = careerProgressGoalCount === 0
    ? 0
    : Math.round((careerProgressCompletedCount / careerProgressGoalCount) * 100);
  const nextCareerAdvanceCost = nextCareerRankRecord ? getCareerAdvanceCost(displayedCareerRank) : null;
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
    setActiveInventoryMenu(null);
    setIsDiceLogOpen(false);
    setIsShopOpen(false);
    setPendingCharacteristicAdvances({});
    setPendingSkillAdvances({});
    setPendingTalentPurchases({});
    setPendingCareerRank(null);
    setRollHistory([]);
    setRollState({
      characteristic: null,
      title: null,
      baseValueOverride: null,
      testType: "dramatic",
      modifier: 0,
      targetBonusSources: [],
      result: null,
      isSuccess: null,
      rawSl: null,
      sl: null,
      isRolling: false,
      damageBase: null,
      bonusSources: [],
      fortuneActionUsed: false,
    });
  }, [characterData.id]);

  useEffect(() => {
    if (activeInfo) {
      setIsShopOpen(false);
    }
  }, [activeInfo]);

  useEffect(() => {
    if (!activeInventoryMenu) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!inventoryMenuRef.current?.contains(event.target as Node)) {
        setActiveInventoryMenu(null);
      }
    };

    const handleWindowChange = () => {
      setActiveInventoryMenu(null);
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [activeInventoryMenu]);

  // Scroll active roller into view (top of container)
  useEffect(() => {
    if (rollState.characteristic && rollState.result === null) {
      setTimeout(() => {
        activeRollerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [rollState.characteristic, rollState.result]);

  const skillListRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const propertyListRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const talentListRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // WFRP 4e Advance Cost Table
  function getAdvanceCost(currentAdvances: number) {
    if (currentAdvances < 5) return 10;
    if (currentAdvances < 10) return 15;
    if (currentAdvances < 15) return 20;
    if (currentAdvances < 20) return 30;
    if (currentAdvances < 25) return 40;
    if (currentAdvances < 30) return 60;
    if (currentAdvances < 35) return 80;
    if (currentAdvances < 40) return 110;
    if (currentAdvances < 45) return 140;
    if (currentAdvances < 50) return 180;
    if (currentAdvances < 55) return 220;
    if (currentAdvances < 60) return 270;
    if (currentAdvances < 65) return 320;
    if (currentAdvances < 70) return 380;
    return 440;
  }

  function getCharacteristicAdvanceCost(currentAdvances: number) {
    if (currentAdvances < 5) return 25;
    if (currentAdvances < 10) return 30;
    if (currentAdvances < 15) return 40;
    if (currentAdvances < 20) return 50;
    if (currentAdvances < 25) return 70;
    if (currentAdvances < 30) return 90;
    if (currentAdvances < 35) return 120;
    if (currentAdvances < 40) return 150;
    if (currentAdvances < 45) return 190;
    if (currentAdvances < 50) return 230;
    if (currentAdvances < 55) return 280;
    if (currentAdvances < 60) return 330;
    if (currentAdvances < 65) return 390;
    if (currentAdvances < 70) return 450;
    return 520;
  }

  function getTalentPurchaseCost(currentTimesTaken: number) {
    return 100 + currentTimesTaken * 100;
  }

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

  // Shuffling effect for dice animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (rollState.isRolling) {
      interval = setInterval(() => {
        setDisplayRoll(Math.floor(Math.random() * 99) + 1);
      }, 40);
    }
    return () => clearInterval(interval);
  }, [rollState.isRolling]);

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

  const handleToggleEquip = (itemId: string) => {
    const activeItem = equipmentState.find((item) => item.id === itemId);
    if (!activeItem) return;

    const shouldEquip = !activeItem.equipped;
    if (shouldEquip) {
      const conflicts = getArmourFitConflicts(
        activeItem,
        equipmentState.filter((item) => item.id !== activeItem.id),
      );

      if (conflicts.length > 0) {
        return;
      }
    }

    setEquipmentState(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, equipped: shouldEquip, containerId: activeItem.equipped ? item.containerId ?? null : null }
        : item
    ));
  };

  const handleStoreItem = (itemId: string, containerId: string) => {
    setEquipmentState((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, equipped: false, containerId }
          : item
      ),
    );
    setActiveInventoryMenu(null);
  };

  const handleCarryItem = (itemId: string) => {
    setEquipmentState((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, containerId: null }
          : item
      ),
    );
    setActiveInventoryMenu(null);
  };

  const handleWearItem = (itemId: string) => {
    const activeItem = equipmentState.find((item) => item.id === itemId);
    if (!activeItem || !isWearableInventoryItem(activeItem)) return;

    if (activeItem.type === "Armor") {
      const conflicts = getArmourFitConflicts(
        activeItem,
        equipmentState.filter((item) => item.id !== activeItem.id),
      );

      if (conflicts.length > 0) {
        return;
      }
    }

    setEquipmentState((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              equipped:
                item.type === "Armor" || isBackpackContainerItem(item)
                  ? true
                  : item.equipped,
              containerId: null,
            }
          : item,
      ),
    );
    setActiveInventoryMenu(null);
  };

  const handleUnwearItem = (itemId: string) => {
    setEquipmentState((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              equipped:
                item.type === "Armor" || isBackpackContainerItem(item)
                  ? false
                  : item.equipped,
              containerId: null,
            }
          : item,
      ),
    );
    setActiveInventoryMenu(null);
  };

  const handleDropItem = (itemId: string) => {
    setEquipmentState((prev) =>
      prev
        .filter((item) => item.id !== itemId)
        .map((item) =>
          item.containerId === itemId
            ? { ...item, containerId: null }
            : item,
        ),
    );
    setActiveInventoryMenu(null);
  };

  const handleConsumeItem = (itemId: string) => {
    setEquipmentState((prev) =>
      prev
        .map((item) => {
          if (item.id !== itemId) return item;

          const count = getConsumableCount(item);
          if (!count || count <= 1) return null;

          return {
            ...item,
            name: formatConsumableName(item, count - 1),
          };
        })
        .filter((item): item is ResolvedCharacterEquipment => Boolean(item)),
    );
  };

  const handleResolveArmourFit = (
    newItemId: string,
    conflictItemIds: string[],
    action: "container" | "drop",
    containerId?: string,
  ) => {
    const conflictIds = new Set(conflictItemIds);
    setEquipmentState((prev) =>
      prev
        .filter((item) => action !== "drop" || !conflictIds.has(item.id))
        .map((item) => {
          if (item.id === newItemId) {
            return { ...item, equipped: true, containerId: null };
          }

          if (action === "container" && conflictIds.has(item.id)) {
            return { ...item, equipped: false, containerId: containerId ?? null };
          }

          return item;
        }),
    );
    setActiveInventoryMenu(null);
  };

  const handleAddShopItem = (item: ItemDefinition) => {
    const purchasedAt = Date.now();

    setEquipmentState((prev) => [
      ...prev,
      {
        id: `shop-${item.id}-${purchasedAt}`,
        itemId: item.id,
        weaponId: item.weaponId,
        armourId: item.armourId,
        armourLocations: item.armourLocations,
        name: item.name,
        type: item.type,
        description: item.description,
        encumbrance: item.encumbrance,
        carries: item.carries,
        value: item.value,
        currency: item.currency,
        priceLabel: item.priceLabel,
        availability: item.availability,
        equipped: item.id === "backpack_item",
        containerId: null,
      },
    ]);
    setActiveMainTab("inventory");
    setActiveMobileMainView("inventory");
  };

  const handleAddSpell = (spell: SpellDefinition) => {
    setCharacterSpells((currentSpells) => {
      if (currentSpells.some((currentSpell) => currentSpell.id === spell.id)) {
        return currentSpells;
      }

      return [
        ...currentSpells,
        {
          id: spell.id,
          name: spell.name,
          description: spell.description,
          category: spell.category,
          school: spell.school,
          cn: spell.cn,
          range: spell.range,
          target: spell.target,
          duration: spell.duration,
          damage: spell.damage,
        },
      ];
    });
    setActiveMainTab("spells");
    setActiveMobileMainView("spells");
  };

  const handleAdjustCoinType = (coinKey: CoinKey, amount: number) => {
    setCharacterCoins((prev) => ({
      ...prev,
      [coinKey]: Math.max(0, prev[coinKey] + amount),
    }));
  };

  const handleToggleInventoryMenu = (
    itemId: string,
    event: ReactMouseEvent<HTMLButtonElement>,
    mode: InventoryMenuState["mode"],
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 136;
    const nextLeft = Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 12,
    );

    setActiveInventoryMenu((current) =>
      current?.id === itemId && current.mode === mode
        ? null
        : {
            id: itemId,
            mode,
            top: rect.bottom + 6,
            left: Math.max(12, nextLeft),
          },
    );
  };

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

  const canStoreInContainer = (
    itemId: string,
    containerId: string,
  ) => {
    const item = equipmentState.find((entry) => entry.id === itemId);
    const container = equipmentState.find((entry) => entry.id === containerId);

    if (!item || !container || item.id === container.id) return false;
    if (isPacksAndContainersItem(item)) return false;
    if (isBackpackContainerItem(container) && !isWornInventoryItem(container)) return false;

    const capacity = container.carries ?? 0;
    if (capacity <= 0) return false;

    const used = getContainerUsedEncumbrance(containerId);
    const currentContribution = item.containerId === containerId ? item.encumbrance : 0;

    return used - currentContribution + item.encumbrance <= capacity;
  };

  const canDropInventoryItem = (
    itemId: string,
    targetContainerId: string | null,
    targetWorn = false,
    targetCarried = false,
  ) => {
    const item = equipmentState.find((entry) => entry.id === itemId);
    if (!item) return false;

    if (targetWorn) {
      if (!isWearableInventoryItem(item) || isWornInventoryItem(item)) return false;
      if (item.type === "Armor") {
        return getArmourFitConflicts(
          item,
          equipmentState.filter((entry) => entry.id !== item.id),
        ).length === 0;
      }
      return true;
    }

    if (targetCarried && isWornInventoryItem(item)) {
      return item.type === "Armor" || isBackpackContainerItem(item);
    }

    const currentContainerId = item.containerId ?? null;
    if (currentContainerId === targetContainerId) return false;
    if (!targetContainerId) return true;

    return canStoreInContainer(itemId, targetContainerId);
  };

  const handleInventoryDragStart = (
    item: ResolvedCharacterEquipment,
    event: ReactDragEvent<HTMLDivElement>,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item.id);
    setActiveInventoryMenu(null);
    setInventoryDrag({
      itemId: item.id,
    });
  };

  const handleInventoryDragEnd = () => {
    setInventoryDrag(null);
    setInventoryDropTarget(null);
  };

  const handleInventoryDragOver = (
    targetId: InventoryDropTargetId,
    targetContainerId: string | null,
    event: ReactDragEvent<HTMLDivElement>,
    targetWorn = false,
    targetCarried = false,
  ) => {
    if (
      !inventoryDrag ||
      !canDropInventoryItem(inventoryDrag.itemId, targetContainerId, targetWorn, targetCarried)
    ) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setInventoryDropTarget(targetId);
  };

  const handleInventoryDrop = (
    targetContainerId: string | null,
    event: ReactDragEvent<HTMLDivElement>,
    targetWorn = false,
    targetCarried = false,
  ) => {
    event.preventDefault();
    if (
      !inventoryDrag ||
      !canDropInventoryItem(inventoryDrag.itemId, targetContainerId, targetWorn, targetCarried)
    ) {
      handleInventoryDragEnd();
      return;
    }

    if (targetWorn) {
      handleWearItem(inventoryDrag.itemId);
    } else if (targetCarried && isWornInventoryItem(equipmentState.find((item) => item.id === inventoryDrag.itemId)!)) {
      handleUnwearItem(inventoryDrag.itemId);
    } else if (targetContainerId) {
      handleStoreItem(inventoryDrag.itemId, targetContainerId);
    } else {
      handleCarryItem(inventoryDrag.itemId);
    }
    handleInventoryDragEnd();
  };

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
  const noteGroups = filteredNotes.reduce<Array<{ dayKey: string; date: string; notes: typeof sortedNotes }>>(
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
    setPendingCharacteristicAdvances({});
    setPendingSkillAdvances({});
    setPendingTalentPurchases({});
    setPendingCareerRank(null);
  };

  const formatSignedSl = (value: number, zeroSign: "positive" | "negative" | "neutral" = "neutral") => {
    if (value === 0) {
      if (zeroSign === "positive") return "+0";
      if (zeroSign === "negative") return "-0";
      return "0";
    }

    return value > 0 ? `+${value}` : `${value}`;
  };

  const getRollBaseValue = (state: Pick<RollState, "characteristic">) => {
    if (!state.characteristic) return 0;
    if ("baseValueOverride" in state && state.baseValueOverride !== null) return state.baseValueOverride;

    const baseValue = ((characterData.attributes as Record<string, number>)[state.characteristic.key] || 0);
    const skill = characterSkills.find((entry) => entry.displayName === state.characteristic?.label);

    return skill ? baseValue + skill.advances : baseValue;
  };

  const getTargetBonusTotal = (targetBonusSources: RollBonusSource[]) =>
    targetBonusSources.reduce((sum, bonus) => sum + bonus.value, 0);

  const getRollTarget = (
    state: Pick<RollState, "characteristic" | "modifier" | "targetBonusSources"> & {
      baseValueOverride?: number | null;
    },
  ) => {
    return getRollBaseValue(state) + state.modifier + getTargetBonusTotal(state.targetBonusSources);
  };

  const getDamageTotal = (state: Pick<RollState, "damageBase" | "sl" | "isSuccess">) => {
    if (state.damageBase === null || state.sl === null) return null;
    return state.damageBase + state.sl;
  };

  const getHitLocation = (result: number | null) => {
    if (result === null) return null;

    const normalized = result === 100 ? 0 : result;
    const reversed = (normalized % 10) * 10 + Math.floor(normalized / 10);

    if (reversed >= 1 && reversed <= 9) return "Head";
    if (reversed >= 10 && reversed <= 24) return "Left Arm";
    if (reversed >= 25 && reversed <= 44) return "Right Arm";
    if (reversed >= 45 && reversed <= 79) return "Body";
    if (reversed >= 80 && reversed <= 89) return "Left Leg";
    return "Right Leg";
  };

  const getIsCritical = (state: Pick<RollState, "testType" | "result" | "isSuccess">) => {
    if (state.testType !== "attack" || state.result === null) return false;
    const criticalRolls = new Set([11, 22, 33, 44, 55, 66, 77, 88, 99]);
    return criticalRolls.has(state.result);
  };

  const getBonusTotal = (bonusSources: RollBonusSource[]) =>
    bonusSources.reduce((sum, bonus) => sum + bonus.value, 0);

  const getCharacteristicLabel = (key: Characteristic['key']) => {
    const labels: Record<Characteristic['key'], string> = {
      WS: 'Weapon Skill',
      BS: 'Ballistic Skill',
      S: 'Strength',
      T: 'Toughness',
      I: 'Initiative',
      Ag: 'Agility',
      Dex: 'Dexterity',
      Int: 'Intelligence',
      WP: 'Willpower',
      Fel: 'Fellowship',
    };
    return labels[key];
  };

  const getCharacteristicDescription = (key: Characteristic['key']) => {
    const descriptions: Record<Characteristic['key'], string> = {
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

  const getTestTypeTitle = (testType: RollState["testType"] | RollHistoryItem["testType"]) => {
    if (testType === "attack") return "Attack Test";
    if (testType === "channeling") return "Channeling Test";
    return "Dramatic Test";
  };

  const archiveRoll = (state: RollState, labelSuffix?: string) => {
    if (!state.characteristic || state.result === null) return;

    const historyItem: RollHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      label: `${state.characteristic.label}${labelSuffix ?? ""}`,
      title: state.title ? `${state.title}${labelSuffix ?? ""}` : null,
      testType: state.testType,
      result: state.result,
      sl: state.sl || 0,
      isSuccess: state.isSuccess || false,
      modifier: state.modifier,
      targetBonusSources: state.targetBonusSources,
      target: getRollTarget(state),
      damage: getDamageTotal(state),
      hitLocation: state.testType === "attack" ? getHitLocation(state.result) : null,
      isCritical: getIsCritical(state),
    };

    setRollHistory(prev => [historyItem, ...prev]);
  };

  const applySlChange = (delta: number) => {
    setRollState(prev => {
      if (prev.result === null || prev.sl === null) return prev;

      const nextSl = prev.sl + delta;
      return {
        ...prev,
        sl: nextSl,
        isSuccess: nextSl >= 0,
      };
    });
  };

  const handleIWillNotFail = () => {
    if (resilienceCurrent <= 0) return;

    setResilienceCurrent(prev => prev - 1);
    setRollState(prev => {
      if (prev.result === null) return prev;

      return {
        ...prev,
        sl: 1,
        isSuccess: true,
      };
    });
  };

  const handleAddSl = () => {
    if (fortuneCurrent <= 0 || rollState.fortuneActionUsed) return;

    setFortuneCurrent(prev => prev - 1);
    applySlChange(1);
    setRollState(prev => ({ ...prev, fortuneActionUsed: true }));
  };

  const handleRoll = (
    char: Characteristic,
    damage?: number,
    options?: {
      bonuses?: RollBonusSource[];
      slBonus?: number;
      slBonusLabel?: string | null;
      testType?: RollState["testType"];
      title?: string | null;
      baseValueOverride?: number | null;
    },
  ) => {
    setActiveInfo(null); // Ensure only one sidebar open
    setIsShopOpen(false);
    
    // Archive current roll if it has a result
    archiveRoll(rollState);

    const optionBonusSources = options?.bonuses
      ?? (options?.slBonusLabel || options?.slBonus
        ? [{ label: options?.slBonusLabel ?? "Bonus", value: options?.slBonus ?? 0 }]
        : []);
    const talentEffects = getApplicableTalentEffects({
      talents: characterTalents,
      talentDefinitions: ruleset.talents,
      context: { testName: char.label },
    });
    const talentSlBonus = getTalentSlBonus(talentEffects);
    const bonusSources = talentSlBonus === 0
      ? optionBonusSources
      : [
          ...optionBonusSources,
          {
            label: "Talents",
            value: talentSlBonus,
          },
        ];

    setRollState({
      characteristic: char,
      title: options?.title ?? null,
      baseValueOverride: options?.baseValueOverride ?? null,
      testType: options?.testType ?? (damage === undefined ? "dramatic" : "attack"),
      modifier: 0,
      targetBonusSources: [],
      result: null,
      isSuccess: null,
      rawSl: null,
      sl: null,
      isRolling: false,
      damageBase: damage || null,
      bonusSources,
      fortuneActionUsed: false,
    });
  };

  const handleReroll = () => {
    if (fortuneCurrent > 0 && !rollState.fortuneActionUsed) {
      setFortuneCurrent(prev => prev - 1);
      
      // Archive current attempt first so it shows in log
      archiveRoll(rollState, " (Original)");

      // Reset result and roll again
      setRollState(prev => ({ ...prev, result: null, isRolling: false, fortuneActionUsed: true }));
      setTimeout(() => executeRoll(), 50);
    }
  };

  const handleRollCritical = () => {
    if (!rollState.characteristic || !getIsCritical(rollState)) return;

    archiveRoll(rollState);
    setRollState({
      characteristic: { key: rollState.characteristic.key, label: "Critical" },
      title: "Critical Roll",
      baseValueOverride: 0,
      testType: "dramatic",
      modifier: 0,
      targetBonusSources: [],
      result: null,
      isSuccess: null,
      rawSl: null,
      sl: null,
      isRolling: false,
      damageBase: null,
      bonusSources: [],
      fortuneActionUsed: false,
    });
  };

  const executeRoll = () => {
    if (!rollState.characteristic) return;
    
    const baseValue = (characterData.attributes as Record<string, number>)[rollState.characteristic!.key] || 0;
    // Check if it's a skill by looking for it in characterSkills
    const skill = characterSkills.find(s => s.displayName === rollState.characteristic?.label);
    const value = skill ? baseValue + skill.advances : baseValue;
    
    const target = value + rollState.modifier + getTargetBonusTotal(rollState.targetBonusSources);
    const roll = Math.floor(Math.random() * 100); 
    const finalRoll = roll === 0 ? 100 : roll;
    
    // WFRP 4e Rules:
    // Automatic Success: 01-05
    // Automatic Failure: 96-00
    let success = finalRoll <= target;
    if (finalRoll <= 5) success = true;
    if (finalRoll >= 96) success = false;

    const targetTens = Math.floor(target / 10);
    const rollTens = Math.floor(finalRoll / 10);
    const sl = targetTens - rollTens;

    // Start rolling with result ALREADY known for the animation to aim at
    setRollState(prev => {
      const totalBonus = getBonusTotal(prev.bonusSources);
      const totalSl = sl + totalBonus;
      const finalSuccess = totalBonus !== 0 ? totalSl >= 0 : success;

      return {
      ...prev, 
      isRolling: true, 
      result: finalRoll,
      isSuccess: finalSuccess,
      rawSl: sl,
      sl: totalSl,
    };
    });

    // Animation delay to allow the reel to spin
    setTimeout(() => {
      setRollState(prev => ({ ...prev, isRolling: false }));
    }, 2200); 
  };

  const getOutcome = (sl: number, isSuccess: boolean) => {
    if (isSuccess) {
      if (sl >= 6) return "Astounding Success";
      if (sl >= 4) return "Impressive Success";
      if (sl >= 2) return "Success";
      return "Marginal Success";
    } else {
      if (sl <= -6) return "Astounding Failure";
      if (sl <= -4) return "Impressive Failure";
      if (sl <= -2) return "Failure";
      return "Marginal Failure";
    }
  };

  const getDifficultyLabel = (modifier: number) => {
    switch (modifier) {
      case 60: return "Very Easy";
      case 40: return "Easy";
      case 20: return "Average";
      case 0: return "Challenging";
      case -10: return "Difficult";
      case -20: return "Hard";
      case -30: return "Very Hard";
      default: return modifier > 0 ? "Bonus" : "Penalty";
    }
  };

  const canUseFortuneActions =
    !rollState.isRolling &&
    rollState.result !== null &&
    !rollState.fortuneActionUsed &&
    fortuneCurrent > 0;

  const canUseResilienceAction =
    !rollState.isRolling &&
    rollState.result !== null &&
    resilienceCurrent > 0;

  const canRollCritical =
    !rollState.isRolling &&
    rollState.result !== null &&
    getIsCritical(rollState);

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

  const handleMobileMainViewSelect = (target: MobileTabMenuTarget) => {
    setActiveMobileMainView(target);

    if (target === "characteristics") {
      return;
    }

    setActiveMainTab(target);
  };

  const closeMobileNavigation = () => {
    setIsMobileNavigationOpen(false);
    setIsMobileCharacterListOpen(false);
  };

  const openMobileNavigation = (showCharacterList = false) => {
    setIsMobilePortraitMenuOpen(false);
    setIsMobileCharacterListOpen(showCharacterList);
    setIsMobileNavigationOpen(true);
  };

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
    <div className="min-h-screen bg-wfrp-dark text-wfrp-page-text font-sans selection:bg-wfrp-gold/40 flex flex-col">
      
      {/* Top Accent Line */}
      <div className="h-1 bg-wfrp-red w-full flex-shrink-0" />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-0 md:p-4 md:space-y-4">
          
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
                      {activeMainTab === 'background' && (
                        <BackgroundTab
                        backgroundText={backgroundText}
                        setBackgroundText={setBackgroundText}
                      />
                      )}

                      {activeMainTab === 'notes' && (
                        <NotesTab
                        sortedNotes={sortedNotes}
                        noteGroups={noteGroups}
                        noteHashtags={noteHashtags}
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
                      />
                      )}
                    </LazyTabPanel>
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>
        </main>

        {mobileAddAction && (
          <button
            type="button"
            onClick={mobileAddAction.onClick}
            className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-wfrp-gold/50 bg-wfrp-surface text-wfrp-gold shadow-xl shadow-black/50 transition-colors hover:border-wfrp-gold/70 hover:bg-wfrp-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wfrp-gold/60 md:hidden"
            aria-label={mobileAddAction.label}
          >
            <Plus size={24} />
          </button>
        )}

        <AnimatePresence>
          {isMobileNavigationOpen && (
            <motion.div
              className="fixed inset-0 z-50 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation drawer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/65"
                aria-label="Close navigation drawer"
                onClick={closeMobileNavigation}
              />
              <motion.aside
                className="absolute left-0 top-0 flex h-full w-[min(86vw,340px)] flex-col border-r border-wfrp-brass-border bg-wfrp-dark shadow-2xl"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 260 }}
              >
                <div className="border-b border-wfrp-border bg-wfrp-surface px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <Menu size={18} className="mt-1 shrink-0 text-wfrp-gold/70" />
                      <div className="min-w-0">
                      <h2 className="truncate font-serif text-2xl font-bold text-wfrp-gold">
                        {characterData.name}
                      </h2>
                      <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-widest text-gray-500">
                        {UI_LABELS.CAMPAIGN_NAME}
                      </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMobileCharacterListOpen((isOpen) => !isOpen)}
                      className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/5 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                      aria-label="Change character"
                      aria-expanded={isMobileCharacterListOpen}
                    >
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${isMobileCharacterListOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {isMobileCharacterListOpen && (
                    <div className="mt-4 overflow-hidden rounded border border-wfrp-border bg-black/25 p-1">
                      {availableCharacters.map((character) => {
                        const isSelected = character.id === selectedCharacterId;

                        return (
                          <button
                            key={character.id}
                            type="button"
                            onClick={() => {
                              setSelectedCharacterId(character.id);
                              closeMobileNavigation();
                            }}
                            className={`flex w-full items-center justify-between rounded px-3 py-2.5 text-left transition-colors ${
                              isSelected
                                ? "bg-wfrp-gold-surface text-wfrp-gold"
                                : "text-gray-200 hover:bg-wfrp-surface-raised"
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">{character.name}</span>
                              <span className="block text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                {character.rulesetId}
                              </span>
                            </span>
                            <span className="ml-3 flex h-5 w-5 items-center justify-center">
                              {isSelected ? <Check size={14} /> : null}
                            </span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveInfo(null);
                          setIsShopOpen(false);
                          setIsSpellShopOpen(false);
                          setIsDiceLogOpen(false);
                          setRollState((prev) => ({ ...prev, characteristic: null }));
                          setIsCharacterBuilderOpen(true);
                          closeMobileNavigation();
                        }}
                        className="mt-1 flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm font-semibold text-gray-400 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold"
                      >
                        <Plus size={16} />
                        Create character
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto py-3">
                  {mobileTabMenuOptions.map((item) => {
                    const isActive =
                      item.id === "characteristics"
                        ? activeMobileMainView === "characteristics"
                        : activeMobileMainView === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          handleMobileMainViewSelect(item.id);
                          closeMobileNavigation();
                        }}
                        className={`mx-3 flex h-11 w-[calc(100%-1.5rem)] items-center rounded border px-4 text-left text-[11px] font-black uppercase tracking-widest transition-colors ${
                          isActive
                            ? "border-wfrp-gold/50 bg-wfrp-gold/15 text-wfrp-gold"
                            : "border-transparent text-gray-300 hover:border-wfrp-border hover:bg-wfrp-surface hover:text-wfrp-gold"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.label}
                      </button>
                    );
                  })}

                  <div className="my-3 border-t border-wfrp-border" />

                  <button
                    type="button"
                    onClick={() => {
                      setActiveInfo(null);
                      setIsShopOpen(false);
                      setIsDiceLogOpen(true);
                      closeMobileNavigation();
                    }}
                    className="mx-3 flex h-11 w-[calc(100%-1.5rem)] items-center rounded border border-transparent px-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:border-wfrp-border hover:bg-wfrp-surface hover:text-wfrp-gold"
                  >
                    Dice
                  </button>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {(isDiceLogOpen || rollState.characteristic) && (
            <motion.aside 
              key="dice-roller"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="wfrp-sidebar-shell w-[360px]"
            >
              <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar min-h-0 flex flex-col bg-black/10">
                {/* Header - Sticky again */}
                <div className="wfrp-sidebar-header p-3 shrink-0 sticky top-0 z-20">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="wfrp-sidebar-title text-base">Dice Log</h2>
                      <p className="wfrp-sidebar-kicker">Roll & Results</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      // Archive current roll if it has a result on close
                      archiveRoll(rollState);
                      setIsDiceLogOpen(false);
                      setRollState(prev => ({ ...prev, characteristic: null }));
                    }}
                    className="wfrp-icon-btn p-1 rounded-full hover:bg-wfrp-border cursor-pointer"
                    aria-label="Close dice log"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-4 flex flex-col pt-8">
                  {/* History Section - Old rolls visible only if you scroll up */}
                  <div className="flex flex-col gap-12 mb-12">
                    {rollHistory.map((item) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-3 px-1"
                      >
                        <h3 className="wfrp-sidebar-title text-[11px] uppercase tracking-tight text-white/60">
                          {item.title ?? getTestTypeTitle(item.testType)}
                        </h3>

                        <div className="grid grid-cols-[minmax(72px,1fr)_56px_minmax(0,1fr)] items-center gap-1">
                          <span className="wfrp-list-cell-strong">{item.label}:</span>
                          <span className="wfrp-sidebar-body text-right text-gray-200">
                            {item.target - item.modifier - getTargetBonusTotal(item.targetBonusSources)}
                          </span>
                          <div />

                          {item.targetBonusSources.map((bonus) => (
                            <div key={`${item.id}-${bonus.label}`} className="contents">
                              <span className="wfrp-list-cell-strong">{bonus.label}:</span>
                              <span className="wfrp-sidebar-body text-right text-gray-200">
                                {formatSignedSl(bonus.value, bonus.value >= 0 ? "positive" : "negative")}
                              </span>
                              <div />
                            </div>
                          ))}

                          <span className="wfrp-list-cell-strong">Difficulty:</span>
                          <span className="wfrp-sidebar-body text-right text-gray-200">
                            {item.modifier >= 0 ? "+" : ""}{item.modifier}
                          </span>
                          <div />

                          <div className="col-span-2 grid grid-cols-subgrid items-center border-y border-white/10 py-1">
                            <span className="wfrp-list-cell-strong text-gray-100">Adjusted:</span>
                            <span className="wfrp-sidebar-body text-right text-gray-100">
                              {item.target}
                            </span>
                          </div>
                          <div />

                          <span className="wfrp-list-cell-strong">Result:</span>
                          <div className="flex justify-end">
                            <div className="flex gap-1 grayscale opacity-60">
                              <DigitReel targetDigit={item.result === 100 ? 0 : Math.floor(item.result / 10)} reel={[0,1,2,3,4,5,6,7,8,9]} duration={0} delay={0} isStatic />
                              <DigitReel targetDigit={item.result === 100 ? 0 : item.result % 10} reel={[0,9,8,7,6,5,4,3,2,1]} duration={0} delay={0} isStatic />
                            </div>
                          </div>
                          <div />
                        </div>

                        <div className="grid grid-cols-[minmax(72px,1fr)_56px_minmax(0,1fr)] items-center gap-1">
                          <div className="col-span-2 grid grid-cols-subgrid items-center border-y border-white/10 py-1">
                            <span className="wfrp-list-cell-strong text-gray-100">Success Levels:</span>
                            <span className="wfrp-sidebar-body text-right font-semibold text-gray-100">
                              {formatSignedSl(item.sl)}
                            </span>
                          </div>
                          <div />
                        </div>

                        {item.testType === "attack" && item.damage !== null && item.damage !== undefined && (
                          <div className="grid grid-cols-[minmax(72px,1fr)_56px_minmax(0,1fr)] items-center gap-1">
                            {item.isCritical && (
                              <>
                                <div className="contents">
                                  <span className="wfrp-list-cell-strong text-gray-100">Critical:</span>
                                  <span className="wfrp-sidebar-body text-right font-semibold text-gray-100">
                                    Critical Wound
                                  </span>
                                  <div />
                                </div>
                                <div className="col-span-2 h-px bg-white/8 my-0.5" />
                                <div />
                              </>
                            )}
                            {item.hitLocation && (
                              <>
                                <div className="contents">
                                  <span className="wfrp-list-cell-strong">Hit Location:</span>
                                  <span className="wfrp-sidebar-body text-right text-gray-200">
                                    {item.hitLocation}
                                  </span>
                                  <div />
                                </div>
                                <div className="col-span-2 h-px bg-white/8 my-0.5" />
                                <div />
                              </>
                            )}
                            <div className="col-span-2 grid grid-cols-subgrid items-center border-y border-white/10 py-1">
                              <span className="wfrp-list-cell-strong text-gray-100">Wounds:</span>
                              <span className="wfrp-sidebar-body text-right font-semibold text-gray-100">
                                {item.damage}
                              </span>
                            </div>
                            <div />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Active Dice Roller - Anchored at the "current" point, scrolls to top when active */}
                  {rollState.characteristic && (
                    <div 
                      ref={activeRollerRef}
                      className="flex flex-col gap-3 px-1 scroll-mt-20 mb-[80vh] min-h-[200px] transition-all"
                    >
                      <h3 className="wfrp-sidebar-title text-[11px] uppercase tracking-tight text-white">
                        {rollState.title ?? getTestTypeTitle(rollState.testType)}
                      </h3>
                      
                      <div className="grid grid-cols-[minmax(72px,1fr)_56px_minmax(0,1fr)] items-center gap-1">
                        <span className="wfrp-list-cell-strong">{rollState.characteristic.label}:</span>
                        <span className="wfrp-sidebar-body text-right text-gray-200">
                          {getRollBaseValue(rollState)}
                        </span>
                        <div />

                        {rollState.targetBonusSources.map((bonus) => (
                          <div key={bonus.label} className="contents">
                            <span className="wfrp-list-cell-strong">{bonus.label}:</span>
                            <span className="wfrp-sidebar-body text-right text-gray-200">
                              {formatSignedSl(bonus.value, bonus.value >= 0 ? "positive" : "negative")}
                            </span>
                            <div />
                          </div>
                        ))}

                        <span className="wfrp-list-cell-strong">Difficulty:</span>
                        <span className="wfrp-sidebar-body text-right text-gray-200">
                          {rollState.modifier >= 0 ? "+" : ""}{rollState.modifier}
                        </span>
                        {(rollState.result === null || rollState.isRolling) ? (
                          <div className="flex items-center gap-1 justify-self-start">
                            <button 
                              disabled={rollState.isRolling}
                              onClick={() => setRollState(prev => ({ ...prev, modifier: prev.modifier - 10 }))}
                              className="wfrp-dice-adjust-btn"
                            >
                              <Minus size={10} />
                            </button>
                            <button 
                              disabled={rollState.isRolling}
                              onClick={() => setRollState(prev => ({ ...prev, modifier: prev.modifier + 10 }))}
                              className="wfrp-dice-adjust-btn"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        ) : (
                          <div />
                        )}

                        <div className="col-span-2 h-px bg-white/8 my-0.5" />
                        <div />
                        <span className="wfrp-list-cell-strong text-gray-100">Adjusted:</span>
                        <span className="wfrp-sidebar-body text-right text-gray-100">
                          {getRollTarget(rollState)}
                        </span>
                        <div />
                        <div className="col-span-2 h-px bg-white/8 my-0.5" />
                        <div />

                        {(rollState.isRolling || rollState.result !== null) && (
                          <>
                            <span className="wfrp-list-cell-strong mt-1">
                              Rolling Dice <RollingDots isRolling={rollState.isRolling} />
                            </span>
                            <div />
                            <div />

                            <div className="col-span-3 flex min-h-8 items-center justify-start overflow-visible">
                            <div className="transition-all overflow-visible">
                                <div className="flex gap-1">
                                  <DigitReel 
                                    targetDigit={rollState.result === 100 ? 0 : Math.floor((rollState.result || 0) / 10)} 
                                    reel={[0,1,2,3,4,5,6,7,8,9]} 
                                    duration={2.5} 
                                    delay={0.4} 
                                    isStatic={!rollState.isRolling && rollState.result !== null} 
                                  />
                                  <DigitReel 
                                    targetDigit={rollState.result === 100 ? 0 : (rollState.result || 0) % 10} 
                                    reel={[0,9,8,7,6,5,4,3,2,1]} 
                                    duration={1.2} 
                                    delay={0}
                                    isStatic={!rollState.isRolling && rollState.result !== null} 
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {!rollState.isRolling && rollState.result !== null && (
                        <div className="flex flex-col gap-2 pt-1">
                          <div className="grid grid-cols-[minmax(72px,1fr)_56px_minmax(0,1fr)] items-baseline gap-1 px-1">
                            {rollState.bonusSources.length > 0 && (
                              <>
                                <div className="contents">
                                  <span className="wfrp-list-cell-strong">Dice:</span>
                                  <span className="wfrp-sidebar-body text-right text-gray-200">
                                    {formatSignedSl(
                                      rollState.rawSl!,
                                      rollState.rawSl! >= 0 ? "positive" : "negative",
                                    )}
                                  </span>
                                  <div />
                                </div>
                                {rollState.bonusSources.map((bonus) => (
                                  <div key={`${bonus.label}-${bonus.value}`} className="contents">
                                    <span className="wfrp-list-cell-strong">{bonus.label}:</span>
                                    <span className="wfrp-sidebar-body text-right text-gray-200">
                                      {formatSignedSl(
                                        bonus.value,
                                        bonus.value >= 0 ? "positive" : "negative",
                                      )}
                                    </span>
                                    <div />
                                  </div>
                                ))}
                                <div className="col-span-2 h-px bg-white/8 my-0.5" />
                                <div />
                              </>
                            )}
                            <div className="contents">
                              <span className="wfrp-list-cell-strong text-gray-100">Success Levels:</span>
                              <span className="wfrp-sidebar-body text-right font-semibold text-gray-100">
                                {formatSignedSl(
                                  rollState.sl!,
                                  rollState.isSuccess ? "positive" : "negative",
                                )}
                              </span>
                              <div />
                            </div>
                            <div className="col-span-2 h-px bg-white/8 my-0.5" />
                            <div />
                          </div>

                          {rollState.damageBase !== null && rollState.sl !== null && (
                            <div className="grid grid-cols-[minmax(72px,1fr)_56px_minmax(0,1fr)] items-baseline gap-1 px-1">
                              {getIsCritical(rollState) && (
                                <>
                                  <div className="contents">
                                    <span className="wfrp-list-cell-strong text-gray-100">Critical:</span>
                                    <span className="wfrp-sidebar-body text-right font-semibold text-gray-100">
                                      Critical Wound
                                    </span>
                                    <div />
                                  </div>
                                  <div className="col-span-2 h-px bg-white/8 my-0.5" />
                                  <div />
                                </>
                              )}
                              {rollState.testType === "attack" && rollState.result !== null && (
                                <>
                                  <div className="contents">
                                    <span className="wfrp-list-cell-strong">Hit Location:</span>
                                    <span className="wfrp-sidebar-body text-right text-gray-200">
                                      {getHitLocation(rollState.result)}
                                    </span>
                                    <div />
                                  </div>
                                  <div className="col-span-2 h-px bg-white/8 my-0.5" />
                                  <div />
                                </>
                              )}
                              <div className="contents">
                                <span className="wfrp-list-cell-strong">Base Damage:</span>
                                <span className="wfrp-sidebar-body text-right text-gray-200">
                                  {formatSignedSl(rollState.damageBase, rollState.damageBase >= 0 ? "positive" : "negative")}
                                </span>
                                <div />
                              </div>
                              <div className="contents">
                                <span className="wfrp-list-cell-strong">SL Damage:</span>
                                <span className="wfrp-sidebar-body text-right text-gray-200">
                                  {formatSignedSl(rollState.sl!, rollState.sl! >= 0 ? "positive" : "negative")}
                                </span>
                                <div />
                              </div>
                              <div className="col-span-2 h-px bg-white/8 my-0.5" />
                              <div />
                              <div className="contents">
                                <span className="wfrp-list-cell-strong text-gray-100">Wounds:</span>
                                <span className="wfrp-sidebar-body text-right font-semibold text-gray-100">
                                  {getDamageTotal(rollState) ?? "-"}
                                </span>
                                <div />
                              </div>
                            </div>
                          )}

                          </div>
                      )}

                      {!rollState.isRolling && rollState.result === null && (
                        <button 
                           onClick={executeRoll}
                           className="wfrp-roll-cta"
                        >
                          Roll
                        </button>
                      )}

                      {!rollState.isRolling && rollState.result !== null && (
                        <div className="flex flex-col gap-2">
                          {canRollCritical && (
                            <div className="flex flex-col gap-1">
                              <span className="wfrp-table-label text-gray-500">Critical</span>
                              <button
                                onClick={handleRollCritical}
                                title="Critical action"
                                aria-label="Critical action: roll critical"
                                className="wfrp-action-btn w-fit px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                              >
                                Roll Critical
                              </button>
                            </div>
                          )}
                          {canUseFortuneActions && (
                            <div className="flex flex-col gap-1">
                              <span className="wfrp-table-label text-gray-500">Spend Fortune</span>
                              <div className="flex flex-row flex-wrap items-center gap-2">
                              <button
                                onClick={handleReroll}
                                title="Fortune action"
                                aria-label="Fortune action: reroll"
                                className="wfrp-action-btn px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                              >
                                Reroll
                              </button>
                              <button
                                onClick={handleAddSl}
                                title="Fortune action"
                                aria-label="Fortune action: add one success level"
                                className="wfrp-action-btn px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                              >
                                +1 SL
                              </button>
                              </div>
                            </div>
                          )}
                          {canUseResilienceAction && (
                            <div className="flex flex-col gap-1">
                              <span className="wfrp-table-label text-gray-500">Spend Resilience</span>
                              <div className="flex flex-row flex-wrap items-center gap-2">
                                <button
                                  onClick={handleIWillNotFail}
                                  title="Resilience action"
                                  aria-label="Resilience action: I Will Not Fail!"
                                  className="wfrp-action-btn px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                                >
                                  I Will Not Fail!
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

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
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GameSessionProvider>
      <AppScreen />
    </GameSessionProvider>
  );
}

function DigitReel({ targetDigit, reel, duration, delay, isStatic }: { targetDigit: number, reel: number[], duration: number, delay: number, isStatic?: boolean }) {
  const digitHeight = 32; // Height of each number in pixels
  const spins = isStatic ? 0 : 4; // number of full spins before stopping
  const targetIndex = reel.indexOf(targetDigit);
  const totalItems = isStatic ? targetIndex : (spins * reel.length) + targetIndex;

  // Create a long list of numbers to animate through
  const repeatedReel = [];
  const repetitions = isStatic ? 1 : spins + 1;
  for (let i = 0; i < repetitions; i++) {
    repeatedReel.push(...reel);
  }
  
  return (
    <div className="wfrp-digit-window">
      <motion.div
        initial={isStatic ? { y: -(digitHeight * targetIndex) } : { y: 0 }}
        animate={{ y: -(digitHeight * totalItems) }}
        transition={isStatic ? { duration: 0 } : { 
          duration: duration, 
          delay: delay,
          ease: [0.16, 1, 0.3, 1] // Even slower deceleration at the end
        }}
        className="flex flex-col items-center"
      >
        {repeatedReel.map((num, i) => (
          <div 
            key={i} 
            className="h-8 w-8 flex items-center justify-center text-lg font-mono font-black text-wfrp-gold/80"
          >
            {num}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function RollingDots({ isRolling }: { isRolling: boolean }) {
  if (!isRolling) {
    return <span aria-hidden="true">...</span>;
  }

  return (
    <span className="inline-flex" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0.25 }}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.15,
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}
