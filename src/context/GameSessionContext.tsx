import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useGameSession, type GameSessionHook } from "../lib/useGameSession";

const GameSessionContext = createContext<GameSessionHook | null>(null);

export function GameSessionProvider({ children }: { children: ReactNode }) {
  const session = useGameSession();

  return (
    <GameSessionContext.Provider value={session}>
      {children}
    </GameSessionContext.Provider>
  );
}

export function useGameSessionContext() {
  const session = useContext(GameSessionContext);

  if (!session) {
    throw new Error("useGameSessionContext must be used within a GameSessionProvider.");
  }

  return session;
}
