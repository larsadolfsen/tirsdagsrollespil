/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Keep this file lean: App.tsx should only compose app-wide providers and mount
// the top-level application shell. Feature state, WFRP rules, and large UI
// sections belong in src/hooks, src/lib, tabs, or components.
import { AppComposition } from "./AppComposition";
import { GameSessionProvider } from "./context/GameSessionContext";

export default function App() {
  return (
    <GameSessionProvider>
      <AppComposition />
    </GameSessionProvider>
  );
}
