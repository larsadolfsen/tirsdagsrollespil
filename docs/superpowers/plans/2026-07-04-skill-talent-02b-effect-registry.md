# Skill↔Talent Link — Plan 02b: Effect Registry / Single Resolver

> Design source: `…-skill-talent-link-design.md`. Governs: `.claude/skills/talent-effects`.
> Depends on Plans 01–02. **Foundational** — the "component" that guarantees rules are applied the same
> way everywhere. Absorbs the old matcher rewrite (former Plan 08).

**Goal:** Refactor `src/lib/talentEffects.ts` from scattered per-effect functions into one typed
**effect registry** with a single `resolveTalentEffects(context)` entry point, so every consumer (dice
roller, derived stats, career/XP, UI) applies talent rules identically. Matching becomes id-first.

## Why
Today each effect kind has its own function (`getTalentSlBonus`, `getTalentDamageBonus`,
`getTalentEncumbranceBonus`, …) and matching is a two-way substring compare. Adding effect type N+1
means editing several call sites. A registry makes it one handler.

## Global Constraints
- Behaviour-preserving for existing effect types; only the *structure* changes (+ id-first matching,
  with string fallback retained until the cleanup plan).
- One handler per effect `type`; no `effect.type` branching outside the registry.
- Follow `.claude/skills/talent-effects`.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/lib/talentEffects.ts` | Registry + `resolveTalentEffects`; port existing effects to handlers |
| Modify | `src/features/dice/useDiceRoller.ts` | Consume the resolver (no direct effect logic) |
| Modify | `src/hooks/useCharacterDerivedStats.ts` | Consume the resolver |
| Create | `tests/talent-effects.spec.ts` | Registry matching + contribution + no-false-positive |

## Task 1: Define the handler interface + registry
**Files:** `talentEffects.ts`
```ts
export interface TalentEffectHandler<E extends TalentEffect = TalentEffect> {
  type: E["type"];
  /** id-first; fall back to string only when the effect carries no structured refs. */
  matches(effect: E, ctx: TalentEffectContext): boolean;
  /** contribution to a roll/derived stat (SL, damage, encumbrance, bool, …). */
  contribute?(effect: E, level: number, ctx: TalentEffectContext): TalentContribution;
  format(effect: E): string;               // display (moves formatTalentEffect here)
}

const HANDLERS: Record<TalentEffect["type"], TalentEffectHandler> = { /* one per type */ };
```

## Task 2: Port existing types to handlers
- [ ] `test_sl_bonus`, `test_reverse_failed_roll`, `attribute_bonus`, `damage_bonus`,
  `encumbrance_bonus`, `ignore_penalty`, `action_unlock`, `special_rule` — move each function's logic
  into its handler's `matches`/`contribute`/`format`.
- [ ] Id-first `matches`: use `skillRefMatches` / `CharacteristicKey` equality when refs exist; else the
  current `testMatches` string compare (kept until Plan 13). Route the `"corruption"` case via
  `characteristics`/`testType`.

## Task 3: Single entry point + keep public helpers as thin wrappers
- [ ] `resolveTalentEffects({ talents, talentDefinitions, context })` → active effects + typed
  contributions. Keep `getTalentSlBonus`/`getTalentDamageBonus`/`getTalentEncumbranceBonus` as thin
  wrappers over the resolver so current call sites keep working.

## Task 4: Consumers call the resolver
- [ ] `useDiceRoller.ts` and `useCharacterDerivedStats.ts` go through `resolveTalentEffects` only.

## Task 5: Tests
**Files:** `tests/talent-effects.spec.ts`
- [ ] Each handler: matches the right context; **absent** on an unrelated roll (false-positive guard);
  contributes the expected value at level N; `format` renders.

## Task 6: Verify
- [ ] `npm run lint && npm run build && npm test` green; drive a roll in the app.

## Definition of done
- One registry, one resolver; consumers carry no effect-type logic; id-first matching; suite green.
