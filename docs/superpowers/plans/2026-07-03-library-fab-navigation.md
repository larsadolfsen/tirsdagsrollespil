# Library FAB Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fragmented mobile navigation controls (Contents button, Prev/Next) on chapter pages with a single FAB that opens a unified bottom sheet mirroring the desktop sidebar.

**Architecture:** `LibraryPage.tsx` is the only file that changes — state rename, removal of old controls, and addition of a FAB + bottom sheet that reuses the existing `ChapterTableOfContents` and `LibraryNavList` components. `library.spec.ts` is updated to match the new controls.

**Tech Stack:** React 19, Tailwind CSS v4, Playwright (tests), lucide-react (icons)

## Global Constraints

- Use `Button variant="fab"` — already defined in `src/components/ui/button.tsx`, styled as `xl:hidden` fixed bottom-right, uses `BookOpen` icon from lucide-react.
- Use `BottomSheetPaper isPullable` from `src/components/ui/BottomSheetPaper.tsx` — no `onDismiss` prop; close is handled by buttons inside.
- Semantic Tailwind tokens only — no hardcoded hex/RGB.
- `<Heading>` and `<Text>` for typography — no raw `<h1>`–`<h6>` or `<p>` with inline colour styles.
- Run `npm run lint && npm run build` before committing.

---

### Task 1: Replace mobile controls in `LibraryPage.tsx`

**Files:**
- Modify: `src/components/library/LibraryPage.tsx`

**Interfaces:**
- Produces: FAB with `aria-label="Open navigation"`, bottom sheet with `role="tablist" aria-label="Sidebar navigation"`, chapter nav with `aria-label="Book chapters"`, content nav with `aria-label="Chapter contents"`.

- [ ] **Step 1: Add `BookOpen` to the lucide-react import**

  In `src/components/library/LibraryPage.tsx` line 2, change:

  ```tsx
  import { ChevronRight } from "lucide-react";
  ```

  to:

  ```tsx
  import { BookOpen, ChevronRight } from "lucide-react";
  ```

- [ ] **Step 2: Rename state from `isContentsOpen` to `isNavOpen`**

  Change line 29:
  ```tsx
  const [isContentsOpen, setIsContentsOpen] = useState(false);
  ```
  to:
  ```tsx
  const [isNavOpen, setIsNavOpen] = useState(false);
  ```

  Change line 59 (inside the `useEffect` that resets on chapter change):
  ```tsx
  setIsContentsOpen(false);
  ```
  to:
  ```tsx
  setIsNavOpen(false);
  ```

- [ ] **Step 3: Replace the chapter-view return block**

  Replace the entire `return (...)` inside `if (selectedBook && selectedChapter)` (lines 72–181) with:

  ```tsx
  return (
    <div className="flex flex-col gap-4 p-4">
      {chapterContent === null ? (
        <Text variant="bodyMuted">Loading…</Text>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[288px_minmax(0,1fr)]">
          <aside className="hidden self-start lg:block lg:sticky lg:top-4">
            <Card className="overflow-hidden">
              <div
                className="flex w-full border-b border-wfrp-border"
                role="tablist"
                aria-label="Sidebar navigation"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={sidebarMode === "chapters" || !hasToc}
                  onClick={() => setSidebarMode("chapters")}
                  className={cn(
                    "wfrp-label h-9 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50",
                    hasToc ? "w-1/2" : "w-full",
                    sidebarMode === "chapters" || !hasToc
                      ? inlineSubtabButtonActiveClassName
                      : inlineSubtabButtonInactiveClassName,
                  )}
                >
                  Chapters
                </button>
                {hasToc ? (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sidebarMode === "headings"}
                    onClick={() => setSidebarMode("headings")}
                    className={cn(
                      "wfrp-label h-9 w-1/2 cursor-pointer border-l border-black/20 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50",
                      sidebarMode === "headings"
                        ? inlineSubtabButtonActiveClassName
                        : inlineSubtabButtonInactiveClassName,
                    )}
                  >
                    Content
                  </button>
                ) : null}
              </div>
              <div className="px-2 pb-2">
                <p className="wfrp-label mb-1.5 mt-2 truncate pl-2 pt-2 text-wfrp-muted-text">
                  {sidebarMode === "chapters" || !hasToc ? selectedBook.title : selectedChapter.title}
                </p>
                {!hasToc || sidebarMode === "chapters" ? (
                  <LibraryNavList
                    ariaLabel="Book chapters"
                    items={selectedBook.chapters.map((chapter) => ({
                      id: chapter.id,
                      label: chapter.title,
                      isActive: chapter.id === selectedChapter.id,
                      onClick: () => { onSelectChapter(chapter.id); setSidebarMode("headings"); },
                    }))}
                  />
                ) : (
                  <ChapterTableOfContents headings={headings} title={selectedChapter.title} />
                )}
              </div>
            </Card>
          </aside>
          <MarkdownContent content={chapterContent} headings={headings} />
        </div>
      )}
      <Button
        variant="fab"
        aria-label="Open navigation"
        onClick={() => setIsNavOpen(true)}
      >
        <BookOpen aria-hidden="true" className="h-6 w-6" />
      </Button>
      {isNavOpen ? (
        <BottomSheetPaper isPullable>
          <div className="flex w-full flex-col gap-3">
            <div
              className="flex w-full border-b border-wfrp-border"
              role="tablist"
              aria-label="Sidebar navigation"
            >
              <button
                type="button"
                role="tab"
                aria-selected={sidebarMode === "chapters" || !hasToc}
                onClick={() => setSidebarMode("chapters")}
                className={cn(
                  "wfrp-label h-9 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50",
                  hasToc ? "w-1/2" : "w-full",
                  sidebarMode === "chapters" || !hasToc
                    ? inlineSubtabButtonActiveClassName
                    : inlineSubtabButtonInactiveClassName,
                )}
              >
                Chapters
              </button>
              {hasToc ? (
                <button
                  type="button"
                  role="tab"
                  aria-selected={sidebarMode === "headings"}
                  onClick={() => setSidebarMode("headings")}
                  className={cn(
                    "wfrp-label h-9 w-1/2 cursor-pointer border-l border-black/20 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50",
                    sidebarMode === "headings"
                      ? inlineSubtabButtonActiveClassName
                      : inlineSubtabButtonInactiveClassName,
                  )}
                >
                  Content
                </button>
              ) : null}
            </div>
            <p className="wfrp-label truncate px-2 text-wfrp-muted-text">
              {sidebarMode === "chapters" || !hasToc ? selectedBook.title : selectedChapter.title}
            </p>
            <div className="px-2 pb-2">
              {!hasToc || sidebarMode === "chapters" ? (
                <LibraryNavList
                  ariaLabel="Book chapters"
                  items={selectedBook.chapters.map((chapter) => ({
                    id: chapter.id,
                    label: chapter.title,
                    isActive: chapter.id === selectedChapter.id,
                    onClick: () => {
                      onSelectChapter(chapter.id);
                      setSidebarMode("headings");
                      setIsNavOpen(false);
                    },
                  }))}
                />
              ) : (
                <ChapterTableOfContents
                  headings={headings}
                  title={selectedChapter.title}
                  onSelect={() => setIsNavOpen(false)}
                />
              )}
            </div>
          </div>
        </BottomSheetPaper>
      ) : null}
    </div>
  );
  ```

- [ ] **Step 4: Verify build and lint pass**

  ```bash
  npm run lint && npm run build
  ```

  Expected: no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/library/LibraryPage.tsx
  git commit -m "feat: replace Contents button and prev/next with FAB + unified bottom sheet on mobile"
  ```

---

### Task 2: Update Playwright tests in `library.spec.ts`

**Files:**
- Modify: `tests/library.spec.ts`

**Interfaces:**
- Consumes: FAB `aria-label="Open navigation"`, bottom sheet `data-bottom-sheet-paper="true"`, chapter nav `aria-label="Book chapters"`, content nav `aria-label="Chapter contents"` — all from Task 1.

- [ ] **Step 1: Update the mobile bottom sheet test to use the FAB**

  Replace the test `"chapter table of contents opens as a bottom sheet on mobile"` (lines 92–105) with:

  ```ts
  test("chapter table of contents opens as a bottom sheet on mobile via FAB", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/enemy_within/library/core-rulebook/rules");

    await expect(page.getByRole("navigation", { name: "Chapter contents" })).toBeHidden();
    await page.getByRole("button", { name: "Open navigation" }).click();

    const sheet = page.locator('[data-bottom-sheet-paper="true"]');
    await expect(sheet.getByRole("link", { name: "Combat" })).toBeVisible();

    await sheet.getByRole("link", { name: "Combat" }).click();
    await expect(sheet).toBeHidden();
    await expect(page.locator("#combat")).toBeInViewport();
  });
  ```

- [ ] **Step 2: Update the "no TOC" test — Contents button is gone, FAB is still present**

  Replace the test `"a chapter with fewer than 2 major sections has no table of contents"` (lines 107–112) with:

  ```ts
  test("a chapter with fewer than 2 major sections shows FAB but no Content tab in bottom sheet", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/enemy_within/library/core-rulebook/throwing-bones");

    await expect(page.getByRole("navigation", { name: "Chapter contents" })).toHaveCount(0);

    await page.getByRole("button", { name: "Open navigation" }).click();

    const sheet = page.locator('[data-bottom-sheet-paper="true"]');
    await expect(sheet.getByRole("tab", { name: "Chapters" })).toBeVisible();
    await expect(sheet.getByRole("tab", { name: "Content" })).toHaveCount(0);
  });
  ```

- [ ] **Step 3: Add test for chapter navigation via the FAB Chapters tab**

  Append a new test after the one above:

  ```ts
  test("FAB bottom sheet Chapters tab navigates to another chapter on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/enemy_within/library/core-rulebook/throwing-bones");

    await page.getByRole("button", { name: "Open navigation" }).click();

    const sheet = page.locator('[data-bottom-sheet-paper="true"]');
    await sheet.getByRole("button", { name: "Rules" }).click();

    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL(/\/library\/core-rulebook\/rules$/);
    await expect(page.getByRole("heading", { name: "Rules" })).toBeVisible();
  });
  ```

- [ ] **Step 4: Run the full test suite**

  ```bash
  npm run lint && npm run build && npm test
  ```

  Expected: all tests pass.

- [ ] **Step 5: Commit**

  ```bash
  git add tests/library.spec.ts
  git commit -m "test: update library tests for FAB navigation replacing Contents button and prev/next"
  ```
