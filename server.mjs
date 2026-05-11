import express from "express";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 3000);
const progressFilePath = path.resolve(
  process.env.WFRP_PROGRESS_FILE ?? path.join(__dirname, "data", "character-progress.json"),
);
const stateDataDirectory = path.dirname(progressFilePath);
const statusDirectoryPath = path.resolve(
  process.env.WFRP_STATUS_DIR ?? path.join(stateDataDirectory, "character-status"),
);
const progressDirectoryPath = path.resolve(
  process.env.WFRP_PROGRESS_DIR ?? path.join(stateDataDirectory, "character-progress"),
);
const notesDirectoryPath = path.resolve(
  process.env.WFRP_NOTES_DIR ?? path.join(stateDataDirectory, "character-notes"),
);

const STATUS_KEYS = [
  "woundsCurrent",
  "corruptionCurrent",
  "fateCurrent",
  "fortuneCurrent",
  "resilienceCurrent",
  "resolveCurrent",
];
const NOTES_KEYS = ["backgroundText", "notes"];

function isSafeCharacterId(characterId) {
  return /^[a-zA-Z0-9_-]+$/.test(characterId);
}

function characterFilePath(directoryPath, characterId) {
  if (!isSafeCharacterId(characterId)) {
    throw new Error(`Unsafe character id "${characterId}".`);
  }

  return path.join(directoryPath, `${characterId}.json`);
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
  const status = pickKeys(characterState, STATUS_KEYS);
  const notes = pickKeys(characterState, NOTES_KEYS);
  const progress = omitKeys(characterState, [...STATUS_KEYS, ...NOTES_KEYS]);

  return { status, progress, notes };
}

async function ensureProgressFile() {
  await fs.mkdir(path.dirname(progressFilePath), { recursive: true });

  try {
    await fs.access(progressFilePath);
  } catch {
    await fs.writeFile(progressFilePath, "{}\n", "utf8");
  }
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

async function writeJsonFile(filePath, value) {
  const nextContent = `${JSON.stringify(value, null, 2)}\n`;
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

async function readCharacterStateDirectory(directoryPath) {
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

async function replaceCharacterStateDirectory(directoryPath, nextStateByCharacterId) {
  await fs.mkdir(directoryPath, { recursive: true });

  const existingEntries = await fs.readdir(directoryPath, { withFileTypes: true });
  await Promise.all(
    existingEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map(async (entry) => {
        const characterId = entry.name.replace(/\.json$/, "");

        if (!Object.prototype.hasOwnProperty.call(nextStateByCharacterId, characterId)) {
          await fs.unlink(path.join(directoryPath, entry.name));
        }
      }),
  );

  await Promise.all(
    Object.entries(nextStateByCharacterId).map(([characterId, state]) =>
      writeJsonFile(characterFilePath(directoryPath, characterId), state ?? {}),
    ),
  );
}

async function readLegacyProgressMap() {
  await ensureProgressFile();
  return readJsonFile(progressFilePath, {});
}

async function readCharacterProgressMap() {
  const legacyProgressMap = await readLegacyProgressMap();
  const statusMap = await readCharacterStateDirectory(statusDirectoryPath);
  const progressMap = await readCharacterStateDirectory(progressDirectoryPath);
  const notesMap = await readCharacterStateDirectory(notesDirectoryPath);
  const characterIds = new Set([
    ...Object.keys(legacyProgressMap),
    ...Object.keys(statusMap),
    ...Object.keys(progressMap),
    ...Object.keys(notesMap),
  ]);

  return Object.fromEntries(
    [...characterIds].map((characterId) => [
      characterId,
      {
        ...(legacyProgressMap[characterId] ?? {}),
        ...(progressMap[characterId] ?? {}),
        ...(statusMap[characterId] ?? {}),
        ...(notesMap[characterId] ?? {}),
      },
    ]),
  );
}

async function writeCharacterProgressMap(progressMap) {
  const statusMap = {};
  const splitProgressMap = {};
  const notesMap = {};

  for (const [characterId, characterState] of Object.entries(progressMap ?? {})) {
    if (!isSafeCharacterId(characterId)) {
      throw new Error(`Unsafe character id "${characterId}".`);
    }

    const { status, progress, notes } = splitCharacterState(characterState ?? {});
    statusMap[characterId] = status;
    splitProgressMap[characterId] = progress;
    notesMap[characterId] = notes;
  }

  await Promise.all([
    replaceCharacterStateDirectory(statusDirectoryPath, statusMap),
    replaceCharacterStateDirectory(progressDirectoryPath, splitProgressMap),
    replaceCharacterStateDirectory(notesDirectoryPath, notesMap),
  ]);
}

app.use(express.json({ limit: "1mb" }));

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
