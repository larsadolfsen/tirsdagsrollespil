import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig} from 'vite';
import type {Plugin} from 'vite';

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
    plugins: [react(), tailwindcss(), characterProgressFilePlugin(), nonBlockingStylesheetPlugin()],
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
