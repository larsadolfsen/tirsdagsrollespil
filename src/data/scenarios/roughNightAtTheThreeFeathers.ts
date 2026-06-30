import { npcCatalog } from "../npcs/index";
import { genericCatalog } from "../generic";
import type {
  ScenarioCharacterInstance,
  ScenarioSessionImportDefinition,
} from "./scenarioSessionImport";

const sourceTags = [
  "Rough Nights & Hard Days",
  "A Rough Night at the Three Feathers",
  "Scenario",
] as const;

const NPC = {
  gravin: "three-feathers-gravin-maria-ulrike-von-liebwitz",
  bruno: "three-feathers-bruno-franke",
  rechtshandler: "three-feathers-gustaf-rechtshandler",
  bodyguards: "three-feathers-bodyguards-men-at-arms",
  handmaids: "three-feathers-handmaids-servants",
  dominique: "three-feathers-dominique-herveaux",
  morrians: "three-feathers-gunni-bart-hans-frederick",
  josef: "three-feathers-josef-aufwiegler",
  ursula: "three-feathers-ursula-kopfgeld",
  friedrich: "three-feathers-friedrich-von-pfeifraucher",
  hanna: "three-feathers-hanna-lastkahn",
  thugs: "three-feathers-mho-larz-curls",
  prahmhandler: "three-feathers-thomas-prahmhandler",
  cultists: "three-feathers-allrelia-elphoise-helga",
  coachmen: "three-feathers-coachmen",
  boatmen: "three-feathers-boatmen",
  glimbrin: "three-feathers-glimbrin-oddsock",
  seedling: "three-feathers-mercurinellin-seedling-thorncobble-xiii",
  hans: "three-feathers-hans-orf",
  staff: "three-feathers-servants-cleaners-menials",
  bess: "three-feathers-ol-bess",
} as const;

const LOC = {
  region: "three-feathers-region",
  inn: "three-feathers-inn",
  mainBuilding: "three-feathers-main-building",
  barroom: "three-feathers-barroom",
  dormitory: "three-feathers-dormitory",
  guestRooms: "three-feathers-guest-rooms",
  yard: "three-feathers-yard",
  stables: "three-feathers-stables-smithy",
  outhouse: "three-feathers-outhouse",
  landing: "three-feathers-landing-stage",
  roof: "three-feathers-roof",
  chimney: "three-feathers-chimney",
  room1: "three-feathers-room-1-gravin",
  room2: "three-feathers-room-2-gravins-maids",
  room3: "three-feathers-room-3-rechtshandler",
  room4: "three-feathers-room-4-bruno",
  room6: "three-feathers-room-6-gravins-guards",
  rooms7to8: "three-feathers-room-7-8-pcs",
  room9: "three-feathers-room-9-morrians",
  room10: "three-feathers-room-10-scholars",
  room11: "three-feathers-room-11-schmidts",
  room12: "three-feathers-room-12-seedling",
  room13: "three-feathers-room-13-ursula",
  room14: "three-feathers-room-14-glimbrin",
  room15: "three-feathers-room-15-gravins-servants",
} as const;

const catalogById = new Map(
  [...npcCatalog, ...genericCatalog].map((template) => [template.id, template]),
);

const namedGenericInstances: ScenarioCharacterInstance[] = [
  { id: "three-feathers-gunni-bart-hans-frederick", source: "generic", templateId: "three-feathers-morrian-smuggler", name: "Gunni", role: "Smuggler disguised as a Morrian priest" },
  { id: "three-feathers-bart", source: "generic", templateId: "three-feathers-morrian-smuggler", name: "Bart", role: "Smuggler disguised as a Morrian initiate" },
  { id: "three-feathers-hans-frederick", source: "generic", templateId: "three-feathers-morrian-smuggler", name: "Hans-Frederick", role: "Smuggler disguised as a Morrian initiate" },
  { id: "three-feathers-mho-larz-curls", source: "generic", templateId: "three-feathers-hired-thug", name: "Mho", role: "Thug hired by Thomas Prahmhandler" },
  { id: "three-feathers-larz", source: "generic", templateId: "three-feathers-hired-thug", name: "Larz", role: "Thug hired by Thomas Prahmhandler" },
  { id: "three-feathers-curls", source: "generic", templateId: "three-feathers-hired-thug", name: "'Curls'", role: "Thug hired by Thomas Prahmhandler" },
  { id: "three-feathers-allrelia-elphoise-helga", source: "generic", templateId: "three-feathers-ordo-ultima-agent", name: "Allrelia", role: "Ordo Ultima agent hunting Rechtshandler's secrets" },
  { id: "three-feathers-elphoise", source: "generic", templateId: "three-feathers-ordo-ultima-agent", name: "Elphoise", role: "Ordo Ultima agent hunting Rechtshandler's secrets" },
  { id: "three-feathers-helga", source: "generic", templateId: "three-feathers-ordo-ultima-agent", name: "Helga", role: "Ordo Ultima agent hunting Rechtshandler's secrets" },
];
const namedGenericInstancesById = new Map(
  namedGenericInstances.map((instance) => [instance.id, instance]),
);

const npcRoles: Record<string, string> = {
  [NPC.gravin]: "Travelling noble whose judicial champion is targeted before her trial",
  [NPC.bruno]: "The Gravin's judicial champion and the intended murder victim",
  [NPC.rechtshandler]: "The Gravin's lawyer, carrying a dangerous link to the Ordo Ultima",
  [NPC.bodyguards]: "The Gravin's armed escort and lockdown enforcers",
  [NPC.handmaids]: "The Gravin's servants and messengers",
  [NPC.dominique]: "Assassin posing as a servant in the Gravin's household",
  [NPC.morrians]: "Smugglers disguised as Morrian priests",
  [NPC.josef]: "Drugged agitator hidden in the coffin",
  [NPC.ursula]: "Bounty hunter tracking Josef and the smugglers",
  [NPC.friedrich]: "Minor noble travelling under a false name with Hanna",
  [NPC.hanna]: "Friedrich's lover and Prahmhandler's runaway fiancee",
  [NPC.thugs]: "Hired thugs brought to force a confrontation",
  [NPC.prahmhandler]: "Merchant, wronged fiance, and late-night escalation source",
  [NPC.cultists]: "Ordo Ultima agents hunting Rechtshandler's old secrets",
  [NPC.coachmen]: "Armed guests and possible witnesses in the dormitory",
  [NPC.boatmen]: "Boat crew who know the Schmidts are not who they claim to be",
  [NPC.glimbrin]: "Gnome thief using the crowd as cover",
  [NPC.seedling]: "Halfling gambler whose table gathers rumours and marks",
  [NPC.hans]: "Landlord of the Three Feathers",
  [NPC.staff]: "Inn servants, cleaners, and menials",
  [NPC.bess]: "Inn smith and potential source of practical help",
};

const scenarioGenericNames: Record<string, string> = {
  [NPC.bodyguards]: "The Gravin's Bodyguards",
  [NPC.handmaids]: "The Gravin's Handmaids",
  [NPC.coachmen]: "The Coachmen",
  [NPC.boatmen]: "The Boatmen",
  [NPC.staff]: "The Three Feathers Inn Staff",
};

const scenarioCharacterCounts: Record<string, number> = {
  [NPC.bodyguards]: 4,
  [NPC.handmaids]: 4,
  [NPC.coachmen]: 4,
  [NPC.boatmen]: 4,
  [NPC.staff]: 4,
};

const scenarioCharacterIds = new Set<string>(Object.values(NPC));
const scenarioCharacters: ScenarioCharacterInstance[] = [
  ...[...scenarioCharacterIds].flatMap((id) => {
    const namedGeneric = namedGenericInstancesById.get(id);
    if (namedGeneric) return [namedGeneric];

    const template = catalogById.get(id);
    if (!template) return [];
    return [{
      id,
      source: template.isNpc ? "npc" as const : "generic" as const,
      templateId: template.id,
      name: scenarioGenericNames[id] ?? template.name,
      role: npcRoles[id] ?? template.group,
      ...(scenarioCharacterCounts[id] ? { count: scenarioCharacterCounts[id] } : {}),
    }];
  }),
  ...namedGenericInstances.filter((instance) => !scenarioCharacterIds.has(instance.id)),
];
const scenarioCharactersById = new Map(
  scenarioCharacters.map((instance) => [instance.id, instance]),
);

function npcGroup(id: string, scenarioCharacterId: string, count = 1, name?: string) {
  const instance = scenarioCharactersById.get(scenarioCharacterId);
  const templateId = instance?.templateId ?? scenarioCharacterId;
  const npc = catalogById.get(templateId);
  return {
    id,
    templateId,
    scenarioCharacterId: instance?.id,
    name: name ?? instance?.name ?? npc?.name ?? templateId,
    count,
    wounds: Array.from({ length: count }, () => npc?.statBlock.W ?? 0),
    source: instance?.source === "generic" ? "generic" as const : "npc" as const,
  };
}

export const roughNightAtTheThreeFeathersScenario: ScenarioSessionImportDefinition = {
  id: "rough-night-at-the-three-feathers",
  title: "A Rough Night at the Three Feathers",
  source: {
    book: "Rough Nights & Hard Days",
    scenario: "A Rough Night at the Three Feathers",
  },
  tags: [...sourceTags],
  summary:
    "A single night at an isolated riverside inn becomes a locked-room web of murder, blackmail, smuggling, mistaken identity, theft, cult business, and noble intrigue.",
  defaultSession: {
    name: "A Rough Night at the Three Feathers",
    sessionNumber: 0,
    notes:
      "Detailed scenario import. Player-facing descriptions are kept in normal text components and written in simple second person present tense. GM-only secrets remain in gmNotes. Scenario characters reference canonical NPC or Generic templates, and named instances keep scenario identity separate from inherited mechanics.",
  },
  locations: [
    {
      id: LOC.region,
      name: "Reikland Riverside Route",
      kind: "region",
      description:
        "A flexible route segment used to place the inn in the campaign. The key requirement is that the Characters have a practical reason to stop and no simple way to continue after dark.",
      tags: [...sourceTags],
    },
    {
      id: LOC.inn,
      name: "The Three Feathers Inn",
      kind: "inn",
      parentLocationId: LOC.region,
      description:
        "The whole scenario space. It begins as a busy travel stop and becomes a pressure cooker once the Gravin locks the inn down after Bruno's death.",
      tags: [...sourceTags],
    },
    {
      id: LOC.mainBuilding,
      name: "Main Building",
      kind: "other",
      parentLocationId: LOC.inn,
      description:
        "Two-storey public inn building. It connects the barroom, dormitory, kitchen and service spaces below with the guest corridor above.",
      tags: [...sourceTags],
    },
    {
      id: LOC.barroom,
      name: "Barroom",
      kind: "room",
      parentLocationId: LOC.mainBuilding,
      description:
        "The social hub. It introduces the factions, provides rumours and alibis, and becomes the place where the final dawn explanation can happen.",
      tags: [...sourceTags],
    },
    {
      id: LOC.dormitory,
      name: "Dormitory",
      kind: "room",
      parentLocationId: LOC.mainBuilding,
      description:
        "Shared sleeping space used by lower-status guests, including boatmen, coachmen, and Glimbrin. Use it for witnesses, missing goods, and late-night movements.",
      tags: [...sourceTags],
    },
    {
      id: LOC.guestRooms,
      name: "Guest Room Corridor",
      kind: "room",
      parentLocationId: LOC.mainBuilding,
      description:
        "The upstairs corridor that links the named rooms. Footsteps, opened doors, wrong rooms, and windows matter here.",
      tags: [...sourceTags],
    },
    { id: LOC.yard, name: "Yard", kind: "outdoor", parentLocationId: LOC.inn, description: "Enclosed yard between the buildings, stables, outhouse, and landing stage.", tags: [...sourceTags] },
    { id: LOC.stables, name: "Stables and Smithy", kind: "other", parentLocationId: LOC.yard, description: "Where horses, tackle, and practical repairs can draw staff or witnesses away from the barroom.", tags: [...sourceTags] },
    { id: LOC.outhouse, name: "Outhouse", kind: "other", parentLocationId: LOC.yard, description: "Awkward outside location that can hide movement, bodies, contraband, or frightened NPCs.", tags: [...sourceTags] },
    { id: LOC.landing, name: "Landing Stage", kind: "outdoor", parentLocationId: LOC.inn, description: "The river access point. Boats arrive, delay, and create the excuse for several plots to converge at the inn.", tags: [...sourceTags] },
    { id: LOC.roof, name: "Roof", kind: "outdoor", parentLocationId: LOC.mainBuilding, description: "Escape and hiding route for the cultists and the assassin if the Characters press them upstairs.", tags: [...sourceTags] },
    { id: LOC.chimney, name: "Bruno's Chimney", kind: "other", parentLocationId: LOC.room4, description: "The assassin's route into Bruno's room after the Characters are locked inside.", tags: [...sourceTags] },
    { id: LOC.room1, name: "Room 1, The Gravin", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.room2, name: "Room 2, The Gravin's Maids", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.room3, name: "Room 3, Rechtshandler", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.room4, name: "Room 4, Bruno Franke", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.room6, name: "Room 6, The Gravin's Guards", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.rooms7to8, name: "Rooms 7 and 8, Suggested Character Rooms", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.room9, name: "Room 9, The Morrians", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.room10, name: "Room 10, The Scholars", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.room11, name: "Room 11, The Schmidts", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.room12, name: "Room 12, Seedling", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.room13, name: "Room 13, Ursula Kopfgeld", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.room14, name: "Room 14, Glimbrin", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
    { id: LOC.room15, name: "Room 15, The Gravin's Servants", kind: "room", parentLocationId: LOC.guestRooms, tags: [...sourceTags] },
  ],
  characters: scenarioCharacters,
  npcs: scenarioCharacters.map((character) => ({
    id: character.id,
    name: character.name,
    role: character.role,
    tags: [...sourceTags],
  })),
  scenes: [
    {
      id: "scene-three-feathers-gm-overview",
      title: "GM Overview and Pressure Map",
      kind: "timeline",
      locationId: LOC.inn,
      links: {
        locations: [LOC.inn, LOC.barroom, LOC.guestRooms, LOC.landing],
        npcs: [NPC.gravin, NPC.bruno, NPC.dominique, NPC.rechtshandler, NPC.cultists, NPC.morrians, NPC.josef, NPC.ursula, NPC.friedrich, NPC.hanna, NPC.prahmhandler, NPC.glimbrin, NPC.seedling],
      },
      components: [
        {
          id: "text-overview-core-premise",
          type: "text",
          title: "Core Premise",
          text:
            "You arrive at the Three Feathers expecting food, gossip, and a bed. The inn is warm, loud, and full of people who already watch each other. By dawn, the doors may be guarded, a champion may be dead, a coffin may not hold a corpse, and every witness may have a reason to lie.",
          gmNotes: [
            "Run the scenario as overlapping clocks, not as a linear script.",
            "The text field is player-facing. Keep secrets in gmNotes.",
            "Do not reveal every plot at once. Let one scene interrupt another.",
          ],
          links: { locations: [LOC.inn, LOC.barroom, LOC.guestRooms] },
        },
        {
          id: "text-overview-database-links",
          type: "text",
          title: "Database Links",
          text:
            "You can treat every named person here as a linked NPC. When a fight starts, the encounter already points to the right NPC template. Locations are local to this scenario until a shared location database exists.",
          gmNotes: [
            "Do not duplicate NPC statistics in this file.",
            "Encounter blocks use source: npc and templateId.",
            "When location support exists, migrate these location ids and keep the ids stable.",
          ],
          links: {
            npcs: Object.values(NPC),
            locations: Object.values(LOC),
            weapons: ["dagger", "sword", "rapier", "zweihander", "crossbow", "blunderbuss", "whip", "knuckledusters", "improvised_weapon"],
            talents: ["doomed", "read_write", "strike_to_stun", "warrior_born", "flee", "perfect_pitch"],
          },
        },
        {
          id: "text-overview-clocks",
          type: "text",
          title: "Main Clocks",
          text:
            "You see a room where too many people wait for the right moment. Bruno drinks and boasts. The scholars keep to themselves. The lovers stay close. The false mourners guard their coffin. The bounty hunter watches. The small gambler smiles. Every delay gives someone else time to act.",
          gmNotes: [
            "Track Dominique removing Bruno, the cultists reaching Rechtshandler, Prahmhandler reaching Hanna and Friedrich, Josef waking in the coffin, Ursula identifying the smugglers, Glimbrin stealing during confusion, and the Gravin losing patience.",
            "Advance a clock whenever the Characters spend time on another thread.",
          ],
          links: { npcs: [NPC.dominique, NPC.bruno, NPC.cultists, NPC.rechtshandler, NPC.prahmhandler, NPC.hanna, NPC.friedrich, NPC.josef, NPC.ursula, NPC.glimbrin, NPC.gravin] },
        },
      ],
    },
    {
      id: "scene-three-feathers-location-setup",
      title: "The Inn as a Play Space",
      kind: "location",
      locationId: LOC.inn,
      links: {
        locations: [LOC.inn, LOC.mainBuilding, LOC.barroom, LOC.dormitory, LOC.guestRooms, LOC.yard, LOC.stables, LOC.outhouse, LOC.landing, LOC.roof],
        npcs: [NPC.hans, NPC.staff, NPC.bess],
      },
      components: [
        {
          id: "text-location-ground-floor",
          type: "text",
          title: "Ground Floor",
          text:
            "You stand in the public heart of the inn. The barroom smells of smoke, wet wool, spilled ale, roast meat, and river mud. Hans Orf, the landlord, works behind the bar with a practiced smile and tired eyes. Servants move between the tables with bowls, jugs, and bedding requests. A door leads toward the yard, a stair leads up to the private rooms, and the dormitory sits close enough for poorer travellers to hear the noise.",
          gmNotes: ["This text should give the players the practical layout and the visible staff without revealing hidden motives."],
          links: { locations: [LOC.barroom, LOC.dormitory, LOC.yard], npcs: [NPC.hans, NPC.staff, NPC.bess] },
        },
        {
          id: "text-location-upper-floor",
          type: "text",
          title: "Upper Floor",
          text:
            "You climb into a narrow upper corridor. The air is cooler here, and the boards creak under your boots. Doors stand close together, each with a number or a small mark. You hear muffled voices, a cough, the scrape of a chair, and the soft click of a latch. Rooms 7 and 8 are close to the middle of the trouble, with the Morrians, the Schmidts, Ursula, Bruno, and Rechtshandler all within reach.",
          gmNotes: [
            "Use room proximity to decide who hears screams, arguments, dropped objects, and windows opening.",
            "This is player-facing layout information, not a secret room key.",
          ],
          links: { locations: [LOC.guestRooms, LOC.rooms7to8, LOC.room3, LOC.room4, LOC.room9, LOC.room11, LOC.room13] },
        },
        {
          id: "text-location-exits",
          type: "text",
          title: "Exits and Constraints",
          text:
            "You feel cold night air whenever the outside door opens. The yard smells of horse sweat, mud, smoke, and river fog. You can see the stables, the smithy, the outhouse, the road gate, and the way down toward the landing stage. The roofline is low enough to tempt a climber. After trouble starts, every exit looks possible, but every step away from the inn looks guilty.",
          gmNotes: [
            "If the Characters try to leave early, decide which NPC clock follows them or gets exposed by their absence.",
            "After lockdown, escaping the inn should feel possible but incriminating.",
          ],
          links: { locations: [LOC.yard, LOC.roof, LOC.landing, LOC.outhouse], npcs: [NPC.bodyguards, NPC.gravin] },
        },
      ],
    },
    {
      id: "scene-three-feathers-faction-briefs",
      title: "Faction Briefs",
      kind: "timeline",
      locationId: LOC.inn,
      links: { locations: [LOC.inn, LOC.barroom, LOC.guestRooms], npcs: Object.values(NPC) },
      components: [
        {
          id: "text-faction-gravin",
          type: "text",
          title: "The Gravin's Party",
          text:
            "You see a noble party that takes up space without asking. The Gravin sits apart in fine clothing, surrounded by servants who answer quickly and armed guards who watch the exits. Bruno Franke is the loud champion at the table. Gustaf Rechtshandler is the lawyer with a severe face and careful hands. One servant, Dominique, stays useful, quiet, and close enough to notice too much.",
          gmNotes: ["Do not reveal Dominique's role as assassin in player-facing text."],
          links: { npcs: [NPC.gravin, NPC.bruno, NPC.rechtshandler, NPC.bodyguards, NPC.handmaids, NPC.dominique], locations: [LOC.room1, LOC.room2, LOC.room3, LOC.room4, LOC.room6, LOC.room15], weapons: ["rapier", "sword", "zweihander", "dagger"] },
        },
        {
          id: "text-faction-cultists",
          type: "text",
          title: "The Scholars",
          text:
            "You see three travellers who present themselves as scholars. Their clothes are neat enough, their baggage is plain, and their voices stay low. They ask sensible questions, avoid the loudest tables, and choose a room with little fuss. They look forgettable unless you watch how carefully they watch Rechtshandler.",
          gmNotes: ["These are Ordo Ultima cultists. Keep the cult identity in gmNotes until the Characters earn it."],
          links: { npcs: [NPC.cultists, NPC.rechtshandler], locations: [LOC.room10, LOC.room3], weapons: ["dagger"] },
        },
        {
          id: "text-faction-smugglers",
          type: "text",
          title: "The Morrians and the Coffin",
          text:
            "You see three black-robed mourners with face paint and a coffin. They speak as if grief gives them the right to be left alone. The coffin is heavy, damp from the river air, and handled with more urgency than reverence. People make room for it without being asked.",
          gmNotes: ["The coffin contains Josef, who is drugged and alive."],
          links: { npcs: [NPC.morrians, NPC.josef, NPC.ursula], locations: [LOC.room9, LOC.landing] },
        },
        {
          id: "text-faction-lovers",
          type: "text",
          title: "The Schmidts and the Angry Merchant",
          text:
            "You see a well-dressed couple who give the names Schmidt and Schmidt, but they hesitate before using them. Friedrich speaks like a noble trying not to. Hanna keeps close to him and watches the door. Later, Thomas Prahmhandler arrives with drink on his breath, anger in his voice, and hired men at his back.",
          gmNotes: ["Friedrich and Hanna are lovers travelling under false names. Prahmhandler is Hanna's wronged fiance."],
          links: { npcs: [NPC.friedrich, NPC.hanna, NPC.prahmhandler, NPC.thugs], locations: [LOC.room11, LOC.barroom, LOC.guestRooms], weapons: ["dagger", "whip", "knuckledusters", "improvised_weapon"] },
        },
        {
          id: "text-faction-thieves-and-guests",
          type: "text",
          title: "Gamblers, Thieves, Boatmen, and Coachmen",
          text:
            "You see Seedling at a card table with a bright smile and a quick patter. He invites coins, jokes, and gossip. Glimbrin moves near him with quiet feet and eyes that count purses, keys, and cups. Boatmen and coachmen drink in rougher clusters, trade insults, and keep their own weapons close.",
          gmNotes: ["Use theft to move clues, not to punish players randomly."],
          links: { npcs: [NPC.seedling, NPC.glimbrin, NPC.boatmen, NPC.coachmen], locations: [LOC.barroom, LOC.dormitory, LOC.room12, LOC.room14], weapons: ["blunderbuss", "whip", "sword", "dagger"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-2100-arrival",
      title: "9:00 p.m. Arrival and First Impressions",
      kind: "timeline",
      locationId: LOC.barroom,
      links: { locations: [LOC.barroom, LOC.room1, LOC.room4, LOC.rooms7to8], npcs: [NPC.hans, NPC.gravin, NPC.bruno, NPC.seedling, NPC.bodyguards, NPC.handmaids] },
      components: [
        {
          id: "text-2100-arrival",
          type: "text",
          title: "Characters Enter the Inn",
          text:
            "You push into the Three Feathers and the heat hits you first. Smoke hangs below the beams. Wet cloaks steam near the fire. Hans Orf, the landlord, stands behind the bar and keeps one eye on the stairs while he pours ale. Servants squeeze past you with trays and blankets. A noble woman sits with armed retainers in the best part of the room. Bruno Franke laughs too loudly near a table, thick arms bare, and challenges anyone nearby. Seedling, a small gambler with bright eyes, taps a deck of cards and leaves a chair open.",
          gmNotes: [
            "Ask each Character what they do first: eat, drink, gamble, find a room, watch the nobles, inspect the yard, or listen for gossip.",
            "This answer determines who notices later movement.",
          ],
          links: { locations: [LOC.barroom, LOC.rooms7to8], npcs: [NPC.hans, NPC.gravin, NPC.bruno, NPC.seedling, NPC.bodyguards, NPC.handmaids] },
        },
        {
          id: "encounter-bruno-table-challenge",
          type: "encounter",
          title: "Bruno's Table Challenge",
          text:
            "You hear Bruno slam his fist onto the table. Cups jump, dice rattle, and the people nearest him cheer. He grins at you with a drunk champion's confidence and offers an arm, a cup, or an insult, depending on who looks bold enough. The guards do not stop him, but one servant watches him with clear irritation.",
          gmNotes: [
            "Resolve as social pressure or opposed Strength before using combat.",
            "If a Character befriends Bruno, Dominique has a reason to watch that Character too.",
          ],
          links: { locations: [LOC.barroom], npcs: [NPC.bruno, NPC.dominique], skills: ["Athletics", "Charm", "Cool", "Endurance", "Intimidate"], weapons: ["unarmed"] },
          encounterData: { monsterGroups: [npcGroup("grp-bruno-table", NPC.bruno)], playerOrder: [] },
        },
        {
          id: "text-2100-seedling-cards",
          type: "text",
          title: "Seedling's Card Table",
          text:
            "You see Seedling shuffle a worn deck with quick, soft hands. A few coins sit on the table. He smiles at you as if he already knows your luck. Glimbrin lingers near the game, smaller than most humans, quiet enough to miss, and more interested in belts and bags than cards.",
          gmNotes: ["If the Characters play, attach them to Seedling and Glimbrin early."],
          links: { locations: [LOC.barroom], npcs: [NPC.seedling, NPC.glimbrin], skills: ["Gamble", "Perception", "Sleight of Hand"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-2110-to-2135-new-arrivals",
      title: "9:10 p.m. to 9:35 p.m. New Arrivals",
      kind: "timeline",
      locationId: LOC.barroom,
      links: { locations: [LOC.barroom, LOC.landing, LOC.dormitory, LOC.room9, LOC.room10, LOC.room11, LOC.room14], npcs: [NPC.cultists, NPC.glimbrin, NPC.seedling, NPC.bruno, NPC.gravin, NPC.friedrich, NPC.hanna, NPC.boatmen, NPC.morrians, NPC.josef] },
      components: [
        {
          id: "text-2110-scholars-arrive",
          type: "text",
          title: "9:10 p.m. Scholars Arrive",
          text:
            "You see three travellers enter with dry voices and careful hands. They look like scholars: plain bags, ink-stained fingers, travel-stiff cloaks. They ask Hans for a room and keep their backs close to the wall. Their eyes pass over Bruno, the Gravin's guards, and Rechtshandler before they look away.",
          gmNotes: ["Their cover is mundane. Do not make them obviously sinister unless the Characters press them."],
          links: { locations: [LOC.barroom, LOC.room10], npcs: [NPC.cultists], skills: ["Intuition", "Perception"] },
        },
        {
          id: "text-2115-glimbrin-arrives",
          type: "text",
          title: "9:15 p.m. Glimbrin Joins the Room",
          text:
            "You notice Glimbrin slip into the room with an easy smile. He books cheap lodging, then drifts toward Seedling's cards. He looks at purses, keys, coats, and unattended cups. When someone looks back, he looks harmless.",
          gmNotes: ["Use Glimbrin to relocate a clue, not to make progress impossible."],
          links: { locations: [LOC.barroom, LOC.dormitory, LOC.room14], npcs: [NPC.glimbrin, NPC.seedling], skills: ["Perception", "Sleight of Hand", "Stealth (Urban)"] },
        },
        {
          id: "text-2120-bruno-sent-upstairs",
          type: "text",
          title: "9:20 p.m. Bruno Is Sent Upstairs",
          text:
            "You hear a servant's sharp voice cut through Bruno's laughter. Bruno's grin turns sour. His chair scrapes hard across the floor, and his heavy steps climb the stairs to room 4. The servant watches him go before returning to the Gravin's side.",
          gmNotes: ["Make sure at least one Character can know when Bruno leaves."],
          links: { locations: [LOC.barroom, LOC.room4], npcs: [NPC.bruno, NPC.handmaids, NPC.gravin] },
        },
        {
          id: "text-2125-gravin-retires",
          type: "text",
          title: "9:25 p.m. The Gravin Retires",
          text:
            "You see the Gravin rise, and the people around her move at once. Servants gather dishes, cloaks, and candles. Guards clear a path without speaking. She goes upstairs toward room 1, leaving authority behind her like a closed door.",
          gmNotes: ["Her authority should be felt even when she is offstage."],
          links: { locations: [LOC.room1, LOC.room2, LOC.room6, LOC.room15], npcs: [NPC.gravin, NPC.bodyguards, NPC.handmaids] },
        },
        {
          id: "text-2130-schmidts-arrive",
          type: "text",
          title: "9:30 p.m. The Schmidts Arrive",
          text:
            "You hear river wind before the couple enters. The man gives the name Schmidt a little too quickly. The woman stays close to him and keeps her face half-turned from the room. Two boatmen follow with wet boots and guarded expressions. They know something, but they look paid not to say it.",
          gmNotes: ["If a Character speaks with the boatmen early, reward it with partial suspicion rather than full truth."],
          links: { locations: [LOC.landing, LOC.barroom, LOC.room11, LOC.dormitory], npcs: [NPC.friedrich, NPC.hanna, NPC.boatmen] },
        },
        {
          id: "text-2135-morrians-arrive",
          type: "text",
          title: "9:35 p.m. The Morrians Arrive",
          text:
            "You see three black-robed mourners carry in a coffin. The room quiets around them. Their face paint is thick, their robes smell of river damp, and their hands grip the coffin too tightly. They ask for room 9 and expect everyone to make space.",
          gmNotes: ["The coffin should be memorable but not immediately solved unless the Characters force the issue."],
          links: { locations: [LOC.barroom, LOC.room9], npcs: [NPC.morrians, NPC.josef, NPC.ursula], skills: ["Intuition", "Lore (Morr)", "Perception"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-2150-to-2225-pressure-rises",
      title: "9:50 p.m. to 10:25 p.m. Pressure Rises",
      kind: "timeline",
      locationId: LOC.barroom,
      links: { locations: [LOC.barroom, LOC.room4, LOC.room13], npcs: [NPC.ursula, NPC.morrians, NPC.bruno, NPC.dominique, NPC.handmaids, NPC.hanna, NPC.friedrich, NPC.cultists, NPC.hans] },
      components: [
        {
          id: "text-2150-ursula-arrives",
          type: "text",
          title: "9:50 p.m. Ursula Arrives",
          text:
            "You see a hard-faced woman enter from the yard with cold air behind her. She carries road dust, leather, and iron. A crossbow case sits close to her hand. She chooses a seat where she can see the Morrians, the coffin, the stairs, and the door.",
          gmNotes: ["Ursula is a competent observer. She can become an ally if the Characters are direct and useful."],
          links: { locations: [LOC.barroom, LOC.room13, LOC.stables], npcs: [NPC.ursula, NPC.morrians, NPC.josef], weapons: ["crossbow", "sword"] },
        },
        {
          id: "text-2200-bedtime-order",
          type: "text",
          title: "10:00 p.m. The Gravin's Bedtime Order",
          text:
            "You hear another servant call the Gravin's people to bed. Some obey. Some pretend not to hear. Guards finish drinks and look toward the stairs. The order creates movement, blocked sightlines, and enough noise for quiet people to go missing.",
          gmNotes: ["Use this as the transition from public social play into surveillance and suspicion."],
          links: { locations: [LOC.barroom, LOC.guestRooms], npcs: [NPC.handmaids, NPC.bodyguards, NPC.friedrich, NPC.hanna] },
        },
        {
          id: "encounter-2210-bruno-drugged-drink",
          type: "encounter",
          title: "10:10 p.m. Bruno's Last Drink",
          text:
            "You see fresh drinks land on Bruno's table. Foam slides down the mugs. Bruno grabs one without checking it, still grinning and still loud. Dominique stands near enough to be useful, but not near enough to seem important. Ursula watches from across the room.",
          gmNotes: [
            "This is an encounter because the Characters can oppose, drink, distract, or protect Bruno.",
            "If Bruno avoids the drug, Dominique must improvise and may become riskier later.",
          ],
          links: { locations: [LOC.barroom, LOC.room4], npcs: [NPC.bruno, NPC.dominique, NPC.ursula], skills: ["Consume Alcohol", "Endurance", "Intuition", "Perception", "Sleight of Hand"], weapons: ["dagger", "rapier", "sword"] },
          encounterData: { monsterGroups: [npcGroup("grp-bruno-last-drink", NPC.bruno), npcGroup("grp-dominique-observer", NPC.dominique)], playerOrder: [] },
        },
        {
          id: "text-2215-cultist-message",
          type: "text",
          title: "10:15 p.m. The Scholars Expect a Boat",
          text:
            "You see one scholar lean close to Hans at the bar. The scholar speaks quietly and asks to be told when a particular boat arrives. Hans nods, wipes his hands, and looks toward the landing door.",
          gmNotes: ["Hans may remember the request if questioned after Rechtshandler dies."],
          links: { locations: [LOC.barroom, LOC.landing], npcs: [NPC.cultists, NPC.hans] },
        },
        {
          id: "text-2225-bruno-missing",
          type: "text",
          title: "10:25 p.m. Bruno Is Missing",
          text:
            "You hear quick steps on the stairs. A servant comes down pale and tense, then goes straight to the Gravin's people. The common room keeps talking, but a cold pause opens around the guards. Bruno is not where he should be.",
          gmNotes: ["Do not announce murder yet. Missing is more useful than dead at this stage."],
          links: { locations: [LOC.room4, LOC.guestRooms], npcs: [NPC.bruno, NPC.handmaids, NPC.gravin] },
        },
      ],
    },
    {
      id: "scene-three-feathers-2240-to-2315-rechtshandler",
      title: "10:40 p.m. to 11:15 p.m. Rechtshandler and the Cultists",
      kind: "encounter",
      locationId: LOC.room3,
      links: { locations: [LOC.room3, LOC.room10, LOC.guestRooms, LOC.roof], npcs: [NPC.rechtshandler, NPC.cultists, NPC.handmaids] },
      components: [
        {
          id: "text-2240-lawyer-movement",
          type: "text",
          title: "10:40 p.m. Rechtshandler Goes Upstairs",
          text:
            "You see Rechtshandler leave the room with his shoulders tight and a candle in one hand. He does not look drunk. He looks cornered. A scholar waits a breath too long, then follows at a distance toward the upper corridor.",
          gmNotes: ["Use fragments, not exposition. Names, threats, payments, and fear are enough."],
          links: { locations: [LOC.barroom, LOC.room3], npcs: [NPC.rechtshandler, NPC.cultists], skills: ["Perception", "Stealth (Urban)"] },
        },
        {
          id: "encounter-2305-cultists-kill-lawyer",
          type: "encounter",
          title: "11:05 p.m. The Lawyer Is Killed",
          text:
            "You stand near room 3 and hear low voices behind the door. Rechtshandler's voice trembles. Another voice stays calm. You hear a scrape, a short gasp, and something heavy hitting the floor. The corridor smells of candle wax and old dust.",
          gmNotes: [
            "If the Characters intervene early, the cultists try threats first and violence second.",
            "If they arrive late, focus on physical traces: disturbed room, window, papers, and who was seen on the corridor.",
          ],
          links: { locations: [LOC.room3, LOC.guestRooms, LOC.roof], npcs: [NPC.rechtshandler, NPC.cultists], skills: ["Cool", "Intimidate", "Perception", "Track"], weapons: ["dagger"] },
          encounterData: {
            monsterGroups: [
              npcGroup("grp-cultist-allrelia", "three-feathers-allrelia-elphoise-helga"),
              npcGroup("grp-cultist-elphoise", "three-feathers-elphoise"),
              npcGroup("grp-cultist-helga", "three-feathers-helga"),
            ],
            playerOrder: [],
          },
        },
        {
          id: "text-2315-blackmail-hook",
          type: "text",
          title: "11:15 p.m. The Job Offer",
          text:
            "You find Rechtshandler shaken, sweating, and desperate enough to talk. He offers money for help and keeps looking at the door. His room smells of ink, fear, and hot candle wax. Papers lie too neatly on the table, as if someone has already searched them.",
          gmNotes: ["A bribe is a hook, not a required path. The Characters can refuse, exploit, report, or misunderstand it."],
          links: { locations: [LOC.room3, LOC.rooms7to8], npcs: [NPC.rechtshandler, NPC.cultists], skills: ["Bribery", "Charm", "Haggle", "Intuition"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-2330-prahmhandler-brawl",
      title: "11:30 p.m. Prahmhandler Arrives",
      kind: "encounter",
      locationId: LOC.barroom,
      links: { locations: [LOC.barroom, LOC.guestRooms, LOC.room11], npcs: [NPC.prahmhandler, NPC.thugs, NPC.friedrich, NPC.hanna, NPC.bodyguards, NPC.hans, NPC.staff] },
      components: [
        {
          id: "text-2330-prahmhandler-entry",
          type: "text",
          title: "Angry Arrival",
          text:
            "You hear the door slam before you see him. Rain and cold air rush into the barroom. Thomas Prahmhandler smells of drink, sweat, and road mud. He shouts Hanna's name and demands the man with her. Three hard-faced men stand behind him with heavy hands and no patience.",
          gmNotes: ["This scene is ideal for interrupting a careful investigation."],
          links: { locations: [LOC.barroom, LOC.guestRooms, LOC.room11], npcs: [NPC.prahmhandler, NPC.thugs, NPC.friedrich, NPC.hanna], skills: ["Charm", "Cool", "Intimidate", "Leadership"] },
        },
        {
          id: "encounter-prahmhandler-and-thugs",
          type: "encounter",
          title: "Brawl on the Stairs",
          text:
            "You stand between Prahmhandler's anger and the stairs. Chairs scrape back. A jug rolls across the floor. Hans shouts for calm, servants back away, and the Gravin's guards turn their heads. The first shove lands before anyone admits this is a fight.",
          gmNotes: [
            "The goal is not necessarily to kill anyone. The danger is noise, delay, injury, and giving other factions freedom to act.",
            "If the Characters prevent him from reaching room 11, award that as meaningful progress.",
          ],
          links: { locations: [LOC.barroom, LOC.guestRooms, LOC.room11], npcs: [NPC.prahmhandler, NPC.thugs, NPC.bodyguards, NPC.staff], weapons: ["dagger", "whip", "knuckledusters", "improvised_weapon", "sword"], skills: ["Dodge", "Melee (Basic)", "Melee (Brawling)"] },
          encounterData: {
            monsterGroups: [
              npcGroup("grp-prahmhandler", NPC.prahmhandler),
              npcGroup("grp-thug-mho", "three-feathers-mho-larz-curls"),
              npcGroup("grp-thug-larz", "three-feathers-larz"),
              npcGroup("grp-thug-curls", "three-feathers-curls"),
            ],
            playerOrder: [],
          },
        },
      ],
    },
    {
      id: "scene-three-feathers-midnight-coffin",
      title: "Midnight, The Coffin Wakes",
      kind: "encounter",
      locationId: LOC.room9,
      links: { locations: [LOC.room9, LOC.guestRooms, LOC.landing], npcs: [NPC.morrians, NPC.josef, NPC.ursula, NPC.bodyguards] },
      components: [
        {
          id: "text-midnight-noise",
          type: "text",
          title: "Noise in Room 9",
          text:
            "You hear a thump from room 9. Then another. A low groan leaks through the door, followed by rushed whispers and a hard knock against wood. The false Morrians answer too quickly if anyone asks what happens inside.",
          gmNotes: ["Let the smugglers lie badly if pressured. Their disguise works best at a distance."],
          links: { locations: [LOC.room9, LOC.guestRooms], npcs: [NPC.morrians, NPC.josef], skills: ["Intuition", "Perception", "Lore (Morr)"] },
        },
        {
          id: "encounter-morrians-exposed",
          type: "encounter",
          title: "The False Corpse",
          text:
            "You see the coffin lid shift. The air inside smells sour, stale, and medicinal. A living man blinks up from the dark wood, weak but awake. The black-robed men move at once, no longer slow, holy, or grieving. Ursula steps forward if she sees Josef clearly.",
          gmNotes: [
            "This can solve one mystery while making the murder accusation later more chaotic.",
            "If Josef escapes into the inn, treat it as a chase through rooms and stairs.",
          ],
          links: { locations: [LOC.room9, LOC.guestRooms, LOC.landing, LOC.yard], npcs: [NPC.morrians, NPC.josef, NPC.ursula], weapons: ["improvised_weapon", "sword", "crossbow"] },
          encounterData: {
            monsterGroups: [
              npcGroup("grp-morrian-gunni", "three-feathers-gunni-bart-hans-frederick"),
              npcGroup("grp-morrian-bart", "three-feathers-bart"),
              npcGroup("grp-morrian-hans-frederick", "three-feathers-hans-frederick"),
              npcGroup("grp-josef-aufwiegler", NPC.josef),
              npcGroup("grp-ursula-kopfgeld", NPC.ursula),
            ],
            playerOrder: [],
          },
        },
      ],
    },
    {
      id: "scene-three-feathers-0020-bruno-found",
      title: "12:20 a.m. Bruno Is Found Dead",
      kind: "timeline",
      locationId: LOC.room4,
      links: { locations: [LOC.room4, LOC.room1, LOC.guestRooms, LOC.barroom], npcs: [NPC.bruno, NPC.gravin, NPC.dominique, NPC.bodyguards, NPC.handmaids] },
      components: [
        {
          id: "text-0020-scream-and-body",
          type: "text",
          title: "Scream from the Gravin's Wing",
          text:
            "You hear a scream tear through the upper floor. Doors open. Feet pound in the corridor. In Bruno's room, the air smells of sweat, cold ash, and blood. Bruno lies still. A weapon sits where everyone can see it. Dominique is pale and breathless. The Gravin's servants cluster at the edge of the room, and the guards start looking for someone to blame.",
          gmNotes: [
            "The point is not to trap the party unfairly. The point is to force them into investigation under pressure.",
            "Track who knew where Bruno was, who saw the servant, and who had access to the room.",
          ],
          links: { locations: [LOC.room4, LOC.guestRooms], npcs: [NPC.bruno, NPC.dominique, NPC.gravin, NPC.handmaids], weapons: ["dagger"] },
        },
        {
          id: "encounter-lockdown-by-gravin",
          type: "encounter",
          title: "The Gravin Locks Down the Inn",
          text:
            "You face drawn steel and hard eyes. The Gravin's guards close the exits and push guests back from the stairs. The barroom goes tight and quiet, except for one sob, one muttered prayer, and the creak of leather armour. Hans stands behind the bar with both hands visible and says nothing unless spoken to.",
          gmNotes: [
            "The Gravin is not stupid. She wants the truth, but she also wants control.",
            "Make clear that violence against her guards has consequences beyond this room.",
          ],
          links: { locations: [LOC.barroom, LOC.guestRooms, LOC.room1, LOC.room4], npcs: [NPC.gravin, NPC.bodyguards, NPC.staff, NPC.hans], weapons: ["sword", "improvised_weapon"], talents: ["strike_to_stun"] },
          encounterData: { monsterGroups: [npcGroup("grp-gravin-bodyguards-lockdown", NPC.bodyguards, 4, "Gravin's Bodyguards"), npcGroup("grp-inn-staff-lockdown", NPC.staff, 4, "Inn Staff")], playerOrder: [] },
        },
      ],
    },
    {
      id: "scene-three-feathers-0120-locked-room-investigation",
      title: "1:20 a.m. Locked in Bruno's Room",
      kind: "location",
      locationId: LOC.room4,
      links: { locations: [LOC.room4, LOC.chimney, LOC.guestRooms, LOC.room1], npcs: [NPC.gravin, NPC.bruno, NPC.dominique, NPC.bodyguards] },
      components: [
        {
          id: "text-0120-gravin-private-talk",
          type: "text",
          title: "Private Audience",
          text:
            "You stand under the Gravin's gaze in a room that feels too small for her anger. Her voice stays controlled, but her guards keep their hands near their weapons. She needs answers before dawn. She gives you enough freedom to investigate, but not enough freedom to simply walk away.",
          gmNotes: ["Use this scene to give the party permission to investigate, but only under pressure."],
          links: { locations: [LOC.room1, LOC.room4], npcs: [NPC.gravin, NPC.bodyguards] },
        },
        {
          id: "text-locked-room-clues",
          type: "text",
          title: "Clues in Bruno's Room",
          text:
            "You stand in Bruno's room with the door watched from outside. The bed is disturbed. The hearth is dark, but soot marks the chimney stones. The room smells of blood, stale drink, cold ash, and damp wool. Bruno's things are not all where they should be. The window, the bed, the weapon, and the chimney all look like they matter.",
          gmNotes: [
            "Useful questions: how did the killer enter, why frame outsiders, who benefits from Bruno dying, and what still needs retrieving?",
            "If the Characters search well, foreshadow Dominique's return through the chimney.",
          ],
          links: { locations: [LOC.room4, LOC.chimney], npcs: [NPC.bruno, NPC.dominique], skills: ["Perception", "Intuition", "Heal", "Track", "Sleight of Hand"], weapons: ["dagger"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-0200-assassin-return",
      title: "2:00 a.m. Assassin in the Chimney",
      kind: "encounter",
      locationId: LOC.room4,
      links: { locations: [LOC.room4, LOC.chimney, LOC.roof, LOC.yard], npcs: [NPC.dominique, NPC.bodyguards, NPC.gravin] },
      components: [
        {
          id: "encounter-dominique-chimney",
          type: "encounter",
          title: "Dominique Retrieves the Evidence",
          text:
            "You hear a soft scrape inside the chimney. Soot falls into the cold hearth. A hand appears, then a face streaked black with ash. Dominique drops lightly into the room and freezes when she sees you. Her eyes go to the bed, then to the door, then to the chimney above her.",
          gmNotes: [
            "Use vertical movement, soot, darkness, and cramped space to make this feel different from a normal fight.",
            "If captured, Dominique is the cleanest route to Bruno's killer and the motive behind the attack.",
          ],
          links: { locations: [LOC.room4, LOC.chimney, LOC.roof, LOC.yard], npcs: [NPC.dominique, NPC.bodyguards], weapons: ["dagger"], skills: ["Athletics", "Dodge", "Melee (Basic)", "Perception", "Stealth (Urban)"] },
          encounterData: { monsterGroups: [npcGroup("grp-dominique-chimney", NPC.dominique)], playerOrder: [] },
        },
      ],
    },
    {
      id: "scene-three-feathers-0430-dawn-reckoning",
      title: "4:30 a.m. Dawn Reckoning",
      kind: "aftermath",
      locationId: LOC.barroom,
      links: { locations: [LOC.barroom, LOC.room9, LOC.landing], npcs: [NPC.gravin, NPC.dominique, NPC.bruno, NPC.morrians, NPC.josef, NPC.ursula, NPC.cultists, NPC.rechtshandler] },
      components: [
        {
          id: "text-0430-everyone-gathered",
          type: "text",
          title: "Everyone Is Gathered",
          text:
            "You stand in the barroom as grey dawn leaks through the shutters. The fire is low. Empty cups, spilled ale, and muddy tracks mark the floor. The Gravin's guards keep everyone close. Hans looks older than he did at sunset. Every surviving guest watches the next speaker.",
          gmNotes: ["Do not explain unsolved threads automatically. Let gaps become future hooks if needed."],
          links: { locations: [LOC.barroom], npcs: [NPC.gravin, NPC.bodyguards, NPC.hans, NPC.staff] },
        },
        {
          id: "text-0430-coffin-reveal",
          type: "text",
          title: "The Coffin Reveal",
          text:
            "You see the coffin brought back into the centre of attention. The black robes do not make the room quiet now. If the lid opens, stale air rolls out and Josef's living face gives the lie to every prayer the false Morrians have spoken.",
          gmNotes: ["This reveal should not replace the Bruno investigation, but it can complicate who the Gravin trusts."],
          links: { locations: [LOC.room9, LOC.barroom, LOC.landing], npcs: [NPC.morrians, NPC.josef, NPC.ursula] },
        },
        {
          id: "text-resolution-truth-table",
          type: "text",
          title: "Resolution Questions",
          text:
            "You have enough pieces to name what happened, or enough scars to admit what you failed to stop. The room needs answers: who killed Bruno, what happened to Rechtshandler, why the coffin held a living man, and who can prove what you did tonight.",
          gmNotes: [
            "Partial success is valid. The Characters might clear themselves without solving every faction plot.",
            "If they protect the Gravin's legal interests, she can become a patron or future complication.",
          ],
          links: { npcs: [NPC.gravin, NPC.bruno, NPC.dominique, NPC.rechtshandler, NPC.cultists, NPC.morrians, NPC.josef, NPC.ursula] },
        },
      ],
    },
    {
      id: "scene-three-feathers-rewards-and-followups",
      title: "Rewards and Follow-up Hooks",
      kind: "aftermath",
      locationId: LOC.inn,
      links: { locations: [LOC.inn, LOC.landing], npcs: [NPC.gravin, NPC.ursula, NPC.seedling, NPC.glimbrin, NPC.cultists, NPC.prahmhandler] },
      components: [
        {
          id: "text-rewards",
          type: "text",
          title: "Experience Awards",
          text:
            "You leave the Three Feathers with smoke in your clothes, river mud on your boots, and names that may follow you. Award progress for investigation, protection, restraint, clever violence, exposed lies, and hard choices, not only for winning fights.",
          gmNotes: ["Reward solved threads and hard choices, not only combat victories."],
          links: { npcs: [NPC.bruno, NPC.dominique, NPC.cultists, NPC.prahmhandler, NPC.josef, NPC.seedling, NPC.glimbrin, NPC.gravin] },
        },
        {
          id: "text-followup-hooks",
          type: "text",
          title: "Campaign Follow-ups",
          text:
            "You see the first boats and carts leave after dawn. The Gravin may remember your service. Ursula may remember your usefulness. The cult may remember your face. Glimbrin may already have something that belongs to you. Prahmhandler, Friedrich, and Hanna may carry the scandal onward.",
          gmNotes: ["Choose one or two follow-ups only. Too many will dilute the result of the night."],
          links: { npcs: [NPC.gravin, NPC.ursula, NPC.cultists, NPC.glimbrin, NPC.prahmhandler, NPC.friedrich, NPC.hanna] },
        },
      ],
    },
  ],
};
