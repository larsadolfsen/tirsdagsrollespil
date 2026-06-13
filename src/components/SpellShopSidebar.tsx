import { useMemo, useState } from "react";
import { AppSidebar, SidebarItemList } from "./sidebar";
import { SubtabActionButton, WfrpSearchField, WfrpSuggestionChips } from "./ui";
import {
  formatPrayerSchoolLabel,
  formatSpellSchoolLabel,
  formatSpellSchoolShortLabel,
  isPrayerDefinition,
} from "../tabs/spells/spellUtils";
import type { SpellDefinition } from "../types";

const spellCategoryOrder: SpellDefinition["category"][] = ["petty", "arcane", "school"];
type SpellFilter = "All" | SpellDefinition["category"] | `school:${string}`;
type SpellSortKey = "name" | "cn" | "type";
type SortDirection = "asc" | "desc";

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

function getSpellSortValue(spell: SpellDefinition, sortKey: SpellSortKey) {
  if (sortKey === "cn") {
    return spell.cn;
  }

  if (sortKey === "type") {
    return getSpellTypeLabel(spell);
  }

  return spell.name;
}

function compareSpells(firstSpell: SpellDefinition, secondSpell: SpellDefinition, sortKey: SpellSortKey) {
  const firstValue = getSpellSortValue(firstSpell, sortKey);
  const secondValue = getSpellSortValue(secondSpell, sortKey);

  if (typeof firstValue === "number" && typeof secondValue === "number") {
    return firstValue - secondValue || firstSpell.name.localeCompare(secondSpell.name, undefined, { sensitivity: "base" });
  }

  return String(firstValue).localeCompare(String(secondValue), undefined, { sensitivity: "base" }) ||
    firstSpell.name.localeCompare(secondSpell.name, undefined, { sensitivity: "base" });
}

export function SpellShopSidebar({
  isOpen,
  spells,
  knownSpellIds,
  onAddSpell,
  onClose,
  isPrayerMode = false,
}: {
  isOpen: boolean;
  spells: SpellDefinition[];
  knownSpellIds: Set<string>;
  onAddSpell: (spell: SpellDefinition) => void;
  onClose: () => void;
  isPrayerMode?: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<SpellFilter>("All");
  const [sortKey, setSortKey] = useState<SpellSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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

  const spellCategoryCounts = useMemo(() => {
    return shopStock.reduce((counts, spell) => {
      counts.set(spell.category, (counts.get(spell.category) ?? 0) + 1);
      return counts;
    }, new Map<SpellDefinition["category"], number>());
  }, [shopStock]);

  const spellSchoolCounts = useMemo(() => {
    return shopStock.reduce((counts, spell) => {
      if (spell.category !== "school") return counts;

      getSpellSchools(spell).forEach((school) => {
        counts.set(school, (counts.get(school) ?? 0) + 1);
      });

      return counts;
    }, new Map<string, number>());
  }, [shopStock]);

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
  const shopTitle = isPrayerMode ? "Prayer Shop" : "Spell Shop";
  const lowercaseEntryLabel = entryLabel.toLowerCase();
  const lowercaseEntryPluralLabel = entryPluralLabel.toLowerCase();

  const handleSort = (nextSortKey: SpellSortKey) => {
    setSortDirection((currentDirection) =>
      sortKey === nextSortKey && currentDirection === "asc" ? "desc" : "asc",
    );
    setSortKey(nextSortKey);
  };

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

  const filterOptions = useMemo(
    () =>
      categoryOptions.map((option) => {
        const spellCount =
          option.id === "All"
            ? shopStock.length
            : option.id.startsWith("school:")
              ? spellSchoolCounts.get(option.id.replace(/^school:/, "")) ?? 0
              : spellCategoryCounts.get(option.id) ?? 0;

        return {
          id: option.id,
          label: `${option.label} (${spellCount})`,
        };
      }),
    [categoryOptions, shopStock.length, spellCategoryCounts, spellSchoolCounts],
  );

  const sortedStock = useMemo(
    () =>
      [...filteredStock].sort((firstSpell, secondSpell) => {
        const comparison = compareSpells(firstSpell, secondSpell, sortKey);
        return sortDirection === "asc" ? comparison : -comparison;
      }),
    [filteredStock, sortDirection, sortKey],
  );

  const spellItems = sortedStock.map((spell) => {
    const isKnown = knownSpellIds.has(spell.id);

    return {
      actions: isKnown
        ? []
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
      <WfrpSuggestionChips
        label="Filter"
        options={filterOptions}
        selectedIds={[selectedFilter]}
        onToggle={setSelectedFilter}
      />
      <div className="flex flex-wrap gap-2 border-b border-wfrp-border bg-[#242424] px-4 py-3">
        <SubtabActionButton isActive={sortKey === "name"} onClick={() => handleSort("name")}>
          {entryLabel} {sortKey === "name" ? sortDirection : ""}
        </SubtabActionButton>
        <SubtabActionButton isActive={sortKey === "cn"} onClick={() => handleSort("cn")}>
          CN {sortKey === "cn" ? sortDirection : ""}
        </SubtabActionButton>
        <SubtabActionButton isActive={sortKey === "type"} onClick={() => handleSort("type")}>
          Type {sortKey === "type" ? sortDirection : ""}
        </SubtabActionButton>
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
