import crypto from "node:crypto";
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

// ---------------------------------------------------------------------------
// Server-Sent Events: push character-progress changes to all connected clients
// so every GM view (on any machine) updates instantly.
// ---------------------------------------------------------------------------
/** @type {Set<import('express').Response>} */
const sseClients = new Set();

/**
 * Broadcast a character-progress event to all connected SSE clients.
 * @param {'save'|'clear'} type
 * @param {string} characterId
 * @param {unknown} [progress]
 */
function broadcastProgressEvent(type, characterId, progress) {
  const payload = JSON.stringify(
    progress !== undefined ? { type, characterId, progress } : { type, characterId },
  );
  for (const client of sseClients) {
    client.write(`data: ${payload}\n\n`);
  }
}
// ---------------------------------------------------------------------------
const isRailwayDeployment = Boolean(
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_SERVICE_ID,
);
const isProductionDeployment = process.env.NODE_ENV === "production" || isRailwayDeployment;
const disableHttpCache = process.env.WFRP_DISABLE_HTTP_CACHE !== "false";
const requireAuthentication = process.env.WFRP_REQUIRE_AUTH
  ? process.env.WFRP_REQUIRE_AUTH !== "false"
  : isProductionDeployment;
const basicAuthUsername = process.env.WFRP_BASIC_AUTH_USERNAME ?? "wfrp";
const basicAuthPassword = process.env.WFRP_BASIC_AUTH_PASSWORD ?? process.env.WFRP_AUTH_PASSWORD ?? "";
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
const API_RATE_LIMIT_WINDOW_MS = 60_000;
const API_RATE_LIMIT_MAX_REQUESTS = Number(process.env.WFRP_API_RATE_LIMIT_MAX_REQUESTS ?? 120);
const API_WRITE_RATE_LIMIT_MAX_REQUESTS = Number(process.env.WFRP_API_WRITE_RATE_LIMIT_MAX_REQUESTS ?? 30);
const campaignTimeZone = process.env.WFRP_CAMPAIGN_TIME_ZONE ?? "Europe/Copenhagen";

if (requireAuthentication && !basicAuthPassword) {
  throw new Error(
    "WFRP_BASIC_AUTH_PASSWORD must be set when authentication is required. " +
      "Set WFRP_REQUIRE_AUTH=false only for trusted local/private deployments.",
  );
}

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

  CREATE TABLE IF NOT EXISTS dice_rolls (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    character_id TEXT NOT NULL,
    character_name TEXT NOT NULL,
    roll_json TEXT NOT NULL,
    roll_date TEXT NOT NULL,
    rolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS dice_rolls_campaign_date
    ON dice_rolls (campaign_id, roll_date, rolled_at DESC);

  CREATE TABLE IF NOT EXISTS gm_sessions (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    session_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    session_date TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    scenes_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS gm_sessions_campaign_number
    ON gm_sessions (campaign_id, session_number DESC);
`);

// Migration: add scenes_json to existing databases that predate this column.
try {
  database.exec("ALTER TABLE gm_sessions ADD COLUMN scenes_json TEXT NOT NULL DEFAULT '[]'");
} catch {
  // Column already exists — no action needed.
}

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
const selectCampaignDiceRolls = database.prepare(`
  SELECT id, campaign_id, character_id, character_name, roll_json, rolled_at
  FROM dice_rolls
  WHERE campaign_id = ? AND roll_date = ?
  ORDER BY rolled_at DESC, rowid DESC
`);
const insertDiceRoll = database.prepare(`
  INSERT INTO dice_rolls (
    id,
    campaign_id,
    character_id,
    character_name,
    roll_json,
    roll_date,
    rolled_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const deleteOlderDiceRolls = database.prepare(`
  DELETE FROM dice_rolls
  WHERE roll_date < ?
`);

const selectCampaignSessions = database.prepare(`
  SELECT id, campaign_id, session_number, name, session_date, notes, scenes_json, created_at, updated_at
  FROM gm_sessions
  WHERE campaign_id = ?
  ORDER BY session_number DESC, created_at DESC
`);
const upsertGmSession = database.prepare(`
  INSERT INTO gm_sessions (
    id,
    campaign_id,
    session_number,
    name,
    session_date,
    notes,
    scenes_json,
    updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(id) DO UPDATE SET
    session_number = excluded.session_number,
    name = excluded.name,
    session_date = excluded.session_date,
    notes = excluded.notes,
    scenes_json = excluded.scenes_json,
    updated_at = CURRENT_TIMESTAMP
`);
const deleteGmSession = database.prepare(`
  DELETE FROM gm_sessions
  WHERE id = ?
`);

let legacyMigrationPromise = null;
const campaignDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: campaignTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function isSafeCharacterId(characterId) {
  return typeof characterId === "string" && /^[a-zA-Z0-9_-]+$/.test(characterId);
}

function isSafeCampaignId(campaignId) {
  return typeof campaignId === "string" && /^[a-zA-Z0-9_-]+$/.test(campaignId);
}

function currentCampaignDate(now = new Date()) {
  const parts = Object.fromEntries(
    campaignDateFormatter
      .formatToParts(now)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function isFiniteRollNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 10_000;
}

function isRollBonusSource(value) {
  return Boolean(value) &&
    typeof value === "object" &&
    typeof value.label === "string" &&
    value.label.length <= 100 &&
    isFiniteRollNumber(value.value);
}

function isDiceRollPayload(value) {
  return Boolean(value) &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    /^[a-zA-Z0-9_-]{1,100}$/.test(value.id) &&
    typeof value.label === "string" &&
    value.label.length <= 200 &&
    (value.title === null || value.title === undefined ||
      (typeof value.title === "string" && value.title.length <= 200)) &&
    ["dramatic", "attack", "channeling", "corruption"].includes(value.testType) &&
    isFiniteRollNumber(value.result) &&
    isFiniteRollNumber(value.sl) &&
    typeof value.isSuccess === "boolean" &&
    isFiniteRollNumber(value.modifier) &&
    Array.isArray(value.targetBonusSources) &&
    value.targetBonusSources.length <= 20 &&
    value.targetBonusSources.every(isRollBonusSource) &&
    isFiniteRollNumber(value.target) &&
    (value.damage === null || value.damage === undefined || isFiniteRollNumber(value.damage)) &&
    (value.hitLocation === null || value.hitLocation === undefined ||
      (typeof value.hitLocation === "string" && value.hitLocation.length <= 100)) &&
    (value.isCritical === undefined || typeof value.isCritical === "boolean");
}

function pruneOlderDiceRolls(today = currentCampaignDate()) {
  deleteOlderDiceRolls.run(today);
  return today;
}

function rowToDiceRoll(row) {
  const roll = parseJsonValue(row.roll_json, "roll_json", row.character_id);

  return {
    ...roll,
    id: row.id,
    campaignId: row.campaign_id,
    characterId: row.character_id,
    characterName: row.character_name,
    rolledAt: row.rolled_at,
  };
}

function rowToGmSession(row) {
  let scenes = [];
  try {
    const parsed = JSON.parse(row.scenes_json ?? "[]");
    scenes = Array.isArray(parsed) ? parsed : [];
  } catch {
    scenes = [];
  }

  return {
    id: row.id,
    campaignId: row.campaign_id,
    sessionNumber: row.session_number,
    name: row.name,
    date: row.session_date,
    notes: row.notes,
    scenes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isSafeSessionNumber(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100_000;
}

function isSafeSessionId(sessionId) {
  return typeof sessionId === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(sessionId);
}

pruneOlderDiceRolls();

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

function safeCompare(value, expectedValue) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expectedValue);
  return valueBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(valueBuffer, expectedBuffer);
}

function parseBasicAuthHeader(authorizationHeader) {
  if (typeof authorizationHeader !== "string" || !authorizationHeader.startsWith("Basic ")) {
    return null;
  }

  try {
    const decodedValue = Buffer.from(authorizationHeader.slice("Basic ".length), "base64").toString("utf8");
    const separatorIndex = decodedValue.indexOf(":");

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decodedValue.slice(0, separatorIndex),
      password: decodedValue.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function requireBasicAuth(req, res, next) {
  if (!requireAuthentication) {
    next();
    return;
  }

  const credentials = parseBasicAuthHeader(req.headers.authorization);
  const isAuthenticated = Boolean(credentials) &&
    safeCompare(credentials.username, basicAuthUsername) &&
    safeCompare(credentials.password, basicAuthPassword);

  if (isAuthenticated) {
    next();
    return;
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Tirsdagsrollespil", charset="UTF-8"');
  res.status(401).send("Authentication required");
}

function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'none'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
    ].join("; "),
  );
  next();
}

function clientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket.remoteAddress || "unknown";
}

function createRateLimit({ windowMs, maxRequests, keyPrefix, methods = null }) {
  const buckets = new Map();

  return (req, res, next) => {
    if (methods && !methods.has(req.method)) {
      next();
      return;
    }

    const now = Date.now();
    const key = `${keyPrefix}:${clientIp(req)}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count <= maxRequests) {
      next();
      return;
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({ error: "Too many requests" });
  };
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
  if (!isCharacterProgressMap(progressMap)) {
    throw new Error("Expected character progress payload to be an object map.");
  }

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

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(securityHeaders);
app.use(compressionMiddleware);
app.use(requireBasicAuth);
app.use(
  "/api/",
  createRateLimit({
    keyPrefix: "api",
    windowMs: API_RATE_LIMIT_WINDOW_MS,
    maxRequests: API_RATE_LIMIT_MAX_REQUESTS,
  }),
);
app.use(
  "/api/",
  createRateLimit({
    keyPrefix: "api-write",
    windowMs: API_RATE_LIMIT_WINDOW_MS,
    maxRequests: API_WRITE_RATE_LIMIT_MAX_REQUESTS,
    methods: new Set(["DELETE", "PATCH", "POST", "PUT"]),
  }),
);
app.use(express.json({ limit: "1mb" }));

// SSE stream — clients subscribe here to receive real-time progress updates.
app.get("/api/character-progress/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send an initial comment so the browser knows the stream is alive.
  res.write(": connected\n\n");

  sseClients.add(res);

  // Keep-alive ping every 25 s to prevent proxies from closing idle connections.
  const keepAlive = setInterval(() => res.write(": ping\n\n"), 25_000);

  req.on("close", () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

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
    const progress = req.body ?? {};
    writeCharacterProgress(req.params.characterId, progress);
    broadcastProgressEvent("save", req.params.characterId, progress);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.delete("/api/character-progress/:characterId", async (req, res, next) => {
  try {
    await ensureLegacyMigration();
    deleteCharacterProgressStatement.run(req.params.characterId);
    broadcastProgressEvent("clear", req.params.characterId);
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

app.get("/api/dice-rolls/:campaignId", (req, res, next) => {
  try {
    const { campaignId } = req.params;
    if (!isSafeCampaignId(campaignId)) {
      res.status(400).json({ error: "Invalid campaign id" });
      return;
    }

    const today = pruneOlderDiceRolls();
    const rolls = selectCampaignDiceRolls
      .all(campaignId, today)
      .map(rowToDiceRoll);

    res.json(rolls);
  } catch (error) {
    next(error);
  }
});

app.post("/api/dice-rolls/:campaignId", (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { characterId, characterName, roll } = req.body ?? {};

    if (!isSafeCampaignId(campaignId)) {
      res.status(400).json({ error: "Invalid campaign id" });
      return;
    }
    if (!isSafeCharacterId(characterId)) {
      res.status(400).json({ error: "Invalid character id" });
      return;
    }
    if (typeof characterName !== "string" || characterName.length < 1 || characterName.length > 200) {
      res.status(400).json({ error: "Invalid character name" });
      return;
    }
    if (!isDiceRollPayload(roll)) {
      res.status(400).json({ error: "Invalid dice roll" });
      return;
    }

    const today = pruneOlderDiceRolls();
    const id = crypto.randomUUID();
    const rolledAt = new Date().toISOString();
    insertDiceRoll.run(
      id,
      campaignId,
      characterId,
      characterName,
      JSON.stringify(roll),
      today,
      rolledAt,
    );

    res.status(201).json({
      ...roll,
      id,
      campaignId,
      characterId,
      characterName,
      rolledAt,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/gm-sessions/:campaignId", (req, res, next) => {
  try {
    const { campaignId } = req.params;
    if (!isSafeCampaignId(campaignId)) {
      res.status(400).json({ error: "Invalid campaign id" });
      return;
    }

    const sessions = selectCampaignSessions
      .all(campaignId)
      .map(rowToGmSession);

    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

app.put("/api/gm-sessions/:campaignId", (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { id, sessionNumber, name, date, notes, scenes } = req.body ?? {};

    if (!isSafeCampaignId(campaignId)) {
      res.status(400).json({ error: "Invalid campaign id" });
      return;
    }
    if (!isSafeSessionId(id)) {
      res.status(400).json({ error: "Invalid session id" });
      return;
    }
    if (!isSafeSessionNumber(sessionNumber)) {
      res.status(400).json({ error: "Invalid session number" });
      return;
    }
    if (typeof name !== "string" || name.length > 200) {
      res.status(400).json({ error: "Invalid session name" });
      return;
    }
    if (typeof date !== "string" || date.length > 50) {
      res.status(400).json({ error: "Invalid session date" });
      return;
    }
    if (typeof notes !== "string" || notes.length > 10_000_000) {
      res.status(400).json({ error: "Invalid session notes" });
      return;
    }

    const scenesJson = Array.isArray(scenes) ? JSON.stringify(scenes) : "[]";

    upsertGmSession.run(
      id,
      campaignId,
      sessionNumber,
      name,
      date,
      notes,
      scenesJson
    );

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.delete("/api/gm-sessions/:campaignId/:sessionId", (req, res, next) => {
  try {
    const { campaignId, sessionId } = req.params;

    if (!isSafeCampaignId(campaignId)) {
      res.status(400).json({ error: "Invalid campaign id" });
      return;
    }
    if (!isSafeSessionId(sessionId)) {
      res.status(400).json({ error: "Invalid session id" });
      return;
    }

    deleteGmSession.run(sessionId);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  const statusCode = message.includes("Unsafe character id") ||
      message.includes("Expected character progress payload") ||
      error?.type === "entity.parse.failed"
    ? 400
    : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({ error: statusCode === 500 ? "Internal server error" : message });
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

app.get(/.*/, (_req, res) => {
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
