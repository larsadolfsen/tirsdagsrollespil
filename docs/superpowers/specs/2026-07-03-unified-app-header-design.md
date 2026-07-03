# Unified AppHeader Design

**Date:** 2026-07-03  
**Status:** Approved

## Problem

The app has three page types (character, GM, library) each with their own header components. The character page is the worst offender: it maintains two separate components (`CharacterHeader` and `MobileCharacterHeader`) that coexist in the DOM at the same time, one shown on desktop and one on mobile. GM and library already use a single component each, but all three repeat the same `section.h-14.border-t-4…` shell independently.

The goal is one `AppHeader` component that handles all three page types and both breakpoints.

## Solution: Compound component with slots (Option B)

`AppHeader` owns the invariant frame and wires up the mobile menu pattern. Page-specific content is passed via typed props/slots.

## Component API

```tsx
// src/components/ui/AppHeader.tsx

<AppHeader
  portrait={ReactNode}           // img or initial-letter fallback, display-only
  onPortraitClick?: () => void   // optional — opens character action menu on mobile
  identity={ReactNode}           // name + subtitle, read-only
  desktopActions?: ReactNode     // hidden on mobile; tabs, icon buttons, etc.
  onMobileMenuOpen: () => void   // called when hamburger is tapped
/>
```

`AppHeader` renders:
- The `section` shell: `h-14 border-b border-t-4 border-wfrp-border border-b-white/30 border-t-wfrp-red bg-background px-3 py-1`
- **Left:** `portrait` slot (always visible, 10×10 / 12×12 at sm)
- **Middle-left:** `identity` slot (name + subtitle text, truncated)
- **Middle-right / right:** `desktopActions` slot (`hidden sm:flex`, right-aligned)
- **Far right (mobile only):** hamburger icon button (`sm:hidden`) that calls `onMobileMenuOpen`

`AppHeader.Identity` is a presentational helper:

```tsx
<AppHeader.Identity
  name="Aldric Steinhauer"
  subtitle="XP 120/450"          // or "Campaign View" or campaign name
/>
```

No state, no file inputs, no inline editing — display-only.

### What is NOT in AppHeader

- Portrait upload / file input — removed from header, to be added elsewhere later
- Inline name editing — removed from header, to be added elsewhere later
- Mobile action dropdown (portrait menu) — moved to caller as `mobileMenuContent` passed into an `AppSidebar` managed by the caller, triggered via `onPortraitClick`

## Migration: replacing the existing headers

| Current file | Disposition |
|---|---|
| `src/components/CharacterHeader.tsx` | Deleted |
| `src/components/MobileCharacterHeader.tsx` | Deleted |
| `GameMasterHeader` (inline in `GameMasterPage.tsx`) | Replaced inline with `<AppHeader>` |
| `src/components/library/LibraryHeader.tsx` | Rewritten to wrap `<AppHeader>` |

### Character page (`AppComposition.tsx`)

Replaces the dual `<CharacterHeader>` / `<MobileCharacterHeader>` render with a single:

```tsx
<AppHeader
  portrait={portraitDataUrl
    ? <img src={portraitDataUrl} … />
    : <span>{characterData.name.charAt(0)}</span>}
  onPortraitClick={openMobileCharacterActions}
  identity={<AppHeader.Identity name={characterData.name} subtitle={`XP ${xpCurrent}/${characterData.xpTotal}`} />}
  desktopActions={<>
    <MainTabMenu … />
    <LibraryHeaderMenu campaignId={campaignId} />
    <WfrpStandardIcon label="Gain Experience" … />
  </>}
  onMobileMenuOpen={openMobileMenuSidebar}
/>
```

The portrait action dropdown (Edit Character, Gain Experience, Settings) moves into the existing `MobileMenuSidebar` or stays as a small popover anchored to the portrait — caller decides.

### GM page (`GameMasterPage.tsx`)

`GameMasterHeader` function (currently inline) is replaced by:

```tsx
<AppHeader
  portrait={<img src="/gm-portrait.webp" … />}
  identity={<AppHeader.Identity name={campaignName} subtitle="Campaign View" />}
  desktopActions={<Button … onClick={onToggleSessions} />}
  onMobileMenuOpen={onOpenMobileMenu}
/>
```

### Library page (`LibraryHeader.tsx`)

```tsx
<AppHeader
  portrait={<img src={libraryCover} … />}
  identity={<AppHeader.Identity name={campaignName} subtitle="Library" />}
  desktopActions={<MainTabMenu activeId={bookId ?? ""} options={bookOptions} … />}
  onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
/>
```

The `AppSidebar` for the mobile book list stays in `LibraryHeader.tsx` below the `<AppHeader>` call.

## Files changed

**New:**
- `src/components/ui/AppHeader.tsx` — the unified component

**Deleted:**
- `src/components/CharacterHeader.tsx`
- `src/components/MobileCharacterHeader.tsx`

**Modified:**
- `src/components/ui/index.ts` — export `AppHeader`
- `src/AppComposition.tsx` — swap dual headers for `<AppHeader>`
- `src/components/GameMasterPage.tsx` — remove `GameMasterHeader`, use `<AppHeader>`
- `src/components/library/LibraryHeader.tsx` — rewrite around `<AppHeader>`

## Out of scope

- Portrait upload UI (deferred)
- Inline name editing (deferred)
- Any sidebar, tab, or page layout changes
