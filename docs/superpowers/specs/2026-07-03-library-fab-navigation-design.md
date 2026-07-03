# Library FAB Navigation — Design Spec

**Date:** 2026-07-03  
**Status:** Approved

## Problem

On mobile, chapter navigation in the Library is fragmented and incomplete:

- The header hamburger opens a book-switcher (site-level chrome) — not chapter navigation.
- A "Contents" button appears top-right when a chapter has 2+ H2 headings, opening a bottom sheet with headings only — no chapter list.
- Prev/Next buttons at the bottom are the only way to move between chapters.

The desktop sidebar already solves this well: a sticky card with two tabs — **Chapters** (chapter list) and **Content** (H2 headings) — giving full navigation in one place.

## Solution

Bring the desktop sidebar experience to mobile via a FAB + unified bottom sheet.

## Architecture

### FAB

- Render `<Button variant="fab">` with a `BookOpen` icon directly inside `LibraryPage`, only when a chapter is selected.
- The FAB is `position: fixed` so it floats above content without touching `AppShell`.
- The existing `AppShell` FAB (`mobileAddAction`, used by character sheet pages) is unaffected — no overlap since `LibraryPage` never passes `mobileAddAction`.
- The button has `aria-label="Open navigation"`.

### Bottom Sheet

- `<BottomSheetPaper isPullable>` opened by the FAB.
- Contains the **exact same two-tab structure** as the desktop sidebar:
  - **Chapters tab** — `LibraryNavList` of all chapters in the current book; selecting one navigates and closes the sheet.
  - **Content tab** — `ChapterTableOfContents` (H2 headings); selecting one scrolls to heading and closes the sheet. Only shown if `hasToc` is true.
- Label above the list mirrors desktop: book title on Chapters tab, chapter title on Content tab.

### State changes in `LibraryPage`

- Replace `isContentsOpen: boolean` → `isNavOpen: boolean`.
- Reuse existing `sidebarMode: "headings" | "chapters"` state for tab selection in both desktop and mobile.
- Reset `isNavOpen = false` on chapter change (existing `useEffect` pattern).

### Removals

- Remove the mobile "Contents" button (currently rendered top-right when `hasToc && !lg`).
- Remove the Prev/Next chapter buttons at the bottom on all breakpoints.

## Breakpoints

| Breakpoint | Navigation |
|---|---|
| `< xl` | FAB + bottom sheet |
| `≥ xl` | Desktop sticky sidebar (unchanged) |

The FAB uses the existing `xl:hidden` class already present on `variant="fab"`.

## Files affected

- `src/components/library/LibraryPage.tsx` — primary change: state rename, FAB render, bottom sheet content, remove Contents button and Prev/Next.
- No other files need changes.

## Out of scope

- Desktop sidebar — no changes.
- `AppShell` — no changes.
- `LibraryHeader` — no changes.
- Any future coordination between the library FAB and the character-sheet FAB if both are needed simultaneously.
