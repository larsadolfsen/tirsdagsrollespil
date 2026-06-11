import type { Dispatch, RefObject, SetStateAction } from "react";
import { Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { WfrpSidebar } from "../../components/wfrp";
import type { RollBonusSource, RollHistoryItem, RollState } from "../../types/dice";

interface DiceLogSidebarProps {
  activeRollerRef: RefObject<HTMLDivElement | null>;
  archiveRoll: (state: RollState, labelSuffix?: string) => void;
  canRollCritical: boolean;
  canUseFortuneActions: boolean;
  canUseResilienceAction: boolean;
  displayRoll: number;
  executeRoll: () => void;
  formatSignedSl: (value: number, zeroSign?: "positive" | "negative" | "neutral") => string;
  getDamageTotal: (state: Pick<RollState, "damageBase" | "sl" | "isSuccess">) => number | null;
  getDifficultyLabel: (modifier: number) => string;
  getHitLocation: (result: number | null) => string | null;
  getIsCritical: (state: Pick<RollState, "testType" | "result" | "isSuccess">) => boolean;
  getOutcome: (sl: number, isSuccess: boolean) => string;
  getRollBaseValue: (state: Pick<RollState, "characteristic"> & { baseValueOverride?: number | null }) => number;
  getRollTarget: (state: Pick<RollState, "characteristic" | "modifier" | "targetBonusSources"> & { baseValueOverride?: number | null }) => number;
  getTargetBonusTotal: (targetBonusSources: RollBonusSource[]) => number;
  getTestTypeTitle: (testType: RollState["testType"] | RollHistoryItem["testType"]) => string;
  handleAddSl: () => void;
  handleIWillNotFail: () => void;
  handleReroll: () => void;
  handleRollCritical: () => void;
  isOpen: boolean;
  rollHistory: RollHistoryItem[];
  rollState: RollState;
  setIsDiceLogOpen: Dispatch<SetStateAction<boolean>>;
  setRollState: Dispatch<SetStateAction<RollState>>;
}

export function DiceLogSidebar({
  activeRollerRef,
  archiveRoll,
  canRollCritical,
  canUseFortuneActions,
  canUseResilienceAction,
  displayRoll,
  executeRoll,
  formatSignedSl,
  getDamageTotal,
  getDifficultyLabel,
  getHitLocation,
  getIsCritical,
  getOutcome,
  getRollBaseValue,
  getRollTarget,
  getTargetBonusTotal,
  getTestTypeTitle,
  handleAddSl,
  handleIWillNotFail,
  handleReroll,
  handleRollCritical,
  isOpen,
  rollHistory,
  rollState,
  setIsDiceLogOpen,
  setRollState,
}: DiceLogSidebarProps) {
  const closeDiceLog = () => {
    archiveRoll(rollState);
    setIsDiceLogOpen(false);
    setRollState((prev) => ({ ...prev, characteristic: null }));
  };

  return (
    <WfrpSidebar
      isOpen={isOpen}
      motionKey="dice-roller"
      onClose={closeDiceLog}
      className="w-[360px]"
      contentClassName="overflow-x-hidden px-4 pb-4 pt-4"
      title="Dice Log"
      kicker="Roll & Results"
      closeLabel="Close dice log"
    >
      <div className="flex flex-col">
        {rollHistory.length > 0 && (
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
                  {item.target - item.modifier - getTargetBonusTotal(item.targetBonusSources)}
                </span>
                <div />

                {item.targetBonusSources.map((bonus) => (
                  <div key={`${item.id}-${bonus.label}`} className="contents">
                    <span className="wfrp-list-cell-strong">{bonus.label}:</span>
                    <span className="wfrp-sidebar-body text-right text-gray-200">
                      {formatSignedSl(bonus.value, bonus.value >= 0 ? "positive" : "negative")}
                    </span>
                    <div />
                  </div>
                ))}

                <span className="wfrp-list-cell-strong">Difficulty:</span>
                <span className="wfrp-sidebar-body text-right text-gray-200">
                  {item.modifier >= 0 ? "+" : ""}
                  {item.modifier}
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
        )}

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

              {rollState.targetBonusSources.map((bonus) => (
                <div key={bonus.label} className="contents">
                  <span className="wfrp-list-cell-strong">{bonus.label}:</span>
                  <span className="wfrp-sidebar-body text-right text-gray-200">
                    {formatSignedSl(bonus.value, bonus.value >= 0 ? "positive" : "negative")}
                  </span>
                  <div />
                </div>
              ))}

              <span className="wfrp-list-cell-strong">Difficulty:</span>
              <span className="wfrp-sidebar-body text-right text-gray-200">
                {rollState.modifier >= 0 ? "+" : ""}
                {rollState.modifier}
              </span>
              {rollState.result === null || rollState.isRolling ? (
                <div className="flex items-center gap-1 justify-self-start">
                  <button
                    disabled={rollState.isRolling}
                    onClick={() => setRollState((prev) => ({ ...prev, modifier: prev.modifier - 10 }))}
                    className="wfrp-stepper-btn"
                  >
                    <span className="wfrp-stepper-btn__inner">
                      <Minus size={10} />
                    </span>
                  </button>
                  <button
                    disabled={rollState.isRolling}
                    onClick={() => setRollState((prev) => ({ ...prev, modifier: prev.modifier + 10 }))}
                    className="wfrp-stepper-btn"
                  >
                    <span className="wfrp-stepper-btn__inner">
                      <Plus size={10} />
                    </span>
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
                          reel={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
                          duration={2.5}
                          delay={0.4}
                          isStatic={!rollState.isRolling && rollState.result !== null}
                        />
                        <DigitReel
                          targetDigit={rollState.result === 100 ? 0 : (rollState.result || 0) % 10}
                          reel={[0, 9, 8, 7, 6, 5, 4, 3, 2, 1]}
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
                        {formatSignedSl(
                          rollState.damageBase,
                          rollState.damageBase >= 0 ? "positive" : "negative",
                        )}
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
              <button onClick={executeRoll} className="wfrp-roll-cta">
                Roll
              </button>
            )}

            {!rollState.isRolling && rollState.result !== null && (
              <div className="flex flex-col gap-2">
                {canRollCritical && (
                  <div className="flex flex-col gap-1">
                    <span className="wfrp-table-label text-wfrp-muted-text">Critical</span>
                    <button
                      onClick={handleRollCritical}
                      title="Critical action"
                      aria-label="Critical action: roll critical"
                      className="wfrp-action-btn w-fit px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                    >
                      Roll Critical
                    </button>
                  </div>
                )}
                {canUseFortuneActions && (
                  <div className="flex flex-col gap-1">
                    <span className="wfrp-table-label text-wfrp-muted-text">Spend Fortune</span>
                    <div className="flex flex-row flex-wrap items-center gap-2">
                      <button
                        onClick={handleReroll}
                        title="Fortune action"
                        aria-label="Fortune action: reroll"
                        className="wfrp-action-btn px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                      >
                        Reroll
                      </button>
                      <button
                        onClick={handleAddSl}
                        title="Fortune action"
                        aria-label="Fortune action: add one success level"
                        className="wfrp-action-btn px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                      >
                        +1 SL
                      </button>
                    </div>
                  </div>
                )}
                {canUseResilienceAction && (
                  <div className="flex flex-col gap-1">
                    <span className="wfrp-table-label text-wfrp-muted-text">Spend Resilience</span>
                    <div className="flex flex-row flex-wrap items-center gap-2">
                      <button
                        onClick={handleIWillNotFail}
                        title="Resilience action"
                        aria-label="Resilience action: I Will Not Fail!"
                        className="wfrp-action-btn px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-gray-300"
                      >
                        I Will Not Fail!
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </WfrpSidebar>
  );
}

function DigitReel({
  targetDigit,
  reel,
  duration,
  delay,
  isStatic,
}: {
  targetDigit: number;
  reel: number[];
  duration: number;
  delay: number;
  isStatic?: boolean;
}) {
  const digitHeight = 32;
  const spins = isStatic ? 0 : 4;
  const targetIndex = reel.indexOf(targetDigit);
  const totalItems = isStatic ? targetIndex : spins * reel.length + targetIndex;

  const repeatedReel = [];
  const repetitions = isStatic ? 1 : spins + 1;
  for (let i = 0; i < repetitions; i += 1) {
    repeatedReel.push(...reel);
  }

  return (
    <div className="wfrp-digit-window">
      <motion.div
        initial={isStatic ? { y: -(digitHeight * targetIndex) } : { y: 0 }}
        animate={{ y: -(digitHeight * totalItems) }}
        transition={isStatic ? { duration: 0 } : {
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="flex flex-col items-center"
      >
        {repeatedReel.map((num, index) => (
          <div
            key={`${num}-${index}`}
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
