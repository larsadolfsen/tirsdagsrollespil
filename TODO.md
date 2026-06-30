# Bug Audit TODO — Tirsdagsrollespil (WFRP 4E)

Audit date: 2026-06-30. Method: 5 parallel read-only subsystem audits + `tsc --noEmit` and
typography lint (both pass clean — every item below is a logic/runtime bug the type checker
cannot catch).

Legend: `[✅]` = independently verified against source · `[ ]` = agent-reported, verify before fixing.

Suggested fix order: #1 → #2 → #3 → #4/#5 → #6. The first three corrupt or lose real player data.

---

## Discovered while fixing (2026-06-30, session 2)

- [x] **D1. Current XP display double-counted manual XP adjustments.** — FIXED (1a82c5e).
  `CareerTab.tsx:214` added `pendingXpAdjustment` on top of `pendingAvailableXp`, which already
  folds it in (`AppComposition.tsx:633`). A "+10" click moved the field by 20. Regression test in
  `tests/advance-xp.spec.ts` ("manual current-XP adjustment moves the field by exactly that amount").

- [ ] **D2. GM/encounter browser tests are blocked on missing seed data.** The `gm_sessions` SQLite
  table is empty in this checkout (SQLite is gitignored), so the GM Campaign Sessions list is empty
  and every test that clicks the session **"Open"** button times out. Affected (chromium, mirrors on
  firefox/webkit): all of `tests/gamemaster.spec.ts` (5), `tests/encounter-builder-feedback.spec.ts`,
  and `tests/generic-character.spec.ts` (2, they add adversaries inside a session).
  - Fix options: (a) a Playwright global-setup / per-spec `beforeAll` that seeds one "Enemy Within"
    campaign session (14 scenes, including the Scene 7 the encounter test expects) via the
    `/api/gm-sessions` PUT endpoint or directly into SQLite, sourced from
    `src/data/scenarios/scenarioSessionImport.ts`; or (b) mock `**/api/gm-sessions/**` per test with a
    fixture session. (a) is closer to real behaviour and reusable. **Needs a decision before building.**

- [ ] **D3. `tests/dice-log.spec.ts:3` cannot find `.wfrp-sidebar-title`.** The dice-roller sidebar
  opens (the "Dice Roller" heading is visible) but the `.wfrp-sidebar-title` element the test measures
  isn't found. Triage: confirm whether the class was renamed/removed (stale test) or the title is
  genuinely missing in that sidebar variant (app bug). Read-only; not yet investigated in the DOM.

### Browser-suite baseline status (serial, `--workers=1`, clean `data/` )
- GREEN: `advance-xp.spec.ts` (9, +1 webkit skip for synthetic touch), `creature-traits.spec.ts` (3),
  `career-steps.spec.ts`, `weapons.spec.ts`, `character-data.spec.ts`, `npc-catalog.spec.ts`,
  `header-xp.spec.ts`/`routes.spec.ts` (mocked). `example`/`skills`/`shop` not individually re-confirmed
  but were not in the chromium failing set.
- RED (causes above): D2 group (8 tests) + D3 (1 test).
- ⚠️ Tests that hit the real dev server (no mock) repopulate `data/character-progress.json`; reset it
  to `{}` before a baseline run. `advance-xp` is now mocked and no longer pollutes it.

---

## 🔴 Critical

- [x] **1. ✅ Advancement costs zero XP; spend is unlimited.** — FIXED (211aa9c), awaiting `npm test` on Node ≥22.
  - Files: `src/AppComposition.tsx:1054-1085`, `:1354`; `src/hooks/useCareerAdvancement.ts:156`
  - `purchaseSkillAdvance`/`purchaseCharacteristicAdvance` only push into pending maps;
    `purchaseTalent` writes straight to `characterTalents`. On save, XP is decremented only by
    `pendingXpAdjustment` (line 1354), which is driven solely by the manual +/- buttons
    (`CareerTab.tsx:218/221`) — never by queued advances. `pendingAvailableXp = Math.max(0, xpCurrent)`
    (line 156) never subtracts queued purchases, so the affordability gate never tightens.
  - Result: characteristics, skills, and talents are all free, with no spend limit.
  - Note: the correct implementation already exists as dead code (`handleAdvanceSkill`, `:934`).

---

## 🟠 High

- [x] **2. ✅ Compression middleware silently breaks SSE in production.** — FIXED.
  - Files: `server.mjs` (`compressionMiddleware`)
  - `compressionMiddleware` (global, before the SSE route) overrides `res.write` to buffer chunks and
    only flushes inside `res.end`. SSE never calls `res.end`, so `: connected`, `: ping`, and every
    broadcast event are buffered and never sent. Real-time sync is dead for any browser sending
    `Accept-Encoding` (all of them).
  - Fix: added `isStreamingResponse()`; `res.write`/`res.end` now detect `text/event-stream` and
    restore the native methods to write straight through. Verified live (red: empty stream → green:
    `: connected` plus a broadcast `data:` event both arrive with `Accept-Encoding: gzip`).

- [x] **3. ✅ Saves can fail completely silently.** — FIXED.
  - File: `src/data/persistence.ts`
  - `writeCharacterProgressFile`/`deleteCharacterProgressFile` now check `response.ok` (an HTTP
    4xx/5xx was previously swallowed as success) and emit a durable-save status event via the new
    `subscribeToSaveStatus` channel, plus a `console.error`. A new `SaveStatusBanner` (mounted in
    `App.tsx`) subscribes and shows a non-blocking toast when a save fails, clearing on the next
    successful save. Covered by `tests/save-status.spec.ts` (500 → banner; 204 → no banner).
  - Not done here: automatic retry/version-guard (that is the separate concern in #8).

- [ ] **4. ✅ Dice success math is inconsistent when a bonus is present.**
  - File: `src/features/dice/useDiceRoller.ts:328-339`
  - Base `success` honors auto-success (≤5) / auto-fail (≥96), but line 339 discards it
    (`finalSuccess = totalSl >= 0`) whenever any bonus exists. A 96+ roll (should auto-fail) can
    report success once a bonus applies.

- [ ] **5. ✅ `getIsCritical` is wrong.**
  - File: `src/features/dice/useDiceRoller.ts:154-158`
  - Returns `false` for every non-attack test and ignores `isSuccess`. Doubles-as-fumbles never
    register; a *failed* attack rolling a double (e.g. target 30, roll 44) is wrongly flagged a
    Critical. Correct logic already exists in `src/lib/rollMechanics.ts:41-69`.

- [x] **6. ✅ Three broken skill references in career steps.** — FIXED (d42a321); regression test
  `tests/career-steps.spec.ts` resolves every career skill id.
  - File: `src/data/rules/wfrp4e/careers/careerSteps.ts`
  - `:1982 "bribe"` → should be `bribery`; `:3456 "intimidation"` → `intimidate`;
    `:4874 "set_traps"` → `set_trap`. Skill resolution breaks for the Envoy, Coach Master, and
    Wrecker career steps.

- [ ] **7. List keys use non-unique `name` instead of `id`.**
  - Files: `src/tabs/SpellsTab.tsx:124` (`key={spell.name}`),
    `src/tabs/ActionsTab.tsx:360`/`:438` (`key={weapon.name}`)
  - Two same-named spells/weapons collide, attaching accordion/Remove state to the wrong row.
    Unique `id` is available in both cases.

- [ ] **8. Stale-update lost saves across the editor.**
  - Files: `src/lib/useGameSession.ts:392-476`, `src/data/persistence.ts:177-184`
  - Autosave fires a fire-and-forget PUT on every state change with no debounce and no
    ordering/version guard — a slow earlier request can overwrite a later one.
  - Verify first: the related claim that the open sheet never subscribes to SSE — `AppComposition.tsx`
    does subscribe, so confirm before acting.

---

## 🟡 Medium

- [ ] **9. ✅ Server ↔ dev API divergence.**
  - File: `vite.config.ts` vs `server.mjs`
  - Dev re-implements the same endpoints with no Basic Auth, rate limiting, security headers, SSE, or
    request-size limit, and far weaker dice-roll validation (any object vs strict `isDiceRollPayload`).
    Dev stores progress in a JSON file; prod uses SQLite. Two diverging API copies = core maintenance
    hazard. Consider extracting shared route handlers into one module.

- [ ] **10. ✅ Dice log is not live.**
  - Files: `src/features/dice/useDiceRoller.ts`, `server.mjs:1003-1020`
  - No SSE/broadcast channel exists for dice rolls (only character-progress). A shared campaign log
    never updates on other clients until a full reload.

- [ ] **11. Initiative/corruption rolls fail server validation.**
  - Files: `src/features/dice/useDiceRoller.ts:264`, `server.mjs:293`
  - Client archives `testType: "initiative"`, but server only allows
    `dramatic|attack|channeling|corruption` → 400, swallowed by `.catch`, so the roll silently never
    persists. Client and server contracts disagree (`src/types/dice.ts:3` allows `initiative`).

- [ ] **12. `ensureLegacyMigration` caches a rejected promise forever.**
  - File: `server.mjs:826-851`
  - One transient FS error on first migration bricks all character-progress endpoints until process
    restart (no reset on failure).

- [ ] **13. Rate-limit bypass via spoofed `X-Forwarded-For`.**
  - File: `server.mjs:592`
  - The limiter keys on the hand-parsed header instead of Express's resolved `req.ip`, so a
    per-request random value gets a fresh bucket every time. `trust proxy` is set but `clientIp`
    ignores it.

- [ ] **14. GM page stale effects.**
  - File: `src/components/GameMasterPage.tsx:289-309`, `:272-287`, `:213`
  - Session-load effect reads `scenes`/`editingSessionName` but deps are only `[activeSession?.id]`;
    the `[scenes]` effect fires the parent's network save on mere session switches;
    `removeNpcFromScene` leaves orphaned monster groups in `npcEncounterData`; `topEncounterData` isn't
    reset on session switch (leaks prior session's state).

- [x] **15. ✅ Crossbow damage `"9"` instead of `"+9"`.** — FIXED (d530809); `tests/weapons.spec.ts`.
  - File: `src/data/rules/wfrp4e/weapons.ts:678`
  - Inconsistent with every other ranged weapon's `"+N"` format; parses differently. WFRP4e Crossbow
    is Damage +9.

- [ ] **16. Shop consumables don't stack.**
  - File: `src/hooks/useInventoryActions.ts:240-272`
  - Buying an already-owned consumable creates a duplicate stack (`shop-${id}-${Date.now()}`) instead
    of incrementing quantity.

- [x] **17. ✅ Duplicate talent on a player character.** — FIXED (1b63ec0); `tests/character-data.spec.ts`.
  - File: `src/data/characters/thano-voss.ts:83-84` — `perfect_pitch` listed twice.

- [ ] **18. Dev request body reader has no size limit.**
  - File: `vite.config.ts:179-197` (`readRequestJson`)
  - Concatenates chunks unboundedly; large POST can exhaust memory. Prod uses
    `express.json({ limit: "1mb" })`.

- [ ] **19. SSE broadcast has no per-socket error handling.**
  - File: `server.mjs:31-33`, `:940`
  - `broadcastProgressEvent` writes to every client with no try/catch and no `res.on("error")`; one
    dead socket throwing mid-loop aborts the broadcast for all remaining clients and bubbles into the
    PUT/DELETE handler. Keep-alive interval cleanup relies solely on `req.on("close")`.

---

## 🟢 Low

- [ ] **20. Synchronous compression on the event loop.** `server.mjs:507-508` — `brotliCompressSync`/
  `gzipSync` buffer the whole body and block the main thread for large responses.
- [ ] **21. `copyScene` id collisions.** `src/components/GameMasterPage.tsx:355-371` — every component
  in the sync `.map` shares the same `Date.now()`, leaving only a 5-char random suffix for uniqueness.
- [ ] **22. `EventSource` opened at module load, never torn down, no resync on reconnect.**
  `src/data/persistence.ts:57-87` — cache can go stale across a server restart with no recovery hook.
- [ ] **23. Near-duplicate talents with conflicting `max`.** `src/data/rules/wfrp4e/talents.ts:371-383`
  — `public_speaker` (`max "5"`) vs `public_speaking` (`max "1"`); WFRP4e has one canonical talent.
- [ ] **24. "Armour (Leathers)" filed under `skills`.** `src/data/generic/index.ts:170` (Boatmen) —
  it's a talent; the identical Hired Thug entry (`:273`) places it correctly under `talents`.
- [ ] **25. Orphaned generic entry.** `src/data/generic/index.ts:43` `three-feathers-men-at-arms` is
  never referenced (scenario uses `three-feathers-bodyguards-men-at-arms`).
- [ ] **26. Slug/name mismatch.** `src/data/npcs/named/a-g.ts:418` — id
  `three-feathers-glimbrin-oddsock` vs display "Glimbrin Oddsocks". Cosmetic.
- [ ] **27. `consume` handler unguarded.** `src/hooks/useInventoryActions.ts:190-203` — would delete any
  item with count `<= 1`/no count; only safe because the UI restricts the button to consumables.

---

## Verified clean (no action)

- XP cost *formulas* in `advanceCosts.ts` are correct — the bug (#1) is that they're never charged.
- Career path↔step graph: all 256 steps referenced, no dangling/orphan refs, ranks 1–4 complete; no
  duplicate ids in any catalog; all scenario/character references resolve; characteristic codes valid.
- `rollMechanics.ts` / `weaponActionRollContext.ts` SL, doubles, hit-location, qualities math correct.
- Encumbrance, container, and coin math internally consistent.
- No SQL injection (prepared statements throughout); no path traversal (ids validated before `path.join`).

---

# Rules Accuracy TODO — validated vs Core Rulebook + Winds of Magic

Validation date: 2026-06-30. Method: extracted the text layer of `source/wfrp-4e-rulebook-opt.pdf`
and `source/wfrp-4e-winds-of-magic.pdf`, ran 7 parallel domain checks, headline findings
re-verified by hand against the book text.

Domains that validated **clean** (no action): XP advancement cost table; weapons & armour (31
weapons + 14 armours, only the crossbow `+` sign in #15 above); spells (55/55 on CN/Range/Target/
Duration); skill→characteristic associations (44/44); career structure + 8 sampled careers.

## 🔴 Creature traits — combat formulas (highest gameplay impact)

- [x] **R1. ✅ Natural-weapon damage double-counts Strength Bonus.** — FIXED, awaiting `npm test` on Node ≥22.
  - File: `src/data/rules/wfrp4e/creatureTraits.ts:193` (Bite), `:582` (Horns), `:932` (Tail),
    `:947` (Tentacles), `:1136` (Weapon)
  - All use `formula: "Strength Bonus + rating"`. The book states Rating already includes SB
    (core rulebook: "the creature's Strength Bonus already" / "Damage, which includes its Strength
    Bonus already"). Fix: damage = Rating (drop the `Strength Bonus +`).

- [x] **R2. ✅ Chill Grasp damage missing the die.** — FIXED (fc71711); `tests/creature-traits.spec.ts`.
  - Data `"10 + SL"` → book is `1d10 + SL` (ignores Toughness Bonus & armour).

- [x] **R3. ✅ Petrifying Gaze formula wrong.** — FIXED (fc71711); `tests/creature-traits.spec.ts`.
  - Data `"2 + SL"` → book is **1 Stunned per 2 SL** (SL÷2), plus permanent petrification at 6+ SL.

- [ ] **R4. Breath trigger wrong.** `creatureTraits.ts:233`
  - Data trigger `"Action"` → book: a **Free Attack costing 2 Advantage**.

- [ ] **R5. Daemonic parameter mislabeled.** `creatureTraits.ts:387`
  - Labeled `"Patron or source"`; the book's bracketed value is the `(Target)` ignore-blow roll
    (roll 1d10 ≥ Target → blow ignored). The ignore-blow mechanic is also not modeled.

## 🔴 Talents — `max` values  ✅ FIXED (session 2: 01a6124, 90e2ff8, 3dd521b)

> ⤵ **R6/R7 are now superseded by the validated lists in "Dataset completeness vs Core + Winds of
> Magic" at the bottom of this file** (exact wrong-max values, the full 108 missing-talent list, and
> the extra/unknown talents). Keep R6/R7 below for historical context only.

- [ ] **R6. Systematic wrong `max`: ~28 talents hardcode `"1"`/`"5"` where the book uses a
  Characteristic Bonus.** `src/data/rules/wfrp4e/talents.ts`
  - Verified examples: `public_speaker:373` (→ Fellowship Bonus), `combat_reflexes:262` (→ Initiative
    Bonus), `commanding_presence:269` (→ Fellowship Bonus), `fast_hands:298` (→ Dexterity Bonus),
    `luck:326` (→ Fellowship Bonus), `night_vision:346` (→ Initiative Bonus), `reversal:402` (→ WS
    Bonus), `speedreader:443` (→ Int Bonus), `sprinter:449` (→ Strength Bonus), `step_aside:456`
    (→ Agility Bonus), `wealthy:495` (→ None), `argumentative:219`, `attractive:233`, `blather:241`,
    `bookish:248`, `carouser:255`, `dealmaker:276`, `iron_will:311`, `menacing:330`, `mimic:337`,
    `relentless:393`, `shadow:414`, `sixth_sense:428`, `strike_mighty_blow:461`, `hatred:305`
    (→ Willpower Bonus), `etiquette:283` (→ Fellowship Bonus). Audit the full file against the
    Master Talent List.
  - [ ] Wrong characteristic on max: `gunner:188` `BS Bonus` → **Dexterity Bonus**;
    `magic_resistance:149` `Toughness Bonus` → **Max: 1**.

- [ ] **R7. Talents that don't exist in the Core list — remove or rename.** `talents.ts`
  - `public_speaking:378` — not a talent (it's the p120 Charm *skill rule*). The real talent
    `public_speaker` already exists → delete `public_speaking`.
  - `tough:474` — "Tough" is a creature *trait*, not a talent → remove (use Hardy/Robust).
  - `shields_up:40` — misnamed/duplicate of **Shieldsman**, which already exists at `:421` → remove.
  - `fanatical:289` — not found in either book → verify source or remove.
  - `suffuse_with_ulgu:467` — ⚠️ verify against *Winds of Magic* (likely a valid Lore-of-Shadow
    talent); keep if confirmed.

- [ ] **R8. Talent mechanic/tests drift (max may be right, effect described wrong).** `talents.ts`
  - `accurate_shot:212` describes the *Sniper* mechanic (range penalties) instead of +Damage.
  - `nimble_fingered:351`, `savvy:407`, `very_resilient:480` invent Tests; the book grants a flat
    +5 characteristic with no Tests line.

## 🟡 Skills

> ✅ **Full skills validation done (2026-06-30, session 2)** against Core + Winds of Magic. Result:
> all 45 core skills present; every characteristic and Basic/Advanced classification is **correct**.
> Only grouped-flag and specialisation-content issues remain (R9–R11 + R9b below). No missing skills.

- [x] **R9. `Art` missing its `grouped` flag.** — FIXED (a8d4635). `src/data/rules/wfrp4e/skills.ts` (`GROUPED_SPECIALISATIONS`)
  - VALIDATED: code already classifies Art as **basic** (the raw audit's "misclassified as Advanced" was
    wrong). Book: `Art (Dex) basic, grouped` — specialisations Cartography, Engraving, Mosaics, Painting,
    Sculpture, Tattoo, Weaving. Code does not mark it grouped.
- [~] **R9b. `Pray` is over-flagged as grouped.** — INTENTIONALLY KEPT grouped (a8d4635): used by
  characters (Pray (Sigmar)); documented inline as a deliberate deviation from strict Core. `skills.ts`
  - Book line ~6687: `Pray (Fel) advanced` — **not** a Grouped Skill (no specialisation list). Code defines
    `pray` with deity specialisations, so it renders grouped. Remove from grouped set (or confirm a
    house-rule intent).
- [x] **R10. Missing `grouped` flag.** — FIXED (a8d4635). `skills.ts` — `ride` (basic, grouped) and `sail`
  (advanced, grouped) are grouped in the book but not in `GROUPED_SPECIALISATIONS`.
- [x] **R11. Specialisation naming/content nits (Low).** — FIXED. Renamed `Polearm`→"Pole-Arm" (melee),
  `Magic`→"Magick" (lore), `Norsk`→"Norse" and `Guild`→"Guilder" (language), and added `Geology` (lore);
  `Dhar` (channelling) and `Vagabond` (secret signs) added in a8d4635. All character/career references to
  the renamed ids (melee_pole_arm, lore_magick, language_guilder/norse) were repointed. Perform/Play/Trade
  spec lists are left as-is (the book calls them "sample" lists, so the dataset's variants are defensible).
- Correction to raw audit: `psychometry` (code, Int/Advanced) is **NOT** in Core or Winds of Magic — it is
  from another supplement (likely *Up in Arms*/*Archives of the Empire*). Leave as unverified until the
  user adds that book.

## 🟡 Careers

- [ ] **R12. Entire careers dataset is missing characteristic-advance data.**
  - File: `src/data/rules/wfrp4e/careers/careerSteps.ts` — `characteristicAdvances: []` for all 256
    steps (documented at `:4`: PDF extraction couldn't map advance-scheme markers). Players cannot
    see which characteristics each career advances. Needs back-filling from the book's career tables.
- [ ] **R13. Master Pedlar has 5 talents (should be 4).** `careerSteps.ts:3871-3876`
  - `numismatics, sharp, sturdy, well_prepared, very_resilient`. Confirm the correct 4 against an
    authoritative source (`well_prepared` is the likely extra) — every career level has exactly 4.
- Note: the 3 broken career skill ids are already logged as #6 above
  (`bribe`→`bribery`, `intimidation`→`intimidate`, `set_traps`→`set_trap`).

---

# Dataset completeness vs Core + Winds of Magic (full validation, 2026-06-30 session 2)

> ✅ **FIXED (session 2).** Skills grouped flags + Dhar (a8d4635). Talent Max/mechanics (01a6124),
> non-Core talent removal + career repointing (90e2ff8), and all missing Core + WoM talents added
> (3dd521b) — talent catalog went 64 → 176. Two talents the first pass missed were also caught and
> added (Nose for Trouble, Witch!). Covered by tests/talents-data, talent-references, skills-data,
> career-steps specs. Remaining open: R11 naming nits (low), `street_fighting` (pending another book),
> and enriching the new talents' `tests`/typed `effects` (descriptions + Max are correct now).
> The lists below are kept for the record.

> Method: extracted both rulebooks with `pdftotext -layout` and ran two parallel by-name validations
> (talents, skills) of `src/data/rules/wfrp4e/talents.ts` and `skills.ts`. **Core checked first, then
> Winds of Magic.** Skills came back essentially complete (see R9–R11 above). Talents have a large gap:
> the code holds ~58 distinct talents; the Core book has ~160. Supersedes/refines R6–R8 with exact data.
> Specialisation families (Acute Sense, Resistance, Strider, Craftsman, Savant, Master Tradesman,
> Arcane/Chaos/Divine magic, etc.) are counted once and modelled as a single parameterised talent.

## 🔴 Talents — MISSING from Core Rulebook (108) — `talents.ts`

Each: `Name — Max — one-line effect`. (Add these to make the talent list complete.)

- [ ] Acute Sense — Initiative Bonus — Perception to detect imperceptible details (per-sense spec)
- [ ] Alley Cat — Initiative Bonus — reverse failed Stealth (Urban) Tests
- [ ] Ambidextrous — 2 — off-hand penalty reduced to -10 (none if taken twice)
- [ ] Animal Affinity — Willpower Bonus — Bestial creatures stay calm near you
- [ ] Arcane Magic (Lore) — 1 — learn/memorise spells from a chosen Arcane Lore
- [ ] Artistic — Dexterity Bonus — Trade (Artist); add to any Career
- [ ] Battle Rage — Willpower Bonus — end Frenzy with a Cool Test
- [ ] Beat Blade — Weapon Skill Bonus — Melee Test strips opponent Advantage
- [ ] Beneath Notice — Fellowship Bonus — higher-Status folk ignore you / gain no Advantage vs you
- [ ] Berserk Charge — Strength Bonus — +1 Damage/level to Melee on a Charge
- [ ] Break and Enter — Strength Bonus — +1 Damage/level vs inanimate objects
- [ ] Briber — Fellowship Bonus — reduce bribe cost 10%/level
- [ ] Cardsharp — Intelligence Bonus — use units die as SL when playing cards
- [ ] Careful Strike — Initiative Bonus — modify Hit Location by ±10/level
- [ ] Catfall — Agility Bonus — Athletics Test reduces fall distance
- [ ] Cat-tongued — Fellowship Bonus — targets can't oppose Charm-lies with Intuition
- [ ] Chaos Magic (Lore) — Spells available in chosen Chaos Lore — learn Chaos spells, gain Corruption
- [ ] Combat Master — Agility Bonus — count as +1 person when outnumbered, per level
- [ ] Concoct — Intelligence Bonus — free Crafting Endeavour w/ Trade (Apothecary), no workshop
- [ ] Contortionist — Agility Bonus — Perform/Agility when contorting
- [ ] Crack the Whip — Dexterity Bonus — +1 Movement to fleeing/running controlled animal
- [ ] Craftsman (Trade) — Dexterity Bonus — add a Trade Skill to any Career
- [ ] Criminal — None — earn coin illegally; treated as lower Status
- [ ] Deadeye Shot — 1 — pick ranged Hit Location instead of reversing dice
- [ ] Detect Artefact — Initiative Bonus — Intuition to sense magic in items
- [ ] Diceman — Intelligence Bonus — use units die as SL when playing dice
- [ ] Dirty Fighting — Weapon Skill Bonus — +1 Damage/level on Melee (Brawling)
- [ ] Disarm — Initiative Bonus — Opposed Melee Test to disarm
- [ ] Distract — Agility Bonus — Opposed Athletics/Cool denies opponent Advantage
- [ ] Dual Wielder — Agility Bonus — attack with both weapons in one Action
- [ ] Embezzle — Intelligence Bonus — Intelligence (Embezzling) to skim money
- [ ] Enclosed Fighter — Agility Bonus — ignore Melee penalties in confined spaces
- [ ] Fast Shot — Agility Bonus — fire before Initiative order next Round
- [ ] Fearless (Enemy) — Willpower Bonus — ignore Intimidate/Fear/Terror from a specified enemy
- [ ] Feint — Weapon Skill Bonus — Opposed Melee (Fencing) adds SL to next attack
- [ ] Field Dressing — Intelligence Bonus — reverse failed Heal Test in combat
- [ ] Fisherman — Initiative Bonus — auto-feed yourself + others
- [ ] Flagellant — Toughness Bonus — pain devotion; enter Frenzy without testing
- [ ] Fleet Footed — 1 — +1 Movement Attribute
- [ ] Frenzy — 1 — can Frenzy (p190)
- [ ] Frightening — Strength Bonus — Fear Rating 1, +1/level
- [ ] Furious Assault — Agility Bonus — spend Advantage/Move for an extra Melee attack
- [ ] Gregarious — Fellowship Bonus — reverse failed Gossip Tests with travellers
- [ ] Hardy — Toughness Bonus — +Toughness Bonus to Wounds
- [ ] Holy Hatred — Fellowship Bonus — +1 Damage with Miracles/level
- [ ] Holy Visions — Initiative Bonus — Intuition for visions on Holy Ground
- [ ] Hunter's Eye — Initiative Bonus — auto-hunt food for yourself + others
- [ ] Implacable — Toughness Bonus — ignore Wound loss from Bleeding/level
- [ ] In-fighter — Dexterity Bonus — no penalty vs longer weapons; +10 in-fighting
- [ ] Inspiring — Fellowship Bonus — Leadership influences far more people at war
- [ ] Invoke (Divine Lore) — 1 — empower a Cult's Miracles; buy more for XP
- [ ] Iron Jaw — Toughness Bonus — Endurance Test to shrug off Stunned
- [ ] Jump Up — 1 — Agility Test to stand from Prone
- [ ] Kingpin — 1 — ignore Status loss of Criminal Talent
- [ ] Lightning Reflexes — 1 — +5 starting Agility
- [ ] Linguistics — Intelligence Bonus — learn Languages as Basic after a month
- [ ] Magical Sense — Initiative Bonus — Intuition to detect Wizards
- [ ] Magnum Opus — None — create unrivalled masterwork art/trade pieces
- [ ] Master of Disguise — Fellowship Bonus — disguise without a kit
- [ ] Master Orator — Fellowship Bonus — +SL to Public Speaking Charm Tests
- [ ] Master Tradesman (Trade) — Dexterity Bonus — reduce required SL on Extended Trade Tests
- [ ] Numismatics — Initiative Bonus — judge coin value/forgeries without a Test
- [ ] Old Salt — Agility Bonus — ignore sea-weather penalties; count as two crew
- [ ] Orientation — Initiative Bonus — always know which way is north
- [ ] Panhandle — Fellowship Bonus — Charm (Begging) every half-hour
- [ ] Pharmacist — Intelligence Bonus — reverse failed Trade (Apothecary) Tests
- [ ] Pilot — Initiative Bonus — reverse failed Tests navigating dangerous waters
- [ ] Pure Soul — Willpower Bonus — extra Corruption before testing
- [ ] Rapid Reload — Dexterity Bonus — +SL to ranged reload Tests
- [ ] Reaction Strike — Initiative Bonus — Initiative Test for a Free Attack when Charged
- [ ] Resistance (Threat) — Toughness Bonus — auto-pass first Test vs a threat/session (code only has Corruption spec)
- [ ] Resolute — Strength Bonus — +level to Strength Bonus on a Charge
- [ ] Riposte — Agility Bonus — counterattack with a Fast weapon when defending
- [ ] River Guide — Initiative Bonus — no Test for dangerous river stretches
- [ ] Robust — Toughness Bonus — reduce incoming Damage +1/level
- [ ] Roughrider — Agility Bonus — mount takes an Action without a Ride Test
- [ ] Rover — Agility Bonus — no passive Perception vs your rural Stealth
- [ ] Savant (Lore) — Intelligence Bonus — auto-know facts in a field (code only has Engineering spec)
- [ ] Scale Sheer Surface — Strength Bonus — climb near-impossible surfaces
- [ ] Schemer — Intelligence Bonus — ask GM a political question once/session
- [ ] Sea Legs — Toughness Bonus — never test vs Sea Sickness
- [ ] Seasoned Traveller — Intelligence Bonus — add Lore (Local) to any Career
- [ ] Secret Identity — Intelligence Bonus — maintain alternate-Status identities
- [ ] Sharp — 1 — +5 starting Initiative
- [ ] Sharpshooter — 1 — ignore Difficulty penalties for target size (ranged)
- [ ] Slayer — 1 — use target's Toughness Bonus as Strength Bonus if higher
- [ ] Sniper — 4 — no penalty at Long range, half at Extreme
- [ ] Stone Soup — Toughness Bonus — subsist on half food
- [ ] Stout-hearted — Willpower Bonus — Cool Test to remove Broken each Turn
- [ ] Strider (Terrain) — Agility Bonus — ignore movement penalties in a terrain type
- [ ] Strong Back — Strength Bonus — +SL Opposed Strength; carry more Encumbrance
- [ ] Strong Legs — Strength Bonus — +SL to Athletics (Leaping)
- [ ] Strong-minded — Willpower Bonus — +level to max Resolve
- [ ] Strong Swimmer — Strength Bonus — +level to Toughness Bonus for holding breath
- [ ] Super Numerate — Intelligence Bonus — Evaluate/Gamble; mental calculation
- [ ] Supportive — Fellowship Bonus — use units die as SL influencing superiors
- [ ] Sure Shot — Initiative Bonus — ignore Armour Points = level (ranged)
- [ ] Surgery — Intelligence Bonus — treat Surgery Criticals; perform surgery
- [ ] Tenacious — Toughness Bonus — double duration of endured hardships
- [ ] Tinker — Dexterity Bonus — count Trade Skills as Basic when repairing
- [ ] Tower of Memories — Intelligence Bonus — perfectly recall sequences of facts
- [ ] Trapper — Initiative Bonus — auto-spot traps with Perception
- [ ] Trick Riding — Agility Bonus — Performer Skills + Dodge on horseback
- [ ] Tunnel Rat — Agility Bonus — no passive Perception vs your underground Stealth
- [ ] Unshakable — Willpower Bonus — only test vs Broken when wounded by Blackpowder
- [ ] War Leader — Fellowship Bonus — subordinates add level to a Willpower Test/Round
- [ ] War Wizard — 1 — cast a CN≤5 spell free without using your Action
- [ ] Waterman — Agility Bonus — ignore river-vessel penalties; count as two crew
- [ ] Well-prepared — Initiative Bonus — pull a needed cheap trapping from your pack

## 🔴 Talents — WRONG `max` in Core (supersedes R6, exact values) — `talents.ts`

The recurring bug: a flat `"1"`/`"5"` where the book uses a Characteristic Bonus or "None".
- [ ] Argumentative: `1` → **Fellowship Bonus**
- [ ] Attractive: `1` → **Fellowship Bonus**
- [ ] Carouser: `1` → **Toughness Bonus**
- [ ] Combat Reflexes: `5` → **Initiative Bonus**
- [ ] Commanding Presence: `5` → **Fellowship Bonus**
- [ ] Dealmaker: `1` → **Fellowship Bonus**
- [ ] Etiquette (grouped): `1` → **Fellowship Bonus**
- [ ] Fast Hands: `5` → **Dexterity Bonus**
- [ ] Hatred (grouped): `1` → **Willpower Bonus**
- [ ] Iron Will: `1` → **Willpower Bonus**
- [ ] Lip Reading: `1` → **Initiative Bonus**
- [ ] Luck: `5` → **Fellowship Bonus**
- [ ] Menacing: `1` → **Strength Bonus**
- [ ] Mimic: `1` → **Initiative Bonus**
- [ ] Night Vision: `5` → **Initiative Bonus**
- [ ] Public Speaker: `5` → **Fellowship Bonus**
- [ ] Relentless: `1` → **Agility Bonus**
- [ ] Reversal: `5` → **Weapon Skill Bonus**
- [ ] Shadow: `1` → **Agility Bonus**
- [ ] Shieldsman: `1` → **Strength Bonus**
- [ ] Sixth Sense: `1` → **Initiative Bonus**
- [ ] Speedreader: `5` → **Intelligence Bonus**
- [ ] Sprinter: `5` → **Strength Bonus**
- [ ] Step Aside: `5` → **Agility Bonus**
- [ ] Strike Mighty Blow: `1` → **Strength Bonus**
- [ ] Wealthy: `5` → **None**

## 🔴 Talents — wrong MECHANIC (not just max) — `talents.ts`
- [ ] **Gunner**: code max `BS Bonus` + "ranged Tests" effect → book is **Dexterity Bonus**, effect is
  *reload blackpowder weapons faster* (not a ranged-attack bonus).
- [ ] **Magic Resistance**: code max `Toughness Bonus` + per-level SL bonus → book is **Max: 1**, effect is
  *oppose spells targeting you with Willpower* (no SL bonus).

## 🟠 Talents — extra / unverified in code (supersedes R7) — `talents.ts`
- [ ] `shields_up` — **remove**: misnamed duplicate of **Shieldsman** (which exists; fix its max above).
- [ ] `public_speaking` — **remove**: duplicate of **Public Speaker** (the real talent).
- [ ] `tough` — **remove/rename**: no "Tough" talent in Core or WoM (use Hardy/Robust/Very Resilient).
- [ ] `fanatical` — **verify/remove**: not found in Core or WoM.
- [ ] `armour`, `ranged`, `weapon`, `prejudice` — grouped meta-entries that are **not** Core *player*
  talents (equipment/creature-trait/Psychology constructs). Confirm they're intentional app constructs.
- `suffuse_with_ulgu` — **WoM-valid** but should be the grouped "Suffuse With (Wind)" talent (see below).

## 🟡 Talents — Winds of Magic additions (do after Core) — `talents.ts`
- [ ] **Suffuse With (Wind)** — Max 1 — grouped over the 8 Winds (Aqshy, Azyr, Chamon, Ghur, Ghyran, Hysh,
  Shyish, Ulgu); +1 SL to Lore spells cast within 8 yds + a per-Wind effect. Replace the single
  `suffuse_with_ulgu` with this grouped form.
- [ ] **Magical Assistant** — Max 1 — Power-Familiar only; familiar gives +20 to creator's
  Channelling / Lore (Magic) / Language (Magick) / Research Tests.
- Note: WoM has no fresh alphabetical talent list; it reuses Core talents + reprints an updated **Concoct**
  (now also Trade (Alchemist)). Concoct is already in the Core-missing list above.
