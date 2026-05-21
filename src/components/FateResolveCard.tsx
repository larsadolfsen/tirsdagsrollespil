import { HeaderResourceSlider } from "./ui";

type ResourceAdjuster = (delta: number) => void;

type FateResolveCardProps = {
  fateCurrent: number;
  fateMax: number;
  fortuneCurrent: number;
  onAdjustFate: ResourceAdjuster;
  onAdjustFortune: ResourceAdjuster;
  onAdjustResilience: ResourceAdjuster;
  onAdjustResolve: ResourceAdjuster;
  resilienceCurrent: number;
  resilienceMax: number;
  resolveCurrent: number;
  resolveMax: number;
};

const sliderContentClassName = "flex min-w-0 flex-1 flex-col gap-1";

export function FateResolveCard({
  fateCurrent,
  fateMax,
  fortuneCurrent,
  onAdjustFate,
  onAdjustFortune,
  onAdjustResilience,
  onAdjustResolve,
  resilienceCurrent,
  resilienceMax,
  resolveCurrent,
  resolveMax,
}: FateResolveCardProps) {
  return (
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
  );
}
