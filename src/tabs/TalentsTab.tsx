import type { ResolvedCharacterTalent } from "../data/characters/resolved";

type TalentEffect = NonNullable<ResolvedCharacterTalent["effects"]>[number];

export function TalentsTab({
  characterTalentRows,
  openTalentInfo,
  getTalentMaxDisplay,
  formatTalentEffect,
}: {
  characterTalentRows: Array<{ talent: ResolvedCharacterTalent; count: number }>;
  openTalentInfo: (talentName: string) => void;
  getTalentMaxDisplay: (max: string) => string | number;
  formatTalentEffect: (effect: TalentEffect) => string;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      {characterTalentRows.length > 0 ? (
        <div className="wfrp-subpanel-shell flex flex-col">
          <div className="wfrp-subpanel-header grid grid-cols-[minmax(120px,0.75fr)_72px_minmax(180px,1.25fr)] gap-2 items-center">
            <span className="wfrp-table-label text-left">Talent</span>
            <span className="wfrp-table-label text-center">Taken</span>
            <span className="wfrp-table-label text-left">Description</span>
          </div>
          <div className="divide-y divide-white/5">
            {characterTalentRows.map(({ talent, count }) => (
              <button
                key={talent.name}
                type="button"
                onClick={() => openTalentInfo(talent.name)}
                className="group grid w-full grid-cols-[minmax(120px,0.75fr)_72px_minmax(180px,1.25fr)] items-start gap-2 wfrp-table-row cursor-pointer text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40"
                aria-label={`Open ${talent.name} talent rule`}
              >
                <span className="min-w-0 text-xs font-semibold text-gray-400 transition-colors group-hover:text-wfrp-gold">
                  {talent.name}
                </span>
                <span className="min-w-0 text-center text-xs leading-relaxed text-gray-500">
                  {count}/{getTalentMaxDisplay(talent.max)}
                </span>
                <span className="min-w-0 text-xs leading-relaxed text-gray-500">
                  {talent.effects?.length
                    ? talent.effects.map(formatTalentEffect).join("; ")
                    : talent.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded border border-white/10 bg-black/20 px-4 py-6 text-center text-sm text-gray-500">
          No talents bought yet.
        </div>
      )}
    </div>
  );
}
