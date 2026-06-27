import { useEffect, useState } from "react";
import { hydrateCharacterProgress, loadCharacterProgress } from "../data/persistence";
import { loadResolvedCharacter, type CharacterSummary } from "../data/repository";

type LandingPageProps = {
  characters: CharacterSummary[];
  onSelectCharacter: (characterId: string) => void;
};

export function LandingPage({ characters, onSelectCharacter }: LandingPageProps) {
  const resolvedCharacters = characters.map((character) => loadResolvedCharacter(character.id));
  const [portraitDataUrls, setPortraitDataUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let isCancelled = false;

    async function hydratePortraits() {
      await Promise.all(characters.map((character) => hydrateCharacterProgress(character.id)));

      if (isCancelled) {
        return;
      }

      setPortraitDataUrls(
        Object.fromEntries(
          characters.map((character) => [
            character.id,
            loadCharacterProgress(character.id)?.portraitDataUrl ?? "",
          ]),
        ),
      );
    }

    void hydratePortraits();

    return () => {
      isCancelled = true;
    };
  }, [characters]);

  return (
    <div className="wfrp-landing-shell">
      <main className="wfrp-landing-list">
        {resolvedCharacters.map((character) => {
          const initials = character.name
            .split(" ")
            .map((part) => part.charAt(0))
            .join("")
            .slice(0, 2);

          return (
            <button
              key={character.id}
              type="button"
              onClick={() => onSelectCharacter(character.id)}
              className="wfrp-landing-character-card"
              aria-label={`Open ${character.name}`}
            >
              <div className="wfrp-landing-portrait">
                {portraitDataUrls[character.id] ? (
                  <img
                    src={portraitDataUrls[character.id]}
                    alt=""
                    className="wfrp-landing-portrait-image"
                  />
                ) : (
                  <span className="wfrp-landing-initials">
                    {initials}
                  </span>
                )}
              </div>
              <div className="wfrp-landing-card-body">
                <h2 className="wfrp-landing-card-title">
                  {character.name}
                </h2>
                <p className="wfrp-landing-card-copy">
                  {character.tier}
                </p>
              </div>
            </button>
          );
        })}
      </main>
    </div>
  );
}
