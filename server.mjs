import express from "express";
import { mkdirSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 3000);
const isRailwayDeployment = Boolean(
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_SERVICE_ID,
);
const isProductionDeployment = process.env.NODE_ENV === "production" || isRailwayDeployment;
const disableHttpCache = process.env.WFRP_DISABLE_HTTP_CACHE !== "false";
const stateDataDirectory = path.resolve(
  process.env.WFRP_DATA_DIR ??
    process.env.RAILWAY_VOLUME_MOUNT_PATH ??
    path.join(__dirname, "data"),
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
const LEGACY_MIGRATION_KEY = "legacy-character-progress-migrated";
const COMPRESSIBLE_CONTENT_TYPES = [
  /^text\//i,
  /^application\/(?:javascript|json|manifest\+json|xml)/i,
  /^font\/(?:ttf|otf)/i,
  /^image\/svg\+xml/i,
];

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

  CREATE TABLE IF NOT EXISTS app_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const selectCharacterProgress = database.prepare(`
  SELECT character_id, sheet_json, notes_json, background_text
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
const insertCharacterProgressIfMissing = database.prepare(`
  INSERT INTO character_progress (
    character_id,
    sheet_json,
    notes_json,
    background_text,
    updated_at
  ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(character_id) DO NOTHING
`);
const deleteCharacterProgressStatement = database.prepare(`
  DELETE FROM character_progress
  WHERE character_id = ?
`);
const selectMetadataValue = database.prepare(`
  SELECT value
  FROM app_metadata
  WHERE key = ?
`);
const upsertMetadataValue = database.prepare(`
  INSERT INTO app_metadata (key, value, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = CURRENT_TIMESTAMP
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

function appendVaryHeader(res, value) {
  const currentValue = res.getHeader("Vary");

  if (!currentValue) {
    res.setHeader("Vary", value);
    return;
  }

  const values = String(currentValue)
    .split(",")
    .map((entry) => entry.trim().toLowerCase());

  if (!values.includes(value.toLowerCase())) {
    res.setHeader("Vary", `${currentValue}, ${value}`);
  }
}

function acceptsEncoding(req, encoding) {
  const acceptEncoding = req.headers["accept-encoding"];
  return typeof acceptEncoding === "string" && acceptEncoding.includes(encoding);
}

function isCompressibleResponse(res) {
  const contentType = res.getHeader("Content-Type");

  if (!contentType) {
    return false;
  }

  return COMPRESSIBLE_CONTENT_TYPES.some((pattern) => pattern.test(String(contentType)));
}

function responseChunkToBuffer(chunk, encoding) {
  return Buffer.isBuffer(chunk)
    ? chunk
    : Buffer.from(chunk, typeof encoding === "string" ? encoding : undefined);
}

function compressionMiddleware(req, res, next) {
  if (req.method === "HEAD" || res.getHeader("Content-Encoding")) {
    next();
    return;
  }

  const encoding = acceptsEncoding(req, "br")
    ? "br"
    : acceptsEncoding(req, "gzip")
      ? "gzip"
      : null;

  if (!encoding) {
    next();
    return;
  }

  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);
  const chunks = [];

  res.write = (chunk, ...args) => {
    if (chunk) {
      chunks.push(responseChunkToBuffer(chunk, args[0]));
    }

    return true;
  };

  res.end = (chunk, ...args) => {
    if (chunk) {
      chunks.push(responseChunkToBuffer(chunk, args[0]));
    }

    if (
      res.statusCode < 200 ||
      res.statusCode === 204 ||
      res.statusCode === 304 ||
      res.getHeader("Content-Encoding") ||
      !isCompressibleResponse(res)
    ) {
      for (const bufferedChunk of chunks) {
        originalWrite(bufferedChunk);
      }
      return originalEnd();
    }

    const body = Buffer.concat(chunks);

    if (body.length < 1024) {
      for (const bufferedChunk of chunks) {
        originalWrite(bufferedChunk);
      }
      return originalEnd();
    }

    const compressedBody = encoding === "br"
      ? zlib.brotliCompressSync(body)
      : zlib.gzipSync(body);

    res.setHeader("Content-Encoding", encoding);
    res.setHeader("Content-Length", compressedBody.length);
    appendVaryHeader(res, "Accept-Encoding");

    return originalEnd(compressedBody);
  };

  next();
}

function parseJsonValue(value, columnName, characterId) {
  if (typeof value !== "string") {
    throw new Error(`Expected ${columnName} for character "${characterId}" to be stored as JSON text.`);
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(
      `Could not parse ${columnName} for character "${characterId}". The SQLite data may be corrupted.`,
      { cause: error },
    );
  }
}

function rowToCharacterState(row) {
  if (!row) {
    return null;
  }

  return joinCharacterState({
    sheet: parseJsonValue(row.sheet_json, "sheet_json", row.character_id),
    notes: parseJsonValue(row.notes_json, "notes_json", row.character_id),
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

function isCharacterProgressMap(value) {
  return Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) =>
      Boolean(entry) && typeof entry === "object" && !Array.isArray(entry),
    );
}

async function readLegacyProgressMap() {
  const [singleFileState, statusMap, progressMap, notesMap] = await Promise.all([
    readJsonFile(legacyProgressFilePath, {}),
    readLegacyCharacterStateDirectory(legacyStatusDirectoryPath),
    readLegacyCharacterStateDirectory(legacyProgressDirectoryPath),
    readLegacyCharacterStateDirectory(legacyNotesDirectoryPath),
  ]);
  const singleFileMap = isCharacterProgressMap(singleFileState) ? singleFileState : {};
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

function writeCharacterProgress(characterId, characterState, statement = upsertCharacterProgress) {
  if (!isSafeCharacterId(characterId)) {
    throw new Error(`Unsafe character id "${characterId}".`);
  }

  const { sheet, notes, backgroundText } = splitCharacterState(characterState ?? {});
  statement.run(
    characterId,
    JSON.stringify(sheet ?? {}),
    JSON.stringify(Array.isArray(notes) ? notes : []),
    typeof backgroundText === "string" ? backgroundText : "",
  );
}

function beginImmediateTransaction() {
  database.exec("BEGIN IMMEDIATE");
}

function commitTransaction() {
  database.exec("COMMIT");
}

function rollbackTransaction() {
  database.exec("ROLLBACK");
}

function hasCompletedLegacyMigration() {
  return selectMetadataValue.get(LEGACY_MIGRATION_KEY)?.value === "true";
}

async function ensureLegacyMigration() {
  if (!legacyMigrationPromise) {
    legacyMigrationPromise = (async () => {
      if (hasCompletedLegacyMigration()) {
        return;
      }

      const legacyProgressMap = await readLegacyCharacterProgressMap();

      beginImmediateTransaction();
      try {
        for (const [characterId, characterState] of Object.entries(legacyProgressMap)) {
          writeCharacterProgress(characterId, characterState, insertCharacterProgressIfMissing);
        }

        upsertMetadataValue.run(LEGACY_MIGRATION_KEY, "true");
        commitTransaction();
      } catch (error) {
        rollbackTransaction();
        throw error;
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

  const characterEntries = Object.entries(progressMap ?? {});
  for (const [characterId] of characterEntries) {
    if (!isSafeCharacterId(characterId)) {
      throw new Error(`Unsafe character id "${characterId}".`);
    }
  }

  beginImmediateTransaction();
  try {
    database.exec("DELETE FROM character_progress");

    for (const [characterId, characterState] of characterEntries) {
      writeCharacterProgress(characterId, characterState);
    }

    commitTransaction();
  } catch (error) {
    rollbackTransaction();
    throw error;
  }
}

app.use(compressionMiddleware);
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
    maxAge: disableHttpCache ? 0 : isProductionDeployment ? "1d" : 0,
    setHeaders(res, filePath) {
      if (disableHttpCache) {
        res.setHeader("Cache-Control", "no-store, max-age=0");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        return;
      }

      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
        return;
      }

      if (!isProductionDeployment) {
        res.setHeader("Cache-Control", "no-store");
        return;
      }

      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }

      if (filePath.includes(`${path.sep}fonts${path.sep}`)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

app.get("*", (_req, res) => {
  if (disableHttpCache) {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  } else {
    res.setHeader("Cache-Control", "no-cache");
  }
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`WFRP Sheet server listening on port ${port}`);
});
