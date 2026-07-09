# Skill↔Talent Link — Plan 09: Thread Skill Identity Through the Roller

> Design source: `…-skill-talent-link-design.md` (Roll-time resolution). Depends on Plan 08.
> Passes the real `skillId`/`specialisationId` from the roll call sites into the matcher context.

**Goal:** Skill rolls carry their id (not just the display name) end-to-end, so id-first matching (Plan
08) actually fires. Additive change to `handleRoll`'s first argument — no signature break.

## Global Constraints
- Additive optional fields only. Pure-characteristic and spell rolls keep `key` only.
- Keep all existing call sites compiling.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/features/dice/useDiceRoller.ts` | Accept + forward `skillId`/`specialisationId` |
| Modify | `src/tabs/SkillsTab.tsx` | Pass `skill.id`/specialisation at `:107` |
| Modify | `src/tabs/ActionsTab.tsx` | Pass ids at weapon/skill call sites (215/384/466/559) |
| Modify | `src/AppComposition.tsx` | Keep `onRoll`/corruption wiring compiling |

## Task 1: Roller accepts ids
**Files:** `useDiceRoller.ts:250`
- [ ] Extend first arg → `{ key, label, skillId?, specialisationId? }`.
- [ ] Forward into context at `:271-278`:
```ts
context: {
  testName: testType === "corruption" ? "Corruption Test" : char.label,
  skillId: char.skillId,
  specialisationId: char.specialisationId,
  characteristic: toCharacteristicKey(char.key),
  testType,
},
```

## Task 2: Populate at call sites
**Files:** `SkillsTab.tsx:107`, `ActionsTab.tsx`
- [ ] `SkillsTab`: `handleRoll({ key: skill.characteristic, label: skill.displayName, skillId: skill.baseName_or_id, specialisationId: skill.specialisationId })`. (Confirm the resolved-skill field names.)
- [ ] `ActionsTab`: pass `skillId` for weapon/skill-driven rolls where known.
- [ ] Update the `handleRoll` prop types in `SkillsTab`/`ActionsTab`/`SpellsTab`.

## Task 3: Regression spec
- [ ] Dice spec: a talent SL bonus appears on the **matching** skill roll and is **absent** on an
  unrelated skill roll (guards the false-positive fix end-to-end).

## Task 4: Verify
- [ ] `npm run lint && npm run build && npm test` green.

## Definition of done
- Skill identity reaches the matcher; talent bonuses land on exactly the right roll (tested).
