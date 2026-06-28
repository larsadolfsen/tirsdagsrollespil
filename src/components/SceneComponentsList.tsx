import { useState } from "react";
import {
  BookOpenText,
  GripVertical,
  Swords,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { FormattedTextField } from "./FormattedTextField";

export type SceneComponent = {
  id: string;
  type: "text" | "encounter";
  text: string;
};

type SceneComponentsListProps = {
  sceneId: string;
  sceneNumber: number;
  components: SceneComponent[];
  onReorderComponents: (components: SceneComponent[]) => void;
  onRemoveComponent: (componentId: string) => void;
  onUpdateComponentText: (componentId: string, text: string) => void;
};

export function SceneComponentsList({
  sceneId,
  sceneNumber,
  components,
  onReorderComponents,
  onRemoveComponent,
  onUpdateComponentText,
}: SceneComponentsListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
    <div className="mt-6 flex flex-col gap-4">
      {components.map((component, index) => {
        const isDragging = draggedIndex === index;
        const Icon = component.type === "text" ? BookOpenText : Swords;
        const title = component.type === "text" ? "Text field" : "Encounter";

        return (
          <div
            key={component.id}
            draggable
            onDragStart={(event) => handleDragStart(index, event)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(event) => event.preventDefault()}
            className={`group/item flex flex-col rounded-lg border border-wfrp-border bg-card shadow-md transition-all duration-200 ${
              isDragging ? "opacity-30 border-wfrp-gold/40 scale-[0.98]" : "hover:border-wfrp-border/80"
            }`}
          >
            {/* Header/Control bar */}
            <div className="flex h-12 items-center justify-between border-b border-wfrp-border bg-black/20 px-3">
              <div className="flex items-center gap-2">
                {/* Drag Handle */}
                <div
                  className="flex h-8 w-6 cursor-grab items-center justify-center rounded text-wfrp-muted-text hover:text-white transition-colors active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical size={16} aria-hidden="true" />
                </div>
                {/* Icon & Title */}
                <span className="flex items-center gap-2 font-serif text-base text-gray-200">
                  <Icon size={16} className="text-wfrp-gold" aria-hidden="true" />
                  {title}
                </span>
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
                {/* Delete */}
                <button
                  type="button"
                  onClick={() => onRemoveComponent(component.id)}
                  className="ml-1 flex h-8 w-8 items-center justify-center rounded text-wfrp-muted-text hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  aria-label={`Delete ${title}`}
                  title="Delete"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Component Body */}
            {component.type === "text" && (
              <div className="p-4">
                <FormattedTextField
                  value={component.text}
                  onChange={(text) => onUpdateComponentText(component.id, text)}
                  ariaLabel={`Scene ${sceneNumber} text field`}
                  placeholder="Write the scene text here…"
                />
              </div>
            )}
            {component.type === "encounter" && (
              <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                <Swords size={24} className="text-wfrp-muted-text/40 mb-2" />
                <span className="text-sm text-wfrp-muted-text font-sans">
                  Encounter component added to scene.
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
