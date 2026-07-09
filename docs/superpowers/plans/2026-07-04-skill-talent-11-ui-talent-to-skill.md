# Skill↔Talent Link — Plan 11: UI — Talent → Related Skills

> Design source: `…-skill-talent-link-design.md` (UI cross-linking). Depends on Plans 06–07.
> Surfaces a talent's related skills as links in the Talents UI.

**Goal:** In `TalentsTab` / `TalentSidebar`, render `relatedSkillIds` (+ effect `skillIds`) as skill
links, so players can jump from a talent to the skills it touches.

## Global Constraints
- Use `<Heading>`/`<Text>` and components from `src/components/ui/` (never raw tags) — see
  `.claude/skills/ui-components` before adding anything.
- Semantic Tailwind tokens only.
- Resolve display names via `getSkillDisplayName`; do not hand-format.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/tabs/TalentsTab.tsx` and/or `src/components/sidebar/TalentSidebar.tsx` | Show related skills |
| Modify | `src/tabs/talents/talentUtils.ts` | Helper to resolve refs → display+navigation targets |

## Task 1: Resolve refs for display
- [ ] Helper: given a talent, return `{ id, displayName }[]` for all its skill refs (dedupe base/spec).

## Task 2: Render
- [ ] Add a "Related skills" row/section to the talent detail. Each is a link/affordance that navigates
  to that skill (reuse existing tab/route navigation).

## Task 3: Test
- [ ] Component/e2e: a talent with refs shows the expected skill link(s); a ref-less talent shows none.

## Task 4: Verify
- [ ] `npm run lint && npm run build && npm test`; drive the app to see the links render + navigate.

## Definition of done
- Talent detail lists related skills as working links; tested + verified live.
