# Skill↔Talent Link — Plan 02: Additive Ref Fields on Types

> ✅ **IMPLEMENTED (2026-07-04).** Added `skillIds?`/`characteristics?` to the `test_sl_bonus` + `test_reverse_failed_roll` variants and `relatedSkillIds?`/`grantsSkillIds?` to `TalentDefinition` (all optional). `CharacteristicKey` now imported+re-exported so it's usable in-file. lint green; no data/behavior change.

> Design source: `docs/superpowers/specs/2026-07-04-skill-talent-link-design.md`. Depends on Plan 01.
> Pure type additions — no data, no runtime change. Proven by the build.

**Goal:** Add the optional structured-ref fields to `TalentEffect` and `TalentDefinition` so later plans
can author refs. All fields optional → no breaking change, no data migration.

## Global Constraints
- Additive only; every field optional. `npm run build` must stay green with zero data edits.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/types/rules.ts` | Add ref fields to `TalentEffect` variants + `TalentDefinition` |

## Task 1: Extend the test-scoped `TalentEffect` variants
**Files:** `src/types/rules.ts`
- [ ] Add to the `test_sl_bonus` and `test_reverse_failed_roll` members:
```ts
      skillIds?: SkillRef[];              // structured, id-first matching
      characteristics?: CharacteristicKey[];
```

## Task 2: Extend `TalentDefinition`
- [ ] Add:
```ts
  relatedSkillIds?: SkillRef[];   // cross-linking + validation (prose talents included)
  grantsSkillIds?: SkillRef[];    // career/XP wiring (Plan 10)
```

## Task 3: Verify
- [ ] `npm run lint && npm run build` — green, no data files touched.

## Definition of done
- Types expose the four optional fields; build passes; no behaviour change.
