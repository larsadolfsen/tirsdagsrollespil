# Chapter page design

## Purpose

Follow-on to [`2026-07-01-books-tab-design.md`](2026-07-01-books-tab-design.md), which explicitly deferred URL deep-linking for book/chapter selection. This spec covers:

1. URLs that reflect the selected book and chapter.
2. An in-chapter table of contents (H2 sections) inside the content area.
3. Correct H1→H6 heading semantics, with the chapter title as the page's H1.
4. Zebra-striped tables.

## Scope

**In scope:**
- Extending the existing manual URL routing (`campaignRoutes.ts` / `useCampaignRouteSync.ts`) to carry book and chapter slugs.
- Replacing `BooksLibrary`'s local `useState`-driven navigation with URL-derived state.
- A 280px-wide table-of-contents column, scoped to the chapter content area (not app-level page chrome), listing the chapter's H2 headings, click-to-scroll.
- Mobile: TOC becomes a `BottomSheetPaper` triggered by a "Contents" button.
- Heading level corrections in `MarkdownContent.tsx` and the chapter title in `BooksLibrary.tsx`.
- Zebra striping in `src/components/ui/table.tsx`.

**Out of scope (deferred):**
- Breadcrumbs reflecting book/chapter (explicitly deferred by user request — keep this change scoped to the four items above).
- Scroll-spy / active-section highlighting while scrolling.
- Search across books/chapters.

## A. URL routing

Extends the existing manual path-parsing system rather than introducing a router — the app has no router dependency today, and this keeps books consistent with how skills/inventory/etc. already work.

- Route pattern grows to: `/:campaignId/:characterSlug/books/:bookSlug/:chapterSlug`, with both new segments optional:
  - `/:campaignId/:characterSlug/books` — book catalog
  - `/:campaignId/:characterSlug/books/:bookSlug` — chapter list for that book
  - `/:campaignId/:characterSlug/books/:bookSlug/:chapterSlug` — chapter reader
- `bookSlug` / `chapterSlug` map directly to existing `book.id` / `chapter.id` values (already slug-shaped: `core-rulebook`, `rules`, `magic`, ...) — no new slugify logic needed.
- `campaignCharacterRoutePattern` in `campaignRoutes.ts` gains two more optional capture groups (only meaningful when `view === "books"`); `parseCampaignCharacterPath` returns `bookId`/`chapterId` alongside the existing fields. `buildCampaignCharacterPath` gains optional `bookId`/`chapterId` params.
- `BooksLibrary.tsx`'s `selectedBookId`/`selectedChapterId` `useState` are replaced by values derived from the parsed route (via `useCampaignRouteSync`-style push/replace calls), following the same pattern as `selectCharacter`/`selectMainTab`.
- Invalid book/chapter slugs (stale URL, deleted chapter) fall back to the book catalog view rather than erroring.
- Prev/Next chapter buttons and the "back to chapters"/"back to books" actions push the corresponding URL.

## B. In-content table of contents

- A 280px-wide column lives **inside the chapter content area's own container** (e.g. `grid-cols-[280px_1fr]` on the chapter view wrapper), not as app-level page chrome like `AppSidebar`. It scrolls with the article — it is not pinned/sticky.
- Lists every H2 (`##`) heading in the current chapter's markdown, in document order.
- Headings are given stable slug ids (a slugger run once per chapter render, in document order, shared between TOC extraction and the rendered heading elements so ids match 1:1).
- Clicking a TOC entry scrolls to that heading's anchor; it does not change the URL (in-chapter navigation only, no scroll-spy).
- Chapters with fewer than 2 H2 headings render without the TOC column (nothing useful to show).
- Mobile: the 280px column is replaced by a "Contents" button near the chapter title that opens a `BottomSheetPaper` (reusing the app's existing bottom-sheet component) listing the same H2 links; selecting one scrolls and closes the sheet.

## C. Heading hierarchy

`MarkdownContent.tsx`'s heading map and `BooksLibrary.tsx`'s chapter title both change `level` only — `variant` (which controls actual visual style) is untouched, so nothing changes visually, only semantics/nesting:

| Source | Current | New |
|---|---|---|
| Chapter title (catalog metadata, rendered in `BooksLibrary.tsx`) | `level={2}` | `level={1}` |
| Markdown `##` (chapter's top sections — what the TOC lists) | `level={4}` | `level={2}` |
| Markdown `###` | `level={5}` | `level={3}` |
| Markdown `####` | `level={6}` | `level={4}` |
| Markdown `#####` | `level={6}` | `level={5}` |
| Markdown `######` | `level={6}` | `level={6}` |
| Markdown `#` (unused in source content today) | `level={3}` | `level={2}` (treated as a top section, same as `##`) |

## D. Table striping

- `TableRow`/`TableBody` in `src/components/ui/table.tsx` get zebra striping on even rows within `tbody` only (header row unaffected), e.g. `[&_tr:nth-child(even)]:bg-muted/10`, layered under the existing `hover:bg-muted/50`. Exact shade tuned visually in-browser against the app's dark theme.

## Testing

- Extend the existing Playwright suite (from the prior Books spec): navigate directly to a chapter URL (deep link) and confirm the correct book/chapter renders; click a TOC entry and confirm the view scrolls to the target heading; resize to mobile and confirm the TOC opens as a bottom sheet; verify browser back/forward (popstate) moves between chapter/book/catalog views correctly.
- `npm run lint && npm run build && npm test` must pass.
