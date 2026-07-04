# Skill↔Talent Link — Plan 01: Ref & Characteristic Helpers

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Design source of truth: `docs/superpowers/specs/2026-07-04-skill-talent-link-design.md`.
> First of 13 small plans (see the spec's Plan index). This one adds **pure functions only** — no
> data changes, no wiring — so it is fully unit-testable in isolation and unblocks every later plan.

**Goal:** Add two pure helper modules — `skillRefs.ts` (resolve/match a `SkillRef` against real skills,
base-matches-any-specialisation) and `characteristicKeys.ts` (canonical `CharacteristicKey` + legacy
attribute-name map) — with unit tests.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Playwright.

## Global Constraints

- Pure functions in `src/lib/` — no React, no side effects (see `.claude/skills/code-patterns`).
- Reuse existing data: `skillDefinitions`, `skillSpecialisationDefinitions`, `GROUPED_SPECIALISATIONS`,
  `getSkillDisplayName` from `src/data/rules/wfrp4e`; `CharacteristicKey` from `creatureTraits.ts`.
- No new deps. Run `npm run lint && npm run build && npm test` before commit.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/lib/skillRefs.ts` | Parse/match/resolve `SkillRef` (base or `<base>_<spec>`) |
| Create | `src/lib/characteristicKeys.ts` | `CharacteristicKey` canon + legacy attribute-name map |
| Modify | `src/types/rules.ts` | Export `CharacteristicKey` (re-export) + `SkillRef` alias |
| Create | `tests/skill-refs.spec.ts` | Unit tests for both helpers |

---

## Task 1: Types — export `CharacteristicKey` and `SkillRef`

**Files:** Modify `src/types/rules.ts`

- [ ] **Step 1:** Re-export the existing union so refs don't drift from creature data:

```ts
// src/types/rules.ts   (D-f: bare ids, no prefix; kind carried by type + field)
export type { CharacteristicKey } from "../data/rules/wfrp4e/creatureTraits";
export type SkillRef = string;  // "endurance" (base, matches any spec) | "stealth_urban" (spec)
export type TalentRef = string; // "hatred" | "etiquette_nobles"
export type TraitRef = string;  // "weapon" | "ranged" (kebab-case in the trait catalog)
```

> Note: if the import direction (types → data) trips the build, instead **move** the
> `CharacteristicKey` definition into `rules.ts` and re-export it from `creatureTraits.ts`. Decide by
> which keeps `npm run build` clean; document the choice in the commit.

## Task 2: `characteristicKeys.ts`

**Files:** Create `src/lib/characteristicKeys.ts`

- [ ] **Step 1:** Legacy map + coercion helper.

```ts
import type { CharacteristicKey } from "../types/rules";

const LEGACY_ATTRIBUTE_TO_KEY: Record<string, CharacteristicKey> = {
  weaponSkill: "WS", ballisticSkill: "BS", strength: "S", toughness: "T",
  initiative: "I", agility: "Ag", dexterity: "Dex", intelligence: "Int",
  willpower: "WP", fellowship: "Fel",
  // "movement" intentionally absent — derived stat, not a characteristic.
};

const CANONICAL = new Set<CharacteristicKey>([
  "WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel",
]);

/** Accepts a canonical key or a legacy attribute name; returns the key or undefined. */
export function toCharacteristicKey(name: string): CharacteristicKey | undefined {
  if (CANONICAL.has(name as CharacteristicKey)) return name as CharacteristicKey;
  return LEGACY_ATTRIBUTE_TO_KEY[name];
}
```

## Task 3: `skillRefs.ts`

**Files:** Create `src/lib/skillRefs.ts`

- [ ] **Step 1:** Parse + match + resolve. Base id matches any specialisation; a spec ref matches only
  itself. Build lookups from existing data so no id list is duplicated.

```ts
import type { SkillRef } from "../types/rules";
import { skillDefinitions, skillSpecialisationDefinitions } from "../data/rules/wfrp4e";

const baseIds = new Set(skillDefinitions.map((s) => s.id));
// specialisation ids are authored as `<baseId>_<spec>` (mirrors talent-references.spec.ts)
const specIds = new Set(skillSpecialisationDefinitions.map((s) => s.id));

export function parseSkillRef(ref: SkillRef): { baseId: string; specialisationId?: string } {
  if (baseIds.has(ref)) return { baseId: ref };
  const base = [...baseIds].find((id) => ref.startsWith(`${id}_`));
  return base ? { baseId: base, specialisationId: ref } : { baseId: ref };
}

export function isResolvableSkillRef(ref: SkillRef): boolean {
  return baseIds.has(ref) || specIds.has(ref) || [...baseIds].some((id) => ref.startsWith(`${id}_`));
}

/** A base-id ref matches any specialisation of that skill; a spec ref matches only itself. */
export function skillRefMatches(
  ref: SkillRef,
  target: { skillId: string; specialisationId?: string },
): boolean {
  const { baseId, specialisationId } = parseSkillRef(ref);
  if (baseId !== target.skillId) return false;
  return specialisationId ? specialisationId === target.specialisationId : true;
}
```

> ⚠️ Verify the specialisation id scheme against `skillSpecialisationDefinitions` before committing —
> confirm ids are `<baseId>_<spec>` (e.g. `stealth_urban`). If they use a different shape, adapt
> `parseSkillRef`/`isResolvableSkillRef` to the real ids (do **not** invent a scheme).

## Task 4: Unit tests

**Files:** Create `tests/skill-refs.spec.ts`

- [ ] **Step 1:** Cover the behaviours below (Playwright `test`/`expect`, no browser needed — pure):

```ts
import { expect, test } from "@playwright/test";
import { parseSkillRef, isResolvableSkillRef, skillRefMatches } from "../src/lib/skillRefs";
import { toCharacteristicKey } from "../src/lib/characteristicKeys";

test("base ref matches any specialisation", () => {
  expect(skillRefMatches("stealth", { skillId: "stealth", specialisationId: "stealth_urban" })).toBe(true);
  expect(skillRefMatches("stealth", { skillId: "stealth" })).toBe(true);
});
test("spec ref matches only itself", () => {
  expect(skillRefMatches("stealth_urban", { skillId: "stealth", specialisationId: "stealth_urban" })).toBe(true);
  expect(skillRefMatches("stealth_urban", { skillId: "stealth", specialisationId: "stealth_rural" })).toBe(false);
});
test("unrelated skill never matches", () => {
  expect(skillRefMatches("endurance", { skillId: "athletics" })).toBe(false);
});
test("resolvable refs", () => {
  expect(isResolvableSkillRef("endurance")).toBe(true);
  expect(isResolvableSkillRef("stealth_urban")).toBe(true);
  expect(isResolvableSkillRef("not_a_skill")).toBe(false);
});
test("characteristic key: canonical + legacy", () => {
  expect(toCharacteristicKey("WS")).toBe("WS");
  expect(toCharacteristicKey("weaponSkill")).toBe("WS");
  expect(toCharacteristicKey("movement")).toBeUndefined();
});
```

- [ ] **Step 2:** `npm run lint && npm run build && npm test` — all green.

---

## Definition of done

- Both helper modules exist, exported, typed against real data (no duplicated id lists).
- `tests/skill-refs.spec.ts` passes.
- No change to any talent data or roll behaviour yet (this plan is foundations only).
