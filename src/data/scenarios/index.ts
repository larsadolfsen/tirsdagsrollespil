export * from "./scenarioSessionImport";
export * from "./roughNightAtTheThreeFeathers";

import { roughNightAtTheThreeFeathersScenario } from "./roughNightAtTheThreeFeathers";
import type {
  ScenarioSceneComponent,
  ScenarioSessionImportDefinition,
} from "./scenarioSessionImport";

const threeFeathersSessionDescription =
  "The road, river, and weather bring you to the Three Feathers for what should be one quiet night. The common room is hot, crowded, and full of people who watch each other too closely. A noble party claims the best space, a loud champion drinks near the fire, a small gambler invites strangers to play, and late arrivals keep bringing new trouble through the door. By dawn, the inn may hold a murder, a false corpse, a blackmail scheme, a missing truth, and more suspects than beds.";

const scenarioDescriptionText =
  "You arrive at the Three Feathers at the end of a long day. Warm light spills from the windows. Smoke hangs under the eaves. The yard smells of wet straw, horse sweat, river mud, and woodsmoke. Inside, voices press together in the common room. You see armed servants, tired travellers, a card table, a loud bare-armed man near the fire, and a landlord who watches the stairs while he pours ale. Nothing here is quiet enough to be private for long.";

const scenarioNotesText =
  "Use this import as a timed pressure map, not a fixed script. Description components must only contain what the Characters can perceive or reasonably infer. Notes components hold room ids, hidden identities, motives, clocks, and exact GM truth.";

const descriptionReplacements: Record<string, string> = {
  "You see a room where too many people wait for the right moment. Bruno drinks and boasts. The scholars keep to themselves. The lovers stay close. The false mourners guard their coffin. The bounty hunter watches. The small gambler smiles. Every delay gives someone else time to act.":
    "You notice a room full of small delays. A broad, bare-armed man laughs over his drink and makes sure everyone hears him. Three quiet travellers keep their backs close to the wall. A well-dressed couple stands close together, then looks away when anyone watches too long. Black-robed mourners keep both hands near their coffin. A hard-faced woman chooses a seat with a clear view of the room. A small gambler smiles over his cards. Everyone seems to wait for someone else to move first.",
  "You hear a thump from room 9. Then another. A low groan leaks through the door, followed by rushed whispers and a hard knock against wood. The false Morrians answer too quickly if anyone asks what happens inside.":
    "You hear a heavy thump from behind one of the nearby guest-room doors. A second knock follows. A low groan leaks through the wood, then rushed whispers. Someone inside moves quickly across the floorboards. If you call out, the answer comes too fast and too calm.",
};

function cleanPlayerFacingText(text: string): string {
  return descriptionReplacements[text] ?? text;
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

function splitComponentNotes(component: ScenarioSceneComponent): ScenarioSceneComponent[] {
  const componentWithoutLegacyNotes = {
    ...component,
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
    scenes: scenario.scenes.map((scene, sceneIndex) => ({
      ...scene,
      components: [
        ...(sceneIndex === 0
          ? [
              {
                id: `${scenario.id}-scenario-description`,
                type: "text" as const,
                title: "Description",
                text: scenarioDescriptionText,
                links: scene.links,
              },
              {
                id: `${scenario.id}-scenario-notes`,
                type: "notes" as const,
                title: "Notes",
                text: scenarioNotesText,
                links: scene.links,
              },
            ]
          : []),
        ...scene.components.flatMap(splitComponentNotes),
      ],
    })),
  };
}

export const availableScenarioImports = [
  prepareScenarioImport(roughNightAtTheThreeFeathersScenario),
];
