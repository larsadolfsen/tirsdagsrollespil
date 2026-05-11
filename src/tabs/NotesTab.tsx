import { Trash2 } from "lucide-react";
import type { CharacterNoteData } from "../types/storage";

type NoteGroup = {
  dayKey: string;
  date: string;
  notes: CharacterNoteData[];
};

export function NotesTab({
  sortedNotes,
  noteGroups,
  noteHashtags,
  noteSearch,
  setNoteSearch,
  newNoteTitle,
  setNewNoteTitle,
  newNoteText,
  setNewNoteText,
  addNote,
  deleteNote,
  formatNoteDay,
  formatNoteDate,
}: {
  sortedNotes: CharacterNoteData[];
  noteGroups: NoteGroup[];
  noteHashtags: string[];
  noteSearch: string;
  setNoteSearch: (value: string) => void;
  newNoteTitle: string;
  setNewNoteTitle: (value: string) => void;
  newNoteText: string;
  setNewNoteText: (value: string) => void;
  addNote: () => void;
  deleteNote: (noteId: string) => void;
  formatNoteDay: (value: string) => string;
  formatNoteDate: (value: string) => string;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-3 lg:p-4 flex flex-col gap-4">
      {sortedNotes.length > 0 && (
        <section className="wfrp-subpanel-shell flex flex-col gap-3 p-4">
          <input
            value={noteSearch}
            onChange={(event) => setNoteSearch(event.target.value)}
            className="h-9 rounded border border-white/10 bg-black/30 px-3 text-sm text-gray-200 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
            placeholder="Search notes or #hashtags"
          />
        </section>
      )}

      <section className="wfrp-subpanel-shell flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="wfrp-panel-title">
            Campaign Journal
            <div className="wfrp-panel-rule" />
          </h3>
          <span className="wfrp-table-label text-right">
            {sortedNotes.length} {sortedNotes.length === 1 ? "Entry" : "Entries"}
          </span>
        </div>
        <input
          value={newNoteTitle}
          onChange={(event) => setNewNoteTitle(event.target.value)}
          className="h-10 rounded border border-white/10 bg-black/30 px-3 text-sm font-semibold text-gray-100 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
          placeholder="Entry title"
        />
        <textarea
          value={newNoteText}
          onChange={(event) => setNewNoteText(event.target.value)}
          rows={4}
          className="min-h-28 resize-y rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
          placeholder="Write a note... Use #tags to create a chip."
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addNote}
            disabled={!newNoteTitle.trim() || !newNoteText.trim()}
            className="wfrp-action-btn h-8 px-3 text-[10px] font-black uppercase tracking-widest text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add Note
          </button>
        </div>
        {noteHashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-white/5 pt-3">
            {noteHashtags.map((tag) => {
              const tagSearch = `#${tag}`;
              const isActive = noteSearch.trim().toLowerCase() === tagSearch;

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setNoteSearch(isActive ? "" : tagSearch)}
                  className={`rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "border-wfrp-gold/60 bg-wfrp-gold/15 text-wfrp-gold"
                      : "border-white/10 bg-black/25 text-gray-400 hover:text-gray-200 hover:border-white/20"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {sortedNotes.length === 0 ? (
        <div className="min-h-48 border border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center text-gray-700 gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest">No Notes</span>
          <p className="text-[10px] italic">Entries will appear here by date written.</p>
        </div>
      ) : noteGroups.length === 0 ? (
        <div className="min-h-48 border border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center text-gray-700 gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest">No Matches</span>
          <p className="text-[10px] italic">Try another word or hashtag.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {noteGroups.map((group) => (
            <section
              key={group.dayKey}
              className="rounded-lg border border-white/10 bg-black/25 p-4 shadow-inner"
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                <time className="wfrp-panel-title text-gray-300" dateTime={group.date}>
                  {formatNoteDay(group.date)}
                </time>
                <span className="wfrp-table-label text-gray-500">
                  {group.notes.length} {group.notes.length === 1 ? "Note" : "Notes"}
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {group.notes.map((note) => (
                  <article key={note.id} className="rounded border border-white/5 bg-black/20 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold uppercase tracking-wide text-gray-100">
                          {note.title ?? "Untitled Entry"}
                        </h4>
                        <time className="mt-1 block wfrp-table-label text-gray-500" dateTime={note.createdAt}>
                          {formatNoteDate(note.createdAt)}
                        </time>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteNote(note.id)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-white/10 bg-black/20 text-gray-500 transition-colors hover:border-white/20 hover:text-wfrp-red focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-red/40"
                        aria-label={`Delete note from ${formatNoteDate(note.createdAt)}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
                      {note.text}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
