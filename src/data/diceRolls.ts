import type { RollHistoryItem } from "../types/dice";

const campaignDiceRollsEndpoint = (campaignId: string) =>
  `/api/dice-rolls/${encodeURIComponent(campaignId)}`;

export async function loadCampaignDiceRolls(campaignId: string): Promise<RollHistoryItem[]> {
  if (typeof fetch === "undefined") {
    return [];
  }

  const response = await fetch(campaignDiceRollsEndpoint(campaignId));
  if (!response.ok) {
    throw new Error(`Could not load campaign dice rolls (${response.status}).`);
  }

  const rolls = await response.json();
  return Array.isArray(rolls) ? rolls as RollHistoryItem[] : [];
}

export async function saveCampaignDiceRoll({
  campaignId,
  characterId,
  characterName,
  roll,
}: {
  campaignId: string;
  characterId: string;
  characterName: string;
  roll: RollHistoryItem;
}): Promise<RollHistoryItem> {
  const response = await fetch(campaignDiceRollsEndpoint(campaignId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      characterId,
      characterName,
      roll,
    }),
  });

  if (!response.ok) {
    throw new Error(`Could not save campaign dice roll (${response.status}).`);
  }

  return response.json() as Promise<RollHistoryItem>;
}
