import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { ArrowUpFromLine, Check, X } from "lucide-react";
import type { ResolvedCharacterRecord } from "../data/characters/resolved";
import { useGameSessionContext } from "../context/GameSessionContext";
import {
  WfrpStandardIcon,
  MainTabMenu,
} from "./ui";

const portraitSize = 256;

const characterMenuOptions = [
  { id: "sheet", label: "Character Sheet" },
  { id: "edit", label: "Edit Character" },
  { id: "dice", label: "Dice Log" },
] as const;

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
  activeMenuItem,
  characterData,
  xpCurrent,
  headerResources,
  onOpenCharacterSheet,
  onOpenDice,
  onOpenAdvance,
  onOpenXpDialog,
}: {
  activeMenuItem: "sheet" | "edit" | "experience" | "dice";
  characterData: ResolvedCharacterRecord;
  xpCurrent: number;
  headerResources?: ReactNode;
  onOpenCharacterSheet: () => void;
  onOpenDice: () => void;
  onOpenAdvance: () => void;
  onOpenXpDialog: () => void;
}) {
  const { portraitDataUrl, setCharacterName, setPortraitDataUrl } = useGameSessionContext();
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(characterData.name);
  const [portraitError, setPortraitError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const portraitSrc = portraitDataUrl;

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
    <section className="flex h-14 max-h-14 items-center gap-4 overflow-visible rounded-t border-b border-t-4 border-wfrp-border border-t-wfrp-red bg-sidebar px-3 py-1">
      <div className="flex min-w-0 items-center gap-2 sm:contents">
        <div className="relative order-3 max-h-12 flex-shrink-0 sm:order-none">
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
            className="wfrp-character-portrait-button hidden h-10 max-h-12 w-10 sm:block sm:h-12 sm:w-12"
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
          <div className="wfrp-character-portrait-control h-10 max-h-12 w-10 sm:hidden">
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

        <div className="order-2 flex max-h-12 min-w-0 flex-1 flex-col justify-center overflow-hidden sm:order-none sm:min-w-[160px]">
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
                className="min-w-0 flex-1 rounded border border-wfrp-border bg-black/40 px-2 py-0.5 font-serif text-base font-semibold leading-tight tracking-tight text-gray-100 outline-none focus:border-wfrp-gold/60 sm:text-xl"
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
              className="min-w-0 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-left font-serif text-base font-semibold leading-tight tracking-tight transition-colors hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 sm:text-xl"
              aria-label="Edit character name"
            >
              {characterData.name}
            </button>
          )}
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[9px] font-semibold uppercase text-wfrp-muted-text sm:text-[10px]">
            XP {xpCurrent}/{characterData.xpTotal}
          </div>
          {portraitError ? (
            <div className="hidden truncate text-[9px] font-semibold text-wfrp-red sm:block">
              {portraitError}
            </div>
          ) : null}
        </div>
      </div>

      <div className="order-1 flex max-h-12 min-w-0 items-center justify-start gap-2 sm:order-none sm:ml-auto sm:justify-end sm:gap-4">
        {headerResources && (
          <div className="flex max-h-12 min-w-0 max-w-full items-center gap-2 overflow-x-auto pb-1 pr-1 no-scrollbar sm:max-w-[min(100%,58rem)] sm:gap-3 sm:overflow-visible sm:pb-0 sm:pr-0">
            {headerResources}
            <div className="h-8 w-[1px] shrink-0 bg-wfrp-border opacity-50" />
          </div>
        )}

        <div className="hidden h-12 items-stretch sm:flex">
          <MainTabMenu<"sheet" | "edit" | "experience" | "dice">
            activeId={activeMenuItem}
            ariaLabel="Character menu"
            options={characterMenuOptions}
            onChange={(item) => {
              if (item === "sheet") onOpenCharacterSheet();
              if (item === "edit") onOpenAdvance();
              if (item === "dice") onOpenDice();
            }}
          />
          <WfrpStandardIcon
            label="Gain Experience"
            icon={<ArrowUpFromLine />}
            onClick={onOpenXpDialog}
            aria-current={activeMenuItem === "experience" ? "page" : undefined}
            className={activeMenuItem === "experience" ? "text-white" : undefined}
          />
        </div>
      </div>
    </section>
  );
}
