# React Router Adoption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hand-rolled `pushState`/`replaceState`/`popstate` routing with react-router v7 (declarative mode) while keeping every URL and behavior identical.

**Architecture:** `<BrowserRouter>` wraps the app in `main.tsx`. A new `AppRoutes.tsx` declares the route table, with every route rendering the *same* `<AppComposition />` element so React preserves component state across page switches. `AppComposition` derives its page flags (landing/GM/library) from `useLocation()` using the existing parsers in `src/lib/campaignRoutes.ts`, and all `window.history` calls become `navigate()` calls. `useCampaignRouteSync` is rewritten on `useNavigate`/`useLocation` with its external API unchanged.

**Tech Stack:** React 19, Vite 8, react-router v7 (single package — NOT `react-router-dom`), Playwright.

**Spec:** `docs/superpowers/specs/2026-07-03-react-router-design.md`

## Global Constraints

- URLs must not change: `tests/routes.spec.ts` is the contract and must pass unchanged. Do not edit any test file.
- Install `react-router` only. Never install `react-router-dom` (v7 merged it into `react-router`).
- Push-vs-replace semantics preserved: passive state→URL sync uses `navigate(path, { replace: true })`; user-initiated navigation uses plain `navigate(path)`.
- Pure *reads* of `window.location.pathname` outside React render (startup reads, one-shot effects) are allowed and stay. All *writes* via `window.history` must go.
- `src/lib/campaignRoutes.ts` (parsers/builders) is not modified.
- Project rules: no raw HTML headings/paragraphs, semantic Tailwind tokens only, never commit files under `data/` (see `.agents/AGENTS.md`).
- Test policy: this is a pure refactor covered by the existing Playwright suite. Each task's test cycle = run the named spec files and see them pass; no new tests are written.
- Before running the **full** suite (`npm test`), delete stale results: `rm -rf test-results` (Bash) / `Remove-Item -Recurse -Force test-results` (PowerShell). Not needed for single-spec runs.

---

### Task 1: Install react-router and mount BrowserRouter + route table

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `src/main.tsx`
- Create: `src/AppRoutes.tsx`
- Modify: `src/App.tsx:29-40`
- Test: `tests/routes.spec.ts` (existing, unchanged)

**Interfaces:**
- Consumes: existing `AppComposition` (unchanged in this task).
- Produces: `AppRoutes` component (named export, no props). After this task every component under `App` may use `useLocation`/`useNavigate`/`useParams` from `"react-router"`.

- [ ] **Step 1: Install the dependency**

Run: `npm install react-router`
Expected: `react-router` appears in `package.json` dependencies with a `^7.x` version. If npm resolves a version below 7, stop and report.

- [ ] **Step 2: Wrap the app in BrowserRouter**

Replace the entire content of `src/main.tsx` with:

```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 3: Create the route table**

Create `src/AppRoutes.tsx`:

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route, Routes } from "react-router";
import { AppComposition } from "./AppComposition";

// Every route renders the SAME element instance so React preserves
// AppComposition's state when navigating between pages (it is one component
// that derives the active page from the URL). The catch-all renders the
// landing page at unknown URLs without redirecting, matching pre-router
// behavior. Do not add `key` props here — that would force remounts.
const appComposition = <AppComposition />;

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={appComposition} />
      <Route path="/:campaignId/campaign/:sessionSlug?" element={appComposition} />
      <Route path="/:campaignId/library/:bookId?/:chapterId?" element={appComposition} />
      <Route path="/:campaignId/:characterSlug/:view?" element={appComposition} />
      <Route path="*" element={appComposition} />
    </Routes>
  );
}
```

- [ ] **Step 4: Use AppRoutes in App.tsx**

In `src/App.tsx`, replace:

```tsx
import { AppComposition } from "./AppComposition";
```

with:

```tsx
import { AppRoutes } from "./AppRoutes";
```

and replace `<AppComposition />` with `<AppRoutes />` inside the JSX:

```tsx
export default function App() {
  return (
    <GameSessionProvider>
      <SaveStatusBanner />
      <AppRoutes />
    </GameSessionProvider>
  );
}
```

- [ ] **Step 5: Verify no behavior change**

Run: `npm run lint`
Expected: PASS (tsc + typography check clean).

Run: `npx playwright test tests/routes.spec.ts`
Expected: all tests PASS. (AppComposition still uses its own history code; BrowserRouter coexists because nothing reads router state yet.)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/main.tsx src/AppRoutes.tsx src/App.tsx
git commit -m "feat: mount react-router BrowserRouter and route table"
```

---

### Task 2: Rewrite useCampaignRouteSync on useNavigate/useLocation

**Files:**
- Modify: `src/lib/useCampaignRouteSync.ts` (full rewrite of internals)
- Test: `tests/routes.spec.ts` (existing, unchanged)

**Interfaces:**
- Consumes: `useLocation`, `useNavigate` from `"react-router"` (available since Task 1); `buildCampaignCharacterPath`, `parseCampaignCharacterPath`, `defaultCampaignId` from `./campaignRoutes` (unchanged).
- Produces: the hook's external API is IDENTICAL to before — `useCampaignRouteSync(options)` returning `{ restoreRouteForCharacter, selectCharacter, selectMainTab, selectMobileMainView }` with the same signatures. `AppComposition` must not need changes for this task.

- [ ] **Step 1: Replace the file content**

Replace the entire content of `src/lib/useCampaignRouteSync.ts` with:

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { CampaignCharacterRoute } from "./campaignRoutes";
import {
  buildCampaignCharacterPath,
  defaultCampaignId,
  parseCampaignCharacterPath,
} from "./campaignRoutes";
import type { MainTab, MobileMainView } from "../tabs/tabTypes";

type CharacterRouteOption = {
  id: string;
};

type UseCampaignRouteSyncOptions = {
  activeMainTab: MainTab;
  activeMobileMainView: MobileMainView;
  availableCharacters: CharacterRouteOption[];
  handleMobileMainViewSelect: (target: MobileMainView) => void;
  routeSyncEnabled?: boolean;
  selectedCharacterId: string;
  setActiveMainTab: (tab: MainTab) => void;
  setActiveMobileMainView: (target: MobileMainView) => void;
  setSelectedCharacterId: (characterId: string) => void;
  isAllProgressHydrated?: boolean;
  characterName?: string;
};

type SyncRouteOptions = {
  characterId?: string;
  view?: MobileMainView;
  mode?: "push" | "replace";
  omitDefaultView?: boolean;
};

const isMainTab = (target: MobileMainView): target is MainTab => target !== "characteristics";

export function useCampaignRouteSync({
  activeMainTab,
  activeMobileMainView,
  availableCharacters,
  handleMobileMainViewSelect,
  routeSyncEnabled = true,
  selectedCharacterId,
  setActiveMainTab,
  setActiveMobileMainView,
  setSelectedCharacterId,
  isAllProgressHydrated = false,
  characterName = "",
}: UseCampaignRouteSyncOptions) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasAppliedInitialRoute, setHasAppliedInitialRoute] = useState(false);
  const currentCampaignRoute = useRef<CampaignCharacterRoute | null>(
    parseCampaignCharacterPath(location.pathname),
  );
  const locationRef = useRef(location);
  locationRef.current = location;

  const syncCampaignRoute = useCallback(({
    characterId = selectedCharacterId,
    view = currentCampaignRoute.current?.view ?? activeMobileMainView,
    mode = "replace",
    omitDefaultView = currentCampaignRoute.current?.hasExplicitView === false,
  }: SyncRouteOptions = {}) => {
    if (!routeSyncEnabled) return;

    const campaignId = currentCampaignRoute.current?.campaignId ?? defaultCampaignId;
    const nextPath = buildCampaignCharacterPath({
      campaignId,
      characterId,
      view,
      omitDefaultView,
      characterName,
    });
    const { hash, pathname, search } = locationRef.current;
    const nextUrl = `${nextPath}${search}${hash}`;
    const route = parseCampaignCharacterPath(nextPath);

    if (route) {
      currentCampaignRoute.current = route;
    }

    if (pathname === nextPath) {
      return;
    }

    navigate(nextUrl, { replace: mode !== "push" });
  }, [activeMobileMainView, characterName, navigate, routeSyncEnabled, selectedCharacterId]);

  // Applies the URL to app state. Runs on mount, on every location change
  // (covers back/forward — React Router owns popstate now), and again when
  // hydration completes so renamed-character slugs resolve correctly.
  // Idempotent: after our own navigate() calls it re-applies the same values.
  useEffect(() => {
    if (!routeSyncEnabled) {
      setHasAppliedInitialRoute(false);
      currentCampaignRoute.current = null;
      return;
    }

    const route = parseCampaignCharacterPath(location.pathname);
    if (route) {
      currentCampaignRoute.current = route;

      if (availableCharacters.some((character) => character.id === route.characterId)) {
        setSelectedCharacterId(route.characterId);
      }

      setActiveMainTab(route.tab);
      setActiveMobileMainView(route.view);
    }

    setHasAppliedInitialRoute(true);
  }, [
    availableCharacters,
    location.pathname,
    routeSyncEnabled,
    setActiveMainTab,
    setActiveMobileMainView,
    setSelectedCharacterId,
    isAllProgressHydrated,
  ]);

  useEffect(() => {
    if (!hasAppliedInitialRoute) return;

    syncCampaignRoute();
  }, [hasAppliedInitialRoute, syncCampaignRoute]);

  const selectMainTab = useCallback((tab: MainTab) => {
    syncCampaignRoute({ view: tab, mode: "push", omitDefaultView: false });
    setActiveMainTab(tab);
    setActiveMobileMainView(tab);
  }, [setActiveMainTab, setActiveMobileMainView, syncCampaignRoute]);

  const selectMobileMainView = useCallback((target: MobileMainView) => {
    syncCampaignRoute({ view: target, mode: "push", omitDefaultView: false });
    setActiveMobileMainView(target);

    if (isMainTab(target)) {
      setActiveMainTab(target);
    }

    handleMobileMainViewSelect(target);
  }, [handleMobileMainViewSelect, setActiveMainTab, setActiveMobileMainView, syncCampaignRoute]);

  const selectCharacter = useCallback((characterId: string) => {
    syncCampaignRoute({ characterId, mode: "push" });
    setSelectedCharacterId(characterId);
  }, [setSelectedCharacterId, syncCampaignRoute]);

  const restoreRouteForCharacter = useCallback((characterId: string) => {
    const route = currentCampaignRoute.current;
    if (route?.characterId !== characterId) {
      return false;
    }

    setActiveMainTab(route.tab);
    setActiveMobileMainView(route.hasExplicitView ? route.view : "characteristics");
    return true;
  }, [setActiveMainTab, setActiveMobileMainView]);

  return {
    restoreRouteForCharacter,
    selectCharacter,
    selectMainTab,
    selectMobileMainView,
  };
}
```

Key differences from the old version (for review): `window.history.pushState/replaceState` → `navigate(url, { replace: mode !== "push" })`; the `popstate` listener is gone — the apply-route effect now depends on `location.pathname`; `getCurrentPathname()` helper removed; search/hash read from a `locationRef` so `syncCampaignRoute`'s identity doesn't churn on every location change.

- [ ] **Step 2: Verify**

Run: `npm run lint`
Expected: PASS.

Run: `npx playwright test tests/routes.spec.ts`
Expected: all tests PASS — this spec exercises tab pushes, breadcrumb navigation, slug resolution, and the rename→URL-update flow that goes through `syncCampaignRoute`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/useCampaignRouteSync.ts
git commit -m "refactor: rewrite useCampaignRouteSync on react-router navigation"
```

---

### Task 3: Derive page flags from the URL; navigate() for landing and breadcrumbs

**Files:**
- Modify: `src/AppComposition.tsx` (flag state → derived values; landing handlers; breadcrumb onClicks; popstate effect shrunk)
- Test: `tests/routes.spec.ts`, `tests/library.spec.ts` (existing, unchanged)

**Interfaces:**
- Consumes: `useLocation`, `useNavigate` from `"react-router"`.
- Produces: `AppComposition` no longer has `isLandingPageOpen`/`isGameMasterOpen`/`isLibraryOpen` state or setters — they are consts derived from `location.pathname`. A `libraryRoute` const (`CampaignLibraryRoute | null`) exists for Task 4 to build on. `location` and `navigate` consts are available throughout the component body.

- [ ] **Step 1: Add router imports and derived flags**

In `src/AppComposition.tsx`, add to the imports:

```ts
import { useLocation, useNavigate } from "react-router";
```

Then replace the three flag-state blocks (currently around lines 245–269):

```ts
  const [isLandingPageOpen, setIsLandingPageOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      parseCampaignCharacterPath(window.location.pathname) === null &&
      !window.location.pathname.includes("/campaign") &&
      !window.location.pathname.includes("/library")
    );
  });
  const [isGameMasterOpen, setIsGameMasterOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.location.pathname.includes("/campaign");
  });
  const [isLibraryOpen, setIsLibraryOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.location.pathname.includes("/library");
  });
```

with derived values (note: the router provides location synchronously, so first-render values match the old initializers):

```ts
  const location = useLocation();
  const navigate = useNavigate();
  const libraryRoute = useMemo(
    () => parseCampaignLibraryPath(location.pathname),
    [location.pathname],
  );
  const isLibraryOpen = libraryRoute !== null;
  const isGameMasterOpen = location.pathname.includes("/campaign");
  const isLandingPageOpen =
    !isGameMasterOpen &&
    !isLibraryOpen &&
    parseCampaignCharacterPath(location.pathname) === null;
```

- [ ] **Step 2: Convert the landing-page open handlers**

Replace `openCharacterFromLanding`, `openGameMasterFromLanding`, and `openLibraryFromLanding` (currently around lines 951–982) with:

```ts
  const openCharacterFromLanding = useCallback((characterId: string) => {
    const character = availableCharacters.find((availableCharacter) => availableCharacter.id === characterId);
    const nextPath = buildCampaignCharacterPath({
      campaignId: character?.campaignId,
      characterId,
      view: "characteristics",
      omitDefaultView: true,
    });

    navigate(`${nextPath}${location.search}${location.hash}`);
    setSelectedCharacterId(characterId);
  }, [availableCharacters, location.hash, location.search, navigate, setSelectedCharacterId]);

  const openGameMasterFromLanding = useCallback(() => {
    navigate(`/${characterData.campaignId}/campaign${location.search}${location.hash}`);
  }, [characterData.campaignId, location.hash, location.search, navigate]);

  const openLibraryFromLanding = useCallback(() => {
    navigate(buildCampaignLibraryPath({ campaignId: characterData.campaignId }));
  }, [characterData.campaignId, navigate]);
```

- [ ] **Step 3: Convert breadcrumb/header home navigation**

There are four places that push `/` and flip flags manually. Replace each:

(a) Character-sheet breadcrumbs (around line 1793):

```ts
    {
      label: campaignName,
      href: "/",
      onClick: () => {
        window.history.pushState(null, "", "/");
        setIsLandingPageOpen(true);
        setIsGameMasterOpen(false);
      },
    },
```
→
```ts
    {
      label: campaignName,
      href: "/",
      onClick: () => navigate("/"),
    },
```

(b) GM breadcrumbs — the same `campaignName` entry appears twice inside the `gmBreadcrumbs` ternary (around lines 1871–1900); replace both with `onClick: () => navigate("/")` as above. Also in the GM "Campaign" crumb, replace:

```ts
            onClick: () => {
              setSelectedGmSessionId(null);
              const basePath = `/${characterData.campaignId}/campaign`;
              window.history.pushState(null, "", basePath);
            },
```
→
```ts
            onClick: () => {
              setSelectedGmSessionId(null);
              navigate(`/${characterData.campaignId}/campaign`);
            },
```

(c) Library breadcrumbs `campaignName` entry (around line 1933): replace the `onClick` body (`pushState` + `setIsLandingPageOpen(true)` + `setIsLibraryOpen(false)`) with `onClick: () => navigate("/")`.

(d) `LibraryHeader`'s `onNavigateHome` prop (around line 1964): replace

```tsx
            onNavigateHome={() => {
              window.history.pushState(null, "", "/");
              setIsLandingPageOpen(true);
              setIsLibraryOpen(false);
            }}
```
→
```tsx
            onNavigateHome={() => navigate("/")}
```

- [ ] **Step 4: Shrink the popstate effect**

The manual popstate effect (currently lines 916–949) still handles library params and GM session slugs (state until Tasks 4–5), but must stop setting the removed flags. Replace the whole effect with:

```ts
  // Transitional: library params and GM session selection are still local
  // state; keep syncing them on back/forward until Tasks 4-5 derive them
  // from the router location. Page flags are now derived from useLocation.
  useEffect(() => {
    const handlePopState = () => {
      const libraryRoute = parseCampaignLibraryPath(window.location.pathname);
      if (libraryRoute) {
        setLibraryBookId(libraryRoute.bookId);
        setLibraryChapterId(libraryRoute.chapterId);
      }

      if (window.location.pathname.includes("/campaign")) {
        const pathParts = window.location.pathname.split("/");
        const gmIndex = pathParts.findIndex((p) => p === "campaign");
        const urlSlug = gmIndex >= 0 ? pathParts[gmIndex + 1] : undefined;
        if (urlSlug) {
          const matched = gmSessionsRef.current.find((s) => toSessionSlug(s.sessionNumber, s.name) === urlSlug);
          setSelectedGmSessionId(matched ? matched.id : null);
        } else {
          setSelectedGmSessionId(null);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
```

- [ ] **Step 5: Verify nothing references the removed setters**

Run: `npx tsc --noEmit` (or `npm run lint`)
Expected: PASS. If it reports remaining uses of `setIsLandingPageOpen`/`setIsGameMasterOpen`/`setIsLibraryOpen`, convert each to the equivalent `navigate(...)` call (target URL = the page the old code was flipping to) — there should be none beyond the ones in Steps 2–4.

- [ ] **Step 6: Run the page-navigation specs**

Run: `npx playwright test tests/routes.spec.ts tests/library.spec.ts`
Expected: all tests PASS (landing→character, breadcrumbs→landing, unknown-URL fallback, library entry).

- [ ] **Step 7: Commit**

```bash
git add src/AppComposition.tsx
git commit -m "refactor: derive page flags from router location"
```

---

### Task 4: Derive library book/chapter from the URL

**Files:**
- Modify: `src/AppComposition.tsx` (library state → derived from `libraryRoute`; `selectLibraryBook`/`selectLibraryChapter` → navigate; popstate effect shrunk again)
- Test: `tests/library.spec.ts` (existing, unchanged)

**Interfaces:**
- Consumes: `libraryRoute` const and `navigate` from Task 3.
- Produces: `libraryBookId: string | null` and `libraryChapterId: string | null` consts (same names as the old state, so the render code at the bottom of the file keeps compiling untouched). `selectLibraryBook(nextBookId: string | null): void` and `selectLibraryChapter(nextChapterId: string | null): void` keep their signatures.

- [ ] **Step 1: Replace library state with derived values**

Remove (currently around lines 889–890):

```ts
  const [libraryBookId, setLibraryBookId] = useState<string | null>(null);
  const [libraryChapterId, setLibraryChapterId] = useState<string | null>(null);
```

and the mount-sync effect (currently around lines 908–914):

```ts
  useEffect(() => {
    const libraryRoute = parseCampaignLibraryPath(window.location.pathname);
    if (libraryRoute) {
      setLibraryBookId(libraryRoute.bookId);
      setLibraryChapterId(libraryRoute.chapterId);
    }
  }, []);
```

Add in their place (right where the old state stood):

```ts
  const libraryBookId = libraryRoute?.bookId ?? null;
  const libraryChapterId = libraryRoute?.chapterId ?? null;
```

- [ ] **Step 2: Convert the library select handlers**

Replace `selectLibraryBook` and `selectLibraryChapter` (currently around lines 892–906) with:

```ts
  const selectLibraryBook = useCallback((nextBookId: string | null) => {
    const firstChapterId = nextBookId
      ? (bookCatalog.find((b) => b.id === nextBookId)?.chapters[0]?.id ?? null)
      : null;

    navigate(buildCampaignLibraryPath({
      campaignId: characterData.campaignId,
      bookId: nextBookId,
      chapterId: firstChapterId,
    }));
  }, [characterData.campaignId, navigate]);

  const selectLibraryChapter = useCallback((nextChapterId: string | null) => {
    navigate(buildCampaignLibraryPath({
      campaignId: characterData.campaignId,
      bookId: libraryBookId,
      chapterId: nextChapterId,
    }));
  }, [characterData.campaignId, libraryBookId, navigate]);
```

- [ ] **Step 3: Remove the library branch from the popstate effect**

In the transitional popstate effect from Task 3, delete the `libraryRoute` block so only the GM branch remains:

```ts
  // Transitional: GM session selection is still local state; keep syncing it
  // on back/forward until Task 5 moves it onto the router location.
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.includes("/campaign")) {
        const pathParts = window.location.pathname.split("/");
        const gmIndex = pathParts.findIndex((p) => p === "campaign");
        const urlSlug = gmIndex >= 0 ? pathParts[gmIndex + 1] : undefined;
        if (urlSlug) {
          const matched = gmSessionsRef.current.find((s) => toSessionSlug(s.sessionNumber, s.name) === urlSlug);
          setSelectedGmSessionId(matched ? matched.id : null);
        } else {
          setSelectedGmSessionId(null);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
```

- [ ] **Step 4: Verify**

Run: `npm run lint`
Expected: PASS.

Run: `npx playwright test tests/library.spec.ts`
Expected: all tests PASS (book/chapter deep links, chapter switching, breadcrumbs).

- [ ] **Step 5: Commit**

```bash
git add src/AppComposition.tsx
git commit -m "refactor: derive library book/chapter from router location"
```

---

### Task 5: GM session URL sync via the router; delete the popstate effect

**Files:**
- Modify: `src/AppComposition.tsx` (session select handler, session→URL effect, new URL→session effect, popstate effect deleted)
- Test: `tests/gamemaster.spec.ts`, `tests/routes.spec.ts` (existing, unchanged)

**Interfaces:**
- Consumes: `location`, `navigate` from Task 3; existing `toSessionSlug`, `gmSessionsRef`, `activeGmSession`, `setSelectedGmSessionId`.
- Produces: no API changes — `handleSelectSessionOnMobile(sessionId: string)` keeps its signature. After this task `src/AppComposition.tsx` contains zero `window.history` calls and zero `popstate` listeners.

- [ ] **Step 1: Convert the session select handler**

In `handleSelectSessionOnMobile` (currently around lines 281–295), replace:

```ts
      const newPath = `/${characterData.campaignId}/campaign/${slug}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, "", newPath);
      }
```
with:

```ts
      const newPath = `/${characterData.campaignId}/campaign/${slug}`;
      if (location.pathname !== newPath) {
        navigate(newPath);
      }
```

(`handleSelectSessionOnMobile` is a plain function re-created each render, so closing over `location` is safe.)

- [ ] **Step 2: Convert the session→URL sync effect**

Replace the effect currently around lines 727–735:

```ts
  // Sync URL to selected session slug when GM page is open.
  useEffect(() => {
    if (!isGameMasterOpen) return;
    const basePath = `/${characterData.campaignId}/campaign`;
    const slug = activeGmSession ? toSessionSlug(activeGmSession.sessionNumber, activeGmSession.name) : "";
    const newPath = slug ? `${basePath}/${slug}` : basePath;
    if (window.location.pathname !== newPath) {
      window.history.replaceState(null, "", newPath);
    }
  }, [isGameMasterOpen, selectedGmSessionId, activeGmSession?.name, characterData.campaignId]);
```

with:

```ts
  // Sync URL to selected session slug when GM page is open.
  useEffect(() => {
    if (!isGameMasterOpen) return;
    const basePath = `/${characterData.campaignId}/campaign`;
    const slug = activeGmSession ? toSessionSlug(activeGmSession.sessionNumber, activeGmSession.name) : "";
    const newPath = slug ? `${basePath}/${slug}` : basePath;
    if (location.pathname !== newPath) {
      navigate(newPath, { replace: true });
    }
  }, [isGameMasterOpen, selectedGmSessionId, activeGmSession?.name, characterData.campaignId, location.pathname, navigate]);
```

- [ ] **Step 3: Replace the popstate effect with a location-driven session sync**

Delete the entire transitional popstate effect (the one left after Task 4) and add in its place:

```ts
  // Sync selected session from the URL slug (covers back/forward — the two
  // GM sync effects are idempotent and converge, since each no-ops when URL
  // and selection already agree).
  useEffect(() => {
    if (!isGameMasterOpen) return;

    const pathParts = location.pathname.split("/");
    const gmIndex = pathParts.findIndex((p) => p === "campaign");
    const urlSlug = gmIndex >= 0 ? pathParts[gmIndex + 1] : undefined;

    if (urlSlug) {
      const matched = gmSessionsRef.current.find(
        (s) => toSessionSlug(s.sessionNumber, s.name) === urlSlug,
      );
      setSelectedGmSessionId(matched ? matched.id : null);
    } else {
      setSelectedGmSessionId(null);
    }
  }, [isGameMasterOpen, location.pathname]);
```

Note: the sessions-fetch effect (around lines 327–367) keeps its one-shot `window.location.pathname` read for initial slug matching after sessions load — that is a pure read and stays.

- [ ] **Step 4: Verify no history writes remain**

Run: `git grep -nE "history\.(push|replace)State|addEventListener\(\"popstate\"" -- src/`
Expected: no matches.

- [ ] **Step 5: Run the GM specs**

Run: `npx playwright test tests/gamemaster.spec.ts tests/routes.spec.ts`
Expected: all tests PASS (session create/select/rename URL sync, rename flow across landing/GM pages).

- [ ] **Step 6: Commit**

```bash
git add src/AppComposition.tsx
git commit -m "refactor: sync GM session selection via router location"
```

---

### Task 6: Full verification gate

**Files:**
- Test: entire Playwright suite (no source changes expected)

**Interfaces:**
- Consumes: everything above.
- Produces: green gate for handoff.

- [ ] **Step 1: Confirm no leftover manual routing**

Run: `git grep -nE "pushState|replaceState|popstate" -- src/`
Expected: no matches.

Run: `git grep -n "window.location.pathname" -- src/`
Expected: matches only in `src/lib/useGameSession.ts` (startup read) and the sessions-fetch effect in `src/AppComposition.tsx` (one-shot read). Anything else must be converted or justified.

- [ ] **Step 2: Lint and build**

Run: `npm run lint && npm run build`
Expected: both PASS.

- [ ] **Step 3: Clear stale test results, then run the full suite**

Run (Bash): `rm -rf test-results && npm test`
Expected: all Playwright tests PASS. If a spec fails, use superpowers:systematic-debugging — do not patch tests.

- [ ] **Step 4: Commit any fixes and finish**

If Steps 1–3 required fixes, commit them:

```bash
git add -A src/
git commit -m "fix: address react-router migration fallout"
```

Then use superpowers:finishing-a-development-branch to decide merge/PR.
