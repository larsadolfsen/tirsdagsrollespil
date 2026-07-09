# Adversary Link — Plan A08: UI — Linked Skills/Talents/Traits on Stat Blocks

> Design source: `…-adversary-skill-trait-link-design.md`. Depends on A01–A07 + character UI Plans 11–12.

**Goal:** NPC/generic/creature stat blocks and the adversary editor show skills, talents, and traits as
resolved, linked entities (name + rating + specialisation), reusing the character-side cross-linking.

## Global Constraints
- Use `src/components/ui/` components + semantic tokens (`.claude/skills/ui-components`).
- Reuse `getSkillDisplayName` / talent / trait display resolvers; do not hand-format strings.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/components/adversaryEditor/*`, stat-block views | Render resolved, linked entries |
| Modify | `src/components/sidebar/SkillSidebar.tsx`/`TalentSidebar.tsx` | Reuse talent/skill detail links |

## Task 1: Render resolved entries
- [ ] Show each skill/talent/trait with its display name, rating, and specialisation; link talents/skills
  to their detail (pairs with character Plans 11–12). Traits link to their bestiary detail.

## Task 2: Test
- [ ] Component/e2e: a generic with `Weapon (Sword) +8` shows the Weapon trait, "Sword", rating 8; a
  talent links to its detail.

## Task 3: Verify
- [ ] `npm run lint && npm run build && npm test`; drive the app.

## Definition of done
- Adversary stat blocks show structured, linked skills/talents/traits; tested + verified.
