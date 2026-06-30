# Bug Audit TODO — Tirsdagsrollespil (WFRP 4E)

Audit date: 2026-06-30. Method: 5 parallel read-only subsystem audits + `tsc --noEmit` and
typography lint (both pass clean — every item below is a logic/runtime bug the type checker
cannot catch).

Legend: `[✅]` = independently verified against source · `[ ]` = agent-reported, verify before fixing.

Suggested fix order: #1 → #2 → #3 → #4/#5 → #6. The first three corrupt or lose real player data.

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

- [ ] **2. ✅ Compression middleware silently breaks SSE in production.**
  - Files: `server.mjs:471-515`, `:906`, `:928`
  - `compressionMiddleware` (global, before the SSE route) overrides `res.write` to buffer chunks and
    only flushes inside `res.end`. SSE never calls `res.end`, so `: connected`, `: ping`, and every
    broadcast event are buffered and never sent. Real-time sync is dead for any browser sending
    `Accept-Encoding` (all of them).
  - Fix: bypass the middleware for `text/event-stream` / the events route.

- [ ] **3. ✅ Saves can fail completely silently.**
  - File: `src/data/persistence.ts:111-125`
  - `writeCharacterProgressFile` never checks `response.ok`; `await fetch` only rejects on network
    errors, so HTTP 500/413/409 is treated as a successful save. No retry, no UI error — the
    "saved … ago" indicator lies.

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

- [ ] **6. ✅ Three broken skill references in career steps.**
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

- [ ] **15. ✅ Crossbow damage `"9"` instead of `"+9"`.**
  - File: `src/data/rules/wfrp4e/weapons.ts:678`
  - Inconsistent with every other ranged weapon's `"+N"` format; parses differently. WFRP4e Crossbow
    is Damage +9.

- [ ] **16. Shop consumables don't stack.**
  - File: `src/hooks/useInventoryActions.ts:240-272`
  - Buying an already-owned consumable creates a duplicate stack (`shop-${id}-${Date.now()}`) instead
    of incrementing quantity.

- [ ] **17. ✅ Duplicate talent on a player character.**
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

- [ ] **R2. ✅ Chill Grasp damage missing the die.** `creatureTraits.ts:277`
  - Data `"10 + SL"` → book is `1d10 + SL` (ignores Toughness Bonus & armour).

- [ ] **R3. ✅ Petrifying Gaze formula wrong.** `creatureTraits.ts:759`
  - Data `"2 + SL"` → book is **1 Stunned per 2 SL** (SL÷2), plus permanent petrification at 6+ SL.

- [ ] **R4. Breath trigger wrong.** `creatureTraits.ts:233`
  - Data trigger `"Action"` → book: a **Free Attack costing 2 Advantage**.

- [ ] **R5. Daemonic parameter mislabeled.** `creatureTraits.ts:387`
  - Labeled `"Patron or source"`; the book's bracketed value is the `(Target)` ignore-blow roll
    (roll 1d10 ≥ Target → blow ignored). The ignore-blow mechanic is also not modeled.

## 🔴 Talents — `max` values

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

- [ ] **R9. `Art` misclassified as Advanced.** `src/data/rules/wfrp4e/skills.ts:335`
  - Book: `Art (Dex) basic, grouped`. Should be **basic**, and is missing its `grouped` flag.
- [ ] **R10. Missing `grouped` flag.** `skills.ts` — `ride` and `sail` are grouped in the book but
  not listed in `GROUPED_SPECIALISATIONS`.
- [ ] **R11. Specialisation naming nits (Low).** `Polearm`→"Pole-Arm" (melee), `Magic`→"Magick"
  (lore), `Norsk`→"Norse" / `Guild`→"Guilder" (language), `channelling` omits **Dhar**.
  (Note: the book's specialisation lists are explicitly "sample" lists, so additions are defensible.)
- Correction to raw audit: `psychometry` is **valid** (*Winds of Magic*, Int/Advanced) — not a bug.

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
