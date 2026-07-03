---
name: data-and-api
description: Use before adding state, API calls, new data models, or touching data flow. Covers how state is managed, how the frontend calls the backend, and data model conventions.
---

# Data & API patterns

Invoke this before adding state management, API calls, or new data models.

---

## State architecture

**Single source of truth: `GameSessionContext`**
- Wraps the entire app
- Access via `useGameSessionContext()` hook — never read context directly
- Internally composed from multiple feature hooks in `src/lib/useGameSession.ts`

**Two categories of data:**

| Category | Source | Loading |
|---|---|---|
| Catalog data (characters, rules, campaigns) | `src/data/` — static, bundled | Available at app start |
| Character progress (sheet state, notes, portrait) | Server via `/api/character-progress/{id}` | Lazy-loaded on demand, cached in memory |

**Real-time sync:**
- SSE stream at `/api/character-progress/events` pushes updates to all connected clients
- `BroadcastChannel` echoes local-tab saves immediately without waiting for SSE

---

## Key hooks

| Hook | What it gives you | Where it lives |
|---|---|---|
| `useCharacterDerivedStats` | Encumbrance, armor, carry capacity, containers, worn/carried items | `src/hooks/` |
| `useInventoryActions` | Drag-drop, menu state, item storage handlers | `src/hooks/` |
| `useAppShellState` | Top-level tab navigation, mobile sidebar state | `src/hooks/` |
| `useMobileNavigation` | Back/forward nav for mobile | `src/hooks/` |
| `useCareerAdvancement` | XP tracking, skill/talent advancement | `src/hooks/` |
| `useNotesViewModel` | Notes editing state | `src/hooks/` |
| `useDebouncedValue` | Debounce input changes | `src/hooks/` |

**Before adding a new hook:** check if one of the above already covers the need.

---

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/character-progress/{id}` | Load saved progress |
| PUT | `/api/character-progress/{id}` | Save character progress (replaces entire object) |
| DELETE | `/api/character-progress/{id}` | Clear saved progress |
| GET | `/api/character-progress/events` | SSE stream for real-time updates |
| POST | `/api/dice-rolls/{campaignId}` | Record a dice roll |
| GET | `/api/dice-rolls/{campaignId}` | Load roll history |

**Note:** `/api/adversary-catalog` endpoints are DEV only — not for feature code.

---

## API call patterns

**Load (GET):**
```typescript
const response = await fetch(`/api/character-progress/${encodeURIComponent(characterId)}`);
if (!response.ok) throw new Error(`Could not load progress (${response.status}).`);
const data = await response.json();
```

**Save (PUT) — fire-and-forget:**
```typescript
await fetch(`/api/character-progress/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(progressData),
});
// Errors surface via subscribeToSaveStatus(handler)
```

**Subscribe to real-time updates:**
```typescript
const unsubscribe = subscribeToProgressUpdates((msg) => {
  if (msg.type === "save") { /* msg.characterId, msg.progress */ }
  else if (msg.type === "clear") { /* msg.characterId cleared */ }
});
```

---

## Core data models

**Character progress (server state):**
```typescript
type CharacterProgressData = {
  characterId: string;
  sheet_json: string;       // JSON-serialized GameSession state
  notes_json: string;       // JSON array of note entries
  background_text: string;
  portraitDataUrl?: string;
  characterName?: string;
  woundsCurrent?: number;
};
```

**Resolved character (catalog + progress merged):**
```typescript
type ResolvedCharacterRecord = {
  id: string;
  name: string;
  campaignId: string;
  tier: string;
  wounds: { current: number; max: number };
  attributes: Record<string, number>;        // T, WP, S, etc.
  skills: ResolvedCharacterSkill[];
  talents: ResolvedCharacterTalent[];
  spells: ResolvedCharacterSpell[];
  equipment: ResolvedCharacterEquipment[];
  coins: { gold: number; shillings: number; pennies: number };
};
```

**Equipment item:**
```typescript
type ResolvedCharacterEquipment = {
  id: string;
  itemId: string;           // Reference to ruleset item
  equipped: boolean;
  containerId?: string;     // For nested items in containers
  encumbrance: number;
  armourId?: string;
  armourLocations?: ArmourLocation[];
};
```

**Dice roll:**
```typescript
type RollHistoryItem = {
  campaignId: string;
  characterId: string;
  testType: "dramatic" | "attack" | "channeling" | "corruption";
  result: number;
  sl: number;               // Success Level
  isSuccess: boolean;
  modifier: number;
  target: number;
  rolledAt: string;         // ISO timestamp
};
```

---

## Adversary data model (catalog types)

Three fixed catalog types — **not** runtime data, defined in `src/data/`:
- **NPC** — named character with full stat block
- **Generic** — unnamed stat block
- **Creature** — trait-based creature

`Adversary` is a UI display concept only — not a data type.

---

## Hard rules

- **Never commit files under `data/`** — this is runtime data, blocked by `.githooks`
- **All persistence goes through `src/data/persistence.ts`** — don't fetch character progress directly in components
- **New API endpoints go in `server.mjs`** — follow the existing Express pattern
- **Environment config** is via env vars (see `server.mjs` top section) — never hardcode URLs or credentials
