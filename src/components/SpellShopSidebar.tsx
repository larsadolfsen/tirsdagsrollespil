import { useMemo, useState } from "react";
import { AppSidebar, SidebarItemList } from "./sidebar";
import { WfrpSearchField } from "./ui";
import {
  formatPrayerSchoolLabel,
  formatSpellSchoolLabel,
  formatSpellSchoolShortLabel,
  isPrayerDefinition,
} from "../tabs/spells/spellUtils";
import type { SpellDefinition } from "../types";

const spellCategoryOrder: SpellDefinition["category"][] = ["petty", "arcane", "school"];
type SpellFilter = "All" | SpellDefinition["category"] | `school:${string}`;

function formatSpellCategoryLabel(category: SpellDefinition["category"]) {
  if (category === "petty") {
    return "Petty";
  }

  if (category === "arcane") {
    return "Arcane";
  }

  return "Schools";
}

function getSpellSchools(spell: SpellDefinition): string[] {
  return spell.schools ?? (spell.school ? [spell.school] : []);
}

function getSpellSchoolFilterValue(school: string) {
  return `school:${school}` as const;
}

function getSpellTypeLabel(spell: SpellDefinition) {
  const schools = getSpellSchools(spell);

  if (spell.category === "school" && schools.length > 0) {
    return schools
      .map((school) => (isPrayerDefinition(spell) ? formatPrayerSchoolLabel(school) : formatSpellSchoolShortLabel(school)))
      .join(", ");
  }

  return formatSpellCategoryLabel(spell.category);
}

function getSpellGroupLabel(spell: SpellDefinition) {
  const schools = getSpellSchools(spell);

  if (spell.category === "school" && schools.length > 0) {
    return schools
      .map((school) => (isPrayerDefinition(spell) ? formatPrayerSchoolLabel(school) : formatSpellSchoolLabel(school)))
      .join(" / ");
  }

  return formatSpellCategoryLabel(spell.category);
}

export function SpellShopSidebar({
  isOpen,
  spells,
  knownSpellIds,
  onAddSpell,
  onClose,
  onRemoveSpell,
  isPrayerMode = false,
}: {
  isOpen: boolean;
  spells: SpellDefinition[];
  knownSpellIds: Set<string>;
  onAddSpell: (spell: SpellDefinition) => void;
  onClose: () => void;
  onRemoveSpell: (spellId: string) => void;
  isPrayerMode?: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<SpellFilter>("All");

  const shopStock = useMemo(
    () =>
      [...spells].sort((firstSpell, secondSpell) => {
        const firstCategoryIndex = spellCategoryOrder.indexOf(firstSpell.category);
        const secondCategoryIndex = spellCategoryOrder.indexOf(secondSpell.category);
        const categoryComparison = firstCategoryIndex - secondCategoryIndex;
        const groupComparison = getSpellGroupLabel(firstSpell).localeCompare(
          getSpellGroupLabel(secondSpell),
          undefined,
          { sensitivity: "base" },
        );

        return categoryComparison || groupComparison || firstSpell.name.localeCompare(secondSpell.name);
      }),
    [spells],
  );

  const filteredStock = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const categoryFilteredStock =
      selectedFilter === "All"
        ? shopStock
        : selectedFilter.startsWith("school:")
          ? shopStock.filter(
              (spell) =>
                spell.category === "school" &&
                getSpellSchools(spell).includes(selectedFilter.replace(/^school:/, "")),
            )
          : shopStock.filter((spell) => spell.category === selectedFilter);

    if (!normalizedSearchTerm) {
      return categoryFilteredStock;
    }

    return categoryFilteredStock.filter((spell) =>
      [spell.name, spell.description, spell.category, ...getSpellSchools(spell), String(spell.cn)]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearchTerm)),
    );
  }, [searchTerm, selectedFilter, shopStock]);

  const entryLabel = isPrayerMode ? "Prayer" : "Spell";
  const entryPluralLabel = isPrayerMode ? "Prayers" : "Spells";
  const shopTitle = isPrayerMode ? "Add Prayer" : "Add Spell";
  const lowercaseEntryLabel = entryLabel.toLowerCase();
  const lowercaseEntryPluralLabel = entryPluralLabel.toLowerCase();

  const categoryOptions = useMemo<Array<{ id: SpellFilter; label: string }>>(() => {
    const schoolOptions = Array.from(new Set<string>(shopStock.flatMap(getSpellSchools)))
      .sort((firstSchool, secondSchool) =>
        formatSpellSchoolShortLabel(firstSchool).localeCompare(formatSpellSchoolShortLabel(secondSchool)),
      )
      .map((school) => ({
        label: isPrayerMode ? formatPrayerSchoolLabel(school) : formatSpellSchoolShortLabel(school),
        id: getSpellSchoolFilterValue(school),
      }));

    return isPrayerMode
      ? [
          { id: "All", label: "All" },
          ...schoolOptions,
        ]
      : [
          { id: "All", label: "All" },
          { id: "petty", label: "Petty" },
          { id: "arcane", label: "Arcane" },
          ...schoolOptions,
        ];
  }, [isPrayerMode, shopStock]);

  const spellItems = filteredStock.map((spell) => {
    const isKnown = knownSpellIds.has(spell.id);

    return {
      actions: isKnown
        ? [
            {
              className: "[&_span]:bg-[#4a4a4a] [&_span]:text-gray-100 hover:[&_span]:bg-[#555555]",
              label: "Remove",
              onClick: () => onRemoveSpell(spell.id),
            },
          ]
        : [
            {
              isActive: true,
              label: `Add ${entryLabel}`,
              onClick: () => onAddSpell(spell),
            },
          ],
      description: spell.description,
      details: [
        { label: "CN", value: spell.cn },
        { label: "Type", value: getSpellTypeLabel(spell) },
        { label: "Range", value: spell.range },
        { label: "Target", value: spell.target },
        { label: "Duration", value: spell.duration },
        ...(spell.damage ? [{ label: "Damage", value: spell.damage }] : []),
      ],
      id: spell.id,
      isMarked: isKnown,
      name: spell.name,
    };
  });

  const listTitle =
    selectedFilter === "All"
      ? `All ${entryPluralLabel}`
      : categoryOptions.find((option) => option.id === selectedFilter)?.label ?? entryPluralLabel;

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="spell-shop-sidebar"
      onClose={onClose}
      overlayUntil="desktop"
      side="right"
      title={shopTitle}
      titleId="spell-shop-sidebar-title"
      closeLabel={`Close ${lowercaseEntryLabel} shop`}
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <WfrpSearchField
        id="spell-sidebar-search"
        label={`Search ${lowercaseEntryPluralLabel}`}
        placeholder={`Search ${lowercaseEntryPluralLabel}`}
        value={searchTerm}
        onSearch={setSearchTerm}
        onValueChange={setSearchTerm}
      />
      <div className="overflow-x-auto border-b border-wfrp-border bg-[#242424] px-4 py-3 no-scrollbar">
        <div className="text-[10px] font-black uppercase tracking-widest text-wfrp-muted-text">
          Type
        </div>
        <div className="inline-flex min-w-max items-center justify-start" role="tablist" aria-label={`${entryPluralLabel} filters`}>
          {categoryOptions.map((option, index) => {
            const isActive = selectedFilter === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setSelectedFilter(option.id)}
                className="group inline-flex h-12 cursor-pointer items-center justify-center bg-transparent p-0 text-[11px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50"
              >
                <span
                  className={[
                    "inline-flex h-6 items-center justify-center px-3 transition-all group-active:scale-95 sm:px-4",
                    index === 0 ? "rounded-l" : "",
                    index === categoryOptions.length - 1 ? "rounded-r" : "",
                    index < categoryOptions.length - 1 ? "border-r border-card" : "",
                    isActive ? "bg-wfrp-gold text-primary-foreground" : "bg-[#303030] text-wfrp-muted-text",
                  ].filter(Boolean).join(" ")}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <SidebarItemList
        className="!rounded-none !border-0"
        items={spellItems}
        title={listTitle}
        emptyMessage={`No matching ${lowercaseEntryPluralLabel}.`}
      />
    </AppSidebar>
  );
}
