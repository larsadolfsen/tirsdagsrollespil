# Revised Spellcasting Rules

Optional replacement rules for spellcasting, superseding the Core Rulebook's version. GMs and groups may keep using the Core Rulebook rules instead; this variant makes Channelling more rewarding and clarifies several edge cases. See also `core-rulebook/magic.md` for the baseline rules this chapter revises.

## Casting Basics

- **Second Sight**: required to perceive the Winds directly; usable with Intuition, Perception, Track, and similar Tests. It is an always-on sense and cannot be switched off.
- **Memorising**: spellcasters memorise spells by spending the XP listed under their Petty/Arcane Magic Talent.
- **Grimoires**: typically hold four spells from one Lore. Casting directly from a grimoire (rather than memorised) requires both hands free and doubles the spell's CN. A ritual cast from a grimoire instead costs **4×** its normal CN.
- **Casting Test**: make a Language (Magick) Test. Success with SL ≥ the spell's CN casts it as described; otherwise it fails.
  - **Critical Casting** (doubles on a success): roll on the Minor Miscast Table (unless Instinctive Diction), then choose one of **Critical Cast** (also inflicts a Critical Wound if the spell deals Damage), **Total Power** (casts regardless of SL vs CN, but can still be dispelled), or **Unstoppable Force** (if SL met the CN, cannot be dispelled).
  - **Fumbled Casting** (doubles on a failure): roll on the Minor Miscast Table.
- **Magic missiles**: reverse the dice of the Casting Test and read the result on the Hit Location Table. Damage = spell's listed Damage + Willpower Bonus, reduced by Toughness and Armour as normal.
- **Touch spells in combat**: touching an unwilling/engaged target needs an Opposed Melee (Brawling) Test (typically vs. Melee or Dodge) after a successful Casting Test; for a magic missile, this Opposed Test also sets Hit Location. An Enchanted Staff or similar reach item lets the wielder substitute the appropriate Melee Skill (e.g. Melee (Polearm)) for this Test instead — it only determines whether the target is touched, and deals no additional Damage of its own.
- **Duration**: a cast spell lasts its full Duration; only a dispel can end it early.
- **General rules**: a caster must be able to speak/sing to cast (a gagged or muffled caster suffers +1 Difficulty step); a spellcaster's own spell can't be active on the same target twice at once; bonuses/penalties from spells don't stack (best bonus, worst penalty only); Line of Sight to the target is required unless stated otherwise; Advantage (not Channelling) gains +1 if the target already had a spell from the same Lore cast on it that Round.

## Overcasting

Spending SL beyond the CN needed to succeed lets a caster boost the spell along the Overcast Table below. Effects may be drawn from multiple columns, but each column can only be used once per casting; unspent SL are lost. "You"-range spells can't be retargeted; "Touch" range can't be extended; spells with no Duration (or Duration "Instant") can't extend Duration; spells with no Area of Effect can't gain one.

| SL | Extra Target | Extra Damage | Extra Range | Extra AoE | Longer Duration |
| --- | --- | --- | --- | --- | --- |
| 1 | +1 | +1 | 2× Range | Listed AoE | Listed Duration |
| 2 | +1 | +2 | 2× Range | Listed AoE | 2× Duration |
| 3 | +1 | +3 | 2× Range | 2× AoE | 2× Duration |
| 5 | +2 | +4 | 3× Range | 2× AoE | 2× Duration |
| 8 | +2 | +5 | 3× Range | 2× AoE | 3× Duration |
| 13 | +2 | +6 | 3× Range | 2× AoE | 3× Duration |
| 21+ | +3 | +7 | 4× Range | 3× AoE | 3× Duration |

## Channelling

Channelling gathers power via an Extended Channelling Test; each SL reduces the CN of a spell (of the Wind Channelled) by 1, to a minimum of 0. Casting the spell on a later turn consumes all the gathered power regardless of outcome. Channelled power cannot be spent on Overcasting directly, though a lower effective CN makes leftover SL for Overcasting more likely.

- **Critical Channelling** (doubles on success): immediately add bonus SL equal to Willpower Bonus to the Extended Test; roll on the Minor Miscast Table unless the caster has Aethyric Attunement.
- **Fumbled Channelling** (doubles on a failed Test): roll on the Minor Miscast Table; all gathered SL is lost.
- **Interruptions**: taking damage, a Surprised Condition, or similar distraction while Channelling forces a **Hard (-20) Cool Test**; failure loses all gathered SL and inflicts a Minor Miscast. A caster may also voluntarily vent gathered power safely by spending an action at the start of their turn.

## Dispelling

A caster may attempt to dispel one spell per Round: any spell targeting them, or targeting a point they can see within Willpower yards. Make an Opposed Language (Magick) Test against the original caster; winning negates the spell, losing means the original caster's Opposed SL determines whether the spell takes effect. Dispelling your own spell gets a +1 SL bonus.

To dispel an already-active persistent spell, make an Extended Language (Magick) Test as an action; it ends once accumulated SL reaches the spell's CN. Multiple dispellers test separately, or make an Assisted Test if sharing a Lore.

## Hazards and Modifiers

- **Malignant Influences**: near a Corrupting Influence, any failed Casting or Channelling Test forces a roll on the Minor Miscast Table (escalating to Major if a Miscast roll was already due for another reason). Dark Lore casters don't count as Malignant Influences for their own Tests.
- **Warpstone**: doubles SL generated on a Casting or Channelling Test, but counts as a Corrupting Influence (and thus triggers the Malignant Influence risk above).
- **Repelling the Winds**: metal armour (Chamon) and leather armour (Ghur) repel most Winds. Wearers take -1 SL to Casting/Channelling per Armour Point on the location with the most armour; Arcane Magic (Metal) ignores the metal penalty, Arcane Magic (Beasts) ignores the leather penalty, and Chaos Sorcerers in Chaos Armour take no penalty. GMs may extend similar penalties to other inappropriate attire.
- **Multiple Arcane Lores (Elves)**: an Elf may learn a number of Arcane Lores equal to Willpower Bonus, but must first spend 20+ Advances in Channelling and learn 8+ spells of their current Lore before starting a new one. Any spellcaster may additionally learn one Dark Lore alongside their main Lore.

## Miscast Tables

### Minor Miscast Table (1d100)

| Roll | Effect |
| --- | --- |
| 01–05 | Witchsign: the next living creature born within 1 mile is mutated. |
| 06–10 | Soured Milk: milk within 1d100 yards spoils instantly. |
| 11–15 | Blight: Willpower Bonus fields within Willpower Bonus miles rot overnight. |
| 16–20 | Soulwax: gain 1 Deafened Condition, removed only via a successful Average (+20) Heal Test on you. |
| 21–25 | Freezing Breath: everyone within Willpower Bonus yards fails a Challenging (+0) Endurance Test or suffers -10 Ballistic Skill/Agility/Dexterity for 1 minute. |
| 26–30 | Unfasten: every buckle/lace on your person comes loose. |
| 31–35 | Wayward Garb: gain 1 Entangled Condition, Strength 1d10×5 to resist. |
| 36–40 | Curse of Temperance: alcohol within 1d100 yards spoils. |
| 41–45 | Cloyed Tongue: -10 to Language Tests (including Casting) for 1d10 Rounds. |
| 46–50 | Driven to Distraction: Surprised Condition if in combat, otherwise merely startled. |
| 51–55 | Unholy Visions: gain a Blinded Condition; pass a Challenging (+0) Cool Test or gain another. |
| 56–60 | Hexeyes: eyes change colour for 1d10 hours; unremovable Blinded Condition and loss of Magical Sense/Second Sight for the duration. |
| 61–65 | Rupture: gain a Bleeding Condition. |
| 66–70 | Fell Whispers: pass an Average (+20) Willpower Test or gain 1 Corruption point. |
| 71–75 | The Horror!: pass a Hard (-20) Cool Test or gain 1 Broken Condition. |
| 76–80 | Curse of Corruption: gain 1 Corruption point. |
| 81–85 | Intestinal Rebellion: gain 1 Fatigued Condition, removable only after cleaning up. |
| 86–90 | Marked by Magic: gain an Arcane Mark for your Wind (if none exists for your tradition, roll on the Major table instead). |
| 91–95 | Multiplying Misfortune: roll twice more on this table (reroll 91–00). |
| 96–00 | Cascading Chaos: roll instead on the Major Miscast Table. |

### Major Miscast Table (1d100)

| Roll | Effect |
| --- | --- |
| 01–05 | Ghostly Voices: everyone within Willpower yards fails an Average (+20) Cool Test or gains 1 Corruption point. |
| 06–10 | Aethyric Shock: suffer 1d10 Wounds (ignoring Toughness/Armour); fail an Average (+20) Endurance Test and also gain Stunned. |
| 11–15 | Death Walker: nearby plant life withers for 1d10 hours. |
| 16–20 | Double Trouble: the spell's effect also occurs elsewhere within 1d10 miles. |
| 21–25 | Soulfire: gain an Ablaze Condition. |
| 26–30 | Speak in Tongues: cannot speak or cast for 1d10 Rounds (other actions unaffected). |
| 31–35 | Swarmed: engaged by an aethyric swarm (Rats/Spiders/Snakes with the Swarm Trait) for 1d10 Rounds. |
| 36–40 | Ragdoll: flung 1d10 yards, taking 1d10 Wounds (ignoring Armour) and gaining Prone. |
| 41–45 | Limb Frozen: one random limb is useless for 1d10 hours, as if Amputated. |
| 46–50 | Darkling Sight: lose Second Sight benefits for 1d10 hours; Channelling Tests at -20 for the duration. |
| 51–55 | Chaotic Foresight: gain a bonus pool of 1d10 Fortune points (may exceed your normal limit); each spent grants 1 Corruption point; unused points lost at session's end. |
| 56–60 | Levitation: float 1d10 yards up for 1d10 minutes; Falling rules apply when it ends. |
| 61–65 | Regurgitation: gain the Stunned Condition for 1d10 Rounds. |
| 66–70 | Chaos Quake: everyone within 1d100 yards fails an Average (+20) Athletics Test or gains Prone. |
| 71–75 | Forgetfulness: the spell is lost from memory (must be re-memorised) or, if cast from a grimoire, the page bursts into flame and the grimoire risks catching Ablaze. |
| 76–80 | Traitor's Heart: betraying an ally to the fullest restores all Fortune points; causing another to lose a Fate Point grants you +1 Fate Point. |
| 81–85 | Foul Enfeeblement: gain 1 Corruption point, Prone, and Fatigued. |
| 86–90 | Hellish Stench: gain the Distracting Creature Trait for 1d10 hours. |
| 91–95 | Power Drain: cannot use the Talent used to cast the spell for 1d10 minutes. |
| 96–00 | Aethyric Feedback: everyone within Willpower Bonus yards (including you) suffers 1d10 Wounds (ignoring Toughness/Armour) and gains Prone; if no one is in range, you die instantly. |

## New Arcane Spells

A small selection of new generic Arcane spells, learnable by any Lore and treated as Lore spells for all purposes.

- **Decipher Curse** (CN 4, Range Willpower yards, Target any item, Duration Instant): investigate whether an item is cursed. On success, learn that it's cursed plus its boons/banes and trigger condition. Failure inflicts Moderate Exposure to Corruption from spiteful wards. The curse remains active until removed by the Remove Curse ritual.
- **Disrupt Magic** (CN 8, Range Willpower yards, Target 1, Duration Instant): an aggressive dispel aimed at a spellcaster who is still Channelling. Cast before they finish, then win an Opposed Willpower Test to make their spell fail and inflict a Minor Miscast on them.
- **Silence** (CN 4, Range You, Target AoE Willpower Bonus yards, Duration Willpower Bonus minutes): creates a zone where no sound passes in or out; spellcasting inside the zone suffers -3 SL.
- **Succour Magical Servant** (CN 2, Range Willpower Bonus yards, Target one Familiar, Duration Instant): the target Familiar or Construct heals Wounds equal to its Toughness Bonus (double if cast with +3 SL or more).
- A handful of narrow spells exist for empowering "Fenbeast" constructs (Belligerence of the Bloodmarsh, Fly-Infested Rotweed, Collapse Construct, Lifebloom Silt) — minor buffs/debuffs specific to that creature type, provided as a template for GMs to extend to other constructs.

## Ritual Magic

Rituals are powerful, complex spells that usually require a specific environment, ritual ingredients, and a personal sacrifice from the caster. A ritual's entry lists:

- **CN**: casting number, as with spells but far higher.
- **Type**: which Lore(s) may perform it; a caster without a listed Lore cannot take part.
- **Learning XP**: cost to learn the ritual.
- **Ingredients**: required and consumed (not merely risk-mitigating, unlike spell ingredients).
- **Conditions**: environmental/situational prerequisites.
- **Sacrifices**: what the caster(s) give up, often an Endurance/Cool Test each Round of Channelling or a permanent personal cost.
- **Consequences**: what happens if the ritual is disrupted or fails.

Rituals may be transcribed into grimoires; casting from a grimoire multiplies the ritual's CN by 4 (see Grimoires, above). Performing a ritual as a between-adventures **Endeavour** (see below) halves its CN (round up), reflecting the benefit of unhurried preparation.

### Notable New Rituals

| Ritual | CN | Type | Effect |
| --- | --- | --- | --- |
| Bind Monstrous Beast | = Beast's Wounds | Lore of Beasts | Opposed Willpower Test enslaves a local beast for Willpower Bonus days. |
| Bind Spirit Within Power Stone | 32 | Any Lore of the Eight Winds | Binds a Minor Elemental into a Power Stone, granting its passive benefits. |
| Carve Ogham Stone | 50 | Any | Creates a crude waystone-like Ogham Stone (Attraction, Containment, or Dampening property). |
| Conjuration of the Bloody Tidesman | 85 | Lore of Beasts | Summons an Incarnate Elemental of Beasts; deals a Damage +12 blast (ignores leather/fur armour) to everyone nearby, caster included. |
| Conjuration of the Incarnate Elemental of Death | 90 | Lore of Death | Summons an Incarnate Elemental of Death; Damage = Willpower Bonus and Prone to everyone nearby, caster included. |
| Conjuration of Jack o' Cinders | 85 | Lore of Fire | Summons an Incarnate Elemental of Fire; inflicts 4 Ablaze Conditions on everyone nearby, caster included. |
| Corrupt Waystone | 60 | Any Dark Lore | Corrupts a waystone, disrupting the leyline it belongs to and drawing Elven attention. |
| Create Construct | 60 | Any | Animates a prepared vessel into a Construct (base profile below); extra Creature Traits raise the CN. |
| Create Familiar | 45 | Any | Creates a Familiar bound to a prepared vessel; caster permanently sacrifices a Wound, Fate, or Resilience point (two, and CN 80, for a second familiar). |
| Create Power Stone | 64 | Any Lore of the Eight Winds | Produces one Power Stone matching the caster's Lore; requires apprentice assistance. |
| Create Waystone Property | 40 | Any | Grants a functioning waystone an Amplification, Containment, Dampening, or Refraction property. |
| Imbue Staff | 35 | Any Lore of the Eight Winds | Turns a staff into an Enchanted Staff. |
| Invocate Daemon | = Daemon's Willpower | Lore of Daemonology | Requires Octagram cast first; summons a Daemon into it for Intelligence Bonus days; it need not obey or answer. |
| Materialise the Living Swamp | 40 | Death, Life, Shadows, Hedgecraft, or Witchcraft | Creates a Fenbeast construct from organic matter and a heartstone; lives Willpower Bonus days, obeys the caster. |
| Remove Curse | 40 | Any | Requires the curse first identified via Decipher Curse; lifts a curse's boons and banes (a cursed weapon keeps its Magical Quality). |
| The Crossed Scythes | = target's Willpower | Lore of Death | Wards a portal against Undead crossing (Very Difficult (-30) Cool/Endurance Test to pass, with mounting Fatigue/Wounds on failure). |

**Cursecraft** (CN 50, reduced to 25 for Witchcraft/Daemonology/Necromancy/Chaos Lores) imbues an item with a boon-and-bane curse; the creator permanently loses a Wound and suffers Moderate Exposure to Corruption.

## Minor Elementals and Familiars

**Minor Elementals** are summoned like Constructs (see Create Construct above) but the ritual's CN is doubled and no vessel is required. They have the Magical and Size (Small) Creature Traits plus Suffuse With (Wind) for the Wind they were summoned from, and survive a number of days equal to the summoner's Willpower Bonus (doubled in Heavy/Extreme Saturation). On manifesting, the summoner must win an Opposed Willpower/Strength Test to control it; an uncontrolled Elemental acts unpredictably. A Minor Elemental can be bound into a Power Stone via the Bind Spirit Within Power Stone ritual to persist as long as the stone remains unbroken.

**Familiars** are full Characters created via the Create Familiar ritual, in one of three flavours: a Power Familiar (aids spellcasting), a Spell Familiar (a wizard in its own right), or a Combat Familiar (bodyguard). Deviating from a humanoid form or adding Traits (see Familiar Traits below) raises the ritual's CN.

| Familiar Trait | CN modifier |
| --- | --- |
| Size (Tiny) | -10 |
| Size (Little) | -5 |
| No Arms | -10 |
| May not talk | -10 |
| May not smell | -5 |
| Amphibious | +20 |
| Dark Vision | +5 |
| Flight (20) | +20 |
| Stride | +10 |
| Ward (10) | +30 |

## Constructs

A Construct built with the Create Construct ritual uses this base profile unless Traits are added (each adding to the ritual's CN):

**Construct**: M 4, WS 25, BS –, S 45, T 45, I 10, Ag 20, Dex 10, Int –, WP –, Fel 32. Traits: Construct, Painless, Size (Large), Stupid, Unstable, Weapon +8.

| Trait | CN | Trait | CN |
| --- | --- | --- | --- |
| Big | +10 | Size (Tiny) | -20 |
| Brute | +5 | Size (Little) | -15 |
| Champion | +10 | Size (Small) | -10 |
| Die Hard | +10 | Size (Average) | -5 |
| Fast | +20 | Size (Enormous) | +60 |
| Flight (20) | +30 | Size (Monstrous) | +120 |
| Hardy | +5 | Stride | +20 |
| Horns (SB+3) | +5 | Tough | +10 |
| Rear | +5 | Wallcrawler | +20 |

Incarnate Elementals summoned via ritual (e.g. the Bloody Tidesman) live for Willpower Bonus days (doubled in Extreme Saturation) and must be brought under control with an Opposed Willpower/Strength Test; uncontrolled ones attack the nearest creature until destroyed. A controlled Elemental follows orders and can be dismissed at will (it won't return without another ritual).

## New Endeavours

- **Brew Potion**: brew a single batch as a between-adventures Endeavour, given the ingredients and (unless the caster has Concoct) access to a laboratory.
- **Gather Ingredients**: spend an Endeavour gathering potion ingredients in a suitable locale; a failed attempt can be retried as a second Endeavour.
- **Improve Familiar**: the Familiar's creator makes a Hard (-20) Research Test (the Familiar may assist) to let the Familiar undertake its own Endeavour — Training, Unusual Learning, Train with Unusual Weapon (Combat Familiars only), or Test Magic Item (Spell Familiars only).
- **Perform Ritual**: performing a ritual as an Endeavour halves its CN (round up) since it can be done carefully at a site of Heavy/Extreme Saturation, at the cost that its effects may have worn off, or become known to enemies, by the time the adventure resumes.
