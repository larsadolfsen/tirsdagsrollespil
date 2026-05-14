import { InlineSubtabs } from "../components/ui";
import type { CharacterNoteData } from "../types/storage";
import { BackgroundTab } from "./BackgroundTab";
import { NotesTab } from "./NotesTab";
import type { JournalSubtab } from "./tabTypes";

type NoteGroup = {
  dayKey: string;
  date: string;
  notes: CharacterNoteData[];
};

const journalSubtabOptions: Array<{ id: JournalSubtab; label: string }> = [
  { id: "sessions", label: "Sessions" },
  { id: "npcs", label: "NPCs" },
  { id: "backgrounds", label: "Backgrounds" },
];

export function JournalTab({
  activeJournalSubtab,
  setActiveJournalSubtab,
  sortedNotes,
  noteGroups,
  noteHashtags,
  npcNotes,
  npcNoteGroups,
  npcNoteHashtags,
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
  backgroundText,
  setBackgroundText,
}: {
  activeJournalSubtab: JournalSubtab;
  setActiveJournalSubtab: (subtab: JournalSubtab) => void;
  sortedNotes: CharacterNoteData[];
  noteGroups: NoteGroup[];
  noteHashtags: string[];
  npcNotes: CharacterNoteData[];
  npcNoteGroups: NoteGroup[];
  npcNoteHashtags: string[];
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
  backgroundText: string;
  setBackgroundText: (value: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <InlineSubtabs<JournalSubtab>
        options={journalSubtabOptions}
        activeId={activeJournalSubtab}
        onChange={setActiveJournalSubtab}
      />

      {activeJournalSubtab === "sessions" ? (
        <NotesTab
          sortedNotes={sortedNotes}
          noteGroups={noteGroups}
          noteHashtags={noteHashtags}
          noteSearch={noteSearch}
          setNoteSearch={setNoteSearch}
          newNoteTitle={newNoteTitle}
          setNewNoteTitle={setNewNoteTitle}
          newNoteText={newNoteText}
          setNewNoteText={setNewNoteText}
          addNote={addNote}
          deleteNote={deleteNote}
          formatNoteDay={formatNoteDay}
          formatNoteDate={formatNoteDate}
        />
      ) : null}

      {activeJournalSubtab === "npcs" ? (
        <NotesTab
          sortedNotes={npcNotes}
          noteGroups={npcNoteGroups}
          noteHashtags={npcNoteHashtags}
          noteSearch={noteSearch}
          setNoteSearch={setNoteSearch}
          newNoteTitle={newNoteTitle}
          setNewNoteTitle={setNewNoteTitle}
          newNoteText={newNoteText}
          setNewNoteText={setNewNoteText}
          addNote={addNote}
          deleteNote={deleteNote}
          formatNoteDay={formatNoteDay}
          formatNoteDate={formatNoteDate}
        />
      ) : null}

      {activeJournalSubtab === "backgrounds" ? (
        <BackgroundTab
          backgroundText={backgroundText}
          setBackgroundText={setBackgroundText}
        />
      ) : null}
    </div>
  );
}
