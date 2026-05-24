import { useEffect } from "react";
import { InlineSubtabs, SubtabContentFrame } from "../components/ui";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDisclosureCell,
  SheetDataRollCell,
  SheetDataSection,
} from "../components/wfrp";
import type {
  ResolvedCharacterEquipment,
  ResolvedCharacterRecord,
  ResolvedCharacterSkill,
} from "../data/characters/resolved";
import { getWeaponStats } from "../lib/gameSession";
import type { RulesIndex } from "../lib/gameSession";
import type { Characteristic } from "../types";
import type { ActionCategory } from "./tabTypes";

type RollBonusSource = {
  label: string;
  value: number;
};

type RollOptions = {
  bonuses?: RollBonusSource[];
  slBonus?: number;
  slBonusLabel?: string | null;
  testType?: "dramatic" | "attack" | "channeling";
  title?: string | null;
  baseValueOverride?: number | null;
};

type CombatAction = {
  id?: string;
  name: string;
  char: Characteristic["key"];
  totalValue: number;
  modifier: number;
  targetBonusSources?: RollBonusSource[];
  rollDamage?: number;
  damage: string;
  range: string;
  properties: string[];
  bonuses?: RollBonusSource[];
  note?: string;
};

const offensiveProperties = ["Damaging", "Hack", "Impact", "Impale", "Precise", "Pummel", "Trap-blade", "Wrap"];
const defensiveProperties = ["Defensive", "Shield"];
const channelingGridClass = "md:grid-cols-[56px_minmax(0,1fr)_48px]";
const weaponActionGridClass = "md:grid-cols-[56px_minmax(0,1fr)_56px_80px_160px_48px]";
const rangedActionGridClass =
  "md:grid-cols-[56px_minmax(0,1fr)_56px_32px_32px_32px_32px_32px_160px_48px]";
const actionSummaryGridClass = "grid-cols-[40px_minmax(0,1fr)_48px]";

const getRelevantWeaponProperties = (actionId: string, properties: string[]) => {
  if (actionId === "attack" || actionId === "charge") {
    return properties.filter((property) => offensiveProperties.includes(property));
  }

  if (actionId === "parry" || actionId === "defend") {
    return properties.filter(
      (property) =>
        defensiveProperties.includes(property) ||
        property.startsWith("Shield "),
    );
  }

  return [];
};

export function ActionsTab({
  activeActionCategory,
  setActiveActionCategory,
  characterData,
  characterSkills,
  equipmentState,
  rulesIndex,
  getCharacteristicLabel,
  getTargetBonusTotal,
  handleRoll,
  isPrayerMode = false,
  setRollAdjustments,
}: {
  activeActionCategory: ActionCategory;
  setActiveActionCategory: (category: ActionCategory) => void;
  characterData: ResolvedCharacterRecord;
  characterSkills: ResolvedCharacterSkill[];
  equipmentState: ResolvedCharacterEquipment[];
  rulesIndex: RulesIndex;
  getCharacteristicLabel: (key: Characteristic["key"]) => string;
  getTargetBonusTotal: (targetBonusSources: RollBonusSource[]) => number;
  handleRoll: (
    characteristic: Characteristic,
    damage?: number,
    options?: RollOptions,
  ) => void;
  isPrayerMode?: boolean;
  setRollAdjustments: (modifier: number, targetBonusSources: RollBonusSource[]) => void;
}) {
  const attributes = characterData.attributes;
  const hasMagicActions = characterData.spells.length > 0;
  const hasMeleeActions = equipmentState.some((item) => item.type.includes("Weapon") && item.type.includes("Melee") && !item.containerId);
  const hasRangedActions = equipmentState.some((item) => item.type.includes("Weapon") && item.type.includes("Ranged") && !item.containerId);
  const maneuverActions = [
    { name: "Move", char: "Ag" as Characteristic["key"], range: `${characterData.move}`, properties: [], modifier: 0, damage: "-", type: "other" },
    { name: "Defend", char: "WS" as Characteristic["key"], range: "-", properties: [], modifier: 0, targetBonusSources: [{ label: "Defense", value: 20 }], damage: "-", type: "other" },
    { name: "Disengage", char: "Ag" as Characteristic["key"], range: "-", properties: ["Retreat"], modifier: 0, damage: "-", type: "other" },
    { name: "Grapple", char: "WS" as Characteristic["key"], range: "Reach", properties: ["Stun"], modifier: 0, damage: "SB", type: "melee" },
  ];
  const hasOtherActions = maneuverActions.some((action) => action.type === "other");
  const actionCategoryOptions = [
    { id: "all" as const, label: "All" },
    ...(hasMagicActions ? [{ id: "magic" as const, label: isPrayerMode ? "Prayer" : "Magic" }] : []),
    ...(hasMeleeActions ? [{ id: "melee" as const, label: "Melee" }] : []),
    ...(hasRangedActions ? [{ id: "ranged" as const, label: "Ranged" }] : []),
    ...(hasOtherActions ? [{ id: "other" as const, label: "Other" }] : []),
  ];
  const visibleActionCategory = actionCategoryOptions.some((option) => option.id === activeActionCategory)
    ? activeActionCategory
    : "all";

  useEffect(() => {
    if (visibleActionCategory !== activeActionCategory) {
      setActiveActionCategory(visibleActionCategory);
    }
  }, [activeActionCategory, setActiveActionCategory, visibleActionCategory]);

  const renderPropertyDetails = (properties: string[]) => {
    const describedProperties = properties
      .map((property) => ({
        description: rulesIndex.propertyDescriptionByName[property],
        property,
      }))
      .filter((entry) => entry.description);

    if (describedProperties.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-col gap-1 border-t border-white/10 pt-2">
        {describedProperties.map(({ description, property }) => (
          <div key={property} className="text-[11px] leading-relaxed">
            <span className="wfrp-list-cell-strong text-wfrp-muted-text">{property}: </span>
            <span className="wfrp-sidebar-body text-card-foreground">{description}</span>
          </div>
        ))}
      </div>
    );
  };

  const applyActionAdjustments = (action: Pick<CombatAction, "modifier" | "targetBonusSources">) => {
    if (action.modifier !== 0 || action.targetBonusSources?.length) {
      setRollAdjustments(action.modifier, action.targetBonusSources ?? []);
    }
  };

  return (
    <SubtabContentFrame
      subtabBar={(
        <InlineSubtabs<ActionCategory>
          options={actionCategoryOptions}
          activeId={visibleActionCategory}
          onChange={setActiveActionCategory}
        />
      )}
    >
          {hasMagicActions && (visibleActionCategory === "all" || visibleActionCategory === "magic") && (() => {
            const baseWP = attributes.WP || 0;
            const channellingSkill = characterSkills.find((skill) =>
              isPrayerMode ? skill.baseName === "Pray" : skill.baseName === "Channelling",
            );
            const languageMagickSkill = characterSkills.find((skill) => skill.displayName === "Language (Magick)");
            const totalChannelingValue = channellingSkill ? baseWP + channellingSkill.advances : baseWP;
            const baseInt = attributes.Int || 0;
            const totalDispelValue = languageMagickSkill ? baseInt + languageMagickSkill.advances : baseInt;
            const magicActions = [
              {
                name: isPrayerMode ? "Pray" : "Channeling",
                rollLabel: channellingSkill?.displayName ?? (isPrayerMode ? "Pray" : "Channelling"),
                char: "WP" as Characteristic["key"],
                totalValue: totalChannelingValue,
                properties: isPrayerMode ? [] : ["Spell Focus"],
              },
              ...(isPrayerMode
                ? []
                : [{
                    name: "Dispell Magic",
                    rollLabel: "Language (Magick)",
                    char: "Int" as Characteristic["key"],
                    totalValue: totalDispelValue,
                    properties: ["Spell Focus"],
                  }]),
            ];

            return (
              <SheetDataSection
                gridClassName={channelingGridClass}
                headerClassName={actionSummaryGridClass}
                leadingLabels={[{ align: "center", label: "Roll" }]}
                sectionLabel={isPrayerMode ? "Prayer" : "Magic"}
                valueLabels={[{ align: "center", label: "More" }]}
              >
                {magicActions.map((action) => (
                  <SheetDataAccordionRow
                    key={action.name}
                    summaryClassName={`${actionSummaryGridClass} md:grid ${channelingGridClass} md:gap-0`}
                    contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                    summary={(
                      <>
                        <SheetDataRollCell>
                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              handleRoll(
                                { key: action.char, label: action.rollLabel },
                                undefined,
                                {
                                  testType: "channeling",
                                  title: action.name,
                                },
                              );
                            }}
                            className="wfrp-roll-btn"
                            aria-label={`Roll ${action.name}`}
                          >
                            {action.totalValue}
                          </button>
                        </SheetDataRollCell>
                        <span className="wfrp-list-cell-strong min-w-0 truncate text-left text-gray-200">
                          {action.name}
                        </span>
                        <SheetDataDisclosureCell />
                      </>
                    )}
                  >
                    <SheetDataAccordionDetails
                      description={isPrayerMode ? undefined : rulesIndex.actionDescriptionByName.Magic}
                      rows={[
                        { label: "Type", value: isPrayerMode ? "Prayer" : "Magic" },
                        { label: "Roll", value: action.totalValue },
                      ]}
                    >
                      {renderPropertyDetails(action.properties)}
                    </SheetDataAccordionDetails>
                  </SheetDataAccordionRow>
                ))}
              </SheetDataSection>
            );
          })()}

          {equipmentState
            .filter((item) => item.type.includes("Weapon") && !item.containerId)
            .filter((item) => {
              if (visibleActionCategory === "all") return true;
              if (visibleActionCategory === "melee") return item.type.includes("Melee");
              if (visibleActionCategory === "ranged") return item.type.includes("Ranged");
              return false;
            })
            .map((weapon) => {
              const isMelee = weapon.type.includes("Melee");
              const char: Characteristic["key"] = isMelee ? "WS" : "BS";
              const specificSkill = characterSkills.find((skill) => skill.displayName.includes(weapon.name));
              const basicSkill = characterSkills.find((skill) =>
                skill.displayName === (isMelee ? "Melee (Basic)" : "Ranged (Basic)"));
              const skillToUse = specificSkill || basicSkill;
              const rollLabel = skillToUse?.displayName ?? getCharacteristicLabel(char);

              const baseValue = attributes[char] || 0;
              const strValue = attributes.S || 0;
              const sb = Math.floor(strValue / 10);
              const totalSkillValue = skillToUse ? baseValue + skillToUse.advances : baseValue;

              const weaponStats = getWeaponStats(weapon, rulesIndex);
              const damageBonus = parseInt(weaponStats.damage.replace("+SB+", "")) || 0;
              const weaponDamage = sb + (
                weaponStats.damage.includes("+SB")
                  ? (damageBonus || (weaponStats.damage === "+SB" ? 0 : parseInt(weaponStats.damage.replace("+SB", "")) || 0))
                  : parseInt(weaponStats.damage) || 0
              );

              const actions: CombatAction[] = isMelee ? [
                {
                  id: "attack",
                  name: "Attack",
                  char,
                  totalValue: totalSkillValue,
                  modifier: 0,
                  rollDamage: weaponDamage,
                  damage: `+${weaponDamage}`,
                  range: weaponStats.reach,
                  properties: getRelevantWeaponProperties("attack", weaponStats.properties),
                },
                {
                  id: "charge",
                  name: "Charge",
                  char,
                  totalValue: totalSkillValue,
                  modifier: 0,
                  rollDamage: weaponDamage,
                  damage: `+${weaponDamage}`,
                  range: weaponStats.reach,
                  properties: getRelevantWeaponProperties("charge", weaponStats.properties),
                  note: "+1 Advantage if Charge conditions are met",
                },
                {
                  id: "parry",
                  name: "Parry",
                  char,
                  totalValue: totalSkillValue,
                  modifier: 0,
                  rollDamage: undefined,
                  damage: "-",
                  range: weaponStats.reach,
                  properties: getRelevantWeaponProperties("parry", weaponStats.properties),
                  bonuses: weaponStats.properties.includes("Defensive")
                    ? [{ label: "Defensive", value: 1 }]
                    : undefined,
                },
                {
                  id: "defend",
                  name: "Defend",
                  char,
                  totalValue: totalSkillValue,
                  modifier: 0,
                  targetBonusSources: [{ label: "Defense", value: 20 }],
                  rollDamage: undefined,
                  damage: "-",
                  range: "-",
                  properties: getRelevantWeaponProperties("defend", weaponStats.properties),
                  bonuses: weaponStats.properties.includes("Defensive")
                    ? [{ label: "Defensive", value: 1 }]
                    : undefined,
                },
              ] : [
                {
                  id: "attack",
                  name: "Attack",
                  char,
                  totalValue: totalSkillValue,
                  modifier: 0,
                  rollDamage: weaponDamage,
                  damage: `+${weaponDamage}`,
                  range: weaponStats.reach,
                  properties: getRelevantWeaponProperties("attack", weaponStats.properties),
                },
              ];

              const rangeValue = parseInt(weaponStats.reach);
              const rangeBands = !isMelee && !isNaN(rangeValue) ? {
                pb: Math.floor(rangeValue / 10),
                s: Math.floor(rangeValue / 2),
                a: rangeValue,
                l: rangeValue * 2,
                e: rangeValue * 3,
              } : null;

              return isMelee ? (
                <SheetDataSection
                  key={weapon.name}
                  gridClassName={weaponActionGridClass}
                  headerClassName={actionSummaryGridClass}
                  leadingLabels={[{ align: "center", label: "Roll" }]}
                  sectionLabel={weapon.name}
                  valueLabels={[
                    { align: "right", className: "hidden md:block", label: "Dmg" },
                    { align: "right", className: "hidden md:block", label: "Reach" },
                    { align: "right", className: "hidden md:block", label: "Properties" },
                    { align: "center", label: "More" },
                  ]}
                >
                  {actions.map((action, idx) => {
                    const totalActionValue = action.totalValue + action.modifier + getTargetBonusTotal(action.targetBonusSources ?? []);
                    return (
                      <SheetDataAccordionRow
                        key={idx}
                        summaryClassName={`${actionSummaryGridClass} md:grid ${weaponActionGridClass} md:gap-0`}
                        contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                        summary={(
                          <>
                            <SheetDataRollCell>
                              <button
                                onClick={(event) => {
                                  event.preventDefault();
                                  handleRoll(
                                    { key: action.char, label: rollLabel },
                                    action.rollDamage,
                                    {
                                      bonuses: action.bonuses,
                                      title: `${weapon.name} ${action.name}`,
                                    },
                                  );
                                  applyActionAdjustments(action);
                                }}
                                className="wfrp-roll-btn"
                                aria-label={`Roll ${action.name} with ${weapon.name}`}
                              >
                                {totalActionValue}
                              </button>
                            </SheetDataRollCell>
                            <span className="wfrp-list-cell-strong min-w-0 truncate text-left text-gray-200">
                              {action.name}
                            </span>
                            <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">{action.damage}</div>
                            <div className="hidden wfrp-list-cell-strong text-right md:block">{action.range}</div>
                            <div className="hidden w-full flex-wrap content-start items-center justify-end gap-x-1 text-right md:flex">
                              {action.properties.map((prop, propIndex) => (
                                <span key={prop} className="text-xs font-semibold text-wfrp-muted-text">
                                  {prop}
                                  {propIndex < action.properties.length - 1 ? "," : ""}
                                </span>
                              ))}
                            </div>
                            <SheetDataDisclosureCell />
                          </>
                        )}
                      >
                        <SheetDataAccordionDetails
                          description={rulesIndex.actionDescriptionByName[action.name] || action.note}
                          rows={[
                            { label: "Weapon", value: weapon.name },
                            { label: "Roll", value: totalActionValue },
                            { label: "Dmg", value: action.damage },
                            { label: "Reach", value: action.range },
                            { label: "Properties", value: action.properties.length ? action.properties.join(", ") : "-" },
                          ]}
                        >
                          {action.note && rulesIndex.actionDescriptionByName[action.name] ? (
                            <p className="text-[11px] font-bold leading-relaxed text-wfrp-muted-text">{action.note}</p>
                          ) : null}
                          {renderPropertyDetails(action.properties)}
                        </SheetDataAccordionDetails>
                      </SheetDataAccordionRow>
                    );
                  })}
                </SheetDataSection>
              ) : (
                <SheetDataSection
                  key={weapon.name}
                  gridClassName={rangedActionGridClass}
                  headerClassName={actionSummaryGridClass}
                  leadingLabels={[{ align: "center", label: "Roll" }]}
                  sectionLabel={weapon.name}
                  valueLabels={[
                    { align: "right", className: "hidden md:block", label: "Dmg" },
                    { align: "right", className: "hidden md:block", label: "PB" },
                    { align: "right", className: "hidden md:block", label: "S" },
                    { align: "right", className: "hidden md:block", label: "A" },
                    { align: "right", className: "hidden md:block", label: "L" },
                    { align: "right", className: "hidden md:block", label: "E" },
                    { align: "right", className: "hidden md:block", label: "Properties" },
                    { align: "center", label: "More" },
                  ]}
                >
                  {actions.map((action, idx) => {
                    const totalActionValue = action.totalValue + action.modifier + getTargetBonusTotal(action.targetBonusSources ?? []);
                    return (
                      <SheetDataAccordionRow
                        key={idx}
                        summaryClassName={`${actionSummaryGridClass} md:grid ${rangedActionGridClass} md:gap-0`}
                        contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                        summary={(
                          <>
                            <SheetDataRollCell>
                              <button
                                onClick={(event) => {
                                  event.preventDefault();
                                  handleRoll(
                                    { key: action.char, label: rollLabel },
                                    action.rollDamage,
                                    {
                                      bonuses: action.bonuses,
                                      title: `${weapon.name} ${action.name}`,
                                    },
                                  );
                                  applyActionAdjustments(action);
                                }}
                                className="wfrp-roll-btn"
                                aria-label={`Roll ${action.name} with ${weapon.name}`}
                              >
                                {totalActionValue}
                              </button>
                            </SheetDataRollCell>
                            <span className="wfrp-list-cell-strong min-w-0 truncate text-left text-gray-200">
                              {action.name}
                            </span>
                            <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">{action.damage}</div>
                            <div className="hidden wfrp-list-cell-strong text-right font-mono opacity-50 md:block">{rangeBands?.pb ?? "-"}</div>
                            <div className="hidden wfrp-list-cell-strong text-right font-mono opacity-70 md:block">{rangeBands?.s ?? "-"}</div>
                            <div className="hidden wfrp-list-cell-strong text-right font-mono text-wfrp-gold md:block">{rangeBands?.a ?? "-"}</div>
                            <div className="hidden wfrp-list-cell-strong text-right font-mono opacity-70 md:block">{rangeBands?.l ?? "-"}</div>
                            <div className="hidden wfrp-list-cell-strong text-right font-mono opacity-50 md:block">{rangeBands?.e ?? "-"}</div>
                            <div className="hidden w-full flex-wrap content-start items-center justify-end gap-x-1 text-right md:flex">
                              {action.properties.map((prop, propIndex) => (
                                <span key={prop} className="text-xs font-semibold text-wfrp-muted-text">
                                  {prop}
                                  {propIndex < action.properties.length - 1 ? "," : ""}
                                </span>
                              ))}
                            </div>
                            <SheetDataDisclosureCell />
                          </>
                        )}
                      >
                        <SheetDataAccordionDetails
                          description={rulesIndex.actionDescriptionByName[action.name] || action.note}
                          rows={[
                            { label: "Weapon", value: weapon.name },
                            { label: "Roll", value: totalActionValue },
                            { label: "Dmg", value: action.damage },
                            { label: "Range", value: weaponStats.reach },
                            { label: "Bands", value: `PB ${rangeBands?.pb ?? "-"} / S ${rangeBands?.s ?? "-"} / A ${rangeBands?.a ?? "-"} / L ${rangeBands?.l ?? "-"} / E ${rangeBands?.e ?? "-"}` },
                            { label: "Properties", value: action.properties.length ? action.properties.join(", ") : "-" },
                          ]}
                        >
                          {action.note && rulesIndex.actionDescriptionByName[action.name] ? (
                            <p className="text-[11px] font-bold leading-relaxed text-wfrp-muted-text">{action.note}</p>
                          ) : null}
                          {renderPropertyDetails(action.properties)}
                        </SheetDataAccordionDetails>
                      </SheetDataAccordionRow>
                    );
                  })}
                </SheetDataSection>
              );
            })}

          {(visibleActionCategory === "all" || visibleActionCategory === "other") && (
            <SheetDataSection
              gridClassName={weaponActionGridClass}
              headerClassName={actionSummaryGridClass}
              leadingLabels={[{ align: "center", label: "Roll" }]}
              sectionLabel="Maneuvers"
              valueLabels={[
                { align: "right", className: "hidden md:block", label: "Dmg" },
                { align: "right", className: "hidden md:block", label: "Reach" },
                { align: "right", className: "hidden md:block", label: "Notes" },
                { align: "center", label: "More" },
              ]}
            >
              {maneuverActions
                .filter((action) => visibleActionCategory === "all" || action.type === visibleActionCategory)
                .map((action) => {
                  const baseValue = attributes[action.char] || 0;
                  const skill = characterSkills.find((entry) => entry.displayName.includes(action.name));
                  const totalValue = skill ? baseValue + skill.advances : baseValue;
                  const strValue = attributes.S || 0;
                  const sb = Math.floor(strValue / 10);
                  const finalDamage = action.damage === "SB" ? `+${sb}` : action.damage;
                  const totalActionValue = totalValue + action.modifier + getTargetBonusTotal(action.targetBonusSources ?? []);
                  return (
                    <SheetDataAccordionRow
                      key={action.name}
                      summaryClassName={`${actionSummaryGridClass} md:grid ${weaponActionGridClass} md:gap-0`}
                      contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                      summary={(
                        <>
                          <SheetDataRollCell>
                            <button
                              onClick={(event) => {
                                event.preventDefault();
                                handleRoll(
                                  { key: action.char, label: action.name },
                                  action.damage === "SB" ? sb : undefined,
                                  { title: action.name },
                                );
                                if (action.modifier !== 0 || action.targetBonusSources?.length) {
                                  setRollAdjustments(action.modifier, action.targetBonusSources ?? []);
                                }
                              }}
                              className="wfrp-roll-btn"
                              aria-label={`Execute ${action.name}`}
                            >
                              {totalActionValue}
                            </button>
                          </SheetDataRollCell>
                          <span className="wfrp-list-cell-strong min-w-0 truncate text-left text-gray-200">
                            {action.name}
                          </span>
                          <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">{finalDamage}</div>
                          <div className="hidden wfrp-list-cell-strong text-right md:block">{action.range}</div>
                          <div className="hidden w-full flex-wrap content-start items-center justify-end gap-x-1 text-right md:flex">
                            {action.properties.map((prop, propIndex) => (
                              <span key={prop} className="text-xs font-semibold text-wfrp-muted-text">
                                {prop}
                                {propIndex < action.properties.length - 1 ? "," : ""}
                              </span>
                            ))}
                          </div>
                          <SheetDataDisclosureCell />
                        </>
                      )}
                    >
                      <SheetDataAccordionDetails
                        description={rulesIndex.actionDescriptionByName[action.name]}
                        rows={[
                          { label: "Roll", value: totalActionValue },
                          { label: "Dmg", value: finalDamage },
                          { label: "Reach", value: action.range },
                          { label: "Properties", value: action.properties.length ? action.properties.join(", ") : "-" },
                        ]}
                      >
                        {renderPropertyDetails(action.properties)}
                      </SheetDataAccordionDetails>
                    </SheetDataAccordionRow>
                  );
                })}
            </SheetDataSection>
          )}
    </SubtabContentFrame>
  );
}
