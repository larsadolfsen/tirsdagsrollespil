import type { ScenarioSessionImportDefinition } from "./scenarioSessionImport";

const sourceTags = [
  "Rough Nights & Hard Days",
  "A Rough Night at the Three Feathers",
  "Scenario",
] as const;

const npcTags = [
  "Rough Nights & Hard Days",
  "A Rough Night at the Three Feathers",
  "NPC",
] as const;

function monsterGroup(id: string, templateId: string, name: string, wounds: number[]) {
  return {
    id,
    templateId,
    name,
    count: wounds.length,
    wounds,
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
    "A dense inn scenario built around intersecting secrets, murders, mistaken identities, blackmail, theft, and a delayed river departure.",
  defaultSession: {
    name: "A Rough Night at the Three Feathers",
    sessionNumber: 0,
    notes:
      "Import draft. NPC and location links use stable ids, but no link resolver exists yet. Text blocks are summaries intended for GM use, not full source text.",
  },
  locations: [
    {
      id: "three-feathers-region",
      name: "Reikland riverside route",
      kind: "region",
      description:
        "A flexible stretch of river or road between larger settlements. The inn can be placed wherever the campaign journey requires it.",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-inn",
      name: "The Three Feathers Inn",
      kind: "inn",
      parentLocationId: "three-feathers-region",
      description:
        "A medium riverside coaching and river inn with a walled yard, stables, smithy, landing stage, guest rooms, staff spaces, and a busy common room.",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-main-building",
      name: "Main Building",
      kind: "other",
      parentLocationId: "three-feathers-inn",
      description:
        "Two-storey brick and timber building. The lower floor holds the barroom, dormitory, kitchens, staff spaces, and common accommodation.",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-barroom",
      name: "Barroom",
      kind: "room",
      parentLocationId: "three-feathers-main-building",
      description:
        "The public centre of the inn. Most visible events start here before moving upstairs or outside.",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-dormitory",
      name: "Dormitory",
      kind: "room",
      parentLocationId: "three-feathers-main-building",
      description: "Shared sleeping space used by poorer guests and several late-night messengers.",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-guest-rooms",
      name: "Guest Rooms",
      kind: "room",
      parentLocationId: "three-feathers-main-building",
      description:
        "The upper floor has double and single guest rooms connected by a narrow corridor. The room layout is central to mistaken identity and delayed discoveries.",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-yard",
      name: "Yard",
      kind: "outdoor",
      parentLocationId: "three-feathers-inn",
      description:
        "The enclosed yard between the main building, stables, smithy, outhouse, and landing stage.",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-stables-smithy",
      name: "Stables and Smithy",
      kind: "other",
      parentLocationId: "three-feathers-yard",
      description:
        "Lean-to stables and a precautionary smithy that can repair small harness and wagon items.",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-outhouse",
      name: "Outhouse",
      kind: "other",
      parentLocationId: "three-feathers-yard",
      description:
        "A crude outside facility with a warning sign on the door. Useful for stealth, hiding, and awkward timing.",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-landing-stage",
      name: "Landing Stage",
      kind: "outdoor",
      parentLocationId: "three-feathers-inn",
      description:
        "Wide enough for two small cargo boats to unload. Boats use a stake in the riverbed rather than mooring directly in shallow water.",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-1-gravin",
      name: "Room 1, The Gravin",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-2-gravins-maids",
      name: "Room 2, The Gravin's Maids",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-3-rechtshandler",
      name: "Room 3, Rechtshandler",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-4-bruno",
      name: "Room 4, Bruno Franke",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-6-gravins-guards",
      name: "Room 6, The Gravin's Guards",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-7-8-pcs",
      name: "Rooms 7 and 8, Suggested PC Rooms",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-9-morrians",
      name: "Room 9, The Morrians",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-10-scholars",
      name: "Room 10, The Scholars",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-11-schmidts",
      name: "Room 11, The Schmidts",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-12-seedling",
      name: "Room 12, Seedling",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-13-ursula",
      name: "Room 13, Ursula Kopfgeld",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-14-glimbrin",
      name: "Room 14, Glimbrin",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
    {
      id: "three-feathers-room-15-gravins-servants",
      name: "Room 15, The Gravin's Servants",
      kind: "room",
      parentLocationId: "three-feathers-guest-rooms",
      tags: [...sourceTags],
    },
  ],
  npcs: [
    { id: "three-feathers-gravin-maria-ulrike-von-liebwitz", name: "Gravin Maria-Ulrike von Liebwitz", role: "Noble under accusation", tags: [...npcTags] },
    { id: "three-feathers-bruno-franke", name: "Bruno Franke", role: "Judicial champion", tags: [...npcTags] },
    { id: "three-feathers-gustaf-rechtshandler", name: "Gustaf Rechtshandler", role: "Lawyer with a cult past", tags: [...npcTags] },
    { id: "three-feathers-bodyguards-men-at-arms", name: "Bodyguards and Men-at-Arms", role: "Gravin's guards", tags: [...npcTags] },
    { id: "three-feathers-handmaids-servants", name: "Handmaids and Servants", role: "Gravin's household staff", tags: [...npcTags] },
    { id: "three-feathers-dominique-herveaux", name: "Dominique Herveaux", role: "Assassin posing as a servant", tags: [...npcTags] },
    { id: "three-feathers-gunni-bart-hans-frederick", name: "Gunni, Bart, and Hans-Frederick", role: "Smugglers posing as Morrians", tags: [...npcTags] },
    { id: "three-feathers-josef-aufwiegler", name: "Josef Aufwiegler", role: "Drugged agitator in the coffin", tags: [...npcTags] },
    { id: "three-feathers-ursula-kopfgeld", name: "Ursula Kopfgeld", role: "Bounty hunter", tags: [...npcTags] },
    { id: "three-feathers-friedrich-von-pfeifraucher", name: "Friedrich von Pfeifraucher", role: "Minor noble travelling as Schmidt", tags: [...npcTags] },
    { id: "three-feathers-hanna-lastkahn", name: "Hanna Lastkahn", role: "Friedrich's lover", tags: [...npcTags] },
    { id: "three-feathers-mho-larz-curls", name: "Mho, Larz, and Curls", role: "Hired thugs", tags: [...npcTags] },
    { id: "three-feathers-thomas-prahmhandler", name: "Thomas Prahmhandler", role: "Merchant and wronged fiance", tags: [...npcTags] },
    { id: "three-feathers-allrelia-elphoise-helga", name: "Allrelia, Elphoise, and Helga", role: "Ordo Ultima cultists", tags: [...npcTags] },
    { id: "three-feathers-coachmen", name: "Coachmen", role: "Other customers", tags: [...npcTags] },
    { id: "three-feathers-boatmen", name: "Boatmen", role: "Other customers", tags: [...npcTags] },
    { id: "three-feathers-glimbrin-oddsock", name: "Glimbrin Oddsock", role: "Gnome thief", tags: [...npcTags] },
    { id: "three-feathers-mercurinellin-seedling-thorncobble-xiii", name: "Mercurinellin Seedling Thorncobble XIII", role: "Halfling hustler", tags: [...npcTags] },
    { id: "three-feathers-hans-orf", name: "Hans Orf", role: "Landlord", tags: [...npcTags] },
    { id: "three-feathers-servants-cleaners-menials", name: "Servants, Cleaners, and Similar Menials", role: "Inn staff", tags: [...npcTags] },
    { id: "three-feathers-ol-bess", name: "Ol' Bess", role: "Inn smith", tags: [...npcTags] },
  ],
  scenes: [
    {
      id: "scene-three-feathers-arrival-and-setup",
      title: "Arrival and Setup",
      kind: "location",
      locationId: "three-feathers-inn",
      links: {
        locations: ["three-feathers-region", "three-feathers-inn", "three-feathers-landing-stage"],
        npcs: ["three-feathers-hans-orf", "three-feathers-gravin-maria-ulrike-von-liebwitz"],
      },
      components: [
        {
          id: "text-arrival-premise",
          type: "text",
          title: "Premise",
          text:
            "The Characters arrive at a riverside inn expecting an ordinary overnight stop. The inn is isolated once the doors are shut for the night, creating pressure for overlapping plots to collide before morning.",
          links: { locations: ["three-feathers-inn"] },
        },
        {
          id: "text-getting-there",
          type: "text",
          title: "Getting There",
          text:
            "Use the inn as a road or river stop. The party may arrive as travellers, guards, investigators, passengers on a damaged boat, or messengers following a lead. If this is part of a larger campaign, let the party expect only a brief stop before continuing in the morning.",
          links: { locations: ["three-feathers-region", "three-feathers-landing-stage"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-inn-locations",
      title: "The Inn",
      kind: "location",
      locationId: "three-feathers-inn",
      links: {
        locations: [
          "three-feathers-main-building",
          "three-feathers-barroom",
          "three-feathers-guest-rooms",
          "three-feathers-stables-smithy",
          "three-feathers-outhouse",
          "three-feathers-landing-stage",
        ],
      },
      components: [
        {
          id: "text-inn-overview",
          type: "text",
          title: "Inn Overview",
          text:
            "The Three Feathers is a medium riverside inn with a walled yard, two-storey main building, barroom, dormitory, guest rooms, stables, smithy, outhouse, and landing stage. It works best when no one can easily leave once the night's events begin.",
          links: { locations: ["three-feathers-inn", "three-feathers-main-building", "three-feathers-yard"] },
        },
        {
          id: "text-sleeping-arrangements",
          type: "text",
          title: "Sleeping Arrangements",
          text:
            "Reserve the named rooms for the major factions. Suggested PC rooms are 7 and 8 if they buy a double room. Use the corridor and nearby occupied rooms to make noise, mistaken identity, and discovery matter.",
          links: {
            locations: [
              "three-feathers-room-1-gravin",
              "three-feathers-room-2-gravins-maids",
              "three-feathers-room-3-rechtshandler",
              "three-feathers-room-4-bruno",
              "three-feathers-room-6-gravins-guards",
              "three-feathers-room-7-8-pcs",
              "three-feathers-room-9-morrians",
              "three-feathers-room-10-scholars",
              "three-feathers-room-11-schmidts",
              "three-feathers-room-12-seedling",
              "three-feathers-room-13-ursula",
              "three-feathers-room-14-glimbrin",
              "three-feathers-room-15-gravins-servants",
            ],
          },
        },
      ],
    },
    {
      id: "scene-three-feathers-plot-web",
      title: "Plot Web",
      kind: "timeline",
      locationId: "three-feathers-inn",
      links: {
        locations: ["three-feathers-inn", "three-feathers-barroom", "three-feathers-guest-rooms"],
        npcs: [
          "three-feathers-gravin-maria-ulrike-von-liebwitz",
          "three-feathers-bruno-franke",
          "three-feathers-gustaf-rechtshandler",
          "three-feathers-friedrich-von-pfeifraucher",
          "three-feathers-hanna-lastkahn",
          "three-feathers-thomas-prahmhandler",
          "three-feathers-allrelia-elphoise-helga",
          "three-feathers-gunni-bart-hans-frederick",
          "three-feathers-josef-aufwiegler",
          "three-feathers-ursula-kopfgeld",
          "three-feathers-glimbrin-oddsock",
        ],
      },
      components: [
        {
          id: "text-plot-1-matter-of-import",
          type: "text",
          title: "Plot 1, A Matter of Import",
          text:
            "The Gravin travels incognito with a legal retinue and champion. She is bound for a trial and relies on Bruno Franke, but an enemy agent wants to remove him before he can fight for her.",
          links: { npcs: ["three-feathers-gravin-maria-ulrike-von-liebwitz", "three-feathers-bruno-franke", "three-feathers-dominique-herveaux"] },
        },
        {
          id: "text-plot-2-compromising-positions",
          type: "text",
          title: "Plot 2, Compromising Positions",
          text:
            "Friedrich and Hanna travel under false names while conducting an affair. A servant has identified them and blackmail follows.",
          links: { npcs: ["three-feathers-friedrich-von-pfeifraucher", "three-feathers-hanna-lastkahn", "three-feathers-servants-cleaners-menials"] },
        },
        {
          id: "text-plot-3-face-from-the-past",
          type: "text",
          title: "Plot 3, A Face from the Past",
          text:
            "Rechtshandler has a dangerous old connection to the Ordo Ultima. Cult agents find him at the inn and try to exploit his past.",
          links: { npcs: ["three-feathers-gustaf-rechtshandler", "three-feathers-allrelia-elphoise-helga"] },
        },
        {
          id: "text-plot-4-creating-a-scene",
          type: "text",
          title: "Plot 4, Creating a Scene",
          text:
            "Thomas Prahmhandler learns of Hanna's infidelity and arrives with hired thugs. He wants a public confrontation and may force violence in the inn.",
          links: { npcs: ["three-feathers-thomas-prahmhandler", "three-feathers-mho-larz-curls", "three-feathers-hanna-lastkahn"] },
        },
        {
          id: "text-plot-5-ashes-to-ashes",
          type: "text",
          title: "Plot 5, Ashes to Ashes",
          text:
            "Smugglers disguised as Morrians transport Josef in a coffin. Josef is drugged, not dead, and the planned handoff is delayed until morning.",
          links: { npcs: ["three-feathers-gunni-bart-hans-frederick", "three-feathers-josef-aufwiegler"] },
        },
        {
          id: "text-plot-6-fistful-of-gold-crowns",
          type: "text",
          title: "Plot 6, A Fistful of Gold Crowns",
          text:
            "Ursula Kopfgeld follows the smugglers because Josef is valuable to her. She waits, watches, and investigates whenever their disguise falters.",
          links: { npcs: ["three-feathers-ursula-kopfgeld", "three-feathers-josef-aufwiegler", "three-feathers-gunni-bart-hans-frederick"] },
        },
        {
          id: "text-plot-7-pick-a-pocket",
          type: "text",
          title: "Plot 7, You've Got to Pick a Pocket or Two",
          text:
            "Glimbrin Oddsocks uses the crowd and confusion to steal useful items. Use him whenever you need a missing clue, a stolen object, or another moving part.",
          links: { npcs: ["three-feathers-glimbrin-oddsock", "three-feathers-mercurinellin-seedling-thorncobble-xiii"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-9pm-arrivals",
      title: "9:00 p.m. Arrivals",
      kind: "timeline",
      locationId: "three-feathers-barroom",
      links: {
        locations: ["three-feathers-barroom", "three-feathers-room-1-gravin", "three-feathers-room-4-bruno"],
        npcs: [
          "three-feathers-gravin-maria-ulrike-von-liebwitz",
          "three-feathers-bruno-franke",
          "three-feathers-mercurinellin-seedling-thorncobble-xiii",
          "three-feathers-hans-orf",
        ],
      },
      components: [
        {
          id: "text-9pm-crowded-inn",
          type: "text",
          title: "The Common Room Fills",
          text:
            "The party arrives as the Gravin's party settles in. The barroom is noisy, busy, and packed with guards, servants, drinkers, and travellers. Rumours about the Gravin and her legal trouble are available to observant Characters.",
          links: { locations: ["three-feathers-barroom"], npcs: ["three-feathers-gravin-maria-ulrike-von-liebwitz", "three-feathers-hans-orf"] },
        },
        {
          id: "encounter-bruno-arm-wrestling",
          type: "encounter",
          title: "Bruno's Table Challenge",
          text:
            "Bruno is already showing off at a table, drinking and arm-wrestling. Treat this as a social or opposed-strength encounter unless the Characters escalate.",
          links: { locations: ["three-feathers-barroom"], npcs: ["three-feathers-bruno-franke"] },
          encounterData: {
            monsterGroups: [monsterGroup("grp-bruno-franke", "three-feathers-bruno-franke", "Bruno Franke", [17])],
            playerOrder: [],
          },
        },
        {
          id: "text-seedling-cards",
          type: "text",
          title: "Seedling Looks for Players",
          text:
            "Seedling tries to pull the Characters into cards. This gives the GM a safe way to tie PCs into later theft, distraction, or gossip scenes.",
          links: { locations: ["three-feathers-barroom"], npcs: ["three-feathers-mercurinellin-seedling-thorncobble-xiii"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-910-to-935",
      title: "9:10 p.m. to 9:35 p.m.",
      kind: "timeline",
      locationId: "three-feathers-barroom",
      links: {
        locations: ["three-feathers-barroom", "three-feathers-guest-rooms", "three-feathers-room-9-morrians", "three-feathers-room-10-scholars", "three-feathers-room-11-schmidts", "three-feathers-room-12-seedling", "three-feathers-room-14-glimbrin"],
        npcs: ["three-feathers-allrelia-elphoise-helga", "three-feathers-glimbrin-oddsock", "three-feathers-mercurinellin-seedling-thorncobble-xiii", "three-feathers-bruno-franke", "three-feathers-friedrich-von-pfeifraucher", "three-feathers-hanna-lastkahn", "three-feathers-gunni-bart-hans-frederick"],
      },
      components: [
        {
          id: "text-910-cultists-arrive",
          type: "text",
          title: "9:10 p.m., The Scholars",
          text:
            "Three travellers posing as scholars arrive, keep to themselves, and take a room. They are Ordo Ultima cultists and should not draw too much attention yet.",
          links: { npcs: ["three-feathers-allrelia-elphoise-helga"], locations: ["three-feathers-room-10-scholars"] },
        },
        {
          id: "text-915-glimbrin-and-seedling",
          type: "text",
          title: "9:15 p.m., Glimbrin Arrives",
          text:
            "Glimbrin books a dormitory place and joins Seedling's card game. Non-Halfling Characters may mistake him for a Halfling, which he will not correct.",
          links: { npcs: ["three-feathers-glimbrin-oddsock", "three-feathers-mercurinellin-seedling-thorncobble-xiii"], locations: ["three-feathers-dormitory", "three-feathers-barroom"] },
        },
        {
          id: "text-920-bruno-to-room",
          type: "text",
          title: "9:20 p.m., Bruno Is Sent Upstairs",
          text:
            "A liveried servant orders Bruno to stop embarrassing the Gravin. Bruno is sent to his room, clearing the way for later attempts on him.",
          links: { npcs: ["three-feathers-bruno-franke", "three-feathers-handmaids-servants"], locations: ["three-feathers-room-4-bruno"] },
        },
        {
          id: "text-925-gravin-to-room",
          type: "text",
          title: "9:25 p.m., The Gravin Retires",
          text:
            "The Gravin goes upstairs with servants and orders supper in her room. Her guards and some servants remain below, keeping the barroom politically tense.",
          links: { npcs: ["three-feathers-gravin-maria-ulrike-von-liebwitz", "three-feathers-bodyguards-men-at-arms", "three-feathers-handmaids-servants"], locations: ["three-feathers-room-1-gravin"] },
        },
        {
          id: "text-930-schmidts-and-boatmen",
          type: "text",
          title: "9:30 p.m., The Schmidts",
          text:
            "A small boat arrives. Friedrich and Hanna take room 11 under false names, while two boatmen use the dormitory. The boatmen know the identities are false but have been paid to stay quiet.",
          links: { npcs: ["three-feathers-friedrich-von-pfeifraucher", "three-feathers-hanna-lastkahn", "three-feathers-boatmen"], locations: ["three-feathers-landing-stage", "three-feathers-room-11-schmidts", "three-feathers-dormitory"] },
        },
        {
          id: "text-935-morrians-arrive",
          type: "text",
          title: "9:35 p.m., The Morrians",
          text:
            "Three travellers dressed in black robes arrive with a coffin and request room 9. They are smugglers, and the coffin should stay undisturbed until midnight if possible.",
          links: { npcs: ["three-feathers-gunni-bart-hans-frederick", "three-feathers-josef-aufwiegler"], locations: ["three-feathers-room-9-morrians"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-950-to-1105",
      title: "9:50 p.m. to 11:05 p.m.",
      kind: "timeline",
      locationId: "three-feathers-barroom",
      links: {
        locations: ["three-feathers-barroom", "three-feathers-room-3-rechtshandler", "three-feathers-room-4-bruno", "three-feathers-room-13-ursula"],
        npcs: ["three-feathers-ursula-kopfgeld", "three-feathers-bruno-franke", "three-feathers-dominique-herveaux", "three-feathers-gustaf-rechtshandler", "three-feathers-allrelia-elphoise-helga"],
      },
      components: [
        {
          id: "text-950-ursula-arrives",
          type: "text",
          title: "9:50 p.m., Ursula Arrives",
          text:
            "Ursula arrives after seeing her horse stabled. She sits alone and watches the room, especially the smugglers and anything tied to Josef.",
          links: { npcs: ["three-feathers-ursula-kopfgeld", "three-feathers-gunni-bart-hans-frederick"], locations: ["three-feathers-barroom", "three-feathers-room-13-ursula"] },
        },
        {
          id: "text-1000-bedtime-order",
          type: "text",
          title: "10:00 p.m., The Gravin Orders Bedtime",
          text:
            "A servant orders the Gravin's party to bed, but the barroom does not immediately quiet. At the same time, a heated exchange near Schmidt hints at private trouble upstairs.",
          links: { npcs: ["three-feathers-handmaids-servants", "three-feathers-friedrich-von-pfeifraucher", "three-feathers-hanna-lastkahn"], locations: ["three-feathers-barroom", "three-feathers-room-11-schmidts"] },
        },
        {
          id: "encounter-bruno-drugged-ale",
          type: "encounter",
          title: "10:10 p.m., Bruno's Last Drink",
          text:
            "Bruno returns, arm-wrestles, and accepts fresh drinks. One mug is drugged for him. If another Character drinks it, they may become the unintended victim of the setup.",
          links: { npcs: ["three-feathers-bruno-franke", "three-feathers-dominique-herveaux", "three-feathers-ursula-kopfgeld"], locations: ["three-feathers-barroom"] },
          encounterData: {
            monsterGroups: [monsterGroup("grp-bruno-drink", "three-feathers-bruno-franke", "Bruno Franke", [17])],
            playerOrder: [],
          },
        },
        {
          id: "text-1015-cultist-message",
          type: "text",
          title: "10:15 p.m., Cultist Message",
          text:
            "One cultist tells the landlord they expect a boat and asks to be informed when it arrives. This quietly positions the cultists for their later pressure on Rechtshandler.",
          links: { npcs: ["three-feathers-allrelia-elphoise-helga", "three-feathers-hans-orf"], locations: ["three-feathers-barroom"] },
        },
        {
          id: "text-1025-bruno-missing",
          type: "text",
          title: "10:25 p.m., Bruno Is Missing",
          text:
            "A servant checks on Bruno and finds him missing. This is an early clue that the Gravin's plans may be sabotaged.",
          links: { npcs: ["three-feathers-handmaids-servants", "three-feathers-bruno-franke"], locations: ["three-feathers-room-4-bruno"] },
        },
        {
          id: "encounter-rechtshandler-murder",
          type: "encounter",
          title: "10:40 p.m. to 11:05 p.m., Rechtshandler Is Killed",
          text:
            "Rechtshandler goes upstairs. A cultist visits him, threatens him, and he is killed soon after. Observant Characters may hear the exchange or notice movement around room 3.",
          links: { npcs: ["three-feathers-gustaf-rechtshandler", "three-feathers-allrelia-elphoise-helga"], locations: ["three-feathers-room-3-rechtshandler", "three-feathers-guest-rooms"] },
          encounterData: {
            monsterGroups: [monsterGroup("grp-ordo-ultima-one", "three-feathers-allrelia-elphoise-helga", "Ordo Ultima Cultist", [17])],
            playerOrder: [],
          },
        },
      ],
    },
    {
      id: "scene-three-feathers-1115-to-midnight",
      title: "11:15 p.m. to Midnight",
      kind: "timeline",
      locationId: "three-feathers-guest-rooms",
      links: {
        locations: ["three-feathers-room-3-rechtshandler", "three-feathers-room-4-bruno", "three-feathers-room-9-morrians", "three-feathers-room-11-schmidts", "three-feathers-barroom"],
        npcs: ["three-feathers-allrelia-elphoise-helga", "three-feathers-thomas-prahmhandler", "three-feathers-mho-larz-curls", "three-feathers-friedrich-von-pfeifraucher", "three-feathers-hanna-lastkahn", "three-feathers-ursula-kopfgeld", "three-feathers-gunni-bart-hans-frederick"],
      },
      components: [
        {
          id: "encounter-blackmail-room-8",
          type: "encounter",
          title: "11:15 p.m., Blackmail in Room 8",
          text:
            "A Gravin servant asks the Characters to visit the lawyer's room. Rechtshandler is blackmailed by the cultists, who offer money if the Characters dispose of them. If the Characters delay, the cultists return and may attack.",
          links: { npcs: ["three-feathers-gustaf-rechtshandler", "three-feathers-allrelia-elphoise-helga"], locations: ["three-feathers-room-3-rechtshandler", "three-feathers-guest-rooms"] },
          encounterData: {
            monsterGroups: [monsterGroup("grp-ordo-ultima-cultists", "three-feathers-allrelia-elphoise-helga", "Ordo Ultima Cultists", [17, 17, 17])],
            playerOrder: [],
          },
        },
        {
          id: "encounter-prahmhandler-stair-brawl",
          type: "encounter",
          title: "11:30 p.m., Prahmhandler Arrives",
          text:
            "Thomas Prahmhandler arrives drunk with three thugs and demands to know where Friedrich is. If he reaches the upper floor, the confrontation can turn into a brawl involving guards, staff, and guests.",
          links: { npcs: ["three-feathers-thomas-prahmhandler", "three-feathers-mho-larz-curls", "three-feathers-friedrich-von-pfeifraucher", "three-feathers-hanna-lastkahn"], locations: ["three-feathers-barroom", "three-feathers-guest-rooms", "three-feathers-room-11-schmidts"] },
          encounterData: {
            monsterGroups: [
              monsterGroup("grp-thomas-prahmhandler", "three-feathers-thomas-prahmhandler", "Thomas Prahmhandler", [15]),
              monsterGroup("grp-prahmhandler-thugs", "three-feathers-mho-larz-curls", "Prahmhandler's Thugs", [17, 17, 17]),
            ],
            playerOrder: [],
          },
        },
        {
          id: "text-1150-cultists-cover-up",
          type: "text",
          title: "11:50 p.m., The Cultists Cover Their Tracks",
          text:
            "If any cultists remain free, they revisit Rechtshandler's room, confirm he is dead, and escape through the window to hide on the roof before returning to their own room.",
          links: { npcs: ["three-feathers-allrelia-elphoise-helga", "three-feathers-gustaf-rechtshandler"], locations: ["three-feathers-room-3-rechtshandler", "three-feathers-guest-rooms"] },
        },
        {
          id: "text-midnight-morrian-noise",
          type: "text",
          title: "Midnight, Trouble in the Morrians' Room",
          text:
            "The smugglers shout and scuffle as Josef wakes from the drug. They try to pass off the noise as a religious observance. Suspicious Characters can force the coffin issue early.",
          links: { npcs: ["three-feathers-gunni-bart-hans-frederick", "three-feathers-josef-aufwiegler"], locations: ["three-feathers-room-9-morrians"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-0020-murder-accusation",
      title: "12:10 a.m. to 1:20 a.m.",
      kind: "timeline",
      locationId: "three-feathers-room-4-bruno",
      links: {
        locations: ["three-feathers-room-4-bruno", "three-feathers-room-1-gravin", "three-feathers-guest-rooms"],
        npcs: ["three-feathers-bruno-franke", "three-feathers-gravin-maria-ulrike-von-liebwitz", "three-feathers-dominique-herveaux", "three-feathers-bodyguards-men-at-arms"],
      },
      components: [
        {
          id: "text-0010-glimbrin-dormitory",
          type: "text",
          title: "12:10 a.m., Seedling Leaves",
          text:
            "Glimbrin heads for the dormitory after the card game ends. The boatmen and coachmen may also be present, creating witness or suspect complications.",
          links: { npcs: ["three-feathers-glimbrin-oddsock", "three-feathers-mercurinellin-seedling-thorncobble-xiii", "three-feathers-boatmen", "three-feathers-coachmen"], locations: ["three-feathers-dormitory"] },
        },
        {
          id: "text-0020-body-found",
          type: "text",
          title: "12:20 a.m., Bruno Is Found Dead",
          text:
            "A woman screams from the Gravin's wing. Bruno is dead in room 4, and a dagger apparently belonging to the Characters is nearby. The Gravin announces there is a murderer loose and decides to hold everyone until daylight.",
          links: { npcs: ["three-feathers-bruno-franke", "three-feathers-gravin-maria-ulrike-von-liebwitz", "three-feathers-dominique-herveaux"], locations: ["three-feathers-room-4-bruno", "three-feathers-room-1-gravin"] },
        },
        {
          id: "encounter-gravin-guards-lockdown",
          type: "encounter",
          title: "Lockdown by the Gravin's Guards",
          text:
            "If the Characters resist judgement or draw weapons, the Gravin's guards and the inn staff intervene. Otherwise this is a tense authority scene rather than a fight.",
          links: { npcs: ["three-feathers-gravin-maria-ulrike-von-liebwitz", "three-feathers-bodyguards-men-at-arms", "three-feathers-servants-cleaners-menials"], locations: ["three-feathers-barroom", "three-feathers-guest-rooms"] },
          encounterData: {
            monsterGroups: [
              monsterGroup("grp-gravin-bodyguards", "three-feathers-bodyguards-men-at-arms", "Gravin's Bodyguards", [20, 20, 20, 20]),
              monsterGroup("grp-inn-staff-menials", "three-feathers-servants-cleaners-menials", "Inn Staff", [12, 12, 12, 12]),
            ],
            playerOrder: [],
          },
        },
        {
          id: "text-0120-private-talk",
          type: "text",
          title: "1:20 a.m., The Gravin Speaks Privately",
          text:
            "The Gravin has the Characters brought to her and explains that someone is trying to sabotage her trial. She gives them limited freedom to find the truth before morning, then has them locked in Bruno's room.",
          links: { npcs: ["three-feathers-gravin-maria-ulrike-von-liebwitz"], locations: ["three-feathers-room-1-gravin", "three-feathers-room-4-bruno"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-2am-assassin",
      title: "2:00 a.m., Assassin in the Chimney",
      kind: "encounter",
      locationId: "three-feathers-room-4-bruno",
      links: {
        locations: ["three-feathers-room-4-bruno", "three-feathers-yard"],
        npcs: ["three-feathers-dominique-herveaux", "three-feathers-bodyguards-men-at-arms"],
      },
      components: [
        {
          id: "text-locked-in-brunos-room",
          type: "text",
          title: "Locked In",
          text:
            "The Characters are locked in Bruno's room and watched by guards. The scene should feel constrained, with limited equipment and little time before morning.",
          links: { locations: ["three-feathers-room-4-bruno"] },
        },
        {
          id: "encounter-dominique-chimney",
          type: "encounter",
          title: "Dominique Retrieves the Evidence",
          text:
            "A soft scraping comes from the chimney. Dominique descends, searches the bed, and tries to escape with the incriminating evidence. If exposed, she flees or fights long enough to escape.",
          links: { npcs: ["three-feathers-dominique-herveaux"], locations: ["three-feathers-room-4-bruno"] },
          encounterData: {
            monsterGroups: [monsterGroup("grp-dominique-herveaux", "three-feathers-dominique-herveaux", "Dominique Herveaux", [15])],
            playerOrder: [],
          },
        },
      ],
    },
    {
      id: "scene-three-feathers-430-resolution",
      title: "4:30 a.m., Resolution",
      kind: "aftermath",
      locationId: "three-feathers-barroom",
      links: {
        locations: ["three-feathers-barroom", "three-feathers-room-9-morrians", "three-feathers-landing-stage"],
        npcs: ["three-feathers-gunni-bart-hans-frederick", "three-feathers-josef-aufwiegler", "three-feathers-ursula-kopfgeld", "three-feathers-gravin-maria-ulrike-von-liebwitz"],
      },
      components: [
        {
          id: "text-430-coffin-opened",
          type: "text",
          title: "The Coffin Is Opened",
          text:
            "At dawn the Gravin calls everyone to the barroom, but the smugglers do not answer. Their door is forced, the coffin is opened, and Josef is revealed as alive and awake. This exposes the smuggling plot and can redirect the final accusations.",
          links: { npcs: ["three-feathers-gunni-bart-hans-frederick", "three-feathers-josef-aufwiegler", "three-feathers-ursula-kopfgeld"], locations: ["three-feathers-barroom", "three-feathers-room-9-morrians"] },
        },
        {
          id: "text-resolution-outcomes",
          type: "text",
          title: "Outcome",
          text:
            "The Gravin explains the major facts as she understands them, arrests or hands over suspects as appropriate, and resumes the journey. If the Characters solved Bruno's murder or protected her champion, they may travel with her or receive a reward.",
          links: { npcs: ["three-feathers-gravin-maria-ulrike-von-liebwitz", "three-feathers-bruno-franke", "three-feathers-dominique-herveaux"] },
        },
      ],
    },
    {
      id: "scene-three-feathers-rewards-and-aftermath",
      title: "Rewards and Aftermath",
      kind: "aftermath",
      locationId: "three-feathers-inn",
      links: {
        locations: ["three-feathers-inn", "three-feathers-landing-stage"],
        npcs: ["three-feathers-gravin-maria-ulrike-von-liebwitz", "three-feathers-mercurinellin-seedling-thorncobble-xiii", "three-feathers-ursula-kopfgeld"],
      },
      components: [
        {
          id: "text-rewards",
          type: "text",
          title: "Rewards",
          text:
            "Award experience for active investigation, capturing Bruno's murderer, exposing the cultists, winning Bruno's arm-wrestling contest, helping Seedling, discovering the false corpse, and stopping Prahmhandler before he reaches Friedrich.",
          links: { npcs: ["three-feathers-bruno-franke", "three-feathers-allrelia-elphoise-helga", "three-feathers-mercurinellin-seedling-thorncobble-xiii", "three-feathers-thomas-prahmhandler", "three-feathers-friedrich-von-pfeifraucher"] },
        },
        {
          id: "text-aftermath",
          type: "text",
          title: "Aftermath",
          text:
            "For a campaign, the Gravin can employ a Character as a temporary bodyguard or judicial champion. For a stand-alone game, she may give each Character coin and make them contacts of the Liebwitz household.",
          links: { npcs: ["three-feathers-gravin-maria-ulrike-von-liebwitz"] },
        },
      ],
    },
  ],
};
