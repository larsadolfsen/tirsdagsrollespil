export * from "./scenarioSessionImport";
export * from "./roughNightAtTheThreeFeathers";

import { roughNightAtTheThreeFeathersScenario } from "./roughNightAtTheThreeFeathers";
import type {
  ScenarioSceneComponent,
  ScenarioSessionImportDefinition,
} from "./scenarioSessionImport";

const threeFeathersSessionDescription =
  "The road, river, and weather bring you to the Three Feathers for what should be one quiet night. Warm light leaks from the windows, wet horses stamp in the yard, and the common room hums with smoke, ale, tired travellers, watchful servants, and low conversations held close to the table. As the night wears on, doors close, tempers rise, footsteps cross the upper floor, and every small noise starts to matter.";

const scenarioNotesText =
  "Use this import as a timed pressure map, not a fixed script. Each scene should have at most one Description component. Add more text components only for events or developments. Description components must only contain what the Characters can perceive or reasonably infer. Notes components hold room ids, hidden identities, motives, clocks, and exact GM truth.";

const sceneDescriptionText: Record<string, string> = {
  "scene-three-feathers-gm-overview":
    "You arrive at the Three Feathers at the end of a long day. Warm light spills from the windows. Smoke hangs under the eaves. The yard smells of wet straw, horse sweat, river mud, and woodsmoke. Inside, voices press together in the common room. You see armed servants, tired travellers, a card table, a loud bare-armed man near the fire, and a landlord who watches the stairs while he pours ale. Nothing here is quiet enough to be private for long.",
  "scene-three-feathers-location-setup":
    "You stand inside a busy riverside inn built around heat, smoke, stairs, and narrow doors. The barroom smells of smoke, wet wool, spilled ale, roast meat, and river mud. Hans Orf works behind the bar with a practiced smile and tired eyes. Servants move between tables, stairs, yard door, and dormitory with bowls, jugs, blankets, and hurried messages. Upstairs, the corridor is narrow, cool, and close enough that voices, steps, and falling bodies can carry through the floorboards.",
  "scene-three-feathers-faction-briefs":
    "You see too many groups for one quiet inn. A noble party claims space without asking. Three plain travellers keep their backs near the wall. A well-dressed couple asks for privacy and avoids attention. Black-robed mourners stay close to a damp coffin. A small gambler smiles over his cards while rougher travellers drink in clusters. The room feels social, but nobody seems fully at ease.",
};

const gmOnlyComponentIds = new Set([
  "text-overview-database-links",
  "text-overview-clocks",
]);

const sceneTextToNotesOnly = new Set([
  "scene-three-feathers-gm-overview",
  "scene-three-feathers-location-setup",
  "scene-three-feathers-faction-briefs",
]);

const titleReplacements: Record<string, string> = {
  "Core Premise": "Notes",
  "Database Links": "Notes",
  "Main Clocks": "Notes",
  "Ground Floor": "Notes",
  "Upper Floor": "Notes",
  "Exits and Constraints": "Notes",
  "The Gravin's Party": "Notes",
  "The Scholars": "Notes",
  "The Morrians and the Coffin": "Notes",
  "The Schmidts and the Angry Merchant": "Notes",
  "Gamblers, Thieves, Boatmen, and Coachmen": "Notes",
  "9:20 p.m. Bruno Is Sent Upstairs": "9:20 p.m. The Bare-Armed Man Leaves",
  "9:25 p.m. The Gravin Retires": "9:25 p.m. The Noble Woman Retires",
  "9:35 p.m. The Morrians Arrive": "9:35 p.m. Black-Robed Mourners Arrive",
  "10:10 p.m. Bruno's Last Drink": "10:10 p.m. Fresh Drinks at the Loud Table",
  "10:25 p.m. Bruno Is Missing": "10:25 p.m. A Servant Returns Pale",
  "10:40 p.m. Rechtshandler Goes Upstairs": "10:40 p.m. The Older Man Goes Upstairs",
  "11:05 p.m. The Lawyer Is Killed": "11:05 p.m. Sounds Behind a Door",
  "Noise in Room 9": "Noise Behind a Guest-Room Door",
  "The False Corpse": "The Coffin Opens",
  "Scream from the Gravin's Wing": "A Scream Upstairs",
  "Clues in Bruno's Room": "Clues in the Room",
};

const descriptionReplacements: Record<string, string> = {
  "You arrive at the Three Feathers expecting food, gossip, and a bed. The inn is warm, loud, and full of people who already watch each other. By dawn, the doors may be guarded, a champion may be dead, a coffin may not hold a corpse, and every witness may have a reason to lie.":
    "You arrive at the Three Feathers expecting food, gossip, and a bed. The inn is warm, loud, and full of people who already watch each other. A broad man laughs too loudly near the fire. Servants move with practiced speed. Armed retainers keep their eyes on the doors. A card game waits for new coins. Outside, the river wind taps at the shutters.",
  "You see a room where too many people wait for the right moment. Bruno drinks and boasts. The scholars keep to themselves. The lovers stay close. The false mourners guard their coffin. The bounty hunter watches. The small gambler smiles. Every delay gives someone else time to act.":
    "You notice a room full of small delays. A broad, bare-armed man laughs over his drink and makes sure everyone hears him. Three quiet travellers keep their backs close to the wall. A well-dressed couple stands close together, then looks away when anyone watches too long. Black-robed mourners keep both hands near their coffin. A hard-faced woman chooses a seat with a clear view of the room. A small gambler smiles over his cards. Everyone seems to wait for someone else to move first.",
  "You climb into a narrow upper corridor. The air is cooler here, and the boards creak under your boots. Doors stand close together, each with a number or a small mark. You hear muffled voices, a cough, the scrape of a chair, and the soft click of a latch. Rooms 7 and 8 are close to the middle of the trouble, with the Morrians, the Schmidts, Ursula, Bruno, and Rechtshandler all within reach.":
    "You climb into a narrow upper corridor. The air is cooler here, and the boards creak under your boots. Doors stand close together, each with a number or a small mark. You hear muffled voices, a cough, the scrape of a chair, and the soft click of a latch. Several occupied rooms sit close enough that a shout, a fall, or a hurried step could carry through the walls.",
  "You see a noble party that takes up space without asking. The Gravin sits apart in fine clothing, surrounded by servants who answer quickly and armed guards who watch the exits. Bruno Franke is the loud champion at the table. Gustaf Rechtshandler is the lawyer with a severe face and careful hands. One servant, Dominique, stays useful, quiet, and close enough to notice too much.":
    "You see a noble party that takes up space without asking. A finely dressed woman sits apart, surrounded by servants who answer quickly and armed guards who watch the exits. A broad, loud man dominates one table with drink and laughter. A severe older man keeps his hands careful and his expression controlled. One quiet servant stays close enough to be useful and far enough back to avoid attention.",
  "You see a well-dressed couple who give the names Schmidt and Schmidt, but they hesitate before using them. Friedrich speaks like a noble trying not to. Hanna keeps close to him and watches the door. Later, Thomas Prahmhandler arrives with drink on his breath, anger in his voice, and hired men at his back.":
    "You see a well-dressed couple who give the names Schmidt and Schmidt, but they hesitate before using them. The man speaks carefully, as if he is trying to sound plainer than he is. The woman keeps close to him and watches the door. They ask for privacy quickly and do not linger in the common room.",
  "You hear a servant's sharp voice cut through Bruno's laughter. Bruno's grin turns sour. His chair scrapes hard across the floor, and his heavy steps climb the stairs to room 4. The servant watches him go before returning to the Gravin's side.":
    "You hear a servant's sharp voice cut through the bare-armed man's laughter. His grin turns sour. His chair scrapes hard across the floor, and his heavy steps climb the stairs. The servant watches him disappear into the upper corridor before returning to the noble woman's side.",
  "You see the Gravin rise, and the people around her move at once. Servants gather dishes, cloaks, and candles. Guards clear a path without speaking. She goes upstairs toward room 1, leaving authority behind her like a closed door.":
    "You see the finely dressed woman rise, and the people around her move at once. Servants gather dishes, cloaks, and candles. Guards clear a path without speaking. She goes upstairs, leaving authority behind her like a closed door.",
  "You see three black-robed mourners carry in a coffin. The room quiets around them. Their face paint is thick, their robes smell of river damp, and their hands grip the coffin too tightly. They ask for room 9 and expect everyone to make space.":
    "You see three black-robed mourners carry in a coffin. The room quiets around them. Their face paint is thick, their robes smell of river damp, and their hands grip the coffin too tightly. They ask Hans for a private room and expect everyone to make space.",
  "You see a hard-faced woman enter from the yard with cold air behind her. She carries road dust, leather, and iron. A crossbow case sits close to her hand. She chooses a seat where she can see the Morrians, the coffin, the stairs, and the door.":
    "You see a hard-faced woman enter from the yard with cold air behind her. She carries road dust, leather, and iron. A crossbow case sits close to her hand. She chooses a seat where she can see the black-robed mourners, their coffin, the stairs, and the door.",
  "You see fresh drinks land on Bruno's table. Foam slides down the mugs. Bruno grabs one without checking it, still grinning and still loud. Dominique stands near enough to be useful, but not near enough to seem important. Ursula watches from across the room.":
    "You see fresh drinks land on the loud man's table. Foam slides down the mugs. He grabs one without checking it, still grinning and still loud. A quiet servant stands near enough to be useful, but not near enough to seem important. The hard-faced woman watches from across the room.",
  "You hear quick steps on the stairs. A servant comes down pale and tense, then goes straight to the Gravin's people. The common room keeps talking, but a cold pause opens around the guards. Bruno is not where he should be.":
    "You hear quick steps on the stairs. A servant comes down pale and tense, then goes straight to the noble woman's people. The common room keeps talking, but a cold pause opens around the guards. Someone important is not where he should be.",
  "You see Rechtshandler leave the room with his shoulders tight and a candle in one hand. He does not look drunk. He looks cornered. A scholar waits a breath too long, then follows at a distance toward the upper corridor.":
    "You see the severe older man leave the room with his shoulders tight and a candle in one hand. He does not look drunk. He looks cornered. One of the quiet travellers waits a breath too long, then follows at a distance toward the upper corridor.",
  "You stand near room 3 and hear low voices behind the door. Rechtshandler's voice trembles. Another voice stays calm. You hear a scrape, a short gasp, and something heavy hitting the floor. The corridor smells of candle wax and old dust.":
    "You stand in the upper corridor and hear low voices behind a nearby door. One voice trembles. Another voice stays calm. You hear a scrape, a short gasp, and something heavy hitting the floor. The corridor smells of candle wax and old dust.",
  "You hear a thump from room 9. Then another. A low groan leaks through the door, followed by rushed whispers and a hard knock against wood. The false Morrians answer too quickly if anyone asks what happens inside.":
    "You hear a heavy thump from behind one of the nearby guest-room doors. A second knock follows. A low groan leaks through the wood, then rushed whispers. Someone inside moves quickly across the floorboards. If you call out, the answer comes too fast and too calm.",
  "You see the coffin lid shift. The air inside smells sour, stale, and medicinal. A living man blinks up from the dark wood, weak but awake. The black-robed men move at once, no longer slow, holy, or grieving. Ursula steps forward if she sees Josef clearly.":
    "You see the coffin lid shift. The air inside smells sour, stale, and medicinal. A living man blinks up from the dark wood, weak but awake. The black-robed men move at once, no longer slow, solemn, or careful. The hard-faced woman steps forward if she gets a clear look at him.",
  "You hear a scream tear through the upper floor. Doors open. Feet pound in the corridor. In Bruno's room, the air smells of sweat, cold ash, and blood. Bruno lies still. A weapon sits where everyone can see it. Dominique is pale and breathless. The Gravin's servants cluster at the edge of the room, and the guards start looking for someone to blame.":
    "You hear a scream tear through the upper floor. Doors open. Feet pound in the corridor. Inside the room, the air smells of sweat, cold ash, and blood. The broad, bare-armed man lies still. A weapon sits where everyone can see it. A quiet servant stands pale and breathless. The noble woman's servants cluster at the edge of the room, and the guards start looking for someone to blame.",
  "You stand in Bruno's room with the door watched from outside. The bed is disturbed. The hearth is dark, but soot marks the chimney stones. The room smells of blood, stale drink, cold ash, and damp wool. Bruno's things are not all where they should be. The window, the bed, the weapon, and the chimney all look like they matter.":
    "You stand in the watched room. The bed is disturbed. The hearth is dark, but soot marks the chimney stones. The room smells of blood, stale drink, cold ash, and damp wool. The dead man's things are not all where they should be. The window, the bed, the weapon, and the chimney all look like they matter.",
  "You hear a soft scrape inside the chimney. Soot falls into the cold hearth. A hand appears, then a face streaked black with ash. Dominique drops lightly into the room and freezes when she sees you. Her eyes go to the bed, then to the door, then to the chimney above her.":
    "You hear a soft scrape inside the chimney. Soot falls into the cold hearth. A hand appears, then a face streaked black with ash. The quiet servant drops lightly into the room and freezes when she sees you. Her eyes go to the bed, then to the door, then to the chimney above her.",
};

function cleanPlayerFacingText(text: string): string {
  return descriptionReplacements[text] ?? text;
}

function cleanTitle(title?: string): string | undefined {
  return title ? titleReplacements[title] ?? title : title;
}

function toNotesComponent(component: ScenarioSceneComponent): ScenarioSceneComponent[] {
  if (!component.gmNotes?.length) {
    return [];
  }

  return [{
    id: `${component.id}-notes`,
    type: "notes",
    title: "Notes",
    text: component.gmNotes.join("\n\n"),
    links: component.links,
  }];
}

function toNotesOnlyComponent(component: ScenarioSceneComponent): ScenarioSceneComponent[] {
  const notesText = [cleanPlayerFacingText(component.text), ...(component.gmNotes ?? [])]
    .filter(Boolean)
    .join("\n\n");

  if (!notesText) {
    return [];
  }

  return [{
    id: `${component.id}-notes`,
    type: "notes",
    title: cleanTitle(component.title) ?? "Notes",
    text: notesText,
    links: component.links,
  }];
}

function splitComponentNotes(sceneId: string, component: ScenarioSceneComponent): ScenarioSceneComponent[] {
  if (gmOnlyComponentIds.has(component.id) || (sceneTextToNotesOnly.has(sceneId) && component.type === "text")) {
    return toNotesOnlyComponent(component);
  }

  const componentWithoutLegacyNotes = {
    ...component,
    title: cleanTitle(component.title),
    text: cleanPlayerFacingText(component.text),
    gmNotes: undefined,
  } as ScenarioSceneComponent;

  return [componentWithoutLegacyNotes, ...toNotesComponent(component)];
}

function prepareScenarioImport(
  scenario: ScenarioSessionImportDefinition,
): ScenarioSessionImportDefinition {
  return {
    ...scenario,
    defaultSession: {
      ...scenario.defaultSession,
      notes: threeFeathersSessionDescription,
    },
    scenes: scenario.scenes.map((scene) => ({
      ...scene,
      components: [
        ...(sceneDescriptionText[scene.id]
          ? [
              {
                id: `${scene.id}-description`,
                type: "text" as const,
                title: "Description",
                text: sceneDescriptionText[scene.id],
                links: scene.links,
              },
            ]
          : []),
        ...(scene.id === "scene-three-feathers-gm-overview"
          ? [
              {
                id: `${scenario.id}-scenario-notes`,
                type: "notes" as const,
                title: "Notes",
                text: scenarioNotesText,
                links: scene.links,
              },
            ]
          : []),
        ...scene.components.flatMap((component) => splitComponentNotes(scene.id, component)),
      ],
    })),
  };
}

export const availableScenarioImports = [
  prepareScenarioImport(roughNightAtTheThreeFeathersScenario),
];
