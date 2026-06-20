import { InlineSubtabs, SubtabContentFrame, WfrpStandardBtn } from "../components/ui";
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
  { id: "background", label: "background" },
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
  cancelNoteComposer,
  deleteNote,
  editingNoteId,
  editNote,
  isNoteComposerOpen,
  openNoteComposer,
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
  cancelNoteComposer: () => void;
  deleteNote: (noteId: string) => void;
  editingNoteId: string | null;
  editNote: (note: CharacterNoteData) => void;
  isNoteComposerOpen: boolean;
  openNoteComposer: () => void;
  formatNoteDay: (value: string) => string;
  formatNoteDate: (value: string) => string;
  backgroundText: string;
  setBackgroundText: (value: string) => void;
}) {
  const focusNewEntryTitle = () => {
    window.setTimeout(() => {
      document.getElementById("journal-new-note-title")?.focus();
    }, 0);
  };

  const startSessionEntry = () => {
    setActiveJournalSubtab("sessions");
    openNoteComposer();
    focusNewEntryTitle();
  };

  const startNpcEntry = () => {
    setActiveJournalSubtab("npcs");
    openNoteComposer();

    if (!/(^|\s)#npcs?(\s|$)/i.test(newNoteText)) {
      setNewNoteText(newNoteText.trim() ? `${newNoteText.trim()}\n\n#npc` : "#npc");
    }

    focusNewEntryTitle();
  };

  return (
    <SubtabContentFrame
      subtabBar={(
        <InlineSubtabs<JournalSubtab>
          options={journalSubtabOptions}
          activeId={activeJournalSubtab}
          onChange={setActiveJournalSubtab}
          trailingContent={activeJournalSubtab === "background" ? null : (
            <>
              {activeJournalSubtab === "sessions" ? (
                <WfrpStandardBtn
                  onClick={startSessionEntry}
                  name="Add Session"
                  variant="action"
                  size="sm"
                  hideOnMobile
                  aria-label="Add session"
                />
              ) : null}
              {activeJournalSubtab === "npcs" ? (
                <WfrpStandardBtn
                  onClick={startNpcEntry}
                  name="Add NPC"
                  variant="action"
                  size="sm"
                  hideOnMobile
                  aria-label="Add NPC"
                />
              ) : null}
            </>
          )}
        />
      )}
    >
      {activeJournalSubtab === "sessions" ? (
        <NotesTab
          entryLabel="Session"
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
          cancelNoteComposer={cancelNoteComposer}
          deleteNote={deleteNote}
          editingNoteId={editingNoteId}
          editNote={editNote}
          isNoteComposerOpen={isNoteComposerOpen}
          formatNoteDay={formatNoteDay}
          formatNoteDate={formatNoteDate}
        />
      ) : null}

      {activeJournalSubtab === "npcs" ? (
        <NotesTab
          entryLabel="NPC"
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
          cancelNoteComposer={cancelNoteComposer}
          deleteNote={deleteNote}
          editingNoteId={editingNoteId}
          editNote={editNote}
          isNoteComposerOpen={isNoteComposerOpen}
          formatNoteDay={formatNoteDay}
          formatNoteDate={formatNoteDate}
        />
      ) : null}

      {activeJournalSubtab === "background" ? (
        <BackgroundTab
          backgroundText={backgroundText}
          setBackgroundText={setBackgroundText}
        />
      ) : null}
    </SubtabContentFrame>
  );
}
