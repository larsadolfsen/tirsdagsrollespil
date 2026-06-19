import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { ArrowUpFromLine, Check, Dice5, Plus, Settings, Users, X } from "lucide-react";
import type { ResolvedCharacterRecord } from "../data/characters/resolved";
import type { CharacterSummary } from "../data/repository";
import { useGameSessionContext } from "../context/GameSessionContext";
import {
  WfrpDropdownMenuContent,
  WfrpDropdownMenuGroup,
  WfrpDropdownMenuItem,
  WfrpDropdownMenuLabel,
  WfrpDropdownMenuSeparator,
  WfrpStandardIcon,
} from "./ui";

const portraitSize = 256;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read image file."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not decode image file."));
    image.src = src;
  });

const optimizePortraitFile = async (file: File) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a valid image file.");
  }

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = portraitSize;
  canvas.height = portraitSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not prepare image crop.");
  }

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.max(0, (image.naturalWidth - sourceSize) / 2);
  const sourceY = Math.max(0, (image.naturalHeight - sourceSize) / 2);

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    portraitSize,
    portraitSize,
  );

  return canvas.toDataURL("image/jpeg", 0.82);
};

export function CharacterHeader({
  characterData,
  availableCharacters,
  selectedCharacterId,
  xpCurrent,
  headerResources,
  onSelectCharacter,
  onCreateCharacter,
  onOpenDice,
  onOpenAdvance,
  onOpenXpDialog,
}: {
  characterData: ResolvedCharacterRecord;
  availableCharacters: CharacterSummary[];
  selectedCharacterId: string;
  xpCurrent: number;
  headerResources?: ReactNode;
  onSelectCharacter: (characterId: string) => void;
  onCreateCharacter: () => void;
  onOpenDice: () => void;
  onOpenAdvance: () => void;
  onOpenXpDialog: () => void;
}) {
  const { portraitDataUrl, setCharacterName, setPortraitDataUrl } = useGameSessionContext();
  const [isCampaignMenuOpen, setIsCampaignMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(characterData.name);
  const [portraitError, setPortraitError] = useState<string | null>(null);
  const campaignMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const portraitSrc = portraitDataUrl;

  useEffect(() => {
    if (!isCampaignMenuOpen && !isSettingsMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (isCampaignMenuOpen && !campaignMenuRef.current?.contains(event.target as Node)) {
        setIsCampaignMenuOpen(false);
      }

      if (isSettingsMenuOpen && !settingsMenuRef.current?.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCampaignMenuOpen(false);
        setIsSettingsMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isCampaignMenuOpen, isSettingsMenuOpen]);

  useEffect(() => {
    if (!isEditingName) {
      setDraftName(characterData.name);
    }
  }, [characterData.name, isEditingName]);

  useEffect(() => {
    if (!isEditingName) return;

    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  }, [isEditingName]);

  const startEditingName = () => {
    setDraftName(characterData.name);
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setDraftName(characterData.name);
    setIsEditingName(false);
  };

  const saveEditingName = () => {
    const nextName = draftName.trim();

    if (!nextName) {
      setDraftName(characterData.name);
      setIsEditingName(false);
      return;
    }

    setCharacterName(nextName);
    setDraftName(nextName);
    setIsEditingName(false);
  };

  const handlePortraitChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      setPortraitError(null);
      setPortraitDataUrl(await optimizePortraitFile(file));
    } catch (error) {
      setPortraitError(error instanceof Error ? error.message : "Could not use that image.");
    }
  };

  return (
    <section className="flex min-h-[60px] flex-col gap-2 overflow-visible rounded-t border-b border-wfrp-border bg-sidebar px-3 py-2 sm:min-h-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      <div className="flex min-w-0 items-center gap-2 sm:contents">
        <div className="relative order-3 flex-shrink-0 sm:order-none">
          <input
            ref={portraitInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePortraitChange}
            aria-label="Upload character portrait"
          />
          <button
            type="button"
            onClick={() => portraitInputRef.current?.click()}
            className="wfrp-character-portrait-button hidden h-10 w-10 sm:block sm:h-12 sm:w-12"
            aria-label="Upload character portrait"
            title={portraitError ?? "Upload character portrait"}
          >
            {portraitSrc ? (
              <img
                src={portraitSrc}
                alt="Portrait"
                width={48}
                height={48}
                className="wfrp-character-portrait-image"
              />
            ) : (
              <span
                aria-hidden="true"
                className="wfrp-character-portrait-fallback text-sm"
              >
                {characterData.name.charAt(0)}
              </span>
            )}
          </button>
          <div className="wfrp-character-portrait-control h-10 w-10 sm:hidden">
            {portraitSrc ? (
              <img
                src={portraitSrc}
                alt="Portrait"
                width={40}
                height={40}
                className="wfrp-character-portrait-image"
              />
            ) : (
              <span
                aria-hidden="true"
                className="wfrp-character-portrait-fallback text-xs"
              >
                {characterData.name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        <div className="order-2 flex min-w-0 flex-1 flex-col justify-center overflow-hidden sm:order-none sm:min-w-[160px]">
          {isEditingName ? (
            <div className="flex min-w-0 items-center gap-1">
              <input
                ref={nameInputRef}
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveEditingName();
                  }

                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancelEditingName();
                  }
                }}
                className="min-w-0 flex-1 rounded border border-wfrp-border bg-black/40 px-2 py-0.5 font-serif text-base font-bold leading-tight tracking-tight text-gray-100 outline-none focus:border-wfrp-gold/60 sm:text-xl"
                aria-label="Edit character name"
              />
              <WfrpStandardIcon
                onClick={saveEditingName}
                label="Save character name"
                icon={<Check />}
              />
              <WfrpStandardIcon
                onClick={cancelEditingName}
                label="Cancel character name edit"
                icon={<X />}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={startEditingName}
              className="min-w-0 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-left font-serif text-base font-bold leading-tight tracking-tight transition-colors hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 sm:text-xl"
              aria-label="Edit character name"
            >
              {characterData.name}
            </button>
          )}
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[9px] font-bold uppercase text-wfrp-muted-text sm:text-[10px]">
            {characterData.race} {characterData.career} 1
          </div>
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[9px] font-bold uppercase text-wfrp-muted-text sm:text-[10px]">
            XP {xpCurrent}/{characterData.xpTotal}
          </div>
          {portraitError ? (
            <div className="hidden truncate text-[9px] font-bold text-wfrp-red sm:block">
              {portraitError}
            </div>
          ) : null}
        </div>
      </div>

      <div className="order-1 flex min-w-0 flex-wrap items-center justify-start gap-2 sm:order-none sm:ml-auto sm:justify-end sm:gap-4">
        {headerResources && (
          <div className="flex min-w-0 max-w-full items-center gap-2 overflow-x-auto pb-1 pr-1 no-scrollbar sm:max-w-[min(100%,58rem)] sm:gap-3 sm:overflow-visible sm:pb-0 sm:pr-0">
            {headerResources}
            <div className="h-8 w-[1px] shrink-0 bg-wfrp-border opacity-50" />
          </div>
        )}

        <div className="flex items-center gap-1 transition-colors">
          <div className="hidden items-center gap-1 sm:flex">
            <WfrpStandardIcon
              onClick={onOpenXpDialog}
              desktopLabel="XP"
              label={`Upgrade character (${xpCurrent}/${characterData.xpTotal} XP)`}
              title={`Upgrade (${xpCurrent}/${characterData.xpTotal} XP)`}
              icon={<ArrowUpFromLine />}
            />
            <div className="relative" ref={campaignMenuRef}>
              <WfrpStandardIcon
                onClick={() => setIsCampaignMenuOpen((prev) => !prev)}
                className={isCampaignMenuOpen ? "text-wfrp-gold" : undefined}
                desktopLabel="Group"
                label="Open character selection"
                aria-haspopup="menu"
                aria-expanded={isCampaignMenuOpen}
                title="Characters"
                icon={<Users />}
              />

              {isCampaignMenuOpen && (
                <WfrpDropdownMenuContent
                  align="end"
                  className="min-w-[240px]"
                  aria-label="Character selection"
                >
                  <WfrpDropdownMenuLabel>Characters</WfrpDropdownMenuLabel>
                  <WfrpDropdownMenuGroup>
                    {availableCharacters.map((character) => {
                      const isSelected = character.id === selectedCharacterId;

                      return (
                        <WfrpDropdownMenuItem
                          key={character.id}
                          onClick={() => {
                            onSelectCharacter(character.id);
                            setIsCampaignMenuOpen(false);
                          }}
                          active={isSelected}
                          role="menuitemradio"
                          aria-checked={isSelected}
                          trailingIcon={isSelected ? <Check size={12} /> : null}
                        >
                          {character.name}
                        </WfrpDropdownMenuItem>
                      );
                    })}
                  </WfrpDropdownMenuGroup>
                  <WfrpDropdownMenuSeparator />
                  <WfrpDropdownMenuGroup>
                    <WfrpDropdownMenuItem
                      onClick={() => {
                        onCreateCharacter();
                        setIsCampaignMenuOpen(false);
                      }}
                      leadingIcon={<Plus size={12} />}
                    >
                      Create a new one
                    </WfrpDropdownMenuItem>
                  </WfrpDropdownMenuGroup>
                </WfrpDropdownMenuContent>
              )}
            </div>
            <WfrpStandardIcon
              onClick={onOpenDice}
              desktopLabel="Dice log"
              label="Toggle tactical navigation dice"
              icon={<Dice5 />}
            />
            <div className="h-4 w-[1px] bg-wfrp-border opacity-50" />
            <div className="relative" ref={settingsMenuRef}>
              <WfrpStandardIcon
                onClick={() => setIsSettingsMenuOpen((isOpen) => !isOpen)}
                desktopLabel="Settings"
                label="Settings"
                aria-haspopup="menu"
                aria-expanded={isSettingsMenuOpen}
                icon={<Settings />}
              />
              {isSettingsMenuOpen && (
                <WfrpDropdownMenuContent
                  align="end"
                  aria-label="Settings"
                >
                  <WfrpDropdownMenuItem
                    onClick={() => {
                      onOpenAdvance();
                      setIsSettingsMenuOpen(false);
                    }}
                  >
                    Edit Character
                  </WfrpDropdownMenuItem>
                </WfrpDropdownMenuContent>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
