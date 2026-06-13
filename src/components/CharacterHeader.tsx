import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Dice5, MoreHorizontal, Plus, Settings, X } from "lucide-react";
import type { ResolvedCharacterRecord } from "../data/characters/resolved";
import type { CharacterSummary } from "../data/repository";
import { UI_LABELS } from "../labels";
import { useGameSessionContext } from "../context/GameSessionContext";

const formatAka = (aka: string[]) => (aka.length > 0 ? `aka ${aka.join(", ")}` : null);
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
}) {
  const { portraitDataUrl, setCharacterName, setPortraitDataUrl } = useGameSessionContext();
  const [isCampaignMenuOpen, setIsCampaignMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(characterData.name);
  const [portraitError, setPortraitError] = useState<string | null>(null);
  const campaignMenuRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const characterAka = formatAka(characterData.aka);
  const portraitSrc = portraitDataUrl;

  useEffect(() => {
    if (!isCampaignMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (isCampaignMenuOpen && !campaignMenuRef.current?.contains(event.target as Node)) {
        setIsCampaignMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCampaignMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isCampaignMenuOpen]);

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
              <button
                type="button"
                onClick={saveEditingName}
                className="wfrp-icon-btn p-1 hover:bg-wfrp-surface-muted-hover"
                aria-label="Save character name"
              >
                <Check size={13} />
              </button>
              <button
                type="button"
                onClick={cancelEditingName}
                className="wfrp-icon-btn p-1 hover:bg-wfrp-surface-muted-hover"
                aria-label="Cancel character name edit"
              >
                <X size={13} />
              </button>
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
          {characterAka && (
            <div className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[9px] italic text-wfrp-muted-text sm:text-[10px]">
              {characterAka}
            </div>
          )}
          <div className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[9px] italic text-wfrp-muted-text sm:text-[10px]">
            {characterData.race} {characterData.career} 1
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

        <div className="flex items-center gap-1 group/campaign transition-colors">
          <div className="relative hidden sm:block" ref={campaignMenuRef}>
            <div className="flex overflow-hidden rounded border border-white/5 bg-black/20 transition-colors hover:bg-wfrp-surface-muted-hover">
              <button
                onClick={() => setIsCampaignMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2 py-0.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                aria-label="Open character selection"
                aria-haspopup="menu"
                aria-expanded={isCampaignMenuOpen}
              >
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-wfrp-muted-text uppercase leading-none">
                    {UI_LABELS.CAMPAIGN_HEADER}
                  </span>
                  <span className="text-[11px] font-semibold text-wfrp-muted-text whitespace-nowrap group-hover/campaign:text-wfrp-gold transition-colors">
                    {UI_LABELS.CAMPAIGN_NAME}
                  </span>
                </div>
                <ChevronDown
                  size={12}
                  className={`text-wfrp-muted-text transition-transform ${isCampaignMenuOpen ? "rotate-180 text-wfrp-gold" : "group-hover/campaign:text-wfrp-gold"}`}
                />
              </button>
              <div className="my-1 h-5 w-[1px] bg-wfrp-border opacity-60" />
              <button
                onClick={() => {
                  onOpenAdvance();
                  setIsCampaignMenuOpen(false);
                }}
                className="flex min-w-9 flex-col items-center px-2 py-0.5 transition-colors hover:bg-wfrp-surface-muted-hover cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                aria-label="Open Advance tab"
              >
                <span className="text-[8px] font-bold text-wfrp-muted-text uppercase leading-none">Exp</span>
                <span className="text-[11px] font-bold text-blue-400 whitespace-nowrap">
                  {xpCurrent}/{characterData.xpTotal}
                </span>
              </button>
            </div>

            {isCampaignMenuOpen && (
              <div
                className="absolute right-0 top-[calc(100%+0.5rem)] z-30 min-w-[240px] overflow-hidden rounded-md border border-wfrp-brass-border bg-wfrp-popover shadow-wfrp-popover"
                role="menu"
                aria-label="Character selection"
              >
                <div className="border-b border-wfrp-border-muted px-3 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-wfrp-muted-text">
                  Characters
                </div>
                <div className="p-1">
                  {availableCharacters.map((character) => {
                    const isSelected = character.id === selectedCharacterId;

                    return (
                      <button
                        key={character.id}
                        onClick={() => {
                          onSelectCharacter(character.id);
                          setIsCampaignMenuOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded px-3 py-2 text-left transition-colors ${
                          isSelected
                            ? "bg-wfrp-gold-surface text-wfrp-gold"
                            : "text-gray-200 hover:bg-wfrp-surface-raised"
                        }`}
                        role="menuitemradio"
                        aria-checked={isSelected}
                      >
                        <div className="min-w-0">
                          <div className="truncate">{character.name}</div>
                        </div>
                        <span className="ml-3 flex h-4 w-4 items-center justify-center">
                          {isSelected ? <Check size={12} /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-wfrp-border-muted p-1">
                  <button
                    onClick={() => {
                      onCreateCharacter();
                      setIsCampaignMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[12px] font-semibold text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold"
                    role="menuitem"
                  >
                    <Plus size={12} />
                    Create a new one
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="hidden h-4 w-[1px] bg-wfrp-border mx-1 opacity-50 sm:block" />
          <div className="hidden items-center gap-1 sm:flex">
            <button
              onClick={onOpenDice}
              className="wfrp-icon-btn p-1.5 hover:bg-wfrp-surface-muted-hover"
              aria-label="Toggle tactical navigation dice"
            >
              <Dice5 size={14} />
            </button>
            <div className="h-4 w-[1px] bg-wfrp-border opacity-50" />
            <button
              className="wfrp-icon-btn p-1.5 hover:bg-wfrp-surface-muted-hover"
              aria-label="Settings"
            >
              <Settings size={14} />
            </button>
            <button
              className="wfrp-icon-btn p-1.5 hover:bg-wfrp-surface-muted-hover"
              aria-label="More options"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
