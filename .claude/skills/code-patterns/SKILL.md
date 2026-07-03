---
name: code-patterns
description: Use at the start of any implementation task. Enforces naming conventions, file structure, forbidden patterns, and component creation rules for this project.
---

# Code patterns

Invoke this before writing any new code. These rules are enforced at build time — violations will fail CI.

---

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| React component files | PascalCase | `WfrpPanel.tsx`, `Heading.tsx` |
| shadcn-style UI primitives | kebab-case | `button.tsx`, `dropdown-menu.tsx` |
| Hooks | camelCase, `use` prefix | `useCharacterDerivedStats.ts` |
| Utility functions | camelCase | `cn.ts`, `headingSlug.ts` |
| Types | PascalCase, exported from same file | `export type HeadingProps` |

---

## File structure rules

**Where new code goes:**

| Type | Location |
|---|---|
| Shared UI primitives | `src/components/ui/` |
| App-specific WFRP UI | `src/components/wfrp/` |
| Page/feature components | `src/components/` |
| Custom hooks | `src/hooks/` |
| Pure utility functions | `src/lib/` |
| React contexts | `src/context/` |
| Tab content | `src/tabs/` |
| Static data (characters, campaigns, rules) | `src/data/` |

**New UI component structure:**
```typescript
// 1. Imports (React, lucide, cn, other components)
// 2. Type definitions (variant unions, props interface)
// 3. Variant/style maps (const Record)
// 4. Component function
// 5. Exports (type + component)

type ButtonVariant = "default" | "secondary";
const variants: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
};
export type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};
export function Button({ variant = "default", className, ...props }: ButtonProps) {
  return <button className={cn(variants[variant], className)} {...props} />;
}
```

**After creating a new UI component:**
1. Export it from `src/components/ui/index.ts`
2. Document it in `.agents/AGENTS.md` under "Oversigt over fælles komponenter"

---

## Styling rules

**Always use `cn()` from `@/src/lib/utils` to merge classes:**
```typescript
className={cn(variants[variant], isActive && "text-wfrp-gold", className)}
```

**Semantic tokens to use:**
- Backgrounds: `bg-background`, `bg-card`, `bg-wfrp-surface-subtle`
- Text: `text-foreground`, `text-muted-foreground`, `text-wfrp-gold`, `text-wfrp-muted-text`
- Borders: `border-border`, `border-wfrp-border`
- Interactive: `ring-wfrp-gold`, `hover:bg-wfrp-surface-subtle`

**Forbidden:**
- `!important` modifier anywhere
- Hardcoded hex/rgb: `#c5a059`, `#121212`, `rgb(...)` etc.
- `text-wfrp-gold` directly inside a Heading variant definition (use a wrapper div)
- Legacy CSS for new UI — use Tailwind only

---

## Typography rules

**Always:**
```tsx
<Heading level={2} variant="sectionDisplay">Title</Heading>
<Text variant="bodyMuted">Description text</Text>
```

**Never:**
```tsx
<h2 className="text-xl font-bold">Title</h2>   // ❌ raw tag
<p style={{ color: "#888" }}>Description</p>   // ❌ inline style
```

`scripts/check-typography.mjs` runs at build time and will fail if raw heading tags are found.

---

## Accessibility rules

- Icon-only buttons **must** have `aria-label`
- Progress bars: use `role="progressbar"` + `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Form inputs: use `<Label>` or `aria-label`
- Disclosure/accordion: use `<details>`/`<summary>` or explicit `role="menu"`

---

## Component creation checklist

1. Does a component already exist for this? Check [`ui-components` skill](../ui-components/SKILL.md) first.
2. Is this WFRP-specific? → `src/components/wfrp/`, not `src/components/`
3. Is this a generic primitive? → `src/components/ui/`
4. Props typed with `HTMLAttributes<T> & { custom props }`?
5. Variants in a `Record<Variant, string>` map?
6. Exported from `src/components/ui/index.ts`?
7. Documented in `.agents/AGENTS.md`?
