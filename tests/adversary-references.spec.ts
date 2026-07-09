import { expect, test } from "@playwright/test";
import { genericCatalog } from "../src/data/generic";
import { namedNpcCatalog } from "../src/data/npcs/named";
import {
  parseSkillEntry,
  parseTalentEntry,
  parseTraitEntry,
  tokenizeEntry,
} from "../src/lib/adversaryRefs";

// Trait metas that must live in traits[], never skills[]/talents[].
const TRAIT_META = new Set(["armour", "weapon", "ranged", "prejudice", "tough"]);

// Plan A04: after de-conflation (A03), every NPC/generic stat-block entry must
// resolve against its own catalog — skills as skills, talents as talents, traits
// as traits. Guards the field split and catches id drift.

// Talent names referenced by stat blocks but absent from the Core/WoM catalog —
// tracked in TODO.md (R7/R8). Remove from here as the catalog is completed.
const PENDING_TALENTS = new Set(["Fanatical", "Suffuse with Ulgu"]);

test("every adversary skill/talent/trait entry resolves in its field", () => {
  const templates = [...genericCatalog, ...namedNpcCatalog];
  const unresolved: string[] = [];

  for (const template of templates) {
    for (const entry of template.skills ?? []) {
      if (parseSkillEntry(entry).unresolved) unresolved.push(`${template.id} skill: ${entry}`);
    }
    for (const entry of template.talents ?? []) {
      if (parseTalentEntry(entry).unresolved && !PENDING_TALENTS.has(entry)) {
        unresolved.push(`${template.id} talent: ${entry}`);
      }
    }
    for (const entry of template.traits ?? []) {
      if (parseTraitEntry(entry).unresolved) unresolved.push(`${template.id} trait: ${entry}`);
    }
  }

  expect(unresolved, `Unresolved adversary refs: ${unresolved.join("; ")}`).toEqual([]);
});

test("no trait entries remain mis-filed in skills[] or talents[]", () => {
  const templates = [...genericCatalog, ...namedNpcCatalog];
  const misfiled: string[] = [];
  for (const template of templates) {
    for (const entry of [...(template.skills ?? []), ...(template.talents ?? [])]) {
      if (TRAIT_META.has(tokenizeEntry(entry).baseName.toLowerCase())) {
        misfiled.push(`${template.id}: ${entry}`);
      }
    }
  }
  expect(misfiled, `Trait entries still in skills[]/talents[]: ${misfiled.join("; ")}`).toEqual([]);
});
