import type { MobileMainView } from "../tabs/tabTypes";
import type { Characteristic } from "../types";
import { UI_LABELS } from "../labels";

type CharacteristicsViewProps = {
  activeMobileMainView: MobileMainView;
  attributes: Record<string, number>;
  onRoll: (characteristic: Characteristic) => void;
};

export function CharacteristicsView({
  activeMobileMainView,
  attributes,
  onRoll,
}: CharacteristicsViewProps) {
  return (
    <section className={activeMobileMainView === "characteristics" ? "relative block pb-5 md:pb-0" : "relative hidden md:block"}>
      <div className="grid grid-cols-[repeat(5,max-content)] justify-center gap-x-[max(0px,min(1.5rem,calc((100%-280px)/4)))] gap-y-6 xl:grid-cols-[repeat(10,max-content)] xl:gap-x-[max(0px,min(1.5rem,calc((100%-800px)/9)))]">
        {(UI_LABELS.CHARACTERISTICS as Characteristic[]).map((characteristic) => {
          const value = attributes[characteristic.key] || 0;
          const bonus = Math.floor(value / 10);

          return (
            <div
              key={characteristic.key}
              className="flex flex-col items-center group/char"
            >
              <span className="mb-1 text-[9px] font-bold uppercase tracking-tighter text-wfrp-muted-text transition-colors group-hover/char:text-wfrp-gold lg:mb-1.5 lg:text-[11px]">
                {characteristic.label}
              </span>

              <div className="relative">
                <button
                  onClick={() => onRoll(characteristic)}
                  className="relative flex h-[72px] w-14 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-wfrp-border bg-wfrp-surface shadow-lg transition-all hover:border-wfrp-gold/60 hover:bg-wfrp-surface-hover active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 lg:h-[100px] lg:w-[80px]"
                  aria-label={`Roll for ${characteristic.label}`}
                >
                  <div className="text-xl font-bold tracking-tight transition-colors group-hover/char:text-wfrp-gold lg:text-3xl">
                    {value}
                  </div>

                  <div className="absolute -bottom-1.5 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-wfrp-border bg-wfrp-surface transition-colors group-hover/char:border-wfrp-gold/60 lg:-bottom-2 lg:h-8 lg:w-8">
                    <span className="text-[10px] font-bold text-wfrp-muted-text group-hover/char:text-wfrp-gold/60 lg:text-[11px]">
                      {bonus}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
