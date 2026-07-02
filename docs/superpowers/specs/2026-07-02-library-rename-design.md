# Library rename & relocation — design spec

Date: 2026-07-02

## Summary

Rename the "Books" feature to "Library", relocate it from a per-character tab to a campaign-level page reachable from the landing page, and give it its own URL independent of any character. Add library-access affordances to the character-page header (desktop dropdown) and mobile menu (accordion), both opening the library/books in a new tab.

## Current state (for reference)

- `MainTab`/`MobileMainView` includes `"books"` as a sibling of `skills`, `inventory`, etc. ([src/tabs/tabTypes.ts](../../../src/tabs/tabTypes.ts))
- URL: `/{campaignId}/{characterSlug}/books/{bookId?}/{chapterId?}`, parsed/built in [src/lib/campaignRoutes.ts](../../../src/lib/campaignRoutes.ts)
- UI: [src/tabs/BooksTab.tsx](../../../src/tabs/BooksTab.tsx) wraps [src/components/books/BooksLibrary.tsx](../../../src/components/books/BooksLibrary.tsx), which reads the campaign-agnostic `bookCatalog` from `src/data/books`
- Entry points: [src/components/CharacterHeader.tsx](../../../src/components/CharacterHeader.tsx) (desktop tab button) and [src/components/sidebar/MobileMenuSidebar.tsx](../../../src/components/sidebar/MobileMenuSidebar.tsx) (mobile sidebar button), both calling `selectMainTab("books")` in [src/AppComposition.tsx](../../../src/AppComposition.tsx)
- The app has no React Router; routing is manual `window.history` sync (see `isLandingPageOpen` / `isGameMasterOpen` pattern in AppComposition.tsx, and the `/campaign` GM route as prior art for a campaign-level, non-character route)

## Target state

### 1. Routing

New campaign-level route, parallel to the existing `/{campaignId}/campaign` (GM) route:

- `/{campaignId}/library` — library overview (book list)
- `/{campaignId}/library/{bookId}` — book's chapter list
- `/{campaignId}/library/{bookId}/{chapterId}` — chapter reader

Add `isLibraryOpen` state in `AppComposition.tsx`, derived from pathname (mirrors `isGameMasterOpen`'s `pathname.includes("/campaign")` check). Add `parseCampaignLibraryPath` / `buildCampaignLibraryPath` helpers in `campaignRoutes.ts`, separate from `parseCampaignCharacterPath` since the library is no longer nested under a character.

Remove `"books"` from `MobileMainView`/`MainTab`, `characterViewPathSegments`, `viewAliases`, and `mainTabByCharacterView`. The old `/{campaignId}/{characterSlug}/books/...` route no longer exists — visiting it should fall back to the character's default view (no redirect needed, just let existing "unknown view" handling apply, matching how invalid views already resolve today).

### 2. Rename

- User-facing label: "Books" → "Library" everywhere it appears in UI text.
- File/identifier renames: `BooksTab.tsx` → `LibraryTab.tsx`, `components/books/` → `components/library/`, `BooksLibrary.tsx` → `LibraryPage.tsx`. URL slug `books` → `library`.
- `bookCatalog`, `bookCovers`, `loadChapterContent`, `BookMeta`, and the rest of `src/data/books/**` are left as-is — they're data, not the UI/route layer, and "book" terminology there is accurate (the library contains books).
- `LibraryPage`'s internal props (`bookId`, `chapterId`, `onSelectBook`, `onSelectChapter`) keep their existing shape; it becomes a standalone page instead of a tab embedded in the character view.

### 3. Landing page — Library card

In `src/components/LandingPage.tsx`, add a new card using the existing `.wfrp-landing-character-card` styling, alongside the Game Master and character cards. Clicking it navigates to `/{campaignId}/library` (overview). Plain link — no dropdown, no external-link icon, no book list here.

### 4. Character header (desktop) — dropdown

In `CharacterHeader.tsx`, the header menu's "Books" entry becomes "Library" and turns into a dropdown trigger, built with the existing `WfrpDropdownMenu*` components (`src/components/ui/WfrpDropdownMenu.tsx`). Opening it shows:

- A top row linking to the library overview.
- One row per book from `bookCatalog`.

Every row has a trailing `ExternalLink` icon (lucide-react), styled like the existing pattern in `src/components/wfrp/WfrpPlayerCard.tsx` (`size={12}`, `text-wfrp-muted-text/30` → `group-hover:text-wfrp-muted-text/70`). Every row is a plain link (`<a target="_blank" rel="noopener noreferrer">`) that opens the corresponding library URL in a new tab — nothing here navigates the current tab away from the character.

### 5. Mobile menu sidebar — accordion

In `MobileMenuSidebar.tsx`, "Library" becomes an expandable row (accordion/fold-out) instead of a single button. Expanding it in place reveals the same list as the desktop dropdown: an overview row plus one row per book, each with its own external-link icon, each opening in a new tab.

## Out of scope

- Any change to `src/data/books/**` content, chapter markdown, or the book catalog structure.
- Any change to GM-session routing (`/campaign`) beyond using it as a reference pattern.
- Persisting "last viewed book" or similar state — not needed given the per-row external-link design.

## Testing

- Playwright: cover navigating to `/{campaignId}/library`, `/{campaignId}/library/{bookId}`, `/{campaignId}/library/{bookId}/{chapterId}` directly by URL; landing-page card navigation; character-header dropdown links opening in a new tab (`target="_blank"` assertion); mobile accordion expand/collapse and link behavior.
- Verify the old `/{campaignId}/{characterSlug}/books` URL no longer parses as a books view (falls back to default character view).
