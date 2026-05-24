import type { MobileTabMenuTarget } from "../tabs/tabTypes";
import type { Characteristic } from "../types";
import { UI_LABELS } from "../labels";

type CharacteristicsViewProps = {
  activeMobileMainView: MobileTabMenuTarget;
  attributes: Record<string, number>;
  onRoll: (characteristic: Characteristic) => void;
};

export function CharacteristicsView({
  activeMobileMainView,
  attributes,
  onRoll,
}: CharacteristicsViewProps) {
  return (
    <section className={activeMobileMainView === "characteristics" ? "block" : "hidden md:block"}>
      <div className="grid grid-cols-5 gap-1 md:grid-cols-10 md:gap-2 lg:gap-3">
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
                  className="flex h-[72px] w-14 flex-col items-center justify-center rounded-lg border-2 border-wfrp-border bg-wfrp-surface shadow-lg transition-all hover:border-wfrp-gold/60 hover:bg-wfrp-surface-hover active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 lg:h-[100px] lg:w-[80px]"
                  aria-label={`Roll for ${characteristic.label}`}
                >
                  <div className="text-xl font-bold tracking-tight transition-colors group-hover/char:text-wfrp-gold lg:text-3xl">
                    {value}
                  </div>
                </button>

                <div className="absolute -bottom-1.5 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-wfrp-border bg-wfrp-surface transition-colors group-hover/char:border-wfrp-gold/40 lg:-bottom-2 lg:h-8 lg:w-8">
                  <span className="text-[10px] font-bold text-wfrp-muted-text group-hover/char:text-wfrp-gold/60 lg:text-[11px]">
                    {bonus}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
