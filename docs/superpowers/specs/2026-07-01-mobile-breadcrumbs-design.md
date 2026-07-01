# Mobile-collapsed breadcrumbs design

## Purpose

On mobile, the shared `Breadcrumbs` component renders the full crumb chain inline (e.g. `Campaign > Character > Section > Subsection`), which wraps or crowds the narrow viewport. Collapse the mobile presentation to three segments — a menu trigger, the parent page, and the current page — while a dropdown behind the trigger still surfaces the full ancestor path.

## Scope

**In scope:**
- `src/components/ui/Breadcrumbs.tsx` only. Both existing consumers (`CharacterSheetFrame` via `AppComposition.tsx`, and `GameMasterPage.tsx`) pick up the change automatically since they already pass `items: BreadcrumbItem[]` through this one component.
- Mobile-only (`below md`) visual collapse. Desktop (`md:` and up) is unchanged.

**Out of scope:**
- Any change to how callers build their `items` arrays.
- Introducing a routing library — navigation continues to use each item's existing `href`/`onClick` pair, the same mechanism the crumbs already use today.

## Behavior

**Desktop (`md:` and up):** unchanged — full chain rendered inline, exactly as today.

**Mobile (below `md`):** `[⋮] > parent > current`

- **Trigger:** `EllipsisVertical` icon (lucide-react), styled with the existing `wfrp-standard-icon` class — the same trigger pattern already used by `SceneActionsMenu.tsx`. Built from the existing `DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuContent` / `DropdownMenuItem` primitives in `src/components/ui/dropdown-menu.tsx` (open state, click-outside, and Escape handling already implemented there — no new logic needed).
- **Dropdown contents:** ancestor links only, i.e. `items[0]` through `items[length - 2]`, in order (root/home first). The current page (`items[length - 1]`) is **not** repeated in the dropdown, since it's already shown outside the menu as its own segment.
- **Parent segment:** `items[length - 2]`, rendered as a clickable link — same link styling as today's non-current crumbs.
- **Current segment:** `items[length - 1]`, bold, `aria-current="page"`, non-interactive — identical styling to today.
- **Separators:** `ChevronRight`, same as today, placed between trigger/parent and parent/current.

**Edge cases:**
- `items.length === 1`: render just the current label. No trigger, no parent, no separators (nothing to collapse or navigate to).
- `items.length === 2`: trigger's dropdown contains a single entry (`items[0]`, the root). The parent segment shown next to current *also* is `items[0]` — this overlap is expected and acceptable, not a bug.

## Testing

- Existing Playwright suite: extend or add a mobile-viewport test that opens a character sheet (or the Game Master page) breadcrumb trail, confirms the parent/current segments render and the current one is non-interactive, opens the dropdown, and confirms it lists the ancestor links (and does not list the current page).
- `npm run lint && npm run build && npm test` must pass.
