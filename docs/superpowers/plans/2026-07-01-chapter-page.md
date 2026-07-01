# Chapter Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give book chapters deep-linkable URLs (`/:campaign/:character/books/:bookSlug/:chapterSlug`), a correct H1→H6 heading outline with the chapter title as H1, an in-content 280px table of contents listing each chapter's major (H2) sections, and zebra-striped tables.

**Architecture:** Extends the app's existing hand-rolled path-parsing/pushState router (`src/lib/campaignRoutes.ts` + `src/lib/useCampaignRouteSync.ts`) with two more optional URL segments, rather than introducing a routing library. `BooksLibrary`'s book/chapter selection moves from local `useState` to URL-derived props. A new small heading-extraction utility walks chapter markdown once per render and is shared between the rendered headings (for anchor `id`s) and the table-of-contents list, so they always agree.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, `react-markdown` + `remark-gfm` (already a dependency), Playwright (project's only test runner — there is no unit-test framework, so all verification here is E2E).

## Global Constraints

- Use `Heading`/`Text` from `src/components/ui/` for all text — never raw `<h1>`-`<h6>` or `<p>`.
- Use semantic Tailwind tokens (`bg-muted`, `text-foreground`, `text-wfrp-gold`, etc.) — never hardcoded hex/RGB.
- Use components from `src/components/ui/` in preference to raw HTML elements.
- `npm run lint && npm run build && npm test` must pass before any task is considered done.
- No new dependencies — everything here is buildable with what's already in `package.json`.

---

### Task 1: URL-based book & chapter navigation

**Files:**
- Modify: `src/lib/campaignRoutes.ts`
- Modify: `src/lib/useCampaignRouteSync.ts`
- Modify: `src/components/books/BooksLibrary.tsx`
- Modify: `src/tabs/BooksTab.tsx`
- Modify: `src/AppComposition.tsx:852-869` (the `useCampaignRouteSync` call) and `src/AppComposition.tsx:2160-2161` (the `<BooksTab />` render)
- Test: `tests/books.spec.ts`

**Interfaces:**
- Produces (used by Task 3): `BooksLibrary` props `{ bookId: string | null; chapterId: string | null; onSelectBook: (bookId: string | null) => void; onSelectChapter: (chapterId: string | null) => void }`.
- Produces (used by Tasks 2 & 3 implicitly): `useCampaignRouteSync(...)` now also returns `bookId: string | null`, `chapterId: string | null`, `selectBook: (bookId: string | null) => void`, `selectChapter: (chapterId: string | null) => void`.

- [ ] **Step 1: Write the failing Playwright tests**

Replace the single existing test in `tests/books.spec.ts` with the following (keep the existing `test.beforeEach` block at the top unchanged):

```ts
test("player can open the Books page from the character menu and browse into a chapter and back, with URLs reflecting book and chapter", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/skills");

  const characterMenu = page.getByRole("navigation", { name: "Character menu" });
  await characterMenu.getByRole("button", { name: "Books" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/books$/);

  await page.getByRole("button", { name: "WFRP 4E Core Rulebook" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/books\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.getByRole("button", { name: "Throwing Bones" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/books\/core-rulebook\/throwing-bones$/);
  await expect(page.getByRole("heading", { name: "Throwing Bones" })).toBeVisible();
  await expect(page.getByText(/ten-sided dice/).first()).toBeVisible();

  await page.getByRole("button", { name: "Back to chapters" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/books\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.getByRole("button", { name: "Back to books" }).click();
  await expect(page).toHaveURL(/\/enemy_within\/karl-muller\/books$/);
  await expect(page.getByRole("button", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});

test("a chapter URL can be opened directly (deep link)", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books/core-rulebook/throwing-bones");

  await expect(page.getByRole("heading", { name: "Throwing Bones" })).toBeVisible();
  await expect(page.getByText(/ten-sided dice/).first()).toBeVisible();
});

test("browser back/forward moves between book and chapter views", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books");
  await page.getByRole("button", { name: "WFRP 4E Core Rulebook" }).click();
  await page.getByRole("button", { name: "Throwing Bones" }).click();
  await expect(page).toHaveURL(/\/books\/core-rulebook\/throwing-bones$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/books\/core-rulebook$/);
  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/books$/);

  await page.goForward();
  await expect(page).toHaveURL(/\/books\/core-rulebook$/);
});

test("an unknown chapter slug falls back to the book's chapter list", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books/core-rulebook/not-a-real-chapter");

  await expect(page.getByRole("heading", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});

test("an unknown book slug falls back to the book catalog", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books/not-a-real-book");

  await expect(page.getByRole("button", { name: "WFRP 4E Core Rulebook" })).toBeVisible();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx playwright test tests/books.spec.ts`
Expected: FAIL — none of the new URLs are produced yet; `BooksLibrary` still manages selection with local `useState`.

- [ ] **Step 3: Extend the route type and parser in `src/lib/campaignRoutes.ts`**

Replace the route pattern (currently line 8):

```ts
const campaignCharacterRoutePattern = /^\/([^/]+)\/([^/]+)(?:\/([^/?#]+)(?:\/([^/?#]+)(?:\/([^/?#]+))?)?)?\/?$/;
```

Replace the `CampaignCharacterRoute` type:

```ts
export type CampaignCharacterRoute = {
  campaignId: string;
  characterId: string;
  view: MobileMainView;
  tab: MainTab;
  hasExplicitView: boolean;
  bookId: string | null;
  chapterId: string | null;
};
```

Replace `parseCampaignCharacterPath`:

```ts
export function parseCampaignCharacterPath(pathname: string): CampaignCharacterRoute | null {
  const match = campaignCharacterRoutePattern.exec(pathname);
  if (!match) return null;

  const [, campaignIdSegment, characterIdSegment, viewSegment, bookSlugSegment, chapterSlugSegment] = match;
  const campaignId = decodePathSegment(campaignIdSegment);
  const routeCharacterId = decodePathSegment(characterIdSegment);
  const decodedViewSegment = viewSegment ? decodePathSegment(viewSegment) : null;
  const hasExplicitView = Boolean(viewSegment);
  const view = viewAliases[
    (decodedViewSegment ?? characterViewPathSegments.characteristics).toLowerCase()
  ];

  if (!campaignId || !campaignById[campaignId] || !routeCharacterId || !view) return null;
  if ((bookSlugSegment || chapterSlugSegment) && view !== "books") return null;

  const characterId = resolveRouteCharacterId(campaignId, routeCharacterId);
  if (!characterId) return null;

  const bookId = view === "books" && bookSlugSegment ? decodePathSegment(bookSlugSegment) : null;
  const chapterId = view === "books" && bookId && chapterSlugSegment ? decodePathSegment(chapterSlugSegment) : null;

  return {
    campaignId,
    characterId,
    view,
    tab: mainTabByCharacterView[view],
    hasExplicitView,
    bookId,
    chapterId,
  };
}
```

Replace `buildCampaignCharacterPath`:

```ts
export function buildCampaignCharacterPath({
  campaignId = defaultCampaignId,
  characterId,
  view,
  omitDefaultView = false,
  characterName,
  bookId = null,
  chapterId = null,
}: {
  campaignId?: string;
  characterId: string;
  view: MobileMainView;
  omitDefaultView?: boolean;
  characterName?: string;
  bookId?: string | null;
  chapterId?: string | null;
}) {
  const progress = loadCharacterProgress(characterId);
  const character = characterRecords.find((c) => c.id === characterId);
  const resolvedName = characterName || progress?.characterName?.trim() || character?.name || characterId;
  const characterSlug = slugifyPathSegment(resolvedName);

  const characterPath = `/${encodePathSegment(campaignId)}/${encodePathSegment(characterSlug)}`;

  if (omitDefaultView && view === defaultCampaignCharacterTab) {
    return characterPath;
  }

  const viewPath = `${characterPath}/${characterViewPathSegments[view]}`;

  if (view !== "books" || !bookId) {
    return viewPath;
  }

  const bookPath = `${viewPath}/${encodePathSegment(bookId)}`;

  return chapterId ? `${bookPath}/${encodePathSegment(chapterId)}` : bookPath;
}
```

- [ ] **Step 4: Extend `src/lib/useCampaignRouteSync.ts` to track and sync book/chapter**

Replace the `SyncRouteOptions` type:

```ts
type SyncRouteOptions = {
  characterId?: string;
  view?: MobileMainView;
  mode?: "push" | "replace";
  omitDefaultView?: boolean;
  bookId?: string | null;
  chapterId?: string | null;
};
```

Inside `useCampaignRouteSync`, add two more state variables right after `hasAppliedInitialRoute`:

```ts
const [bookId, setBookIdState] = useState<string | null>(null);
const [chapterId, setChapterIdState] = useState<string | null>(null);
```

Replace `syncCampaignRoute`:

```ts
const syncCampaignRoute = useCallback(({
  characterId = selectedCharacterId,
  view = currentCampaignRoute.current?.view ?? activeMobileMainView,
  mode = "replace",
  omitDefaultView = currentCampaignRoute.current?.hasExplicitView === false,
  bookId: nextBookId = bookId,
  chapterId: nextChapterId = chapterId,
}: SyncRouteOptions = {}) => {
  if (!routeSyncEnabled) return;

  const campaignId = currentCampaignRoute.current?.campaignId ?? defaultCampaignId;
  const nextPath = buildCampaignCharacterPath({
    campaignId,
    characterId,
    view,
    omitDefaultView,
    characterName,
    bookId: nextBookId,
    chapterId: nextChapterId,
  });
  const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;
  const route = parseCampaignCharacterPath(nextPath);

  if (route) {
    currentCampaignRoute.current = route;
  }

  if (getCurrentPathname() === nextPath) {
    return;
  }

  if (mode === "push") {
    window.history.pushState(null, "", nextUrl);
    return;
  }

  window.history.replaceState(null, "", nextUrl);
}, [activeMobileMainView, routeSyncEnabled, selectedCharacterId, characterName, bookId, chapterId]);
```

In the `useEffect` that handles `routeSyncEnabled === false`, also reset the new state (this is the block starting `if (!routeSyncEnabled) {`):

```ts
if (!routeSyncEnabled) {
  setHasAppliedInitialRoute(false);
  currentCampaignRoute.current = null;
  setBookIdState(null);
  setChapterIdState(null);
  return;
}
```

In the same effect's `applyRoute` function, add the two new lines at the end:

```ts
const applyRoute = (pathname: string) => {
  const route = parseCampaignCharacterPath(pathname);
  if (!route) return;

  currentCampaignRoute.current = route;

  if (availableCharacters.some((character) => character.id === route.characterId)) {
    setSelectedCharacterId(route.characterId);
  }

  setActiveMainTab(route.tab);
  setActiveMobileMainView(route.view);
  setBookIdState(route.bookId);
  setChapterIdState(route.chapterId);
};
```

Replace `selectMainTab` and `selectMobileMainView` (both must reset book/chapter to `null` so navigating to Books from the main nav always starts at the catalog, not wherever the last visit left off):

```ts
const selectMainTab = useCallback((tab: MainTab) => {
  syncCampaignRoute({ view: tab, mode: "push", omitDefaultView: false, bookId: null, chapterId: null });
  setActiveMainTab(tab);
  setActiveMobileMainView(tab);
  setBookIdState(null);
  setChapterIdState(null);
}, [setActiveMainTab, setActiveMobileMainView, syncCampaignRoute]);

const selectMobileMainView = useCallback((target: MobileMainView) => {
  syncCampaignRoute({ view: target, mode: "push", omitDefaultView: false, bookId: null, chapterId: null });
  setActiveMobileMainView(target);
  setBookIdState(null);
  setChapterIdState(null);

  if (isMainTab(target)) {
    setActiveMainTab(target);
  }

  handleMobileMainViewSelect(target);
}, [handleMobileMainViewSelect, setActiveMainTab, setActiveMobileMainView, syncCampaignRoute]);
```

Add `selectBook` and `selectChapter` right after `selectMobileMainView`:

```ts
const selectBook = useCallback((nextBookId: string | null) => {
  syncCampaignRoute({ view: "books", mode: "push", bookId: nextBookId, chapterId: null });
  setBookIdState(nextBookId);
  setChapterIdState(null);
}, [syncCampaignRoute]);

const selectChapter = useCallback((nextChapterId: string | null) => {
  syncCampaignRoute({ view: "books", mode: "push", bookId, chapterId: nextChapterId });
  setChapterIdState(nextChapterId);
}, [syncCampaignRoute, bookId]);
```

Replace `restoreRouteForCharacter`:

```ts
const restoreRouteForCharacter = useCallback((characterId: string) => {
  const route = currentCampaignRoute.current;
  if (route?.characterId !== characterId) {
    return false;
  }

  setActiveMainTab(route.tab);
  setActiveMobileMainView(route.hasExplicitView ? route.view : "characteristics");
  setBookIdState(route.bookId);
  setChapterIdState(route.chapterId);
  return true;
}, [setActiveMainTab, setActiveMobileMainView]);
```

Replace the hook's return statement:

```ts
return {
  bookId,
  chapterId,
  restoreRouteForCharacter,
  selectBook,
  selectCharacter,
  selectChapter,
  selectMainTab,
  selectMobileMainView,
};
```

- [ ] **Step 5: Wire the new hook fields through `src/AppComposition.tsx`**

At `src/AppComposition.tsx:852-869`, update the destructure to also pull out the new fields (rename to avoid clashing with existing names):

```ts
const {
  restoreRouteForCharacter,
  selectCharacter,
  selectMainTab,
  selectMobileMainView,
  bookId: selectedBooksBookId,
  chapterId: selectedBooksChapterId,
  selectBook,
  selectChapter,
} = useCampaignRouteSync({
  activeMainTab,
  activeMobileMainView,
  availableCharacters,
  handleMobileMainViewSelect,
  routeSyncEnabled: !isLandingPageOpen && !isGameMasterOpen,
  selectedCharacterId,
  setActiveMainTab,
  setActiveMobileMainView,
  setSelectedCharacterId,
  isAllProgressHydrated,
  characterName: characterData.name,
});
```

At `src/AppComposition.tsx:2160-2161`, replace:

```tsx
) : activeMainTab === "books" ? (
  <BooksTab
    bookId={selectedBooksBookId}
    chapterId={selectedBooksChapterId}
    onSelectBook={selectBook}
    onSelectChapter={selectChapter}
  />
) : (
```

- [ ] **Step 6: Update `src/tabs/BooksTab.tsx` to accept and forward the new props**

```tsx
import { BooksLibrary } from "../components/books/BooksLibrary";

export function BooksTab({
  bookId,
  chapterId,
  onSelectBook,
  onSelectChapter,
}: {
  bookId: string | null;
  chapterId: string | null;
  onSelectBook: (bookId: string | null) => void;
  onSelectChapter: (chapterId: string | null) => void;
}) {
  return (
    <BooksLibrary
      bookId={bookId}
      chapterId={chapterId}
      onSelectBook={onSelectBook}
      onSelectChapter={onSelectChapter}
    />
  );
}
```

- [ ] **Step 7: Replace `BooksLibrary`'s local state with the new props**

Replace the full contents of `src/components/books/BooksLibrary.tsx`:

```tsx
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button, Heading, Text } from "../ui";
import { SheetDataButtonRow, SheetDataPanel } from "../wfrp";
import { bookCatalog, bookCovers, loadChapterContent, type BookMeta } from "../../data/books";
import { MarkdownContent } from "./MarkdownContent";

function findChapterIndex(book: BookMeta, chapterId: string): number {
  return book.chapters.findIndex((chapter) => chapter.id === chapterId);
}

export function BooksLibrary({
  bookId,
  chapterId,
  onSelectBook,
  onSelectChapter,
}: {
  bookId: string | null;
  chapterId: string | null;
  onSelectBook: (bookId: string | null) => void;
  onSelectChapter: (chapterId: string | null) => void;
}) {
  const [chapterContent, setChapterContent] = useState<string | null>(null);

  const selectedBook = bookId
    ? bookCatalog.find((book) => book.id === bookId)
    : undefined;
  const selectedChapter = selectedBook && chapterId
    ? selectedBook.chapters.find((chapter) => chapter.id === chapterId)
    : undefined;

  useEffect(() => {
    if (!selectedBook || !selectedChapter) {
      setChapterContent(null);
      return;
    }

    let isCancelled = false;
    setChapterContent(null);

    void loadChapterContent(selectedBook.id, selectedChapter.id).then((content) => {
      if (!isCancelled) setChapterContent(content);
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedBook, selectedChapter]);

  if (selectedBook && selectedChapter) {
    const chapterIndex = findChapterIndex(selectedBook, selectedChapter.id);
    const previousChapter = selectedBook.chapters[chapterIndex - 1];
    const nextChapter = selectedBook.chapters[chapterIndex + 1];

    return (
      <div className="flex flex-col gap-4 p-4">
        <Button variant="subtabAction" onClick={() => onSelectChapter(null)}>
          Back to chapters
        </Button>
        <Heading level={2} variant="section">{selectedChapter.title}</Heading>
        {chapterContent === null ? (
          <Text variant="bodyMuted">Loading…</Text>
        ) : (
          <MarkdownContent content={chapterContent} />
        )}
        <div className="flex flex-wrap justify-between gap-3">
          <Button
            variant="subtabAction"
            disabled={!previousChapter}
            onClick={() => previousChapter && onSelectChapter(previousChapter.id)}
          >
            Previous chapter
          </Button>
          <Button
            variant="subtabAction"
            disabled={!nextChapter}
            onClick={() => nextChapter && onSelectChapter(nextChapter.id)}
          >
            Next chapter
          </Button>
        </div>
      </div>
    );
  }

  if (selectedBook) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Button variant="subtabAction" onClick={() => onSelectBook(null)}>
          Back to books
        </Button>
        <Heading level={2} variant="section">{selectedBook.title}</Heading>
        <SheetDataPanel>
          {selectedBook.chapters.map((chapter) => (
            <SheetDataButtonRow
              key={chapter.id}
              className="grid-cols-[1fr_24px] px-4 py-3"
              onClick={() => onSelectChapter(chapter.id)}
            >
              <Text variant="bodyStrong">{chapter.title}</Text>
              <ChevronRight size={16} className="justify-self-end text-wfrp-muted-text" aria-hidden="true" />
            </SheetDataButtonRow>
          ))}
        </SheetDataPanel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="wfrp-landing-list">
        {bookCatalog.map((book) => (
          <button
            key={book.id}
            type="button"
            onClick={() => onSelectBook(book.id)}
            className="wfrp-landing-character-card"
            aria-label={`Open ${book.title}`}
          >
            <div className="wfrp-landing-portrait">
              {bookCovers[book.id] ? (
                <img
                  src={bookCovers[book.id]}
                  alt=""
                  className="wfrp-landing-portrait-image"
                />
              ) : (
                <span aria-hidden="true" className="wfrp-landing-initials">
                  {book.title.charAt(0)}
                </span>
              )}
            </div>
            <div className="wfrp-landing-card-body">
              <Heading level={2} variant="card">
                {book.title}
              </Heading>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

Note: invalid `bookId`/`chapterId` values are handled for free by this structure — if `bookId` doesn't match any catalog entry, `selectedBook` is `undefined` and the code falls through to the final `return` (book catalog). If `chapterId` doesn't match a chapter in a valid book, `selectedChapter` is `undefined` and it falls through to the `if (selectedBook)` branch (that book's chapter list). No extra "not found" branches needed.

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx playwright test tests/books.spec.ts`
Expected: PASS (all 5 tests)

- [ ] **Step 9: Run the full check and commit**

Run: `npm run lint && npm run build && npm test`
Expected: all green

```bash
git add src/lib/campaignRoutes.ts src/lib/useCampaignRouteSync.ts src/components/books/BooksLibrary.tsx src/tabs/BooksTab.tsx src/AppComposition.tsx tests/books.spec.ts
git commit -m "feat: give book chapters deep-linkable URLs"
```

---

### Task 2: Correct heading hierarchy (chapter title as H1)

**Files:**
- Modify: `src/components/books/MarkdownContent.tsx`
- Modify: `src/components/books/BooksLibrary.tsx:37` (the chapter title heading)
- Test: `tests/books.spec.ts`

**Interfaces:**
- Consumes: nothing new from Task 1 beyond what's already wired.
- Produces: no interface change — `MarkdownContent`'s props stay `{ content: string }` in this task (Task 3 adds a `headings` prop on top).

This task also documents, for the implementer, why the mapping isn't "markdown level N → semantic level N+1" uniformly: source chapter files use `#` (H1) as the chapter's **major grouping** (e.g. `rules.md` has `# Combat`, `# Injury`, `# Corruption`; `bestiary.md` has `# Ogre`, `# Bear`, `# Boar`) with `##`/`###` as subsections beneath each group. A few chapters (`magic.md`, `between-adventures.md`, `religion-and-belief.md`, `the-gamemaster.md`, and `bestiary.md`'s opening section) use `##` as their outermost heading with no `#` above it — those sections simply render one level higher with no parent, which is fine.

- [ ] **Step 1: Write the failing test**

Add to `tests/books.spec.ts`:

```ts
test("chapter heading levels form a correct outline (H1 chapter title, H2 major sections, H3 subsections)", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books/core-rulebook/rules");

  await expect(page.getByRole("heading", { level: 1, name: "Rules" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Combat" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Timing Structure" })).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/books.spec.ts -g "correct outline"`
Expected: FAIL — the chapter title currently renders as `level={2}`, and `# Combat` currently renders as `level={3}` (not 2).

- [ ] **Step 3: Change the chapter title to level 1**

In `src/components/books/BooksLibrary.tsx`, inside the `if (selectedBook && selectedChapter)` branch, change:

```tsx
<Heading level={2} variant="section">{selectedChapter.title}</Heading>
```

to:

```tsx
<Heading level={1} variant="section">{selectedChapter.title}</Heading>
```

(`variant` is untouched, so this changes only semantics/nesting, not appearance — `variant`, not `level`, controls the CSS in `src/components/ui/Heading.tsx`.)

- [ ] **Step 4: Shift the markdown heading levels in `MarkdownContent.tsx`**

In `src/components/books/MarkdownContent.tsx`, replace the `h1`-`h6` entries in the `components` map:

```tsx
  h1: ({ children }) => <Heading level={2} variant="subsection">{children}</Heading>,
  h2: ({ children }) => <Heading level={3} variant="subsection">{children}</Heading>,
  h3: ({ children }) => <Heading level={4} variant="subsection">{children}</Heading>,
  h4: ({ children }) => <Heading level={5} variant="subsection">{children}</Heading>,
  h5: ({ children }) => <Heading level={6} variant="subsection">{children}</Heading>,
  h6: ({ children }) => <Heading level={6} variant="subsection">{children}</Heading>,
```

(Leave everything else in the file unchanged.)

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx playwright test tests/books.spec.ts -g "correct outline"`
Expected: PASS

- [ ] **Step 6: Run the full check and commit**

Run: `npm run lint && npm run build && npm test`
Expected: all green

```bash
git add src/components/books/MarkdownContent.tsx src/components/books/BooksLibrary.tsx tests/books.spec.ts
git commit -m "fix: chapter title is H1, markdown # groups become H2"
```

---

### Task 3: In-content table of contents

**Files:**
- Create: `src/components/books/headingSlug.ts`
- Create: `src/components/books/ChapterTableOfContents.tsx`
- Modify: `src/components/books/MarkdownContent.tsx`
- Modify: `src/components/books/BooksLibrary.tsx`
- Test: `tests/books.spec.ts`

**Interfaces:**
- Consumes: `Heading`, `Text`, `Button`, `BottomSheetPaper` from `../ui` (all already exported per `src/components/ui/index.ts`); `BooksLibrary` props from Task 1; the H1-as-chapter-title / markdown-`#`-as-H2 semantics from Task 2.
- Produces:
  - `src/components/books/headingSlug.ts` exports `type ExtractedHeading = { level: number; text: string; id: string }` and `function extractHeadings(markdown: string): ExtractedHeading[]`.
  - `src/components/books/ChapterTableOfContents.tsx` exports `function ChapterTableOfContents({ headings, onSelect }: { headings: ExtractedHeading[]; onSelect?: () => void }): JSX.Element | null` — renders `null` when there are fewer than 2 level-1 headings.
  - `MarkdownContent` now takes `{ content: string; headings: ExtractedHeading[] }` (was `{ content: string }`) and assigns each rendered heading an `id` matching the corresponding entry in `headings`, in document order.

- [ ] **Step 1: Write the failing tests**

Add to `tests/books.spec.ts`:

```ts
test("chapter table of contents lists H2 sections and scrolls to them (desktop)", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books/core-rulebook/rules");

  const toc = page.getByRole("navigation", { name: "Chapter contents" });
  await expect(toc.getByRole("link", { name: "Combat" })).toBeVisible();

  await toc.getByRole("link", { name: "Combat" }).click();
  await expect(page.locator("#combat")).toBeInViewport();
});

test("chapter table of contents opens as a bottom sheet on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/enemy_within/karl-muller/books/core-rulebook/rules");

  await expect(page.getByRole("navigation", { name: "Chapter contents" })).toBeHidden();
  await page.getByRole("button", { name: "Contents" }).click();

  const sheet = page.locator('[data-bottom-sheet-paper="true"]');
  await expect(sheet.getByRole("link", { name: "Combat" })).toBeVisible();

  await sheet.getByRole("link", { name: "Combat" }).click();
  await expect(sheet).toBeHidden();
  await expect(page.locator("#combat")).toBeInViewport();
});

test("a chapter with fewer than 2 major sections has no table of contents", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books/core-rulebook/throwing-bones");

  await expect(page.getByRole("navigation", { name: "Chapter contents" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Contents" })).toHaveCount(0);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx playwright test tests/books.spec.ts -g "table of contents"`
Expected: FAIL — no TOC exists yet.

- [ ] **Step 3: Create `src/components/books/headingSlug.ts`**

```ts
export type ExtractedHeading = {
  level: number;
  text: string;
  id: string;
};

function slugifyHeadingText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createHeadingSlugger() {
  const seen = new Map<string, number>();

  return (text: string): string => {
    const base = slugifyHeadingText(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

const headingLinePattern = /^(#{1,6})\s+(.+?)\s*$/;

export function extractHeadings(markdown: string): ExtractedHeading[] {
  const slugify = createHeadingSlugger();
  const headings: ExtractedHeading[] = [];

  for (const line of markdown.split("\n")) {
    const match = headingLinePattern.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].trim();
    headings.push({ level, text, id: slugify(text) });
  }

  return headings;
}
```

- [ ] **Step 4: Create `src/components/books/ChapterTableOfContents.tsx`**

```tsx
import { Text } from "../ui";
import type { ExtractedHeading } from "./headingSlug";

export function ChapterTableOfContents({
  headings,
  onSelect,
}: {
  headings: ExtractedHeading[];
  onSelect?: () => void;
}) {
  const sections = headings.filter((heading) => heading.level === 1);

  if (sections.length < 2) return null;

  return (
    <nav aria-label="Chapter contents" className="flex flex-col gap-1">
      <Text as="span" variant="bodyStrongMuted" className="wfrp-label mb-1">
        Contents
      </Text>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={onSelect}
          className="rounded px-2 py-1.5 text-sm text-gray-300 hover:bg-wfrp-surface-raised hover:text-gray-100"
        >
          {section.text}
        </a>
      ))}
    </nav>
  );
}
```

- [ ] **Step 5: Update `MarkdownContent` to accept `headings` and assign ids**

Replace the full contents of `src/components/books/MarkdownContent.tsx`:

```tsx
import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "../ui";
import type { ExtractedHeading } from "./headingSlug";

export function MarkdownContent({
  content,
  headings,
}: {
  content: string;
  headings: ExtractedHeading[];
}) {
  let headingIndex = 0;
  const nextHeadingId = () => headings[headingIndex++]?.id;

  const components: ComponentProps<typeof ReactMarkdown>["components"] = {
    h1: ({ children }) => <Heading id={nextHeadingId()} level={2} variant="subsection">{children}</Heading>,
    h2: ({ children }) => <Heading id={nextHeadingId()} level={3} variant="subsection">{children}</Heading>,
    h3: ({ children }) => <Heading id={nextHeadingId()} level={4} variant="subsection">{children}</Heading>,
    h4: ({ children }) => <Heading id={nextHeadingId()} level={5} variant="subsection">{children}</Heading>,
    h5: ({ children }) => <Heading id={nextHeadingId()} level={6} variant="subsection">{children}</Heading>,
    h6: ({ children }) => <Heading id={nextHeadingId()} level={6} variant="subsection">{children}</Heading>,
    p: ({ children }) => <Text className="mb-3 last:mb-0">{children}</Text>,
    table: ({ children }) => <Table className="mb-3">{children}</Table>,
    thead: ({ children }) => <TableHeader>{children}</TableHeader>,
    tbody: ({ children }) => <TableBody>{children}</TableBody>,
    tr: ({ children }) => <TableRow>{children}</TableRow>,
    th: ({ children }) => <TableHead>{children}</TableHead>,
    td: ({ children }) => <TableCell>{children}</TableCell>,
    ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 wfrp-text text-gray-200">{children}</ul>,
    ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 wfrp-text text-gray-200">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
```

- [ ] **Step 6: Wire the TOC and mobile bottom sheet into `BooksLibrary`**

Replace the full contents of `src/components/books/BooksLibrary.tsx`:

```tsx
import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { BottomSheetPaper, Button, Heading, Text } from "../ui";
import { SheetDataButtonRow, SheetDataPanel } from "../wfrp";
import { bookCatalog, bookCovers, loadChapterContent, type BookMeta } from "../../data/books";
import { ChapterTableOfContents } from "./ChapterTableOfContents";
import { extractHeadings } from "./headingSlug";
import { MarkdownContent } from "./MarkdownContent";

function findChapterIndex(book: BookMeta, chapterId: string): number {
  return book.chapters.findIndex((chapter) => chapter.id === chapterId);
}

export function BooksLibrary({
  bookId,
  chapterId,
  onSelectBook,
  onSelectChapter,
}: {
  bookId: string | null;
  chapterId: string | null;
  onSelectBook: (bookId: string | null) => void;
  onSelectChapter: (chapterId: string | null) => void;
}) {
  const [chapterContent, setChapterContent] = useState<string | null>(null);
  const [isContentsOpen, setIsContentsOpen] = useState(false);

  const selectedBook = bookId
    ? bookCatalog.find((book) => book.id === bookId)
    : undefined;
  const selectedChapter = selectedBook && chapterId
    ? selectedBook.chapters.find((chapter) => chapter.id === chapterId)
    : undefined;

  useEffect(() => {
    if (!selectedBook || !selectedChapter) {
      setChapterContent(null);
      return;
    }

    let isCancelled = false;
    setChapterContent(null);

    void loadChapterContent(selectedBook.id, selectedChapter.id).then((content) => {
      if (!isCancelled) setChapterContent(content);
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedBook, selectedChapter]);

  useEffect(() => {
    setIsContentsOpen(false);
  }, [selectedChapter]);

  const headings = useMemo(
    () => (chapterContent ? extractHeadings(chapterContent) : []),
    [chapterContent],
  );

  if (selectedBook && selectedChapter) {
    const chapterIndex = findChapterIndex(selectedBook, selectedChapter.id);
    const previousChapter = selectedBook.chapters[chapterIndex - 1];
    const nextChapter = selectedBook.chapters[chapterIndex + 1];
    const hasToc = headings.filter((heading) => heading.level === 1).length >= 2;

    return (
      <div className="flex flex-col gap-4 p-4">
        <Button variant="subtabAction" onClick={() => onSelectChapter(null)}>
          Back to chapters
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading level={1} variant="section">{selectedChapter.title}</Heading>
          {hasToc ? (
            <Button variant="subtabAction" className="lg:hidden" onClick={() => setIsContentsOpen(true)}>
              Contents
            </Button>
          ) : null}
        </div>
        {chapterContent === null ? (
          <Text variant="bodyMuted">Loading…</Text>
        ) : hasToc ? (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <ChapterTableOfContents headings={headings} />
            </aside>
            <MarkdownContent content={chapterContent} headings={headings} />
          </div>
        ) : (
          <MarkdownContent content={chapterContent} headings={headings} />
        )}
        {hasToc && isContentsOpen ? (
          <BottomSheetPaper className="lg:hidden" isPullable>
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center justify-between">
                <Text variant="bodyStrong">Contents</Text>
                <Button variant="subtabAction" onClick={() => setIsContentsOpen(false)}>
                  Close
                </Button>
              </div>
              <ChapterTableOfContents headings={headings} onSelect={() => setIsContentsOpen(false)} />
            </div>
          </BottomSheetPaper>
        ) : null}
        <div className="flex flex-wrap justify-between gap-3">
          <Button
            variant="subtabAction"
            disabled={!previousChapter}
            onClick={() => previousChapter && onSelectChapter(previousChapter.id)}
          >
            Previous chapter
          </Button>
          <Button
            variant="subtabAction"
            disabled={!nextChapter}
            onClick={() => nextChapter && onSelectChapter(nextChapter.id)}
          >
            Next chapter
          </Button>
        </div>
      </div>
    );
  }

  if (selectedBook) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Button variant="subtabAction" onClick={() => onSelectBook(null)}>
          Back to books
        </Button>
        <Heading level={2} variant="section">{selectedBook.title}</Heading>
        <SheetDataPanel>
          {selectedBook.chapters.map((chapter) => (
            <SheetDataButtonRow
              key={chapter.id}
              className="grid-cols-[1fr_24px] px-4 py-3"
              onClick={() => onSelectChapter(chapter.id)}
            >
              <Text variant="bodyStrong">{chapter.title}</Text>
              <ChevronRight size={16} className="justify-self-end text-wfrp-muted-text" aria-hidden="true" />
            </SheetDataButtonRow>
          ))}
        </SheetDataPanel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="wfrp-landing-list">
        {bookCatalog.map((book) => (
          <button
            key={book.id}
            type="button"
            onClick={() => onSelectBook(book.id)}
            className="wfrp-landing-character-card"
            aria-label={`Open ${book.title}`}
          >
            <div className="wfrp-landing-portrait">
              {bookCovers[book.id] ? (
                <img
                  src={bookCovers[book.id]}
                  alt=""
                  className="wfrp-landing-portrait-image"
                />
              ) : (
                <span aria-hidden="true" className="wfrp-landing-initials">
                  {book.title.charAt(0)}
                </span>
              )}
            </div>
            <div className="wfrp-landing-card-body">
              <Heading level={2} variant="card">
                {book.title}
              </Heading>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx playwright test tests/books.spec.ts -g "table of contents|major sections"`
Expected: PASS (all 3 tests)

- [ ] **Step 8: Run the full check and commit**

Run: `npm run lint && npm run build && npm test`
Expected: all green

```bash
git add src/components/books/headingSlug.ts src/components/books/ChapterTableOfContents.tsx src/components/books/MarkdownContent.tsx src/components/books/BooksLibrary.tsx tests/books.spec.ts
git commit -m "feat: add in-content chapter table of contents"
```

---

### Task 4: Zebra-striped tables

**Files:**
- Modify: `src/components/ui/table.tsx`
- Test: `tests/books.spec.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: no interface change — purely a styling change to `TableRow`.

- [ ] **Step 1: Write the failing test**

Add to `tests/books.spec.ts`:

```ts
test("tables have alternating row background colors", async ({ page }) => {
  await page.goto("/enemy_within/karl-muller/books/core-rulebook/rules");

  const table = page.locator("table").filter({ hasText: "Astounding Success" });
  const rows = table.locator("tbody tr");

  const firstColor = await rows.nth(0).evaluate((el) => getComputedStyle(el).backgroundColor);
  const secondColor = await rows.nth(1).evaluate((el) => getComputedStyle(el).backgroundColor);

  expect(firstColor).not.toBe(secondColor);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/books.spec.ts -g "alternating row"`
Expected: FAIL — both rows currently have the same (transparent) background.

- [ ] **Step 3: Add zebra striping to `TableRow`**

In `src/components/ui/table.tsx`, replace the `TableRow` export:

```tsx
export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn("border-b border-border transition-colors odd:bg-transparent even:bg-muted/10 hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />; }
```

(This uses Tailwind's `even:`/`odd:` variants, which compile to `:nth-child(even)`/`:nth-child(odd)` on the `tr` itself. A `<thead>` row is unaffected in practice since it's the only child of its own parent — `nth-child` counts siblings within the same parent, so `thead`'s single row and `tbody`'s rows are counted independently.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx playwright test tests/books.spec.ts -g "alternating row"`
Expected: PASS

- [ ] **Step 5: Run the full check and commit**

Run: `npm run lint && npm run build && npm test`
Expected: all green

```bash
git add src/components/ui/table.tsx tests/books.spec.ts
git commit -m "style: zebra-stripe table rows"
```

---

## Plan Self-Review Notes

- **Spec coverage:** URL routing (Task 1), H1 chapter title / heading hierarchy (Task 2), in-content 280px TOC + mobile bottom sheet (Task 3), table striping (Task 4) — all four spec sections have a task. Breadcrumbs were explicitly descoped by the user and are not touched.
- **Type consistency:** `ExtractedHeading` is defined once in `headingSlug.ts` (Task 3) and imported by both `ChapterTableOfContents.tsx` and `MarkdownContent.tsx`; `BooksLibrary` props (`bookId`, `chapterId`, `onSelectBook`, `onSelectChapter`) are defined in Task 1 and reused unchanged through Tasks 2-3. `useCampaignRouteSync`'s returned `selectBook`/`selectChapter` signatures match what `BooksTab`/`BooksLibrary` expect.
- **Task ordering:** Task 1 must land first (Tasks 2-4's tests all deep-link via `/books/core-rulebook/...` URLs). Task 2 must land before Task 3 (the TOC's "H2" concept relies on Task 2's heading-level remap being in place, even though `extractHeadings` itself reads raw markdown `#` counts independent of the `Heading level=` prop). Task 4 is independent and could run any time after Task 1.
