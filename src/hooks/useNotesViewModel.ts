import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CharacterNoteData } from "../types/storage";

type NoteGroup = {
  dayKey: string;
  date: string;
  notes: CharacterNoteData[];
};

interface UseNotesViewModelOptions {
  notes: CharacterNoteData[];
  setNotes: Dispatch<SetStateAction<CharacterNoteData[]>>;
}

const formatNoteDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatNoteDay = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
  }).format(new Date(value));

const getNoteDayKey = (value: string) => {
  const date = new Date(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const getNoteHashtags = (text: string) =>
  Array.from(text.matchAll(/(^|\s)#([A-Za-z0-9_-]+)/g), (match) => match[2].toLowerCase());

const groupNotesByDay = (entries: CharacterNoteData[]) =>
  entries.reduce<NoteGroup[]>((groups, note) => {
    const dayKey = getNoteDayKey(note.createdAt);
    const existingGroup = groups.find((group) => group.dayKey === dayKey);

    if (existingGroup) {
      existingGroup.notes.push(note);
    } else {
      groups.push({ dayKey, date: note.createdAt, notes: [note] });
    }

    return groups;
  }, []);

export function useNotesViewModel({ notes, setNotes }: UseNotesViewModelOptions) {
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [noteSearch, setNoteSearch] = useState("");

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const noteHashtags = [...new Set(sortedNotes.flatMap((note) => getNoteHashtags(note.text)))].sort();
  const normalizedNoteSearch = noteSearch.trim().toLowerCase();
  const filteredNotes = normalizedNoteSearch
    ? sortedNotes.filter((note) => {
        const text = note.text.toLowerCase();
        const title = (note.title ?? "").toLowerCase();
        const hashtags = getNoteHashtags(note.text);
        const search = normalizedNoteSearch.startsWith("#")
          ? normalizedNoteSearch.slice(1)
          : normalizedNoteSearch;

        return (
          text.includes(normalizedNoteSearch) ||
          title.includes(normalizedNoteSearch) ||
          hashtags.some((tag) => tag.includes(search))
        );
      })
    : sortedNotes;
  const noteGroups = groupNotesByDay(filteredNotes);
  const npcNotes = filteredNotes.filter((note) =>
    getNoteHashtags(note.text).some((tag) => tag === "npc" || tag === "npcs"),
  );
  const npcNoteGroups = groupNotesByDay(npcNotes);
  const npcNoteHashtags = [...new Set(npcNotes.flatMap((note) => getNoteHashtags(note.text)))].sort();

  const addNote = () => {
    const title = newNoteTitle.trim();
    const text = newNoteText.trim();
    if (!title || !text) return;

    setNotes((prev) => [
      ...prev,
      {
        id: `note_${Date.now()}`,
        title,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewNoteTitle("");
    setNewNoteText("");
  };

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  return {
    addNote,
    deleteNote,
    formatNoteDate,
    formatNoteDay,
    newNoteText,
    newNoteTitle,
    noteGroups,
    noteHashtags,
    noteSearch,
    npcNoteGroups,
    npcNoteHashtags,
    npcNotes,
    setNewNoteText,
    setNewNoteTitle,
    setNoteSearch,
    sortedNotes,
  };
}
