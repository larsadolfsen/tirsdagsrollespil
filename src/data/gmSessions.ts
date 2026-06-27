export interface GMSession {
  id: string;
  campaignId: string;
  sessionNumber: number;
  name: string;
  date: string;
  notes: string;
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(session),
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
