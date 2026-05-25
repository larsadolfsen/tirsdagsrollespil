import express from "express";
import { mkdirSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 3000);
const stateDataDirectory = path.resolve(
  process.env.WFRP_DATA_DIR ?? path.join(__dirname, "data"),
);
const characterDataDirectory = path.resolve(
  process.env.WFRP_CHARACTERS_DIR ?? path.join(stateDataDirectory, "characters"),
);
const databaseFilePath = path.resolve(
  process.env.WFRP_DB_FILE ?? path.join(stateDataDirectory, "tirsdagsrollespil.sqlite"),
);
const legacyProgressFilePath = path.resolve(
  process.env.WFRP_PROGRESS_FILE ?? path.join(stateDataDirectory, "character-progress.json"),
);
const legacyStatusDirectoryPath = path.resolve(
  process.env.WFRP_STATUS_DIR ?? path.join(stateDataDirectory, "character-status"),
);
const legacyProgressDirectoryPath = path.resolve(
  process.env.WFRP_PROGRESS_DIR ?? path.join(stateDataDirectory, "character-progress"),
);
const legacyNotesDirectoryPath = path.resolve(
  process.env.WFRP_NOTES_DIR ?? path.join(stateDataDirectory, "character-notes"),
);

const NOTES_KEYS = ["backgroundText", "notes"];

mkdirSync(path.dirname(databaseFilePath), { recursive: true });
const database = new DatabaseSync(databaseFilePath);
database.exec(`
  CREATE TABLE IF NOT EXISTS character_progress (
    character_id TEXT PRIMARY KEY,
    sheet_json TEXT NOT NULL,
    notes_json TEXT NOT NULL DEFAULT '[]',
    background_text TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const selectCharacterProgress = database.prepare(`
  SELECT sheet_json, notes_json, background_text
  FROM character_progress
  WHERE character_id = ?
`);
const selectAllCharacterProgress = database.prepare(`
  SELECT character_id, sheet_json, notes_json, background_text
  FROM character_progress
  ORDER BY character_id
`);
const upsertCharacterProgress = database.prepare(`
  INSERT INTO character_progress (
    character_id,
    sheet_json,
    notes_json,
    background_text,
    updated_at
  ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(character_id) DO UPDATE SET
    sheet_json = excluded.sheet_json,
    notes_json = excluded.notes_json,
    background_text = excluded.background_text,
    updated_at = CURRENT_TIMESTAMP
`);
const deleteCharacterProgressStatement = database.prepare(`
  DELETE FROM character_progress
  WHERE character_id = ?
`);
const deleteMissingCharacterProgressStatement = database.prepare(`
  DELETE FROM character_progress
  WHERE character_id NOT IN (SELECT value FROM json_each(?))
`);
const countCharacterProgress = database.prepare(`
  SELECT COUNT(*) AS count
  FROM character_progress
`);

let legacyMigrationPromise = null;

function isSafeCharacterId(characterId) {
  return /^[a-zA-Z0-9_-]+$/.test(characterId);
}

function characterDirectoryPath(characterId) {
  if (!isSafeCharacterId(characterId)) {
    throw new Error(`Unsafe character id "${characterId}".`);
  }

  return path.join(characterDataDirectory, characterId);
}

function characterSheetPath(characterId) {
  return path.join(characterDirectoryPath(characterId), "sheet.json");
}

function characterNotesPath(characterId) {
  return path.join(characterDirectoryPath(characterId), "notes.json");
}

function characterBackgroundPath(characterId) {
  return path.join(characterDirectoryPath(characterId), "background.md");
}

function pickKeys(source, keys) {
  return Object.fromEntries(
    keys
      .filter((key) => Object.prototype.hasOwnProperty.call(source, key))
      .map((key) => [key, source[key]]),
  );
}

function omitKeys(source, keys) {
  const keySet = new Set(keys);
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => !keySet.has(key)),
  );
}

function splitCharacterState(characterState) {
  const notesState = pickKeys(characterState, NOTES_KEYS);
  const sheet = omitKeys(characterState, NOTES_KEYS);

  return {
    sheet,
    notes: Array.isArray(notesState.notes) ? notesState.notes : [],
    backgroundText: typeof notesState.backgroundText === "string" ? notesState.backgroundText : "",
  };
}

function joinCharacterState({ sheet, notes, backgroundText }) {
  return {
    ...(sheet ?? {}),
    backgroundText: typeof backgroundText === "string" ? backgroundText : "",
    notes: Array.isArray(notes) ? notes : [],
  };
}

function parseJsonValue(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function rowToCharacterState(row) {
  if (!row) {
    return null;
  }

  return joinCharacterState({
    sheet: parseJsonValue(row.sheet_json, {}),
    notes: parseJsonValue(row.notes_json, []),
    backgroundText: row.background_text,
  });
}

async function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

async function readTextFile(filePath, fallback = "") {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

async function readCharacterDirectoryState(characterId) {
  const [sheet, notes, backgroundText] = await Promise.all([
    readJsonFile(characterSheetPath(characterId), null),
    readJsonFile(characterNotesPath(characterId), []),
    readTextFile(characterBackgroundPath(characterId), ""),
  ]);

  if (!sheet) {
    return null;
  }

  return joinCharacterState({ sheet, notes, backgroundText });
}

async function readCharacterDirectoryMap() {
  try {
    const entries = await fs.readdir(characterDataDirectory, { withFileTypes: true });
    const characterEntries = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && isSafeCharacterId(entry.name))
        .map(async (entry) => {
          const characterState = await readCharacterDirectoryState(entry.name);
          return characterState ? [entry.name, characterState] : null;
        }),
    );

    return Object.fromEntries(characterEntries.filter(Boolean));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

async function readLegacyCharacterStateDirectory(directoryPath) {
  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const characterStateEntries = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map(async (entry) => {
          const characterId = entry.name.replace(/\.json$/, "");

          if (!isSafeCharacterId(characterId)) {
            return null;
          }

          const state = await readJsonFile(path.join(directoryPath, entry.name), {});
          return [characterId, state];
        }),
    );

    return Object.fromEntries(characterStateEntries.filter(Boolean));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

async function readLegacyProgressMap() {
  const [singleFileMap, statusMap, progressMap, notesMap] = await Promise.all([
    readJsonFile(legacyProgressFilePath, {}),
    readLegacyCharacterStateDirectory(legacyStatusDirectoryPath),
    readLegacyCharacterStateDirectory(legacyProgressDirectoryPath),
    readLegacyCharacterStateDirectory(legacyNotesDirectoryPath),
  ]);
  const characterIds = new Set([
    ...Object.keys(singleFileMap),
    ...Object.keys(statusMap),
    ...Object.keys(progressMap),
    ...Object.keys(notesMap),
  ]);

  return Object.fromEntries(
    [...characterIds].map((characterId) => [
      characterId,
      {
        ...(singleFileMap[characterId] ?? {}),
        ...(progressMap[characterId] ?? {}),
        ...(statusMap[characterId] ?? {}),
        ...(notesMap[characterId] ?? {}),
      },
    ]),
  );
}

async function readLegacyCharacterProgress(characterId) {
  const legacyProgressMap = await readLegacyProgressMap();
  return legacyProgressMap[characterId] ?? null;
}

async function readLegacyCharacterProgressMap() {
  const [legacyProgressMap, characterDirectoryMap] = await Promise.all([
    readLegacyProgressMap(),
    readCharacterDirectoryMap(),
  ]);

  return {
    ...legacyProgressMap,
    ...characterDirectoryMap,
  };
}

function writeCharacterProgress(characterId, characterState) {
  if (!isSafeCharacterId(characterId)) {
    throw new Error(`Unsafe character id "${characterId}".`);
  }

  const { sheet, notes, backgroundText } = splitCharacterState(characterState ?? {});
  upsertCharacterProgress.run(
    characterId,
    JSON.stringify(sheet ?? {}),
    JSON.stringify(Array.isArray(notes) ? notes : []),
    typeof backgroundText === "string" ? backgroundText : "",
  );
}

async function ensureLegacyMigration() {
  if (!legacyMigrationPromise) {
    legacyMigrationPromise = (async () => {
      const { count } = countCharacterProgress.get();

      if (count > 0) {
        return;
      }

      const legacyProgressMap = await readLegacyCharacterProgressMap();

      for (const [characterId, characterState] of Object.entries(legacyProgressMap)) {
        writeCharacterProgress(characterId, characterState);
      }
    })();
  }

  await legacyMigrationPromise;
}

async function readCharacterProgress(characterId) {
  if (!isSafeCharacterId(characterId)) {
    throw new Error(`Unsafe character id "${characterId}".`);
  }

  await ensureLegacyMigration();

  return rowToCharacterState(selectCharacterProgress.get(characterId));
}

async function readCharacterProgressMap() {
  await ensureLegacyMigration();

  return Object.fromEntries(
    selectAllCharacterProgress.all().map((row) => [
      row.character_id,
      rowToCharacterState(row),
    ]),
  );
}

async function writeCharacterProgressMap(progressMap) {
  await ensureLegacyMigration();

  const characterIds = Object.keys(progressMap ?? {});

  for (const characterId of characterIds) {
    writeCharacterProgress(characterId, progressMap[characterId]);
  }

  if (characterIds.length === 0) {
    database.exec("DELETE FROM character_progress");
    return;
  }

  deleteMissingCharacterProgressStatement.run(JSON.stringify(characterIds));
}

app.use(express.json({ limit: "1mb" }));

app.get("/api/character-progress/:characterId", async (req, res, next) => {
  try {
    const characterProgress = await readCharacterProgress(req.params.characterId);

    if (!characterProgress) {
      const legacyCharacterProgress = await readLegacyCharacterProgress(req.params.characterId);

      if (legacyCharacterProgress) {
        writeCharacterProgress(req.params.characterId, legacyCharacterProgress);
        res.json(legacyCharacterProgress);
        return;
      }

      res.status(404).json(null);
      return;
    }

    res.json(characterProgress);
  } catch (error) {
    next(error);
  }
});

app.put("/api/character-progress/:characterId", async (req, res, next) => {
  try {
    await ensureLegacyMigration();
    writeCharacterProgress(req.params.characterId, req.body ?? {});
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.delete("/api/character-progress/:characterId", async (req, res, next) => {
  try {
    await ensureLegacyMigration();
    deleteCharacterProgressStatement.run(req.params.characterId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/character-progress", async (_req, res, next) => {
  try {
    res.json(await readCharacterProgressMap());
  } catch (error) {
    next(error);
  }
});

app.put("/api/character-progress", async (req, res, next) => {
  try {
    await writeCharacterProgressMap(req.body ?? {});
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use(
  express.static(path.join(__dirname, "dist"), {
    index: false,
    maxAge: "1d",
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
        return;
      }

      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

app.get("*", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`WFRP Sheet server listening on port ${port}`);
});
