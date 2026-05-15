export interface CampaignRecord {
  id: string;
  name: string;
}

export const enemyWithinCampaign: CampaignRecord = {
  id: "enemy_within",
  name: "Enemy Within",
};

export const campaigns: CampaignRecord[] = [enemyWithinCampaign];

export const campaignById = Object.fromEntries(
  campaigns.map((campaign) => [campaign.id, campaign]),
);

export const defaultCampaignId = enemyWithinCampaign.id;
