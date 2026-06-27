import { HeaderResourceSlider, Heading } from "./ui";

type ResourceAdjuster = (delta: number) => void;

type FateResolveCardProps = {
  fateCurrent: number;
  fateMax: number;
  fortuneCurrent: number;
  onAdjustFate: ResourceAdjuster;
  onAdjustFortune: ResourceAdjuster;
};

type ResilienceResolveCardProps = {
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
}: FateResolveCardProps) {
  return (
    <section className="wfrp-card overflow-hidden p-0!">
      <div className="wfrp-card-tab-header">
        <Heading level={3} variant="panel">FATE & FORTUNE</Heading>
      </div>
      <div className="wfrp-card-tab-body px-4 py-4">
        <div className="grid grid-cols-1 gap-3">
          <HeaderResourceSlider
            label="Fate"
            current={fateCurrent}
            max={fateMax}
            onAdjust={onAdjustFate}
            barClassName="bg-wfrp-amber"
            canIncreaseBeyondMax
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
      </div>
    </section>
  );
}

export function ResilienceResolveCard({
  onAdjustResilience,
  onAdjustResolve,
  resilienceCurrent,
  resilienceMax,
  resolveCurrent,
  resolveMax,
}: ResilienceResolveCardProps) {
  return (
    <section className="wfrp-card overflow-hidden p-0!">
      <div className="wfrp-card-tab-header">
        <Heading level={3} variant="panel">RESILIENCE & RESOLVE</Heading>
      </div>
      <div className="wfrp-card-tab-body px-4 py-4">
        <div className="grid grid-cols-1 gap-3">
          <HeaderResourceSlider
            label="Resilience"
            current={resilienceCurrent}
            max={resilienceMax}
            onAdjust={onAdjustResilience}
            barClassName="bg-wfrp-aqua"
            canIncreaseBeyondMax
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
