import { useMemo, useRef, useState } from "react";
import { HeaderResourceSlider } from "./ui";
import { DiceRoller } from "./DiceRoller";
import { useGameSessionContext } from "../context/GameSessionContext";
import type { RollHistoryItem, RollState } from "./appTypes";
import type { CoinKey } from "../tabs/tabTypes";
import type { Characteristic } from "../types";
import type { Key } from "react";

type ResourceAdjuster = (delta: number) => void;
type CoinAdjuster = (coinKey: CoinKey, amount: number) => void;

type CorruptionCheckSkillName = "Cool" | "Endurance";

type CharacterResourcesCardsProps = {
  woundsCurrent: number;
  woundsMax: number;
  onAdjustWounds: ResourceAdjuster;
  corruptionCurrent: number;
  corruptionMax: number;
  onAdjustCorruption: ResourceAdjuster;
  fateCurrent: number;
  fateMax: number;
  onAdjustFate: ResourceAdjuster;
  fortuneCurrent: number;
  onAdjustFortune: ResourceAdjuster;
  resilienceCurrent: number;
  resilienceMax: number;
  onAdjustResilience: ResourceAdjuster;
  resolveCurrent: number;
  resolveMax: number;
  onAdjustResolve: ResourceAdjuster;
  coins: Record<CoinKey, number>;
  onAdjustCoin: CoinAdjuster;
};

const sliderContentClassName = "flex min-w-0 flex-1 flex-col gap-1";
const coinRows = [
  ["gc", "Gold Crowns", "bg-wfrp-gold"],
  ["s", "Silver Shillings", "bg-wfrp-silver"],
  ["d", "Brass Pennies", "bg-wfrp-coin-brass"],
] as const satisfies ReadonlyArray<readonly [CoinKey, string, string]>;
const coinAdjustments = [-10, -1, 1, 10] as const;
const corruptionCheckSkillNames = ["Cool", "Endurance"] as const satisfies readonly CorruptionCheckSkillName[];
const emptyRollState: RollState = {
  characteristic: null,
  modifier: 0,
  targetBonusSources: [],
  result: null,
  isSuccess: null,
  sl: null,
  isRolling: false,
  damageBase: null,
};

const rollD100 = () => Math.floor(Math.random() * 100) + 1;
const calculateSl = (target: number, result: number) => Math.floor(target / 10) - Math.floor(result / 10);

export function CharacterResourcesCards({
  woundsCurrent,
  woundsMax,
  onAdjustWounds,
  corruptionCurrent,
  corruptionMax,
  onAdjustCorruption,
  fateCurrent,
  fateMax,
  onAdjustFate,
  fortuneCurrent,
  onAdjustFortune,
  resilienceCurrent,
  resilienceMax,
  onAdjustResilience,
  resolveCurrent,
  resolveMax,
  onAdjustResolve,
  coins,
  onAdjustCoin,
}: CharacterResourcesCardsProps) {
  const { characterData, characterSkills } = useGameSessionContext();
  const [rollState, setRollState] = useState<RollState>(emptyRollState);
  const [rollHistory, setRollHistory] = useState<RollHistoryItem[]>([]);
  const activeRollerRef = useRef<HTMLDivElement | null>(null);
  const corruptionCheckSkills = useMemo(() => {
    return corruptionCheckSkillNames.map((skillName) => {
      const skill = characterSkills.find((entry) => entry.baseName === skillName);
      const characteristic = (skill?.characteristic ?? (skillName === "Cool" ? "WP" : "T")) as Characteristic["key"];
      const characteristicValue = Number(characterData.attributes[characteristic] ?? 0);
      const advances = skill?.advances ?? 0;
      const target = characteristicValue + advances;

      return {
        skillName,
        characteristic,
        advances,
        target,
      };
    });
  }, [characterData.attributes, characterSkills]);

  const openCorruptionCheck = ({
    skillName,
    characteristic,
    advances,
  }: {
    skillName: CorruptionCheckSkillName;
    characteristic: Characteristic["key"];
    advances: number;
  }) => {
    setRollState({
      ...emptyRollState,
      characteristic: {
        key: characteristic,
        label: `${skillName} Corruption Check`,
      },
      targetBonusSources: advances > 0 ? [{ label: skillName, value: advances }] : [],
    });
  };

  const executeRoll = () => {
    if (!rollState.characteristic) {
      return;
    }

    setRollState((current) => {
      if (!current.characteristic) {
        return current;
      }

      const target =
        Number(characterData.attributes[current.characteristic.key] ?? 0) +
        current.modifier +
        (current.targetBonusSources ?? []).reduce((sum, bonus) => sum + bonus.value, 0);
      const result = rollD100();
      const sl = calculateSl(target, result);

      return {
        ...current,
        result,
        isSuccess: result <= target,
        sl,
        isRolling: false,
      };
    });
  };

  const handleReroll = () => {
    setRollState((current) => ({
      ...current,
      result: null,
      isSuccess: null,
      sl: null,
      isRolling: false,
    }));
    window.setTimeout(executeRoll, 0);
  };

  return (
    <>
      <section className="wfrp-card overflow-hidden p-0!">
        <div className="wfrp-card-tab-header">
          <h3 className="wfrp-panel-title">WOUNDS & CORRUPTION</h3>
        </div>
        <div className="wfrp-card-tab-body px-4 py-4">
          <div className="grid grid-cols-1 gap-3">
            <HeaderResourceSlider
              label="Wounds"
              current={woundsCurrent}
              max={woundsMax}
              onAdjust={onAdjustWounds}
              barClassName="bg-wfrp-red"
              contentClassName={sliderContentClassName}
            />
            <HeaderResourceSlider
              label="Corruption"
              current={corruptionCurrent}
              max={corruptionMax}
              onAdjust={onAdjustCorruption}
              barClassName="bg-purple-600"
              contentClassName={sliderContentClassName}
            />
            <div className="rounded border border-white/5 bg-black/10 px-3 py-2">
              <div className="mb-2 text-[8px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Corruption Check
              </div>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-2">
                {corruptionCheckSkills.map((skill) => (
                  <div key={skill.skillName} className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-2">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => openCorruptionCheck(skill)}
                        className="wfrp-roll-btn"
                        aria-label={`Open ${skill.skillName} corruption check`}
                      >
                        {skill.target}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCorruptionCheck(skill)}
                      className="wfrp-skill-link min-w-0 truncate"
                    >
                      {skill.skillName}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wfrp-card overflow-hidden p-0!">
        <div className="wfrp-card-tab-header">
          <h3 className="wfrp-panel-title">FATE & RESILIENCE</h3>
        </div>
        <div className="wfrp-card-tab-body space-y-5 px-4 py-4">
          <div className="grid grid-cols-1 gap-3">
            <HeaderResourceSlider
              label="Fate"
              current={fateCurrent}
              max={fateMax}
              onAdjust={onAdjustFate}
              barClassName="bg-wfrp-amber"
              contentClassName={sliderContentClassName}
            />
            <HeaderResourceSlider
              label="Fortune"
              current={fortuneCurrent}
              max={fateCurrent}
              onAdjust={onAdjustFortune}
              barClassName="bg-wfrp-amber"
              contentClassName={sliderContentClassName}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <HeaderResourceSlider
              label="Resilience"
              current={resilienceCurrent}
              max={resilienceMax}
              onAdjust={onAdjustResilience}
              barClassName="bg-wfrp-aqua"
              contentClassName={sliderContentClassName}
            />
            <HeaderResourceSlider
              label="Resolve"
              current={resolveCurrent}
              max={resolveMax}
              onAdjust={onAdjustResolve}
              barClassName="bg-wfrp-aqua"
              contentClassName={sliderContentClassName}
            />
          </div>
        </div>
      </section>

      <section className="wfrp-card overflow-hidden p-0!">
        <div className="wfrp-card-tab-header">
          <h3 className="wfrp-panel-title">COINS</h3>
        </div>
        <div className="wfrp-card-tab-body space-y-3 px-4 py-4">
          {coinRows.map(([coinKey, coinName, coinClassName]) => (
            <div
              key={coinKey}
              className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] items-center gap-1.5"
            >
              {coinAdjustments.slice(0, 2).map((amount) => (
                <CoinStepper
                  key={amount}
                  amount={amount}
                  coinKey={coinKey}
                  coinName={coinName}
                  coinValue={coins[coinKey]}
                  onAdjustCoin={onAdjustCoin}
                />
              ))}

              <div className="flex min-w-0 flex-col px-2">
                <div className="flex items-end justify-between gap-2 leading-none">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full shadow-sm ring-1 ring-white/15 ${coinClassName}`}
                      aria-hidden="true"
                    />
                    <span className="truncate text-[9px] font-bold uppercase tracking-tight text-gray-400">
                      {coinName}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] font-bold text-gray-200">
                    {coins[coinKey]}
                  </span>
                </div>
              </div>

              {coinAdjustments.slice(2).map((amount) => (
                <CoinStepper
                  key={amount}
                  amount={amount}
                  coinKey={coinKey}
                  coinName={coinName}
                  coinValue={coins[coinKey]}
                  onAdjustCoin={onAdjustCoin}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <DiceRoller
        characterData={characterData}
        rollState={rollState}
        setRollState={setRollState}
        rollHistory={rollHistory}
        setRollHistory={setRollHistory}
        activeRollerRef={activeRollerRef}
        fortuneCurrent={fortuneCurrent}
        executeRoll={executeRoll}
        handleReroll={handleReroll}
        getOutcome={(sl, isSuccess) =>
          isSuccess
            ? `Corruption check passed with ${sl} SL.`
            : `Corruption check failed with ${sl} SL.`
        }
      />
    </>
  );
}

type CoinStepperProps = {
  key?: Key;
  amount: number;
  coinKey: CoinKey;
  coinName: string;
  coinValue: number;
  onAdjustCoin: CoinAdjuster;
};

function CoinStepper({
  amount,
  coinKey,
  coinName,
  coinValue,
  onAdjustCoin,
}: CoinStepperProps) {
  const isDecrease = amount < 0;

  return (
    <button
      type="button"
      onClick={() => onAdjustCoin(coinKey, amount)}
      className={`wfrp-stepper-btn h-6 min-w-8 px-1.5 py-0 leading-none ${
        isDecrease
          ? "focus-visible:ring-wfrp-red/50 disabled:cursor-not-allowed disabled:opacity-20"
          : "focus-visible:ring-green-600/50"
      }`}
      aria-label={`${isDecrease ? "Decrease" : "Increase"} ${coinName.toLowerCase()} by ${Math.abs(amount)}`}
      disabled={isDecrease && coinValue <= 0}
    >
      <span className="font-mono text-[10px] font-bold leading-none">
        {amount > 0 ? `+${amount}` : amount}
      </span>
    </button>
  );
}
