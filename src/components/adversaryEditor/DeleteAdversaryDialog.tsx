import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui";

export function DeleteAdversaryDialog({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>
            This permanently removes the entry from the catalog source file. This cannot be undone here — you would
            need to revert the file change in git.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" name="Cancel" onClick={onCancel} />
          <Button variant="destructive" name="Delete" onClick={onConfirm} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
