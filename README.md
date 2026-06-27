# Tirsdagsrollespil

A Vite/React tool for running WFRP 4E character and campaign workflows.

## Development

Install dependencies and start the local development server:

```sh
npm install
npm run dev
```

## Railway

The production server stores character progress in the data directory. On Railway,
attach a Volume to the app service so saved character data survives deploys and
restarts.

Recommended volume mount path:

```text
/app/data
```

Railway injects `RAILWAY_VOLUME_MOUNT_PATH` at runtime when a Volume is attached,
and `server.mjs` uses it automatically. You can also override the storage path
with `WFRP_DATA_DIR`.

### Production access control

Production and Railway deployments require HTTP Basic Auth by default. Configure
these Railway environment variables before deploying:

```sh
WFRP_BASIC_AUTH_USERNAME=wfrp
WFRP_BASIC_AUTH_PASSWORD=<strong-random-password>
```

Set `WFRP_REQUIRE_AUTH=false` only for trusted local or private-network
deployments. Do not use it for a public Railway service.

Optional API rate-limit tuning:

```sh
WFRP_API_RATE_LIMIT_MAX_REQUESTS=120
WFRP_API_WRITE_RATE_LIMIT_MAX_REQUESTS=30
```

Railway build/start commands are configured in `railway.json`:

```sh
npm run build
npm run start
```

To deploy from this machine with npm, install and link the Railway CLI first:

```sh
npm install -g @railway/cli
railway login
railway link
```

Then deploy with:

```sh
npm run deploy
```

The deploy script runs a production build and then calls `railway up`.

Runtime data under `data/` is protected by Git hooks. Commits and pushes that
include character save files or SQLite runtime database files are blocked by
default, so local saves are not published over production seed data by mistake.
Intentional seed-data changes can be allowed with `ALLOW_DATA_COMMIT=1` and
`ALLOW_DATA_PUSH=1`.

Enable the hooks in a fresh clone with:

```sh
git config core.hooksPath .githooks
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

Campaign dice rolls are also stored in SQLite. The shared log retains only the current
campaign day; set `WFRP_CAMPAIGN_TIME_ZONE` to control the day boundary (the default is
`Europe/Copenhagen`).

## Testing

The project uses TypeScript for static checks and Playwright for browser-based smoke and regression tests.

Run the standard checks locally:

```sh
npm run security:audit
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

## PageSpeed

Run a PageSpeed Insights performance snapshot against the configured public
deployment URL:

```sh
npm run pagespeed
```

The command checks both mobile and desktop by default. You can pass one strategy
to narrow the run:

```sh
npm run pagespeed -- mobile
```

Pass a URL to test a different page:

```sh
npm run pagespeed -- https://your-public-app-url.example
```

Set `PAGESPEED_API_KEY` in the environment if you need higher API quota.
