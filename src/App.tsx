/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Settings,
  MoreHorizontal,
  Trash2,
  X,
  Dice5
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRef } from "react";
import { CharacterHeader } from "./components/CharacterHeader";
import { InfoSidebar } from "./components/InfoSidebar";
import { ShopSidebar } from "./components/ShopSidebar";
import { SpellShopSidebar } from "./components/SpellShopSidebar";
import type { ActiveInfoState } from "./components/appTypes";
import { GameSessionProvider, useGameSessionContext } from "./context/GameSessionContext";
import type {
  ResolvedCharacterEquipment,
  ResolvedCharacterSkill,
  ResolvedCharacterTalent,
} from "./data/characters/resolved";
import { listCharacters } from "./data/repository";
import { skillCharacteristicById } from "./data/rules/wfrp4e";
import {
  formatCharacterCoins,
  formatItemValue,
  getCharacterSkillKey,
  getWeaponStats,
} from "./lib/gameSession";
import {
  formatTalentEffect,
  getApplicableTalentEffects,
  getTalentSlBonus,
} from "./lib/talentEffects";
import { UI_LABELS } from "./labels";
import type { ArmourDefinition, ArmourLocation, Characteristic, Ruleset, SkillDefinition } from "./types";
import type { ItemDefinition, SpellDefinition } from "./types";

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
  mode: "move" | "drop";
  top: number;
  left: number;
}

type InventoryDropTargetId = "carried" | string;

interface InventoryDragState {
  itemId: string;
}

type ResourceCounterBarProps = {
  label: string;
  current: number;
  max: number;
  onAdjust: (delta: number) => void;
  barClassName: string;
  counterToneClassName: string;
  minusRingClassName: string;
  plusRingClassName: string;
  contentClassName?: string;
};

type HeaderResourceSliderProps = {
  label: string;
  current: number;
  max: number;
  onAdjust: (delta: number) => void;
  barClassName: string;
  contentClassName?: string;
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
type SkillSubtab = 'all' | 'advanced' | 'basic-trained' | 'basic-untrained';
type SpellSubtab = 'all' | 'petty' | 'arcane' | `school:${string}`;
type InventorySubtab = 'all' | 'wallet' | 'worn' | 'carried' | `container:${string}`;
type CoinKey = "gc" | "s" | "d";

const formatCoinTotalValue = (coins: { gc: number; s: number; d: number }) => {
  const totalBrass = coins.gc * 240 + coins.s * 12 + coins.d;
  const gc = Math.floor(totalBrass / 240);
  const remainingAfterGold = totalBrass % 240;
  const ss = Math.floor(remainingAfterGold / 12);
  const b = remainingAfterGold % 12;
  const parts = [
    gc > 0 ? `${gc}gc` : null,
    ss > 0 ? `${ss}ss` : null,
    b > 0 ? `${b}bp` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : "0bp";
};

const sortEquipmentByName = (items: ResolvedCharacterEquipment[]) =>
  [...items].sort((first, second) => {
    const nameComparison = first.name.localeCompare(second.name, undefined, {
      sensitivity: "base",
    });

    return nameComparison || first.id.localeCompare(second.id);
  });

const getConsumableCount = (item: ResolvedCharacterEquipment) => {
  if (item.type !== "Consumable") return null;

  const match = item.name.match(/\((\d+)\)\s*$/);
  return match ? Number(match[1]) : 1;
};

const getConsumableBaseName = (item: ResolvedCharacterEquipment) =>
  item.name.replace(/\s*\(\d+\)\s*$/, "");

const formatConsumableName = (item: ResolvedCharacterEquipment, count: number) =>
  `${getConsumableBaseName(item)} (${count})`;

const PACKS_AND_CONTAINERS_TYPE = "Packs and containers";

const isPacksAndContainersItem = (item: ResolvedCharacterEquipment) =>
  item.type === PACKS_AND_CONTAINERS_TYPE || item.type === "Container";

const isBackpackContainerItem = (item: ResolvedCharacterEquipment) =>
  isPacksAndContainersItem(item) &&
  (item.itemId === "backpack_item" || item.name.toLowerCase() === "backpack");

const isWearableInventoryItem = (item: ResolvedCharacterEquipment) =>
  item.type === "Clothing" ||
  item.type === "Jewellery" ||
  item.type === "Jewelry" ||
  item.type === "Armor" ||
  isBackpackContainerItem(item);

const isWornInventoryItem = (item: ResolvedCharacterEquipment) =>
  !item.containerId &&
  isWearableInventoryItem(item) &&
  (item.type !== "Armor" || item.equipped) &&
  (!isPacksAndContainersItem(item) || item.equipped);

const getInventoryEncumbrance = (item: ResolvedCharacterEquipment) => {
  const encumbrance = Number(item.encumbrance || 0);
  return isWornInventoryItem(item) ? Math.max(0, encumbrance - 1) : encumbrance;
};

type CareerSubtab = 'all' | 'careers' | 'characteristics' | 'skills' | 'talents';
type BuilderStepId =
  | "species"
  | "career"
  | "attributes"
  | "skills-talents"
  | "trappings"
  | "details"
  | "review"
  | "finish";

const builderSteps: Array<{ id: BuilderStepId; label: string; summary: string }> = [
  { id: "species", label: "Species", summary: "Choose or roll species and track any creation XP bonus." },
  { id: "career", label: "Class and Career", summary: "Pick the class, career path, and starting rank." },
  { id: "attributes", label: "Attributes", summary: "Generate characteristics and apply the chosen method." },
  { id: "skills-talents", label: "Skills and Talents", summary: "Select creation advances, talents, and required options." },
  { id: "trappings", label: "Trappings", summary: "Confirm starting equipment, coin, and containers." },
  { id: "details", label: "Details", summary: "Add appearance, background, ambitions, and party context." },
  { id: "review", label: "Review", summary: "Validate missing fields before creating the sheet." },
  { id: "finish", label: "Finish", summary: "Mark the builder complete and open the ready character sheet." },
];

const formatSpellSchoolLabel = (school: string) => {
  const normalizedSchool = school
    .replace(/^the\s+lore\s+of\s+/i, "")
    .replace(/^lore\s+of\s+/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const titledSchool = normalizedSchool
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return `The Lore of ${titledSchool}`;
};

function ResourceCounterBar({
  label,
  current,
  max,
  onAdjust,
  barClassName,
  counterToneClassName,
  minusRingClassName,
  plusRingClassName,
  contentClassName,
}: ResourceCounterBarProps) {
  const percent = max > 0 ? (current / max) * 100 : 0;
  const counterClassName = `text-[10px] font-bold ${counterToneClassName}`;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onAdjust(-1)}
        className={`wfrp-stepper-btn ${minusRingClassName}`}
        aria-label={`Decrease current ${label.toLowerCase()}`}
      >
        <Minus size={10} />
      </button>

      <div className={contentClassName ?? "flex w-24 flex-col gap-1 lg:w-36"}>
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
        className={`wfrp-stepper-btn ${plusRingClassName}`}
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
  contentClassName,
}: HeaderResourceSliderProps) {
  return (
    <ResourceCounterBar
      label={label}
      current={current}
      max={max}
      onAdjust={onAdjust}
      barClassName={barClassName}
      counterToneClassName="text-gray-200"
      minusRingClassName="focus-visible:ring-wfrp-red/50"
      plusRingClassName="focus-visible:ring-green-600/50"
      contentClassName={contentClassName}
    />
  );
}

function ScrollableTabStrip({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const element = stripRef.current;
    if (!element) return;

    const updateScrollState = () => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      setCanScrollLeft(element.scrollLeft > 4);
      setCanScrollRight(maxScrollLeft - element.scrollLeft > 4);
    };

    updateScrollState();
    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [children]);

  const scrollTabsLeft = () => {
    stripRef.current?.scrollBy({
      left: -Math.max(stripRef.current.clientWidth * 0.65, 160),
      behavior: "smooth",
    });
  };

  const scrollTabsRight = () => {
    stripRef.current?.scrollBy({
      left: Math.max(stripRef.current.clientWidth * 0.65, 160),
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div ref={stripRef} className={`${className} pl-12 pr-12`}>
        {children}
      </div>
      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#111] via-[#111]/95 to-transparent" />
          <button
            onClick={scrollTabsLeft}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded border border-white/10 bg-[#1a1a1a]/95 p-1.5 text-gray-300 shadow-lg transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            aria-label="Show previous tabs"
          >
            <ChevronLeft size={14} />
          </button>
        </>
      )}
      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#111] via-[#111]/95 to-transparent" />
          <button
            onClick={scrollTabsRight}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded border border-white/10 bg-[#1a1a1a]/95 p-1.5 text-gray-300 shadow-lg transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            aria-label="Show more tabs"
          >
            <ChevronRight size={14} />
          </button>
        </>
      )}
    </div>
  );
}

function InlineSubtabs<T extends string>({
  options,
  activeId,
  onChange,
  trailingContent,
}: {
  options: InlineSubtabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  trailingContent?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-white/5 bg-black/20">
      <div className="min-w-0 flex-1">
        <ScrollableTabStrip className="flex items-center gap-2 p-3 lg:p-4 overflow-x-auto no-scrollbar">
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
        </ScrollableTabStrip>
      </div>
      {trailingContent ? (
        <div className="shrink-0 pr-3 lg:pr-4">
          {trailingContent}
        </div>
      ) : null}
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
  hideHeader = false,
  children,
}: {
  title: string;
  meta?: string;
  hideHeader?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      {!hideHeader && <PanelSectionHeader title={title} meta={meta} />}
      {children}
    </section>
  );
}

function CharacterBuilderScreen({
  ruleset,
  onClose,
  onFinish,
}: {
  ruleset: Ruleset;
  onClose: () => void;
  onFinish: () => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(ruleset.races[0]?.id ?? "");
  const [selectedCareerId, setSelectedCareerId] = useState(ruleset.careers[0]?.id ?? "");
  const [characterName, setCharacterName] = useState("");
  const [ambition, setAmbition] = useState("");
  const [background, setBackground] = useState("");
  const currentStep = builderSteps[currentStepIndex];
  const selectedSpecies = ruleset.races.find((race) => race.id === selectedSpeciesId) ?? ruleset.races[0] ?? null;
  const selectedCareer = ruleset.careers.find((career) => career.id === selectedCareerId) ?? ruleset.careers[0] ?? null;
  const selectedCareerSkills = selectedCareer
    ? selectedCareer.skillIds
        .map((skillId) => ruleset.skills.find((skill) => skill.id === skillId)?.name)
        .filter((name): name is string => Boolean(name))
    : [];
  const selectedCareerTalents = selectedCareer
    ? selectedCareer.talentIds
        .map((talentId) => ruleset.talents.find((talent) => talent.id === talentId)?.name)
        .filter((name): name is string => Boolean(name))
    : [];
  const validationItems = [
    { label: "Species", isComplete: Boolean(selectedSpecies) },
    { label: "Career", isComplete: Boolean(selectedCareer) },
    { label: "Name", isComplete: characterName.trim().length > 0 },
    { label: "Background", isComplete: background.trim().length > 0 },
    { label: "Ambition", isComplete: ambition.trim().length > 0 },
  ];
  const missingItems = validationItems.filter((item) => !item.isComplete);
  const completedCount = currentStepIndex;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === builderSteps.length - 1;

  const goToPreviousStep = () => {
    setCurrentStepIndex((current) => Math.max(0, current - 1));
  };

  const goToNextStep = () => {
    if (isLastStep) {
      onFinish();
      return;
    }

    setCurrentStepIndex((current) => Math.min(builderSteps.length - 1, current + 1));
  };

  const renderBuilderStep = () => {
    switch (currentStep.id) {
      case "species":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            {ruleset.races.map((race) => (
              <button
                key={race.id}
                type="button"
                onClick={() => setSelectedSpeciesId(race.id)}
                className={`rounded border p-4 text-left transition-colors ${
                  race.id === selectedSpeciesId
                    ? "border-wfrp-gold bg-[#2a2417]"
                    : "border-white/10 bg-black/20 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="wfrp-panel-title text-gray-100">{race.name}</h3>
                  <span className="wfrp-table-label text-wfrp-gold">M {race.movement}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-gray-300">
                  <span>Fate {race.fate}</span>
                  <span>Res {race.resilience}</span>
                  <span>Extra {race.extraPoints}</span>
                </div>
                <p className="mt-3 text-xs text-gray-500">Wounds: {race.woundsFormula}</p>
              </button>
            ))}
          </div>
        );
      case "career":
        return (
          <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
            <div className="flex flex-col gap-2">
              {ruleset.careers.map((career) => (
                <button
                  key={career.id}
                  type="button"
                  onClick={() => setSelectedCareerId(career.id)}
                  className={`rounded border px-3 py-2 text-left transition-colors ${
                    career.id === selectedCareerId
                      ? "border-wfrp-gold bg-[#2a2417] text-wfrp-gold"
                      : "border-white/10 bg-black/20 text-gray-200 hover:border-white/20"
                  }`}
                >
                  <div className="text-sm font-bold">{career.name}</div>
                  <div className="wfrp-table-label text-gray-500">{career.tier}</div>
                </button>
              ))}
            </div>
            {selectedCareer && (
              <div className="rounded border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold font-serif">{selectedCareer.name}</h3>
                    <p className="wfrp-section-meta">{selectedCareer.tier}</p>
                  </div>
                  <span className="wfrp-table-label text-wfrp-gold">{selectedCareer.ranks[0]?.status}</span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="wfrp-panel-title text-gray-400">Career Skills</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCareerSkills.map((skill) => (
                        <span key={skill} className="rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-gray-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="wfrp-panel-title text-gray-400">Talent Options</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCareerTalents.map((talent) => (
                        <span key={talent} className="rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-gray-300">
                          {talent}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "attributes":
        return (
          <div className="rounded border border-white/10 bg-black/20 p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {UI_LABELS.CHARACTERISTICS.map((characteristic) => (
                <div key={characteristic.key} className="rounded border border-white/10 bg-black/25 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{characteristic.label}</p>
                  <p className="mt-1 text-lg font-black text-wfrp-gold">
                    {selectedSpecies?.attributeRolls[characteristic.key] ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case "skills-talents":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded border border-white/10 bg-black/20 p-4">
              <h3 className="wfrp-panel-title text-gray-300">Skill Choices</h3>
              <div className="mt-3 flex flex-col gap-2">
                {selectedCareerSkills.map((skill) => (
                  <div key={skill} className="flex items-center justify-between rounded border border-white/10 bg-black/25 px-3 py-2">
                    <span className="text-sm text-gray-200">{skill}</span>
                    <span className="wfrp-table-label text-gray-500">Career</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded border border-white/10 bg-black/20 p-4">
              <h3 className="wfrp-panel-title text-gray-300">Talent Pool</h3>
              <div className="mt-3 flex flex-col gap-2">
                {selectedCareerTalents.map((talent) => (
                  <div key={talent} className="rounded border border-white/10 bg-black/25 px-3 py-2 text-sm text-gray-200">
                    {talent}
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case "trappings":
        return (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ruleset.items.slice(0, 12).map((item) => (
              <div key={item.id} className="rounded border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-gray-100">{item.name}</h3>
                  <span className="wfrp-table-label text-gray-500">{item.type}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        );
      case "details":
        return (
          <div className="grid gap-4">
            <label className="flex flex-col gap-2">
              <span className="wfrp-panel-title text-gray-400">Name</span>
              <input
                value={characterName}
                onChange={(event) => setCharacterName(event.target.value)}
                className="rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-100 outline-none focus:border-wfrp-gold/60"
                placeholder="Character name"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="wfrp-panel-title text-gray-400">Background</span>
              <textarea
                value={background}
                onChange={(event) => setBackground(event.target.value)}
                className="min-h-28 rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-100 outline-none focus:border-wfrp-gold/60"
                placeholder="Origin, appearance, reputation, or notable history"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="wfrp-panel-title text-gray-400">Ambition</span>
              <input
                value={ambition}
                onChange={(event) => setAmbition(event.target.value)}
                className="rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-100 outline-none focus:border-wfrp-gold/60"
                placeholder="Short-term or long-term ambition"
              />
            </label>
          </div>
        );
      case "review":
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <section className="rounded border border-white/10 bg-black/20 p-4">
              <h3 className="wfrp-panel-title text-gray-300">Character Draft</h3>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><dt className="wfrp-table-label text-gray-500">Name</dt><dd className="text-sm text-gray-100">{characterName || "Unnamed"}</dd></div>
                <div><dt className="wfrp-table-label text-gray-500">Species</dt><dd className="text-sm text-gray-100">{selectedSpecies?.name ?? "-"}</dd></div>
                <div><dt className="wfrp-table-label text-gray-500">Career</dt><dd className="text-sm text-gray-100">{selectedCareer?.name ?? "-"}</dd></div>
                <div><dt className="wfrp-table-label text-gray-500">Tier</dt><dd className="text-sm text-gray-100">{selectedCareer?.tier ?? "-"}</dd></div>
              </dl>
            </section>
            <section className="rounded border border-white/10 bg-black/20 p-4">
              <h3 className="wfrp-panel-title text-gray-300">Validation</h3>
              <div className="mt-3 flex flex-col gap-2">
                {validationItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded border border-white/10 bg-black/25 px-3 py-2">
                    <span className="text-sm text-gray-200">{item.label}</span>
                    <span className={item.isComplete ? "text-xs font-bold text-emerald-400" : "text-xs font-bold text-wfrp-red"}>
                      {item.isComplete ? "Ready" : "Missing"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case "finish":
        return (
          <div className="rounded border border-white/10 bg-black/20 p-6 text-center">
            <h3 className="text-xl font-bold font-serif text-gray-100">
              {missingItems.length === 0 ? "Ready to Create Sheet" : "Draft Needs Review"}
            </h3>
            <p className="mt-3 text-sm text-gray-400">
              {missingItems.length === 0
                ? `${characterName} is ready as a ${selectedSpecies?.name ?? "character"} ${selectedCareer?.tier ?? ""}.`
                : `${missingItems.length} required ${missingItems.length === 1 ? "field is" : "fields are"} still missing.`}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#f0f0f0] font-sans selection:bg-wfrp-gold/40 flex flex-col">
      <div className="h-1 bg-wfrp-red w-full flex-shrink-0" />
      <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-4 p-4">
        <section className="rounded border border-[#303030] bg-[#181818] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#303030] px-4 py-3">
            <div>
              <p className="wfrp-sidebar-kicker">Character Builder</p>
              <h1 className="text-xl font-bold font-serif tracking-tight">New Character</h1>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="wfrp-action-btn flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
            >
              <X size={14} />
              Sheet
            </button>
          </div>

          <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border-b border-[#303030] bg-black/15 p-3 lg:border-b-0 lg:border-r">
              <div className="flex flex-col gap-1">
                {builderSteps.map((step, index) => {
                  const isActive = step.id === currentStep.id;
                  const isComplete = index < currentStepIndex;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setCurrentStepIndex(index)}
                      className={`flex items-center justify-between rounded px-3 py-2 text-left transition-colors ${
                        isActive
                          ? "bg-[#2a2417] text-wfrp-gold"
                          : "text-gray-300 hover:bg-[#222222]"
                      }`}
                    >
                      <span className="truncate text-[12px] font-bold">{step.label}</span>
                      <span className="ml-3 text-[10px] font-black text-gray-500">
                        {isComplete ? "Done" : index + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="flex min-h-[520px] flex-col p-4">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="wfrp-section-meta">
                    Step {currentStepIndex + 1} of {builderSteps.length}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold font-serif">{currentStep.label}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                    {currentStep.summary}
                  </p>
                </div>
                <div className="min-w-36 text-right">
                  <p className="wfrp-sidebar-kicker">Progress</p>
                  <p className="text-lg font-black text-wfrp-gold">
                    {completedCount}/{builderSteps.length - 1}
                  </p>
                </div>
              </div>

              <div className="flex-1 py-6">
                {renderBuilderStep()}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={isFirstStep}
                  className="wfrp-action-btn flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="wfrp-action-btn flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-gray-100"
                >
                  {isLastStep ? "Finish" : "Next"}
                  {!isLastStep && <ChevronRight size={14} />}
                </button>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

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
  const availableCharacters = listCharacters();
  const [activeInfo, setActiveInfo] = useState<ActiveInfoState | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'skills' | 'actions' | 'inventory' | 'spells' | 'features' | 'background' | 'notes' | 'career'>('skills');
  const [activeActionCategory, setActiveActionCategory] = useState<ActionCategory>('all');
  const [activeSkillSubtab, setActiveSkillSubtab] = useState<SkillSubtab>('all');
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
  const toRoman = (value: number) => ["", "I", "II", "III", "IV"][value] ?? String(value);
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
  const spellSchoolOptions = [...new Set<string>(
    characterData.spells
      .filter((spell) => spell.category === "school" && spell.school)
      .map((spell) => spell.school as string),
  )].sort((first, second) =>
    formatSpellSchoolLabel(first).localeCompare(formatSpellSchoolLabel(second), undefined, {
      sensitivity: "base",
    }),
  );
  const spellSubtabOptions: InlineSubtabOption<SpellSubtab>[] = [
    { id: "all", label: "All" },
    { id: "petty", label: "Petty" },
    { id: "arcane", label: "Arcane" },
    ...spellSchoolOptions.map((school) => ({
      id: `school:${school}` as SpellSubtab,
      label: formatSpellSchoolLabel(school),
    })),
  ];
  const filteredSpells = characterData.spells.filter((spell) => {
    if (activeSpellSubtab === "all") {
      return true;
    }

    if (activeSpellSubtab === "petty" || activeSpellSubtab === "arcane") {
      return spell.category === activeSpellSubtab;
    }

    return spell.category === "school" && spell.school === activeSpellSubtab.replace(/^school:/, "");
  });
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
  const characteristicKeyByTalentMaxName: Record<string, string> = {
    "Weapon Skill": "WS",
    "Ballistic Skill": "BS",
    Strength: "S",
    Toughness: "T",
    Initiative: "I",
    Agility: "Ag",
    Dexterity: "Dex",
    Intelligence: "Int",
    Willpower: "WP",
    Fellowship: "Fel",
  };
  const getTalentMaxDisplay = (max: string) => {
    const numericMax = Number.parseInt(max, 10);

    if (Number.isFinite(numericMax) && `${numericMax}` === max.trim()) {
      return numericMax;
    }

    const bonusMatch = max.match(/^(.+?)\s+Bonus$/i);
    if (!bonusMatch) {
      return max;
    }

    const characteristicKey = characteristicKeyByTalentMaxName[bonusMatch[1]];
    if (!characteristicKey) {
      return max;
    }

    return Math.floor(((characterData.attributes as Record<string, number>)[characteristicKey] ?? 0) / 10);
  };
  const advancementTalentNames = [...new Set([
    ...careerAdvancementData.talents,
    ...characterTalents.map((talent) => talent.name),
  ])];
  const characterTalentRows = Array.from<{ talent: ResolvedCharacterTalent; count: number }>(
    characterTalents
      .reduce<Map<string, { talent: ResolvedCharacterTalent; count: number }>>((rows, talent) => {
        const current = rows.get(talent.name);

        if (current) {
          current.count += 1;
          return rows;
        }

        rows.set(talent.name, { talent, count: 1 });
        return rows;
      }, new Map())
      .values(),
  ).sort((first, second) => first.talent.name.localeCompare(second.talent.name));
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

  useEffect(() => {
    setActiveInfo(null);
    setActiveMainTab("skills");
    setActiveActionCategory("all");
    setActiveSkillSubtab("all");
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
  }, 0);
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

  const formatSpellDuration = (duration: string) =>
    duration
      .replace(/Willpower Bonus/gi, `${wpb}`)
      .replace(/Willpower/gi, `${wp}`)
      .replace(/\s+/g, " ")
      .trim();

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

  if (isCharacterBuilderOpen) {
    return (
      <CharacterBuilderScreen
        ruleset={ruleset}
        onClose={() => setIsCharacterBuilderOpen(false)}
        onFinish={() => setIsCharacterBuilderOpen(false)}
      />
    );
  }

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
            xpCurrent={xpCurrent}
            headerResources={
              <>
                <HeaderResourceSlider
                  label="Wounds"
                  current={woundsCurrent}
                  max={characterData.wounds.max}
                  onAdjust={adjustWounds}
                  barClassName="bg-wfrp-red"
                  contentClassName="flex w-20 flex-col gap-1 sm:w-24 lg:w-32"
                />
                <HeaderResourceSlider
                  label="Corruption"
                  current={corruptionCurrent}
                  max={maxCorruption}
                  onAdjust={adjustCorruption}
                  barClassName="bg-purple-600"
                  contentClassName="flex w-20 flex-col gap-1 sm:w-24 lg:w-32"
                />
              </>
            }
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
              setActiveInfo(null);
              setIsShopOpen(false);
              setIsSpellShopOpen(false);
              setIsDiceLogOpen(false);
              setActiveMainTab("career");
            }}
          />

        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8">
          {/* Layout for Characteristics and Skills */}
          {/* Characteristics Section */}
          <section>
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
            <div className="flex w-full flex-col gap-6 md:w-[28%] xl:w-[24%]">
            <section className="wfrp-card overflow-hidden p-0!">
              <div className="wfrp-card-tab-header">
                <h3 className="wfrp-panel-title">ARMOUR</h3>
              </div>
              <div className="wfrp-card-tab-body">
                <div className="wfrp-subpanel-shell px-3 py-3 space-y-3">
                  <div className="grid grid-cols-8 gap-2">
                    {[
                      { label: "Head", value: armourTotals.head, className: "col-start-4 row-start-1 col-span-2 aspect-square rounded-full" },
                      { label: "Left arm", value: armourTotals.leftArm, className: "col-start-3 row-start-2 col-span-1 row-span-2 aspect-[1/2] rounded-full rounded-tr-none" },
                      { label: "Body", value: armourTotals.body, className: "col-start-4 row-start-2 col-span-2 row-span-2 aspect-[2/3] rounded-lg" },
                      { label: "Right arm", value: armourTotals.rightArm, className: "col-start-6 row-start-2 col-span-1 row-span-2 aspect-[1/2] rounded-full rounded-tl-none" },
                      { label: "Left leg", value: armourTotals.leftLeg, className: "col-start-4 row-start-4 col-span-1 row-span-2 aspect-[1/2] rounded-b-full rounded-t-lg" },
                      { label: "Right leg", value: armourTotals.rightLeg, className: "col-start-5 row-start-4 col-span-1 row-span-2 aspect-[1/2] rounded-b-full rounded-t-lg" },
                    ].map(({ label, value, className }) => (
                      <div
                        key={label}
                        className={`flex flex-col items-center justify-center border border-white/5 bg-black/30 px-1.5 py-2 text-center ${className}`}
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
              </div>
            </section>

            {/* Reserves Section - Below Skills */}
            <section className="wfrp-card overflow-hidden p-0!">
              <div className="wfrp-card-tab-header">
                <h3 className="wfrp-panel-title">FATE & RESILIENCE</h3>
              </div>
              <div className="wfrp-card-tab-body space-y-3">
                <div className="wfrp-subpanel-shell px-3 py-3">
                  <div className="grid grid-cols-1 gap-3">
                    <HeaderResourceSlider
                      label="Fate"
                      current={fateCurrent}
                      max={resourceCaps.fate}
                      onAdjust={adjustFate}
                      barClassName="bg-[#C98B00]"
                      contentClassName="flex min-w-0 flex-1 flex-col gap-1"
                    />
                    <HeaderResourceSlider
                      label="Fortune"
                      current={fortuneCurrent}
                      max={fateCurrent}
                      onAdjust={adjustFortune}
                      barClassName="bg-[#C98B00]"
                      contentClassName="flex min-w-0 flex-1 flex-col gap-1"
                    />
                  </div>
                </div>

                <div className="wfrp-subpanel-shell px-3 py-3">
                  <div className="grid grid-cols-1 gap-3">
                    <HeaderResourceSlider
                      label="Resilience"
                      current={resilienceCurrent}
                      max={resourceCaps.resilience}
                      onAdjust={adjustResilience}
                      barClassName="bg-[#0088A8]"
                      contentClassName="flex min-w-0 flex-1 flex-col gap-1"
                    />
                    <HeaderResourceSlider
                      label="Resolve"
                      current={resolveCurrent}
                      max={Math.min(resourceCaps.resolve, resilienceCurrent)}
                      onAdjust={adjustResolve}
                      barClassName="bg-[#0088A8]"
                      contentClassName="flex min-w-0 flex-1 flex-col gap-1"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Tabbed Info Box - 2/3 width on Desktop/Tablet */}
          <section className="w-full md:flex-1 wfrp-card flex flex-col overflow-hidden self-start min-h-[500px] p-0!">
              <ScrollableTabStrip className="flex px-4 bg-[#111] border-b border-[#303030] gap-4 lg:gap-6 overflow-x-auto no-scrollbar">
                {[
                  { id: 'skills', label: 'Skills' },
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
              </ScrollableTabStrip>

              <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c0c]/50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMainTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex-1 flex flex-col min-h-0"
                  >
                    {activeMainTab === 'skills' && (
                      <div className="flex flex-col h-full">
                        <InlineSubtabs<SkillSubtab>
                          options={[
                            { id: 'all', label: 'All' },
                            { id: 'advanced', label: 'Advanced' },
                            { id: 'basic-trained', label: 'Trained' },
                            { id: 'basic-untrained', label: 'Untrained' },
                          ]}
                          activeId={activeSkillSubtab}
                          onChange={setActiveSkillSubtab}
                        />

                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
                          {skillSections
                            .filter((section) => activeSkillSubtab === 'all' || activeSkillSubtab === section.id)
                            .map((section) => (
                              <section key={section.id} className="wfrp-subpanel-shell flex flex-col">
                                <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_36px_44px_58px] gap-2 items-center">
                                  <span className="wfrp-table-label text-left">{section.title}</span>
                                  <span className="wfrp-table-label col-span-2 text-center">Char.</span>
                                  <span className="wfrp-table-label text-center">Adv</span>
                                </div>

                                <div className="divide-y divide-white/5">
                                  {section.skills.map((skill) => {
                                    const charValue = (characterData.attributes as Record<string, number>)[skill.characteristic] || 0;
                                    const totalValue = charValue + skill.advances;

                                    return (
                                      <div
                                        key={skill.key}
                                        className="grid grid-cols-[minmax(0,1fr)_36px_44px_58px] items-center gap-2 wfrp-table-row group"
                                      >
                                        <div className="flex min-w-0 items-center gap-2">
                                          <button
                                            onClick={() => handleRoll({ key: skill.characteristic, label: skill.displayName })}
                                            className="wfrp-roll-btn w-12 shrink-0"
                                            aria-label={`Roll for ${skill.displayName}`}
                                          >
                                            {totalValue}
                                          </button>

                                          <span
                                            onClick={() => {
                                              setActiveInfo({ type: 'skill', name: skill.displayName });
                                              setRollState(prev => ({ ...prev, characteristic: null }));
                                            }}
                                            className="wfrp-skill-link min-w-0 truncate"
                                          >
                                            {skill.displayName}
                                          </span>
                                        </div>

                                        <div className="wfrp-list-cell-strong text-center font-mono">
                                          {skill.characteristic}
                                        </div>

                                        <div className="wfrp-list-cell-strong text-center font-mono">
                                          {charValue}
                                        </div>

                                        <div className="wfrp-list-cell-strong text-center font-mono">
                                          {skill.advances === 0 ? '-' : skill.advances}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </section>
                            ))}
                        </div>
                      </div>
                    )}

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
                                { name: 'Charge', char, totalValue: totalSkillValue, modifier: 0, damage: weaponDamage, range: weaponStats.reach, properties: weaponStats.properties.concat('Impact').filter((v, i, a) => a.indexOf(v) === i) },
                                { name: 'Parry', char, totalValue: totalSkillValue, modifier: 0, damage: 0, range: weaponStats.reach, properties: ['Defensive'], bonuses: [{ label: 'Defensive', value: 1 }] },
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
                          <InlineSubtabs
                            options={spellSubtabOptions}
                            activeId={activeSpellSubtab}
                            onChange={setActiveSpellSubtab}
                            trailingContent={
                              <button
                                type="button"
                                onClick={() => setIsSpellShopOpen(true)}
                                className="wfrp-action-btn inline-flex h-7 items-center gap-1.5 px-3 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                                aria-label="Add spells"
                              >
                                <span className="whitespace-nowrap">Add Spells</span>
                              </button>
                            }
                          />
                          <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            <div className="wfrp-subpanel-shell flex flex-col overflow-hidden">
                              <div className="grid grid-cols-[72px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px] gap-2 lg:gap-4 px-4 py-1 bg-black/10 border-b border-white/5 items-center">
                                <span className="wfrp-table-label text-center">Channel</span>
                                <span className="wfrp-table-label text-left">Spell</span>
                                <span className="wfrp-table-label text-center">CN</span>
                                <span className="wfrp-table-label text-left">Range</span>
                                <span className="wfrp-table-label text-left">Target</span>
                                <span className="wfrp-table-label text-left">Duration</span>
                              </div>

                              <div className="flex flex-col divide-y divide-white/5">
                                {filteredSpells.map((spell) => {
                                  const baseWP = (characterData.attributes as Record<string, number>)['WP'] || 0;
                                  const chnSkill = characterSkills.find(s => s.baseName === 'Channelling');
                                  const skillValue = chnSkill ? baseWP + chnSkill.advances : baseWP;
                                  const spellRange = formatSpellRange(spell.range);
                                  const spellTarget = formatSpellTarget(spell.target);
                                  const spellDuration = formatSpellDuration(spell.duration);

                                  return (
                                    <div
                                      key={spell.name}
                                      className="grid grid-cols-[72px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px] gap-2 lg:gap-4 px-4 py-2 items-center"
                                    >
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

                                      <button
                                        onClick={() => {
                                          setActiveInfo({
                                            type: 'spell',
                                            name: spell.name,
                                            extra: { ...spell, range: spellRange, target: spellTarget, duration: spellDuration },
                                          });
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
                                        {spellDuration}
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
                        <InlineSubtabs<InventorySubtab>
                          options={[
                            { id: 'all', label: 'All' },
                            { id: 'wallet', label: 'Wallet' },
                            { id: 'carried', label: 'Ready' },
                            { id: 'worn', label: 'Worn' },
                            ...containers.map((container) => ({
                              id: `container:${container.id}` as InventorySubtab,
                              label: container.name,
                            })),
                          ]}
                          activeId={activeInventorySubtab}
                          onChange={setActiveInventorySubtab}
                          trailingContent={
                            <div className="flex items-center gap-4">
                              <div className="hidden w-32 flex-col gap-1 sm:flex lg:w-40">
                                <div className="flex items-end justify-between leading-none">
                                  <span className="text-[9px] font-bold uppercase tracking-tight text-gray-400">
                                    Encumbrance
                                  </span>
                                  <span className="font-mono text-[10px] font-bold text-gray-200">
                                    {totalEncumbrance} / {carryCapacity}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#303030] shadow-inner">
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
                                type="button"
                                onClick={() => {
                                  setActiveInfo(null);
                                  setIsDiceLogOpen(false);
                                  setIsShopOpen(true);
                                }}
                                className="wfrp-action-btn inline-flex h-7 items-center gap-1.5 px-3 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                                aria-label="Add item"
                              >
                                <span className="whitespace-nowrap">Add item</span>
                              </button>
                            </div>
                          }
                        />

                        <div className="flex-1 overflow-y-auto p-2 space-y-4">
                          {[
                            {
                              id: "wallet",
                              title: "Wallet",
                              subtitle: formatCoinTotalValue(characterData.coins),
                              items: [] as ResolvedCharacterEquipment[],
                              dropContainerId: null,
                              alwaysVisible: true,
                              acceptsDrops: false,
                            },
                            {
                              id: "carried",
                              title: 'Ready',
                              items: carriedItems,
                              dropContainerId: null,
                              dropCarried: true,
                              alwaysVisible:
                                activeInventorySubtab === 'carried' ||
                                carriedItems.length > 0 ||
                                Boolean(inventoryDrag),
                            },
                            {
                              id: "worn",
                              title: "Worn",
                              items: wornItems,
                              dropContainerId: null,
                              dropWorn: true,
                              alwaysVisible: true,
                            },
                            ...containers.map((container) => ({
                              id: container.id,
                              title: container.name,
                              subtitle: `${getContainerUsedEncumbrance(container.id)} / ${container.carries ?? 0} enc`,
                              items: getContainerContents(container.id),
                              dropContainerId: container.id,
                              alwaysVisible: true,
                            })),
                          ]
                            .filter((section) => {
                              if (!section.alwaysVisible) return false;
                              if (activeInventorySubtab === 'all') return true;
                              if (activeInventorySubtab === 'wallet') return section.id === 'wallet';
                              if (activeInventorySubtab === 'worn') return section.id === 'worn';
                              if (activeInventorySubtab === 'carried') return section.id === 'carried';
                              return activeInventorySubtab === `container:${section.id}`;
                            })
                            .map((section) => {
                              const isActiveDropTarget = inventoryDropTarget === section.id;
                              const acceptsDrops = section.acceptsDrops !== false;
                              const dropsToWorn = "dropWorn" in section && section.dropWorn === true;
                              const dropsToCarried = "dropCarried" in section && section.dropCarried === true;
                              const canDropHere = acceptsDrops && inventoryDrag
                                ? canDropInventoryItem(
                                    inventoryDrag.itemId,
                                    section.dropContainerId,
                                    dropsToWorn,
                                    dropsToCarried,
                                  )
                                : false;

                              return (
                            <div
                              key={section.id}
                              onDragOver={(event) =>
                                acceptsDrops
                                  ? handleInventoryDragOver(
                                      section.id,
                                      section.dropContainerId,
                                      event,
                                      dropsToWorn,
                                      dropsToCarried,
                                    )
                                  : undefined
                              }
                              onDragLeave={() =>
                                setInventoryDropTarget((current) =>
                                  current === section.id ? null : current,
                                )
                              }
                              onDrop={(event) =>
                                acceptsDrops
                                  ? handleInventoryDrop(
                                      section.dropContainerId,
                                      event,
                                      dropsToWorn,
                                      dropsToCarried,
                                    )
                                  : undefined
                              }
                              className={`wfrp-subpanel-shell ${
                                isActiveDropTarget
                                  ? "border-wfrp-gold/50 bg-wfrp-gold/5"
                                  : canDropHere
                                    ? "border-wfrp-gold/20"
                                    : ""
                              }`}
                            >
                               <div className="grid grid-cols-[1fr_140px_60px_60px_132px] gap-2 lg:gap-4 wfrp-list-header">
                                 <span className="flex min-w-0 items-center gap-2 text-left">
                                   <span className="truncate">{section.title}</span>
                                   {"subtitle" in section && section.subtitle ? (
                                     <span className="truncate font-mono text-[9px] font-bold uppercase tracking-wider text-gray-600">
                                       {section.subtitle}
                                     </span>
                                   ) : null}
                                 </span>
                                 <span className="text-left">Type</span>
                                 <span className="text-center">Enc</span>
                                 <span className="text-center">Value</span>
                                 <span className="text-right">Actions</span>
                               </div>
                               {section.id === "wallet" && (
                                <>
                                  {([
                                    ["gc", "Gold Crowns", "gc"],
                                    ["s", "Silver Shillings", "ss"],
                                    ["d", "Brass Pennies", "bp"],
                                  ] as const).map(([key, name, label]) => (
                                    <div key={key} className="wfrp-table-row flex border-0 group">
                                      <div className="flex-1 grid grid-cols-[1fr_140px_60px_60px_132px] gap-2 lg:gap-4 items-center">
                                        <div className="flex flex-col">
                                          <span className="wfrp-skill-link flex items-center gap-1.5">
                                            {name}
                                          </span>
                                        </div>

                                        <div className="wfrp-list-cell-strong truncate">
                                          Currency
                                        </div>

                                        <div className="wfrp-list-cell-strong text-center font-mono">
                                          -
                                        </div>

                                        <div className="wfrp-list-cell-strong text-center font-mono">
                                          {characterData.coins[key]}{label}
                                        </div>

                                        <div className="flex justify-end gap-1 pr-1">
                                          <button
                                            type="button"
                                            onClick={() => handleAdjustCoinType(key, -10)}
                                            className="wfrp-stepper-btn inline-flex h-5 min-w-7 items-center justify-center px-1.5 py-0 leading-none focus-visible:ring-wfrp-red/50 disabled:cursor-not-allowed disabled:opacity-20"
                                            aria-label={`Decrease ${name.toLowerCase()} by 10`}
                                            disabled={characterData.coins[key] <= 0}
                                          >
                                            <span className="font-mono text-[10px] font-bold leading-none">-10</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleAdjustCoinType(key, -1)}
                                            className="wfrp-stepper-btn inline-flex h-5 min-w-7 items-center justify-center px-1.5 py-0 leading-none focus-visible:ring-wfrp-red/50 disabled:cursor-not-allowed disabled:opacity-20"
                                            aria-label={`Decrease ${name.toLowerCase()} by 1`}
                                            disabled={characterData.coins[key] <= 0}
                                          >
                                            <span className="font-mono text-[10px] font-bold leading-none">-1</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleAdjustCoinType(key, 1)}
                                            className="wfrp-stepper-btn inline-flex h-5 min-w-7 items-center justify-center px-1.5 py-0 leading-none focus-visible:ring-green-600/50"
                                            aria-label={`Increase ${name.toLowerCase()} by 1`}
                                          >
                                            <span className="font-mono text-[10px] font-bold leading-none">+1</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleAdjustCoinType(key, 10)}
                                            className="wfrp-stepper-btn inline-flex h-5 min-w-7 items-center justify-center px-1.5 py-0 leading-none focus-visible:ring-green-600/50"
                                            aria-label={`Increase ${name.toLowerCase()} by 10`}
                                          >
                                            <span className="font-mono text-[10px] font-bold leading-none">+10</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </>
                               )}
                               {section.items.map((item: ResolvedCharacterEquipment) => (
                                <div
                                  key={item.id}
                                  draggable={!isPacksAndContainersItem(item)}
                                  onDragStart={(event) => handleInventoryDragStart(item, event)}
                                  onDragEnd={handleInventoryDragEnd}
                                  className={`wfrp-table-row flex border-0 group ${
                                    inventoryDrag?.itemId === item.id ? "opacity-45" : ""
                                  } ${
                                    isPacksAndContainersItem(item) ? "" : "cursor-grab active:cursor-grabbing"
                                  }`}
                                >
                                  <div className="flex-1 grid grid-cols-[1fr_140px_60px_60px_132px] gap-2 lg:gap-4 items-center">
                                    <div className="flex flex-col">
                                      <span 
                                        onClick={() => {
                                          setActiveInfo({ type: 'equipment', name: item.name });
                                          setRollState(prev => ({ ...prev, characteristic: null }));
                                        }}
                                        className="wfrp-skill-link flex items-center gap-1.5"
                                      >
                                        {item.name}
                                      </span>
                                    </div>

                                    <div className="wfrp-list-cell-strong truncate">
                                      {item.type}
                                    </div>

                                    <div className="wfrp-list-cell-strong text-center font-mono">
                                      {getInventoryEncumbrance(item) || '-'}
                                    </div>

                                    <div className="wfrp-list-cell-strong text-center font-mono">
                                      {formatItemValue(item)}
                                    </div>

                                    <div className="relative flex items-center justify-end gap-1 pr-1">
                                      {item.type === "Consumable" && (
                                        <button
                                          type="button"
                                          onClick={() => handleConsumeItem(item.id)}
                                          className="wfrp-stepper-btn focus-visible:ring-wfrp-red/50 disabled:cursor-not-allowed disabled:opacity-20"
                                          aria-label={`Use one ${getConsumableBaseName(item).toLowerCase()}`}
                                        >
                                          <Minus size={10} />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(event) => handleToggleInventoryMenu(item.id, event, "drop")}
                                        className="wfrp-stepper-btn inline-flex h-5 min-w-12 items-center justify-center px-1.5 py-0 focus-visible:ring-wfrp-gold/50"
                                        aria-label={`Drop ${item.name}`}
                                      >
                                        <span className="font-mono text-[10px] font-bold leading-none">Drop</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(event) => handleToggleInventoryMenu(item.id, event, "move")}
                                        className="wfrp-stepper-btn inline-flex h-5 min-w-12 items-center justify-center px-1.5 py-0 focus-visible:ring-wfrp-gold/50"
                                        aria-label={`Move ${item.name}`}
                                      >
                                        <span className="font-mono text-[10px] font-bold leading-none">Move</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {section.items.length === 0 && section.id !== "wallet" && (
                                <div className="px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-700">
                                  {canDropHere ? "Drop here" : "Empty"}
                                </div>
                              )}
                            </div>
                              );
                            })}
                        </div>
                        {activeInventoryMenu && (
                          <div
                            ref={inventoryMenuRef}
                            className="fixed z-50 min-w-[152px] overflow-hidden rounded border border-white/10 bg-[#141414] py-1 shadow-xl"
                            style={{ top: activeInventoryMenu.top, left: activeInventoryMenu.left }}
                          >
                            {(() => {
                              const activeItem = equipmentState.find((item) => item.id === activeInventoryMenu.id);
                              if (!activeItem) return null;

                              const stowableContainers = equipmentState.filter(
                                (item) =>
                                  isPacksAndContainersItem(item) &&
                                  item.id !== activeItem.id &&
                                  item.id !== activeItem.containerId &&
                                  canStoreInContainer(activeItem.id, item.id),
                              );
                              const canMoveToWorn = canDropInventoryItem(activeItem.id, null, true);
                              const canMoveToCarried = isWornInventoryItem(activeItem)
                                ? canDropInventoryItem(activeItem.id, null, false, true)
                                : canDropInventoryItem(activeItem.id, null);

                              return (
                                <>
                                  {activeInventoryMenu.mode === "drop" ? (
                                    <button
                                      onClick={() => handleDropItem(activeItem.id)}
                                      className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-semibold leading-relaxed text-gray-300 transition-colors hover:bg-white/5 hover:text-wfrp-gold"
                                    >
                                      Confirm
                                    </button>
                                  ) : (
                                    <>
                                      {canMoveToWorn && (
                                    <button
                                      onClick={() => handleWearItem(activeItem.id)}
                                      className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-semibold leading-relaxed text-gray-300 transition-colors hover:bg-white/5 hover:text-wfrp-gold"
                                    >
                                      Wear
                                    </button>
                                      )}
                                      {canMoveToCarried && (
                                    <button
                                      onClick={() => {
                                        if (isWornInventoryItem(activeItem)) {
                                          handleUnwearItem(activeItem.id);
                                        } else {
                                          handleCarryItem(activeItem.id);
                                        }
                                      }}
                                      className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-semibold leading-relaxed text-gray-300 transition-colors hover:bg-white/5 hover:text-wfrp-gold"
                                    >
                                      Ready
                                    </button>
                                      )}
                                      {stowableContainers.map((container) => (
                                      <button
                                        key={container.id}
                                        onClick={() => handleStoreItem(activeItem.id, container.id)}
                                        className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-semibold leading-relaxed text-gray-300 transition-colors hover:bg-white/5 hover:text-wfrp-gold"
                                      >
                                        {container.name}
                                      </button>
                                      ))}
                                    </>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeMainTab === 'features' && (
                      <div className="flex-1 overflow-y-auto p-2">
                        {characterTalentRows.length > 0 ? (
                          <div className="wfrp-subpanel-shell flex flex-col">
                            <div className="wfrp-subpanel-header grid grid-cols-[minmax(120px,0.75fr)_72px_minmax(180px,1.25fr)] gap-2 items-center">
                              <span className="wfrp-table-label text-left">Talent</span>
                              <span className="wfrp-table-label text-center">Taken</span>
                              <span className="wfrp-table-label text-left">Description</span>
                            </div>
                            <div className="divide-y divide-white/5">
                              {characterTalentRows.map(({ talent, count }) => (
                                <button
                                  key={talent.name}
                                  type="button"
                                  onClick={() => openTalentInfo(talent.name)}
                                  className="group grid w-full grid-cols-[minmax(120px,0.75fr)_72px_minmax(180px,1.25fr)] items-start gap-2 wfrp-table-row cursor-pointer text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40"
                                  aria-label={`Open ${talent.name} talent rule`}
                                >
                                  <span className="min-w-0 text-xs font-semibold text-gray-400 transition-colors group-hover:text-wfrp-gold">
                                    {talent.name}
                                  </span>
                                  <span className="min-w-0 text-center text-xs leading-relaxed text-gray-500">
                                    {count}/{getTalentMaxDisplay(talent.max)}
                                  </span>
                                  <span className="min-w-0 text-xs leading-relaxed text-gray-500">
                                    {talent.effects?.length
                                      ? talent.effects.map(formatTalentEffect).join("; ")
                                      : talent.description}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded border border-white/10 bg-black/20 px-4 py-6 text-center text-sm text-gray-500">
                            No talents bought yet.
                          </div>
                        )}
                      </div>
                    )}

                    {activeMainTab === 'career' && (
                      <div className="flex flex-col h-full min-h-0">
                        <ScrollableTabStrip className="sticky top-0 z-10 flex items-center gap-2 p-3 lg:p-4 bg-[#0c0c0c] border-b border-white/5 overflow-x-auto no-scrollbar">
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
                        </ScrollableTabStrip>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 no-scrollbar">
                          {(activeCareerSubtab === 'all' || activeCareerSubtab === 'careers') && (
                            <AdvancementSection title="Careers" meta="Current Path" hideHeader>
                            <div className="wfrp-subpanel-shell flex flex-col">
                              <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_minmax(180px,1.4fr)_minmax(0,1fr)_62px_74px] gap-2 lg:gap-3 items-center">
                                <span className="wfrp-table-label text-left">Careers</span>
                                <span className="wfrp-table-label text-left">Progress</span>
                                <span className="wfrp-table-label text-left">Tier</span>
                                <span className="wfrp-table-label text-center">Cost</span>
                                <span className="wfrp-table-label text-right">Advance</span>
                              </div>
                              <div className="divide-y divide-white/5">
                                <div className="grid grid-cols-[minmax(0,1fr)_minmax(180px,1.4fr)_minmax(0,1fr)_62px_74px] items-center gap-2 lg:gap-3 wfrp-table-row">
                                  <div className="min-w-0">
                                    <button
                                      onClick={() => {
                                        setActiveInfo({
                                          type: 'career',
                                          name: `${characterData.career} ${toRoman(displayedCareerRank)}`,
                                          extra: {
                                            careerName: characterData.career,
                                            tierName: displayedCareerRankRecord?.name ?? characterData.tier,
                                            tierStatus: displayedCareerRankRecord?.status ?? characterData.status,
                                            rank: displayedCareerRank,
                                            careerSkills: careerAdvancementData.skills,
                                            careerTalents: careerAdvancementData.talents,
                                          },
                                        });
                                        setRollState(prev => ({ ...prev, characteristic: null }));
                                      }}
                                      className="wfrp-skill-link truncate text-left"
                                    >
                                      {characterData.career} {toRoman(displayedCareerRank)}
                                    </button>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                      <div
                                        className="h-full bg-white/30 transition-all duration-500"
                                        style={{ width: `${advancementProgress}%` }}
                                        role="progressbar"
                                        aria-valuenow={advancementProgress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label="Career step progress"
                                      />
                                    </div>
                                  </div>
                                  <div className="wfrp-list-cell-strong text-left truncate">
                                    {displayedCareerRankRecord?.name ?? characterData.tier}
                                  </div>
                                  <div className="wfrp-list-cell-strong text-center font-mono">
                                    {nextCareerAdvanceCost ?? '-'}
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
                                      disabled={!nextCareerRankRecord || nextCareerAdvanceCost === null || pendingAvailableXp < nextCareerAdvanceCost}
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
                            <AdvancementSection title="Characteristics" meta="Scaffolded" hideHeader>
                            <div className="wfrp-subpanel-shell flex flex-col">
                              <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_64px_72px_62px_74px] gap-2 lg:gap-3 items-center">
                                <span className="wfrp-table-label text-left">Characteristics</span>
                                <span className="wfrp-table-label text-left">Base</span>
                                <span className="wfrp-table-label text-center">Advances</span>
                                <span className="wfrp-table-label text-center">Cost</span>
                                <span className="wfrp-table-label text-right">Advance</span>
                              </div>
                              <div className="divide-y divide-white/5">
                                {advancementCharacteristics.map((item) => {
                                  const totalAdvances = item.advances + item.pendingAdvances;
                                  const advancesDisplay =
                                    item.advances === 0
                                      ? item.pendingAdvances > 0
                                        ? `+${item.pendingAdvances}`
                                        : '-'
                                      : `${item.advances}${item.pendingAdvances > 0 ? ` +${item.pendingAdvances}` : ''}`;
                                  const isAvailable = availableCareerCharacteristicKeys.includes(item.key);
                                  const nextCharacteristicCost = getCharacteristicAdvanceCost(totalAdvances);

                                  return (
                                    <div
                                      key={item.key}
                                      className={`grid grid-cols-[minmax(0,1fr)_64px_72px_62px_74px] items-center gap-2 lg:gap-3 wfrp-table-row ${
                                        !isAvailable ? 'opacity-70' : ''
                                      }`}
                                    >
                                      <div className="min-w-0">
                                        <button
                                          onClick={() => {
                                            setActiveInfo({
                                              type: 'characteristic',
                                              name: `${item.label} (${item.key})`,
                                              extra: {
                                                key: item.key,
                                                label: getCharacteristicLabel(item.key),
                                                advances: item.advances,
                                                pendingAdvances: item.pendingAdvances,
                                                currentValue: item.value,
                                                nextCost: isAvailable ? nextCharacteristicCost : null,
                                                availableFromRank: careerAdvancementData.characteristics.find((entry) => entry.key === item.key)?.availableFromRank ?? null,
                                              },
                                            });
                                            setRollState(prev => ({ ...prev, characteristic: null }));
                                          }}
                                          className="wfrp-skill-link truncate text-left"
                                        >
                                          {item.label} ({item.key})
                                        </button>
                                      </div>
                                      <div className="wfrp-list-cell-strong text-left font-mono">
                                        {item.value}
                                      </div>
                                      <div className="wfrp-list-cell-strong text-center font-mono">
                                        {advancesDisplay}
                                      </div>
                                      <div className="wfrp-list-cell-strong text-center font-mono">
                                        {isAvailable ? nextCharacteristicCost : '-'}
                                      </div>
                                      <div className="flex justify-end gap-1">
                                        <button
                                          onClick={() => removePendingCharacteristicAdvance(item.key)}
                                          disabled={item.pendingAdvances === 0 || !isAvailable}
                                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-wfrp-red/50"
                                          aria-label={`Decrease ${item.label}`}
                                        >
                                          <Minus size={10} />
                                        </button>
                                        <button
                                          onClick={() => purchaseCharacteristicAdvance(item.key)}
                                          disabled={!isAvailable || pendingAvailableXp < nextCharacteristicCost}
                                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-green-600/50"
                                          aria-label={`Increase ${item.label}`}
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

                          {(activeCareerSubtab === 'all' || activeCareerSubtab === 'skills') && (
                            <AdvancementSection title="Skills" hideHeader>
                            <div className="flex flex-col gap-3">
                              {advancementSkillSections.map((section) => (
                                <div key={section.id} className="wfrp-subpanel-shell flex flex-col">
                                  <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_56px_62px_62px_74px] gap-2 lg:gap-3 items-center">
                                    <span className="wfrp-table-label text-left">{section.title}</span>
                                    <span className="wfrp-table-label text-center">Base</span>
                                    <span className="wfrp-table-label text-center">Advances</span>
                                    <span className="wfrp-table-label text-center">Cost</span>
                                    <span className="wfrp-table-label text-right">Advance</span>
                                  </div>
                                  <div className="divide-y divide-white/5">
                                    {section.skills.length === 0 ? (
                                      <div className="px-3 py-4 text-[10px] italic text-gray-600">
                                        No {section.title.toLowerCase()} skills listed.
                                      </div>
                                    ) : (
                                      section.skills.map((skillRow) => {
                                        const canPurchase =
                                          skillRow.isCareerSkill && pendingAvailableXp >= skillRow.nextSkillCost;
                                        const advancesDisplay =
                                          skillRow.baseAdvances === 0
                                            ? skillRow.pendingAdvances > 0
                                              ? `+${skillRow.pendingAdvances}`
                                              : '-'
                                            : `${skillRow.baseAdvances}${skillRow.pendingAdvances > 0 ? ` +${skillRow.pendingAdvances}` : ''}`;

                                        return (
                                          <div
                                            key={skillRow.skillName}
                                            className={`grid grid-cols-[minmax(0,1fr)_56px_62px_62px_74px] items-center gap-2 lg:gap-3 wfrp-table-row group ${
                                              !skillRow.isCareerSkill ? 'opacity-70' : ''
                                            }`}
                                          >
                                            <div className="min-w-0">
                                              <button
                                                onClick={() => {
                                                  setActiveInfo({ type: 'skill', name: skillRow.skillName });
                                                  setRollState(prev => ({ ...prev, characteristic: null }));
                                                }}
                                                className="wfrp-skill-link truncate text-left"
                                              >
                                                {skillRow.skillName} ({skillRow.characteristicKey || '-'})
                                              </button>
                                            </div>
                                            <div className="wfrp-list-cell-strong text-center font-mono">
                                              {skillRow.baseCharacteristicValue === 0 ? '-' : skillRow.baseCharacteristicValue}
                                            </div>
                                            <div className="wfrp-list-cell-strong text-center font-mono">
                                              {advancesDisplay}
                                            </div>
                                            <div className="wfrp-list-cell-strong text-center font-mono">
                                              {skillRow.isCareerSkill ? skillRow.nextSkillCost : '-'}
                                            </div>
                                            <div className="flex justify-end gap-1">
                                              <button
                                                onClick={() => removePendingSkillAdvance(skillRow.skillName)}
                                                disabled={skillRow.pendingAdvances === 0 || !skillRow.isCareerSkill}
                                                className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-wfrp-red/50"
                                                aria-label={`Decrease skill advances for ${skillRow.skillName}`}
                                              >
                                                <Minus size={10} />
                                              </button>
                                              <button
                                                onClick={() => purchaseSkillAdvance(skillRow.skillName)}
                                                disabled={!canPurchase}
                                                className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-green-600/50"
                                                aria-label={`Advance skill ${skillRow.skillName}`}
                                              >
                                                <Plus size={12} />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            </AdvancementSection>
                          )}

                          {(activeCareerSubtab === 'all' || activeCareerSubtab === 'talents') && (
                            <AdvancementSection title="Talents" hideHeader>
                            <div className="wfrp-subpanel-shell flex flex-col">
                              <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_72px_62px_74px] gap-2 lg:gap-3 items-center">
                                <span className="wfrp-table-label text-left">Talents</span>
                                <span className="wfrp-table-label text-center">Taken</span>
                                <span className="wfrp-table-label text-center">Cost</span>
                                <span className="wfrp-table-label text-right">Advance</span>
                              </div>
                              <div className="divide-y divide-white/5">
                                {advancementTalentNames.map((talentName) => {
                                  const takenCount = characterTalents.filter((talent) => talent.name === talentName).length;
                                  const pendingTakenCount = pendingTalentPurchases[talentName] ?? 0;
                                  const isCareerTalent = careerAdvancementData.talents.includes(talentName);
                                  const nextTalentCost = getTalentPurchaseCost(takenCount + pendingTakenCount);
                                  const canPurchase = isCareerTalent && pendingAvailableXp >= nextTalentCost;
                                  const takenDisplay =
                                    takenCount === 0
                                      ? pendingTakenCount > 0
                                        ? `+${pendingTakenCount}`
                                        : '-'
                                      : `${takenCount}${pendingTakenCount > 0 ? ` +${pendingTakenCount}` : ''}`;

                                  return (
                                    <div
                                      key={talentName}
                                      className={`grid grid-cols-[minmax(0,1fr)_72px_62px_74px] items-center gap-2 lg:gap-3 wfrp-table-row group ${
                                        !isCareerTalent && takenCount === 0 ? 'opacity-70' : ''
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
                                        {takenDisplay}
                                      </div>
                                      <div className="wfrp-list-cell-strong text-center font-mono">
                                        {isCareerTalent ? nextTalentCost : '-'}
                                      </div>
                                      <div className="flex justify-end gap-1">
                                        <button
                                          onClick={() => removePendingTalentPurchase(talentName)}
                                          disabled={pendingTakenCount === 0}
                                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-wfrp-red/50"
                                          aria-label={`Decrease talent purchases for ${talentName}`}
                                        >
                                          <Minus size={10} />
                                        </button>
                                        <button
                                          onClick={() => purchaseTalent(talentName)}
                                          disabled={!canPurchase}
                                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-green-600/50"
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
                      <div className="flex-1 overflow-y-auto p-3 lg:p-4 flex flex-col gap-4">
                        <section className="wfrp-subpanel-shell flex flex-col gap-3 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="wfrp-panel-title">
                              Background Editor
                              <div className="wfrp-panel-rule" />
                            </h3>
                            <span className="wfrp-table-label text-right">
                              {backgroundText.trim().length} Characters
                            </span>
                          </div>
                          <textarea
                            value={backgroundText}
                            onChange={(event) => setBackgroundText(event.target.value)}
                            rows={18}
                            className="min-h-[420px] w-full resize-y rounded border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-gray-200 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                            placeholder="Write the character's history, relationships, goals, appearance, reputation, and anything the table should remember."
                            aria-label="Character background editor"
                          />
                        </section>
                      </div>
                    )}

                    {activeMainTab === 'notes' && (
                       <div className="flex-1 overflow-y-auto p-3 lg:p-4 flex flex-col gap-4">
                          {sortedNotes.length > 0 && (
                            <section className="wfrp-subpanel-shell flex flex-col gap-3 p-4">
                              <input
                                value={noteSearch}
                                onChange={(event) => setNoteSearch(event.target.value)}
                                className="h-9 rounded border border-white/10 bg-black/30 px-3 text-sm text-gray-200 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                                placeholder="Search notes or #hashtags"
                              />
                            </section>
                          )}

                          <section className="wfrp-subpanel-shell flex flex-col gap-3 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="wfrp-panel-title">
                                Campaign Journal
                                <div className="wfrp-panel-rule" />
                              </h3>
                              <span className="wfrp-table-label text-right">
                                {sortedNotes.length} {sortedNotes.length === 1 ? "Entry" : "Entries"}
                              </span>
                            </div>
                            <input
                              value={newNoteTitle}
                              onChange={(event) => setNewNoteTitle(event.target.value)}
                              className="h-10 rounded border border-white/10 bg-black/30 px-3 text-sm font-semibold text-gray-100 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                              placeholder="Entry title"
                            />
                            <textarea
                              value={newNoteText}
                              onChange={(event) => setNewNoteText(event.target.value)}
                              rows={4}
                              className="min-h-28 resize-y rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                              placeholder="Write a note... Use #tags to create a chip."
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={addNote}
                                disabled={!newNoteTitle.trim() || !newNoteText.trim()}
                                className="wfrp-action-btn h-8 px-3 text-[10px] font-black uppercase tracking-widest text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Add Note
                              </button>
                            </div>
                            {noteHashtags.length > 0 && (
                              <div className="flex flex-wrap gap-2 border-t border-white/5 pt-3">
                                {noteHashtags.map((tag) => {
                                  const tagSearch = `#${tag}`;
                                  const isActive = noteSearch.trim().toLowerCase() === tagSearch;

                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() => setNoteSearch(isActive ? "" : tagSearch)}
                                      className={`rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                        isActive
                                          ? "border-wfrp-gold/60 bg-wfrp-gold/15 text-wfrp-gold"
                                          : "border-white/10 bg-black/25 text-gray-400 hover:text-gray-200 hover:border-white/20"
                                      }`}
                                    >
                                      #{tag}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </section>

                          {sortedNotes.length === 0 ? (
                            <div className="min-h-48 border border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center text-gray-700 gap-2">
                              <span className="text-[9px] font-black uppercase tracking-widest">No Notes</span>
                              <p className="text-[10px] italic">Entries will appear here by date written.</p>
                            </div>
                          ) : noteGroups.length === 0 ? (
                            <div className="min-h-48 border border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center text-gray-700 gap-2">
                              <span className="text-[9px] font-black uppercase tracking-widest">No Matches</span>
                              <p className="text-[10px] italic">Try another word or hashtag.</p>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {noteGroups.map((group) => (
                                <section
                                  key={group.dayKey}
                                  className="rounded-lg border border-white/10 bg-black/25 p-4 shadow-inner"
                                >
                                  <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                                    <time className="wfrp-panel-title text-gray-300" dateTime={group.date}>
                                      {formatNoteDay(group.date)}
                                    </time>
                                    <span className="wfrp-table-label text-gray-500">
                                      {group.notes.length} {group.notes.length === 1 ? "Note" : "Notes"}
                                    </span>
                                  </div>
                                  <div className="mt-3 flex flex-col gap-3">
                                    {group.notes.map((note) => (
                                      <article key={note.id} className="rounded border border-white/5 bg-black/20 p-3">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="min-w-0 flex-1">
                                            <h4 className="truncate text-sm font-bold uppercase tracking-wide text-gray-100">
                                              {note.title ?? "Untitled Entry"}
                                            </h4>
                                            <time className="mt-1 block wfrp-table-label text-gray-500" dateTime={note.createdAt}>
                                              {formatNoteDate(note.createdAt)}
                                            </time>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => deleteNote(note.id)}
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-white/10 bg-black/20 text-gray-500 transition-colors hover:border-white/20 hover:text-wfrp-red focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-red/40"
                                            aria-label={`Delete note from ${formatNoteDate(note.createdAt)}`}
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
                                          {note.text}
                                        </p>
                                      </article>
                                    ))}
                                  </div>
                                </section>
                              ))}
                            </div>
                          )}
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
        <ShopSidebar
          isOpen={isShopOpen}
          coins={formatCharacterCoins(characterData.coins)}
          ownedItemIds={new Set(equipmentState.map((item) => item.itemId))}
          onAddToInventory={handleAddShopItem}
          onBuy={handleAddShopItem}
          onClose={() => setIsShopOpen(false)}
        />
        <SpellShopSidebar
          isOpen={isSpellShopOpen}
          spells={ruleset.spells}
          knownSpellIds={new Set(characterData.spells.map((spell) => spell.id))}
          onAddSpell={handleAddSpell}
          onClose={() => setIsSpellShopOpen(false)}
        />
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
