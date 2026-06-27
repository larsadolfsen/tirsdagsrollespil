import { useEffect, useState } from "react";
import { hydrateCharacterProgress, loadCharacterProgress } from "../data/persistence";
import { loadResolvedCharacter, type CharacterSummary } from "../data/repository";

type LandingPageProps = {
  campaignName: string;
  characters: CharacterSummary[];
  onSelectCharacter: (characterId: string) => void;
  onSelectGameMaster: () => void;
};

export function LandingPage({ campaignName, characters, onSelectCharacter, onSelectGameMaster }: LandingPageProps) {
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
    <div className="wfrp-landing-shell flex-col gap-6">
      <header className="flex flex-col items-center text-center select-none">
        <span className="wfrp-label text-wfrp-muted-text text-[11px] font-semibold uppercase tracking-widest">
          Campaign
        </span>
        <h1 className="wfrp-heading font-serif text-3xl text-gray-100 mt-1">
          {campaignName}
        </h1>
      </header>

      <main className="wfrp-landing-list">
        {/* Game Master Card at the top */}
        <button
          type="button"
          onClick={onSelectGameMaster}
          className="wfrp-landing-character-card"
          aria-label="Open Game Master"
        >
          <div className="wfrp-landing-portrait">
            <span className="wfrp-landing-initials">
              GM
            </span>
          </div>
          <div className="wfrp-landing-card-body">
            <h2 className="wfrp-landing-card-title">
              Game Master
            </h2>
          </div>
        </button>

        {/* Character Cards */}
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
