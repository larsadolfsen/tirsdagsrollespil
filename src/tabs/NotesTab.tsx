import { Trash2 } from "lucide-react";
import { Button, Input, Textarea } from "../components/ui";
import {
  SheetDataHeaderCell,
  SheetDataPanel,
  SheetDataRow,
  SheetDataSection,
  SheetEmptyState,
} from "../components/wfrp";
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
    <>
      {sortedNotes.length > 0 && (
        <SheetDataPanel className="p-3">
          <Input
            value={noteSearch}
            onChange={(event) => setNoteSearch(event.target.value)}
            className="h-9"
            placeholder="Search notes or #hashtags"
            aria-label="Search notes or hashtags"
          />
        </SheetDataPanel>
      )}

      <SheetDataPanel className="divide-y divide-white/5">
        <div className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-0 border-t border-white/5 bg-wfrp-table px-4 py-3">
          <SheetDataHeaderCell>Campaign Journal</SheetDataHeaderCell>
          <SheetDataHeaderCell align="right">
            {sortedNotes.length} {sortedNotes.length === 1 ? "Entry" : "Entries"}
          </SheetDataHeaderCell>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-[minmax(12rem,0.35fr)_minmax(0,1fr)_auto] md:items-start">
          <Input
            id="journal-new-note-title"
            value={newNoteTitle}
            onChange={(event) => setNewNoteTitle(event.target.value)}
            className="h-10 font-semibold"
            placeholder="Entry title"
            aria-label="New note title"
          />
          <Textarea
            value={newNoteText}
            onChange={(event) => setNewNoteText(event.target.value)}
            rows={3}
            className="min-h-24"
            placeholder="Write a note... Use #tags to create a chip."
            aria-label="New note text"
          />
          <Button
            onClick={addNote}
            disabled={!newNoteTitle.trim() || !newNoteText.trim()}
            size="sm"
            className="md:mt-1"
          >
            Add Note
          </Button>
        </div>

        {noteHashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 py-3">
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
                      : "border-white/10 bg-black/25 text-wfrp-muted-text hover:text-gray-200 hover:border-white/20"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </SheetDataPanel>

      {sortedNotes.length === 0 ? (
        <SheetEmptyState title="No Notes">Entries will appear here by date written.</SheetEmptyState>
      ) : noteGroups.length === 0 ? (
        <SheetEmptyState title="No Matches">Try another word or hashtag.</SheetEmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {noteGroups.map((group) => (
            <SheetDataSection
              key={group.dayKey}
              gridClassName="grid-cols-[minmax(0,1fr)_84px_44px] md:grid-cols-[minmax(10rem,0.35fr)_minmax(0,1fr)_132px_44px]"
              sectionLabel={formatNoteDay(group.date)}
              valueLabels={[
                { className: "hidden md:block", label: "Text" },
                { align: "right", label: "Created" },
                { align: "center", label: "More" },
              ]}
            >
              {group.notes.map((note) => (
                <SheetDataRow
                  key={note.id}
                  className="grid-cols-[minmax(0,1fr)_84px_44px] px-0 py-0 md:grid-cols-[minmax(10rem,0.35fr)_minmax(0,1fr)_132px_44px]"
                >
                  <div className="min-w-0 px-4 py-3">
                    <h4 className="truncate text-xs font-bold uppercase tracking-wide text-gray-100">
                      {note.title ?? "Untitled Entry"}
                    </h4>
                    <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs leading-relaxed text-wfrp-muted-text md:hidden">
                      {note.text}
                    </p>
                  </div>

                  <p className="hidden min-w-0 whitespace-pre-wrap px-4 py-3 text-xs font-semibold leading-relaxed text-gray-200 md:block">
                    {note.text}
                  </p>

                  <time
                    className="wfrp-list-cell-strong min-w-0 truncate px-2 py-3 text-right font-mono text-[11px]"
                    dateTime={note.createdAt}
                  >
                    {formatNoteDate(note.createdAt)}
                  </time>

                  <div className="flex justify-center px-2 py-2">
                    <Button
                      onClick={() => deleteNote(note.id)}
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      aria-label={`Delete note from ${formatNoteDate(note.createdAt)}`}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </SheetDataRow>
              ))}
            </SheetDataSection>
          ))}
        </div>
      )}
    </>
  );
}
