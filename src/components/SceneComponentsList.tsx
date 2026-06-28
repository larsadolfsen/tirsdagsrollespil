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
} from "./ui";
import { WfrpPlayerCard } from "./wfrp";
import type { CharacterSummary } from "../data/repository";

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
                    className="cursor-pointer font-serif text-base text-gray-200 hover:text-white transition-colors border-b border-dashed border-transparent hover:border-wfrp-muted-text/50"
                    title="Click to rename"
                  >
                    {title}
                  </span>
                )}
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
            {component.type === "encounter" && (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-wfrp-border bg-black/5">
                {/* Left Column: Player Cards */}
                <div className="flex flex-col gap-2 p-4">
                  <span className="wfrp-label text-[11px] uppercase tracking-wider text-wfrp-muted-text/80 mb-2">
                    Players
                  </span>
                  {characters && characters.length > 0 ? (
                    <div className="flex flex-col gap-2 max-w-md w-full">
                      {characters.map((character) => (
                        <WfrpPlayerCard
                          key={character.id}
                          characterSummary={character}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-wfrp-muted-text font-sans italic">
                      No players available
                    </span>
                  )}
                </div>

                {/* Right Column: Encounter Actions/Placeholder */}
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Swords size={24} className="text-wfrp-muted-text/40 mb-2" />
                  <span className="text-sm text-wfrp-muted-text font-sans">
                    Encounter component added to scene.
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
