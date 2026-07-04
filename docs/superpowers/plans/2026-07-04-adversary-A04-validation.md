# Adversary Link — Plan A04: Reference Validation

> Design source: `…-adversary-skill-trait-link-design.md`. Depends on A01. Mirrors
> `talent-references.spec.ts` for the adversary side.

**Goal:** A CI test that every NPC/generic skill, talent, and trait entry resolves to its shared
catalog — so drift and typos fail the build.

## File Map
| Action | Path | Responsibility |
|---|---|---|
| Create | `tests/adversary-references.spec.ts` | Resolve all NPC/generic entries |

## Task 1: The spec
```ts
import { expect, test } from "@playwright/test";
import { genericCatalog } from "../src/data/generic";
import { namedNpcs } from "../src/data/npcs"; // adjust import to real export
import { parseSkillEntry, parseTalentEntry, parseTraitEntry } from "../src/lib/adversaryRefs";

test("every adversary skill/talent/trait entry resolves", () => {
  const bad: string[] = [];
  for (const t of [...genericCatalog, ...namedNpcs]) {
    for (const s of t.skills ?? [])  if (parseSkillEntry(s).unresolved)  bad.push(`${t.id} skill: ${s}`);
    for (const s of t.talents ?? []) if (parseTalentEntry(s).unresolved) bad.push(`${t.id} talent: ${s}`);
    for (const s of t.traits ?? [])  if (parseTraitEntry(s).unresolved)  bad.push(`${t.id} trait: ${s}`);
  }
  expect(bad, `Unresolved adversary refs: ${bad.join("; ")}`).toEqual([]);
});
```

## Task 2: Triage the first run
- [ ] Any unresolved entries are either data typos (fix) or missing catalog entries (add via A05, or a
  clearly non-catalog note left as-is with an allow-list, e.g. "Weapons stored in his room").

## Task 3: Verify
- [ ] `npm run lint && npm run build && npm test` green.

## Definition of done
- Every adversary entry resolves (or is explicitly allow-listed); regressions fail CI.
