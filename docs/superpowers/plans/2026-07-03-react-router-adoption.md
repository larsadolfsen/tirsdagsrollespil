# React Router Adoption Implementation Plan

> ✅ **Tasks 1–5 IMPLEMENTED (2026-07-04, verified 2026-07-07).** Only Task 6 (verification gate) remains.
> Full task-by-task version with all code: `git show 4fa2dee:docs/superpowers/plans/2026-07-03-react-router-adoption.md`.

**Goal:** Replace all hand-rolled `pushState`/`replaceState`/`popstate` routing with react-router v7
(declarative mode) while keeping every URL and behavior identical.
**Spec:** `docs/superpowers/specs/2026-07-03-react-router-design.md`

## Done (do not redo, do not re-read the old plan)

| Task | Commit |
|---|---|
| 1 BrowserRouter + `AppRoutes.tsx` route table | `0f85897` |
| 2 `useCampaignRouteSync` on `useNavigate`/`useLocation` | `ed0d47c` |
| 3 Page flags derived from location; landing/breadcrumb `navigate()` | `d991371` |
| 4 Library book/chapter derived from URL | `740b8cd` |
| 5 GM session sync via router; popstate effect deleted | `4025d77` |

Verified 2026-07-07: zero `history.pushState/replaceState`/`popstate` matches in `src/`; the only
`window.location.pathname` reads are the two allowed one-shots (`useGameSession.ts:140`,
`AppComposition.tsx:333`). `npm run lint` and `npm run build` green.

## Task 6: Full verification gate (remaining)

Constraint: do not edit any test file; `tests/routes.spec.ts` is the contract.

- [ ] `rm -rf test-results && npm test` — all Playwright specs PASS.
  (Fresh machine: `npx playwright install` first. Known pre-existing reds unrelated to this refactor:
  see `TODO.md` D2 — GM specs need seeded `gm_sessions` — and D3.)
- [ ] If a routing spec fails: debug the migration (superpowers:systematic-debugging), fix, commit
  `fix: address react-router migration fallout`.
- [ ] Then superpowers:finishing-a-development-branch to decide merge/PR.
