import type { EncounterData, GMScene, GMSceneComponent } from "../gmSessions";

export type ScenarioSceneKind = "location" | "timeline" | "encounter" | "chase" | "aftermath";
export type ScenarioLocationKind = "inn" | "room" | "outdoor" | "route" | "region" | "other";

export interface ScenarioLinkTargets {
  npcs?: string[];
  locations?: string[];
  items?: string[];
  weapons?: string[];
  talents?: string[];
  skills?: string[];
  spells?: string[];
  rules?: string[];
}

export interface ScenarioLocationReference {
  id: string;
  name: string;
  kind: ScenarioLocationKind;
  parentLocationId?: string;
  description?: string;
  tags?: string[];
}

export interface ScenarioNpcReference {
  id: string;
  name: string;
  role?: string;
  tags?: string[];
}

interface ScenarioSceneComponentBase {
  id: string;
  title?: string;
  text: string;
  links?: ScenarioLinkTargets;
  gmNotes?: string[];
}

export interface ScenarioTextBlock extends ScenarioSceneComponentBase {
  type: "text";
}

export interface ScenarioNotesBlock extends ScenarioSceneComponentBase {
  type: "notes";
}

export interface ScenarioEncounterBlock extends ScenarioSceneComponentBase {
  type: "encounter";
  encounterData: EncounterData;
}

export type ScenarioSceneComponent = ScenarioTextBlock | ScenarioNotesBlock | ScenarioEncounterBlock;

export interface ScenarioSceneImport {
  id: string;
  title: string;
  kind: ScenarioSceneKind;
  locationId?: string;
  links?: ScenarioLinkTargets;
  components: ScenarioSceneComponent[];
}

export interface ScenarioSessionDefaults {
  name: string;
  notes: string;
  sessionNumber?: number;
}

export interface ScenarioSessionImportDefinition {
  id: string;
  title: string;
  source: {
    book: string;
    scenario: string;
  };
  tags: string[];
  summary: string;
  defaultSession: ScenarioSessionDefaults;
  locations: ScenarioLocationReference[];
  npcs: ScenarioNpcReference[];
  scenes: ScenarioSceneImport[];
}

export function buildScenarioSessionScenes(scenario: ScenarioSessionImportDefinition): GMScene[] {
  return scenario.scenes.map((scene) => {
    const loc = scenario.locations.find((l) => l.id === scene.locationId);
    return {
      id: scene.id,
      title: scene.title,
      kind: scene.kind,
      locationId: scene.locationId,
      location: loc ? loc.name : undefined,
      links: scene.links,
      components: scene.components.map((component): GMSceneComponent => {
        const base = {
          id: component.id,
          title: component.title,
          text: component.text,
          links: component.links,
          gmNotes: component.gmNotes,
        };

        if (component.type === "encounter") {
          return {
            ...base,
            type: "encounter",
            encounterData: component.encounterData,
          };
        }

        if (component.type === "notes") {
          return {
            ...base,
            type: "notes",
          };
        }

        return {
          ...base,
          type: "text",
        };
      }),
    };
  });
}
