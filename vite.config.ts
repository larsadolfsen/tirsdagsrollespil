import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import path from 'path';
import {DatabaseSync} from 'node:sqlite';
import {defineConfig} from 'vite';
import type {Plugin} from 'vite';

const progressFilePath = path.resolve(__dirname, 'data', 'character-progress.json');
const characterDataDirectory = path.resolve(__dirname, 'data', 'characters');
const databaseFilePath = path.resolve(__dirname, 'data', 'tirsdagsrollespil.sqlite');
const campaignDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: process.env.WFRP_CAMPAIGN_TIME_ZONE ?? 'Europe/Copenhagen',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const database = new DatabaseSync(databaseFilePath);
database.exec(`
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
`);
const selectCampaignDiceRolls = database.prepare(`
  SELECT id, campaign_id, character_id, character_name, roll_json, rolled_at
  FROM dice_rolls
  WHERE campaign_id = ? AND roll_date = ?
  ORDER BY rolled_at DESC, rowid DESC
`);
const insertDiceRoll = database.prepare(`
  INSERT INTO dice_rolls (
    id, campaign_id, character_id, character_name, roll_json, roll_date, rolled_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const deleteOlderDiceRolls = database.prepare('DELETE FROM dice_rolls WHERE roll_date < ?');

type CharacterProgressMap = Record<string, Record<string, unknown>>;

function isSafeCharacterId(characterId: string) {
  return /^[a-zA-Z0-9_-]+$/.test(characterId);
}

function currentCampaignDate() {
  const parts = Object.fromEntries(
    campaignDateFormatter
      .formatToParts(new Date())
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getRequestPathId(url: string | undefined) {
  const encodedId = url?.match(/^\/([^/?#]+)/)?.[1];
  return encodedId ? decodeURIComponent(encodedId) : null;
}

function readJsonFile(filePath: string, fallback: unknown) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readTextFile(filePath: string, fallback = '') {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : fallback;
}

function isCharacterProgressMap(value: unknown): value is CharacterProgressMap {
  return Boolean(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) =>
      Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry),
    );
}

function readProgressMap(): CharacterProgressMap {
  const progress = readJsonFile(progressFilePath, {});
  return isCharacterProgressMap(progress) ? progress : {};
}

function writeProgressFile(progress: CharacterProgressMap) {
  const nextContent = `${JSON.stringify(progress, null, 2)}\n`;
  fs.mkdirSync(path.dirname(progressFilePath), {recursive: true});

  if (fs.existsSync(progressFilePath) && fs.readFileSync(progressFilePath, 'utf8') === nextContent) {
    return;
  }

  fs.writeFileSync(progressFilePath, nextContent, 'utf8');
}

function readRequestJson(req: import('node:http').IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function readCharacterDirectoryState(characterId: string) {
  const characterDirectory = path.join(characterDataDirectory, characterId);
  const sheetPath = path.join(characterDirectory, 'sheet.json');

  if (!fs.existsSync(sheetPath)) {
    return null;
  }

  return {
    ...(readJsonFile(sheetPath, {}) as Record<string, unknown>),
    notes: readJsonFile(path.join(characterDirectory, 'notes.json'), []),
    backgroundText: readTextFile(path.join(characterDirectory, 'background.md')),
  };
}

function readCharacterDirectoryMap(): CharacterProgressMap {
  if (!fs.existsSync(characterDataDirectory)) {
    return {};
  }

  const progressMap: CharacterProgressMap = {};

  for (const entry of fs.readdirSync(characterDataDirectory, {withFileTypes: true})) {
    if (!entry.isDirectory() || !isSafeCharacterId(entry.name)) {
      continue;
    }

    const characterState = readCharacterDirectoryState(entry.name);
    if (characterState) {
      progressMap[entry.name] = characterState;
    }
  }

  return progressMap;
}

function getRequestCharacterId(url: string | undefined) {
  const characterId = url?.match(/^\/([^/?#]+)/)?.[1]
    ? decodeURIComponent(url.match(/^\/([^/?#]+)/)![1])
    : null;

  return characterId || null;
}

function readAvailableProgressMap(): CharacterProgressMap {
  return {
    ...readCharacterDirectoryMap(),
    ...readProgressMap(),
  };
}

function characterProgressFilePlugin(): Plugin {
  return {
    name: 'wfrp-character-progress-file',
    configureServer(server) {
      server.middlewares.use('/api/character-progress', async (req, res) => {
        const characterId = getRequestCharacterId(req.url);

        if (req.method === 'GET') {
          const progressMap = readAvailableProgressMap();

          res.setHeader('Content-Type', 'application/json');

          if (characterId) {
            if (!isSafeCharacterId(characterId)) {
              res.statusCode = 400;
              res.end(JSON.stringify({error: 'Invalid character id'}));
              return;
            }

            const characterProgress = progressMap[characterId] ?? null;
            res.statusCode = characterProgress ? 200 : 404;
            res.end(JSON.stringify(characterProgress));
            return;
          }

          res.end(JSON.stringify(progressMap));
          return;
        }

        if (req.method === 'PUT') {
          try {
            const requestBody = await readRequestJson(req);

            if (characterId) {
              if (!isSafeCharacterId(characterId)) {
                res.statusCode = 400;
                res.end('Invalid character id');
                return;
              }

              const progress = readProgressMap();
              writeProgressFile({
                ...progress,
                [characterId]: requestBody as Record<string, unknown>,
              });
            } else {
              writeProgressFile(isCharacterProgressMap(requestBody) ? requestBody : {});
            }

            res.statusCode = 204;
            res.end();
          } catch {
            res.statusCode = 400;
            res.end('Invalid character progress JSON');
          }

          return;
        }

        if (req.method === 'DELETE' && characterId) {
          const progress = readProgressMap();
          delete progress[characterId];
          writeProgressFile(progress);
          res.statusCode = 204;
          res.end();

          return;
        }

        res.statusCode = 405;
        res.end('Method not allowed');
      });
    },
  };
}

function campaignDiceRollsPlugin(): Plugin {
  return {
    name: 'wfrp-campaign-dice-rolls',
    configureServer(server) {
      server.middlewares.use('/api/dice-rolls', async (req, res) => {
        const campaignId = getRequestPathId(req.url);
        if (!campaignId || !isSafeCharacterId(campaignId)) {
          res.statusCode = 400;
          res.end(JSON.stringify({error: 'Invalid campaign id'}));
          return;
        }

        const today = currentCampaignDate();
        deleteOlderDiceRolls.run(today);
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          const rolls = selectCampaignDiceRolls.all(campaignId, today).map((row) => {
            const typedRow = row as Record<string, string>;
            return {
              ...JSON.parse(typedRow.roll_json),
              id: typedRow.id,
              campaignId: typedRow.campaign_id,
              characterId: typedRow.character_id,
              characterName: typedRow.character_name,
              rolledAt: typedRow.rolled_at,
            };
          });
          res.end(JSON.stringify(rolls));
          return;
        }

        if (req.method === 'POST') {
          try {
            const body = await readRequestJson(req) as Record<string, unknown>;
            const characterId = body.characterId;
            const characterName = body.characterName;
            const roll = body.roll;

            if (
              typeof characterId !== 'string' ||
              !isSafeCharacterId(characterId) ||
              typeof characterName !== 'string' ||
              !characterName ||
              !roll ||
              typeof roll !== 'object'
            ) {
              res.statusCode = 400;
              res.end(JSON.stringify({error: 'Invalid dice roll'}));
              return;
            }

            const id = randomUUID();
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

            res.statusCode = 201;
            res.end(JSON.stringify({
              ...roll,
              id,
              campaignId,
              characterId,
              characterName,
              rolledAt,
            }));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({error: 'Invalid dice roll JSON'}));
          }
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({error: 'Method not allowed'}));
      });
    },
  };
}

function nonBlockingStylesheetPlugin(): Plugin {
  return {
    name: 'wfrp-non-blocking-stylesheets',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(
        /<link\s+([^>]*\brel="stylesheet"[^>]*)>/g,
        (linkTag, attributes) => {
          const preloadAttributes = attributes.replace(
            /\brel="stylesheet"/,
            'rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"',
          );

          return `<link ${preloadAttributes}>` +
            `<noscript>${linkTag}</noscript>`;
        },
      );
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      characterProgressFilePlugin(),
      campaignDiceRollsPlugin(),
      nonBlockingStylesheetPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/data/character-progress.json'],
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }

            if (id.includes('node_modules/motion')) {
              return 'motion-vendor';
            }

            if (id.includes('node_modules/lucide-react')) {
              return 'icon-vendor';
            }

            if (id.includes('/src/data/rules/wfrp4e/')) {
              return 'wfrp4e-rules';
            }
          },
        },
      },
    },
  };
});
