import { Copy, EllipsisVertical, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui";

type SceneActionsMenuProps = {
  sceneNumber: number;
  onAddBefore: () => void;
  onAddAfter: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onAddDescription: () => void;
  onAddNotes: () => void;
  onAddEncounter: () => void;
};

export function SceneActionsMenu({
  sceneNumber,
  onAddBefore,
  onAddAfter,
  onCopy,
  onDelete,
  onAddDescription,
  onAddNotes,
  onAddEncounter,
}: SceneActionsMenuProps) {
  const menuLabel = `Scene ${sceneNumber} menu`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={menuLabel}
        title={menuLabel}
        className="wfrp-standard-icon cursor-pointer"
      >
        <span className="wfrp-standard-icon__glyph" aria-hidden="true">
          <EllipsisVertical />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onAddBefore}>
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add scene before
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddAfter}>
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add scene after
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopy}>
          <Copy className="mr-2 size-4" aria-hidden="true" />
          Copy scene
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onAddDescription}>
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add description
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddNotes}>
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add notes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddEncounter}>
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add encounter
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-red-400 hover:text-red-400 focus:text-red-400">
          <Trash2 className="mr-2 size-4" aria-hidden="true" />
          Delete scene
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
