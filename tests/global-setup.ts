import type { FullConfig } from "@playwright/test";
import { availableScenarioImports, buildScenarioSessionScenes } from "../src/data/scenarios";

// Seeds the GM backend with the full "A Rough Night at the Three Feathers" session
// (14 scenes) so the GM/encounter specs — which open the first session and expand
// Scene 7 to add adversaries — have deterministic data. The dev/prod SQLite store is
// gitignored, so without this the first session may be empty or partial.
const BASE_URL = "http://127.0.0.1:3000";
const CAMPAIGN_ID = "enemy_within";
const SESSION_ID = "session-three-feathers-seed";

async function waitForServer(timeoutMs = 90_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE_URL}/api/gm-sessions/${CAMPAIGN_ID}`);
      if (res.ok) return;
    } catch {
      // server not accepting connections yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Dev server did not become ready at ${BASE_URL} within ${timeoutMs}ms`);
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const scenario = availableScenarioImports[0];
  // Keep the scenario's rich scenes (Scene 7 needs its encounter block for the
  // adversary specs), but empty the FIRST scene: the component-manipulation GM specs
  // expand "Scene 1" and add components, and assume it starts sparse.
  const scenes = buildScenarioSessionScenes(scenario).map((scene, index) =>
    index === 0 ? { ...scene, components: [] } : scene,
  );
  const session = {
    id: SESSION_ID,
    sessionNumber: scenario.defaultSession.sessionNumber ?? 0,
    name: scenario.defaultSession.name,
    date: "",
    notes: scenario.defaultSession.notes,
    scenes,
  };

  await waitForServer();

  // Reset to a single canonical session so `.first()` deterministically opens it.
  const existing = (await (await fetch(`${BASE_URL}/api/gm-sessions/${CAMPAIGN_ID}`)).json()) as Array<{ id: string }>;
  for (const stale of existing) {
    if (stale.id === SESSION_ID) continue;
    await fetch(`${BASE_URL}/api/gm-sessions/${CAMPAIGN_ID}/${stale.id}`, { method: "DELETE" });
  }

  const put = await fetch(`${BASE_URL}/api/gm-sessions/${CAMPAIGN_ID}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(session),
  });

  if (!put.ok) {
    throw new Error(`Failed to seed GM session: ${put.status} ${await put.text()}`);
  }
}
