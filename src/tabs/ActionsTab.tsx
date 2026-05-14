import { ChevronDown } from "lucide-react";
import { InlineSubtabs } from "../components/ui";
import type { ActiveInfoState } from "../components/appTypes";
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
const mobileActionSummaryClass =
  "grid min-h-11 cursor-pointer list-none grid-cols-[40px_minmax(0,1fr)_auto_auto] items-center gap-2 md:contents [&::-webkit-details-marker]:hidden";
const mobileActionInfoButtonClass =
  "min-h-8 rounded border border-white/10 px-2 text-[10px] font-black uppercase tracking-wider text-gray-300 hover:border-wfrp-gold/40 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 md:hidden";
const mobileActionDetailsClass =
  "mt-2 grid grid-cols-2 gap-2 rounded border border-white/5 bg-black/20 p-2 md:hidden";

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

function MobileDetail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="wfrp-table-label">{label}</div>
      <div className="wfrp-list-cell-strong">{value}</div>
    </div>
  );
}

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
  setRollAdjustments,
  setActiveInfo,
  clearRollCharacteristic,
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
  setRollAdjustments: (modifier: number, targetBonusSources: RollBonusSource[]) => void;
  setActiveInfo: (activeInfo: ActiveInfoState | null) => void;
  clearRollCharacteristic: () => void;
}) {
  const attributes = characterData.attributes;

  const openPropertyInfo = (name: string, weaponProperties?: string[]) => {
    setActiveInfo({
      type: "property",
      name,
      extra: weaponProperties ? { weaponProperties } : undefined,
    });
    clearRollCharacteristic();
  };

  const applyActionAdjustments = (action: Pick<CombatAction, "modifier" | "targetBonusSources">) => {
    if (action.modifier !== 0 || action.targetBonusSources?.length) {
      setRollAdjustments(action.modifier, action.targetBonusSources ?? []);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <InlineSubtabs<ActionCategory>
        options={[
          { id: "all", label: "All" },
          { id: "melee", label: "Melee" },
          { id: "ranged", label: "Ranged" },
          { id: "other", label: "Other" },
        ]}
        activeId={activeActionCategory}
        onChange={setActiveActionCategory}
      />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
        {characterData.spells.length > 0 && (activeActionCategory === "all" || activeActionCategory === "other") && (() => {
          const baseWP = attributes.WP || 0;
          const channellingSkill = characterSkills.find((skill) => skill.baseName === "Channelling");
          const totalChannelingValue = channellingSkill ? baseWP + channellingSkill.advances : baseWP;
          const channelingAction = {
            name: "Language (Magick)",
            char: "WP" as Characteristic["key"],
            properties: ["Spellcasting"],
          };
          const openChannelingInfo = () => setActiveInfo({
            type: "attack",
            name: "Channeling",
            extra: {
              ...channelingAction,
              totalValue: totalChannelingValue,
              weaponName: "Channeling",
              weaponType: "Character Action",
            },
          });

          return (
            <div className="wfrp-subpanel-shell flex flex-col">
              <div className="hidden grid-cols-[60px_1fr_1fr] gap-2 lg:gap-4 px-4 py-1 bg-black/10 border-b border-white/5 items-center md:grid">
                <span className="wfrp-table-label col-span-2 text-left">Channeling</span>
                <span className="wfrp-table-label text-left">Notes</span>
              </div>

              <div className="divide-y divide-white/5">
                <div className="wfrp-table-row group md:grid md:grid-cols-[60px_1fr_1fr] md:items-center md:gap-2 lg:gap-4">
                  <details className="group/details md:contents">
                    <summary className={mobileActionSummaryClass}>
                      <div className="flex justify-center">
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            handleRoll({ key: "WP", label: "Language (Magick)" }, undefined, { testType: "channeling" });
                          }}
                          className="wfrp-roll-btn"
                          aria-label="Roll Channeling"
                        >
                          {totalChannelingValue}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          openChannelingInfo();
                        }}
                        className="wfrp-skill-link min-w-0 truncate text-left"
                      >
                        {channelingAction.name}
                      </button>
                      <button type="button" onClick={(event) => { event.preventDefault(); openChannelingInfo(); }} className={mobileActionInfoButtonClass}>
                        Info
                      </button>
                      <ChevronDown size={14} className="text-gray-500 transition-transform group-open/details:rotate-180 md:hidden" aria-hidden="true" />
                      <div className="hidden w-full flex-wrap content-start items-center gap-x-1 md:flex">
                        {channelingAction.properties.map((prop, propIndex) => (
                          <span key={prop} className="text-xs font-semibold text-gray-400">
                            <button
                              onClick={() => openPropertyInfo(prop, channelingAction.properties)}
                              className="cursor-pointer text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 rounded-sm"
                            >
                              {prop === "Spellcasting" ? "Spell Focus" : prop}
                            </button>
                            {propIndex < channelingAction.properties.length - 1 ? "," : ""}
                          </span>
                        ))}
                      </div>
                    </summary>
                    <div className={mobileActionDetailsClass}>
                      <MobileDetail label="Type" value="Channeling" />
                      <MobileDetail label="Notes" value="Spell Focus" />
                    </div>
                  </details>
                </div>
              </div>
            </div>
          );
        })()}

        {equipmentState
          .filter((item) => item.type.includes("Weapon") && !item.containerId)
          .filter((item) => {
            if (activeActionCategory === "all") return true;
            if (activeActionCategory === "melee") return item.type.includes("Melee");
            if (activeActionCategory === "ranged") return item.type.includes("Ranged");
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

            return (
              <div key={weapon.name} className="wfrp-subpanel-shell flex flex-col">
                {isMelee ? (
                  <>
                    <div className="hidden grid-cols-[60px_1fr_60px_80px_1fr] gap-2 lg:gap-4 px-4 py-1 bg-black/10 border-b border-white/5 items-center md:grid">
                      <span className="wfrp-table-label col-span-2 text-left">{weapon.name}</span>
                      <span className="wfrp-table-label text-left">Dmg</span>
                      <span className="wfrp-table-label text-left">Reach</span>
                      <span className="wfrp-table-label text-left">Properties</span>
                    </div>

                    <div className="divide-y divide-white/5">
                      {actions.map((action, idx) => {
                        const totalActionValue = action.totalValue + action.modifier + getTargetBonusTotal(action.targetBonusSources ?? []);
                        const openActionInfo = () => setActiveInfo({
                          type: "attack",
                          name: action.name,
                          extra: {
                            ...action,
                            totalValue: totalActionValue,
                            weaponName: weapon.name,
                            weaponType: weapon.type,
                          },
                        });

                        return (
                          <div key={idx} className="wfrp-table-row group md:grid md:grid-cols-[60px_1fr_60px_80px_1fr] md:items-center md:gap-2 lg:gap-4">
                            <details className="group/details md:contents">
                              <summary className={mobileActionSummaryClass}>
                                <div className="flex justify-center">
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
                                </div>
                                <button type="button" onClick={(event) => { event.preventDefault(); openActionInfo(); }} className="wfrp-skill-link min-w-0 truncate text-left">
                                  {action.name}
                                </button>
                                <button type="button" onClick={(event) => { event.preventDefault(); openActionInfo(); }} className={mobileActionInfoButtonClass}>
                                  Info
                                </button>
                                <ChevronDown size={14} className="text-gray-500 transition-transform group-open/details:rotate-180 md:hidden" aria-hidden="true" />
                                <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">{action.damage}</div>
                                <div className="hidden wfrp-list-cell-strong md:block">{action.range}</div>
                                <div className="hidden w-full flex-wrap content-start items-center gap-x-1 md:flex">
                                  {action.properties.map((prop, propIndex) => (
                                    <span key={prop} className="text-xs font-semibold text-gray-400">
                                      {rulesIndex.propertyDescriptionByName[prop] ? (
                                        <button onClick={() => openPropertyInfo(prop, action.properties)} className="cursor-pointer text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 rounded-sm">
                                          {prop}
                                        </button>
                                      ) : (
                                        <span>{prop}</span>
                                      )}
                                      {propIndex < action.properties.length - 1 ? "," : ""}
                                    </span>
                                  ))}
                                </div>
                              </summary>
                              <div className={mobileActionDetailsClass}>
                                <MobileDetail label="Weapon" value={weapon.name} />
                                <MobileDetail label="Dmg" value={action.damage} />
                                <MobileDetail label="Reach" value={action.range} />
                                <MobileDetail label="Properties" value={action.properties.length ? action.properties.join(", ") : "-"} />
                              </div>
                            </details>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="hidden grid-cols-[60px_1fr_60px_32px_32px_32px_32px_32px_1fr] gap-2 px-4 py-1 bg-black/10 border-b border-white/5 items-center md:grid">
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
                      {actions.map((action, idx) => {
                        const totalActionValue = action.totalValue + action.modifier + getTargetBonusTotal(action.targetBonusSources ?? []);
                        const openActionInfo = () => setActiveInfo({
                          type: "attack",
                          name: action.name,
                          extra: {
                            ...action,
                            totalValue: totalActionValue,
                            weaponName: weapon.name,
                            weaponType: weapon.type,
                          },
                        });

                        return (
                          <div key={idx} className="wfrp-table-row group md:grid md:grid-cols-[60px_1fr_60px_32px_32px_32px_32px_32px_1fr] md:items-center md:gap-2">
                            <details className="group/details md:contents">
                              <summary className={mobileActionSummaryClass}>
                                <div className="flex justify-center">
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
                                </div>
                                <button type="button" onClick={(event) => { event.preventDefault(); openActionInfo(); }} className="wfrp-skill-link min-w-0 truncate text-left">
                                  {action.name}
                                </button>
                                <button type="button" onClick={(event) => { event.preventDefault(); openActionInfo(); }} className={mobileActionInfoButtonClass}>
                                  Info
                                </button>
                                <ChevronDown size={14} className="text-gray-500 transition-transform group-open/details:rotate-180 md:hidden" aria-hidden="true" />
                                <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">{action.damage}</div>
                                <div className="hidden wfrp-list-cell-strong text-center font-mono opacity-50 md:block">{rangeBands?.pb ?? "-"}</div>
                                <div className="hidden wfrp-list-cell-strong text-center font-mono opacity-70 md:block">{rangeBands?.s ?? "-"}</div>
                                <div className="hidden wfrp-list-cell-strong text-center font-mono text-wfrp-gold md:block">{rangeBands?.a ?? "-"}</div>
                                <div className="hidden wfrp-list-cell-strong text-center font-mono opacity-70 md:block">{rangeBands?.l ?? "-"}</div>
                                <div className="hidden wfrp-list-cell-strong text-center font-mono opacity-50 md:block">{rangeBands?.e ?? "-"}</div>
                                <div className="hidden w-full flex-wrap content-start items-center gap-x-1 md:flex">
                                  {action.properties.map((prop, propIndex) => (
                                    <span key={prop} className="text-xs font-semibold text-gray-400">
                                      {rulesIndex.propertyDescriptionByName[prop] ? (
                                        <button onClick={() => openPropertyInfo(prop, action.properties)} className="cursor-pointer text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 rounded-sm">
                                          {prop}
                                        </button>
                                      ) : (
                                        <span>{prop}</span>
                                      )}
                                      {propIndex < action.properties.length - 1 ? "," : ""}
                                    </span>
                                  ))}
                                </div>
                              </summary>
                              <div className={mobileActionDetailsClass}>
                                <MobileDetail label="Weapon" value={weapon.name} />
                                <MobileDetail label="Dmg" value={action.damage} />
                                <MobileDetail label="Range" value={weaponStats.reach} />
                                <MobileDetail label="Bands" value={`PB ${rangeBands?.pb ?? "-"} / S ${rangeBands?.s ?? "-"} / A ${rangeBands?.a ?? "-"} / L ${rangeBands?.l ?? "-"} / E ${rangeBands?.e ?? "-"}`} />
                                <MobileDetail label="Properties" value={action.properties.length ? action.properties.join(", ") : "-"} />
                              </div>
                            </details>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}

        {(activeActionCategory === "all" || activeActionCategory === "other") && (
          <div className="wfrp-subpanel-shell flex flex-col opacity-80 hover:opacity-100 transition-opacity">
            <div className="hidden grid-cols-[60px_1fr_60px_80px_1fr] gap-2 lg:gap-4 px-4 py-1 bg-black/10 border-b border-white/5 items-center md:grid">
              <span className="wfrp-table-label col-span-2 text-left">Maneuvers</span>
              <span className="wfrp-table-label text-left">Dmg</span>
              <span className="wfrp-table-label text-left">Reach</span>
              <span className="wfrp-table-label text-left">Notes</span>
            </div>

            <div className="divide-y divide-white/5">
              {[
                { name: "Move", char: "Ag" as Characteristic["key"], range: `${characterData.move}`, properties: [], modifier: 0, damage: "-", type: "other" },
                { name: "Defend", char: "WS" as Characteristic["key"], range: "-", properties: [], modifier: 0, targetBonusSources: [{ label: "Defense", value: 20 }], damage: "-", type: "other" },
                { name: "Disengage", char: "Ag" as Characteristic["key"], range: "-", properties: ["Retreat"], modifier: 0, damage: "-", type: "other" },
                { name: "Grapple", char: "WS" as Characteristic["key"], range: "Reach", properties: ["Stun"], modifier: 0, damage: "SB", type: "melee" },
              ]
                .filter((action) => activeActionCategory === "all" || action.type === activeActionCategory)
                .map((action) => {
                  const baseValue = attributes[action.char] || 0;
                  const skill = characterSkills.find((entry) => entry.displayName.includes(action.name));
                  const totalValue = skill ? baseValue + skill.advances : baseValue;
                  const strValue = attributes.S || 0;
                  const sb = Math.floor(strValue / 10);
                  const finalDamage = action.damage === "SB" ? `+${sb}` : action.damage;
                  const totalActionValue = totalValue + action.modifier + getTargetBonusTotal(action.targetBonusSources ?? []);
                  const openManeuverInfo = () => setActiveInfo({
                    type: "attack",
                    name: action.name,
                    extra: {
                      ...action,
                      totalValue: totalActionValue,
                      damage: finalDamage,
                      properties: action.properties,
                    },
                  });

                  return (
                    <div key={action.name} className="wfrp-table-row group md:grid md:grid-cols-[60px_1fr_60px_80px_1fr] md:items-center md:gap-2 lg:gap-4">
                      <details className="group/details md:contents">
                        <summary className={mobileActionSummaryClass}>
                          <div className="flex justify-center">
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
                          </div>
                          <button type="button" onClick={(event) => { event.preventDefault(); openManeuverInfo(); }} className="wfrp-skill-link min-w-0 truncate text-left">
                            {action.name}
                          </button>
                          <button type="button" onClick={(event) => { event.preventDefault(); openManeuverInfo(); }} className={mobileActionInfoButtonClass}>
                            Info
                          </button>
                          <ChevronDown size={14} className="text-gray-500 transition-transform group-open/details:rotate-180 md:hidden" aria-hidden="true" />
                          <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">{finalDamage}</div>
                          <div className="hidden wfrp-list-cell-strong md:block">{action.range}</div>
                          <div className="hidden w-full flex-wrap content-start items-center gap-x-1 md:flex">
                            {action.properties.map((prop, propIndex) => (
                              <span key={prop} className="text-xs font-semibold text-gray-400">
                                <button onClick={() => openPropertyInfo(prop)} className="cursor-pointer text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 rounded-sm">
                                  {prop}
                                </button>
                                {propIndex < action.properties.length - 1 ? "," : ""}
                              </span>
                            ))}
                          </div>
                        </summary>
                        <div className={mobileActionDetailsClass}>
                          <MobileDetail label="Dmg" value={finalDamage} />
                          <MobileDetail label="Reach" value={action.range} />
                          <MobileDetail label="Properties" value={action.properties.length ? action.properties.join(", ") : "-"} />
                        </div>
                      </details>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
