import type { CharacterProgressData } from "../types";

const characterProgressEndpoint = (characterId: string) =>
  `/api/character-progress/${encodeURIComponent(characterId)}`;

const SSE_ENDPOINT = "/api/character-progress/events";

type CharacterProgressMap = Record<string, CharacterProgressData>;

let progressCache: CharacterProgressMap = {};

function readProgressMap(): CharacterProgressMap {
  return progressCache;
}

function writeProgressMap(progressMap: CharacterProgressMap) {
  progressCache = progressMap;
}

// ---------------------------------------------------------------------------
// Real-time progress updates
//
// Strategy:
//  1. Server-Sent Events (SSE) — the server pushes every save/clear to ALL
//     connected clients, regardless of machine. This is the primary channel.
//  2. BroadcastChannel — instant same-browser, same-machine echo for the tab
//     that originated the save (SSE does not loop back to the sender).
//
// Consumers call `subscribeToProgressUpdates` and get live notifications from
// either channel transparently.
// ---------------------------------------------------------------------------

export type ProgressUpdateMessage =
  | { type: "save"; characterId: string; progress: CharacterProgressData }
  | { type: "clear"; characterId: string };

type ProgressUpdateHandler = (msg: ProgressUpdateMessage) => void;

const updateHandlers = new Set<ProgressUpdateHandler>();

function notifyHandlers(msg: ProgressUpdateMessage) {
  for (const handler of updateHandlers) {
    handler(msg);
  }
}

/** Subscribe to progress changes from any source (SSE or same-browser tab).
 *  Returns an unsubscribe function. */
export function subscribeToProgressUpdates(handler: ProgressUpdateHandler): () => void {
  updateHandlers.add(handler);
  return () => updateHandlers.delete(handler);
}

// ---------------------------------------------------------------------------
// SSE connection — one shared EventSource for the whole browser tab
// ---------------------------------------------------------------------------
function openSseConnection() {
  if (typeof EventSource === "undefined") return;

  const source = new EventSource(SSE_ENDPOINT);

  source.onmessage = (event: MessageEvent<string>) => {
    try {
      const msg = JSON.parse(event.data) as ProgressUpdateMessage;

      // Keep local cache in sync so loadCharacterProgress stays accurate.
      if (msg.type === "save") {
        writeProgressMap({ ...readProgressMap(), [msg.characterId]: msg.progress });
      } else if (msg.type === "clear") {
        const next = { ...readProgressMap() };
        delete next[msg.characterId];
        writeProgressMap(next);
      }

      notifyHandlers(msg);
    } catch {
      // Malformed event — ignore.
    }
  };

  source.onerror = () => {
    // EventSource retries automatically; nothing to do.
  };
}

// Open once on module load — the EventSource persists for the lifetime of the tab.
openSseConnection();

// ---------------------------------------------------------------------------
// BroadcastChannel — echoes saves/clears back to the originating tab,
// because SSE only reaches *other* clients, not the sender itself.
// ---------------------------------------------------------------------------
const BROADCAST_CHANNEL_NAME = "wfrp-character-progress";
let _channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!_channel) {
    _channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    _channel.onmessage = (event: MessageEvent<ProgressUpdateMessage>) => {
      notifyHandlers(event.data);
    };
  }
  return _channel;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

async function writeCharacterProgressFile(characterId: string, progress: CharacterProgressData) {
  if (typeof fetch === "undefined") return;

  try {
    await fetch(characterProgressEndpoint(characterId), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progress),
    });
    // The server broadcasts the SSE event to all OTHER clients after this PUT.
    // This tab is notified via BroadcastChannel below.
  } catch {
    // The UI keeps the latest values in memory, but durable saves require the server endpoint.
  }
}

async function deleteCharacterProgressFile(characterId: string) {
  if (typeof fetch === "undefined") return;

  try {
    await fetch(characterProgressEndpoint(characterId), { method: "DELETE" });
  } catch {
    // The UI keeps the latest values in memory, but durable saves require the server endpoint.
  }
}

export async function hydrateCharacterProgress(characterId: string) {
  if (typeof fetch === "undefined") return;

  try {
    const response = await fetch(characterProgressEndpoint(characterId));
    if (!response.ok) return;

    const characterProgress = (await response.json()) as CharacterProgressData | null;
    writeProgressMap({
      ...readProgressMap(),
      ...(characterProgress ? { [characterId]: characterProgress } : {}),
    });
  } catch {
    // Keep the current in-memory values if the server cannot be read.
  }
}

export function loadCharacterProgress(characterId: string): CharacterProgressData | null {
  return readProgressMap()[characterId] ?? null;
}

export function saveCharacterProgress(characterId: string, progress: CharacterProgressData) {
  writeProgressMap({ ...readProgressMap(), [characterId]: progress });
  void writeCharacterProgressFile(characterId, progress);
  // Notify this tab's own subscribers immediately (the server SSE won't loop back).
  const msg: ProgressUpdateMessage = { type: "save", characterId, progress };
  notifyHandlers(msg);
  getChannel()?.postMessage(msg);
}

export function clearCharacterProgress(characterId: string) {
  const progressMap = { ...readProgressMap() };
  delete progressMap[characterId];
  writeProgressMap(progressMap);
  void deleteCharacterProgressFile(characterId);
  const msg: ProgressUpdateMessage = { type: "clear", characterId };
  notifyHandlers(msg);
  getChannel()?.postMessage(msg);
}
