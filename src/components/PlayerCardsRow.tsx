import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { hydrateCharacterProgress, loadCharacterProgress } from "../data/persistence";
import { loadResolvedCharacter, type CharacterSummary } from "../data/repository";
import { Heading, SectionHeading } from "./ui";

type PlayerCardsRowProps = {
  characters: CharacterSummary[];
};

export function PlayerCardsRow({ characters }: PlayerCardsRowProps) {
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
    <section
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-4 select-none"
      aria-labelledby="player-characters-heading"
    >
      <div className="col-span-full">
        <SectionHeading id="player-characters-heading">
          Characters
        </SectionHeading>
      </div>
      {resolvedCharacters.map((character) => {
        const initials = character.name
          .split(" ")
          .map((part) => part.charAt(0))
          .join("")
          .slice(0, 2);

        // Fetch current and max wounds for the character card
        const progress = loadCharacterProgress(character.id);
        const woundsCurrent = progress?.woundsCurrent ?? character.wounds.current;
        const woundsMax = character.wounds.max;
        const safeWoundsCurrent = Math.min(Math.max(0, woundsCurrent), woundsMax);
        const woundsPercent = woundsMax > 0 ? (safeWoundsCurrent / woundsMax) * 100 : 0;

        return (
          <div key={character.id} className="w-full">
            <a
              href={`/${character.campaignId}/${character.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wfrp-landing-character-card no-underline relative group"
              aria-label={`Open ${character.name} in a new tab`}
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
              <div className="wfrp-landing-card-body flex flex-col justify-center min-w-0 pr-6">
                <div className="pr-2">
                  <Heading level={2} variant="card" truncate>
                    {character.name}
                  </Heading>
                </div>
                <p className="wfrp-landing-card-copy truncate mb-1">
                  {character.tier}
                </p>
                <div className="flex items-center gap-2 w-full">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-wfrp-border shadow-inner">
                    <div
                      className="h-full rounded-full bg-wfrp-red transition-all duration-500 ease-out"
                      style={{ width: `${woundsPercent}%` }}
                      role="progressbar"
                      aria-valuenow={woundsCurrent}
                      aria-valuemin={0}
                      aria-valuemax={woundsMax}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-wfrp-muted-text shrink-0 leading-none">
                    {woundsCurrent}/{woundsMax}
                  </span>
                </div>
              </div>
              
              {/* External link icon in top right corner */}
              <div className="absolute top-2.5 right-2.5 text-wfrp-muted-text/50 group-hover:text-wfrp-gold transition-colors duration-200">
                <ExternalLink size={12} />
              </div>
            </a>
          </div>
        );
      })}
    </section>
  );
}
