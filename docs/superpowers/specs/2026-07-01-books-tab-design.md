# Books tab design

## Purpose

Players need to read WFRP rulebook content during play without leaving the app. Add a new "Books" tab to the character sheet's existing tab strip (alongside Skills, Actions, Inventory, Spells, Talents, Journal) that lets a player browse a library of books, drill into a book's chapters, and read a chapter's content.

This feature is **not** tied to character data — it's a static reference library, identical for every character.

## Scope

**In scope:**
- A "Books" tab in the character sheet tab strip.
- A book list → chapter list → chapter reader navigation flow.
- One book (WFRP 4E Core Rulebook) with its real chapter list, but only one chapter ("Throwing Bones") populated with real, hand-cleaned content. Remaining chapters get a placeholder body so the full navigation is provably working.
- Markdown-based content storage and rendering, styled through existing project UI components.

**Out of scope (deferred):**
- Cleaning/importing the full rulebook text (source PDF-extracted markdown has interleaved-column corruption and needs a dedicated cleanup pass).
- A landing-page (pre-character-selection) entry point for Books.
- Search across books/chapters.
- Deep-linking to a specific book/chapter via URL (the tab itself is deep-linkable like other tabs; the book/chapter selection within it is not).

## Data layer

- `src/data/books/types.ts`
  - `ChapterMeta = { id: string; title: string }`
  - `BookMeta = { id: string; title: string; chapters: ChapterMeta[] }`
  - `loadChapterContent(bookId: string, chapterId: string): Promise<string>` — built on Vite's `import.meta.glob('./**/*.md', { query: '?raw', import: 'default' })` so chapter bodies are fetched lazily, only when opened.
- `src/data/books/core-rulebook/index.ts` — exports the `BookMeta` for the Core Rulebook: id `core-rulebook`, and the ordered chapter list matching the source file's top-level headings (Throwing Bones, Game Text, Character, Class and Careers, Skills and Talents, Rules, Between Adventures, Religion and Belief, Magic, The Gamemaster, The Consumers' Guide, Bestiary).
- `src/data/books/core-rulebook/*.md` — one file per chapter, filename matching chapter id (kebab-case). Only `throwing-bones.md` has hand-cleaned real content; the rest contain a one-line placeholder: `_Content coming soon._`
- `src/data/books/index.ts` — exports `bookCatalog: BookMeta[]`, currently `[coreRulebookMeta]`.

## Components

- `src/components/books/MarkdownContent.tsx` — wraps `<ReactMarkdown remarkPlugins={[remarkGfm]}>` with a `components` map:
  - `h1`-`h6` → `Heading` (with an appropriate `variant`, e.g. `section`/`subsection`)
  - `p` → `Text`
  - `table`/`thead`/`tbody`/`tr`/`th`/`td` → the existing `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `src/components/ui/table.tsx`
  - `ul`/`ol`/`li` → plain elements styled to match existing sheet-panel text conventions
  - No raw HTML passthrough (no `rehype-raw`), so this can't inject arbitrary markup.
- `src/components/books/BooksLibrary.tsx` — the tab's core logic and UI. Owns local state:
  - `selectedBookId: string | null`
  - `selectedChapterId: string | null`

  Renders one of three views based on that state:
  1. **Book list** (both null): a card per entry in `bookCatalog`, click sets `selectedBookId`.
  2. **Chapter list** (book selected, no chapter): book title + ordered chapter rows (using the existing `SheetDataSection`/`SheetDataRow` patterns already used by other tabs like Notes/Journal), a "back to books" action, click a row sets `selectedChapterId`.
  3. **Chapter reader** (both selected): chapter title, loads and renders the chapter's markdown via `MarkdownContent`, prev/next chapter buttons (disabled at the ends), and a "back to chapters" action.

  Chapter content loading uses `loadChapterContent`, shown behind a simple loading state consistent with the app's existing `TabLoadingFallback`/lazy-tab conventions.
- `src/tabs/BooksTab.tsx` — trivial wrapper: `export function BooksTab() { return <BooksLibrary />; }`. No props — the tab needs nothing from character state.

## Integration points

- `src/tabs/tabTypes.ts` — add `"books"` to the `MainTab` union.
- `src/tabs/tabOptions.ts` — add `{ id: "books", label: "Books" }` to `mainTabOptions`.
- `src/tabs/index.ts` — export `BooksTab`.
- `src/lib/campaignRoutes.ts` — add a `books` entry to `characterViewPathSegments`, `viewAliases`, and `mainTabByCharacterView` so `/books` works as a normal deep-linkable tab URL, matching the existing tabs.
- `src/AppComposition.tsx` — add `{activeMainTab === 'books' && <BooksTab />}` alongside the existing tab render blocks (~line 2318-2328 area). No new state or props needed in `AppComposition` itself.

## New dependency

`react-markdown` + `remark-gfm`. Both are small, well-maintained, and avoid `dangerouslySetInnerHTML` — markdown is parsed into a React element tree, not raw HTML.

## Testing

- Existing Playwright suite: add a test that opens a character, navigates to the Books tab, opens the Core Rulebook, opens "Throwing Bones", verifies rendered content (e.g. a known heading/paragraph text), navigates back, and confirms tab strip / lint / build all still pass.
- `npm run lint && npm run build` must pass with the new dependency and files.
