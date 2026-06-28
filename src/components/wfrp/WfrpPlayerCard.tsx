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
  variant?: "card" | "row";
  isSelected?: boolean;
  onClick?: (event: React.MouseEvent) => void;
};

export function WfrpPlayerCard({
  characterSummary,
  className,
  variant = "card",
  isSelected = false,
  onClick,
}: WfrpPlayerCardProps) {
  const character = loadResolvedCharacter(characterSummary.id);
  const [portraitDataUrl, setPortraitDataUrl] = useState<string>("");
  const [characterName, setCharacterName] = useState<string>(character.name);
  const [wounds, setWounds] = useState({
    current: character.wounds.current,
    max: character.wounds.max,
  });

  const handleLinkClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const isExternalClick = !!target.closest(".external-link-icon");

    if (onClick) {
      if (!isExternalClick) {
        event.preventDefault();
        onClick(event);
      }
    }
  };

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

  if (variant === "row") {
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
        onClick={handleLinkClick}
        className={`flex items-center justify-between w-full p-2 hover:bg-wfrp-control-hover rounded transition-all duration-200 group relative no-underline ${
          isSelected ? "bg-wfrp-control-hover border border-wfrp-accent/50" : "border border-transparent"
        } ${className ?? ""}`}
        aria-label={`Open ${characterName} in a new tab`}
      >
        <div className="flex items-center min-w-0">
          {/* Portrait/Initials */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-wfrp-dark border border-wfrp-border/30">
            {portraitDataUrl ? (
              <img
                src={portraitDataUrl}
                alt=""
                className="h-full w-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <span className="font-serif text-sm text-wfrp-muted-text">
                {initials}
              </span>
            )}
          </div>

          {/* Name & Tier */}
          <div className="ml-3 min-w-0 flex flex-col justify-center">
            <span className="font-serif text-sm font-semibold text-gray-100 group-hover:text-white transition-colors truncate">
              {characterName}
            </span>
            <span className="text-[10px] text-wfrp-muted-text truncate leading-none mt-0.5">
              {character.tier}
            </span>
          </div>
        </div>

        {/* Wounds bar & values */}
        <div className="flex items-center gap-3 shrink-0 mr-4">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-wfrp-border/60 shadow-inner hidden sm:block">
            <div
              className="h-full rounded-full bg-wfrp-red transition-all duration-500 ease-out"
              style={{ width: `${woundsPercent}%` }}
              role="progressbar"
              aria-valuenow={wounds.current}
              aria-valuemin={0}
              aria-valuemax={wounds.max}
            />
          </div>
          <span className="text-[10px] font-semibold text-wfrp-muted-text leading-none">
            {wounds.current}/{wounds.max}
          </span>
        </div>

        {/* External Link Icon */}
        <div className="absolute top-1/2 -translate-y-1/2 right-2 text-wfrp-muted-text/30 group-hover:text-wfrp-muted-text/70 transition-colors external-link-icon">
          <ExternalLink size={10} />
        </div>
      </a>
    );
  }

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
      onClick={handleLinkClick}
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
      <div className="absolute top-2.5 right-2.5 text-wfrp-muted-text/50 group-hover:text-white transition-colors duration-200 external-link-icon">
        <ExternalLink size={12} />
      </div>
    </a>
  );
}
