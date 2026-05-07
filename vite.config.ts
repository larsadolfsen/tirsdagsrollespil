import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const progressFilePath = path.resolve(__dirname, 'data', 'character-progress.json');

function writeProgressFile(progress: unknown) {
  const nextContent = `${JSON.stringify(progress, null, 2)}\n`;
  fs.mkdirSync(path.dirname(progressFilePath), {recursive: true});

  if (fs.existsSync(progressFilePath) && fs.readFileSync(progressFilePath, 'utf8') === nextContent) {
    return;
  }

  fs.writeFileSync(progressFilePath, nextContent, 'utf8');
}

function characterProgressFilePlugin() {
  return {
    name: 'wfrp-character-progress-file',
    configureServer(server) {
      server.middlewares.use('/api/character-progress', (req, res) => {
        if (req.method === 'GET') {
          fs.mkdirSync(path.dirname(progressFilePath), {recursive: true});

          if (!fs.existsSync(progressFilePath)) {
            fs.writeFileSync(progressFilePath, '{}\n', 'utf8');
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(fs.readFileSync(progressFilePath, 'utf8'));
          return;
        }

        if (req.method === 'PUT') {
          let body = '';

          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', () => {
            try {
              const progress = JSON.parse(body || '{}');
              writeProgressFile(progress);
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
  };
});
