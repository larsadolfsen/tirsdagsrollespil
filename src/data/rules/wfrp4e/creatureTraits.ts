export type CharacteristicKey = "WS" | "BS" | "S" | "T" | "I" | "Ag" | "Dex" | "Int" | "WP" | "Fel";

export type CreatureTraitParameterKind =
  | "rating"
  | "target"
  | "type"
  | "range"
  | "difficulty"
  | "feature"
  | "skills"
  | "various"
  | "size";

export type CreatureTraitModifierType =
  | "actionBonus"
  | "actionOption"
  | "armour"
  | "characteristic"
  | "combatFlag"
  | "condition"
  | "damage"
  | "diceHook"
  | "immunity"
  | "movement"
  | "opposedTest"
  | "skillTestBonus"
  | "targeting"
  | "weaponProfile"
  | "wounds";

export type CreatureTraitModifierAmount =
  | number
  | "rating"
  | "ratingPerStep"
  | "agilityBonus"
  | "initiativeBonus"
  | "strengthBonus"
  | "toughnessBonus"
  | "willpowerBonus";

export interface CreatureTraitModifier {
  type: CreatureTraitModifierType;
  amount?: CreatureTraitModifierAmount;
  target?: string;
  characteristic?: CharacteristicKey | "all";
  skill?: string;
  action?: string;
  condition?: string;
  formula?: string;
  trigger?: string;
  appliesTo?: string;
  notes?: string;
}

export interface CreatureTraitParameter {
  kind: CreatureTraitParameterKind;
  label: string;
  required?: boolean;
  repeatable?: boolean;
}

export interface CreatureTraitDefinition {
  id: string;
  name: string;
  parameter?: CreatureTraitParameter;
  tags: string[];
  summary: string;
  statBlock: string;
  combatTracker: string;
  diceRoller: string;
  modifiers: CreatureTraitModifier[];
}

export const creatureTraitDefinitions: CreatureTraitDefinition[] = [
  {
    id: "afraid",
    name: "Afraid",
    parameter: { kind: "target", label: "Target", required: true },
    tags: ["psychology", "targeted"],
    summary: "Marks a specific target that can trigger fear handling.",
    statBlock: "Store the target value, for example a creature type, faction, or character name.",
    combatTracker: "When the marked target is present, surface fear prompts and morale reminders.",
    diceRoller: "Apply the relevant psychology test workflow when the target condition is met.",
    modifiers: [
      { type: "combatFlag", target: "psychology.afraid", appliesTo: "parameter target" },
      { type: "diceHook", target: "fear-test", appliesTo: "when facing the target" },
    ],
  },
  {
    id: "amphibious",
    name: "Amphibious",
    tags: ["movement", "skill"],
    summary: "Removes normal water movement limitations and improves swim tests.",
    statBlock: "Mark the creature as water-capable.",
    combatTracker: "Allow full movement in water terrain.",
    diceRoller: "Add Agility Bonus SL to Swim tests.",
    modifiers: [
      { type: "movement", target: "water", notes: "Moves at full Movement through water." },
      { type: "skillTestBonus", skill: "Swim", amount: "agilityBonus" },
    ],
  },
  {
    id: "arboreal",
    name: "Arboreal",
    tags: ["movement", "skill", "terrain"],
    summary: "Improves climbing and stealth in woodland terrain.",
    statBlock: "Mark woodland as preferred terrain.",
    combatTracker: "Allow terrain-aware prompts for trees, canopy, and forest cover.",
    diceRoller: "Add Agility Bonus SL to Climb and Stealth tests in woodland.",
    modifiers: [
      { type: "skillTestBonus", skill: "Climb", amount: "agilityBonus", appliesTo: "woodland" },
      { type: "skillTestBonus", skill: "Stealth", amount: "agilityBonus", appliesTo: "woodland" },
    ],
  },
  {
    id: "animosity",
    name: "Animosity",
    parameter: { kind: "target", label: "Target", required: true },
    tags: ["psychology", "targeted"],
    summary: "Marks a target the creature is hostile toward for psychology automation.",
    statBlock: "Store the target group or creature type.",
    combatTracker: "Flag encounters where the target is present and prompt behaviour checks.",
    diceRoller: "Enable the relevant Animosity workflow when the target is present.",
    modifiers: [
      { type: "combatFlag", target: "psychology.animosity", appliesTo: "parameter target" },
      { type: "diceHook", target: "animosity-test", appliesTo: "when facing the target" },
    ],
  },
  {
    id: "armour",
    name: "Armour",
    parameter: { kind: "rating", label: "Rating", required: true },
    tags: ["defense", "armour"],
    summary: "Adds armour points from the rating to all hit locations.",
    statBlock: "Use the rating as natural or worn armour on every location unless the monster profile overrides it.",
    combatTracker: "Include the rating when calculating soak by hit location.",
    diceRoller: "Expose armour value to damage resolution.",
    modifiers: [
      { type: "armour", amount: "rating", target: "all hit locations" },
      { type: "diceHook", target: "damage-resolution", appliesTo: "armour soak" },
    ],
  },
  {
    id: "belligerent",
    name: "Belligerent",
    tags: ["combat", "psychology"],
    summary: "Improves staying power while the creature has Advantage.",
    statBlock: "Mark as immune to psychology while Advantage is positive.",
    combatTracker: "Check current Advantage before showing psychology prompts.",
    diceRoller: "Suppress psychology tests while Advantage is greater than 0.",
    modifiers: [
      { type: "immunity", target: "psychology", appliesTo: "while Advantage > 0" },
    ],
  },
  {
    id: "bestial",
    name: "Bestial",
    tags: ["ai", "psychology", "training"],
    summary: "Marks limited reasoning, language, and control options.",
    statBlock: "Set social and command limitations on the stat block.",
    combatTracker: "Use simple behaviour prompts, with support for territorial or trained exceptions.",
    diceRoller: "Blocks tests that require normal language, reasoning, or Fellowship unless explicitly allowed.",
    modifiers: [
      { type: "combatFlag", target: "bestial" },
      { type: "skillTestBonus", skill: "Fellowship", notes: "Usually unavailable unless another trait allows it." },
    ],
  },
  {
    id: "big",
    name: "Big",
    tags: ["size", "characteristic"],
    summary: "Applies larger creature stat adjustments.",
    statBlock: "Add +10 Strength and Toughness, and -5 Agility.",
    combatTracker: "Treat as a size-impact trait for stomp, targeting, and wound calculation.",
    diceRoller: "Use adjusted characteristics for tests and damage.",
    modifiers: [
      { type: "characteristic", characteristic: "S", amount: 10 },
      { type: "characteristic", characteristic: "T", amount: 10 },
      { type: "characteristic", characteristic: "Ag", amount: -5 },
    ],
  },
  {
    id: "bite",
    name: "Bite",
    parameter: { kind: "rating", label: "Rating", required: true },
    tags: ["attack", "weapon", "free-attack"],
    summary: "Adds a bite attack that can be used as a Free Attack by spending Advantage.",
    statBlock: "Create a natural weapon using rating for damage (rating already includes Strength Bonus).",
    combatTracker: "Show as a natural attack option and track Advantage cost.",
    diceRoller: "Roll as melee attack and pass damage formula into damage resolution.",
    modifiers: [
      { type: "actionOption", action: "Free Attack", trigger: "spend 1 Advantage" },
      { type: "weaponProfile", target: "Bite", formula: "rating" },
    ],
  },
  {
    id: "blessed",
    name: "Blessed",
    parameter: { kind: "various", label: "Blessing list or deity", required: true },
    tags: ["magic", "miracle"],
    summary: "Grants access to configured blessings.",
    statBlock: "Store the blessing source and available blessing names.",
    combatTracker: "Show blessing actions and active blessing effects on the combatant.",
    diceRoller: "Route blessing rolls through the prayer or miracle workflow.",
    modifiers: [
      { type: "actionOption", target: "Blessings", appliesTo: "configured list" },
      { type: "diceHook", target: "blessing-cast" },
    ],
  },
  {
    id: "bounce",
    name: "Bounce",
    tags: ["movement", "terrain"],
    summary: "Improves charge and running movement and bypasses some terrain restrictions.",
    statBlock: "Mark as enhanced leaping movement.",
    combatTracker: "Double Movement for charging or running and ignore intervening terrain or characters.",
    diceRoller: "No direct roll change unless terrain checks are requested.",
    modifiers: [
      { type: "movement", target: "Charge or Run", formula: "Movement x 2" },
      { type: "combatFlag", target: "ignore-intervening-terrain-on-charge-run" },
    ],
  },
  {
    id: "breath",
    name: "Breath",
    parameter: { kind: "rating", label: "Rating and damage type", required: true },
    tags: ["attack", "area", "condition", "damage"],
    summary: "Adds a cone or area breath attack with typed secondary effects.",
    statBlock: "Store rating and damage type such as fire, cold, poison, smoke, or corrosion.",
    combatTracker: "Show as an area attack with action cost and cooldown if the encounter needs one.",
    diceRoller: "Roll opposed test against affected targets and apply typed damage or conditions.",
    modifiers: [
      { type: "actionOption", action: "Breath Attack", trigger: "Action" },
      { type: "damage", amount: "rating", target: "area" },
      { type: "condition", target: "by breath type", appliesTo: "failed defense" },
    ],
  },
  {
    id: "brute",
    name: "Brute",
    tags: ["characteristic", "combat"],
    summary: "Trades mobility and agility for higher physical force.",
    statBlock: "Apply -1 Movement, -10 Agility, and +10 Strength and Toughness.",
    combatTracker: "Update Movement and physical stats before initiative and attack use.",
    diceRoller: "Use adjusted characteristics for tests, opposed rolls, and damage.",
    modifiers: [
      { type: "movement", amount: -1 },
      { type: "characteristic", characteristic: "Ag", amount: -10 },
      { type: "characteristic", characteristic: "S", amount: 10 },
      { type: "characteristic", characteristic: "T", amount: 10 },
    ],
  },
  {
    id: "champion",
    name: "Champion",
    tags: ["combat", "damage"],
    summary: "Turns a successful melee defense into a damage opportunity.",
    statBlock: "Mark as an elite defense trait.",
    combatTracker: "Prompt damage on successful opposed melee defense.",
    diceRoller: "When defending in melee and winning the opposed test, allow damage as if attacking.",
    modifiers: [
      { type: "diceHook", target: "opposed-melee-defense", trigger: "wins opposed test" },
      { type: "damage", target: "attacker", appliesTo: "successful melee defense" },
    ],
  },
  {
    id: "chill-grasp",
    name: "Chill Grasp",
    tags: ["attack", "damage", "magic"],
    summary: "Adds a magical touch attack that ignores normal soak sources.",
    statBlock: "Store as a special melee option.",
    combatTracker: "Show cost, target, and damage rule on the action card.",
    diceRoller: "Roll opposed melee or dodge test and apply fixed SL-based wound loss without Toughness Bonus or armour.",
    modifiers: [
      { type: "actionOption", action: "Chill Grasp", trigger: "Action plus Advantage cost" },
      { type: "opposedTest", target: "Melee or Dodge" },
      { type: "damage", formula: "10 + SL", notes: "Ignore Toughness Bonus and armour." },
    ],
  },
  {
    id: "clever",
    name: "Clever",
    tags: ["characteristic"],
    summary: "Improves mental speed and reasoning.",
    statBlock: "Apply +20 Intelligence and +10 Initiative.",
    combatTracker: "Use improved Initiative for turn order.",
    diceRoller: "Use adjusted values for Intelligence and Initiative tests.",
    modifiers: [
      { type: "characteristic", characteristic: "Int", amount: 20 },
      { type: "characteristic", characteristic: "I", amount: 10 },
    ],
  },
  {
    id: "cold-blooded",
    name: "Cold-blooded",
    tags: ["psychology", "dice"],
    summary: "Improves failed Willpower handling.",
    statBlock: "Mark as eligible to reverse failed Willpower results.",
    combatTracker: "Surface a reminder when a Willpower test fails.",
    diceRoller: "Offer reverse-roll handling for failed Willpower tests.",
    modifiers: [
      { type: "diceHook", target: "failed-willpower-test", notes: "Reverse the roll where allowed." },
    ],
  },
  {
    id: "constrictor",
    name: "Constrictor",
    tags: ["attack", "condition", "grapple"],
    summary: "Allows a successful hit to entangle and start a grapple.",
    statBlock: "Mark attacks as able to inflict Entangled.",
    combatTracker: "Apply Entangled and create grapple state after a successful hit.",
    diceRoller: "On hit, offer Entangled condition and grapple follow-up.",
    modifiers: [
      { type: "condition", condition: "Entangled", trigger: "successful hit" },
      { type: "combatFlag", target: "can-start-grapple-on-hit" },
    ],
  },
  {
    id: "construct",
    name: "Construct",
    tags: ["immunity", "magic", "ai"],
    summary: "Marks the creature as mindless, magically sustained, and resistant to normal living-creature effects.",
    statBlock: "Disable Intelligence, Willpower, and Fellowship where the profile lacks them and mark attacks as magical where applicable.",
    combatTracker: "Block morale and psychology prompts unless a specific rule overrides it.",
    diceRoller: "Skip tests the creature cannot make and route attacks as magical.",
    modifiers: [
      { type: "combatFlag", target: "mindless" },
      { type: "immunity", target: "psychology" },
      { type: "damage", target: "attacks", notes: "Treat as magical where required." },
    ],
  },
  {
    id: "corrosive-blood",
    name: "Corrosive Blood",
    tags: ["damage", "area", "reaction"],
    summary: "Damages engaged creatures when this creature is wounded.",
    statBlock: "Store as a reactive damage aura.",
    combatTracker: "When wounds are applied, prompt splash damage against engaged targets.",
    diceRoller: "Roll or apply the configured corrosive damage to engaged targets.",
    modifiers: [
      { type: "damage", target: "engaged targets", trigger: "creature is wounded", formula: "1d10 modified by Toughness Bonus and Armour Points" },
      { type: "diceHook", target: "wounded-trigger" },
    ],
  },
  {
    id: "corrupted",
    name: "Corrupted",
    parameter: { kind: "rating", label: "Strength", required: true },
    tags: ["corruption", "magic"],
    summary: "Marks the creature as a source of corruption exposure.",
    statBlock: "Store corruption strength as rating.",
    combatTracker: "Prompt corruption checks when the creature causes exposure.",
    diceRoller: "Use rating when rolling or resolving corruption exposure.",
    modifiers: [
      { type: "diceHook", target: "corruption-test", amount: "rating" },
    ],
  },
  {
    id: "cunning",
    name: "Cunning",
    tags: ["characteristic", "social"],
    summary: "Improves social manipulation and mental checks.",
    statBlock: "Apply +10 Fellowship, Intelligence, and Initiative.",
    combatTracker: "Use improved Initiative for turn order.",
    diceRoller: "Use adjusted values for relevant tests.",
    modifiers: [
      { type: "characteristic", characteristic: "Fel", amount: 10 },
      { type: "characteristic", characteristic: "Int", amount: 10 },
      { type: "characteristic", characteristic: "I", amount: 10 },
    ],
  },
  {
    id: "dark-vision",
    name: "Dark Vision",
    tags: ["vision", "targeting"],
    summary: "Allows the creature to see in darkness.",
    statBlock: "Mark as dark-vision capable.",
    combatTracker: "Ignore darkness penalties where this trait applies.",
    diceRoller: "Suppress darkness penalties on sight-based tests and attacks.",
    modifiers: [
      { type: "targeting", target: "darkness", notes: "Ignore darkness visibility penalty." },
    ],
  },
  {
    id: "daemonic",
    name: "Daemonic",
    parameter: { kind: "target", label: "Patron or source", required: false },
    tags: ["daemon", "magic", "defense"],
    summary: "Marks attacks as magical and adds instability handling.",
    statBlock: "Store daemon source and magical attack flag.",
    combatTracker: "Track special removal or instability behaviour when reduced to 0 wounds.",
    diceRoller: "Treat attacks as magical and enable daemon-specific resolution hooks.",
    modifiers: [
      { type: "damage", target: "attacks", notes: "Treat as magical." },
      { type: "combatFlag", target: "daemon-instability" },
    ],
  },
  {
    id: "die-hard",
    name: "Die Hard",
    tags: ["defense", "critical", "wounds"],
    summary: "Keeps the creature fighting after severe injury.",
    statBlock: "Mark as resistant to being removed by critical wounds.",
    combatTracker: "Do not auto-remove on critical wounds unless the trait conditions are defeated.",
    diceRoller: "Adjust critical wound resolution to support continued activity.",
    modifiers: [
      { type: "combatFlag", target: "does-not-die-from-critical-wounds-by-default" },
      { type: "diceHook", target: "critical-wound-resolution" },
    ],
  },
  {
    id: "disease",
    name: "Disease",
    parameter: { kind: "type", label: "Disease", required: true },
    tags: ["condition", "disease"],
    summary: "Adds a disease exposure effect.",
    statBlock: "Store disease type.",
    combatTracker: "Prompt contraction checks after the configured trigger.",
    diceRoller: "Run the disease contraction test workflow with the selected disease.",
    modifiers: [
      { type: "diceHook", target: "disease-contraction", appliesTo: "parameter type" },
    ],
  },
  {
    id: "distracting",
    name: "Distracting",
    tags: ["debuff", "area", "dice"],
    summary: "Applies a penalty to nearby enemy tests.",
    statBlock: "Mark the radius and penalty if customized.",
    combatTracker: "Show aura and affected combatants.",
    diceRoller: "Apply -20 to affected tests where the aura applies.",
    modifiers: [
      { type: "skillTestBonus", skill: "all", amount: -20, appliesTo: "affected targets in range" },
    ],
  },
  {
    id: "elite",
    name: "Elite",
    tags: ["characteristic", "combat"],
    summary: "Improves combat skill and discipline.",
    statBlock: "Apply +20 Weapon Skill, Ballistic Skill, and Willpower.",
    combatTracker: "Use improved combat stats for attacks and morale.",
    diceRoller: "Use adjusted WS, BS, and WP for all rolls.",
    modifiers: [
      { type: "characteristic", characteristic: "WS", amount: 20 },
      { type: "characteristic", characteristic: "BS", amount: 20 },
      { type: "characteristic", characteristic: "WP", amount: 20 },
    ],
  },
  {
    id: "ethereal",
    name: "Ethereal",
    tags: ["defense", "movement", "magic"],
    summary: "Allows passage through solid barriers and restricts what can harm the creature.",
    statBlock: "Mark as ethereal and vulnerable only to configured harm sources.",
    combatTracker: "Ignore normal movement barriers and filter incoming damage by allowed source.",
    diceRoller: "Reject or reduce non-qualifying damage before wounds are applied.",
    modifiers: [
      { type: "movement", target: "solid objects", notes: "Can pass through obstacles." },
      { type: "immunity", target: "non-magical-damage", appliesTo: "unless source qualifies" },
    ],
  },
  {
    id: "fast",
    name: "Fast",
    tags: ["movement", "characteristic"],
    summary: "Improves speed and agility.",
    statBlock: "Apply +1 Movement and +10 Agility.",
    combatTracker: "Use updated Movement and Initiative-related displays.",
    diceRoller: "Use adjusted Agility for tests.",
    modifiers: [
      { type: "movement", amount: 1 },
      { type: "characteristic", characteristic: "Ag", amount: 10 },
    ],
  },
  {
    id: "fear",
    name: "Fear",
    parameter: { kind: "rating", label: "Rating", required: true },
    tags: ["psychology", "condition"],
    summary: "Triggers fear tests against eligible opponents.",
    statBlock: "Store fear rating.",
    combatTracker: "Prompt fear checks when opponents engage or perceive the creature as hostile.",
    diceRoller: "Run fear test workflow using the rating.",
    modifiers: [
      { type: "diceHook", target: "fear-test", amount: "rating" },
      { type: "combatFlag", target: "causes-fear" },
    ],
  },
  {
    id: "flight",
    name: "Flight",
    parameter: { kind: "rating", label: "Rating", required: true },
    tags: ["movement", "targeting"],
    summary: "Adds flying movement and ranged targeting implications.",
    statBlock: "Store flight rating as aerial movement capability.",
    combatTracker: "Track airborne state, altitude, and landing requirements.",
    diceRoller: "Apply ranged attack penalties against flying targets where applicable.",
    modifiers: [
      { type: "movement", target: "fly", amount: "rating" },
      { type: "targeting", target: "ranged attacks against flying creature", amount: -20 },
    ],
  },
  {
    id: "frenzy",
    name: "Frenzy",
    tags: ["psychology", "combat"],
    summary: "Allows or requires frenzy state handling.",
    statBlock: "Mark as frenzy-capable.",
    combatTracker: "Track Frenzy state and its restrictions.",
    diceRoller: "Enable Frenzy modifiers when state is active.",
    modifiers: [
      { type: "combatFlag", target: "can-frenzy" },
      { type: "diceHook", target: "frenzy-state" },
    ],
  },
  {
    id: "fury",
    name: "Fury",
    tags: ["combat", "psychology"],
    summary: "Allows Advantage spending to enter Hatred or Frenzy style combat states.",
    statBlock: "Mark as able to spend Advantage for rage state.",
    combatTracker: "Offer state change when the creature has enough Advantage.",
    diceRoller: "Enable modifiers for the selected state after Advantage is spent.",
    modifiers: [
      { type: "actionOption", action: "Enter rage state", trigger: "spend all Advantage, minimum 1" },
      { type: "combatFlag", target: "can-enter-hatred-or-frenzy" },
    ],
  },
  {
    id: "ghostly-howl",
    name: "Ghostly Howl",
    tags: ["area", "condition", "damage"],
    summary: "Area howl that damages, deafens, and can break targets.",
    statBlock: "Store as a special free attack option.",
    combatTracker: "Apply area target selection, Deafened, wound loss, and Broken checks.",
    diceRoller: "Resolve Endurance resistance, wound loss, and conditions for all affected targets.",
    modifiers: [
      { type: "actionOption", action: "Ghostly Howl", trigger: "Free Attack using Advantage" },
      { type: "condition", condition: "Deafened", target: "affected living targets" },
      { type: "condition", condition: "Broken", target: "failed resistance" },
      { type: "damage", formula: "1d10 wounds ignoring Toughness Bonus and Armour Points" },
    ],
  },
  {
    id: "hardy",
    name: "Hardy",
    tags: ["wounds", "defense"],
    summary: "Increases wounds before size modifiers.",
    statBlock: "Add Toughness Bonus to wounds before size is applied.",
    combatTracker: "Use modified maximum wounds.",
    diceRoller: "No roll modifier, but damage resolution uses the larger wound pool.",
    modifiers: [
      { type: "wounds", amount: "toughnessBonus", appliesTo: "before size modifiers" },
    ],
  },
  {
    id: "hatred",
    name: "Hatred",
    parameter: { kind: "target", label: "Target", required: true },
    tags: ["psychology", "targeted"],
    summary: "Marks a target for Hatred state handling.",
    statBlock: "Store the target that triggers Hatred.",
    combatTracker: "Activate Hatred prompts when target is present.",
    diceRoller: "Apply Hatred-related roll behaviour when active.",
    modifiers: [
      { type: "combatFlag", target: "hatred", appliesTo: "parameter target" },
      { type: "diceHook", target: "hatred-state" },
    ],
  },
  {
    id: "horns",
    name: "Horns",
    parameter: { kind: "rating", label: "Rating and feature", required: true },
    tags: ["attack", "charge", "weapon"],
    summary: "Adds a charging horn attack.",
    statBlock: "Create natural weapon damage from rating (rating already includes Strength Bonus).",
    combatTracker: "Show as available after charging with Advantage.",
    diceRoller: "Resolve as melee attack with natural weapon damage.",
    modifiers: [
      { type: "actionOption", action: "Horns Attack", trigger: "after Charge and Advantage gain" },
      { type: "weaponProfile", target: "Horns", formula: "rating" },
    ],
  },
  {
    id: "hungry",
    name: "Hungry",
    tags: ["ai", "psychology"],
    summary: "Forces control checks after killing or incapacitating living targets.",
    statBlock: "Mark as feeding-driven.",
    combatTracker: "Prompt Willpower test after the trigger and lock next action on failure.",
    diceRoller: "Run Willpower test with configured difficulty when the trigger occurs.",
    modifiers: [
      { type: "diceHook", target: "willpower-test", trigger: "kills or incapacitates a living opponent" },
      { type: "combatFlag", target: "must-feed-on-failed-test" },
    ],
  },
  {
    id: "immunity",
    name: "Immunity",
    parameter: { kind: "type", label: "Type", required: true },
    tags: ["defense", "immunity"],
    summary: "Blocks a configured damage, condition, or effect type.",
    statBlock: "Store immunity type as a normalized key.",
    combatTracker: "Suppress invalid incoming effects.",
    diceRoller: "Ignore qualifying damage or conditions during resolution.",
    modifiers: [
      { type: "immunity", target: "parameter type" },
    ],
  },
  {
    id: "immunity-to-psychology",
    name: "Immunity to Psychology",
    tags: ["psychology", "immunity"],
    summary: "Blocks psychology rules against the creature.",
    statBlock: "Mark psychology as ignored.",
    combatTracker: "Do not prompt fear, terror, broken, prejudice, hatred, or related checks unless overridden.",
    diceRoller: "Skip psychology tests for this creature.",
    modifiers: [
      { type: "immunity", target: "psychology" },
    ],
  },
  {
    id: "infected",
    name: "Infected",
    tags: ["condition", "disease"],
    summary: "Adds infection risk to weapon wounds.",
    statBlock: "Mark attacks as infection-capable.",
    combatTracker: "Prompt infection test when a living opponent is wounded.",
    diceRoller: "Run Endurance contraction workflow on eligible wounds.",
    modifiers: [
      { type: "diceHook", target: "infection-test", trigger: "living target wounded" },
    ],
  },
  {
    id: "infestation",
    name: "Infestation",
    tags: ["debuff", "area", "melee"],
    summary: "Distracts nearby melee opponents.",
    statBlock: "Mark as carrying an infestation aura.",
    combatTracker: "Show melee penalty to engaged opponents.",
    diceRoller: "Apply -10 to hit the creature in melee.",
    modifiers: [
      { type: "skillTestBonus", skill: "Melee", amount: -10, appliesTo: "opponents attacking this creature" },
    ],
  },
  {
    id: "leader",
    name: "Leader",
    tags: ["support", "skill"],
    summary: "Improves Fellowship and Willpower support behaviour.",
    statBlock: "Apply +10 Fellowship and Willpower.",
    combatTracker: "Use improved stats for command, morale, and psychology.",
    diceRoller: "Use adjusted Fellowship and Willpower for tests.",
    modifiers: [
      { type: "characteristic", characteristic: "Fel", amount: 10 },
      { type: "characteristic", characteristic: "WP", amount: 10 },
    ],
  },
  {
    id: "magical",
    name: "Magical",
    tags: ["magic", "damage"],
    summary: "Marks the creature and its attacks as magical.",
    statBlock: "Set magical flag on the creature and its attacks.",
    combatTracker: "Treat attacks as magical for immunity and resistance checks.",
    diceRoller: "Route damage through magical damage classification.",
    modifiers: [
      { type: "damage", target: "attacks", notes: "Treat as magical." },
      { type: "combatFlag", target: "magical" },
    ],
  },
  {
    id: "magic-resistance",
    name: "Magic Resistance",
    parameter: { kind: "rating", label: "Rating", required: true },
    tags: ["magic", "defense", "dice"],
    summary: "Reduces spell success against the creature.",
    statBlock: "Store resistance rating.",
    combatTracker: "Show spell resistance on the target card.",
    diceRoller: "Reduce incoming spell SL by the rating.",
    modifiers: [
      { type: "diceHook", target: "incoming-spell", amount: "rating", notes: "Subtract from spell SL." },
    ],
  },
  {
    id: "mental-corruption",
    name: "Mental Corruption",
    tags: ["corruption", "mental"],
    summary: "Marks the creature as having a mental corruption effect.",
    statBlock: "Store mental corruption result or pending roll flag.",
    combatTracker: "Show mental corruption reminders on the creature.",
    diceRoller: "Allow rolling or resolving mental corruption effects.",
    modifiers: [
      { type: "diceHook", target: "mental-corruption" },
    ],
  },
  {
    id: "miracles",
    name: "Miracles",
    parameter: { kind: "various", label: "Miracle list or deity", required: true },
    tags: ["miracle", "magic"],
    summary: "Grants access to configured miracles.",
    statBlock: "Store deity and miracle list.",
    combatTracker: "Show miracle actions and active miracle effects.",
    diceRoller: "Route miracle rolls through the prayer or miracle workflow.",
    modifiers: [
      { type: "actionOption", target: "Miracles", appliesTo: "configured list" },
      { type: "diceHook", target: "miracle-cast" },
    ],
  },
  {
    id: "mutation",
    name: "Mutation",
    tags: ["mutation", "corruption"],
    summary: "Marks the creature as having a physical mutation.",
    statBlock: "Store mutation result or pending roll flag.",
    combatTracker: "Show mutation reminders and special actions if configured.",
    diceRoller: "Allow rolling or resolving mutation effects.",
    modifiers: [
      { type: "diceHook", target: "physical-mutation" },
    ],
  },
  {
    id: "night-vision",
    name: "Night Vision",
    tags: ["vision", "targeting"],
    summary: "Improves visibility handling in low light.",
    statBlock: "Mark as having Night Vision.",
    combatTracker: "Ignore or reduce low-light penalties where appropriate.",
    diceRoller: "Suppress low-light penalties on sight-based tests.",
    modifiers: [
      { type: "targeting", target: "low light", notes: "Ignore or reduce sight penalties." },
    ],
  },
  {
    id: "painless",
    name: "Painless",
    tags: ["defense", "critical", "condition"],
    summary: "Ignores pain-based impairment and many non-amputation critical penalties.",
    statBlock: "Mark as resistant to pain and normal critical penalties.",
    combatTracker: "Suppress non-structural critical penalties unless they remove function.",
    diceRoller: "Filter critical wound effects before applying penalties.",
    modifiers: [
      { type: "combatFlag", target: "ignore-pain" },
      { type: "diceHook", target: "critical-wound-filter" },
    ],
  },
  {
    id: "petrifying-gaze",
    name: "Petrifying Gaze",
    tags: ["attack", "condition", "gaze"],
    summary: "Adds a gaze attack that can stun and eventually petrify.",
    statBlock: "Store as special opposed gaze action.",
    combatTracker: "Track Stunned stacks from this source and petrification threshold.",
    diceRoller: "Resolve opposed gaze test and apply Stunned based on SL.",
    modifiers: [
      { type: "actionOption", action: "Petrifying Gaze", trigger: "Action plus Advantage cost" },
      { type: "condition", condition: "Stunned", target: "opponent", formula: "2 + SL" },
      { type: "combatFlag", target: "petrify-at-stunned-threshold" },
    ],
  },
  {
    id: "prejudice",
    name: "Prejudice",
    parameter: { kind: "target", label: "Target", required: true },
    tags: ["psychology", "targeted"],
    summary: "Marks a disliked target for social and behaviour handling.",
    statBlock: "Store prejudice target.",
    combatTracker: "Flag relevant social or combat prompts when target is present.",
    diceRoller: "Apply prejudice workflow if implemented for NPC behaviour tests.",
    modifiers: [
      { type: "combatFlag", target: "prejudice", appliesTo: "parameter target" },
    ],
  },
  {
    id: "ranged",
    name: "Ranged",
    parameter: { kind: "rating", label: "Rating and range", required: true },
    tags: ["attack", "weapon", "ranged"],
    summary: "Adds a ranged natural attack.",
    statBlock: "Create a ranged weapon profile with damage from rating and configured range.",
    combatTracker: "Show as ranged attack option with range bands.",
    diceRoller: "Roll as ranged attack and pass rating-based damage to damage resolution.",
    modifiers: [
      { type: "weaponProfile", target: "Ranged attack", formula: "rating damage" },
      { type: "diceHook", target: "ranged-attack" },
    ],
  },
  {
    id: "rear",
    name: "Rear",
    tags: ["movement", "attack"],
    summary: "Allows a stomp-style attack after movement if size allows it.",
    statBlock: "Mark as rear or stomp-capable.",
    combatTracker: "Offer stomp follow-up after movement against smaller opponents.",
    diceRoller: "Resolve stomp attack when triggered.",
    modifiers: [
      { type: "actionOption", action: "Stomp", trigger: "after Move, if larger than opponent" },
    ],
  },
  {
    id: "regenerate",
    name: "Regenerate",
    tags: ["healing", "wounds"],
    summary: "Restores wounds at the start of round with exceptions for special damage.",
    statBlock: "Mark regeneration and any damage types that block it.",
    combatTracker: "At start of round, prompt regeneration if above 0 wounds.",
    diceRoller: "Roll regeneration amount where required and apply healing to wounds.",
    modifiers: [
      { type: "wounds", trigger: "start of round", formula: "regenerate 1d10 wounds if eligible" },
      { type: "diceHook", target: "start-of-round-regeneration" },
    ],
  },
  {
    id: "size",
    name: "Size",
    parameter: { kind: "size", label: "Size", required: true },
    tags: ["size", "wounds", "combat"],
    summary: "Sets creature size and drives wound, targeting, damage, and stomp rules.",
    statBlock: "Store one normalized size value from Tiny through Monstrous.",
    combatTracker: "Use size for wounds, targeting modifiers, opposed Strength shortcuts, disengage, stomp, and deathblow interactions.",
    diceRoller: "Apply size-based melee hit modifiers, damage scaling, and defense penalties where implemented.",
    modifiers: [
      { type: "wounds", target: "size formula", appliesTo: "maximum wounds" },
      { type: "targeting", target: "melee attacks", appliesTo: "relative size difference" },
      { type: "damage", target: "weapon damage", appliesTo: "relative size difference" },
      { type: "combatFlag", target: "size-combat-rules" },
    ],
  },
  {
    id: "skittish",
    name: "Skittish",
    tags: ["psychology", "condition"],
    summary: "Adds vulnerability to fear from magic or loud noise.",
    statBlock: "Mark skittish triggers.",
    combatTracker: "Prompt Broken conditions when magic or loud noise triggers occur.",
    diceRoller: "Run or apply Broken condition workflow on trigger.",
    modifiers: [
      { type: "condition", condition: "Broken", trigger: "magic or loud noise" },
    ],
  },
  {
    id: "spellcaster",
    name: "Spellcaster",
    parameter: { kind: "various", label: "Lore or spell list", required: true },
    tags: ["magic", "spells"],
    summary: "Grants access to configured spells.",
    statBlock: "Store lore and spell list.",
    combatTracker: "Show spell actions and active spell effects.",
    diceRoller: "Route spell rolls through casting and channeling workflows.",
    modifiers: [
      { type: "actionOption", target: "Spells", appliesTo: "configured list" },
      { type: "diceHook", target: "spell-cast" },
    ],
  },
  {
    id: "stealthy",
    name: "Stealthy",
    tags: ["skill"],
    summary: "Improves Stealth by rating or Agility Bonus style scaling.",
    statBlock: "Mark as stealth-enhanced.",
    combatTracker: "Use as reminder for ambush and hidden state.",
    diceRoller: "Add Agility Bonus SL to Stealth tests.",
    modifiers: [
      { type: "skillTestBonus", skill: "Stealth", amount: "agilityBonus" },
    ],
  },
  {
    id: "stride",
    name: "Stride",
    tags: ["movement"],
    summary: "Improves run movement.",
    statBlock: "Mark as long-striding.",
    combatTracker: "Multiply Run movement by 1.5.",
    diceRoller: "No direct roll change.",
    modifiers: [
      { type: "movement", target: "Run", formula: "Run Movement x 1.5" },
    ],
  },
  {
    id: "stupid",
    name: "Stupid",
    tags: ["ai", "condition"],
    summary: "Requires intelligence handling at the start of rounds or causes inaction.",
    statBlock: "Mark as subject to stupidity checks unless Bestial logic overrides it.",
    combatTracker: "At round start, prompt Intelligence test and drop held items or lose action on failure.",
    diceRoller: "Run easy Intelligence test where appropriate.",
    modifiers: [
      { type: "diceHook", target: "round-start-intelligence-test" },
      { type: "combatFlag", target: "may-lose-turn-on-failure" },
    ],
  },
  {
    id: "swamp-strider",
    name: "Swamp-strider",
    tags: ["movement", "terrain"],
    summary: "Removes boggy ground movement penalties.",
    statBlock: "Mark swamp as preferred terrain.",
    combatTracker: "Ignore bog or swamp movement penalties.",
    diceRoller: "No direct roll change unless terrain checks are requested.",
    modifiers: [
      { type: "movement", target: "swamp and bog", notes: "Ignore movement penalties." },
    ],
  },
  {
    id: "swarm",
    name: "Swarm",
    tags: ["group", "damage", "psychology"],
    summary: "Treats many small creatures as one combatant with special damage and psychology handling.",
    statBlock: "Mark creature as a swarm profile rather than a single body.",
    combatTracker: "Ignore normal psychology and wounds logic where the swarm rule applies, and apply automatic losses at round end after successful hits.",
    diceRoller: "Apply swarm hit and damage rules, including automatic wound loss and bonus attack skill where implemented.",
    modifiers: [
      { type: "combatFlag", target: "swarm" },
      { type: "immunity", target: "psychology" },
      { type: "damage", trigger: "end of round after successful swarm hit", target: "engaged opponent" },
      { type: "skillTestBonus", skill: "Weapon Skill", amount: 10, appliesTo: "swarm attacks" },
    ],
  },
  {
    id: "tail-attack",
    name: "Tail Attack",
    parameter: { kind: "rating", label: "Rating", required: true },
    tags: ["attack", "weapon", "condition"],
    summary: "Adds a sweeping tail attack that can knock smaller targets prone.",
    statBlock: "Create a natural tail weapon using rating (rating already includes Strength Bonus).",
    combatTracker: "Show as Free Attack option with Advantage cost and prone output.",
    diceRoller: "Resolve tail attack and apply Prone to smaller targets that suffer wounds.",
    modifiers: [
      { type: "actionOption", action: "Tail Attack", trigger: "spend 1 Advantage" },
      { type: "weaponProfile", target: "Tail", formula: "rating" },
      { type: "condition", condition: "Prone", appliesTo: "smaller target that suffers wounds" },
    ],
  },
  {
    id: "tentacles",
    name: "Tentacles",
    parameter: { kind: "rating", label: "Rating", required: true },
    tags: ["attack", "grapple", "natural-weapon"],
    summary: "Adds multiple tentacle attacks and grapple interactions.",
    statBlock: "Store tentacle count from rating and create natural weapon profile.",
    combatTracker: "Track tentacle attacks, grappled targets, and tentacle-specific free attacks.",
    diceRoller: "Resolve tentacle damage and grapple follow-ups.",
    modifiers: [
      { type: "actionOption", action: "Tentacle Attack", appliesTo: "one per tentacle where allowed" },
      { type: "weaponProfile", target: "Tentacle", formula: "rating" },
      { type: "combatFlag", target: "tentacle-grapple" },
    ],
  },
  {
    id: "territorial",
    name: "Territorial",
    tags: ["ai", "area"],
    summary: "Restricts pursuit and anchors combat behaviour to a protected area.",
    statBlock: "Store territory note if needed.",
    combatTracker: "Warn when targets leave the territory and suppress pursuit suggestions.",
    diceRoller: "No direct roll change.",
    modifiers: [
      { type: "combatFlag", target: "territorial" },
    ],
  },
  {
    id: "terror",
    name: "Terror",
    parameter: { kind: "rating", label: "Rating", required: true },
    tags: ["psychology", "condition"],
    summary: "Triggers terror tests against eligible opponents.",
    statBlock: "Store terror rating.",
    combatTracker: "Prompt terror checks when opponents perceive the creature as hostile.",
    diceRoller: "Run terror test workflow using the rating.",
    modifiers: [
      { type: "diceHook", target: "terror-test", amount: "rating" },
      { type: "combatFlag", target: "causes-terror" },
    ],
  },
  {
    id: "tongue-attack",
    name: "Tongue Attack",
    parameter: { kind: "rating", label: "Rating and range", required: true },
    tags: ["attack", "entangle", "grapple"],
    summary: "Adds a ranged tongue attack that can entangle, pull, and grapple.",
    statBlock: "Create ranged natural weapon with rating damage and configured range.",
    combatTracker: "Track Entangled state, pull distance, and grapple continuation.",
    diceRoller: "Resolve ranged attack, damage, Entangled condition, and opposed release tests.",
    modifiers: [
      { type: "actionOption", action: "Tongue Attack", trigger: "Free Attack using Advantage" },
      { type: "weaponProfile", target: "Tongue", formula: "rating damage" },
      { type: "condition", condition: "Entangled", trigger: "successful hit" },
      { type: "combatFlag", target: "can-pull-and-grapple" },
    ],
  },
  {
    id: "tough",
    name: "Tough",
    tags: ["characteristic", "defense"],
    summary: "Improves resistance and resolve.",
    statBlock: "Apply +10 Toughness and Willpower.",
    combatTracker: "Use improved stats for wounds, resistance, and psychology.",
    diceRoller: "Use adjusted Toughness and Willpower for tests.",
    modifiers: [
      { type: "characteristic", characteristic: "T", amount: 10 },
      { type: "characteristic", characteristic: "WP", amount: 10 },
    ],
  },
  {
    id: "tracker",
    name: "Tracker",
    tags: ["skill"],
    summary: "Improves tracking tests.",
    statBlock: "Mark as tracking-enhanced.",
    combatTracker: "Use as out-of-combat pursuit or ambush helper.",
    diceRoller: "Add Initiative Bonus SL to Track tests.",
    modifiers: [
      { type: "skillTestBonus", skill: "Track", amount: "initiativeBonus" },
    ],
  },
  {
    id: "trained",
    name: "Trained",
    parameter: { kind: "skills", label: "Trained skills", required: true, repeatable: true },
    tags: ["skill", "animal"],
    summary: "Stores animal training packages or custom trained skills.",
    statBlock: "Store trained skill list or named package such as mount, guard, fetch, or war.",
    combatTracker: "Expose trained behaviours as available actions.",
    diceRoller: "Apply package-specific bonuses or permit tests that would otherwise be unavailable.",
    modifiers: [
      { type: "actionOption", target: "trained behaviour", appliesTo: "configured skill list" },
      { type: "skillTestBonus", skill: "configured trained skill", appliesTo: "trained animal use" },
    ],
  },
  {
    id: "undead",
    name: "Undead",
    tags: ["undead", "immunity", "magic"],
    summary: "Marks the creature as neither living nor normally dead for effect filtering.",
    statBlock: "Set undead flag and restrict living-only effects.",
    combatTracker: "Suppress living creature effects and route undead-only effects correctly.",
    diceRoller: "Ignore spells, miracles, poison, disease, or conditions that do not affect undead unless configured.",
    modifiers: [
      { type: "combatFlag", target: "undead" },
      { type: "immunity", target: "living-only-effects" },
    ],
  },
  {
    id: "unstable",
    name: "Unstable",
    tags: ["magic", "wounds", "state"],
    summary: "Adds wound loss when the creature loses a round and can collapse at 0 wounds.",
    statBlock: "Mark as magically unstable.",
    combatTracker: "At round end, compare Advantage or outcome and apply wound loss if the creature lost.",
    diceRoller: "Offer instability resolution hook after round outcome is known.",
    modifiers: [
      { type: "wounds", trigger: "round end after losing", formula: "lose wounds equal to difference" },
      { type: "combatFlag", target: "collapse-at-zero-wounds" },
    ],
  },
  {
    id: "vampiric",
    name: "Vampiric",
    tags: ["healing", "attack"],
    summary: "Restores wounds when the creature inflicts bite damage.",
    statBlock: "Mark as healing from qualifying bite attacks.",
    combatTracker: "After bite damage, prompt wound recovery equal to wounds lost by target.",
    diceRoller: "Apply healing to attacker after qualifying bite damage is resolved.",
    modifiers: [
      { type: "wounds", trigger: "successful Bite causing wound loss", formula: "heal wounds equal to opponent wounds lost" },
    ],
  },
  {
    id: "venom",
    name: "Venom",
    parameter: { kind: "difficulty", label: "Difficulty", required: true },
    tags: ["poison", "condition"],
    summary: "Adds poison condition when an attack causes wounds.",
    statBlock: "Store venom resistance difficulty.",
    combatTracker: "Prompt poison application after wound-causing attacks.",
    diceRoller: "Run poison resistance test at configured difficulty, defaulting to Challenging if absent.",
    modifiers: [
      { type: "condition", condition: "Poisoned", trigger: "attack causes wounds" },
      { type: "diceHook", target: "poison-resistance", appliesTo: "parameter difficulty" },
    ],
  },
  {
    id: "vomit",
    name: "Vomit",
    tags: ["attack", "area", "condition", "damage"],
    summary: "Adds a close area attack that damages targets, stuns, and corrodes equipment.",
    statBlock: "Store as special free attack option.",
    combatTracker: "Select affected targets in cone or close area, then apply damage, Stunned, and equipment damage prompts.",
    diceRoller: "Resolve opposed defense, damage, Stunned condition, and equipment damage.",
    modifiers: [
      { type: "actionOption", action: "Vomit", trigger: "Free Attack using Advantage" },
      { type: "opposedTest", target: "Ballistic Skill versus Dodge" },
      { type: "damage", formula: "Toughness Bonus + 4" },
      { type: "condition", condition: "Stunned", target: "affected targets" },
    ],
  },
  {
    id: "ward",
    name: "Ward",
    parameter: { kind: "rating", label: "Rating", required: true },
    tags: ["defense", "dice"],
    summary: "Provides a chance to ignore incoming wounds.",
    statBlock: "Store ward rating.",
    combatTracker: "Prompt ward roll before applying wound loss.",
    diceRoller: "Roll d10 and ignore wounds if the roll is within rating threshold.",
    modifiers: [
      { type: "diceHook", target: "ward-save", amount: "rating" },
      { type: "wounds", trigger: "successful ward save", formula: "ignore incoming wounds" },
    ],
  },
  {
    id: "wallcrawler",
    name: "Wallcrawler",
    tags: ["movement", "skill"],
    summary: "Allows movement across vertical or inverted surfaces.",
    statBlock: "Mark as able to traverse walls and ceilings.",
    combatTracker: "Allow movement on walls and ceilings and automatic climb success where appropriate.",
    diceRoller: "Suppress normal Climb tests for supported surfaces.",
    modifiers: [
      { type: "movement", target: "walls and ceilings" },
      { type: "skillTestBonus", skill: "Climb", notes: "Automatic success where trait applies." },
    ],
  },
  {
    id: "weapon",
    name: "Weapon",
    parameter: { kind: "rating", label: "Rating", required: true },
    tags: ["attack", "weapon"],
    summary: "Adds or defines a melee natural weapon profile.",
    statBlock: "Create natural weapon damage from rating (rating already includes Strength Bonus).",
    combatTracker: "Show as a standard melee attack option.",
    diceRoller: "Use weapon profile in melee attack and damage resolution.",
    modifiers: [
      { type: "weaponProfile", target: "Natural weapon", formula: "rating" },
    ],
  },
  {
    id: "web",
    name: "Web",
    parameter: { kind: "rating", label: "Rating", required: true },
    tags: ["attack", "condition", "entangle"],
    summary: "Adds webbing that can entangle targets.",
    statBlock: "Store web strength rating.",
    combatTracker: "Apply Entangled condition with strength equal to rating and track escape attempts.",
    diceRoller: "Resolve web attack and escape opposed tests using rating.",
    modifiers: [
      { type: "condition", condition: "Entangled", trigger: "successful web attack", formula: "Strength = rating" },
      { type: "diceHook", target: "entangled-escape", amount: "rating" },
    ],
  },
];

export type CreatureTraitId = typeof creatureTraitDefinitions[number]["id"];

export const creatureTraitDefinitionsById: Record<CreatureTraitId, CreatureTraitDefinition> = Object.fromEntries(
  creatureTraitDefinitions.map((trait) => [trait.id, trait]),
) as Record<CreatureTraitId, CreatureTraitDefinition>;
