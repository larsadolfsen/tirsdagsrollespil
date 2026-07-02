# Rules

### Tests Overview

A Test compares a d100 roll to a Skill or Characteristic (modified by Difficulty). Rolling equal to or under the target succeeds; rolling over fails. Rolling 01–05 is always a success and rolling 96–00 is always a failure, regardless of the modified target number.

- **Simple Test**: a plain yes/no roll used for quick, low-stakes actions.
- **Dramatic Test**: used when the degree of success or failure matters (e.g. Opposed Tests, magic, combat, pivotal moments). Produces a Success Level rather than a flat yes/no.
- If the outcome isn't uncertain or dramatic enough to need dice, the GM may simply decide the result without a Test.

### Success Levels (SL)

Subtract the tens digit of the roll from the tens digit of the (modified) target number to get the SL. Positive SL means success; negative (or zero-or-below on a fail) means failure. An automatic success (01–05) scores at least +1 SL; an automatic failure (96–00) scores at least –1 SL.

#### Outcomes Table

| SL | Result |
| --- | --- |
| +6 or more | Astounding Success |
| +4 to +5 | Impressive Success |
| +2 to +3 | Success |
| 0 to +1 | Marginal Success |
| –1 to 0 | Marginal Failure |
| –2 to –3 | Failure |
| –4 to –5 | Impressive Failure |
| –6 or less | Astounding Failure |

### Difficulty

The GM assigns a modifier reflecting how hard a Test is; this is added to (or subtracted from) the Skill/Characteristic before rolling.

#### Difficulty Table

| Difficulty | Modifier |
| --- | --- |
| Very Easy | +60 |
| Easy | +40 |
| Average | +20 |
| Challenging | +0 |
| Difficult | –10 |
| Hard | –20 |
| Very Hard | –30 |

When multiple penalties or multiple bonuses apply to the same Test, add them together but cap the total at Very Hard (–30) or Very Easy (+60). When a penalty and a bonus both apply, add them together normally to find the net Difficulty. Combat Difficulty defaults to Challenging (+0) unless stated otherwise.

### Characteristic Tests

If no Skill fits an attempted action, Test the most relevant Characteristic directly instead.

### Opposed Tests

Both sides make a Dramatic Test of the relevant Skill/Characteristic; whoever scores the higher SL wins. Ties are broken by the higher unmodified Skill/Characteristic; if still tied, the GM either calls it a stalemate or has both sides reroll. Difficulty for an Opposed Test defaults to Challenging (+0) and, unless stated otherwise, applies equally to both sides.

### Extended Tests

Used when a task requires accumulating a target number of SL over multiple rolls (e.g. one roll per Round). SL from each roll is added to a running total; if the running total ever drops below 0, it resets to 0 before the next roll. Reaching the target SL completes the task.

### Combining Skills

Two Skills can be tested together with a single roll compared against each Skill's value separately: passing both is a full success, passing one is a partial success, failing both is a full failure.

### Assistance

A character may help another who is about to make a Test; the assisted character's Test gains +10 per assisting character. Rules:

- The assisting character needs at least 1 Advance in the Skill being tested.
- Assisting characters must normally be adjacent to the character taking the Test.
- Assistance is not allowed on Tests to resist disease, poison, fear, hazards, or similar (GM's call).
- The number of characters that can assist you is capped at your relevant Characteristic Bonus.

### Tests Above 100% (Optional)

A successful Test gains +1 SL for every full 10% the modified Skill/Characteristic exceeds 100%.

### Criticals and Fumbles on Simple Tests (Optional)

A successful Test that also rolls a double counts as an Astounding Success; a failed Test that rolls a double counts as an Astounding Failure.

## Combat

### Timing Structure

- **Round**: enough time for every combatant to act and reposition.
- **Turn**: each combatant's individual slice of a Round, containing one Move and one Action.
- **Initiative Order**: Turns are taken in descending Initiative Characteristic order. Ties are broken by Agility, then by an Opposed Agility Test (winner decides who goes first).

### Combat Sequence

1. Determine Surprise (normally only on the first Round).
2. Round begins; any start-of-Round effects trigger.
3. Combatants take Turns in Initiative order.
4. Round ends; any end-of-Round effects trigger.
5. Repeat until the combat is resolved.

### Surprise

An attacker can try for Surprise via hiding (Stealth, possibly opposed by a defender's Perception), sneaky positioning, distractions, or simply catching unprepared victims unawares. If ambushers might be spotted, roll an Opposed Stealth (weakest Stealth among the ambushers) vs Perception (each potential spotter) Test; ambushers who win give each defeated defender the Surprised Condition. A character can spend a Resolve point to remove the Surprised Condition.

### Turn Structure

Each Turn consists of a Move and an Action, in either order (or either/both skipped). Actions not requiring a Test are generally Free Actions and don't use up the Action for the Turn.

#### Defensive Stance (Optional)

Declaring a Skill as your defensive Action grants +20 to defensive Tests using that Skill until your next Turn.

### Attacking

#### 1. Roll to Hit

- **Melee**: an Opposed Melee Test against the defender. The higher SL hits; the winner gains +1 Advantage, the loser (if it's the defender) also gains +1 Advantage if they win instead.
- **Ranged**: a simple Ranged Test; success hits and grants +1 Advantage; failure ends the Action with no Advantage change.
- A melee defender may Oppose with Dodge or, with GM approval, another appropriate Skill instead of Melee.
- Ranged attacks generally cannot be Opposed by Melee Skills unless the defender has a large shield or the attack is at Point Blank range.

#### 2. Determine Hit Location

Reverse the digits of the to-hit roll and compare to the Hit Locations table.

| Roll | Location |
| --- | --- |
| 01–09 | Head |
| 10–24 | Left Arm (or Secondary Arm) |
| 25–44 | Right Arm (or Primary Arm) |
| 45–79 | Body |
| 80–89 | Left Leg |
| 90–00 | Right Leg |

#### 3. Determine Damage

Damage = the weapon's Weapon Damage rating + the SL scored on the hit.

#### 4. Apply Damage

Wounds lost = Damage – (defender's Toughness Bonus + Armour Points at that location), minimum 1 Wound lost on a successful hit. If this would exceed the defender's remaining Wounds, the defender instead suffers a Critical Wound and gains the Prone Condition.

### Engaged

Attacking or being attacked in melee makes both parties Engaged; this lasts until a full Round passes without either attacking the other.

### Criticals and Fumbles (Combat)

- **Critical**: any successful Melee/Ranged Test that also rolls a double. The target immediately suffers a Critical Wound in addition to normal SL/damage resolution.
- **Fumble**: any failed Melee/Ranged Test that also rolls a double. Roll on the Oops! Table.
- Losing an Opposed Test while fumbling is still possible if your SL is higher than your opponent's.
- Blackpowder/Engineering/Explosive weapons that Fumble on an even double instead Misfire: the wielder takes full Damage to their Primary Arm (units die as SL) and the weapon is destroyed.

#### Oops! Table

| Roll | Effect |
| --- | --- |
| 01–20 | Lose 1 Wound (ignores Toughness Bonus/Armour). |
| 21–40 | Weapon takes 1 Damage; act last next Round regardless of Initiative. |
| 41–60 | –10 penalty to your next Action. |
| 61–70 | Lose your next Move. |
| 71–80 | Miss your next Action. |
| 81–90 | Suffer a Torn Muscle (Minor) injury; counts as a Critical Wound. |
| 91–00 | Hit a random ally in range (units die as SL) or, if impossible, hit yourself and gain the Stunned Condition. |

### Ranged Combat Notes

- Cannot make ranged attacks while Engaged unless the weapon has the Pistol Quality.
- Attacking with Ranged while Engaged lets the target Oppose with any Melee Skill.
- On a failed Ranged (Throwing) Test, roll 1d10 for Scatter direction (1–8 = direction, then 2d10 yards of distance, capped at half the distance to the target; 9 = lands at the thrower's feet; 10 = lands at the target's feet).

### Combat Difficulty Modifiers

| Difficulty | Modifier | Common triggers |
| --- | --- | --- |
| Very Easy | +60 | Shooting a Monstrous target; shooting into a 13+ crowd. |
| Easy | +40 | Point Blank range; shooting an Enormous target; outnumbering 3:1; shooting a Large group (7–12). |
| Average | +20 | Shooting a Large target; Short Range; shooting a small group (3–6); shooting after aiming; attacking an Engaged target's flank/rear; outnumbering 2:1; attacking a Prone target. |
| Challenging | +0 | Standard attack; shooting an Average-size target. |
| Difficult | –10 | Attacking while Prone or below your target; mud/heavy rain/difficult terrain; Long Range; shooting after moving; shooting a small (Child-size) target; target in soft cover. |
| Hard | –20 | Called shot to a location; fighting an oversized weapon in an enclosed space; fog/mist/shadow; extreme weather; Dodging while Prone or mounted; darkness; a Little-size target; off-hand weapon use; medium cover. |
| Very Hard | –30 | Fighting in deep snow/water/arduous terrain; a Tiny target; Extreme range; darkness (shooting); hard cover. |

### Size

| Size | Height/Length | Examples | Modifier |
| --- | --- | --- | --- |
| Tiny | Under 1 foot | Butterfly, Mouse, Pigeon | –30 |
| Little | Up to 2 feet | Cat, Hawk, Human Baby | –20 |
| Small | Up to 4 feet | Giant Rat, Halfling, Human Child | –10 |
| Average | Up to 7 feet | Dwarf, Elf, Human | 0 |
| Large | Up to 12 feet | Horse, Ogre, Troll | +20 |
| Enormous | Up to 20 feet | Griffon, Wyvern, Manticore | +40 |
| Monstrous | 20+ feet | Dragon, Giant, Daemon Prince | +60 |

### Special Combat Cases

- **Helpless targets**: melee attacks against a sleeping, unconscious, or otherwise helpless target automatically succeed.
- **Shooting into a group**: Average (+20) for 3–6 targets, Easy (+40) for 7–12, Very Easy (+60) for 13+; hits are randomised among the group.
- **Outnumbering**: +20 to hit at 2:1, +40 at 3:1; outnumbered combatants lose 1 Advantage at the end of each Round they remain outnumbered.
- **Two-Weapon Fighting**: usable with any one-handed melee weapon or pistol in either hand; attacks with the off-hand suffer –20 unless mitigated by a Talent that allows attacking with both weapons.
- **Grappling**: an unarmed Melee win lets the attacker declare a Grapple instead of dealing damage; the loser gains the Entangled Condition. While Grappling, breaking free (if you begin your Turn with higher Advantage) needs no Test; otherwise it's an Opposed Strength Test, won by dealing Strength Bonus + SL damage (ignoring Armour) or manipulating Entangled Conditions. Non-grapplers gain +20 to hit the grappler with the lowest Advantage and +10 to hit the one with the highest.
- **Mounted Combat**: rider's Move uses the mount's Movement; melee attacks against smaller targets gain +20; attackers choosing to hit a mounted rider (while smaller than the mount) suffer –10; an unrestrained mount can act independently; Charging uses the mount's Strength/Size for damage; riders suffer –20 to Dodge unless they have Trick Riding.

### Advantage

Advantage represents battlefield momentum, tracked as tokens. Each point of Advantage grants +10 to relevant combat and Psychology Tests.

- Gained (examples): +1 for a successful Surprise attack, +1 for Charging, +1 for a tactical Skill use the GM approves, +1 (or +2 vs a key foe) for defeating an important NPC, +1 for winning an Opposed Test in combat, +1 for wounding an opponent outside an Opposed Test.
- Lost: all Advantage is lost when you lose an Opposed Test, suffer a Condition, lose Wounds, when combat ends, or (1 point) when you gain none in a Round or end a Round outnumbered.
- Advantage can be spent to Disengage (see below).

### Moving

#### Movement Table

| Movement | Walk (yards) | Run (yards) |
| --- | --- | --- |
| 0 | 0 | 0 |
| 1 | 2 | 4 |
| 2 | 4 | 8 |
| 3 | 6 | 12 |
| 4 | 8 | 16 |
| 5 | 10 | 20 |
| 6 | 12 | 24 |
| 7 | 14 | 28 |
| 8 | 16 | 32 |
| 9 | 18 | 36 |
| 10 | 20 | 40 |

- **Charging**: usable only if not already Engaged; the Action must be a melee attack. If the target starts at least your Move away (but within Run range), you gain +1 Advantage on the charge.
- **Disengaging**: if you have more Advantage than your opponents, you may drop your Advantage to 0 to move away freely. Otherwise, escaping requires an Opposed Dodge vs Melee Test as your Action; winning grants +1 Advantage and a free Move; losing lets each victorious opponent gain +1 Advantage and traps you.
- **Fleeing**: your Move becomes turning and running; the opponent gains +1 Advantage and one free unopposed Melee attack at +20 to hit, using their SL as Damage. Being hit grants the opponent another +1 Advantage and forces a Challenging (+0) Cool Test or the fleeing character gains a Broken Condition (plus one more per SL below 0). After the free attack, the fleeing character may move up to their Run distance.
- **Running**: spending your Action to sprint requires an Average (+20) Athletics Test; you cover Run distance + SL yards, in addition to your normal Move.
- **Climbing**: easy surfaces (e.g. ladders) need no Test but halve your Movement. A harder climb, tested with an Average (+20) Climb Test as your Action, covers ½ Movement + SL yards. Climb difficulty and any Talent requirements are set by the GM.
- **Leaping**: leaping your Movement in feet needs no Test. Farther requires an Average (+20) Athletics Test (Challenging +0 without an adequate run-up); each SL beyond 0 adds a foot, and a +0 SL success still adds 6 inches.
- **Falling**: 1d10 Damage plus 3 Damage per yard fallen, reduced by Toughness Bonus (not Armour). A deliberate fall/jump allows an Average (+20) Athletics Test to reduce the effective fall distance by 1 yard plus 1 per SL; reducing it to 0 or below negates all damage. Falling damage exceeding your Toughness Bonus also inflicts Prone.

### Pursuit

1. **Determine Distance**: the GM sets a head-start number (Distance) for the pursued.
2. **Test**: everyone actively involved rolls a movement-related Test (Drive, Ride, Athletics, etc.) each Round.
3. **Update Distance**: compare the pursued's lowest SL to the pursuers' highest SL; the difference reduces Distance if the pursuers won, or increases it if the pursued won.
4. **Determine Outcome**: Distance at 0 or less means the pursuers catch up (the pursued can sacrifice their slowest member or turn to fight); Distance at 10+ means the pursued escape; otherwise the pursuit continues.

A faster Movement grants bonus SL to the pursuit Test equal to the Movement difference.

### Conditions

Conditions represent ongoing effects. Any Condition gained immediately removes all Advantage. Multiple copies of the same Condition stack their penalties; different Conditions do not stack with each other (the worse single penalty applies).

#### Condition List

Ablaze, Bleeding, Blinded, Broken, Deafened, Entangled, Fatigued, Poisoned, Prone, Stunned, Surprised, Unconscious.

| Condition | Core effect | Removal |
| --- | --- | --- |
| Ablaze | 1d10 Wounds (Toughness/Armour reduce it, min 1) at end of Round per stack, +1 Damage per extra stack. | Athletics Test removes 1, +1 per SL. |
| Bleeding | Lose 1 Wound at end of Round (unmodified); –10 to resist Festering Wounds/Infection/Blood Rot; at 0 Wounds falls Unconscious instead; 10% death chance per stack at end of Round. | Heal Test removes 1, +1 per SL; healing spells/prayers remove 1 per Wound healed. Gain 1 Fatigued once cleared. |
| Blinded | –10 to sight-based Tests; melee attackers gain +10 to hit you. | 1 removed every other Round. |
| Broken | Move/Action must be spent fleeing/hiding; –10 to other Tests; cannot rally while Engaged. | Cool Test at end of Round when unengaged removes 1, +1 per SL; a full Round hidden from all enemies removes 1. Gain 1 Fatigued once cleared. |
| Deafened | –10 to hearing-based Tests; flank/rear melee attackers gain +10 to hit (does not stack). | 1 removed every other Round. |
| Entangled | Cannot Move; movement-related actions suffer –10. | Action spent winning an Opposed Strength Test against the source removes 1, +1 per SL. |
| Fatigued | –10 to all Tests. | Rest, a spell/prayer, or removing the underlying cause (e.g. Encumbrance). |
| Poisoned | Lose 1 Wound at end of Round (unmodified); –10 to all Tests; cannot heal Wounds at 0 Wounds until cleared; risk of death if Unconscious while Poisoned. | Endurance Test (or Heal Test) removes 1, +1 per SL. Gain 1 Fatigued once cleared. |
| Prone | Move can only stand up or crawl at half Movement; –20 to movement-related Tests; melee attackers gain +20 to hit. Does not stack. | Standing up removes it. |
| Stunned | No Action; half Movement; –10 to all Tests; cannot defend with Language (Magick); melee attackers gain +1 Advantage before the attack roll. | Challenging (+0) Endurance Test at end of Round removes 1, +1 per SL. Gain 1 Fatigued (if none already) once cleared. |
| Surprised | No Action or Move; cannot defend in Opposed Tests; melee attackers gain +20 to hit. Does not stack. | Removed at end of Round or after the first attack against you. |
| Unconscious | No Action; unaware of surroundings; melee hits automatically hit at maximum SL and inflict a Critical Wound (or simply kill, GM's choice); ranged hits at Point Blank do the same. Does not stack. | Depends on cause (see Injury); spending a Resolve point removes it but it returns at end of Round if the cause is unresolved; on recovery, gain Prone and Fatigued. |

## Fate, Resilience, Fortune, Resolve

Fate and Resilience are permanent pools set at character creation; Fortune and Resolve are their refillable "spend" pools.

### Spending Fortune

Spend 1 Fortune point to: reroll a failed Test, add +1 SL to an already-rolled Test, or choose your place in Initiative order for the Round.

### Spending Fate

Spend 1 permanent Fate point (this also removes a Fortune point from the max pool) to avoid death, choosing either: Die Another Day (character is removed from the encounter but survives) or How Did That Miss? (character avoids the damage and keeps fighting, without a guarantee of surviving later Rounds).

### Regaining Fate and Fortune

Fortune refills to current Fate at the start of each session. Fate is regained only rarely, typically as a GM reward for a significant heroic act.

### Spending Resolve

Spend 1 Resolve point to: become immune to Psychology until the end of the next Round, ignore all Critical Wound modifiers until the start of the next Round, or remove one Condition (removing Prone this way also restores 1 Wound).

### Spending Resilience

Spend 1 permanent Resilience point (also reduces the max Resolve pool) to either: decline to develop a rolled mutation (no Corruption point lost for it), or replace a rolled Test result with a chosen result (in an Opposed Test this guarantees winning by at least 1 SL, and can be applied even after a Test has already failed).

### Regaining Resilience and Resolve

Resolve is regained by acting according to your Motivation, subject to GM approval. Resilience is regained only rarely as a GM reward tied to a Motivation-driven act of major significance.

## Injury

### Wounds

Each point of Damage suffered removes 1 Wound (after Toughness Bonus/Armour Point reductions where applicable). Reaching 0 Wounds inflicts Prone; if not healed at least 1 Wound within a number of Rounds equal to Toughness Bonus, the character also falls Unconscious. Damage that would take Wounds below 0 instead inflicts a Critical Wound (Wounds never go negative); if the excess is less than the Toughness Bonus, subtract 20 from the Critical Table roll (minimum 01).

### Critical Wounds

Triggered by a Critical Hit or by Damage exceeding remaining Wounds. Roll 1d100 to find the Hit Location, then 1d100 on the matching Critical Table for the effect. Critical Wound damage ignores Toughness Bonus/Armour and cannot itself trigger a further Critical Wound.

### Death

If Unconscious at 0 Wounds, compare total Critical Wounds to Toughness Bonus; exceeding it means death at the end of the Round unless a Critical Wound is healed first. An Unconscious character can also simply be killed by an attacker using a suitable weapon.

### Critical Wound Tables (summary)

Each Critical Table (Head, Arm, Body, Leg) lists a d100 range with a Wounds value and an effect, escalating in severity; the 00 result on each table is instant death. Common effects include stacking Bleeding/Blinded/Deafened/Stunned Conditions, Broken Bone or Torn Muscle injuries, and Amputation at a stated Difficulty.

#### Broken Bones

- **Minor**: the Hit Location is unusable until healed (limbs are treated as lost for that time; Head hits force a liquid diet and –30 to Language Tests; Body hits cause –30 Strength/Agility and halved Move). Heals in 30+1d10 days; a failed Endurance Test at the end leaves a permanent –5 penalty (to Agility Tests for an arm, to Agility itself for Body/Leg, or to spoken Language for Head). An Average (+20) Heal Test within a week (kept in place with upkeep Tests) can avoid the Endurance Test.
- **Major**: heals only with medical attention; while healing, suffers double the Minor penalty (–20).

#### Torn Muscles

- **Minor**: –10 to Tests involving the affected location (halved Movement if a Leg).
- **Major**: –20 to Tests involving the location; heals to Minor-level penalty after 30 minus Toughness Bonus days, then fully after another equal period.

#### Amputated Parts

Losing a body part requires an Endurance Test (Difficulty stated with the wound) or gain Prone (plus Stunned on a Failure or worse, plus Unconscious on an Impressive Failure or worse). All amputations require Surgery before the associated lost Wound can be healed. Permanent penalties vary by part (examples: lost hand –20 to two-handed/off-hand Tests; lost eye –30 to sight-based Tests if both are lost, plus Fellowship penalties per visible scar; lost ear –20 to hearing Perception if both lost; lost foot halves Move and –20 to mobility Tests; lost nose –20 Fellowship and –30 to smell-based Tests; lost teeth –1 Fellowship per two teeth; lost toes –1 Agility and Weapon Skill each; lost tongue auto-fails spoken Language Tests).

### Healing

- **Wounds**: an Average (+20) Endurance Test after a full night's rest heals SL + Toughness Bonus Wounds; extra rest days each heal a further Toughness Bonus Wounds. Faster healing needs the Heal skill or medical supplies. Being wounded carries no inherent penalty.
- **Critical Wounds**: remain "Critically Wounded" (and subject to their listed penalties/Conditions) until all associated Conditions are removed and all temporary penalties resolved; Wounds can still be healed normally in the meantime.
- **Medical Attention / Surgery**: some Critical Wound results only clear with Heal skill use, bandages/poultices, or magical/divine healing; results marked Surgery require a trained doctor (or magical equivalent) before their penalty ends, and an amputated Wound cannot be healed until surgically treated.

### Other Sources of Damage

- **Drowning/Suffocation**: can hold breath for Toughness Bonus × 10 seconds if prepared; thereafter (or immediately if unprepared) lose 1 Wound per Round, falling Unconscious at 0 Wounds, then dying after Toughness Bonus further Rounds.
- **Exposure**: an Endurance Test every 4 hours (2 hours in extreme conditions). Cold: 1st failure –10 BS/Agility/Dexterity, 2nd failure –10 to all other Characteristics, 3rd+ failure 1d10 unmodified-by-Armour Damage (min 1), reaching 0 Wounds causes Unconscious. Heat: 1st failure –10 Intelligence/Willpower plus Fatigued, 2nd failure –10 to all other Characteristics plus another Fatigued, 3rd+ failure 1d10 unmodified Damage (min 1); removing heavy clothing cancels one failed Test.
- **Thirst/Starvation**: Endurance Tests get a cumulative –10 each time; no healing or Fatigue recovery without food and water. Water: daily Test, 1st failure –10 Intelligence/Willpower/Fellowship, 2nd+ failure –10 all Characteristics plus 1d10 unmodified Damage (min 1). Food: Test every 2 days, 1st failure –10 Strength/Toughness, 2nd+ failure –10 all Characteristics plus 1d10 unmodified Damage (min 1).

## Corruption

Corruption points track a character's slide toward Chaos.

### Gaining Corruption

- **Dark Deals**: a character may voluntarily take 1 Corruption point to reroll a Test, even one already rerolled by other means.
- **Corrupting Influences**: exposure requires an Endurance or Cool Test (GM's choice) to resist; the required SL scales with the strength of the influence.
  - Minor Exposure: failure gains 1 Corruption point.
  - Moderate Exposure: failure gains 2, a Marginal Success (0–1 SL) gains 1, a full Success (2+) gains 0.
  - Major Exposure: failure gains 3, Marginal Success gains 2, Success (2–3) gains 1, only an Impressive Success (4+) gains 0.

### Corruption Limits and Mutation

If Corruption points ever exceed Willpower Bonus + Toughness Bonus, attempt a Challenging (+0) Endurance Test; failure means the character mutates. On mutating, lose Corruption points equal to Willpower Bonus, then roll to determine whether the mutation is physical or mental (chance varies by Species, weighted toward Mental for most), and roll on the matching Corruption Table. Gaining more physical mutations than Toughness Bonus, or more mental corruptions than Willpower Bonus, means the character is lost to Chaos and becomes an NPC.

### Losing Corruption

- **Dark Whispers**: the GM may offer to remove 1 Corruption point in exchange for the character performing a small, corrupt act (e.g. letting a foe escape); declining keeps the point.
- **Absolution**: removing Corruption outside of mutation requires a significant act (e.g. cleansing a profane site, completing a pilgrimage, destroying an unholy artefact, joining a holy order), at the GM's discretion.

## Disease and Infection

Each disease is defined by: a Contraction trigger (usually a failed Test), an Incubation period, a Duration, a set of Symptoms, and sometimes a Permanent effect.

### Symptoms (mechanical effects, examples)

- **Blight**: daily Endurance Test (Difficulty varies by severity) or die.
- **Buboes**: –10 to physical Tests (and Fellowship if visible); lancing via a Heal (Surgery) Test removes the penalty but a failed lancing attempt causes a Festering Wound.
- **Convulsions**: –10 (or –20 at Moderate) to physical Tests; Severe requires restraint (incapacitated).
- **Coughs and Sneezes**: nearby characters must Test for Contraction hourly.
- **Fever**: –10 to physical and Fellowship Tests; Severe inflicts Unconscious (a Resolve point buys a few minutes of consciousness).
- **Flux**: forces trips to relieve oneself once (or more, at higher severity) per session, with Wound loss at Severe.
- **Gangrene**: a located, worsening infection that risks permanent loss of the affected part if failures exceed Toughness Bonus.
- **Lingering**: at the end of the disease's Duration, a failed Endurance Test extends the Duration, worsens to a Festering Wound, or (on an Astounding Failure) becomes Blood Rot.
- **Malaise**: inflicts a Fatigued Condition that only clears on recovery.
- **Nausea**: failing any Test involving movement causes vomiting and the Stunned Condition.
- **Pox**: –10 Fellowship; can leave permanent scarring if not carefully managed.
- **Wounded**: blocks healing of 1 Wound per stack unless treated; risks worsening into a Festering Wound.

Most diseases can be treated with remedies of varying cost and a real chance of being fake; a successful Heal Test (and a genuine remedy) generally negates the day's Test or shortens the effect.

## Psychology

### Psychology Test

Resisting a Psychological trait requires a Cool Test (Difficulty set by the GM) at the start of the Round; success holds off the effect until the end of the encounter (or until circumstances change and a retest is required).

### Common Psychological Traits (mechanical summary)

| Trait | Trigger | Effect while active | Ends when |
| --- | --- | --- | --- |
| Animosity (Target) | Encountering the Target | Must attack the Target (socially or physically); +1 SL on related attacks. On a pass without full immunity, –20 Fellowship toward the Target instead. | Target group pacified/gone, or Stunned/Unconscious, or superseded by Fear/Terror/another Psychology. |
| Prejudice (Target) | Encountering the Target | Must loudly insult the Target; on a pass instead –10 Fellowship toward the Target. | Same as Animosity. |
| Hatred (Target) | Encountering the Target | Must attempt to destroy the Target by the fastest means; +1 SL on combat Tests against it; immune to Fear/Intimidate (not Terror) from it; never interacts socially with it. | All visible members of the Target dead/gone, or user Unconscious. |
| Fear (Rating) | Encountering a Fear-causing creature | –1 SL on Tests targeting the fear source; approaching it needs a Challenging (+0) Cool Test; it approaching you needs the same or you gain Broken. | An Extended Cool Test reaching SL equal to the Fear Rating. |
| Terror (Rating) | First encountering a Terror-causing creature | Failing the initial Cool Test grants Broken Conditions equal to the Terror Rating plus SL below 0; the creature then also causes Fear equal to its Terror Rating. | Resolved via the resulting Fear Test. |
| Frenzy | Voluntary Willpower Test | Immune to other Psychology; must always advance on and attack the nearest enemy; can only take a Weapon Skill or Athletics Action, plus a Free Action Melee Test each Round; +1 Strength Bonus. | All visible enemies pacified, or user gains Stunned/Unconscious (then gains Fatigued). |

Custom Psychological traits can be built from the same toolkit: define a trigger, a prescribed/proscribed action, and any bonus, penalty, Condition, or immunity, subject to GM approval.
