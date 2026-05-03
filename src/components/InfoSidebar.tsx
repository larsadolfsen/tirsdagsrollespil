import { useEffect, useRef } from "react";
import type { Dispatch, MutableRefObject, ReactNode, SetStateAction } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type {
  ResolvedCharacterRecord,
  ResolvedCharacterEquipment,
  ResolvedCharacterSkill,
} from "../data/characters/resolved";
import { armourFlaws, armourQualities } from "../data/rules/wfrp4e/armourProperties";
import { getCharacterSkillKey } from "../lib/gameSession";
import type { RulesIndex } from "../lib/gameSession";
import type { Characteristic, Ruleset } from "../types";
import type { ActiveInfoState } from "./appTypes";

type InfoSidebarProps = {
  activeInfo: ActiveInfoState | null;
  setActiveInfo: Dispatch<SetStateAction<ActiveInfoState | null>>;
  characterData: ResolvedCharacterRecord;
  characterSkills: ResolvedCharacterSkill[];
  advancementTalentNames: string[];
  ruleset: Ruleset;
  rulesIndex: RulesIndex;
  getCharacteristicDescription: (key: Characteristic["key"]) => string;
  formatSpellDuration: (duration: string) => string;
  skillListRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  propertyListRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  talentListRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
};

type RuleStat = {
  label: string;
  value: ReactNode;
};

type RuleDetailSection = {
  title: ReactNode;
  body?: ReactNode;
  entries?: Array<{
    title: ReactNode;
    description?: ReactNode;
  }>;
};

const compactStats = (stats: Array<RuleStat | false | null | undefined>) =>
  stats.filter(Boolean) as RuleStat[];

const sidebarTitleByType: Record<ActiveInfoState["type"], string> = {
  skill: "Skill Compendium",
  talent: "Talent Ledger",
  career: "Career Ledger",
  characteristic: "Characteristic Ledger",
  equipment: "Equipment Manifest",
  property: "Weapon Properties",
  attack: "Combat Action",
  spell: "Grimoire",
};

const armourLocationLabels: Record<string, string> = {
  head: "Head",
  arms: "Arms",
  body: "Body",
  legs: "Legs",
};

const formatArmourLocations = (locations?: string[]) =>
  locations?.map((location) => armourLocationLabels[location] ?? location).join(", ");

const formatAvailability = (availability?: string) =>
  availability
    ? availability.charAt(0).toUpperCase() + availability.slice(1)
    : undefined;

const formatArmourCategory = (category?: string) =>
  category
    ?.split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatArmourFeatureNames = (features?: { id: string; value?: number | string }[]) =>
  features
    ?.map((feature) => {
      const definition = armourQualities[feature.id] ?? armourFlaws[feature.id];
      return feature.value !== undefined
        ? `${definition?.name ?? feature.id} ${feature.value}`
        : definition?.name ?? feature.id;
    })
    .join(", ");

const formatArmourPenalty = (
  penalty: { skillId: string; value: number },
  ruleset: Ruleset,
) => {
  const skillName = ruleset.skills.find((skill) => skill.id === penalty.skillId)?.name ?? penalty.skillId;
  return `${penalty.value > 0 ? "+" : ""}${penalty.value} ${skillName}`;
};

const getEquipmentStats = (
  item: ResolvedCharacterEquipment,
  ruleset: Ruleset,
) =>
  compactStats([
    { label: "Type", value: item.type },
    item.priceLabel ? { label: "Price", value: item.priceLabel } : null,
    item.armourLocations?.length
      ? { label: "Locations", value: formatArmourLocations(item.armourLocations) }
      : null,
    item.armourAps !== undefined ? { label: "APs", value: item.armourAps } : null,
    item.armourCategory
      ? { label: "Armour Type", value: formatArmourCategory(item.armourCategory) }
      : null,
    { label: "Enc", value: item.encumbrance },
    item.carries !== undefined ? { label: "Carries", value: item.carries } : null,
    item.availability
      ? { label: "Availability", value: formatAvailability(item.availability) }
      : null,
    item.armourPenalties?.length
      ? {
          label: "Penalty",
          value: item.armourPenalties
            .map((penalty) => formatArmourPenalty(penalty, ruleset))
            .join(", "),
        }
      : null,
    item.armourQualities?.length
      ? { label: "Qualities", value: formatArmourFeatureNames(item.armourQualities) }
      : null,
    item.armourFlaws?.length
      ? { label: "Flaws", value: formatArmourFeatureNames(item.armourFlaws) }
      : null,
    { label: "Equipped", value: item.equipped ? "Yes" : "No" },
  ]);

const getEquipmentSections = (item: ResolvedCharacterEquipment): RuleDetailSection[] => [
    ...(item.armourQualities?.length
      ? [
          {
            title: "Qualities",
            entries: item.armourQualities.map((quality) => {
              const definition = armourQualities[quality.id];
              return {
                title: `${definition?.name ?? quality.id}${
                  quality.value !== undefined ? ` ${quality.value}` : ""
                }`,
                description: definition?.description,
              };
            }),
          },
        ]
      : []),
    ...(item.armourFlaws?.length
      ? [
          {
            title: "Flaws",
            entries: item.armourFlaws.map((flaw) => {
              const definition = armourFlaws[flaw.id];
              return {
                title: `${definition?.name ?? flaw.id}${
                  flaw.value !== undefined ? ` ${flaw.value}` : ""
                }`,
                description: definition?.description,
              };
            }),
          },
        ]
      : []),
    ...(item.armourNotes?.length
      ? [
          {
            title: "Notes",
            entries: item.armourNotes.map((note) => ({
              title: note,
            })),
          },
        ]
      : []),
  ];

const getSpellStats = (
  spell: ResolvedCharacterRecord["spells"][number],
  formatSpellDuration: (duration: string) => string,
) =>
  compactStats([
    { label: "CN", value: spell.cn },
    { label: "Duration", value: formatSpellDuration(spell.duration) },
    { label: "Range", value: spell.range },
    { label: "Target", value: spell.target },
    spell.damage && spell.damage !== "-" ? { label: "Damage", value: spell.damage } : null,
  ]);

function RuleSidebarShell({
  activeInfo,
  onClose,
  scrollContainerRef,
  children,
}: {
  activeInfo: ActiveInfoState | null;
  onClose: () => void;
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      {activeInfo && (
        <motion.aside
          key="info-sidebar"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="wfrp-sidebar-shell w-[400px]"
        >
          <div className="wfrp-sidebar-header p-4">
            <div className="flex flex-col">
              <h2 className="wfrp-sidebar-title text-sm uppercase tracking-widest text-wfrp-gold">
                {sidebarTitleByType[activeInfo.type]}
              </h2>
              <span className="wfrp-sidebar-kicker">Knowledge is power</span>
            </div>
            <button
              onClick={onClose}
              className="wfrp-icon-btn p-1 rounded-full hover:bg-[#303030]"
              aria-label="Close sidebar"
            >
              <X size={20} className="cursor-pointer" />
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto scroll-smooth pb-[80vh] no-scrollbar"
          >
            {children}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function RuleSummaryPanel({
  title,
  subtitle,
  stats,
  children,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  stats?: RuleStat[];
  children?: ReactNode;
}) {
  return (
    <div className="wfrp-subpanel rounded-lg p-5 flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="wfrp-sidebar-title text-xl">{title}</h3>
        <span className="wfrp-sidebar-section border-white/5 text-gray-500">{subtitle}</span>
      </div>

      {stats && stats.length > 0 && <RuleInfoTable rows={stats} />}
      {children}
    </div>
  );
}

function RuleInfoTable({ rows }: { rows: RuleStat[] }) {
  return (
    <div className="mb-3 grid grid-cols-[minmax(96px,0.45fr)_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 border-y border-white/10 py-2">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <span className="wfrp-sidebar-body font-semibold text-gray-400">{row.label}:</span>
          <span className="wfrp-sidebar-body text-left font-semibold text-gray-200">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function RuleSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="wfrp-panel-title">
      {children}
      <div className="h-px flex-1 bg-white/5" />
    </h4>
  );
}

function RuleDetailSections({ sections }: { sections: RuleDetailSection[] }) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <div key={String(section.title)} className="flex flex-col gap-2">
          <RuleSectionTitle>{section.title}</RuleSectionTitle>
          {section.body && <div className="text-gray-500">{section.body}</div>}
          {section.entries?.map((entry) => (
            <div key={String(entry.title)} className="flex flex-col gap-1">
              <span className="font-semibold text-gray-300">{entry.title}</span>
              {entry.description && <span className="text-gray-500">{entry.description}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function RuleDescription({ children }: { children: ReactNode }) {
  return <p className="wfrp-sidebar-body">{children}</p>;
}

function RuleListEntry({
  title,
  meta,
  isActive,
  details,
  children,
  innerRef,
  descriptionClassName = "",
}: {
  key?: string;
  title: ReactNode;
  meta?: ReactNode;
  isActive?: boolean;
  details?: RuleStat[];
  children: ReactNode;
  innerRef?: (el: HTMLDivElement | null) => void;
  descriptionClassName?: string;
}) {
  return (
    <div
      ref={innerRef}
      className={`p-4 border-b border-white/5 transition-all ${isActive ? "bg-wfrp-gold/5" : ""}`}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex flex-col">
          <h3
            className={`wfrp-sidebar-title text-base uppercase tracking-tight mb-0.5 ${
              isActive ? "text-wfrp-gold" : "text-white"
            }`}
          >
            {title}
          </h3>
          {meta && <span className="wfrp-sidebar-label">{meta}</span>}
        </div>
      </div>
      <div className={`wfrp-sidebar-body ${descriptionClassName}`}>{children}</div>
      {details && details.length > 0 && <RuleInfoTable rows={details} />}
    </div>
  );
}

export function InfoSidebar({
  activeInfo,
  setActiveInfo,
  characterData,
  characterSkills,
  advancementTalentNames,
  ruleset,
  rulesIndex,
  getCharacteristicDescription,
  formatSpellDuration,
  skillListRefs,
  propertyListRefs,
  talentListRefs,
}: InfoSidebarProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const equipmentListRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const spellListRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const attackProperties = Array.isArray(activeInfo?.extra?.properties)
    ? activeInfo.extra.properties
    : [];

  useEffect(() => {
    if (!activeInfo) {
      return;
    }

    const refsByType: Partial<
      Record<ActiveInfoState["type"], MutableRefObject<Record<string, HTMLDivElement | null>>>
    > = {
      skill: skillListRefs,
      property: propertyListRefs,
      talent: talentListRefs,
      equipment: equipmentListRefs,
      spell: spellListRefs,
    };
    const frame = window.requestAnimationFrame(() => {
      const entry = refsByType[activeInfo.type]?.current[activeInfo.name];
      const container = scrollContainerRef.current;
      if (!entry || !container) {
        return;
      }

      const entryTop = entry.getBoundingClientRect().top;
      const containerTop = container.getBoundingClientRect().top;
      container.scrollTop += entryTop - containerTop;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeInfo, propertyListRefs, skillListRefs, talentListRefs]);

  return (
    <RuleSidebarShell
      activeInfo={activeInfo}
      onClose={() => setActiveInfo(null)}
      scrollContainerRef={scrollContainerRef}
    >
      {activeInfo?.type === "attack" && (
        <div className="p-6 flex flex-col gap-8">
          <RuleSummaryPanel
            title={activeInfo.name}
            subtitle={activeInfo.extra?.weaponName || "Combat Action"}
            stats={[
              { label: "Type", value: activeInfo.extra?.weaponType || "Action" },
              { label: "Roll", value: activeInfo.extra?.totalValue ?? "-" },
              ...(activeInfo.extra?.range
                ? [{ label: "Reach", value: activeInfo.extra.range }]
                : []),
              ...(activeInfo.extra?.damage !== undefined
                ? [{ label: "Damage", value: activeInfo.extra.damage }]
                : []),
            ]}
          >
            <RuleDescription>
              "
              {rulesIndex.actionDescriptionByName[activeInfo.name] ||
                "A standard combat maneuver. Consult the WFRP Core Rulebook for deep tactical situational rules."}
              "
            </RuleDescription>
          </RuleSummaryPanel>

          <div className="flex flex-col gap-4">
            <RuleSectionTitle>Rule-Book Properties</RuleSectionTitle>
            <div className="flex flex-col gap-2">
              {attackProperties.map((prop: string) => (
                <button
                  key={prop}
                  onClick={() => setActiveInfo({ type: "property", name: prop })}
                  className="flex flex-col gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-lg text-left group hover:border-wfrp-gold/40 hover:bg-white/[0.04] transition-all cursor-pointer shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <span className="wfrp-sidebar-body font-bold text-gray-300 group-hover:text-wfrp-gold transition-colors">
                      {prop}
                    </span>
                  </div>
                  <p className="wfrp-sidebar-body text-gray-500 line-clamp-2">
                    {rulesIndex.propertyDescriptionByName[prop] ||
                      "No sanctioned rules found for this property."}
                  </p>
                </button>
              ))}
              {attackProperties.length === 0 && (
                <p className="text-[10px] text-gray-700 italic px-2">
                  No special properties apply to this standard action.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeInfo?.type === "property" &&
        Object.entries(rulesIndex.propertyDescriptionByName)
          .filter(([name]) =>
            activeInfo.extra?.weaponProperties
              ? activeInfo.extra.weaponProperties.includes(name)
              : true,
          )
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([name, desc]) => (
            <RuleListEntry
              key={name}
              title={name}
              isActive={activeInfo.name === name}
              innerRef={(el) => {
                propertyListRefs.current[name] = el;
              }}
            >
              "{desc}"
            </RuleListEntry>
          ))}

      {activeInfo?.type === "skill" &&
        [...characterSkills]
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
          .map((skill) => {
            const baseValue =
              (characterData.attributes as Record<string, number>)[skill.characteristic] ?? 0;
            const totalValue = baseValue + skill.advances;

            return (
              <div
                key={getCharacterSkillKey(skill)}
                ref={(el) => {
                  skillListRefs.current[skill.displayName] = el;
                }}
                className="transition-colors p-4 border-b border-white/5 last:border-0"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex flex-col">
                    <h3 className="wfrp-sidebar-title text-base uppercase tracking-tight text-white mb-0.5">
                      {skill.displayName}
                    </h3>
                    <span className="wfrp-sidebar-label">{skill.characteristic}</span>
                  </div>
                </div>

                <RuleDescription>
                  {rulesIndex.skillDescriptionByName[skill.displayName] ||
                    "Detailed rules for this skill can be found in the WFRP Core Rulebook."}
                </RuleDescription>

                <RuleInfoTable
                  rows={[
                    { label: "Base", value: baseValue },
                    { label: "Advances", value: skill.advances },
                    { label: "Total", value: totalValue },
                  ]}
                />
              </div>
            );
          })}

      {activeInfo?.type === "career" && (
        <div className="p-6 flex flex-col gap-6">
          <RuleSummaryPanel
            title={activeInfo.name}
            subtitle={activeInfo.extra?.tierName ?? "Career Step"}
            stats={[
              { label: "Rank", value: activeInfo.extra?.rank ?? "-" },
              { label: "Status", value: activeInfo.extra?.tierStatus ?? "-" },
            ]}
          >
            <RuleInfoTable
              rows={[
                {
                  label: "Career Skills",
                  value: activeInfo.extra?.careerSkills?.length
                    ? activeInfo.extra.careerSkills.join(", ")
                    : "No career skills listed.",
                },
                {
                  label: "Career Talents",
                  value: activeInfo.extra?.careerTalents?.length
                    ? activeInfo.extra.careerTalents.join(", ")
                    : "No career talents listed.",
                },
              ]}
            />
          </RuleSummaryPanel>
        </div>
      )}

      {activeInfo?.type === "characteristic" && (
        <div className="p-6 flex flex-col gap-6">
          <RuleSummaryPanel
            title={activeInfo.extra?.label ?? activeInfo.name}
            subtitle={activeInfo.extra?.key ?? ""}
            stats={[
              { label: "Current Value", value: activeInfo.extra?.currentValue ?? "-" },
              {
                label: "Advances",
                value:
                  (activeInfo.extra?.advances ?? 0) +
                  (activeInfo.extra?.pendingAdvances ?? 0),
              },
              { label: "Next Cost", value: activeInfo.extra?.nextCost ?? "-" },
              {
                label: "Unlocked At Rank",
                value: activeInfo.extra?.availableFromRank ?? "-",
              },
            ]}
          >
            <RuleDescription>
              {getCharacteristicDescription(activeInfo.extra?.key ?? activeInfo.name)}
            </RuleDescription>
          </RuleSummaryPanel>
        </div>
      )}

      {activeInfo?.type === "spell" && (
        <>
          {[...characterData.spells]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((spell) => (
              <RuleListEntry
                key={spell.name}
                title={spell.name}
                isActive={activeInfo.name === spell.name}
                details={getSpellStats(spell, formatSpellDuration)}
                innerRef={(el) => {
                  spellListRefs.current[spell.name] = el;
                }}
              >
                {spell.description ||
                  "A standard spell. Consult the WFRP Core Rulebook for deep tactical situational rules."}
              </RuleListEntry>
            ))}
        </>
      )}

      {activeInfo?.type === "talent" &&
        [...new Set([...advancementTalentNames, ...characterData.talents.map((talent) => talent.name)])]
          .sort((a, b) => a.localeCompare(b))
          .map((talentName) => {
            const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
            const isOwned = characterData.talents.some((talent) => talent.name === talentName);

            return (
              <RuleListEntry
                key={talentName}
                title={talentName}
                isActive={activeInfo.name === talentName}
                details={[
                  {
                    label: "Status",
                    value: isOwned ? "Owned" : "Available through advancement",
                  },
                ]}
                innerRef={(el) => {
                  talentListRefs.current[talentName] = el;
                }}
              >
                {talentDefinition?.description ||
                  "This talent is available through advancement, but it is not yet owned by the character."}
              </RuleListEntry>
            );
          })}

      {activeInfo?.type === "equipment" &&
        [...characterData.equipment]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((item) => (
          <RuleListEntry
            key={item.name}
            title={item.name}
            isActive={activeInfo.name === item.name}
            details={getEquipmentStats(item, ruleset)}
            innerRef={(el) => {
              equipmentListRefs.current[item.name] = el;
            }}
          >
            <div className="flex flex-col gap-4">
              <p>{item.description}</p>
              <RuleDetailSections sections={getEquipmentSections(item)} />
            </div>
          </RuleListEntry>
        ))}
    </RuleSidebarShell>
  );
}
