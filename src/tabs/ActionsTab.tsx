import { InlineSubtabs } from "../components/ui";
import {
  SheetDataDisclosureChevron,
  SheetDataHeader,
  SheetDataInfoButton,
  SheetDataPanel,
  SheetDataResponsiveListRow,
  SheetDataTable,
} from "../components/wfrp";
import type { ActiveInfoState } from "../components/appTypes";
import type {
  ResolvedCharacterEquipment,
  ResolvedCharacterRecord,
  ResolvedCharacterSkill,
} from "../data/characters/resolved";
import type { RulesIndex } from "../lib/gameSession";
import type { Characteristic } from "../types";
import type { ActionCategory } from "./tabTypes";
import { useActionsViewModel } from "./actions/useActionsViewModel";
import type { CombatAction, RollBonusSource } from "./actions/useActionsViewModel";

type RollOptions = {
  bonuses?: RollBonusSource[];
  slBonus?: number;
  slBonusLabel?: string | null;
  testType?: "dramatic" | "attack" | "channeling";
  title?: string | null;
  baseValueOverride?: number | null;
};

const channelingGridClass = "md:grid-cols-[60px_1fr_1fr] md:gap-2 lg:gap-4";
const weaponActionGridClass = "md:grid-cols-[60px_1fr_60px_80px_1fr] md:gap-2 lg:gap-4";
const rangedActionGridClass =
  "md:grid-cols-[60px_1fr_60px_32px_32px_32px_32px_32px_1fr] md:gap-2";

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
  const { channelingRow, maneuverRows, weaponRows } = useActionsViewModel({
    activeActionCategory,
    characterData,
    characterSkills,
    equipmentState,
    getCharacteristicLabel,
    getTargetBonusTotal,
    rulesIndex,
  });

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
        {channelingRow && (() => {
          const { action: channelingAction, mobileDetails, totalValue: totalChannelingValue } = channelingRow;
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
            <SheetDataPanel>
              <SheetDataHeader className={`hidden ${channelingGridClass} md:grid`}>
                <span className="wfrp-table-label col-span-2 text-left">Channeling</span>
                <span className="wfrp-table-label text-left">Notes</span>
              </SheetDataHeader>

              <SheetDataTable>
                <SheetDataResponsiveListRow
                  summaryClassName="grid-cols-[40px_minmax(0,1fr)_auto_auto]"
                  desktopClassName="grid-cols-[60px_1fr_1fr] gap-2 lg:gap-4"
                  mobileSummary={(
                    <>
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
                      <SheetDataInfoButton onClick={(event) => { event.preventDefault(); openChannelingInfo(); }} />
                      <SheetDataDisclosureChevron />
                    </>
                  )}
                  mobileDetails={mobileDetails}
                  desktopContent={(
                    <>
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
                        onClick={openChannelingInfo}
                        className="wfrp-skill-link min-w-0 truncate text-left"
                      >
                        {channelingAction.name}
                      </button>
                      <div className="flex w-full flex-wrap content-start items-center gap-x-1">
                        {channelingAction.properties.map((prop, propIndex) => (
                          <span key={prop} className="text-xs font-semibold text-gray-400">
                            <button
                              onClick={() => openPropertyInfo(prop, channelingAction.properties)}
                              className="cursor-pointer rounded-sm text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40"
                            >
                              {prop === "Spellcasting" ? "Spell Focus" : prop}
                            </button>
                            {propIndex < channelingAction.properties.length - 1 ? "," : ""}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                />
              </SheetDataTable>
            </SheetDataPanel>
          );
        })()}

        {weaponRows.map(({ actions, isMelee, rangeBands, rollLabel, weapon }) => (
          <SheetDataPanel key={weapon.name}>
            {isMelee ? (
              <>
                <SheetDataHeader className={`hidden ${weaponActionGridClass} md:grid`}>
                  <span className="wfrp-table-label col-span-2 text-left">{weapon.name}</span>
                  <span className="wfrp-table-label text-left">Dmg</span>
                  <span className="wfrp-table-label text-left">Reach</span>
                  <span className="wfrp-table-label text-left">Properties</span>
                </SheetDataHeader>

                <SheetDataTable>
                  {actions.map(({ action, mobileDetails, totalActionValue }, idx) => {
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

                    const executeActionRoll = () => {
                      handleRoll(
                        { key: action.char, label: rollLabel },
                        action.rollDamage,
                        {
                          bonuses: action.bonuses,
                          title: `${weapon.name} ${action.name}`,
                        },
                      );
                      applyActionAdjustments(action);
                    };
                    const propertyButtons = action.properties.map((prop, propIndex) => (
                      <span key={prop} className="text-xs font-semibold text-gray-400">
                        {rulesIndex.propertyDescriptionByName[prop] ? (
                          <button onClick={() => openPropertyInfo(prop, action.properties)} className="cursor-pointer rounded-sm text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40">
                            {prop}
                          </button>
                        ) : (
                          <span>{prop}</span>
                        )}
                        {propIndex < action.properties.length - 1 ? "," : ""}
                      </span>
                    ));

                    return (
                      <SheetDataResponsiveListRow
                        key={idx}
                        summaryClassName="grid-cols-[40px_minmax(0,1fr)_auto_auto]"
                        desktopClassName="grid-cols-[60px_1fr_60px_80px_1fr] gap-2 lg:gap-4"
                        mobileSummary={(
                          <>
                            <div className="flex justify-center">
                              <button
                                onClick={(event) => {
                                  event.preventDefault();
                                  executeActionRoll();
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
                            <SheetDataInfoButton onClick={(event) => { event.preventDefault(); openActionInfo(); }} />
                            <SheetDataDisclosureChevron />
                          </>
                        )}
                        mobileDetails={mobileDetails}
                        desktopContent={(
                          <>
                            <div className="flex justify-center">
                              <button
                                onClick={(event) => {
                                  event.preventDefault();
                                  executeActionRoll();
                                }}
                                className="wfrp-roll-btn"
                                aria-label={`Roll ${action.name} with ${weapon.name}`}
                              >
                                {totalActionValue}
                              </button>
                            </div>
                            <button type="button" onClick={openActionInfo} className="wfrp-skill-link min-w-0 truncate text-left">
                              {action.name}
                            </button>
                            <div className="wfrp-list-cell-strong text-center font-mono">{action.damage}</div>
                            <div className="wfrp-list-cell-strong">{action.range}</div>
                            <div className="flex w-full flex-wrap content-start items-center gap-x-1">
                              {propertyButtons}
                            </div>
                          </>
                        )}
                      />
                    );
                  })}
                </SheetDataTable>
              </>
            ) : (
              <>
                <SheetDataHeader className={`hidden ${rangedActionGridClass} md:grid`}>
                  <span className="wfrp-table-label col-span-2 text-left">{weapon.name}</span>
                  <span className="wfrp-table-label text-left">Dmg</span>
                  <span className="wfrp-table-label text-left">PB</span>
                  <span className="wfrp-table-label text-left">S</span>
                  <span className="wfrp-table-label text-left">A</span>
                  <span className="wfrp-table-label text-left">L</span>
                  <span className="wfrp-table-label text-left">E</span>
                  <span className="wfrp-table-label text-left">Properties</span>
                </SheetDataHeader>

                <SheetDataTable>
                  {actions.map(({ action, mobileDetails, totalActionValue }, idx) => {
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

                    const executeActionRoll = () => {
                      handleRoll(
                        { key: action.char, label: rollLabel },
                        action.rollDamage,
                        {
                          bonuses: action.bonuses,
                          title: `${weapon.name} ${action.name}`,
                        },
                      );
                      applyActionAdjustments(action);
                    };
                    const propertyButtons = action.properties.map((prop, propIndex) => (
                      <span key={prop} className="text-xs font-semibold text-gray-400">
                        {rulesIndex.propertyDescriptionByName[prop] ? (
                          <button onClick={() => openPropertyInfo(prop, action.properties)} className="cursor-pointer rounded-sm text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40">
                            {prop}
                          </button>
                        ) : (
                          <span>{prop}</span>
                        )}
                        {propIndex < action.properties.length - 1 ? "," : ""}
                      </span>
                    ));

                    return (
                      <SheetDataResponsiveListRow
                        key={idx}
                        summaryClassName="grid-cols-[40px_minmax(0,1fr)_auto_auto]"
                        desktopClassName="grid-cols-[60px_1fr_60px_32px_32px_32px_32px_32px_1fr] gap-2"
                        mobileSummary={(
                          <>
                            <div className="flex justify-center">
                              <button
                                onClick={(event) => {
                                  event.preventDefault();
                                  executeActionRoll();
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
                            <SheetDataInfoButton onClick={(event) => { event.preventDefault(); openActionInfo(); }} />
                            <SheetDataDisclosureChevron />
                          </>
                        )}
                        mobileDetails={mobileDetails}
                        desktopContent={(
                          <>
                            <div className="flex justify-center">
                              <button
                                onClick={(event) => {
                                  event.preventDefault();
                                  executeActionRoll();
                                }}
                                className="wfrp-roll-btn"
                                aria-label={`Roll ${action.name} with ${weapon.name}`}
                              >
                                {totalActionValue}
                              </button>
                            </div>
                            <button type="button" onClick={openActionInfo} className="wfrp-skill-link min-w-0 truncate text-left">
                              {action.name}
                            </button>
                            <div className="wfrp-list-cell-strong text-center font-mono">{action.damage}</div>
                            <div className="wfrp-list-cell-strong text-center font-mono opacity-50">{rangeBands?.pb ?? "-"}</div>
                            <div className="wfrp-list-cell-strong text-center font-mono opacity-70">{rangeBands?.s ?? "-"}</div>
                            <div className="wfrp-list-cell-strong text-center font-mono text-wfrp-gold">{rangeBands?.a ?? "-"}</div>
                            <div className="wfrp-list-cell-strong text-center font-mono opacity-70">{rangeBands?.l ?? "-"}</div>
                            <div className="wfrp-list-cell-strong text-center font-mono opacity-50">{rangeBands?.e ?? "-"}</div>
                            <div className="flex w-full flex-wrap content-start items-center gap-x-1">
                              {propertyButtons}
                            </div>
                          </>
                        )}
                      />
                    );
                  })}
                </SheetDataTable>
              </>
            )}
          </SheetDataPanel>
        ))}

        {(activeActionCategory === "all" || activeActionCategory === "other") && (
          <SheetDataPanel className="opacity-80 transition-opacity hover:opacity-100">
            <SheetDataHeader className={`hidden ${weaponActionGridClass} md:grid`}>
              <span className="wfrp-table-label col-span-2 text-left">Maneuvers</span>
              <span className="wfrp-table-label text-left">Dmg</span>
              <span className="wfrp-table-label text-left">Reach</span>
              <span className="wfrp-table-label text-left">Notes</span>
            </SheetDataHeader>

            <SheetDataTable>
              {maneuverRows.map(({ action, finalDamage, mobileDetails, rollDamage, totalActionValue }) => {
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
                const executeManeuverRoll = () => {
                  handleRoll(
                    { key: action.char, label: action.name },
                    rollDamage,
                    { title: action.name },
                  );
                  applyActionAdjustments(action);
                };
                const propertyButtons = action.properties.map((prop, propIndex) => (
                  <span key={prop} className="text-xs font-semibold text-gray-400">
                    <button onClick={() => openPropertyInfo(prop)} className="cursor-pointer rounded-sm text-left hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40">
                      {prop}
                    </button>
                    {propIndex < action.properties.length - 1 ? "," : ""}
                  </span>
                ));

                return (
                  <SheetDataResponsiveListRow
                    key={action.name}
                    summaryClassName="grid-cols-[40px_minmax(0,1fr)_auto_auto]"
                    desktopClassName="grid-cols-[60px_1fr_60px_80px_1fr] gap-2 lg:gap-4"
                    mobileSummary={(
                      <>
                        <div className="flex justify-center">
                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              executeManeuverRoll();
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
                        <SheetDataInfoButton onClick={(event) => { event.preventDefault(); openManeuverInfo(); }} />
                        <SheetDataDisclosureChevron />
                      </>
                    )}
                    mobileDetails={mobileDetails}
                    desktopContent={(
                      <>
                        <div className="flex justify-center">
                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              executeManeuverRoll();
                            }}
                            className="wfrp-roll-btn"
                            aria-label={`Execute ${action.name}`}
                          >
                            {totalActionValue}
                          </button>
                        </div>
                        <button type="button" onClick={openManeuverInfo} className="wfrp-skill-link min-w-0 truncate text-left">
                          {action.name}
                        </button>
                        <div className="wfrp-list-cell-strong text-center font-mono">{finalDamage}</div>
                        <div className="wfrp-list-cell-strong">{action.range}</div>
                        <div className="flex w-full flex-wrap content-start items-center gap-x-1">
                          {propertyButtons}
                        </div>
                      </>
                    )}
                  />
                );
              })}
            </SheetDataTable>
          </SheetDataPanel>
        )}
      </div>
    </div>
  );
}
