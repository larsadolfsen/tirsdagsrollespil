# Library Rename & Relocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename "Books" to "Library", move it from a per-character tab to a campaign-level page reachable from the landing page at `/{campaignId}/library`, and add access points (landing card, desktop header dropdown, mobile menu accordion) that all open the library in a new tab except the landing card.

**Architecture:** The app has no router; it's manual `window.history` push/replace state parsed by hand-written functions in `src/lib/campaignRoutes.ts`. The Library becomes a third top-level view alongside the existing `isLandingPageOpen`/`isGameMasterOpen` pattern in `src/AppComposition.tsx` — a new `isLibraryOpen` flag, its own URL parser/builder, and its own render branch, completely decoupled from character routing.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind v4, Playwright. No new dependencies.

## Global Constraints

- Typography: use `<Heading>`/`<Text>` from `src/components/ui/`, never raw `<h1>-<h6>`/`<p>`.
- Colors: semantic Tailwind tokens only (`bg-background`, `text-wfrp-muted-text`, etc.), never hardcoded hex/RGB.
- Use existing `src/components/ui/` components instead of raw HTML elements.
- Run `npm run lint && npm run build && npm test` before considering any task done.
- Commit after each task.

---

### Task 1: Add campaign-level library routing

**Files:**
- Modify: `src/lib/campaignRoutes.ts`
- Modify: `src/tabs/tabTypes.ts`

**Interfaces:**
- Produces: `parseCampaignLibraryPath(pathname: string): CampaignLibraryRoute | null`, `buildCampaignLibraryPath({ campaignId, bookId, chapterId }): string`, type `CampaignLibraryRoute = { campaignId: string; bookId: string | null; chapterId: string | null }`.
- Consumed by: Task 5 (AppComposition.tsx).

Remove `"books"` from `MainTab` in `src/tabs/tabTypes.ts:2`:

```ts
export type MainTab = "skills" | "actions" | "inventory" | "spells" | "features" | "journal" | "dice" | "career";
```

In `src/lib/campaignRoutes.ts`, remove all `books`/`bookId`/`chapterId` references from the character-route machinery, since the library is no longer nested under a character:

- `characterViewPathSegments` (line 9-20): delete the `books: "books",` entry.
- `viewAliases` (line 21-42): delete the `books: "books",` entry.
- `mainTabByCharacterView` (line 43-54): delete the `books: "books",` entry.
- `CampaignCharacterRoute` type (line 56-64): remove `bookId: string | null;` and `chapterId: string | null;`.
- `parseCampaignCharacterPath` (line 116-147): remove the `bookSlugSegment`/`chapterSlugSegment` destructuring and the `if ((bookSlugSegment || chapterSlugSegment) && view !== "books") return null;` guard and the `bookId`/`chapterId` computed fields; the regex `campaignCharacterRoutePattern` can stay as-is (it just won't be given extra segments for character routes anymore, since nothing builds them).
- `buildCampaignCharacterPath` (line 149-186): remove `bookId`/`chapterId` params and the trailing book/chapter path branch — it now always returns `viewPath`.

Add at the bottom of `campaignRoutes.ts`:

```ts
const campaignLibraryRoutePattern = /^\/([^/]+)\/library(?:\/([^/?#]+)(?:\/([^/?#]+))?)?\/?$/;

export type CampaignLibraryRoute = {
  campaignId: string;
  bookId: string | null;
  chapterId: string | null;
};

export function parseCampaignLibraryPath(pathname: string): CampaignLibraryRoute | null {
  const match = campaignLibraryRoutePattern.exec(pathname);
  if (!match) return null;

  const [, campaignIdSegment, bookSlugSegment, chapterSlugSegment] = match;
  const campaignId = decodePathSegment(campaignIdSegment);
  if (!campaignId || !campaignById[campaignId]) return null;

  const bookId = bookSlugSegment ? decodePathSegment(bookSlugSegment) : null;
  const chapterId = bookId && chapterSlugSegment ? decodePathSegment(chapterSlugSegment) : null;

  return { campaignId, bookId, chapterId };
}

export function buildCampaignLibraryPath({
  campaignId = defaultCampaignId,
  bookId = null,
  chapterId = null,
}: {
  campaignId?: string;
  bookId?: string | null;
  chapterId?: string | null;
}) {
  const basePath = `/${encodePathSegment(campaignId)}/library`;
  if (!bookId) return basePath;

  const bookPath = `${basePath}/${encodePathSegment(bookId)}`;
  return chapterId ? `${bookPath}/${encodePathSegment(chapterId)}` : bookPath;
}
```

- [ ] **Step 1: Make the edits above to `tabTypes.ts` and `campaignRoutes.ts`**
- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: fails with errors in files that still reference `"books"`/`bookId`/`chapterId` on the character route (this is expected — those get fixed in later tasks). Confirm the *only* errors are about those references, not typos in this task's new code (visually re-check `campaignRoutes.ts` diff if unsure).

- [ ] **Step 3: Commit**

```bash
git add src/lib/campaignRoutes.ts src/tabs/tabTypes.ts
git commit -m "feat: add campaign-level library routing, remove books from character routes"
```

---

### Task 2: Simplify useCampaignRouteSync (drop book/chapter state)

**Files:**
- Modify: `src/lib/useCampaignRouteSync.ts`

**Interfaces:**
- Consumes: `buildCampaignCharacterPath`/`parseCampaignCharacterPath` from Task 1 (no longer take `bookId`/`chapterId`).
- Produces: same hook return shape minus `bookId`, `chapterId`, `selectBook`, `selectChapter`.

Remove all book/chapter plumbing — it belonged to the now-deleted `/books` character route:

- Delete `const [bookId, setBookIdState] = useState<string | null>(null);` and the `chapterId` counterpart (line 57-58).
- In `syncCampaignRoute` (line 60-97): remove the `bookId`/`chapterId` params and the `bookId: nextBookId`/`chapterId: nextChapterId` args passed to `buildCampaignCharacterPath`.
- In the route-apply effect (line 99-140): remove `setBookIdState(route.bookId)` / `setChapterIdState(route.chapterId)` calls (route no longer has those fields) and the reset-on-disable calls.
- `selectMainTab` (line 148-154): remove `bookId: null, chapterId: null` from the `syncCampaignRoute` call and the `setBookIdState(null)`/`setChapterIdState(null)` lines.
- `selectMobileMainView` (line 156-167): same removals.
- Delete `selectBook` and `selectChapter` entirely (line 169-178).
- `restoreRouteForCharacter` (line 185-196): remove `setBookIdState(route.bookId)`/`setChapterIdState(route.chapterId)`.
- Final `return` (line 198-207): remove `bookId`, `chapterId`, `selectBook`, `selectChapter`.

- [ ] **Step 1: Apply the removals above**
- [ ] **Step 2: Commit**

```bash
git add src/lib/useCampaignRouteSync.ts
git commit -m "refactor: drop book/chapter state from character route sync"
```

---

### Task 3: Rename the Books UI to Library

**Files:**
- Create: `src/components/library/LibraryPage.tsx` (moved/renamed from `src/components/books/BooksLibrary.tsx`)
- Delete: `src/components/books/BooksLibrary.tsx`
- Delete: `src/tabs/BooksTab.tsx` (no longer needed — Library is a standalone page, not a lazy tab; AppComposition will lazy-load `LibraryPage` directly in Task 5)

**Interfaces:**
- Produces: `LibraryPage({ bookId, chapterId, onSelectBook, onSelectChapter }: { bookId: string | null; chapterId: string | null; onSelectBook: (bookId: string | null) => void; onSelectChapter: (chapterId: string | null) => void }): JSX.Element` — identical prop shape to the old `BooksLibrary`.
- Consumed by: Task 5 (AppComposition.tsx).

Copy `src/components/books/BooksLibrary.tsx` verbatim to `src/components/library/LibraryPage.tsx`, renaming only the exported function:

```ts
// line 14, was: export function BooksLibrary({
export function LibraryPage({
```

(All other content — imports, `findChapterIndex`, JSX — stays identical; it already imports `bookCatalog`/`bookCovers`/`loadChapterContent` from `../../data/books`, which is unaffected by this rename.)

Delete the old `src/components/books/BooksLibrary.tsx` and the whole now-empty `src/components/books/` directory once other files in it (if any) are also confirmed unused — check first:

```bash
ls src/components/books/
```

If `ChapterTableOfContents.tsx`, `headingSlug.ts`, `MarkdownContent.tsx` also live there (they're imported by `BooksLibrary.tsx` at lines 6-8), move the whole directory to `src/components/library/` instead of copying a single file, and update `LibraryPage.tsx`'s relative imports only if the directory depth changes (it won't — same nesting depth, so imports stay `"./ChapterTableOfContents"` etc.).

Delete `src/tabs/BooksTab.tsx`.

- [ ] **Step 1: Move the directory and rename the component**

```bash
git mv src/components/books src/components/library
git mv src/components/library/BooksLibrary.tsx src/components/library/LibraryPage.tsx
git rm src/tabs/BooksTab.tsx
```

- [ ] **Step 2: Edit `src/components/library/LibraryPage.tsx`, renaming the export per above**
- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "rename: BooksLibrary -> LibraryPage, drop the BooksTab wrapper"
```

---

### Task 4: Wire the Library page into AppComposition as a third top-level view

**Files:**
- Modify: `src/AppComposition.tsx`
- Modify: `src/tabs/index.ts`
- Modify: `src/tabs/preloadTabs.ts`

**Interfaces:**
- Consumes: `parseCampaignLibraryPath`, `buildCampaignLibraryPath` (Task 1), `LibraryPage` (Task 3).
- Produces: `isLibraryOpen: boolean` state, `openLibraryFromLanding(): void`, `selectLibraryBook(bookId: string | null): void`, `selectLibraryChapter(chapterId: string | null): void` — consumed by Task 6 (LandingPage) and internally for the render branch.

**Step 1: Update imports**

Replace `import { LandingPage } from "./components/LandingPage";` block area — add the new lazy import and route helpers. Near line 129 (where `BooksTab` was lazily imported), replace:

```ts
const BooksTab = lazy(() => import("./tabs/BooksTab").then((module) => ({ default: module.BooksTab })));
```

with:

```ts
const LibraryPage = lazy(() => import("./components/library/LibraryPage").then((module) => ({ default: module.LibraryPage })));
```

Near the top imports (line 56-58 area), update the `campaignRoutes` import to include the library helpers alongside the existing `buildCampaignCharacterPath`/`parseCampaignCharacterPath` import (find that import line via `grep -n "from \"./lib/campaignRoutes\"" src/AppComposition.tsx` and add `buildCampaignLibraryPath, parseCampaignLibraryPath` to the named imports).

**Step 2: Add `isLibraryOpen` state and URL detection**

Near line 239-252, add a third state flag after `isGameMasterOpen`:

```ts
const [isLibraryOpen, setIsLibraryOpen] = useState(() => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.location.pathname.includes("/library");
});
```

Update the existing `isLandingPageOpen` initializer (line 239-245) so the landing page doesn't also claim library URLs:

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
```

**Step 3: Add local book/chapter state for the library route**

Near where `selectedBooksBookId`/`selectedBooksChapterId` used to be destructured from `useCampaignRouteSync` (line 858-861, now removed by Task 2), add standalone state instead — the library route is independent of character routing:

```ts
const [libraryBookId, setLibraryBookId] = useState<string | null>(null);
const [libraryChapterId, setLibraryChapterId] = useState<string | null>(null);

const selectLibraryBook = useCallback((nextBookId: string | null) => {
  const nextPath = buildCampaignLibraryPath({ campaignId: characterData.campaignId, bookId: nextBookId, chapterId: null });
  window.history.pushState(null, "", nextPath);
  setLibraryBookId(nextBookId);
  setLibraryChapterId(null);
}, [characterData.campaignId]);

const selectLibraryChapter = useCallback((nextChapterId: string | null) => {
  const nextPath = buildCampaignLibraryPath({ campaignId: characterData.campaignId, bookId: libraryBookId, chapterId: nextChapterId });
  window.history.pushState(null, "", nextPath);
  setLibraryChapterId(nextChapterId);
}, [characterData.campaignId, libraryBookId]);
```

**Step 4: Update the `popstate` handler** (line 876-901) to also resolve library state:

```ts
useEffect(() => {
  const handlePopState = () => {
    const isGM = window.location.pathname.includes("/campaign");
    const libraryRoute = parseCampaignLibraryPath(window.location.pathname);
    const isLibrary = libraryRoute !== null;
    const isLanding = parseCampaignCharacterPath(window.location.pathname) === null && !isGM && !isLibrary;
    setIsLandingPageOpen(isLanding);
    setIsGameMasterOpen(isGM);
    setIsLibraryOpen(isLibrary);

    if (isLibrary) {
      setLibraryBookId(libraryRoute.bookId);
      setLibraryChapterId(libraryRoute.chapterId);
    }

    if (isGM) {
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

Also run the same resolution once on mount for the initial `libraryBookId`/`libraryChapterId` (they default to `null`, which is wrong if the app loads directly on a book/chapter URL). Add this effect next to the state declarations from Step 3:

```ts
useEffect(() => {
  const libraryRoute = parseCampaignLibraryPath(window.location.pathname);
  if (libraryRoute) {
    setLibraryBookId(libraryRoute.bookId);
    setLibraryChapterId(libraryRoute.chapterId);
  }
}, []);
```

**Step 5: Add `openLibraryFromLanding` callback**, next to `openGameMasterFromLanding` (line 919-926):

```ts
const openLibraryFromLanding = useCallback(() => {
  const nextPath = buildCampaignLibraryPath({ campaignId: characterData.campaignId });
  window.history.pushState(null, "", nextPath);
  setIsLandingPageOpen(false);
  setIsGameMasterOpen(false);
  setIsLibraryOpen(true);
}, [characterData.campaignId]);
```

**Step 6: Disable character-route sync while the library is open.** Update the `routeSyncEnabled` line (line 867):

```ts
routeSyncEnabled: !isLandingPageOpen && !isGameMasterOpen && !isLibraryOpen,
```

**Step 7: Pass `onSelectLibrary` to `LandingPage`** (line 1842-1851):

```tsx
if (isLandingPageOpen) {
  return (
    <LandingPage
      campaignName={campaignName}
      characters={availableCharacters}
      onSelectCharacter={openCharacterFromLanding}
      onSelectGameMaster={openGameMasterFromLanding}
      onSelectLibrary={openLibraryFromLanding}
    />
  );
}
```

**Step 8: Add the library render branch**, immediately after the `isGameMasterOpen` block and before the character-sheet return (find the closing of the `if (isGameMasterOpen) { ... }` block — it runs from line 1853 onward; add the new branch right after its closing brace, before the main character-sheet JSX):

```tsx
if (isLibraryOpen) {
  const selectedLibraryBook = libraryBookId
    ? bookCatalog.find((book) => book.id === libraryBookId)
    : undefined;

  return (
    <div className="wfrp-landing-shell flex-col gap-6">
      <Breadcrumbs
        items={[
          {
            label: campaignName,
            href: "/",
            onClick: () => {
              window.history.pushState(null, "", "/");
              setIsLandingPageOpen(true);
              setIsLibraryOpen(false);
            },
          },
          {
            label: "Library",
            href: buildCampaignLibraryPath({ campaignId: characterData.campaignId }),
            onClick: () => selectLibraryBook(null),
          },
          ...(selectedLibraryBook ? [{ label: selectedLibraryBook.title }] : []),
        ]}
      />
      <Suspense fallback={null}>
        <LibraryPage
          bookId={libraryBookId}
          chapterId={libraryChapterId}
          onSelectBook={selectLibraryBook}
          onSelectChapter={selectLibraryChapter}
        />
      </Suspense>
    </div>
  );
}
```

**Step 9: Remove the old books tab wiring.** Delete these now-dead references (Task 2 already removed their data source, so these are compile errors until deleted):

- Line 836: in `displayedMobilePageTitleByView`'s seed object, delete `books: "Books"`.
- Lines 2026-2030: delete the `onOpenBooks={() => { ... selectMainTab("books"); }}` prop from `<MobileMenuSidebar>` (Task 7 replaces this whole component's API).
- Lines 2053, 2071: in both `activeMenuItem={...}` expressions, delete the `: activeMainTab === "books" ? "books"` clause, leaving `activeMenuItem={activeMainTab === "dice" ? "dice" : activeMainTab === "career" ? "edit" : "sheet"}`.
- Lines 2060, 2078: delete the `onOpenBooks={() => selectMainTab("books")}` prop from both `<CharacterSheetHeader>` usages (Task 6 removes this prop from the component itself).
- Line 2087: change `hideMobileNavigation={showMobileGainExperiencePage || activeMainTab === "dice" || activeMainTab === "books"}` to `hideMobileNavigation={showMobileGainExperiencePage || activeMainTab === "dice"}`.
- Line 2088: change `mobileTitle={activeMainTab === "books" ? "" : displayedMobilePageTitle}` to `mobileTitle={displayedMobilePageTitle}`.
- Lines 2207-2213: delete the `activeMainTab === "books" ? <BooksTab .../> :` branch entirely, so the `) : (` on line 2214 now directly follows the previous condition's closing.
- Lines 1737-1794 (the `selectedBooksBook`/`booksSectionBreadcrumbItems` block used for in-character breadcrumbs): delete `selectedBooksBook`, `selectedBooksChapter`, and `booksSectionBreadcrumbItems`, and remove `...booksSectionBreadcrumbItems,` from wherever the final breadcrumb array is assembled (around line 1794).

**Step 9b: Clean up the tab-preloading modules.** Task 3 deleted `src/tabs/BooksTab.tsx`, which two more files still reference (`MainTab` no longer includes `"books"` as of Task 1, so leaving these as-is is also a type error, not just a dead import):

In `src/tabs/index.ts:3`, delete the line:

```ts
export { BooksTab } from "./BooksTab";
```

In `src/tabs/preloadTabs.ts`, delete the `books` entry from `tabPreloaders` (line 12):

```ts
const tabPreloaders: Record<MainTab, () => Promise<unknown>> = {
  skills: () => import("./SkillsTab"),
  actions: () => import("./ActionsTab"),
  inventory: () => import("./InventoryTab"),
  spells: () => import("./SpellsTab"),
  features: () => import("./TalentsTab"),
  journal: () => import("./JournalTab"),
  dice: () => import("../features/dice/DiceLogSidebar"),
  career: () => import("./CareerTab"),
};
```

(`Record<MainTab, ...>` will no longer accept a `books` key once `MainTab` excludes it, so this deletion is required for the type to compile, not just for tidiness.)

- [ ] **Step 10: Type-check and build**

Run: `npm run lint && npm run build`
Expected: no errors referencing `books`, `BooksTab`, `selectedBooksBookId`, `selectBook`, `selectChapter`, or `bookId`/`chapterId` on `CampaignCharacterRoute`. Remaining errors should only be in `CharacterHeader.tsx`/`CharacterSheetHeader.tsx`/`MobileMenuSidebar.tsx`/`LandingPage.tsx` (fixed in Tasks 5-7).

- [ ] **Step 11: Commit**

```bash
git add src/AppComposition.tsx src/tabs/index.ts src/tabs/preloadTabs.ts
git commit -m "feat: add campaign-level library view to AppComposition"
```

---

### Task 5: Landing page Library card, Characters heading, and chapter-style campaign heading

**Files:**
- Modify: `src/components/LandingPage.tsx`

**Interfaces:**
- Consumes: new prop `onSelectLibrary: () => void` (added by Task 4, Step 7).

Add `onSelectLibrary` to the props type (line 10-15):

```ts
type LandingPageProps = {
  campaignName: string;
  characters: CharacterSummary[];
  onSelectCharacter: (characterId: string) => void;
  onSelectGameMaster: () => void;
  onSelectLibrary: () => void;
};
```

Destructure it in the function signature (line 17):

```ts
export function LandingPage({ campaignName, characters, onSelectCharacter, onSelectGameMaster, onSelectLibrary }: LandingPageProps) {
```

**Campaign name heading:** match the chapter-page H1 treatment (`Heading` with `variant="chapterH1"`, centered, with the red bottom border), the same markup used by `ChapterHeading` in `src/components/books/ChapterDivider.tsx:4-10` (that component isn't imported here — its two-line markup is simple enough to inline, and `LandingPage` always loads eagerly while the library tree is lazy, so keeping them decoupled avoids pulling the library bundle into the landing page). Replace the `<header>` block (line 93-102):

```tsx
<header className="flex flex-col items-center text-center select-none">
  <span className="wfrp-label text-wfrp-muted-text text-[11px] font-semibold uppercase tracking-widest">
    Campaign
  </span>
  <div className="mt-1 flex max-w-full justify-center border-b-2 border-wfrp-red">
    <Heading level={1} variant="chapterH1">
      {campaignName}
    </Heading>
  </div>
</header>
```

**Card order and Characters heading:** the Library card goes directly after the Game Master card (already the case — Game Master is first at line 106-122); add it there, then a "Characters" heading before the character cards. A cover image already exists at `src/data/books/library-cover.webp` (committed in a prior commit on this branch) — import it and use it as the card's portrait image, the same way character cards show `portraitDataUrls[character.id]` via `wfrp-landing-portrait-image` (line 142-147). Add the import near the top of the file, alongside the other imports:

```ts
import libraryCover from "../data/books/library-cover.webp";
```

Replace from the Game Master card's closing `</button>` (line 122) through the `{/* Character Cards */}` comment (line 124) with:

```tsx
</button>

{/* Library Card */}
<button
  type="button"
  onClick={onSelectLibrary}
  className="wfrp-landing-character-card"
  aria-label="Open Library"
>
  <div className="wfrp-landing-portrait">
    <img
      src={libraryCover}
      alt=""
      className="wfrp-landing-portrait-image"
    />
  </div>
  <div className="wfrp-landing-card-body">
    <Heading level={2} variant="card">
      Library
    </Heading>
  </div>
</button>

<div className="mt-4">
  <Heading level={2} variant="sidebarLabel">
    Characters
  </Heading>
</div>

{/* Character Cards */}
```

(`Heading` doesn't accept a `className` prop — see `src/components/ui/Heading.tsx:69`, which explicitly omits it from the native `h2` props — so the `mt-4` spacing goes on a wrapping `div` instead. The `sidebarLabel` variant matches how section labels are styled elsewhere in the app: a small uppercase label, distinct from the card headings. If it reads too small once rendered, `variant="subsection"` is the fallback to try instead — verify visually in Task 9's manual smoke check.)

- [ ] **Step 1: Apply the three edits above**
- [ ] **Step 2: Commit**

```bash
git add src/components/LandingPage.tsx
git commit -m "feat: add Library card, Characters heading, and chapter-style campaign heading to landing page"
```

---

### Task 6: Desktop character header — Library dropdown

**Files:**
- Create: `src/components/LibraryHeaderMenu.tsx`
- Modify: `src/components/CharacterHeader.tsx`
- Modify: `src/components/CharacterSheetHeader.tsx`

**Interfaces:**
- Produces: `LibraryHeaderMenu({ campaignId }: { campaignId: string }): JSX.Element`.
- Consumes: `bookCatalog` from `src/data/books`, `buildCampaignLibraryPath` from `src/lib/campaignRoutes`, `DropdownMenu`/`DropdownMenuTrigger`/`DropdownMenuContent`/`DropdownMenuItem` from `src/components/ui`.

Create `src/components/LibraryHeaderMenu.tsx`:

```tsx
import { ExternalLink } from "lucide-react";
import { bookCatalog } from "../data/books";
import { buildCampaignLibraryPath } from "../lib/campaignRoutes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui";

function openInNewTab(path: string) {
  window.open(path, "_blank", "noopener,noreferrer");
}

export function LibraryHeaderMenu({ campaignId }: { campaignId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Library"
        title="Library"
        className="wfrp-text-strong tracking-wide text-wfrp-muted-text transition-colors hover:text-white"
      >
        Library
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => openInNewTab(buildCampaignLibraryPath({ campaignId }))}
        >
          <ExternalLink className="mr-2 size-4" aria-hidden="true" />
          Library overview
        </DropdownMenuItem>
        {bookCatalog.map((book) => (
          <DropdownMenuItem
            key={book.id}
            onClick={() => openInNewTab(buildCampaignLibraryPath({ campaignId, bookId: book.id }))}
          >
            <ExternalLink className="mr-2 size-4" aria-hidden="true" />
            {book.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

In `src/components/CharacterHeader.tsx`:

- Remove `"books"` from `characterMenuOptions` (line 12-17):

```ts
const characterMenuOptions = [
  { id: "sheet", label: "Character Sheet" },
  { id: "edit", label: "Edit Character" },
  { id: "dice", label: "Dice Log" },
] as const;
```

- Import `LibraryHeaderMenu` (add near line 6-8 imports):

```ts
import { LibraryHeaderMenu } from "./LibraryHeaderMenu";
```

- Update the component's prop type and destructuring (line 76-96): remove `onOpenBooks`, add `campaignId`:

```ts
export function CharacterHeader({
  activeMenuItem,
  campaignId,
  characterData,
  xpCurrent,
  headerResources,
  onOpenCharacterSheet,
  onOpenDice,
  onOpenAdvance,
  onOpenXpDialog,
}: {
  activeMenuItem: "sheet" | "edit" | "experience" | "dice";
  campaignId: string;
  characterData: ResolvedCharacterRecord;
  xpCurrent: number;
  headerResources?: ReactNode;
  onOpenCharacterSheet: () => void;
  onOpenDice: () => void;
  onOpenAdvance: () => void;
  onOpenXpDialog: () => void;
}) {
```

- Update `MainTabMenu`'s generic and `onChange` (line 273-284): remove the `"books"` union member and the `if (item === "books") onOpenBooks();` line, and add `<LibraryHeaderMenu campaignId={campaignId} />` next to it:

```tsx
<div className="hidden h-12 items-stretch sm:flex">
  <MainTabMenu<"sheet" | "edit" | "experience" | "dice">
    activeId={activeMenuItem}
    ariaLabel="Character menu"
    options={characterMenuOptions}
    onChange={(item) => {
      if (item === "sheet") onOpenCharacterSheet();
      if (item === "edit") onOpenAdvance();
      if (item === "dice") onOpenDice();
    }}
  />
  <LibraryHeaderMenu campaignId={campaignId} />
  <WfrpStandardIcon
    label="Gain Experience"
    icon={<ArrowUpFromLine />}
    onClick={onOpenXpDialog}
    aria-current={activeMenuItem === "experience" ? "page" : undefined}
    className={activeMenuItem === "experience" ? "text-white" : undefined}
  />
</div>
```

In `src/components/CharacterSheetHeader.tsx`:

- Update `CharacterSheetHeaderProps` (line 18-33): change `activeMenuItem: "sheet" | "edit" | "dice" | "books";` to `activeMenuItem: "sheet" | "edit" | "dice";`, remove `onOpenBooks: () => void;`, add `campaignId: string;`.
- Update the destructured params (line 35-50) to match: remove `onOpenBooks`, add `campaignId`.
- Update the `<CharacterHeader>` call (line 85-94): remove `onOpenBooks={onOpenBooks}`, add `campaignId={campaignId}`.

Back in `src/AppComposition.tsx` (both `<CharacterSheetHeader>` call sites, lines ~2051-2067 and ~2069-2085, edited in Task 4 Step 9): add `campaignId={characterData.campaignId}` to each.

- [ ] **Step 1: Apply all edits above**
- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no errors in `CharacterHeader.tsx`, `CharacterSheetHeader.tsx`, `LibraryHeaderMenu.tsx`, `AppComposition.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/LibraryHeaderMenu.tsx src/components/CharacterHeader.tsx src/components/CharacterSheetHeader.tsx src/AppComposition.tsx
git commit -m "feat: add Library dropdown to desktop character header"
```

---

### Task 7: Mobile menu sidebar — Library accordion

**Files:**
- Modify: `src/components/sidebar/MobileMenuSidebar.tsx`

**Interfaces:**
- Consumes: `bookCatalog` from `src/data/books`, `buildCampaignLibraryPath` from `src/lib/campaignRoutes`.
- Props change: remove `onOpenBooks: () => void`, add `campaignId: string`.

Replace the whole file:

```tsx
import { useState } from "react";
import { ArrowUpFromLine, BookOpen, ChevronDown, Dice5, ExternalLink, FileText, Pencil } from "lucide-react";
import { bookCatalog } from "../../data/books";
import { buildCampaignLibraryPath } from "../../lib/campaignRoutes";
import { AppSidebar } from "./AppSidebar";

const menuButtonClassName =
  "flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left wfrp-label text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50";

function openInNewTab(path: string) {
  window.open(path, "_blank", "noopener,noreferrer");
}

export function MobileMenuSidebar({
  isOpen,
  campaignId,
  onClose,
  onOpenCharacterSheet,
  onOpenDiceLog,
  onOpenEditCharacter,
  onOpenGainExperience,
}: {
  isOpen: boolean;
  campaignId: string;
  onClose: () => void;
  onOpenCharacterSheet: () => void;
  onOpenDiceLog: () => void;
  onOpenEditCharacter: () => void;
  onOpenGainExperience: () => void;
}) {
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(false);

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="mobile-menu-sidebar"
      onClose={onClose}
      overlayUntil="desktop"
      side="right"
      title="Menu"
      titleId="mobile-menu-sidebar-title"
      closeLabel="Close menu"
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <nav aria-label="Mobile menu" className="divide-y divide-white/5">
        <button type="button" onClick={onOpenCharacterSheet} className={menuButtonClassName}>
          <FileText size={16} aria-hidden="true" />
          Character Sheet
        </button>
        <button type="button" onClick={onOpenEditCharacter} className={menuButtonClassName}>
          <Pencil size={16} aria-hidden="true" />
          Edit Character
        </button>
        <button type="button" onClick={onOpenGainExperience} className={menuButtonClassName}>
          <ArrowUpFromLine size={16} aria-hidden="true" />
          Gain Experience
        </button>
        <button type="button" onClick={onOpenDiceLog} className={menuButtonClassName}>
          <Dice5 size={16} aria-hidden="true" />
          Dice Log
        </button>
        <div>
          <button
            type="button"
            onClick={() => setIsLibraryExpanded((expanded) => !expanded)}
            className={menuButtonClassName}
            aria-expanded={isLibraryExpanded}
            aria-controls="mobile-menu-library-list"
          >
            <BookOpen size={16} aria-hidden="true" />
            Library
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`ml-auto transition-transform ${isLibraryExpanded ? "rotate-180" : ""}`}
            />
          </button>
          {isLibraryExpanded ? (
            <div id="mobile-menu-library-list" className="bg-wfrp-surface-raised/40">
              <button
                type="button"
                onClick={() => openInNewTab(buildCampaignLibraryPath({ campaignId }))}
                className={`${menuButtonClassName} pl-10`}
              >
                <ExternalLink size={14} aria-hidden="true" />
                Library overview
              </button>
              {bookCatalog.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => openInNewTab(buildCampaignLibraryPath({ campaignId, bookId: book.id }))}
                  className={`${menuButtonClassName} pl-10`}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  {book.title}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </nav>
    </AppSidebar>
  );
}
```

In `src/AppComposition.tsx`, update the `<MobileMenuSidebar>` call site (edited in Task 4 Step 9 to remove `onOpenBooks`): add `campaignId={characterData.campaignId}`.

- [ ] **Step 1: Apply the edits above**
- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sidebar/MobileMenuSidebar.tsx src/AppComposition.tsx
git commit -m "feat: add Library accordion to mobile menu sidebar"
```

---

### Task 8: Rewrite Playwright tests for the new Library routes and entry points

**Files:**
- Modify: `tests/routes.spec.ts` (rename Books-specific tests to Library URLs)
- Modify: `tests/books.spec.ts` → rename to `tests/library.spec.ts`

**Interfaces:**
- Consumes: the final app behavior from Tasks 1-7. No production code interfaces.

Rename the test file:

```bash
git mv tests/books.spec.ts tests/library.spec.ts
```

Replace its contents with the rewritten route/behavior coverage:

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/character-progress/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, body: "null" });
      return;
    }

    await route.fulfill({ status: 204 });
  });
});

test("player can open the Library from the landing page and browse into a chapter and back, with URLs reflecting book and chapter", async ({ page }) => {
  await page.goto("/enemy_within");

  await page.getByRole("button", { name: "Open Library" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/library$/);

  await page.getByRole("button", { name: "WFRP 4E Core Rulebook" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/library\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.getByRole("button", { name: "Throwing Bones" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/library\/core-rulebook\/throwing-bones$/);
  await expect(page.getByRole("heading", { name: "Throwing Bones" })).toBeVisible();
  await expect(page.getByText(/ten-sided dice/).first()).toBeVisible();

  await page.getByRole("button", { name: "Back to chapters" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/library\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.getByRole("button", { name: "Back to books" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/library$/);
  await expect(page.getByRole("button", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});

test("a chapter URL can be opened directly (deep link)", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/throwing-bones");

  await expect(page.getByRole("heading", { name: "Throwing Bones" })).toBeVisible();
  await expect(page.getByText(/ten-sided dice/).first()).toBeVisible();
});

test("browser back/forward moves between book and chapter views", async ({ page }) => {
  await page.goto("/enemy_within/library");
  await page.getByRole("button", { name: "WFRP 4E Core Rulebook" }).click();
  await page.getByRole("button", { name: "Throwing Bones" }).click();
  await expect(page).toHaveURL(/\/library\/core-rulebook\/throwing-bones$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/library\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/library$/);

  await page.goForward();
  await expect(page).toHaveURL(/\/library\/core-rulebook$/);
});

test("an unknown chapter slug falls back to the book's chapter list", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/not-a-real-chapter");

  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});

test("an unknown book slug falls back to the book catalog", async ({ page }) => {
  await page.goto("/enemy_within/library/not-a-real-book");

  await expect(page.getByRole("button", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});

test("chapter heading levels form a correct outline (H1 chapter title, H2 major sections, H3 subsections)", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/rules");

  await expect(page.getByRole("heading", { level: 1, name: "Rules" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Combat" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Timing Structure" })).toBeVisible();
});

test("chapter table of contents lists H2 sections and scrolls to them (desktop)", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/rules");

  const toc = page.getByRole("navigation", { name: "Chapter contents" });
  await expect(toc.getByRole("link", { name: "Combat" })).toBeVisible();

  await toc.getByRole("link", { name: "Combat" }).click();
  await expect(page.locator("#combat")).toBeInViewport();
});

test("chapter table of contents opens as a bottom sheet on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/enemy_within/library/core-rulebook/rules");

  await expect(page.getByRole("navigation", { name: "Chapter contents" })).toBeHidden();
  await page.getByRole("button", { name: "Contents" }).click();

  const sheet = page.locator('[data-bottom-sheet-paper="true"]');
  await expect(sheet.getByRole("link", { name: "Combat" })).toBeVisible();

  await sheet.getByRole("link", { name: "Combat" }).click();
  await expect(sheet).toBeHidden();
  await expect(page.locator("#combat")).toBeInViewport();
});

test("a chapter with fewer than 2 major sections has no table of contents", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/throwing-bones");

  await expect(page.getByRole("navigation", { name: "Chapter contents" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Contents" })).toHaveCount(0);
});

test("tables have alternating row background colors", async ({ page }) => {
  await page.goto("/enemy_within/library/core-rulebook/rules");

  const table = page.locator("table").filter({ hasText: "Astounding Success" });
  const rows = table.locator("tbody tr");

  const firstColor = await rows.nth(0).evaluate((el) => getComputedStyle(el).backgroundColor);
  const secondColor = await rows.nth(1).evaluate((el) => getComputedStyle(el).backgroundColor);

  expect(firstColor).not.toBe(secondColor);
});

test("desktop character header Library dropdown opens the overview and a specific book in new tabs", async ({ page, context }) => {
  await page.goto("/enemy_within/karl-muller/skills");

  const characterMenu = page.getByRole("navigation", { name: "Character menu" });
  await expect(characterMenu.getByRole("button", { name: "Books" })).toHaveCount(0);

  const [overviewTab] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("button", { name: "Library" }).click().then(() =>
      page.getByRole("menuitem", { name: "Library overview" }).click(),
    ),
  ]);
  await overviewTab.waitForLoadState();
  await expect(overviewTab).toHaveURL(/\/enemy_within\/library$/);
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/skills$/);

  const [bookTab] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("button", { name: "Library" }).click().then(() =>
      page.getByRole("menuitem", { name: "WFRP 4E Core Rulebook" }).click(),
    ),
  ]);
  await bookTab.waitForLoadState();
  await expect(bookTab).toHaveURL(/\/enemy_within\/library\/core-rulebook$/);
});

test("mobile menu Library accordion expands and opens a book in a new tab", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/enemy_within/karl-muller/skills");

  await page.getByRole("button", { name: "Menu" }).click();
  const mobileMenu = page.getByRole("navigation", { name: "Mobile menu" });
  await mobileMenu.getByRole("button", { name: "Library" }).click();

  const [bookTab] = await Promise.all([
    context.waitForEvent("page"),
    mobileMenu.getByRole("button", { name: "WFRP 4E Core Rulebook" }).click(),
  ]);
  await bookTab.waitForLoadState();
  await expect(bookTab).toHaveURL(/\/enemy_within\/library\/core-rulebook$/);
});
```

In `tests/routes.spec.ts`, search for any `/books` references and update them the same way (change `/{campaign}/{character}/books...` assertions to none — there is no more books-under-character route; if any test there specifically exercises the old nested URL, delete that test, since Task 4 intentionally removes the route):

```bash
grep -n "books" tests/routes.spec.ts
```

If this returns matches, read the surrounding test and remove/update it to match the new `/library` behavior already covered in `library.spec.ts` above (don't duplicate coverage — just delete redundant old-route assertions).

- [ ] **Step 1: Rename and rewrite `tests/library.spec.ts` as shown above**
- [ ] **Step 2: Check and fix `tests/routes.spec.ts` for stale `/books` references**
- [ ] **Step 3: Run the full test suite**

Run: `npm run lint && npm run build && npm test`
Expected: all tests pass, including the new `library.spec.ts` cases.

- [ ] **Step 4: Commit**

```bash
git add tests/library.spec.ts tests/routes.spec.ts
git commit -m "test: rewrite Books tests for the new Library routes and entry points"
```

---

### Task 9: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full check**

Run: `npm run lint && npm run build && npm test`
Expected: all green.

- [ ] **Step 2: Manual smoke check with the dev server**

Run: `npm run dev`, then in a browser:
1. Visit `/enemy_within` — confirm a "Library" card appears between Game Master and the character cards, clicking it goes to `/enemy_within/library`.
2. From a character sheet, open the desktop header "Library" dropdown — confirm it lists "Library overview" and "WFRP 4E Core Rulebook", both opening in new tabs, and the current tab's URL is unchanged.
3. On mobile viewport, open the hamburger menu, expand "Library" — confirm the same two entries appear indented below it and open in new tabs.
4. Visit the old URL `/enemy_within/karl-muller/books` directly — confirm it no longer resolves to a books view (falls back to the character's default view, since that route segment no longer exists).

- [ ] **Step 3: No commit needed for this task (verification only)**
