# Skill↔Talent Link — Plan 13: Drop the String Fallback (Cleanup)

> Design source: `…-skill-talent-link-design.md` (D-d cleanup). Depends on Plans 06–09 (full coverage).
> Final piece: once every talent that needs one has a structured ref, remove the substring fallback.

**Goal:** Make structured refs authoritative in `talentEffects.ts` — delete the two-way `includes()`
compare and the ad-hoc `"corruption"` branch, so matching is purely id/characteristic-based.

## Global Constraints
- Only start when the Plan 07 coverage ratchet is green (no test-bearing talent lacks a ref).
- No behaviour change for correctly-authored talents; the only removals are the fuzzy paths.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/lib/talentEffects.ts` | Remove string fallback + corruption special case |
| Modify | `src/types/rules.ts` | Optionally mark effect `test` as display-only / keep for UI |
| Modify | `tests/talent-effects.spec.ts` | Assert matcher works without fallback |

## Task 1: Remove fallback
- [ ] Delete the `testMatches` substring path and the `"corruption"` branch; route corruption via
  `characteristics`/`testType`. Keep `effect.test` as a display label only.

## Task 2: Prove nothing regressed
- [ ] Run the full suite (`talent-effects`, dice, `talent-skill-refs`, coverage ratchet). All green.
- [ ] Grep for any remaining reliance on `effect.test` for logic; convert to refs.

## Task 3: Verify
- [ ] `npm run lint && npm run build && npm test`; drive a few rolls in the app.

## Definition of done
- Matching is 100% structured; fuzzy string matching is gone; suite green.
