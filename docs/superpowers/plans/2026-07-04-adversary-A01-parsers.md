# Adversary Link — Plan A01: Skill/Talent/Trait String Parsers

> ✅ **IMPLEMENTED (2026-07-04).** `6d16e08` — `src/lib/adversaryRefs.ts` + `tests/adversary-refs.spec.ts` green (incl. collision test). Skip this plan.

> Design source: `docs/superpowers/specs/2026-07-04-adversary-skill-trait-link-design.md`.
> Governs: `.claude/skills/talent-effects`. Depends on character Plan 01 (`skillRefs`, `characteristicKeys`).
> Pure functions only — fully unit-testable, unblocks the rest of the adversary work.

**Goal:** Parse the free-text NPC/generic entry strings into structured references against the shared
catalogs (skill / talent / trait), including parenthetical specialisation → condition-or-skillref.

## Global Constraints
- Pure `src/lib/`; resolve names via `skillDefinitions`, `talentDefinitions`, `creatureTraitDefinitions`.
- A parenthetical is one base + specialisation (see the skill's "Specialised entries" section).
- **Field-specific resolution (id-collision safety).** `parseTalentEntry` searches **only** the talent
  catalog; `parseTraitEntry` searches **only** the trait catalog. 9 ids collide across catalogs
  (`armour`, `frenzy`, `hardy`, `hatred`, `magic_resistance`, `night_vision`, `prejudice`, `ranged`,
  `weapon`), so a name must never be resolved against both — the array a string lives in decides its kind.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Create | `src/lib/adversaryRefs.ts` | `parseSkillEntry` / `parseTalentEntry` / `parseTraitEntry` |
| Create | `tests/adversary-refs.spec.ts` | The three formats + specialisation cases |

## Task 1: Parsers
```ts
parseSkillEntry("Melee (Basic) 61")   // { baseId:"melee", skillRef:"melee_basic", value:61 }
parseSkillEntry("Dodge 54")            // { baseId:"dodge", skillRef:"dodge", value:54 }
parseTalentEntry("Strike to Stun")     // { talentId:"strike_to_stun" }
parseTalentEntry("Hatred (Orcs)")      // { talentId:"hatred", specialisation:"Orcs", conditionTag:"target:orcs" }
parseTraitEntry("Weapon (Sword) +8")   // { id:"weapon", value:"Sword", rating:8, conditionTag:"using:sword" }
parseTraitEntry("Ranged (Whip) +6 (6)")// { id:"ranged", value:"Whip", rating:6, extra:6 }
parseTraitEntry("Tough")               // { id:"tough" }
```
- [ ] Split trailing number(s) as rating/extra; split `(…)` as specialisation.
- [ ] Map specialisation → skill-spec ref when the base is a grouped skill; else a condition tag/value.
- [ ] Return `{ unresolved: true, raw }` when no catalog match (so validation can report it).

## Task 2: Tests
- [ ] Cover all three kinds, specialised + unspecialised, rating + extra, and one unresolved case.
- [ ] **Collision test:** `parseTalentEntry("Hatred (Orcs)")` → talent `hatred`; `parseTraitEntry("Hatred (Orcs)")`
  → trait `hatred`; neither leaks into the other catalog.

## Task 3: Verify
- [ ] `npm run lint && npm run build && npm test` green.

## Definition of done
- Parsers resolve real entries to structured refs (with specialisation handling); tested.
