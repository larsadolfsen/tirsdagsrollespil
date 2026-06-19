import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";
import type { ResolvedCharacterRecord } from "../data/characters/resolved";
import {
  calculateAdjustedSl,
  calculateAttackDamage,
  calculateRollFlags,
  getWeaponTraitNotes,
} from "../lib/rollMechanics";
import { DigitReel } from "./DigitReel";
import { WfrpStandardBtn, WfrpStandardIcon } from "./ui";
import type { RollHistoryItem, RollState } from "./appTypes";

export function DiceRoller({
  characterData,
  rollState,
  setRollState,
  rollHistory,
  setRollHistory,
  activeRollerRef,
  fortuneCurrent,
  executeRoll,
  handleReroll,
  getOutcome,
}: {
  characterData: ResolvedCharacterRecord;
  rollState: RollState;
  setRollState: Dispatch<SetStateAction<RollState>>;
  rollHistory: RollHistoryItem[];
  setRollHistory: Dispatch<SetStateAction<RollHistoryItem[]>>;
  activeRollerRef: MutableRefObject<HTMLDivElement | null>;
  fortuneCurrent: number;
  executeRoll: () => void;
  handleReroll: () => void;
  getOutcome: (sl: number, isSuccess: boolean) => string;
}) {
  const getTargetBonusTotal = (targetBonusSources = rollState.targetBonusSources ?? []) =>
    targetBonusSources.reduce((sum, bonus) => sum + bonus.value, 0);
  const adjustedSl = calculateAdjustedSl(rollState);
  const currentDamage = calculateAttackDamage(rollState);
  const rollFlags = calculateRollFlags(rollState);
  const traitNotes = getWeaponTraitNotes(rollState);

  return (
    <AnimatePresence mode="wait">
      {rollState.characteristic && (
        <motion.aside
          key="dice-roller"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="wfrp-sidebar-shell w-[360px]"
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar min-h-0 flex flex-col bg-black/10">
            <div className="wfrp-sidebar-header p-3 shrink-0 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-bold text-base leading-none text-gray-100">Dice Log</h2>
                  <p className="text-[10px] text-wfrp-muted-text uppercase font-bold tracking-widest mt-1">
                    Roll & Results
                  </p>
                </div>
              </div>
              <WfrpStandardIcon
                onClick={() => {
                  if (rollState.characteristic && rollState.result !== null) {
                    const target =
                      (characterData.attributes as Record<string, number>)[
                        rollState.characteristic.key
                      ] + rollState.modifier + getTargetBonusTotal();
                    const adjustedHistorySl = calculateAdjustedSl(rollState).total;
                    const damage = calculateAttackDamage(rollState);
                    const flags = calculateRollFlags(rollState);
                    const historyItem: RollHistoryItem = {
                      id: Math.random().toString(36).substring(2, 9),
                      label: rollState.characteristic.label,
                      result: rollState.result,
                      sl: adjustedHistorySl,
                      isSuccess: rollState.isSuccess || false,
                      modifier: rollState.modifier,
                      targetBonusSources: rollState.targetBonusSources ?? [],
                      target,
                      damage: damage?.total ?? null,
                      isCritical: flags.isCritical,
                      isFumble: flags.isFumble,
                    };
                    setRollHistory((prev) => [historyItem, ...prev]);
                  }
                  setRollState((prev) => ({ ...prev, characteristic: null }));
                }}
                label="Close dice log"
                icon={<X />}
              />
            </div>

            <div className="p-4 flex flex-col pt-8">
              <div className="flex flex-col gap-12 mb-12">
                {rollHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-1 px-1"
                  >
                    <h3 className="text-sm font-bold font-serif uppercase tracking-tight text-white/50">
                      {item.label} Roll
                    </h3>
                    <div className="text-[11px] text-wfrp-muted-text font-bold">
                      Difficulty {item.modifier >= 0 ? "+" : ""}
                      {item.modifier}
                    </div>
                    {(item.targetBonusSources ?? []).map((bonus) => (
                      <div key={`${item.id}-${bonus.label}`} className="text-[11px] text-wfrp-muted-text font-bold">
                        {bonus.label} {bonus.value >= 0 ? "+" : ""}
                        {bonus.value}
                      </div>
                    ))}
                    <div className="text-[11px] text-wfrp-muted-text font-bold">Target: {item.target}</div>

                    <div className="text-[11px] text-wfrp-muted-text font-bold flex items-center h-8 gap-2">
                      Result:
                      <div className="flex gap-1 scale-[0.3] origin-left grayscale opacity-50">
                        <DigitReel
                          targetDigit={item.result === 100 ? 0 : Math.floor(item.result / 10)}
                          reel={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
                          duration={0}
                          delay={0}
                          isStatic
                        />
                        <DigitReel
                          targetDigit={item.result === 100 ? 0 : item.result % 10}
                          reel={[0, 9, 8, 7, 6, 5, 4, 3, 2, 1]}
                          duration={0}
                          delay={0}
                          isStatic
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col gap-1">
                      <div
                        className={`wfrp-badge ${item.isSuccess ? "bg-wfrp-gold/10 border-wfrp-gold/30 text-wfrp-gold" : "bg-red-900/10 border-red-900/30 text-wfrp-red"}`}
                      >
                        <span>
                          SL: {item.sl > 0 ? `+${item.sl}` : item.sl}{" "}
                          {item.isSuccess ? "Success" : "Failure"}
                        </span>
                      </div>
                      {(item.isCritical || item.isFumble) && (
                        <div className="text-[10px] font-bold uppercase tracking-widest text-wfrp-gold/80">
                          {item.isCritical ? "Critical" : "Fumble"}
                        </div>
                      )}
                      {item.damage !== null && item.damage !== undefined && (
                        <div className="text-[10px] font-bold text-wfrp-red/70 uppercase tracking-widest">
                          Damage: <span className="font-mono">{item.damage}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {rollState.characteristic && (
                <div
                  ref={activeRollerRef}
                  className="flex flex-col gap-1 px-1 scroll-mt-20 mb-[80vh] min-h-[200px] transition-all"
                >
                  <h3 className="text-sm font-bold font-serif uppercase tracking-tight text-white mb-1">
                    {rollState.characteristic.label} Roll
                  </h3>

                  {(rollState.targetBonusSources ?? []).map((bonus) => (
                    <div key={bonus.label} className="text-[11px] text-wfrp-muted-text font-bold">
                      {bonus.label} {bonus.value >= 0 ? "+" : ""}
                      {bonus.value}
                    </div>
                  ))}

                  <div className="flex items-center gap-2 text-[11px] text-wfrp-muted-text font-bold">
                    <span>
                      Difficulty {rollState.modifier >= 0 ? "+" : ""}
                      {rollState.modifier}
                    </span>
                    {(rollState.result === null || rollState.isRolling) && (
                      <div className="flex items-center gap-1">
                        <button
                          disabled={rollState.isRolling}
                          onClick={() =>
                            setRollState((prev) => ({ ...prev, modifier: prev.modifier - 10 }))
                          }
                          className="wfrp-stepper-btn"
                        >
                          <span className="wfrp-stepper-btn__inner">
                            <Minus size={10} />
                          </span>
                        </button>
                        <button
                          disabled={rollState.isRolling}
                          onClick={() =>
                            setRollState((prev) => ({ ...prev, modifier: prev.modifier + 10 }))
                          }
                          className="wfrp-stepper-btn"
                        >
                          <span className="wfrp-stepper-btn__inner">
                            <Plus size={10} />
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-wfrp-muted-text font-bold mb-1">
                    Target:{" "}
                    <span className="text-gray-200">
                      {(characterData.attributes as Record<string, number>)[
                        rollState.characteristic.key
                      ] + rollState.modifier + getTargetBonusTotal()}
                    </span>
                  </div>

                  <div className="text-[11px] text-wfrp-muted-text font-bold flex items-center h-8 gap-3">
                    <span className="shrink-0">Result:</span>
                    <div className="flex items-center gap-3">
                      {(rollState.isRolling || rollState.result !== null) && (
                        <div className="w-[45px] transition-all overflow-visible">
                          <div className="flex gap-1 scale-[0.35] origin-left">
                            <DigitReel
                              targetDigit={
                                rollState.result === 100
                                  ? 0
                                  : Math.floor((rollState.result || 0) / 10)
                              }
                              reel={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
                              duration={2.5}
                              delay={0.4}
                              isStatic={!rollState.isRolling && rollState.result !== null}
                            />
                            <DigitReel
                              targetDigit={
                                rollState.result === 100 ? 0 : (rollState.result || 0) % 10
                              }
                              reel={[0, 9, 8, 7, 6, 5, 4, 3, 2, 1]}
                              duration={1.2}
                              delay={0}
                              isStatic={!rollState.isRolling && rollState.result !== null}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {!rollState.isRolling && rollState.result !== null && (
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="text-[11px] text-wfrp-muted-text font-bold px-1">
                        SL:{" "}
                        <span
                          className={`font-black uppercase tracking-widest ${rollState.isSuccess ? "text-wfrp-gold" : "text-wfrp-red"}`}
                        >
                          {adjustedSl.total > 0 ? `+${adjustedSl.total}` : adjustedSl.total} -{" "}
                          {rollState.isSuccess ? "Critical Impact" : "Fumbled Attempt"}
                        </span>
                      </div>

                      {(rollFlags.isCritical || rollFlags.isFumble) && (
                        <div className="text-[10px] font-bold uppercase tracking-widest text-wfrp-gold/80 px-1">
                          {rollFlags.isCritical ? "Critical" : "Fumble"}
                          {rollFlags.hasImpaleCritical ? " from Impale" : ""}
                          {rollFlags.hasDangerousFumble ? " from Dangerous" : ""}
                        </div>
                      )}

                      {(adjustedSl.preciseBonus > 0 || adjustedSl.imprecisePenalty > 0) && (
                        <div className="text-[9px] font-bold uppercase tracking-widest text-wfrp-muted-text px-1">
                          Base SL {adjustedSl.baseSl}
                          {adjustedSl.preciseBonus > 0 ? " + 1 Precise" : ""}
                          {adjustedSl.imprecisePenalty > 0 ? " - 1 Imprecise" : ""}
                        </div>
                      )}

                      {currentDamage && (
                        <div className="flex flex-col gap-1 px-1">
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">
                            Total Damage
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black font-mono text-wfrp-red/80">
                              {currentDamage.total}
                            </span>
                            <span className="text-[10px] font-bold text-gray-600 uppercase">
                              ({currentDamage.damageSl} SL + {rollState.damageBase} Base
                              {currentDamage.hasImpact ? ` + ${currentDamage.impactDamage} Impact` : ""})
                            </span>
                          </div>
                          {currentDamage.hasDamaging && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-wfrp-muted-text">
                              Damaging used higher of SL or units die ({currentDamage.unitsDie})
                            </span>
                          )}
                        </div>
                      )}

                      {traitNotes.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1 border-l border-white/5 px-2">
                          {traitNotes.map((note) => (
                            <div key={note} className="text-[9px] font-bold uppercase tracking-widest text-wfrp-muted-text">
                              {note}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 text-[9px] font-bold text-wfrp-muted-text uppercase italic px-1 border-l border-white/5">
                        {getOutcome(adjustedSl.total, rollState.isSuccess!)}
                      </div>
                    </div>
                  )}

                  {!rollState.isRolling && rollState.result === null && (
                    <WfrpStandardBtn
                      onClick={executeRoll}
                      className="wfrp-roll-cta mt-4"
                      name="Roll"
                    />
                  )}

                  {!rollState.isRolling && rollState.result !== null && fortuneCurrent > 0 && (
                    <WfrpStandardBtn
                      onClick={handleReroll}
                      className="wfrp-roll-cta mt-4"
                      name="Reroll"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
