import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import type {Plugin} from 'vite';

const progressFilePath = path.resolve(__dirname, 'data', 'character-progress.json');

function readProgressFile(): Record<string, unknown> {
  fs.mkdirSync(path.dirname(progressFilePath), {recursive: true});

  if (!fs.existsSync(progressFilePath)) {
    fs.writeFileSync(progressFilePath, '{}\n', 'utf8');
  }

  return JSON.parse(fs.readFileSync(progressFilePath, 'utf8') || '{}');
}

function writeProgressFile(progress: unknown) {
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

function characterProgressFilePlugin(): Plugin {
  return {
    name: 'wfrp-character-progress-file',
    configureServer(server) {
      server.middlewares.use('/api/character-progress', async (req, res) => {
        const characterId = req.url?.match(/^\/([^/?#]+)/)?.[1]
          ? decodeURIComponent(req.url.match(/^\/([^/?#]+)/)![1])
          : null;

        if (req.method === 'GET') {
          const progress = readProgressFile();

          res.setHeader('Content-Type', 'application/json');
          if (characterId) {
            if (!Object.hasOwn(progress, characterId)) {
              res.statusCode = 404;
              res.end('null');
              return;
            }

            res.end(JSON.stringify(progress[characterId]));
            return;
          }

          res.end(JSON.stringify(progress));
          return;
        }

        if (req.method === 'PUT') {
          try {
            const requestBody = await readRequestJson(req);

            if (characterId) {
              const progress = readProgressFile();
              writeProgressFile({
                ...progress,
                [characterId]: requestBody,
              });
            } else {
              const progress = requestBody;
              writeProgressFile(progress);
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
          const progress = readProgressFile();
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

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), characterProgressFilePlugin(), nonBlockingStylesheetPlugin()],
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
