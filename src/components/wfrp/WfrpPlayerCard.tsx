import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  hydrateCharacterProgress,
  loadCharacterProgress,
  subscribeToProgressUpdates,
} from "../../data/persistence";
import { loadResolvedCharacter, type CharacterSummary } from "../../data/repository";
import { Heading } from "../ui";
import { buildCampaignCharacterPath } from "../../lib/campaignRoutes";

type WfrpPlayerCardProps = {
  characterSummary: CharacterSummary;
  className?: string;
};

export function WfrpPlayerCard({ characterSummary, className }: WfrpPlayerCardProps) {
  const character = loadResolvedCharacter(characterSummary.id);
  const [portraitDataUrl, setPortraitDataUrl] = useState<string>("");
  const [characterName, setCharacterName] = useState<string>(character.name);
  const [wounds, setWounds] = useState({
    current: character.wounds.current,
    max: character.wounds.max,
  });

  useEffect(() => {
    let isCancelled = false;

    async function hydrate() {
      await hydrateCharacterProgress(characterSummary.id);
      if (isCancelled) return;

      const progress = loadCharacterProgress(characterSummary.id);
      setPortraitDataUrl(progress?.portraitDataUrl ?? "");

      const currentName = progress?.characterName?.trim() || character.name;
      setCharacterName(currentName);

      const current = progress?.woundsCurrent ?? character.wounds.current;
      setWounds({ current, max: character.wounds.max });
    }

    void hydrate();

    const unsubscribe = subscribeToProgressUpdates((msg) => {
      if (isCancelled) return;

      if (msg.characterId === characterSummary.id) {
        if (msg.type === "save") {
          const current = msg.progress.woundsCurrent ?? character.wounds.current;
          setWounds({ current, max: character.wounds.max });
          if (msg.progress.characterName) {
            setCharacterName(msg.progress.characterName.trim());
          }
        } else if (msg.type === "clear") {
          setWounds({
            current: character.wounds.current,
            max: character.wounds.max,
          });
          setCharacterName(character.name);
        }
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [characterSummary.id, character.wounds.current, character.wounds.max, character.name]);

  const initials = characterName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);

  const safeWoundsCurrent = Math.min(Math.max(0, wounds.current), wounds.max);
  const woundsPercent = wounds.max > 0 ? (safeWoundsCurrent / wounds.max) * 100 : 0;

  return (
    <a
      href={buildCampaignCharacterPath({
        campaignId: character.campaignId,
        characterId: character.id,
        view: "characteristics",
        omitDefaultView: true,
        characterName,
      })}
      target="_blank"
      rel="noopener noreferrer"
      className={`wfrp-landing-character-card no-underline relative group ${className ?? ""}`}
      aria-label={`Open ${characterName} in a new tab`}
    >
      <div className="wfrp-landing-portrait">
        {portraitDataUrl ? (
          <img
            src={portraitDataUrl}
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
            {characterName}
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
              aria-valuenow={wounds.current}
              aria-valuemin={0}
              aria-valuemax={wounds.max}
            />
          </div>
          <span className="text-[10px] font-semibold text-wfrp-muted-text shrink-0 leading-none">
            {wounds.current}/{wounds.max}
          </span>
        </div>
      </div>

      {/* External link icon in top right corner */}
      <div className="absolute top-2.5 right-2.5 text-wfrp-muted-text/50 group-hover:text-white transition-colors duration-200">
        <ExternalLink size={12} />
      </div>
    </a>
  );
}
