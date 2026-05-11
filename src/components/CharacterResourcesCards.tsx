import { useMemo, useState } from "react";
import { HeaderResourceSlider } from "./ui";
import { useGameSessionContext } from "../context/GameSessionContext";
import type { CoinKey } from "../tabs/tabTypes";
import type { Key } from "react";

type ResourceAdjuster = (delta: number) => void;
type CoinAdjuster = (coinKey: CoinKey, amount: number) => void;

type CorruptionCheckSkillName = "Cool" | "Endurance";

type CorruptionCheckResult = {
  skillName: CorruptionCheckSkillName;
  target: number;
  roll: number;
  isSuccess: boolean;
};

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
  const [corruptionCheckResult, setCorruptionCheckResult] = useState<CorruptionCheckResult | null>(null);
  const corruptionCheckSkills = useMemo(() => {
    return corruptionCheckSkillNames.map((skillName) => {
      const skill = characterSkills.find((entry) => entry.baseName === skillName);
      const characteristic = skill?.characteristic ?? (skillName === "Cool" ? "WP" : "T");
      const characteristicValue = Number(characterData.attributes[characteristic] ?? 0);
      const target = characteristicValue + (skill?.advances ?? 0);

      return {
        skillName,
        target,
      };
    });
  }, [characterData.attributes, characterSkills]);

  const rollCorruptionCheck = (skillName: CorruptionCheckSkillName, target: number) => {
    const roll = Math.floor(Math.random() * 100) + 1;

    setCorruptionCheckResult({
      skillName,
      target,
      roll,
      isSuccess: roll <= target,
    });
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
              <div className="grid grid-cols-2 gap-2">
                {corruptionCheckSkills.map(({ skillName, target }) => (
                  <div key={skillName} className="flex items-center justify-between gap-2">
                    <span className="truncate text-[10px] font-bold uppercase tracking-tight text-gray-400">
                      {skillName}
                    </span>
                    <button
                      type="button"
                      onClick={() => rollCorruptionCheck(skillName, target)}
                      className="wfrp-roll-btn h-7 min-w-10"
                      aria-label={`Roll ${skillName} corruption check`}
                    >
                      {target}
                    </button>
                  </div>
                ))}
              </div>
              {corruptionCheckResult && (
                <div className="mt-2 text-[10px] font-bold text-gray-400">
                  {corruptionCheckResult.skillName}: {corruptionCheckResult.roll} / {corruptionCheckResult.target}{" "}
                  <span className={corruptionCheckResult.isSuccess ? "text-wfrp-gold" : "text-wfrp-red"}>
                    {corruptionCheckResult.isSuccess ? "Success" : "Failure"}
                  </span>
                </div>
              )}
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
