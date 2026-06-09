import { Minus, Plus } from "lucide-react";

type ResourceCounterBarProps = {
  label: string;
  current: number;
  max: number;
  onAdjust: (delta: number) => void;
  barClassName: string;
  counterToneClassName: string;
  minusRingClassName: string;
  plusRingClassName: string;
  canIncreaseBeyondMax?: boolean;
  contentClassName?: string;
  className?: string;
};

type HeaderResourceSliderProps = {
  label: string;
  current: number;
  max: number;
  onAdjust: (delta: number) => void;
  barClassName: string;
  canIncreaseBeyondMax?: boolean;
  contentClassName?: string;
  className?: string;
};

export function ResourceCounterBar({
  label,
  current,
  max,
  onAdjust,
  barClassName,
  counterToneClassName,
  minusRingClassName,
  plusRingClassName,
  canIncreaseBeyondMax = false,
  contentClassName,
  className,
}: ResourceCounterBarProps) {
  const safeMax = Math.max(0, max);
  const safeCurrent = Math.min(Math.max(0, current), safeMax);
  const percent = safeMax > 0 ? (safeCurrent / safeMax) * 100 : 0;
  const counterClassName = `text-[10px] font-bold ${counterToneClassName}`;

  return (
    <div className={className ?? "flex items-center gap-1.5 sm:gap-2"}>
      <button
        onClick={() => onAdjust(-1)}
        className={`wfrp-stepper-btn shrink-0 ${minusRingClassName}`}
        aria-label={`Decrease current ${label.toLowerCase()}`}
        disabled={safeCurrent <= 0}
      >
        <Minus size={10} />
      </button>

      <div className={contentClassName ?? "flex w-20 min-w-0 flex-col gap-1 sm:w-24 lg:w-36"}>
        <div className="flex items-end justify-between gap-2 leading-none">
          <span className="truncate text-[9px] font-bold uppercase tracking-tight text-wfrp-muted-text">
            {label}
          </span>
          <span className={`${counterClassName} shrink-0`}>
            {safeCurrent} / {safeMax}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-wfrp-border shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barClassName}`}
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={safeCurrent}
            aria-valuemin={0}
            aria-valuemax={safeMax}
            aria-label={`${label} remaining`}
          />
        </div>
      </div>

      <button
        onClick={() => onAdjust(1)}
        className={`wfrp-stepper-btn shrink-0 ${plusRingClassName}`}
        aria-label={`Increase current ${label.toLowerCase()}`}
        disabled={!canIncreaseBeyondMax && safeMax > 0 && safeCurrent >= safeMax}
      >
        <Plus size={10} />
      </button>
    </div>
  );
}

export function HeaderResourceSlider({
  label,
  current,
  max,
  onAdjust,
  barClassName,
  canIncreaseBeyondMax,
  contentClassName,
  className,
}: HeaderResourceSliderProps) {
  return (
    <ResourceCounterBar
      label={label}
      current={current}
      max={max}
      onAdjust={onAdjust}
      barClassName={barClassName}
      counterToneClassName="text-gray-200"
      minusRingClassName="focus-visible:ring-wfrp-red/50"
      plusRingClassName="focus-visible:ring-green-600/50"
      canIncreaseBeyondMax={canIncreaseBeyondMax}
      contentClassName={contentClassName}
      className={className}
    />
  );
}
