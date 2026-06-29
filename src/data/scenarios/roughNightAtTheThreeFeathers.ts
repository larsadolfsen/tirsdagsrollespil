import { threeFeathersNpcs } from "../rules/wfrp4e/threeFeathersNpcs";
import type { ScenarioSessionImportDefinition } from "./scenarioSessionImport";

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

const npcById = new Map(threeFeathersNpcs.map((npc) => [npc.id, npc]));

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

function npcGroup(id: string, templateId: string, count = 1, name?: string) {
  const npc = npcById.get(templateId);
  return {
    id,
    templateId,
    name: name ?? npc?.name ?? templateId,
    count,
    wounds: Array.from({ length: count }, () => npc?.statBlock.W ?? 0),
    source: "npc" as const,
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
      "Detailed scenario import. NPCs are linked to the NPC database by id. Encounters use source: npc and templateId. Locations are scenario-local because no shared location database exists yet. Rules, weapons, talents, and skills are referenced by ids or stable labels where the database already exists.",
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
  npcs: threeFeathersNpcs.map((npc) => ({
    id: npc.id,
    name: npc.name,
    role: npcRoles[npc.id] ?? npc.group,
    tags: [...npc.tags],
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
            "The Characters stop at the Three Feathers expecting food, gossip, and a bed. The inn is already loaded with hidden agendas. By dawn, they may be blamed for murder, asked to solve it, dragged into a family scandal, exposed to cult business, and forced to choose who leaves alive.",
          gmNotes: [
            "Run the scenario as overlapping clocks, not as a linear script.",
            "The Characters should see enough suspicious behaviour to choose which thread to pursue.",
            "Do not reveal every plot at once. Let one scene interrupt another.",
          ],
          links: { locations: [LOC.inn, LOC.barroom, LOC.guestRooms] },
        },
        {
          id: "text-overview-database-links",
          type: "text",
          title: "Database Links",
          text:
            "All major NPCs in this import link to the NPC database. Encounter blocks reference those NPC ids through templateId and source npc. The inn locations remain scenario-local because no shared location database exists yet.",
          gmNotes: [
            "Do not duplicate NPC statistics in this file.",
            "When new location support exists, migrate these location ids into the location database and keep the same ids.",
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
            "Track seven active clocks: Dominique removing Bruno, the cultists reaching Rechtshandler, Prahmhandler reaching Hanna and Friedrich, Josef waking in the coffin, Ursula identifying the smugglers, Glimbrin stealing during confusion, and the Gravin losing patience with everyone.",
          gmNotes: [
            "Advance a clock whenever the Characters spend time on another thread.",
            "When two clocks collide, use the noisier event to interrupt the current scene.",
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
            "Use the barroom as the public stage. Hans and the staff move constantly between tables, kitchen, stairs, and yard. The dormitory is less controlled, giving low-status NPCs room to hide, overhear, or steal.",
          gmNotes: ["Keep the barroom noisy enough that private words require deliberate positioning."],
          links: { locations: [LOC.barroom, LOC.dormitory, LOC.yard], npcs: [NPC.hans, NPC.staff, NPC.bess] },
        },
        {
          id: "text-location-upper-floor",
          type: "text",
          title: "Upper Floor",
          text:
            "The upstairs corridor is where the scenario tightens. Doors, room numbers, witnesses, and who has permission to be there should matter. Let the Characters hear movement before they see it.",
          gmNotes: [
            "Use room proximity to decide who hears screams, arguments, dropped objects, and windows opening.",
            "Rooms 7 and 8 work well as Character rooms because they put the party near the Morrians, the Schmidts, and Ursula without placing them inside the Gravin's wing.",
          ],
          links: { locations: [LOC.guestRooms, LOC.rooms7to8, LOC.room3, LOC.room4, LOC.room9, LOC.room11, LOC.room13] },
        },
        {
          id: "text-location-exits",
          type: "text",
          title: "Exits and Constraints",
          text:
            "The road, river, yard, roof, and landing stage all look like possible exits, but darkness, guards, suspicion, and the Gravin's authority should make flight costly after Bruno is found dead.",
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
            "The Gravin travels with servants, guards, her lawyer Rechtshandler, and Bruno Franke, the champion she needs for an imminent legal matter. Her party has status, money, and force, but not full control of the inn.",
          gmNotes: ["The Gravin should feel powerful but vulnerable because her plan depends on Bruno."],
          links: { npcs: [NPC.gravin, NPC.bruno, NPC.rechtshandler, NPC.bodyguards, NPC.handmaids, NPC.dominique], locations: [LOC.room1, LOC.room2, LOC.room3, LOC.room4, LOC.room6, LOC.room15], weapons: ["rapier", "sword", "zweihander", "dagger"] },
        },
        {
          id: "text-faction-cultists",
          type: "text",
          title: "The Ordo Ultima",
          text:
            "The cultists arrive disguised as respectable scholars. They are interested in Rechtshandler's past and will use pressure, fear, and violence if they cannot control him quietly.",
          gmNotes: ["Their best defence is appearing boring until they suddenly are not."],
          links: { npcs: [NPC.cultists, NPC.rechtshandler], locations: [LOC.room10, LOC.room3], weapons: ["dagger"] },
        },
        {
          id: "text-faction-smugglers",
          type: "text",
          title: "The Morrians and the Coffin",
          text:
            "Three smugglers use Morrian clothing, a coffin, and ritual expectations to avoid questions. Josef is drugged inside the coffin. The longer nobody opens it, the more complicated the dawn reveal becomes.",
          gmNotes: ["Treat the coffin as a moving clue. Every witness has a different reason not to inspect it."],
          links: { npcs: [NPC.morrians, NPC.josef, NPC.ursula], locations: [LOC.room9, LOC.landing] },
        },
        {
          id: "text-faction-lovers",
          type: "text",
          title: "The Lovers and the Wronged Fiance",
          text:
            "Friedrich and Hanna travel as the Schmidts to hide their affair. Prahmhandler arrives later with hired muscle. He is drunk, angry, and dangerous enough to derail other investigations.",
          gmNotes: ["This thread is useful when the table needs a loud interruption or a public accusation."],
          links: { npcs: [NPC.friedrich, NPC.hanna, NPC.prahmhandler, NPC.thugs], locations: [LOC.room11, LOC.barroom, LOC.guestRooms], weapons: ["dagger", "whip", "knuckledusters", "improvised_weapon"] },
        },
        {
          id: "text-faction-thieves-and-guests",
          type: "text",
          title: "Thieves, Gamblers, Boatmen, and Coachmen",
          text:
            "Seedling provides cards and chatter. Glimbrin uses the crowd and confusion to steal. Boatmen and coachmen are not central villains, but they create noise, prejudice, weapons, and witnesses.",
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
            "The Characters enter a crowded barroom. The Gravin's people already occupy the best spaces, Bruno draws attention with drinking and strength games, and staff push through the room trying to keep everyone fed and settled.",
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
            "Bruno invites challengers to arm-wrestle, drink, boast, or test their courage. It is not meant as a lethal fight, but it establishes his physical presence and makes his later absence obvious.",
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
            "Seedling tries to pull travellers into a card game. This is a controlled way to introduce rumours, watch Glimbrin, and let theft or cheating become a clue rather than a random event.",
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
            "Three travellers presenting themselves as scholars arrive, ask for a room, and avoid unnecessary social contact. Their arrival should be quiet enough that Characters must be paying attention to remember it later.",
          gmNotes: ["Their cover is mundane. Do not make them obviously sinister unless the Characters press them."],
          links: { locations: [LOC.barroom, LOC.room10], npcs: [NPC.cultists], skills: ["Intuition", "Perception"] },
        },
        {
          id: "text-2115-glimbrin-arrives",
          type: "text",
          title: "9:15 p.m. Glimbrin Joins the Room",
          text:
            "Glimbrin books cheap lodging and drifts toward Seedling's table. He watches hands, purses, doors, and unattended luggage more than faces.",
          gmNotes: ["Use Glimbrin to relocate a clue, not to make progress impossible."],
          links: { locations: [LOC.barroom, LOC.dormitory, LOC.room14], npcs: [NPC.glimbrin, NPC.seedling], skills: ["Perception", "Sleight of Hand", "Stealth (Urban)"] },
        },
        {
          id: "text-2120-bruno-sent-upstairs",
          type: "text",
          title: "9:20 p.m. Bruno Is Sent Upstairs",
          text:
            "A liveried servant orders Bruno to stop embarrassing the Gravin. He leaves the barroom for room 4. This removes the champion from public view and sets up his isolation.",
          gmNotes: ["Make sure at least one Character can know when Bruno leaves."],
          links: { locations: [LOC.barroom, LOC.room4], npcs: [NPC.bruno, NPC.handmaids, NPC.gravin] },
        },
        {
          id: "text-2125-gravin-retires",
          type: "text",
          title: "9:25 p.m. The Gravin Retires",
          text:
            "The Gravin retires upstairs with servants and food ordered to her room. Her guards and staff remain active below, keeping the common spaces under noble pressure.",
          gmNotes: ["Her authority should be felt even when she is offstage."],
          links: { locations: [LOC.room1, LOC.room2, LOC.room6, LOC.room15], npcs: [NPC.gravin, NPC.bodyguards, NPC.handmaids] },
        },
        {
          id: "text-2130-schmidts-arrive",
          type: "text",
          title: "9:30 p.m. The Schmidts Arrive",
          text:
            "Friedrich and Hanna arrive by boat under false names and take room 11. The boatmen know more than they say, but coin and self-interest keep them quiet.",
          gmNotes: ["If a Character speaks with the boatmen early, reward it with partial suspicion rather than full truth."],
          links: { locations: [LOC.landing, LOC.barroom, LOC.room11, LOC.dormitory], npcs: [NPC.friedrich, NPC.hanna, NPC.boatmen] },
        },
        {
          id: "text-2135-morrians-arrive",
          type: "text",
          title: "9:35 p.m. The Morrians Arrive",
          text:
            "The disguised smugglers arrive in black robes with a coffin and request room 9. They rely on everyone being too polite, superstitious, or busy to inspect the coffin.",
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
            "Ursula arrives after seeing to her horse. She takes a position where she can watch the room without joining it. Her attention stays on the Morrians, the coffin, and anyone asking about them.",
          gmNotes: ["Ursula is a competent observer. She can become an ally if the Characters are direct and useful."],
          links: { locations: [LOC.barroom, LOC.room13, LOC.stables], npcs: [NPC.ursula, NPC.morrians, NPC.josef], weapons: ["crossbow", "sword"] },
        },
        {
          id: "text-2200-bedtime-order",
          type: "text",
          title: "10:00 p.m. The Gravin's Bedtime Order",
          text:
            "A servant orders the Gravin's people to bed. The room does not become quiet. Instead, the order creates movement, resentment, and cover for people who need to be elsewhere.",
          gmNotes: ["Use this as the transition from public social play into surveillance and suspicion."],
          links: { locations: [LOC.barroom, LOC.guestRooms], npcs: [NPC.handmaids, NPC.bodyguards, NPC.friedrich, NPC.hanna] },
        },
        {
          id: "encounter-2210-bruno-drugged-drink",
          type: "encounter",
          title: "10:10 p.m. Bruno's Last Drink",
          text:
            "Bruno returns to the barroom long enough to drink, boast, and draw attention. Dominique's plan depends on the drugged drink reaching him. If a Character interferes, the victim, timing, or suspicion can change.",
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
            "One scholar asks Hans to be informed if a particular boat arrives. This gives the cultists a public excuse for later movement and a reason to speak with staff.",
          gmNotes: ["Hans may remember the request if questioned after Rechtshandler dies."],
          links: { locations: [LOC.barroom, LOC.landing], npcs: [NPC.cultists, NPC.hans] },
        },
        {
          id: "text-2225-bruno-missing",
          type: "text",
          title: "10:25 p.m. Bruno Is Missing",
          text:
            "A servant checks Bruno's room and discovers he is not where expected. This is the first clear sign that the Gravin's party is losing control.",
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
            "Rechtshandler leaves the public room and becomes vulnerable. Anyone following him may hear hints of old cult business, fear, or blackmail before violence starts.",
          gmNotes: ["Use fragments, not exposition. Names, threats, payments, and fear are enough."],
          links: { locations: [LOC.barroom, LOC.room3], npcs: [NPC.rechtshandler, NPC.cultists], skills: ["Perception", "Stealth (Urban)"] },
        },
        {
          id: "encounter-2305-cultists-kill-lawyer",
          type: "encounter",
          title: "11:05 p.m. The Lawyer Is Killed",
          text:
            "The cultists silence Rechtshandler if he cannot be controlled. The scene may be discovered as a body, interrupted as an attack, or reframed as a blackmail job if the Characters arrive early.",
          gmNotes: [
            "If the Characters intervene early, the cultists try threats first and violence second.",
            "If they arrive late, focus on physical traces: disturbed room, window, papers, and who was seen on the corridor.",
          ],
          links: { locations: [LOC.room3, LOC.guestRooms, LOC.roof], npcs: [NPC.rechtshandler, NPC.cultists], skills: ["Cool", "Intimidate", "Perception", "Track"], weapons: ["dagger"] },
          encounterData: { monsterGroups: [npcGroup("grp-cultists-rechtshandler", NPC.cultists, 3, "Ordo Ultima Cultists")], playerOrder: [] },
        },
        {
          id: "text-2315-blackmail-hook",
          type: "text",
          title: "11:15 p.m. The Job Offer",
          text:
            "If Rechtshandler is alive or the Characters are near enough, he may try to buy their help against the cultists. This creates a morally dirty investigation thread before Bruno's murder makes everything worse.",
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
            "Prahmhandler arrives drunk, humiliated, and accompanied by thugs. He demands Friedrich and Hanna. The situation is loud enough to pull attention away from quieter crimes upstairs.",
          gmNotes: ["This scene is ideal for interrupting a careful investigation."],
          links: { locations: [LOC.barroom, LOC.guestRooms, LOC.room11], npcs: [NPC.prahmhandler, NPC.thugs, NPC.friedrich, NPC.hanna], skills: ["Charm", "Cool", "Intimidate", "Leadership"] },
        },
        {
          id: "encounter-prahmhandler-and-thugs",
          type: "encounter",
          title: "Brawl on the Stairs",
          text:
            "If Prahmhandler is blocked, mocked, or allowed upstairs, the confrontation can become a brawl involving his thugs, the Characters, staff, guards, or frightened guests.",
          gmNotes: [
            "The goal is not necessarily to kill anyone. The danger is noise, delay, injury, and giving other factions freedom to act.",
            "If the Characters prevent him from reaching room 11, award that as meaningful progress.",
          ],
          links: { locations: [LOC.barroom, LOC.guestRooms, LOC.room11], npcs: [NPC.prahmhandler, NPC.thugs, NPC.bodyguards, NPC.staff], weapons: ["dagger", "whip", "knuckledusters", "improvised_weapon", "sword"], skills: ["Dodge", "Melee (Basic)", "Melee (Brawling)"] },
          encounterData: { monsterGroups: [npcGroup("grp-prahmhandler", NPC.prahmhandler), npcGroup("grp-prahmhandler-thugs", NPC.thugs, 3, "Prahmhandler's Thugs")], playerOrder: [] },
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
            "Josef begins to wake. The Morrians make noise trying to control him and explain it away as ritual business. Suspicious Characters can force the coffin reveal before dawn.",
          gmNotes: ["Let the smugglers lie badly if pressured. Their disguise works best at a distance."],
          links: { locations: [LOC.room9, LOC.guestRooms], npcs: [NPC.morrians, NPC.josef], skills: ["Intuition", "Perception", "Lore (Morr)"] },
        },
        {
          id: "encounter-morrians-exposed",
          type: "encounter",
          title: "The False Corpse",
          text:
            "If the coffin is opened early, Josef is revealed alive. The smugglers try to recover control through intimidation, escape, or sudden violence. Ursula may intervene if the Characters expose Josef clearly.",
          gmNotes: [
            "This can solve one mystery while making the murder accusation later more chaotic.",
            "If Josef escapes into the inn, treat it as a chase through rooms and stairs.",
          ],
          links: { locations: [LOC.room9, LOC.guestRooms, LOC.landing, LOC.yard], npcs: [NPC.morrians, NPC.josef, NPC.ursula], weapons: ["improvised_weapon", "sword", "crossbow"] },
          encounterData: { monsterGroups: [npcGroup("grp-morrian-smugglers", NPC.morrians, 3, "False Morrians"), npcGroup("grp-josef-aufwiegler", NPC.josef), npcGroup("grp-ursula-kopfgeld", NPC.ursula)], playerOrder: [] },
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
            "A scream brings attention to Bruno's room. Bruno is dead, and evidence points too conveniently toward outsiders. If the Characters have been visible, disruptive, or near the room, suspicion turns toward them quickly.",
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
            "The Gravin uses guards and authority to hold everyone until dawn. If the Characters draw weapons or attempt to flee, the bodyguards respond as a combat encounter. Otherwise, treat it as interrogation and containment.",
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
            "The Gravin separates the Characters from the crowd and gives them a limited chance to prove what happened. She needs a truth that preserves her chance at trial, not a public riot.",
          gmNotes: ["Use this scene to give the party permission to investigate, but only under pressure."],
          links: { locations: [LOC.room1, LOC.room4], npcs: [NPC.gravin, NPC.bodyguards] },
        },
        {
          id: "text-locked-room-clues",
          type: "text",
          title: "Clues in Bruno's Room",
          text:
            "Bruno's room should offer physical clues: signs of drugging, moved bedding, a suspicious weapon, chimney access, and evidence that the killer expected to return. Do not give all answers at once. Give enough for next actions.",
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
            "A scrape in the chimney announces Dominique's return. She is here to recover or remove evidence, not to duel honourably. If exposed, she fights only long enough to flee.",
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
            "At dawn, the Gravin tries to force a final accounting. Who is dead, missing, captured, or exposed depends on the Characters' choices. Bring the surviving clocks into the barroom one by one.",
          gmNotes: ["Do not explain unsolved threads automatically. Let gaps become future hooks if needed."],
          links: { locations: [LOC.barroom], npcs: [NPC.gravin, NPC.bodyguards, NPC.hans, NPC.staff] },
        },
        {
          id: "text-0430-coffin-reveal",
          type: "text",
          title: "The Coffin Reveal",
          text:
            "If Josef has not already been revealed, the missing Morrians or suspicious coffin become unavoidable. Opening the coffin exposes the false corpse plot and gives Ursula a chance to claim her target.",
          gmNotes: ["This reveal should not replace the Bruno investigation, but it can complicate who the Gravin trusts."],
          links: { locations: [LOC.room9, LOC.barroom, LOC.landing], npcs: [NPC.morrians, NPC.josef, NPC.ursula] },
        },
        {
          id: "text-resolution-truth-table",
          type: "text",
          title: "Resolution Questions",
          text:
            "Resolve the night by answering four questions: who killed Bruno, what happened to Rechtshandler, what is inside or missing from the coffin, and who can prove the Characters' actions? Rewards and consequences should follow those answers.",
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
            "Award progress for active investigation, protecting or avenging Bruno, exposing Dominique, dealing with the cultists, preventing Prahmhandler's violence, discovering Josef, helping or outplaying Seedling and Glimbrin, and preserving enough order that the Gravin can continue her journey.",
          gmNotes: ["Reward solved threads and hard choices, not only combat victories."],
          links: { npcs: [NPC.bruno, NPC.dominique, NPC.cultists, NPC.prahmhandler, NPC.josef, NPC.seedling, NPC.glimbrin, NPC.gravin] },
        },
        {
          id: "text-followup-hooks",
          type: "text",
          title: "Campaign Follow-ups",
          text:
            "The Gravin may hire the Characters, Ursula may remember useful allies, the cult may mark witnesses, Glimbrin may return with stolen complications, and Prahmhandler or the lovers may create social trouble later.",
          gmNotes: ["Choose one or two follow-ups only. Too many will dilute the result of the night."],
          links: { npcs: [NPC.gravin, NPC.ursula, NPC.cultists, NPC.glimbrin, NPC.prahmhandler, NPC.friedrich, NPC.hanna] },
        },
      ],
    },
  ],
};
