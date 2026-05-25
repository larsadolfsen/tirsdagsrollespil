import express from "express";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 3000);
const stateDataDirectory = path.resolve(
  process.env.WFRP_DATA_DIR ??
    process.env.RAILWAY_VOLUME_MOUNT_PATH ??
    path.join(__dirname, "data"),
);
const characterDataDirectory = path.resolve(
  process.env.WFRP_CHARACTERS_DIR ?? path.join(stateDataDirectory, "characters"),
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

async function writeJsonFile(filePath, value) {
  const nextContent = `${JSON.stringify(value, null, 2)}\n`;
  await writeTextFile(filePath, nextContent);
}

async function writeTextFile(filePath, nextContent) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    const currentContent = await fs.readFile(filePath, "utf8");

    if (currentContent === nextContent) {
      return;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  await fs.writeFile(filePath, nextContent, "utf8");
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

async function writeCharacterDirectoryState(characterId, characterState) {
  const { sheet, notes, backgroundText } = splitCharacterState(characterState ?? {});

  await Promise.all([
    writeJsonFile(characterSheetPath(characterId), sheet),
    writeJsonFile(characterNotesPath(characterId), notes),
    writeTextFile(characterBackgroundPath(characterId), backgroundText),
  ]);
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

async function readCharacterProgressMap() {
  const [legacyProgressMap, characterDirectoryMap] = await Promise.all([
    readLegacyProgressMap(),
    readCharacterDirectoryMap(),
  ]);

  return {
    ...legacyProgressMap,
    ...characterDirectoryMap,
  };
}

async function readCharacterProgress(characterId) {
  return (await readCharacterDirectoryState(characterId)) ?? (await readLegacyCharacterProgress(characterId));
}

async function writeCharacterProgressMap(progressMap) {
  await fs.mkdir(characterDataDirectory, { recursive: true });

  const existingEntries = await fs.readdir(characterDataDirectory, { withFileTypes: true });
  await Promise.all(
    existingEntries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        if (!Object.prototype.hasOwnProperty.call(progressMap ?? {}, entry.name)) {
          await fs.rm(path.join(characterDataDirectory, entry.name), { recursive: true, force: true });
        }
      }),
  );

  await Promise.all(
    Object.entries(progressMap ?? {}).map(async ([characterId, characterState]) => {
      if (!isSafeCharacterId(characterId)) {
        throw new Error(`Unsafe character id "${characterId}".`);
      }

      await writeCharacterDirectoryState(characterId, characterState);
    }),
  );
}

app.use(express.json({ limit: "1mb" }));

app.get("/api/character-progress/:characterId", async (req, res, next) => {
  try {
    const characterProgress = await readCharacterProgress(req.params.characterId);

    if (!characterProgress) {
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
    await writeCharacterDirectoryState(req.params.characterId, req.body ?? {});
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.delete("/api/character-progress/:characterId", async (req, res, next) => {
  try {
    await fs.rm(characterDirectoryPath(req.params.characterId), { recursive: true, force: true });
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
