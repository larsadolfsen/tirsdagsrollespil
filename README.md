# Tirsdagsrollespil

A Vite/React tool for running WFRP 4E character and campaign workflows.

## Development

Install dependencies and start the local development server:

```sh
npm install
npm run dev
```

## Persistent character progress

The production Express server stores mutable character progress in SQLite.

By default, the database file is created at:

```txt
data/tirsdagsrollespil.sqlite
```

Set `WFRP_DB_FILE` to use a different path:

```sh
WFRP_DB_FILE=/path/to/tirsdagsrollespil.sqlite npm start
```

Existing file-based progress under `data/characters` and the older legacy progress paths is copied into SQLite once. Existing SQLite rows are preserved during that migration.

## Testing

The project uses TypeScript for static checks and Playwright for browser-based smoke and regression tests.

Run the standard checks locally:

```sh
npm run lint
npm run build
npm test
```

Playwright starts the Vite dev server automatically through `playwright.config.ts` before running the browser tests.

If this is the first time running Playwright on a machine, install the browser binaries first:

```sh
npx playwright install
```

Useful Playwright commands:

```sh
npm test                 # Run the Playwright test suite headlessly
npm run test:headed      # Run tests in headed browsers
npm run test:ui          # Open the Playwright UI runner
```
