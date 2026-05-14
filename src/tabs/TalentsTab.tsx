import { SheetDataButtonRow, SheetDataHeader, SheetDataPanel, SheetDataTable, SheetEmptyState } from "../components/wfrp";
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
        <SheetDataPanel>
          <SheetDataHeader className="grid-cols-[minmax(120px,0.75fr)_72px_minmax(180px,1.25fr)]">
            <span className="wfrp-table-label text-left">Talent</span>
            <span className="wfrp-table-label text-center">Taken</span>
            <span className="wfrp-table-label text-left">Description</span>
          </SheetDataHeader>
          <SheetDataTable>
            {characterTalentRows.map(({ talent, count }) => (
              <SheetDataButtonRow
                key={talent.name}
                onClick={() => openTalentInfo(talent.name)}
                className="group grid-cols-[minmax(120px,0.75fr)_72px_minmax(180px,1.25fr)] items-start"
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
              </SheetDataButtonRow>
            ))}
          </SheetDataTable>
        </SheetDataPanel>
      ) : (
        <SheetEmptyState title="No Talents">Talents bought during play will appear here.</SheetEmptyState>
      )}
    </div>
  );
}
