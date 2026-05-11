export function BackgroundTab({
  backgroundText,
  setBackgroundText,
}: {
  backgroundText: string;
  setBackgroundText: (value: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-3 lg:p-4 flex flex-col gap-4">
      <section className="wfrp-subpanel-shell flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="wfrp-panel-title">
            Background Editor
            <div className="wfrp-panel-rule" />
          </h3>
          <span className="wfrp-table-label text-right">
            {backgroundText.trim().length} Characters
          </span>
        </div>
        <textarea
          value={backgroundText}
          onChange={(event) => setBackgroundText(event.target.value)}
          rows={18}
          className="min-h-[420px] w-full resize-y rounded border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-gray-200 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
          placeholder="Write the character's history, relationships, goals, appearance, reputation, and anything the table should remember."
          aria-label="Character background editor"
        />
      </section>
    </div>
  );
}
