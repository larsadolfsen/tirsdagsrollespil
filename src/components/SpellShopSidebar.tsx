import { useMemo, useState } from "react";
import { AppSidebar, SidebarItemList } from "./sidebar";
import { WfrpFilterChips, WfrpSearchField } from "./ui";
import {
  formatPrayerSchoolLabel,
  formatSpellSchoolLabel,
  formatSpellSchoolShortLabel,
  isPrayerDefinition,
} from "../tabs/spells/spellUtils";
import type { SpellDefinition } from "../types";

type SpellFilter = SpellDefinition["category"] | `school:${string}`;

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
  const [selectedFilters, setSelectedFilters] = useState<SpellFilter[]>([]);

  const shopStock = useMemo(
    () => [...spells].sort((firstSpell, secondSpell) => firstSpell.name.localeCompare(secondSpell.name)),
    [spells],
  );

  const filteredStock = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const categoryFilteredStock =
      selectedFilters.length === 0
        ? shopStock
        : shopStock.filter((spell) =>
            selectedFilters.some((filter) =>
              filter.startsWith("school:")
                ? spell.category === "school" &&
                  getSpellSchools(spell).includes(filter.replace(/^school:/, ""))
                : spell.category === filter,
            ),
          );

    if (!normalizedSearchTerm) {
      return categoryFilteredStock;
    }

    return categoryFilteredStock.filter((spell) =>
      [spell.name, spell.description, spell.category, ...getSpellSchools(spell), String(spell.cn)]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearchTerm)),
    );
  }, [searchTerm, selectedFilters, shopStock]);

  const entryLabel = isPrayerMode ? "Prayer" : "Spell";
  const entryPluralLabel = isPrayerMode ? "Prayers" : "Spells";
  const shopTitle = isPrayerMode ? "Add Prayer" : "Add Spell";
  const lowercaseEntryLabel = entryLabel.toLowerCase();
  const lowercaseEntryPluralLabel = entryPluralLabel.toLowerCase();

  const categoryOptions = useMemo<Array<{ id: SpellFilter; label: string }>>(() => {
    const allOptions: Array<{ id: SpellFilter; label: string }> = [];

    if (!isPrayerMode) {
      allOptions.push({ id: "petty", label: "Petty" });
      allOptions.push({ id: "arcane", label: "Arcane" });
    }

    Array.from(new Set<string>(shopStock.flatMap(getSpellSchools))).forEach((school) => {
      allOptions.push({
        label: isPrayerMode ? formatPrayerSchoolLabel(school) : formatSpellSchoolShortLabel(school),
        id: getSpellSchoolFilterValue(school),
      });
    });

    return allOptions.sort((a, b) => a.label.localeCompare(b.label));
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
    selectedFilters.length === 1
      ? categoryOptions.find((option) => option.id === selectedFilters[0])?.label ?? entryPluralLabel
      : `All ${entryPluralLabel}`;

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
      <div className="border-b border-wfrp-border bg-[#242424] px-4 py-3">
        <div className="space-y-1.5">
          <div className="wfrp-label text-wfrp-muted-text">Type</div>
          <WfrpFilterChips
            ariaLabel={`${entryPluralLabel} filters`}
            options={categoryOptions}
            selectedIds={selectedFilters}
            onChange={setSelectedFilters}
          />
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
