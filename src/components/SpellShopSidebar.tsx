import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, BookOpen, ChevronDown, ListFilter, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chip } from "./Chip";
import type { SpellDefinition } from "../types";

const spellCategoryOrder: SpellDefinition["category"][] = ["petty", "arcane", "school"];
type SpellFilter = "All" | SpellDefinition["category"] | `school:${string}`;
type SpellSortKey = "name" | "cn" | "type";
type SortDirection = "asc" | "desc";

function OwnershipDot({ label }: { label: string }) {
  return (
    <span
      className="h-1 w-1 shrink-0 rounded-full bg-wfrp-gold shadow-[0_0_4px_rgba(214,168,86,0.65)]"
      aria-label={label}
    />
  );
}

function formatSpellCategoryLabel(category: SpellDefinition["category"]) {
  if (category === "petty") {
    return "Petty";
  }

  if (category === "arcane") {
    return "Arcane";
  }

  return "Schools";
}

function formatSpellSchoolLabel(school: string) {
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
}

function formatSpellSchoolShortLabel(school: string) {
  return formatSpellSchoolLabel(school).replace(/^The Lore of\s+/i, "");
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
    return schools.map(formatSpellSchoolShortLabel).join(", ");
  }

  return formatSpellCategoryLabel(spell.category);
}

function getSpellGroupLabel(spell: SpellDefinition) {
  const schools = getSpellSchools(spell);

  if (spell.category === "school" && schools.length > 0) {
    return schools.map(formatSpellSchoolLabel).join(" / ");
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

function SortHeaderButton({
  align = "left",
  activeSortKey,
  label,
  sortDirection,
  sortKey,
  onSort,
}: {
  align?: "left" | "center" | "right";
  activeSortKey: SpellSortKey;
  label: string;
  sortDirection: SortDirection;
  sortKey: SpellSortKey;
  onSort: (sortKey: SpellSortKey) => void;
}) {
  const isActive = activeSortKey === sortKey;
  const alignClass = align === "center" ? "justify-center text-center" : align === "right" ? "justify-end text-right" : "justify-start text-left";

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`inline-flex items-center gap-1 uppercase transition-colors hover:text-wfrp-gold ${alignClass} ${
        isActive ? "text-wfrp-gold" : ""
      }`}
      aria-label={`Sort spells by ${label}`}
    >
      <span>{label}</span>
      {isActive ? (
        sortDirection === "asc" ? (
          <ArrowUp size={10} aria-hidden="true" strokeWidth={3} />
        ) : (
          <ArrowDown size={10} aria-hidden="true" strokeWidth={3} />
        )
      ) : null}
    </button>
  );
}

export function SpellShopSidebar({
  isOpen,
  spells,
  knownSpellIds,
  onAddSpell,
  onClose,
}: {
  isOpen: boolean;
  spells: SpellDefinition[];
  knownSpellIds: Set<string>;
  onAddSpell: (spell: SpellDefinition) => void;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<SpellFilter>("All");
  const [sortKey, setSortKey] = useState<SpellSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!sidebarRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isFilterOpen]);

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

  const groupedStock = useMemo(() => {
    const sortSpells = (stock: SpellDefinition[]) =>
      [...stock].sort((firstSpell, secondSpell) => {
        const comparison = compareSpells(firstSpell, secondSpell, sortKey);
        return sortDirection === "asc" ? comparison : -comparison;
      });

    if (selectedFilter === "All") {
      return [
        {
          label: "All Spells",
          spells: sortSpells(filteredStock),
        },
      ];
    }

    const groups = filteredStock.reduce<Array<{ label: string; spells: SpellDefinition[] }>>((groups, spell) => {
      const label = getSpellGroupLabel(spell);
      const existingGroup = groups.find((group) => group.label === label);

      if (existingGroup) {
        existingGroup.spells.push(spell);
      } else {
        groups.push({ label, spells: [spell] });
      }

      return groups;
    }, []);

    return groups.map((group) => ({ ...group, spells: sortSpells(group.spells) }));
  }, [filteredStock, selectedFilter, sortDirection, sortKey]);

  const handleSort = (nextSortKey: SpellSortKey) => {
    setSortDirection((currentDirection) =>
      sortKey === nextSortKey && currentDirection === "asc" ? "desc" : "asc",
    );
    setSortKey(nextSortKey);
  };

  const categoryOptions = useMemo<Array<{ label: string; value: SpellFilter }>>(() => {
    const schoolOptions = Array.from(new Set<string>(shopStock.flatMap(getSpellSchools)))
      .sort((firstSchool, secondSchool) =>
        formatSpellSchoolShortLabel(firstSchool).localeCompare(formatSpellSchoolShortLabel(secondSchool)),
      )
      .map((school) => ({
        label: formatSpellSchoolShortLabel(school),
        value: getSpellSchoolFilterValue(school),
      }));

    return [
      { label: "All", value: "All" },
      { label: "Petty", value: "petty" },
      { label: "Arcane", value: "arcane" },
      ...schoolOptions,
    ];
  }, [shopStock]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          ref={sidebarRef}
          key="spell-shop-sidebar"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="wfrp-sidebar-shell w-[620px]"
        >
          <div className="wfrp-sidebar-header p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-wfrp-gold/30 bg-black/20 text-wfrp-gold">
                <BookOpen size={18} />
              </div>
              <div className="flex flex-col">
                <h2 className="wfrp-sidebar-title text-sm uppercase tracking-widest text-wfrp-gold">
                  Spell Shop
                </h2>
                <span className="wfrp-sidebar-kicker">Grimoires & formulae</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="wfrp-icon-btn rounded-full p-1 hover:bg-[#303030]"
              aria-label="Close spell shop"
            >
              <X size={20} className="cursor-pointer" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-black/10 p-4 no-scrollbar">
            <div className="flex flex-col gap-4">
              <div ref={filterRef} className="relative flex gap-2">
                <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded border border-white/5 bg-black/30 px-3 text-gray-500 focus-within:border-wfrp-gold/40">
                  <Search size={14} />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-gray-200 outline-none placeholder:text-gray-600"
                    placeholder="Search spells"
                    aria-label="Search spells"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
                  className="wfrp-action-btn h-10 shrink-0 gap-2 px-4"
                  aria-expanded={isFilterOpen}
                  aria-label="Filter spells by type"
                >
                  <ListFilter size={14} />
                  Filter
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 top-12 z-20 w-56 rounded border border-white/10 bg-[#151515] p-2 shadow-xl shadow-black/40">
                    <div className="px-2 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-700">
                      Type
                    </div>
                    {categoryOptions.map((option) => {
                      const spellCount =
                        option.value === "All"
                          ? shopStock.length
                          : option.value.startsWith("school:")
                            ? spellSchoolCounts.get(option.value.replace(/^school:/, "")) ?? 0
                            : spellCategoryCounts.get(option.value) ?? 0;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSelectedFilter(option.value);
                            setExpandedSpellId(null);
                          }}
                          className={`flex h-8 w-full items-center justify-between rounded px-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors ${
                            selectedFilter === option.value
                              ? "bg-wfrp-gold/10 text-wfrp-gold"
                              : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
                          }`}
                        >
                          <span>{option.label}</span>
                          <span className="font-mono text-[9px] text-gray-600">{spellCount}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedFilter !== "All" && (
                <div className="flex flex-wrap gap-2">
                  <Chip
                    onClose={() => {
                      setSelectedFilter("All");
                      setExpandedSpellId(null);
                    }}
                    closeLabel={`Clear ${
                      categoryOptions.find((option) => option.value === selectedFilter)?.label ?? "spell"
                    } spell filter`}
                  >
                    {categoryOptions.find((option) => option.value === selectedFilter)?.label}
                  </Chip>
                </div>
              )}

              <div className="wfrp-subpanel-shell">
                <div className="grid grid-cols-[1fr_46px_78px_18px] gap-3 wfrp-list-header">
                  <SortHeaderButton activeSortKey={sortKey} label="Spell" sortDirection={sortDirection} sortKey="name" onSort={handleSort} />
                  <SortHeaderButton align="center" activeSortKey={sortKey} label="CN" sortDirection={sortDirection} sortKey="cn" onSort={handleSort} />
                  <SortHeaderButton activeSortKey={sortKey} label="Type" sortDirection={sortDirection} sortKey="type" onSort={handleSort} />
                  <span aria-hidden="true" />
                </div>

                <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-2 no-scrollbar">
                  {groupedStock.map((group) => (
                    <div key={group.label} className="mb-3 last:mb-0">
                      {selectedFilter !== "All" ? (
                        <h4 className="wfrp-list-group">
                          <span>{group.label}</span>
                          <div className="wfrp-panel-rule" />
                        </h4>
                      ) : null}

                      {group.spells.map((spell) => {
                        const isKnown = knownSpellIds.has(spell.id);

                        return (
                          <div key={spell.id} className="rounded border border-transparent transition-colors hover:border-white/5">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSpellId((currentId) =>
                                  currentId === spell.id ? null : spell.id,
                                )
                              }
                              className="wfrp-table-row grid w-full grid-cols-[1fr_46px_78px_18px] gap-3 border-0 text-left"
                              aria-expanded={expandedSpellId === spell.id}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="wfrp-list-cell-strong truncate text-gray-200">
                                    {spell.name}
                                  </span>
                                  {isKnown ? <OwnershipDot label="Known spell" /> : null}
                                </div>
                              </div>

                              <div className="wfrp-list-cell-strong text-center font-mono">
                                {spell.cn}
                              </div>

                              <div className="wfrp-list-cell-strong truncate text-left">
                                {getSpellTypeLabel(spell)}
                              </div>

                              <ChevronDown
                                size={14}
                                className={`mt-0.5 text-gray-600 transition-transform ${
                                  expandedSpellId === spell.id ? "rotate-180 text-wfrp-gold" : ""
                                }`}
                              />
                            </button>

                            {expandedSpellId === spell.id && (
                              <div className="mx-2 mb-2 rounded border border-white/5 bg-black/20 p-3">
                                <p className="text-[11px] font-semibold leading-relaxed text-gray-400">
                                  {spell.description}
                                </p>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="wfrp-table-label">Range</span>
                                    <p className="wfrp-list-cell-strong mt-1 text-gray-200">{spell.range}</p>
                                  </div>
                                  <div>
                                    <span className="wfrp-table-label">Target</span>
                                    <p className="wfrp-list-cell-strong mt-1 text-gray-200">{spell.target}</p>
                                  </div>
                                  <div>
                                    <span className="wfrp-table-label">Duration</span>
                                    <p className="wfrp-list-cell-strong mt-1 text-gray-200">{spell.duration}</p>
                                  </div>
                                  <div>
                                    <span className="wfrp-table-label">Damage</span>
                                    <p className="wfrp-list-cell-strong mt-1 text-gray-200">{spell.damage}</p>
                                  </div>
                                </div>
                                {!isKnown ? (
                                  <div className="mt-3">
                                    <button
                                      type="button"
                                      onClick={() => onAddSpell(spell)}
                                      className="wfrp-action-btn gap-2 whitespace-nowrap px-4 py-1.5"
                                      aria-label={`Add ${spell.name}`}
                                    >
                                      Add Spell
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {filteredStock.length === 0 && (
                    <div className="px-2 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gray-700">
                      No matching spells
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
