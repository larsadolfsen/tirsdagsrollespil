# React Router Adoption — Design

**Date:** 2026-07-03
**Status:** Approved

## Goal

Replace the hand-rolled routing (`window.history.pushState`/`replaceState`, manual
`popstate` listeners, and path-flag `useState` initializers) with **react-router v7 in
declarative mode** (`<BrowserRouter>` + `<Routes>`).

This is a pure refactor:

- Every URL that works today keeps working identically.
- No behavior change visible to users.
- `tests/routes.spec.ts` is the URL contract and must pass unchanged.

Out of scope: data loaders, nested tab routes, splitting `AppComposition.tsx` into
per-route components. The router owns URL/history only.

## Dependency

- `npm install react-router` (v7 single package, React 19-compatible).
- Do **not** install `react-router-dom` (v7 merged it into `react-router`).

## Route table

`main.tsx` wraps the app in `<BrowserRouter>`. A small new `AppRoutes.tsx` (or routes
directly in `App.tsx`) declares:

| Path | Renders |
|---|---|
| `/` | Landing page |
| `/:campaignId/campaign/:sessionSlug?` | Game Master page |
| `/:campaignId/library/:bookId?/:chapterId?` | Library |
| `/:campaignId/:characterSlug/:view?` | Character sheet |
| `*` | Landing page rendered at that URL (current behavior — no redirect) |

The character route needs validation beyond path shape (campaign must exist in
`campaignById`; the character slug resolves via ids, renamed names, and `aka` aliases).
`parseCampaignCharacterPath` / `resolveRouteCharacterId` in `src/lib/campaignRoutes.ts`
survive as pure helpers. A small route wrapper calls them and renders the Landing page
when they return `null`, exactly as today.

## What gets replaced

### `src/AppComposition.tsx`

- The `isLandingPageOpen` / `isGameMasterOpen` / `isLibraryOpen` `useState` flags and
  their `window.location.pathname` initializers become values **derived** from
  `useLocation` / `useParams`.
- The manual `popstate` listener effect is deleted (React Router handles history).
- GM-session URL-sync effects (`replaceState` on session select, slug matching on
  popstate) switch to `useNavigate` + `useParams`.
- `openCharacterFromLanding`, `openGameMasterFromLanding`, `openLibraryFromLanding`,
  `handleSelectSessionOnMobile`, `selectLibraryBook`, `selectLibraryChapter` call
  `navigate(...)` with the existing path-builder helpers instead of
  `window.history.pushState`.
- Library `libraryBookId` / `libraryChapterId` state comes from route params instead of
  `useState` + effects.

### `src/lib/useCampaignRouteSync.ts`

- Rewritten internally on `useNavigate` / `useLocation`; no more `window.history` or
  `popstate`.
- External API unchanged: `selectCharacter`, `selectMainTab`, `selectMobileMainView`,
  `restoreRouteForCharacter` keep their signatures so callers don't change.
- Push-vs-replace semantics preserved: state-sync writes use
  `navigate(path, { replace: true })`; user-initiated tab/character selection uses plain
  `navigate(path)`.

### `src/lib/useGameSession.ts`

- The one-time initial-character read keeps calling
  `parseCampaignCharacterPath(window.location.pathname)` directly — it runs before the
  router renders and is a pure startup read. No change beyond a comment if helpful.

## What does not change

- URL formats, slug logic (`slugifyPathSegment`, `toSessionSlug`), view aliases, and
  alias-based character resolution.
- `buildCampaignCharacterPath` / `buildCampaignLibraryPath` /
  `parseCampaignCharacterPath` / `parseCampaignLibraryPath` remain pure helpers.
- Document-title effects, all page components, tab components, sidebars.
- `server.mjs` — it already has an SPA fallback (`res.sendFile(dist/index.html)`).
- The Playwright suite: no new tests. `tests/routes.spec.ts`, `tests/gamemaster.spec.ts`
  and `tests/library.spec.ts` already exercise deep links, tab navigation and
  back/forward.

## Error handling

- Unparseable paths render the Landing page at that URL (no redirect), matching current
  behavior.
- Invalid campaign or unresolvable character slug → Landing page fallback, same as the
  current `parseCampaignCharacterPath(...) === null` handling.

## Testing & verification

- Gate: `npm run lint && npm run build && npm test` (full Playwright suite).
- Manual smoke via dev server: landing → character → tab switch → browser back/forward;
  GM page session select URL sync; library book/chapter deep link.

## Risks

- **Push/replace semantics.** `useCampaignRouteSync` deliberately replaces history
  entries on passive state sync and pushes on user clicks. Getting this wrong breaks
  back-button behavior; the Playwright routes suite covers most of it.
- **Initial-render ordering.** Flags currently initialize from `window.location` in
  `useState` initializers before any effect runs. Deriving them from `useLocation` keeps
  the same first-render values because the router provides location synchronously.
