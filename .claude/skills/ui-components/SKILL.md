---
name: ui-components
description: Use before writing any UI element, button, card, input, heading, or layout. Checks what already exists in src/components/ui/ and src/components/wfrp/ before creating anything new.
---

# UI Component reference

**Always check this skill before writing any UI.** If a component exists here, use it — never recreate it with raw HTML or new Tailwind classes.

## Forbidden patterns

| Never do this | Do this instead |
|---|---|
| `<h1>` – `<h6>` | `<Heading level={n} variant="..." />` |
| `<p>` / `<span>` with inline color styles | `<Text variant="..." />` |
| Hardcoded hex/rgb colors | Semantic tokens: `text-wfrp-gold`, `bg-background` |
| New shadcn/ui primitives in feature code | Use existing wrappers in `src/components/ui/` |
| App-specific WFRP UI in `src/components/` | Put it in `src/components/wfrp/` |

---

## Common UI components (`src/components/ui/`)

### Typography
- **`<Heading>`** — All headings. Props: `level: 1–6`, `variant` (25+ options: `pageDisplay`, `sectionDisplay`, `sectionEditorial`, `cardTitle`, `panelTitle`, `sidebarSection`, etc.), `align`, `truncate`
- **`<Text>`** — All body text. Props: `variant: 'body' | 'bodyMuted' | 'bodyStrong' | 'bodyStrongMuted' | 'serifTitle'`, `as?`, `truncate`, `className`
- **`<SectionHeading>`** — Shortcut for `<Heading level={2} variant="sectionDisplay" />`

### Buttons & Actions
- **`<Button>`** — All clickable actions. Props: `variant: 'default' | 'secondary' | 'destructive' | 'ghost' | 'link' | 'unstyled' | 'fab' | 'wfrpIcon' | 'subtabAction'`, `leadingIcon`, `trailingIcon`, `loading`, `loadingLabel`, `isGolden`, `isDeactivated`, `isActive`, `desktopLabel`
- **`<WfrpArrowButton>`** — Left/right chevron. Props: `direction: 'left' | 'right'`, `label`, `onClick`, `variant: 'plain' | 'scrollOverlay'`

### Cards & Containers
- **`<Card>` / `<CardHeader>` / `<CardTitle>` / `<CardContent>` / `<CardFooter>`** — Standard card layout
- **`<WfrpPanel>`** — Panel with title, description, actions header. Props: `title`, `description`, `actions`, `className`, `children`
- **`<WfrpSection>`** — Section with eyebrow label, title, optional divider, actions

### Form Controls
- **`<Input>`** / **`<Textarea>`** — Text inputs
- **`<Label>`** — Form labels
- **`<Select>` / `<SelectContent>` / `<SelectItem>` / `<SelectTrigger>` / `<SelectValue>`** — Dropdown select
- **`<WfrpSearchField>`** — Search input with search button. Props: `id`, `label`, `value`, `onValueChange`, `onSearch?`, `placeholder`

### WFRP-Specific Controls
- **`<WfrpFilterChips<T>>`** — Multi-select checkbox chips. Props: `options: { id, label, icon?, imageUrl? }[]`, `selectedIds`, `onChange`, `ariaLabel`
- **`<WfrpSuggestionChips<T>>`** — Toggle-button chips. Props: `options: { id, label }[]`, `selectedIds`, `onToggle`, `label`
- **`<WfrpStatusBadge>`** — Status badge. Props: `tone: 'neutral' | 'gold' | 'danger' | 'success'`
- **`<WfrpStandardIcon>`** — Icon button wrapper with label, icon, and hover states

### Data Display
- **`<ResourceCounterBar>`** — Progress bar + current/max counter + stepper buttons. Props: `label`, `current`, `max`, `onAdjust(delta)`, `showSteppers`, `canIncreaseBeyondMax`
- **`<Badge>`** — Inline badge. Props: `variant: 'default' | 'secondary' | 'destructive' | 'outline'`
- **`<Separator>`** — Horizontal divider

### Navigation & Tabs
- **`<MainTabMenu>`** — Generic tab switcher. Props: `activeId`, `options: { id, label }[]`, `onChange`, `ariaLabel`
- **`<ScrollableTabStrip>`** — Horizontal scrollable tab list
- **`<InlineSubtabs>`** — Inline tabs for sidebar/secondary navigation
- **`<Breadcrumbs>`** — Breadcrumb trail. Props: `BreadcrumbItem[]` with `href`/`onClick`

### Overlays & Modals
- **`<Dialog>` / `<DialogContent>` / `<DialogHeader>` / `<DialogTitle>` / `<DialogTrigger>`** — Modal dialogs
- **`<Sheet>` / `<SheetContent>` / `<SheetHeader>` / `<SheetTrigger>`** — Side-slide panels
- **`<DropdownMenu>` / `<DropdownMenuContent>` / `<DropdownMenuItem>` / `<DropdownMenuTrigger>`** — Dropdown menus
- **`<Tooltip>` / `<TooltipContent>` / `<TooltipTrigger>`** — Tooltips

---

## WFRP-specific components (`src/components/wfrp/`)

### Character Sheet Data Layout
Use these for any tabular or structured data on character/NPC sheets:

- **`<SheetDataSection>`** — Composite: header row + table rows. Props: `sectionLabel`, `valueLabels`, `leadingLabels`, `gridClassName`
- **`<SheetDataRow>`** / **`<SheetDataTable>`** — Row containers for grid layout
- **`<SheetDataResponsiveListRow>`** — Mobile/desktop split row. Props: `mobileSummary`, `mobileDetails: { label, value }[]`, `desktopContent`
- **`<SheetDataAccordionRow>`** / **`<SheetDataAccordionDetails>`** — Accordion-style disclosure rows
- **`<SheetDataDefinitionList>`** — Key-value pairs using `<dl>`
- **`<SheetEmptyState>`** — Placeholder for empty sections
- **`<SheetDataButtonRow>`** — Row with action buttons

### Character Cards
- **`<WfrpPlayerCard>`** — Character card for GM landing. Props: `characterSummary`, `variant: 'card' | 'row'`, `isSelected`, `onClick`

---

## Checklist before writing any UI

1. Is there an existing component for this? Check the lists above first.
2. Text or heading? → `<Text>` or `<Heading>`, never raw tags.
3. Button or action? → `<Button variant="...">`, pick the right variant.
4. WFRP-specific layout? → Check `src/components/wfrp/` before creating new.
5. New component needed? → Add it to `src/components/ui/`, export from `index.ts`, document in `.agents/AGENTS.md`.
