# Unified AppHeader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace three separate header implementations (CharacterHeader+MobileCharacterHeader, GameMasterHeader, LibraryHeader) with a single `AppHeader` compound component that handles both mobile and desktop breakpoints.

**Architecture:** `AppHeader` owns the `section` frame, portrait slot, identity slot, a `desktopActions` slot (hidden on mobile), an optional `leadingDesktopActions` slot (for the GM sidebar toggle), and a hamburger button that calls `onMobileMenuOpen`. Callers pass slots as ReactNode and own their own mobile sidebars. `AppHeaderIdentity` is a display-only helper for the name+subtitle typography.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4

## Global Constraints

- Semantic Tailwind tokens only — no hex/RGB. Use `bg-background`, `text-foreground`, `text-wfrp-gold`, etc.
- Use `<Heading>` and `<Text>` from `src/components/ui/` for any headings — never raw `<h1>`–`<h6>`
- Use `Button` with `variant="wfrpIcon"` instead of `WfrpStandardIcon` (it is deprecated)
- No portrait upload, no inline name editing — these are deferred and must NOT be added
- Run `npm run lint && npm run build` before each commit to catch type errors

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/components/ui/AppHeader.tsx` | Unified header shell + AppHeaderIdentity helper |
| Modify | `src/components/ui/index.ts` | Export AppHeader, AppHeaderIdentity |
| Modify | `src/components/CharacterSheetFrame.tsx` | Replace desktopHeader+mobileHeader with single header prop |
| Rewrite | `src/components/CharacterSheetHeader.tsx` | Use AppHeader, remove variant logic, own portrait dropdown |
| Modify | `src/AppComposition.tsx` | Update CharacterSheetFrame + CharacterSheetHeader call sites |
| Delete | `src/components/CharacterHeader.tsx` | Replaced by AppHeader |
| Delete | `src/components/MobileCharacterHeader.tsx` | Replaced by AppHeader |
| Modify | `src/components/GameMasterPage.tsx` | Replace inline GameMasterHeader with AppHeader |
| Rewrite | `src/components/library/LibraryHeader.tsx` | Use AppHeader |

---

## Task 1: Create AppHeader and AppHeaderIdentity

**Files:**
- Create: `src/components/ui/AppHeader.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Produces: `AppHeader` component, `AppHeaderIdentity` component, `AppHeaderProps` type

- [ ] **Step 1: Create `src/components/ui/AppHeader.tsx`**

```tsx
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { Button } from "./button";

export interface AppHeaderProps {
  /** Visual portrait content — image or initial-letter fallback. Display-only. */
  portrait: ReactNode;
  /** If provided, portrait is wrapped in a button and this is called on click. */
  onPortraitClick?: () => void;
  /** Name + subtitle area. Use AppHeaderIdentity for consistent typography. */
  identity: ReactNode;
  /** Rendered as hidden on mobile (sm:flex). Tabs, icon buttons, links, etc. */
  desktopActions?: ReactNode;
  /**
   * Rendered before the portrait, desktop-only (hidden sm:flex).
   * Use for the GM sessions sidebar toggle button.
   */
  leadingDesktopActions?: ReactNode;
  /** Called when the mobile hamburger button is tapped. */
  onMobileMenuOpen: () => void;
}

export function AppHeader({
  portrait,
  onPortraitClick,
  identity,
  desktopActions,
  leadingDesktopActions,
  onMobileMenuOpen,
}: AppHeaderProps) {
  return (
    <section className="flex h-14 max-h-14 items-center gap-3 overflow-visible border-b border-t-4 border-wfrp-border border-b-white/30 border-t-wfrp-red bg-background px-3 py-1">
      {leadingDesktopActions && (
        <div className="hidden shrink-0 sm:flex">
          {leadingDesktopActions}
        </div>
      )}

      {onPortraitClick ? (
        <button
          type="button"
          onClick={onPortraitClick}
          className="wfrp-character-portrait-button h-10 w-10 shrink-0 sm:h-12 sm:w-12"
        >
          {portrait}
        </button>
      ) : (
        <div className="wfrp-character-portrait-control h-10 w-10 shrink-0 sm:h-12 sm:w-12">
          {portrait}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {identity}
      </div>

      {desktopActions && (
        <div className="hidden h-12 items-stretch sm:flex">
          {desktopActions}
        </div>
      )}

      <Button
        variant="wfrpIcon"
        onClick={onMobileMenuOpen}
        aria-label="Open menu"
        aria-haspopup="dialog"
        leadingIcon={<Menu />}
        className="shrink-0 sm:hidden"
      />
    </section>
  );
}
```

- [ ] **Step 2: Create `AppHeaderIdentity` in the same file**

Append to `src/components/ui/AppHeader.tsx`:

```tsx
export interface AppHeaderIdentityProps {
  name: string;
  subtitle?: string;
}

export function AppHeaderIdentity({ name, subtitle }: AppHeaderIdentityProps) {
  return (
    <div className="flex max-h-12 min-w-0 flex-col justify-center overflow-hidden">
      <span className="block truncate font-serif text-base font-semibold leading-tight tracking-tight text-gray-100 sm:text-xl">
        {name}
      </span>
      {subtitle && (
        <span className="block truncate text-[9px] font-semibold uppercase text-wfrp-muted-text sm:text-[10px]">
          {subtitle}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Export from `src/components/ui/index.ts`**

Add after the existing `export { BottomSheetPaper }` line:

```ts
export { AppHeader } from "./AppHeader";
export type { AppHeaderProps } from "./AppHeader";
export { AppHeaderIdentity } from "./AppHeader";
export type { AppHeaderIdentityProps } from "./AppHeader";
```

- [ ] **Step 4: Lint and build**

```sh
npm run lint && npm run build
```

Expected: no errors. The new file is not yet used so nothing should break.

- [ ] **Step 5: Commit**

```sh
git add src/components/ui/AppHeader.tsx src/components/ui/index.ts
git commit -m "feat: add AppHeader unified shell component with AppHeaderIdentity"
```

---

## Task 2: Migrate CharacterSheetFrame to single header slot

`CharacterSheetFrame` currently passes `desktopHeader` wrapped in `hidden md:block` and renders `mobileHeader` unconditionally. Since `AppHeader` handles its own breakpoints, the frame just needs a single `header` slot.

**Files:**
- Modify: `src/components/CharacterSheetFrame.tsx`

**Interfaces:**
- Consumes: nothing from Task 1 (CharacterSheetFrame doesn't import AppHeader)
- Produces: `CharacterSheetFrameProps` with `header: ReactNode` replacing `desktopHeader` + `mobileHeader`

- [ ] **Step 1: Update `CharacterSheetFrameProps` in `src/components/CharacterSheetFrame.tsx`**

Replace the interface (lines 5–15):

```tsx
interface CharacterSheetFrameProps {
  breadcrumbs: ReactNode;
  children: ReactNode;
  header: ReactNode;
  hideMobileNavigation?: boolean;
  onMobileNextView: () => void;
  onMobilePreviousView: () => void;
  mobileTitleAction?: ReactNode;
  mobileTitle: string;
}
```

- [ ] **Step 2: Update the function signature and JSX in `CharacterSheetFrame`**

Replace the destructuring (line 72 onward) and the first `<>` block:

```tsx
export function CharacterSheetFrame({
  breadcrumbs,
  children,
  header,
  hideMobileNavigation = false,
  onMobileNextView,
  onMobilePreviousView,
  mobileTitleAction,
  mobileTitle,
}: CharacterSheetFrameProps) {
  const mobileContentSwipeHandlers = useHorizontalSwipePager({
    onNext: onMobileNextView,
    onPrevious: onMobilePreviousView,
  });

  return (
    <>
      {header}
      {/* rest of the JSX is unchanged */}
```

Remove the old:
```tsx
<div className="hidden md:block">
  {desktopHeader}
</div>
{mobileHeader}
```

Replace with:
```tsx
{header}
```

- [ ] **Step 3: Lint and build**

```sh
npm run lint && npm run build
```

Expected: TypeScript errors in `AppComposition.tsx` because it still passes `desktopHeader` and `mobileHeader`. That's expected — we fix it in the next step.

- [ ] **Step 4: Update `AppComposition.tsx` to use the new `header` prop**

Find the two `<CharacterSheetHeader ... variant="desktop" />` and `<CharacterSheetHeader ... variant="mobile" />` calls inside `<CharacterSheetFrame>` in `AppComposition.tsx` (around line 2124–2161).

Replace the entire `desktopHeader={...} mobileHeader={...}` block with a single `header` prop:

```tsx
<CharacterSheetFrame
  breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
  header={(
    <CharacterSheetHeader
      activeMenuItem={activeMainTab === "dice" ? "dice" : activeMainTab === "career" ? "edit" : "sheet"}
      campaignId={characterData.campaignId}
      characterData={characterData}
      isMobilePortraitMenuOpen={isMobilePortraitMenuOpen}
      onCloseMobilePortraitMenu={() => setIsMobilePortraitMenuOpen(false)}
      onOpenCharacterSheet={() => selectMainTab("skills")}
      onOpenAdvance={openAdvanceView}
      onOpenDice={openDiceLog}
      onOpenMobileCharacterActions={openMobileCharacterActions}
      onOpenMobileGainExperience={openMobileGainExperience}
      onOpenMobileMenu={openMobileMenuSidebar}
      onAwardXp={awardXp}
      xpCurrent={xpCurrent}
    />
  )}
  hideMobileNavigation={showMobileGainExperiencePage || activeMainTab === "dice"}
  mobileTitle={displayedMobilePageTitle}
  onMobileNextView={showMobileGainExperiencePage ? () => setIsMobileGainExperienceOpen(false) : navigateMobileFrameNext}
  onMobilePreviousView={showMobileGainExperiencePage ? () => setIsMobileGainExperienceOpen(false) : navigateMobileFramePrevious}
>
```

Note: `variant` prop is removed — `CharacterSheetHeader` no longer needs it.

- [ ] **Step 5: Lint and build**

```sh
npm run lint && npm run build
```

Expected: still fails because `CharacterSheetHeader` still has `variant` in its props type. That gets fixed in Task 3.

---

## Task 3: Rewrite CharacterSheetHeader, delete old header files

This is the core migration. `CharacterSheetHeader` stops rendering `CharacterHeader` or `MobileCharacterHeader` and instead renders `AppHeader`. The portrait dropdown (formerly in `MobileCharacterHeader`) moves here. The `variant` prop is removed.

**Files:**
- Rewrite: `src/components/CharacterSheetHeader.tsx`
- Delete: `src/components/CharacterHeader.tsx`
- Delete: `src/components/MobileCharacterHeader.tsx`

**Interfaces:**
- Consumes: `AppHeader`, `AppHeaderIdentity` from Task 1
- Produces: `CharacterSheetHeader` without `variant` prop

- [ ] **Step 1: Rewrite `src/components/CharacterSheetHeader.tsx`**

Replace the entire file:

```tsx
import { useState, type FormEvent } from "react";
import { ArrowUpFromLine, Settings, X } from "lucide-react";
import { AppHeader, AppHeaderIdentity } from "./ui/AppHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
  MainTabMenu,
  WfrpStandardIcon,
} from "./ui";
import { LibraryHeaderMenu } from "./LibraryHeaderMenu";
import type { ResolvedCharacterRecord } from "../data/characters/resolved";
import { useGameSessionContext } from "../context/GameSessionContext";
import { UI_LABELS } from "../labels";

const characterMenuOptions = [
  { id: "sheet", label: "Character Sheet" },
  { id: "edit", label: "Edit Character" },
  { id: "dice", label: "Dice Log" },
] as const;

type CharacterSheetHeaderProps = {
  activeMenuItem: "sheet" | "edit" | "dice";
  campaignId: string;
  characterData: ResolvedCharacterRecord;
  isMobilePortraitMenuOpen: boolean;
  onCloseMobilePortraitMenu: () => void;
  onOpenCharacterSheet: () => void;
  onOpenAdvance: () => void;
  onOpenDice: () => void;
  onOpenMobileCharacterActions: () => void;
  onOpenMobileGainExperience: () => void;
  onOpenMobileMenu: () => void;
  onAwardXp: (amount: number) => void;
  xpCurrent: number;
};

export function CharacterSheetHeader({
  activeMenuItem,
  campaignId,
  characterData,
  isMobilePortraitMenuOpen,
  onCloseMobilePortraitMenu,
  onOpenCharacterSheet,
  onOpenAdvance,
  onOpenDice,
  onOpenMobileCharacterActions,
  onOpenMobileGainExperience,
  onOpenMobileMenu,
  onAwardXp,
  xpCurrent,
}: CharacterSheetHeaderProps) {
  const { portraitDataUrl } = useGameSessionContext();
  const [isXpDialogOpen, setIsXpDialogOpen] = useState(false);
  const [xpGainDraft, setXpGainDraft] = useState("");
  const xpGainAmount = Math.max(0, Math.floor(Number(xpGainDraft) || 0));

  const openXpDialog = () => {
    onCloseMobilePortraitMenu();
    setXpGainDraft("");
    setIsXpDialogOpen(true);
  };

  const handleAwardXp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (xpGainAmount <= 0) return;
    onAwardXp(xpGainAmount);
    setXpGainDraft("");
    setIsXpDialogOpen(false);
  };

  const portrait = portraitDataUrl ? (
    <img
      src={portraitDataUrl}
      alt="Portrait"
      width={48}
      height={48}
      className="wfrp-character-portrait-image"
    />
  ) : (
    <span aria-hidden="true" className="wfrp-character-portrait-fallback text-xs">
      {characterData.name.charAt(0)}
    </span>
  );

  return (
    <>
      <div className="relative">
        <AppHeader
          portrait={portrait}
          onPortraitClick={onOpenMobileCharacterActions}
          identity={
            <AppHeaderIdentity
              name={characterData.name}
              subtitle={`XP ${xpCurrent}/${characterData.xpTotal}`}
            />
          }
          desktopActions={(
            <>
              <MainTabMenu<"sheet" | "edit" | "dice">
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
                onClick={openXpDialog}
                aria-current={isXpDialogOpen ? "page" : undefined}
                className={isXpDialogOpen ? "text-white" : undefined}
              />
            </>
          )}
          onMobileMenuOpen={onOpenMobileMenu}
        />

        {isMobilePortraitMenuOpen && (
          <div
            className="absolute left-3 top-[calc(100%+0.5rem)] z-40 min-w-44 overflow-hidden rounded border border-wfrp-border bg-wfrp-popover shadow-2xl sm:hidden"
            role="menu"
            aria-label="Character actions"
          >
            <button
              type="button"
              onClick={onOpenAdvance}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left wfrp-label text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
              role="menuitem"
            >
              <span>Edit Character</span>
              <ArrowUpFromLine size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onOpenMobileGainExperience}
              className="flex w-full items-center justify-between gap-3 border-t border-white/5 px-4 py-3 text-left wfrp-label text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
              aria-label={`Gain Experience (${xpCurrent}/${characterData.xpTotal} XP)`}
              role="menuitem"
            >
              <span>Gain Experience</span>
              <ArrowUpFromLine size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onCloseMobilePortraitMenu}
              className="flex w-full items-center gap-3 border-t border-white/5 px-4 py-3 text-left wfrp-label text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
              role="menuitem"
            >
              <Settings size={14} />
              Settings
            </button>
          </div>
        )}
      </div>

      <Dialog open={isXpDialogOpen} onOpenChange={setIsXpDialogOpen}>
        <DialogContent className="max-w-sm">
          <form onSubmit={handleAwardXp} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Gain XP</DialogTitle>
              <DialogDescription>
                How much XP did you gain?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <label htmlFor="xp-gain-amount" className="wfrp-label text-wfrp-muted-text">
                XP gained
              </label>
              <Input
                id="xp-gain-amount"
                autoFocus
                inputMode="numeric"
                min={1}
                step={1}
                type="number"
                value={xpGainDraft}
                onChange={(event) => setXpGainDraft(event.target.value)}
                aria-label="XP gained"
              />
              <div className="wfrp-text-strong text-wfrp-muted-text">
                Current: {xpCurrent}/{characterData.xpTotal}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                name="Cancel"
                onClick={() => setIsXpDialogOpen(false)}
                leadingIcon={<X size={14} />}
              />
              <Button
                type="submit"
                name="Add XP"
                disabled={xpGainAmount <= 0}
                isGolden={xpGainAmount > 0}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Delete `src/components/CharacterHeader.tsx`**

```sh
rm src/components/CharacterHeader.tsx
```

- [ ] **Step 3: Delete `src/components/MobileCharacterHeader.tsx`**

```sh
rm src/components/MobileCharacterHeader.tsx
```

- [ ] **Step 4: Lint and build**

```sh
npm run lint && npm run build
```

Expected: clean. If any import of `CharacterHeader` or `MobileCharacterHeader` remains elsewhere, fix it.

- [ ] **Step 5: Run header-xp tests**

```sh
npx playwright test tests/header-xp.spec.ts --reporter=line
```

Expected: both tests pass. The XP display (`XP 1050/1050`) and Gain XP dialog flow must still work.

- [ ] **Step 6: Commit**

```sh
git add src/components/CharacterSheetHeader.tsx src/components/CharacterSheetFrame.tsx src/AppComposition.tsx
git rm src/components/CharacterHeader.tsx src/components/MobileCharacterHeader.tsx
git commit -m "feat: migrate character header to unified AppHeader"
```

---

## Task 4: Migrate GameMasterPage header

Replace the inline `GameMasterHeader` function in `GameMasterPage.tsx` with `AppHeader`.

**Files:**
- Modify: `src/components/GameMasterPage.tsx`

**Interfaces:**
- Consumes: `AppHeader`, `AppHeaderIdentity` from Task 1

- [ ] **Step 1: Add imports at the top of `GameMasterPage.tsx`**

Add to existing imports:

```tsx
import { AppHeader, AppHeaderIdentity } from "./ui/AppHeader";
import gmPortrait from "../../public/gm-portrait.webp";
```

Wait — `public/` assets are referenced by URL path, not import. Keep it as a string:

```tsx
import { AppHeader, AppHeaderIdentity } from "./ui/AppHeader";
```

The portrait image stays as `src="/gm-portrait.webp"`.

Also add `PanelLeftClose` and `PanelLeftOpen` to the existing lucide-react import (they are already imported).

- [ ] **Step 2: Remove the `GameMasterHeader` function**

Delete the entire `GameMasterHeader` function (lines 118–176 in the original file):

```tsx
// DELETE this entire function:
function GameMasterHeader({
  campaignName,
  isSessionsSidebarOpen,
  onToggleSessions,
  onOpenMobileMenu,
}: { ... }) {
  return ( ... );
}
```

- [ ] **Step 3: Replace the `<GameMasterHeader>` call site inside `GameMasterPage`**

Find this in `GameMasterPage`'s `AppShell` render:

```tsx
header={(
  <GameMasterHeader
    campaignName={campaignName}
    isSessionsSidebarOpen={isSessionsSidebarOpen}
    onToggleSessions={() => onSessionsSidebarOpenChange(!isSessionsSidebarOpen)}
    onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
  />
)}
```

Replace with:

```tsx
header={(
  <AppHeader
    portrait={(
      <img
        src="/gm-portrait.webp"
        alt=""
        className="wfrp-character-portrait-image"
      />
    )}
    identity={<AppHeaderIdentity name={campaignName} subtitle="Campaign View" />}
    leadingDesktopActions={(
      <Button
        variant="wfrpIcon"
        onClick={() => onSessionsSidebarOpenChange(!isSessionsSidebarOpen)}
        aria-label={isSessionsSidebarOpen ? "Close sessions menu" : "Open sessions menu"}
        aria-expanded={isSessionsSidebarOpen}
        title={isSessionsSidebarOpen ? "Close sessions menu" : "Open sessions menu"}
        leadingIcon={isSessionsSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
      />
    )}
    onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
  />
)}
```

Note: the GM header uses `bg-sidebar` today but `AppHeader` uses `bg-background`. This is an intentional design unification per the spec.

- [ ] **Step 4: Lint and build**

```sh
npm run lint && npm run build
```

Expected: clean.

- [ ] **Step 5: Run gamemaster tests**

```sh
npx playwright test tests/gamemaster.spec.ts --reporter=line
```

Expected: all pass.

- [ ] **Step 6: Commit**

```sh
git add src/components/GameMasterPage.tsx
git commit -m "feat: migrate GameMasterPage header to unified AppHeader"
```

---

## Task 5: Migrate LibraryHeader

Replace `LibraryHeader.tsx` content with an `AppHeader`-based implementation. The book-cover portrait is a navigate-home button. The mobile sidebar stays as an `AppSidebar` owned by LibraryHeader.

**Files:**
- Rewrite: `src/components/library/LibraryHeader.tsx`

**Interfaces:**
- Consumes: `AppHeader`, `AppHeaderIdentity` from Task 1

- [ ] **Step 1: Rewrite `src/components/library/LibraryHeader.tsx`**

Replace the entire file:

```tsx
import { useState } from "react";
import { bookCatalog } from "../../data/books";
import libraryCover from "../../data/books/library-cover.webp";
import { AppSidebar } from "../sidebar/AppSidebar";
import { MainTabMenu } from "../ui";
import { AppHeader, AppHeaderIdentity } from "../ui/AppHeader";

const bookOptions = bookCatalog.map((book) => ({ id: book.id, label: book.title }));

export function LibraryHeader({
  bookId,
  campaignName,
  onSelectBook,
  onNavigateHome,
}: {
  bookId: string | null;
  campaignName: string;
  onSelectBook: (bookId: string | null) => void;
  onNavigateHome: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <AppHeader
        portrait={(
          <img
            src={libraryCover}
            alt=""
            className="h-full w-full rounded-sm object-cover shadow-sm"
          />
        )}
        onPortraitClick={onNavigateHome}
        identity={(
          <button
            type="button"
            onClick={onNavigateHome}
            className="min-w-0 w-full text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
          >
            <AppHeaderIdentity name={campaignName} />
          </button>
        )}
        desktopActions={(
          <MainTabMenu
            activeId={bookId ?? ""}
            ariaLabel="Library books"
            options={bookOptions}
            onChange={onSelectBook}
          />
        )}
        onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
      />

      <AppSidebar
        isOpen={isMobileMenuOpen}
        motionKey="library-mobile-menu"
        onClose={() => setIsMobileMenuOpen(false)}
        overlayUntil="desktop"
        side="right"
        title="Library"
        titleId="library-mobile-menu-title"
        closeLabel="Close library menu"
        contentClassName="!p-0"
        trapFocus
        closeOnOutsidePointerDown
      >
        <nav aria-label="Library books" className="divide-y divide-white/5">
          {bookCatalog.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => {
                onSelectBook(book.id);
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left wfrp-label text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50"
            >
              {book.title}
            </button>
          ))}
        </nav>
      </AppSidebar>
    </>
  );
}
```

- [ ] **Step 2: Lint and build**

```sh
npm run lint && npm run build
```

Expected: clean.

- [ ] **Step 3: Run library tests**

```sh
npx playwright test tests/library.spec.ts --reporter=line
```

Expected: all pass.

- [ ] **Step 4: Run full test suite**

```sh
npm run lint && npm run build && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```sh
git add src/components/library/LibraryHeader.tsx
git commit -m "feat: migrate LibraryHeader to unified AppHeader"
```

---

## Self-Review

**Spec coverage:**
- ✅ `AppHeader` created with portrait, identity, desktopActions, leadingDesktopActions, onMobileMenuOpen slots
- ✅ `AppHeaderIdentity` helper for name+subtitle typography
- ✅ `CharacterHeader.tsx` deleted
- ✅ `MobileCharacterHeader.tsx` deleted
- ✅ `GameMasterHeader` inline function removed
- ✅ `LibraryHeader.tsx` rewritten around AppHeader
- ✅ Portrait upload and name editing NOT added (deferred per spec)
- ✅ `LibraryHeaderMenu` (opens library in new tab) kept in `desktopActions` slot — no changes needed
- ✅ `AppHeader` exported from `src/components/ui/index.ts`

**Type consistency:**
- `AppHeader` props: `portrait`, `onPortraitClick?`, `identity`, `desktopActions?`, `leadingDesktopActions?`, `onMobileMenuOpen` — used consistently across Tasks 3, 4, 5
- `AppHeaderIdentity` props: `name`, `subtitle?` — used consistently in Tasks 3, 4, 5
- `CharacterSheetFrame` prop rename: `header` replaces `desktopHeader`+`mobileHeader` — updated in both the component (Task 2 Step 1–2) and its call site (Task 2 Step 4)
- `CharacterSheetHeader` `variant` prop removed — call site in AppComposition updated in Task 2 Step 4

**No placeholders found.**
