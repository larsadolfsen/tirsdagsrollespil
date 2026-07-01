# Mobile-collapsed breadcrumbs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On mobile, collapse the shared `Breadcrumbs` component to a three-dot path menu, the parent page, and the current page, while desktop keeps the full inline chain.

**Architecture:** Single `<ol>` (not a duplicated mobile/desktop tree) inside the existing `Breadcrumbs` component. Every non-current, non-parent item gets a `hidden md:flex` wrapper so it only renders on desktop. A dropdown-menu trigger (three-dot icon, built from the existing `DropdownMenu` primitives) is inserted before the parent item and is itself `md:hidden`, so it only renders on mobile. Because there is only one DOM node per breadcrumb item (visibility toggled via CSS, not duplicated markup), there's no risk of Playwright strict-mode collisions between a "mobile" and "desktop" copy of the same label.

**Tech Stack:** React 19, Tailwind CSS v4, lucide-react icons, the existing `DropdownMenu`/`DropdownMenuTrigger`/`DropdownMenuContent`/`DropdownMenuItem` primitives (`src/components/ui/dropdown-menu.tsx`), Playwright for testing.

## Global Constraints

- Spec file: `docs/superpowers/specs/2026-07-01-mobile-breadcrumbs-design.md`.
- Only `src/components/ui/Breadcrumbs.tsx` is modified (plus its test coverage) — no changes to callers (`AppComposition.tsx`, `GameMasterPage.tsx`) or to how they build `items` arrays.
- No new dependency. Reuse `EllipsisVertical` (lucide-react) and the existing `wfrp-standard-icon` styling, matching `src/components/SceneActionsMenu.tsx`'s trigger exactly.
- Breakpoint: `md` (Tailwind default, 768px), matching every other mobile/desktop split in this codebase.
- `npm run lint && npm run build && npm test` must pass before this is done.

---

### Task 1: Collapse Breadcrumbs on mobile behind a path-menu trigger

**Files:**
- Modify: `src/components/ui/Breadcrumbs.tsx` (full rewrite, ~48 lines today)
- Modify: `tests/routes.spec.ts` (append one test)

**Interfaces:**
- Consumes: `BreadcrumbItem = { href?: string; label: string; onClick?: () => void }` (unchanged, already exported), and the existing `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` exports from `src/components/ui/dropdown-menu.tsx`.
- Produces: `Breadcrumbs({ items }: { items: BreadcrumbItem[] })` — same signature as today, no caller changes required.

- [ ] **Step 1: Write the failing Playwright test**

Append this test to the end of `tests/routes.spec.ts` (after the `"renaming a character updates the URL..."` test, respecting the file's existing `test(...)` pattern and `beforeEach` route stub already at the top of the file):

```ts
test("mobile breadcrumbs collapse to a path menu, parent, and current page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/enemy_within/gerhard-lehrmann/skills");

  const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumbs.getByRole("link", { name: "Gerhard Lehrmann" })).toBeVisible();
  await expect(breadcrumbs.getByText("Skills", { exact: true })).toHaveAttribute("aria-current", "page");
  await expect(breadcrumbs.getByRole("link", { name: "Enemy Within" })).toHaveCount(0);

  const pathMenuTrigger = breadcrumbs.getByRole("button", { name: "Show breadcrumb path" });
  await expect(pathMenuTrigger).toBeVisible();
  await pathMenuTrigger.click();

  const pathMenu = page.getByRole("menu");
  await expect(pathMenu.getByRole("menuitem", { name: "Enemy Within" })).toBeVisible();
  await expect(pathMenu.getByRole("menuitem", { name: "Gerhard Lehrmann" })).toBeVisible();
  await expect(pathMenu.getByRole("menuitem", { name: "Skills" })).toHaveCount(0);

  await pathMenu.getByRole("menuitem", { name: "Enemy Within" }).click();
  await expect(page).toHaveURL("/");
});
```

This asserts the target mobile behavior: the root ("Enemy Within") is not rendered as an inline link on mobile, a "Show breadcrumb path" button exists and opens a menu, that menu lists the ancestors (root + parent) but not the current page, and clicking an ancestor navigates.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/routes.spec.ts -g "mobile breadcrumbs collapse" --project=chromium`
Expected: FAIL — today's `Breadcrumbs` renders every item as a plain inline link/span with no responsive hiding and no dropdown trigger, so `breadcrumbs.getByRole("link", { name: "Enemy Within" })` will still resolve (count 1, not 0) and/or the "Show breadcrumb path" button won't exist.

- [ ] **Step 3: Rewrite Breadcrumbs.tsx**

Replace the full contents of `src/components/ui/Breadcrumbs.tsx` with:

```tsx
import { ChevronRight, EllipsisVertical } from "lucide-react";
import { cn } from "../../lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";

export type BreadcrumbItem = {
  href?: string;
  label: string;
  onClick?: () => void;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const itemCount = items.length;
  const parentIndex = itemCount - 2;
  const ancestorItems = items.slice(0, itemCount - 1);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1 text-sm text-wfrp-muted-text">
        {ancestorItems.length > 0 ? (
          <li className="flex shrink-0 items-center md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Show breadcrumb path"
                title="Show breadcrumb path"
                className="wfrp-standard-icon cursor-pointer"
              >
                <span className="wfrp-standard-icon__glyph" aria-hidden="true">
                  <EllipsisVertical />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {ancestorItems.map((item, index) => (
                  <DropdownMenuItem key={`${item.label}-${index}`} onClick={item.onClick}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ) : null}

        {items.map((item, index) => {
          const isCurrent = index === itemCount - 1;
          const isParent = index === parentIndex;
          const isAncestor = !isCurrent && !isParent;

          return (
            <li
              key={`${item.label}-${index}`}
              className={cn("flex min-w-0 items-center gap-1", isAncestor && "hidden md:flex")}
            >
              {isParent ? (
                <>
                  <ChevronRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-wfrp-muted-text/60 md:hidden"
                  />
                  {index > 0 ? (
                    <ChevronRight
                      aria-hidden="true"
                      className="hidden h-3.5 w-3.5 shrink-0 text-wfrp-muted-text/60 md:block"
                    />
                  ) : null}
                </>
              ) : index > 0 ? (
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-wfrp-muted-text/60" />
              ) : null}

              {isCurrent ? (
                <span aria-current="page" className="truncate font-semibold text-wfrp-page-text">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  onClick={(event) => {
                    if (!item.onClick) return;
                    event.preventDefault();
                    item.onClick();
                  }}
                  className="truncate transition-colors hover:text-wfrp-page-text focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wfrp-gold"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

Key points for the reviewer:
- `ancestorItems = items.slice(0, itemCount - 1)` is everything except the current page (root through parent, inclusive) — this is the dropdown's content, per spec.
- `isAncestor` items (everything before the parent) get `hidden md:flex`: invisible on mobile, normal on desktop. This reproduces today's full desktop chain exactly, since parent/current always render regardless of viewport.
- The parent item renders **two** chevrons: one `md:hidden` (always shown on mobile when a parent exists, even if the parent is item 0 — e.g. a 2-item chain where the dropdown trigger still needs a separator before it) and one `hidden md:block` gated on `index > 0` (desktop-only, matches today's "no leading chevron on the first item" rule). Exactly one of the two is visible at any given viewport.
- 1-item chains (`itemCount === 1`): `ancestorItems` is empty, so no dropdown trigger renders; the loop's only item is `isCurrent`, not `isParent` (`parentIndex` is `-1`), so it renders as a bare current-page span with no leading chevron — identical on both breakpoints.

- [ ] **Step 4: Run the new test to verify it passes**

Run: `npx playwright test tests/routes.spec.ts -g "mobile breadcrumbs collapse" --project=chromium`
Expected: PASS

- [ ] **Step 5: Run the full existing route suite to confirm no regressions**

Run: `npx playwright test tests/routes.spec.ts --project=chromium`
Expected: All tests PASS, including `"breadcrumbs reflect the current sheet section and navigate up the hierarchy"` (runs at the default 1280×720 desktop viewport, where the dropdown trigger is `md:hidden` and every item renders exactly as it did before this change).

- [ ] **Step 6: Run lint, build, and the full test suite**

Run: `npm run lint && npm run build && npm test`
Expected: All PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Breadcrumbs.tsx tests/routes.spec.ts
git commit -m "$(cat <<'EOF'
feat: collapse breadcrumbs to a path menu on mobile

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
