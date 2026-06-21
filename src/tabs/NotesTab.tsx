import { Button, Input, Textarea } from "../components/ui";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDisclosureCell,
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

const journalEntryGridClass = "grid-cols-[52px_minmax(0,1.2fr)_minmax(90px,0.8fr)_48px] md:grid-cols-[72px_minmax(220px,1.25fr)_minmax(150px,0.75fr)_48px]";
const npcEntryGridClass = "grid-cols-[52px_minmax(0,1fr)_48px] md:grid-cols-[72px_minmax(0,1fr)_48px]";

const formatEntryDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));

export function NotesTab({
  entryLabel,
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
  cancelNoteComposer,
  deleteNote,
  editingNoteId,
  editNote,
  isNoteComposerOpen,
  formatNoteDay,
  formatNoteDate,
}: {
  entryLabel: string;
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
  cancelNoteComposer: () => void;
  deleteNote: (noteId: string) => void;
  editingNoteId: string | null;
  editNote: (note: CharacterNoteData) => void;
  isNoteComposerOpen: boolean;
  formatNoteDay: (value: string) => string;
  formatNoteDate: (value: string) => string;
}) {
  const isNpcList = entryLabel === "NPC";
  const entryGridClass = isNpcList ? npcEntryGridClass : journalEntryGridClass;
  const displayedNotes = noteGroups.flatMap((group) => group.notes);
  const noteNumberById = new Map(
    [...displayedNotes]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((note, index) => [note.id, index + 1]),
  );

  return (
    <>
      {sortedNotes.length > 0 && (
        <Input
          value={noteSearch}
          onChange={(event) => setNoteSearch(event.target.value)}
          className="h-9"
          placeholder="Search notes or #hashtags"
          aria-label="Search notes or hashtags"
        />
      )}

      {isNoteComposerOpen && !editingNoteId ? (
        <SheetDataPanel className="divide-y divide-white/5">
          <div className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-0 border-t border-white/5 bg-wfrp-table px-4 py-3">
            <SheetDataHeaderCell>{editingNoteId ? "Edit Entry" : `Add ${entryLabel}`}</SheetDataHeaderCell>
            <SheetDataHeaderCell align="right">
              {sortedNotes.length} {sortedNotes.length === 1 ? "Entry" : "Entries"}
            </SheetDataHeaderCell>
          </div>

          <div className="flex flex-col gap-3 p-4">
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
            <div className="flex flex-wrap justify-start gap-3">
              <Button variant="subtabAction"
                onClick={addNote}
                disabled={!newNoteTitle.trim() || !newNoteText.trim()}
              >
                {editingNoteId ? "Update Note" : "Save"}
              </Button>
              <Button variant="subtabAction"
                onClick={cancelNoteComposer}
              >
                Cancel
              </Button>
            </div>
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
      ) : null}

      {sortedNotes.length > 0 && noteGroups.length === 0 ? (
        <SheetEmptyState title="No Matches">Try another word or hashtag.</SheetEmptyState>
      ) : (
        <SheetDataSection
          gridClassName={entryGridClass}
          leadingLabels={[{ align: "center", label: "#" }]}
          sectionLabel="Title"
          valueLabels={
            isNpcList
              ? [{ align: "center", label: "More" }]
              : [
                  { label: "Date" },
                  { align: "center", label: "More" },
                ]
          }
        >
          {displayedNotes.map((note) => (
            <SheetDataAccordionRow
              key={note.id}
              summaryClassName={`${entryGridClass} gap-0`}
              contentClassName={`px-3 pb-1 pt-1 md:col-start-1 md:px-4 md:pb-1 ${isNpcList ? "md:col-end-4" : "md:col-end-5"}`}
              summary={(
                <>
                  <div className="wfrp-list-cell-strong min-w-0 text-center font-mono text-gray-200">
                    {noteNumberById.get(note.id)}
                  </div>
                  <div className="min-w-0 truncate text-[12px] font-semibold leading-relaxed text-wfrp-muted-text">
                    {note.title ?? "Untitled Entry"}
                  </div>
                  {!isNpcList ? (
                    <time
                      className="wfrp-list-cell-strong min-w-0 truncate text-left font-mono text-[11px] uppercase tracking-wider text-wfrp-muted-text"
                      dateTime={note.createdAt}
                    >
                      {formatEntryDate(note.createdAt)}
                    </time>
                  ) : null}
                  <SheetDataDisclosureCell />
                </>
              )}
            >
              <SheetDataAccordionDetails className="gap-0" description={editingNoteId === note.id ? null : note.text}>
                {editingNoteId === note.id ? (
                  <div className="flex flex-col gap-3">
                    <Input
                      id="journal-new-note-title"
                      value={newNoteTitle}
                      onChange={(event) => setNewNoteTitle(event.target.value)}
                      className="h-10 font-semibold"
                      placeholder="Entry title"
                      aria-label="Edit note title"
                    />
                    <Textarea
                      value={newNoteText}
                      onChange={(event) => setNewNoteText(event.target.value)}
                      rows={3}
                      className="min-h-24"
                      placeholder="Write a note... Use #tags to create a chip."
                      aria-label="Edit note text"
                    />
                    <div className="-mt-1 flex flex-wrap justify-start gap-3">
                      <Button variant="subtabAction" onClick={cancelNoteComposer}>
                        Cancel
                      </Button>
                      <Button variant="subtabAction"
                        onClick={addNote}
                        disabled={!newNoteTitle.trim() || !newNoteText.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="subtabAction"
                      onClick={() => editNote(note)}
                      aria-label={`Edit note from ${formatNoteDate(note.createdAt)}`}
                    >
                      Edit
                    </Button>
                    <Button variant="subtabAction"
                      onClick={() => deleteNote(note.id)}
                      aria-label={`Delete note from ${formatNoteDate(note.createdAt)}`}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </SheetDataAccordionDetails>
            </SheetDataAccordionRow>
          ))}
        </SheetDataSection>
      )}
    </>
  );
}
