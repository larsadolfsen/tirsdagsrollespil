/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * App composition root.
 *
 * Keep this file lean.
 *
 * This file should only wire together:
 * - Global providers
 * - Top-level routing/navigation
 * - The app shell
 * - Global error/loading boundaries, if needed
 *
 * Do not add:
 * - Feature logic
 * - Screen-specific UI
 * - Business rules
 * - Data fetching
 * - State management details
 * - Large layout implementations
 *
 * Move feature code into focused hooks, lib modules, tabs, or components.
 * Move reusable UI into shared components.
 * Move app structure into dedicated shell, routing, or provider files.
 */
import { AppComposition } from "./AppComposition";
import { GameSessionProvider } from "./context/GameSessionContext";

export default function App() {
  return (
    <GameSessionProvider>
      <AppComposition />
    </GameSessionProvider>
  );
}
