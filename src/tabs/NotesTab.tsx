import { Trash2 } from "lucide-react";
import { Button, Input, Panel, Textarea } from "../components/ui";
import { SheetEmptyState } from "../components/wfrp";
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
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3 lg:p-4">
      {sortedNotes.length > 0 && (
        <Panel className="flex flex-col gap-3 p-4">
          <Input
            value={noteSearch}
            onChange={(event) => setNoteSearch(event.target.value)}
            className="h-9 text-gray-200"
            placeholder="Search notes or #hashtags"
            aria-label="Search notes"
          />
        </Panel>
      )}

      <Panel className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="wfrp-panel-title">
            Campaign Journal
            <div className="wfrp-panel-rule" />
          </h3>
          <span className="wfrp-table-label text-right">
            {sortedNotes.length} {sortedNotes.length === 1 ? "Entry" : "Entries"}
          </span>
        </div>
        <Input
          value={newNoteTitle}
          onChange={(event) => setNewNoteTitle(event.target.value)}
          className="h-10 font-semibold"
          placeholder="Entry title"
          aria-label="New note title"
        />
        <Textarea
          value={newNoteText}
          onChange={(event) => setNewNoteText(event.target.value)}
          rows={4}
          className="min-h-28 resize-y text-gray-200"
          placeholder="Write a note... Use #tags to create a chip."
          aria-label="New note text"
        />
        <div className="flex justify-end">
          <Button
            onClick={addNote}
            disabled={!newNoteTitle.trim() || !newNoteText.trim()}
            variant="outline"
            className="font-black"
          >
            Add Note
          </Button>
        </div>
        {noteHashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-white/5 pt-3">
            {noteHashtags.map((tag) => {
              const tagSearch = `#${tag}`;
              const isActive = noteSearch.trim().toLowerCase() === tagSearch;

              return (
                <Button
                  key={tag}
                  onClick={() => setNoteSearch(isActive ? "" : tagSearch)}
                  variant={isActive ? "outline" : "ghost"}
                  size="chip"
                  className={isActive ? "border-wfrp-gold/60 bg-wfrp-gold/15 text-wfrp-gold" : "border border-white/10 bg-black/25"}
                  aria-pressed={isActive}
                >
                  #{tag}
                </Button>
              );
            })}
          </div>
        )}
      </Panel>

      {sortedNotes.length === 0 ? (
        <SheetEmptyState title="No Notes">Entries will appear here by date written.</SheetEmptyState>
      ) : noteGroups.length === 0 ? (
        <SheetEmptyState title="No Matches">Try another word or hashtag.</SheetEmptyState>
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
                      <Button
                        onClick={() => deleteNote(note.id)}
                        variant="danger"
                        size="icon"
                        className="shrink-0"
                        aria-label={`Delete note from ${formatNoteDate(note.createdAt)}`}
                      >
                        <Trash2 size={12} />
                      </Button>
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
