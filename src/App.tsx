/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { 
  Plus,
  Minus,
  Settings,
  MoreHorizontal,
  X,
  Dice5,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRef } from "react";
import { CharacterHeader } from "./components/CharacterHeader";
import { GameSessionProvider, useGameSessionContext } from "./context/GameSessionContext";
import { listCharacters } from "./data/repository";
import { skillCharacteristicById } from "./data/rules/wfrp4e";
import {
  formatCharacterCoins,
  formatItemValue,
  getCharacterSkillKey,
  getWeaponStats,
} from "./lib/gameSession";
import { UI_LABELS } from "./labels";
import { Characteristic } from "./types";

interface RollHistoryItem {
  id: string;
  label: string;
  title?: string | null;
  testType: "dramatic" | "attack" | "channeling";
  result: number;
  sl: number;
  isSuccess: boolean;
  modifier: number;
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
  top: number;
  left: number;
}

type ResourceCounterBarProps = {
  label: string;
  current: number;
  max: number;
  onAdjust: (delta: number) => void;
  barClassName: string;
  counterToneClassName: string;
  minusHoverClassName: string;
  plusHoverClassName: string;
  minusRingClassName: string;
  plusRingClassName: string;
};

type HeaderResourceSliderProps = {
  label: string;
  current: number;
  max: number;
  onAdjust: (delta: number) => void;
  barClassName: string;
};

type RollActionButton = {
  id: string;
  label: string;
  onClick: () => void;
};

type InlineSubtabOption<T extends string> = {
  id: T;
  label: string;
};

type ActionCategory = 'all' | 'melee' | 'ranged' | 'other';
type CareerSubtab = 'all' | 'careers' | 'characteristics' | 'skills' | 'talents';

function ResourceCounterBar({
  label,
  current,
  max,
  onAdjust,
  barClassName,
  counterToneClassName,
  minusHoverClassName,
  plusHoverClassName,
  minusRingClassName,
  plusRingClassName,
}: ResourceCounterBarProps) {
  const percent = max > 0 ? (current / max) * 100 : 0;
  const counterClassName = `text-[10px] font-bold ${counterToneClassName}`;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onAdjust(-1)}
        className={`wfrp-stepper-btn ${minusHoverClassName} ${minusRingClassName}`}
        aria-label={`Decrease current ${label.toLowerCase()}`}
      >
        <Minus size={10} />
      </button>

      <div className="flex w-24 flex-col gap-1 lg:w-36">
        <div className="flex items-end justify-between leading-none">
          <span className="text-[9px] font-bold uppercase tracking-tight text-gray-400">
            {label}
          </span>
          <span className={counterClassName}>
            {current} / {max}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#303030] shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barClassName}`}
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={current}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={`${label} remaining`}
          />
        </div>
      </div>

      <button
        onClick={() => onAdjust(1)}
        className={`wfrp-stepper-btn ${plusHoverClassName} ${plusRingClassName}`}
        aria-label={`Increase current ${label.toLowerCase()}`}
      >
        <Plus size={10} />
      </button>
    </div>
  );
}

function HeaderResourceSlider({
  label,
  current,
  max,
  onAdjust,
  barClassName,
}: HeaderResourceSliderProps) {
  return (
    <ResourceCounterBar
      label={label}
      current={current}
      max={max}
      onAdjust={onAdjust}
      barClassName={barClassName}
      counterToneClassName="text-gray-200"
      minusHoverClassName="hover:text-wfrp-red"
      plusHoverClassName="hover:text-green-600"
      minusRingClassName="focus-visible:ring-wfrp-red/50"
      plusRingClassName="focus-visible:ring-green-600/50"
    />
  );
}

function InlineSubtabs<T extends string>({
  options,
  activeId,
  onChange,
}: {
  options: InlineSubtabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex items-center gap-2 p-3 lg:p-4 bg-black/20 border-b border-white/5 overflow-x-auto no-scrollbar">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
            activeId === option.id
              ? 'bg-[#333] text-white shadow-lg'
              : 'bg-black/40 text-gray-400 hover:bg-[#222] hover:text-gray-200'
          }`}
          aria-pressed={activeId === option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function PanelSectionHeader({
  title,
  meta,
}: {
  title: string;
  meta?: string;
}) {
  return (
    <div className="wfrp-section-head">
      <h3 className="wfrp-panel-title">{title}</h3>
      {meta ? <span className="wfrp-section-meta">{meta}</span> : null}
    </div>
  );
}

function AdvancementSection({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <PanelSectionHeader title={title} meta={meta} />
      {children}
    </section>
  );
}

function AppScreen() {
  const TALENT_PURCHASE_COST = 100;

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
    currentCareerRank,
    setCurrentCareerRank,
    characterSkills,
    setCharacterSkills,
    characterTalents,
    setCharacterTalents,
    equipmentState,
    setEquipmentState,
  } = useGameSessionContext();
  const availableCharacters = listCharacters();
  const [activeInfo, setActiveInfo] = useState<{ type: 'skill' | 'equipment' | 'talent' | 'spell' | 'property' | 'attack', name: string, extra?: any } | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'actions' | 'inventory' | 'spells' | 'features' | 'background' | 'notes' | 'career'>('actions');
  const [activeActionCategory, setActiveActionCategory] = useState<ActionCategory>('all');
  const [activeCareerSubtab, setActiveCareerSubtab] = useState<CareerSubtab>('all');
  const [rollHistory, setRollHistory] = useState<RollHistoryItem[]>([]);
  const [isDiceLogOpen, setIsDiceLogOpen] = useState(false);
  const [rollState, setRollState] = useState<RollState>({
    characteristic: null,
    title: null,
    baseValueOverride: null,
    testType: "dramatic",
    modifier: 0,
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
  const [pendingSkillAdvances, setPendingSkillAdvances] = useState<Record<string, number>>({});
  const [pendingTalentPurchases, setPendingTalentPurchases] = useState<string[]>([]);
  const [pendingCareerRank, setPendingCareerRank] = useState<number | null>(null);
  const activeRollerRef = useRef<HTMLDivElement>(null);
  const inventoryMenuRef = useRef<HTMLDivElement>(null);
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
  const pendingTalentSpend = pendingTalentPurchases.length * TALENT_PURCHASE_COST;
  const pendingSpentXp = pendingSkillSpend + pendingTalentSpend;
  const pendingAvailableXp = Math.max(0, Number(xpCurrent) - pendingSpentXp);
  const displayedCareerRank = pendingCareerRank ?? currentCareerRank;
  const hasPendingCareerChanges =
    Object.keys(pendingSkillAdvances).length > 0 ||
    pendingTalentPurchases.length > 0 ||
    pendingCareerRank !== null;
  const totalEarnedXp = characterData.xpTotal;
  const spentXp = Math.max(0, totalEarnedXp - xpCurrent);
  const advancementProgress = careerAdvancementData.skills.length === 0
    ? 0
    : Math.round(
      (careerAdvancementData.skills.filter((skillName) =>
        characterSkills.some((skill) => skill.displayName === skillName && skill.advances > 0),
      ).length / careerAdvancementData.skills.length) * 100,
    );
  const displayedCareerRankRecord =
    characterData.careerRecord.ranks.find((rank) => rank.rank === displayedCareerRank) ??
    characterData.careerRecord.ranks.find((rank) => rank.rank === characterData.careerRecord.level) ??
    null;
  const nextCareerRankRecord =
    characterData.careerRecord.ranks.find((rank) => rank.rank === displayedCareerRank + 1) ?? null;
  const toRoman = (value: number) => ["", "I", "II", "III", "IV"][value] ?? String(value);
  const advancementCharacteristics = UI_LABELS.CHARACTERISTICS.map(({ key, label }) => ({
    key,
    label,
    value: characterData.attributes[key] ?? 0,
  }));
  const advancementSkillNames = [...new Set([
    ...careerAdvancementData.skills,
    ...characterSkills.map((skill) => skill.displayName),
  ])];
  const advancementTalentNames = [...new Set([
    ...careerAdvancementData.talents,
    ...characterTalents.map((talent) => talent.name),
  ])];

  useEffect(() => {
    setActiveInfo(null);
    setActiveMainTab("actions");
    setActiveActionCategory("all");
    setActiveCareerSubtab("all");
    setActiveInventoryMenu(null);
    setIsDiceLogOpen(false);
    setPendingSkillAdvances({});
    setPendingTalentPurchases([]);
    setPendingCareerRank(null);
    setRollHistory([]);
    setRollState({
      characteristic: null,
      title: null,
      baseValueOverride: null,
      testType: "dramatic",
      modifier: 0,
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

  // Scroll to active info in sidebar
  useEffect(() => {
    if (activeInfo) {
      setTimeout(() => {
        if (activeInfo.type === 'skill' && skillListRefs.current[activeInfo.name]) {
          skillListRefs.current[activeInfo.name]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (activeInfo.type === 'property' && propertyListRefs.current[activeInfo.name]) {
          propertyListRefs.current[activeInfo.name]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [activeInfo]);

  const skillListRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const propertyListRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // WFRP 4e Advance Cost Table
  const getAdvanceCost = (currentAdvances: number) => {
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
  };

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
    setEquipmentState(prev => prev.map(item => 
      item.id === itemId
        ? { ...item, equipped: !item.equipped, containerId: item.equipped ? item.containerId ?? null : null }
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

  const handleToggleInventoryMenu = (
    itemId: string,
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 136;
    const nextLeft = Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 12,
    );

    setActiveInventoryMenu((current) =>
      current?.id === itemId
        ? null
        : {
            id: itemId,
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
  const totalEncumbrance = equipmentState.reduce((sum, item) => {
    if (item.containerId) return sum;
    return sum + Number(item.encumbrance || 0);
  }, 0);
  const carryCapacity = Math.max(sb + tb, 1);
  const encumbrancePercent = Math.min((totalEncumbrance / carryCapacity) * 100, 100);
  const containers = equipmentState.filter((item) => item.type === "Container");
  const carriedItems = equipmentState.filter(
    (item) => !item.containerId && item.type !== "Container",
  );

  const getContainerContents = (containerId: string) =>
    equipmentState.filter((item) => item.containerId === containerId);

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
    if (item.type === "Container") return false;

    const capacity = container.carries ?? 0;
    if (capacity <= 0) return false;

    const used = getContainerUsedEncumbrance(containerId);
    const currentContribution = item.containerId === containerId ? item.encumbrance : 0;

    return used - currentContribution + item.encumbrance <= capacity;
  };

  const formatSpellRange = (range: string) =>
    range
      .replace(/Willpower Bonus/gi, `${wpb}`)
      .replace(/Willpower/gi, `${wp}`)
      .replace(/\s+/g, " ")
      .trim();

  const formatSpellTarget = (target: string) =>
    target
      .replace(/Willpower Bonus/gi, `${wpb}`)
      .replace(/Willpower/gi, `${wp}`)
      .replace(/\(\s*(\d+)\s+yards\s*\)/gi, "($1 yards)")
      .replace(/\s+/g, " ")
      .trim();

  const adjustWounds = (delta: number) => {
    setWoundsCurrent(prev => Math.min(Math.max(0, prev + delta), characterData.wounds.max));
  };

  const adjustCorruption = (delta: number) => {
    setCorruptionCurrent(prev => Math.min(Math.max(0, prev + delta), resourceCaps.corruption));
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

  const purchaseTalent = (talentName: string) => {
    if (pendingAvailableXp < TALENT_PURCHASE_COST) return;

    const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
    if (
      !talentDefinition ||
      characterTalents.some((talent) => talent.id === talentDefinition.id) ||
      pendingTalentPurchases.includes(talentName)
    ) {
      return;
    }

    setPendingTalentPurchases((prev) => [...prev, talentName]);
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
    setPendingTalentPurchases((prev) => prev.filter((name) => name !== talentName));
  };

  const saveCareerChanges = () => {
    if (!hasPendingCareerChanges) return;

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

    if (pendingTalentPurchases.length > 0) {
      setCharacterTalents((prev) => {
        const nextTalents = [...prev];

        for (const talentName of pendingTalentPurchases) {
          const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
          if (!talentDefinition || nextTalents.some((talent) => talent.id === talentDefinition.id)) {
            continue;
          }

          nextTalents.push({
            id: talentDefinition.id,
            name: talentDefinition.name,
            description: talentDefinition.description,
          });
        }

        return nextTalents;
      });
    }

    if (pendingCareerRank !== null) {
      setCurrentCareerRank(pendingCareerRank);
    }

    setXpCurrent((prev) => Math.max(0, prev - pendingSpentXp));
    setPendingSkillAdvances({});
    setPendingTalentPurchases([]);
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

  const getRollTarget = (state: Pick<RollState, "characteristic" | "modifier"> & { baseValueOverride?: number | null }) => {
    return getRollBaseValue(state) + state.modifier;
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
    
    // Archive current roll if it has a result
    archiveRoll(rollState);

    setRollState({
      characteristic: char,
      title: options?.title ?? null,
      baseValueOverride: options?.baseValueOverride ?? null,
      testType: options?.testType ?? (damage === undefined ? "dramatic" : "attack"),
      modifier: 0,
      result: null,
      isSuccess: null,
      rawSl: null,
      sl: null,
      isRolling: false,
      damageBase: damage || null,
      bonusSources: options?.bonuses
        ?? (options?.slBonusLabel || options?.slBonus
          ? [{ label: options?.slBonusLabel ?? "Bonus", value: options?.slBonus ?? 0 }]
          : []),
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
    
    const target = value + rollState.modifier;
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

  return (
    <div className="min-h-screen bg-[#121212] text-[#f0f0f0] font-sans selection:bg-wfrp-gold/40 flex flex-col">
      
      {/* Top Accent Line */}
      <div className="h-1 bg-wfrp-red w-full flex-shrink-0" />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Compact Horizontal Header */}
          <CharacterHeader
            characterData={characterData}
            availableCharacters={availableCharacters}
            selectedCharacterId={selectedCharacterId}
            woundsCurrent={woundsCurrent}
            corruptionCurrent={corruptionCurrent}
            maxCorruption={maxCorruption}
            xpCurrent={xpCurrent}
            onSelectCharacter={setSelectedCharacterId}
            onCreateCharacter={() => {}}
            adjustWounds={adjustWounds}
            adjustCorruption={adjustCorruption}
            onOpenDice={() => {
              setActiveInfo(null);
              setIsDiceLogOpen(true);
            }}
          />

        {/* Layout for Characteristics and Skills */}
        <div className="flex flex-col gap-8">
          {/* Characteristics Section */}
          <section>
            <h2 className="text-[11px] font-bold font-serif text-gray-400 uppercase tracking-widest mb-3 px-1 text-center">Characteristics</h2>
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
                        className="w-[60px] lg:w-[80px] h-[80px] lg:h-[100px] flex flex-col items-center justify-center bg-[#181818] border-2 border-[#303030] rounded-lg shadow-lg hover:border-wfrp-gold/60 hover:bg-[#1e1e1e] transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                        aria-label={`Roll for ${c.label}`}
                      >
                        <div className="text-xl lg:text-3xl font-bold tracking-tight transition-colors group-hover/char:text-wfrp-gold">
                          {value}
                        </div>
                        <div className="absolute top-0 right-1.5 text-[8px] font-bold text-gray-700 transition-colors group-hover/char:text-wfrp-gold/30">
                          {c.key}
                        </div>
                      </button>

                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-[#303030] bg-[#181818] flex items-center justify-center z-10 transition-colors group-hover/char:border-wfrp-gold/40">
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
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              {/* Skills Section */}
            <section className="wfrp-card">
              <div className="grid grid-cols-[60px_1fr_52px] gap-2 mb-3 wfrp-table-header px-2 rounded-t">
                <span className="col-span-2 text-left">Skill</span>
                <span className="text-right">Char</span>
              </div>
              
              <div className="space-y-0.5">
                {characterSkills.map((skill, idx) => {
                  const charValue = (characterData.attributes as Record<string, number>)[skill.characteristic] || 0;
                  const totalValue = charValue + skill.advances;
                  
                  return (
                    <div 
                      key={idx}
                      className="w-full grid grid-cols-[60px_1fr_52px] wfrp-table-row border-0 px-2 group"
                    >
                      <button 
                        onClick={() => handleRoll({ key: skill.characteristic, label: skill.displayName })}
                        className="wfrp-roll-btn w-12 justify-self-start"
                        aria-label={`Roll for ${skill.displayName}`}
                      >
                        {totalValue}
                      </button>

                      <span 
                        onClick={() => {
                          setActiveInfo({ type: 'skill', name: skill.displayName });
                          setRollState(prev => ({ ...prev, characteristic: null }));
                        }}
                        className="wfrp-skill-link"
                      >
                        {skill.displayName}
                      </span>

                      <div className="wfrp-label-xs justify-self-end">
                        {skill.characteristic}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Reserves Section - Below Skills */}
            <section className="wfrp-card">
              <h3 className="wfrp-panel-title mb-4">
                FATE & RESILIENCE
                <div className="wfrp-panel-rule" />
              </h3>
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3">
                  <div className="grid grid-cols-2 gap-3">
                    <HeaderResourceSlider
                      label="Fate"
                      current={fateCurrent}
                      max={resourceCaps.fate}
                      onAdjust={adjustFate}
                      barClassName="bg-[#C98B00]"
                    />
                    <HeaderResourceSlider
                      label="Fortune"
                      current={fortuneCurrent}
                      max={fateCurrent}
                      onAdjust={adjustFortune}
                      barClassName="bg-[#C98B00]"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3">
                  <div className="grid grid-cols-2 gap-3">
                    <HeaderResourceSlider
                      label="Resilience"
                      current={resilienceCurrent}
                      max={resourceCaps.resilience}
                      onAdjust={adjustResilience}
                      barClassName="bg-[#0088A8]"
                    />
                    <HeaderResourceSlider
                      label="Resolve"
                      current={resolveCurrent}
                      max={Math.min(resourceCaps.resolve, resilienceCurrent)}
                      onAdjust={adjustResolve}
                      barClassName="bg-[#0088A8]"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Tabbed Info Box - 2/3 width on Desktop/Tablet */}
          <section className="w-full md:w-2/3 wfrp-card flex flex-col overflow-hidden self-start min-h-[500px] p-0!">
              <div className="flex px-4 bg-[#111] border-b border-[#303030] gap-4 lg:gap-6 overflow-x-auto no-scrollbar">
                {[
                  { id: 'actions', label: 'Actions' },
                  { id: 'spells', label: 'Spells' },
                  { id: 'inventory', label: 'Inventory' },
                  { id: 'features', label: 'Talents' },
                  { id: 'background', label: 'Background' },
                  { id: 'notes', label: 'Notes' },
                  { id: 'career', label: 'Advance' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMainTab(tab.id as any)}
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
              </div>

              <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c0c]/50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMainTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-1 flex flex-col min-h-0"
                  >
                    {activeMainTab === 'actions' && (
                      <div className="flex flex-col h-full">
                        {/* Sub Tabs */}
                        <InlineSubtabs<ActionCategory>
                          options={[
                            { id: 'all', label: 'All' },
                            { id: 'melee', label: 'Melee' },
                            { id: 'ranged', label: 'Ranged' },
                            { id: 'other', label: 'Other' },
                          ]}
                          activeId={activeActionCategory}
                          onChange={setActiveActionCategory}
                        />

                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
                          {characterData.spells.length > 0 && (activeActionCategory === 'all' || activeActionCategory === 'other') && (() => {
                            const baseWP = (characterData.attributes as Record<string, number>)['WP'] || 0;
                            const channellingSkill = characterSkills.find(s => s.baseName === 'Channelling');
                            const totalChannelingValue = channellingSkill ? baseWP + channellingSkill.advances : baseWP;
                              const channelingAction = {
                              name: 'Language (Magick)',
                              char: 'WP' as const,
                              properties: ['Spellcasting'],
                            };

                            return (
                            <div className="wfrp-subpanel-shell flex flex-col">
                                <div className="grid grid-cols-[60px_1fr_1fr] gap-2 lg:gap-4 px-4 py-1 bg-black/10 border-b border-white/5 items-center">
                                  <span className="wfrp-table-label col-span-2 text-left">Channeling</span>
                                  <span className="wfrp-table-label text-left">Notes</span>
                                </div>

                                <div className="divide-y divide-white/5">
                                  <div className="grid grid-cols-[60px_1fr_1fr] items-center gap-2 lg:gap-4 wfrp-table-row group">
                                    <div className="flex justify-center">
                                      <button
                                        onClick={() => handleRoll({ key: 'WP', label: 'Language (Magick)' }, undefined, { testType: 'channeling' })}
                                        className="wfrp-roll-btn w-12"
                                        aria-label="Roll Channeling"
                                      >
                                        {totalChannelingValue}
                                      </button>
                                    </div>
                                    <span
                                      onClick={() => setActiveInfo({ type: 'attack', name: 'Channeling', extra: { ...channelingAction, totalValue: totalChannelingValue, weaponName: 'Channeling', weaponType: 'Character Action' } })}
                                      className="wfrp-skill-link truncate"
                                    >
                                      {channelingAction.name}
                                    </span>
                                    <div className="flex w-full flex-wrap content-start items-center gap-x-1">
                                      {channelingAction.properties.map((prop, propIndex) => (
                                        <span key={prop} className="text-xs font-semibold text-gray-400">
                                          <button
                                            onClick={() => {
                                              setActiveInfo({ type: 'property', name: prop, extra: { weaponProperties: channelingAction.properties } });
                                              setRollState(prev => ({ ...prev, characteristic: null }));
                                            }}
                                            className="cursor-pointer text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 rounded-sm"
                                          >
                                            {prop === "Spellcasting" ? "Spell Focus" : prop}
                                          </button>
                                          {propIndex < channelingAction.properties.length - 1 ? "," : ""}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          {/* Weapon Sections */}
                          {equipmentState
                            .filter(item => item.type.includes('Weapon') && item.equipped)
                            .filter(item => {
                              if (activeActionCategory === 'all') return true;
                              if (activeActionCategory === 'melee') return item.type.includes('Melee');
                              if (activeActionCategory === 'ranged') return item.type.includes('Ranged');
                              return false;
                            })
                            .map((weapon) => {
                              const isMelee = weapon.type.includes('Melee');
                              const char = isMelee ? 'WS' : 'BS';
                              const specificSkill = characterSkills.find(s => s.displayName.includes(weapon.name));
                              const basicSkill = characterSkills.find(s => s.displayName === (isMelee ? 'Melee (Basic)' : 'Ranged (Basic)'));
                              const skillToUse = specificSkill || basicSkill;
                              const rollLabel = skillToUse?.displayName ?? getCharacteristicLabel(char);
                              
                              const baseValue = (characterData.attributes as Record<string, number>)[char] || 0;
                              const strValue = (characterData.attributes as Record<string, number>)['S'] || 0;
                              const sb = Math.floor(strValue / 10);
                              const totalSkillValue = skillToUse ? baseValue + skillToUse.advances : baseValue;
                              
                               const weaponStats = getWeaponStats(weapon, rulesIndex);
                              const damageBonus = parseInt(weaponStats.damage.replace("+SB+", "")) || 0;
                              const weaponDamage = sb + (weaponStats.damage.includes("+SB") ? (damageBonus || (weaponStats.damage === "+SB" ? 0 : parseInt(weaponStats.damage.replace("+SB", "")) || 0)) : parseInt(weaponStats.damage) || 0);

                              const actions = isMelee ? [
                                { name: 'Attack', char, totalValue: totalSkillValue, modifier: 0, damage: weaponDamage, range: weaponStats.reach, properties: weaponStats.properties },
                                { name: 'Charge', char, totalValue: totalSkillValue, modifier: 20, damage: weaponDamage, range: weaponStats.reach, properties: weaponStats.properties.concat('Impact').filter((v, i, a) => a.indexOf(v) === i) },
                                { name: 'Parry', char, totalValue: totalSkillValue, modifier: 0, damage: 0, range: 'Personal', properties: ['Defensive'], bonuses: [{ label: 'Defensive', value: 1 }] },
                                { name: 'Feint', char, totalValue: totalSkillValue, modifier: 0, damage: 0, range: weaponStats.reach, properties: ['Mislead'] }
                              ] : [
                                { name: 'Attack', char, totalValue: totalSkillValue, modifier: 0, damage: weaponDamage, range: weaponStats.reach, properties: weaponStats.properties }
                              ];

                              const rangeValue = parseInt(weaponStats.reach);
                              const rangeBands = !isMelee && !isNaN(rangeValue) ? {
                                pb: Math.floor(rangeValue / 10),
                                s: Math.floor(rangeValue / 2),
                                a: rangeValue,
                                l: rangeValue * 2,
                                e: rangeValue * 3
                              } : null;

                              return (
                                <div key={weapon.name} className="wfrp-subpanel-shell flex flex-col">
                                  {isMelee ? (
                                    <>
                                      <div className="grid grid-cols-[60px_1fr_60px_80px_1fr] gap-2 lg:gap-4 px-4 py-1 bg-black/10 border-b border-white/5 items-center">
                                        <span className="wfrp-table-label col-span-2 text-left">{weapon.name}</span>
                                        <span className="wfrp-table-label text-left">Dmg</span>
                                        <span className="wfrp-table-label text-left">Reach</span>
                                        <span className="wfrp-table-label text-left">Properties</span>
                                      </div>

                                      <div className="divide-y divide-white/5">
                                        {actions.map((action, idx) => (
                                          <div key={idx} className="grid grid-cols-[60px_1fr_60px_80px_1fr] items-center gap-2 lg:gap-4 wfrp-table-row group">
                                            <div className="flex justify-center">
                                              <button 
                                                onClick={() => {
                                                  handleRoll(
                                                    { key: action.char, label: rollLabel },
                                                    action.damage,
                                                    { bonuses: action.bonuses, title: `${weapon.name} ${action.name}` },
                                                  );
                                                  if (action.modifier !== 0) {
                                                    setRollState(prev => ({ ...prev, modifier: action.modifier }));
                                                  }
                                                }}
                                                className="wfrp-roll-btn w-12"
                                                aria-label={`Roll ${action.name} with ${weapon.name}`}
                                              >
                                                {action.totalValue}
                                              </button>
                                            </div>
                                            <span 
                                              onClick={() => setActiveInfo({ type: 'attack', name: action.name, extra: { ...action, weaponName: weapon.name, weaponType: weapon.type } })}
                                              className="wfrp-skill-link truncate"
                                            >
                                              {action.name}
                                            </span>
                                            <div className="wfrp-list-cell-strong text-center font-mono">
                                              {action.damage === 0 ? '-' : `+${action.damage}`}
                                            </div>
                                            <div className="wfrp-list-cell-strong">{action.range}</div>
                                            <div className="flex w-full flex-wrap content-start items-center gap-x-1">
                                              {action.properties.map((prop, propIndex) => (
                                                <span key={prop} className="text-xs font-semibold text-gray-400">
                                                  <button 
                                                    onClick={() => {
                                                      setActiveInfo({ type: 'property', name: prop, extra: { weaponProperties: action.properties } });
                                                      setRollState(prev => ({ ...prev, characteristic: null }));
                                                    }}
                                                    className="cursor-pointer text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 rounded-sm"
                                                  >
                                                    {prop}
                                                  </button>
                                                  {propIndex < action.properties.length - 1 ? "," : ""}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="grid grid-cols-[60px_1fr_60px_32px_32px_32px_32px_32px_1fr] gap-2 px-4 py-1 bg-black/10 border-b border-white/5 items-center">
                                        <span className="wfrp-table-label col-span-2 text-left">{weapon.name}</span>
                                        <span className="wfrp-table-label text-left">Dmg</span>
                                        <span className="wfrp-table-label text-left">PB</span>
                                        <span className="wfrp-table-label text-left">S</span>
                                        <span className="wfrp-table-label text-left">A</span>
                                        <span className="wfrp-table-label text-left">L</span>
                                        <span className="wfrp-table-label text-left">E</span>
                                        <span className="wfrp-table-label text-left">Properties</span>
                                      </div>

                                      <div className="divide-y divide-white/5">
                                        {actions.map((action, idx) => (
                                          <div key={idx} className="grid grid-cols-[60px_1fr_60px_32px_32px_32px_32px_32px_1fr] items-center gap-2 wfrp-table-row group">
                                            <div className="flex justify-center">
                                              <button 
                                                onClick={() => {
                                                  handleRoll(
                                                    { key: action.char, label: rollLabel },
                                                    action.damage,
                                                    { bonuses: action.bonuses, title: `${weapon.name} ${action.name}` },
                                                  );
                                                  if (action.modifier !== 0) {
                                                    setRollState(prev => ({ ...prev, modifier: action.modifier }));
                                                  }
                                                }}
                                                className="wfrp-roll-btn w-12"
                                                aria-label={`Roll ${action.name} with ${weapon.name}`}
                                              >
                                                {action.totalValue}
                                              </button>
                                            </div>
                                            <span 
                                              onClick={() => setActiveInfo({ type: 'attack', name: action.name, extra: { ...action, weaponName: weapon.name, weaponType: weapon.type } })}
                                              className="wfrp-skill-link truncate"
                                            >
                                              {action.name}
                                            </span>
                                            <div className="wfrp-list-cell-strong text-center font-mono">
                                              {action.damage === 0 ? '-' : `+${action.damage}`}
                                            </div>
                                            <div className="wfrp-list-cell-strong text-center font-mono opacity-50">{rangeBands?.pb ?? "-"}</div>
                                            <div className="wfrp-list-cell-strong text-center font-mono opacity-70">{rangeBands?.s ?? "-"}</div>
                                            <div className="wfrp-list-cell-strong text-center font-mono text-wfrp-gold">{rangeBands?.a ?? "-"}</div>
                                            <div className="wfrp-list-cell-strong text-center font-mono opacity-70">{rangeBands?.l ?? "-"}</div>
                                            <div className="wfrp-list-cell-strong text-center font-mono opacity-50">{rangeBands?.e ?? "-"}</div>
                                            <div className="flex w-full flex-wrap content-start items-center gap-x-1">
                                              {action.properties.map((prop, propIndex) => (
                                                <span key={prop} className="text-xs font-semibold text-gray-400">
                                                  <button 
                                                    onClick={() => {
                                                      setActiveInfo({ type: 'property', name: prop, extra: { weaponProperties: action.properties } });
                                                      setRollState(prev => ({ ...prev, characteristic: null }));
                                                    }}
                                                    className="cursor-pointer text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 rounded-sm"
                                                  >
                                                    {prop}
                                                  </button>
                                                  {propIndex < action.properties.length - 1 ? "," : ""}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          }
                          
                          {/* Universal Maneuvers */}
                          {(activeActionCategory === 'all' || activeActionCategory === 'other') && (
                            <div className="wfrp-subpanel-shell flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                               <div className="grid grid-cols-[60px_1fr_60px_80px_1fr] gap-2 lg:gap-4 px-4 py-1 bg-black/10 border-b border-white/5 items-center">
                                 <span className="wfrp-table-label col-span-2 text-left">Maneuvers</span>
                                 <span className="wfrp-table-label text-left">Dmg</span>
                                 <span className="wfrp-table-label text-left">Reach</span>
                                 <span className="wfrp-table-label text-left">Notes</span>
                               </div>

                               <div className="divide-y divide-white/5">
                                 {[
                                   { name: 'Move', char: 'Ag', range: `${characterData.move}`, properties: [], modifier: 0, damage: '-', type: 'other' },
                                   { name: 'Brace', char: 'S', range: '-', properties: ['Defensive Stance'], modifier: 0, damage: '-', type: 'other' },
                                   { name: 'Disengage', char: 'Ag', range: '-', properties: ['Retreat'], modifier: 0, damage: '-', type: 'other' },
                                   { name: 'Grapple', char: 'WS', range: 'Reach', properties: ['Stun'], modifier: 0, damage: 'SB', type: 'melee' }
                                 ]
                                 .filter(a => activeActionCategory === 'all' || a.type === activeActionCategory)
                                 .map((action) => {
                                   const baseValue = (characterData.attributes as Record<string, number>)[action.char] || 0;
                                   const skill = characterSkills.find(s => s.displayName.includes(action.name));
                                   const totalValue = skill ? baseValue + skill.advances : baseValue;
                                   const strValue = (characterData.attributes as Record<string, number>)['S'] || 0;
                                   const sb = Math.floor(strValue / 10);
                                   const finalDamage = action.damage === 'SB' ? `+${sb}` : action.damage;

                                   return (
                                     <div key={action.name} className="grid grid-cols-[60px_1fr_60px_80px_1fr] items-center gap-2 lg:gap-4 wfrp-table-row group">
                                       <div className="flex justify-center">
                                         <button 
                                           onClick={() => {
                                             handleRoll({ key: action.char, label: action.name }, typeof action.damage === 'number' ? action.damage : (action.damage === 'SB' ? sb : undefined));
                                             if (action.modifier !== 0) {
                                               setRollState(prev => ({ ...prev, modifier: action.modifier }));
                                             }
                                           }}
                                           className="wfrp-roll-btn w-12"
                                            aria-label={`Execute ${action.name}`}
                                          >
                                            {totalValue}
                                          </button>
                                       </div>
                                       <span 
                                         onClick={() => setActiveInfo({ type: 'attack', name: action.name, extra: { ...action, totalValue, damage: finalDamage, properties: action.properties } })}
                                         className="wfrp-skill-link truncate"
                                       >
                                         {action.name}
                                       </span>
                                       <div className="wfrp-list-cell-strong text-center font-mono">{finalDamage}</div>
                                       <div className="wfrp-list-cell-strong">{action.range}</div>
                                       <div className="flex w-full flex-wrap content-start items-center gap-x-1">
                                         {action.properties.map((prop, propIndex) => (
                                           <span key={prop} className="text-xs font-semibold text-gray-400">
                                             <button 
                                               onClick={() => {
                                                 setActiveInfo({ type: 'property', name: prop });
                                                 setRollState(prev => ({ ...prev, characteristic: null }));
                                               }}
                                               className="cursor-pointer text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 rounded-sm"
                                             >
                                               {prop}
                                             </button>
                                             {propIndex < action.properties.length - 1 ? "," : ""}
                                           </span>
                                         ))}
                                       </div>
                                     </div>
                                   );
                                 })}
                               </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeMainTab === 'spells' && (
                       <div className="flex flex-col h-full overflow-hidden">
                          <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            <div className="wfrp-subpanel-shell flex flex-col overflow-hidden">
                              <div className="grid grid-cols-[minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px_72px] gap-2 lg:gap-4 px-4 py-1 bg-black/10 border-b border-white/5 items-center">
                                <span className="wfrp-table-label text-left">Spell</span>
                                <span className="wfrp-table-label text-center">CN</span>
                                <span className="wfrp-table-label text-left">Range</span>
                                <span className="wfrp-table-label text-left">Target</span>
                                <span className="wfrp-table-label text-left">Duration</span>
                                <span className="wfrp-table-label text-center">Channel</span>
                              </div>

                              <div className="flex flex-col divide-y divide-white/5">
                                {characterData.spells.map((spell: any) => {
                                  const baseWP = (characterData.attributes as Record<string, number>)['WP'] || 0;
                                  const chnSkill = characterSkills.find(s => s.baseName === 'Channelling');
                                  const skillValue = chnSkill ? baseWP + chnSkill.advances : baseWP;
                                  const spellRange = formatSpellRange(spell.range);
                                  const spellTarget = formatSpellTarget(spell.target);

                                  return (
                                    <div
                                      key={spell.name}
                                      className="grid grid-cols-[minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px_72px] gap-2 lg:gap-4 px-4 py-2 items-center"
                                    >
                                      <button
                                        onClick={() => {
                                          setActiveInfo({ type: 'spell', name: spell.name, extra: { ...spell, range: spellRange, target: spellTarget } });
                                          setRollState(prev => ({ ...prev, characteristic: null }));
                                        }}
                                        className="wfrp-skill-link truncate text-left"
                                      >
                                        {spell.name}
                                      </button>

                                      <div className="wfrp-list-cell-strong text-center">
                                        {spell.cn}
                                      </div>

                                      <div className="wfrp-list-cell-strong truncate">
                                        {spellRange}
                                      </div>

                                      <div className="wfrp-list-cell-strong truncate">
                                        {spellTarget}
                                      </div>

                                      <div className="wfrp-list-cell-strong">
                                        {spell.duration}
                                      </div>

                                      <div className="flex justify-center">
                                        <button
                                          onClick={() => {
                                            handleRoll({ key: 'WP', label: spell.name }, undefined, { testType: 'channeling' });
                                          }}
                                          className="wfrp-roll-btn w-12"
                                          aria-label={`Channel ${spell.name}`}
                                        >
                                          {skillValue}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                    )}
                    {activeMainTab === 'inventory' && (
                      <div className="flex flex-col h-full overflow-hidden">
                        <div className="px-4 py-2 border-b border-white/5 bg-black/10">
                          <div className="flex items-center justify-between gap-4">
                            <span className="wfrp-table-label">Coin</span>
                            <span className="wfrp-list-cell-strong font-mono">
                              {formatCharacterCoins(characterData.coins)}
                            </span>
                          </div>
                        </div>

                        <div className="px-4 py-3 border-b border-white/5 bg-black/20">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-1 flex-col gap-1">
                              <div className="flex justify-between items-end leading-none">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                                  Encumbrance
                                </span>
                                <span className="text-[10px] font-bold text-gray-200 font-mono">
                                  {totalEncumbrance} / {carryCapacity}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-[#303030] rounded-full overflow-hidden shadow-inner">
                                <div
                                  className={`h-full transition-all duration-500 ease-out ${
                                    totalEncumbrance > carryCapacity
                                      ? "bg-wfrp-red"
                                      : "bg-wfrp-gold"
                                  }`}
                                  style={{ width: `${encumbrancePercent}%` }}
                                  role="progressbar"
                                  aria-valuenow={totalEncumbrance}
                                  aria-valuemin={0}
                                  aria-valuemax={carryCapacity}
                                  aria-label="Current encumbrance"
                                />
                              </div>
                            </div>
                            <button
                              className="wfrp-action-btn h-8 px-3 text-[10px] font-black uppercase tracking-widest text-gray-300 shrink-0"
                              aria-label="Open shop"
                            >
                              Shop
                            </button>
                          </div>
                        </div>

                        {/* List Headers */}
                        <div className="grid grid-cols-[1fr_140px_60px_60px_80px] gap-2 lg:gap-4 wfrp-list-header">
                          <span className="text-left">Item</span>
                          <span className="text-left">Type</span>
                          <span className="text-center">Enc</span>
                          <span className="text-center">Value</span>
                          <span className="text-right">Action</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-4">
                          {[
                            { title: 'Carried', items: carriedItems, alwaysVisible: carriedItems.length > 0 },
                            ...containers.map((container) => ({
                              title: container.name,
                              subtitle: `${getContainerUsedEncumbrance(container.id)} / ${container.carries ?? 0} enc`,
                              items: getContainerContents(container.id),
                              alwaysVisible: true,
                            })),
                          ]
                            .filter((section) => section.alwaysVisible)
                            .map((section) => (
                            <div key={section.title} className="wfrp-subpanel-shell">
                               <h3 className="wfrp-list-group">
                                  <span>{section.title}</span>
                                  {"subtitle" in section && section.subtitle ? (
                                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-600">
                                      {section.subtitle}
                                    </span>
                                  ) : null}
                                  <div className="wfrp-panel-rule" />
                               </h3>
                               {section.items.map((item: any) => (
                                <div key={item.id} className="wfrp-table-row flex border-0 group">
                                  <div className="flex-1 grid grid-cols-[1fr_140px_60px_60px_80px] gap-2 lg:gap-4 items-center">
                                    <div className="flex flex-col">
                                      <span 
                                        onClick={() => {
                                          setActiveInfo({ type: 'equipment', name: item.name });
                                          setRollState(prev => ({ ...prev, characteristic: null }));
                                        }}
                                        className="wfrp-skill-link flex items-center gap-1.5"
                                      >
                                        {item.name}
                                        {item.equipped && !item.containerId && (
                                          <span className="w-1 h-1 rounded-full bg-wfrp-gold shadow-[0_0_4px_rgba(212,175,55,0.6)]" />
                                        )}
                                      </span>
                                    </div>

                                    <div className="wfrp-list-cell-strong truncate">
                                      {item.type}
                                    </div>

                                    <div className="wfrp-list-cell-strong text-center font-mono">
                                      {item.encumbrance || '-'}
                                    </div>

                                    <div className="wfrp-list-cell-strong text-center font-mono">
                                      {formatItemValue(item)}
                                    </div>

                                    <div className="relative flex justify-end pr-1">
                                      <button
                                        onClick={(event) => handleToggleInventoryMenu(item.id, event)}
                                        className="flex h-8 w-8 items-center justify-center rounded text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                                        aria-label={`Open actions for ${item.name}`}
                                      >
                                        <MoreHorizontal size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {section.items.length === 0 && (
                                <div className="px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-700">
                                  Empty
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {activeInventoryMenu && (
                          <div
                            ref={inventoryMenuRef}
                            className="fixed z-50 min-w-[136px] overflow-hidden rounded-lg border border-white/10 bg-[#141414] shadow-xl"
                            style={{ top: activeInventoryMenu.top, left: activeInventoryMenu.left }}
                          >
                            {(() => {
                              const activeItem = equipmentState.find((item) => item.id === activeInventoryMenu.id);
                              if (!activeItem) return null;

                              const stowableContainers = equipmentState.filter(
                                (item) =>
                                  item.type === "Container" &&
                                  item.id !== activeItem.id &&
                                  canStoreInContainer(activeItem.id, item.id),
                              );

                              return (
                                <>
                                  {(activeItem.type.includes('Weapon') || activeItem.type.includes('Armor')) && (
                                    <button
                                      onClick={() => {
                                        handleToggleEquip(activeItem.id);
                                        setActiveInventoryMenu(null);
                                      }}
                                      className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/5 hover:text-wfrp-gold transition-colors"
                                    >
                                      {activeItem.equipped ? 'Unequip' : 'Equip'}
                                    </button>
                                  )}
                                  {activeItem.containerId && (
                                    <button
                                      onClick={() => handleCarryItem(activeItem.id)}
                                      className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/5 hover:text-wfrp-gold transition-colors"
                                    >
                                      Carry on Person
                                    </button>
                                  )}
                                  {!activeItem.containerId &&
                                    stowableContainers.map((container) => (
                                      <button
                                        key={container.id}
                                        onClick={() => handleStoreItem(activeItem.id, container.id)}
                                        className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/5 hover:text-wfrp-gold transition-colors"
                                      >
                                        Stow in {container.name}
                                      </button>
                                    ))}
                                  <button
                                    onClick={() => handleDropItem(activeItem.id)}
                                    className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/5 hover:text-wfrp-red transition-colors"
                                  >
                                    Drop
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeMainTab === 'features' && (
                      <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {characterTalents.map((item) => (
                        <div key={item.name} className="wfrp-table-row flex justify-between group">
                           <span 
                              onClick={() => {
                                openTalentInfo(item.name);
                              }}
                              className="wfrp-skill-link"
                            >
                              {item.name}
                            </span>
                          <Info size={14} className="text-gray-700 group-hover:text-wfrp-gold transition-colors" />
                        </div>
                      ))}
                      </div>
                    )}

                    {activeMainTab === 'career' && (
                      <div className="flex flex-col h-full min-h-0">
                        <div className="sticky top-0 z-10 flex items-center gap-2 p-3 lg:p-4 bg-[#0c0c0c] border-b border-white/5 overflow-x-auto no-scrollbar">
                          {[
                            { id: 'all', label: 'All' },
                            { id: 'careers', label: 'Careers' },
                            { id: 'characteristics', label: 'Characteristics' },
                            { id: 'skills', label: 'Skills' },
                            { id: 'talents', label: 'Talents' },
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setActiveCareerSubtab(option.id as CareerSubtab)}
                              className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
                                activeCareerSubtab === option.id
                                  ? 'bg-[#333] text-white shadow-lg'
                                  : 'bg-black/40 text-gray-400 hover:bg-[#222] hover:text-gray-200'
                              }`}
                              aria-pressed={activeCareerSubtab === option.id}
                            >
                              {option.label}
                            </button>
                          ))}
                          <div className="ml-auto flex-shrink-0">
                            <button
                              onClick={saveCareerChanges}
                              disabled={!hasPendingCareerChanges}
                              className="wfrp-action-btn h-8 px-3 text-[10px] font-black uppercase tracking-widest text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Save career changes"
                            >
                              Save
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 no-scrollbar">
                          {(activeCareerSubtab === 'all' || activeCareerSubtab === 'careers') && (
                            <AdvancementSection title="Careers" meta="Current Path">
                            <div className="wfrp-subpanel-shell flex flex-col">
                              <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_62px_74px] gap-2 lg:gap-4 items-center">
                                <span className="wfrp-table-label text-left">Careers</span>
                                <span className="wfrp-table-label text-left">Tier</span>
                                <span className="wfrp-table-label text-center">Cost</span>
                                <span className="wfrp-table-label text-right">Advance</span>
                              </div>
                              <div className="divide-y divide-white/5">
                                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_62px_74px] items-center gap-2 lg:gap-4 wfrp-table-row">
                                  <div className="min-w-0">
                                    <p className="wfrp-list-cell-strong truncate">
                                      {characterData.career} {toRoman(displayedCareerRank)}
                                    </p>
                                  </div>
                                  <div className="wfrp-list-cell-strong text-left truncate">
                                    {displayedCareerRankRecord?.name ?? characterData.tier}
                                  </div>
                                  <div className="wfrp-list-cell-strong text-center font-mono">
                                    -
                                  </div>
                                  <div className="flex justify-end gap-1">
                                    <button
                                      onClick={decreasePendingCareerRank}
                                      disabled={pendingCareerRank === null}
                                      className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed"
                                      aria-label={`Decrease career rank for ${characterData.career}`}
                                    >
                                      <Minus size={10} />
                                    </button>
                                    <button
                                      onClick={increasePendingCareerRank}
                                      disabled={!nextCareerRankRecord}
                                      className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed"
                                      aria-label={`Increase career rank for ${characterData.career}`}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            </AdvancementSection>
                          )}

                          {(activeCareerSubtab === 'all' || activeCareerSubtab === 'characteristics') && (
                            <AdvancementSection title="Characteristics" meta="Scaffolded">
                            <div className="wfrp-subpanel-shell flex flex-col">
                              <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_64px_62px_74px] gap-2 lg:gap-4 items-center">
                                <span className="wfrp-table-label text-left">Characteristics</span>
                                <span className="wfrp-table-label text-center">Current</span>
                                <span className="wfrp-table-label text-center">Cost</span>
                                <span className="wfrp-table-label text-right">Advance</span>
                              </div>
                              <div className="divide-y divide-white/5">
                                {advancementCharacteristics.map((item) => (
                                  <div
                                    key={item.key}
                                    className="grid grid-cols-[minmax(0,1fr)_64px_62px_74px] items-center gap-2 lg:gap-4 wfrp-table-row"
                                  >
                                    <div className="min-w-0">
                                      <p className="wfrp-list-cell-strong truncate">{item.label}</p>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        {item.key}
                                      </p>
                                    </div>
                                    <div className="wfrp-list-cell-strong text-center font-mono">
                                      {item.value}
                                    </div>
                                    <div className="wfrp-list-cell-strong text-center font-mono">
                                      -
                                    </div>
                                    <div className="flex justify-end gap-1">
                                      <button
                                        disabled
                                        className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed"
                                        aria-label={`Decrease ${item.label}`}
                                      >
                                        <Minus size={10} />
                                      </button>
                                      <button
                                        disabled
                                        className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed"
                                        aria-label={`Increase ${item.label}`}
                                      >
                                        <Plus size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="wfrp-subpanel-header border-t border-b-0 py-3">
                                <p className="wfrp-panel-copy">
                                  Characteristic purchases are scaffolded next.
                                </p>
                              </div>
                            </div>
                            </AdvancementSection>
                          )}

                          {(activeCareerSubtab === 'all' || activeCareerSubtab === 'skills') && (
                            <AdvancementSection title="Skills">
                            <div className="wfrp-subpanel-shell flex flex-col">
                              <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_62px_62px_74px] gap-2 lg:gap-4 items-center">
                                <span className="wfrp-table-label text-left">Skills</span>
                                <span className="wfrp-table-label text-center">Advances</span>
                                <span className="wfrp-table-label text-center">Cost</span>
                                <span className="wfrp-table-label text-right">Advance</span>
                              </div>
                              <div className="divide-y divide-white/5">
                                {advancementSkillNames.map((skillName) => {
                                  const skill = characterSkills.find((entry) => entry.displayName === skillName);
                                  const pendingAdvances = pendingSkillAdvances[skillName] ?? 0;
                                  const baseAdvances = skill?.advances ?? 0;
                                  const nextSkillCost = getAdvanceCost(baseAdvances + pendingAdvances);
                                  const isCareerSkill = careerAdvancementData.skills.includes(skillName);
                                  const canPurchase = isCareerSkill && pendingAvailableXp >= nextSkillCost;
                                  const advancesDisplay =
                                    baseAdvances === 0
                                      ? pendingAdvances > 0
                                        ? `+${pendingAdvances}`
                                        : '-'
                                      : `${baseAdvances}${pendingAdvances > 0 ? ` +${pendingAdvances}` : ''}`;

                                  return (
                                    <div
                                      key={skillName}
                                      className={`grid grid-cols-[minmax(0,1fr)_62px_62px_74px] items-center gap-2 lg:gap-4 wfrp-table-row group ${
                                        !isCareerSkill ? 'opacity-70' : ''
                                      }`}
                                    >
                                      <div className="min-w-0">
                                        <button
                                          onClick={() => {
                                            setActiveInfo({ type: 'skill', name: skillName });
                                            setRollState(prev => ({ ...prev, characteristic: null }));
                                          }}
                                          className="wfrp-skill-link truncate text-left"
                                        >
                                          {skillName}
                                        </button>
                                      </div>
                                      <div className="wfrp-list-cell-strong text-center font-mono">
                                        {advancesDisplay}
                                      </div>
                                      <div className="wfrp-list-cell-strong text-center font-mono">
                                        {isCareerSkill ? nextSkillCost : '-'}
                                      </div>
                                      <div className="flex justify-end gap-1">
                                        <button
                                          onClick={() => removePendingSkillAdvance(skillName)}
                                          disabled={pendingAdvances === 0 || !isCareerSkill}
                                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed hover:text-wfrp-red focus-visible:ring-wfrp-red/50"
                                          aria-label={`Decrease skill advances for ${skillName}`}
                                        >
                                          <Minus size={10} />
                                        </button>
                                        <button
                                          onClick={() => purchaseSkillAdvance(skillName)}
                                          disabled={!canPurchase}
                                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed hover:text-green-600 focus-visible:ring-green-600/50"
                                          aria-label={`Advance skill ${skillName}`}
                                        >
                                          <Plus size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            </AdvancementSection>
                          )}

                          {(activeCareerSubtab === 'all' || activeCareerSubtab === 'talents') && (
                            <AdvancementSection title="Talents" meta={`${TALENT_PURCHASE_COST} XP`}>
                            <div className="wfrp-subpanel-shell flex flex-col">
                              <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_72px_62px_74px] gap-2 lg:gap-4 items-center">
                                <span className="wfrp-table-label text-left">Talents</span>
                                <span className="wfrp-table-label text-center">Status</span>
                                <span className="wfrp-table-label text-center">Cost</span>
                                <span className="wfrp-table-label text-right">Advance</span>
                              </div>
                              <div className="divide-y divide-white/5">
                                {advancementTalentNames.map((talentName) => {
                                  const hasTalent = characterTalents.some((talent) => talent.name === talentName);
                                  const isPending = pendingTalentPurchases.includes(talentName);
                                  const isCareerTalent = careerAdvancementData.talents.includes(talentName);
                                  const canPurchase = isCareerTalent && pendingAvailableXp >= TALENT_PURCHASE_COST && !hasTalent && !isPending;

                                  return (
                                    <div
                                      key={talentName}
                                      className={`grid grid-cols-[minmax(0,1fr)_72px_62px_74px] items-center gap-2 lg:gap-4 wfrp-table-row group ${
                                        !isCareerTalent && !hasTalent ? 'opacity-70' : ''
                                      }`}
                                    >
                                      <div className="min-w-0">
                                        <button
                                          onClick={() => openTalentInfo(talentName)}
                                          className="wfrp-skill-link truncate text-left"
                                        >
                                          {talentName}
                                        </button>
                                      </div>
                                      <div className="wfrp-list-cell-strong text-center font-mono">
                                        {hasTalent ? 'Owned' : isPending ? 'Pending' : isCareerTalent ? 'Open' : 'Locked'}
                                      </div>
                                      <div className="wfrp-list-cell-strong text-center font-mono">
                                        {isCareerTalent && !hasTalent ? TALENT_PURCHASE_COST : '-'}
                                      </div>
                                      <div className="flex justify-end gap-1">
                                        <button
                                          onClick={() => removePendingTalentPurchase(talentName)}
                                          disabled={!isPending}
                                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed hover:text-wfrp-red focus-visible:ring-wfrp-red/50"
                                          aria-label={`Decrease talent purchases for ${talentName}`}
                                        >
                                          <Minus size={10} />
                                        </button>
                                        <button
                                          onClick={() => purchaseTalent(talentName)}
                                          disabled={!canPurchase}
                                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed hover:text-green-600 focus-visible:ring-green-600/50"
                                          aria-label={`Purchase talent ${talentName}`}
                                        >
                                          <Plus size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            </AdvancementSection>
                          )}
                        </div>
                      </div>
                    )}

                    {activeMainTab === 'background' && (
                      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                        <div className="flex flex-col gap-2">
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-600 flex items-center gap-2">
                             Character Origin
                             <div className="h-px flex-1 bg-white/5" />
                           </h3>
                          <p className="text-sm text-gray-400 leading-relaxed">
                             Born in the bustling Reikland, Eldric served in the local militia during the recent border tensions. Trained with the halberd, he seeks more than just a soldier's pay.
                           </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-black/20 border border-white/5 p-3 rounded">
                             <span className="text-[7px] font-black uppercase text-gray-700 tracking-widest">Career Rank</span>
                             <p className="text-xs font-bold text-gray-300">Soldier (Tier 1)</p>
                           </div>
                           <div className="bg-black/20 border border-white/5 p-3 rounded">
                             <span className="text-[7px] font-black uppercase text-gray-700 tracking-widest">Status</span>
                             <p className="text-xs font-bold text-gray-300">Silver 3</p>
                           </div>
                        </div>
                      </div>
                    )}

                    {activeMainTab === 'notes' && (
                       <div className="flex-1 p-6 flex flex-col gap-4">
                          <div className="h-full border border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center text-gray-700 gap-2">
                             <span className="text-[9px] font-black uppercase tracking-widest">Campaign Journal</span>
                             <p className="text-[10px] italic">No active quest entries found.</p>
                          </div>
                        </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>
        </main>

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
                    className="wfrp-icon-btn p-1 rounded-full hover:bg-[#303030] cursor-pointer"
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
                            {item.target - item.modifier}
                          </span>
                          <div />

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
                        <div className="flex flex-row items-center gap-2">
                          {canRollCritical && (
                            <button
                              onClick={handleRollCritical}
                              className="wfrp-action-btn px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                            >
                              Roll Critical
                            </button>
                          )}
                          {canUseFortuneActions && (
                            <>
                              <button
                                onClick={handleReroll}
                                className="wfrp-action-btn px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                              >
                                Reroll
                              </button>
                              <button
                                onClick={handleAddSl}
                                className="wfrp-action-btn px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                              >
                                +1 SL
                              </button>
                            </>
                          )}
                          {canUseResilienceAction && canUseFortuneActions && (
                            <details className="relative ml-auto">
                              <summary className="flex h-[34px] w-[20px] list-none items-center justify-center px-0 py-0 text-gray-400 transition-colors marker:content-none hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-0">
                                <MoreHorizontal size={16} />
                              </summary>
                              <div className="absolute right-0 top-full z-10 mt-2 min-w-max rounded-lg border border-white/10 bg-[#141414] p-1 shadow-xl">
                                <button
                                  onClick={handleIWillNotFail}
                                  className="wfrp-action-btn w-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                                >
                                  I Will Not Fail!
                                </button>
                              </div>
                            </details>
                          )}
                          {canUseResilienceAction && !canUseFortuneActions && (
                            <button
                              onClick={handleIWillNotFail}
                              className="wfrp-action-btn px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                            >
                              I Will Not Fail!
                            </button>
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

        <AnimatePresence mode="wait">
          {activeInfo && (
            <motion.aside 
              key="info-sidebar"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="wfrp-sidebar-shell w-[400px]"
            >
                <div className="wfrp-sidebar-header p-4">
                  <div className="flex flex-col">
                    <h2 className="wfrp-sidebar-title text-sm uppercase tracking-widest text-wfrp-gold">
                      {activeInfo.type === 'skill' ? 'Skill Compendium' : 
                       activeInfo.type === 'talent' ? 'Talent Ledger' :
                       activeInfo.type === 'equipment' ? 'Equipment Manifest' : 
                       activeInfo.type === 'property' ? 'Weapon Properties' : 
                       activeInfo.type === 'attack' ? 'Combat Action' : 'Grimoire'}
                    </h2>
                    <span className="wfrp-sidebar-kicker">Knowledge is power</span>
                  </div>
                  <button 
                    onClick={() => setActiveInfo(null)}
                    className="wfrp-icon-btn p-1 rounded-full hover:bg-[#303030]"
                    aria-label="Close sidebar"
                  >
                    <X size={20} className="cursor-pointer" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto scroll-smooth pb-20 no-scrollbar">
                  {activeInfo.type === 'attack' && (
                    <div className="p-6 flex flex-col gap-8">
                       <div className="wfrp-subpanel rounded-lg p-5 flex flex-col gap-5">
                         <div className="flex flex-col gap-1">
                           <h3 className="wfrp-sidebar-title text-xl">{activeInfo.name}</h3>
                           <span className="wfrp-sidebar-section border-white/5 text-gray-500">
                             {activeInfo.extra?.weaponName || "Combat Action"}
                           </span>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <p className="wfrp-sidebar-label">Type</p>
                             <p className="wfrp-sidebar-body font-bold text-gray-200">
                               {activeInfo.extra?.weaponType || "Action"}
                             </p>
                           </div>
                           <div>
                             <p className="wfrp-sidebar-label">Roll</p>
                             <p className="wfrp-sidebar-body font-bold text-gray-200">
                               {activeInfo.extra?.totalValue ?? "-"}
                             </p>
                           </div>
                           {activeInfo.extra?.range && (
                             <div>
                               <p className="wfrp-sidebar-label">Reach</p>
                               <p className="wfrp-sidebar-body font-bold text-gray-200">
                                 {activeInfo.extra.range}
                               </p>
                             </div>
                           )}
                           {activeInfo.extra?.damage !== undefined && (
                             <div>
                               <p className="wfrp-sidebar-label">Damage</p>
                               <p className="wfrp-sidebar-body font-bold text-gray-200">
                                 {activeInfo.extra.damage}
                               </p>
                             </div>
                           )}
                         </div>

                         <p className="wfrp-sidebar-body">
                            "{rulesIndex.actionDescriptionByName[activeInfo.name] || "A standard combat maneuver. Consult the WFRP Core Rulebook for deep tactical situational rules."}"
                         </p>
                       </div>

                       <div className="flex flex-col gap-4">
                          <h4 className="wfrp-panel-title">
                             Rule-Book Properties
                             <div className="h-px flex-1 bg-white/5" />
                          </h4>
                          <div className="flex flex-col gap-2">
                             {activeInfo.extra.properties.map((prop: string) => (
                                <button 
                                   key={prop}
                                   onClick={() => setActiveInfo({ type: 'property', name: prop })}
                                   className="flex flex-col gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-lg text-left group hover:border-wfrp-gold/40 hover:bg-white/[0.04] transition-all cursor-pointer shadow-inner"
                                >
                                   <div className="flex items-center justify-between">
                                      <span className="wfrp-sidebar-body font-bold text-gray-300 group-hover:text-wfrp-gold transition-colors">{prop}</span>
                                   </div>
                                   <p className="wfrp-sidebar-body text-gray-500 line-clamp-2">
                                      {rulesIndex.propertyDescriptionByName[prop] || "No sanctioned rules found for this property."}
                                   </p>
                                </button>
                             ))}
                             {activeInfo.extra.properties.length === 0 && (
                                <p className="text-[10px] text-gray-700 italic px-2">No special properties apply to this standard action.</p>
                             )}
                          </div>
                       </div>
                    </div>
                  )}

                  {activeInfo.type === 'property' && Object.entries(rulesIndex.propertyDescriptionByName)
                    .filter(([name]) => activeInfo.extra?.weaponProperties ? activeInfo.extra.weaponProperties.includes(name) : true)
                    .sort((a,b) => a[0].localeCompare(b[0]))
                    .map(([name, desc]) => (
                    <div 
                      key={name} 
                      ref={el => { propertyListRefs.current[name] = el; }}
                      className={`p-5 border-b border-white/5 transition-all ${activeInfo.name === name ? 'bg-wfrp-gold/5' : ''}`}
                    >
                      <div className="flex flex-col">
                        <h3 className={`text-[11px] font-black uppercase tracking-widest mb-1 ${activeInfo.name === name ? 'text-wfrp-gold' : 'text-gray-300'}`}>{name}</h3>
                        <p className="wfrp-sidebar-body">
                          "{desc}"
                        </p>
                      </div>
                    </div>
                  ))}

                  {activeInfo.type === 'skill' && [...characterSkills].sort((a,b) => a.name.localeCompare(b.name)).map((skill) => {
                    const charValue = (characterData.attributes as Record<string, number>)[skill.characteristic] || 0;
                    const totalValue = charValue + skill.advances;
                    
                    return (
                      <div 
                      key={getCharacterSkillKey(skill)}
                      ref={el => { skillListRefs.current[skill.displayName] = el; }}
                        className="transition-colors p-4 border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex flex-col">
                            <h3 className="wfrp-sidebar-title text-base uppercase tracking-tight text-white mb-0.5">{skill.displayName}</h3>
                            <div className="flex items-center gap-2">
                               <span className="wfrp-sidebar-label">{skill.characteristic}</span>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 pt-1">
                             <button 
                               onClick={() => {
                                 const updatedSkills = characterSkills.map(s => 
                                   getCharacterSkillKey(s) === getCharacterSkillKey(skill) ? { ...s, advances: s.advances + 1 } : s
                                 );
                                 setCharacterSkills(updatedSkills);
                               }}
                               className="wfrp-mini-action-btn"
                             >
                               +1
                             </button>
                             <button 
                               onClick={() => {
                                 const updatedSkills = characterSkills.map(s => 
                                   getCharacterSkillKey(s) === getCharacterSkillKey(skill) ? { ...s, advances: s.advances + 10 } : s
                                 );
                                 setCharacterSkills(updatedSkills);
                               }}
                               className="wfrp-mini-action-btn"
                             >
                               +10
                             </button>
                          </div>
                        </div>

                        <p className="wfrp-sidebar-body pr-2">
                          {rulesIndex.skillDescriptionByName[skill.displayName] || "Detailed rules for this skill can be found in the WFRP Core Rulebook."}
                        </p>
                      </div>
                    );
                  })}

                   {activeInfo.type === 'spell' && (
                     <div className="p-6 flex flex-col gap-8">
                        <div className="flex flex-col">
                          <h3 className="wfrp-sidebar-title text-2xl mb-1">{activeInfo.name}</h3>
                          <span className="wfrp-sidebar-section mb-6">Grimoire Entry</span>
                          
                          <div className="wfrp-subpanel rounded space-y-4 p-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                   <p className="wfrp-sidebar-label">CN</p>
                                   <p className="wfrp-sidebar-body font-bold text-gray-200">{activeInfo.extra?.cn}</p>
                                </div>
                                <div>
                                   <p className="wfrp-sidebar-label">Duration</p>
                                   <p className="wfrp-sidebar-body font-bold text-gray-200">{activeInfo.extra?.duration}</p>
                                </div>
                                <div>
                                   <p className="wfrp-sidebar-label">Range</p>
                                   <p className="wfrp-sidebar-body font-bold text-gray-200">{activeInfo.extra?.range}</p>
                                </div>
                                <div>
                                   <p className="wfrp-sidebar-label">Target</p>
                                   <p className="wfrp-sidebar-body font-bold text-gray-200">{activeInfo.extra?.target}</p>
                                </div>
                             </div>

                             <div className="h-px bg-white/5" />

                             <p className="wfrp-sidebar-body">
                                "{activeInfo.extra?.description || "A standard spell. Consult the WFRP Core Rulebook for deep tactical situational rules."}"
                             </p>
                          </div>
                        </div>
                     </div>
                   )}

                    {activeInfo.type === 'talent' && characterTalents
                      .filter((talent) => talent.name === activeInfo.name)
                      .map((talent) => (
                      <div key={talent.name} className="p-4">
                         <h3 className="wfrp-sidebar-title text-base uppercase tracking-tight text-white mb-2">{talent.name}</h3>
                         <p className="wfrp-sidebar-body">{talent.description}</p>
                      </div>
                    ))}
                    {activeInfo.type === 'talent' && !characterTalents.some((talent) => talent.name === activeInfo.name) && (
                      <div className="p-4">
                        <h3 className="wfrp-sidebar-title text-base uppercase tracking-tight text-white mb-2">{activeInfo.name}</h3>
                        <p className="wfrp-sidebar-body">
                          {activeInfo.extra?.description || "This talent is available through advancement, but it is not yet owned by the character."}
                        </p>
                      </div>
                    )}

                    {activeInfo.type === 'equipment' && characterData.equipment.map((item) => (
                      <div key={item.name} className="p-4">
                         <div className="flex items-center justify-between mb-1">
                           <h3 className="wfrp-sidebar-title text-base uppercase tracking-tight text-white">{item.name}</h3>
                           <span className="wfrp-sidebar-label">{item.type}</span>
                         </div>
                         <p className="wfrp-sidebar-body">{item.description}</p>
                      </div>
                    ))}
                </div>
            </motion.aside>
          )}
        </AnimatePresence>
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
