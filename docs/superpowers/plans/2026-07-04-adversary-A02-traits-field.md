# Adversary Link — Plan A02: Add `traits` Field to NpcTemplate

> Design source: `…-adversary-skill-trait-link-design.md`. Additive type change — no data moves yet.

**Goal:** Give NPCs/generics a place for bestiary traits distinct from talents, so Plan A03 can
de-conflate into it.

## Global Constraints
- Additive + optional; existing data compiles unchanged.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/data/npcTypes.ts` | Add `traits?: readonly string[]` |
| Modify | adversary editor types (`src/components/adversaryEditor/*`) if they mirror the shape | Keep in sync |

## Task 1: Add the field
```ts
export interface NpcTemplate {
  // ...existing skills?, talents?...
  traits?: readonly string[]; // bestiary traits (parsed via adversaryRefs)
}
```

## Task 2: Verify
- [ ] `npm run lint && npm run build` green; `npm test` unaffected.

## Definition of done
- `traits?` exists on `NpcTemplate`; nothing else changes.
