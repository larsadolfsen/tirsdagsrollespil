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
  contentClassName?: string;
};

type HeaderResourceSliderProps = {
  label: string;
  current: number;
  max: number;
  onAdjust: (delta: number) => void;
  barClassName: string;
  contentClassName?: string;
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
  contentClassName,
}: ResourceCounterBarProps) {
  const percent = max > 0 ? (current / max) * 100 : 0;
  const counterClassName = `text-[10px] font-bold ${counterToneClassName}`;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onAdjust(-1)}
        className={`wfrp-stepper-btn ${minusRingClassName}`}
        aria-label={`Decrease current ${label.toLowerCase()}`}
      >
        <Minus size={10} />
      </button>

      <div className={contentClassName ?? "flex w-24 flex-col gap-1 lg:w-36"}>
        <div className="flex items-end justify-between leading-none">
          <span className="text-[9px] font-bold uppercase tracking-tight text-gray-400">
            {label}
          </span>
          <span className={counterClassName}>
            {current} / {max}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#303030] shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barClassName}`}
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={current}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={`${label} remaining`}
          />
        </div>
      </div>

      <button
        onClick={() => onAdjust(1)}
        className={`wfrp-stepper-btn ${plusRingClassName}`}
        aria-label={`Increase current ${label.toLowerCase()}`}
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
  contentClassName,
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
      contentClassName={contentClassName}
    />
  );
}
