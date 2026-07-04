# Skill↔Talent Link — Plan 08: Id-First Matcher

> Design source: `…-skill-talent-link-design.md` (Roll-time resolution). Depends on Plans 01, 06.
> Rewrites `talentEffects.ts` matching to prefer structured refs; string compare becomes fallback.

**Goal:** Make `getApplicableTalentEffects` match on ids first (skill ref + characteristic), falling back
to the existing substring compare only when an effect has no structured refs. Kills the false-positive
token collisions that are the core bug.

## Global Constraints
- Behaviour-preserving for talents without refs (string fallback stays until Plan 13).
- Move the ad-hoc `"corruption"` branch behind the structured path.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/lib/talentEffects.ts` | `TalentEffectContext` id fields + id-first matching |
| Modify | `tests/*` | New unit spec for the matcher |
| Create | `tests/talent-effects.spec.ts` | id-match hits; token collision no longer false-positives |

## Task 1: Extend context
**Files:** `talentEffects.ts`
```ts
export interface TalentEffectContext {
  testName?: string;                 // kept for string fallback
  skillId?: string;
  specialisationId?: string;
  characteristic?: CharacteristicKey;
  actionId?: string;
  conditionTags?: string[];
  testType?: RollTestType;
}
```

## Task 2: Id-first `testMatches`
- [ ] In the `test_sl_bonus`/`test_reverse_failed_roll` branch: if the effect has `skillIds` or
  `characteristics`, match structurally via `skillRefMatches(ref, { skillId, specialisationId })` /
  `characteristic` equality and **ignore** the string compare. Only if it has neither, use the current
  `testMatches(effect.test, context.testName, …)` fallback.

## Task 3: Unit spec
**Files:** `tests/talent-effects.spec.ts`
- [ ] Structured hit: Menacing (`skillIds:["intimidate"]`) applies on `{ skillId: "intimidate" }`.
- [ ] **Absence / no false positive**: an effect scoped to one skill does NOT apply on an unrelated
  roll that previously collided under substring matching.
- [ ] Fallback still works: a ref-less talent matches by string as before.

## Task 4: Verify
- [ ] `npm run lint && npm run build && npm test` green.

## Definition of done
- Matching is deterministic by id; fallback intact; token-collision false positives eliminated (tested).
