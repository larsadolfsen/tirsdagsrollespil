import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const progressFilePath = path.resolve(__dirname, 'data', 'character-progress.json');
const characterDataDirectory = path.resolve(__dirname, 'data', 'characters');

type CharacterProgressMap = Record<string, Record<string, unknown>>;

function isSafeCharacterId(characterId: string) {
  return /^[a-zA-Z0-9_-]+$/.test(characterId);
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

function characterProgressFilePlugin() {
  return {
    name: 'wfrp-character-progress-file',
    configureServer(server) {
      server.middlewares.use('/api/character-progress', (req, res) => {
        const characterId = decodeURIComponent((req.url ?? '').replace(/^\/+/, '').split(/[?#]/)[0] ?? '');
        const progressMap = {
          ...readCharacterDirectoryMap(),
          ...readProgressMap(),
        };

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');

          if (!characterId) {
            res.end(JSON.stringify(progressMap, null, 2));
            return;
          }

          if (!isSafeCharacterId(characterId)) {
            res.statusCode = 400;
            res.end(JSON.stringify({error: 'Invalid character id'}));
            return;
          }

          const characterProgress = progressMap[characterId] ?? null;
          res.statusCode = characterProgress ? 200 : 404;
          res.end(JSON.stringify(characterProgress, null, 2));
          return;
        }

        if (req.method === 'PUT') {
          if (!characterId || !isSafeCharacterId(characterId)) {
            res.statusCode = 400;
            res.end('Invalid character id');
            return;
          }

          let body = '';

          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', () => {
            try {
              const progress = JSON.parse(body || '{}');
              const nextProgressMap = {
                ...progressMap,
                [characterId]: progress,
              };
              writeProgressFile(nextProgressMap);
              res.statusCode = 204;
              res.end();
            } catch {
              res.statusCode = 400;
              res.end('Invalid character progress JSON');
            }
          });

          return;
        }

        res.statusCode = 405;
        res.end('Method not allowed');
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), characterProgressFilePlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
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
