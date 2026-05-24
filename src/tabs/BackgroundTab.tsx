import { Textarea } from "../components/ui";
import {
  SheetDataHeaderCell,
  SheetDataPanel,
} from "../components/wfrp";

export function BackgroundTab({
  backgroundText,
  setBackgroundText,
}: {
  backgroundText: string;
  setBackgroundText: (value: string) => void;
}) {
  return (
    <SheetDataPanel className="divide-y divide-white/5">
      <div className="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-0 border-t border-white/5 bg-wfrp-table px-4 py-3">
        <SheetDataHeaderCell>Background</SheetDataHeaderCell>
        <SheetDataHeaderCell align="right">
          {backgroundText.trim().length} Characters
        </SheetDataHeaderCell>
      </div>

      <div className="p-4">
        <Textarea
          value={backgroundText}
          onChange={(event) => setBackgroundText(event.target.value)}
          rows={18}
          className="min-h-[420px] leading-7"
          placeholder="Write the character's history, relationships, goals, appearance, reputation, and anything the table should remember."
          aria-label="Character background editor"
        />
      </div>
    </SheetDataPanel>
  );
}
