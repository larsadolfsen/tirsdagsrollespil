import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  hydrateCharacterProgress,
  loadCharacterProgress,
  subscribeToProgressUpdates,
} from "../data/persistence";
import { loadResolvedCharacter, type CharacterSummary } from "../data/repository";
import { Heading, SectionHeading } from "./ui";

type WoundsMap = Record<string, { current: number; max: number }>;

type PlayerCardsRowProps = {
  characters: CharacterSummary[];
};

export function PlayerCardsRow({ characters }: PlayerCardsRowProps) {
  const resolvedCharacters = characters.map((character) => loadResolvedCharacter(character.id));
  const [portraitDataUrls, setPortraitDataUrls] = useState<Record<string, string>>({});
  const [woundsMap, setWoundsMap] = useState<WoundsMap>({});

  /** Reads the latest wounds values from the in-memory progress cache into state. */
  function refreshWoundsFromCache() {
    setWoundsMap(
      Object.fromEntries(
        resolvedCharacters.map((character) => {
          const progress = loadCharacterProgress(character.id);
          const current = progress?.woundsCurrent ?? character.wounds.current;
          return [character.id, { current, max: character.wounds.max }];
        }),
      ),
    );
  }

  useEffect(() => {
    let isCancelled = false;

    async function hydrateAll() {
      await Promise.all(characters.map((character) => hydrateCharacterProgress(character.id)));

      if (isCancelled) return;

      setPortraitDataUrls(
        Object.fromEntries(
          characters.map((character) => [
            character.id,
            loadCharacterProgress(character.id)?.portraitDataUrl ?? "",
          ]),
        ),
      );

      refreshWoundsFromCache();
    }

    void hydrateAll();

    // Subscribe to cross-tab broadcasts so the GM view updates instantly
    // whenever a player sheet saves new wounds — no polling or server
    // round-trips needed.
    const unsubscribe = subscribeToProgressUpdates((msg) => {
      if (isCancelled) return;

      if (msg.type === "save") {
        // Merge the incoming progress into the local cache so
        // refreshWoundsFromCache reads the latest value.
        const character = resolvedCharacters.find((c) => c.id === msg.characterId);
        if (!character) return;
        // Write into the in-memory cache directly via hydrateCharacterProgress
        // semantics — but since the data is already in the message we can
        // update state directly without an extra fetch.
        const current = msg.progress.woundsCurrent ?? character.wounds.current;
        setWoundsMap((prev) => ({
          ...prev,
          [msg.characterId]: { current, max: character.wounds.max },
        }));
      } else if (msg.type === "clear") {
        // Cleared progress → fall back to static character defaults.
        const character = resolvedCharacters.find((c) => c.id === msg.characterId);
        if (!character) return;
        setWoundsMap((prev) => ({
          ...prev,
          [msg.characterId]: {
            current: character.wounds.current,
            max: character.wounds.max,
          },
        }));
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters]);

  return (
    <section
      className="flex flex-wrap gap-4 w-full mb-4 select-none"
      aria-labelledby="player-characters-heading"
    >
      <div className="w-full">
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

        // Read wounds from reactive state (updated instantly via BroadcastChannel
        // when another tab saves progress, or populated after the initial fetch).
        const woundsEntry = woundsMap[character.id];
        const woundsCurrent = woundsEntry?.current ?? character.wounds.current;
        const woundsMax = woundsEntry?.max ?? character.wounds.max;
        const safeWoundsCurrent = Math.min(Math.max(0, woundsCurrent), woundsMax);
        const woundsPercent = woundsMax > 0 ? (safeWoundsCurrent / woundsMax) * 100 : 0;

        return (
          <div key={character.id} className="w-full max-w-[288px]">
            <a
              href={`/${character.campaignId}/${character.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wfrp-landing-character-card no-underline relative group max-w-[288px]"
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
              <div className="absolute top-2.5 right-2.5 text-wfrp-muted-text/50 group-hover:text-white transition-colors duration-200">
                <ExternalLink size={12} />
              </div>
            </a>
          </div>
        );
      })}
    </section>
  );
}
