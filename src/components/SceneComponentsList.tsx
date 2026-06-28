import { useState } from "react";
import {
  GripVertical,
  Swords,
  Trash2,
  ChevronUp,
  ChevronDown,
  EllipsisVertical,
} from "lucide-react";
import { FormattedTextField } from "./FormattedTextField";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui";
import { WfrpPlayerCard } from "./wfrp";
import type { CharacterSummary } from "../data/repository";
import { loadResolvedCharacter, loadCharacterProgress } from "../data/repository";
import { UI_LABELS } from "../labels";

export type SceneComponent = {
  id: string;
  type: "text" | "encounter";
  text: string;
  title?: string;
};

type SceneComponentsListProps = {
  sceneId: string;
  sceneNumber: number;
  components: SceneComponent[];
  characters: CharacterSummary[];
  onReorderComponents: (components: SceneComponent[]) => void;
  onRemoveComponent: (componentId: string) => void;
  onUpdateComponentText: (componentId: string, text: string) => void;
  onUpdateComponentTitle: (componentId: string, title: string) => void;
};

export function SceneComponentsList({
  sceneId,
  sceneNumber,
  components,
  characters,
  onReorderComponents,
  onRemoveComponent,
  onUpdateComponentText,
  onUpdateComponentTitle,
}: SceneComponentsListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [draggedPlayerIndex, setDraggedPlayerIndex] = useState<number | null>(null);
  const [draggedPlayerComponentId, setDraggedPlayerComponentId] = useState<string | null>(null);
  const [selectedEncounterCharacterIds, setSelectedEncounterCharacterIds] = useState<Record<string, string | null>>({});

  const handlePlayerDragStart = (compId: string, index: number, event: React.DragEvent) => {
    event.stopPropagation();
    setDraggedPlayerIndex(index);
    setDraggedPlayerComponentId(compId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handlePlayerDragEnter = (
    compId: string,
    targetIndex: number,
    event: React.DragEvent,
    sortedCharacters: CharacterSummary[],
  ) => {
    event.stopPropagation();
    if (
      draggedPlayerIndex === null ||
      draggedPlayerComponentId !== compId ||
      draggedPlayerIndex === targetIndex
    ) {
      return;
    }

    const nextPlayerIds = [...sortedCharacters.map((c) => c.id)];
    const [draggedId] = nextPlayerIds.splice(draggedPlayerIndex, 1);
    nextPlayerIds.splice(targetIndex, 0, draggedId);

    onUpdateComponentText(compId, nextPlayerIds.join(","));
    setDraggedPlayerIndex(targetIndex);
  };

  const handlePlayerDragEnd = (event: React.DragEvent) => {
    event.stopPropagation();
    setDraggedPlayerIndex(null);
    setDraggedPlayerComponentId(null);
  };

  const handleDragStart = (index: number, event: React.DragEvent) => {
    setDraggedIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragEnter = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const nextComponents = [...components];
    const [draggedItem] = nextComponents.splice(draggedIndex, 1);
    nextComponents.splice(targetIndex, 0, draggedItem);

    onReorderComponents(nextComponents);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveComponent = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= components.length) return;

    const nextComponents = [...components];
    const [movedItem] = nextComponents.splice(index, 1);
    nextComponents.splice(targetIndex, 0, movedItem);

    onReorderComponents(nextComponents);
  };

  if (components.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      {components.map((component, index) => {
        const isDragging = draggedIndex === index;
        const defaultTitle = component.type === "text" ? "Text field" : "Encounter";
        const title = component.title || defaultTitle;

        return (
          <div
            key={component.id}
            draggable
            onDragStart={(event) => handleDragStart(index, event)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(event) => event.preventDefault()}
            className={`group/item flex flex-col border-b border-wfrp-border/40 pb-6 last:border-b-0 last:pb-0 transition-all duration-200 ${
              isDragging ? "opacity-30 scale-[0.98]" : ""
            }`}
          >
            {/* Header/Control bar */}
            <div className="flex h-10 items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Drag Handle */}
                <div
                  className="flex h-8 w-6 cursor-grab items-center justify-center rounded text-wfrp-muted-text hover:text-white transition-colors active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical size={16} aria-hidden="true" />
                </div>
                {/* Title */}
                <div className="flex items-center font-serif text-base text-gray-200">
                  <span className="mr-1 text-wfrp-muted-text/60 select-none">{index + 1}:</span>
                  {editingTitleId === component.id ? (
                    <input
                      type="text"
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onBlur={() => {
                        onUpdateComponentTitle(component.id, titleDraft.trim() || defaultTitle);
                        setEditingTitleId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onUpdateComponentTitle(component.id, titleDraft.trim() || defaultTitle);
                          setEditingTitleId(null);
                        } else if (e.key === "Escape") {
                          setEditingTitleId(null);
                        }
                      }}
                      autoFocus
                      className="font-serif text-base text-gray-200 bg-transparent border-0 border-b border-wfrp-gold/50 outline-none w-48 p-0"
                    />
                  ) : (
                    <span
                      onClick={() => {
                        setTitleDraft(title);
                        setEditingTitleId(component.id);
                      }}
                      className="cursor-pointer hover:text-white transition-colors border-b border-dashed border-transparent hover:border-wfrp-muted-text/50"
                      title="Click to rename"
                    >
                      {title}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions: Reorder and Delete */}
              <div className="flex items-center gap-1">
                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => moveComponent(index, "up")}
                  disabled={index === 0}
                  className="flex h-8 w-8 items-center justify-center rounded text-wfrp-muted-text hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
                  aria-label="Move component up"
                  title="Move up"
                >
                  <ChevronUp size={16} aria-hidden="true" />
                </button>
                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => moveComponent(index, "down")}
                  disabled={index === components.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded text-wfrp-muted-text hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
                  aria-label="Move component down"
                  title="Move down"
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
                {/* Component Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={`${title} actions`}
                    title="Actions"
                    className="flex h-8 w-8 items-center justify-center rounded text-wfrp-muted-text hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <EllipsisVertical size={16} aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onRemoveComponent(component.id)}
                      className="text-red-400 hover:text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="mr-2 size-4" aria-hidden="true" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Component Body */}
            {component.type === "text" && (
              <div className="py-2">
                <FormattedTextField
                  value={component.text}
                  onChange={(text) => onUpdateComponentText(component.id, text)}
                  ariaLabel={`Scene ${sceneNumber} text field`}
                  placeholder="Write the scene text here…"
                />
              </div>
            )}
            {component.type === "encounter" && (() => {
              const orderedCharacterIds = component.text ? component.text.split(",") : [];
              const sortedCharacters = [...characters].sort((a, b) => {
                const indexA = orderedCharacterIds.indexOf(a.id);
                const indexB = orderedCharacterIds.indexOf(b.id);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
              });

              const selectedCharId = selectedEncounterCharacterIds[component.id];
              const selectedChar = selectedCharId ? loadResolvedCharacter(selectedCharId) : null;
              const progress = selectedCharId ? loadCharacterProgress(selectedCharId) : null;

              const attributes = selectedChar && (() => {
                const baseCharacteristicAdvances = selectedChar.characteristicAdvances ?? {};
                const currentCharacteristicAdvances = progress?.characteristicAdvances ?? baseCharacteristicAdvances;
                return Object.fromEntries(
                  Object.entries(selectedChar.attributes).map(([key, value]) => {
                    const baseAdvances = baseCharacteristicAdvances[key] ?? 0;
                    const currentAdvances = currentCharacteristicAdvances[key] ?? baseAdvances;
                    return [key, value + (currentAdvances - baseAdvances)];
                  }),
                );
              })();

              return (
                <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] divide-y md:divide-y-0 md:divide-x divide-wfrp-border">
                  {/* Left Column: Player Cards */}
                  <div className="flex flex-col gap-2 p-4">
                    {sortedCharacters.length > 0 ? (
                      <div className="flex flex-col max-w-md w-full divide-y divide-wfrp-border/30">
                        {sortedCharacters.map((character, pIndex) => {
                          const isPlayerDragging =
                            draggedPlayerComponentId === component.id &&
                            draggedPlayerIndex === pIndex;

                          return (
                            <div
                              key={character.id}
                              draggable
                              onDragStart={(event) =>
                                handlePlayerDragStart(component.id, pIndex, event)
                              }
                              onDragEnter={(event) =>
                                handlePlayerDragEnter(
                                  component.id,
                                  pIndex,
                                  event,
                                  sortedCharacters,
                                )
                              }
                              onDragEnd={handlePlayerDragEnd}
                              onDragOver={(event) => event.preventDefault()}
                              className={`flex items-center gap-1 py-1 transition-all duration-200 ${
                                isPlayerDragging ? "opacity-30 scale-[0.98]" : ""
                              }`}
                            >
                              {/* Grab Handle */}
                              <div
                                className="flex h-8 w-6 cursor-grab items-center justify-center rounded text-wfrp-muted-text hover:text-white transition-colors active:cursor-grabbing shrink-0"
                                title="Drag to reorder"
                              >
                                <GripVertical size={14} aria-hidden="true" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <WfrpPlayerCard
                                  characterSummary={character}
                                  variant="row"
                                  isSelected={selectedCharId === character.id}
                                  onClick={() => {
                                    setSelectedEncounterCharacterIds((prev) => ({
                                      ...prev,
                                      [component.id]: selectedCharId === character.id ? null : character.id,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-sm text-wfrp-muted-text font-sans italic">
                        No players available
                      </span>
                    )}
                  </div>

                  {/* Right Column: Characteristics / Placeholder */}
                  <div className="flex flex-col items-center justify-center p-4">
                    {selectedChar && attributes ? (
                      <Card className="w-full max-w-sm">
                        <CardHeader className="text-center">
                          <CardTitle>{selectedChar.name}</CardTitle>
                          <span className="wfrp-label text-[10px] uppercase tracking-widest text-wfrp-muted-text/70 block">
                            {selectedChar.tier}
                          </span>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-5 gap-3 justify-center w-full">
                            {UI_LABELS.CHARACTERISTICS.map((characteristic) => {
                              const value = attributes[characteristic.key] || 0;
                              const bonus = Math.floor(value / 10);

                              return (
                                <div
                                  key={characteristic.key}
                                  className="flex flex-col items-center"
                                >
                                  <span className="mb-1 text-[10px] font-semibold uppercase tracking-tight text-wfrp-muted-text leading-none text-center block w-full truncate">
                                    {characteristic.key}
                                  </span>
                                  <div className="relative">
                                    <div className="flex h-12 w-10 flex-col items-center justify-center rounded border border-wfrp-border bg-wfrp-surface shadow">
                                      <span className="text-sm font-bold text-gray-100">
                                        {value}
                                      </span>
                                      <div className="absolute -bottom-1 left-1/2 z-10 flex h-4.5 w-4.5 -translate-x-1/2 items-center justify-center rounded-full border border-wfrp-border bg-wfrp-surface">
                                        <span className="text-[8px] font-semibold text-wfrp-muted-text">
                                          {bonus}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Swords size={24} className="text-wfrp-muted-text/40 mb-2" />
                        <span className="text-sm text-wfrp-muted-text font-sans">
                          Click a character to inspect their characteristics.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}
