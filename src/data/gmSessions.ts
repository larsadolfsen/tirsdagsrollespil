export interface EncounterMonsterGroup {
  id: string;
  templateId: string;
  name: string;
  count: number;
  wounds: number[];
  source?: "creature" | "npc";
}

export interface EncounterData {
  monsterGroups: EncounterMonsterGroup[];
  playerOrder: string[];
  manualOrder?: string[];
}

export interface GMScenarioLinks {
  npcs?: string[];
  locations?: string[];
}

export interface GMSceneComponent {
  id: string;
  type: "text" | "encounter";
  text: string;
  title?: string;
  encounterData?: EncounterData;
  links?: GMScenarioLinks;
  gmNotes?: string[];
}

export interface GMScene {
  id: string;
  title?: string;
  kind?: string;
  locationId?: string;
  location?: string;
  links?: GMScenarioLinks;
  components: GMSceneComponent[];
}

export interface GMSession {
  id: string;
  campaignId: string;
  sessionNumber: number;
  name: string;
  date: string;
  notes: string;
  scenes?: GMScene[];
  createdAt?: string;
  updatedAt?: string;
}

const gmSessionsEndpoint = (campaignId: string) =>
  `/api/gm-sessions/${encodeURIComponent(campaignId)}`;

const gmSessionDeleteEndpoint = (campaignId: string, sessionId: string) =>
  `/api/gm-sessions/${encodeURIComponent(campaignId)}/${encodeURIComponent(sessionId)}`;

export async function loadCampaignSessions(campaignId: string): Promise<GMSession[]> {
  if (typeof fetch === "undefined") {
    return [];
  }

  try {
    const response = await fetch(gmSessionsEndpoint(campaignId));
    if (!response.ok) {
      throw new Error(`Could not load sessions (${response.status}).`);
    }

    const sessions = await response.json();
    return Array.isArray(sessions) ? (sessions as GMSession[]) : [];
  } catch (error) {
    console.error("Error in loadCampaignSessions:", error);
    return [];
  }
}

export async function saveCampaignSession(
  campaignId: string,
  session: Omit<GMSession, "campaignId"> & { campaignId?: string }
): Promise<void> {
  if (typeof fetch === "undefined") {
    return;
  }

  const response = await fetch(gmSessionsEndpoint(campaignId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: session.id,
      sessionNumber: session.sessionNumber,
      name: session.name,
      date: session.date,
      notes: session.notes,
      scenes: session.scenes ?? [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Could not save session (${response.status}).`);
  }
}

export async function deleteCampaignSession(campaignId: string, sessionId: string): Promise<void> {
  if (typeof fetch === "undefined") {
    return;
  }

  const response = await fetch(gmSessionDeleteEndpoint(campaignId, sessionId), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Could not delete session (${response.status}).`);
  }
}
