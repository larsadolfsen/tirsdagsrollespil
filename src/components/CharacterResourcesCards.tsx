import { HeaderResourceSlider } from "./ui";
import { WoundsCorruptionCard } from "./WoundsCorruptionCard";
import type { CoinKey } from "../tabs/tabTypes";
import type { Characteristic } from "../types";
import type { Key } from "react";

type ResourceAdjuster = (delta: number) => void;
type CoinAdjuster = (coinKey: CoinKey, amount: number) => void;

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
  onOpenRoll?: (characteristic: { key: Characteristic["key"]; label: string }) => void;
};

const sliderContentClassName = "flex min-w-0 flex-1 flex-col gap-1";
const coinRows = [
  ["gc", "Gold Crowns", "bg-wfrp-gold"],
  ["s", "Silver Shillings", "bg-wfrp-silver"],
  ["d", "Brass Pennies", "bg-wfrp-coin-brass"],
] as const satisfies ReadonlyArray<readonly [CoinKey, string, string]>;
const coinAdjustments = [-10, -1, 1, 10] as const;

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
  onOpenRoll,
}: CharacterResourcesCardsProps) {
  return (
    <>
      <WoundsCorruptionCard
        corruptionCurrent={corruptionCurrent}
        corruptionMax={corruptionMax}
        onAdjustCorruption={onAdjustCorruption}
        onAdjustWounds={onAdjustWounds}
        onOpenRoll={onOpenRoll}
        woundsCurrent={woundsCurrent}
        woundsMax={woundsMax}
      />

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
                    <span className="truncate">
                      {coinName}
                    </span>
                  </span>
                  <span className="shrink-0">
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
