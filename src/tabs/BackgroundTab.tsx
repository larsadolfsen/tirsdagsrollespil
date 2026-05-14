import { Panel, Textarea } from "../components/ui";

export function BackgroundTab({
  backgroundText,
  setBackgroundText,
}: {
  backgroundText: string;
  setBackgroundText: (value: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3 lg:p-4">
      <Panel className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="wfrp-panel-title">
            Background Editor
            <div className="wfrp-panel-rule" />
          </h3>
          <span className="wfrp-table-label text-right">
            {backgroundText.trim().length} Characters
          </span>
        </div>
        <Textarea
          value={backgroundText}
          onChange={(event) => setBackgroundText(event.target.value)}
          rows={18}
          className="min-h-[420px] resize-y py-3 leading-7 text-gray-200"
          placeholder="Write the character's history, relationships, goals, appearance, reputation, and anything the table should remember."
          aria-label="Character background editor"
        />
      </Panel>
    </div>
  );
}
