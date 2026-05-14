# UI component usage rules

This app uses Tailwind as the styling system and shadcn/ui-style components as the shared UI layer.
The UI should keep the grim WFRP identity: dark surfaces, brass/gold accents, parchment highlights, compact data-dense panels, and strong uppercase labels.

## Component hierarchy

1. **Use shared shadcn/ui components from `src/components/ui` by default.**
   - Base controls such as `Button`, `Card`, `Input`, `Label`, `Select`, `Tabs`, `Dialog`, `Sheet`, `DropdownMenu`, `Tooltip`, `Separator`, `Badge`, and `Table` live there.
   - Keep these components close to shadcn defaults unless they need token compatibility or WFRP state styling.
2. **Use WFRP wrappers from `src/components/wfrp` for repeated app patterns.**
   - `WfrpPanel` is for repeated bordered card/panel sections.
   - `WfrpSection` is for repeated section headers with rule separators.
   - `WfrpStatusBadge` is for repeated status/tone badges.
3. **Use Radix primitives directly only when the shared UI layer does not expose the needed behavior.**
   - If a Radix primitive is used directly, add a short comment or wrapper explaining why a shared shadcn/ui component was not enough.
4. **Do not expand legacy CSS for new UI.**
   - Prefer Tailwind utilities and semantic tokens.
   - Existing `wfrp-*` utilities may still be used by existing screens, but new shared primitives should use token names first.

## Token rules

- Use semantic tokens for component color decisions: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `ring-ring`, and state tokens such as `bg-destructive`.
- Use WFRP tokens only when the visual identity needs a named accent: `text-wfrp-gold`, `bg-wfrp-gold-surface`, `border-wfrp-gold/40`, `bg-wfrp-surface-subtle`.
- Avoid hardcoded hex/rgb values in components. Add or reuse a token in `src/index.css` when a color becomes part of the design system.

## Interaction and accessibility rules

- Interactive controls must have visible hover, focus-visible, active, disabled, loading, and error states when those states apply.
- Use at least `min-h-10` for primary touch targets unless a compact table/action layout explicitly requires smaller controls.
- Preserve accessible names for icon-only buttons with `aria-label`.
- Prefer native semantics or shadcn/ui/Radix behavior for dialogs, menus, tabs, select controls, and tooltips.
- Use `aria-invalid` plus tokenized destructive styling for validation errors.

## Migration rules

- Do not migrate the whole app in one large change.
- When touching an existing screen, migrate only the local repeated pattern that is already being changed.
- Keep generated shadcn/ui components in `src/components/ui` and app-specific wrappers in `src/components/wfrp`.
